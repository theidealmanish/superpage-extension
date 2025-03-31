document.addEventListener('DOMContentLoaded', () => {
	// check if user is already logged in
	isAuthenticated()
		.then((isLoggedIn) => {
			if (isLoggedIn) {
				// Redirect to dashboard if already logged in
				window.location.href = 'home.html';
			}
		})
		.catch((error) => {
			console.error('Authentication check failed:', error);
		});

	// DOM elements
	const loginForm = document.getElementById('loginForm');

	// Form elements
	const identifier = document.getElementById('identifier');
	const password = document.getElementById('password');

	// Error elements
	const passwordError = document.getElementById('passwordError');
	const loginError = document.getElementById('loginError');

	// Handle signup link click - open localhost:3000
	signupLink.addEventListener('click', (e) => {
		e.preventDefault();

		chrome.tabs.create({
			url: `${publicUrl}/register`,
		});
	});

	// Handle login form submission
	loginForm.addEventListener('submit', async (e) => {
		e.preventDefault();

		let isValid = true;

		// Reset error messages
		passwordError.style.display = 'none';
		loginError.style.display = 'none';

		// Validate password
		if (password.value.length < 8) {
			passwordError.style.display = 'block';
			isValid = false;
		}

		if (isValid) {
			try {
				// Show loading state
				const loginBtn = document.getElementById('loginBtn');
				const originalText = loginBtn.textContent;
				loginBtn.textContent = 'Logging in...';
				loginBtn.disabled = true;

				// Call the login function from auth-api.js
				const userData = await login({
					identifier: identifier.value,
					password: password.value,
				});

				console.log('User data:', userData);

				// Redirect to dashboard on successful login
				window.location.href = 'home.html';
			} catch (error) {
				loginError.textContent =
					error.message || 'Login failed. Please try again.';
				loginError.style.display = 'block';

				// Reset button
				const loginBtn = document.getElementById('loginBtn');
				loginBtn.textContent = 'Log In';
				loginBtn.disabled = false;
			}
		}
	});
});
