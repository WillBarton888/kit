// Staff Booking System JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('staff-booking-form');
    const departDateInput = document.getElementById('staff-depart-date');
    const returnDateInput = document.getElementById('staff-return-date');

    // Set minimum date to today and auto-populate departure date
    const today = new Date().toISOString().split('T')[0];
    departDateInput.setAttribute('min', today);
    returnDateInput.setAttribute('min', today);
    departDateInput.value = today;

    // Initialize staff form interactions
    setupStaffFormInteractions();
    setupStaffCustomerLookup();
    setupStaffKeyboardShortcuts();

    // Initialize custom time pickers directly
    setTimeout(() => {
        console.log('Initializing custom time pickers for staff page...');
        initializeStaffTimePickers();
    }, 100);

    function setupStaffFormInteractions() {
        // Trip type change handler
        const tripTypeSelect = document.getElementById('staff-trip-type');
        const returnRow = document.getElementById('staff-return-row');
        const returnDateInput = document.getElementById('staff-return-date');
        const returnTimeInput = document.querySelector('[data-name="returnTime"] .time-value');

        tripTypeSelect.addEventListener('change', function() {
            const multiTransferSection = document.getElementById('staff-multi-transfer-section');

            if (this.value === 'return') {
                returnRow.style.display = 'grid';
                returnDateInput.setAttribute('required', 'required');
                // For custom time picker, set required on the display input
                const returnTimeDisplay = document.querySelector('[data-name="returnTime"] .time-display');
                if (returnTimeDisplay) {
                    returnTimeDisplay.setAttribute('required', 'required');
                }
                multiTransferSection.style.display = 'none';

                // Show the original pickup/dropoff/date/time rows for return trip
                const originalLocationRow = document.querySelector('.form-row-staff:has(#staff-pickup)');
                const originalDateTimeRow = document.querySelector('.form-row-staff:has(#staff-depart-date)');
                if (originalLocationRow) originalLocationRow.style.display = 'grid';
                if (originalDateTimeRow) originalDateTimeRow.style.display = 'grid';
            } else if (this.value === 'multi-transfer') {
                returnRow.style.display = 'none';
                returnDateInput.removeAttribute('required');
                // Clear return time inputs
                const returnTimeDisplay = document.querySelector('[data-name="returnTime"] .time-display');
                const returnTimeValue = document.querySelector('[data-name="returnTime"] .time-value');
                if (returnTimeDisplay) {
                    returnTimeDisplay.removeAttribute('required');
                    returnTimeDisplay.value = '';
                }
                if (returnTimeValue) {
                    returnTimeValue.value = '';
                }
                returnDateInput.value = '';

                // Hide the original pickup/dropoff/date/time row for multi-transfer
                const originalLocationRow = document.querySelector('.form-row-staff:has(#staff-pickup)');
                const originalDateTimeRow = document.querySelector('.form-row-staff:has(#staff-depart-date)');
                if (originalLocationRow) originalLocationRow.style.display = 'none';
                if (originalDateTimeRow) originalDateTimeRow.style.display = 'none';

                multiTransferSection.style.display = 'block';
                // Initialize with 2 transfers if none exist
                if (document.querySelectorAll('.transfer-leg').length === 0) {
                    addTransferLeg();
                    addTransferLeg();
                }
            } else {
                returnRow.style.display = 'none';
                returnDateInput.removeAttribute('required');
                // For custom time picker, remove required from display input and clear values
                const returnTimeDisplay = document.querySelector('[data-name="returnTime"] .time-display');
                const returnTimeValue = document.querySelector('[data-name="returnTime"] .time-value');
                if (returnTimeDisplay) {
                    returnTimeDisplay.removeAttribute('required');
                    returnTimeDisplay.value = '';
                }
                if (returnTimeValue) {
                    returnTimeValue.value = '';
                }
                returnDateInput.value = '';
                multiTransferSection.style.display = 'none';

                // Show the original pickup/dropoff/date/time rows for one-way
                const originalLocationRow = document.querySelector('.form-row-staff:has(#staff-pickup)');
                const originalDateTimeRow = document.querySelector('.form-row-staff:has(#staff-depart-date)');
                if (originalLocationRow) originalLocationRow.style.display = 'grid';
                if (originalDateTimeRow) originalDateTimeRow.style.display = 'grid';
            }
            calculatePrice();
        });

        // Customer type change handler
        const customerTypeSelect = document.getElementById('staff-customer-type');
        const agentRow = document.getElementById('staff-agent-row');

        customerTypeSelect.addEventListener('change', function() {
            if (this.value === 'agent') {
                agentRow.style.display = 'grid';
            } else {
                agentRow.style.display = 'none';
            }
            calculatePrice();
            updateAllTransferPricing();
        });

        // Passenger count change handler
        const passengersSelect = document.getElementById('staff-passengers');
        const travellersGroup = document.getElementById('staff-travellers-group');

        passengersSelect.addEventListener('change', function() {
            const passengerCount = parseInt(this.value);
            if (passengerCount > 2) {
                travellersGroup.style.display = 'block';
            } else {
                travellersGroup.style.display = 'none';
                document.getElementById('staff-travellers').value = '';
            }
            calculatePrice();
            updateAllTransferPricing();
        });

        // Departure date change handler
        const departDateInput = document.getElementById('staff-depart-date');
        departDateInput.addEventListener('change', function() {
            const departDate = this.value;
            returnDateInput.setAttribute('min', departDate);

            if (returnDateInput.value && returnDateInput.value < departDate) {
                returnDateInput.value = '';
            }
            calculatePrice();
        });

        // Location and service type change handlers for price calculation
        const pickupSelect = document.getElementById('staff-pickup');
        const dropoffSelect = document.getElementById('staff-dropoff');
        const serviceTypeSelect = document.getElementById('staff-service-type');

        pickupSelect.addEventListener('change', function() {
            console.log('Pickup changed to:', this.value);
            calculatePrice();
        });
        dropoffSelect.addEventListener('change', function() {
            console.log('Dropoff changed to:', this.value);
            calculatePrice();
        });
        serviceTypeSelect.addEventListener('change', function() {
            console.log('Service type changed to:', this.value);
            calculatePrice();
            updateAllTransferPricing();
        });

        // Clear form button
        document.getElementById('clear-form-btn').addEventListener('click', clearForm);

        // Save draft button
        document.getElementById('save-draft-btn').addEventListener('click', saveDraft);

        // Multi-transfer functionality
        const addLegBtn = document.getElementById('add-transfer-leg');
        if (addLegBtn) {
            addLegBtn.addEventListener('click', addTransferLeg);
        }
    }

    function setupStaffCustomerLookup() {
        const phoneInput = document.getElementById('staff-phone');
        const customerSuggestions = document.getElementById('staff-customer-suggestions');
        const firstNameInput = document.getElementById('staff-first-name');
        const lastNameInput = document.getElementById('staff-last-name');
        const emailInput = document.getElementById('staff-email');
        const titleSelect = document.getElementById('staff-title');
        const customerTypeSelect = document.getElementById('staff-customer-type');

        console.log('Setting up customer lookup...');
        console.log('Phone input element:', phoneInput);
        console.log('Customer suggestions element:', customerSuggestions);

        if (!phoneInput) {
            console.error('Phone input element not found!');
            return;
        }

        if (!customerSuggestions) {
            console.error('Customer suggestions element not found!');
            return;
        }

        let lookupTimeout;

        // Mock customer database (same as public form)
        const mockCustomers = [
            {
                phone: '0400123456',
                title: 'mr',
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@email.com',
                customerType: 'personal'
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
                customerType: 'personal'
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
            clearTimeout(lookupTimeout);
            customerSuggestions.style.display = 'none';

            console.log('Phone input event triggered! Value:', phone, 'Length:', phone.replace(/\D/g, '').length);

            if (phone.replace(/\D/g, '').length >= 3) {
                lookupTimeout = setTimeout(() => {
                    console.log('Searching customers for:', phone);
                    searchCustomers(phone);
                }, 200); // Faster for staff
            }
        });

        console.log('Phone input event listener added successfully!');

        phoneInput.addEventListener('blur', function() {
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
            phoneInput.value = customer.phone;
            titleSelect.value = customer.title;
            firstNameInput.value = customer.firstName;
            lastNameInput.value = customer.lastName;
            emailInput.value = customer.email;
            customerTypeSelect.value = customer.customerType;

            customerSuggestions.style.display = 'none';

            // Trigger agent section if customer is agent
            if (customer.customerType === 'agent') {
                document.getElementById('staff-agent-row').style.display = 'grid';
            }

            // Auto-focus next field
            document.getElementById('staff-trip-type').focus();

            calculatePrice();
        }
    }

    function setupStaffKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl+N for new booking
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                clearForm();
                document.getElementById('staff-phone').focus();
            }

            // Ctrl+S for save draft
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                saveDraft();
            }

            // Ctrl+Enter for submit
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }

            // Escape to clear form
            if (e.key === 'Escape') {
                clearForm();
            }
        });
    }

    function calculatePrice() {
        console.log('calculatePrice() function called');

        const tripType = document.getElementById('staff-trip-type').value;
        const pickup = document.getElementById('staff-pickup').value;
        const dropoff = document.getElementById('staff-dropoff').value;
        const passengers = parseInt(document.getElementById('staff-passengers').value);
        const customerType = document.getElementById('staff-customer-type').value;
        const serviceType = document.getElementById('staff-service-type').value;

        console.log('Form values:', { tripType, pickup, dropoff, passengers, customerType, serviceType });

        if (!pickup || !dropoff || !passengers || !serviceType) {
            console.log('Missing required fields for pricing');
            document.getElementById('staff-price-display').textContent = 'Select details';
            return;
        }

        // Only calculate for routes from Airport
        if (pickup !== 'kingscote-airport' && dropoff !== 'kingscote-airport') {
            document.getElementById('staff-price-display').textContent = 'Route not in rate sheet';
            return;
        }

        // This will be determined below based on route type

        // Rate sheet data (2025-2026 rates)
        const airportRates = {
            'kingscote-town': { // Kingscote
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
            'penneshaw-ferry': { // Penneshaw
                2: { shared: 182.00, nett: 145.60, private: 218.40 },
                3: { shared: 202.00, nett: 161.60, private: 242.40 },
                4: { shared: 222.00, nett: 177.60, private: 266.40 },
                5: { shared: 242.00, nett: 193.60, private: 290.40 },
                6: { shared: 262.00, nett: 209.60, private: 314.40 }
            },
            'vivonne-bay': {
                2: { shared: 168.00, nett: 134.40, private: 201.60 },
                3: { shared: 188.00, nett: 150.40, private: 225.60 },
                4: { shared: 208.00, nett: 166.40, private: 249.60 },
                5: { shared: 228.00, nett: 182.40, private: 273.60 },
                6: { shared: 248.00, nett: 198.40, private: 297.60 }
            },
            'flinders-chase': { // Represents Southern Ocean Lodge area
                2: { shared: 315.00, nett: 252.00, private: 378.00 },
                3: { shared: 335.00, nett: 268.00, private: 402.00 },
                4: { shared: 355.00, nett: 284.00, private: 426.00 },
                5: { shared: 375.00, nett: 300.00, private: 450.00 },
                6: { shared: 395.00, nett: 316.00, private: 474.00 }
            },
            'emu-bay': {
                2: { shared: 94.50, nett: 75.60, private: 113.40 },
                3: { shared: 114.50, nett: 91.60, private: 137.40 },
                4: { shared: 134.50, nett: 107.60, private: 161.40 },
                5: { shared: 154.50, nett: 123.60, private: 185.40 },
                6: { shared: 174.50, nett: 139.60, private: 209.40 }
            },
            'parndana': {
                2: { shared: 133.00, nett: 106.40, private: 159.60 },
                3: { shared: 153.00, nett: 122.40, private: 183.60 },
                4: { shared: 173.00, nett: 138.40, private: 207.60 },
                5: { shared: 193.00, nett: 154.40, private: 231.60 },
                6: { shared: 213.00, nett: 170.40, private: 255.60 }
            }
        };

        // Kingscote to other destinations rates
        const kingscoteRates = {
            'kingscote-airport': { // Kingscote to Airport
                1: { shared: 36.00, nett: 28.80, private: 57.60 },
                2: { shared: 72.00, nett: 57.60, private: 115.20 },
                3: { shared: 92.00, nett: 73.60, private: 147.20 },
                4: { shared: 112.00, nett: 89.60, private: 179.20 },
                5: { shared: 132.00, nett: 105.60, private: 211.20 },
                6: { shared: 152.00, nett: 121.60, private: 243.20 }
            },
            'american-river': {
                2: { shared: 138.60, nett: 110.88, private: 166.32 },
                3: { shared: 158.60, nett: 126.88, private: 190.32 },
                4: { shared: 178.60, nett: 142.88, private: 214.32 },
                5: { shared: 198.60, nett: 158.88, private: 238.32 },
                6: { shared: 218.60, nett: 174.88, private: 262.32 }
            },
            'penneshaw-ferry': {
                2: { shared: 198.00, nett: 158.40, private: 237.60 },
                3: { shared: 218.00, nett: 174.40, private: 261.60 },
                4: { shared: 238.00, nett: 190.40, private: 285.60 },
                5: { shared: 258.00, nett: 206.40, private: 309.60 },
                6: { shared: 278.00, nett: 222.40, private: 333.60 }
            },
            'vivonne-bay': {
                2: { shared: 198.00, nett: 158.40, private: 237.60 },
                3: { shared: 218.00, nett: 174.40, private: 261.60 },
                4: { shared: 238.00, nett: 190.40, private: 285.60 },
                5: { shared: 258.00, nett: 206.40, private: 309.60 },
                6: { shared: 278.00, nett: 222.40, private: 333.60 }
            },
            'flinders-chase': { // Southern Ocean Lodge area
                2: { shared: 326.70, nett: 261.36, private: 392.04 },
                3: { shared: 346.70, nett: 277.36, private: 416.04 },
                4: { shared: 366.70, nett: 293.36, private: 440.04 },
                5: { shared: 386.70, nett: 309.36, private: 464.04 },
                6: { shared: 406.70, nett: 325.36, private: 488.04 }
            },
            'emu-bay': {
                2: { shared: 89.10, nett: 71.28, private: 106.92 },
                3: { shared: 109.10, nett: 87.28, private: 130.92 },
                4: { shared: 129.10, nett: 103.28, private: 154.92 },
                5: { shared: 149.10, nett: 119.28, private: 178.92 },
                6: { shared: 169.10, nett: 135.28, private: 202.92 }
            },
            'parndana': {
                2: { shared: 151.80, nett: 121.44, private: 182.16 },
                3: { shared: 171.80, nett: 137.44, private: 206.16 },
                4: { shared: 191.80, nett: 153.44, private: 230.16 },
                5: { shared: 211.80, nett: 169.44, private: 254.16 },
                6: { shared: 231.80, nett: 185.44, private: 278.16 }
            }
        };

        // Penneshaw to other destinations rates
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
            'parndana': {
                2: { shared: 257.40, nett: 205.92, private: 308.88 },
                3: { shared: 277.40, nett: 221.92, private: 332.88 },
                4: { shared: 297.40, nett: 237.92, private: 356.88 },
                5: { shared: 317.40, nett: 253.92, private: 380.88 },
                6: { shared: 337.40, nett: 269.92, private: 404.88 }
            },
            'vivonne-bay': {
                2: { shared: 297.00, nett: 237.60, private: 356.40 },
                3: { shared: 317.00, nett: 253.60, private: 380.40 },
                4: { shared: 337.00, nett: 269.60, private: 404.40 },
                5: { shared: 357.00, nett: 285.60, private: 428.40 },
                6: { shared: 377.00, nett: 301.60, private: 452.40 }
            },
            'emu-bay': {
                2: { shared: 227.70, nett: 182.16, private: 273.24 },
                3: { shared: 247.70, nett: 198.16, private: 297.24 },
                4: { shared: 267.70, nett: 214.16, private: 321.24 },
                5: { shared: 287.70, nett: 230.16, private: 345.24 },
                6: { shared: 307.70, nett: 246.16, private: 369.24 }
            },
            'kingscote-airport': {
                2: { shared: 171.60, nett: 137.28, private: 205.92 },
                3: { shared: 191.60, nett: 153.28, private: 229.92 },
                4: { shared: 211.60, nett: 169.28, private: 253.92 },
                5: { shared: 231.60, nett: 185.28, private: 277.92 },
                6: { shared: 251.60, nett: 201.28, private: 301.92 }
            },
            'flinders-chase': { // Southern Ocean Lodge
                2: { shared: 336.60, nett: 269.28, private: 403.92 },
                3: { shared: 356.60, nett: 285.28, private: 427.92 },
                4: { shared: 376.60, nett: 301.28, private: 451.92 },
                5: { shared: 396.60, nett: 317.28, private: 475.92 },
                6: { shared: 416.60, nett: 333.28, private: 499.92 }
            }
        };

        // Determine which rate sheet to use and get destination
        let rateSheet, destination;
        if (pickup === 'kingscote-airport') {
            rateSheet = airportRates;
            destination = dropoff;
        } else if (dropoff === 'kingscote-airport') {
            rateSheet = airportRates;
            destination = pickup;
        } else if (pickup === 'kingscote-town') {
            rateSheet = kingscoteRates;
            destination = dropoff;
        } else if (dropoff === 'kingscote-town') {
            rateSheet = kingscoteRates;
            destination = pickup;
        } else if (pickup === 'penneshaw-ferry') {
            rateSheet = penneshawRates;
            destination = dropoff;
        } else if (dropoff === 'penneshaw-ferry') {
            rateSheet = penneshawRates;
            destination = pickup;
        } else {
            document.getElementById('staff-price-display').textContent = 'Route not available';
            return;
        }

        // Validate single passenger booking - only allowed for Airport ↔ Kingscote
        if (passengers === 1 && !(
            (pickup === 'kingscote-airport' && dropoff === 'kingscote-town') ||
            (pickup === 'kingscote-town' && dropoff === 'kingscote-airport')
        )) {
            document.getElementById('staff-price-display').textContent = 'Min 2 PAX for this route';
            return;
        }

        // Get passenger group (6+ uses 6 rate)
        let paxGroup = passengers;
        if (passengers > 6) paxGroup = 6; // 6+ uses 6 passenger rate

        // Get rate for destination and passenger count
        const destinationRates = rateSheet[destination];
        if (!destinationRates) {
            document.getElementById('staff-price-display').textContent = 'Destination not found';
            return;
        }

        const rates = destinationRates[paxGroup];
        if (!rates) {
            document.getElementById('staff-price-display').textContent = 'Rate not available';
            return;
        }

        let price = 0;

        // Apply pricing based on customer type and service type
        if (customerType === 'personal') {
            // Personal customers get shared RRP or private RRP
            price = serviceType === 'shared' ? rates.shared : rates.private;
        } else if (customerType === 'agent') {
            // Agents get nett price (shared nett or private calculated from nett)
            if (serviceType === 'shared') {
                price = rates.nett;
            } else {
                // Private nett = shared nett * (private RRP / shared RRP)
                price = rates.nett * (rates.private / rates.shared);
            }
        } else if (customerType === 'corporate') {
            // Corporate gets special structure - using nett rates for now
            price = serviceType === 'shared' ? rates.nett : rates.nett * (rates.private / rates.shared);
        }

        // Apply return trip pricing - no discount, just double the one-way price
        if (tripType === 'return') {
            price *= 2.0; // Full double price for return
        }

        const formattedPrice = `$${price.toFixed(2)}`;
        const priceElement = document.getElementById('staff-price-display');
        console.log('Setting price to:', formattedPrice, 'Price element:', priceElement);

        if (priceElement) {
            priceElement.textContent = formattedPrice;
        } else {
            console.error('Price display element not found!');
        }
    }

    function clearForm() {
        form.reset();

        // Reset to defaults
        document.getElementById('staff-trip-type').value = 'one-way';
        document.getElementById('staff-customer-type').value = 'personal';
        document.getElementById('staff-passengers').value = '1';
        document.getElementById('staff-service-type').value = 'shared';
        departDateInput.value = today;

        // Hide conditional sections
        document.getElementById('staff-return-row').style.display = 'none';
        document.getElementById('staff-agent-row').style.display = 'none';
        document.getElementById('staff-travellers-group').style.display = 'none';

        // Reset price display
        document.getElementById('staff-price-display').textContent = 'Calculating...';

        // Focus phone field
        document.getElementById('staff-phone').focus();
    }

    function saveDraft() {
        const formData = new FormData(form);
        const draftData = Object.fromEntries(formData.entries());

        // Save to localStorage (in Phase 2, this would save to database)
        localStorage.setItem('staff-booking-draft', JSON.stringify(draftData));

        showMessage('Draft saved successfully! ✅', 'success');
    }

    function showMessage(message, type) {
        const existingMessage = document.querySelector('.success-message, .error-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;

        form.insertBefore(messageDiv, form.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const booking = {
            // Customer Information
            customerType: formData.get('customerType'),
            title: formData.get('title') || '',
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email') || '',
            phone: formData.get('phone-lookup-field'),

            // Trip Details
            tripType: formData.get('tripType'),
            serviceType: formData.get('serviceType'),
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

        if (validateStaffForm(booking)) {
            submitStaffBooking(booking);
        }
    });

    function validateStaffForm(booking) {
        const errors = [];

        // Check required fields
        if (!booking.firstName.trim()) errors.push('First name is required');
        if (!booking.lastName.trim()) errors.push('Last name is required');
        if (!booking.phone.trim()) errors.push('Phone number is required');
        if (!booking.tripType) errors.push('Trip type is required');
        if (!booking.pickupLocation) errors.push('Pickup location is required');
        if (!booking.dropoffLocation) errors.push('Drop-off location is required');
        if (!booking.departDate) errors.push('Departure date is required');
        if (!booking.departTime) errors.push('Departure time is required');
        if (!booking.passengers) errors.push('Number of passengers is required');

        // Check return trip requirements
        if (booking.tripType === 'return') {
            if (!booking.returnDate) errors.push('Return date is required');
            if (!booking.returnTime) errors.push('Return time is required');
        }

        if (errors.length > 0) {
            showMessage(`Errors: ${errors.join(', ')}`, 'error');
            return false;
        }

        return true;
    }

    function submitStaffBooking(booking) {
        // Show loading state
        const submitBtn = document.getElementById('create-booking-btn');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="spinner"></span> Creating...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            const pnr = generatePNR();

            // Calculate final price
            const price = calculateFinalPrice(booking);

            // Create booking object for management system
            const managementBooking = {
                pnr: pnr,
                customerType: booking.customerType,
                title: booking.title,
                firstName: booking.firstName,
                lastName: booking.lastName,
                email: booking.email,
                phone: booking.phone,
                tripType: booking.tripType,
                serviceType: booking.serviceType,
                pickupLocation: booking.pickupLocation,
                dropoffLocation: booking.dropoffLocation,
                departDate: booking.departDate,
                departTime: booking.departTime,
                returnDate: booking.returnDate,
                returnTime: booking.returnTime,
                passengers: parseInt(booking.passengers),
                travellerNames: booking.travellerNames,
                agent: booking.agent,
                agentReference: booking.agentReference,
                specialRequirements: booking.specialRequirements,
                price: price,
                status: 'pending',
                driver: null,
                vehicle: null,
                created: new Date().toISOString()
            };

            // Save to management system
            saveToManagementSystem(managementBooking);

            showMessage(`✅ Booking ${pnr} created successfully!`, 'success');

            // Reset form
            clearForm();

            // Add to recent bookings (mock)
            addToRecentBookings(booking, pnr);

            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Clear any saved draft
            localStorage.removeItem('staff-booking-draft');

            console.log('Staff booking submitted:', managementBooking);
        }, 1000);
    }

    function calculateFinalPrice(booking) {
        // Use the same calculation logic as the price display
        const tripType = booking.tripType;
        const pickup = booking.pickupLocation;
        const dropoff = booking.dropoffLocation;
        const passengers = parseInt(booking.passengers);
        const customerType = booking.customerType;
        const serviceType = booking.serviceType;

        // Determine which rate sheet to use and get destination
        let rateSheet, destination;
        if (pickup === 'kingscote-airport') {
            rateSheet = airportRates;
            destination = dropoff;
        } else if (dropoff === 'kingscote-airport') {
            rateSheet = airportRates;
            destination = pickup;
        } else if (pickup === 'kingscote-town') {
            rateSheet = kingscoteRates;
            destination = dropoff;
        } else if (dropoff === 'kingscote-town') {
            rateSheet = kingscoteRates;
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

        // Get passenger group
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

        // Apply return trip pricing
        if (tripType === 'return') {
            price *= 2.0;
        }

        return price;
    }

    function saveToManagementSystem(booking) {
        // Get existing bookings from management system
        const existingBookings = JSON.parse(localStorage.getItem('kit-bookings') || '[]');

        // Add new booking
        existingBookings.push(booking);

        // Save back to management system
        localStorage.setItem('kit-bookings', JSON.stringify(existingBookings));
    }

    function addToRecentBookings(booking, pnr) {
        const recentBookings = document.getElementById('recent-bookings');
        const newBooking = document.createElement('div');
        newBooking.className = 'booking-item';

        const pickupName = getLocationName(booking.pickupLocation);
        const dropoffName = getLocationName(booking.dropoffLocation);
        const customerName = `${booking.firstName} ${booking.lastName}`;
        const bookingTime = formatTime(booking.departTime);

        newBooking.innerHTML = `
            <div class="booking-pnr">${pnr}</div>
            <div class="booking-customer">${customerName}</div>
            <div class="booking-route">${pickupName} → ${dropoffName}</div>
            <div class="booking-date">Today ${bookingTime}</div>
            <div class="booking-status status-confirmed">Confirmed</div>
        `;

        recentBookings.insertBefore(newBooking, recentBookings.firstChild);

        // Remove last item if more than 5
        if (recentBookings.children.length > 5) {
            recentBookings.removeChild(recentBookings.lastChild);
        }
    }

    function generatePNR() {
        const prefix = 'KIT';
        const number = Math.floor(Math.random() * 9000) + 1000;
        return prefix + number;
    }

    function getLocationName(locationValue) {
        const locationMap = {
            'kingscote-airport': 'Airport',
            'penneshaw-ferry': 'Ferry',
            'kingscote-town': 'Town',
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

    // Load saved draft on page load
    const savedDraft = localStorage.getItem('staff-booking-draft');
    if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        Object.keys(draftData).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = draftData[key];
            }
        });
        showMessage('Draft booking loaded ✨', 'success');
        calculatePrice();
    }

    // Initialize custom time pickers specifically for staff page
    function initializeStaffTimePickers() {
        console.log('Setting up time pickers...');

        // Remove any existing global click listeners to prevent duplicates
        document.removeEventListener('click', globalTimePickerHandler);

        const timePickers = document.querySelectorAll('.custom-time-picker');
        console.log('Found time pickers:', timePickers.length);

        timePickers.forEach(picker => {
            // Skip if already initialized
            if (picker.dataset.initialized === 'true') {
                return;
            }

            const displayInput = picker.querySelector('.time-display');
            const valueInput = picker.querySelector('.time-value');
            const popup = picker.querySelector('.time-popup');
            const hourOptions = picker.querySelectorAll('.hours-column .time-option');
            const minuteOptions = picker.querySelectorAll('.minutes-column .time-option');

            if (!displayInput || !valueInput || !popup) {
                console.error('Missing time picker elements:', { displayInput, valueInput, popup });
                return;
            }

            let selectedHour = '';
            let selectedMinute = '';

            // Handle display input click to show popup
            function handleDisplayClick(e) {
                e.preventDefault();
                console.log('Time picker clicked');
                closeAllStaffTimePickerPopups();

                // Check if this is a multi-transfer picker (needs fixed positioning)
                const isTransferPicker = picker.closest('.transfer-leg');
                const rect = displayInput.getBoundingClientRect();

                if (isTransferPicker) {
                    // Use fixed positioning for transfer pickers
                    popup.style.position = 'fixed';
                    popup.style.top = (rect.bottom + 5) + 'px';
                    popup.style.left = rect.left + 'px';
                    popup.style.zIndex = '99999';
                } else {
                    // Use regular positioning for main form picker
                    popup.style.position = 'absolute';
                    popup.style.top = (rect.bottom + window.scrollY + 2) + 'px';
                    popup.style.left = rect.left + 'px';
                }

                popup.classList.add('show');
                displayInput.focus();
            }

            // Handle display input focus
            function handleDisplayFocus() {
                console.log('Time picker focused');
                closeAllStaffTimePickerPopups();

                // Check if this is a multi-transfer picker (needs fixed positioning)
                const isTransferPicker = picker.closest('.transfer-leg');
                const rect = displayInput.getBoundingClientRect();

                if (isTransferPicker) {
                    // Use fixed positioning for transfer pickers
                    popup.style.position = 'fixed';
                    popup.style.top = (rect.bottom + 5) + 'px';
                    popup.style.left = rect.left + 'px';
                    popup.style.zIndex = '99999';
                } else {
                    // Use regular positioning for main form picker
                    popup.style.position = 'absolute';
                    popup.style.top = (rect.bottom + window.scrollY + 2) + 'px';
                    popup.style.left = rect.left + 'px';
                }

                popup.classList.add('show');
            }

            // Remove existing listeners if any
            displayInput.removeEventListener('click', handleDisplayClick);
            displayInput.removeEventListener('focus', handleDisplayFocus);

            // Add new listeners
            displayInput.addEventListener('click', handleDisplayClick);
            displayInput.addEventListener('focus', handleDisplayFocus);

            // Handle hour selection
            hourOptions.forEach(option => {
                option.addEventListener('click', function() {
                    console.log('Hour selected:', this.dataset.value);
                    selectedHour = this.dataset.value;

                    // Remove selected class from all hour options
                    hourOptions.forEach(opt => opt.classList.remove('selected'));
                    // Add selected class to clicked option
                    this.classList.add('selected');

                    updateTimeDisplay();
                });
            });

            // Handle minute selection
            minuteOptions.forEach(option => {
                option.addEventListener('click', function() {
                    console.log('Minute selected:', this.dataset.value);
                    selectedMinute = this.dataset.value;

                    // Remove selected class from all minute options
                    minuteOptions.forEach(opt => opt.classList.remove('selected'));
                    // Add selected class to clicked option
                    this.classList.add('selected');

                    updateTimeDisplay();
                });
            });

            function updateTimeDisplay() {
                if (selectedHour && selectedMinute) {
                    const hour = parseInt(selectedHour);
                    const minute = selectedMinute;
                    const period = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);

                    const timeString = `${displayHour}:${minute} ${period}`;
                    const valueString = `${selectedHour}:${minute}`;

                    displayInput.value = timeString;
                    valueInput.value = valueString;

                    console.log('Time updated:', timeString, valueString);

                    // Close popup after selection
                    setTimeout(() => {
                        popup.classList.remove('show');
                    }, 200);

                    // Trigger change event for form validation
                    const changeEvent = new Event('change', { bubbles: true });
                    valueInput.dispatchEvent(changeEvent);
                }
            }

            // Mark this picker as initialized
            picker.dataset.initialized = 'true';
        });

        // Set up global click handler
        globalTimePickerHandler = function(e) {
            if (!e.target.closest('.custom-time-picker')) {
                closeAllStaffTimePickerPopups();
            }
        };
        document.addEventListener('click', globalTimePickerHandler);

        function closeAllStaffTimePickerPopups() {
            const allPopups = document.querySelectorAll('.time-popup');
            allPopups.forEach(popup => popup.classList.remove('show'));
        }
    }

    // Global time picker click handler
    let globalTimePickerHandler = null;

    // Multi-Transfer Leg Management Functions
    let legCounter = 0;

    function addTransferLeg() {
        legCounter++;
        const container = document.getElementById('transfer-legs-container');

        const legHTML = `
            <div class="transfer-leg" data-leg-id="${legCounter}">
                <div class="leg-header">
                    <div class="leg-title">Transfer ${legCounter}</div>
                    <div class="leg-price-display" id="leg-${legCounter}-price">Select details</div>
                    <div class="leg-controls">
                        <button type="button" class="leg-btn toggle" onclick="toggleLeg(${legCounter})">▼ Hide</button>
                        <button type="button" class="leg-btn remove" onclick="removeLeg(${legCounter})">✕ Remove</button>
                    </div>
                </div>
                <div class="leg-content" data-leg-content="${legCounter}">
                    <div class="leg-row">
                        <div class="leg-group">
                            <label for="leg-${legCounter}-pickup">📍 Pickup</label>
                            <select id="leg-${legCounter}-pickup" name="leg[${legCounter}][pickup]" required>
                                <option value="">Select pickup</option>
                                <option value="kingscote-airport">Kingscote Airport</option>
                                <option value="penneshaw-ferry">Penneshaw Ferry</option>
                                <option value="kingscote-town">Kingscote Town</option>
                                <option value="american-river">American River</option>
                                <option value="emu-bay">Emu Bay</option>
                                <option value="parndana">Parndana</option>
                                <option value="vivonne-bay">Vivonne Bay</option>
                                <option value="flinders-chase">Flinders Chase NP</option>
                                <option value="remarkable-rocks">Remarkable Rocks</option>
                                <option value="admirals-arch">Admirals Arch</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="leg-group">
                            <label for="leg-${legCounter}-dropoff">🎯 Drop-off</label>
                            <select id="leg-${legCounter}-dropoff" name="leg[${legCounter}][dropoff]" required>
                                <option value="">Select drop-off</option>
                                <option value="kingscote-airport">Kingscote Airport</option>
                                <option value="penneshaw-ferry">Penneshaw Ferry</option>
                                <option value="kingscote-town">Kingscote Town</option>
                                <option value="american-river">American River</option>
                                <option value="emu-bay">Emu Bay</option>
                                <option value="parndana">Parndana</option>
                                <option value="vivonne-bay">Vivonne Bay</option>
                                <option value="flinders-chase">Flinders Chase NP</option>
                                <option value="remarkable-rocks">Remarkable Rocks</option>
                                <option value="admirals-arch">Admirals Arch</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="leg-group">
                            <label for="leg-${legCounter}-date">📅 Date</label>
                            <input type="date" id="leg-${legCounter}-date" name="leg[${legCounter}][date]" required>
                        </div>
                        <div class="leg-group">
                            <label for="leg-${legCounter}-time">🕐 Time</label>
                            <div class="custom-time-picker" data-name="leg[${legCounter}][time]" data-required="true">
                                <input type="text" class="time-display" readonly placeholder="Select time" required>
                                <input type="hidden" class="time-value" name="leg[${legCounter}][time]">
                                <div class="time-popup">
                                    <div class="time-selector">
                                        <div class="time-column hours-column">
                                            <div class="time-header">Hour</div>
                                            <div class="time-options">
                                                <div class="time-option" data-value="06">6 AM</div>
                                                <div class="time-option" data-value="07">7 AM</div>
                                                <div class="time-option" data-value="08">8 AM</div>
                                                <div class="time-option" data-value="09">9 AM</div>
                                                <div class="time-option" data-value="10">10 AM</div>
                                                <div class="time-option" data-value="11">11 AM</div>
                                                <div class="time-option" data-value="12">12 PM</div>
                                                <div class="time-option" data-value="13">1 PM</div>
                                                <div class="time-option" data-value="14">2 PM</div>
                                                <div class="time-option" data-value="15">3 PM</div>
                                                <div class="time-option" data-value="16">4 PM</div>
                                                <div class="time-option" data-value="17">5 PM</div>
                                                <div class="time-option" data-value="18">6 PM</div>
                                                <div class="time-option" data-value="19">7 PM</div>
                                                <div class="time-option" data-value="20">8 PM</div>
                                                <div class="time-option" data-value="21">9 PM</div>
                                                <div class="time-option" data-value="22">10 PM</div>
                                            </div>
                                        </div>
                                        <div class="time-column minutes-column">
                                            <div class="time-header">Minutes</div>
                                            <div class="time-options">
                                                <div class="time-option" data-value="00">00</div>
                                                <div class="time-option" data-value="05">05</div>
                                                <div class="time-option" data-value="10">10</div>
                                                <div class="time-option" data-value="15">15</div>
                                                <div class="time-option" data-value="20">20</div>
                                                <div class="time-option" data-value="25">25</div>
                                                <div class="time-option" data-value="30">30</div>
                                                <div class="time-option" data-value="35">35</div>
                                                <div class="time-option" data-value="40">40</div>
                                                <div class="time-option" data-value="45">45</div>
                                                <div class="time-option" data-value="50">50</div>
                                                <div class="time-option" data-value="55">55</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="leg-summary" id="leg-${legCounter}-summary">
                        Complete leg details to see pricing
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', legHTML);

        // Reinitialize all time pickers to include the new one
        setTimeout(() => {
            initializeStaffTimePickers();
        }, 100);

        // Add event listeners for the new leg
        addLegEventListeners(legCounter);

        // Update total summary
        updateMultiTransferSummary();
    }

    function removeLeg(legId) {
        const leg = document.querySelector(`.transfer-leg[data-leg-id="${legId}"]`);
        if (leg) {
            leg.remove();
            updateMultiTransferSummary();

            // Don't allow removing if only one transfer remains
            const remainingLegs = document.querySelectorAll('.transfer-leg');
            if (remainingLegs.length === 1) {
                const removeBtn = remainingLegs[0].querySelector('.leg-btn.remove');
                if (removeBtn) {
                    removeBtn.disabled = true;
                    removeBtn.textContent = '✕ Keep';
                    removeBtn.style.opacity = '0.5';
                }
            }
        }
    }

    function toggleLeg(legId) {
        const content = document.querySelector(`[data-leg-content="${legId}"]`);
        const toggleBtn = content.parentElement.querySelector('.leg-btn.toggle');

        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            toggleBtn.textContent = '▼ Hide';
        } else {
            content.classList.add('collapsed');
            toggleBtn.textContent = '▶ Show';
        }
    }

    function addLegEventListeners(legId) {
        console.log(`Adding event listeners for transfer ${legId}`);

        const pickupSelect = document.getElementById(`leg-${legId}-pickup`);
        const dropoffSelect = document.getElementById(`leg-${legId}-dropoff`);
        const dateInput = document.getElementById(`leg-${legId}-date`);
        const timeInput = document.querySelector(`[data-name="leg[${legId}][time]"] .time-value`);

        console.log(`Transfer ${legId} elements found:`, {
            pickup: !!pickupSelect,
            dropoff: !!dropoffSelect,
            date: !!dateInput,
            time: !!timeInput
        });

        // Set minimum date
        const today = new Date().toISOString().split('T')[0];
        if (dateInput) {
            dateInput.setAttribute('min', today);
        }

        // Add change listeners
        [pickupSelect, dropoffSelect, dateInput, timeInput].forEach((input, index) => {
            if (input) {
                const inputTypes = ['pickup', 'dropoff', 'date', 'time'];
                input.addEventListener('change', () => {
                    console.log(`Transfer ${legId} ${inputTypes[index]} changed to:`, input.value);
                    updateLegSummary(legId);
                    updateMultiTransferSummary();
                });
            } else {
                console.error(`Missing input for transfer ${legId}:`, inputTypes[index]);
            }
        });
    }

    function updateLegSummary(legId) {
        console.log(`updateLegSummary called for legId: ${legId}`);

        const pickupEl = document.getElementById(`leg-${legId}-pickup`);
        const dropoffEl = document.getElementById(`leg-${legId}-dropoff`);
        const dateEl = document.getElementById(`leg-${legId}-date`);
        const timeValueEl = document.querySelector(`[data-name="leg[${legId}][time]"] .time-value`);
        const timeDisplayEl = document.querySelector(`[data-name="leg[${legId}][time]"] .time-display`);
        const summaryDiv = document.getElementById(`leg-${legId}-summary`);

        if (!pickupEl || !dropoffEl || !dateEl || !timeValueEl || !timeDisplayEl || !summaryDiv) {
            console.error(`Missing elements for leg ${legId}:`, {
                pickup: !!pickupEl,
                dropoff: !!dropoffEl,
                date: !!dateEl,
                timeValue: !!timeValueEl,
                timeDisplay: !!timeDisplayEl,
                summary: !!summaryDiv
            });
            return;
        }

        const pickup = pickupEl.value;
        const dropoff = dropoffEl.value;
        const date = dateEl.value;
        const timeValue = timeValueEl.value;
        const timeDisplay = timeDisplayEl.value;

        if (pickup && dropoff && date && timeValue) {
            console.log(`Transfer ${legId} has all required fields`);
            const pickupText = getLocationDisplayName(pickup);
            const dropoffText = getLocationDisplayName(dropoff);
            const passengers = parseInt(document.getElementById('staff-passengers').value) || 1;
            const serviceType = document.getElementById('staff-service-type').value;
            const customerType = document.getElementById('staff-customer-type').value;

            console.log(`Transfer ${legId} pricing inputs:`, { pickup, dropoff, passengers, serviceType, customerType });

            // Calculate price for this leg
            const price = calculateLegPrice(pickup, dropoff, passengers, serviceType, customerType);
            console.log(`Transfer ${legId} calculated price: $${price}`);

            // Check if minimum passenger warning applies
            const isAirportKingscote =
                (pickup === 'kingscote-airport' && dropoff === 'kingscote-town') ||
                (pickup === 'kingscote-town' && dropoff === 'kingscote-airport');
            const showMinWarning = passengers === 1 && !isAirportKingscote;

            // Update header price display
            const headerPriceDisplay = document.getElementById(`leg-${legId}-price`);
            if (headerPriceDisplay) {
                headerPriceDisplay.textContent = `$${price.toFixed(2)}${showMinWarning ? ' (min 2)' : ''}`;
            }

            summaryDiv.innerHTML = `
                <strong>${pickupText} → ${dropoffText}</strong><br>
                📅 ${formatDate(date)} at ${timeDisplay}<br>
                👥 ${passengers} passenger${passengers > 1 ? 's' : ''} (${serviceType})${showMinWarning ? '<br><span style="color: #e67e22; font-weight: 600;">⚠️ Minimum 2 passengers - charged for 2</span>' : ''}<br>
                <span class="leg-price">$${price.toFixed(2)}</span>
            `;
        } else {
            // Update header price display for incomplete legs
            const headerPriceDisplay = document.getElementById(`leg-${legId}-price`);
            if (headerPriceDisplay) {
                headerPriceDisplay.textContent = 'Select details';
            }

            summaryDiv.innerHTML = 'Complete leg details to see pricing';
        }
    }

    function getLocationDisplayName(value) {
        const locationMap = {
            'kingscote-airport': 'Kingscote Airport',
            'penneshaw-ferry': 'Penneshaw Ferry',
            'kingscote-town': 'Kingscote Town',
            'american-river': 'American River',
            'emu-bay': 'Emu Bay',
            'parndana': 'Parndana',
            'vivonne-bay': 'Vivonne Bay',
            'flinders-chase': 'Flinders Chase NP',
            'remarkable-rocks': 'Remarkable Rocks',
            'admirals-arch': 'Admirals Arch',
            'other': 'Other'
        };
        return locationMap[value] || value;
    }

    function calculateLegPrice(pickup, dropoff, passengers, serviceType, customerType) {
        // Use the same pricing logic as the main calculatePrice function
        return calculatePriceForRoute(pickup, dropoff, passengers, serviceType, customerType, 'one-way');
    }

    function calculatePriceForRoute(pickup, dropoff, passengers, serviceType, customerType, tripType) {
        console.log(`calculatePriceForRoute called:`, { pickup, dropoff, passengers, serviceType, customerType, tripType });

        if (!pickup || !dropoff || !passengers || !serviceType) {
            console.log('Missing required parameters');
            return 0;
        }

        // Support all common destination combinations
        const supportedLocations = [
            'kingscote-airport', 'kingscote-town', 'penneshaw-ferry',
            'american-river', 'emu-bay', 'parndana', 'vivonne-bay',
            'flinders-chase', 'remarkable-rocks', 'admirals-arch'
        ];

        if (!supportedLocations.includes(pickup) || !supportedLocations.includes(dropoff)) {
            console.log('Route not supported - unsupported location');
            return 0;
        }

        // Rate sheet data (2025-2026 rates)
        const airportRates = {
            'kingscote-town': { // Kingscote
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
            'penneshaw-ferry': { // Penneshaw
                2: { shared: 182.00, nett: 145.60, private: 218.40 },
                3: { shared: 202.00, nett: 161.60, private: 242.40 },
                4: { shared: 222.00, nett: 177.60, private: 266.40 },
                5: { shared: 242.00, nett: 193.60, private: 290.40 },
                6: { shared: 262.00, nett: 209.60, private: 314.40 }
            },
            'vivonne-bay': {
                2: { shared: 168.00, nett: 134.40, private: 201.60 },
                3: { shared: 188.00, nett: 150.40, private: 225.60 },
                4: { shared: 208.00, nett: 166.40, private: 249.60 },
                5: { shared: 228.00, nett: 182.40, private: 273.60 },
                6: { shared: 248.00, nett: 198.40, private: 297.60 }
            },
            'flinders-chase': { // Represents Southern Ocean Lodge area
                2: { shared: 315.00, nett: 252.00, private: 378.00 },
                3: { shared: 335.00, nett: 268.00, private: 402.00 },
                4: { shared: 355.00, nett: 284.00, private: 426.00 },
                5: { shared: 375.00, nett: 300.00, private: 450.00 },
                6: { shared: 395.00, nett: 316.00, private: 474.00 }
            },
            'emu-bay': {
                2: { shared: 94.50, nett: 75.60, private: 113.40 },
                3: { shared: 114.50, nett: 91.60, private: 137.40 },
                4: { shared: 134.50, nett: 107.60, private: 161.40 },
                5: { shared: 154.50, nett: 123.60, private: 185.40 },
                6: { shared: 174.50, nett: 139.60, private: 209.40 }
            },
            'parndana': {
                2: { shared: 133.00, nett: 106.40, private: 159.60 },
                3: { shared: 153.00, nett: 122.40, private: 183.60 },
                4: { shared: 173.00, nett: 138.40, private: 207.60 },
                5: { shared: 193.00, nett: 154.40, private: 231.60 },
                6: { shared: 213.00, nett: 170.40, private: 255.60 }
            }
        };

        // Kingscote to other destinations rates
        const kingscoteRates = {
            'kingscote-airport': { // Kingscote to Airport
                1: { shared: 36.00, nett: 28.80, private: 57.60 },
                2: { shared: 72.00, nett: 57.60, private: 115.20 },
                3: { shared: 92.00, nett: 73.60, private: 147.20 },
                4: { shared: 112.00, nett: 89.60, private: 179.20 },
                5: { shared: 132.00, nett: 105.60, private: 211.20 },
                6: { shared: 152.00, nett: 121.60, private: 243.20 }
            },
            'american-river': {
                2: { shared: 138.60, nett: 110.88, private: 166.32 },
                3: { shared: 158.60, nett: 126.88, private: 190.32 },
                4: { shared: 178.60, nett: 142.88, private: 214.32 },
                5: { shared: 198.60, nett: 158.88, private: 238.32 },
                6: { shared: 218.60, nett: 174.88, private: 262.32 }
            },
            'penneshaw-ferry': {
                2: { shared: 198.00, nett: 158.40, private: 237.60 },
                3: { shared: 218.00, nett: 174.40, private: 261.60 },
                4: { shared: 238.00, nett: 190.40, private: 285.60 },
                5: { shared: 258.00, nett: 206.40, private: 309.60 },
                6: { shared: 278.00, nett: 222.40, private: 333.60 }
            }
        };

        // Penneshaw to other destinations rates
        const penneshawRates = {
            'kingscote-town': {
                2: { shared: 198.00, nett: 158.40, private: 237.60 },
                3: { shared: 218.00, nett: 174.40, private: 261.60 },
                4: { shared: 238.00, nett: 190.40, private: 285.60 },
                5: { shared: 258.00, nett: 206.40, private: 309.60 },
                6: { shared: 278.00, nett: 222.40, private: 333.60 }
            },
            'kingscote-airport': {
                2: { shared: 182.00, nett: 145.60, private: 218.40 },
                3: { shared: 202.00, nett: 161.60, private: 242.40 },
                4: { shared: 222.00, nett: 177.60, private: 266.40 },
                5: { shared: 242.00, nett: 193.60, private: 290.40 },
                6: { shared: 262.00, nett: 209.60, private: 314.40 }
            }
        };

        // American River to other destinations rates
        const americanRiverRates = {
            'emu-bay': {
                2: { shared: 105.00, nett: 84.00, private: 126.00 },
                3: { shared: 125.00, nett: 100.00, private: 150.00 },
                4: { shared: 145.00, nett: 116.00, private: 174.00 },
                5: { shared: 165.00, nett: 132.00, private: 198.00 },
                6: { shared: 185.00, nett: 148.00, private: 222.00 }
            },
            'parndana': {
                2: { shared: 120.00, nett: 96.00, private: 144.00 },
                3: { shared: 140.00, nett: 112.00, private: 168.00 },
                4: { shared: 160.00, nett: 128.00, private: 192.00 },
                5: { shared: 180.00, nett: 144.00, private: 216.00 },
                6: { shared: 200.00, nett: 160.00, private: 240.00 }
            }
        };

        // Emu Bay to other destinations rates
        const emuBayRates = {
            'american-river': {
                2: { shared: 105.00, nett: 84.00, private: 126.00 },
                3: { shared: 125.00, nett: 100.00, private: 150.00 },
                4: { shared: 145.00, nett: 116.00, private: 174.00 },
                5: { shared: 165.00, nett: 132.00, private: 198.00 },
                6: { shared: 185.00, nett: 148.00, private: 222.00 }
            },
            'parndana': {
                2: { shared: 98.00, nett: 78.40, private: 117.60 },
                3: { shared: 118.00, nett: 94.40, private: 141.60 },
                4: { shared: 138.00, nett: 110.40, private: 165.60 },
                5: { shared: 158.00, nett: 126.40, private: 189.60 },
                6: { shared: 178.00, nett: 142.40, private: 213.60 }
            }
        };

        // Parndana to other destinations rates
        const parndanaRates = {
            'american-river': {
                2: { shared: 120.00, nett: 96.00, private: 144.00 },
                3: { shared: 140.00, nett: 112.00, private: 168.00 },
                4: { shared: 160.00, nett: 128.00, private: 192.00 },
                5: { shared: 180.00, nett: 144.00, private: 216.00 },
                6: { shared: 200.00, nett: 160.00, private: 240.00 }
            },
            'emu-bay': {
                2: { shared: 98.00, nett: 78.40, private: 117.60 },
                3: { shared: 118.00, nett: 94.40, private: 141.60 },
                4: { shared: 138.00, nett: 110.40, private: 165.60 },
                5: { shared: 158.00, nett: 126.40, private: 189.60 },
                6: { shared: 178.00, nett: 142.40, private: 213.60 }
            }
        };

        let destinationRates = null;

        // Determine the destination rates based on pickup/dropoff
        if (pickup === 'kingscote-airport') {
            console.log(`Using airport rates for pickup: ${pickup}, dropoff: ${dropoff}`);
            destinationRates = airportRates[dropoff];
            console.log(`Found airport rates for ${dropoff}:`, !!destinationRates);
        } else if (dropoff === 'kingscote-airport') {
            console.log(`Using airport rates for pickup: ${pickup}, dropoff: ${dropoff}`);
            destinationRates = airportRates[pickup];
            console.log(`Found airport rates for ${pickup}:`, !!destinationRates);
        } else if (pickup === 'kingscote-town') {
            console.log(`Using kingscote rates for pickup: ${pickup}, dropoff: ${dropoff}`);
            destinationRates = kingscoteRates[dropoff];
            console.log(`Found kingscote rates for ${dropoff}:`, !!destinationRates);
        } else if (dropoff === 'kingscote-town') {
            console.log(`Using kingscote rates for pickup: ${pickup}, dropoff: ${dropoff}`);
            destinationRates = kingscoteRates[pickup];
            console.log(`Found kingscote rates for ${pickup}:`, !!destinationRates);
        } else if (pickup === 'penneshaw-ferry') {
            console.log(`Using penneshaw rates for pickup: ${pickup}, dropoff: ${dropoff}`);
            destinationRates = penneshawRates[dropoff];
            console.log(`Found penneshaw rates for ${dropoff}:`, !!destinationRates);
        } else if (dropoff === 'penneshaw-ferry') {
            console.log(`Using penneshaw rates for pickup: ${pickup}, dropoff: ${dropoff}`);
            destinationRates = penneshawRates[pickup];
            console.log(`Found penneshaw rates for ${pickup}:`, !!destinationRates);
        } else if (pickup === 'american-river') {
            console.log(`Using american river rates for pickup: ${pickup}, dropoff: ${dropoff}`);
            destinationRates = americanRiverRates[dropoff];
            console.log(`Found american river rates for ${dropoff}:`, !!destinationRates);
        } else if (dropoff === 'american-river') {
            console.log(`Using american river rates for pickup: ${pickup}, dropoff: ${dropoff}`);
            destinationRates = americanRiverRates[pickup];
            console.log(`Found american river rates for ${pickup}:`, !!destinationRates);
        } else if (pickup === 'emu-bay') {
            console.log(`Using emu bay rates for pickup: ${pickup}, dropoff: ${dropoff}`);
            destinationRates = emuBayRates[dropoff];
            console.log(`Found emu bay rates for ${dropoff}:`, !!destinationRates);
        } else if (dropoff === 'emu-bay') {
            console.log(`Using emu bay rates for pickup: ${pickup}, dropoff: ${dropoff}`);
            destinationRates = emuBayRates[pickup];
            console.log(`Found emu bay rates for ${pickup}:`, !!destinationRates);
        } else if (pickup === 'parndana') {
            console.log(`Using parndana rates for pickup: ${pickup}, dropoff: ${dropoff}`);
            destinationRates = parndanaRates[dropoff];
            console.log(`Found parndana rates for ${dropoff}:`, !!destinationRates);
        } else if (dropoff === 'parndana') {
            console.log(`Using parndana rates for pickup: ${pickup}, dropoff: ${dropoff}`);
            destinationRates = parndanaRates[pickup];
            console.log(`Found parndana rates for ${pickup}:`, !!destinationRates);
        }

        if (!destinationRates) {
            console.log(`No destination rates found for route: ${pickup} → ${dropoff}`);
            return 0;
        }

        // Handle passenger minimum rules
        let paxGroup = passengers > 6 ? 6 : passengers;
        let isMinimumPaxWarning = false;

        // Check if this is Airport ↔ Kingscote (only route that allows 1 passenger)
        const isAirportKingscote =
            (pickup === 'kingscote-airport' && dropoff === 'kingscote-town') ||
            (pickup === 'kingscote-town' && dropoff === 'kingscote-airport');

        // For 1 passenger on non-Airport↔Kingscote routes, use 2-passenger pricing
        if (passengers === 1 && !isAirportKingscote) {
            console.log(`Warning: 1 passenger on ${pickup} → ${dropoff} route - using 2-passenger pricing`);
            paxGroup = 2;
            isMinimumPaxWarning = true;
        }

        console.log(`Passenger group: ${paxGroup} for ${passengers} passengers${isMinimumPaxWarning ? ' (minimum 2 pax rule applied)' : ''}`);
        const rates = destinationRates[paxGroup];
        console.log(`Found rates for passenger group ${paxGroup}:`, !!rates);
        if (!rates) {
            console.log(`No rates found for passenger group ${paxGroup}. Available groups:`, Object.keys(destinationRates));
            return 0;
        }

        let price = 0;

        // Apply pricing based on customer type and service type
        if (customerType === 'personal') {
            // Personal customers get shared RRP or private RRP
            price = serviceType === 'shared' ? rates.shared : rates.private;
        } else if (customerType === 'agent') {
            // Agents get nett price (shared nett or private calculated from nett)
            if (serviceType === 'shared') {
                price = rates.nett;
            } else {
                // Private nett = shared nett * (private RRP / shared RRP)
                price = rates.nett * (rates.private / rates.shared);
            }
        } else if (customerType === 'corporate') {
            // Corporate gets special structure - using nett rates for now
            price = serviceType === 'shared' ? rates.nett : rates.nett * (rates.private / rates.shared);
        }

        // Apply return trip pricing - no discount, just double the one-way price
        if (tripType === 'return') {
            price *= 2.0; // Full double price for return
        }

        console.log(`Final calculated price: $${price} for ${pickup} → ${dropoff}`);
        return price;
    }

    function updateAllTransferPricing() {
        console.log('updateAllTransferPricing called');
        const legs = document.querySelectorAll('.transfer-leg');
        console.log('Found transfer legs:', legs.length);

        legs.forEach((leg, index) => {
            const legId = leg.dataset.legId;
            console.log(`Updating transfer ${index + 1}, legId: ${legId}`);

            // Check if all required fields exist for this leg
            const pickup = document.getElementById(`leg-${legId}-pickup`);
            const dropoff = document.getElementById(`leg-${legId}-dropoff`);
            const date = document.getElementById(`leg-${legId}-date`);
            const timeValue = document.querySelector(`[data-name="leg[${legId}][time]"] .time-value`);

            console.log(`Transfer ${legId} elements:`, {
                pickup: pickup ? pickup.value : 'missing',
                dropoff: dropoff ? dropoff.value : 'missing',
                date: date ? date.value : 'missing',
                time: timeValue ? timeValue.value : 'missing'
            });

            updateLegSummary(legId);
        });
        updateMultiTransferSummary();
    }

    function updateMultiTransferSummary() {
        console.log('updateMultiTransferSummary called');
        const legs = document.querySelectorAll('.transfer-leg');
        console.log('Found legs:', legs.length);
        let totalPrice = 0;
        let completedLegs = 0;

        // Check if we need to create the add button section
        let addButtonSection = document.querySelector('.add-transfer-bottom');
        if (!addButtonSection && legs.length > 0) {
            const multiTransferSection = document.getElementById('staff-multi-transfer-section');
            addButtonSection = document.createElement('div');
            addButtonSection.className = 'add-transfer-bottom';
            addButtonSection.innerHTML = '<button type="button" class="btn-secondary" onclick="addTransferLeg()">+ Add Transfer</button>';
            multiTransferSection.appendChild(addButtonSection);
        }

        // Check if we need to create the summary section
        let summarySection = document.querySelector('.total-legs-summary');
        if (!summarySection && legs.length > 0) {
            console.log('Creating summary section');
            const multiTransferSection = document.getElementById('staff-multi-transfer-section');
            if (multiTransferSection) {
                summarySection = document.createElement('div');
                summarySection.className = 'total-legs-summary';
                multiTransferSection.appendChild(summarySection);
                console.log('Summary section created and appended');
            } else {
                console.error('Could not find staff-multi-transfer-section');
            }
        }

        if (summarySection && legs.length > 0) {
            console.log('Updating summary content');
            let summaryHTML = '<h4>📋 Multi-Transfer Summary</h4><div class="legs-breakdown">';

            legs.forEach((leg, index) => {
                const legId = leg.dataset.legId;
                const pickup = document.getElementById(`leg-${legId}-pickup`).value;
                const dropoff = document.getElementById(`leg-${legId}-dropoff`).value;
                const date = document.getElementById(`leg-${legId}-date`).value;
                const timeValue = document.querySelector(`[data-name="leg[${legId}][time]"] .time-value`).value;

                if (pickup && dropoff && date && timeValue) {
                    const passengers = parseInt(document.getElementById('staff-passengers').value) || 1;
                    const serviceType = document.getElementById('staff-service-type').value;
                    const customerType = document.getElementById('staff-customer-type').value;
                    const price = calculateLegPrice(pickup, dropoff, passengers, serviceType, customerType);

                    totalPrice += price;
                    completedLegs++;

                    summaryHTML += `
                        <div class="leg-breakdown-item">
                            <span>Transfer ${parseInt(legId)}: ${getLocationDisplayName(pickup)} → ${getLocationDisplayName(dropoff)}</span>
                            <span>$${price.toFixed(2)}</span>
                        </div>
                    `;
                } else {
                    summaryHTML += `
                        <div class="leg-breakdown-item">
                            <span>Transfer ${parseInt(legId)}: <em>Incomplete</em></span>
                            <span>-</span>
                        </div>
                    `;
                }
            });

            summaryHTML += `
                <div class="total-price-row">
                    <span>Total (${completedLegs}/${legs.length} transfers):</span>
                    <span>$${totalPrice.toFixed(2)}</span>
                </div>
            </div>`;

            summarySection.innerHTML = summaryHTML;
        }

        // Update main price display
        const priceDisplay = document.getElementById('staff-price-display');
        if (priceDisplay && legs.length > 0) {
            if (completedLegs === legs.length && legs.length > 0) {
                priceDisplay.textContent = `$${totalPrice.toFixed(2)} (${legs.length} transfers)`;
            } else {
                priceDisplay.textContent = `$${totalPrice.toFixed(2)} (${completedLegs}/${legs.length} transfers)`;
            }
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-AU', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    }


    // Make functions globally available
    window.addTransferLeg = addTransferLeg;
    window.removeLeg = removeLeg;
    window.toggleLeg = toggleLeg;
});