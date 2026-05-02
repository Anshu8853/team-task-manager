import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="app-shell">
      <aside className="shell-sidebar">
        <div>
          <div className="brand">Team Task Manager</div>
          <p className="small">Projects, tasks, team access, and progress in one workspace.</p>
        </div>

        <div className="metric-card">
          <div className="metric-label">Signed in as</div>
          <div className="metric-value" style={{ fontSize: 22 }}>{user.name}</div>
          <div className="small">{user.email}</div>
          <span className="badge active" style={{ marginTop: 10 }}>{user.role}</span>
        </div>

        <nav className="nav-list">
          <Link className="nav-link" href="/app">Dashboard</Link>
          <Link className="nav-link" href="/app/projects">Projects</Link>
          <Link className="nav-link" href="/app/tasks">Tasks</Link>
        </nav>

        <form action="/api/auth/logout" method="post">
          <button className="logout-button" type="submit">Sign out</button>
        </form>
      </aside>

      <main className="shell-main">{children}</main>
    </div>
  );
}
