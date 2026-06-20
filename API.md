# InsureHub — Spring Boot Backend REST API Specifications

This document outlines the detailed REST data contracts exposed by the Spring Boot server. All endpoints are queried by the Angular frontend services layer when Mock Mode is disabled (`USE_MOCK=false`).

---

## 💡 Architecture & Integration Overview

To clarify the interaction between the Angular frontend and the Spring Boot backend when **`USE_MOCK=false`**, the following architecture decisions and protocols have been established:

### 1. Token Claims & Role/Email Extraction
* The JWT token returned upon a successful login (`POST /api/auth/login`) contains **only the `role` and `email` (`sub`)** claims.
* The token **does not** contain the unique database identifiers (`customerId` or `agentId`).

### 2. Resolving `customerId` and `agentId`
* **On Login / Initialization**: Once authenticated, the Angular client immediately resolves the user's full profile details by invoking the appropriate profile endpoint:
  * **Customer**: `GET /api/customer/profile`
  * **Agent**: `GET /api/agent/profile`
* **Database IDs**: The response payloads of these profile calls include the database identifiers (`customerId` and `agentId` respectively).
* **Profile Storage**: The frontend stores these details reactively using Angular Signals (`_profileDetails`) for visual display and form population.

### 3. Policy Ownership & Filtering
* **Retrieving Policies**: When a customer requests their policies via `GET /api/customer/policies`, the backend extracts the user's identity (email) directly from the JWT.
* **No Client-Side Filtering Needed**: The frontend does not need to send a `customerId` query parameter or manually filter the array returned by `GET /api/customer/policies`. The backend automatically returns only the policies belonging to the authenticated customer.

### 4. Dashboard Statistics Resolution
* **Agent Dashboard**: A dedicated backend endpoint (`GET /api/agent/dashboard`) exists to supply total profit, active policy count, and total customers list.
* **Customer Dashboard**: To optimize server-side operations, **no dedicated customer dashboard statistics endpoint is required**. The frontend dynamically aggregates and computes the counts of `ACTIVE`, `DUE`, and `LAPSED` policies directly from the list fetched via `GET /api/customer/policies` using reactive computed properties.

---

## 🔐 Authentication Module

### 1. Send OTP
* **Endpoint**: `POST /api/auth/send-otp`
* **Request Body**:
  ```json
  {
    "email": "user@gmail.com"
  }
  ```
* **Response (Plain text, 200 OK)**:
  `"OTP sent successfully"`

### 2. Verify OTP
* **Endpoint**: `POST /api/auth/verify-otp`
* **Request Body**:
  ```json
  {
    "email": "user@gmail.com",
    "otp": "123456"
  }
  ```
* **Response (Plain text, 200 OK)**:
  `"OTP verified successfully"`

### 3. Register Agent
* **Endpoint**: `POST /api/auth/register-agent`
* **Request Body**:
  ```json
  {
    "name": "Aarav Agent",
    "email": "agent@demo.com",
    "contact": "9876543210",
    "password": "password123",
    "role": "AGENT"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "agentId": 1001,
    "message": "Agent registered successfully"
  }
  ```

### 4. Register Customer
* **Endpoint**: `POST /api/auth/register-customer`
* **Request Body**:
  ```json
  {
    "name": "Rahul Customer",
    "email": "customer@demo.com",
    "contact": "9876543211",
    "password": "password123",
    "role": "CUSTOMER",
    "agentId": 1001
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "customerId": 2001,
    "message": "Customer registered successfully"
  }
  ```

### 5. Authenticate / Login
* **Endpoint**: `POST /api/auth/login`
* **Request Body**:
  ```json
  {
    "email": "customer@demo.com",
    "password": "password123",
    "role": "CUSTOMER"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "token": "jwt_token_string",
    "role": "CUSTOMER",
    "message": "Login successful"
  }
  ```

---

## 👤 Profile Module (Requires JWT Authorization Bearer Header)

### 1. Get Profile (Customer)
* **Endpoint**: `GET /api/customer/profile`
* **Response (200 OK)**:
  ```json
  {
    "customerId": 2001,
    "name": "Rahul Customer",
    "email": "customer@demo.com",
    "contact": "9876543211",
    "agentId": 1001
  }
  ```

### 2. Get Profile (Agent)
* **Endpoint**: `GET /api/agent/profile`
* **Response (200 OK)**:
  ```json
  {
    "agentId": 1001,
    "name": "Aarav Agent",
    "email": "agent@demo.com",
    "contact": "9876543210"
  }
  ```

### 3. Update Profile (Both)
* **Endpoint**: `PUT /api/customer/profile` or `PUT /api/agent/profile`
* **Request Body**:
  ```json
  {
    "name": "Rahul Updated",
    "email": "customer@demo.com",
    "contact": "9876543222"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Profile updated successfully"
  }
  ```

---

## 🛡️ Policy & Dashboard Module (Requires JWT Authorization Bearer Header)

### 1. Get Agent Dashboard Stats
* **Endpoint**: `GET /api/agent/dashboard`
* **Response (200 OK)**:
  ```json
  {
    "activePolicies": 15,
    "totalCustomers": 25,
    "totalProfit": 12500.50
  }
  ```

### 2. Get Agent Customers List
* **Endpoint**: `GET /api/agent/customers`
* **Response (200 OK)**:
  ```json
  [
    {
      "customerId": 2001,
      "name": "Rahul Customer",
      "email": "customer@demo.com",
      "contact": "9876543211"
    }
  ]
  ```

### 3. Get Agent Policies List
* **Endpoint**: `GET /api/agent/policies`
* **Response (200 OK)**:
  ```json
  [
    {
      "policyId": "POL-123",
      "policyType": "LIFEINSURANCE",
      "policyStartDate": "2026-01-01",
      "policyEndDate": "2031-01-01",
      "premiumAmount": 5000,
      "policyStatus": "ACTIVE",
      "customerId": 2001
    }
  ]
  ```

### 4. Get Customer Policies List
* **Endpoint**: `GET /api/customer/policies`
* **Response (200 OK)**:
  ```json
  [
    {
      "policyId": "POL-123",
      "policyType": "LIFEINSURANCE",
      "premiumAmount": 5000,
      "policyStatus": "ACTIVE",
      "customerId": 2001
    }
  ]
  ```

### 5. Purchase Policy
* **Endpoint**: `POST /api/customer/purchase-policy`
* **Request Body**:
  ```json
  {
    "customerId": 2001,
    "policyType": "LIFEINSURANCE",
    "premiumAmount": 5000,
    "policyStartDate": "2026-06-20",
    "termInYears": 10,
    "nominee": "Jane Doe"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "policyId": "POL-432"
  }
  ```

### 6. Get Renewal Preview
* **Endpoint**: `GET /api/policies/renew/preview?policyId={policyId}`
* **Response (200 OK)**:
  ```json
  {
    "policyId": "POL-123",
    "policyType": "LIFEINSURANCE",
    "originalPremiumAmount": 5000,
    "penaltyAmount": 250,
    "renewalPremiumAmount": 5250,
    "policyStatus": "LAPSED"
  }
  ```

### 7. Process Policy Renewal / Reactivation
* **Endpoint**: `POST /api/policies/renew`
* **Request Body**:
  ```json
  {
    "policyId": "POL-123",
    "cardHolderName": "Rahul Sharma",
    "cardNumber": "4111111111111111",
    "expiryMonth": "08",
    "expiryYear": "2028",
    "cvv": "123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "policyId": "POL-123",
    "policyType": "LIFEINSURANCE",
    "originalPremiumAmount": 5000,
    "penaltyAmount": 250,
    "renewalPremiumAmount": 5250,
    "lastPremiumPaymentDate": "2026-06-20",
    "policyStatus": "ACTIVE"
  }
  ```

### 8. Get Customer Assigned Agent Details
* **Endpoint**: `GET /api/customer/agent`
* **Response (200 OK)**:
  ```json
  {
    "agentId": 1001,
    "name": "Aarav Sharma",
    "email": "agent@demo.com",
    "contact": "9876543210"
  }
  ```

### 9. Get Agent Details by ID
* **Endpoint**: `GET /api/agent/{agentId}`
* **Response (200 OK)**:
  ```json
  {
    "agentId": 1001,
    "name": "Aarav Sharma",
    "email": "agent@demo.com",
    "contact": "9876543210"
  }
  ```
