// Define the base URL for the API
const BASE_URL = 'https://trifit-2.onrender.com/api/users';

function apiRequest(endpoint, method = 'GET', data = null, headers = {}) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
    };
    if (data) options.body = JSON.stringify(data);
    return fetch(`${BASE_URL}${endpoint}`, options).then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    });
}

const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

if (!token) {
    alert('You need to be logged in');
    window.location.href = 'login.html';
}
document.getElementById('usernameDisplay').textContent = username;

// Fetch Balance
function fetchBalance() {
    apiRequest('/balance', 'GET', null, { 'Authorization': `Bearer ${token}` })
        .then(response => {
            document.getElementById('balance').textContent = response.balance;
            document.getElementById('accNumber').textContent = response.accountNumber;
        })
        .catch(err => {
            console.error('Error fetching balance:', err);
            alert('Error fetching balance');
        });
}
fetchBalance();

// Deposit
document.getElementById('depositForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('depositAmount').value);
    const pin = document.getElementById('depositPin').value;

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    apiRequest('/deposit', 'POST', { username, pin, amount }, { 'Authorization': `Bearer ${token}` })
        .then(response => {
            alert(response.message);
            fetchBalance();
            $('#depositModal').modal('hide');
        })
        .catch(err => {
            console.error('Error depositing money:', err);
            alert(err.error || 'Error depositing money');
        });
});

// Withdraw
document.getElementById('withdrawForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const pin = document.getElementById('withdrawPin').value;

    if (amount <= 0) {
        alert('Please enter a valid amount to withdraw.');
        return;
    }

    apiRequest('/withdraw', 'POST', { username, pin, amount }, { 'Authorization': `Bearer ${token}` })
        .then(response => {
            alert(response.message);
            fetchBalance();
            $('#withdrawModal').modal('hide');
        })
        .catch(err => {
            console.error('Error withdrawing money:', err);
            alert(err.error || 'Error withdrawing money');
        });
});

// Transfer
document.getElementById('transferForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const recipientAccountNumber = document.getElementById('recipientAccountNumber').value;
    const pin = document.getElementById('pin').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (!recipientAccountNumber || !pin || !amount) {
        alert('Please fill in all the fields.');
        return;
    }

    apiRequest('/transfer', 'POST', { recipientAccountNumber, pin, amount }, { 'Authorization': `Bearer ${token}` })
        .then(response => {
            document.getElementById('transferSuccess').textContent = `Transfer Successful! New Balance: ₹${response.senderBalance}`;
            fetchBalance();
            document.getElementById('transferSuccess').style.display = 'block';
        })
        .catch(err => {
            console.error('Error during transfer:', err);
            document.getElementById('transferError').textContent = err.error || 'Error during transfer.';
            document.getElementById('transferError').style.display = 'block';
        });
});

// Mini Statement
function openMiniStatementModal() {
    apiRequest('/transactions', 'GET', null, { 'Authorization': `Bearer ${token}` })
        .then(response => {
            const miniStatementBody = document.getElementById('miniStatementBody');
            miniStatementBody.innerHTML = '';
            response.transactions.forEach(transaction => {
                const row = document.createElement('tr');
                const date = new Date(transaction.timestamp);
                const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${transaction.type}</td>
                    <td>₹${transaction.amount.toFixed(2)}</td>
                    <td>₹${transaction.balanceAfter.toFixed(2)}</td>
                `;
                miniStatementBody.appendChild(row);
            });
        })
        .catch(err => {
            console.error('Error fetching transactions:', err);
            alert('Error fetching transactions');
        });
}
document.getElementById('viewMiniStatementBtn').addEventListener('click', openMiniStatementModal);

// Logout
document.getElementById('logoutButton').addEventListener('click', function () {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
});
