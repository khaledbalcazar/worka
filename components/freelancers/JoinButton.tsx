"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { joinFreelancers } from "@/app/actions";

// Botón que crea el perfil de freelancer y lleva al dashboard.
export default function JoinButton({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!loggedIn) {
    return (
      <Link href="/ingresar" className="btn-primary text-base px-6 py-3">
        Ingresá para empezar
      </Link>
    );
  }

  function join() {
    setError(null);
    start(async () => {
      const res = await joinFreelancers();
      if (res.ok) router.push("/freelancer");
      else setError(res.error ?? "No pudimos crear tu perfil.");
    });
  }

  return (
    <div className="space-y-2">
      <button
        onClick={join}
        disabled={pending}
        className="btn-primary text-base px-6 py-3 disabled:opacity-60"
      >
        {pending ? "Creando tu perfil…" : "Unirme a Worka Freelancers"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
