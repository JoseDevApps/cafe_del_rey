/**
 * Café del Rey — PM2 Ecosystem Config
 * Manages both FastAPI and Next.js as persistent Windows services.
 *
 * Usage:
 *   pm2 start pm2.config.cjs          # start all
 *   pm2 stop all                       # stop all
 *   pm2 restart all                    # restart
 *   pm2 logs                           # live logs
 *   pm2 save && pm2 startup            # survive reboots
 *   pm2 delete all                     # remove from PM2
 */

const path = require('path');

const ROOT    = __dirname;
const API_DIR = path.join(ROOT, 'api');
const VENV_PY = path.join(API_DIR, '.venv', 'Scripts', 'python.exe');

module.exports = {
  apps: [
    // ── FastAPI Backend ──────────────────────────────────────────────────────
    {
      name: 'cafe-api',
      script: VENV_PY,
      args: '-m uvicorn main:app --host 0.0.0.0 --port 8000',
      cwd: API_DIR,
      interpreter: 'none',          // script is the Python executable itself
      watch: false,                 // don't auto-reload in production
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      env: {
        // Override these in production — or use a real .env file + dotenv
        ADMIN_USERNAME:    process.env.ADMIN_USERNAME    || 'superadmin',
        ADMIN_PASSWORD:    process.env.ADMIN_PASSWORD    || 'cafedelrey2025',
        JWT_SECRET:        process.env.JWT_SECRET        || 'CAMBIAR_EN_PROD',
        JWT_EXPIRE_HOURS:  process.env.JWT_EXPIRE_HOURS  || '8',
        UPLOADS_DIR:       path.join(API_DIR, 'uploads'),
        DB_PATH:           path.join(API_DIR, 'data', 'cafe.db'),
        ALLOWED_ORIGINS:   'http://localhost:4001',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: path.join(ROOT, 'logs', 'api-out.log'),
      error_file: path.join(ROOT, 'logs', 'api-err.log'),
    },

    // ── Next.js Frontend ─────────────────────────────────────────────────────
    {
      name: 'cafe-frontend',
      script: path.join(ROOT, 'node_modules', '.bin', 'next.cmd'),
      args: 'start -p 4001',
      cwd: ROOT,
      interpreter: 'none',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      // Next.js must start AFTER the API is ready
      // PM2 doesn't have built-in depends_on; the API starts first by array order.
      env: {
        NODE_ENV:               'production',
        NEXT_PUBLIC_API_URL:    'http://localhost:8000',
        API_INTERNAL_URL:       'http://localhost:8000',
        NEXT_PUBLIC_SITE_URL:   'http://localhost:4001',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: path.join(ROOT, 'logs', 'frontend-out.log'),
      error_file: path.join(ROOT, 'logs', 'frontend-err.log'),
    },
  ],
};
