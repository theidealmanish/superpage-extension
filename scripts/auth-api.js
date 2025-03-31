/**
 * Authentication module for SuperPay extension
 */

/**
 * Login with email and password
 * @param {string} identifier User's email or username
 * @param {string} password User's password
 * @returns {Promise} Promise resolving to user data
 */
async function login({ identifier, password }) {
	try {
		const response = await fetch(`${apiUrl}/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ identifier, password }),
			credentials: 'include', // For cookies if you're using them
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Login failed');
		}

		const userData = await response.json();

		// Save user data to extension storage
		await saveUserData({
			token: userData.token,
			isLoggedIn: true,
			loginTime: new Date().toISOString(),
		});

		return userData;
	} catch (error) {
		console.error('Login error:', error);
		throw error;
	}
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if user is authenticated
 */
async function isAuthenticated() {
	try {
		const userData = await getUserData();
		console.log(userData);
		if (!userData || !userData.isLoggedIn) {
			return false;
		}
		return true;
	} catch (error) {
		console.error('Auth check error:', error);
		return false;
	}
}

/**
 * Save user data to Chrome storage
 * @param {Object} userData User data object
 * @returns {Promise} Promise resolving when data is saved
 */
function saveUserData(userData) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.set({ user: userData }, () => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve();
			}
		});
	});
}

/**
 * Get user data from Chrome storage
 * @returns {Promise<Object>} Promise resolving to user data
 */
function getUserData() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('user', (result) => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve(result.user || null);
			}
		});
	});
}

// Export the authentication functions
window.SuperPayAuth = {
	login,
	isAuthenticated,
	getUserData,
};
