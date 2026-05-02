"use client";

import { useEffect, useState } from "react";

type DashboardData = {
  summary: {
    projectCount: number;
    taskCount: number;
    todoCount: number;
    progressCount: number;
    doneCount: number;
    overdueCount: number;
  };
  recentProjects: Array<{
    id: string;
    name: string;
    description: string | null;
    status: string;
    owner: { name: string; email: string };
    _count: { tasks: number; members: number };
    updatedAt: string;
  }>;
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    project: { name: string };
    assignee: { name: string } | null;
  }>;
};

function statusClass(status: string) {
  const normalized = status.toLowerCase().replaceAll("_", "-");
  return `badge ${normalized}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "No due date";
  }

  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard");
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message ?? "Failed to load dashboard");
        }

        setData(payload);
      } catch (dashboardError) {
        setError(dashboardError instanceof Error ? dashboardError.message : "Failed to load dashboard");
      }
    }

    loadDashboard();
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="section-lead">Track project health, task flow, and overdue work at a glance.</div>
        </div>
      </div>

      {error ? <div className="toast">{error}</div> : null}

      <section className="summary-grid">
        {[
          ["Projects", data?.summary.projectCount ?? 0],
          ["Tasks", data?.summary.taskCount ?? 0],
          ["To do", data?.summary.todoCount ?? 0],
          ["In progress", data?.summary.progressCount ?? 0],
          ["Done", data?.summary.doneCount ?? 0],
          ["Overdue", data?.summary.overdueCount ?? 0]
        ].map(([label, value]) => (
          <article className="summary-card" key={label as string}>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{value as number}</div>
          </article>
        ))}
      </section>

      <section className="main-grid">
        <div className="card section-stack">
          <div className="toolbar" style={{ justifyContent: "space-between" }}>
            <h2>Recent tasks</h2>
          </div>

          {data?.recentTasks.length ? data.recentTasks.map((task) => (
            <article className="task-card" key={task.id}>
              <div className="task-head">
                <div>
                  <h3>{task.title}</h3>
                  <div className="small">{task.project.name} · {task.assignee?.name ?? "Unassigned"}</div>
                </div>
                <span className={statusClass(task.status)}>{task.status.replaceAll("_", " ")}</span>
              </div>
              <div className="task-meta">
                <span className="badge medium">Priority {task.priority}</span>
                <span className="badge active">Due {formatDate(task.dueDate)}</span>
              </div>
            </article>
          )) : <div className="empty">No tasks yet.</div>}
        </div>

        <div className="card section-stack">
          <div className="toolbar" style={{ justifyContent: "space-between" }}>
            <h2>Recent projects</h2>
          </div>

          {data?.recentProjects.length ? data.recentProjects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-head">
                <div>
                  <h3>{project.name}</h3>
                  <div className="small">Owner: {project.owner.name}</div>
                </div>
                <span className={`badge ${project.status.toLowerCase()}`}>{project.status}</span>
              </div>
              <div className="small">{project.description ?? "No description added yet."}</div>
              <div className="project-meta">
                <span className="pill">{project._count.tasks} tasks</span>
                <span className="pill">{project._count.members} members</span>
                <span className="pill">Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
            </article>
          )) : <div className="empty">No projects yet.</div>}
        </div>
      </section>
    </>
  );
}
