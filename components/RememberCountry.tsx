"use client";

import { useEffect } from "react";
import { setCountry } from "@/app/actions";

// Guarda el país de la landing en la cookie, así el registro y la home
// quedan en ese país al navegar desde /argentina, /mexico, etc.
export default function RememberCountry({ code }: { code: string }) {
  useEffect(() => {
    setCountry(code);
  }, [code]);
  return null;
}
