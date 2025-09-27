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
    setupPricingCalculation();
    setupCustomTimePickers();

    function setupFormInteractions() {
        // Set customer type to private for public users
        const customerType = 'private';

        // Trip type change handler
        const tripTypeSelect = document.getElementById('trip-type');
        const returnDateTimeGroup = document.getElementById('return-datetime');
        const returnDateInput = document.getElementById('return-date');
        const returnTimeInput = document.getElementById('return-time');

        tripTypeSelect.addEventListener('change', function() {
            if (this.value === 'return') {
                returnDateTimeGroup.style.display = 'grid';
                returnDateInput.setAttribute('required', 'required');

                // Handle custom time picker for return time
                const returnTimePicker = returnDateTimeGroup.querySelector('.custom-time-picker');
                if (returnTimePicker) {
                    returnTimePicker.setAttribute('data-required', 'true');
                    const returnTimeValue = returnTimePicker.querySelector('.time-value');
                    if (returnTimeValue) {
                        returnTimeValue.setAttribute('required', 'required');
                    }
                }
            } else {
                returnDateTimeGroup.style.display = 'none';
                returnDateInput.removeAttribute('required');
                returnDateInput.value = '';

                // Handle custom time picker for return time
                const returnTimePicker = returnDateTimeGroup.querySelector('.custom-time-picker');
                if (returnTimePicker) {
                    returnTimePicker.setAttribute('data-required', 'false');
                    const returnTimeValue = returnTimePicker.querySelector('.time-value');
                    const returnTimeDisplay = returnTimePicker.querySelector('.time-display');
                    if (returnTimeValue) {
                        returnTimeValue.removeAttribute('required');
                        returnTimeValue.value = '';
                    }
                    if (returnTimeDisplay) {
                        returnTimeDisplay.value = '';
                    }
                    // Clear selections
                    const selectedOptions = returnTimePicker.querySelectorAll('.time-option.selected');
                    selectedOptions.forEach(opt => opt.classList.remove('selected'));
                }
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

    // Setup pricing calculation
    setupPricingCalculation();

    function setupPricingCalculation() {
        const pricingSection = document.getElementById('pricing-section');
        const baseRateElement = document.getElementById('base-rate');
        const returnRateElement = document.getElementById('return-rate');
        const returnPriceRow = document.getElementById('return-price-row');
        const totalPriceElement = document.getElementById('total-price');
        const paymentMethodSelect = document.getElementById('payment-method');

        // Mock pricing data (in Phase 2, this will come from an API)
        const pricingData = {
            'kingscote-airport': {
                'penneshaw-ferry': 45,
                'kingscote-town': 15,
                'american-river': 25,
                'emu-bay': 35,
                'parndana': 40,
                'vivonne-bay': 65,
                'flinders-chase': 85,
                'remarkable-rocks': 90,
                'admirals-arch': 95
            },
            'penneshaw-ferry': {
                'kingscote-airport': 45,
                'kingscote-town': 35,
                'american-river': 40,
                'emu-bay': 50,
                'parndana': 55,
                'vivonne-bay': 70,
                'flinders-chase': 90,
                'remarkable-rocks': 95,
                'admirals-arch': 100
            },
            'kingscote-town': {
                'kingscote-airport': 15,
                'penneshaw-ferry': 35,
                'american-river': 20,
                'emu-bay': 25,
                'parndana': 30,
                'vivonne-bay': 55,
                'flinders-chase': 75,
                'remarkable-rocks': 80,
                'admirals-arch': 85
            }
        };

        function calculatePrice() {
            const pickup = document.getElementById('pickup-location').value;
            const dropoff = document.getElementById('dropoff-location').value;
            const tripType = document.getElementById('trip-type').value;
            const passengers = parseInt(document.getElementById('passengers').value) || 1;

            if (!pickup || !dropoff) {
                pricingSection.style.display = 'none';
                return;
            }

            // Base rate calculation
            let baseRate = 0;
            if (pricingData[pickup] && pricingData[pickup][dropoff]) {
                baseRate = pricingData[pickup][dropoff];
            } else {
                // Default rate for unmapped routes
                baseRate = 50;
            }

            // Passenger multiplier for larger groups
            if (passengers > 4) {
                baseRate *= 1.2; // 20% increase for larger groups
            }

            let returnRate = 0;
            if (tripType === 'return') {
                returnRate = baseRate; // Same rate for return trip
                returnPriceRow.style.display = 'flex';
            } else {
                returnPriceRow.style.display = 'none';
            }

            const totalPrice = baseRate + returnRate;

            // Update display
            baseRateElement.textContent = `$${baseRate.toFixed(2)}`;
            returnRateElement.textContent = `$${returnRate.toFixed(2)}`;
            totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;

            // Show pricing section
            pricingSection.style.display = 'block';

            // Update payment method options based on customer type
            updatePaymentMethodOptions();
        }

        function updatePaymentMethodOptions() {
            // Public users only - no special payment method logic needed
        }

        // Add event listeners for price calculation
        document.getElementById('pickup-location').addEventListener('change', calculatePrice);
        document.getElementById('dropoff-location').addEventListener('change', calculatePrice);
        document.getElementById('trip-type').addEventListener('change', calculatePrice);
        document.getElementById('passengers').addEventListener('change', calculatePrice);
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const booking = {
            // Customer Information
            customerType: 'private',
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


            // Additional Information
            specialRequirements: formData.get('specialRequirements') || ''
        };

        // Validate form
        if (validateForm(booking)) {
            showConfirmationPage(booking);
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

    function showConfirmationPage(booking) {
        // Remove any existing error messages
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());

        // Generate PNR (Passenger Name Record)
        const pnr = generatePNR();

        // Calculate total price for confirmation
        const totalPrice = calculateTotalPrice(booking);

        // Create confirmation page
        const confirmationPage = document.createElement('div');
        confirmationPage.className = 'confirmation-page';
        confirmationPage.innerHTML = `
            <div class="confirmation-header">
                <h2>Review Your Booking</h2>
                <p class="confirmation-subtitle">Please review the details below and proceed with payment</p>
                <div class="booking-reference">
                    <strong>Booking Reference: ${pnr}</strong>
                </div>
            </div>

            <div class="confirmation-details">
                <div class="detail-section">
                    <h3>Customer Information</h3>
                    <div class="detail-grid">
                        <div><strong>Name:</strong> ${booking.title ? booking.title + ' ' : ''}${booking.firstName} ${booking.lastName}</div>
                        ${booking.email ? `<div><strong>Email:</strong> ${booking.email}</div>` : ''}
                        ${booking.phone ? `<div><strong>Phone:</strong> ${booking.phone}</div>` : ''}
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Trip Details</h3>
                    <div class="detail-grid">
                        <div><strong>Trip Type:</strong> ${booking.tripType === 'one-way' ? 'One Way' : 'Return Trip'}</div>
                        <div><strong>From:</strong> ${getLocationName(booking.pickupLocation)}</div>
                        <div><strong>To:</strong> ${getLocationName(booking.dropoffLocation)}</div>
                        <div><strong>Departure:</strong> ${formatDate(booking.departDate)} at ${formatTime(booking.departTime)}</div>
                        ${booking.tripType === 'return' && booking.returnDate ? `<div><strong>Return:</strong> ${formatDate(booking.returnDate)} at ${formatTime(booking.returnTime)}</div>` : ''}
                        <div><strong>Passengers:</strong> ${booking.passengers}</div>
                        ${booking.travellerNames ? `<div><strong>Traveller Names:</strong> ${booking.travellerNames}</div>` : ''}
                    </div>
                </div>

                ${booking.specialRequirements ? `
                <div class="detail-section">
                    <h3>Special Requirements</h3>
                    <div class="special-requirements">${booking.specialRequirements}</div>
                </div>` : ''}

                <div class="detail-section price-summary-confirm">
                    <h3>Price Summary</h3>
                    <div class="price-breakdown-confirm">
                        <div class="price-line">
                            <span>Base Rate:</span>
                            <span>$${totalPrice.baseRate.toFixed(2)}</span>
                        </div>
                        ${totalPrice.returnRate > 0 ? `
                        <div class="price-line">
                            <span>Return Trip:</span>
                            <span>$${totalPrice.returnRate.toFixed(2)}</span>
                        </div>` : ''}
                        <div class="price-line total-line">
                            <span><strong>Total Amount:</strong></span>
                            <span><strong>$${totalPrice.total.toFixed(2)}</strong></span>
                        </div>
                    </div>
                </div>

                <div class="detail-section payment-method-confirm">
                    <h3>Payment Method</h3>
                    <div class="payment-method-display-confirm">
                        <div class="payment-badge-confirm">💳 Credit Card Payment</div>
                        <small>Secure online payment processing</small>
                    </div>
                </div>
            </div>

            <div class="confirmation-actions">
                <button type="button" class="btn-back" onclick="goBackToForm()">← Back to Edit</button>
                <button type="button" class="btn-pay-now" onclick="processPayment('${pnr}', ${totalPrice.total})">Pay Now - $${totalPrice.total.toFixed(2)}</button>
            </div>
        `;

        // Replace form with confirmation page
        form.style.display = 'none';
        form.parentNode.insertBefore(confirmationPage, form);

        // Store booking data for potential back navigation
        window.currentBooking = booking;
        window.currentPNR = pnr;

        // Scroll to top
        confirmationPage.scrollIntoView({ behavior: 'smooth' });
    }

    // Function to calculate total price for confirmation
    function calculateTotalPrice(booking) {
        const pickup = booking.pickupLocation;
        const dropoff = booking.dropoffLocation;
        const tripType = booking.tripType;
        const passengers = parseInt(booking.passengers) || 1;

        // Use the same pricing data as the form
        const pricingData = {
            'kingscote-airport': {
                'penneshaw-ferry': 45,
                'kingscote-town': 15,
                'american-river': 25,
                'emu-bay': 35,
                'parndana': 40,
                'vivonne-bay': 65,
                'flinders-chase': 85,
                'remarkable-rocks': 90,
                'admirals-arch': 95
            },
            'penneshaw-ferry': {
                'kingscote-airport': 45,
                'kingscote-town': 35,
                'american-river': 40,
                'emu-bay': 50,
                'parndana': 55,
                'vivonne-bay': 70,
                'flinders-chase': 90,
                'remarkable-rocks': 95,
                'admirals-arch': 100
            },
            'kingscote-town': {
                'kingscote-airport': 15,
                'penneshaw-ferry': 35,
                'american-river': 20,
                'emu-bay': 25,
                'parndana': 30,
                'vivonne-bay': 55,
                'flinders-chase': 75,
                'remarkable-rocks': 80,
                'admirals-arch': 85
            }
        };

        let baseRate = 0;
        if (pricingData[pickup] && pricingData[pickup][dropoff]) {
            baseRate = pricingData[pickup][dropoff];
        } else {
            baseRate = 50; // Default rate
        }

        // Passenger multiplier for larger groups
        if (passengers > 4) {
            baseRate *= 1.2;
        }

        let returnRate = 0;
        if (tripType === 'return') {
            returnRate = baseRate;
        }

        return {
            baseRate: baseRate,
            returnRate: returnRate,
            total: baseRate + returnRate
        };
    }

    // Global functions for confirmation page actions
    window.goBackToForm = function() {
        const confirmationPage = document.querySelector('.confirmation-page');
        if (confirmationPage) {
            confirmationPage.remove();
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth' });
        }
    };

    window.processPayment = function(pnr, amount) {
        // Simulate payment processing
        const confirmationPage = document.querySelector('.confirmation-page');
        confirmationPage.innerHTML = `
            <div class="payment-processing">
                <div class="processing-spinner"></div>
                <h2>Processing Payment...</h2>
                <p>Please wait while we process your credit card payment of $${amount.toFixed(2)}</p>
                <p><strong>Booking Reference: ${pnr}</strong></p>
            </div>
        `;

        // Simulate payment completion after 3 seconds
        setTimeout(() => {
            showPaymentSuccess(pnr, amount);
        }, 3000);
    };

    function showPaymentSuccess(pnr, amount) {
        const confirmationPage = document.querySelector('.confirmation-page');
        confirmationPage.innerHTML = `
            <div class="payment-success">
                <div class="success-icon">✅</div>
                <h2>Payment Successful!</h2>
                <p>Your booking has been confirmed and paid.</p>
                <div class="booking-details-final">
                    <div class="detail-row">
                        <strong>Booking Reference:</strong> ${pnr}
                    </div>
                    <div class="detail-row">
                        <strong>Amount Paid:</strong> $${amount.toFixed(2)}
                    </div>
                    <div class="detail-row">
                        <strong>Payment Method:</strong> Credit Card
                    </div>
                </div>
                <p>A confirmation email will be sent to you shortly. Please save your booking reference for future correspondence.</p>
                <button type="button" class="btn-new-booking" onclick="location.reload()">Make Another Booking</button>
            </div>
        `;
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
        if (!timeString || timeString === ':') return '';
        const [hours, minutes] = timeString.split(':');
        if (!hours || !minutes) return '';

        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-AU', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    function setupCustomTimePickers() {
        const timePickers = document.querySelectorAll('.custom-time-picker');

        timePickers.forEach(picker => {
            const displayInput = picker.querySelector('.time-display');
            const valueInput = picker.querySelector('.time-value');
            const popup = picker.querySelector('.time-popup');
            const hourOptions = picker.querySelectorAll('.hours-column .time-option');
            const minuteOptions = picker.querySelectorAll('.minutes-column .time-option');

            let selectedHour = '';
            let selectedMinute = '';

            // Handle display input click to show popup
            displayInput.addEventListener('click', function(e) {
                e.preventDefault();
                closeAllTimePickerPopups();
                popup.classList.add('show');
                displayInput.focus();
            });

            // Handle display input focus
            displayInput.addEventListener('focus', function() {
                closeAllTimePickerPopups();
                popup.classList.add('show');
            });

            // Handle hour selection
            hourOptions.forEach(option => {
                option.addEventListener('click', function() {
                    hourOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedHour = this.getAttribute('data-value');
                    updateTimeDisplay();
                });
            });

            // Handle minute selection
            minuteOptions.forEach(option => {
                option.addEventListener('click', function() {
                    minuteOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedMinute = this.getAttribute('data-value');
                    updateTimeDisplay();
                });
            });

            function updateTimeDisplay() {
                if (selectedHour && selectedMinute) {
                    const timeValue = selectedHour + ':' + selectedMinute;
                    const displayValue = formatTime(timeValue);

                    displayInput.value = displayValue;
                    valueInput.value = timeValue;

                    // Trigger change event for form validation and pricing calculation
                    const changeEvent = new Event('change', { bubbles: true });
                    valueInput.dispatchEvent(changeEvent);

                    // Close popup after selection
                    setTimeout(() => {
                        popup.classList.remove('show');
                    }, 150);
                }
            }

            // Set required attribute validation
            const isRequired = picker.getAttribute('data-required') === 'true';
            if (isRequired) {
                valueInput.setAttribute('required', 'required');

                // Custom validation message
                valueInput.addEventListener('invalid', function() {
                    this.setCustomValidity('Please select a time');
                });

                valueInput.addEventListener('input', function() {
                    this.setCustomValidity('');
                });
            }
        });

        // Close popup when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.custom-time-picker')) {
                closeAllTimePickerPopups();
            }
        });

        // Close popup on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAllTimePickerPopups();
            }
        });

        function closeAllTimePickerPopups() {
            const allPopups = document.querySelectorAll('.time-popup');
            allPopups.forEach(popup => popup.classList.remove('show'));
        }
    }
});