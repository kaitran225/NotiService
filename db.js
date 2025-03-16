const mysql = require('mysql2/promise');
const { dbConfig } = require('./config');

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

module.exports = {
  pool,
  testConnection
}; 