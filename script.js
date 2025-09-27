document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('booking-form');
    const departDateInput = document.getElementById('depart-date');
    const returnDateInput = document.getElementById('return-date');

    // Set minimum date to today and auto-populate departure date
    const today = new Date().toISOString().split('T')[0];
    departDateInput.setAttribute('min', today);
    returnDateInput.setAttribute('min', today);

    // Auto-populate departure date to today
    departDateInput.value = today;

    // Form interaction handlers
    setupFormInteractions();
    setupCustomerLookup();

    function setupFormInteractions() {
        // Customer type change handler
        const customerTypeSelect = document.getElementById('customer-type');
        const agentSection = document.getElementById('agent-section');

        customerTypeSelect.addEventListener('change', function() {
            if (this.value === 'agent') {
                agentSection.style.display = 'block';
            } else {
                agentSection.style.display = 'none';
            }
        });

        // Trip type change handler
        const tripTypeSelect = document.getElementById('trip-type');
        const returnDateTimeGroup = document.getElementById('return-datetime');
        const returnDateInput = document.getElementById('return-date');
        const returnTimeInput = document.getElementById('return-time');

        tripTypeSelect.addEventListener('change', function() {
            if (this.value === 'return') {
                returnDateTimeGroup.style.display = 'grid';
                returnDateInput.setAttribute('required', 'required');
                returnTimeInput.setAttribute('required', 'required');
            } else {
                returnDateTimeGroup.style.display = 'none';
                returnDateInput.removeAttribute('required');
                returnTimeInput.removeAttribute('required');
                returnDateInput.value = '';
                returnTimeInput.value = '';
            }
        });

        // Passenger count change handler
        const passengersSelect = document.getElementById('passengers');
        const travellerNamesGroup = document.getElementById('traveller-names-group');

        passengersSelect.addEventListener('change', function() {
            const passengerCount = parseInt(this.value);
            if (passengerCount > 2) {
                travellerNamesGroup.style.display = 'block';
            } else {
                travellerNamesGroup.style.display = 'none';
                document.getElementById('traveller-names').value = '';
            }
        });

        // Depart date change handler (for return date minimum)
        const departDateInput = document.getElementById('depart-date');
        departDateInput.addEventListener('change', function() {
            const departDate = this.value;
            returnDateInput.setAttribute('min', departDate);

            // If return date is before depart date, clear it
            if (returnDateInput.value && returnDateInput.value < departDate) {
                returnDateInput.value = '';
            }
        });
    }

    function setupCustomerLookup() {
        const phoneInput = document.getElementById('phone');
        const customerSuggestions = document.getElementById('customer-suggestions');
        const customerLookupResult = document.getElementById('customer-lookup-result');
        const firstNameInput = document.getElementById('first-name');
        const lastNameInput = document.getElementById('last-name');
        const emailInput = document.getElementById('email');
        const titleSelect = document.getElementById('title');
        const customerTypeSelect = document.getElementById('customer-type');

        let lookupTimeout;

        // Mock customer database (in Phase 2, this will be a real API call)
        const mockCustomers = [
            {
                phone: '0400123456',
                title: 'mr',
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@email.com',
                customerType: 'private'
            },
            {
                phone: '0412345678',
                title: 'mrs',
                firstName: 'Sarah',
                lastName: 'Jones',
                email: 'sarah.jones@email.com',
                customerType: 'corporate'
            },
            {
                phone: '0401234567',
                title: 'dr',
                firstName: 'John',
                lastName: 'Wilson',
                email: 'john.wilson@email.com',
                customerType: 'private'
            },
            {
                phone: '0412356789',
                title: 'ms',
                firstName: 'Sarah',
                lastName: 'Brown',
                email: 'sarah.brown@email.com',
                customerType: 'agent'
            }
        ];

        phoneInput.addEventListener('input', function() {
            const phone = this.value.trim();

            // Clear previous timeout
            clearTimeout(lookupTimeout);

            // Hide previous results
            customerSuggestions.style.display = 'none';
            customerLookupResult.style.display = 'none';

            // Only search if phone number has at least 3 digits
            if (phone.replace(/\D/g, '').length >= 3) {
                // Debounce the search to avoid too many calls
                lookupTimeout = setTimeout(() => {
                    searchCustomers(phone);
                }, 300);
            }
        });

        phoneInput.addEventListener('blur', function() {
            // Hide suggestions after a short delay (allows click to work)
            setTimeout(() => {
                customerSuggestions.style.display = 'none';
            }, 200);
        });

        phoneInput.addEventListener('focus', function() {
            const phone = this.value.trim();
            if (phone.replace(/\D/g, '').length >= 3) {
                searchCustomers(phone);
            }
        });

        function searchCustomers(phone) {
            const normalizedInput = phone.replace(/\D/g, '');

            // Find customers with matching phone numbers
            const matches = mockCustomers.filter(customer => {
                const customerPhone = customer.phone.replace(/\D/g, '');
                return customerPhone.includes(normalizedInput);
            });

            if (matches.length > 0) {
                showCustomerSuggestions(matches);
            } else {
                customerSuggestions.style.display = 'none';
            }
        }

        function showCustomerSuggestions(customers) {
            customerSuggestions.innerHTML = '';

            customers.forEach(customer => {
                const suggestionDiv = document.createElement('div');
                suggestionDiv.className = 'customer-suggestion';
                suggestionDiv.innerHTML = `
                    <div class="customer-name">${customer.title ? customer.title.charAt(0).toUpperCase() + customer.title.slice(1) + ' ' : ''}${customer.firstName} ${customer.lastName}</div>
                    <div class="customer-details">${customer.email}</div>
                    <div class="customer-phone">${customer.phone}</div>
                `;

                suggestionDiv.addEventListener('click', () => {
                    selectCustomer(customer);
                });

                customerSuggestions.appendChild(suggestionDiv);
            });

            customerSuggestions.style.display = 'block';
        }

        function selectCustomer(customer) {
            // Fill in customer details
            phoneInput.value = customer.phone;
            titleSelect.value = customer.title;
            firstNameInput.value = customer.firstName;
            lastNameInput.value = customer.lastName;
            emailInput.value = customer.email;
            customerTypeSelect.value = customer.customerType;

            // Hide suggestions and show welcome message
            customerSuggestions.style.display = 'none';
            customerLookupResult.style.display = 'block';

            // Trigger agent section if customer is agent
            if (customer.customerType === 'agent') {
                document.getElementById('agent-section').style.display = 'block';
            }
        }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const booking = {
            // Customer Information
            customerType: formData.get('customerType') || 'private',
            title: formData.get('title') || '',
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email') || '',
            phone: formData.get('phone'),

            // Trip Details
            tripType: formData.get('tripType'),
            pickupLocation: formData.get('pickupLocation'),
            dropoffLocation: formData.get('dropoffLocation'),
            departDate: formData.get('departDate'),
            departTime: formData.get('departTime'),
            returnDate: formData.get('returnDate') || '',
            returnTime: formData.get('returnTime') || '',
            passengers: formData.get('passengers'),
            travellerNames: formData.get('travellerNames') || '',

            // Agent Information
            agent: formData.get('agent') || '',
            agentReference: formData.get('agentReference') || '',

            // Additional Information
            specialRequirements: formData.get('specialRequirements') || ''
        };

        // Validate form
        if (validateForm(booking)) {
            submitBooking(booking);
        }
    });

    function validateForm(booking) {
        const errors = [];

        // Check customer required fields
        if (!booking.firstName.trim()) {
            errors.push('First name is required');
        }

        if (!booking.lastName.trim()) {
            errors.push('Last name is required');
        }

        if (!booking.phone.trim()) {
            errors.push('Mobile phone number is required');
        }

        // Check trip required fields
        if (!booking.tripType) {
            errors.push('Trip type is required');
        }

        if (!booking.pickupLocation) {
            errors.push('Pickup location is required');
        }

        if (!booking.dropoffLocation) {
            errors.push('Drop-off location is required');
        }

        if (!booking.departDate) {
            errors.push('Departure date is required');
        }

        if (!booking.departTime) {
            errors.push('Departure time is required');
        }

        if (!booking.passengers) {
            errors.push('Number of passengers is required');
        }

        // Check return trip requirements
        if (booking.tripType === 'return') {
            if (!booking.returnDate) {
                errors.push('Return date is required for return trips');
            }

            if (!booking.returnTime) {
                errors.push('Return time is required for return trips');
            }

            // Check if return date/time is after departure
            if (booking.returnDate && booking.returnTime && booking.departDate && booking.departTime) {
                const departDateTime = new Date(booking.departDate + 'T' + booking.departTime);
                const returnDateTime = new Date(booking.returnDate + 'T' + booking.returnTime);

                if (returnDateTime <= departDateTime) {
                    errors.push('Return date and time must be after departure date and time');
                }
            }
        }

        // Check if departure date/time is not in the past
        if (booking.departDate && booking.departTime) {
            const departDateTime = new Date(booking.departDate + 'T' + booking.departTime);
            const now = new Date();

            if (departDateTime < now) {
                errors.push('Please select a future departure date and time');
            }
        }

        // Email format validation
        if (booking.email && booking.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(booking.email)) {
                errors.push('Please enter a valid email address');
            }
        }

        // Show errors if any
        if (errors.length > 0) {
            showErrors(errors);
            return false;
        }

        return true;
    }

    function showErrors(errors) {
        // Remove existing error messages
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());

        // Create error container
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        errorContainer.innerHTML = `
            <h3>Please correct the following errors:</h3>
            <ul>
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `;

        // Insert error container at the top of the form
        form.insertBefore(errorContainer, form.firstChild);

        // Scroll to top of form
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function submitBooking(booking) {
        // Remove any existing error messages
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());

        // Generate PNR (Passenger Name Record)
        const pnr = generatePNR();

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <h3>Booking Request Submitted!</h3>
            <p><strong>Booking Reference: ${pnr}</strong></p>
            <p>Thank you for your booking request. Here are the details:</p>
            <ul>
                <li><strong>Customer:</strong> ${booking.title ? booking.title + ' ' : ''}${booking.firstName} ${booking.lastName}</li>
                ${booking.email ? `<li><strong>Email:</strong> ${booking.email}</li>` : ''}
                ${booking.phone ? `<li><strong>Phone:</strong> ${booking.phone}</li>` : ''}
                <li><strong>Trip Type:</strong> ${booking.tripType === 'one-way' ? 'One Way' : 'Return Trip'}</li>
                <li><strong>From:</strong> ${getLocationName(booking.pickupLocation)}</li>
                <li><strong>To:</strong> ${getLocationName(booking.dropoffLocation)}</li>
                <li><strong>Departure:</strong> ${formatDate(booking.departDate)} at ${formatTime(booking.departTime)}</li>
                ${booking.tripType === 'return' && booking.returnDate ? `<li><strong>Return:</strong> ${formatDate(booking.returnDate)} at ${formatTime(booking.returnTime)}</li>` : ''}
                <li><strong>Passengers:</strong> ${booking.passengers}</li>
                ${booking.travellerNames ? `<li><strong>Traveller Names:</strong> ${booking.travellerNames}</li>` : ''}
                ${booking.agent ? `<li><strong>Agent:</strong> ${getAgentName(booking.agent)}</li>` : ''}
                ${booking.agentReference ? `<li><strong>Agent Reference:</strong> ${booking.agentReference}</li>` : ''}
                ${booking.specialRequirements ? `<li><strong>Special Requirements:</strong> ${booking.specialRequirements}</li>` : ''}
            </ul>
            <p>We will contact you shortly to confirm your transfer and provide pricing details.</p>
        `;

        // Replace form with success message
        form.style.display = 'none';
        form.parentNode.insertBefore(successMessage, form);

        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // In a real application, you would send this data to a server
        console.log('Booking submitted:', { ...booking, pnr });
    }

    function generatePNR() {
        // Generate a PNR in format like "KIT8470" (KIT + 4 digit number)
        const prefix = 'KIT';
        const number = Math.floor(Math.random() * 9000) + 1000; // 4-digit number between 1000-9999
        return prefix + number;
    }

    function getLocationName(locationValue) {
        const locationMap = {
            'kingscote-airport': 'Kingscote Airport',
            'penneshaw-ferry': 'Penneshaw Ferry Terminal',
            'kingscote-town': 'Kingscote Town',
            'american-river': 'American River',
            'emu-bay': 'Emu Bay',
            'parndana': 'Parndana',
            'vivonne-bay': 'Vivonne Bay',
            'flinders-chase': 'Flinders Chase National Park',
            'remarkable-rocks': 'Remarkable Rocks',
            'admirals-arch': 'Admirals Arch',
            'other': 'Other Location'
        };
        return locationMap[locationValue] || locationValue;
    }

    function getAgentName(agentValue) {
        const agentMap = {
            'exceptional-ki': 'Exceptional Kangaroo Island',
            'southern-surgical': 'Southern Surgical',
            'across-australia': 'Across Australia (Goway Travel)',
            'aot-inbound': 'AOT Inbound Pty Ltd',
            'pamdana-sports': 'Pamdana Sports Club',
            'helloworld': 'Helloworld Travel',
            'pan-pacific': 'Pan Pacific Travel',
            'sea-dragon': 'Sea Dragon Lodge',
            'other': 'Other Agent'
        };
        return agentMap[agentValue] || agentValue;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-AU', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
});