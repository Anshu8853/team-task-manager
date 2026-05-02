"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@teamtask.local");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next) {
      window.sessionStorage.setItem("teamtask-next", next);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Login failed");
      }

      const next = window.sessionStorage.getItem("teamtask-next") || "/app";
      window.sessionStorage.removeItem("teamtask-next");
      router.push(next);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <div className="auth-copy">
          <span className="kicker">Sign in</span>
          <h1>Welcome back.</h1>
          <p>Use the seeded admin account to explore every role, or sign in with your own team member account.</p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: 24 }}>
          <label className="field">
            <span className="label">Email</span>
            <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          <label className="field">
            <span className="label">Password</span>
            <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>

          <button className="button" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {error ? <div className="toast">{error}</div> : null}
          <p className="note">
            New here? <Link href="/signup">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
