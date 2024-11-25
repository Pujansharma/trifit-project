# 💳 Trifit Banking System

A robust online banking system built using HTML, CSS, and JavaScript, with functionality for deposits, withdrawals, money transfers, and mini-statements. The application uses JWT for secure authentication.

---

## 🌟 Features

- User Login System with JWT Authentication
- Display User Dashboard with Current Balance
- Deposit, Withdraw, and Transfer Money
- View Mini-Statements with Transaction History
- Responsive Design with Clean UI
- Secure Logout Functionality

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally:

### Prerequisites

Make sure you have the following installed:
- A modern web browser (e.g., Chrome, Firefox)
- A backend service for API endpoints (this project assumes)

---

### 🔧 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/trifit-banking-system.git
Navigate to the project folder:

bash
Copy code
cd trifit-banking-system
Open the project in your favorite code editor or IDE.

Launch the app: Open index.html in your browser or use a live server plugin.

📖 Usage
Login
Open login.html.
Enter your credentials to log in.
Dashboard
Once logged in, the dashboard will:

Display your username and current balance.
Provide options to deposit, withdraw, transfer money, and view transactions.
Deposit Money
Click on the Deposit button.
Enter the amount and your PIN, then submit.
Withdraw Money
Click on the Withdraw button.
Enter the amount and your PIN, then submit.
Transfer Money
Fill in the transfer form with:
Sender and recipient usernames
Account numbers
Amount
PIN
Submit the form to initiate the transfer.
Mini-Statement
Click the View Mini Statement button to see your recent transactions.

Logout
Click the Logout button to securely log out.

🛠️ API Endpoints
The app interacts with the following endpoints:

Method	Endpoint	Description
POST	/api/users/login	User authentication
GET	/api/users/balance	Fetch user balance
POST	/api/users/deposit	Deposit money
POST	/api/users/withdraw	Withdraw money
POST	/api/users/transfer	Transfer money
GET	/api/users/transactions	Fetch transaction history
