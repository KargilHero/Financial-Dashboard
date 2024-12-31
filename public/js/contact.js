document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const queryInput = document.getElementById("query"); // Optional field
    const messageInput = document.getElementById("message");
    const formMessage = document.getElementById("formMessage");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form from submitting immediately
        let isValid = true;

        // Reset error messages
        document.querySelectorAll(".error").forEach(error => error.textContent = "");
        formMessage.textContent = ""; // Reset form message

        // Validation for name
        if (nameInput.value.trim() === "") {
            document.getElementById("name-error").textContent = "Name is required.";
            isValid = false;
        }

        // Validation for email
        if (!validateEmail(emailInput.value.trim())) {
            document.getElementById("email-error").textContent = "Please enter a valid email.";
            isValid = false;
        }

        // Validation for message
        if (messageInput.value.trim() === "") {
            document.getElementById("message-error").textContent = "Message is required.";
            isValid = false;
        }

        // If valid, submit the form data
        if (isValid) {
            // Simulate form submission
            fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    formMessage.textContent = "Your message has been sent successfully!";
                    formMessage.classList.add("success-message");
                    form.reset();
                } else {
                    return response.json().then(data => {
                        throw new Error(data.error || "There was an issue submitting the form.");
                    });
                }
            })
            .catch(error => {
                formMessage.textContent = "Failed to send message. Please try again.";
                formMessage.classList.add("error-message");
            });
        }
    });

    // Email validation function
    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }
});
