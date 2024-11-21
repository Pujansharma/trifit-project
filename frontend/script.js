
    $(document).ready(function() {
    // Register
    $("#registerForm").submit(function(event) {
        event.preventDefault();
        const username = $("#username").val();
        const pin = $("#pin").val();
        const initialDeposit = $("#initialDeposit").val();

        $.ajax({
            url: 'https://trifit-2.onrender.com/api/users/register',
            method: 'POST',
            data: JSON.stringify({ username, pin, initialDeposit }),
            contentType: 'application/json',
            success: function(response) {
                $("#registerMessage").html(`<div class="alert alert-success">${response.message}</div>`);
                window.location.href = 'login.html';
            },
            error: function(xhr) {
                $("#registerMessage").html(`<div class="alert alert-danger">${xhr.responseJSON.error}</div>`);
            }
        });
    });

    $("#loginForm").submit(function(event) {
        event.preventDefault();
        const username = $("#loginUsername").val();
        const pin = $("#loginPin").val();

        $.ajax({
            url: 'https://trifit-2.onrender.com/api/users/login',
            method: 'POST',
            data: JSON.stringify({ username, pin }),
            contentType: 'application/json',
            success: function(response) {
                // Store the JWT token and username in localStorage
                localStorage.setItem('token', response.token);
                localStorage.setItem('username', username);

                // Show success message
                $("#loginMessage").html('<div class="alert alert-success">Login successful!</div>');

                // Redirect to the dashboard page
                window.location.href = 'dashboard.html'; // Redirect to the dashboard page
            },
            error: function(xhr) {
                // Handle errors
                $("#loginMessage").html(`<div class="alert alert-danger">${xhr.responseJSON.error}</div>`);
            }
        });
    });

    // dashboard.js

    // Logout
    $("#logoutButton").click(function() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        $("#dashboard").hide();
        $("#login").show();
    });
});

