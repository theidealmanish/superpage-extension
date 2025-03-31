const walletUrl = 'http://localhost:8000/api/wallets';

document.addEventListener('DOMContentLoaded', function () {
	// Tab switching
	const tabs = document.querySelectorAll('.tab');
	const homeContent = document.getElementById('home-content');
	const transactionsContent = document.getElementById('transactions-content');

	// Logout functionality
	document.getElementById('logout').addEventListener('click', () => {
		// Clear user data from storage
		chrome.storage.local.remove(['user'], () => {
			console.log('User data cleared from storage');

			// Show logout notification
			showNotification('Successfully logged out');

			// Redirect to login page after a short delay
			setTimeout(() => {
				window.location.href = 'auth.html';
			}, 1000);
		});
	});

	tabs.forEach((tab) => {
		tab.addEventListener('click', function () {
			// Remove active class from all tabs
			tabs.forEach((t) => t.classList.remove('active'));

			// Add active class to clicked tab
			this.classList.add('active');

			// Show appropriate content
			const tabName = this.getAttribute('data-tab');
			if (tabName === 'home') {
				homeContent.classList.remove('hidden');
				if (transactionsContent) {
					transactionsContent.classList.add('hidden');
				}
			} else if (tabName === 'transactions') {
				homeContent.classList.add('hidden');
				if (transactionsContent) {
					transactionsContent.classList.remove('hidden');
				}
			}
		});
	});

	// View all transactions link - check if element exists first
	const viewAllTransactionsBtn = document.getElementById(
		'view-all-transactions'
	);
	if (viewAllTransactionsBtn) {
		viewAllTransactionsBtn.addEventListener('click', function (e) {
			e.preventDefault();
			// Switch to transactions tab
			tabs.forEach((t) => t.classList.remove('active'));
			document
				.querySelector('.tab[data-tab="transactions"]')
				.classList.add('active');
			homeContent.classList.add('hidden');
			if (transactionsContent) {
				transactionsContent.classList.remove('hidden');
			}
		});
	}

	// Function to show notification
	function showNotification(message) {
		// Create notification element if it doesn't exist
		let notification = document.getElementById('notification');
		if (!notification) {
			notification = document.createElement('div');
			notification.id = 'notification';
			notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--primary-color);
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
      `;
			document.body.appendChild(notification);
		}

		// Set message and show notification
		notification.textContent = message;
		notification.style.opacity = '1';

		// Hide after 3 seconds
		setTimeout(() => {
			notification.style.opacity = '0';
			setTimeout(() => {
				notification.remove();
			}, 300);
		}, 3000);
	}

	// Load wallet balance
	function loadWalletBalance(userData) {
		console.log('Loading wallet balance with token:', userData.token);

		// Make API call to get wallet balance
		fetch(`${walletUrl}/stellar/get-account-balance`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${userData.token}`,
				'Content-Type': 'application/json',
			},
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((response) => {
				console.log('Wallet balance data:', response);
				if (response.data[0].balance) {
					const balanceElement = document.getElementById('wallet-balance');
					if (balanceElement) {
						balanceElement.textContent =
							parseFloat(response.data[0].balance).toFixed(2) + ' XLM';
					}
				}

				// Load recent transactions
				loadRecentTransactions(userData.token);
			})
			.catch((error) => {
				console.error('Error fetching wallet balance:', error);
				showNotification('Failed to load wallet balance');

				// Set a default balance to indicate an issue
				const balanceElement = document.getElementById('wallet-balance');
				if (balanceElement) {
					balanceElement.textContent = 'Error loading balance';
				}
			});
	}

	// Load recent transactions
	function loadRecentTransactions(token) {
		console.log('Loading recent transactions with token:', token);

		fetch(`${walletUrl}/stellar/transactions`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((response) => {
				console.log('Transaction data:', response);
				const transactionsList = document.getElementById(
					'recent-transactions-list'
				);

				if (!transactionsList) {
					console.warn('Transactions list element not found in DOM');
					return;
				}

				transactionsList.innerHTML = ''; // Clear placeholder transactions

				// Check for the proper response structure
				if (
					response.status === 'success' &&
					response.data &&
					response.data.length > 0
				) {
					// Get user's wallet address for identifying sent vs received
					chrome.storage.local.get(['user'], function (result) {
						const userData = result.user;
						const myWalletAddress = userData?.walletAddress || '';

						// Process each transaction
						response.data.forEach((transaction) => {
							// Determine if transaction is received (sent to user) or sent (sent by user)
							const isReceived =
								transaction.to === myWalletAddress &&
								transaction.from !== myWalletAddress;

							// For transactions where user is both sender and receiver (e.g. self-transfers)
							// or cases where we don't have the user's address, default to showing as received
							const isSent =
								transaction.from === myWalletAddress &&
								transaction.to !== myWalletAddress;

							// Format the amount with the asset type
							const formattedAmount =
								(isSent ? '−' : '+') + // Use minus sign (−) instead of hyphen for better appearance
								parseFloat(transaction.amount || 0).toFixed(2) +
								' ' +
								(transaction.asset || 'XLM');

							// Create a shortened wallet address for display
							const displayAddress = isSent
								? transaction.to
									? shortenWalletAddress(transaction.to)
									: 'Unknown'
								: transaction.from
								? shortenWalletAddress(transaction.from)
								: 'Unknown';

							const txDescription = isSent
								? `Sent to ${displayAddress}`
								: `Received from ${displayAddress}`;

							const txElement = document.createElement('div');
							txElement.className = 'recent-transaction';
							txElement.dataset.txid = transaction.id; // Store transaction ID for potential click events
							txElement.innerHTML = `
                        <div class="transaction-icon ${
													isSent ? 'sent' : 'received'
												}">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="${
																	isSent
																		? 'M12 19L12 5M12 19L18 13M12 19L6 13'
																		: 'M12 5L12 19M12 5L18 11M12 5L6 11'
																}" 
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="transaction-details">
                            <div class="transaction-name">${txDescription}</div>
                            <div class="transaction-date">${formatDate(
															transaction.timestamp
														)}</div>
                        </div>
                        <div class="transaction-amount ${
													isSent ? 'sent' : 'received'
												}">${formattedAmount}</div>
                    `;

							transactionsList.appendChild(txElement);
						});
					});
				} else {
					transactionsList.innerHTML = `
                <div style="padding: 20px 0; text-align: center; color: var(--text-secondary);">
                    No recent transactions
                </div>
            `;
				}
			})
			.catch((error) => {
				console.error('Error fetching transactions:', error);
				showNotification('Failed to load transactions');

				const transactionsList = document.getElementById(
					'recent-transactions-list'
				);
				if (transactionsList) {
					transactionsList.innerHTML = `
                <div style="padding: 20px 0; text-align: center; color: var(--text-secondary);">
                    Error loading transactions
                </div>
            `;
				}
			});
	}

	// Helper function to shorten wallet addresses for display
	function shortenWalletAddress(address) {
		if (!address || address.length < 10) return address;
		return `${address.substring(
			0,
			6
		)}...${address.substring(address.length - 4)}`;
	}
	// Format date helper
	function formatDate(dateString) {
		try {
			const date = new Date(dateString);
			if (isNaN(date.getTime())) {
				return 'Invalid date';
			}

			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);

			if (date >= today) {
				return `Today, ${date.toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				})}`;
			} else if (date >= yesterday) {
				return `Yesterday, ${date.toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				})}`;
			} else {
				return (
					date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
					`, ${date.toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					})}`
				);
			}
		} catch (e) {
			console.error('Date formatting error:', e);
			return 'Unknown date';
		}
	}

	// Load user data
	function loadUserData() {
		chrome.storage.local.get(['user'], function (result) {
			console.log('User data from storage:', result.user);
			const userData = result.user;

			if (userData && userData.token) {
				// Load wallet balance with the user data
				loadWalletBalance(userData);
			} else {
				console.error('No user token found in storage');
				// Redirect to login if no user data
				window.location.href = 'auth.html';
			}
		});
	}

	// Button actions - check if elements exist first
	const depositBtn = document.getElementById('deposit-btn');
	if (depositBtn) {
		depositBtn.addEventListener('click', function () {
			// Implement deposit action
			alert('Deposit functionality to be implemented');
		});
	}

	const withdrawBtn = document.getElementById('withdraw-btn');
	if (withdrawBtn) {
		withdrawBtn.addEventListener('click', function () {
			// Implement withdraw action
			alert('Withdraw functionality to be implemented');
		});
	}

	// Load initial data
	loadUserData();
});
