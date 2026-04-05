const axios = require('axios');

const API_URL = "http://localhost:5000/api";

const testFlow = async () => {
  try {
    console.log("🚀 Starting End-to-End Web App Test...\n");

    // 1. REGISTER DOCTOR
    console.log("1️⃣ Registering Doctor...");
    try {
        const drReg = await axios.post(`${API_URL}/auth/register`, {
        name: "Dr. Web Test",
        email: `doctor_${Date.now()}@test.com`,
        password: "password123",
        role: "doctor"
        });
        const drToken = drReg.data.token;
        console.log("✅ Doctor Registered!\n");

        // 2. CREATE DOCTOR PROFILE
        console.log("2️⃣ Creating Doctor Profile...");
        const drProfile = await axios.post(`${API_URL}/doctors`, {
        specialization: "General Medicine",
        experience: 15,
        fees: 600,
        availability: [{ day: "Monday", timeSlots: ["10:00 AM", "11:00 AM"] }]
        }, { headers: { Authorization: `Bearer ${drToken}` } });
        const doctorId = drProfile.data._id;
        console.log("✅ Doctor Profile Created!\n");

        // 3. REGISTER PATIENT
        console.log("3️⃣ Registering Patient...");
        const ptReg = await axios.post(`${API_URL}/auth/register`, {
        name: "Patient Web Test",
        email: `patient_${Date.now()}@test.com`,
        password: "password123",
        role: "patient"
        });
        const ptToken = ptReg.data.token;
        console.log("✅ Patient Registered!\n");

        // 4. FETCH DOCTORS
        console.log("4️⃣ Fetching Doctor List...");
        const docs = await axios.get(`${API_URL}/doctors`);
        console.log(`✅ Found ${docs.data.length} doctors!\n`);

        // 5. BOOK APPOINTMENT
        console.log("5️⃣ Booking Appointment...");
        const appointment = await axios.post(`${API_URL}/appointments`, {
        doctorId: doctorId,
        date: "2026-04-10",
        time: "10:00 AM"
        }, { headers: { Authorization: `Bearer ${ptToken}` } });
        const appId = appointment.data._id;
        console.log("✅ Appointment Booked!\n");

        // 6. VIEW PATIENT DASHBOARD
        console.log("6️⃣ Viewing Patient Dashboard...");
        const ptDash = await axios.get(`${API_URL}/appointments/my`, {
        headers: { Authorization: `Bearer ${ptToken}` }
        });
        console.log(`✅ Patient has ${ptDash.data.length} appointments!\n`);

        // 7. VIEW DOCTOR DASHBOARD
        console.log("7️⃣ Viewing Doctor Dashboard...");
        const drDash = await axios.get(`${API_URL}/appointments/my`, {
        headers: { Authorization: `Bearer ${drToken}` }
        });
        console.log(`✅ Doctor has ${drDash.data.length} pending bookings!\n`);

        // 8. UPDATE APPOINTMENT STATUS
        console.log("8️⃣ Doctor Completing Appointment...");
        await axios.put(`${API_URL}/appointments/${appId}`, {
        status: "completed"
        }, { headers: { Authorization: `Bearer ${drToken}` } });
        console.log("✅ Appointment marked as Completed!\n");

        console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
    } catch (e) {
        if (e.response) {
            console.log("Error Response Data:", JSON.stringify(e.response.data));
            console.log("Error Status:", e.response.status);
        } else {
            console.log("Error Message:", e.message);
        }
        throw e;
    }

  } catch (err) {
    process.exit(1);
  }
};

testFlow();
