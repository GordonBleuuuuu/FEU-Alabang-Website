"use client";

import { useEffect } from "react";

/** Routes recovery links that land at the project's default Site URL. */
export default function AuthRecoveryRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    if (hash.includes("type=recovery") || new URLSearchParams(search).has("code")) {
      window.location.replace(`/auth/update-password${search}${hash}`);
    }
  }, []);

  return null;
}
