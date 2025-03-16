module.exports = {
  port: 3000,
  jwtSecret: process.env.JWT_SECRET,
  dbConfig: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DEFAULT,
    port: parseInt(process.env.DATABASE_PORT),
    namedPlaceholders: false,
    dateStrings: true
  }
}; 