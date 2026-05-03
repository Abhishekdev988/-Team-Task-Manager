"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";
import styles from "./projectDetail.module.css";
import { ArrowLeft, Plus, Users, Trash2 } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [project, setProject] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // New Task State
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    fetchProject();
    if (isAdmin) fetchUsers();
  }, [id, isAdmin]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setProject(data);
    } catch (error) {
      toast.error("Failed to load project");
      router.push("/projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          dueDate: taskDue || null,
          projectId: id,
          assigneeId: taskAssignee || null
        })
      });
      if (res.ok) {
        toast.success("Task created!");
        setShowTaskModal(false);
        setTaskTitle(""); setTaskDesc(""); setTaskDue(""); setTaskAssignee("");
        fetchProject();
      } else {
        toast.error("Failed to create task");
      }
    } catch (error) {
      toast.error("Error creating task");
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Project deleted");
        router.push("/projects");
      }
    } catch (error) {
      toast.error("Error deleting project");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!project) return null;

  return (
    <div className={styles.container}>
      <Link href="/projects" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{project.name}</h1>
          <p className={styles.subtitle}>{project.description}</p>
        </div>
        {isAdmin && (
          <div className={styles.headerActions}>
            <button className={styles.btnSecondary} onClick={() => setShowMemberModal(true)}>
              <Users size={18} /> Manage Team
            </button>
            <button className="btn-primary" onClick={() => setShowTaskModal(true)}>
              <Plus size={18} /> Add Task
            </button>
            <button className={styles.btnDanger} onClick={handleDeleteProject}>
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </header>

      <div className={styles.content}>
        <div className={styles.mainColumn}>
          <h2 className={styles.sectionTitle}>Tasks</h2>
          <div className={styles.taskList}>
            {project.tasks?.length === 0 ? (
              <p className={styles.emptyText}>No tasks yet.</p>
            ) : (
              project.tasks.map((task: any) => (
                <div key={task.id} className={styles.taskCard}>
                  <div className={styles.taskInfo}>
                    <h3 className={styles.taskTitle}>{task.title}</h3>
                    <p className={styles.taskDesc}>{task.description}</p>
                    <div className={styles.taskMeta}>
                      <span className={styles.statusBadge} data-status={task.status}>
                        {task.status.replace("_", " ")}
                      </span>
                      {task.dueDate && (
                        <span className={styles.dateInfo}>Due: {format(new Date(task.dueDate), 'MMM dd')}</span>
                      )}
                      {task.assignee && (
                        <span className={styles.assigneeInfo}>Assignee: {task.assignee.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.teamCard}>
            <h3 className={styles.teamTitle}>Team Members</h3>
            <ul className={styles.memberList}>
              <li className={styles.memberItem}>
                <div className={styles.avatar}>{project.owner?.name?.charAt(0) || 'O'}</div>
                <div>
                  <p className={styles.memberName}>{project.owner?.name} (Owner)</p>
                  <p className={styles.memberEmail}>{project.owner?.email}</p>
                </div>
              </li>
              {project.members.filter((m: any) => m.user.id !== project.ownerId).map((member: any) => (
                <li key={member.id} className={styles.memberItem}>
                  <div className={styles.avatar}>{member.user.name?.charAt(0) || 'U'}</div>
                  <div>
                    <p className={styles.memberName}>{member.user.name}</p>
                    <p className={styles.memberEmail}>{member.user.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <div className={styles.modalOverlay}>
          <div className={`glass ${styles.modal}`}>
            <h2 className={styles.modalTitle}>New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className={styles.inputGroup}>
                <label>Task Title</label>
                <input type="text" className="input-field" required value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label>Description</label>
                <textarea className="input-field" rows={3} value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label>Due Date</label>
                <input type="date" className="input-field" value={taskDue} onChange={e => setTaskDue(e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label>Assign To</label>
                <select className="input-field" value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}>
                  <option value="">Unassigned</option>
                  {project.members.map((m: any) => (
                    <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
