const walletUrl = 'http://localhost:8000/api/wallets';

document.addEventListener('DOMContentLoaded', function () {
	// Load transactions when page loads
	loadAllTransactions();

	// Add event listeners for filter options if they exist
	const filterOptions = document.querySelectorAll('.filter-option');
	if (filterOptions) {
		filterOptions.forEach((option) => {
			option.addEventListener('click', function (e) {
				e.preventDefault();
				const filter = this.getAttribute('data-filter');
				filterTransactions(filter);

				// Update filter button text
				const filterButton = document.querySelector('.filter-button');
				if (filterButton) {
					filterButton.textContent = this.textContent;
				}
			});
		});
	}

	// Add event listener for transaction items (for showing details)
	document.addEventListener('click', function (e) {
		const transactionItem = e.target.closest('.transaction-item');
		if (transactionItem) {
			const txId = transactionItem.getAttribute('data-tx');
			if (txId) {
				showTransactionDetails(txId);
			}
		}
	});

	// Close modal when clicking the close button
	const modalClose = document.getElementById('modal-close');
	if (modalClose) {
		modalClose.addEventListener('click', function () {
			const modal = document.getElementById('transaction-modal');
			if (modal) {
				modal.style.display = 'none';
			}
		});
	}
});

// Function to load all transactions
function loadAllTransactions() {
	// Show loading state
	const transactionContainer = document.getElementById('transaction-container');
	if (transactionContainer) {
		transactionContainer.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="display: inline-block; width: 24px; height: 24px; border: 2px solid var(--primary-color); 
                    border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 8px; color: var(--text-secondary);">Loading transactions...</p>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
	}

	// Get user data from storage
	chrome.storage.local.get(['user'], function (result) {
		if (!result.user || !result.user.token) {
			showEmptyState('Please log in to view your transactions');
			return;
		}

		// Make API call to get transactions
		fetch(`${walletUrl}/stellar/transactions`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${result.user.token}`,
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
				// Check if we have transactions
				if (
					response.status === 'success' &&
					response.data &&
					response.data.length > 0
				) {
					displayTransactions(response.data, result.user.walletAddress);
				} else {
					showEmptyState();
				}
			})
			.catch((error) => {
				console.error('Error fetching transactions:', error);
				showEmptyState('Failed to load transactions. Please try again later.');
			});
	});
}

// Function to display transactions
function displayTransactions(transactions, userWalletAddress) {
	const transactionContainer = document.getElementById('transaction-container');
	if (!transactionContainer) return;

	// Group transactions by date
	const groupedTransactions = groupTransactionsByDate(transactions);

	// Clear container
	transactionContainer.innerHTML = '';

	// Iterate through grouped transactions
	Object.keys(groupedTransactions).forEach((date) => {
		// Add date divider
		const dateElement = document.createElement('div');
		dateElement.className = 'date-divider';
		dateElement.textContent = date;
		transactionContainer.appendChild(dateElement);

		// Create transaction list
		const transactionList = document.createElement('ul');
		transactionList.className = 'transaction-list';

		// Add transactions for this date
		groupedTransactions[date].forEach((transaction) => {
			const transactionItem = createTransactionElement(
				transaction,
				userWalletAddress
			);
			transactionList.appendChild(transactionItem);
		});

		// Add the list to the container
		transactionContainer.appendChild(transactionList);
	});
}

// Function to create a transaction element
function createTransactionElement(transaction, userWalletAddress) {
	// Determine if transaction is sent or received
	const isSent =
		transaction.from === userWalletAddress &&
		transaction.to !== userWalletAddress;
	const isReceived =
		transaction.to === userWalletAddress &&
		transaction.from !== userWalletAddress;
	const isSelfTransfer =
		transaction.from === userWalletAddress &&
		transaction.to === userWalletAddress;

	// Platform type - could be determined from transaction metadata if available
	const platform =
		transaction.memo && transaction.memo.includes('youtube')
			? 'youtube'
			: 'wallet';

	// Create shortened wallet address for display
	const displayAddress = shortenWalletAddress(
		isSent ? transaction.to : transaction.from
	);

	// Create appropriate title based on transaction type
	let title;
	if (isSelfTransfer) {
		title = 'Self Transfer';
	} else if (isSent) {
		title =
			platform === 'youtube'
				? `Tip to @${displayAddress}`
				: `Sent to ${displayAddress}`;
	} else {
		title = `Received from ${displayAddress}`;
	}

	// Format amount
	const amount = parseFloat(transaction.amount).toFixed(2);
	const formattedAmount = (isSent ? '-' : '+') + '$' + amount;

	// Create transaction item
	const li = document.createElement('li');
	li.className = 'transaction-item';
	li.dataset.type = isSent ? 'sent' : isReceived ? 'received' : 'transfer';
	li.dataset.platform = platform;
	li.dataset.tx = transaction.id;

	li.innerHTML = `
        <div class="transaction-icon ${
					isSent ? 'sent' : isReceived ? 'received' : 'swap'
				}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="${
									isSent
										? 'M12 19L12 5M5 12L12 5L19 12'
										: isReceived
										? 'M12 5L12 19M19 12L12 19L5 12'
										: 'M17 10H3M17 10L13 6M17 10L13 14M7 14H21M7 14L11 10M7 14L11 18'
								}" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <div class="transaction-details">
            <div class="transaction-title">${title}</div>
            <div class="transaction-meta">
                <div class="transaction-platform">
                    ${getPlatformIcon(platform)}
                    ${platform === 'youtube' ? 'YouTube' : 'Wallet'}
                </div>
                <div class="transaction-time">${formatTime(
									transaction.timestamp
								)}</div>
            </div>
        </div>
        <div>
            <div class="transaction-amount ${
							isSent ? 'negative' : 'positive'
						}">${formattedAmount}</div>
            <div class="transaction-status completed">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Completed
            </div>
        </div>
    `;

	return li;
}

// Function to get platform icon SVG
function getPlatformIcon(platform) {
	if (platform === 'youtube') {
		return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.5 6.5C22.2 7.3 21.8 8 21.2 8.7C20.9 13.1 18.9 16.9 15.5 19.5C12 22.1 8 22.5 3.8 20.7C6 20.8 8.2 20 10 18.6C8 18.6 6.4 17.5 5.5 15.8C6.3 15.9 7 15.9 7.8 15.7C5.7 15.2 4.1 13.5 4 11.3C4.8 11.7 5.6 11.9 6.5 11.9C4.1 10.2 3.3 7 4.8 4.4C7.3 7.5 10.5 9.4 14.3 9.7C14.2 9.3 14.2 8.9 14.2 8.5C14.2 5.8 16.3 3.6 19 3.6C20.4 3.6 21.7 4.2 22.6 5.2C23.6 5 24.6 4.6 25.4 4.1C25 5.2 24.2 6.1 23.2 6.6C24.1 6.5 25.1 6.2 26 5.8C25.4 6.8 24.6 7.6 23.7 8.3C23.7 8.4 23.7 8.5 23.7 8.6C23.7 8.6 23.7 8.5 22.5 6.5Z" fill="currentColor"/>
        </svg>`;
	} else {
		return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 10.5C7 10.2239 7.22386 10 7.5 10H16.5C16.7761 10 17 10.2239 17 10.5V17.5C17 17.7761 16.7761 18 16.5 18H7.5C7.22386 18 7 17.7761 7 17.5V10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 10V8C9 6.89543 9.89543 6 11 6H13C14.1046 6 15 6.89543 15 8V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
	}
}

// Function to format timestamp to time (e.g., "11:32 AM")
function formatTime(timestamp) {
	const date = new Date(timestamp);
	return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// Function to group transactions by date
function groupTransactionsByDate(transactions) {
	const grouped = {};

	transactions.forEach((transaction) => {
		const date = new Date(transaction.timestamp);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);

		let dateKey;
		if (isSameDay(date, today)) {
			dateKey = 'Today';
		} else if (isSameDay(date, yesterday)) {
			dateKey = 'Yesterday';
		} else {
			dateKey = date.toLocaleDateString(undefined, {
				month: 'long',
				day: 'numeric',
				year:
					date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
			});
		}

		if (!grouped[dateKey]) {
			grouped[dateKey] = [];
		}

		grouped[dateKey].push(transaction);
	});

	return grouped;
}

// Helper function to check if two dates are the same day
function isSameDay(date1, date2) {
	return (
		date1.getDate() === date2.getDate() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getFullYear() === date2.getFullYear()
	);
}

// Function to shorten wallet address
function shortenWalletAddress(address) {
	if (!address || address.length < 8) return address;
	return (
		address.substring(0, 6) + '...' + address.substring(address.length - 4)
	);
}

// Function to show transaction details in modal
function showTransactionDetails(txId) {
	// Get transaction data
	chrome.storage.local.get(['user'], function (result) {
		if (!result.user || !result.user.token) return;

		fetch(`${walletUrl}/stellar/transaction/${txId}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${result.user.token}`,
				'Content-Type': 'application/json',
			},
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				if (data.transaction) {
					displayTransactionModal(data.transaction, result.user.walletAddress);
				}
			})
			.catch((error) => {
				console.error('Error fetching transaction details:', error);
			});
	});
}

// Function to display transaction modal
function displayTransactionModal(transaction, userWalletAddress) {
	const modal = document.getElementById('transaction-modal');
	if (!modal) return;

	// Determine if transaction is sent or received
	const isSent =
		transaction.from === userWalletAddress &&
		transaction.to !== userWalletAddress;

	// Get display values
	const displayAddress = shortenWalletAddress(
		isSent ? transaction.to : transaction.from
	);
	const title = isSent
		? `Tip to ${displayAddress}`
		: `Received from ${displayAddress}`;
	const amount = parseFloat(transaction.amount).toFixed(2);
	const formattedAmount = (isSent ? '-' : '+') + '$' + amount;

	// Update modal content
	const modalIcon = document.querySelector('.transaction-summary-icon');
	if (modalIcon) {
		modalIcon.className = `transaction-summary-icon ${
			isSent ? 'sent' : 'received'
		}`;
		modalIcon.innerHTML = `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="${
									isSent
										? 'M12 19L12 5M5 12L12 5L19 12'
										: 'M12 5L12 19M19 12L12 19L5 12'
								}" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
	}

	// Update amount and description
	const amountElement = document.querySelector('.transaction-summary-amount');
	if (amountElement) {
		amountElement.textContent = formattedAmount;
		amountElement.className = `transaction-summary-amount ${
			isSent ? 'negative' : 'positive'
		}`;
	}

	const descriptionElement = document.querySelector(
		'.transaction-summary-description'
	);
	if (descriptionElement) {
		descriptionElement.textContent = title;
	}

	// Update transaction details
	document.querySelector('.detail-value[data-field="status"]').textContent =
		'Completed';

	const txDate = new Date(transaction.timestamp);
	document.querySelector(
		'.detail-value[data-field="date"]'
	).textContent = `${txDate.toLocaleDateString()} • ${txDate.toLocaleTimeString(
		[],
		{ hour: 'numeric', minute: '2-digit' }
	)}`;

	document.querySelector('.detail-value[data-field="platform"]').textContent =
		transaction.memo && transaction.memo.includes('youtube')
			? 'YouTube'
			: 'Wallet';

	document.querySelector('.detail-value[data-field="hash"]').textContent =
		transaction.id;

	const messageElement = document.querySelector(
		'.detail-value[data-field="message"]'
	);
	if (messageElement) {
		messageElement.textContent = transaction.memo || 'No message';
	}

	// Update Explorer button
	const explorerButton = document.querySelector('.view-explorer-button');
	if (explorerButton) {
		explorerButton.onclick = function () {
			window.open(
				`https://stellar.expert/explorer/testnet/tx/${transaction.id}`,
				'_blank'
			);
		};
	}

	// Show modal
	modal.style.display = 'flex';
}

// Function to show empty state
function showEmptyState(message = 'No transactions yet') {
	const transactionContainer = document.getElementById('transaction-container');
	const emptyState = document.getElementById('empty-state');

	if (transactionContainer) {
		transactionContainer.style.display = 'none';
	}

	if (emptyState) {
		const messageElement = emptyState.querySelector('.empty-state-message');
		if (messageElement) {
			messageElement.textContent = message;
		}
		emptyState.style.display = 'block';
	}
}

// Function to filter transactions
function filterTransactions(filter) {
	const items = document.querySelectorAll('.transaction-item');

	items.forEach((item) => {
		if (
			filter === 'all' ||
			item.getAttribute('data-type') === filter ||
			item.getAttribute('data-platform') === filter
		) {
			item.style.display = '';
		} else {
			item.style.display = 'none';
		}
	});
}
