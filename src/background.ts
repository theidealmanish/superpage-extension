// Background script to handle engagement reporting and other background tasks

// Store pending engagements in memory
let pendingEngagements: any[] = [];
const API_URL = 'http://localhost:8000';

// Process message from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	console.log('[SuperPage Background] Received message:', message.type);
	if (message.type === 'reportEngagement') {
		console.log('[SuperPage Background] Reporting engagement:', message.data);
	}
	if (message.type === 'reportEngagement') {
		// Add engagement to queue
		pendingEngagements.push(message.data);

		// Process immediately
		processEngagementQueue()
			.then(() => {
				sendResponse({ success: true });
			})
			.catch((error) => {
				console.error(
					'[SuperPage Background] Error reporting engagement:',
					error
				);
				sendResponse({ success: false, error: error.message });
			});

		// Return true to indicate we'll send a response asynchronously
		return true;
	}

	if (message.type === 'getRecipientAddress') {
		// Handle recipient address lookup
		fetchRecipientAddress(message.username, message.platform)
			.then((data) => {
				sendResponse({ success: true, data });
			})
			.catch((error) => {
				console.error(
					'[SuperPage Background] Error fetching recipient address:',
					error
				);
				sendResponse({ success: false, error: error.message });
			});

		// Return true to indicate we'll send a response asynchronously
		return true;
	}
});

// Process engagement queue
async function processEngagementQueue(): Promise<void> {
	if (pendingEngagements.length === 0) return;

	console.log(
		`[SuperPage Background] Processing ${pendingEngagements.length} pending engagements`
	);

	// Get the first engagement in the queue
	const engagement = pendingEngagements[0];

	try {
		// Make the API request
		const response = await fetch(`${API_URL}/engagements`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(engagement),
		});

		if (response.ok) {
			console.log('[SuperPage Background] Engagement reported successfully');
			// Remove the engagement from the queue
			pendingEngagements.shift();

			// Process any remaining engagements
			if (pendingEngagements.length > 0) {
				return processEngagementQueue();
			}
		} else {
			const errorText = await response.text();
			console.error(
				'[SuperPage Background] Failed to report engagement:',
				errorText
			);

			// Keep the engagement in the queue and retry later
			// Remove it from the front and add it to the back to avoid blocking the queue
			const failedEngagement = pendingEngagements.shift();
			if (failedEngagement) {
				pendingEngagements.push(failedEngagement);
			}
		}
	} catch (error) {
		console.error('[SuperPage Background] Error reporting engagement:', error);

		// Move the failed engagement to the end of the queue for retry
		const failedEngagement = pendingEngagements.shift();
		if (failedEngagement) {
			pendingEngagements.push(failedEngagement);
		}
	}
}

// Fetch recipient address
async function fetchRecipientAddress(
	username: string,
	platform: string
): Promise<any> {
	try {
		const response = await fetch(`${API_URL}/users/${platform}/${username}`);

		if (!response.ok) {
			throw new Error(`Failed to fetch recipient: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error(
			'[SuperPage Background] Error fetching recipient address:',
			error
		);
		throw error;
	}
}

// Set up periodic processing of the engagement queue
setInterval(processEngagementQueue, 60000); // Every minute

// Process queue when extension is first loaded
processEngagementQueue();
