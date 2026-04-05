const Review = require('../models/Review');
const Appointment = require('../models/Appointment');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private (Patient only)
const addReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify ownership
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to review this appointment' });
    }

    // Verify status is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed appointments' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({ message: 'Appointment already reviewed' });
    }

    const review = await Review.create({
      patientId: req.user._id,
      doctorId: appointment.doctorId,
      appointmentId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('patientId', 'name')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' }
      })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addReview,
  getReviews,
};
