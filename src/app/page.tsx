import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className="container">
        <h1 className={styles.title}>Math Elevate Platform</h1>
        <p className={styles.subtitle}>
          The premium online destination for mastering mathematics. Featuring AI-generated quizzes, seamless video lessons, and comprehensive PDF resources.
        </p>
        
        <div className={styles.buttonContainer}>
          <Link href="/login" className={styles.btnPrimary}>
            Student Login
          </Link>
          <Link href="/admin/login" className={styles.btnSecondary}>
            Teacher Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
