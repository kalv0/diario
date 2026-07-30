"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-2xl bg-ink-100 px-4 py-3.5 text-base font-semibold text-ink-950 transition active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium tracking-wide text-ink-400 uppercase">Usuario</span>
        <input
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          required
          className="w-full rounded-2xl border border-ink-700 bg-ink-850 px-4 py-3.5 text-ink-100 outline-none transition placeholder:text-ink-600 focus:border-ink-400"
          placeholder="tu usuario"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium tracking-wide text-ink-400 uppercase">Contraseña</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-2xl border border-ink-700 bg-ink-850 px-4 py-3.5 text-ink-100 outline-none transition placeholder:text-ink-600 focus:border-ink-400"
          placeholder="••••••••"
        />
      </label>

      {state.error ? (
        <p role="alert" className="rounded-xl border border-neg/40 bg-neg-soft px-3 py-2 text-sm text-neg">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />

      <p className="mt-6 text-center text-sm text-ink-400">
        ¿No tienes cuenta?{" "}
        <Link href="/demo" className="font-semibold text-ink-100 underline decoration-ink-600 underline-offset-4">
          Prueba la demo
        </Link>
      </p>
    </form>
  );
}
