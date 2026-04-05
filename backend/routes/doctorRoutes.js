const express = require('express');
const router = express.Router();
const { getDoctors, createDoctorProfile, updateDoctorProfile } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .get(getDoctors)
  .post(protect, authorizeRoles('doctor'), createDoctorProfile);

router.route('/profile')
  .put(protect, authorizeRoles('doctor'), updateDoctorProfile);

module.exports = router;
