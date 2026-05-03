"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import styles from "./projects.module.css";
import { FolderKanban, Plus, Users, CheckSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName, description: newProjectDesc })
      });
      if (res.ok) {
        toast.success("Project created!");
        setShowModal(false);
        setNewProjectName("");
        setNewProjectDesc("");
        fetchProjects();
      } else {
        toast.error("Failed to create project");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.subtitle}>Manage your team projects</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }}/>
            New Project
          </button>
        )}
      </header>

      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          <FolderKanban size={48} className={styles.emptyIcon} />
          <h3>No projects found</h3>
          <p>You don't have any projects yet.</p>
        </div>
      ) : (
        <div className={styles.projectsGrid}>
          {projects.map(project => (
            <Link href={`/projects/${project.id}`} key={project.id} className={styles.projectCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.projectName}>{project.name}</h3>
                <span className={styles.badge}>
                  {project.ownerId === (session?.user as any)?.id ? 'Owner' : 'Member'}
                </span>
              </div>
              <p className={styles.projectDesc}>{project.description || "No description provided."}</p>
              
              <div className={styles.cardFooter}>
                <div className={styles.stat}>
                  <Users size={16} />
                  <span>{project._count?.members || 0} Members</span>
                </div>
                <div className={styles.stat}>
                  <CheckSquare size={16} />
                  <span>{project._count?.tasks || 0} Tasks</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`glass ${styles.modal}`}>
            <h2 className={styles.modalTitle}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className={styles.inputGroup}>
                <label>Project Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  required 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Description</label>
                <textarea 
                  className="input-field" 
                  rows={3}
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
