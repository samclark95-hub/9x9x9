"use client";

import { useEffect, useState } from "react";

const KEY = "tknkb:admin";
const SECRET_KEY = "tknkb:admin-secret";

/**
 * Admin unlocks via ?admin=<ADMIN_SECRET> and is remembered in localStorage so
 * it survives the home-screen install (spec §3).
 *
 * The secret is kept client-side only to authenticate the delete call. It is
 * not a security boundary on its own - the server re-checks it on every
 * request, and without it /api/delete returns 401.
 */
export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get("admin");

      if (fromUrl) {
        localStorage.setItem(KEY, "true");
        localStorage.setItem(SECRET_KEY, fromUrl);
        setIsAdmin(true);
        setSecret(fromUrl);
        // Strip the secret out of the address bar so it is not shoulder-read
        // or captured in a screenshot of the URL.
        params.delete("admin");
        const qs = params.toString();
        window.history.replaceState(
          {},
          "",
          window.location.pathname + (qs ? `?${qs}` : "")
        );
        return;
      }

      if (localStorage.getItem(KEY) === "true") {
        setIsAdmin(true);
        setSecret(localStorage.getItem(SECRET_KEY));
      }
    } catch {
      // storage blocked - admin simply stays off
    }
  }, []);

  return { isAdmin, secret };
}
