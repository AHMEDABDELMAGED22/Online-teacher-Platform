import { adminLogin } from '@/app/login/actions'
import styles from '@/app/login/login.module.css'
import Link from 'next/link'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const error = (await searchParams).error

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Teacher Dashboard Login</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form className={styles.form} action={adminLogin}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Admin Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className={styles.input}
              placeholder="teacher@mathelevate.com"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className={styles.input}
            />
          </div>
          
          <button type="submit" className={styles.button}>Access Dashboard</button>
        </form>

        <Link href="/" className={styles.backLink}>
          &larr; Back to Home
        </Link>
      </div>
    </div>
  )
}
