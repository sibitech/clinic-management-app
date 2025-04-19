const { fetchAppointmentsByDateAndByLocation } = require('./db');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date } = req.query;
    const { location } = req.query;
    const { timeZone } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, error: 'Date parameter is required' });
    }

    const appointments = await fetchAppointmentsByDateAndByLocation(date,timeZone,location);

    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};