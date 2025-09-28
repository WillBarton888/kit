// Navigation System for KIT
function createNavigation() {
    // Get current page
    const currentPage = getCurrentPage();

    // Create navigation HTML
    const navHTML = `
        <nav class="kit-nav">
            <div class="nav-container">
                <div class="nav-logo">🏝️ Kangaroo Island Transfers</div>
                <div class="nav-tabs">
                    <a href="index.html" class="nav-tab ${currentPage === 'public' ? 'active' : ''}">
                        📱 Public Booking
                    </a>
                    <a href="staff.html" class="nav-tab ${currentPage === 'staff' ? 'active' : ''}">
                        👔 Add Booking
                    </a>
                    <a href="drivers.html" class="nav-tab ${currentPage === 'drivers' ? 'active' : ''}">
                        🚗 Drivers Portal
                    </a>
                    <a href="manage.html" class="nav-tab ${currentPage === 'manage' ? 'active' : ''}">
                        📋 Management
                    </a>
                </div>
                <div class="nav-info" id="nav-info">
                    <!-- Dynamic info will be inserted here -->
                </div>
            </div>
        </nav>
    `;

    // Insert navigation at the top of the body
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Add navigation class to body
    document.body.classList.add('has-navigation');

    // Update navigation info
    updateNavigationInfo();

    // Set up periodic updates
    setInterval(updateNavigationInfo, 30000); // Update every 30 seconds
}

function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().toLowerCase();

    if (filename === 'index.html' || filename === '') {
        return 'public';
    } else if (filename === 'staff.html') {
        return 'staff';
    } else if (filename === 'drivers.html') {
        return 'drivers';
    } else if (filename === 'manage.html') {
        return 'manage';
    }
    return 'unknown';
}

function updateNavigationInfo() {
    const navInfo = document.getElementById('nav-info');
    if (!navInfo) return;

    const currentPage = getCurrentPage();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Get booking stats
    const bookings = JSON.parse(localStorage.getItem('kit-bookings') || '[]');
    const today = now.toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.departDate === today);
    const pendingBookings = bookings.filter(b => b.status === 'pending');

    let infoHTML = '';

    switch (currentPage) {
        case 'public':
            infoHTML = `
                <span>Customer Portal</span> •
                <span>${timeStr}</span>
            `;
            break;

        case 'staff':
            const drafts = localStorage.getItem('staff-booking-draft') ? 1 : 0;
            infoHTML = `
                <span>Staff: Will Barton</span> •
                <span>${todayBookings.length} today</span> •
                <span>${drafts} draft${drafts !== 1 ? 's' : ''}</span> •
                <span>${timeStr}</span>
            `;
            break;

        case 'drivers':
            const unassignedTasks = bookings.filter(b => !b.driver || b.driver === 'unassigned');
            const myTasksCount = sessionStorage.getItem('selectedDriver') ?
                bookings.filter(b => b.driver === sessionStorage.getItem('selectedDriver')).length : 0;
            infoHTML = `
                <span>${myTasksCount} my tasks</span> •
                <span>${unassignedTasks.length} unassigned</span> •
                <span>${todayBookings.length} total today</span> •
                <span>${timeStr}</span>
            `;
            break;

        case 'manage':
            const drivers = JSON.parse(localStorage.getItem('kit-drivers') || '[]');
            const availableDrivers = drivers.filter(d => d.status === 'available');
            infoHTML = `
                <span>${todayBookings.length} today</span> •
                <span>${pendingBookings.length} pending</span> •
                <span>${availableDrivers.length} drivers free</span> •
                <span>${timeStr}</span>
            `;
            break;

        default:
            infoHTML = `<span>${timeStr}</span>`;
    }

    navInfo.innerHTML = infoHTML;
}

// Auto-initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    createNavigation();
});

// Update navigation info when localStorage changes (for cross-tab updates)
window.addEventListener('storage', function(e) {
    if (e.key && (e.key.startsWith('kit-') || e.key.startsWith('staff-'))) {
        updateNavigationInfo();
    }
});

// Make functions globally available
window.createNavigation = createNavigation;
window.updateNavigationInfo = updateNavigationInfo;