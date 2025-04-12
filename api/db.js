const { Pool } = require('pg');

// Create a PostgreSQL connection pool
let pool;

// Initialize the database connection
function getPool() {
  if (!pool) {
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

async function persistAppointment(payload) {
  try {
    const client = await getPool().connect();
    try {

      const {
        datetime,
        name,
        physio,
        phone,
        notes
      } = payload;

      const now = new Date().toISOString();
      const utcDatetime = new Date(datetime).toISOString();

      const query = `
        INSERT INTO appointment 
          (appointmaent_date_time, status, patient_name, physiotherapist, updated_at, updated_by, patient_phone_number, diagnosis, notes)
        VALUES 
          ($1, 'scheduled', $2, $3, $4, $5, $6, '', $7)
      `;

      await client.query(query, [
        utcDatetime,
        name,
        physio,
        now,
        physio,
        phone || null,
        notes || ''
      ]);

      return { success: true };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error inserting appointment:', error);
    return { success: false };
  }
}
// Function to get appointments by date
async function getAppointmentsByDate(date) {
  try {
    const client = await getPool().connect();
    try {

      // Create date range for full day in UTC
      const startDate = new Date(date + 'T00:00:00Z');
      const endDate = new Date(date + 'T23:59:59.999Z');

      const query = `
        SELECT 
          id,
          appointmaent_date_time as appointment_time,
          status,
          patient_name,
          physiotherapist,
          updated_at,
          updated_by,
          patient_phone_number as phone,
          diagnosis,
          notes,
          amount
        FROM 
          appointment
        WHERE 
          appointmaent_date_time BETWEEN $1 AND $2
        ORDER BY 
          appointmaent_date_time ASC
      `;

      const result = await client.query(query, [startDate.toISOString(), endDate.toISOString()]);

      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

// Function to update an appointment
async function updateAppointment(payload) {
  try {
    const client = await getPool().connect();
    try {
      const {
        id,
        patientName,
        phoneNumber,
        status,
        diagnosis,
        notes,
        amount,
        physiotherapist // Assuming this is the current user
      } = payload;

      const now = new Date().toISOString();

      const query = `
        UPDATE appointment
        SET 
          patient_name = $1,
          patient_phone_number = $2,
          status = $3,
          diagnosis = $4,
          notes = $5,
          amount = $6,
          updated_at = $7,
          updated_by = $8
        WHERE 
          id = $9
        RETURNING id
      `;

      const result = await client.query(query, [
        patientName,
        phoneNumber || null,
        status || 'scheduled',
        diagnosis || '',
        notes || '',
        amount || 0,
        now,
        physiotherapist,
        id
      ]);

      if (result.rowCount === 0) {
        return { success: false, error: 'Appointment not found' };
      }

      return { success: true, data: { id: result.rows[0].id } };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating appointment:', error);
    return { success: false, error: 'Database error' };
  }
}

// Function to delete an appointment
async function deleteAppointment(id) {
  try {
    const client = await getPool().connect();
    try {
      const query = `
        DELETE FROM appointment
        WHERE id = $1
        RETURNING id
      `;

      const result = await client.query(query, [id]);

      if (result.rowCount === 0) {
        return { success: false, error: 'Appointment not found' };
      }

      return { success: true };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return { success: false, error: 'Database error' };
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
  getAllowedUsers,
  persistAppointment,
  getAppointmentsByDate,
  updateAppointment,
  deleteAppointment
};