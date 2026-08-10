const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

// Simple custom .env parser to avoid extra dependencies
function loadEnv() {
  const envPath = path.join(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split(/\r?\n/);
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const index = trimmed.indexOf('=');
          const key = trimmed.substring(0, index).trim();
          const val = trimmed.substring(index + 1).trim().replace(/^["']|["']$/g, ''); // strip quotes
          if (key && !process.env[key]) {
            process.env[key] = val;
          }
        }
      });
      console.log('✅ Loaded environment variables from root .env file.');
    } catch (err) {
      console.warn('⚠️ Failed to parse .env file:', err.message);
    }
  }
}

// Load env variables
loadEnv();

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASS !== undefined ? process.env.DB_PASS : '';
const dbName = process.env.DB_NAME || 'stock_market_application';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);

console.log(`📡 Connecting to MySQL database at ${dbHost}:${dbPort}/${dbName} with user ${dbUser}...`);

const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPass,
  database: dbName,
  port: dbPort,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Convert pool to promise-based functions
const promisePool = pool.promise();

// Verify connection
promisePool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Database Connected successfully via Pool.');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Database Connection Failed:', err.message);
  });

module.exports = promisePool;
