/**
 * Payment API service for handling creator tips
 */

const paymentUrl = 'http://localhost:8000/api/wallets';

/**
 * Get the current user data from storage
 * @returns {Promise<Object|null>} User data object or null if not logged in
 */
function getUserData() {
	return new Promise((resolve) => {
		chrome.storage.local.get(['user'], (result) => {
			console.log(result);
			const userData = result.user;
			resolve(userData || null);
		});
	});
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if the user has a valid token
 */
async function isAuthenticated() {
	const userData = await getUserData();
	return !!(userData && userData.token);
}

/**
 * Process a payment to the creator
 * @param {Object} paymentData Payment details
 * @param {number} amount Amount to tip
 * @param {string} channelHandle Creator's channel handle
 * @param {string} videoId ID of the video being watched (optional)
 * @param {string} message Message to creator (optional)
 * @returns {Promise<Object>} Payment result
 */
async function processPayment({ to, amount, message }) {
	const isLoggedIn = await isAuthenticated();

	if (!isLoggedIn) {
		// User is not logged in, open extension popup
		await activateExtensionPopup();
		throw new Error('Authentication required');
	}

	// User is logged in, process payment
	const userData = await getUserData();

	try {
		console.log(
			'Processing payment:',
			`${paymentUrl}/stellar/transfer`,
			userData.token
		);
		const response = await fetch(`${paymentUrl}/stellar/transfer`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${userData.token}`,
			},
			body: JSON.stringify({
				amount: amount,
				to: to,
				message: message,
				platform: 'youtube',
			}),
		});

		console.log('Payment response:', response);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Payment failed');
		}

		return await response.json();
	} catch (error) {
		console.error('Payment processing error:', error);
	}
}

/**
 * Activate the extension popup for authentication
 */
function activateExtensionPopup() {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage(
			{
				action: 'openExtensionPopup',
				returnTo: window.location.href,
			},
			resolve
		);
	});
}

/**
 * Get account balance
 */
async function getAccountBalance() {
	const userData = await getUserData();
	if (!userData || !userData.token) {
		throw new Error('User is not authenticated');
	}

	const response = await fetch(`${paymentUrl}/balance`, {
		headers: {
			Authorization: `Bearer ${userData.token}`,
		},
	});

	if (!response.ok) {
		throw new Error('Failed to fetch account balance');
	}

	return await response.json();
}

// Export the PaymentService functions
window.SuperPayment = {
	isAuthenticated,
	getUserData,
	processPayment,
	getAccountBalance,
};
