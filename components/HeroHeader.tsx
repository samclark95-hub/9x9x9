/**
 * Header banner (spec §7). Not a full-page background: text over the whole
 * photo is unreadable and the crop breaks in landscape. A bottom-up dark
 * gradient carries the title in the lower third, where it is heaviest.
 */
export default function HeroHeader() {
  return (
    <header className="relative -mx-4 -mt-8 h-[40vh] min-h-[15rem] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/tkn-kb-hero.jpg"
        alt=""
        className="h-full w-full object-cover"
        style={{ objectPosition: "center 32%" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
        <h1 className="font-score text-5xl uppercase leading-[0.9] tracking-tight text-chalk drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          TKN KB Tracker
        </h1>
        <p className="mt-1 text-sm font-semibold text-chalk/75">
          9 beers. 9 hot dogs. 9 innings.
        </p>
      </div>
    </header>
  );
}
