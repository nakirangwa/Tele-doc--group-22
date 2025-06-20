
        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyBz08CZpg_H_pwjY1O2K0E3fAnQNwyfcPc",
            authDomain: "teledoc-1e4a5.firebaseapp.com",
            databaseURL: "https://teledoc-1e4a5-default-rtdb.firebaseio.com",
            projectId: "teledoc-1e4a5",
            storageBucket: "teledoc-1e4a5.appspot.com",
            messagingSenderId: "939662005783",
            appId: "1:939662005783:web:0ee5813850c7197d016e52",
            measurementId: "G-J95158XDSJ"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const database = firebase.database();
        const firestore = firebase.firestore();
        

        // DOM Elements
        const splashScreen = document.querySelector('.splash-screen');
        const onboarding = document.querySelector('.onboarding');
        const onboardingSlides = document.querySelectorAll('.onboarding-slide');
        const nextOnboardingBtn = document.getElementById('next-onboarding');
        const skipOnboardingBtn = document.getElementById('skip-onboarding');
        const indicators = document.querySelectorAll('.indicator');
        const authScreen = document.querySelector('.auth');
        const authTabs = document.querySelectorAll('.auth-tab');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const profileSetup = document.querySelector('.profile-setup');
        const avatarOptions = document.querySelectorAll('.avatar-option');
        const roleOptions = document.querySelectorAll('.role-option');
        const specialtySelection = document.getElementById('specialty-selection');
        const workplaceGroup = document.getElementById('workplace-group');
        const completeProfileBtn = document.getElementById('complete-profile');
        const app = document.querySelector('.app');
        const patientDashboard = document.querySelector('.patient-dashboard');
        const doctorDashboard = document.querySelector('.doctor-dashboard');
        const loadingScreen = document.querySelector('.loading');
        const doctorDetails = document.querySelector('.doctor-details');
        const bookAppointmentBtn = document.getElementById('book-appointment-btn');

        // Navigation elements
        const navItems = document.querySelectorAll('.nav-item');
        
        // Profile elements
        const logoutBtn = document.getElementById('logout-btn');
        const doctorLogoutBtn = document.getElementById('doctor-logout-btn');
        const editProfileBtn = document.getElementById('edit-profile-btn');
        const doctorEditProfileBtn = document.getElementById('doctor-edit-profile-btn');
        const saveProfileBtn = document.getElementById('save-profile-btn');
        const doctorSaveProfileBtn = document.getElementById('doctor-save-profile-btn');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        const doctorCancelEditBtn = document.getElementById('doctor-cancel-edit-btn');
        
        // message elements
        const messagesPage = document.querySelector('.messages-page');
        const chatModal = document.querySelector('.chat-modal');
        const backToMessagesBtn = document.getElementById('back-to-messages');
        const chatMessages = document.getElementById('chat-messages');
        const messageInput = document.getElementById('message-input');
        const sendMessageBtn = document.getElementById('send-message');
        
        // App State
        let currentUser = null;
        let currentOnboardingSlide = 0;
        let selectedAvatar = '1';
        let selectedRole = 'patient';
        let selectedGender = 'male';
        let currentPage = 'home';
        let currentDoctorPage = 'home';
        let selectedDoctor = null;
        let selectedTimeSlot = null;
        
        let selectedDate = null;
        let selectedAppointmentType = 'video';
        let previousActiveDashboard = null;
        
        let currentChatId = null;
        let currentRecipient = null;
        let currentChatUnsubscribe = null;
        
        let chatListenerUnsubscribe = null;
        
        let searchTimeout = null;
        let lastSearchQuery = '';
        
        let customAvatarUrl = null;
        let customAvatarFile = null;
        
        // Sample data (in a real app, this would come from Firebase)
const categories = [
    { id: 1, name: 'Pediatrics', icon: 'fas fa-baby' },
    { id: 2, name: 'General Practice', icon: 'fas fa-user-md' },
    { id: 3, name: 'Obstetrics', icon: 'fas fa-baby-carriage' },
    { id: 4, name: 'Gynecology', icon: 'fas fa-female' },
    { id: 5, name: 'Emergency Medicine', icon: 'fas fa-ambulance' },
    { id: 6, name: 'Infectious Disease', icon: 'fas fa-virus' },
    { id: 7, name: 'Cardiology', icon: 'fas fa-heart' },
    { id: 8, name: 'Surgery', icon: 'fas fa-cut' },
    { id: 9, name: 'Dentistry', icon: 'fas fa-tooth' },
    { id: 10, name: 'Ophthalmology', icon: 'fas fa-eye' }
];

        // Initialize the app
  function initApp() {
    auth.onAuthStateChanged(user => {
        console.log('Auth state changed:', user);
        if (user) {
            console.log('User signed in:', user.uid);
            currentUser = user;
            checkProfileComplete(user.uid);
        } else {
            console.log('No user signed in');
            const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
            if (!hasSeenOnboarding) {
                onboarding.classList.add('active');
            } else {
                authScreen.classList.add('active');
            }
        }
    });
    
    setupSearch();
}
        
        // Add this code after the DOM is loaded or in your initialization function
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        this.classList.add('active');
        
        const filter = this.dataset.filter;
        
        // Check which dashboard is active
        const isDoctorDashboard = !doctorDashboard.classList.contains('hide');
        
        if (isDoctorDashboard) {
            loadDoctorAppointmentsList(filter);
        } else {
            loadPatientAppointmentsList(filter);
        }
    });
});

        // Check if user profile is complete
  function checkProfileComplete(userId) {
    showLoading();
    
    database.ref('users/' + userId).once('value').then(snapshot => {
        hideLoading();
        
        const userData = snapshot.val();
        if (!userData) {
            // New user - show profile setup
            profileSetup.classList.add('active');
            authScreen.classList.remove('active');
            return;
        }
        
        if (userData.profileComplete) {
            // Profile is complete, show main app
            showMainApp(userData);
            authScreen.classList.remove('active');
        } else {
            // Profile is not complete, show profile setup
            profileSetup.classList.add('active');
            authScreen.classList.remove('active');
        }
    }).catch(error => {
        hideLoading();
        console.error("Error checking profile:", error);
        alert("Error checking your profile. Please try again.");
    });
}

        // Show main app based on user role
        function showMainApp(userData) {
            app.classList.add('active');
            
            if (userData.role === 'doctor') {
                doctorDashboard.classList.remove('hide');
                patientDashboard.classList.add('hide');
                loadDoctorDashboard(userData);
            } else {
                patientDashboard.classList.remove('hide');
                doctorDashboard.classList.add('hide');
                loadPatientDashboard(userData);
            }
        }
        
        // Use while loading data
function showDoctorSkeletons(count) {
    const container = document.getElementById('popular-doctors');
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'doctor-card skeleton';
        skeleton.innerHTML = `
            <div class="profile-pic skeleton" style="height: 60px; width: 60px; border-radius: 50%;"></div>
            <div class="skeleton" style="height: 20px; width: 80%; margin-top: 10px;"></div>
            <div class="skeleton" style="height: 15px; width: 60%; margin-top: 5px;"></div>
        `;
        container.appendChild(skeleton);
    }
}

        // Load patient dashboard
 function loadPatientDashboard(userData) {
    // Set user info
    document.getElementById('patient-name').textContent = userData.fullName;
    document.getElementById('patient-avatar').querySelector('img').src = getAvatarUrl(userData.avatar);
    
    // Set greeting based on time of day
    setGreeting('patient-greeting');
    
    // Load categories
    renderCategories();
    
    // Load only 4 doctors initially
    loadDoctors(4);
    
    // Load appointments
    loadPatientAppointments();
    
    // Load profile data
    loadProfileData(userData);
}

// Add this after DOM is loaded
document.getElementById('doctorSearch').addEventListener('focus', function() {
    // Show search results page
    document.querySelector('.patient-dashboard .home-page').classList.add('hide');
    document.querySelector('.search-results-page').classList.remove('hide');
    document.querySelector('.navigation').classList.add('hide');
    
    // Focus on the search input in results page
    setTimeout(() => {
        document.getElementById('search-input-results').focus();
    }, 100);
});

// Back button from search results
document.getElementById('back-from-search').addEventListener('click', function() {
    document.querySelector('.search-results-page').classList.add('hide');
    document.querySelector('.patient-dashboard .home-page').classList.remove('hide');
    document.querySelector('.navigation').classList.remove('hide');
});

// Real-time search functionality
function setupSearch() {
    const searchInputHome = document.getElementById('doctorSearch');
    const searchInputResults = document.getElementById('search-input-results');
    
    function performSearch(query) {
        if (!query || query.trim() === '') {
            document.getElementById('search-results-container').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>Search for doctors by name or specialty</p>
                </div>
            `;
            return;
        }
        
        showLoading();
        
        // Clear previous timeout if exists
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Set new timeout to debounce search
        searchTimeout = setTimeout(() => {
            database.ref('users').orderByChild('role').equalTo('doctor').once('value').then(snapshot => {
                hideLoading();
                
                const doctors = snapshot.val();
                const resultsContainer = document.getElementById('search-results-container');
                resultsContainer.innerHTML = '';
                
                if (doctors) {
                    const queryLower = query.toLowerCase();
                    let hasResults = false;
                    
                    Object.keys(doctors).forEach(doctorId => {
                        const doctor = doctors[doctorId];
                        const nameMatch = doctor.fullName.toLowerCase().includes(queryLower);
                        const specialtyMatch = doctor.specialty && doctor.specialty.toLowerCase().includes(queryLower);
                        
                        if (nameMatch || specialtyMatch) {
                            hasResults = true;
                            const resultItem = document.createElement('div');
                            resultItem.className = 'search-result-item';
                            resultItem.innerHTML = `
                                <div class="profile-pic">
                                    <img src="${getAvatarUrl(doctor.avatar)}" alt="${doctor.fullName}">
                                </div>
                                <div>
                                    <h3>Dr. ${doctor.fullName}</h3>
                                    <p>${doctor.specialty || 'General Practitioner'}</p>
                                </div>
                            `;
                            
                            resultItem.addEventListener('click', () => {
                                showDoctorDetails(doctorId, doctor);
                            });
                            
                            resultsContainer.appendChild(resultItem);
                        }
                    });
                    
                    if (!hasResults) {
                        resultsContainer.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-user-md"></i>
                                <p>No doctors found matching "${query}"</p>
                            </div>
                        `;
                    }
                } else {
                    resultsContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-user-md"></i>
                            <p>No doctors found</p>
                        </div>
                    `;
                }
            }).catch(error => {
                hideLoading();
                console.error("Search error:", error);
            });
        }, 300); // 300ms debounce delay
    }
    
    // Event listeners for both search inputs
    searchInputHome.addEventListener('input', (e) => {
        lastSearchQuery = e.target.value;
        performSearch(lastSearchQuery);
    });
    
    searchInputResults.addEventListener('input', (e) => {
        lastSearchQuery = e.target.value;
        performSearch(lastSearchQuery);
    });
    
    // Initialize search results page with last query
    searchInputResults.addEventListener('focus', () => {
        if (lastSearchQuery) {
            searchInputResults.value = lastSearchQuery;
            performSearch(lastSearchQuery);
        }
    });
}

        // Load doctor dashboard
   function loadDoctorDashboard(userData) {
    // Set user info
    document.getElementById('doctor-name').textContent = userData.fullName;
    document.getElementById('doctor-avatar').querySelector('img').src = getAvatarUrl(userData.avatar);
    
    // Set greeting based on time of day
    setGreeting('doctor-greeting');
    
    // Load and update welcome card stats
    updateWelcomeCardStats();
    
    // Load appointments
    loadDoctorAppointments();
    
    // Load recent patients
    loadRecentPatients();
    
    // Load profile data
    loadDoctorProfileData(userData);
}
        
    function updateWelcomeCardStats() {
    if (!currentUser) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Get all appointments for today
    database.ref('appointments')
        .orderByChild('doctorId')
        .equalTo(currentUser.uid)
        .once('value')
        .then(snapshot => {
            const appointments = snapshot.val();
            let todayAppointments = 0;
            let totalPatients = new Set();
            
            if (appointments) {
                Object.values(appointments).forEach(appointment => {
                    if (appointment.date === today && appointment.status !== 'canceled') {
                        todayAppointments++;
                    }
                    totalPatients.add(appointment.patientId);
                });
            }
            
            // Update welcome card
            document.getElementById('todays-appointments').textContent = todayAppointments;
            document.getElementById('total-patients').textContent = totalPatients.size;
            
            // Update the count in Firebase
            database.ref('users/' + currentUser.uid).update({
                patientCount: totalPatients.size
            });
        });
}
        
 function setupChatListener() {
    if (!currentUser) return;
    
    if (chatListenerUnsubscribe) {
        chatListenerUnsubscribe();
    }
    
    chatListenerUnsubscribe = firestore.collection('chats')
        .where('participants', 'array-contains', currentUser.uid)
        .onSnapshot(snapshot => {
            updateMessageBadge();
        }, error => {
            console.error("Chat listener error:", error);
        });
}

// Call this when user logs in
auth.onAuthStateChanged(user => {
    if (user) {
        setupChatListener();
    } else if (chatListenerUnsubscribe) {
        chatListenerUnsubscribe();
        chatListenerUnsubscribe = null;
    }
});       
        

        // Set greeting based on time of day
        function setGreeting(elementId) {
            const hour = new Date().getHours();
            let greeting;
            
            if (hour < 12) {
                greeting = 'Good morning';
            } else if (hour < 18) {
                greeting = 'Good afternoon';
            } else {
                greeting = 'Good evening';
            }
            
            document.getElementById(elementId).textContent = greeting;
        }

        // Render categories
        function renderCategories() {
            const categoriesList = document.getElementById('categories-list');
            categoriesList.innerHTML = '';
            
            categories.forEach(category => {
                const categoryCard = document.createElement('div');
                categoryCard.className = 'category-card';
                categoryCard.innerHTML = `
                    <div class="category-icon">
                        <i class="${category.icon}"></i>
                    </div>
                    <div class="category-name">${category.name}</div>
                `;
                categoriesList.appendChild(categoryCard);
            });
        }

  // Load doctors from Firebase
function loadDoctors(limit = null) {
    showLoading();
    
    // Clear the container first
    const doctorsList = document.getElementById('popular-doctors');
    doctorsList.innerHTML = '';
    
    let doctorsQuery = database.ref('users').orderByChild('role').equalTo('doctor');
    
    if (limit) {
        doctorsQuery = doctorsQuery.limitToFirst(limit);
    }
    
    doctorsQuery.once('value').then(snapshot => {
        hideLoading();
        
        const doctors = snapshot.val();
        if (doctors) {
            Object.keys(doctors).forEach(doctorId => {
                const doctor = doctors[doctorId];
                const doctorCard = document.createElement('div');
                doctorCard.className = 'doctor-card';
                doctorCard.dataset.doctorId = doctorId;
                doctorCard.innerHTML = `
                    <div class="profile-pic">
                        <img src="${getAvatarUrl(doctor.avatar)}" alt="${doctor.fullName}">
                    </div>
                    <h3 class="doctor-name">Dr. ${doctor.fullName}</h3>
                    <p class="doctor-specialty">${doctor.specialty || 'General Practitioner'}</p>
                    <div class="doctor-rating">
                        <span class="stars">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star-half-alt"></i>
                        </span>
                        <span>4.7</span>
                    </div>
                `;
                
                doctorCard.addEventListener('click', () => {
                    showDoctorDetails(doctorId, doctor);
                });
                
                doctorsList.appendChild(doctorCard);
            });
        }
        
        // Show empty state if no doctors found
        if (doctorsList.children.length === 0) {
            doctorsList.innerHTML = '<div class="empty-state">No doctors found</div>';
        }
    }).catch(error => {
        hideLoading();
        console.error("Error loading doctors:", error);
        doctorsList.innerHTML = '<div class="empty-state">Error loading doctors</div>';
    });
}

// function to load doctors by category
function loadDoctorsByCategory(categoryName) {
    showLoading();
    
    const doctorsList = document.getElementById('category-doctors-list');
    doctorsList.innerHTML = '';
    
    document.getElementById('category-doctors-title').textContent = categoryName;
    
    database.ref('users').orderByChild('role').equalTo('doctor').once('value').then(snapshot => {
        hideLoading();
        
        const doctors = snapshot.val();
        let hasDoctors = false;
        
        if (doctors) {
            Object.keys(doctors).forEach(doctorId => {
                const doctor = doctors[doctorId];
                if (doctor.specialty && doctor.specialty.toLowerCase() === categoryName.toLowerCase()) {
                    hasDoctors = true;
                    const doctorCard = document.createElement('div');
                    doctorCard.className = 'doctor-card';
                    doctorCard.dataset.doctorId = doctorId;
                    doctorCard.innerHTML = `
                        <div class="profile-pic">
                            <img src="${getAvatarUrl(doctor.avatar)}" alt="${doctor.fullName}">
                        </div>
                        <h3 class="doctor-name">Dr. ${doctor.fullName}</h3>
                        <p class="doctor-specialty">${doctor.specialty || 'General Practitioner'}</p>
                        <div class="doctor-rating">
                            <span class="stars">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                            </span>
                            <span>4.7</span>
                        </div>
                    `;
                    
                    doctorCard.addEventListener('click', () => {
                        showDoctorDetails(doctorId, doctor);
                    });
                    
                    doctorsList.appendChild(doctorCard);
                }
            });
        }
        
        if (!hasDoctors) {
            doctorsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-md"></i>
                    <p>No doctors found in this category</p>
                </div>
            `;
        }
    }).catch(error => {
        hideLoading();
        console.error("Error loading doctors by category:", error);
        doctorsList.innerHTML = '<div class="empty-state">Error loading doctors</div>';
    });
}

  // Show doctor details
function showDoctorDetails(doctorId, doctor) {
    if (!doctorId || !doctor) {
        console.error("Invalid doctor data:", doctorId, doctor);
        return;
    }
    
    // Store which dashboard was active
    previousActiveDashboard = patientDashboard.classList.contains('hide') ? 'doctor' : 'patient';
    
    selectedDoctor = { id: doctorId, ...doctor };
    
    // Set doctor info
    document.getElementById('doctor-detail-name').textContent = `Dr. ${doctor.fullName}`;
    document.getElementById('doctor-detail-specialty').textContent = doctor.specialty || 'General Practitioner';
    document.getElementById('doctor-detail-avatar').src = getAvatarUrl(doctor.avatar);
    document.getElementById('doctor-detail-patients').textContent = doctor.patientCount || '0';
    document.getElementById('doctor-detail-experience').textContent = doctor.experience || '5';
    document.getElementById('doctor-detail-rating').textContent = '4.8';
    document.getElementById('doctor-detail-about').textContent = 
        `Dr. ${doctor.fullName} is a board-certified ${doctor.specialty || 'doctor'} with over ${doctor.experience || '5'} years of experience.`;
    
    // Generate calendar
    generateCalendar();
    
    // Generate time slots
    generateTimeSlots();
    
    // Set up appointment type selection
    setupAppointmentTypeSelection();
    
    // Show the doctor details view
    doctorDetails.classList.add('active');
    
    // Hide any other views that might be showing
    patientDashboard.classList.add('hide');
    doctorDashboard.classList.add('hide');
}

    // Generate grouped time slots
    function generateTimeSlots() {
        const morningSlots = document.getElementById('morning-slots');
        const afternoonSlots = document.getElementById('afternoon-slots');
        const eveningSlots = document.getElementById('evening-slots');
        
        morningSlots.innerHTML = '';
        afternoonSlots.innerHTML = '';
        eveningSlots.innerHTML = '';
        
        // Morning slots (9AM - 12PM)
        for (let hour = 9; hour < 12; hour++) {
            const time1 = `${hour}:00 AM`;
            const time2 = `${hour}:30 AM`;
            
            createTimeSlot(time1, morningSlots);
            createTimeSlot(time2, morningSlots);
        }
        
        // Afternoon slots (2PM - 5PM)
        for (let hour = 2; hour < 5; hour++) {
            const time1 = `${hour}:00 PM`;
            const time2 = `${hour}:30 PM`;
            
            createTimeSlot(time1, afternoonSlots);
            createTimeSlot(time2, afternoonSlots);
        }
        
        // Evening slots (5PM - 7PM)
        for (let hour = 5; hour < 7; hour++) {
            const time1 = `${hour}:00 PM`;
            const time2 = `${hour}:30 PM`;
            
            createTimeSlot(time1, eveningSlots);
            createTimeSlot(time2, eveningSlots);
        }
    }
    
     function createTimeSlot(time, container) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = time;
        
        // Randomly mark some slots as booked
        const booked = Math.random() > 0.7;
        if (booked) {
            timeSlot.classList.add('booked');
        } else {
            timeSlot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                timeSlot.classList.add('selected');
                selectedTimeSlot = time;
            });
        }
        
        container.appendChild(timeSlot);
    }
    
//function to your code
function generateCalendar() {
    const calendarBody = document.getElementById('calendar-body');
    if (!calendarBody) {
        console.error("Calendar body element not found");
        return;
    }
    calendarBody.innerHTML = '';
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // Current month (0-indexed)
    const firstDay = new Date(year, month, 1).getDay(); // Day of week (0-6)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Month name for header
    const monthNames = ["January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"];
    document.querySelector('.calendar-title').textContent = `${monthNames[month]} ${year}`;
    
    let date = 1;
    // Create calendar rows
    for (let i = 0; i < 6; i++) {
        // Stop creating rows if we've gone through all days
        if (date > daysInMonth) break;
        
        const row = document.createElement('tr');
        
        // Create cells for each day of the week
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            
            if (i === 0 && j < firstDay) {
                // Empty cells before the first day of the month
                cell.textContent = '';
                cell.classList.add('disabled');
            } else if (date > daysInMonth) {
                // Empty cells after the last day of the month
                cell.textContent = '';
                cell.classList.add('disabled');
            } else {
                // Cells with dates
                cell.textContent = date;
                
                // Highlight today's date by default
                const currentDate = new Date(year, month, date);
                const dateString = currentDate.toISOString().split('T')[0];
                
                if (date === today.getDate() && month === today.getMonth()) {
                    cell.classList.add('selected');
                    selectedDate = dateString;
                }
                
                // Add click event
                cell.addEventListener('click', () => {
                    if (cell.classList.contains('disabled')) return;
                    
                    document.querySelectorAll('.calendar-table td').forEach(d => {
                        d.classList.remove('selected');
                    });
                    cell.classList.add('selected');
                    selectedDate = dateString;
                });
                
                date++;
            }
            
            row.appendChild(cell);
        }
        
        calendarBody.appendChild(row);
    }
}
    
    // Set up appointment type selection
    function setupAppointmentTypeSelection() {
        const options = document.querySelectorAll('.appointment-type-option');
        
        options.forEach(option => {
            option.addEventListener('click', () => {
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedAppointmentType = option.dataset.type;
            });
        });
    }

// Load patient appointments for home page (limited view)
function loadPatientAppointments() {
    if (!currentUser) return;
    
    showLoading();
    
    database.ref('appointments').orderByChild('patientId').equalTo(currentUser.uid).limitToLast(3).once('value').then(snapshot => {
        hideLoading();
        
        const appointmentsContainer = document.getElementById('upcoming-appointments');
        appointmentsContainer.innerHTML = '';
        
        const appointments = snapshot.val();
        if (appointments) {
            Object.keys(appointments).forEach(appointmentId => {
                const appointment = appointments[appointmentId];
                if (appointment.status !== 'canceled') {
                    renderAppointment(appointment, appointmentsContainer, false);
                }
            });
        }
    }).catch(error => {
        hideLoading();
        console.error("Error loading appointments:", error);
    });
}

// Load full patient appointments list for appointments page
function loadPatientAppointmentsList(filter = 'upcoming') {
    if (!currentUser) return;
    
    showLoading();
    
    database.ref('appointments').orderByChild('patientId').equalTo(currentUser.uid).once('value').then(snapshot => {
        hideLoading();
        
        const appointmentsList = document.querySelector('.patient-dashboard #appointments-list');
        appointmentsList.innerHTML = '';
        
        const appointments = snapshot.val();
        if (appointments) {
            // Convert to array and sort by date (newest first)
            const appointmentsArray = Object.keys(appointments).map(id => ({
                id,
                ...appointments[id]
            })).sort((a, b) => new Date(a.date) - new Date(b.date));
            
            const now = new Date();
            
            appointmentsArray.forEach(appointment => {
                const appointmentDate = new Date(appointment.date);
                
                // Apply filter
                if (filter === 'upcoming' && appointment.status !== 'canceled' && appointmentDate >= now) {
                    renderAppointment(appointment, appointmentsList, false);
                } 
                else if (filter === 'past' && appointment.status !== 'canceled' && appointmentDate < now) {
                    renderAppointment(appointment, appointmentsList, false);
                }
                else if (filter === 'canceled' && appointment.status === 'canceled') {
                    renderAppointment(appointment, appointmentsList, false);
                }
            });
            
            // Show empty state if no appointments match filter
            if (appointmentsList.children.length === 0) {
                appointmentsList.innerHTML = '<div class="empty-state">No appointments found</div>';
            }
        } else {
            appointmentsList.innerHTML = '<div class="empty-state">No appointments found</div>';
        }
    }).catch(error => {
        hideLoading();
        console.error("Error loading appointments:", error);
        appointmentsList.innerHTML = '<div class="empty-state">Error loading appointments</div>';
    });
}

// Load doctor appointments for home page (limited view)
function loadDoctorAppointments() {
    if (!currentUser) return;
    
    showLoading();
    
    database.ref('appointments').orderByChild('doctorId').equalTo(currentUser.uid).limitToLast(3).once('value').then(snapshot => {
        hideLoading();
        
        const appointmentsContainer = document.getElementById('doctor-upcoming-appointments');
        appointmentsContainer.innerHTML = '';
        
        const appointments = snapshot.val();
        if (appointments) {
            Object.keys(appointments).forEach(appointmentId => {
                const appointment = appointments[appointmentId];
                if (appointment.status !== 'canceled') {
                    renderAppointment(appointment, appointmentsContainer, true);
                }
            });
        }
    }).catch(error => {
        hideLoading();
        console.error("Error loading appointments:", error);
    });
}

// Load full doctor appointments list for appointments page
function loadDoctorAppointmentsList(filter = 'upcoming') {
    if (!currentUser) return;
    
    showLoading();
    
    const appointmentsList = document.querySelector('.doctor-dashboard #appointments-list');
    if (!appointmentsList) {
        console.error("Appointments list container not found");
        hideLoading();
        return;
    }
    
    database.ref('appointments').orderByChild('doctorId').equalTo(currentUser.uid).once('value').then(snapshot => {
        hideLoading();
        
        appointmentsList.innerHTML = '';
        
        const appointments = snapshot.val();
        if (!appointments) {
            console.log("No appointments found");
            appointmentsList.innerHTML = '<div class="empty-state">No appointments found</div>';
            return;
        }
        
        // Convert to array and sort by date (newest first)
        const appointmentsArray = Object.keys(appointments).map(id => ({
            id,
            ...appointments[id]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const now = new Date();
        
        appointmentsArray.forEach(appointment => {
            const appointmentDate = new Date(appointment.date);
            
            // Apply filter
            if (filter === 'upcoming' && appointment.status !== 'canceled' && appointmentDate >= now) {
                renderAppointment(appointment, appointmentsList, true);
            } 
            else if (filter === 'past' && appointment.status !== 'canceled' && appointmentDate < now) {
                renderAppointment(appointment, appointmentsList, true);
            }
            else if (filter === 'canceled' && appointment.status === 'canceled') {
                renderAppointment(appointment, appointmentsList, true);
            }
        });
        
        // Show empty state if no appointments match filter
        if (appointmentsList.children.length === 0) {
            appointmentsList.innerHTML = '<div class="empty-state">No appointments found</div>';
        }
    }).catch(error => {
        hideLoading();
        console.error("Error loading appointments:", error);
        appointmentsList.innerHTML = '<div class="empty-state">Error loading appointments</div>';
    });
}

// Render appointment
function renderAppointment(appointment, container, isDoctorView, filter = 'all') {
    // Apply filter if specified
    if (filter !== 'all' && appointment.status !== filter) {
        return;
    }

    const appointmentCard = document.createElement('div');
    appointmentCard.className = 'appointment-card';
    
    // Determine status class and display text
    let statusClass = 'status-pending';
    let statusText = 'Pending';
    if (appointment.status === 'confirmed') {
        statusClass = 'status-confirmed';
        statusText = 'Confirmed';
    } else if (appointment.status === 'canceled') {
        statusClass = 'status-canceled';
        statusText = 'Canceled';
    }
    
    // Format appointment date and time
    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
    const formattedTime = formatTimeString(appointment.time);
    
    if (isDoctorView) {
        // Doctor's view of the appointment
        appointmentCard.innerHTML = `
            <div class="appointment-header">
                <div class="appointment-patient">
                    <div class="profile-pic">
                        <img src="${getAvatarUrl(appointment.patientAvatar)}" alt="${appointment.patientName}">
                    </div>
                    <div class="appointment-info">
                        <h3>${appointment.patientName}</h3>
                        <p>${formattedDate} at ${formattedTime}</p>
                        <p>Type: ${formatAppointmentType(appointment.type)}</p>
                    </div>
                </div>
                <span class="appointment-status ${statusClass}">${statusText}</span>
            </div>
            <div class="appointment-actions">
                ${appointment.status === 'pending' ? `
                    <button class="btn btn-outline btn-sm" data-appointment-id="${appointment.id}" data-action="cancel">Cancel</button>
                    <button class="btn btn-primary btn-sm" data-appointment-id="${appointment.id}" data-action="confirm">Confirm</button>
                ` : appointment.status === 'confirmed' ? `
                    <div class="consultation-actions">
                        <button class="btn btn-outline btn-sm" data-appointment-id="${appointment.id}" data-action="message">
                            <i class="fas fa-comment"></i> Message
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        // Patient's view of the appointment
        appointmentCard.innerHTML = `
            <div class="appointment-header">
                <div class="appointment-patient">
                    <div class="profile-pic">
                        <img src="${getAvatarUrl(appointment.doctorAvatar)}" alt="${appointment.doctorName}">
                    </div>
                    <div class="appointment-info">
                        <h3>Dr. ${appointment.doctorName}</h3>
                        <p>${formattedDate} at ${formattedTime}</p>
                        <p>Type: ${formatAppointmentType(appointment.type)}</p>
                        ${appointment.doctorSpecialty ? `<p>Specialty: ${appointment.doctorSpecialty}</p>` : ''}
                    </div>
                </div>
                <span class="appointment-status ${statusClass}">${statusText}</span>
            </div>
            <div class="appointment-actions">
                ${appointment.status === 'pending' ? `
                    <button class="btn btn-outline btn-sm" data-appointment-id="${appointment.id}" data-action="cancel">Cancel</button>
                ` : appointment.status === 'confirmed' ? `
                    <div class="consultation-actions">
                        <button class="btn btn-outline btn-sm" data-appointment-id="${appointment.id}" data-action="message">
                            <i class="fas fa-comment"></i> Message
                        </button>
                    </div>
                ` : ''}
                ${appointment.status === 'canceled' ? `
                    <button class="btn btn-outline btn-sm" data-appointment-id="${appointment.id}" data-action="rebook">Rebook</button>
                ` : ''}
            </div>
        `;
    }
    
    container.appendChild(appointmentCard);
    
    // Add event listeners to action buttons
    const actionButtons = appointmentCard.querySelectorAll('[data-action]');
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            const appointmentId = e.currentTarget.dataset.appointmentId;
            handleAppointmentAction(action, appointmentId);
        });
    });
}

// Helper function to format time string (e.g., "14:00" -> "2:00 PM")
function formatTimeString(timeString) {
    if (!timeString) return '';
    
    // Handle both "14:00" and "2:00 PM" formats
    if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
    }
    
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    
    return `${displayHour}:${minutes} ${period}`;
}

      // Helper function to format appointment type
function formatAppointmentType(type) {
    const typeMap = {
        'in-person': 'In-Person Visit',
        'message': 'Message Consultation'
    };
    return typeMap[type] || type;
}
    
       // Handle appointment actions
       function handleAppointmentAction(action, appointmentId) {
        showLoading();
        
        switch(action) {
            case 'confirm':
                database.ref('appointments/' + appointmentId).update({ status: 'confirmed' })
                    .then(() => {
                        hideLoading();
                        if (patientDashboard.classList.contains('hide')) {
                            loadDoctorAppointments();
                        } else {
                            loadPatientAppointments();
                        }
                    })
                    .catch(error => {
                        hideLoading();
                        console.error("Error confirming appointment:", error);
                        alert("Error confirming appointment. Please try again.");
                    });
                break;
                
            case 'cancel':
                database.ref('appointments/' + appointmentId).update({ status: 'canceled' })
                    .then(() => {
                        hideLoading();
                        if (patientDashboard.classList.contains('hide')) {
                            loadDoctorAppointments();
                        } else {
                            loadPatientAppointments();
                        }
                    })
                    .catch(error => {
                        hideLoading();
                        console.error("Error canceling appointment:", error);
                        alert("Error canceling appointment. Please try again.");
                    });
                break;
           
            case 'message':
            database.ref('appointments/' + appointmentId).once('value').then(snapshot => {
                const appointment = snapshot.val();
                
                if (appointment) {
                    const otherUserId = patientDashboard.classList.contains('hide') ? 
                        appointment.patientId : appointment.doctorId;
                    const otherUserName = patientDashboard.classList.contains('hide') ? 
                        appointment.patientName : appointment.doctorName;
                    const otherUserAvatar = patientDashboard.classList.contains('hide') ? 
                        appointment.patientAvatar : appointment.doctorAvatar;
                    
                    startChat(otherUserId, otherUserName, otherUserAvatar);
                }
                hideLoading();
            }).catch(error => {
                hideLoading();
                console.error("Error loading appointment:", error);
            });
            break;
                
            default:
                hideLoading();
                console.error("Unknown action:", action);
        }
    }

// Function to start a chat
function startChat(recipientId, recipientName, recipientAvatar) {
    // Unsubscribe from previous chat if exists
    if (currentChatUnsubscribe) {
        currentChatUnsubscribe();
        currentChatUnsubscribe = null;
    }

    currentRecipient = {
        id: recipientId,
        name: recipientName,
        avatar: recipientAvatar
    };

    const participants = [currentUser.uid, recipientId].sort();
    currentChatId = participants.join('-');

    showLoading();

    const chatRef = firestore.collection('chats').doc(currentChatId);
    
    // First mark as read immediately (optimistic update)
    const updatePromise = chatRef.update({
        [`participantsInfo.${currentUser.uid}.lastRead`]: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(() => {
        // If chat doesn't exist yet, create it
        return chatRef.set({
            participants: participants,
            participantsInfo: {
                [currentUser.uid]: {
                    name: currentUser.displayName || 'User',
                    avatar: getAvatarUrl(selectedAvatar),
                    lastRead: firebase.firestore.FieldValue.serverTimestamp()
                },
                [recipientId]: {
                    name: recipientName,
                    avatar: recipientAvatar,
                    lastRead: null
                }
            },
            lastMessage: '',
            lastMessageAt: null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    });

    updatePromise.then(() => {
        // Set up real-time listener
        currentChatUnsubscribe = firestore.collection('messages')
            .where('chatId', '==', currentChatId)
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                hideLoading();
                
                const messagesContainer = document.getElementById('chat-messages');
                messagesContainer.innerHTML = '';

                if (snapshot.empty) {
                    messagesContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-comments"></i>
                            <p>No messages yet. Send a message to start the conversation!</p>
                        </div>
                    `;
                } else {
                    snapshot.forEach(doc => {
                        const msg = doc.data();
                        displayMessage({
                            text: msg.text,
                            senderId: msg.senderId,
                            timestamp: msg.timestamp
                        }, msg.senderId !== currentUser.uid);
                    });
                    
                    // Scroll to bottom
                    setTimeout(() => {
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }, 100);
                }

                // Update badges immediately
                updateMessageBadge();
            }, error => {
                hideLoading();
                console.error("Message listener error:", error);
            });
        
        // Update UI
        document.getElementById('chat-recipient-name').textContent = recipientName;
        chatModal.classList.remove('hide');
        
        // Force update badges again to ensure consistency
        updateMessageBadge();
    }).catch(error => {
        hideLoading();
        console.error("Error starting chat:", error);
    });
}

// Function to display a message
function displayMessage(message, isReceived) {
  const messagesContainer = document.getElementById('chat-messages');
  const emptyState = messagesContainer.querySelector('.empty-state');
  
  if (emptyState) {
    messagesContainer.removeChild(emptyState);
  }
  
  // Safely handle timestamp
  const messageTime = message.timestamp 
    ? new Date(message.timestamp.toDate ? message.timestamp.toDate() : message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Just now';
  
  const messageElement = document.createElement('div');
  messageElement.className = `chat-message ${isReceived ? 'message-received' : 'message-sent'}`;
  
  messageElement.innerHTML = `
    <div class="message-content">${message.text}</div>
    <div class="message-time">${messageTime}</div>
  `;
  
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// function cteate chat element
function createChatElement(chat, userData) {
    if (!chat || !userData) {
        console.error("Invalid chat or user data:", chat, userData);
        return document.createElement('div');
    }

    const chatElement = document.createElement('div');
    chatElement.className = 'message-card';
    
    // Calculate unread messages
    const unreadCount = chat.participantsInfo && chat.participantsInfo[currentUser.uid] && 
                        chat.participantsInfo[currentUser.uid].lastRead ?
                        (chat.lastMessageAt > chat.participantsInfo[currentUser.uid].lastRead ? 1 : 0) : 
                        (chat.lastMessageAt ? 1 : 0);

    // Handle last message time
    let lastMessageTime = '';
    if (chat.lastMessageAt) {
        const date = chat.lastMessageAt.toDate ? chat.lastMessageAt.toDate() : new Date(chat.lastMessageAt);
        const now = new Date();
        
        if (date.toDateString() === now.toDateString()) {
            lastMessageTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (date.getFullYear() === now.getFullYear()) {
            lastMessageTime = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } else {
            lastMessageTime = date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
        }
    }

    // Get correct avatar URL
    const avatarUrl = userData.avatar ? getAvatarUrl(userData.avatar) : getAvatarUrl('1');

    chatElement.innerHTML = `
        <div class="profile-pic">
            <img src="${avatarUrl}" alt="${userData.fullName || 'User'}" onerror="this.src='${getAvatarUrl('1')}'">
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-sender">${userData.fullName || 'User'}</span>
                <span class="message-time">${lastMessageTime}</span>
            </div>
            <p class="message-preview">${chat.lastMessage || 'No messages yet'}</p>
            <span class="message-badge ${unreadCount > 0 ? '' : 'hide'}" data-chat-id="${chat.id}">
                ${unreadCount > 0 ? unreadCount : ''}
            </span>
        </div>
    `;

    chatElement.addEventListener('click', () => {
        startChat(
            chat.participants.find(id => id !== currentUser.uid),
            userData.fullName || 'User',
            userData.avatar || '1'
        );
    });

    return chatElement;
}

// Function to update the global message badge
async function updateMessageBadge() {
    if (!currentUser) return;

    try {
        const querySnapshot = await firestore.collection('chats')
            .where('participants', 'array-contains', currentUser.uid)
            .get();

        let totalUnread = 0;
        const messagesList = getMessagesListElement();
        
        querySnapshot.forEach(doc => {
            const chat = doc.data();
            const unreadCount = calculateUnreadCount(chat);
            totalUnread += unreadCount;
            
            // Update individual chat badges
            updateChatBadge(chat.id, unreadCount, messagesList);
        });

        // Update nav badge
        const navBadge = document.getElementById('message-badge');
        if (totalUnread > 0) {
            navBadge.textContent = totalUnread;
            navBadge.classList.remove('hide');
        } else {
            navBadge.classList.add('hide');
        }
    } catch (error) {
        console.error("Error updating message badges:", error);
    }
}

// Helper function to calculate unread count for a chat
function calculateUnreadCount(chat) {
    if (!chat.participantsInfo || !chat.participantsInfo[currentUser.uid]) {
        return chat.lastMessageAt ? 1 : 0;
    }
    
    const lastRead = chat.participantsInfo[currentUser.uid].lastRead;
    if (!lastRead || (chat.lastMessageAt && chat.lastMessageAt > lastRead)) {
        return 1;
    }
    return 0;
}

// Helper function to update individual chat badges
function updateChatBadge(chatId, unreadCount, container) {
    if (!container) return;
    
    const chatElement = container.querySelector(`[data-chat-id="${chatId}"]`);
    if (chatElement) {
        const badge = chatElement.querySelector('.message-badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.classList.remove('hide');
            } else {
                badge.classList.add('hide');
            }
        }
    }
}

// Function to send a message
function sendMessage() {
  const messageInput = document.getElementById('message-input');
  const messageText = messageInput.value.trim();
  
  if (!messageText || !currentChatId || !currentRecipient) {
    return;
  }

  const timestamp = firebase.firestore.FieldValue.serverTimestamp();
  
  const message = {
    chatId: currentChatId,
    text: messageText,
    senderId: currentUser.uid,
    senderName: currentUser.displayName || 'User',
    timestamp: timestamp
  };

  // Add optimistic UI update
  displayMessage({
    text: messageText,
    senderId: currentUser.uid,
    timestamp: Date.now()
  }, false);

  messageInput.value = '';

  // First add the message
  firestore.collection('messages').add(message)
    .then(() => {
      // Then update the chat's last message info
      return firestore.collection('chats').doc(currentChatId).update({
        lastMessage: messageText,
        lastMessageAt: timestamp,
        [`participantsInfo.${currentUser.uid}.lastRead`]: timestamp
      });
    })
    .catch(error => {
      console.error("Error sending message:", error);
      alert('Error sending message. Please try again.');
    });
}

function getMessagesListElement() {
  if (doctorDashboard.classList.contains('hide')) {
    return document.querySelector('.patient-dashboard .message-list');
  } else {
    return document.querySelector('.doctor-dashboard .message-list');
  }
}

// loadChats function
function loadChats() {
  if (!currentUser) return;

  showLoading();

  const messagesList = getMessagesListElement();
  messagesList.innerHTML = '<div class="loading-indicator">Loading chats...</div>';

  firestore.collection('chats')
    .where('participants', 'array-contains', currentUser.uid)
    .orderBy('lastMessageAt', 'desc')
    .get()
    .then(querySnapshot => {
      hideLoading();
      messagesList.innerHTML = '';

      if (!querySnapshot || querySnapshot.empty) {
        addSystemMessage(messagesList);
        return;
      }

      const chatPromises = [];
      
      querySnapshot.forEach(doc => {
        const chat = doc.data();
        const otherUserId = chat.participants.find(id => id !== currentUser.uid);
        
        chatPromises.push(
          database.ref('users/' + otherUserId).once('value')
            .then(userSnapshot => {
              const userData = userSnapshot.val();
              return {
                chat,
                userData: {
                  fullName: userData?.fullName || 'Unknown User',
                  avatar: userData?.avatar || '1',
                  role: userData?.role || 'patient'
                }
              };
            })
            .catch(error => {
              console.error("Error loading user data:", error);
              return {
                chat,
                userData: { fullName: 'Unknown User', avatar: '1', role: 'patient' }
              };
            })
        );
      });

      return Promise.all(chatPromises);
    })
    .then(chatData => {
      // Filter out any invalid entries
      chatData = chatData.filter(data => data && data.chat && data.userData);
      
      // Sort by last message time (newest first)
      chatData.sort((a, b) => {
        const timeA = a.chat.lastMessageAt?.toDate?.()?.getTime() || 
                     new Date(a.chat.lastMessageAt)?.getTime() || 0;
        const timeB = b.chat.lastMessageAt?.toDate?.()?.getTime() || 
                     new Date(b.chat.lastMessageAt)?.getTime() || 0;
        return timeB - timeA;
      });

      // Display chats
      chatData.forEach(data => {
        const chatElement = createChatElement(data.chat, data.userData);
        messagesList.appendChild(chatElement);
      });

      // Add system message at bottom
      addSystemMessage(messagesList);
    })
    .catch(error => {
      hideLoading();
      console.error("Error loading chats:", error);
      messagesList.innerHTML = '';
      addSystemMessage(messagesList);
    });
}

function addSystemMessage(container) {
  // First check if a system message already exists
  const existingSystemMessage = container.querySelector('.message-system');
  if (existingSystemMessage) {
    container.removeChild(existingSystemMessage);
  }

  const systemMessage = document.createElement('div');
  systemMessage.className = 'message-card message-system';
  systemMessage.innerHTML = `
    <div class="profile-pic system-avatar">
      <span>S</span>
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-sender">System</span>
      </div>
      <p class="message-preview">Welcome to Teledoc messaging</p>
    </div>
  `;
  
  // Always append to the bottom
  container.appendChild(systemMessage);
}

// Add event listeners for chat functionality
backToMessagesBtn.addEventListener('click', () => {
    if (currentChatUnsubscribe) {
        currentChatUnsubscribe();
        currentChatUnsubscribe = null;
    }
    
    chatModal.classList.add('hide');
    currentChatId = null;
    currentRecipient = null;
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

sendMessageBtn.addEventListener('click', sendMessage);


        // Load recent patients for doctor
        function loadRecentPatients() {
            if (!currentUser) return;
            
            showLoading();
            
            database.ref('appointments').orderByChild('doctorId').equalTo(currentUser.uid).once('value').then(snapshot => {
                hideLoading();
                
                const patientsContainer = document.getElementById('recent-patients');
                patientsContainer.innerHTML = '';
                
                const appointments = snapshot.val();
                const uniquePatients = {};
                
                if (appointments) {
                    Object.keys(appointments).forEach(appointmentId => {
                        const appointment = appointments[appointmentId];
                        if (!uniquePatients[appointment.patientId]) {
                            uniquePatients[appointment.patientId] = appointment;
                        }
                    });
                    
                    Object.keys(uniquePatients).slice(0, 4).forEach(patientId => {
                        const appointment = uniquePatients[patientId];
                        const patientCard = document.createElement('div');
                        patientCard.className = 'category-card';
                        patientCard.innerHTML = `
                            <div class="profile-pic">
                                <img src="${getAvatarUrl(appointment.patientAvatar)}" alt="${appointment.patientName}">
                            </div>
                            <div class="category-name">${appointment.patientName}</div>
                        `;
                        patientsContainer.appendChild(patientCard);
                    });
                }
            }).catch(error => {
                hideLoading();
                console.error("Error loading patients:", error);
            });
        }

        // Load profile data
function loadProfileData(userData) {
    // Check if we have a custom avatar URL
    if (userData.avatar === 'custom' && userData.customAvatarUrl) {
        customAvatarUrl = userData.customAvatarUrl;
    }
    
    document.getElementById('profile-name').textContent = userData.fullName;
    document.getElementById('profile-role').textContent = userData.role === 'doctor' ? 'Doctor' : 'Patient';
    document.getElementById('profile-email').textContent = userData.email;
    document.getElementById('profile-age').textContent = userData.age;
    document.getElementById('profile-gender').textContent = capitalizeFirstLetter(userData.gender);
    document.getElementById('profile-avatar').src = getAvatarUrl(userData.avatar);
    
    if (userData.role === 'doctor') {
        document.getElementById('profile-specialty').textContent = userData.specialty || 'Not specified';
        document.getElementById('profile-workplace').textContent = userData.workplace || 'Not specified';
        document.getElementById('profile-specialty-container').style.display = 'flex';
        document.getElementById('profile-workplace-container').style.display = 'flex';
    } else {
        document.getElementById('profile-specialty-container').style.display = 'none';
        document.getElementById('profile-workplace-container').style.display = 'none';
    }
}

        // Load doctor profile data
function loadDoctorProfileData(userData) {
    // Check if we have a custom avatar URL
    if (userData.avatar === 'custom' && userData.customAvatarUrl) {
        customAvatarUrl = userData.customAvatarUrl;
    }
    
    document.getElementById('doctor-profile-name').textContent = userData.fullName;
    document.getElementById('doctor-profile-specialty').textContent = userData.specialty || 'Doctor';
    document.getElementById('doctor-profile-email').textContent = userData.email;
    document.getElementById('doctor-profile-age').textContent = userData.age;
    document.getElementById('doctor-profile-gender').textContent = capitalizeFirstLetter(userData.gender);
    document.getElementById('doctor-profile-specialty-detail').textContent = userData.specialty || 'Not specified';
    document.getElementById('doctor-profile-workplace').textContent = userData.workplace || 'Not specified';
    document.getElementById('doctor-profile-avatar').src = getAvatarUrl(userData.avatar);

    // Rest of the function remains the same...
}

        // Capitalize first letter
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        // Get avatar URL
  function getAvatarUrl(avatarId) {
    if (avatarId === 'custom' && customAvatarUrl) {
        return customAvatarUrl;
    }
    
    const avatars = {
        '1': 'https://randomuser.me/api/portraits/women/44.jpg',
        '2': 'https://randomuser.me/api/portraits/men/32.jpg',
        '3': 'https://randomuser.me/api/portraits/women/68.jpg',
        '4': 'https://randomuser.me/api/portraits/men/75.jpg',
        '5': 'https://randomuser.me/api/portraits/women/63.jpg',
        '6': 'https://randomuser.me/api/portraits/men/55.jpg'
    };
    return avatars[avatarId] || avatars['1'];
}
        
        //function to handle image uploads
async function uploadImageToImageBB(file) {
    showLoading();
    const apiKey = '1dbc58387d100c16d5e7012f6fd434c1'; // Replace with your actual API key
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        hideLoading();
        
        if (data.success) {
            return data.data.url;
        } else {
            throw new Error('Image upload failed');
        }
    } catch (error) {
        hideLoading();
        console.error("Error uploading image:", error);
        alert("Error uploading image. Please try again.");
        return null;
    }
}

// event listener for file upload in the initApp function
document.addEventListener('DOMContentLoaded', function() {
    const avatarUpload = document.getElementById('avatar-upload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Check if file is an image
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            
            customAvatarFile = file;
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // Display preview
                const avatarOptions = document.querySelectorAll('.avatar-option[data-avatar="custom"]');
                avatarOptions.forEach(option => {
                    let preview = option.querySelector('.avatar-preview');
                    if (!preview) {
                        preview = document.createElement('img');
                        preview.className = 'avatar-preview';
                        option.querySelector('.upload-avatar').appendChild(preview);
                    }
                    preview.src = event.target.result;
                    preview.style.display = 'block';
                    option.querySelector('i').style.display = 'none';
                });
                
                // Select the custom avatar
                document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
                avatarOptions.forEach(option => option.classList.add('selected'));
                selectedAvatar = 'custom';
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Trigger file input when clicking upload area
    document.querySelectorAll('.upload-avatar').forEach(uploadArea => {
        uploadArea.addEventListener('click', function() {
            document.getElementById('avatar-upload').click();
        });
    });
});

        // Show loading screen
        function showLoading() {
            loadingScreen.classList.remove('hide');
        }

        // Hide loading screen
        function hideLoading() {
            loadingScreen.classList.add('hide');
        }

        // Onboarding navigation
        nextOnboardingBtn.addEventListener('click', () => {
            if (currentOnboardingSlide < onboardingSlides.length - 1) {
                onboardingSlides[currentOnboardingSlide].classList.add('hide');
                indicators[currentOnboardingSlide].classList.remove('active');
                
                currentOnboardingSlide++;
                
                onboardingSlides[currentOnboardingSlide].classList.remove('hide');
                indicators[currentOnboardingSlide].classList.add('active');
                
                if (currentOnboardingSlide === onboardingSlides.length - 1) {
                    nextOnboardingBtn.textContent = 'Get Started';
                }
            } else {
                // Onboarding complete
                localStorage.setItem('hasSeenOnboarding', 'true');
                onboarding.classList.remove('active');
                authScreen.classList.add('active');
            }
        });

        skipOnboardingBtn.addEventListener('click', () => {
            localStorage.setItem('hasSeenOnboarding', 'true');
            onboarding.classList.remove('active');
            authScreen.classList.add('active');
        });

        // Auth tab switching
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                authTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                if (tab.dataset.tab === 'login') {
                    loginForm.classList.remove('hide');
                    signupForm.classList.add('hide');
                } else {
                    loginForm.classList.add('hide');
                    signupForm.classList.remove('hide');
                }
            });
        });

        // Login form submission
   loginForm.addEventListener('submit', e => {
    e.preventDefault();
    showLoading();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('Login successful', userCredential.user); // Debug log
            currentUser = userCredential.user;
            return database.ref('users/' + currentUser.uid).once('value');
        })
        .then(snapshot => {
            const userData = snapshot.val();
            hideLoading();
            
            if (!userData || !userData.profileComplete) {
                authScreen.classList.remove('active');
                profileSetup.classList.add('active');
            } else {
                authScreen.classList.remove('active');
                showMainApp(userData);
            }
        })
        .catch(error => {
            hideLoading();
            console.error("Login error:", error); // Debug log
            alert(error.message);
        });
});

        // Signup form submission
        signupForm.addEventListener('submit', e => {
            e.preventDefault();
            showLoading();
            
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm').value;
            
            if (password !== confirmPassword) {
                hideLoading();
                alert("Passwords don't match!");
                return;
            }
            
            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    currentUser = userCredential.user;
                    authScreen.classList.remove('active');
                    profileSetup.classList.add('active');
                    hideLoading();
                })
                .catch(error => {
                    hideLoading();
                    alert(error.message);
                });
        });

        // Avatar selection
        avatarOptions.forEach(option => {
            option.addEventListener('click', () => {
                avatarOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedAvatar = option.dataset.avatar;
            });
        });

        // Role selection
        document.querySelectorAll('.role-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.role-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedRole = option.dataset.role;
                
                if (selectedRole === 'doctor') {
                    specialtySelection.classList.add('active');
                    workplaceGroup.style.display = 'block';
                } else {
                    specialtySelection.classList.remove('active');
                    workplaceGroup.style.display = 'none';
                }
            });
        });
        
        // Gender selection
        document.querySelectorAll('.gender-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.gender-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedGender = option.dataset.gender;
            });
        });

        // Complete profile
        completeProfileBtn.addEventListener('click', async () => {
    const fullName = document.getElementById('full-name').value;
    const age = document.getElementById('age').value;
    const specialty = selectedRole === 'doctor' ? document.getElementById('specialty').value : null;
    const workplace = selectedRole === 'doctor' ? document.getElementById('workplace').value : null;
    
    if (!fullName || !age || !selectedRole || !selectedGender) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (selectedRole === 'doctor' && !specialty) {
        alert('Please select your specialty');
        return;
    }
    
    showLoading();
    
    try {
        // Upload custom avatar if selected
        if (selectedAvatar === 'custom' && customAvatarFile) {
            customAvatarUrl = await uploadImageToImageBB(customAvatarFile);
            if (!customAvatarUrl) {
                hideLoading();
                return;
            }
        }
        
        // Prepare user data
        const userData = {
            uid: currentUser.uid,
            email: currentUser.email,
            avatar: selectedAvatar,
            fullName,
            role: selectedRole,
            gender: selectedGender,
            age: parseInt(age),
            profileComplete: true,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        // Add custom avatar URL if available
        if (selectedAvatar === 'custom' && customAvatarUrl) {
            userData.customAvatarUrl = customAvatarUrl;
        }
        
        // Add doctor-specific fields if needed
        if (selectedRole === 'doctor') {
            userData.specialty = specialty;
            if (workplace) userData.workplace = workplace;
            userData.patientCount = 0;
        }
        
        await database.ref('users/' + currentUser.uid).set(userData);
        hideLoading();
        profileSetup.classList.remove('active');
        showMainApp(userData);
    } catch (error) {
        hideLoading();
        console.error("Error saving profile:", error);
        alert("Error saving your profile. Please try again.");
    }
});


        // Book appointment
 bookAppointmentBtn.addEventListener('click', () => {
    if (!selectedTimeSlot) {
        alert('Please select a time slot');
        return;
    }
    
    if (!selectedDate) {
        alert('Please select a date');
        return;
    }
    
    if (!selectedDoctor || !currentUser) return;
    
    showLoading();
    
    // Get current user data
    database.ref('users/' + currentUser.uid).once('value').then(snapshot => {
        const patientData = snapshot.val();
        
        if (!patientData) {
            hideLoading();
            alert('Error: Patient data not found');
            return;
        }
        
        // Create appointment
        const appointmentId = database.ref().child('appointments').push().key;
        
        const appointment = {
            id: appointmentId,
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.fullName,
            doctorAvatar: selectedDoctor.avatar,
            patientId: currentUser.uid,
            patientName: patientData.fullName,
            patientAvatar: patientData.avatar,
            date: selectedDate,
            time: selectedTimeSlot,
            type: selectedAppointmentType,
            status: 'pending',
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        database.ref('appointments/' + appointmentId).set(appointment)
            .then(() => {
                hideLoading();
                doctorDetails.classList.remove('active');
                alert('Appointment booked successfully!');
                
                // Restore the previous active dashboard
                if (previousActiveDashboard === 'doctor') {
                    doctorDashboard.classList.remove('hide');
                    document.querySelector('.doctor-dashboard .home-page').classList.remove('hide');
                    loadDoctorAppointments();
                } else {
                    patientDashboard.classList.remove('hide');
                    document.querySelector('.patient-dashboard .home-page').classList.remove('hide');
                    loadPatientAppointments();
                }
            })
            .catch(error => {
                hideLoading();
                console.error("Error booking appointment:", error);
                alert("Error booking appointment. Please try again.");
            });
    }).catch(error => {
        hideLoading();
        console.error("Error loading patient data:", error);
        alert("Error loading your data. Please try again.");
    });
});

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        const page = item.dataset.page;
        
        // Update active nav item
        navItems.forEach(navItem => navItem.classList.remove('active'));
        item.classList.add('active');
        
        // Check which dashboard is active
        const isDoctorDashboard = !doctorDashboard.classList.contains('hide');
        
        // Hide all pages in the active dashboard
        if (isDoctorDashboard) {
            document.querySelectorAll('.doctor-dashboard > .main-content > div').forEach(el => {
                el.classList.add('hide');
            });
            
            // Show selected page in doctor dashboard
            if (page === 'home') {
                document.querySelector('.doctor-dashboard .home-page').classList.remove('hide');
                loadDoctorAppointments();
                // Update greeting and name
                setGreeting('doctor-greeting');
                database.ref('users/' + currentUser.uid).once('value').then(snapshot => {
                    const userData = snapshot.val();
                    document.getElementById('doctor-name').textContent = userData.fullName;
                });
            } else if (page === 'appointments') {
                document.querySelector('.doctor-dashboard .appointments-page').classList.remove('hide');
                // Load with default 'upcoming' filter
                loadDoctorAppointmentsList('upcoming');
            } else if (page === 'messages') {
                document.querySelector('.doctor-dashboard .messages-page').classList.remove('hide');
                loadChats();
            } else if (page === 'profile') {
                document.querySelector('.doctor-dashboard .profile-page').classList.remove('hide');
            }
        } else {
            // Patient dashboard
            document.querySelectorAll('.patient-dashboard > .main-content > div').forEach(el => {
                el.classList.add('hide');
            });
            
            // Hide category doctors page when navigating away
            document.querySelector('.category-doctors-page').classList.add('hide');
            
            // Show navigation when returning to other pages
            document.querySelector('.patient-dashboard .navigation').classList.remove('hide');
            
            // Show selected page in patient dashboard
            if (page === 'home') {
                document.querySelector('.patient-dashboard .home-page').classList.remove('hide');
                loadPatientAppointments();
                // Update greeting and name
                setGreeting('patient-greeting');
                database.ref('users/' + currentUser.uid).once('value').then(snapshot => {
                    const userData = snapshot.val();
                    document.getElementById('patient-name').textContent = userData.fullName;
                });
            } else if (page === 'appointments') {
                document.querySelector('.patient-dashboard .appointments-page').classList.remove('hide');
                // Load with default 'upcoming' filter
                loadPatientAppointmentsList('upcoming');
            } else if (page === 'messages') {
                document.querySelector('.patient-dashboard .messages-page').classList.remove('hide');
                loadChats();
            } else if (page === 'profile') {
                document.querySelector('.patient-dashboard .profile-page').classList.remove('hide');
            }
        }
    });
});

// event listener for category clicks
document.addEventListener('DOMContentLoaded', function() {
    const categoriesList = document.getElementById('categories-list');
    if (categoriesList) {
        categoriesList.addEventListener('click', function(e) {
            const categoryCard = e.target.closest('.category-card');
            if (categoryCard) {
                const categoryName = categoryCard.querySelector('.category-name').textContent;
                
                // Hide home page and navigation, show category doctors page
                document.querySelector('.patient-dashboard .home-page').classList.add('hide');
                document.querySelector('.patient-dashboard .navigation').classList.add('hide');
                document.querySelector('.category-doctors-page').classList.remove('hide');
                
                // Load doctors for this category
                loadDoctorsByCategory(categoryName);
            }
        });
    }
    
    // Add back button functionality
    const backToCategoriesBtn = document.getElementById('back-to-categories');
    if (backToCategoriesBtn) {
        backToCategoriesBtn.addEventListener('click', function() {
            // Show home page and navigation, hide category doctors page
            document.querySelector('.category-doctors-page').classList.add('hide');
            document.querySelector('.patient-dashboard .home-page').classList.remove('hide');
            document.querySelector('.patient-dashboard .navigation').classList.remove('hide');
        });
    }
});

        // Edit profile
        editProfileBtn.addEventListener('click', () => {
            document.querySelector('.profile-page').classList.add('hide');
            document.querySelector('.edit-profile-page').classList.remove('hide');
            
            // Load current data into form
            database.ref('users/' + currentUser.uid).once('value').then(snapshot => {
                const userData = snapshot.val();
                
                document.getElementById('edit-full-name').value = userData.fullName;
                document.getElementById('edit-age').value = userData.age;
                
                // Set avatar
                document.querySelectorAll('.edit-profile-page .avatar-option').forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.avatar === userData.avatar) {
                        option.classList.add('selected');
                        selectedAvatar = userData.avatar;
                    }
                });
                
                // Set gender
                document.querySelectorAll('.edit-profile-page [data-gender]').forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.gender === userData.gender) {
                        option.classList.add('selected');
                        selectedGender = userData.gender;
                    }
                });
                
                if (userData.role === 'doctor') {
                    document.getElementById('edit-specialty').value = userData.specialty || '';
                    document.getElementById('edit-workplace').value = userData.workplace || '';
                    document.getElementById('edit-specialty-container').style.display = 'block';
                    document.getElementById('edit-workplace-container').style.display = 'block';
                } else {
                    document.getElementById('edit-specialty-container').style.display = 'none';
                    document.getElementById('edit-workplace-container').style.display = 'none';
                }
            });
        });

        // Doctor edit profile
document.addEventListener('DOMContentLoaded', function() {
    // This ensures the button exists before we try to attach the listener
    const doctorEditProfileBtn = document.getElementById('doctor-edit-profile-btn');
    if (doctorEditProfileBtn) {
        doctorEditProfileBtn.addEventListener('click', function() {
            // Hide profile page and show edit page
            document.querySelector('.doctor-dashboard .profile-page').classList.add('hide');
            document.querySelector('.doctor-dashboard .edit-profile-page').classList.remove('hide');
            
            // Load current doctor data into the form
            database.ref('users/' + currentUser.uid).once('value').then(snapshot => {
                const userData = snapshot.val();
                
                if (userData) {
                    document.getElementById('doctor-edit-full-name').value = userData.fullName || '';
                    document.getElementById('doctor-edit-age').value = userData.age || '';
                    document.getElementById('doctor-edit-specialty').value = userData.specialty || '';
                    document.getElementById('doctor-edit-workplace').value = userData.workplace || '';
                    
                    // Set avatar selection
                    document.querySelectorAll('.doctor-dashboard .edit-profile-page .avatar-option').forEach(option => {
                        option.classList.remove('selected');
                        if (option.dataset.avatar === userData.avatar) {
                            option.classList.add('selected');
                            selectedAvatar = userData.avatar;
                        }
                    });
                    
                    // Set gender selection
                    document.querySelectorAll('.doctor-dashboard .edit-profile-page [data-gender]').forEach(option => {
                        option.classList.remove('selected');
                        if (option.dataset.gender === userData.gender) {
                            option.classList.add('selected');
                            selectedGender = userData.gender;
                        }
                    });
                }
            }).catch(error => {
                console.error("Error loading doctor data:", error);
            });
        });
    }
});

        // Save profile changes
saveProfileBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('edit-full-name').value;
    const age = document.getElementById('edit-age').value;
    const specialty = document.getElementById('edit-specialty') ? document.getElementById('edit-specialty').value : null;
    const workplace = document.getElementById('edit-workplace') ? document.getElementById('edit-workplace').value : null;
    
    if (!fullName || !age) {
        alert('Please fill in all required fields');
        return;
    }
    
    showLoading();
    
    try {
        // Upload custom avatar if selected
        if (selectedAvatar === 'custom' && customAvatarFile) {
            customAvatarUrl = await uploadImageToImageBB(customAvatarFile);
            if (!customAvatarUrl) {
                hideLoading();
                return;
            }
        }
        
        const updates = {
            fullName,
            age: parseInt(age),
            avatar: selectedAvatar,
            gender: selectedGender
        };
        
        // Add custom avatar URL if available
        if (selectedAvatar === 'custom' && customAvatarUrl) {
            updates.customAvatarUrl = customAvatarUrl;
        }
        
        if (specialty) updates.specialty = specialty;
        if (workplace) updates.workplace = workplace;
        
        await database.ref('users/' + currentUser.uid).update(updates);
        hideLoading();
        document.querySelector('.edit-profile-page').classList.add('hide');
        document.querySelector('.profile-page').classList.remove('hide');
        
        // Reload profile data
        const snapshot = await database.ref('users/' + currentUser.uid).once('value');
        loadProfileData(snapshot.val());
    } catch (error) {
        hideLoading();
        console.error("Error updating profile:", error);
        alert("Error updating your profile. Please try again.");
    }
});

        // Doctor save profile changes
doctorSaveProfileBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('doctor-edit-full-name').value;
    const age = document.getElementById('doctor-edit-age').value;
    const specialty = document.getElementById('doctor-edit-specialty').value;
    const workplace = document.getElementById('doctor-edit-workplace').value;
    
    if (!fullName || !age || !specialty) {
        alert('Please fill in all required fields');
        return;
    }
    
    showLoading();
    
    try {
        // Upload custom avatar if selected
        if (selectedAvatar === 'custom' && customAvatarFile) {
            customAvatarUrl = await uploadImageToImageBB(customAvatarFile);
            if (!customAvatarUrl) {
                hideLoading();
                return;
            }
        }
        
        const updates = {
            fullName,
            age: parseInt(age),
            specialty,
            workplace,
            avatar: selectedAvatar,
            gender: selectedGender
        };
        
        // Add custom avatar URL if available
        if (selectedAvatar === 'custom' && customAvatarUrl) {
            updates.customAvatarUrl = customAvatarUrl;
        }
        
        await database.ref('users/' + currentUser.uid).update(updates);
        hideLoading();
        document.querySelector('.edit-profile-page').classList.add('hide');
        document.querySelector('.profile-page').classList.remove('hide');
        
        // Reload profile data
        const snapshot = await database.ref('users/' + currentUser.uid).once('value');
        loadDoctorProfileData(snapshot.val());
    } catch (error) {
        hideLoading();
        console.error("Error updating profile:", error);
        alert("Error updating your profile. Please try again.");
    }
});

        // Cancel edit
        cancelEditBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.edit-profile-page').classList.add('hide');
            document.querySelector('.profile-page').classList.remove('hide');
        });

        // Doctor cancel edit
        doctorCancelEditBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.edit-profile-page').classList.add('hide');
            document.querySelector('.profile-page').classList.remove('hide');
        });

        // Logout
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                app.classList.remove('active');
                authScreen.classList.add('active');
            }).catch(error => {
                console.error("Error signing out:", error);
                alert("Error signing out. Please try again.");
            });
        });

        // Doctor logout
        doctorLogoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                app.classList.remove('active');
                authScreen.classList.add('active');
            }).catch(error => {
                console.error("Error signing out:", error);
                alert("Error signing out. Please try again.");
            });
        });
        
        // Back button from doctor details
document.getElementById('back-from-doctor-details').addEventListener('click', () => {
    doctorDetails.classList.remove('active');
    
    // Restore the previous active dashboard
    if (previousActiveDashboard === 'doctor') {
        doctorDashboard.classList.remove('hide');
        document.querySelector('.doctor-dashboard .home-page').classList.remove('hide');
    } else {
        patientDashboard.classList.remove('hide');
        document.querySelector('.patient-dashboard .home-page').classList.remove('hide');
    }
    
    // Reset selection
    selectedDoctor = null;
    selectedTimeSlot = null;
    selectedDate = null;
});

        // Initialize the app
        initApp();