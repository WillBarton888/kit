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
    console.log('Initializing driver portal...');
    loadBookings();
    setupEventListeners();
    console.log('Driver portal initialized. Total bookings:', allBookings.length);

    // Force show all data for debugging
    setTimeout(() => {
        if (filteredBookings.length === 0) {
            console.log('No filtered bookings, forcing display of all bookings');
            filteredBookings = allBookings.slice(0, 10); // Show first 10 bookings
            displayBookings();
        }
    }, 1000);
}

function loadBookings() {
    // Force clear old data and create fresh sample data
    localStorage.removeItem('kit-bookings');

    console.log('Creating fresh sample data...');
    createRealisticSampleData();
    console.log('Sample data created:', allBookings.length, 'bookings');

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
        // Exact bookings from Knack screenshot - 27/09/2025
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
            customerName: 'NICOL, Mrs Katharine',
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
            customerName: 'NICOL, Mr Stephen',
            source: 'manual'
        },
        {
            pnr: '8492',
            date: todayStr,
            departDate: todayStr,
            time: '10:20',
            departTime: '10:20',
            firstName: 'Pitout',
            lastName: '',
            title: '',
            phone: '0423456789',
            pickupLocation: 'Ozone Hotel & Apartments',
            dropoffLocation: 'Emu Ridge Eucalyptus Distillery',
            passengers: 19,
            driver: 'gary-bell',
            driverSecondary: 'shawn-olsen',
            vehicle: 'Merc 228 (2), Toyota 1063 (3)',
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
            firstName: 'Payne',
            lastName: '',
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
            customerName: 'Dr Payne x 1',
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
            customerName: 'Bremner x 1',
            source: 'manual'
        },
        {
            pnr: '8497',
            date: todayStr,
            departDate: todayStr,
            time: '12:15',
            departTime: '12:15',
            firstName: 'Elna',
            lastName: '',
            phone: '0456789012',
            pickupLocation: 'Airport',
            dropoffLocation: 'Ozone',
            passengers: 6,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'pay-on-day',
            price: 152.00,
            rateType: 'RRP',
            customerName: 'Elna x 6',
            source: 'manual'
        },
        {
            pnr: '8502',
            date: todayStr,
            departDate: todayStr,
            time: '12:30',
            departTime: '12:30',
            firstName: 'Marrello',
            lastName: '',
            phone: '0467890123',
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
            customerName: 'Marrello x 1',
            source: 'manual'
        },
        {
            pnr: '8503',
            date: todayStr,
            departDate: todayStr,
            time: '12:30',
            departTime: '12:30',
            firstName: 'Redlick',
            lastName: '',
            phone: '0478901234',
            pickupLocation: 'Airport',
            dropoffLocation: 'Ozone Hotel & Apartments',
            passengers: 2,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'pay-on-day',
            price: 72.00,
            rateType: 'RRP',
            customerName: 'Redlick x 2',
            source: 'manual'
        },
        {
            pnr: '8504',
            date: todayStr,
            departDate: todayStr,
            time: '12:30',
            departTime: '12:30',
            firstName: 'Janice',
            lastName: 'Dianne',
            phone: '0489012345',
            pickupLocation: 'Airport',
            dropoffLocation: 'Ozone Hotel & Apartments',
            passengers: 2,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'pay-on-day',
            price: 72.00,
            rateType: 'RRP',
            customerName: 'Janice & Dianne',
            source: 'manual'
        },
        {
            pnr: '8505',
            date: todayStr,
            departDate: todayStr,
            time: '12:30',
            departTime: '12:30',
            firstName: 'Adriano',
            lastName: 'Fasoli',
            phone: '0490123456',
            pickupLocation: 'Airport',
            dropoffLocation: 'Ozone Hotel & Apartments',
            passengers: 2,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'pay-on-day',
            price: 72.00,
            rateType: 'RRP',
            customerName: 'Adriano Fasoli x 2',
            source: 'manual'
        },
        // Additional transfers to reach 25-30 per day
        {
            pnr: '8506',
            date: todayStr,
            departDate: todayStr,
            time: '13:00',
            departTime: '13:00',
            firstName: 'Williams',
            lastName: 'Family',
            phone: '0412345600',
            pickupLocation: 'Mercure KI Lodge (KIL)',
            dropoffLocation: 'Remarkable Rocks',
            passengers: 4,
            driver: 'shawn-olsen',
            vehicle: 'Merc 228 (2)',
            agent: 'Mercure Kangaroo Island Lodge (KIL)',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'on-account',
            price: 180.00,
            rateType: 'fixed',
            customerName: 'Williams Family x 4',
            source: 'online'
        },
        {
            pnr: '8507',
            date: todayStr,
            departDate: todayStr,
            time: '13:30',
            departTime: '13:30',
            firstName: 'Johnson',
            lastName: 'Mary',
            phone: '0412345601',
            pickupLocation: 'Airport',
            dropoffLocation: 'Lighthouse Suite',
            passengers: 2,
            driver: '',
            vehicle: '',
            agent: 'Direct Booking',
            status: 'pending',
            complete: 'no',
            paymentStatus: 'pay-on-day',
            price: 45.00,
            rateType: 'RRP',
            customerName: 'Johnson, Mary x 2',
            source: 'phone'
        },
        {
            pnr: '8508',
            date: todayStr,
            departDate: todayStr,
            time: '14:00',
            departTime: '14:00',
            firstName: 'Thompson',
            lastName: 'Group',
            phone: '0412345602',
            pickupLocation: 'Penneshaw Wharf',
            dropoffLocation: 'Kangaroo Island Wilderness Retreat',
            passengers: 8,
            driver: 'gary-bell',
            driverSecondary: 'shawn-olsen',
            vehicle: 'Toyota 1063 (3), Merc 228 (2)',
            agent: 'SeaLink Travel Group',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'on-account',
            price: 320.00,
            rateType: 'group',
            customerName: 'Thompson Group x 8',
            source: 'agent'
        },
        {
            pnr: '8509',
            date: todayStr,
            departDate: todayStr,
            time: '14:30',
            departTime: '14:30',
            firstName: 'Anderson',
            lastName: 'Peter',
            phone: '0412345603',
            pickupLocation: 'Ozone Hotel & Apartments',
            dropoffLocation: 'Flinders Chase National Park',
            passengers: 3,
            driver: 'shawn-olsen',
            vehicle: 'Merc 228 (2)',
            agent: 'Booking.com',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'paid',
            price: 165.00,
            rateType: 'private',
            customerName: 'Anderson, Peter x 3',
            source: 'online'
        },
        {
            pnr: '8510',
            date: todayStr,
            departDate: todayStr,
            time: '15:00',
            departTime: '15:00',
            firstName: 'Davis',
            lastName: 'Susan',
            phone: '0412345604',
            pickupLocation: 'Airport',
            dropoffLocation: 'Kingscote',
            passengers: 1,
            driver: '',
            vehicle: '',
            agent: 'Direct Booking',
            status: 'pending',
            complete: 'no',
            paymentStatus: 'pay-on-day',
            price: 28.00,
            rateType: 'RRP',
            customerName: 'Davis, Susan',
            source: 'online'
        },
        {
            pnr: '8511',
            date: todayStr,
            departDate: todayStr,
            time: '15:30',
            departTime: '15:30',
            firstName: 'Brown',
            lastName: 'Family',
            phone: '0412345605',
            pickupLocation: 'Lighthouse Suite',
            dropoffLocation: 'Seal Bay Conservation Park',
            passengers: 5,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            agent: 'Expedia Group',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'on-account',
            price: 195.00,
            rateType: 'fixed',
            customerName: 'Brown Family x 5',
            source: 'phone'
        },
        {
            pnr: '8512',
            date: todayStr,
            departDate: todayStr,
            time: '16:00',
            departTime: '16:00',
            firstName: 'Wilson',
            lastName: 'Robert',
            phone: '0412345606',
            pickupLocation: 'Kangaroo Island Wilderness Retreat',
            dropoffLocation: 'Airport',
            passengers: 2,
            driver: 'shawn-olsen',
            vehicle: 'Merc 228 (2)',
            agent: 'Wilderness Retreat Direct',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'paid',
            price: 89.00,
            rateType: 'private',
            customerName: 'Wilson, Robert x 2',
            source: 'agent'
        },
        {
            pnr: '8513',
            date: todayStr,
            departDate: todayStr,
            time: '17:00',
            departTime: '17:00',
            firstName: 'Miller',
            lastName: 'Group',
            phone: '0412345607',
            pickupLocation: 'Remarkable Rocks',
            dropoffLocation: 'Penneshaw Wharf',
            passengers: 6,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            agent: 'Adventure Tours Australia',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'on-account',
            price: 240.00,
            rateType: 'group',
            customerName: 'Miller Group x 6',
            source: 'online'
        },
        {
            pnr: '8514',
            date: todayStr,
            departDate: todayStr,
            time: '17:30',
            departTime: '17:30',
            firstName: 'Taylor',
            lastName: 'Jennifer',
            phone: '0412345608',
            pickupLocation: 'Seal Bay Conservation Park',
            dropoffLocation: 'Ozone Hotel & Apartments',
            passengers: 3,
            driver: 'shawn-olsen',
            vehicle: 'Merc 228 (2)',
            agent: 'TripAdvisor',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'pay-on-day',
            price: 125.00,
            rateType: 'fixed',
            customerName: 'Taylor, Jennifer x 3',
            source: 'phone'
        },
        {
            pnr: '8515',
            date: todayStr,
            departDate: todayStr,
            time: '18:00',
            departTime: '18:00',
            firstName: 'Moore',
            lastName: 'David',
            phone: '0412345609',
            pickupLocation: 'Flinders Chase National Park',
            dropoffLocation: 'Airport',
            passengers: 4,
            driver: '',
            vehicle: '',
            agent: 'GetYourGuide',
            status: 'pending',
            complete: 'no',
            paymentStatus: 'paid',
            price: 180.00,
            rateType: 'private',
            customerName: 'Moore, David x 4',
            source: 'online'
        },
        {
            pnr: '8516',
            date: todayStr,
            departDate: todayStr,
            time: '18:30',
            departTime: '18:30',
            firstName: 'Jackson',
            lastName: 'Lisa',
            phone: '0412345610',
            pickupLocation: 'Kingscote',
            dropoffLocation: 'Airport',
            passengers: 1,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            agent: 'Direct Booking',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'pay-on-day',
            price: 28.00,
            rateType: 'RRP',
            customerName: 'Jackson, Lisa',
            source: 'phone'
        },
        {
            pnr: '8517',
            date: todayStr,
            departDate: todayStr,
            time: '19:00',
            departTime: '19:00',
            firstName: 'White',
            lastName: 'Family',
            phone: '0412345611',
            pickupLocation: 'Kangaroo Island Wilderness Retreat',
            dropoffLocation: 'Penneshaw Wharf',
            passengers: 7,
            driver: 'shawn-olsen',
            driverSecondary: 'gary-bell',
            vehicle: 'Merc 228 (2), Toyota 1063 (3)',
            agent: 'Wilderness Retreat Direct',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'on-account',
            price: 295.00,
            rateType: 'group',
            customerName: 'White Family x 7',
            source: 'agent'
        },
        {
            pnr: '8518',
            date: todayStr,
            departDate: todayStr,
            time: '19:30',
            departTime: '19:30',
            firstName: 'Harris',
            lastName: 'Michael',
            phone: '0412345612',
            pickupLocation: 'Ozone Hotel & Apartments',
            dropoffLocation: 'Airport',
            passengers: 2,
            driver: '',
            vehicle: '',
            agent: 'Airbnb Experience',
            status: 'pending',
            complete: 'no',
            paymentStatus: 'pay-on-day',
            price: 72.00,
            rateType: 'RRP',
            customerName: 'Harris, Michael x 2',
            source: 'online'
        },
        {
            pnr: '8519',
            date: todayStr,
            departDate: todayStr,
            time: '20:00',
            departTime: '20:00',
            firstName: 'Clark',
            lastName: 'Sarah',
            phone: '0412345613',
            pickupLocation: 'Lighthouse Suite',
            dropoffLocation: 'Airport',
            passengers: 1,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            agent: 'Lighthouse Suite Direct',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'paid',
            price: 45.00,
            rateType: 'private',
            customerName: 'Clark, Sarah',
            source: 'phone'
        },
        // Tomorrow's bookings
        {
            pnr: '8520',
            date: tomorrowStr,
            departDate: tomorrowStr,
            time: '07:00',
            departTime: '07:00',
            firstName: 'Lewis',
            lastName: 'Mark',
            phone: '0412345614',
            pickupLocation: 'Airport',
            dropoffLocation: 'Southern Ocean Lodge',
            passengers: 2,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            agent: 'Southern Ocean Lodge',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'on-account',
            price: 520.00,
            rateType: 'luxury',
            customerName: 'Lewis, Mark x 2',
            source: 'agent'
        },
        {
            pnr: '8521',
            date: tomorrowStr,
            departDate: tomorrowStr,
            time: '08:30',
            departTime: '08:30',
            firstName: 'Walker',
            lastName: 'Family',
            phone: '0412345615',
            pickupLocation: 'Penneshaw Wharf',
            dropoffLocation: 'Flinders Chase National Park',
            passengers: 5,
            driver: 'shawn-olsen',
            vehicle: 'Merc 228 (2)',
            agent: 'SeaLink Travel Group',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'paid',
            price: 225.00,
            rateType: 'group',
            customerName: 'Walker Family x 5',
            source: 'online'
        },
        {
            pnr: '8522',
            date: tomorrowStr,
            departDate: tomorrowStr,
            time: '10:00',
            departTime: '10:00',
            firstName: 'Hall',
            lastName: 'Emma',
            phone: '0412345616',
            pickupLocation: 'Ozone Hotel & Apartments',
            dropoffLocation: 'Remarkable Rocks',
            passengers: 3,
            driver: '',
            vehicle: '',
            agent: 'Viator',
            status: 'pending',
            complete: 'no',
            paymentStatus: 'pay-on-day',
            price: 135.00,
            rateType: 'fixed',
            customerName: 'Hall, Emma x 3',
            source: 'phone'
        },
        {
            pnr: '8523',
            date: tomorrowStr,
            departDate: tomorrowStr,
            time: '11:30',
            departTime: '11:30',
            firstName: 'Young',
            lastName: 'Group',
            phone: '0412345617',
            pickupLocation: 'Airport',
            dropoffLocation: 'Kangaroo Island Wilderness Retreat',
            passengers: 9,
            driver: 'gary-bell',
            driverSecondary: 'shawn-olsen',
            vehicle: 'Toyota 1063 (3), Merc 228 (2)',
            agent: 'Wilderness Retreat Direct',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'on-account',
            price: 380.00,
            rateType: 'group',
            customerName: 'Young Group x 9',
            source: 'agent'
        },
        {
            pnr: '4772',
            date: todayStr,
            departDate: todayStr,
            time: '16:30',
            departTime: '16:30',
            firstName: 'Bankston',
            lastName: '',
            phone: '0401234567',
            pickupLocation: 'Southern Ocean Lodge',
            dropoffLocation: 'Penneshaw Wharf',
            passengers: 2,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            agent: 'ATS Pacific Pty Ltd',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'on-account',
            price: 502.20,
            rateType: 'private',
            customerName: 'Bankston x 2',
            source: 'manual'
        },
        // Additional evening transfers
        {
            pnr: '8520',
            date: todayStr,
            departDate: todayStr,
            time: '20:00',
            departTime: '20:00',
            firstName: 'Clark',
            lastName: 'Sarah',
            phone: '0412345613',
            pickupLocation: 'Lighthouse Suite',
            dropoffLocation: 'Airport',
            passengers: 1,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            agent: 'Lighthouse Suite Direct',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'paid',
            price: 45.00,
            rateType: 'private',
            customerName: 'Clark, Sarah',
            source: 'phone'
        },
        // Tomorrow's bookings
        {
            pnr: '8530',
            date: tomorrowStr,
            departDate: tomorrowStr,
            time: '07:00',
            departTime: '07:00',
            firstName: 'Lewis',
            lastName: 'Mark',
            phone: '0412345614',
            pickupLocation: 'Airport',
            dropoffLocation: 'Southern Ocean Lodge',
            passengers: 2,
            driver: 'gary-bell',
            vehicle: 'Toyota 1063 (3)',
            agent: 'Southern Ocean Lodge',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'on-account',
            price: 520.00,
            rateType: 'luxury',
            customerName: 'Lewis, Mark x 2',
            source: 'agent'
        },
        {
            pnr: '8531',
            date: tomorrowStr,
            departDate: tomorrowStr,
            time: '08:30',
            departTime: '08:30',
            firstName: 'Walker',
            lastName: 'Family',
            phone: '0412345615',
            pickupLocation: 'Penneshaw Wharf',
            dropoffLocation: 'Flinders Chase National Park',
            passengers: 5,
            driver: 'shawn-olsen',
            vehicle: 'Merc 228 (2)',
            agent: 'SeaLink Travel Group',
            status: 'confirmed',
            complete: 'no',
            paymentStatus: 'paid',
            price: 225.00,
            rateType: 'group',
            customerName: 'Walker Family x 5',
            source: 'online'
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
    // Auto-hide header in landscape mode
    let lastScrollTop = 0;
    let scrollTimeout;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const header = document.querySelector('.app-header');

        // Only apply in landscape mode with limited height
        if (window.matchMedia('(orientation: landscape) and (max-height: 600px)').matches) {
            if (currentScroll > lastScrollTop && currentScroll > 50) {
                // Scrolling down - hide header
                header.classList.add('hidden');
            } else {
                // Scrolling up - show header
                header.classList.remove('hidden');
            }

            // Show header after stopping scroll
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                header.classList.remove('hidden');
            }, 2000);
        } else {
            // Remove hidden class in portrait mode
            header.classList.remove('hidden');
        }

        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });

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

    // View toggle buttons (mobile)
    document.getElementById('card-view-btn').addEventListener('click', function() {
        document.getElementById('card-view-btn').classList.add('active');
        document.getElementById('table-view-btn').classList.remove('active');
        document.getElementById('bookings-cards').style.display = 'block';
        document.getElementById('mobile-table').style.display = 'none';
    });

    document.getElementById('table-view-btn').addEventListener('click', function() {
        document.getElementById('table-view-btn').classList.add('active');
        document.getElementById('card-view-btn').classList.remove('active');
        document.getElementById('bookings-cards').style.display = 'none';
        document.getElementById('mobile-table').style.display = 'block';
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

    console.log('Applying filters:', { currentTab, today, tomorrow: tomorrowStr, totalBookings: allBookings.length });

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

    console.log('Filtered bookings:', filteredBookings.length, 'bookings');

    displayBookings();
    updateStats();
}

function displayBookings() {
    console.log('displayBookings called with', filteredBookings.length, 'bookings');

    // Display in table (desktop)
    const tbody = document.getElementById('bookings-tbody');
    tbody.innerHTML = '';

    // Display in cards (mobile)
    const cardsContainer = document.getElementById('bookings-cards');
    cardsContainer.innerHTML = '';

    // Display in mobile table
    const mobileTbody = document.getElementById('mobile-tbody');
    mobileTbody.innerHTML = '';

    if (filteredBookings.length === 0) {
        console.log('No bookings to display');
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

        // Mobile table row
        const mobileRow = createMobileTableRow(booking);
        mobileTbody.appendChild(mobileRow);
    });
}

function createMobileTableRow(booking) {
    const tr = document.createElement('tr');

    // Highlight my jobs
    if (booking.driver === currentDriver) {
        tr.style.backgroundColor = '#f1f8f4';
    }

    const driverName = getDriverName(booking.driver);
    const driverClass = booking.driver ? 'assigned' : 'unassigned';
    const shortPickup = shortenLocation(booking.pickupLocation);
    const shortDropoff = shortenLocation(booking.dropoffLocation);
    const shortAgent = shortenAgent(booking.agent);
    const paymentClass = booking.paymentStatus === 'paid' ? 'payment-paid' :
                         booking.paymentStatus === 'pending' ? 'payment-pending' :
                         'payment-on-account';

    tr.innerHTML = `
        <td class="mobile-time">${booking.time || booking.departTime || 'TBC'}</td>
        <td class="mobile-pnr">${booking.pnr}</td>
        <td class="mobile-customer">${(booking.customerName || `${booking.firstName} ${booking.lastName}`).substring(0, 15)}</td>
        <td class="mobile-route">${shortPickup} → ${shortDropoff}</td>
        <td class="mobile-pax">${booking.passengers}</td>
        <td class="mobile-driver ${driverClass}">${driverName.split(' ')[0]}</td>
        <td class="mobile-agent">${shortAgent}</td>
        <td class="mobile-payment ${paymentClass}">${booking.paymentStatus === 'on-account' ? 'Acc' :
                                                     booking.paymentStatus === 'pay-on-day' ? 'POD' :
                                                     booking.paymentStatus === 'paid' ? 'Paid' : '?'}</td>
        <td class="mobile-price">$${booking.price ? booking.price.toFixed(0) : '0'}</td>
    `;

    tr.addEventListener('click', () => showBookingDetails(booking));

    return tr;
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
        <td>${booking.agent || 'Direct'}</td>
        <td class="${paymentClass}">${formatPaymentStatus(booking.paymentStatus)}</td>
        <td>$${booking.price ? booking.price.toFixed(2) : '0.00'}</td>
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
            <span class="booking-detail" style="color: #007bff;">
                ${shortenAgent(booking.agent)}
            </span>
            <span class="booking-detail" style="color: #2e7d32; font-weight: 600;">
                $${booking.price ? booking.price.toFixed(0) : '0'}
            </span>
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
        'SeaLink Travel Group': 'Sealink',
        'ATS Pacific Pty Ltd': 'ATS',
        'Southern Ocean Lodge': 'SOL',
        'Direct Booking': 'Direct',
        'Booking.com': 'Booking',
        'Expedia Group': 'Expedia',
        'Wilderness Retreat Direct': 'Wilderness',
        'Adventure Tours Australia': 'Adventure',
        'TripAdvisor': 'TripAdv',
        'GetYourGuide': 'GYG',
        'Airbnb Experience': 'Airbnb',
        'Lighthouse Suite Direct': 'Lighthouse',
        'Viator': 'Viator'
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

// Current time removed - users have this on their devices

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