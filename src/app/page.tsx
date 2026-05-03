"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format, isPast, isToday } from "date-fns";
import styles from "./page.module.css";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTasks();
    }
  }, [status]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchTasks();
  };

  if (status === "loading" || loading) return <div className="p-8 text-center">Loading...</div>;
  if (!session) return null;

  const pendingTasks = tasks.filter(t => t.status === "PENDING");
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");
  
  const overdueTasks = tasks.filter(t => 
    t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && t.status !== "COMPLETED"
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Welcome back, {session.user?.name}</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <Clock className={styles.statIcon} />
          <div>
            <h3>Pending Tasks</h3>
            <p className={styles.statNumber}>{pendingTasks.length}</p>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.green}`}>
          <CheckCircle2 className={styles.statIcon} />
          <div>
            <h3>Completed</h3>
            <p className={styles.statNumber}>{completedTasks.length}</p>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.red}`}>
          <AlertCircle className={styles.statIcon} />
          <div>
            <h3>Overdue</h3>
            <p className={styles.statNumber}>{overdueTasks.length}</p>
          </div>
        </div>
      </div>

      <div className={styles.tasksSection}>
        <h2 className={styles.sectionTitle}>Your Tasks</h2>
        {tasks.length === 0 ? (
          <p className={styles.emptyState}>No tasks assigned to you yet.</p>
        ) : (
          <div className={styles.taskList}>
            {tasks.map(task => {
              const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== "COMPLETED";
              return (
                <div key={task.id} className={`${styles.taskCard} ${isOverdue ? styles.taskOverdue : ''}`}>
                  <div className={styles.taskInfo}>
                    <h3 className={styles.taskTitle}>{task.title}</h3>
                    <p className={styles.taskProject}>{task.project?.name}</p>
                    {task.dueDate && (
                      <p className={`${styles.taskDate} ${isOverdue ? styles.textRed : ''}`}>
                        Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                  <div className={styles.taskActions}>
                    <select 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={styles.statusSelect}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
