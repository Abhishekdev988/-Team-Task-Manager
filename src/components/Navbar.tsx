"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, Home, FolderKanban, CheckSquare } from "lucide-react";
import styles from "./Navbar.module.css";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.brand}>
          <CheckSquare className={styles.logo} />
          <span className={styles.brandName}>TeamTask</span>
        </div>

        <div className={styles.navLinks}>
          <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
            <Home size={18} /> Dashboard
          </Link>
          <Link href="/projects" className={`${styles.navLink} ${pathname.startsWith('/projects') ? styles.active : ''}`}>
            <FolderKanban size={18} /> Projects
          </Link>
        </div>

        <div className={styles.userSection}>
          <span className={styles.userName}>{session.user?.name} ({(session.user as any)?.role})</span>
          <button onClick={() => signOut()} className={styles.logoutBtn}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
