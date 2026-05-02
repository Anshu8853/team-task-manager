"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Signup failed");
      }

      router.push("/app");
      router.refresh();
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <div className="auth-copy">
          <span className="kicker">Create account</span>
          <h1>Start a workspace in minutes.</h1>
          <p>
            New signups become members by default. Admins can create projects, assign people,
            and move tasks through the workflow.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: 24 }}>
          <label className="field">
            <span className="label">Name</span>
            <input className="input" type="text" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          </label>

          <label className="field">
            <span className="label">Email</span>
            <input className="input" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
          </label>

          <label className="field">
            <span className="label">Password</span>
            <input className="input" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} minLength={8} required />
          </label>

          <button className="button" disabled={loading} type="submit">
            {loading ? "Creating account..." : "Create account"}
          </button>

          {error ? <div className="toast">{error}</div> : null}
          <p className="note">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
