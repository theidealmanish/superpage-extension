// github.ts
import { createPopup } from '@/components/PaymentModal';
import {
	injectCustomStyles,
	injectPhantomBridge,
	waitForElement,
} from '../injected/common';

injectPhantomBridge();

// Improved function to get the username from different contexts
const getUsername = (contextElement?: Element | null): string => {
	// If a context element is provided, search within that context
	const container = contextElement || document;

	// First try to find the author link (most comment contexts)
	const authorLink = container.querySelector('.author.Link--primary');
	if (authorLink) {
		return authorLink.textContent?.trim() || '';
	}

	// Try finding it in the provided HTML structure
	const authorLinkAlt = container.querySelector('a.author');
	if (authorLinkAlt) {
		return authorLinkAlt.textContent?.trim() || '';
	}

	// Fallback to the profile nickname if on a profile page
	const nicknameElement = container.querySelector('.p-nickname');
	if (nicknameElement) {
		return nicknameElement.textContent?.trim() || '';
	}

	return '';
};

const injectTipButton = async () => {
	injectCustomStyles();

	// Only inject the profile tip button once
	const reactionMenu = await waitForElement('reactions-menu');
	if (!reactionMenu) return;

	if (document.getElementById('superpage-tip-btn')) return;

	// Create tip button
	const button = document.createElement('button');
	button.id = 'superpage-tip-btn';
	button.className = 'superpage-btn';
	button.innerHTML = `
        <span class="superpage-btn-icon">💸</span>
    `;

	// Get the comment container which contains the author info
	const commentContainer = reactionMenu.closest(
		'.timeline-comment-group, .js-comment, .timeline-comment'
	);

	button.onclick = (e) => {
		e.stopPropagation();
		button.style.transform = 'scale(0.95)';
		setTimeout(() => {
			button.style.transform = '';
		}, 100);

		// Get username from the proper context
		let userName = 'this developer';

		if (commentContainer) {
			userName = getUsername(commentContainer);
		}

		// If we couldn't find the username in the comment container, try the document
		if (!userName) {
			userName = getUsername() || 'this developer';
		}

		console.log('[SuperPay] Opening tip modal for:', userName);
		createPopup(userName, 'github');
	};

	// Place the button next to the reaction menu
	reactionMenu.parentNode?.insertBefore(button, reactionMenu.nextSibling);
	console.log('[SuperPay] GitHub tip button injected');
};

injectTipButton();
