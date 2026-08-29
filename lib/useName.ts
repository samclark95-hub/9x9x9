"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "tknkb:name";

/**
 * The display name is the entire identity model (spec §3): no accounts, no
 * sessions. Asked once, kept in localStorage, never asked again.
 */
export function useName() {
  const [name, setNameState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setNameState(localStorage.getItem(KEY));
    } catch {
      // private mode / storage blocked - fall through to the prompt
    }
    setReady(true);
  }, []);

  const setName = useCallback((raw: string) => {
    const trimmed = raw.trim().slice(0, 24);
    if (!trimmed) return;
    try {
      localStorage.setItem(KEY, trimmed);
    } catch {
      // still let them post this session even if we cannot persist
    }
    setNameState(trimmed);
  }, []);

  return { name, setName, ready };
}
