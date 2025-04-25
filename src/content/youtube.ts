import { createPopup } from '@/components/PaymentModal';
import {
	waitForElement,
	injectWalletBridge,
	injectCustomStyles,
} from '@/injected/common';

injectWalletBridge();

const injectTipButton = async () => {
	injectCustomStyles();

	const ownerSection = await waitForElement('#owner');
	if (!ownerSection) return;

	if (document.getElementById('superpage-tip-btn')) return;

	const button = document.createElement('button');
	button.id = 'superpage-tip-btn';
	button.className = 'superpage-btn';

	// Better inner content with SVG icon
	button.innerHTML = `
        <span class="superpage-btn-icon">
			💸
        </span>
    `;

	button.onclick = (e) => {
		e.stopPropagation(); // Prevent YouTube click events from interfering

		// Visual feedback on click
		button.style.transform = 'scale(0.95)';
		setTimeout(() => {
			button.style.transform = '';
		}, 100);

		// Get channel name more reliably with multiple fallbacks
		let channelName = 'this creator';

		// Try to get from channel link href attribute first (most reliable)
		const channelLink = document.querySelector(
			'a.yt-simple-endpoint.ytd-video-owner-renderer'
		);
		if (channelLink && channelLink.getAttribute('href')) {
			const href = channelLink.getAttribute('href');
			// Extract username from /@username format
			if (href!.startsWith('/')) {
				channelName = href!.substring(2); // Remove the leading /@
			}
		}

		// If not found, try other selectors as fallbacks
		if (channelName === 'this creator') {
			channelName =
				document.querySelector('#text > a')?.textContent?.trim() ||
				document.querySelector('.ytd-channel-name a')?.textContent?.trim() ||
				'this creator';
		}

		console.log('[SuperPay] Opening tip modal for:', channelName);
		createPopup(channelName, 'youtube');
	};

	// Insert button in a better position
	const metaArea = ownerSection.querySelector('#meta') || ownerSection;
	metaArea.appendChild(button);

	// Log for debugging
	console.log('[SuperPay] Tip button injected successfully');
};

// Initial injection
injectTipButton();

// Handle navigation on YouTube's SPA
const observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		if (
			mutation.type === 'childList' &&
			document.location.pathname.includes('/watch')
		) {
			// YouTube navigation detected, try to re-inject the button
			setTimeout(injectTipButton, 1000);
		}
	});
});

// Start observing the target node for configured mutations
observer.observe(document.body, { childList: true, subtree: true });
