"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function Login({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="staff-login"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setBusy(true);
        setError("");
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: data.get("email"),
              password: data.get("password"),
            }),
          });
          const result = await response.json();
          if (!response.ok) throw Error(result.error);
          router.replace("/admin/workspace");
          router.refresh();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {!configured && (
        <p className="notice" role="status">
          Staging is not configured yet. Staff sign-in will become available
          after the Supabase project and staging settings are supplied.
        </p>
      )}
      <label>
        Staff email
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={!configured}
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={!configured}
        />
      </label>
      <button className="button" disabled={!configured || busy}>
        {busy ? "Signing in…" : "Sign in to staging"}
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
