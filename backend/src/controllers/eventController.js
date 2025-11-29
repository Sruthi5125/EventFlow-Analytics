const db = require('../config/database');

exports.createEvent = async (req, res) => {
  try {
    const { title, description, category, start_date, end_date, location } = req.body;
    const organizer_id = req.user.id;

    const result = await db.query(
      `INSERT INTO events (title, description, category, start_date, end_date, location, organizer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, category, start_date, end_date, location, organizer_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT e.*, u.name as organizer_name,
             COUNT(DISTINCT p.id) as participant_count
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN participants p ON e.id = p.event_id
      GROUP BY e.id, u.name
      ORDER BY e.start_date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (event_id, user_id, action_type) VALUES ($1, $2, $3)',
      [id, req.user.id, 'view']
    );

    const result = await db.query(
      `SELECT e.*, u.name as organizer_name,
              COUNT(DISTINCT p.id) as participant_count
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       LEFT JOIN participants p ON e.id = p.event_id
       WHERE e.id = $1
       GROUP BY e.id, u.name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, start_date, end_date, location } = req.body;

    const result = await db.query(
      `UPDATE events 
       SET title = $1, description = $2, category = $3, 
           start_date = $4, end_date = $5, location = $6
       WHERE id = $7 AND organizer_id = $8
       RETURNING *`,
      [title, description, category, start_date, end_date, location, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM events WHERE id = $1 AND organizer_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.registerParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;

    const result = await db.query(
      'INSERT INTO participants (event_id, name, email, age) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, email, age]
    );

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (event_id, user_id, action_type) VALUES ($1, $2, $3)',
      [id, req.user.id, 'register']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};