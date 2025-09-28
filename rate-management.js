// Rate Management System for KIT
document.addEventListener('DOMContentLoaded', function() {
    // Rate management modal elements
    const rateModal = document.getElementById('rate-management-modal');
    const manageRatesBtn = document.getElementById('manage-rates-btn');
    const rateModalClose = document.getElementById('rate-modal-close');
    const rateModalCancel = document.getElementById('rate-modal-cancel');
    const saveRatesBtn = document.getElementById('save-rates');
    const financialYearSelect = document.getElementById('financial-year');
    const rateTableBody = document.getElementById('rate-table-body');

    // Action buttons
    const copyPreviousYearBtn = document.getElementById('copy-previous-year');
    const bulkIncreaseBtn = document.getElementById('bulk-increase');
    const importRatesBtn = document.getElementById('import-rates');
    const exportRatesBtn = document.getElementById('export-rates');
    const saveTemplateBtn = document.getElementById('save-template');
    const loadTemplateBtn = document.getElementById('load-template');
    const templateSelector = document.getElementById('template-selector');
    const rateFileInput = document.getElementById('rate-file-input');

    // Route definitions
    const routes = [
        { from: 'kingscote-airport', to: 'kingscote-town', label: 'Airport → Kingscote Town', minPassengers: 1 },
        { from: 'kingscote-town', to: 'kingscote-airport', label: 'Kingscote Town → Airport', minPassengers: 1 },
        { from: 'kingscote-airport', to: 'american-river', label: 'Airport → American River', minPassengers: 2 },
        { from: 'kingscote-airport', to: 'penneshaw-ferry', label: 'Airport → Penneshaw Ferry', minPassengers: 2 },
        { from: 'kingscote-airport', to: 'vivonne-bay', label: 'Airport → Vivonne Bay', minPassengers: 2 },
        { from: 'kingscote-airport', to: 'emu-bay', label: 'Airport → Emu Bay', minPassengers: 2 },
        { from: 'kingscote-airport', to: 'parndana', label: 'Airport → Parndana', minPassengers: 2 },
        { from: 'kingscote-airport', to: 'remarkable-rocks', label: 'Airport → Remarkable Rocks', minPassengers: 2 },
        { from: 'kingscote-airport', to: 'admirals-arch', label: 'Airport → Admirals Arch', minPassengers: 2 },
        { from: 'kingscote-town', to: 'american-river', label: 'Kingscote → American River', minPassengers: 2 },
        { from: 'kingscote-town', to: 'penneshaw-ferry', label: 'Kingscote → Penneshaw Ferry', minPassengers: 2 },
        { from: 'kingscote-town', to: 'vivonne-bay', label: 'Kingscote → Vivonne Bay', minPassengers: 2 },
        { from: 'kingscote-town', to: 'emu-bay', label: 'Kingscote → Emu Bay', minPassengers: 2 },
        { from: 'kingscote-town', to: 'parndana', label: 'Kingscote → Parndana', minPassengers: 2 },
        { from: 'kingscote-town', to: 'remarkable-rocks', label: 'Kingscote → Remarkable Rocks', minPassengers: 2 },
        { from: 'kingscote-town', to: 'admirals-arch', label: 'Kingscote → Admirals Arch', minPassengers: 2 },
        { from: 'penneshaw-ferry', to: 'kingscote-town', label: 'Penneshaw → Kingscote Town', minPassengers: 2 },
        { from: 'penneshaw-ferry', to: 'kingscote-airport', label: 'Penneshaw → Airport', minPassengers: 2 },
        { from: 'penneshaw-ferry', to: 'american-river', label: 'Penneshaw → American River', minPassengers: 2 },
        { from: 'penneshaw-ferry', to: 'parndana', label: 'Penneshaw → Parndana', minPassengers: 2 },
        { from: 'penneshaw-ferry', to: 'vivonne-bay', label: 'Penneshaw → Vivonne Bay', minPassengers: 2 },
        { from: 'penneshaw-ferry', to: 'emu-bay', label: 'Penneshaw → Emu Bay', minPassengers: 2 },
        { from: 'penneshaw-ferry', to: 'remarkable-rocks', label: 'Penneshaw → Remarkable Rocks', minPassengers: 2 },
        { from: 'penneshaw-ferry', to: 'admirals-arch', label: 'Penneshaw → Admirals Arch', minPassengers: 2 }
    ];

    // Default rates (current rates from script.js)
    const defaultRates = {
        'kingscote-airport': {
            'kingscote-town': { 1: 45.00, 2: 90.00, 3: 110.00, 4: 130.00, 5: 150.00, 6: 170.00 },
            'american-river': { 2: 105.00, 3: 125.00, 4: 145.00, 5: 165.00, 6: 185.00 },
            'penneshaw-ferry': { 2: 182.00, 3: 202.00, 4: 222.00, 5: 242.00, 6: 262.00 },
            'vivonne-bay': { 2: 315.00, 3: 335.00, 4: 355.00, 5: 375.00, 6: 395.00 },
            'emu-bay': { 2: 94.50, 3: 114.50, 4: 134.50, 5: 154.50, 6: 174.50 },
            'parndana': { 2: 87.50, 3: 107.50, 4: 127.50, 5: 147.50, 6: 167.50 },
            'remarkable-rocks': { 2: 157.50, 3: 177.50, 4: 197.50, 5: 217.50, 6: 237.50 },
            'admirals-arch': { 2: 280.00, 3: 300.00, 4: 320.00, 5: 340.00, 6: 360.00 }
        },
        'kingscote-town': {
            'kingscote-airport': { 1: 36.00, 2: 72.00, 3: 92.00, 4: 112.00, 5: 132.00, 6: 152.00 },
            'american-river': { 2: 138.60, 3: 158.60, 4: 178.60, 5: 198.60, 6: 218.60 },
            'penneshaw-ferry': { 2: 198.00, 3: 218.00, 4: 238.00, 5: 258.00, 6: 278.00 },
            'vivonne-bay': { 2: 326.70, 3: 346.70, 4: 366.70, 5: 386.70, 6: 406.70 },
            'emu-bay': { 2: 89.10, 3: 109.10, 4: 129.10, 5: 149.10, 6: 169.10 },
            'parndana': { 2: 161.70, 3: 181.70, 4: 201.70, 5: 221.70, 6: 241.70 },
            'remarkable-rocks': { 2: 211.20, 3: 231.20, 4: 251.20, 5: 271.20, 6: 291.20 },
            'admirals-arch': { 2: 290.40, 3: 310.40, 4: 330.40, 5: 350.40, 6: 370.40 }
        },
        'penneshaw-ferry': {
            'kingscote-town': { 2: 198.00, 3: 218.00, 4: 238.00, 5: 258.00, 6: 278.00 },
            'kingscote-airport': { 2: 171.60, 3: 191.60, 4: 211.60, 5: 231.60, 6: 251.60 },
            'american-river': { 2: 132.00, 3: 152.00, 4: 172.00, 5: 192.00, 6: 212.00 },
            'parndana': { 2: 257.40, 3: 277.40, 4: 297.40, 5: 317.40, 6: 337.40 },
            'vivonne-bay': { 2: 297.00, 3: 317.00, 4: 337.00, 5: 357.00, 6: 377.00 },
            'emu-bay': { 2: 227.70, 3: 247.70, 4: 267.70, 5: 287.70, 6: 307.70 },
            'remarkable-rocks': { 2: 359.70, 3: 379.70, 4: 399.70, 5: 419.70, 6: 439.70 },
            'admirals-arch': { 2: 99.00, 3: 119.00, 4: 139.00, 5: 159.00, 6: 179.00 }
        }
    };

    let currentRates = {};

    // Initialize rate management
    function initializeRateManagement() {
        // Set current financial year
        const currentYear = getCurrentFinancialYear();
        financialYearSelect.value = currentYear;

        // Load rates for current year
        loadRatesForYear(currentYear);

        // Generate rate table
        generateRateTable();

        // Load templates
        loadTemplates();
    }

    // Get current financial year (April 1 - March 31)
    function getCurrentFinancialYear() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-based

        if (month >= 3) { // April or later
            return `${year}-${year + 1}`;
        } else { // January - March
            return `${year - 1}-${year}`;
        }
    }

    // Load rates for a specific financial year
    function loadRatesForYear(financialYear) {
        const stored = localStorage.getItem(`rates_${financialYear}`);
        if (stored) {
            currentRates = JSON.parse(stored);
        } else {
            // Use default rates if none exist
            currentRates = JSON.parse(JSON.stringify(defaultRates));
        }
    }

    // Generate the rate table
    function generateRateTable() {
        rateTableBody.innerHTML = '';

        routes.forEach((route, index) => {
            const row = document.createElement('tr');

            // Route label
            const labelCell = document.createElement('td');
            labelCell.className = 'route-label';
            labelCell.textContent = route.label;
            row.appendChild(labelCell);

            // Passenger columns (1-6+)
            for (let passengers = 1; passengers <= 6; passengers++) {
                const cell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.step = '0.01';
                input.min = '0';
                input.className = 'rate-input';
                input.dataset.route = `${route.from}-${route.to}`;
                input.dataset.passengers = passengers;

                // Disable if below minimum passengers for route
                if (passengers < route.minPassengers) {
                    input.disabled = true;
                    input.className += ' disabled';
                    input.placeholder = 'N/A';
                } else {
                    // Get current rate
                    const routeRates = currentRates[route.from]?.[route.to];
                    if (routeRates && routeRates[passengers]) {
                        input.value = routeRates[passengers].toFixed(2);
                    }
                }

                cell.appendChild(input);
                row.appendChild(cell);
            }

            rateTableBody.appendChild(row);
        });
    }

    // Save rates to localStorage
    function saveRates() {
        const financialYear = financialYearSelect.value;
        const inputs = document.querySelectorAll('.rate-input:not(.disabled)');
        const newRates = {};

        inputs.forEach(input => {
            if (input.value && parseFloat(input.value) > 0) {
                const [from, to] = input.dataset.route.split('-');
                const passengers = parseInt(input.dataset.passengers);
                const rate = parseFloat(input.value);

                if (!newRates[from]) newRates[from] = {};
                if (!newRates[from][to]) newRates[from][to] = {};
                newRates[from][to][passengers] = rate;
            }
        });

        // Save to localStorage
        localStorage.setItem(`rates_${financialYear}`, JSON.stringify(newRates));

        // Update current rates
        currentRates = newRates;

        alert(`Rates saved for financial year ${financialYear}!`);
        rateModal.style.display = 'none';
    }

    // Copy rates from previous year
    function copyFromPreviousYear() {
        const currentYear = financialYearSelect.value;
        const [startYear] = currentYear.split('-');
        const previousYear = `${parseInt(startYear) - 1}-${parseInt(startYear)}`;

        const previousRates = localStorage.getItem(`rates_${previousYear}`);
        if (previousRates) {
            currentRates = JSON.parse(previousRates);
            generateRateTable();
            alert(`Rates copied from ${previousYear}!`);
        } else {
            alert(`No rates found for ${previousYear}`);
        }
    }

    // Bulk increase rates
    function bulkIncrease() {
        const percentage = prompt('Enter percentage increase (e.g., 5 for 5%):');
        if (percentage && !isNaN(percentage)) {
            const multiplier = 1 + (parseFloat(percentage) / 100);

            const inputs = document.querySelectorAll('.rate-input:not(.disabled)');
            inputs.forEach(input => {
                if (input.value && parseFloat(input.value) > 0) {
                    const newValue = parseFloat(input.value) * multiplier;
                    input.value = newValue.toFixed(2);
                }
            });

            alert(`All rates increased by ${percentage}%!`);
        }
    }

    // Export rates
    function exportRates() {
        const financialYear = financialYearSelect.value;
        const data = {
            financialYear: financialYear,
            rates: currentRates,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `KIT_Rates_${financialYear}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Import rates
    function importRates() {
        rateFileInput.click();
    }

    // Handle file import
    function handleFileImport(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.rates) {
                        currentRates = data.rates;
                        generateRateTable();
                        alert('Rates imported successfully!');
                    } else {
                        alert('Invalid rate file format');
                    }
                } catch (error) {
                    alert('Error reading file: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    }

    // Load templates
    function loadTemplates() {
        const templates = JSON.parse(localStorage.getItem('rate_templates') || '{}');
        templateSelector.innerHTML = '<option value="">Choose template...</option>';

        Object.keys(templates).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            templateSelector.appendChild(option);
        });
    }

    // Save template
    function saveTemplate() {
        const name = prompt('Enter template name:');
        if (name) {
            const templates = JSON.parse(localStorage.getItem('rate_templates') || '{}');
            templates[name] = {
                rates: currentRates,
                created: new Date().toISOString()
            };
            localStorage.setItem('rate_templates', JSON.stringify(templates));
            loadTemplates();
            alert(`Template "${name}" saved!`);
        }
    }

    // Load template
    function loadTemplate() {
        const name = templateSelector.value;
        if (name) {
            const templates = JSON.parse(localStorage.getItem('rate_templates') || '{}');
            if (templates[name]) {
                currentRates = templates[name].rates;
                generateRateTable();
                alert(`Template "${name}" loaded!`);
            }
        }
    }

    // Event listeners
    if (manageRatesBtn) {
        manageRatesBtn.addEventListener('click', function() {
            initializeRateManagement();
            rateModal.style.display = 'block';
        });
    }

    if (rateModalClose) {
        rateModalClose.addEventListener('click', function() {
            rateModal.style.display = 'none';
        });
    }

    if (rateModalCancel) {
        rateModalCancel.addEventListener('click', function() {
            rateModal.style.display = 'none';
        });
    }

    if (saveRatesBtn) {
        saveRatesBtn.addEventListener('click', saveRates);
    }

    if (financialYearSelect) {
        financialYearSelect.addEventListener('change', function() {
            loadRatesForYear(this.value);
            generateRateTable();
        });
    }

    if (copyPreviousYearBtn) {
        copyPreviousYearBtn.addEventListener('click', copyFromPreviousYear);
    }

    if (bulkIncreaseBtn) {
        bulkIncreaseBtn.addEventListener('click', bulkIncrease);
    }

    if (exportRatesBtn) {
        exportRatesBtn.addEventListener('click', exportRates);
    }

    if (importRatesBtn) {
        importRatesBtn.addEventListener('click', importRates);
    }

    if (rateFileInput) {
        rateFileInput.addEventListener('change', handleFileImport);
    }

    if (saveTemplateBtn) {
        saveTemplateBtn.addEventListener('click', saveTemplate);
    }

    if (loadTemplateBtn) {
        loadTemplateBtn.addEventListener('click', loadTemplate);
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === rateModal) {
            rateModal.style.display = 'none';
        }
    });

    // Export rate management functions for use in booking system
    window.RateManager = {
        getRatesForDate: function(bookingDate) {
            const financialYear = getFinancialYearForDate(bookingDate);
            const stored = localStorage.getItem(`rates_${financialYear}`);
            return stored ? JSON.parse(stored) : defaultRates;
        },

        getCurrentRates: function() {
            const currentYear = getCurrentFinancialYear();
            const stored = localStorage.getItem(`rates_${currentYear}`);
            return stored ? JSON.parse(stored) : defaultRates;
        }
    };

    function getFinancialYearForDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-based

        if (month >= 3) { // April or later
            return `${year}-${year + 1}`;
        } else { // January - March
            return `${year - 1}-${year}`;
        }
    }
});