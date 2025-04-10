export default function handler(req, res) {
    res.json({ dbUrl: process.env.DATABASE_URL || 'env not loaded' })
  }
  