# Product Requirements Document (PRD)
## Kangaroo Island Transfers - Enhanced Booking System

### Version: 1.0
### Date: September 27, 2025
### Author: Claude Code Analysis

---

## 1. Executive Summary

This PRD outlines the enhancement of the current Kangaroo Island Transfers booking system to match the comprehensive functionality of the existing Knack-based system. The goal is to create a feature-rich, **internet-based booking system** that can be accessed remotely by all users (customers, agents, and staff) while capturing all necessary information for transfer services and maintaining the current clean, modern design.

## 2. Current State Analysis

### 2.1 Existing Simple Form Fields
- Pickup Location (text input)
- Drop-off Location (text input)
- Date (date input)
- Time (time input)
- Number of Passengers (select dropdown, 1-8+)
- Additional Notes (textarea, optional)

### 2.2 Knack System Comprehensive Structure
Based on analysis of 45+ screenshots, the Knack system includes:

#### Core Tables:
- **Reservations** (main booking container)
- **Bookings** (individual transfer instances)
- **Customers** (customer database)
- **Agents** (travel agent partners)
- **Pick up locations** (standardized locations)
- **Vehicles** (fleet management)
- **Rates** (pricing structure)
- **Passenger groups** (group size categories)
- **Fixed Priced Reservations** (package deals)

#### Support Tables:
- Customer service notes
- Agent invoices
- Exception dates
- Rate types
- Exception date types

## 3. Key Missing Features Analysis

### 3.1 Customer Management
**Missing from current form:**
- Customer type (Corporate/Private/Agent)
- Is existing customer (Yes/No)
- Full name structure (First/Last with title/suffix options)
- Email validation and "has email" tracking
- Phone number with proper formatting
- Save as customer option
- Customer ID system

### 3.2 Trip Configuration
**Missing from current form:**
- Return date/time (for round trips)
- Trip type selection (one-way/return)
- Agent assignment
- Agent reference numbers
- Traveller names (for multiple passengers)
- Passenger group categorization
- Vehicle selection/assignment

### 3.3 Pricing & Financial
**Missing from current form:**
- Dynamic pricing calculation
- Rate type selection
- Fixed price reservations
- Payment method selection
- Payment status tracking
- Agent commission tracking

### 3.4 Operational Features
**Missing from current form:**
- Reservation status workflow
- PNR (Passenger Name Record) generation
- Booking confirmation system
- Calendar integration
- Exception date handling
- Service notes capability

## 4. Enhanced Form Requirements

### 4.1 Customer Information Section
```
Customer Details:
├── Customer Type: [Dropdown: Corporate/Private/Agent] (Optional)
├── Is Existing Customer: [Dropdown: Yes/No] (Optional)
├── Full Name: [Name field: First*, Last*, Title, Suffix] (Required)
├── Has Email: [Yes/No checkbox] (Optional)
├── Email: [Email validation] (Optional)
├── Phone: [Phone format validation] (Optional)
└── Save as Customer: [Yes/No checkbox] (Optional)
```

### 4.2 Trip Details Section
```
Trip Configuration:
├── Trip Type: [Dropdown: One Way/Return] (Required)
├── Pick up Location: [Dropdown from locations table] (Required)
├── Drop off Location: [Dropdown from locations table] (Required)
├── Depart Date/Time: [DateTime picker] (Required)
├── Return Date/Time: [DateTime picker] (Conditional on trip type)
├── Passenger Group: [Dropdown based on passenger count] (Required)
└── Traveller Names: [Text area for multiple passengers] (Optional)
```

### 4.3 Service Configuration
```
Service Details:
├── Agent Assignment: [Dropdown if agent booking] (Optional)
├── Agent Reference: [Text input] (Optional)
├── Vehicle Preference: [Dropdown] (Optional)
├── Rate Type: [Auto-calculated or dropdown] (System)
├── Special Requirements: [Text area] (Optional)
└── Fixed Price Package: [Dropdown if applicable] (Optional)
```

### 4.4 Pricing Display
```
Price Summary:
├── Base Rate: [Auto-calculated display]
├── Additional Charges: [If applicable]
├── Total Price: [Calculated field]
├── Payment Method: [Dropdown: Pay on Day/On Account/etc.]
└── Special Notes: [Display field]
```

## 5. Technical Implementation Requirements

### 5.1 Form Validation Rules
- **Required Fields:** Trip type, pickup/dropoff locations, depart date/time, passenger group, customer name
- **Conditional Fields:** Return date/time (if return trip), email (if "has email" = yes)
- **Format Validation:** Email format, phone format, date/time logic
- **Business Rules:** Depart date >= today, return date > depart date

### 5.2 Data Structure
```javascript
Booking Object Structure:
{
  // Customer Information
  customerType: string,
  isExistingCustomer: boolean,
  customerName: {
    firstName: string,
    lastName: string,
    title: string,
    suffix: string
  },
  hasEmail: boolean,
  email: string,
  phone: string,
  saveAsCustomer: boolean,

  // Trip Details
  tripType: string,
  pickupLocation: string,
  dropoffLocation: string,
  departDateTime: datetime,
  returnDateTime: datetime,
  passengerGroup: string,
  travellerNames: string,

  // Service Details
  agent: string,
  agentReference: string,
  vehiclePreference: string,
  rateType: string,
  specialRequirements: string,
  fixedPricePackage: string,

  // System Fields
  pnr: string,
  totalPrice: number,
  reservationStatus: string,
  paymentMethod: string,
  addedDate: datetime
}
```

### 5.3 Form Flow Logic
1. **Customer Type Selection** → Determines if agent fields appear
2. **Trip Type Selection** → Shows/hides return date/time
3. **Location Selection** → Auto-calculates available rates
4. **Passenger Count** → Determines passenger group category
5. **Rate Calculation** → Dynamic pricing based on selections
6. **Validation** → Comprehensive client-side validation
7. **Submission** → Generate PNR and confirmation

## 6. User Experience Requirements

### 6.1 Form Layout
- **Progressive Disclosure:** Show sections as needed based on selections
- **Smart Defaults:** Remember common selections
- **Responsive Design:** Maintain mobile-friendly layout
- **Clear Validation:** Inline error messages with helpful text
- **Progress Indication:** Show completion status

### 6.2 Accessibility
- **WCAG 2.1 AA Compliance**
- **Keyboard Navigation:** Full keyboard accessibility
- **Screen Reader Support:** Proper ARIA labels
- **High Contrast:** Maintain readability standards

## 7. Integration Requirements

### 7.1 Web-Based Architecture
- **Cloud Hosting:** Deploy on reliable web hosting platform
- **Database Integration:** Connect to cloud database for real-time data
- **Session Management:** Handle user sessions and incomplete bookings
- **Data Backup:** Automated cloud backup strategy
- **Security:** HTTPS encryption and data protection

### 7.2 Multi-User Access Requirements
- **Public Booking Form:** Direct customer access via website
- **Agent Portal:** Secure login for travel agents
- **Staff Dashboard:** Administrative access for KIT staff
- **Real-time Updates:** Live booking availability and pricing
- **Mobile Responsive:** Full functionality on all devices

### 7.3 Backend Integration (Essential)
- **Database:** Real-time storage of all bookings and customer data
- **Authentication System:** User roles (customer/agent/admin)
- **API Endpoints:** RESTful API for form submissions and data retrieval
- **Email Notifications:** Automated booking confirmations
- **Reporting Dashboard:** Real-time analytics and booking management

### 7.4 Xero API Integration (Direct)
- **OAuth 2.0 Authentication:** Secure connection to Xero accounting system
- **Customer Sync:** Auto-create/update customers in Xero from bookings
- **Invoice Generation:** Automated invoice creation for confirmed bookings
- **Agent Commission Invoices:** Automated agent commission invoice generation
- **Payment Tracking:** Real-time payment status synchronization
- **Chart of Accounts:** Map booking services to appropriate Xero accounts
- **Tax Configuration:** Handle GST/tax calculations according to Australian requirements
- **Reconciliation:** Automated payment matching and bank reconciliation support

## 8. Success Metrics

### 8.1 Form Completion
- **Completion Rate:** Target >85% form completion
- **Abandonment Points:** Track where users drop off
- **Validation Errors:** Minimize validation error rates
- **Time to Complete:** Optimize for <5 minutes average

### 8.2 Data Quality
- **Required Field Completion:** 100% for critical fields
- **Format Accuracy:** Proper email/phone formatting
- **Duplicate Prevention:** Identify repeat customers
- **Data Consistency:** Standardized location/service data

## 9. Risk Assessment

### 9.1 Technical Risks
- **Form Complexity:** Risk of overwhelming users
- **Performance:** Large form may impact load times
- **Browser Compatibility:** Ensure cross-browser functionality
- **Data Validation:** Complex business rules implementation

### 9.2 User Experience Risks
- **Form Length:** May reduce completion rates
- **Confusion:** Too many options may confuse users
- **Mobile Usability:** Complex form on small screens
- **Load Time:** Enhanced features may slow initial load

## 10. Implementation Phases

### Phase 1: Enhanced Frontend (Week 1-2)
- Implement customer information section
- Add trip type and return date/time
- Enhanced location dropdowns
- Basic validation enhancement
- Mobile responsive improvements

### Phase 2: Backend Development & Xero Integration (Week 3-4)
- Set up cloud database structure
- Develop REST API endpoints
- Implement user authentication system
- Create booking submission and retrieval logic
- Set up email notification system
- **Xero API Integration Setup:**
  - Register Xero developer app and obtain API credentials
  - Implement OAuth 2.0 authentication flow
  - Create Xero API wrapper functions
  - Set up customer and invoice creation endpoints

### Phase 3: Integration & Advanced Features (Week 5-6)
- Connect frontend to backend APIs
- Agent assignment functionality
- Real-time pricing calculations
- Booking management dashboard
- Progressive disclosure implementation
- **Xero Integration Testing:**
  - Test customer creation in Xero
  - Test invoice generation workflows
  - Implement agent commission calculations
  - Set up payment status synchronization

### Phase 4: Multi-User Portal & Testing (Week 7-8)
- Agent login portal development
- Staff administrative dashboard
- User acceptance testing across all user types
- Security testing and optimization
- Performance optimization and final bug fixes

### Phase 5: Deployment & Go-Live (Week 9-10)
- Cloud hosting setup and deployment
- DNS configuration and SSL certificates
- Production database migration
- User training and documentation
- Monitoring and support setup

## 11. Acceptance Criteria

### 11.1 Functional Requirements
- ✅ All Knack system fields represented
- ✅ Proper validation and error handling
- ✅ Responsive design maintained
- ✅ Form completion under 5 minutes
- ✅ PNR generation system
- ✅ Confirmation display with booking details
- ✅ Multi-user access (customers, agents, staff)
- ✅ Real-time booking management
- ✅ Automated email confirmations

### 11.2 Technical Requirements
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- ✅ Mobile device compatibility (iOS/Android)
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Cloud hosting with 99.9% uptime
- ✅ HTTPS security and data encryption
- ✅ Database backup and recovery systems
- ✅ API performance under 2 seconds response time

---

## Conclusion

This PRD provides a comprehensive roadmap for enhancing the Kangaroo Island Transfers booking system to match the functionality of the existing Knack system while maintaining the current clean, modern design aesthetic. The phased approach ensures manageable implementation while minimizing risk to the current working system.

The enhanced form will provide a professional, comprehensive booking experience that captures all necessary information for effective transfer service management while remaining user-friendly and accessible.