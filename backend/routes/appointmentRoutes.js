const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, bookAppointment);

router.route('/my')
  .get(protect, getMyAppointments);

router.route('/:id')
  .put(protect, updateAppointmentStatus);

module.exports = router;
