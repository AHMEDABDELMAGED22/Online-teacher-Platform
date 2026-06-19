import { login } from './actions'
import styles from './login.module.css'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const error = (await searchParams).error

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Student Login</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form className={styles.form} action={login}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className={styles.input}
              placeholder="student@example.com"
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
          
          <button type="submit" className={styles.button}>Sign In</button>
        </form>

        <Link href="/" className={styles.backLink}>
          &larr; Back to Home
        </Link>
      </div>
    </div>
  )
}
