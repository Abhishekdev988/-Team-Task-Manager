const { execSync } = require('child_process');

const port = process.env.PORT || 3000;

// Validate required environment variables before starting
const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error('[start] ERROR: Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

console.log('[start] Running prisma db push...');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('[start] Database schema sync complete.');
} catch (err) {
  console.error('[start] ERROR: prisma db push failed:', err.message);
  process.exit(1);
}

console.log(`[start] Starting Next.js on port ${port}...`);
try {
  execSync(`npx next start -H 0.0.0.0 -p ${port}`, { stdio: 'inherit' });
} catch (err) {
  console.error('[start] ERROR: Next.js server exited unexpectedly:', err.message);
  process.exit(1);
}
