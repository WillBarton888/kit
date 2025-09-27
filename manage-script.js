// Booking Management System JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the management interface
    initializeManagement();

    // Load data
    loadBookings();
    loadDrivers();
    loadVehicles();

    // Load sample data if no bookings exist
    if (bookings.length === 0) {
        console.log('No bookings found, loading sample data...');
        loadSampleData();
        displayBookings();
        displayDrivers();
        displayVehicles();
    }

    updateStats();

    // Set up event listeners
    setupEventListeners();

    // Set up Sample Data button event listener
    const sampleDataBtn = document.getElementById('sample-data-btn');
    if (sampleDataBtn) {
        sampleDataBtn.onclick = () => {
            saveActionSnapshot('sample-data', 'Loaded sample data');
            loadSampleData();
            displayBookings();
            displayDrivers();
            displayVehicles();
            updateStats();
            alert('Sample data loaded! Now you can test the Tax Invoice functionality.\n\n• John Smith (KIT8470) - Has existing invoice\n• Mike Wilson (KIT8472) - Has existing invoice\n• Sarah Jones (KIT8471) - No invoice yet');
        };
    }

    // Set up Undo button event listener
    const undoBtn = document.getElementById('undo-btn');
    console.log('Undo button found:', undoBtn);
    if (undoBtn) {
        undoBtn.onclick = undoLastAction;
        console.log('Undo button event listener set up');
    } else {
        console.error('Undo button not found!');
    }

    // Initialize undo button state
    updateUndoButton();

    // Set current date
    document.getElementById('current-date').textContent =
        new Date().toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

    // Don't set any default date filter - show all bookings by default
    // document.getElementById('date-filter').value = new Date().toISOString().split('T')[0];

    // Set up Emergency Control event listeners (fallback controls)
    const emergencyUndoBtn = document.getElementById('emergency-undo-btn');
    const emergencyRefreshBtn = document.getElementById('emergency-refresh-btn');
    const emergencySampleDataBtn = document.getElementById('emergency-sample-data-btn');
    const emergencyBackupBtn = document.getElementById('emergency-backup-btn');

    if (emergencyUndoBtn) {
        emergencyUndoBtn.onclick = undoLastAction;
        console.log('Emergency undo button event listener set up');
    }

    if (emergencyRefreshBtn) {
        emergencyRefreshBtn.onclick = () => {
            location.reload();
        };
        console.log('Emergency refresh button event listener set up');
    }

    if (emergencySampleDataBtn) {
        emergencySampleDataBtn.onclick = () => {
            loadSampleData();
            displayBookings();
            displayDrivers();
            displayVehicles();
            updateStats();
            alert('Sample data loaded! Emergency controls are working.');
        };
        console.log('Emergency sample data button event listener set up');
    }

    if (emergencyBackupBtn) {
        emergencyBackupBtn.onclick = triggerManualBackup;
        console.log('Emergency backup button event listener set up');
    }

    // Set date in emergency controls
    const emergencyDateElement = document.getElementById('emergency-current-date');
    if (emergencyDateElement) {
        emergencyDateElement.textContent = new Date().toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Set up backup reminders (every 30 minutes)
    setupBackupReminders();
});

// Backup reminder system
function setupBackupReminders() {
    const BACKUP_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds
    let lastBackupReminder = localStorage.getItem('lastBackupReminder');

    if (!lastBackupReminder) {
        lastBackupReminder = Date.now();
        localStorage.setItem('lastBackupReminder', lastBackupReminder);
    }

    // Check if 30 minutes have passed since last reminder
    const timeSinceLastReminder = Date.now() - parseInt(lastBackupReminder);

    if (timeSinceLastReminder >= BACKUP_INTERVAL) {
        showBackupReminder();
    }

    // Set up interval to check every 5 minutes
    setInterval(() => {
        const lastReminder = parseInt(localStorage.getItem('lastBackupReminder') || '0');
        const timeSince = Date.now() - lastReminder;

        if (timeSince >= BACKUP_INTERVAL) {
            showBackupReminder();
        }
    }, 5 * 60 * 1000); // Check every 5 minutes
}

function showBackupReminder() {
    const shouldRemind = confirm('🔄 BACKUP REMINDER\n\nIt\'s been 30+ minutes since your last backup reminder.\n\nWould you like to commit your changes to git now?\n\nClick OK to be reminded again in 30 minutes, or Cancel to skip this reminder.');

    if (shouldRemind) {
        alert('💾 To backup your work:\n\n1. Open a terminal/command prompt\n2. Run: git add .\n3. Run: git commit -m "Your backup message"\n\nYour changes will be safely saved to git history!');
    }

    // Update the last reminder time regardless of choice
    localStorage.setItem('lastBackupReminder', Date.now().toString());
}

// Add manual backup button functionality
function triggerManualBackup() {
    const message = prompt('💾 Manual Backup\n\nEnter a description for this backup:', 'Work in progress backup');

    if (message) {
        alert(`To complete the backup:\n\n1. Open terminal/command prompt\n2. Run: git add .\n3. Run: git commit -m "${message}"\n\nRemember: Claude can help you run these commands if needed!`);

        // Reset backup reminder timer
        localStorage.setItem('lastBackupReminder', Date.now().toString());
    }
}

// Global data storage
let bookings = [];
let drivers = [];
let vehicles = [];
let currentSort = { column: 'datetime', direction: 'asc' };

// Undo system
let actionHistory = [];
const MAX_UNDO_ACTIONS = 10; // Keep last 10 actions

// Action tracking functions
function saveActionSnapshot(actionType, description, affectedIds = []) {
    const snapshot = {
        actionType,
        description,
        timestamp: new Date().toISOString(),
        affectedIds,
        bookingsState: JSON.parse(JSON.stringify(bookings)),
        driversState: JSON.parse(JSON.stringify(drivers)),
        vehiclesState: JSON.parse(JSON.stringify(vehicles))
    };

    actionHistory.push(snapshot);

    // Keep only the last MAX_UNDO_ACTIONS
    if (actionHistory.length > MAX_UNDO_ACTIONS) {
        actionHistory.shift();
    }

    updateUndoButton();
    console.log(`Action saved: ${description}`);
}

function undoLastAction() {
    if (actionHistory.length === 0) {
        alert('No actions to undo');
        return;
    }

    const lastAction = actionHistory.pop();

    // Restore previous state
    bookings = JSON.parse(JSON.stringify(lastAction.bookingsState));
    drivers = JSON.parse(JSON.stringify(lastAction.driversState));
    vehicles = JSON.parse(JSON.stringify(lastAction.vehiclesState));

    // Save to localStorage
    saveToStorage();

    // Refresh displays
    displayBookings();
    displayDrivers();
    displayVehicles();
    updateStats();

    updateUndoButton();

    alert(`✅ Undone: ${lastAction.description}\n\nTimestamp: ${new Date(lastAction.timestamp).toLocaleString('en-AU')}`);
}

function updateUndoButton() {
    const undoBtn = document.getElementById('undo-btn');
    console.log('updateUndoButton - button found:', !!undoBtn, 'actionHistory length:', actionHistory.length);

    if (undoBtn) {
        if (actionHistory.length > 0) {
            const lastAction = actionHistory[actionHistory.length - 1];
            undoBtn.disabled = false;
            undoBtn.style.opacity = '1';
            undoBtn.style.visibility = 'visible';
            undoBtn.title = `Undo: ${lastAction.description}`;
            console.log('Undo button enabled:', lastAction.description);
        } else {
            undoBtn.disabled = true;
            undoBtn.style.opacity = '0.8';  // Make it more visible even when disabled
            undoBtn.style.visibility = 'visible';
            undoBtn.title = 'No actions to undo';
            console.log('Undo button disabled - no actions');
        }
    } else {
        console.error('Undo button not found in updateUndoButton!');
    }

    // Also update emergency undo button
    const emergencyUndoBtn = document.getElementById('emergency-undo-btn');
    if (emergencyUndoBtn) {
        if (actionHistory.length > 0) {
            const lastAction = actionHistory[actionHistory.length - 1];
            emergencyUndoBtn.disabled = false;
            emergencyUndoBtn.style.opacity = '1';
            emergencyUndoBtn.style.background = '#f39c12';
            emergencyUndoBtn.textContent = `🔄 UNDO: ${lastAction.description}`;
            emergencyUndoBtn.title = `Undo: ${lastAction.description}`;
        } else {
            emergencyUndoBtn.disabled = true;
            emergencyUndoBtn.style.opacity = '0.6';
            emergencyUndoBtn.style.background = '#95a5a6';
            emergencyUndoBtn.textContent = '🔄 UNDO (No Actions)';
            emergencyUndoBtn.title = 'No actions to undo';
        }
    }
}

function clearActionHistory() {
    actionHistory = [];
    updateUndoButton();
}

// Sample data for testing - includes bookings with invoice data
function loadSampleData() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    bookings = [
        {
            pnr: 'KIT8470',
            firstName: 'John',
            lastName: 'Smith',
            phone: '0400 123 456',
            email: 'john.smith@email.com',
            pickupLocation: 'kingscote-airport',
            dropoffLocation: 'penneshaw-ferry',
            departDate: todayStr,
            departTime: '14:30',
            passengers: 2,
            serviceType: 'shared',
            customerType: 'personal',
            price: 90.00,
            status: 'confirmed',
            paymentMethod: 'stripe-website',
            paymentStatus: 'paid',
            paymentReference: 'pi_1234567890',
            invoiceNumber: 'INV-001',
            xeroInvoiceId: 'xero-abc123',
            paymentUrl: 'https://go.xero.com/InvoicePayment/12345',
            driver: 'John Driver',
            vehicle: 'Toyota Hiace',
            specialRequirements: 'None'
        },
        {
            pnr: 'KIT8471',
            firstName: 'Sarah',
            lastName: 'Jones',
            phone: '0400 789 012',
            email: 'sarah.jones@email.com',
            pickupLocation: 'penneshaw-ferry',
            dropoffLocation: 'flinders-chase',
            departDate: tomorrowStr,
            departTime: '09:00',
            passengers: 4,
            serviceType: 'private',
            customerType: 'corporate',
            price: 280.00,
            status: 'pending',
            paymentMethod: 'direct-deposit',
            paymentStatus: 'pending',
            specialRequirements: 'Wheelchair accessible vehicle required'
        },
        {
            pnr: 'KIT8472',
            firstName: 'Mike',
            lastName: 'Wilson',
            phone: '0400 345 678',
            email: 'mike.wilson@email.com',
            pickupLocation: 'kingscote-town',
            dropoffLocation: 'kingscote-airport',
            departDate: tomorrowStr,
            departTime: '16:45',
            passengers: 1,
            serviceType: 'shared',
            customerType: 'agent',
            agent: 'exceptional-ki',
            agentReference: 'EKI-2024-001',
            price: 45.00,
            status: 'completed',
            paymentMethod: 'cash',
            paymentStatus: 'paid',
            invoiceNumber: 'INV-002',
            xeroInvoiceId: 'xero-def456',
            paymentUrl: 'https://go.xero.com/InvoicePayment/67890',
            driver: 'Jane Driver',
            vehicle: 'Ford Transit',
            specialRequirements: 'None'
        }
    ];

    drivers = [
        { id: 'john-driver', name: 'John Driver', phone: '0400 111 222', email: 'john@kit.com.au' },
        { id: 'jane-driver', name: 'Jane Driver', phone: '0400 333 444', email: 'jane@kit.com.au' }
    ];

    vehicles = [
        { id: 'hiace-1', make: 'Toyota', model: 'Hiace', capacity: 8, registration: 'KIT001' },
        { id: 'transit-1', make: 'Ford', model: 'Transit', capacity: 12, registration: 'KIT002' }
    ];

    console.log('Sample data loaded:', bookings.length, 'bookings');
}

// Rate tables for price calculation
const airportRates = {
    'kingscote-town': {
        1: { shared: 45.00, nett: 36.00, private: 72.00 },
        2: { shared: 90.00, nett: 72.00, private: 144.00 },
        3: { shared: 110.00, nett: 88.00, private: 176.00 },
        4: { shared: 130.00, nett: 104.00, private: 208.00 },
        5: { shared: 150.00, nett: 120.00, private: 240.00 },
        6: { shared: 170.00, nett: 136.00, private: 272.00 }
    },
    'american-river': {
        2: { shared: 105.00, nett: 84.00, private: 126.00 },
        3: { shared: 125.00, nett: 100.00, private: 150.00 },
        4: { shared: 145.00, nett: 116.00, private: 174.00 },
        5: { shared: 165.00, nett: 132.00, private: 198.00 },
        6: { shared: 185.00, nett: 148.00, private: 222.00 }
    },
    'penneshaw-ferry': {
        2: { shared: 182.00, nett: 145.60, private: 218.40 },
        3: { shared: 202.00, nett: 161.60, private: 242.40 },
        4: { shared: 222.00, nett: 177.60, private: 266.40 },
        5: { shared: 242.00, nett: 193.60, private: 290.40 },
        6: { shared: 262.00, nett: 209.60, private: 314.40 }
    },
    'flinders-chase': {
        2: { shared: 754.00, nett: 603.20, private: 904.80 },
        3: { shared: 774.00, nett: 619.20, private: 928.80 },
        4: { shared: 794.00, nett: 635.20, private: 952.80 },
        5: { shared: 814.00, nett: 651.20, private: 976.80 },
        6: { shared: 834.00, nett: 667.20, private: 1000.80 }
    }
};

const penneshawRates = {
    'kingscote-town': {
        2: { shared: 198.00, nett: 158.40, private: 237.60 },
        3: { shared: 218.00, nett: 174.40, private: 261.60 },
        4: { shared: 238.00, nett: 190.40, private: 285.60 },
        5: { shared: 258.00, nett: 206.40, private: 309.60 },
        6: { shared: 278.00, nett: 222.40, private: 333.60 }
    },
    'american-river': {
        2: { shared: 132.00, nett: 105.60, private: 158.40 },
        3: { shared: 152.00, nett: 121.60, private: 182.40 },
        4: { shared: 172.00, nett: 137.60, private: 206.40 },
        5: { shared: 192.00, nett: 153.60, private: 230.40 },
        6: { shared: 212.00, nett: 169.60, private: 254.40 }
    },
    'flinders-chase': {
        2: { shared: 754.00, nett: 603.20, private: 904.80 },
        3: { shared: 774.00, nett: 619.20, private: 928.80 },
        4: { shared: 794.00, nett: 635.20, private: 952.80 },
        5: { shared: 814.00, nett: 651.20, private: 976.80 },
        6: { shared: 834.00, nett: 667.20, private: 1000.80 }
    }
};

function calculateBookingPrice(pickup, dropoff, passengers, customerType, serviceType, tripType) {
    if (!pickup || !dropoff || !passengers || !serviceType) {
        return 0;
    }

    let rateSheet, destination;

    // Determine rate sheet and destination
    if (pickup === 'kingscote-airport') {
        rateSheet = airportRates;
        destination = dropoff;
    } else if (dropoff === 'kingscote-airport') {
        rateSheet = airportRates;
        destination = pickup;
    } else if (pickup === 'penneshaw-ferry') {
        rateSheet = penneshawRates;
        destination = dropoff;
    } else if (dropoff === 'penneshaw-ferry') {
        rateSheet = penneshawRates;
        destination = pickup;
    } else {
        return 0; // Route not available
    }

    // Validate single passenger booking - only allowed for Airport ↔ Kingscote
    if (passengers === 1 && !(
        (pickup === 'kingscote-airport' && dropoff === 'kingscote-town') ||
        (pickup === 'kingscote-town' && dropoff === 'kingscote-airport')
    )) {
        return 0; // Min 2 PAX for this route
    }

    // Get passenger group (6+ uses 6 rate)
    let paxGroup = passengers;
    if (passengers > 6) paxGroup = 6;

    // Get rate for destination and passenger count
    const destinationRates = rateSheet[destination];
    if (!destinationRates) return 0;
    const rates = destinationRates[paxGroup];
    if (!rates) return 0;

    let price = 0;

    // Apply pricing based on customer type and service type
    if (customerType === 'personal') {
        price = serviceType === 'shared' ? rates.shared : rates.private;
    } else if (customerType === 'agent') {
        if (serviceType === 'shared') {
            price = rates.nett;
        } else {
            price = rates.nett * (rates.private / rates.shared);
        }
    } else if (customerType === 'corporate') {
        price = serviceType === 'shared' ? rates.nett : rates.nett * (rates.private / rates.shared);
    }

    // Apply return trip pricing (only for complete return bookings, not individual legs)
    if (tripType === 'return') {
        price *= 2.0;
    }

    return price;
}

function initializeManagement() {
    // Force reload sample data to get new structure
    // Remove this line once you're happy with the new structure
    localStorage.removeItem('kit-bookings');

    // Load sample data if none exists
    if (!localStorage.getItem('kit-bookings')) {
        loadSampleData();
    }

    // Load data from localStorage
    bookings = JSON.parse(localStorage.getItem('kit-bookings') || '[]');
    drivers = JSON.parse(localStorage.getItem('kit-drivers') || '[]');
    vehicles = JSON.parse(localStorage.getItem('kit-vehicles') || '[]');

    console.log('Loaded bookings:', bookings.length);
    console.log('Sarah Jones bookings:', bookings.filter(b => b.firstName === 'Sarah'));
}

function loadSampleData() {
    // Sample drivers
    const sampleDrivers = [
        {
            id: 'DRV001',
            name: 'John Smith',
            phone: '0412 345 678',
            license: 'ABC123',
            status: 'available',
            vehicle: 'VEH001'
        },
        {
            id: 'DRV002',
            name: 'Sarah Wilson',
            phone: '0423 456 789',
            license: 'DEF456',
            status: 'available',
            vehicle: 'VEH002'
        },
        {
            id: 'DRV003',
            name: 'Mike Johnson',
            phone: '0434 567 890',
            license: 'GHI789',
            status: 'available',
            vehicle: null
        }
    ];

    // Sample vehicles
    const sampleVehicles = [
        {
            id: 'VEH001',
            name: 'Toyota HiAce - White',
            type: 'van',
            capacity: 8,
            registration: 'KIT001',
            status: 'available'
        },
        {
            id: 'VEH002',
            name: 'Ford Transit - Blue',
            type: 'van',
            capacity: 6,
            registration: 'KIT002',
            status: 'available'
        },
        {
            id: 'VEH003',
            name: 'Holden Commodore - Silver',
            type: 'sedan',
            capacity: 4,
            registration: 'KIT003',
            status: 'maintenance'
        }
    ];

    // Sample bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sampleBookings = [
        {
            pnr: 'KIT8470',
            customerType: 'personal',
            firstName: 'John',
            lastName: 'Smith',
            phone: '0400123456',
            email: 'john.smith@email.com',
            tripType: 'one-way',
            serviceType: 'shared',
            pickupLocation: 'kingscote-airport',
            dropoffLocation: 'kingscote-town',
            departDate: today.toISOString().split('T')[0],
            departTime: '14:30',
            passengers: 2,
            price: 90.00,
            status: 'confirmed',
            driver: 'DRV001',
            vehicle: 'VEH001',
            paymentMethod: 'stripe-website',
            paymentStatus: 'paid',
            paymentReference: 'pi_1234567890',
            created: today.toISOString()
        },
        {
            pnr: 'KIT8471-1',
            reservationId: 'RES8471',
            legNumber: 1,
            customerType: 'agent',
            firstName: 'Sarah',
            lastName: 'Jones',
            phone: '0412345678',
            email: 'sarah.jones@email.com',
            tripType: 'return',
            serviceType: 'private',
            pickupLocation: 'penneshaw-ferry',
            dropoffLocation: 'flinders-chase',
            departDate: tomorrow.toISOString().split('T')[0],
            departTime: '09:00',
            passengers: 4,
            price: 754.00, // Half the total price
            status: 'pending',
            driver: null,
            vehicle: null,
            paymentMethod: null,
            paymentStatus: 'pending',
            paymentReference: null,
            created: today.toISOString()
        },
        {
            pnr: 'KIT8471-2',
            reservationId: 'RES8471',
            legNumber: 2,
            customerType: 'agent',
            firstName: 'Sarah',
            lastName: 'Jones',
            phone: '0412345678',
            email: 'sarah.jones@email.com',
            tripType: 'return',
            serviceType: 'private',
            pickupLocation: 'flinders-chase',
            dropoffLocation: 'penneshaw-ferry',
            departDate: tomorrow.toISOString().split('T')[0],
            departTime: '16:00',
            passengers: 4,
            price: 754.00, // Half the total price
            status: 'pending',
            driver: null,
            vehicle: null,
            paymentMethod: null,
            paymentStatus: 'pending',
            paymentReference: null,
            created: today.toISOString()
        },
        {
            pnr: 'KIT8472',
            customerType: 'corporate',
            firstName: 'Mike',
            lastName: 'Wilson',
            phone: '0401234567',
            email: 'mike.wilson@email.com',
            tripType: 'one-way',
            serviceType: 'shared',
            pickupLocation: 'kingscote-town',
            dropoffLocation: 'american-river',
            departDate: today.toISOString().split('T')[0],
            departTime: '16:45',
            passengers: 3,
            price: 158.60,
            status: 'allocated',
            driver: 'DRV002',
            vehicle: 'VEH002',
            paymentMethod: 'square-driver',
            paymentStatus: 'pending',
            paymentReference: 'SQ_REF_789',
            created: today.toISOString()
        }
    ];

    // Save sample data
    localStorage.setItem('kit-bookings', JSON.stringify(sampleBookings));
    localStorage.setItem('kit-drivers', JSON.stringify(sampleDrivers));
    localStorage.setItem('kit-vehicles', JSON.stringify(sampleVehicles));
}

function setupEventListeners() {
    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', function() {
        loadBookings();
        updateStats();
    });

    // Table header sorting
    setupTableSorting();

    // Filter changes
    document.getElementById('date-filter').addEventListener('change', filterBookings);
    document.getElementById('status-filter').addEventListener('change', filterBookings);
    document.getElementById('driver-filter').addEventListener('change', filterBookings);
    document.getElementById('payment-filter').addEventListener('change', filterBookings);

    // Search
    document.getElementById('search-btn').addEventListener('click', filterBookings);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterBookings();
        }
    });

    // View toggles
    document.getElementById('list-view-btn').addEventListener('click', function() {
        showView('list');
    });
    document.getElementById('schedule-view-btn').addEventListener('click', function() {
        showView('schedule');
    });

    // Resource tabs
    document.getElementById('drivers-tab').addEventListener('click', function() {
        showResourceTab('drivers');
    });
    document.getElementById('vehicles-tab').addEventListener('click', function() {
        showResourceTab('vehicles');
    });

    // Add resource buttons
    document.getElementById('add-driver-btn').addEventListener('click', function() {
        showResourceModal('driver');
    });
    document.getElementById('add-vehicle-btn').addEventListener('click', function() {
        showResourceModal('vehicle');
    });

    // Modal close buttons
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('resource-modal-close').addEventListener('click', closeResourceModal);
    document.getElementById('resource-modal-cancel').addEventListener('click', closeResourceModal);
    document.getElementById('email-modal-close').addEventListener('click', closeEmailModal);
    document.getElementById('email-modal-cancel').addEventListener('click', closeEmailModal);

    // Modal save buttons
    document.getElementById('modal-save').addEventListener('click', saveBookingChanges);
    document.getElementById('resource-modal-save').addEventListener('click', saveResource);
    document.getElementById('send-email-btn').addEventListener('click', sendEmailFromPreview);

    // Email modal additional buttons
    document.getElementById('view-invoice-details').addEventListener('click', toggleInvoiceDetails);
}

function loadBookings() {
    bookings = JSON.parse(localStorage.getItem('kit-bookings') || '[]');

    // Also check for new bookings from staff interface
    const staffBookings = JSON.parse(localStorage.getItem('staff-bookings') || '[]');

    // Merge any new staff bookings
    staffBookings.forEach(staffBooking => {
        if (!bookings.find(b => b.pnr === staffBooking.pnr)) {
            bookings.push({
                ...staffBooking,
                status: 'pending',
                driver: null,
                vehicle: null,
                created: new Date().toISOString()
            });
        }
    });

    // Save merged bookings
    localStorage.setItem('kit-bookings', JSON.stringify(bookings));

    // Initialize sort indicators
    updateSortIndicators();

    displayBookings();
}

function loadDrivers() {
    drivers = JSON.parse(localStorage.getItem('kit-drivers') || '[]');
    displayDrivers();
    populateDriverFilter();
}

function loadVehicles() {
    vehicles = JSON.parse(localStorage.getItem('kit-vehicles') || '[]');
    displayVehicles();
}

function displayBookings(filteredBookings = null) {
    let bookingsToShow = filteredBookings || bookings;
    console.log('DisplayBookings called with:', bookingsToShow.length, 'bookings');
    console.log('Sarah Jones bookings in display:', bookingsToShow.filter(b => b.firstName === 'Sarah').map(b => ({pnr: b.pnr, status: b.status})));

    // Sort bookings (make sure we don't mutate original)
    bookingsToShow = sortBookings([...bookingsToShow]);

    const tableBody = document.getElementById('booking-table-body');

    if (bookingsToShow.length === 0) {
        tableBody.innerHTML = '<div class="no-bookings">No bookings found</div>';
        return;
    }

    tableBody.innerHTML = bookingsToShow.map(booking => {
        const driverOptions = drivers.map(driver =>
            `<option value="${driver.id}" ${booking.driver === driver.id ? 'selected' : ''}>${driver.name}</option>`
        ).join('');

        const vehicleOptions = vehicles.filter(v => v.status === 'available').map(vehicle =>
            `<option value="${vehicle.id}" ${booking.vehicle === vehicle.id ? 'selected' : ''}>${vehicle.name}</option>`
        ).join('');

        return `
            <div class="booking-row ${booking.legNumber ? 'leg-booking' : ''}" data-pnr="${booking.pnr}">
                <div class="booking-pnr">${booking.pnr}${booking.legNumber ? `<br><small class="leg-indicator">LEG ${booking.legNumber}</small>` : ''}</div>
                <div class="booking-customer">${booking.firstName} ${booking.lastName}${booking.reservationId ? `<br><small class="reservation-id">${booking.reservationId}</small>` : ''}</div>
                <div class="booking-route">${getLocationName(booking.pickupLocation)} → ${getLocationName(booking.dropoffLocation)}</div>
                <div class="booking-datetime">${formatDate(booking.departDate)} ${booking.departTime}</div>
                <div class="booking-pax">${booking.passengers}</div>
                <div class="booking-price">$${booking.price.toFixed(2)}</div>
                <div class="booking-status status-${booking.status}">${getStatusDisplay(booking)}</div>
                <div class="booking-payment">${getPaymentDisplay(booking)}</div>
                <div class="booking-driver">
                    <select class="driver-select" onchange="assignDriver('${booking.pnr}', this.value)">
                        <option value="">Unassigned</option>
                        ${driverOptions}
                    </select>
                </div>
                <div class="booking-vehicle">
                    <select class="vehicle-select" onchange="assignVehicle('${booking.pnr}', this.value)">
                        <option value="">Unassigned</option>
                        ${vehicleOptions}
                    </select>
                </div>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="editBooking('${booking.pnr}')">Edit</button>
                    ${getInvoiceButtons(booking)}
                    <button class="action-btn btn-delete" onclick="deleteBooking('${booking.pnr}')">Del</button>
                </div>
            </div>
        `;
    }).join('');

    // Add click handlers for booking rows
    document.querySelectorAll('.booking-row').forEach(row => {
        row.addEventListener('click', function(e) {
            if (!e.target.classList.contains('driver-select') &&
                !e.target.classList.contains('vehicle-select') &&
                !e.target.classList.contains('action-btn')) {
                const pnr = this.dataset.pnr;
                showBookingDetails(pnr, true); // Enable edit mode
            }
        });
    });
}

function displayDrivers() {
    const driversList = document.getElementById('drivers-list');

    if (drivers.length === 0) {
        driversList.innerHTML = '<div class="no-resources">No drivers added</div>';
        return;
    }

    driversList.innerHTML = drivers.map(driver => {
        const vehicle = vehicles.find(v => v.id === driver.vehicle);
        return `
            <div class="resource-item ${driver.status}" data-id="${driver.id}">
                <div class="resource-name">${driver.name}</div>
                <div class="resource-details">
                    📱 ${driver.phone}<br>
                    🆔 ${driver.license}<br>
                    🚗 ${vehicle ? vehicle.name : 'No vehicle assigned'}<br>
                    📊 ${driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                </div>
            </div>
        `;
    }).join('');
}

function displayVehicles() {
    const vehiclesList = document.getElementById('vehicles-list');

    if (vehicles.length === 0) {
        vehiclesList.innerHTML = '<div class="no-resources">No vehicles added</div>';
        return;
    }

    vehiclesList.innerHTML = vehicles.map(vehicle => {
        const driver = drivers.find(d => d.vehicle === vehicle.id);
        return `
            <div class="resource-item ${vehicle.status}" data-id="${vehicle.id}">
                <div class="resource-name">${vehicle.name}</div>
                <div class="resource-details">
                    🎯 ${vehicle.registration}<br>
                    👥 ${vehicle.capacity} passengers<br>
                    🚗 ${driver ? `Driver: ${driver.name}` : 'No driver assigned'}<br>
                    📊 ${vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                </div>
            </div>
        `;
    }).join('');
}

function populateDriverFilter() {
    const driverFilter = document.getElementById('driver-filter');
    const currentValue = driverFilter.value;

    driverFilter.innerHTML = `
        <option value="">All Drivers</option>
        <option value="unassigned">Unassigned</option>
        ${drivers.map(driver =>
            `<option value="${driver.id}">${driver.name}</option>`
        ).join('')}
    `;

    driverFilter.value = currentValue;
}

function filterBookings() {
    const filtered = getCurrentFilteredBookings();
    displayBookings(filtered);
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];

    // Today's bookings
    const todayBookings = bookings.filter(b => b.departDate === today);
    document.getElementById('today-bookings').textContent = todayBookings.length;

    // Pending bookings
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    document.getElementById('pending-bookings').textContent = pendingBookings.length;

    // Confirmed bookings
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'allocated');
    document.getElementById('confirmed-bookings').textContent = confirmedBookings.length;

    // Payments pending
    const paymentsPending = bookings.filter(b => (b.paymentStatus || 'pending') === 'pending');
    document.getElementById('payments-pending').textContent = paymentsPending.length;
}

function assignDriver(pnr, driverId) {
    const booking = bookings.find(b => b.pnr === pnr);
    if (booking) {
        // Save action for undo
        const driverName = driverId ? drivers.find(d => d.id === driverId)?.name || driverId : 'None';
        saveActionSnapshot('assign-driver', `Assigned driver "${driverName}" to booking ${pnr}`, [pnr]);

        booking.driver = driverId || null;
        if (driverId && booking.status === 'pending') {
            booking.status = 'allocated';
        }
        saveBookings();
        updateStats();
    }
}

function assignVehicle(pnr, vehicleId) {
    const booking = bookings.find(b => b.pnr === pnr);
    if (booking) {
        // Save action for undo
        const vehicleName = vehicleId ? vehicles.find(v => v.id === vehicleId)?.make || vehicleId : 'None';
        saveActionSnapshot('assign-vehicle', `Assigned vehicle "${vehicleName}" to booking ${pnr}`, [pnr]);

        booking.vehicle = vehicleId || null;
        saveBookings();
    }
}

function editBooking(pnr) {
    const booking = bookings.find(b => b.pnr === pnr);
    if (booking) {
        showBookingDetails(pnr, true);
    }
}

function deleteBooking(pnr) {
    const booking = bookings.find(b => b.pnr === pnr);
    if (!booking) return;

    if (confirm(`Are you sure you want to delete booking ${pnr}?`)) {
        // Save action for undo
        saveActionSnapshot('delete-booking', `Deleted booking ${pnr} (${booking.firstName} ${booking.lastName})`, [pnr]);

        bookings = bookings.filter(b => b.pnr !== pnr);
        saveBookings();
        loadBookings();
        updateStats();
    }
}

function showBookingDetails(pnr, editMode = false) {
    const booking = bookings.find(b => b.pnr === pnr);
    if (!booking) return;

    const modal = document.getElementById('booking-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = editMode ? `Edit Booking ${pnr}` : `Booking Details - ${pnr}`;

    modalBody.innerHTML = `
        <div class="booking-details">
            <div class="form-row">
                <div class="form-field">
                    <label>Status</label>
                    <select id="edit-status" ${editMode ? '' : 'disabled'}>
                        <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="allocated" ${booking.status === 'allocated' ? 'selected' : ''}>Allocated</option>
                        <option value="in-progress" ${booking.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
                <div class="form-field">
                    <label>Customer Type</label>
                    <select id="edit-customer-type" ${editMode ? '' : 'disabled'}>
                        <option value="personal" ${booking.customerType === 'personal' ? 'selected' : ''}>Personal</option>
                        <option value="agent" ${booking.customerType === 'agent' ? 'selected' : ''}>Agent</option>
                        <option value="corporate" ${booking.customerType === 'corporate' ? 'selected' : ''}>Corporate</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-field">
                    <label>First Name</label>
                    <input type="text" id="edit-first-name" value="${booking.firstName || ''}" ${editMode ? '' : 'disabled'}>
                </div>
                <div class="form-field">
                    <label>Last Name</label>
                    <input type="text" id="edit-last-name" value="${booking.lastName || ''}" ${editMode ? '' : 'disabled'}>
                </div>
            </div>

            <div class="form-row">
                <div class="form-field">
                    <label>Phone</label>
                    <input type="tel" id="edit-phone" value="${booking.phone || ''}" ${editMode ? '' : 'disabled'}>
                </div>
                <div class="form-field">
                    <label>Email</label>
                    <input type="email" id="edit-email" value="${booking.email || ''}" ${editMode ? '' : 'disabled'}>
                </div>
            </div>

            <div class="form-row">
                <div class="form-field">
                    <label>Pickup Location</label>
                    <select id="edit-pickup" ${editMode ? '' : 'disabled'}>
                        <option value="kingscote-airport" ${booking.pickupLocation === 'kingscote-airport' ? 'selected' : ''}>Kingscote Airport</option>
                        <option value="penneshaw-ferry" ${booking.pickupLocation === 'penneshaw-ferry' ? 'selected' : ''}>Penneshaw Ferry</option>
                        <option value="kingscote-town" ${booking.pickupLocation === 'kingscote-town' ? 'selected' : ''}>Kingscote Town</option>
                        <option value="american-river" ${booking.pickupLocation === 'american-river' ? 'selected' : ''}>American River</option>
                        <option value="emu-bay" ${booking.pickupLocation === 'emu-bay' ? 'selected' : ''}>Emu Bay</option>
                        <option value="parndana" ${booking.pickupLocation === 'parndana' ? 'selected' : ''}>Parndana</option>
                        <option value="vivonne-bay" ${booking.pickupLocation === 'vivonne-bay' ? 'selected' : ''}>Vivonne Bay</option>
                        <option value="flinders-chase" ${booking.pickupLocation === 'flinders-chase' ? 'selected' : ''}>Flinders Chase</option>
                        <option value="remarkable-rocks" ${booking.pickupLocation === 'remarkable-rocks' ? 'selected' : ''}>Remarkable Rocks</option>
                        <option value="admirals-arch" ${booking.pickupLocation === 'admirals-arch' ? 'selected' : ''}>Admirals Arch</option>
                    </select>
                </div>
                <div class="form-field">
                    <label>Drop-off Location</label>
                    <select id="edit-dropoff" ${editMode ? '' : 'disabled'}>
                        <option value="kingscote-airport" ${booking.dropoffLocation === 'kingscote-airport' ? 'selected' : ''}>Kingscote Airport</option>
                        <option value="penneshaw-ferry" ${booking.dropoffLocation === 'penneshaw-ferry' ? 'selected' : ''}>Penneshaw Ferry</option>
                        <option value="kingscote-town" ${booking.dropoffLocation === 'kingscote-town' ? 'selected' : ''}>Kingscote Town</option>
                        <option value="american-river" ${booking.dropoffLocation === 'american-river' ? 'selected' : ''}>American River</option>
                        <option value="emu-bay" ${booking.dropoffLocation === 'emu-bay' ? 'selected' : ''}>Emu Bay</option>
                        <option value="parndana" ${booking.dropoffLocation === 'parndana' ? 'selected' : ''}>Parndana</option>
                        <option value="vivonne-bay" ${booking.dropoffLocation === 'vivonne-bay' ? 'selected' : ''}>Vivonne Bay</option>
                        <option value="flinders-chase" ${booking.dropoffLocation === 'flinders-chase' ? 'selected' : ''}>Flinders Chase</option>
                        <option value="remarkable-rocks" ${booking.dropoffLocation === 'remarkable-rocks' ? 'selected' : ''}>Remarkable Rocks</option>
                        <option value="admirals-arch" ${booking.dropoffLocation === 'admirals-arch' ? 'selected' : ''}>Admirals Arch</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-field">
                    <label>Departure Date</label>
                    <input type="date" id="edit-depart-date" value="${booking.departDate || ''}" ${editMode ? '' : 'disabled'}>
                </div>
                <div class="form-field">
                    <label>Departure Time</label>
                    <input type="time" id="edit-depart-time" value="${booking.departTime || ''}" ${editMode ? '' : 'disabled'}>
                </div>
            </div>

            <div class="form-row">
                <div class="form-field">
                    <label>Passengers</label>
                    <select id="edit-passengers" ${editMode ? '' : 'disabled'}>
                        <option value="1" ${booking.passengers == 1 ? 'selected' : ''}>1</option>
                        <option value="2" ${booking.passengers == 2 ? 'selected' : ''}>2</option>
                        <option value="3" ${booking.passengers == 3 ? 'selected' : ''}>3</option>
                        <option value="4" ${booking.passengers == 4 ? 'selected' : ''}>4</option>
                        <option value="5" ${booking.passengers == 5 ? 'selected' : ''}>5</option>
                        <option value="6" ${booking.passengers == 6 ? 'selected' : ''}>6</option>
                        <option value="7" ${booking.passengers == 7 ? 'selected' : ''}>7</option>
                        <option value="8" ${booking.passengers >= 8 ? 'selected' : ''}>8+</option>
                    </select>
                </div>
                <div class="form-field">
                    <label>Service Type</label>
                    <select id="edit-service-type" ${editMode ? '' : 'disabled'}>
                        <option value="shared" ${booking.serviceType === 'shared' ? 'selected' : ''}>Shared</option>
                        <option value="private" ${booking.serviceType === 'private' ? 'selected' : ''}>Private</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-field">
                    <label>Trip Type</label>
                    <select id="edit-trip-type" ${editMode ? '' : 'disabled'}>
                        <option value="one-way" ${booking.tripType === 'one-way' ? 'selected' : ''}>One Way</option>
                        <option value="return" ${booking.tripType === 'return' ? 'selected' : ''}>Return</option>
                    </select>
                </div>
                <div class="form-field">
                    <label>Current Price</label>
                    <input type="text" id="edit-price" value="${booking.price ? booking.price.toFixed(2) : '0.00'}" ${editMode ? '' : 'disabled'}>
                </div>
            </div>

            ${booking.tripType === 'return' ? `
            <div class="form-row" id="return-fields">
                <div class="form-field">
                    <label>Return Date</label>
                    <input type="date" id="edit-return-date" value="${booking.returnDate || ''}" ${editMode ? '' : 'disabled'}>
                </div>
                <div class="form-field">
                    <label>Return Time</label>
                    <input type="time" id="edit-return-time" value="${booking.returnTime || ''}" ${editMode ? '' : 'disabled'}>
                </div>
            </div>
            <div class="form-row" id="leg-status-fields">
                <div class="form-field">
                    <label>Outbound Status</label>
                    <select id="edit-outbound-status" ${editMode ? '' : 'disabled'}>
                        <option value="pending" ${(booking.outboundStatus || 'pending') === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${(booking.outboundStatus || 'pending') === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="in-progress" ${(booking.outboundStatus || 'pending') === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${(booking.outboundStatus || 'pending') === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${(booking.outboundStatus || 'pending') === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
                <div class="form-field">
                    <label>Return Status</label>
                    <select id="edit-return-status" ${editMode ? '' : 'disabled'}>
                        <option value="pending" ${(booking.returnStatus || 'pending') === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${(booking.returnStatus || 'pending') === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="in-progress" ${(booking.returnStatus || 'pending') === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${(booking.returnStatus || 'pending') === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${(booking.returnStatus || 'pending') === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            </div>
            ` : ''}

            <div class="form-field">
                <label>Special Requirements</label>
                <textarea id="edit-special-requirements" rows="3" ${editMode ? '' : 'disabled'}>${booking.specialRequirements || ''}</textarea>
            </div>

            <div class="form-row">
                <div class="form-field">
                    <label>Payment Method</label>
                    <select id="edit-payment-method" ${editMode ? '' : 'disabled'}>
                        <option value="" ${!booking.paymentMethod ? 'selected' : ''}>Not Set</option>
                        <option value="cash" ${booking.paymentMethod === 'cash' ? 'selected' : ''}>Cash</option>
                        <option value="stripe-website" ${booking.paymentMethod === 'stripe-website' ? 'selected' : ''}>Stripe (Website)</option>
                        <option value="square-driver" ${booking.paymentMethod === 'square-driver' ? 'selected' : ''}>Square (Driver)</option>
                        <option value="stripe-xero" ${booking.paymentMethod === 'stripe-xero' ? 'selected' : ''}>Stripe (Xero)</option>
                        <option value="direct-deposit" ${booking.paymentMethod === 'direct-deposit' ? 'selected' : ''}>Direct Deposit</option>
                    </select>
                </div>
                <div class="form-field">
                    <label>Payment Status</label>
                    <select id="edit-payment-status" ${editMode ? '' : 'disabled'}>
                        <option value="pending" ${(booking.paymentStatus || 'pending') === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="paid" ${booking.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
                        <option value="failed" ${booking.paymentStatus === 'failed' ? 'selected' : ''}>Failed</option>
                        <option value="refunded" ${booking.paymentStatus === 'refunded' ? 'selected' : ''}>Refunded</option>
                    </select>
                </div>
            </div>

            <div class="form-field">
                <label>Payment Reference</label>
                <input type="text" id="edit-payment-reference" value="${booking.paymentReference || ''}" placeholder="Transaction ID, receipt number, etc." ${editMode ? '' : 'disabled'}>
            </div>

            ${booking.agent ? `
            <div class="form-row">
                <div class="form-field">
                    <label>Agent</label>
                    <input type="text" value="${booking.agent}" disabled>
                </div>
                <div class="form-field">
                    <label>Agent Reference</label>
                    <input type="text" id="edit-agent-ref" value="${booking.agentReference || ''}" ${editMode ? '' : 'disabled'}>
                </div>
            </div>
            ` : ''}
        </div>
    `;

    // Store current booking PNR for saving
    modal.dataset.pnr = pnr;
    modal.dataset.editMode = editMode;

    // Show/hide save button
    document.getElementById('modal-save').style.display = editMode ? 'block' : 'none';

    // Add price calculation event listeners if in edit mode
    if (editMode) {
        const fieldsToWatch = [
            'edit-pickup',
            'edit-dropoff',
            'edit-passengers',
            'edit-customer-type',
            'edit-service-type',
            'edit-trip-type'
        ];

        fieldsToWatch.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('change', updateBookingPrice);
                console.log(`Added price listener to ${fieldId}`);
            } else {
                console.log(`Field ${fieldId} not found`);
            }
        });

        // Add listeners for leg status changes
        const legStatusFields = ['edit-outbound-status', 'edit-return-status'];
        legStatusFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('change', function() {
                    // Get current booking for status update
                    const pnr = modal.dataset.pnr;
                    const booking = bookings.find(b => b.pnr === pnr);
                    if (booking) {
                        booking.outboundStatus = document.getElementById('edit-outbound-status')?.value || 'pending';
                        booking.returnStatus = document.getElementById('edit-return-status')?.value || 'pending';
                        updateMainStatusFromLegs(booking);
                    }
                });
                console.log(`Added leg status listener to ${fieldId}`);
            }
        });

        // Calculate initial price when modal opens
        setTimeout(updateBookingPrice, 100); // Small delay to ensure DOM is ready
    }

    modal.style.display = 'flex';
}

function updateMainStatusFromLegs(booking) {
    if (booking.tripType !== 'return') return;

    const outbound = booking.outboundStatus || 'pending';
    const returnLeg = booking.returnStatus || 'pending';

    // Logic for agents: Only mark as completed when BOTH legs are completed
    if (booking.customerType === 'agent') {
        if (outbound === 'completed' && returnLeg === 'completed') {
            booking.status = 'completed'; // Ready for invoicing
        } else if (outbound === 'cancelled' || returnLeg === 'cancelled') {
            booking.status = 'cancelled';
        } else if (outbound === 'in-progress' || returnLeg === 'in-progress') {
            booking.status = 'in-progress';
        } else if (outbound === 'confirmed' || returnLeg === 'confirmed') {
            booking.status = 'confirmed';
        } else {
            booking.status = 'pending';
        }
    } else {
        // For personal/corporate: Use the most advanced status
        const statuses = [outbound, returnLeg];
        if (statuses.includes('completed')) {
            booking.status = 'completed';
        } else if (statuses.includes('cancelled')) {
            booking.status = 'cancelled';
        } else if (statuses.includes('in-progress')) {
            booking.status = 'in-progress';
        } else if (statuses.includes('confirmed')) {
            booking.status = 'confirmed';
        } else {
            booking.status = 'pending';
        }
    }

    // Update the main status dropdown in the modal
    const statusSelect = document.getElementById('edit-status');
    if (statusSelect) {
        statusSelect.value = booking.status;
    }
}

function getStatusDisplay(booking) {
    // For new leg-based structure
    if (booking.reservationId) {
        // Check if both legs of this reservation are completed
        const reservationBookings = bookings.filter(b => b.reservationId === booking.reservationId);

        if (booking.customerType === 'agent') {
            const allCompleted = reservationBookings.length === 2 &&
                               reservationBookings.every(b => b.status === 'completed');

            if (allCompleted) {
                return `${booking.status} 📄`; // Invoice ready indicator
            }
        }

        // Show just the individual leg status for new structure
        return booking.status;
    }

    // For legacy return trip structure (if any remain)
    if (booking.tripType === 'return' && (booking.outboundStatus || booking.returnStatus)) {
        const outbound = booking.outboundStatus || 'pending';
        const returnLeg = booking.returnStatus || 'pending';

        if (booking.customerType === 'agent' && outbound === 'completed' && returnLeg === 'completed') {
            return `${booking.status} 📄`;
        }

        return `${booking.status}<br><small>Out: ${outbound}<br>Ret: ${returnLeg}</small>`;
    }

    return booking.status;
}

function getPaymentDisplay(booking) {
    const paymentStatus = booking.paymentStatus || 'pending';
    const paymentMethod = booking.paymentMethod;

    let methodDisplay = '';
    if (paymentMethod) {
        const methodNames = {
            'cash': 'Cash',
            'stripe-website': 'Stripe Web',
            'square-driver': 'Square',
            'stripe-xero': 'Stripe Xero',
            'direct-deposit': 'Direct Deposit'
        };
        methodDisplay = `<div class="payment-method">${methodNames[paymentMethod] || paymentMethod}</div>`;
    }

    return `<div class="payment-status payment-${paymentStatus}">${paymentStatus}</div>${methodDisplay}`;
}

function isLastLegOfReservation(booking) {
    if (!booking.reservationId || !booking.legNumber) return false;

    // Find all legs for this reservation
    const reservationLegs = bookings.filter(b => b.reservationId === booking.reservationId);

    // Find the highest leg number
    const maxLegNumber = Math.max(...reservationLegs.map(leg => leg.legNumber || 0));

    // Return true if this booking is the final leg
    return booking.legNumber === maxLegNumber;
}

function shouldShowInvoiceButton(booking) {
    // Show invoice button for:
    // 1. Single trip bookings (no reservationId)
    // 2. Final leg of multi-leg reservations
    if (!booking.reservationId) {
        return true; // Single trip booking
    } else {
        return isLastLegOfReservation(booking); // Multi-leg reservation
    }
}

function getInvoiceButtons(booking) {
    const shouldShow = shouldShowInvoiceButton(booking);
    if (!shouldShow) return '';

    const isAgent = booking.customerType === 'agent';
    const isCompleted = booking.reservationId ?
        checkReservationCompleted(booking.reservationId) :
        booking.status === 'completed';

    let buttons = [];

    if (isAgent) {
        // Agent bookings get three invoice options
        if (isCompleted) {
            // Standard invoice when completed
            buttons.push(`<button class="action-btn btn-invoice" onclick="${booking.reservationId ? `generateInvoiceByReservation('${booking.reservationId}')` : `generateInvoiceForSingleBooking('${booking.pnr}')`}" style="background: #27ae60; color: white;">Invoice</button>`);
            // Email invoice option when completed
            buttons.push(`<button class="action-btn btn-email-invoice" onclick="${booking.reservationId ? `emailInvoiceByReservation('${booking.reservationId}')` : `emailInvoiceForSingleBooking('${booking.pnr}')`}" style="background: #3498db; color: white;" title="Email Invoice">📧</button>`);
            // Tax Invoice view option when completed
            buttons.push(`<button class="action-btn btn-tax-invoice" onclick="${booking.reservationId ? `viewTaxInvoiceByReservation('${booking.reservationId}')` : `viewTaxInvoiceForSingleBooking('${booking.pnr}')`}" style="background: #9b59b6; color: white;" title="View Tax Invoice">📄</button>`);
        } else {
            // Immediate invoice option for pending bookings
            buttons.push(`<button class="action-btn btn-invoice" onclick="${booking.reservationId ? `generateImmediateInvoiceByReservation('${booking.reservationId}')` : `generateImmediateInvoiceForSingleBooking('${booking.pnr}')`}" style="background: #f39c12; color: white; font-size: 10px;">Invoice Now</button>`);
            // Email immediate invoice option for pending bookings
            buttons.push(`<button class="action-btn btn-email-invoice" onclick="${booking.reservationId ? `emailImmediateInvoiceByReservation('${booking.reservationId}')` : `emailImmediateInvoiceForSingleBooking('${booking.pnr}')`}" style="background: #3498db; color: white;" title="Email Invoice Now">📧</button>`);
            // Tax Invoice view option for pending bookings
            buttons.push(`<button class="action-btn btn-tax-invoice" onclick="${booking.reservationId ? `viewImmediateTaxInvoiceByReservation('${booking.reservationId}')` : `viewImmediateTaxInvoiceForSingleBooking('${booking.pnr}')`}" style="background: #9b59b6; color: white;" title="View Tax Invoice">📄</button>`);
        }
    } else {
        // Personal/Corporate can always invoice
        buttons.push(`<button class="action-btn btn-invoice" onclick="${booking.reservationId ? `generateInvoiceByReservation('${booking.reservationId}')` : `generateInvoiceForSingleBooking('${booking.pnr}')`}" style="background: #27ae60; color: white;">Invoice</button>`);
        // Email invoice option for personal/corporate
        buttons.push(`<button class="action-btn btn-email-invoice" onclick="${booking.reservationId ? `emailInvoiceByReservation('${booking.reservationId}')` : `emailInvoiceForSingleBooking('${booking.pnr}')`}" style="background: #3498db; color: white;" title="Email Invoice">📧</button>`);
        // Tax Invoice view option for personal/corporate
        buttons.push(`<button class="action-btn btn-tax-invoice" onclick="${booking.reservationId ? `viewTaxInvoiceByReservation('${booking.reservationId}')` : `viewTaxInvoiceForSingleBooking('${booking.pnr}')`}" style="background: #9b59b6; color: white;" title="View Tax Invoice">📄</button>`);
    }

    return buttons.join('');
}

function checkReservationCompleted(reservationId) {
    const reservationLegs = bookings.filter(b => b.reservationId === reservationId);
    return reservationLegs.length > 0 && reservationLegs.every(leg => leg.status === 'completed');
}

// Australian Business Details - MUST BE CONFIGURED FOR COMPLIANCE
const AUSTRALIAN_BUSINESS_DETAILS = {
    name: 'Kangaroo Island Transfers',
    abn: '12 345 678 901', // REPLACE WITH ACTUAL ABN
    address: {
        street: '123 Main Street',
        city: 'Kingscote',
        state: 'SA',
        postcode: '5223',
        country: 'Australia'
    },
    phone: '(08) 8553 2390',
    email: 'info@kangarooislandtransfers.com.au',
    gstRegistered: true // Set to false if not GST registered
};

// GST Rate for Australia
const GST_RATE = 0.10; // 10%

function calculateGST(amount, isGSTInclusive = true) {
    if (!AUSTRALIAN_BUSINESS_DETAILS.gstRegistered) {
        return {
            gstAmount: 0,
            netAmount: amount,
            grossAmount: amount,
            gstRate: 0
        };
    }

    let gstAmount, netAmount, grossAmount;

    if (isGSTInclusive) {
        // Current prices are GST-inclusive
        grossAmount = amount;
        gstAmount = amount * GST_RATE / (1 + GST_RATE);
        netAmount = amount - gstAmount;
    } else {
        // GST-exclusive pricing
        netAmount = amount;
        gstAmount = amount * GST_RATE;
        grossAmount = amount + gstAmount;
    }

    return {
        gstAmount: Math.round(gstAmount * 100) / 100,
        netAmount: Math.round(netAmount * 100) / 100,
        grossAmount: Math.round(grossAmount * 100) / 100,
        gstRate: GST_RATE
    };
}

// Xero Integration Functions
async function createXeroInvoice(invoiceData) {
    // This is a placeholder for Xero API integration
    // In production, this would call Xero API to create the invoice

    console.log('Creating Australian-compliant invoice in Xero:', invoiceData);

    // Calculate GST for compliance
    const gstCalculation = calculateGST(invoiceData.totalAmount, true);

    // Prepare Australian-compliant invoice data for Xero
    const australianInvoiceData = {
        ...invoiceData,
        businessDetails: AUSTRALIAN_BUSINESS_DETAILS,
        gstCalculation: gstCalculation,
        currencyCode: 'AUD',
        invoiceType: 'TAX_INVOICE', // Australian requirement
        lineItems: invoiceData.legs || [{
            description: `Passenger Transport Service: ${invoiceData.route || 'Transfer Service'}`,
            date: invoiceData.date,
            time: invoiceData.time,
            passengers: invoiceData.passengers,
            unitPrice: gstCalculation.netAmount,
            gstAmount: gstCalculation.gstAmount,
            totalAmount: gstCalculation.grossAmount
        }]
    };

    // Simulate Xero API response with realistic data
    const xeroInvoiceNumber = generateXeroInvoiceNumber();
    const paymentUrl = `https://go.xero.com/InvoicePayment/PayInvoice.aspx?id=${generatePaymentId()}`;

    const xeroResponse = {
        invoiceId: generateXeroId(),
        invoiceNumber: xeroInvoiceNumber,
        onlineInvoiceUrl: paymentUrl,
        status: 'DRAFT',
        total: gstCalculation.grossAmount,
        netTotal: gstCalculation.netAmount,
        gstTotal: gstCalculation.gstAmount,
        currencyCode: 'AUD',
        reference: invoiceData.reference || '',
        brandingThemeId: null,
        australianCompliant: true
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Australian-compliant Xero invoice created:', xeroResponse);
    return xeroResponse;
}

async function markXeroInvoiceSent(xeroInvoiceId) {
    console.log(`Marking Xero invoice ${xeroInvoiceId} as sent`);
    // Simulate API call to mark invoice as sent
    await new Promise(resolve => setTimeout(resolve, 300));
    return { status: 'SENT' };
}

function generateXeroInvoiceNumber() {
    // Generate realistic Xero invoice number
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${timestamp}`;
}

function generateXeroId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generatePaymentId() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

function storeInvoiceInBookings(invoiceData, type) {
    if (type === 'reservation') {
        // Store invoice info in all legs of the reservation
        const reservationBookings = bookings.filter(b => b.reservationId === invoiceData.reservationId);
        reservationBookings.forEach(booking => {
            booking.invoiceNumber = invoiceData.invoiceNumber;
            booking.xeroInvoiceId = invoiceData.xeroInvoiceId;
            booking.paymentUrl = invoiceData.paymentUrl;
            booking.invoiceType = invoiceData.invoiceType || 'standard';
            booking.invoiceDate = invoiceData.generatedDate;
        });
    } else if (type === 'single') {
        // Store invoice info in the single booking
        const booking = bookings.find(b => b.pnr === invoiceData.bookingPnr);
        if (booking) {
            booking.invoiceNumber = invoiceData.invoiceNumber;
            booking.xeroInvoiceId = invoiceData.xeroInvoiceId;
            booking.paymentUrl = invoiceData.paymentUrl;
            booking.invoiceType = invoiceData.invoiceType || 'standard';
            booking.invoiceDate = invoiceData.generatedDate;
        }
    }

    // Save updated bookings
    saveBookings();
}

function getExistingInvoice(bookingIdentifier, type) {
    if (type === 'reservation') {
        // Check if any booking in the reservation already has an invoice
        const reservationBookings = bookings.filter(b => b.reservationId === bookingIdentifier);
        const bookingWithInvoice = reservationBookings.find(b => b.invoiceNumber);

        if (bookingWithInvoice) {
            return {
                invoiceNumber: bookingWithInvoice.invoiceNumber,
                xeroInvoiceId: bookingWithInvoice.xeroInvoiceId,
                paymentUrl: bookingWithInvoice.paymentUrl,
                invoiceType: bookingWithInvoice.invoiceType || 'standard',
                generatedDate: bookingWithInvoice.invoiceDate
            };
        }
    } else if (type === 'single') {
        // Check if the single booking already has an invoice
        const booking = bookings.find(b => b.pnr === bookingIdentifier);

        if (booking && booking.invoiceNumber) {
            return {
                invoiceNumber: booking.invoiceNumber,
                xeroInvoiceId: booking.xeroInvoiceId,
                paymentUrl: booking.paymentUrl,
                invoiceType: booking.invoiceType || 'standard',
                generatedDate: booking.invoiceDate
            };
        }
    }

    return null;
}

async function buildInvoiceDataFromExisting(existingInvoice, identifier, type) {
    // Build complete invoice data from existing invoice and current booking data
    if (type.includes('reservation')) {
        const reservation = getReservationForInvoicing(identifier);
        if (!reservation) return null;

        return {
            invoiceNumber: existingInvoice.invoiceNumber,
            xeroInvoiceId: existingInvoice.xeroInvoiceId,
            paymentUrl: existingInvoice.paymentUrl,
            reservationId: reservation.reservationId,
            customerName: reservation.customerName,
            customerEmail: reservation.customerEmail,
            customerType: reservation.customerType,
            totalAmount: reservation.totalPrice,
            legs: reservation.legs.map(leg => ({
                pnr: leg.pnr,
                legNumber: leg.legNumber,
                route: `${getLocationName(leg.pickupLocation)} → ${getLocationName(leg.dropoffLocation)}`,
                date: leg.departDate,
                time: leg.departTime,
                passengers: leg.passengers,
                price: leg.price,
                status: leg.status,
                paymentMethod: leg.paymentMethod,
                paymentStatus: leg.paymentStatus,
                paymentReference: leg.paymentReference
            })),
            paymentSummary: getReservationPaymentSummary(reservation),
            invoiceType: existingInvoice.invoiceType,
            generatedDate: existingInvoice.generatedDate,
            xeroStatus: 'DRAFT' // Default status
        };
    } else {
        // Single booking
        const booking = bookings.find(b => b.pnr === identifier);
        if (!booking) return null;

        return {
            invoiceNumber: existingInvoice.invoiceNumber,
            xeroInvoiceId: existingInvoice.xeroInvoiceId,
            paymentUrl: existingInvoice.paymentUrl,
            bookingPnr: identifier,
            customerName: `${booking.firstName} ${booking.lastName}`,
            customerEmail: booking.email,
            customerType: booking.customerType,
            totalAmount: booking.price,
            route: `${getLocationName(booking.pickupLocation)} → ${getLocationName(booking.dropoffLocation)}`,
            date: booking.departDate,
            time: booking.departTime,
            passengers: booking.passengers,
            serviceType: booking.serviceType,
            status: booking.status,
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus,
            paymentReference: booking.paymentReference,
            invoiceType: existingInvoice.invoiceType,
            generatedDate: existingInvoice.generatedDate,
            xeroStatus: 'DRAFT' // Default status
        };
    }
}

function getReservationForInvoicing(reservationId) {
    // Get all legs for this reservation
    const reservationLegs = bookings.filter(b => b.reservationId === reservationId);

    if (reservationLegs.length === 0) return null;

    // Check if all legs are completed (for agent invoicing)
    const allCompleted = reservationLegs.every(leg => leg.status === 'completed');
    const isAgent = reservationLegs[0].customerType === 'agent';

    return {
        reservationId: reservationId,
        customerType: reservationLegs[0].customerType,
        customerName: `${reservationLegs[0].firstName} ${reservationLegs[0].lastName}`,
        customerPhone: reservationLegs[0].phone,
        customerEmail: reservationLegs[0].email,
        legs: reservationLegs,
        totalPrice: reservationLegs.reduce((sum, leg) => sum + leg.price, 0),
        readyForInvoice: isAgent ? allCompleted : true, // Agents need all legs completed
        legCount: reservationLegs.length
    };
}

async function generateInvoiceByReservation(reservationId) {
    const reservation = getReservationForInvoicing(reservationId);

    if (!reservation) {
        alert('Reservation not found');
        return;
    }

    if (!reservation.readyForInvoice) {
        alert('All legs must be completed before invoicing agent bookings');
        return;
    }

    // Check for existing invoice first
    const existingInvoiceData = getExistingInvoiceForReservation(reservationId);
    if (existingInvoiceData) {
        alert(`✅ Invoice already exists!\n\nInvoice Number: ${existingInvoiceData.invoiceNumber}\nTotal: $${existingInvoiceData.totalAmount.toFixed(2)}\n\nUse the 📧 Email or 📄 Tax Invoice buttons to view or send the existing invoice.`);
        return existingInvoiceData;
    }

    // Show loading message
    const loadingAlert = alert('Creating invoice in Xero... Please wait.');

    try {
        // Prepare invoice data for Xero
        const xeroInvoiceData = {
            type: 'reservation',
            reservationId: reservation.reservationId,
            customerName: reservation.customerName,
            customerEmail: reservation.customerEmail,
            customerType: reservation.customerType,
            totalAmount: reservation.totalPrice,
            legs: reservation.legs,
            reference: `Reservation ${reservationId}`
        };

        // Create invoice in Xero first
        const xeroResponse = await createXeroInvoice(xeroInvoiceData);

        // Calculate GST for Australian compliance
        const gstCalculation = calculateGST(reservation.totalPrice, true);

        // Build complete invoice data with Xero details and Australian compliance
        const invoiceData = {
            invoiceNumber: xeroResponse.invoiceNumber,
            xeroInvoiceId: xeroResponse.invoiceId,
            paymentUrl: xeroResponse.onlineInvoiceUrl,
            reservationId: reservation.reservationId,
            customerName: reservation.customerName,
            customerEmail: reservation.customerEmail,
            customerType: reservation.customerType,
            totalAmount: reservation.totalPrice,
            netAmount: gstCalculation.netAmount,
            gstAmount: gstCalculation.gstAmount,
            gstRate: gstCalculation.gstRate,
            businessDetails: AUSTRALIAN_BUSINESS_DETAILS,
            legs: reservation.legs.map(leg => {
                const legGST = calculateGST(leg.price, true);
                return {
                    pnr: leg.pnr,
                    legNumber: leg.legNumber,
                    route: `${getLocationName(leg.pickupLocation)} → ${getLocationName(leg.dropoffLocation)}`,
                    date: leg.departDate,
                    time: leg.departTime,
                    passengers: leg.passengers,
                    price: leg.price,
                    netPrice: legGST.netAmount,
                    gstPrice: legGST.gstAmount,
                    status: leg.status,
                    paymentMethod: leg.paymentMethod,
                    paymentStatus: leg.paymentStatus,
                    paymentReference: leg.paymentReference,
                    description: `Passenger Transport Service: ${getLocationName(leg.pickupLocation)} to ${getLocationName(leg.dropoffLocation)}`
                };
            }),
            paymentSummary: getReservationPaymentSummary(reservation),
            generatedDate: new Date().toISOString(),
            xeroStatus: xeroResponse.status,
            isAustralianCompliant: true
        };

        console.log('Invoice generated with Xero integration:', invoiceData);

        // Store invoice details in booking records for future reference
        storeInvoiceInBookings(invoiceData, 'reservation');

        alert(`✅ Invoice ${invoiceData.invoiceNumber} created in Xero!\n\nCustomer: ${reservation.customerName}\nTotal: $${reservation.totalPrice.toFixed(2)}\nLegs: ${reservation.legCount}\n\nPayment Link: ${xeroResponse.onlineInvoiceUrl}`);

        return invoiceData;

    } catch (error) {
        console.error('Error creating Xero invoice:', error);
        alert('❌ Error creating invoice in Xero. Please try again or check your Xero connection.');
        return null;
    }
}

async function generateInvoiceForSingleBooking(pnr) {
    const booking = bookings.find(b => b.pnr === pnr);

    if (!booking) {
        alert('Booking not found');
        return;
    }

    // For agents, check if booking is completed
    if (booking.customerType === 'agent' && booking.status !== 'completed') {
        alert('Booking must be completed before invoicing agent bookings');
        return;
    }

    // Check for existing invoice first
    const existingInvoiceData = getExistingInvoiceForBooking(pnr);
    if (existingInvoiceData) {
        alert(`✅ Invoice already exists!\n\nInvoice Number: ${existingInvoiceData.invoiceNumber}\nTotal: $${existingInvoiceData.totalAmount.toFixed(2)}\n\nUse the 📧 Email or 📄 Tax Invoice buttons to view or send the existing invoice.`);
        return existingInvoiceData;
    }

    // Show loading message
    alert('Creating invoice in Xero... Please wait.');

    try {
        // Prepare invoice data for Xero
        const xeroInvoiceData = {
            type: 'single',
            bookingPnr: pnr,
            customerName: `${booking.firstName} ${booking.lastName}`,
            customerEmail: booking.email,
            customerType: booking.customerType,
            totalAmount: booking.price,
            route: `${getLocationName(booking.pickupLocation)} → ${getLocationName(booking.dropoffLocation)}`,
            date: booking.departDate,
            time: booking.departTime,
            passengers: booking.passengers,
            reference: `Booking ${pnr}`
        };

        // Create invoice in Xero first
        const xeroResponse = await createXeroInvoice(xeroInvoiceData);

        // Calculate GST for Australian compliance
        const gstCalculation = calculateGST(booking.price, true);

        // Invoice data structure for single booking with Xero details and Australian compliance
        const invoiceData = {
            invoiceNumber: xeroResponse.invoiceNumber,
            xeroInvoiceId: xeroResponse.invoiceId,
            paymentUrl: xeroResponse.onlineInvoiceUrl,
            bookingPnr: pnr,
            customerName: `${booking.firstName} ${booking.lastName}`,
            customerEmail: booking.email,
            customerType: booking.customerType,
            totalAmount: booking.price,
            netAmount: gstCalculation.netAmount,
            gstAmount: gstCalculation.gstAmount,
            gstRate: gstCalculation.gstRate,
            businessDetails: AUSTRALIAN_BUSINESS_DETAILS,
            route: `${getLocationName(booking.pickupLocation)} → ${getLocationName(booking.dropoffLocation)}`,
            date: booking.departDate,
            time: booking.departTime,
            passengers: booking.passengers,
            serviceType: booking.serviceType,
            status: booking.status,
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus,
            paymentReference: booking.paymentReference,
            description: `Passenger Transport Service: ${getLocationName(booking.pickupLocation)} to ${getLocationName(booking.dropoffLocation)}`,
            generatedDate: new Date().toISOString(),
            xeroStatus: xeroResponse.status,
            isAustralianCompliant: true
        };

        console.log('Single booking invoice generated with Xero:', invoiceData);

        // Store invoice details in booking records for future reference
        storeInvoiceInBookings(invoiceData, 'single');

        alert(`✅ Invoice ${invoiceData.invoiceNumber} created in Xero!\n\nCustomer: ${invoiceData.customerName}\nRoute: ${invoiceData.route}\nTotal: $${invoiceData.totalAmount.toFixed(2)}\n\nPayment Link: ${xeroResponse.onlineInvoiceUrl}`);

        return invoiceData;

    } catch (error) {
        console.error('Error creating Xero invoice:', error);
        alert('❌ Error creating invoice in Xero. Please try again or check your Xero connection.');
        return null;
    }
}

async function generateImmediateInvoiceByReservation(reservationId) {
    const reservation = getReservationForInvoicing(reservationId);

    if (!reservation) {
        alert('Reservation not found');
        return;
    }

    // Show loading message
    alert('Creating immediate invoice in Xero... Please wait.');

    try {
        // Prepare immediate invoice data for Xero
        const xeroInvoiceData = {
            type: 'immediate-reservation',
            reservationId: reservation.reservationId,
            customerName: reservation.customerName,
            customerEmail: reservation.customerEmail,
            customerType: reservation.customerType,
            totalAmount: reservation.totalPrice,
            legs: reservation.legs,
            reference: `Advance Invoice - Reservation ${reservationId}`,
            note: 'Services pending completion'
        };

        // Create immediate invoice in Xero
        const xeroResponse = await createXeroInvoice(xeroInvoiceData);

        // Force allow immediate invoicing for agents
        const invoiceData = {
            invoiceNumber: xeroResponse.invoiceNumber,
            xeroInvoiceId: xeroResponse.invoiceId,
            paymentUrl: xeroResponse.onlineInvoiceUrl,
            reservationId: reservation.reservationId,
            customerName: reservation.customerName,
            customerEmail: reservation.customerEmail,
            customerType: reservation.customerType,
            totalAmount: reservation.totalPrice,
            legs: reservation.legs.map(leg => ({
                pnr: leg.pnr,
                legNumber: leg.legNumber,
                route: `${getLocationName(leg.pickupLocation)} → ${getLocationName(leg.dropoffLocation)}`,
                date: leg.departDate,
                time: leg.departTime,
                passengers: leg.passengers,
                price: leg.price,
                status: leg.status,
                paymentMethod: leg.paymentMethod,
                paymentStatus: leg.paymentStatus,
                paymentReference: leg.paymentReference
            })),
            paymentSummary: getReservationPaymentSummary(reservation),
            invoiceType: 'IMMEDIATE',
            note: 'Invoice generated at booking time - services pending',
            generatedDate: new Date().toISOString(),
            xeroStatus: xeroResponse.status
        };

        console.log('Immediate invoice generated for reservation with Xero:', invoiceData);

        alert(`✅ IMMEDIATE Invoice ${invoiceData.invoiceNumber} created in Xero!\n\nCustomer: ${reservation.customerName}\nTotal: $${reservation.totalPrice.toFixed(2)}\nLegs: ${reservation.legCount}\n\nPayment Link: ${xeroResponse.onlineInvoiceUrl}\n\nNote: Services are still pending completion`);

        return invoiceData;

    } catch (error) {
        console.error('Error creating immediate Xero invoice:', error);
        alert('❌ Error creating immediate invoice in Xero. Please try again or check your Xero connection.');
        return null;
    }
}

async function generateImmediateInvoiceForSingleBooking(pnr) {
    const booking = bookings.find(b => b.pnr === pnr);

    if (!booking) {
        alert('Booking not found');
        return;
    }

    // Show loading message
    alert('Creating immediate invoice in Xero... Please wait.');

    try {
        // Prepare immediate invoice data for Xero
        const xeroInvoiceData = {
            type: 'immediate-single',
            bookingPnr: pnr,
            customerName: `${booking.firstName} ${booking.lastName}`,
            customerEmail: booking.email,
            customerType: booking.customerType,
            totalAmount: booking.price,
            route: `${getLocationName(booking.pickupLocation)} → ${getLocationName(booking.dropoffLocation)}`,
            date: booking.departDate,
            time: booking.departTime,
            passengers: booking.passengers,
            reference: `Advance Invoice - Booking ${pnr}`,
            note: 'Service pending completion'
        };

        // Create immediate invoice in Xero
        const xeroResponse = await createXeroInvoice(xeroInvoiceData);

        // Force allow immediate invoicing for agents
        const invoiceData = {
            invoiceNumber: xeroResponse.invoiceNumber,
            xeroInvoiceId: xeroResponse.invoiceId,
            paymentUrl: xeroResponse.onlineInvoiceUrl,
            bookingPnr: pnr,
            customerName: `${booking.firstName} ${booking.lastName}`,
            customerEmail: booking.email,
            customerType: booking.customerType,
            totalAmount: booking.price,
            route: `${getLocationName(booking.pickupLocation)} → ${getLocationName(booking.dropoffLocation)}`,
            date: booking.departDate,
            time: booking.departTime,
            passengers: booking.passengers,
            serviceType: booking.serviceType,
            status: booking.status,
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus,
            paymentReference: booking.paymentReference,
            invoiceType: 'IMMEDIATE',
            note: 'Invoice generated at booking time - service pending',
            generatedDate: new Date().toISOString(),
            xeroStatus: xeroResponse.status
        };

        console.log('Immediate single booking invoice generated with Xero:', invoiceData);

        alert(`✅ IMMEDIATE Invoice ${invoiceData.invoiceNumber} created in Xero!\n\nCustomer: ${invoiceData.customerName}\nRoute: ${invoiceData.route}\nTotal: $${invoiceData.totalAmount.toFixed(2)}\n\nPayment Link: ${xeroResponse.onlineInvoiceUrl}\n\nNote: Service is still pending completion`);

        return invoiceData;

    } catch (error) {
        console.error('Error creating immediate Xero invoice:', error);
        alert('❌ Error creating immediate invoice in Xero. Please try again or check your Xero connection.');
        return null;
    }
}

function getReservationPaymentSummary(reservation) {
    const paymentMethods = {};
    const paymentStatuses = {};
    let totalPaid = 0;
    let totalPending = 0;

    reservation.legs.forEach(leg => {
        // Count payment methods
        if (leg.paymentMethod) {
            paymentMethods[leg.paymentMethod] = (paymentMethods[leg.paymentMethod] || 0) + 1;
        }

        // Count payment statuses and amounts
        const status = leg.paymentStatus || 'pending';
        paymentStatuses[status] = (paymentStatuses[status] || 0) + 1;

        if (status === 'paid') {
            totalPaid += leg.price || 0;
        } else {
            totalPending += leg.price || 0;
        }
    });

    return {
        paymentMethods: paymentMethods,
        paymentStatuses: paymentStatuses,
        totalPaid: totalPaid,
        totalPending: totalPending,
        totalAmount: reservation.totalPrice,
        paymentComplete: totalPending === 0
    };
}

// Email Invoice Functions
async function emailInvoiceByReservation(reservationId) {
    console.log('emailInvoiceByReservation called for:', reservationId);

    // Check if invoice already exists using the correct function
    let invoiceData = getExistingInvoiceForReservation(reservationId);

    if (invoiceData) {
        console.log('Using existing invoice for email:', invoiceData.invoiceNumber);
        showEmailPreview(invoiceData, 'reservation');
    } else {
        console.log('No existing invoice found, creating new one');
        // Create new invoice
        invoiceData = await generateInvoiceByReservation(reservationId);
        if (invoiceData) {
            showEmailPreview(invoiceData, 'reservation');
        }
    }
}

async function emailInvoiceForSingleBooking(pnr) {
    console.log('emailInvoiceForSingleBooking called for:', pnr);

    // Check if invoice already exists using the correct function
    let invoiceData = getExistingInvoiceForBooking(pnr);

    if (invoiceData) {
        console.log('Using existing invoice for email:', invoiceData.invoiceNumber);
        showEmailPreview(invoiceData, 'single');
    } else {
        console.log('No existing invoice found, creating new one');
        // Create new invoice
        invoiceData = await generateInvoiceForSingleBooking(pnr);
        if (invoiceData) {
            showEmailPreview(invoiceData, 'single');
        }
    }
}

async function emailImmediateInvoiceByReservation(reservationId) {
    // Check if immediate invoice already exists
    const existingInvoice = getExistingInvoice(reservationId, 'reservation');

    let invoiceData;
    if (existingInvoice && existingInvoice.invoiceType === 'IMMEDIATE') {
        console.log('Using existing immediate invoice for email:', existingInvoice);
        invoiceData = await buildInvoiceDataFromExisting(existingInvoice, reservationId, 'immediate-reservation');
    } else if (existingInvoice) {
        alert('⚠️ A standard invoice already exists for this reservation. Cannot create immediate invoice.');
        return;
    } else {
        // Create new immediate invoice
        invoiceData = await generateImmediateInvoiceByReservation(reservationId);
    }

    if (invoiceData) {
        showEmailPreview(invoiceData, 'immediate-reservation');
    }
}

async function emailImmediateInvoiceForSingleBooking(pnr) {
    // Check if immediate invoice already exists
    const existingInvoice = getExistingInvoice(pnr, 'single');

    let invoiceData;
    if (existingInvoice && existingInvoice.invoiceType === 'IMMEDIATE') {
        console.log('Using existing immediate invoice for email:', existingInvoice);
        invoiceData = await buildInvoiceDataFromExisting(existingInvoice, pnr, 'immediate-single');
    } else if (existingInvoice) {
        alert('⚠️ A standard invoice already exists for this booking. Cannot create immediate invoice.');
        return;
    } else {
        // Create new immediate invoice
        invoiceData = await generateImmediateInvoiceForSingleBooking(pnr);
    }

    if (invoiceData) {
        showEmailPreview(invoiceData, 'immediate-single');
    }
}

function showEmailPreview(invoiceData, type) {
    // Get customer email and details
    let customerEmail = '';
    let customerName = '';

    if (type.includes('reservation')) {
        // For reservation invoices, get email from first leg
        const firstLeg = invoiceData.legs[0];
        customerEmail = firstLeg?.email || '';
        customerName = invoiceData.customerName;
    } else {
        // For single booking invoices
        const booking = bookings.find(b => b.pnr === invoiceData.bookingPnr);
        customerEmail = booking?.email || '';
        customerName = invoiceData.customerName;
    }

    // Generate email content
    const emailContent = generateEmailContent(invoiceData, type);

    // Populate modal
    document.getElementById('email-to').value = customerEmail;
    document.getElementById('email-subject').value = emailContent.subject;
    document.getElementById('email-body').value = emailContent.body;

    // Create invoice summary
    const invoiceSummary = createInvoiceSummary(invoiceData, type);
    document.getElementById('invoice-summary').innerHTML = invoiceSummary;

    // Store invoice data for sending
    const modal = document.getElementById('email-preview-modal');
    modal.dataset.invoiceData = JSON.stringify(invoiceData);
    modal.dataset.emailType = type;

    // Show full invoice details
    document.getElementById('invoice-json').textContent = JSON.stringify(invoiceData, null, 2);

    // Show modal
    modal.style.display = 'flex';
}

function generateEmailContent(invoiceData, type) {
    const isImmediate = type.includes('immediate');
    const isReservation = type.includes('reservation');

    // Australian Tax Invoice compliance - subject line must include "TAX INVOICE"
    let subject = `TAX INVOICE ${invoiceData.invoiceNumber} - Kangaroo Island Transfers`;
    if (isImmediate) {
        subject = `TAX INVOICE ${invoiceData.invoiceNumber} (Advance) - Kangaroo Island Transfers`;
    }

    let body = `Dear ${invoiceData.customerName},\n\n`;

    if (isImmediate) {
        body += `Thank you for booking with Kangaroo Island Transfers. Please find your advance Tax Invoice attached.\n\n`;
        body += `Please note: This Tax Invoice is issued in advance of service completion.\n\n`;
    } else {
        body += `Thank you for choosing Kangaroo Island Transfers. Please find your Tax Invoice attached.\n\n`;
    }

    // Australian Tax Invoice Header - Required by ATO
    body += `========================\n`;
    body += `         TAX INVOICE\n`;
    body += `========================\n\n`;

    // Australian Business Details - Mandatory for GST compliance
    body += `${AUSTRALIAN_BUSINESS_DETAILS.name}\n`;
    body += `ABN: ${AUSTRALIAN_BUSINESS_DETAILS.abn}\n`;
    body += `${AUSTRALIAN_BUSINESS_DETAILS.address.street}\n`;
    body += `${AUSTRALIAN_BUSINESS_DETAILS.address.city}, ${AUSTRALIAN_BUSINESS_DETAILS.address.state} ${AUSTRALIAN_BUSINESS_DETAILS.address.postcode}\n`;
    body += `Phone: ${AUSTRALIAN_BUSINESS_DETAILS.phone}\n`;
    body += `Email: ${AUSTRALIAN_BUSINESS_DETAILS.email}\n\n`;

    body += `Invoice Details:\n`;
    body += `Invoice Number: ${invoiceData.invoiceNumber}\n`;
    body += `Invoice Date: ${new Date(invoiceData.generatedDate).toLocaleDateString('en-AU')}\n`;
    body += `Total Amount (GST Inclusive): $${invoiceData.totalAmount.toFixed(2)}\n\n`;

    // Add payment information based on status
    if (invoiceData.paymentStatus === 'paid') {
        body += `✅ PAYMENT COMPLETE\n`;
        body += `This invoice has been paid in full.\n`;
        if (invoiceData.paymentMethod) {
            body += `Payment method: ${getPaymentMethodName(invoiceData.paymentMethod)}\n`;
        }
        body += `\n`;
    } else if (invoiceData.paymentUrl) {
        body += `💳 PAY YOUR INVOICE ONLINE:\n`;
        body += `${invoiceData.paymentUrl}\n\n`;
        body += `Click the link above to pay securely with credit card or bank transfer.\n`;
        body += `You will receive an automatic receipt upon payment completion.\n\n`;
    }

    // Service Details Section
    body += `Service Details:\n`;
    body += `--------------\n`;
    if (isReservation) {
        body += `Reservation: ${invoiceData.reservationId}\n`;
        body += `Number of Transfers: ${invoiceData.legs.length}\n\n`;
        invoiceData.legs.forEach((leg, index) => {
            body += `${index + 1}. Passenger Transport Service\n`;
            body += `   Route: ${leg.route}\n`;
            body += `   Date: ${leg.date} at ${leg.time}\n`;
            body += `   Passengers: ${leg.passengers}\n`;
            body += `   Net Amount: $${leg.netPrice ? leg.netPrice.toFixed(2) : (leg.price / 1.1).toFixed(2)}\n`;
            body += `   GST (10%): $${leg.gstPrice ? leg.gstPrice.toFixed(2) : (leg.price - leg.price / 1.1).toFixed(2)}\n`;
            body += `   Total (GST Inc): $${leg.price.toFixed(2)}\n\n`;
        });
    } else {
        body += `Passenger Transport Service\n`;
        body += `Route: ${invoiceData.route}\n`;
        body += `Date: ${invoiceData.date} at ${invoiceData.time}\n`;
        body += `Passengers: ${invoiceData.passengers}\n\n`;
    }

    // Payment information
    if (invoiceData.paymentMethod || invoiceData.paymentStatus) {
        body += `\nPayment Status: ${invoiceData.paymentStatus || 'pending'}`;
        if (invoiceData.paymentMethod) {
            const methodNames = {
                'cash': 'Cash',
                'stripe-website': 'Credit Card (Online)',
                'square-driver': 'Credit Card (Driver)',
                'stripe-xero': 'Credit Card (Xero)',
                'direct-deposit': 'Bank Transfer'
            };
            body += ` via ${methodNames[invoiceData.paymentMethod] || invoiceData.paymentMethod}`;
        }
        body += `\n`;
    }

    // Australian GST Summary - Required for Tax Invoices
    body += `\n========================\n`;
    body += `      PAYMENT SUMMARY\n`;
    body += `========================\n`;
    if (invoiceData.netAmount && invoiceData.gstAmount) {
        body += `Net Amount: $${invoiceData.netAmount.toFixed(2)}\n`;
        body += `GST (10%): $${invoiceData.gstAmount.toFixed(2)}\n`;
        body += `Total Amount: $${invoiceData.totalAmount.toFixed(2)}\n\n`;
    } else {
        // Calculate GST if not provided (backward compatibility)
        const gstCalc = calculateGST(invoiceData.totalAmount, true);
        body += `Net Amount: $${gstCalc.netAmount.toFixed(2)}\n`;
        body += `GST (10%): $${gstCalc.gstAmount.toFixed(2)}\n`;
        body += `Total Amount: $${gstCalc.grossAmount.toFixed(2)}\n\n`;
    }

    // Important Australian Tax Information
    body += `\n** IMPORTANT TAX INFORMATION **\n`;
    body += `This is a Tax Invoice for GST purposes.\n`;
    body += `ABN: ${AUSTRALIAN_BUSINESS_DETAILS.abn}\n`;
    body += `GST Registration: ${AUSTRALIAN_BUSINESS_DETAILS.gstRegistered ? 'Registered' : 'Not Registered'}\n\n`;

    body += `If you have any questions about this Tax Invoice, please don't hesitate to contact us.\n\n`;
    body += `Best regards,\n`;
    body += `${AUSTRALIAN_BUSINESS_DETAILS.name}\n`;
    body += `Email: ${AUSTRALIAN_BUSINESS_DETAILS.email}\n`;
    body += `Phone: ${AUSTRALIAN_BUSINESS_DETAILS.phone}\n\n`;
    body += `This Tax Invoice complies with Australian Taxation Office requirements.`;

    return { subject, body };
}

function createInvoiceSummary(invoiceData, type) {
    const isReservation = type.includes('reservation');
    const isImmediate = type.includes('immediate');

    let summary = `<div class="invoice-summary-content">`;
    summary += `<h4 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px;">TAX INVOICE ${invoiceData.invoiceNumber}</h4>`;

    if (isImmediate) {
        summary += `<div class="invoice-note" style="background: #fff3e0; padding: 10px; border-radius: 4px; margin: 10px 0; color: #f39c12; font-weight: 600;">⚠️ Advance Tax Invoice - Service Pending</div>`;
    }

    // Add Xero integration status
    if (invoiceData.xeroInvoiceId) {
        summary += `<div class="xero-status" style="background: #e8f4fd; padding: 8px; border-radius: 4px; margin: 10px 0; color: #3498db; font-size: 12px;">✅ Created in Xero - ID: ${invoiceData.xeroInvoiceId.substring(0, 8)}...</div>`;
    }

    // Australian compliance indicator
    if (invoiceData.isAustralianCompliant) {
        summary += `<div class="compliance-status" style="background: #d5f4e6; padding: 8px; border-radius: 4px; margin: 10px 0; color: #27ae60; font-size: 12px;">✅ Australian Tax Invoice Compliant</div>`;
    }

    summary += `<p><strong>Customer:</strong> ${invoiceData.customerName}</p>`;

    // Australian GST Breakdown
    summary += `<div class="gst-breakdown" style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #3498db;">`;
    summary += `<h5 style="margin: 0 0 8px 0; color: #2c3e50;">Amount Breakdown (AUD)</h5>`;

    if (invoiceData.netAmount && invoiceData.gstAmount) {
        summary += `<p style="margin: 4px 0;"><strong>Net Amount:</strong> $${invoiceData.netAmount.toFixed(2)}</p>`;
        summary += `<p style="margin: 4px 0;"><strong>GST (10%):</strong> $${invoiceData.gstAmount.toFixed(2)}</p>`;
        summary += `<p style="margin: 4px 0; font-weight: 600; color: #27ae60;"><strong>Total (GST Inclusive):</strong> $${invoiceData.totalAmount.toFixed(2)}</p>`;
    } else {
        // Calculate GST if not provided (backward compatibility)
        const gstCalc = calculateGST(invoiceData.totalAmount, true);
        summary += `<p style="margin: 4px 0;"><strong>Net Amount:</strong> $${gstCalc.netAmount.toFixed(2)}</p>`;
        summary += `<p style="margin: 4px 0;"><strong>GST (10%):</strong> $${gstCalc.gstAmount.toFixed(2)}</p>`;
        summary += `<p style="margin: 4px 0; font-weight: 600; color: #27ae60;"><strong>Total (GST Inclusive):</strong> $${gstCalc.grossAmount.toFixed(2)}</p>`;
    }
    summary += `</div>`;

    // Add payment link prominently
    if (invoiceData.paymentUrl) {
        summary += `<div class="payment-link-section" style="background: #d5f4e6; border: 2px solid #27ae60; border-radius: 6px; padding: 15px; margin: 15px 0; text-align: center;">`;
        summary += `<h5 style="margin: 0 0 10px 0; color: #27ae60;">💳 Online Payment Available</h5>`;
        summary += `<p style="margin: 5px 0; font-size: 12px; color: #2c3e50;">Customer can click the link in the email to pay securely</p>`;
        summary += `<a href="${invoiceData.paymentUrl}" target="_blank" style="color: #27ae60; text-decoration: underline; font-weight: 600; word-break: break-all;">${invoiceData.paymentUrl}</a>`;
        summary += `</div>`;
    }

    if (isReservation) {
        summary += `<p><strong>Reservation:</strong> ${invoiceData.reservationId}</p>`;
        summary += `<p><strong>Transfers:</strong> ${invoiceData.legs.length}</p>`;
    } else {
        summary += `<p><strong>Transfer:</strong> ${invoiceData.route}</p>`;
        summary += `<p><strong>Date:</strong> ${invoiceData.date} at ${invoiceData.time}</p>`;
    }

    // Payment info
    if (invoiceData.paymentMethod || invoiceData.paymentStatus) {
        const paymentStatus = invoiceData.paymentStatus || 'pending';
        const statusColor = paymentStatus === 'paid' ? '#27ae60' : paymentStatus === 'failed' ? '#e74c3c' : '#f39c12';
        summary += `<p><strong>Current Payment Status:</strong> <span style="color: ${statusColor}">${paymentStatus}</span>`;
        if (invoiceData.paymentMethod) {
            summary += ` via ${invoiceData.paymentMethod}`;
        }
        summary += `</p>`;
    }

    summary += `</div>`;
    return summary;
}

function updateBookingPrice() {
    console.log('updateBookingPrice called');

    // Get current values from modal fields
    const pickup = document.getElementById('edit-pickup')?.value;
    const dropoff = document.getElementById('edit-dropoff')?.value;
    const passengers = parseInt(document.getElementById('edit-passengers')?.value) || 0;
    const customerType = document.getElementById('edit-customer-type')?.value;
    const serviceType = document.getElementById('edit-service-type')?.value;
    const tripType = document.getElementById('edit-trip-type')?.value;

    console.log('Price calculation inputs:', { pickup, dropoff, passengers, customerType, serviceType, tripType });

    // For individual legs, always treat as one-way for pricing
    const effectiveTripType = document.getElementById('edit-price')?.dataset?.legNumber ? 'one-way' : tripType;

    // Calculate new price
    const newPrice = calculateBookingPrice(pickup, dropoff, passengers, customerType, serviceType, effectiveTripType);
    console.log('Calculated price:', newPrice);

    // Update price field
    const priceField = document.getElementById('edit-price');
    if (priceField) {
        if (newPrice > 0) {
            priceField.value = newPrice.toFixed(2);
            console.log('Price updated to:', newPrice.toFixed(2));
        } else {
            priceField.value = '0.00';
            console.log('Price set to 0.00 (route not available or invalid)');
        }
    } else {
        console.log('Price field not found');
    }
}

function saveBookingChanges() {
    const modal = document.getElementById('booking-modal');
    const pnr = modal.dataset.pnr;
    const editMode = modal.dataset.editMode === 'true';

    if (!editMode) return;

    const booking = bookings.find(b => b.pnr === pnr);
    if (booking) {
        // Save action for undo before making changes
        saveActionSnapshot('edit-booking', `Edited booking ${pnr} (${booking.firstName} ${booking.lastName})`, [pnr]);
        // Update all editable fields
        const statusElement = document.getElementById('edit-status');
        const newStatus = statusElement ? statusElement.value : 'ELEMENT_NOT_FOUND';
        console.log(`Status element:`, statusElement);
        console.log(`Status element value:`, newStatus);
        console.log(`Updating ${pnr} status from "${booking.status}" to "${newStatus}"`);
        booking.status = newStatus;
        console.log(`Immediately after assignment, booking.status is:`, booking.status);
        booking.customerType = document.getElementById('edit-customer-type').value;
        booking.firstName = document.getElementById('edit-first-name').value;
        booking.lastName = document.getElementById('edit-last-name').value;
        booking.phone = document.getElementById('edit-phone').value;
        booking.email = document.getElementById('edit-email').value;
        booking.pickupLocation = document.getElementById('edit-pickup').value;
        booking.dropoffLocation = document.getElementById('edit-dropoff').value;
        booking.departDate = document.getElementById('edit-depart-date').value;
        booking.departTime = document.getElementById('edit-depart-time').value;
        booking.passengers = parseInt(document.getElementById('edit-passengers').value);
        booking.serviceType = document.getElementById('edit-service-type').value;
        booking.tripType = document.getElementById('edit-trip-type').value;
        booking.price = parseFloat(document.getElementById('edit-price').value);
        booking.specialRequirements = document.getElementById('edit-special-requirements').value;

        // Handle return trip fields
        if (document.getElementById('edit-return-date')) {
            booking.returnDate = document.getElementById('edit-return-date').value;
        }
        if (document.getElementById('edit-return-time')) {
            booking.returnTime = document.getElementById('edit-return-time').value;
        }

        // Handle leg statuses for return trips (only for legacy bookings without legNumber)
        if (booking.tripType === 'return' && !booking.legNumber) {
            if (document.getElementById('edit-outbound-status')) {
                booking.outboundStatus = document.getElementById('edit-outbound-status').value;
            }
            if (document.getElementById('edit-return-status')) {
                booking.returnStatus = document.getElementById('edit-return-status').value;
            }

            // Auto-update main status based on leg completion
            updateMainStatusFromLegs(booking);
        }

        // Handle agent reference if present
        if (document.getElementById('edit-agent-ref')) {
            booking.agentReference = document.getElementById('edit-agent-ref').value;
        }

        // Update payment fields
        booking.paymentMethod = document.getElementById('edit-payment-method').value || null;
        booking.paymentStatus = document.getElementById('edit-payment-status').value;
        booking.paymentReference = document.getElementById('edit-payment-reference').value || null;

        saveBookings();
        console.log('After save, booking status is:', booking.status);
        console.log('All bookings statuses:', bookings.map(b => ({pnr: b.pnr, status: b.status})));

        // Don't reload from localStorage, just refresh the display
        displayBookings(); // Force refresh the table display with updated bookings
        updateStats();
        closeModal();

        // Show success message
        showMessage('Booking updated successfully!', 'success');
    }
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.success-message, .error-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '1001';
    messageDiv.style.padding = '15px 20px';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.fontWeight = '600';

    if (type === 'success') {
        messageDiv.style.background = '#d5f4e6';
        messageDiv.style.color = '#27ae60';
        messageDiv.style.border = '2px solid #27ae60';
    } else {
        messageDiv.style.background = '#fadbd8';
        messageDiv.style.color = '#e74c3c';
        messageDiv.style.border = '2px solid #e74c3c';
    }

    document.body.appendChild(messageDiv);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function showResourceModal(type) {
    const modal = document.getElementById('resource-modal');
    const title = document.getElementById('resource-modal-title');
    const fields = document.getElementById('resource-form-fields');

    title.textContent = type === 'driver' ? 'Add Driver' : 'Add Vehicle';

    if (type === 'driver') {
        fields.innerHTML = `
            <div class="form-field">
                <label>Name *</label>
                <input type="text" id="resource-name" required>
            </div>
            <div class="form-field">
                <label>Phone *</label>
                <input type="tel" id="resource-phone" required>
            </div>
            <div class="form-field">
                <label>License Number *</label>
                <input type="text" id="resource-license" required>
            </div>
            <div class="form-field">
                <label>Vehicle</label>
                <select id="resource-vehicle">
                    <option value="">No vehicle assigned</option>
                    ${vehicles.filter(v => !drivers.find(d => d.vehicle === v.id)).map(v =>
                        `<option value="${v.id}">${v.name}</option>`
                    ).join('')}
                </select>
            </div>
        `;
    } else {
        fields.innerHTML = `
            <div class="form-field">
                <label>Vehicle Name *</label>
                <input type="text" id="resource-name" placeholder="e.g., Toyota HiAce - White" required>
            </div>
            <div class="form-field">
                <label>Registration *</label>
                <input type="text" id="resource-registration" required>
            </div>
            <div class="form-field">
                <label>Type *</label>
                <select id="resource-type" required>
                    <option value="">Select type</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="van">Van</option>
                    <option value="bus">Bus</option>
                </select>
            </div>
            <div class="form-field">
                <label>Capacity *</label>
                <input type="number" id="resource-capacity" min="1" max="20" required>
            </div>
        `;
    }

    modal.dataset.type = type;
    modal.style.display = 'flex';
}

function saveResource() {
    const modal = document.getElementById('resource-modal');
    const type = modal.dataset.type;

    if (type === 'driver') {
        const driver = {
            id: 'DRV' + String(Date.now()).slice(-6),
            name: document.getElementById('resource-name').value,
            phone: document.getElementById('resource-phone').value,
            license: document.getElementById('resource-license').value,
            vehicle: document.getElementById('resource-vehicle').value || null,
            status: 'available'
        };

        drivers.push(driver);
        localStorage.setItem('kit-drivers', JSON.stringify(drivers));
        loadDrivers();
    } else {
        const vehicle = {
            id: 'VEH' + String(Date.now()).slice(-6),
            name: document.getElementById('resource-name').value,
            registration: document.getElementById('resource-registration').value,
            type: document.getElementById('resource-type').value,
            capacity: parseInt(document.getElementById('resource-capacity').value),
            status: 'available'
        };

        vehicles.push(vehicle);
        localStorage.setItem('kit-vehicles', JSON.stringify(vehicles));
        loadVehicles();
    }

    closeResourceModal();
    updateStats();
}

function showView(viewType) {
    // Update view buttons
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${viewType}-view-btn`).classList.add('active');

    // Show/hide views
    document.getElementById('list-view').style.display = viewType === 'list' ? 'block' : 'none';
    document.getElementById('schedule-view').style.display = viewType === 'schedule' ? 'block' : 'none';

    if (viewType === 'schedule') {
        generateScheduleView();
    }
}

function showResourceTab(tabType) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tabType}-tab`).classList.add('active');

    // Show/hide content
    document.getElementById('drivers-content').style.display = tabType === 'drivers' ? 'block' : 'none';
    document.getElementById('vehicles-content').style.display = tabType === 'vehicles' ? 'block' : 'none';
}

function generateScheduleView() {
    // Simple schedule view - could be enhanced further
    const scheduleGrid = document.getElementById('schedule-grid');
    const today = document.getElementById('date-filter').value || new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.departDate === today);

    scheduleGrid.innerHTML = `
        <div class="schedule-time">Time</div>
        ${Array.from({length: 24}, (_, i) => `<div class="schedule-time">${String(i).padStart(2, '0')}:00</div>`).join('')}

        ${todayBookings.map(booking => {
            const hour = parseInt(booking.departTime.split(':')[0]);
            return `
                <div class="schedule-slot" style="grid-column: ${hour + 2};">
                    <div class="schedule-booking" onclick="showBookingDetails('${booking.pnr}')">
                        ${booking.pnr}<br>
                        ${booking.firstName} ${booking.lastName}
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

function closeModal() {
    document.getElementById('booking-modal').style.display = 'none';
}

function closeResourceModal() {
    document.getElementById('resource-modal').style.display = 'none';
}

function closeEmailModal() {
    document.getElementById('email-preview-modal').style.display = 'none';
    // Reset the invoice details view
    document.getElementById('invoice-details').style.display = 'none';
    document.getElementById('view-invoice-details').textContent = '📋 View Full Invoice Details';
}

function toggleInvoiceDetails() {
    const detailsDiv = document.getElementById('invoice-details');
    const button = document.getElementById('view-invoice-details');

    if (detailsDiv.style.display === 'none') {
        detailsDiv.style.display = 'block';
        button.textContent = '📋 Hide Invoice Details';
    } else {
        detailsDiv.style.display = 'none';
        button.textContent = '📋 View Full Invoice Details';
    }
}

async function sendEmailFromPreview() {
    const modal = document.getElementById('email-preview-modal');
    const invoiceData = JSON.parse(modal.dataset.invoiceData);
    const emailType = modal.dataset.emailType;

    // Get the edited email content
    const emailTo = document.getElementById('email-to').value;
    const emailSubject = document.getElementById('email-subject').value;
    const emailBody = document.getElementById('email-body').value;

    // Validate email
    if (!emailTo) {
        alert('⚠️ No email address specified. Please add an email address before sending.');
        return;
    }

    if (!emailSubject.trim()) {
        alert('⚠️ Email subject is required.');
        return;
    }

    // Show sending status
    const originalButtonText = document.getElementById('send-email-btn').textContent;
    document.getElementById('send-email-btn').textContent = 'Sending...';
    document.getElementById('send-email-btn').disabled = true;

    try {
        // Simulate sending the email
        console.log('Sending email:', {
            to: emailTo,
            subject: emailSubject,
            body: emailBody,
            invoice: invoiceData,
            type: emailType
        });

        // Simulate email send delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mark invoice as sent in Xero
        if (invoiceData.xeroInvoiceId) {
            await markXeroInvoiceSent(invoiceData.xeroInvoiceId);
        }

        // Show success message
        alert(`✅ Invoice email sent successfully!\n\nTo: ${emailTo}\nSubject: ${emailSubject}\nInvoice: ${invoiceData.invoiceNumber}\nAmount: $${invoiceData.totalAmount.toFixed(2)}\n\n${invoiceData.paymentUrl ? 'Customer can pay online using the link in the email.' : ''}\n\nXero invoice marked as sent.`);

        // Close modal
        closeEmailModal();

    } catch (error) {
        console.error('Error sending email:', error);
        alert('❌ Error sending email. Please try again.');

        // Reset button
        document.getElementById('send-email-btn').textContent = originalButtonText;
        document.getElementById('send-email-btn').disabled = false;
    }
}

function saveBookings() {
    localStorage.setItem('kit-bookings', JSON.stringify(bookings));
}

function saveToStorage() {
    localStorage.setItem('kit-bookings', JSON.stringify(bookings));
    localStorage.setItem('kit-drivers', JSON.stringify(drivers));
    localStorage.setItem('kit-vehicles', JSON.stringify(vehicles));
}

// Utility functions
function getLocationName(locationValue) {
    const locationMap = {
        'kingscote-airport': 'Airport',
        'penneshaw-ferry': 'Ferry',
        'kingscote-town': 'Kingscote',
        'american-river': 'American River',
        'emu-bay': 'Emu Bay',
        'parndana': 'Parndana',
        'vivonne-bay': 'Vivonne Bay',
        'flinders-chase': 'Flinders Chase',
        'remarkable-rocks': 'Remarkable Rocks',
        'admirals-arch': 'Admirals Arch',
        'other': 'Other'
    };
    return locationMap[locationValue] || locationValue;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-AU', {
        day: '2-digit',
        month: '2-digit'
    });
}

function setupTableSorting() {
    // Add click handlers to sortable headers
    const sortableHeaders = [
        { id: 'col-pnr', column: 'pnr' },
        { id: 'col-customer', column: 'customer' },
        { id: 'col-route', column: 'route' },
        { id: 'col-datetime', column: 'datetime' },
        { id: 'col-pax', column: 'pax' },
        { id: 'col-price', column: 'price' },
        { id: 'col-status', column: 'status' }
    ];

    sortableHeaders.forEach(header => {
        const element = document.querySelector(`.${header.id}`);
        if (element) {
            element.style.cursor = 'pointer';
            element.style.userSelect = 'none';
            element.addEventListener('click', () => {
                sortTable(header.column);
            });
        }
    });
}

function sortTable(column) {
    // Toggle direction if same column, otherwise set to ascending
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    // Update header indicators
    updateSortIndicators();

    // Re-display bookings with new sort
    const currentFilter = getCurrentFilteredBookings();
    displayBookings(currentFilter);
}

function sortBookings(bookingsArray) {
    // Create array of {index, booking, sortValue} objects
    const sortableItems = bookingsArray.map((booking, index) => {
        let sortValue;

        switch (currentSort.column) {
            case 'pnr':
                sortValue = booking.pnr || '';
                break;
            case 'customer':
                sortValue = `${booking.firstName || ''} ${booking.lastName || ''}`.trim().toLowerCase();
                break;
            case 'route':
                sortValue = `${getLocationName(booking.pickupLocation)} ${getLocationName(booking.dropoffLocation)}`.toLowerCase();
                break;
            case 'datetime':
                sortValue = new Date(`${booking.departDate} ${booking.departTime}`).getTime();
                if (isNaN(sortValue)) sortValue = 0;
                break;
            case 'pax':
                sortValue = parseInt(booking.passengers) || 0;
                break;
            case 'price':
                sortValue = parseFloat(booking.price) || 0;
                break;
            case 'status':
                sortValue = (booking.status || '').toLowerCase();
                break;
            case 'payment':
                sortValue = (booking.paymentStatus || 'pending').toLowerCase();
                break;
            default:
                sortValue = booking.pnr || '';
        }

        return { originalIndex: index, booking: booking, sortValue: sortValue };
    });

    // Sort the items with stable sort
    sortableItems.sort((a, b) => {
        let comparison = 0;
        if (a.sortValue < b.sortValue) comparison = -1;
        else if (a.sortValue > b.sortValue) comparison = 1;
        else comparison = a.originalIndex - b.originalIndex; // Stable sort
        return currentSort.direction === 'asc' ? comparison : -comparison;
    });

    // Extract just the bookings
    return sortableItems.map(item => item.booking);
}

function updateSortIndicators() {
    // Remove all existing sort indicators
    document.querySelectorAll('.sort-indicator').forEach(indicator => {
        indicator.remove();
    });

    // Add indicator to current sort column
    const columnClasses = {
        'pnr': 'col-pnr',
        'customer': 'col-customer',
        'route': 'col-route',
        'datetime': 'col-datetime',
        'pax': 'col-pax',
        'price': 'col-price',
        'status': 'col-status'
    };

    const columnClass = columnClasses[currentSort.column];
    if (columnClass) {
        const header = document.querySelector(`.${columnClass}`);
        if (header) {
            const indicator = document.createElement('span');
            indicator.className = 'sort-indicator';
            indicator.textContent = currentSort.direction === 'asc' ? ' ↑' : ' ↓';
            header.appendChild(indicator);
        }
    }
}

function getCurrentFilteredBookings() {
    const dateFilter = document.getElementById('date-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const driverFilter = document.getElementById('driver-filter').value;
    const paymentFilter = document.getElementById('payment-filter').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();


    const filtered = bookings.filter(booking => {
        // Date filter
        if (dateFilter && booking.departDate !== dateFilter) {
            return false;
        }

        // Status filter
        if (statusFilter && booking.status !== statusFilter) {
            return false;
        }

        // Driver filter
        if (driverFilter) {
            if (driverFilter === 'unassigned' && booking.driver) {
                return false;
            } else if (driverFilter !== 'unassigned' && booking.driver !== driverFilter) {
                return false;
            }
        }

        // Payment filter
        if (paymentFilter) {
            const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
            const paymentMethods = ['cash', 'stripe-website', 'square-driver', 'stripe-xero', 'direct-deposit'];

            if (paymentStatuses.includes(paymentFilter)) {
                // Filter by payment status
                if ((booking.paymentStatus || 'pending') !== paymentFilter) {
                    return false;
                }
            } else if (paymentMethods.includes(paymentFilter)) {
                // Filter by payment method
                if (booking.paymentMethod !== paymentFilter) {
                    return false;
                }
            }
        }

        // Search filter
        if (searchTerm) {
            const searchFields = [
                booking.pnr,
                booking.firstName,
                booking.lastName,
                booking.phone,
                booking.email,
                getLocationName(booking.pickupLocation),
                getLocationName(booking.dropoffLocation)
            ].join(' ').toLowerCase();

            if (!searchFields.includes(searchTerm)) {
                return false;
            }
        }

        return true;
    });

    return filtered;
}

// Helper function to get human-readable payment method names
function getPaymentMethodName(paymentMethod) {
    const methodNames = {
        'cash': 'Cash',
        'stripe-website': 'Credit Card (Online)',
        'square-driver': 'Credit Card (Driver)',
        'stripe-xero': 'Credit Card (Xero)',
        'direct-deposit': 'Bank Transfer'
    };
    return methodNames[paymentMethod] || paymentMethod;
}

// Professional Tax Invoice Generation - Xero Style
function generateXeroStyleTaxInvoice(invoiceData, type) {
    try {
        console.log('generateXeroStyleTaxInvoice called with:', { invoiceData, type });

        const isReservation = type.includes('reservation');
        const isImmediate = type.includes('immediate');

        if (!invoiceData.generatedDate) {
            console.warn('No generatedDate found, using current date');
            invoiceData.generatedDate = new Date().toISOString();
        }

        const invoiceDate = new Date(invoiceData.generatedDate).toLocaleDateString('en-AU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

    // Calculate totals
    let subtotal = 0;
    let gstTotal = 0;
    let grandTotal = invoiceData.totalAmount;

    if (invoiceData.netAmount && invoiceData.gstAmount) {
        subtotal = invoiceData.netAmount;
        gstTotal = invoiceData.gstAmount;
    } else {
        const gstCalc = calculateGST(invoiceData.totalAmount, true);
        subtotal = gstCalc.netAmount;
        gstTotal = gstCalc.gstAmount;
    }

    let html = `
    <div class="tax-invoice-container">
        <!-- Header -->
        <div class="tax-invoice-header">
            <div class="invoice-company-details">
                <h1>${AUSTRALIAN_BUSINESS_DETAILS.name}</h1>
                <div class="abn">ABN: ${AUSTRALIAN_BUSINESS_DETAILS.abn}</div>
                <div class="address">
                    ${AUSTRALIAN_BUSINESS_DETAILS.address.street}<br>
                    ${AUSTRALIAN_BUSINESS_DETAILS.address.city}, ${AUSTRALIAN_BUSINESS_DETAILS.address.state} ${AUSTRALIAN_BUSINESS_DETAILS.address.postcode}<br>
                    ${AUSTRALIAN_BUSINESS_DETAILS.address.country}<br>
                    Phone: ${AUSTRALIAN_BUSINESS_DETAILS.phone}<br>
                    Email: ${AUSTRALIAN_BUSINESS_DETAILS.email}
                </div>
            </div>
            <div class="invoice-title-section">
                <div class="invoice-title">TAX INVOICE</div>
                <div class="invoice-number">${invoiceData.invoiceNumber}</div>
            </div>
        </div>

        <!-- Customer and Payment Info -->
        <div class="invoice-info-grid">
            <div class="invoice-customer-section">
                <h3>Bill To</h3>
                <div class="invoice-customer-details">
                    <strong>${invoiceData.customerName}</strong><br>
                    ${invoiceData.customerEmail ? invoiceData.customerEmail + '<br>' : ''}
                    Customer Type: ${invoiceData.customerType || 'Personal'}
                </div>
            </div>
            <div class="invoice-payment-section">
                <h3>Invoice Details</h3>
                <div class="invoice-payment-details">
                    <strong>Invoice Date:</strong> ${invoiceDate}<br>
                    <strong>Due Date:</strong> ${invoiceDate}<br>
                    <strong>Terms:</strong> Due on receipt<br>
                    ${invoiceData.xeroInvoiceId ? `<strong>Xero ID:</strong> ${invoiceData.xeroInvoiceId.substring(0, 12)}...<br>` : ''}
                </div>
            </div>
        </div>

        <!-- Service Details Table -->
        <table class="invoice-table">
            <thead>
                <tr>
                    <th class="description-col">Description</th>
                    <th class="amount-col">Amount</th>
                    <th class="gst-col">GST</th>
                    <th class="total-col">Total</th>
                </tr>
            </thead>
            <tbody>`;

    if (isReservation && invoiceData.legs) {
        // Multiple transfers for reservation
        invoiceData.legs.forEach((leg, index) => {
            const legGST = leg.gstPrice || calculateGST(leg.price, true);
            const legNet = leg.netPrice || legGST.netAmount;
            const legGSTAmount = leg.gstPrice || legGST.gstAmount;

            html += `
                <tr>
                    <td class="description-col">
                        <strong>Transfer ${index + 1}: Passenger Transport Service</strong><br>
                        Route: ${leg.route}<br>
                        Date: ${leg.date} at ${leg.time}<br>
                        Passengers: ${leg.passengers}
                        ${leg.description ? '<br>' + leg.description : ''}
                    </td>
                    <td class="amount-col">$${legNet.toFixed(2)}</td>
                    <td class="gst-col">$${legGSTAmount.toFixed(2)}</td>
                    <td class="total-col">$${leg.price.toFixed(2)}</td>
                </tr>`;
        });
    } else {
        // Single transfer
        const serviceGST = calculateGST(invoiceData.totalAmount, true);
        html += `
            <tr>
                <td class="description-col">
                    <strong>Passenger Transport Service</strong><br>
                    Route: ${invoiceData.route}<br>
                    Date: ${invoiceData.date} at ${invoiceData.time}<br>
                    Passengers: ${invoiceData.passengers}
                    ${invoiceData.description ? '<br>' + invoiceData.description : ''}
                </td>
                <td class="amount-col">$${serviceGST.netAmount.toFixed(2)}</td>
                <td class="gst-col">$${serviceGST.gstAmount.toFixed(2)}</td>
                <td class="total-col">$${serviceGST.grossAmount.toFixed(2)}</td>
            </tr>`;
    }

    html += `
            </tbody>
        </table>

        <!-- Totals -->
        <div class="invoice-totals">
            <table>
                <tr class="subtotal-row">
                    <td>Subtotal:</td>
                    <td style="text-align: right;">$${subtotal.toFixed(2)}</td>
                </tr>
                <tr class="gst-row">
                    <td>GST (10%):</td>
                    <td style="text-align: right;">$${gstTotal.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total (AUD):</strong></td>
                    <td style="text-align: right;"><strong>$${grandTotal.toFixed(2)}</strong></td>
                </tr>
            </table>
        </div>

        <!-- Payment Information -->
        <div class="invoice-footer">
            ${invoiceData.paymentUrl && invoiceData.paymentStatus !== 'paid' ? `
            <div class="invoice-payment-terms">
                <h4>💳 Pay Online</h4>
                <a href="${invoiceData.paymentUrl}" target="_blank" class="invoice-payment-link">
                    Pay Now - $${grandTotal.toFixed(2)}
                </a>
                <div style="font-size: 14px; color: #666;">
                    Click the link above to pay securely with credit card or bank transfer.<br>
                    You will receive an automatic receipt upon payment completion.
                </div>
            </div>
            ` : ''}

            ${invoiceData.paymentStatus === 'paid' ? `
            <div class="invoice-payment-terms" style="background: #d5f4e6; border: 2px solid #27ae60;">
                <h4 style="color: #27ae60;">✅ Payment Complete</h4>
                <div style="font-size: 14px; color: #27ae60; font-weight: 600;">
                    This invoice has been paid in full.
                    ${invoiceData.paymentMethod ? `Payment method: ${getPaymentMethodName(invoiceData.paymentMethod)}` : ''}
                </div>
            </div>
            ` : ''}

            <!-- Tax Notice -->
            <div class="invoice-tax-notice">
                <strong>Important Tax Information:</strong><br>
                This is a Tax Invoice for GST purposes. ABN: ${AUSTRALIAN_BUSINESS_DETAILS.abn}<br>
                GST Registration: ${AUSTRALIAN_BUSINESS_DETAILS.gstRegistered ? 'Registered' : 'Not Registered'}<br>
                This Tax Invoice complies with Australian Taxation Office requirements.
            </div>

            <!-- Contact Information -->
            <div class="invoice-contact-info">
                <div>
                    <strong>Questions about this invoice?</strong><br>
                    Email: ${AUSTRALIAN_BUSINESS_DETAILS.email}<br>
                    Phone: ${AUSTRALIAN_BUSINESS_DETAILS.phone}
                </div>
                <div style="text-align: right;">
                    <strong>Payment Status:</strong><br>
                    ${invoiceData.paymentStatus || 'Pending'}<br>
                    ${invoiceData.paymentMethod ? `Method: ${invoiceData.paymentMethod}` : ''}
                </div>
            </div>
        </div>
    </div>`;

        console.log('Tax Invoice HTML generated successfully');
        return html;
    } catch (error) {
        console.error('Error in generateXeroStyleTaxInvoice:', error);
        console.error('Invoice data:', invoiceData);
        throw error;
    }
}

function showTaxInvoice(invoiceData, type) {
    try {
        console.log('showTaxInvoice called with:', { invoiceData, type });

        const modal = document.getElementById('tax-invoice-modal');
        const content = document.getElementById('tax-invoice-content');
        const title = document.getElementById('tax-invoice-modal-title');

        if (!modal || !content || !title) {
            throw new Error('Tax invoice modal elements not found');
        }

        if (!invoiceData || !invoiceData.invoiceNumber) {
            throw new Error('Invalid invoice data provided');
        }

        console.log('Generating Tax Invoice HTML...');
        const invoiceHTML = generateXeroStyleTaxInvoice(invoiceData, type);

        title.textContent = `Tax Invoice ${invoiceData.invoiceNumber}`;
        content.innerHTML = invoiceHTML;

        modal.style.display = 'block';

        // Set up event handlers
        setupTaxInvoiceModalHandlers(invoiceData, type);

        console.log('Tax Invoice modal displayed successfully');
    } catch (error) {
        console.error('Error in showTaxInvoice:', error);
        throw error; // Re-throw so calling function can handle it
    }
}

function setupTaxInvoiceModalHandlers(invoiceData, type) {
    const modal = document.getElementById('tax-invoice-modal');

    // Close handlers
    document.getElementById('tax-invoice-modal-close').onclick = () => {
        modal.style.display = 'none';
    };

    document.getElementById('tax-invoice-close').onclick = () => {
        modal.style.display = 'none';
    };

    // Print handler
    document.getElementById('tax-invoice-print').onclick = () => {
        window.print();
    };

    // Click outside to close
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

async function downloadTaxInvoicePDF(invoiceData, type) {
    try {
        // Generate the HTML content
        const invoiceHTML = generateXeroStyleTaxInvoice(invoiceData, type);

        // Create a temporary container for PDF generation
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = invoiceHTML;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);

        // Import html2pdf library dynamically
        if (!window.html2pdf) {
            // Load html2pdf library
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            document.head.appendChild(script);

            // Wait for library to load
            await new Promise((resolve) => {
                script.onload = resolve;
            });
        }

        // Configure PDF options
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Tax-Invoice-${invoiceData.invoiceNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        // Generate and download PDF
        await html2pdf().set(opt).from(tempDiv).save();

        // Clean up
        document.body.removeChild(tempDiv);

        console.log('PDF generated successfully');

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try printing the invoice instead.');
    }
}

// Update existing functions to include Tax Invoice buttons
function createInvoiceActionsHTML(invoiceData, type) {
    return `
        <div class="invoice-actions" style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn-primary" onclick="showEmailPreview(${JSON.stringify(invoiceData).replace(/"/g, '&quot;')}, '${type}')">
                📧 Email Invoice
            </button>
            <button class="btn-secondary" onclick="showTaxInvoice(${JSON.stringify(invoiceData).replace(/"/g, '&quot;')}, '${type}')">
                📄 View Tax Invoice
            </button>
            <button class="btn-secondary" onclick="downloadTaxInvoicePDF(${JSON.stringify(invoiceData).replace(/"/g, '&quot;')}, '${type}')">
                📥 Download PDF
            </button>
        </div>
    `;
}

// Tax Invoice View Functions - Check for existing invoices first
async function viewTaxInvoiceByReservation(reservationId) {
    try {
        console.log('viewTaxInvoiceByReservation called with:', reservationId);

        // First check if invoice already exists
        let invoiceData = getExistingInvoiceForReservation(reservationId);
        console.log('Existing invoice data found:', invoiceData ? 'Yes' : 'No');

        if (invoiceData) {
            console.log('Using existing invoice for reservation:', reservationId);
            showTaxInvoice(invoiceData, 'completed-reservation');
        } else {
            // No existing invoice, generate new one
            console.log('No existing invoice found, generating new one for reservation:', reservationId);
            invoiceData = await generateInvoiceByReservation(reservationId);
            if (invoiceData) {
                showTaxInvoice(invoiceData, 'completed-reservation');
            } else {
                alert('Could not generate invoice. Please try the green Invoice button first.');
            }
        }
    } catch (error) {
        console.error('Error showing tax invoice for reservation:', error);
        console.error('Error details:', error.stack);
        console.error('ReservationId:', reservationId);
        alert(`Error loading tax invoice: ${error.message}\n\nCheck console for details.`);
    }
}

async function viewTaxInvoiceForSingleBooking(pnr) {
    try {
        console.log('viewTaxInvoiceForSingleBooking called with:', pnr);

        // First check if invoice already exists
        let invoiceData = getExistingInvoiceForBooking(pnr);
        console.log('Existing invoice data found:', invoiceData ? 'Yes' : 'No');

        if (invoiceData) {
            console.log('Using existing invoice for booking:', pnr);
            showTaxInvoice(invoiceData, 'completed-single');
        } else {
            // No existing invoice, generate new one
            console.log('No existing invoice found, generating new one for booking:', pnr);
            invoiceData = await generateInvoiceForSingleBooking(pnr);
            if (invoiceData) {
                showTaxInvoice(invoiceData, 'completed-single');
            } else {
                alert('Could not generate invoice. Please try the green Invoice button first.');
            }
        }
    } catch (error) {
        console.error('Error showing tax invoice for booking:', error);
        console.error('Error details:', error.stack);
        console.error('PNR:', pnr);
        alert(`Error loading tax invoice: ${error.message}\n\nCheck console for details.`);
    }
}

async function viewImmediateTaxInvoiceByReservation(reservationId) {
    try {
        // For immediate invoices, always check existing first
        let invoiceData = getExistingInvoiceForReservation(reservationId);

        if (invoiceData) {
            console.log('Using existing immediate invoice for reservation:', reservationId);
            showTaxInvoice(invoiceData, 'immediate-reservation');
        } else {
            console.log('No existing invoice found, generating immediate invoice for reservation:', reservationId);
            invoiceData = await generateImmediateInvoiceByReservation(reservationId);
            if (invoiceData) {
                showTaxInvoice(invoiceData, 'immediate-reservation');
            }
        }
    } catch (error) {
        console.error('Error showing immediate tax invoice for reservation:', error);
        alert('Error loading tax invoice. Please try again.');
    }
}

async function viewImmediateTaxInvoiceForSingleBooking(pnr) {
    try {
        // For immediate invoices, always check existing first
        let invoiceData = getExistingInvoiceForBooking(pnr);

        if (invoiceData) {
            console.log('Using existing immediate invoice for booking:', pnr);
            showTaxInvoice(invoiceData, 'immediate-single');
        } else {
            console.log('No existing invoice found, generating immediate invoice for booking:', pnr);
            invoiceData = await generateImmediateInvoiceForSingleBooking(pnr);
            if (invoiceData) {
                showTaxInvoice(invoiceData, 'immediate-single');
            }
        }
    } catch (error) {
        console.error('Error showing immediate tax invoice for booking:', error);
        alert('Error loading tax invoice. Please try again.');
    }
}

// Helper functions to check for existing invoices
function getExistingInvoiceForReservation(reservationId) {
    try {
        console.log('getExistingInvoiceForReservation called with:', reservationId);

        // Check if any booking in this reservation has invoice data
        const reservationBookings = bookings.filter(b => b.reservationId === reservationId);
        console.log('Found reservation bookings:', reservationBookings.length);

        if (reservationBookings.length === 0) {
            console.log('No bookings found for reservation:', reservationId);
            return null;
        }

        // Find a booking with invoice data
        const bookingWithInvoice = reservationBookings.find(b => b.invoiceNumber && b.xeroInvoiceId);
        console.log('Booking with invoice found:', bookingWithInvoice ? 'Yes' : 'No');

        if (!bookingWithInvoice) {
            console.log('No booking with invoice data found');
            return null;
        }

        console.log('Building invoice data from existing reservation');
        // Build invoice data from existing information
        return buildInvoiceDataFromExisting(reservationBookings, 'reservation');
    } catch (error) {
        console.error('Error in getExistingInvoiceForReservation:', error);
        return null;
    }
}

function getExistingInvoiceForBooking(pnr) {
    try {
        console.log('getExistingInvoiceForBooking called with:', pnr);

        const booking = bookings.find(b => b.pnr === pnr);
        console.log('Booking found:', booking ? 'Yes' : 'No');

        if (!booking) {
            console.log('No booking found for PNR:', pnr);
            return null;
        }

        console.log('Booking invoice data - invoiceNumber:', booking.invoiceNumber, 'xeroInvoiceId:', booking.xeroInvoiceId);

        if (!booking.invoiceNumber || !booking.xeroInvoiceId) {
            console.log('Booking missing invoice data');
            return null;
        }

        console.log('Building invoice data from existing booking');
        // Build invoice data from existing booking
        return buildInvoiceDataFromExisting([booking], 'single');
    } catch (error) {
        console.error('Error in getExistingInvoiceForBooking:', error);
        return null;
    }
}

function buildInvoiceDataFromExisting(bookingArray, type) {
    try {
        console.log('buildInvoiceDataFromExisting called with type:', type, 'bookings:', bookingArray.length);

        const isReservation = type === 'reservation';
        const firstBooking = bookingArray[0];

        if (!firstBooking) {
            console.error('No booking provided to buildInvoiceDataFromExisting');
            return null;
        }

        if (isReservation) {
            console.log('Building reservation invoice data for:', firstBooking.reservationId);
            // Build reservation invoice data
            const reservation = getReservationForInvoicing(firstBooking.reservationId);
            if (!reservation) {
                console.error('Could not get reservation for invoicing:', firstBooking.reservationId);
                return null;
            }

            console.log('Reservation found, calculating GST for total:', reservation.totalPrice);
            const gstCalculation = calculateGST(reservation.totalPrice, true);

        return {
            invoiceNumber: firstBooking.invoiceNumber,
            xeroInvoiceId: firstBooking.xeroInvoiceId,
            paymentUrl: firstBooking.paymentUrl,
            reservationId: reservation.reservationId,
            customerName: reservation.customerName,
            customerEmail: reservation.customerEmail,
            customerType: reservation.customerType,
            totalAmount: reservation.totalPrice,
            netAmount: gstCalculation.netAmount,
            gstAmount: gstCalculation.gstAmount,
            gstRate: gstCalculation.gstRate,
            businessDetails: AUSTRALIAN_BUSINESS_DETAILS,
            legs: reservation.legs.map(leg => {
                const legGST = calculateGST(leg.price, true);
                return {
                    pnr: leg.pnr,
                    legNumber: leg.legNumber,
                    route: `${getLocationName(leg.pickupLocation)} → ${getLocationName(leg.dropoffLocation)}`,
                    date: leg.departDate,
                    time: leg.departTime,
                    passengers: leg.passengers,
                    price: leg.price,
                    netPrice: legGST.netAmount,
                    gstPrice: legGST.gstAmount,
                    status: leg.status,
                    paymentMethod: leg.paymentMethod,
                    paymentStatus: leg.paymentStatus,
                    paymentReference: leg.paymentReference,
                    description: `Passenger Transport Service: ${getLocationName(leg.pickupLocation)} to ${getLocationName(leg.dropoffLocation)}`
                };
            }),
            paymentSummary: getReservationPaymentSummary(reservation),
            generatedDate: new Date().toISOString(),
            xeroStatus: 'AUTHORISED',
            isAustralianCompliant: true
        };
    } else {
        // Build single booking invoice data
        const booking = firstBooking;
        const gstCalculation = calculateGST(booking.price, true);

        return {
            invoiceNumber: booking.invoiceNumber,
            xeroInvoiceId: booking.xeroInvoiceId,
            paymentUrl: booking.paymentUrl,
            bookingPnr: booking.pnr,
            customerName: `${booking.firstName} ${booking.lastName}`,
            customerEmail: booking.email,
            customerType: booking.customerType,
            totalAmount: booking.price,
            netAmount: gstCalculation.netAmount,
            gstAmount: gstCalculation.gstAmount,
            gstRate: gstCalculation.gstRate,
            businessDetails: AUSTRALIAN_BUSINESS_DETAILS,
            route: `${getLocationName(booking.pickupLocation)} → ${getLocationName(booking.dropoffLocation)}`,
            date: booking.departDate,
            time: booking.departTime,
            passengers: booking.passengers,
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus,
            paymentReference: booking.paymentReference,
            description: `Passenger Transport Service: ${getLocationName(booking.pickupLocation)} to ${getLocationName(booking.dropoffLocation)}`,
            generatedDate: new Date().toISOString(),
            xeroStatus: 'AUTHORISED',
            isAustralianCompliant: true
        };
    }
    } catch (error) {
        console.error('Error in buildInvoiceDataFromExisting:', error);
        return null;
    }
}

// Make functions globally available for onclick handlers
window.assignDriver = assignDriver;
window.assignVehicle = assignVehicle;
window.editBooking = editBooking;
window.deleteBooking = deleteBooking;
window.showBookingDetails = showBookingDetails;
window.generateInvoiceByReservation = generateInvoiceByReservation;
window.generateInvoiceForSingleBooking = generateInvoiceForSingleBooking;
window.generateImmediateInvoiceByReservation = generateImmediateInvoiceByReservation;
window.generateImmediateInvoiceForSingleBooking = generateImmediateInvoiceForSingleBooking;
window.showTaxInvoice = showTaxInvoice;
window.downloadTaxInvoicePDF = downloadTaxInvoicePDF;
window.viewTaxInvoiceByReservation = viewTaxInvoiceByReservation;
window.viewTaxInvoiceForSingleBooking = viewTaxInvoiceForSingleBooking;
window.viewImmediateTaxInvoiceByReservation = viewImmediateTaxInvoiceByReservation;
window.viewImmediateTaxInvoiceForSingleBooking = viewImmediateTaxInvoiceForSingleBooking;
window.loadSampleData = loadSampleData;
window.undoLastAction = undoLastAction;
window.clearActionHistory = clearActionHistory;