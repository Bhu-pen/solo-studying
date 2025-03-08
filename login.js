document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("login-error-message");
    const passwordToggle = document.getElementById("password-toggle");
    const passwordInput = document.getElementById("login-password");

    // Password visibility toggle
    passwordToggle.addEventListener("click", function() {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        
        // Toggle eye icon
        const icon = passwordToggle.querySelector("i");
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
    });

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        errorMessage.style.display = "none";

        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        // Get stored user data
        const userData = JSON.parse(localStorage.getItem("userData"));
        
        if (!userData) {
            errorMessage.textContent = "No registered users found. Please register first.";
            errorMessage.style.display = "block";
            return;
        }

        // Check if username and password match
        if (userData.username === username && userData.password === password) {
            // Login successful
            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("currentUser", JSON.stringify(userData));
            window.location.href = "index.html";
        } else {
            // Login failed
            errorMessage.textContent = "Invalid username or password. Please try again.";
            errorMessage.style.display = "block";
            loginForm.reset();
        }
    });
});
