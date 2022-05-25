const express = require('express');
const {addEvent, 
       getAllEvents,
       getFreeSlots
      } = require('../controllers/eventController');

const router = express.Router();

router.post('/event', addEvent);
router.get('/events', getAllEvents);
router.get('/freeslots', getFreeSlots);


module.exports = {
    routes: router
}