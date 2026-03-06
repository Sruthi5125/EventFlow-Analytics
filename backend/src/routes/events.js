const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// IMPORTANT: Put specific routes BEFORE dynamic routes

// Specific routes come FIRST
router.post('/', eventController.createEvent);
router.get('/', eventController.getAllEvents);

// Dynamic routes come LAST
router.get('/:id', eventController.getEventById);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.post('/:id/register', eventController.registerParticipant);

module.exports = router;