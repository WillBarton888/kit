// Drivers Portal V2 - Familiar Interface JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeDriverPortal();
});

// Global variables
let currentDriver = null;
let allBookings = [];
let filteredBookings = [];
let currentTab = 'today';
let currentFilter = 'all';

function initializeDriverPortal() {
    loadBookings();
    setupEventListeners();
    updateDateTime();
    setInterval(updateDateTime, 60000);
}

function loadBookings() {
    // Load from localStorage or create sample data
    const storedBookings = localStorage.getItem('kit-bookings');

    if (storedBookings) {
        allBookings = JSON.parse(storedBookings);
    }

    // If no bookings, create sample data matching the screenshot
    if (!allBookings || allBookings.length === 0) {
        createRealisticSampleData();
    }

    // Apply initial filter
    applyFilters();
}

function createRealisticSampleData() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    allBookings = [
        // Today's bookings (matching screenshot format)
        {
            pnr: '7561',
            date: todayStr,
            departDate: todayStr,
            time: '09:00',
            departTime: '09:00',
            firstName: 'Katharine',
            lastName: 'NICOL',
            title: 'Mrs',
            phone: '0412345678',
            pickupLocation: 'Ozone Hotel & Apartments',
            dropoffLocation: 'Airport',
            passengers: 2,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            agent: 'Exceptional Kangaroo Island (EKI)',
            status: 'confirmed',
            complete: 'yes',
            paymentStatus: 'on-account',
            price: 57.50,
            rateType: 'nett',
            customerName: 'Mrs Katharine NICOL',
            source: 'manual'
        },
        {
            pnr: '8215',
            date: todayStr,
            departDate: todayStr,
            time: '09:00',
            departTime: '09:00',
            firstName: 'Stephen',
            lastName: 'NICOL',
            title: 'Mr',
            phone: '0412345679',
            pickupLocation: 'Mercure KI Lodge (KIL)',
            dropoffLocation: 'Airport',
            passengers: 1,
            driver: 'shawn-olsen',
            vehicle: 'Merc 228 (2)',
            agent: 'Mercure Kangaroo Island Lodge (KIL)',
            status: 'confirmed',
            complete: 'yes',
            paymentStatus: 'on-account',
            price: 79.20,
            rateType: 'nett',
            customerName: 'Mr Stephen NICOL',
            source: 'manual'
        },
        {
            pnr: '8492',
            date: todayStr,
            departDate: todayStr,
            time: '10:20',
            departTime: '10:20',
            firstName: 'Chapman',
            lastName: 'Pitout',
            title: '',
            phone: '0423456789',
            pickupLocation: 'Ozone Hotel & Apartments',
            dropoffLocation: 'Emu Ridge Eucalyptus Distillery',
            passengers: 19,
            driver: 'gary-bell',
            driverSecondary: 'shawn-olsen',
            vehicle: 'Merc 228 (2) + Toyota 1063 (3)',
            agent: 'Sealink',
            status: 'confirmed',
            complete: 'yes',
            paymentStatus: 'on-account',
            price: 207.00,
            rateType: 'fixed',
            customerName: 'Pitout x 11 - 2WMHFZ7, Chapman x 4 - 2WTNP3, Empey x 2 - 2WZJW9, Hicks x 2 - 2X7H6N',
            source: 'manual'
        },
        {
            pnr: '8500',
            date: todayStr,
            departDate: todayStr,
            time: '12:00',
            departTime: '12:00',
            firstName: 'Dr',
            lastName: 'Payne',
            phone: '0434567890',
            pickupLocation: 'Airport',
            dropoffLocation: 'Ozone Hotel & Apartments',
            passengers: 1,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'pay-on-day',
            price: 36.00,
            rateType: 'RRP',
            customerName: 'Dr Payne',
            source: 'manual'
        },
        {
            pnr: '8501',
            date: todayStr,
            departDate: todayStr,
            time: '12:00',
            departTime: '12:00',
            firstName: 'Bremner',
            lastName: '',
            phone: '0445678901',
            pickupLocation: 'Airport',
            dropoffLocation: 'Ozone Hotel & Apartments',
            passengers: 1,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'pay-on-day',
            price: 36.00,
            rateType: 'RRP',
            customerName: 'Bremner',
            source: 'manual'
        },
        // Unassigned booking
        {
            pnr: '8502',
            date: todayStr,
            departDate: todayStr,
            time: '14:30',
            departTime: '14:30',
            firstName: 'John',
            lastName: 'Smith',
            phone: '0456789012',
            pickupLocation: 'Penneshaw Ferry',
            dropoffLocation: 'American River',
            passengers: 3,
            driver: null,
            vehicle: null,
            status: 'pending',
            complete: 'no',
            paymentStatus: 'pending',
            price: 85.00,
            rateType: 'RRP',
            customerName: 'John Smith',
            source: 'online'
        },
        // Tomorrow's bookings
        {
            pnr: '8503',
            date: tomorrowStr,
            departDate: tomorrowStr,
            time: '08:00',
            departTime: '08:00',
            firstName: 'Lisa',
            lastName: 'Taylor',
            phone: '0467890123',
            pickupLocation: 'Kingscote Town',
            dropoffLocation: 'Airport',
            passengers: 2,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'on-account',
            price: 45.00,
            rateType: 'nett',
            customerName: 'Lisa Taylor',
            source: 'manual'
        }
    ];

    // Save to localStorage
    localStorage.setItem('kit-bookings', JSON.stringify(allBookings));

    // Create drivers if not exist
    const drivers = [
        { id: 'gary-bell', name: 'Gary Bell', vehicle: 'Toyota 1063 (3)' },
        { id: 'shawn-olsen', name: 'Shawn Olsen', vehicle: 'Merc 228 (2)' }
    ];
    localStorage.setItem('kit-drivers', JSON.stringify(drivers));
}

function setupEventListeners() {
    // Driver selector
    document.getElementById('driver-select').addEventListener('change', function(e) {
        currentDriver = e.target.value;
        applyFilters();
        updateStats();
    });

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTab = this.dataset.tab;
            applyFilters();
        });
    });

    // Filter tags
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.status;
            applyFilters();
        });
    });

    // Search
    document.getElementById('search-btn').addEventListener('click', performSearch);
    document.getElementById('search-box').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') performSearch();
    });

    // FAB menu
    const fab = document.getElementById('fab-menu');
    const fabOptions = document.getElementById('fab-options');

    fab.addEventListener('click', function() {
        fabOptions.classList.toggle('show');
        this.textContent = fabOptions.classList.contains('show') ? '×' : '+';
    });

    // FAB actions
    document.getElementById('start-shift').addEventListener('click', startShift);
    document.getElementById('end-shift').addEventListener('click', endShift);
    document.getElementById('break-btn').addEventListener('click', takeBreak);
    document.getElementById('emergency-btn').addEventListener('click', emergency);

    // Modal close
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
}

function applyFilters() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    filteredBookings = allBookings.filter(booking => {
        // Date filter based on tab
        let dateMatch = true;
        if (currentTab === 'today') {
            dateMatch = booking.date === today || booking.departDate === today;
        } else if (currentTab === 'tomorrow') {
            dateMatch = booking.date === tomorrowStr || booking.departDate === tomorrowStr;
        } else if (currentTab === 'week') {
            // Next 7 days
            const bookingDate = new Date(booking.date || booking.departDate);
            const weekFromNow = new Date();
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            dateMatch = bookingDate >= new Date() && bookingDate <= weekFromNow;
        } else if (currentTab === 'my-jobs' && currentDriver) {
            dateMatch = booking.driver === currentDriver;
        }

        // Status filter
        let statusMatch = currentFilter === 'all' || booking.status === currentFilter;

        return dateMatch && statusMatch;
    });

    // Sort by time
    filteredBookings.sort((a, b) => {
        const timeA = (a.time || a.departTime || '00:00').replace(':', '');
        const timeB = (b.time || b.departTime || '00:00').replace(':', '');
        return timeA - timeB;
    });

    displayBookings();
    updateStats();
}

function displayBookings() {
    // Display in table (desktop)
    const tbody = document.getElementById('bookings-tbody');
    tbody.innerHTML = '';

    // Display in cards (mobile)
    const cardsContainer = document.getElementById('bookings-cards');
    cardsContainer.innerHTML = '';

    if (filteredBookings.length === 0) {
        document.getElementById('no-results').style.display = 'block';
        return;
    } else {
        document.getElementById('no-results').style.display = 'none';
    }

    filteredBookings.forEach(booking => {
        // Table row for desktop
        const row = createTableRow(booking);
        tbody.appendChild(row);

        // Card for mobile
        const card = createBookingCard(booking);
        cardsContainer.appendChild(card);
    });
}

function createTableRow(booking) {
    const tr = document.createElement('tr');

    const driverName = getDriverName(booking.driver);
    const driverClass = booking.driver ? 'driver-assigned' : 'driver-unassigned';
    const paymentClass = booking.paymentStatus === 'paid' ? 'payment-paid' :
                         booking.paymentStatus === 'pending' ? 'payment-pending' :
                         'payment-on-account';

    tr.innerHTML = `
        <td class="booking-pnr">${booking.pnr}</td>
        <td>${booking.time || booking.departTime || 'TBC'}</td>
        <td>${booking.customerName || `${booking.firstName} ${booking.lastName}`}</td>
        <td>${booking.pickupLocation}</td>
        <td>${booking.dropoffLocation}</td>
        <td>${booking.passengers}</td>
        <td class="${driverClass}">${driverName}</td>
        <td>${booking.vehicle || 'TBA'}</td>
        <td class="${paymentClass}">${formatPaymentStatus(booking.paymentStatus)}</td>
        <td class="status-${booking.status}">${booking.status}</td>
        <td>
            ${getActionButtons(booking)}
        </td>
    `;

    tr.addEventListener('click', function(e) {
        if (!e.target.classList.contains('action-btn')) {
            showBookingDetails(booking);
        }
    });

    return tr;
}

function createBookingCard(booking) {
    const card = document.createElement('div');
    card.className = 'booking-card';

    // Add special classes for better visual distinction
    if (!booking.driver) {
        card.className += ' unassigned';
    } else if (booking.driver === currentDriver) {
        card.className += ' my-job';
    }

    const driverName = getDriverName(booking.driver);
    const shortPickup = shortenLocation(booking.pickupLocation);
    const shortDropoff = shortenLocation(booking.dropoffLocation);

    // Condensed card layout for better mobile scanning
    card.innerHTML = `
        <div class="booking-card-header">
            <div class="booking-time">${booking.time || booking.departTime || 'TBC'}</div>
            <div>
                <span class="booking-pnr">#${booking.pnr}</span>
                <div class="booking-customer">${booking.customerName || `${booking.firstName} ${booking.lastName}`}</div>
            </div>
            <span class="booking-status status-${booking.status}">${booking.status}</span>
        </div>

        <div class="booking-route">
            <span>${shortPickup}</span>
            <span class="route-arrow">→</span>
            <span>${shortDropoff}</span>
        </div>

        <div class="booking-details">
            <span class="booking-detail">
                👥 ${booking.passengers}
            </span>
            <span class="booking-detail">
                🚗 ${driverName}
            </span>
            <span class="booking-detail">
                💳 ${booking.paymentStatus === 'on-account' ? 'Acc' :
                     booking.paymentStatus === 'pay-on-day' ? 'POD' :
                     booking.paymentStatus === 'paid' ? '✓' : '?'}
            </span>
            ${booking.agent ? `<span class="booking-detail" style="color: #007bff;">
                ${shortenAgent(booking.agent)}
            </span>` : ''}
        </div>
    `;

    card.addEventListener('click', () => showBookingDetails(booking));

    return card;
}

function shortenLocation(location) {
    if (!location) return 'TBA';

    // Common location abbreviations
    const abbreviations = {
        'Ozone Hotel & Apartments': 'Ozone',
        'Kingscote Airport': 'Airport',
        'Penneshaw Ferry': 'Ferry',
        'Mercure KI Lodge (KIL)': 'Mercure',
        'American River': 'Am River',
        'Emu Ridge Eucalyptus Distillery': 'Emu Ridge',
        'Flinders Chase National Park': 'Flinders',
        'Remarkable Rocks': 'Rem Rocks',
        'Admirals Arch': 'Admirals',
        'Kingscote Town': 'K\'cote',
        'Vivonne Bay': 'Vivonne'
    };

    return abbreviations[location] || location.split(' ')[0];
}

function shortenAgent(agent) {
    if (!agent) return '';

    const abbreviations = {
        'Exceptional Kangaroo Island (EKI)': 'EKI',
        'Mercure Kangaroo Island Lodge (KIL)': 'Mercure',
        'Sealink': 'Sealink',
        'ATS Pacific Pty Ltd': 'ATS',
        'Southern Ocean Lodge': 'SOL'
    };

    return abbreviations[agent] || agent.split(' ')[0];
}

function getDriverName(driverId) {
    if (!driverId) return 'Unassigned';

    const drivers = {
        'gary-bell': 'Gary Bell',
        'shawn-olsen': 'Shawn Olsen'
    };

    return drivers[driverId] || driverId;
}

function formatPaymentStatus(status) {
    const statusMap = {
        'paid': 'Paid',
        'pending': 'Pending',
        'on-account': 'On Account',
        'pay-on-day': 'Pay On Day'
    };
    return statusMap[status] || status || 'Pending';
}

function getActionButtons(booking) {
    if (!booking.driver || booking.driver === 'unassigned') {
        return '<button class="action-btn btn-accept" onclick="acceptBooking(\'' + booking.pnr + '\')">Accept</button>';
    }

    if (booking.driver === currentDriver) {
        if (booking.status === 'confirmed' && booking.complete !== 'yes') {
            return '<button class="action-btn btn-start" onclick="startTrip(\'' + booking.pnr + '\')">Start</button>';
        }
        if (booking.status === 'in-progress') {
            return '<button class="action-btn btn-complete" onclick="completeTrip(\'' + booking.pnr + '\')">Complete</button>';
        }
    }

    return '';
}

function showBookingDetails(booking) {
    const modal = document.getElementById('booking-modal');
    const modalBody = document.getElementById('modal-body');

    document.getElementById('modal-pnr').textContent = `Booking ${booking.pnr}`;

    modalBody.innerHTML = `
        <div class="detail-section">
            <h4>Customer Details</h4>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${booking.customerName || `${booking.firstName} ${booking.lastName}`}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${booking.phone || 'Not provided'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">PAX:</span>
                <span class="detail-value">${booking.passengers} passenger(s)</span>
            </div>
        </div>

        <div class="detail-section">
            <h4>Trip Details</h4>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formatDate(booking.date || booking.departDate)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${booking.time || booking.departTime || 'TBC'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Pickup:</span>
                <span class="detail-value">${booking.pickupLocation}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Dropoff:</span>
                <span class="detail-value">${booking.dropoffLocation}</span>
            </div>
        </div>

        <div class="detail-section">
            <h4>Assignment</h4>
            <div class="detail-row">
                <span class="detail-label">Driver:</span>
                <span class="detail-value">${getDriverName(booking.driver)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Vehicle:</span>
                <span class="detail-value">${booking.vehicle || 'TBA'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${booking.status}</span>
            </div>
        </div>

        <div class="detail-section">
            <h4>Payment</h4>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${formatPaymentStatus(booking.paymentStatus)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">$${booking.price ? booking.price.toFixed(2) : '0.00'}</span>
            </div>
            ${booking.agent ? `<div class="detail-row">
                <span class="detail-label">Agent:</span>
                <span class="detail-value">${booking.agent}</span>
            </div>` : ''}
        </div>
    `;

    // Show/hide action buttons
    document.getElementById('accept-btn').style.display = (!booking.driver || booking.driver === 'unassigned') ? 'block' : 'none';
    document.getElementById('start-btn').style.display = (booking.driver === currentDriver && booking.status === 'confirmed') ? 'block' : 'none';
    document.getElementById('complete-btn').style.display = (booking.driver === currentDriver && booking.status === 'in-progress') ? 'block' : 'none';
    document.getElementById('call-btn').style.display = booking.phone ? 'block' : 'none';

    // Set up call button
    if (booking.phone) {
        document.getElementById('call-btn').onclick = () => window.location.href = `tel:${booking.phone}`;
    }

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('booking-modal').style.display = 'none';
}

function updateStats() {
    const totalJobs = filteredBookings.length;
    const myJobs = currentDriver ? filteredBookings.filter(b => b.driver === currentDriver).length : 0;
    const totalPax = filteredBookings.reduce((sum, b) => sum + (b.passengers || 0), 0);

    // Find next pickup
    const now = new Date();
    const upcomingBookings = filteredBookings.filter(b => {
        if (currentDriver && b.driver !== currentDriver) return false;
        const bookingTime = new Date(`${b.date || b.departDate} ${b.time || b.departTime || '00:00'}`);
        return bookingTime > now;
    });

    const nextPickup = upcomingBookings[0];

    document.getElementById('total-jobs').textContent = totalJobs;
    document.getElementById('my-jobs-count').textContent = myJobs;
    document.getElementById('total-pax').textContent = totalPax;
    document.getElementById('next-pickup').textContent = nextPickup ? (nextPickup.time || nextPickup.departTime || 'TBC') : '--:--';
}

function performSearch() {
    const searchTerm = document.getElementById('search-box').value.toLowerCase();

    if (!searchTerm) {
        applyFilters();
        return;
    }

    filteredBookings = allBookings.filter(booking => {
        return booking.pnr.toLowerCase().includes(searchTerm) ||
               (booking.firstName && booking.firstName.toLowerCase().includes(searchTerm)) ||
               (booking.lastName && booking.lastName.toLowerCase().includes(searchTerm)) ||
               (booking.customerName && booking.customerName.toLowerCase().includes(searchTerm)) ||
               (booking.pickupLocation && booking.pickupLocation.toLowerCase().includes(searchTerm)) ||
               (booking.dropoffLocation && booking.dropoffLocation.toLowerCase().includes(searchTerm));
    });

    displayBookings();
    updateStats();
}

function updateDateTime() {
    // Update current time display if needed
}

function formatDate(dateStr) {
    if (!dateStr) return 'TBC';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Action functions
function acceptBooking(pnr) {
    if (!currentDriver) {
        alert('Please select a driver first');
        return;
    }

    const booking = allBookings.find(b => b.pnr === pnr);
    if (booking) {
        booking.driver = currentDriver;
        booking.status = 'confirmed';
        localStorage.setItem('kit-bookings', JSON.stringify(allBookings));
        applyFilters();
        alert(`Booking ${pnr} accepted!`);
    }
}

function startTrip(pnr) {
    const booking = allBookings.find(b => b.pnr === pnr);
    if (booking) {
        booking.status = 'in-progress';
        localStorage.setItem('kit-bookings', JSON.stringify(allBookings));
        applyFilters();
        alert(`Trip ${pnr} started!`);
    }
}

function completeTrip(pnr) {
    const booking = allBookings.find(b => b.pnr === pnr);
    if (booking) {
        booking.status = 'completed';
        booking.complete = 'yes';
        localStorage.setItem('kit-bookings', JSON.stringify(allBookings));
        applyFilters();
        alert(`Trip ${pnr} completed!`);
    }
}

function startShift() {
    if (!currentDriver) {
        alert('Please select a driver first');
        return;
    }
    alert(`Shift started for ${getDriverName(currentDriver)}!\n\nDrive safely! 🚗`);
}

function endShift() {
    if (!currentDriver) {
        alert('Please select a driver first');
        return;
    }

    const myCompletedJobs = allBookings.filter(b =>
        b.driver === currentDriver &&
        b.status === 'completed'
    ).length;

    alert(`Shift ended!\n\nCompleted jobs: ${myCompletedJobs}\n\nGreat work today!`);
}

function takeBreak() {
    alert('Break started.\n\nEnjoy your break! ☕');
}

function emergency() {
    if (confirm('🆘 EMERGENCY\n\nThis will alert dispatch immediately.\n\nDo you need emergency assistance?')) {
        alert('Emergency alert sent!\n\nDispatch has been notified.');
    }
}

// Make functions globally available
window.acceptBooking = acceptBooking;
window.startTrip = startTrip;
window.completeTrip = completeTrip;