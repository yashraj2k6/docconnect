const Doctor = require('../models/Doctor');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).populate('userId', 'name email');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create doctor profile
// @route   POST /api/doctors
// @access  Private (Doctor only)
const createDoctorProfile = async (req, res) => {
  try {
    const { specialization, experience, fees, availability } = req.body;

    // Check if profile already exists
    const doctorExists = await Doctor.findOne({ userId: req.user._id });
    if (doctorExists) {
      return res.status(400).json({ message: 'Doctor profile already exists' });
    }

    const doctor = await Doctor.create({
      userId: req.user._id,
      specialization,
      experience,
      fees,
      availability,
    });

    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
const updateDoctorProfile = async (req, res) => {
  try {
    const { specialization, experience, fees, availability } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (doctor) {
      doctor.specialization = specialization || doctor.specialization;
      doctor.experience = experience || doctor.experience;
      doctor.fees = fees || doctor.fees;
      doctor.availability = availability || doctor.availability;

      const updatedDoctor = await doctor.save();
      res.json(updatedDoctor);
    } else {
      res.status(404).json({ message: 'Doctor profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDoctors,
  createDoctorProfile,
  updateDoctorProfile,
};
