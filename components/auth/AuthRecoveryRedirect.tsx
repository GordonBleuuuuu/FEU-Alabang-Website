"use client";

import { useEffect } from "react";

/** Routes Supabase recovery links that used the former public-site URL. */
export default function AuthRecoveryRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      window.location.replace(`/auth/update-password${hash}`);
    }
  }, []);

  return null;
}
