// API URL for fetching doctor data
const API_URL = 'https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json';

// DOM Elements
const searchInput = document.getElementById('search-input');
const suggestionsContainer = document.getElementById('suggestions-container');
const doctorsList = document.getElementById('doctors-list');
const specialtiesContainer = document.getElementById('specialties-container');

// State variables
let allDoctors = [];
let filteredDoctors = [];
let specialties = new Set();

// Initialize the application
async function initApp() {
    try {
        // Fetch doctor data
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch doctor data');
        }
        
        allDoctors = await response.json();
        filteredDoctors = [...allDoctors];
        
        // Extract unique specialties
        allDoctors.forEach(doctor => {
            if (doctor.specialities) {
                doctor.specialities.forEach(specialty => {
                    specialties.add(specialty.name);
                });
            }
        });
        
        // Create specialty checkboxes
        createSpecialtyCheckboxes();
        
        // Render doctors list
        renderDoctorsList(filteredDoctors);
        
        // Apply filters from URL if any
        applyFiltersFromURL();
        
        // Set up event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing app:', error);
        doctorsList.innerHTML = `<p>Error loading doctor data. Please try again later.</p>`;
    }
}

// Create checkboxes for each specialty
function createSpecialtyCheckboxes() {
    const sortedSpecialties = Array.from(specialties).sort();
    
    sortedSpecialties.forEach(specialty => {
        const formattedSpecialty = specialty.replace(/\s+/g, '-');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        
        checkbox.type = 'checkbox';
        checkbox.value = specialty;
        checkbox.dataset.testid = `filter-specialty-${formattedSpecialty}`;
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${specialty}`));
        
        specialtiesContainer.appendChild(label);
    });
}

// Render the list of doctors
function renderDoctorsList(doctors) {
    doctorsList.innerHTML = '';
    
    if (doctors.length === 0) {
        doctorsList.innerHTML = '<p>No doctors found matching your criteria.</p>';
        return;
    }
    
    doctors.forEach(doctor => {
        const doctorCard = document.createElement('div');
        doctorCard.className = 'doctor-card';
        doctorCard.dataset.testid = 'doctor-card';
        
        const specialtiesHtml = doctor.specialities ? doctor.specialities.map(specialty => 
            `<span data-testid="doctor-specialty">${specialty.name}</span>`
        ).join(', ') : '';
        
        // Extract years from experience string
        const yearsExp = doctor.experience.match(/\d+/) ? doctor.experience.match(/\d+/)[0] : '';
        
        doctorCard.innerHTML = `
            <img src="${doctor.photo || 'https://via.placeholder.com/80'}" alt="${doctor.name}" class="doctor-image">
            <div class="doctor-info">
                <div class="doctor-header">
                    <div>
                        <h2 class="doctor-name" data-testid="doctor-name">${doctor.name}</h2>
                        <div class="doctor-specialty">${specialtiesHtml}</div>
                        <div class="doctor-meta">
                            <span data-testid="doctor-experience">${yearsExp} yrs exp</span>
                        </div>
                        <div class="doctor-clinic">
                            ${doctor.in_clinic ? '<span>In-clinic Consultation</span>' : ''}
                            ${doctor.video_consult ? '<span>Video Consultation</span>' : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div class="doctor-actions">
                <span class="detail-value" data-testid="doctor-fee">${doctor.fees}</span>
                <button class="book-btn" data-testid="book-appointment-btn">Book Appointment</button>
            </div>
        `;
        
        doctorsList.appendChild(doctorCard);
    });
}

// Set up all event listeners
function setupEventListeners() {
    // Search input event listeners
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keydown', handleSearchKeydown);
    document.addEventListener('click', handleClickOutside);
    
    // Filter event listeners
    const consultationRadios = document.querySelectorAll('input[name="consultation"]');
    consultationRadios.forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });
    
    const specialtyCheckboxes = specialtiesContainer.querySelectorAll('input[type="checkbox"]');
    specialtyCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    
    // Sort event listeners
    const sortRadios = document.querySelectorAll('input[name="sort"]');
    sortRadios.forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });
    
    // Handle browser navigation
    window.addEventListener('popstate', () => {
        applyFiltersFromURL();
    });
    
    // Clear All button event listener
    document.getElementById('clear-all')?.addEventListener('click', () => {
        // Clear search input
        searchInput.value = '';
        
        // Uncheck all radio buttons
        document.querySelectorAll('input[name="consultation"], input[name="sort"]').forEach(radio => {
            radio.checked = false;
        });
        
        // Uncheck all specialty checkboxes
        document.querySelectorAll('#specialties-container input').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Apply filters (will reset to show all doctors)
        applyFilters();
    });
    
    // Add event listeners to book appointment buttons
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('book-btn')) {
            alert('Appointment booking functionality will be implemented soon!');
        }
    });
}

// Handle search input for autocomplete
function handleSearchInput() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm.length === 0) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.add('hidden');
        return;
    }
    
    const matchingDoctors = allDoctors.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm)
    ).slice(0, 3); // Show top 3 matches
    
    if (matchingDoctors.length === 0) {
        suggestionsContainer.classList.add('hidden');
        return;
    }
    
    suggestionsContainer.innerHTML = '';
    matchingDoctors.forEach(doctor => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.dataset.testid = 'suggestion-item';
        suggestionItem.textContent = doctor.name;
        suggestionItem.addEventListener('click', () => {
            searchInput.value = doctor.name;
            suggestionsContainer.classList.add('hidden');
            applyFilters();
        });
        
        suggestionsContainer.appendChild(suggestionItem);
    });
    
    suggestionsContainer.classList.remove('hidden');
}

// Handle keyboard navigation in search suggestions
function handleSearchKeydown(event) {
    if (event.key === 'Enter' && !suggestionsContainer.classList.contains('hidden')) {
        const firstSuggestion = suggestionsContainer.querySelector('.suggestion-item');
        if (firstSuggestion) {
            searchInput.value = firstSuggestion.textContent;
            suggestionsContainer.classList.add('hidden');
            applyFilters();
        }
    }
}

// Hide suggestions when clicking outside
function handleClickOutside(event) {
    if (!searchInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
        suggestionsContainer.classList.add('hidden');
    }
}

// Apply all filters and update the URL
function applyFilters() {
    // Get filter values
    const searchTerm = searchInput.value.trim().toLowerCase();
    const consultationType = document.querySelector('input[name="consultation"]:checked')?.value || '';
    
    const selectedSpecialties = [];
    document.querySelectorAll('#specialties-container input:checked').forEach(checkbox => {
        selectedSpecialties.push(checkbox.value);
    });
    
    const sortBy = document.querySelector('input[name="sort"]:checked')?.value || '';
    
    // Filter doctors
    let filtered = [...allDoctors];
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(doctor => 
            doctor.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply consultation type filter
    if (consultationType) {
        filtered = filtered.filter(doctor => {
            if (consultationType === 'Video Consult') {
                return doctor.video_consult === true;
            } else if (consultationType === 'In Clinic') {
                return doctor.in_clinic === true;
            }
            return true;
        });
    }
    
    // Apply specialties filter
    if (selectedSpecialties.length > 0) {
        filtered = filtered.filter(doctor => 
            doctor.specialities && selectedSpecialties.some(selectedSpecialty => 
                doctor.specialities.some(docSpecialty => docSpecialty.name === selectedSpecialty)
            )
        );
    }
    
    // Apply sorting
    if (sortBy) {
        if (sortBy === 'fees') {
            filtered.sort((a, b) => {
                const aFees = parseInt(a.fees.replace(/[^0-9]/g, ''));
                const bFees = parseInt(b.fees.replace(/[^0-9]/g, ''));
                return aFees - bFees; // Ascending
            });
        } else if (sortBy === 'experience') {
            filtered.sort((a, b) => {
                const aExp = parseInt(a.experience.replace(/[^0-9]/g, ''));
                const bExp = parseInt(b.experience.replace(/[^0-9]/g, ''));
                return bExp - aExp; // Descending
            });
        }
    }
    
    // Update URL with query parameters
    updateURLWithFilters(searchTerm, consultationType, selectedSpecialties, sortBy);
    
    // Update filtered doctors and render
    filteredDoctors = filtered;
    renderDoctorsList(filteredDoctors);
}

// Update URL with filter parameters
function updateURLWithFilters(searchTerm, consultationType, specialties, sortBy) {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('search', searchTerm);
    if (consultationType) params.set('consultation', consultationType);
    if (specialties.length > 0) params.set('specialties', specialties.join(','));
    if (sortBy) params.set('sort', sortBy);
    
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    history.pushState({}, '', newURL);
}

// Apply filters from URL parameters
function applyFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    // Get filter values from URL
    const searchTerm = params.get('search') || '';
    const consultationType = params.get('consultation') || '';
    const specialtiesParam = params.get('specialties') || '';
    const sortBy = params.get('sort') || '';
    
    // Set search input value
    searchInput.value = searchTerm;
    
    // Set consultation type radio
    if (consultationType) {
        const consultationRadio = document.querySelector(`input[name="consultation"][value="${consultationType}"]`);
        if (consultationRadio) consultationRadio.checked = true;
    }
    
    // Set specialty checkboxes
    const specialtiesList = specialtiesParam ? specialtiesParam.split(',') : [];
    document.querySelectorAll('#specialties-container input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = specialtiesList.includes(checkbox.value);
    });
    
    // Set sort radio
    if (sortBy) {
        const sortRadio = document.querySelector(`input[name="sort"][value="${sortBy}"]`);
        if (sortRadio) sortRadio.checked = true;
    }
    
    // Apply filters
    applyFilters();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);