# TKN KB Tracker — Build Spec

Hand this whole file to Claude Code as `SPEC.md` in an empty repo. It is self-contained; nothing here depends on outside context.

---

## 0. What this is

A single-page web app that tracks a friend's **9x9x9 challenge** at a ballgame — 9 beers, 9 hot dogs, 9 innings. Friends install it to their phone home screen, watch a live feed, and post photos and counts as the game goes on.

The app is called **TKN KB Tracker**. Use that name in the manifest, the page title, and the header.

Target build time is about two hours. Prefer the boring, working solution over the clever one everywhere.

---

## 1. Before Claude Code starts (human setup, ~10 min)

These steps need a human. Do them first, then start the build.

1. Create a Supabase project. Note the project URL, the `anon` public key, and the `service_role` secret key.
2. Create a Vercel project linked to the repo.
3. Put `tkn-kb-hero.jpg` in `/public`.
4. Set these environment variables in both `.env.local` and Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SECRET=
```

`ADMIN_SECRET` is any random string you pick. It's what unlocks admin mode.

The `service_role` key is server-only. If it ever appears in a `NEXT_PUBLIC_` variable or in client code, that's a bug — anyone could wipe the feed.

---

## 2. Stack

- **Next.js (App Router) + TypeScript**, deployed to Vercel
- **Tailwind CSS**
- **Supabase** — Postgres, Storage (photos), Realtime (live feed)
- Client-side image compression before upload (`browser-image-compression`, or a canvas resize)

Deploy to Vercel on the first commit and keep it deployed after every step. Do not leave hosting until the end.

---

## 3. Access model — no logins

- The URL is the only credential. Anyone with the link can read and post. This is intentional.
- On first open, prompt for a display name. Save to `localStorage` under `tknkb:name`. Never ask again.
- Admin mode unlocks via query param: `?admin=<ADMIN_SECRET>`. On match, save `tknkb:admin = true` to localStorage so it survives the home-screen install. Admin sees a delete button on every post.
- Do **not** build a user table, auth, sessions, or magic links.

---

## 4. Data model

Single table, `posts`. Every entry is a delta. Totals are derived by summing the feed — **never store a separate counter**, or the two will drift apart.

```sql
create table posts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  author      text not null,
  inning      int,              -- 1..9, nullable
  beers       int default 0,    -- delta, usually 0 or 1
  dogs        int default 0,    -- delta
  waters      int default 0,    -- delta
  note        text,
  photo_url   text
);

alter table posts enable row level security;

create policy "anyone can read"
  on posts for select to anon using (true);

create policy "anyone can post"
  on posts for insert to anon with check (true);
```

No `update` or `delete` policy for `anon`. Their absence is what blocks them.

Enable Realtime on the `posts` table in the Supabase dashboard.

**Storage:** bucket named `photos`, public read, anon insert, no anon delete.

---

## 5. Screens

Single page, three stacked sections. No routing.

### 5.1 Scoreboard (sticky top)

- Three counters: 🍺 beers, 🌭 dogs, 💧 waters — each as `n / 9`
- A 9-segment progress bar per counter
- Current inning, derived from the highest inning posted
- Pace line projecting which inning he finishes beers in, e.g. "on pace: 7th"
- Confetti burst when beers or dogs hits 9

### 5.2 Post composer

- Name is already known; no name field
- Increment buttons: +1 beer, +1 dog, +1 water — tap to stage, tap again to increase
- Inning picker: 1–9 chips
- Optional short note
- Optional photo: `<input type="file" accept="image/*" capture="environment">`
- One "Post" button. Append optimistically, then reconcile with the server response.

**Image compression is not optional.** Compress client-side to roughly 1600px max dimension and ~500KB before upload. Raw iPhone photos are 3–5MB and will time out on stadium wifi.

### 5.3 Feed

- Reverse chronological cards: author, relative time ("4m ago"), inning badge, deltas as emoji chips, note, photo
- Subscribe to Supabase Realtime on `posts` so new posts appear without a refresh
- Admin only: delete button per card, calling `POST /api/delete`

### 5.4 Admin delete route

`app/api/delete/route.ts`. Reads the secret from the request header, compares against `ADMIN_SECRET`, and on match deletes the row using the `service_role` client. Returns 401 otherwise.

---

## 6. PWA requirements

- `manifest.json` with `name: "TKN KB Tracker"`, `short_name: "TKN KB"`, `display: "standalone"`, `theme_color`, `background_color`, and 192px + 512px icons cropped from the hero photo
- `apple-touch-icon` at 180×180 in `<head>` — iOS ignores the manifest icons
- `<meta name="apple-mobile-web-app-capable" content="yes">` and `<meta name="mobile-web-app-capable" content="yes">`
- Minimal service worker caching the app shell only. Do **not** cache Supabase calls — the feed must stay live.
- **Install banner:** if not in standalone mode (`window.navigator.standalone !== true` and `!window.matchMedia('(display-mode: standalone)').matches`), show a dismissible bar reading: *"Open in Safari → tap Share → Add to Home Screen"*. Persist the dismissal in localStorage.

iOS has no install prompt. Without that banner, half the group will never get the app installed.

---

## 7. Visual direction

Fun and loud, not corporate. Ballpark-at-night.

- Chunky display typeface for the counters — scoreboard, not dashboard
- Large tap targets; this gets used one-handed, in the dark, by people who are drinking
- Dark theme only. No light mode.

### The hero photo

`tkn-kb-hero.jpg` lives in `/public`. It's a portrait group shot with a blown-out bright window across the top and the subject low in the frame. Do **not** use it as a full-page background — text over it is unreadable and the crop breaks in landscape.

Use it in exactly three places:

1. **Header banner.** ~40vh band at the top, behind the app title. `object-fit: cover`, `object-position: center 60%` to hold the subject and drop the window. Bottom-up dark gradient over it (`from-black/90 via-black/40 to-transparent`); set the title in the lower third where the gradient is heaviest.
2. **App icon and splash.** Square crop, tight on the standing figure, at 192 / 512 / 180px. A full-scene crop turns to grey mush at home-screen size.
3. **The 9/9 payoff.** When beers or dogs hits 9, the photo takes the full screen for ~3 seconds behind the confetti, then dismisses on tap.

Everything below the header sits on flat dark. Feed cards must stay legible.

---

## 8. Build order

Work front to back. After every step the app should still be deployed and working, so that running out of time means shipping something smaller rather than shipping nothing.

1. Next.js scaffold + Tailwind, deployed to Vercel
2. Supabase table, RLS policies, storage bucket, Realtime enabled
3. Feed rendering from real data
4. Composer, no photos yet
5. Realtime subscription
6. Photo upload + client-side compression
7. Scoreboard, progress bars, pace projection
8. PWA manifest, icons, service worker, install banner
9. Admin delete route
10. Visual pass: hero photo, typography, confetti

---

## 9. Acceptance checklist

- [ ] Opening the link on a fresh phone asks for a name once, then never again
- [ ] Anyone can post a beer, dog, water, note, and photo without logging in
- [ ] A post made on one phone appears on another phone within seconds, no refresh
- [ ] A 4MB iPhone photo uploads successfully on a slow connection
- [ ] Counters equal the sum of the feed; no separate counter exists
- [ ] Installed to the iPhone home screen it opens fullscreen with the correct icon and no Safari chrome
- [ ] Without `?admin=`, no delete buttons appear and `POST /api/delete` returns 401
- [ ] `service_role` key does not appear anywhere in the client bundle
- [ ] Hitting 9 fires the confetti and the photo takeover

---

## 10. Out of scope

- User accounts, login, or per-person auth
- SMS or iMessage sending — iMessage has no public API, and Twilio requires A2P 10DLC registration that takes 10–15 days
- Push notifications (viable later once people have installed it, but not in v1)
- Editing posts
- Multi-event support — this tracks one challenge, one day

---

## 11. If time runs short

Cut in this order:

1. Admin delete route — deleting rows from the Supabase dashboard is a fine v1 admin panel
2. Pace projection
3. The 9/9 photo takeover (keep the confetti)
4. Service worker — the app still installs to the home screen without offline caching

Do not cut: image compression, the install banner, or Realtime. Those three are what make it usable on the day.
