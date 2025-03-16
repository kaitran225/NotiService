// Load env vars only in dev
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'default_key',
  dbConfig: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DEFAULT,
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    namedPlaceholders: false,
    dateStrings: true
  }
}; 