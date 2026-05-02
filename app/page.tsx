import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/app");
  }

  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-copy">
          <span className="kicker">Team Task Manager</span>
          <h1>Run projects, assign work, and track delivery in one place.</h1>
          <p>
            A full-stack team workspace with signup/login, project and member management,
            role-aware task assignment, overdue tracking, and a clean dashboard for daily execution.
          </p>
          <div className="actions">
            <Link className="button" href="/signup">Create account</Link>
            <Link className="button-secondary" href="/login">Sign in</Link>
          </div>
          <div className="badge-row" style={{ marginTop: 20 }}>
            <span className="badge active">Admin / Member access</span>
            <span className="badge high">REST APIs</span>
            <span className="badge medium">Prisma + SQLite</span>
            <span className="badge low">Railway ready</span>
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-glow">
            <strong>Live project view</strong>
            <span className="muted">Watch tasks move from TODO to DONE with overdue alerts and team ownership.</span>
            <div className="metric-row">
              <div className="metric-card">
                <div className="metric-label">Projects</div>
                <div className="metric-value">8</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Open tasks</div>
                <div className="metric-value">24</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Overdue</div>
                <div className="metric-value" style={{ color: "#fb7185" }}>3</div>
              </div>
            </div>
          </div>
          <div className="section-stack">
            <div className="metric-card">
              <div className="metric-label">What you get</div>
              <div className="metric-value" style={{ fontSize: 18 }}>Authentication, projects, team members, task assignment, status tracking, and a dashboard.</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
