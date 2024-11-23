document.addEventListener("DOMContentLoaded", function () {
    const BASE_URL = 'https://trifit-2.onrender.com/api/users';

    // Function to handle API requests
    async function apiRequest(endpoint, method, data) {
        const url = `${BASE_URL}${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Handle registration
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const username = document.getElementById("username").value;
            const pin = document.getElementById("pin").value;
            const initialDeposit = document.getElementById("initialDeposit").value;

            const loader = document.getElementById("loader");
            const registerMessage = document.getElementById("registerMessage");

            loader.style.display = "block";
            registerMessage.innerHTML = "";

            try {
                const response = await apiRequest('/register', 'POST', { username, pin, initialDeposit });
                loader.style.display = "none";
                registerMessage.innerHTML = `<div class="alert alert-success">${response.message}</div>`;

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (error) {
                loader.style.display = "none";
                registerMessage.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
            }
        });
    }

    // Handle login
    const loginForm = document.getElementById("loginForm");
    let attemptsLeft = 3;

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const username = document.getElementById("loginUsername").value;
            const pin = document.getElementById("loginPin").value;

            const loader = document.getElementById("loader");
            const loginMessage = document.getElementById("loginMessage");

            if (attemptsLeft <= 0) {
                loginMessage.innerHTML = '<div class="alert alert-danger">Your account is locked. Please try again later.</div>';
                return;
            }

            loader.style.display = "block";
            loginMessage.innerHTML = "";

            try {
                const response = await apiRequest('/login', 'POST', { username, pin });
                loader.style.display = "none";

                localStorage.setItem('token', response.token);
                localStorage.setItem('username', username);

                loginMessage.innerHTML = '<div class="alert alert-success">Login successful!</div>';
                window.location.href = 'dashboard.html';
            } catch (error) {
                loader.style.display = "none";
                attemptsLeft--;

                if (attemptsLeft <= 0) {
                    loginMessage.innerHTML = '<div class="alert alert-danger">Your account is locked. Please try again later.</div>';
                } else {
                    loginMessage.innerHTML = `<div class="alert alert-danger">${error.message}. You have ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left.</div>`;
                }
            }
        });
    }

    // Handle logout
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            document.getElementById("dashboard").style.display = "none";
            document.getElementById("login").style.display = "block";
        });
    }
});
