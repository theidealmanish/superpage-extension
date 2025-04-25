import { createPopup } from '@/components/PaymentModal';
import { injectWalletBridge } from '@/injected/common';

injectWalletBridge();

function injectCustomStyles(): void {
	const id = 'superpage-custom-styles';
	if (document.getElementById(id)) return;

	const style = document.createElement('style');
	style.id = id;
	style.textContent = `
        .superpage-btn {
            color: white;
            border-radius: 9999px;
            font-weight: 500;
            font-size: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            height: 36px;
        }
        
        .superpage-btn:hover {
            opacity: 0.9;
        }
        
        .superpage-btn-icon {
            display: inline-block;
            margin-right: 4px;
        }
        
        .superpage-btn-text {
            font-weight: 600;
        }
        
        .superpage-timeline-btn {
            padding: 4px;
            height: 32px;
        }
        
        .superpage-tooltip {
            position: absolute;
            background: #1e293b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            transition: all 0.2s ease;
            pointer-events: none;
            white-space: nowrap;
            z-index: 10000;
        }
        
        .superpage-btn:hover .superpage-tooltip {
            opacity: 1;
            bottom: -25px;
        }
    `;
	document.head.appendChild(style);
}

const injectTipButton = async () => {
	injectCustomStyles();

	// First check if we're on a tweet page
	if (!window.location.pathname.includes('/status/')) {
		return;
	}

	// Find the tweet container
	const tweetContainer = document.querySelector('article');
	if (!tweetContainer) {
		console.log('[SuperPay] Tweet article not found');
		return;
	}

	// Check if our button already exists to avoid duplicates
	if (tweetContainer.querySelector('#superpage-tip-btn')) {
		return;
	}

	// Find the action bar
	const actionBar = tweetContainer.querySelector('[role="group"]');
	if (!actionBar) {
		console.log('[SuperPay] Action bar not found');
		return;
	}

	// Look specifically for the Grok button using aria-label
	const grokButton = actionBar.querySelector(
		'button[aria-label="Grok actions"]'
	);
	if (!grokButton) {
		console.log('[SuperPay] Grok button not found');
		return;
	}

	// Get the parent div that contains all the action buttons by traversing up to the button row
	const buttonRowContainer = grokButton.closest(
		'.css-175oi2r.r-1awozwy.r-18u37iz.r-1cmwbt1.r-1wtj0ep'
	);
	if (!buttonRowContainer) {
		console.log('[SuperPay] Button row container not found');
		return;
	}

	// Create our button div wrapper to match X.com's structure
	const buttonWrapper = document.createElement('div');
	buttonWrapper.className = 'css-175oi2r r-18u37iz r-1h0z5md';
	buttonWrapper.id = 'superpage-tip-container';

	// Create our button with similar style to X's buttons
	const button = document.createElement('button');
	button.id = 'superpage-tip-btn';
	button.className = 'superpage-btn';
	button.setAttribute('role', 'button');
	button.setAttribute('aria-label', 'Tip creator');
	button.setAttribute('type', 'button');

	// Add both icon and text for better visibility
	button.innerHTML = `
        <span class="superpage-btn-icon">💸</span>
        <span class="superpage-btn-text">Tip</span>
    `;

	button.onclick = (e) => {
		e.stopPropagation();
		e.preventDefault();

		// Visual feedback
		button.style.transform = 'scale(0.95)';
		setTimeout(() => {
			button.style.transform = '';
		}, 100);

		// Get username from the tweet
		let username = '';

		// Try to find username in different ways
		// 1. Try to find from article header
		const authorElement = tweetContainer.querySelector(
			'[data-testid="User-Name"]'
		);
		if (authorElement) {
			// Username in x starts with @, we want to extract just the name
			const usernameSpans = authorElement.querySelectorAll('span');
			for (const span of usernameSpans) {
				if (span.textContent && span.textContent.startsWith('@')) {
					username = span.textContent.substring(1); // Remove @ symbol
					break;
				}
			}
		}

		// 2. Try from URL as fallback
		if (!username && window.location.pathname.includes('/status/')) {
			const pathParts = window.location.pathname.split('/');
			if (pathParts.length > 1) {
				username = pathParts[1]; // The username is typically the first part of the path
			}
		}

		// Default if we couldn't find it
		username = username || 'this creator';

		console.log('[SuperPay] Opening tip modal for:', username);
		createPopup(username, 'x');
	};

	// Add button to wrapper
	buttonWrapper.appendChild(button);

	// Find the container of the Grok button to position our button after it
	const grokButtonContainer = grokButton.closest(
		'.css-175oi2r.r-18u37iz.r-1h0z5md'
	);
	if (grokButtonContainer && grokButtonContainer.parentNode) {
		// Insert right after the Grok button's container
		grokButtonContainer.parentNode.insertBefore(
			buttonWrapper,
			grokButtonContainer.nextSibling
		);
	} else {
		// If we can't find the precise location, find the rightmost container as a fallback
		const rightContainer = buttonRowContainer.querySelector(
			'.css-175oi2r.r-1awozwy.r-6koalj.r-18u37iz'
		);
		if (rightContainer) {
			// Insert before the rightmost container (typically contains the More button)
			buttonRowContainer.insertBefore(buttonWrapper, rightContainer);
		} else {
			// Last resort, just append to the row
			buttonRowContainer.appendChild(buttonWrapper);
		}
	}

	console.log('[SuperPay] Tip button injected into X.com successfully');
};

// Function to handle tweets in timeline
const processTweetTimeline = () => {
	// Find all tweet articles in the timeline
	const tweets = document.querySelectorAll('article');
	console.log('[SuperPay] Processing timeline tweets:', tweets.length);
	tweets.forEach((tweet) => {
		// Skip if this tweet already has our button
		if (tweet.querySelector('.superpage-timeline-btn')) return;

		// Look for Grok button in this tweet
		const grokButton = tweet.querySelector('button[aria-label="Grok actions"]');
		console.log('[SuperPay] Grok button found:', grokButton);
		if (!grokButton) return;

		// Get the parent container for Grok button
		const grokButtonContainer = grokButton.closest(
			'.css-175oi2r.r-18u37iz.r-1h0z5md'
		);
		if (!grokButtonContainer || !grokButtonContainer.parentNode) return;

		// Create our button div wrapper to match X.com's structure
		const buttonWrapper = document.createElement('div');

		// Create a new button for this tweet
		const button = document.createElement('button');
		button.className = 'superpage-btn superpage-timeline-btn';
		button.setAttribute('role', 'button');
		button.setAttribute('aria-label', 'Tip creator');
		button.setAttribute('type', 'button');

		button.innerHTML = `
            <span class="superpage-btn-icon">💸</span>
        `;

		button.onclick = (e) => {
			e.stopPropagation();
			e.preventDefault();

			// Get username from tweet
			let username = '';

			// Find username in tweet
			const authorElement = tweet.querySelector('[data-testid="User-Name"]');
			if (authorElement) {
				const usernameSpans = authorElement.querySelectorAll('span');
				for (const span of usernameSpans) {
					if (span.textContent && span.textContent.startsWith('@')) {
						username = span.textContent.substring(1);
						break;
					}
				}
			}

			username = username || 'this creator';
			console.log('[SuperPay] Opening tip modal from timeline for:', username);
			createPopup(username, 'x');
		};

		// Add button to wrapper
		buttonWrapper.appendChild(button);

		// Insert right after Grok button
		grokButtonContainer.parentNode.insertBefore(
			buttonWrapper,
			grokButtonContainer.nextSibling
		);
	});
};

// Initial injection with delay to ensure DOM is loaded
setTimeout(() => {
	injectTipButton();
	processTweetTimeline();
}, 2000);

// Function to periodically check and inject buttons for new content
const periodicCheck = () => {
	injectTipButton();
	processTweetTimeline();
};

// Set up periodic checking to handle dynamic content loading
setInterval(periodicCheck, 3000);

// Observer for SPA navigation and dynamically loaded content
const observer = new MutationObserver((mutations) => {
	let shouldCheck = false;

	for (const mutation of mutations) {
		if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
			shouldCheck = true;
			break;
		}
	}

	if (shouldCheck) {
		setTimeout(() => {
			injectTipButton();
			processTweetTimeline();
		}, 1000);
	}
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Also re-check whenever URL changes (for SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
	const url = location.href;
	if (url !== lastUrl) {
		lastUrl = url;
		setTimeout(() => {
			injectTipButton();
			processTweetTimeline();
		}, 1000);
	}
}).observe(document, { subtree: true, childList: true });
