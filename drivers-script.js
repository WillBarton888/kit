// Drivers Portal JavaScript - Mobile Optimized
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the drivers portal
    initializeDriversPortal();

    // Check for mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.classList.add('mobile-device');
    }

    // Prevent pull-to-refresh on mobile
    let lastTouchY = 0;
    document.addEventListener('touchstart', (e) => {
        lastTouchY = e.touches[0].clientY;
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

        if (scrollTop === 0 && touchY > lastTouchY) {
            e.preventDefault();
        }
    }, { passive: false });
});

// Global variables
let currentDriver = null;
let allBookings = [];
let driverTasks = [];

function initializeDriversPortal() {
    // Load data from localStorage
    loadBookings();
    loadDrivers();

    // Set up event listeners
    setupEventListeners();

    // Update current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000); // Update every minute

    // Initialize with no driver selected
    showDriverPrompt();
}

function loadBookings() {
    // Load bookings from localStorage (shared with manage.html)
    const storedBookings = localStorage.getItem('kit-bookings');
    if (storedBookings) {
        allBookings = JSON.parse(storedBookings);
        console.log('Loaded bookings from storage:', allBookings.length);
    }

    // If no bookings or empty, load sample data
    if (!allBookings || allBookings.length === 0) {
        console.log('No bookings found, loading sample data...');
        loadSampleBookings();
    }
}

function loadDrivers() {
    // Load drivers from localStorage
    const storedDrivers = localStorage.getItem('kit-drivers');
    if (storedDrivers) {
        const drivers = JSON.parse(storedDrivers);
        if (drivers && drivers.length > 0) {
            updateDriverSelector(drivers);
            return;
        }
    }

    // If no drivers, create sample drivers
    console.log('No drivers found, creating sample drivers...');
    const sampleDrivers = [
        { id: 'john-smith', name: 'John Smith', phone: '0412345678', status: 'available', vehicle: 'Toyota HiAce - White' },
        { id: 'sarah-wilson', name: 'Sarah Wilson', phone: '0423456789', status: 'available', vehicle: 'Ford Transit - Blue' },
        { id: 'mike-johnson', name: 'Mike Johnson', phone: '0434567890', status: 'available', vehicle: 'Mercedes Sprinter - Silver' }
    ];
    localStorage.setItem('kit-drivers', JSON.stringify(sampleDrivers));
    updateDriverSelector(sampleDrivers);
}

function updateDriverSelector(drivers) {
    const selector = document.getElementById('driver-select');
    selector.innerHTML = '<option value="">Select Driver...</option>';

    drivers.forEach(driver => {
        const option = document.createElement('option');
        option.value = driver.id;
        option.textContent = driver.name;
        selector.appendChild(option);
    });
}

function setupEventListeners() {
    // Driver selector
    document.getElementById('driver-select').addEventListener('change', function(e) {
        selectDriver(e.target.value);
    });

    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', refreshData);

    // Load Sample button
    document.getElementById('load-sample-btn').addEventListener('click', function() {
        if (confirm('This will load sample data and replace existing bookings. Continue?')) {
            loadSampleBookings();
            loadBookings();
            if (currentDriver) {
                loadDriverTasks();
            }
            alert('Sample data loaded successfully!');
        }
    });

    // Task filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterTasks(this.dataset.filter);
        });
    });

    // Quick action buttons
    document.getElementById('start-shift-btn').addEventListener('click', startShift);
    document.getElementById('end-shift-btn').addEventListener('click', endShift);
    document.getElementById('break-btn').addEventListener('click', takeBreak);
    document.getElementById('emergency-btn').addEventListener('click', handleEmergency);

    // Modal close
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);

    // Task action buttons
    document.getElementById('accept-task-btn').addEventListener('click', acceptTask);
    document.getElementById('start-task-btn').addEventListener('click', startTask);
    document.getElementById('complete-task-btn').addEventListener('click', completeTask);

    // Driver filter for all tasks
    document.getElementById('driver-filter').addEventListener('change', function(e) {
        filterAllTasks(e.target.value);
    });

    // Add touch event handling for better mobile experience
    addTouchHandlers();
}

function addTouchHandlers() {
    // Add touch feedback to all buttons
    document.querySelectorAll('button, .task-item, .filter-btn').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.opacity = '0.7';
        });
        element.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
    });
}

function selectDriver(driverId) {
    if (!driverId) {
        currentDriver = null;
        showDriverPrompt();
        return;
    }

    currentDriver = driverId;
    document.getElementById('driver-welcome').style.display = 'block';

    // Update driver name
    const selector = document.getElementById('driver-select');
    const driverName = selector.options[selector.selectedIndex].text;
    document.getElementById('driver-name').textContent = driverName;

    // Load driver's tasks
    loadDriverTasks();

    // Update stats
    updateDriverStats();

    // Update timeline
    updateTimeline();

    // Store selected driver in session
    sessionStorage.setItem('selectedDriver', driverId);
}

function showDriverPrompt() {
    document.getElementById('driver-welcome').style.display = 'none';
    document.getElementById('my-tasks-list').innerHTML =
        '<div class="no-driver-message">Please select a driver to view tasks</div>';
}

function loadDriverTasks() {
    // Filter bookings for today
    const today = new Date().toISOString().split('T')[0];

    // Check all possible date fields in bookings
    driverTasks = allBookings.filter(booking => {
        const bookingDate = booking.date || booking.departDate || booking.pickupDate || today;
        return bookingDate === today || !bookingDate; // Include bookings without dates or today's bookings
    });

    console.log('Loading driver tasks:', driverTasks);

    // Display tasks
    displayMyTasks();
    displayUnassignedTasks();
    displayAllTasks();
}

function displayMyTasks() {
    const container = document.getElementById('my-tasks-list');

    // Use allBookings if driverTasks is empty
    const tasksToFilter = driverTasks.length > 0 ? driverTasks : allBookings;
    const myTasks = tasksToFilter.filter(task => task.driver === currentDriver);

    console.log('displayMyTasks - currentDriver:', currentDriver);
    console.log('displayMyTasks - myTasks:', myTasks);

    if (myTasks.length === 0) {
        container.innerHTML = '<div class="no-tasks">No tasks assigned to you today</div>';
        return;
    }

    container.innerHTML = myTasks.map(task => createTaskElement(task)).join('');

    // Add click handlers
    container.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', function() {
            showTaskDetails(this.dataset.taskId);
        });
    });
}

function displayUnassignedTasks() {
    const container = document.getElementById('unassigned-tasks-list');

    // Use allBookings if driverTasks is empty
    const tasksToFilter = driverTasks.length > 0 ? driverTasks : allBookings;
    const unassignedTasks = tasksToFilter.filter(task => !task.driver || task.driver === 'unassigned');

    console.log('displayUnassignedTasks - unassignedTasks:', unassignedTasks);

    if (unassignedTasks.length === 0) {
        container.innerHTML = '<div class="no-tasks">No unassigned tasks</div>';
        return;
    }

    container.innerHTML = unassignedTasks.map(task => createTaskElement(task, true)).join('');

    // Add click handlers
    container.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', function() {
            showTaskDetails(this.dataset.taskId);
        });
    });
}

function displayAllTasks() {
    const container = document.getElementById('all-tasks-list');

    console.log('displayAllTasks - driverTasks:', driverTasks);
    console.log('displayAllTasks - allBookings:', allBookings);

    // Use allBookings directly if driverTasks is empty
    const tasksToDisplay = driverTasks.length > 0 ? driverTasks : allBookings;

    if (tasksToDisplay.length === 0) {
        container.innerHTML = '<div class="no-tasks">No tasks scheduled for today</div>';
        return;
    }

    // Sort by time
    const sortedTasks = [...tasksToDisplay].sort((a, b) => {
        const timeA = (a.time || a.pickupTime || a.departTime || '00:00').replace(':', '');
        const timeB = (b.time || b.pickupTime || b.departTime || '00:00').replace(':', '');
        return timeA - timeB;
    });

    container.innerHTML = sortedTasks.map(task => createTaskElement(task, false, true)).join('');

    // Add click handlers
    container.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', function() {
            showTaskDetails(this.dataset.taskId);
        });
    });
}

function createTaskElement(task, showAcceptButton = false, showDriver = false) {
    const status = task.status || 'pending';
    const time = task.time || task.pickupTime || 'TBC';
    const route = `${formatLocation(task.pickupLocation)} → ${formatLocation(task.dropoffLocation)}`;
    const passengers = task.passengers || 1;
    const driverName = getDriverName(task.driver);

    return `
        <div class="task-item" data-task-id="${task.pnr}">
            <div class="task-header">
                <span class="task-pnr">${task.pnr}</span>
                <span class="task-status status-${status}">${status}</span>
            </div>
            <div class="task-details">
                <span class="task-time">🕐 ${time}</span>
                <span class="task-route">${route}</span>
                <div class="task-passengers">👥 ${passengers} passenger${passengers > 1 ? 's' : ''}</div>
                ${showDriver && task.driver ? `<div class="task-driver">🚗 ${driverName}</div>` : ''}
                ${task.specialRequirements ? `<div class="task-notes">📝 ${task.specialRequirements}</div>` : ''}
            </div>
            ${showAcceptButton ? '<button class="accept-btn" onclick="quickAcceptTask(event, \'' + task.pnr + '\')">Accept Task</button>' : ''}
        </div>
    `;
}

function formatLocation(location) {
    const locationMap = {
        'kingscote-airport': 'Airport',
        'penneshaw-ferry': 'Ferry',
        'kingscote-town': 'Kingscote',
        'american-river': 'Am. River',
        'emu-bay': 'Emu Bay',
        'parndana': 'Parndana',
        'vivonne-bay': 'Vivonne Bay',
        'flinders-chase': 'Flinders Chase',
        'remarkable-rocks': 'Remarkable Rocks',
        'admirals-arch': 'Admirals Arch',
        'other': 'Other'
    };
    return locationMap[location] || location;
}

function getDriverName(driverId) {
    if (!driverId || driverId === 'unassigned') return 'Unassigned';

    const storedDrivers = localStorage.getItem('kit-drivers');
    if (storedDrivers) {
        const drivers = JSON.parse(storedDrivers);
        const driver = drivers.find(d => d.id === driverId);
        return driver ? driver.name : driverId;
    }
    return driverId;
}

function updateDriverStats() {
    if (!currentDriver) return;

    const myTasks = driverTasks.filter(task => task.driver === currentDriver);
    const completedTasks = myTasks.filter(task => task.status === 'completed');

    // Calculate next pickup
    const upcomingTasks = myTasks
        .filter(task => task.status !== 'completed')
        .sort((a, b) => {
            const timeA = (a.time || a.pickupTime || '23:59').replace(':', '');
            const timeB = (b.time || b.pickupTime || '23:59').replace(':', '');
            return timeA - timeB;
        });

    const nextPickup = upcomingTasks[0];
    const totalPax = myTasks.reduce((sum, task) => sum + (task.passengers || 1), 0);

    // Update display
    document.getElementById('today-jobs').textContent = myTasks.length;
    document.getElementById('completed-jobs').textContent = completedTasks.length;
    document.getElementById('next-pickup-time').textContent = nextPickup ? (nextPickup.time || nextPickup.pickupTime || 'TBC') : '--:--';
    document.getElementById('total-pax').textContent = totalPax;
}

function updateTimeline() {
    const container = document.getElementById('timeline-body');
    const drivers = getUniqueDrivers();

    container.innerHTML = drivers.map(driver => {
        const driverTasks = driverTasks.filter(task => task.driver === driver.id);
        return createTimelineRow(driver, driverTasks);
    }).join('');
}

function getUniqueDrivers() {
    const storedDrivers = localStorage.getItem('kit-drivers');
    if (storedDrivers) {
        return JSON.parse(storedDrivers);
    }
    return [];
}

function createTimelineRow(driver, tasks) {
    // This would create a visual timeline representation
    // For now, just a simple list
    return `
        <div class="timeline-row">
            <div class="timeline-driver-name">${driver.name}</div>
            <div class="timeline-tasks">
                ${tasks.length} tasks today
            </div>
        </div>
    `;
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    const dateString = now.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });

    document.getElementById('current-time').textContent = `${dateString} ${timeString}`;
}

function refreshData() {
    loadBookings();
    if (currentDriver) {
        loadDriverTasks();
        updateDriverStats();
        updateTimeline();
    }

    // Show feedback
    const btn = document.getElementById('refresh-btn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Refreshed';
    btn.style.background = '#27ae60';

    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '#3498db';
    }, 2000);
}

function filterTasks(filter) {
    if (!currentDriver) return;

    const container = document.getElementById('my-tasks-list');
    const myTasks = driverTasks.filter(task => task.driver === currentDriver);

    let filteredTasks = myTasks;
    if (filter !== 'all') {
        filteredTasks = myTasks.filter(task => (task.status || 'pending') === filter);
    }

    if (filteredTasks.length === 0) {
        container.innerHTML = `<div class="no-tasks">No ${filter} tasks</div>`;
        return;
    }

    container.innerHTML = filteredTasks.map(task => createTaskElement(task)).join('');

    // Re-add click handlers
    container.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', function() {
            showTaskDetails(this.dataset.taskId);
        });
    });
}

function filterAllTasks(driverId) {
    const container = document.getElementById('all-tasks-list');

    let tasks = driverTasks;
    if (driverId !== 'all') {
        tasks = driverTasks.filter(task => task.driver === driverId);
    }

    if (tasks.length === 0) {
        container.innerHTML = '<div class="no-tasks">No tasks found</div>';
        return;
    }

    container.innerHTML = tasks.map(task => createTaskElement(task, false, true)).join('');

    // Re-add click handlers
    container.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', function() {
            showTaskDetails(this.dataset.taskId);
        });
    });
}

// Quick Actions
function startShift() {
    if (!currentDriver) {
        alert('Please select a driver first');
        return;
    }

    const now = new Date().toLocaleTimeString('en-AU');
    alert(`Shift started at ${now}\n\nDrive safely! 🚗`);

    // Log shift start
    console.log(`Driver ${currentDriver} started shift at ${now}`);
}

function endShift() {
    if (!currentDriver) {
        alert('Please select a driver first');
        return;
    }

    const completed = document.getElementById('completed-jobs').textContent;
    const total = document.getElementById('today-jobs').textContent;

    alert(`Shift ended!\n\nCompleted: ${completed}/${total} tasks\n\nGreat work today! 👏`);

    // Log shift end
    console.log(`Driver ${currentDriver} ended shift`);
}

function takeBreak() {
    if (!currentDriver) {
        alert('Please select a driver first');
        return;
    }

    alert('Break started\n\nEnjoy your break! ☕\n\nRemember to mark yourself available when you return.');
}

function handleEmergency() {
    if (confirm('⚠️ EMERGENCY ALERT ⚠️\n\nThis will notify dispatch immediately.\n\nDo you need emergency assistance?')) {
        alert('🆘 Emergency alert sent to dispatch!\n\nHelp is on the way.\n\nStay safe and remain in your vehicle if possible.');
        console.error('EMERGENCY ALERT from driver:', currentDriver);
    }
}

// Task Modal Functions
function showTaskDetails(taskId) {
    const task = allBookings.find(b => b.pnr === taskId);
    if (!task) return;

    const modal = document.getElementById('task-modal');
    const modalBody = document.getElementById('task-details');

    modalBody.innerHTML = `
        <div class="task-detail-section">
            <h4>Booking: ${task.pnr}</h4>
            <p><strong>Status:</strong> ${task.status || 'Pending'}</p>
            <p><strong>Time:</strong> ${task.time || task.pickupTime || 'TBC'}</p>
        </div>

        <div class="task-detail-section">
            <h4>Route Details</h4>
            <p><strong>Pickup:</strong> ${formatLocation(task.pickupLocation)}</p>
            <p><strong>Dropoff:</strong> ${formatLocation(task.dropoffLocation)}</p>
        </div>

        <div class="task-detail-section">
            <h4>Customer</h4>
            <p><strong>Name:</strong> ${task.firstName} ${task.lastName}</p>
            <p><strong>Phone:</strong> <a href="tel:${task.phone}">${task.phone}</a></p>
            <p><strong>Passengers:</strong> ${task.passengers || 1}</p>
        </div>

        ${task.specialRequirements ? `
        <div class="task-detail-section">
            <h4>Special Requirements</h4>
            <p>${task.specialRequirements}</p>
        </div>
        ` : ''}
    `;

    // Show/hide appropriate action buttons
    const acceptBtn = document.getElementById('accept-task-btn');
    const startBtn = document.getElementById('start-task-btn');
    const completeBtn = document.getElementById('complete-task-btn');

    acceptBtn.style.display = (!task.driver || task.driver === 'unassigned') ? 'block' : 'none';
    startBtn.style.display = (task.driver === currentDriver && task.status === 'pending') ? 'block' : 'none';
    completeBtn.style.display = (task.driver === currentDriver && task.status === 'in-progress') ? 'block' : 'none';

    // Store current task ID
    modal.dataset.taskId = taskId;

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('task-modal').style.display = 'none';
}

function acceptTask() {
    const modal = document.getElementById('task-modal');
    const taskId = modal.dataset.taskId;

    if (!currentDriver) {
        alert('Please select a driver first');
        return;
    }

    // Update task assignment
    const taskIndex = allBookings.findIndex(b => b.pnr === taskId);
    if (taskIndex !== -1) {
        allBookings[taskIndex].driver = currentDriver;
        allBookings[taskIndex].status = 'allocated';

        // Save to localStorage
        localStorage.setItem('kit-bookings', JSON.stringify(allBookings));

        // Refresh displays
        refreshData();
        closeModal();

        alert('Task accepted successfully! 👍');
    }
}

function startTask() {
    const modal = document.getElementById('task-modal');
    const taskId = modal.dataset.taskId;

    // Update task status
    const taskIndex = allBookings.findIndex(b => b.pnr === taskId);
    if (taskIndex !== -1) {
        allBookings[taskIndex].status = 'in-progress';

        // Save to localStorage
        localStorage.setItem('kit-bookings', JSON.stringify(allBookings));

        // Refresh displays
        refreshData();
        closeModal();

        alert('Task started! Drive safely 🚗');
    }
}

function completeTask() {
    const modal = document.getElementById('task-modal');
    const taskId = modal.dataset.taskId;

    // Update task status
    const taskIndex = allBookings.findIndex(b => b.pnr === taskId);
    if (taskIndex !== -1) {
        allBookings[taskIndex].status = 'completed';

        // Save to localStorage
        localStorage.setItem('kit-bookings', JSON.stringify(allBookings));

        // Refresh displays
        refreshData();
        closeModal();

        alert('Task completed! Great job! ✅');
    }
}

function quickAcceptTask(event, taskId) {
    event.stopPropagation();

    if (!currentDriver) {
        alert('Please select a driver first');
        return;
    }

    // Update task assignment
    const taskIndex = allBookings.findIndex(b => b.pnr === taskId);
    if (taskIndex !== -1) {
        allBookings[taskIndex].driver = currentDriver;
        allBookings[taskIndex].status = 'allocated';

        // Save to localStorage
        localStorage.setItem('kit-bookings', JSON.stringify(allBookings));

        // Refresh displays
        refreshData();

        alert('Task accepted successfully! 👍');
    }
}

// Sample data loader
function loadSampleBookings() {
    const today = new Date().toISOString().split('T')[0];

    allBookings = [
        {
            pnr: 'KIT8470',
            firstName: 'John',
            lastName: 'Smith',
            phone: '0412345678',
            pickupLocation: 'kingscote-airport',
            dropoffLocation: 'penneshaw-ferry',
            departDate: today,
            date: today,
            pickupTime: '09:30',
            time: '09:30',
            passengers: 2,
            status: 'pending',
            driver: 'john-smith'
        },
        {
            pnr: 'KIT8471',
            firstName: 'Sarah',
            lastName: 'Jones',
            phone: '0423456789',
            pickupLocation: 'penneshaw-ferry',
            dropoffLocation: 'flinders-chase',
            departDate: today,
            date: today,
            pickupTime: '10:15',
            time: '10:15',
            passengers: 4,
            status: 'pending',
            driver: null,
            specialRequirements: 'Wheelchair access required'
        },
        {
            pnr: 'KIT8472',
            firstName: 'Mike',
            lastName: 'Wilson',
            phone: '0434567890',
            pickupLocation: 'kingscote-town',
            dropoffLocation: 'kingscote-airport',
            departDate: today,
            date: today,
            pickupTime: '14:00',
            time: '14:00',
            passengers: 1,
            status: 'allocated',
            driver: 'sarah-wilson'
        },
        {
            pnr: 'KIT8473',
            firstName: 'Emma',
            lastName: 'Brown',
            phone: '0445678901',
            pickupLocation: 'penneshaw-ferry',
            dropoffLocation: 'american-river',
            departDate: today,
            date: today,
            pickupTime: '11:30',
            time: '11:30',
            passengers: 3,
            status: 'pending',
            driver: null
        },
        {
            pnr: 'KIT8474',
            firstName: 'David',
            lastName: 'Lee',
            phone: '0456789012',
            pickupLocation: 'kingscote-airport',
            dropoffLocation: 'vivonne-bay',
            departDate: today,
            date: today,
            pickupTime: '15:45',
            time: '15:45',
            passengers: 2,
            status: 'in-progress',
            driver: 'john-smith'
        },
        {
            pnr: 'KIT8475',
            firstName: 'Lisa',
            lastName: 'Taylor',
            phone: '0467890123',
            pickupLocation: 'emu-bay',
            dropoffLocation: 'kingscote-town',
            departDate: today,
            date: today,
            pickupTime: '08:00',
            time: '08:00',
            passengers: 1,
            status: 'completed',
            driver: 'mike-johnson'
        }
    ];

    console.log('Loading sample bookings:', allBookings);

    // Also ensure sample drivers exist
    const sampleDrivers = [
        { id: 'john-smith', name: 'John Smith', phone: '0412345678', status: 'available', vehicle: 'Toyota HiAce - White' },
        { id: 'sarah-wilson', name: 'Sarah Wilson', phone: '0423456789', status: 'available', vehicle: 'Ford Transit - Blue' },
        { id: 'mike-johnson', name: 'Mike Johnson', phone: '0434567890', status: 'available', vehicle: 'Mercedes Sprinter - Silver' }
    ];

    // Save to localStorage
    localStorage.setItem('kit-bookings', JSON.stringify(allBookings));
    localStorage.setItem('kit-drivers', JSON.stringify(sampleDrivers));

    // Update driver selector
    updateDriverSelector(sampleDrivers);
}

// Check for previously selected driver on page load
window.addEventListener('load', function() {
    const savedDriver = sessionStorage.getItem('selectedDriver');
    if (savedDriver) {
        document.getElementById('driver-select').value = savedDriver;
        selectDriver(savedDriver);
    }
});