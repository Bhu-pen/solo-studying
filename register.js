document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("register-form");
    const errorMessage = document.getElementById("error-message");
    const avatarOptions = document.querySelectorAll(".avatar-option");
    const selectedAvatarInput = document.getElementById("selected-avatar");

    // Handle avatar selection
    avatarOptions.forEach(option => {
        option.addEventListener("click", function() {
            // Remove selected class from all options
            avatarOptions.forEach(opt => opt.classList.remove("selected"));
            // Add selected class to clicked option
            this.classList.add("selected");
            // Set the selected avatar value
            selectedAvatarInput.value = this.dataset.avatar;
        });
    });

    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        errorMessage.style.display = "none";

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const educationLevel = document.getElementById("education-level").value;
        const selectedAvatar = selectedAvatarInput.value || 'default.png';

        if (password !== document.getElementById("confirm-password").value) {
            errorMessage.textContent = "Passwords do not match!";
            errorMessage.style.display = "block";
            return;
        }

        // Check if avatar is selected
        if (!selectedAvatar) {
            errorMessage.textContent = "Please select an avatar!";
            errorMessage.style.display = "block";
            return;
        }

        // Get selected subjects
        const subjects = getSubjectsForClass(parseInt(educationLevel));

        if (subjects.length === 0) {
            errorMessage.textContent = "Please select at least one subject!";
            errorMessage.style.display = "block";
            return;
        }

        const formData = new FormData(registerForm);
        
        // Add user data to localStorage
        const userData = {
            username,
            email,
            password,
            educationLevel: parseInt(educationLevel),
            avatar: selectedAvatar,
            level: 1,
            experience: 0,
            subjects,
            studyGoals: formData.get("study-goals"),
            achievements: [],
            tasks: [],
            rank: "Novice"
        };

        try {
            // Store user data
            localStorage.setItem("userData", JSON.stringify(userData));
            
            // Also store in users array for multiple user support
            const users = JSON.parse(localStorage.getItem("users")) || [];
            users.push({
                username,
                password,
                avatar: selectedAvatar,
                level: 1,
                experience: 0,
                rank: "Novice"
            });
            localStorage.setItem("users", JSON.stringify(users));
            
            // Redirect to login page after successful registration
            window.location.href = "log.html";
        } catch (error) {
            errorMessage.textContent = "Error creating account. Please try again.";
            errorMessage.style.display = "block";
            console.error("Error:", error);
        }
    });
});

function getSubjectsForClass(classLevel) {
    const subjects = {
        5: ['Mathematics', 'Science', 'English', 'Nepali', 'Social Studies'],
        6: ['Mathematics', 'Science', 'English', 'Nepali', 'Social Studies'],
        7: ['Mathematics', 'Science', 'English', 'Nepali', 'Social Studies'],
        8: ['Mathematics', 'Science', 'English', 'Nepali', 'Social Studies'],
        9: ['Mathematics', 'Science', 'English', 'Nepali', 'Social Studies', 'Computer Science'],
        10: ['Mathematics', 'Science', 'English', 'Nepali', 'Social Studies', 'Computer Science'],
        11: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'English'],
        12: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'English']
    };
    
    return subjects[classLevel] || [];
}
