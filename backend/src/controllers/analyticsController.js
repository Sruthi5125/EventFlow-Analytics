const db = require('../config/database');

exports.getEventAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // Get view count
    const viewCount = await db.query(
      `SELECT COUNT(*) as count FROM activity_logs 
       WHERE event_id = $1 AND action_type = 'view'`,
      [id]
    );

    // Get registration count
    const regCount = await db.query(
      'SELECT COUNT(*) as count FROM participants WHERE event_id = $1',
      [id]
    );

    // Get activity over time (last 7 days)
    const activityOverTime = await db.query(
      `SELECT DATE(timestamp) as date, COUNT(*) as count
       FROM activity_logs
       WHERE event_id = $1 AND timestamp > NOW() - INTERVAL '7 days'
       GROUP BY DATE(timestamp)
       ORDER BY date`,
      [id]
    );

    // Get participant age distribution
    const ageDistribution = await db.query(
      `SELECT 
         CASE 
           WHEN age < 20 THEN 'Under 20'
           WHEN age BETWEEN 20 AND 25 THEN '20-25'
           WHEN age BETWEEN 26 AND 30 THEN '26-30'
           ELSE 'Over 30'
         END as age_group,
         COUNT(*) as count
       FROM participants
       WHERE event_id = $1
       GROUP BY age_group`,
      [id]
    );

    res.json({
      views: parseInt(viewCount.rows[0].count),
      registrations: parseInt(regCount.rows[0].count),
      activityOverTime: activityOverTime.rows,
      ageDistribution: ageDistribution.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const organizer_id = req.user.id;

    // Total events
    const totalEvents = await db.query(
      'SELECT COUNT(*) as count FROM events WHERE organizer_id = $1',
      [organizer_id]
    );

    // Total participants
    const totalParticipants = await db.query(
      `SELECT COUNT(*) as count FROM participants p
       JOIN events e ON p.event_id = e.id
       WHERE e.organizer_id = $1`,
      [organizer_id]
    );

    // Total views
    const totalViews = await db.query(
      `SELECT COUNT(*) as count FROM activity_logs a
       JOIN events e ON a.event_id = e.id
       WHERE e.organizer_id = $1 AND a.action_type = 'view'`,
      [organizer_id]
    );

    // Events by category
    const eventsByCategory = await db.query(
      `SELECT category, COUNT(*) as count
       FROM events
       WHERE organizer_id = $1
       GROUP BY category`,
      [organizer_id]
    );

    // Recent events
    const recentEvents = await db.query(
      `SELECT e.*, COUNT(p.id) as participant_count
       FROM events e
       LEFT JOIN participants p ON e.id = p.event_id
       WHERE e.organizer_id = $1
       GROUP BY e.id
       ORDER BY e.created_at DESC
       LIMIT 5`,
      [organizer_id]
    );

    res.json({
      totalEvents: parseInt(totalEvents.rows[0].count),
      totalParticipants: parseInt(totalParticipants.rows[0].count),
      totalViews: parseInt(totalViews.rows[0].count),
      eventsByCategory: eventsByCategory.rows,
      recentEvents: recentEvents.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};