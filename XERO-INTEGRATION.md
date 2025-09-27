# Xero API Integration Architecture
## Kangaroo Island Transfers - Direct Accounting Integration

### Version: 1.0
### Date: September 27, 2025

---

## 1. Overview

This document outlines the direct integration between the KIT booking system and Xero accounting software, eliminating the need for Zapier workflows and providing real-time financial data synchronization.

## 2. Xero API Setup Requirements

### 2.1 Developer Account Setup
1. **Create Xero Developer Account** at https://developer.xero.com/
2. **Create New App** in Xero Developer Portal
3. **Configure OAuth 2.0 Settings:**
   - App Type: Web App
   - Redirect URI: `https://your-domain.com/auth/xero/callback`
   - Scopes: `accounting.transactions`, `accounting.contacts`, `accounting.settings`

### 2.2 Required Credentials
```env
XERO_CLIENT_ID=your_client_id_here
XERO_CLIENT_SECRET=your_client_secret_here
XERO_REDIRECT_URI=https://your-domain.com/auth/xero/callback
XERO_SCOPE=accounting.transactions accounting.contacts accounting.settings
```

## 3. Integration Architecture

### 3.1 System Flow
```
Booking Submission → Backend API → Database → Xero API
                                      ↓
Customer Creation ← Invoice Generation ← Payment Tracking
```

### 3.2 Data Mapping

#### 3.2.1 Customer Mapping
| KIT Field | Xero Field | Notes |
|-----------|------------|-------|
| firstName + lastName | Name | Combined full name |
| email | EmailAddress | Primary contact |
| phone | Phone.PhoneNumber | Contact number |
| customerType | ContactGroups | Private/Corporate/Agent |
| address | Address | When collected |

#### 3.2.2 Invoice Mapping
| KIT Field | Xero Field | Notes |
|-----------|------------|-------|
| pnr | Reference | Booking reference |
| departDate | Date | Invoice date |
| pickupLocation + dropoffLocation | Description | Service description |
| totalPrice | LineAmount | Calculated total |
| agent | Contact | Agent as customer if agent booking |

## 4. API Endpoints and Functions

### 4.1 Authentication Functions
```javascript
// OAuth 2.0 Authorization URL
function getXeroAuthUrl() {
    const baseUrl = 'https://login.xero.com/identity/connect/authorize';
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.XERO_CLIENT_ID,
        redirect_uri: process.env.XERO_REDIRECT_URI,
        scope: process.env.XERO_SCOPE,
        state: generateSecureState()
    });
    return `${baseUrl}?${params.toString()}`;
}

// Exchange authorization code for tokens
async function exchangeCodeForTokens(authCode) {
    const response = await fetch('https://identity.xero.com/connect/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(
                `${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`
            ).toString('base64')}`
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: authCode,
            redirect_uri: process.env.XERO_REDIRECT_URI
        })
    });
    return response.json();
}
```

### 4.2 Customer Management
```javascript
// Create customer in Xero
async function createXeroCustomer(customerData, accessToken, tenantId) {
    const contact = {
        Name: `${customerData.firstName} ${customerData.lastName}`,
        EmailAddress: customerData.email,
        Phones: customerData.phone ? [{
            PhoneType: 'MOBILE',
            PhoneNumber: customerData.phone
        }] : [],
        ContactGroups: [{
            Name: customerData.customerType || 'Private'
        }],
        DefaultCurrency: 'AUD'
    };

    const response = await fetch(`https://api.xero.com/api.xro/2.0/Contacts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Xero-Tenant-Id': tenantId,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Contacts: [contact] })
    });

    return response.json();
}

// Find existing customer
async function findXeroCustomer(email, accessToken, tenantId) {
    const response = await fetch(
        `https://api.xero.com/api.xro/2.0/Contacts?where=EmailAddress="${email}"`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Xero-Tenant-Id': tenantId
            }
        }
    );
    return response.json();
}
```

### 4.3 Invoice Creation
```javascript
// Create invoice for booking
async function createBookingInvoice(bookingData, customerId, accessToken, tenantId) {
    const invoice = {
        Type: 'ACCREC', // Accounts Receivable
        Contact: { ContactID: customerId },
        Date: new Date().toISOString().split('T')[0],
        DueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days
        Reference: bookingData.pnr,
        LineAmountTypes: 'Inclusive', // Prices include GST
        LineItems: [
            {
                Description: `Transfer Service: ${bookingData.pickupLocation} to ${bookingData.dropoffLocation}`,
                Quantity: 1,
                UnitAmount: bookingData.totalPrice,
                AccountCode: '200', // Sales account
                TaxType: 'OUTPUT2' // 10% GST
            }
        ],
        Status: 'DRAFT' // Start as draft, authorize later
    };

    // Add return trip if applicable
    if (bookingData.tripType === 'return' && bookingData.returnDate) {
        invoice.LineItems.push({
            Description: `Return Transfer: ${bookingData.dropoffLocation} to ${bookingData.pickupLocation}`,
            Quantity: 1,
            UnitAmount: bookingData.returnPrice || bookingData.totalPrice,
            AccountCode: '200',
            TaxType: 'OUTPUT2'
        });
    }

    const response = await fetch(`https://api.xero.com/api.xro/2.0/Invoices`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Xero-Tenant-Id': tenantId,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Invoices: [invoice] })
    });

    return response.json();
}
```

### 4.4 Agent Commission Invoices
```javascript
// Create agent commission invoice
async function createAgentCommissionInvoice(agentData, bookings, accessToken, tenantId) {
    // Calculate total commission
    const totalCommission = bookings.reduce((sum, booking) => {
        return sum + (booking.totalPrice * (agentData.commissionRate / 100));
    }, 0);

    const invoice = {
        Type: 'ACCPAY', // Accounts Payable (we owe the agent)
        Contact: { ContactID: agentData.xeroContactId },
        Date: new Date().toISOString().split('T')[0],
        DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
        Reference: `COMM-${new Date().getMonth() + 1}-${new Date().getFullYear()}`,
        LineAmountTypes: 'Inclusive',
        LineItems: bookings.map(booking => ({
            Description: `Commission: ${booking.pnr} - ${booking.pickupLocation} to ${booking.dropoffLocation}`,
            Quantity: 1,
            UnitAmount: booking.totalPrice * (agentData.commissionRate / 100),
            AccountCode: '310', // Commission expense account
            TaxType: 'INPUT2' // 10% GST on commission
        })),
        Status: 'DRAFT'
    };

    const response = await fetch(`https://api.xero.com/api.xro/2.0/Invoices`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Xero-Tenant-Id': tenantId,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Invoices: [invoice] })
    });

    return response.json();
}
```

### 4.5 Payment Tracking
```javascript
// Record payment in Xero
async function recordPayment(invoiceId, paymentData, accessToken, tenantId) {
    const payment = {
        Invoice: { InvoiceID: invoiceId },
        Account: { Code: '090' }, // Bank account
        Date: paymentData.date,
        Amount: paymentData.amount,
        Reference: paymentData.reference || 'Online Payment'
    };

    const response = await fetch(`https://api.xero.com/api.xro/2.0/Payments`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Xero-Tenant-Id': tenantId,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Payments: [payment] })
    });

    return response.json();
}
```

## 5. Booking-to-Xero Workflow

### 5.1 New Booking Process
1. **Customer submits booking** via enhanced form
2. **Backend validates** and saves booking to database
3. **Check if customer exists** in Xero
4. **Create customer** in Xero if not exists
5. **Generate invoice** in Xero for booking
6. **Send confirmation email** with Xero invoice link
7. **Update booking record** with Xero IDs

### 5.2 Payment Processing
1. **Payment received** (online/bank transfer/cash)
2. **Update payment status** in booking system
3. **Record payment** in Xero against invoice
4. **Update invoice status** to PAID
5. **Send payment confirmation** to customer

### 5.3 Agent Commission Processing
1. **Monthly commission run** (automated)
2. **Calculate commissions** for all agent bookings
3. **Create commission invoice** in Xero
4. **Send commission statement** to agent
5. **Track commission payments**

## 6. Error Handling and Resilience

### 6.1 API Rate Limits
- **Xero API Limit:** 60 calls per minute per tenant
- **Implement rate limiting** with exponential backoff
- **Queue system** for high-volume periods
- **Retry logic** for temporary failures

### 6.2 Token Management
```javascript
// Refresh access token
async function refreshXeroToken(refreshToken) {
    const response = await fetch('https://identity.xero.com/connect/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(
                `${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`
            ).toString('base64')}`
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        })
    });
    return response.json();
}
```

### 6.3 Fallback Strategies
- **Queue failed requests** for retry
- **Manual sync interface** for administrators
- **Data export capabilities** for backup
- **Webhook notifications** for critical failures

## 7. Security Considerations

### 7.1 Token Storage
- **Encrypt tokens** at rest in database
- **Secure token transmission** via HTTPS only
- **Regular token rotation** (30-day refresh cycle)
- **Audit logging** for all API calls

### 7.2 Data Protection
- **HTTPS only** for all API communications
- **Input validation** for all Xero API calls
- **Error message sanitization** (no sensitive data in logs)
- **IP allowlisting** for Xero webhooks

## 8. Testing Strategy

### 8.1 Xero Demo Organization
1. **Create Xero Demo Company** for testing
2. **Test all API endpoints** in sandbox environment
3. **Validate data mapping** and format requirements
4. **Test error scenarios** and recovery procedures

### 8.2 Integration Testing
```javascript
// Test customer creation
describe('Xero Customer Integration', () => {
    test('should create customer in Xero', async () => {
        const customerData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+61 400 123 456'
        };

        const result = await createXeroCustomer(customerData, mockToken, mockTenantId);
        expect(result.Contacts[0].Name).toBe('John Doe');
    });
});
```

## 9. Monitoring and Analytics

### 9.1 Key Metrics
- **API Success Rate:** Target >99.5%
- **Response Time:** Target <2 seconds
- **Invoice Creation Time:** Target <30 seconds
- **Data Sync Accuracy:** Target 100%

### 9.2 Alerting
- **Failed API calls** → Immediate admin notification
- **Token expiry warnings** → 7-day advance notice
- **Rate limit approaches** → Throttling activation
- **Daily sync summaries** → Management reports

## 10. Cost Analysis

### 10.1 Cost Comparison
| Method | Monthly Cost | Setup Effort | Reliability | Control |
|--------|-------------|--------------|-------------|---------|
| **Zapier** | $50-200+ | Low | Medium | Low |
| **Direct API** | $0 | High | High | High |

### 10.2 ROI Calculation
- **Zapier savings:** $600-2400/year
- **Development cost:** ~40 hours
- **Break-even:** 2-3 months
- **Annual savings:** $600-2400+

---

## Next Steps

1. **Set up Xero Developer Account** and create app
2. **Implement OAuth 2.0 flow** in backend
3. **Create API wrapper functions** for core operations
4. **Test in Xero demo environment**
5. **Deploy to production** with monitoring

This direct integration will provide superior reliability, cost savings, and full control over your accounting workflows compared to the current Zapier-based solution.