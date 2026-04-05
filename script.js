document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "http://localhost:5001/api";

    // Helper: Global Fetch with Auth
    const authFetch = async (url, options = {}) => {
        const token = localStorage.getItem("token");
        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
        }
        return response;
    };

    // Helper: Safely add listeners
    const safeListener = (selector, event, callback) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            elements.forEach(el => el.addEventListener(event, callback));
        }
    };

    /* --- 1. NAVBAR & AUTH STATE --- */
    const updateNav = () => {
        const token = localStorage.getItem("token");
        const navMenu = document.querySelector(".nav-menu");
        if (!navMenu) return;

        // Clear existing auth links
        const existingAuth = navMenu.querySelectorAll(".auth-link");
        existingAuth.forEach(el => el.remove());

        if (token) {
            // Dropdown Container
            const dropdown = document.createElement("li");
            dropdown.className = "auth-link dropdown";
            dropdown.style.position = "relative";
            dropdown.style.display = "inline-block";
            
            dropdown.innerHTML = `
                <a href="#" id="profileBtn" style="cursor: pointer;">My Profile <i class="fas fa-chevron-down"></i></a>
                <ul class="dropdown-content" id="profileDropdown" style="display: none; position: absolute; background: white; box-shadow: 0 8px 16px rgba(0,0,0,0.1); min-width: 160px; z-index: 1000; list-style: none; padding: 10px; border-radius: 5px; right: 0;">
                    <li style="padding: 8px;"><a href="dashboard.html" style="color: #333; text-decoration: none;">Dashboard</a></li>
                    <li style="padding: 8px;"><a href="profile.html" style="color: #333; text-decoration: none;">View Profile</a></li>
                    <li style="padding: 8px; border-top: 1px solid #eee;"><a href="#" id="logoutBtn" style="color: #f44336; text-decoration: none;">Logout</a></li>
                </ul>
            `;
            navMenu.appendChild(dropdown);

            const profileBtn = document.getElementById("profileBtn");
            const profileDropdown = document.getElementById("profileDropdown");
            if (profileBtn) {
                profileBtn.onclick = (e) => {
                    e.preventDefault();
                    profileDropdown.style.display = profileDropdown.style.display === "none" ? "block" : "none";
                };
            }

            const logoutBtn = document.getElementById("logoutBtn");
            if (logoutBtn) {
                logoutBtn.onclick = (e) => {
                    e.preventDefault();
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "login.html";
                };
            }

            // Close dropdown on click outside
            window.onclick = (event) => {
                if (!event.target.matches('#profileBtn') && !event.target.closest('#profileBtn')) {
                    if (profileDropdown) profileDropdown.style.display = "none";
                }
            };

        } else {
            const loginLink = document.createElement("li");
            loginLink.className = "auth-link";
            loginLink.innerHTML = `<a href="login.html">Login</a>`;
            navMenu.appendChild(loginLink);
        }
    };
    updateNav();

    /* --- 2. DOCTOR LIST RENDERING (doctors.html) --- */
    const doctorsContainer = document.getElementById("doctorsContainer");
    if (doctorsContainer) {
        const fetchDoctors = async () => {
            try {
                const response = await fetch(`${API_URL}/doctors`);
                const doctors = await response.json();
                doctorsContainer.innerHTML = "";

                if (doctors.length === 0) {
                    doctorsContainer.innerHTML = "<p>No doctors found.</p>";
                    return;
                }

                doctors.forEach(doc => {
                    const card = document.createElement("div");
                    card.className = "card";
                    card.innerHTML = `
                        <div class="doctor-icon" style="font-size: 3rem; color: #1976d2; margin-bottom: 15px;">
                            <i class="fas fa-user-md"></i>
                        </div>
                        <h3>Dr. ${doc.userId.name}</h3>
                        <p><strong>${doc.specialization}</strong></p>
                        <p>${doc.experience} Years Experience</p>
                        <p>Fees: ₹${doc.fees}</p>
                        <div style="margin-top: 10px;">
                            <small>Available: ${doc.availability.map(a => a.day).join(", ")}</small>
                        </div>
                        <a href="appointment.html?doctor=${doc._id}" class="appointment-btn" style="display: block; margin-top: 15px; text-decoration: none; text-align: center;">Book Now</a>
                    `;
                    doctorsContainer.appendChild(card);
                });
            } catch (err) {
                doctorsContainer.innerHTML = `<p class="error">Error loading doctors. Please try again later.</p>`;
                console.error(err);
            }
        };
        fetchDoctors();
    }

    /* --- 3. DASHBOARD LOGIC (dashboard.html) --- */
    const appointmentsList = document.getElementById("appointmentsList");
    if (appointmentsList) {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!user || !token) {
            window.location.href = "login.html";
            return;
        }

        document.getElementById("welcomeUser").textContent = `Welcome, ${user.name}`;
        document.getElementById("userRole").textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        
        const fetchAppointments = async () => {
            try {
                const response = await authFetch(`${API_URL}/appointments/my`);
                if (response.status === 404 && user.role === 'doctor') {
                    window.location.href = "create-profile.html";
                    return;
                }
                const appointments = await response.json();
                appointmentsList.innerHTML = "";

                appointments.forEach(app => {
                    const row = document.createElement("tr");
                    const otherParty = user.role === 'patient' ? 
                                      (app.doctorId.userId ? app.doctorId.userId.name : 'Doctor') : 
                                      (app.patientId ? app.patientId.name : 'Patient');

                    row.innerHTML = `
                        <td>${otherParty}</td>
                        <td>${app.date}</td>
                        <td>${app.time}</td>
                        <td><span class="status-badge status-${app.status}">${app.status}</span></td>
                        <td>
                            ${app.status === 'booked' ? `
                                ${user.role === 'doctor' ? `<button class="action-btn btn-complete" data-id="${app._id}">Complete</button>` : ''}
                                <button class="action-btn btn-cancel" data-id="${app._id}">Cancel</button>
                            ` : ''}
                            ${app.status === 'completed' && user.role === 'patient' ? `
                                <button class="action-btn btn-review" data-id="${app._id}" style="background-color: #f39c12; color: white;">Rate Visit</button>
                            ` : ''}
                        </td>
                    `;
                    appointmentsList.appendChild(row);
                });

                // Status Update Listeners
                document.querySelectorAll(".btn-complete").forEach(btn => {
                    btn.onclick = () => updateStatus(btn.dataset.id, 'completed');
                });
                document.querySelectorAll(".btn-cancel").forEach(btn => {
                    btn.onclick = () => updateStatus(btn.dataset.id, 'cancelled');
                });

                // Review Modal Trigger
                document.querySelectorAll(".btn-review").forEach(btn => {
                    btn.onclick = () => {
                        document.getElementById("reviewAppointmentId").value = btn.dataset.id;
                        document.getElementById("reviewModal").style.display = "block";
                    };
                });

            } catch (err) {
                console.error("Failed to fetch appointments", err);
            }
        };

        const updateStatus = async (id, status) => {
            try {
                const response = await authFetch(`${API_URL}/appointments/${id}`, {
                    method: "PUT",
                    body: JSON.stringify({ status })
                });
                if (response.ok) {
                    fetchAppointments();
                }
            } catch (err) {
                console.error("Update failed", err);
            }
        };

        fetchAppointments();
    }

    /* --- 4. REVIEW SYSTEM LOGIC --- */
    const reviewForm = document.getElementById("reviewForm");
    if (reviewForm) {
        const stars = document.querySelectorAll(".star");
        const ratingInput = document.getElementById("ratingValue");

        stars.forEach(star => {
            star.onclick = () => {
                const val = star.dataset.value;
                ratingInput.value = val;
                stars.forEach(s => {
                    s.textContent = s.dataset.value <= val ? "★" : "☆";
                });
            };
        });

        const closeReviewModal = document.getElementById("closeReviewModal");
        if (closeReviewModal) {
            closeReviewModal.onclick = () => {
                document.getElementById("reviewModal").style.display = "none";
            };
        }

        reviewForm.onsubmit = async (e) => {
            e.preventDefault();
            const appointmentId = document.getElementById("reviewAppointmentId").value;
            const rating = ratingInput.value;
            const comment = document.getElementById("reviewComment").value;

            if (rating == 0) {
                alert("Please select a star rating");
                return;
            }

            try {
                const response = await authFetch(`${API_URL}/reviews`, {
                    method: "POST",
                    body: JSON.stringify({ appointmentId, rating, comment })
                });
                if (response.ok) {
                    alert("Thank you for your review!");
                    document.getElementById("reviewModal").style.display = "none";
                    window.location.reload();
                } else {
                    const data = await response.json();
                    alert(data.message || "Review submission failed");
                }
            } catch (err) {
                console.error(err);
                alert("Server Error");
            }
        };
    }

    const reviewsList = document.getElementById("reviewsList");
    if (reviewsList) {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`${API_URL}/reviews`);
                const reviews = await response.json();
                reviewsList.innerHTML = "";

                if (reviews.length === 0) {
                    reviewsList.innerHTML = "<p>No reviews yet. Be the first to share your experience!</p>";
                    return;
                }

                reviews.forEach(rev => {
                    const card = document.createElement("div");
                    card.className = "review-card";
                    const starDisplay = "★".repeat(rev.rating) + "☆".repeat(5 - rev.rating);
                    
                    card.innerHTML = `
                        <div class="review-header">
                            <div>
                                <span class="stars">${starDisplay}</span>
                                <div style="margin-top: 5px;">
                                    For <span class="doctor-name">Dr. ${rev.doctorId.userId.name}</span>
                                </div>
                            </div>
                            <small>${new Date(rev.createdAt).toLocaleDateString()}</small>
                        </div>
                        <p class="review-text">"${rev.comment}"</p>
                        <div class="reviewer-info">
                            — ${rev.patientId.name}
                        </div>
                    `;
                    reviewsList.appendChild(card);
                });
            } catch (err) {
                console.error(err);
                reviewsList.innerHTML = "<p>Error loading reviews.</p>";
            }
        };
        fetchReviews();
    }

    /* --- 5. PROFILE PAGE LOGIC (profile.html) --- */
    const profName = document.getElementById("profName");
    if (profName) {
        const fetchProfile = async () => {
            try {
                const response = await authFetch(`${API_URL}/auth/me`);
                const user = await response.json();
                
                profName.value = user.name;
                document.getElementById("profEmail").value = user.email;
                document.getElementById("roleBadge").textContent = user.role.toUpperCase();
                
                if (user.role === 'doctor') {
                    document.getElementById("doctorTab").style.display = "block";
                    const allDocsRes = await fetch(`${API_URL}/doctors`);
                    const allDocs = await allDocsRes.json();
                    const myDocProfile = allDocs.find(d => d.userId._id === user._id);
                    
                    if (myDocProfile) {
                        document.getElementById("editSpec").value = myDocProfile.specialization;
                        document.getElementById("editExp").value = myDocProfile.experience;
                        document.getElementById("editFees").value = myDocProfile.fees;
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchProfile();

        const tabs = document.querySelectorAll(".tab-item");
        const contents = document.querySelectorAll(".tab-content");
        tabs.forEach(tab => {
            tab.onclick = () => {
                tabs.forEach(t => t.classList.remove("active"));
                contents.forEach(c => c.classList.remove("active"));
                tab.classList.add("active");
                document.getElementById(tab.dataset.tab).classList.add("active");
            };
        });

        document.getElementById("basicInfoForm").onsubmit = async (e) => {
            e.preventDefault();
            const res = await authFetch(`${API_URL}/auth/update`, {
                method: "PUT",
                body: JSON.stringify({
                    name: profName.value,
                    email: document.getElementById("profEmail").value
                })
            });
            if (res.ok) alert("Profile updated successfully!");
        };

        document.getElementById("doctorProfileEditForm").onsubmit = async (e) => {
            e.preventDefault();
            const res = await authFetch(`${API_URL}/doctors/profile`, {
                method: "PUT",
                body: JSON.stringify({
                    specialization: document.getElementById("editSpec").value,
                    experience: document.getElementById("editExp").value,
                    fees: document.getElementById("editFees").value
                })
            });
            if (res.ok) alert("Doctor details updated!");
        };

        document.getElementById("changePasswordForm").onsubmit = async (e) => {
            e.preventDefault();
            const oldPass = document.getElementById("oldPass").value;
            const newPass = document.getElementById("newPass").value;
            const confirmPass = document.getElementById("confirmPass").value;

            if (newPass !== confirmPass) {
                alert("Passwords do not match!");
                return;
            }

            const res = await authFetch(`${API_URL}/auth/change-password`, {
                method: "PUT",
                body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
            });
            if (res.ok) {
                alert("Password changed successfully!");
                e.target.reset();
            } else {
                const data = await res.json();
                alert(data.message);
            }
        };
    }

    /* --- 6. AUTH FORMS --- */
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data));
                    alert("Login Successful!");
                    window.location.href = data.role === 'doctor' ? "dashboard.html" : "index.html";
                } else {
                    alert(data.message || "Login Failed");
                }
            } catch (err) {
                console.error(err);
                alert("Server Error");
            }
        });
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("regName").value;
            const email = document.getElementById("regEmail").value;
            const password = document.getElementById("regPassword").value;
            const role = document.getElementById("regRole").value;

            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password, role })
                });
                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data));
                    alert("Registration Successful!");
                    if (role === 'doctor') {
                        window.location.href = "create-profile.html";
                    } else {
                        window.location.href = "index.html";
                    }
                } else {
                    alert(data.message || "Registration Failed");
                }
            } catch (err) {
                console.error(err);
                alert("Server Error");
            }
        });
    }

    /* --- 7. APPOINTMENT BOOKING --- */
    const doctorSelect = document.getElementById("doctorSelect");
    if (doctorSelect) {
        const fetchDoctorsForSelect = async () => {
            try {
                const response = await fetch(`${API_URL}/doctors`);
                const doctors = await response.json();
                doctors.forEach(doc => {
                    const option = document.createElement("option");
                    option.value = doc._id;
                    option.textContent = `Dr. ${doc.userId.name} (${doc.specialization})`;
                    doctorSelect.appendChild(option);
                });
                
                const urlParams = new URLSearchParams(window.location.search);
                const doctorId = urlParams.get('doctor');
                if (doctorId) {
                    doctorSelect.value = doctorId;
                }
            } catch (err) {
                console.error("Failed to fetch doctors", err);
            }
        };
        fetchDoctorsForSelect();
    }

    const appointmentForm = document.getElementById("appointmentForm");
    if (appointmentForm) {
        appointmentForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please login first to book an appointment");
                window.location.href = "login.html";
                return;
            }

            const appointmentData = {
                doctorId: document.getElementById("doctorSelect").value,
                date: document.getElementById("appointmentDate").value,
                time: document.getElementById("appointmentTime").value,
                problem: document.getElementById("patientMessage")?.value || ""
            };

            try {
                const response = await authFetch(`${API_URL}/appointments`, {
                    method: "POST",
                    body: JSON.stringify(appointmentData)
                });
                const data = await response.json();
                if (response.ok) {
                    alert("Appointment Booked Successfully!");
                    window.location.href = "dashboard.html";
                } else {
                    alert(data.message || "Booking Failed");
                }
            } catch (err) {
                console.error(err);
                alert("Server Error");
            }
        });
    }

    /* --- 8. DOCTOR PROFILE CREATION LOGIC --- */
    const profileForm = document.getElementById("doctorProfileForm");
    const addDayBtn = document.getElementById("addDayBtn");
    const availabilityContainer = document.getElementById("availabilityContainer");

    if (addDayBtn) {
        addDayBtn.onclick = () => {
            const row = document.createElement("div");
            row.className = "availability-row";
            row.style = "display: flex; gap: 10px; margin-bottom: 10px; align-items: center;";
            row.innerHTML = `
                <select class="avail-day" style="flex: 1;">
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                </select>
                <input type="text" class="avail-slots" placeholder="e.g. 10:00 AM, 11:00 AM" style="flex: 2;" required>
            `;
            availabilityContainer.appendChild(row);
        };
    }

    if (profileForm) {
        profileForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const token = localStorage.getItem("token");
            
            const availability = [];
            document.querySelectorAll(".availability-row").forEach(row => {
                const day = row.querySelector(".avail-day").value;
                const timeSlots = row.querySelector(".avail-slots").value.split(",").map(s => s.trim());
                availability.push({ day, timeSlots });
            });

            const profileData = {
                specialization: document.getElementById("specialization").value,
                experience: document.getElementById("experience").value,
                fees: document.getElementById("fees").value,
                availability
            };

            try {
                const response = await authFetch(`${API_URL}/doctors`, {
                    method: "POST",
                    body: JSON.stringify(profileData)
                });
                if (response.ok) {
                    alert("Profile Created Successfully!");
                    window.location.href = "dashboard.html";
                } else {
                    const data = await response.json();
                    alert(data.message || "Profile Creation Failed");
                }
            } catch (err) {
                console.error(err);
                alert("Server Error");
            }
        });
    }

    // FAQ & UI Helpers
    safeListener(".faq-item", "click", function () {
        this.classList.toggle("active");
    });

    const aboutItems = document.querySelectorAll(".about-item");
    if (aboutItems.length > 0) {
        aboutItems.forEach(item => {
            item.addEventListener("click", function () {
                aboutItems.forEach(i => { if (i !== this) i.classList.remove("active"); });
                this.classList.toggle("active");
            });
        });
    }
});
