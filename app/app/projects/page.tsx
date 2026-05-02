"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  owner: { id: string; name: string; email: string };
  members: Array<{ id: string; role: string; user: { id: string; name: string; email: string; role: string } }>;
  _count: { tasks: number };
};

type Me = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [memberEmail, setMemberEmail] = useState<Record<string, string>>({});

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [meResponse, projectResponse] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/projects")
      ]);

      if (meResponse.status === 401 || projectResponse.status === 401) {
        window.location.href = "/login";
        return;
      }

      const mePayload = await meResponse.json();
      const projectsPayload = await projectResponse.json();

      if (!meResponse.ok) {
        throw new Error(mePayload.message ?? "Failed to load user");
      }
      if (!projectResponse.ok) {
        throw new Error(projectsPayload.message ?? "Failed to load projects");
      }

      setMe(mePayload.user);
      setProjects(projectsPayload.projects);
    } catch (projectError) {
      setError(projectError instanceof Error ? projectError.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectForm)
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message ?? "Could not create project");
      return;
    }

    setProjectForm({ name: "", description: "" });
    await loadData();
  }

  async function addMember(projectId: string) {
    const email = memberEmail[projectId];
    if (!email) {
      return;
    }

    const response = await fetch(`/api/projects/${projectId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message ?? "Could not add member");
      return;
    }

    setMemberEmail((current) => ({ ...current, [projectId]: "" }));
    await loadData();
  }

  async function removeMember(projectId: string, memberId: string) {
    const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message ?? "Could not remove member");
      return;
    }

    await loadData();
  }

  async function deleteProject(projectId: string) {
    const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message ?? "Could not delete project");
      return;
    }

    await loadData();
  }

  const canManage = (project: Project) => me?.role === "ADMIN" || project.owner.id === me?.id;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Projects</h1>
          <div className="section-lead">Create projects, manage members, and keep every team aligned.</div>
        </div>
      </div>

      {error ? <div className="toast">{error}</div> : null}

      <div className="main-grid" style={{ alignItems: "start" }}>
        <section className="card section-stack">
          <div>
            <h2>Create project</h2>
            <div className="section-lead">The creator becomes the owner and can manage members and tasks.</div>
          </div>

          <form className="form-grid" onSubmit={createProject}>
            <label className="field">
              <span className="label">Project name</span>
              <input className="input" value={projectForm.name} onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))} required />
            </label>

            <label className="field">
              <span className="label">Description</span>
              <textarea className="textarea" value={projectForm.description} onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))} />
            </label>

            <button className="button" type="submit">Create project</button>
          </form>
        </section>

        <section className="card section-stack">
          <div>
            <h2>Project list</h2>
            <div className="section-lead">Add members by email, remove them, or delete the project when finished.</div>
          </div>

          {loading ? <div className="empty">Loading projects...</div> : null}
          {!loading && projects.length === 0 ? <div className="empty">No projects yet.</div> : null}

          {!loading && projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-head">
                <div>
                  <h3>{project.name}</h3>
                  <div className="small">Owner: {project.owner.name} · {project._count.tasks} tasks</div>
                </div>
                <span className={`badge ${project.status.toLowerCase()}`}>{project.status}</span>
              </div>
              <div className="small">{project.description ?? "No description yet."}</div>

              <div>
                <div className="label">Members</div>
                <div className="member-list" style={{ marginTop: 8 }}>
                  {project.members.map((member) => (
                    <span className="pill" key={member.id}>
                      {member.user.name} <span className="small">({member.role})</span>
                      {canManage(project) ? (
                        <button className="button-chip" type="button" onClick={() => removeMember(project.id, member.user.id)}>Remove</button>
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>

              {canManage(project) ? (
                <div className="form-grid">
                  <label className="field">
                    <span className="label">Add member by email</span>
                    <input
                      className="input"
                      type="email"
                      value={memberEmail[project.id] ?? ""}
                      onChange={(event) => setMemberEmail((current) => ({ ...current, [project.id]: event.target.value }))}
                      placeholder="teammate@example.com"
                    />
                  </label>
                  <div className="inline-actions">
                    <button className="button-secondary" type="button" onClick={() => addMember(project.id)}>Add member</button>
                    <button className="button-danger" type="button" onClick={() => deleteProject(project.id)}>Delete project</button>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </div>
    </>
  );
}
