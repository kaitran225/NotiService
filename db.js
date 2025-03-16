const mysql = require('mysql2/promise');
const { dbConfig } = require('./config');

// Create a minimal connection pool
const pool = mysql.createPool({
  ...dbConfig,
  connectionLimit: 2,
  queueLimit: 5,
  enableKeepAlive: true,
});

// Minimal connection test
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
  } catch (error) {
    process.exit(1);
  }
}

module.exports = {
  pool,
  testConnection
}; 