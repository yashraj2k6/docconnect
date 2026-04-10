const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const jwt = require('jsonwebtoken');

// @desc    Admin login with hardcoded credentials
// @route   POST /api/admin/login
const adminLogin = async (req, res) => {
  const { id, password } = req.body;

  if (id === 'admin' && password === '123456') {
    const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    res.json({ token, role: 'admin', name: 'System Admin' });
  } else {
    res.status(401).json({ message: 'Invalid admin credentials' });
  }
};

// @desc    Get all data for dashboard
// @route   GET /api/admin/data
const getAllData = async (req, res) => {
  try {
    const users = await User.find({});
    const doctors = await Doctor.find({}).populate('userId');
    const appointments = await Appointment.find({}).populate('doctorId').populate('patientId');
    const reviews = await Review.find({}).populate('doctorId').populate('patientId');
    
    res.json({ users, doctors, appointments, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete any record
// @route   DELETE /api/admin/:type/:id
const deleteRecord = async (req, res) => {
  const { type, id } = req.params;
  try {
    if (type === 'user') {
        await User.findByIdAndDelete(id);
        await Doctor.findOneAndDelete({ userId: id });
    } else if (type === 'doctor') {
        await Doctor.findByIdAndDelete(id);
    } else if (type === 'appointment') {
        await Appointment.findByIdAndDelete(id);
    } else if (type === 'review') {
        await Review.findByIdAndDelete(id);
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update any record
// @route   PUT /api/admin/:type/:id
const updateRecord = async (req, res) => {
  const { type, id } = req.params;
  const updates = req.body;
  try {
    let updated;
    if (type === 'user') {
        updated = await User.findByIdAndUpdate(id, updates, { new: true });
    } else if (type === 'doctor') {
        updated = await Doctor.findByIdAndUpdate(id, updates, { new: true });
    } else if (type === 'appointment') {
        updated = await Appointment.findByIdAndUpdate(id, updates, { new: true });
    } else if (type === 'review') {
        updated = await Review.findByIdAndUpdate(id, updates, { new: true });
    }
    res.json({ message: 'Record updated successfully', updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { adminLogin, getAllData, deleteRecord, updateRecord };
