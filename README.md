# InsureHub — Insurance Management Portal Frontend

A premium, responsive Angular portal built with Angular 16, Angular Material, Bootstrap 5, and Reactive Forms. It handles unified multi-step authentication (with email OTP checks), profile management, and complete policy lifecycle tools (dashboard stats, customers listing, policy purchases, and card-payment renewals).

---

## 🔑 Demo & Test Credentials

The portal is configured with a global **Mock Mode** toggle (`USE_MOCK = true`) at the top of each service. When active, you can test all features using any format of email and passwords, or use these preconfigured demo credentials:

### 1. Agent Account
* **Email**: `agent@demo.com`
* **Password**: `demo123`
* **Role Selection**: Toggle **Agent**

### 2. Customer Account
* **Email**: `customer@demo.com`
* **Password**: `demo123`
* **Role Selection**: Toggle **Customer**

### 3. Registration (Signup) Testing
1. Choose **Agent** or **Customer**.
2. Enter name, email, phone, password, and numeric **Agent ID** (e.g., `1001` if registering as a customer).
3. Click **Sign Up** -> The app triggers a mock OTP transmission.
4. Input any 6-digit OTP code (e.g. `123456`) and click **Verify & Register**.
5. Once verified, the registration completes and you are redirected to the Login page.

---

## 🛠 Features Implemented

* **Unified Multi-Step Authentication**:
  * **Details-First Signup**: Gathers full name, email, phone, password, and agent ID up front, verifies via email OTP, then creates the profile.
  * **Credentials-First Login**: Performs email & password input, secures verification via OTP check, then authenticates and redirects.
* **JWT Interceptor**: Injects a bearer token (`Authorization: Bearer <token>`) automatically in the headers of all protected requests.
* **Global Error Interceptor**: Intercepts `401 Unauthorized` (clears storage and redirects to login), `403 Forbidden`, `404 Not Found`, and `500 Server Error` responses, displaying descriptions via `MatSnackBar`.
* **Agent Dashboard**: Displays Active Policies, Total Customers, and Total Profit cards along with a customer details table.
* **Customer Dashboard**: Displays total policies stats, assigned agent details (Name, Contact, Email), and policy listings.
* **Interactive Policy Purchase Dialog**: A highly responsive form featuring:
  * **2x2 Card Selection Grid**: Clickable plan cards (Life, Health, Home, Vehicle) with custom icon animations and color-coded status loops.
  * **Nominee Details**: Input to assign policy beneficiaries/nominees.
  * **Inline Input Icons**: Rupee signs, hourglass, and calendar tags formatting the fields.
* **Renewal Payment Dialog**: Queries a renew preview, displays penalty charges as read-only, and collects CVV and card details to complete payment (complete with automated card digit spacing formatting).

---

## 💡 Technical Challenges & Resolutions

### 1. Template Control Flow Downgrade (Angular 18 to 16)
* **Challenge**: Angular v16 does not support the new `@if`, `@for`, and `@switch` template syntax.
* **Resolution**: Migrated all template HTML structures back to traditional directives (`*ngIf`, `*ngFor`, and `[ngSwitch]/ngSwitchCase`), and imported `CommonModule` inside all standalone components to resolve template parsing.

### 2. Signal Inputs & Outputs Refactoring
* **Challenge**: Signal-based inputs (`input.required()`) and outputs (`output()`) were introduced in Angular 17.2+. They throw type errors when compiled on Angular v16.
* **Resolution**: Re-implemented components using standard `@Input()` and `@Output()` decorators. To prevent refactoring of the reactive computed signals chain, input setters were configured to bridge updates directly to private signals (e.g., `private _policies = signal<any[]>([])`).

### 3. Frosted-Glass CDK Modal Overlay Layout Bug
* **Challenge**: Without the prebuilt Angular Material theme imports, dialog elements rendered as simple block elements at the bottom of the page container, completely breaking the layout.
* **Resolution**: Integrated `@import '@angular/material/prebuilt-themes/indigo-pink.css'` in `styles.css` and added glassmorphism blur backdrop stylings to center all dialog overlays correctly.

### 4. Interactive Policy Selection Grid (Premium UX Component)
* **Challenge**: The traditional HTML `<select>` dropdown was generic and did not present a high-end, responsive branding feel for an insurance dashboard.
* **Resolution**: Replaced the select dropdown with a responsive 2x2 clickable grid of cards using custom SVG/Bootstrap icons, dynamically highlighting active plans (Life, Health, Home, Vehicle) with brand HSL gradients.

### 5. Credit Card Space Formatting and Regex Validation
* **Challenge**: Users typing card numbers with spaces would cause the regular validation format (`/^\d{16}$/`) to fail, rendering forms invalid with no explanation.
* **Resolution**: Reconfigured card numbers to validate via `/^[0-9\s]{16,19}$/`, intercepting typing events via a custom spacing decorator to format digits dynamically on input, while automatically stripping spaces in the API service layer payload.

### 6. Stateful Mock Layer for Frontend Simulation
* **Challenge**: Mock mode originally used static, hardcoded streams, so purchasing or renewing a policy did not reflect on the UI lists, giving the illusion of a broken application.
* **Resolution**: Transitioned `PolicyService` to maintain a mutable, class-scoped list of policies, updating and refreshing lists dynamically upon purchase or renewal.

---

## 🚀 Spring Boot Backend Integration (.env Setup)

The frontend configuration is managed using a modern `.env` file structure. The project includes a Node script (`set-env.js`) that reads values from `.env` and generates the corresponding Angular `src/environments/environment.ts` file automatically on start and build cycles.

### How to Toggle Mock Mode / API URL:

1. Locate the `.env` file at the root of the project (if it does not exist, copy `.env.example` to `.env`).
2. Set configuration values:
   * **For Mock Workflows**:
     ```env
     USE_MOCK=true
     API_URL=http://localhost:8080/api
     ```
   * **For Spring Boot Backend**:
     ```env
     USE_MOCK=false
     API_URL=http://localhost:8080/api
     ```
3. Verify your Spring Boot server is running on the configured `API_URL` domain.
4. Run the app:
   ```bash
   npm start
   ```
   *(This automatically triggers `node set-env.js` to compile the variables before serving the server)*.


---

## 📋 API Data Contracts (`USE_MOCK = false`)

To review the exact JSON payloads, request parameters, and response structures expected from the Spring Boot backend server by the Angular services layer, please refer to the dedicated **[API.md](file:///c:/Users/gandh/Downloads/angular-app/API.md)** document.



