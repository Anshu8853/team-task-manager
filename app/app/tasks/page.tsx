"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type Project = {
  id: string;
  name: string;
  members: Array<{ user: { id: string; name: string; email: string } }>;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  project: { id: string; name: string };
  assignee: { id: string; name: string; email: string } | null;
  creator: { id: string; name: string; email: string } | null;
  updatedAt: string;
};

const statusOptions = ["TODO", "IN_PROGRESS", "DONE"];
const priorityOptions = ["LOW", "MEDIUM", "HIGH"];

function formatDate(value: string | null) {
  if (!value) {
    return "No due date";
  }

  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function TasksPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState("");
  const [taskForm, setTaskForm] = useState({
    projectId: "",
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    assigneeId: ""
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [projectsResponse, tasksResponse] = await Promise.all([
        fetch("/api/projects"),
        fetch(projectFilter ? `/api/tasks?projectId=${encodeURIComponent(projectFilter)}` : "/api/tasks")
      ]);

      if (projectsResponse.status === 401 || tasksResponse.status === 401) {
        window.location.href = "/login";
        return;
      }

      const projectsPayload = await projectsResponse.json();
      const tasksPayload = await tasksResponse.json();

      if (!projectsResponse.ok) {
        throw new Error(projectsPayload.message ?? "Failed to load projects");
      }
      if (!tasksResponse.ok) {
        throw new Error(tasksPayload.message ?? "Failed to load tasks");
      }

      setProjects(projectsPayload.projects);
      setTasks(tasksPayload.tasks);
      setTaskForm((current) => ({
        ...current,
        projectId: current.projectId || projectsPayload.projects[0]?.id || ""
      }));
    } catch (taskError) {
      setError(taskError instanceof Error ? taskError.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [projectFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const memberOptions = useMemo(() => {
    const selected = projects.find((project) => project.id === taskForm.projectId);
    return selected?.members.map((member) => member.user) ?? [];
  }, [projects, taskForm.projectId]);

  useEffect(() => {
    if (!taskForm.assigneeId) {
      return;
    }

    const stillValid = memberOptions.some((member) => member.id === taskForm.assigneeId);
    if (!stillValid) {
      setTaskForm((current) => ({ ...current, assigneeId: "" }));
    }
  }, [memberOptions, taskForm.assigneeId]);

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskForm)
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message ?? "Could not create task");
      return;
    }

    setTaskForm((current) => ({
      ...current,
      title: "",
      description: "",
      dueDate: "",
      assigneeId: ""
    }));
    await loadData();
  }

  async function updateStatus(taskId: string, status: string) {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message ?? "Could not update task");
      return;
    }

    await loadData();
  }

  async function deleteTask(taskId: string) {
    const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message ?? "Could not delete task");
      return;
    }

    await loadData();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Tasks</h1>
          <div className="section-lead">Create tasks, assign team members, and update delivery status.</div>
        </div>
        <div className="filters">
          <select className="select" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error ? <div className="toast">{error}</div> : null}

      <div className="main-grid" style={{ alignItems: "start" }}>
        <section className="card section-stack">
          <div>
            <h2>Create task</h2>
            <div className="section-lead">Pick a project and assign the task to any project member.</div>
          </div>

          <form className="form-grid" onSubmit={createTask}>
            <div className="field-grid">
              <label className="field">
                <span className="label">Project</span>
                <select className="select" value={taskForm.projectId} onChange={(event) => setTaskForm((current) => ({ ...current, projectId: event.target.value, assigneeId: "" }))} required>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="label">Assignee</span>
                <select className="select" value={taskForm.assigneeId} onChange={(event) => setTaskForm((current) => ({ ...current, assigneeId: event.target.value }))}>
                  <option value="">Unassigned</option>
                  {memberOptions.map((member) => (
                    <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="field">
              <span className="label">Title</span>
              <input className="input" value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} required />
            </label>

            <label className="field">
              <span className="label">Description</span>
              <textarea className="textarea" value={taskForm.description} onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))} />
            </label>

            <div className="field-grid">
              <label className="field">
                <span className="label">Status</span>
                <select className="select" value={taskForm.status} onChange={(event) => setTaskForm((current) => ({ ...current, status: event.target.value }))}>
                  {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="field">
                <span className="label">Priority</span>
                <select className="select" value={taskForm.priority} onChange={(event) => setTaskForm((current) => ({ ...current, priority: event.target.value }))}>
                  {priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            </div>

            <label className="field">
              <span className="label">Due date</span>
              <input className="input" type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm((current) => ({ ...current, dueDate: event.target.value }))} />
            </label>

            <button className="button" type="submit">Create task</button>
          </form>
        </section>

        <section className="card section-stack">
          <div>
            <h2>Task board</h2>
            <div className="section-lead">Update status inline or remove tasks once they are complete.</div>
          </div>

          {loading ? <div className="empty">Loading tasks...</div> : null}
          {!loading && tasks.length === 0 ? <div className="empty">No tasks yet.</div> : null}

          {!loading && tasks.map((task) => (
            <article className="task-card" key={task.id}>
              <div className="task-head">
                <div>
                  <h3>{task.title}</h3>
                  <div className="small">{task.project.name} · {task.assignee?.name ?? "Unassigned"}</div>
                </div>
                <select className="select" value={task.status} onChange={(event) => updateStatus(task.id, event.target.value)} style={{ width: 180 }}>
                  {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div className="small">{task.description ?? "No description added."}</div>

              <div className="task-meta">
                <span className={`badge ${task.priority.toLowerCase()}`}>Priority {task.priority}</span>
                <span className="badge active">Due {formatDate(task.dueDate)}</span>
                <span className="badge">Updated {new Date(task.updatedAt).toLocaleDateString()}</span>
              </div>

              <div className="inline-actions">
                <button className="button-danger" type="button" onClick={() => deleteTask(task.id)}>Delete task</button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}
