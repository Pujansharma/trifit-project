
// Fetch token and username from localStorage
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

if (!token) {
    alert('You need to be logged in');
    window.location.href = 'login.html';  // Redirect to login if no token
}

// Display username on the dashboard
$('#usernameDisplay').text(username);

// Fetch the balance and update the UI
function fetchBalance() {
    $.ajax({
        url: 'https://trifit-2.onrender.com/api/users/balance',
        type: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (response) {
            $('#balance').text(response.balance);
            $('#accNumber').text(response.accountNumber);
        },
        error: function (err) {
            alert('Error fetching balance');
            console.error(err);
        }
    });
}

fetchBalance(); // Call function to load the balance initially

// Deposit money
$('#depositForm').submit(function (e) {
    e.preventDefault();
    const amount = parseFloat($('#depositAmount').val());
    const pin = $('#depositPin').val();

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    $.ajax({
        url: 'https://trifit-2.onrender.com/api/users/deposit',
        type: 'POST',
        data: JSON.stringify({ username, pin, amount }),
        contentType: 'application/json',
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (response) {
            alert(response.message);
            fetchBalance(); // Refresh the balance after deposit
            $('#depositModal').modal('hide');
        },
        error: function (err) {
            alert(err.responseJSON.error || 'Error depositing money');
            console.error(err);
        }
    });
});

// Withdraw money
$('#withdrawForm').submit(function (e) {
    e.preventDefault();
    const amount = parseFloat($('#withdrawAmount').val());
    const pin = $('#withdrawPin').val();

    if (amount <= 0) {
        alert('Please enter a valid amount to withdraw.');
        return;
    }

    $.ajax({
        url: 'https://trifit-2.onrender.com/api/users/withdraw',
        type: 'POST',
        data: JSON.stringify({ username, pin, amount }),
        contentType: 'application/json',
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (response) {
            alert(response.message);
            fetchBalance(); // Refresh the balance after withdrawal
            $('#withdrawModal').modal('hide');
        },
        error: function (err) {
            alert(err.responseJSON.error || 'Error withdrawing money');
            console.error(err);
        }
    });
});

// Handle form submission for the money transfer
document.getElementById('transferForm').addEventListener('submit', function(event) {
event.preventDefault();  // Prevent the form from submitting the traditional way

// Get input values
const senderUsername = document.getElementById('senderUsername').value;
const senderAccountNumber = document.getElementById('senderAccountNumber').value;
const recipientUsername = document.getElementById('recipientUsername').value;
const recipientAccountNumber = document.getElementById('recipientAccountNumber').value;
const pin = document.getElementById('pin').value;
const amount = parseFloat(document.getElementById('amount').value);

// Validate inputs
if (!senderUsername || !senderAccountNumber || !recipientUsername || !recipientAccountNumber || !pin || !amount) {
alert('Please fill in all the fields.');
return;
}

// Show loading message
document.getElementById('transferError').style.display = 'none';
document.getElementById('transferSuccess').style.display = 'none';

// Send POST request with transfer data
fetch('https://trifit-2.onrender.com/api/users/transfer', {
method: 'POST',
headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('authToken')  // Add JWT Token if needed
},
body: JSON.stringify({
    senderUsername: senderUsername,
    senderAccountNumber: senderAccountNumber,
    recipientUsername: recipientUsername,
    recipientAccountNumber: recipientAccountNumber,
    pin: pin,
    amount: amount
})
})
.then(response => response.json())
.then(data => {
if (data.error) {
    // Show error message
    document.getElementById('transferError').textContent = data.error;
    document.getElementById('transferError').style.display = 'block';
} else {
    // Show success message
    document.getElementById('transferSuccess').textContent = `Transfer Successful! New Balances - Sender: $${data.senderBalance}, Recipient: $${data.recipientBalance}`;
    document.getElementById('transferSuccess').style.display = 'block';
}
})
.catch(error => {
console.error('Error during transfer:', error);
document.getElementById('transferError').textContent = 'An error occurred. Please try again later.';
document.getElementById('transferError').style.display = 'block';
});
});




// Function to open the mini statement modal and fetch transactions
function openMiniStatementModal() {
const token = localStorage.getItem('token'); // Assuming the token is stored in local storage

if (!token) {
alert("You need to login first!");
return;
}

// Fetch the transactions from the backend
fetch('https://trifit-2.onrender.com/api/users/transactions', {
method: 'GET',
headers: {
    'Authorization': `Bearer ${token}`,  // Send the token in the Authorization header
},
})
.then(response => response.json())
.then(data => {
if (data.transactions) {
    // Populate the modal with transaction data
    const miniStatementBody = document.getElementById('miniStatementBody');
    miniStatementBody.innerHTML = ''; // Clear existing table content

    // Loop through transactions and add them to the table
    data.transactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        // Create the table cells for each transaction
        const dateCell = document.createElement('td');
        const date = new Date(transaction.timestamp);

// Format the date as dd-mm-yyyy
const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

dateCell.textContent = formattedDate;
row.appendChild(dateCell);

        const typeCell = document.createElement('td');
        typeCell.textContent = transaction.type;
        row.appendChild(typeCell);

        const amountCell = document.createElement('td');
        amountCell.textContent = `₹${transaction.amount.toFixed(2)}`;
        row.appendChild(amountCell);

        const balanceCell = document.createElement('td');
        balanceCell.textContent = `₹${transaction.balanceAfter.toFixed(2)}`;
        row.appendChild(balanceCell);

        // Append the row to the table body
        miniStatementBody.appendChild(row);
    });
} else {
    alert('Failed to load transactions');
}
})
.catch(error => {
console.error('Error fetching transactions:', error);
alert('There was an error fetching the transactions.');
});
}

// Bind the function to the button or event that opens the modal
document.getElementById('viewMiniStatementBtn').addEventListener('click', openMiniStatementModal);

// Logout button functionality
$('#logoutButton').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';  // Redirect to login on logout
});
