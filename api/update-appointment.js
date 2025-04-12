const { updateAppointment } = require('./db');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { payload } = req.body;

    if (!payload || typeof payload !== 'object' || !payload.id) {
      return res.status(400).json({ success: false, error: 'Invalid payload or missing appointment ID' });
    }

    const result = await updateAppointment(payload);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};