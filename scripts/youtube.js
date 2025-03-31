/**
 * SuperPage YouTube integration script
 * Adds tipping functionality to YouTube channels
 */

// Helper function to create DOM elements from HTML string
function createDomElement(html) {
	const template = document.createElement('template');
	template.innerHTML = html.trim();
	return template.content.firstChild;
}

// Function to add the tip button
function addTipButton() {
	console.log('Attempting to add tip button...');

	// Get the channel handle directly - with no fallbacks
	const channelLink = document.querySelector(
		'yt-formatted-string#text.ytd-channel-name a.yt-simple-endpoint'
	);

	if (!channelLink) {
		console.log('Channel link not found, aborting');
		return false;
	}

	// Extract the handle from the href attribute
	const channelHref = channelLink.getAttribute('href');
	if (!channelHref || !channelHref.startsWith('/@')) {
		console.log('Invalid channel href, aborting');
		return false;
	}

	// Get the handle (remove the / from the beginning)
	const channelHandle = channelHref.substring(1); // This will give "@theFlowStateStudio"
	console.log('Found channel handle:', channelHandle);

	// Find the subscribe button - only one specific selector, no fallbacks
	const subscribeButton = document.querySelector('#subscribe-button');
	if (!subscribeButton) {
		console.log('Subscribe button not found, aborting');
		return false;
	}

	// Remove any existing tip button and popover first
	const existingButton = document.getElementById('superpage-tip-btn');
	if (existingButton) {
		existingButton.remove();
	}

	const existingPopover = document.getElementById('tip-popover');
	if (existingPopover) {
		existingPopover.remove();
	}

	// Create the tip button
	const tipButton = createDomElement(`
        <button id="superpage-tip-btn"
            popovertarget="tip-popover" popovertargetaction="show"
            style="background-color: #6772E5; 
            color: white; 
            border: none; 
            border-radius: 50px; 
            padding: 8px 12px; 
            margin-left: 10px; 
            cursor: pointer; 
            font-weight: 600; 
            font-size: 16px;">
            💸
        </button>
    `);

	// Create payment form popover with the CURRENT channel handle
	const popover = createDomElement(`
        <div id="tip-popover" popover 
            style="background: white; 
            border-radius: 8px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
            padding: 20px; 
            width: 300px;
            font-family: 'YouTube Sans', 'Roboto', sans-serif;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; color: #0f0f0f; font-size: 18px;">
                    Send a tip to this creator
                </h3>
                <button id="close-popover" style="background: none; border: none; cursor: pointer; color: #606060; font-size: 18px; padding: 0;">
                    ✕
                </button>
            </div>
            
            <p id="channel-handle" style="margin-top: 0; margin-bottom: 16px; color: #606060; font-size: 14px;">
                ${channelHandle}
            </p>
            
            <form id="payment-form" style="display: flex; flex-direction: column;">
                <div style="margin-bottom: 16px;">
                    <label for="payment-amount" style="display: block; margin-bottom: 6px; color: #606060; font-size: 14px;">
                        Amount
                    </label>
                    <div style="position: relative;">
                        <span style="position: absolute; left: 12px; top: 10px; color: #606060;">$</span>
                        <input type="number" id="payment-amount" name="amount" min="1" step="0.01" value="5.00" required
                            style="width: 100%; 
                            padding: 10px 10px 10px 24px; 
                            border: 1px solid #d3d3d3; 
                            border-radius: 4px; 
                            box-sizing: border-box;
                            font-size: 14px;">
                    </div>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label for="payment-message" style="display: block; margin-bottom: 6px; color: #606060; font-size: 14px;">
                        Message (optional)
                    </label>
                    <textarea id="payment-message" name="message" rows="2" 
                        style="width: 100%; 
                        padding: 10px; 
                        border: 1px solid #d3d3d3; 
                        border-radius: 4px; 
                        box-sizing: border-box;
                        font-size: 14px;
                        resize: vertical;"></textarea>
                </div>
                
                <button type="submit" 
                    style="background-color: #6772E5; 
                    color: white; 
                    border: none; 
                    border-radius: 4px; 
                    padding: 12px; 
                    cursor: pointer; 
                    font-weight: 600; 
                    font-size: 14px;
                    transition: background-color 0.2s;">
                    Pay Now
                </button>
                
                <p style="margin-top: 12px; margin-bottom: 0; color: #606060; font-size: 12px; text-align: center;">
                    Secured by SuperPay
                </p>
            </form>
        </div>
    `);

	// Add the popover to the document body
	document.body.append(popover);

	// Add close functionality to the close button
	const closeButton = popover.querySelector('#close-popover');
	closeButton.addEventListener('click', () => {
		document.getElementById('tip-popover').hidePopover();
	});

	// Store the current channel handle in the dataset for easy access
	popover.dataset.channelHandle = channelHandle;

	// Add event listener for the payment form submission
	const paymentForm = popover.querySelector('#payment-form');
	paymentForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const amount = document.getElementById('payment-amount').value;
		const message = document.getElementById('payment-message').value;
		const videoId = new URLSearchParams(window.location.search).get('v') || '';

		// Get the current channel handle from the dataset
		const currentChannel = popover.dataset.channelHandle;

		// Show loading overlay
		showLoadingOverlay();

		console.log({
			amount,
			message,
			to: currentChannel.replace('@', ''),
			platform: 'youtube',
		});

		window.SuperPayment.processPayment({
			amount,
			message,
			to: currentChannel.replace('@', ''),
			platform: 'youtube',
		})
			.then((response) => {
				console.log('Payment response:', response);
				hideLoadingOverlay();

				// Show success notification with transaction hash
				if (response && response.data.transactionHash) {
					showTransactionSuccess(response.data.transactionHash);
				} else {
					showNotification('Payment successful!', 'success');
				}
			})
			.catch((error) => {
				console.error('Payment error:', error);
				hideLoadingOverlay();
				showNotification(
					error.message || 'Payment failed. Please try again.',
					'error'
				);
			});

		// Close the popover after submission
		document.getElementById('tip-popover').hidePopover();
	});

	// Append the button next to subscribe button
	console.log('Appending tip button next to subscribe button');

	// Style the subscribe button container for better alignment
	subscribeButton.style.display = 'flex';
	subscribeButton.style.alignItems = 'center';

	// Append button
	subscribeButton.appendChild(tipButton);
	return true;
}

// Function to handle YouTube's dynamic navigation
function setupMutationObserver() {
	// Initial attempt
	let success = addTipButton();

	// If not successful initially, set up an observer
	if (!success) {
		console.log('Setting up mutation observer to wait for YouTube elements');

		// Create a mutation observer to watch for DOM changes
		const observer = new MutationObserver(function (mutations) {
			if (!document.getElementById('superpage-tip-btn')) {
				success = addTipButton();
				if (success) {
					console.log('Successfully added button via mutation observer');
				}
			}
		});

		// Start observing
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});

		// Set a timeout to stop observing after 30 seconds
		setTimeout(() => {
			observer.disconnect();
			console.log('Stopped mutation observer after timeout');
		}, 30000);
	}
}

// YouTube SPA navigation detection
let lastUrl = location.href;
function checkForUrlChanges() {
	if (location.href !== lastUrl) {
		lastUrl = location.href;
		console.log('URL changed, re-adding tip button');

		// When URL changes, fully remove any existing button first
		const existingButton = document.getElementById('superpage-tip-btn');
		if (existingButton) {
			existingButton.remove();
		}

		// Remove any existing popover too
		const existingPopover = document.getElementById('tip-popover');
		if (existingPopover) {
			existingPopover.remove();
		}

		// Wait a moment for the page to load
		setTimeout(() => {
			setupMutationObserver();
		}, 2000);
	}
	requestAnimationFrame(checkForUrlChanges);
}

// Function to show loading overlay
function showLoadingOverlay() {
	// Remove any existing overlay
	const existingOverlay = document.getElementById('payment-loading-overlay');
	if (existingOverlay) {
		existingOverlay.remove();
	}

	// Create loading overlay
	const overlay = createDomElement(`
        <div id="payment-loading-overlay" 
            style="position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background-color: rgba(0,0,0,0.5); 
            display: flex; 
            justify-content: center; 
            align-items: center;
            z-index: 10000;">
            <div style="background-color: white; 
                padding: 30px; 
                border-radius: 8px; 
                text-align: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div style="width: 50px; height: 50px; margin: 0 auto 20px;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="50" height="50">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#6772E5" stroke-width="8">
                            <animate attributeName="stroke-dasharray" dur="1.5s" repeatCount="indefinite" 
                                from="0 251.2" to="251.2 0"></animate>
                            <animate attributeName="stroke-dashoffset" dur="1.5s" repeatCount="indefinite" 
                                from="0" to="-251.2"></animate>
                        </circle>
                    </svg>
                </div>
                <p style="margin: 0; font-family: 'YouTube Sans', 'Roboto', sans-serif; color: #0f0f0f; font-size: 16px;">
                    Processing your payment...
                </p>
            </div>
        </div>
    `);

	document.body.appendChild(overlay);
}

// Function to hide loading overlay
function hideLoadingOverlay() {
	const overlay = document.getElementById('payment-loading-overlay');
	if (overlay) {
		overlay.remove();
	}
}

// Function to show notification
function showNotification(message, type = 'info') {
	// Remove any existing notification
	const existingNotification = document.getElementById(
		'superpage-notification'
	);
	if (existingNotification) {
		existingNotification.remove();
	}

	// Set color based on notification type
	let bgColor = '#4CAF50'; // success (green)
	if (type === 'error') {
		bgColor = '#F44336'; // error (red)
	} else if (type === 'info') {
		bgColor = '#2196F3'; // info (blue)
	}

	// Create notification
	const notification = createDomElement(`
        <div id="superpage-notification" 
            style="position: fixed; 
            bottom: 20px; 
            left: 50%; 
            transform: translateX(-50%);
            background-color: ${bgColor}; 
            color: white; 
            padding: 12px 24px; 
            border-radius: 4px; 
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            font-family: 'YouTube Sans', 'Roboto', sans-serif;
            min-width: 300px;
            text-align: center;">
            <p style="margin: 0; font-size: 14px;">${message}</p>
        </div>
    `);

	document.body.appendChild(notification);

	// Remove notification after 5 seconds
	setTimeout(() => {
		notification.remove();
	}, 5000);
}

// Function to show transaction success with clickable hash
function showTransactionSuccess(txHash) {
	// Remove any existing notification
	const existingNotification = document.getElementById(
		'superpage-notification'
	);
	if (existingNotification) {
		existingNotification.remove();
	}

	// Create success notification with transaction link
	const notification = createDomElement(`
        <div id="superpage-notification" 
            style="position: fixed; 
            bottom: 20px; 
            left: 50%; 
            transform: translateX(-50%);
            background-color: white; 
            color: #0f0f0f; 
            padding: 16px; 
            border-radius: 8px; 
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            font-family: 'YouTube Sans', 'Roboto', sans-serif;
            min-width: 320px;
            max-width: 90%;
            text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span style="margin-left: 8px; font-weight: 600; font-size: 16px;">Payment Successful!</span>
            </div>
            <p style="margin: 0 0 10px; font-size: 14px; color: #606060;">
                Your transaction has been processed.
            </p>
            <a href="https://stellar.expert/explorer/testnet/tx/${txHash}" 
                target="_blank"
                style="display: inline-block;
                padding: 8px 16px;
                background-color: #f8f9fa;
                border: 1px solid #dadce0;
                border-radius: 4px;
                color: #1a73e8;
                font-size: 13px;
                font-weight: 500;
                text-decoration: none;
                transition: background-color 0.2s;">
                View on Stellar Explorer
            </a>
        </div>
    `);

	document.body.appendChild(notification);

	// Remove notification after 10 seconds
	setTimeout(() => {
		notification.remove();
	}, 10000);
}

// Initialize
console.log('SuperPay YouTube integration initialized');
setupMutationObserver();
checkForUrlChanges();
