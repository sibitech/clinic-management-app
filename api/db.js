const { Pool } = require('pg');

// Create a PostgreSQL connection pool
let pool;

// Initialize the database connection
function getPool() {
  if (!pool) {
    console.log('*******DATABASE_URL:', process.env.DATABASE_URL)
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }
  return pool;
}

// Check if a user is allowed
async function isUserAllowed(email) {
  try {
    const client = await getPool().connect();
    try {
      const query = 'SELECT EXISTS(SELECT 1 FROM allowed_users WHERE email = $1)';
      const result = await client.query(query, [email]);
      return result.rows[0].exists;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Database error');
  }
}

// Add user to allowlist
async function addAllowedUser(email, name = null, notes = null) {
  try {
    const client = await getPool().connect();
    try {
      const query = `
        INSERT INTO allowed_users (email, name, notes) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (email) DO NOTHING
        RETURNING *
      `;
      const result = await client.query(query, [email, name, notes]);
      return result.rows[0];
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Database error');
  }
}

// List all allowed users
async function getAllowedUsers() {
  try {
    const client = await getPool().connect();
    try {
      const query = 'SELECT * FROM allowed_users ORDER BY created_at DESC';
      const result = await client.query(query);
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Database error');
  }
}

module.exports = {
  isUserAllowed,
  addAllowedUser,
  getAllowedUsers
};