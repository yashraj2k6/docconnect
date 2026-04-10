require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const User = require('./models/User');

const deleteTwoDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Fetch the first two doctors
    const doctors = await Doctor.find({}).sort({ createdAt: 1 }).limit(2).populate('userId');

    if (doctors.length === 0) {
      console.log('No doctors found in the database.');
    } else {
      for (const doctor of doctors) {
        const doctorName = doctor.userId ? doctor.userId.name : 'Unknown';
        const userId = doctor.userId ? doctor.userId._id : null;

        // Delete the Doctor record
        await Doctor.findByIdAndDelete(doctor._id);
        console.log(`Deleted doctor profile for: Dr. ${doctorName}`);

        // Delete the associated User record if it exists
        if (userId) {
          await User.findByIdAndDelete(userId);
          console.log(`Deleted user account for: ${doctorName}`);
        }
      }
      console.log('Successfully deleted the first two doctor profiles.');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error during deletion:', error.message);
    process.exit(1);
  }
};

deleteTwoDoctors();
