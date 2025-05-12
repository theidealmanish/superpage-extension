import { createPopup } from '@/components/PaymentModal';
import {
	waitForElement,
	injectWalletBridge,
	injectCustomStyles,
} from '@/injected/common';

injectWalletBridge();

// Define interface for watch time data
interface WatchTimeData {
	[creator: string]: number;
}

// Track creator watch time with these variables
let currentCreator: string = '';
let currentVideoId: string = '';
let watchStartTime: number = 0;
let isWatching: boolean = false;
let watchTimeData: WatchTimeData = {};
let urlObserver: MutationObserver | null = null;
let domObserver: MutationObserver | null = null;

const API_URL = 'http://localhost:8000';

// Get current video ID from URL
const getCurrentVideoId = (): string => {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get('v') || '';
};

// Update watch time for current creator
const updateWatchTime = (endWatching: boolean = false): void => {
	if (!isWatching || !currentCreator) return;

	const video = document.querySelector<HTMLVideoElement>('video');
	// Skip if video is paused or ended
	if (!video || video.paused || video.ended) {
		if (endWatching) isWatching = false;
		return;
	}

	const now: number = Date.now();
	const watchDuration: number = (now - watchStartTime) / 1000; // in seconds

	if (watchDuration < 1) return; // Ignore very short intervals

	// Update watch time data
	if (!watchTimeData[currentCreator]) {
		watchTimeData[currentCreator] = 0;
	}
	watchTimeData[currentCreator] += watchDuration;

	console.log(
		`[SuperPage] Updated watch time for ${currentCreator}: +${watchDuration.toFixed(
			1
		)}s (total: ${watchTimeData[currentCreator].toFixed(1)}s)`
	);

	if (endWatching) {
		isWatching = false;
	} else {
		// Reset start time for continuous tracking
		watchStartTime = now;
	}
};

// Replace the direct reportEngagementToBackend function with this:
const reportEngagementToBackend = async (
	endWatching: boolean = false
): Promise<void> => {
	if (!currentCreator || !currentVideoId) return;

	// Only report if the user has watched for at least 5 seconds
	if (!watchTimeData[currentCreator] || watchTimeData[currentCreator] < 5)
		return;

	// Get current URL for reporting
	const sourceUrl = window.location.href;

	// Round the engaged time to whole seconds
	const engagedTime = Math.floor(watchTimeData[currentCreator]);

	console.log(
		`[SuperPage] Reporting engagement for ${currentCreator}: ${engagedTime}s`
	);

	const data = {
		creatorUsername: currentCreator,
		sourceUrl: sourceUrl,
		engagedTime: engagedTime,
		platform: 'youtube',
		videoId: currentVideoId,
		timestamp: new Date().toISOString(),
	};

	try {
		// Try to send through background script with a timeout
		const messagePromise = new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				reject(new Error('Background message timeout'));
			}, 1000); // 1 second timeout

			chrome.runtime.sendMessage(
				{
					type: 'reportEngagement',
					data,
				},
				(response) => {
					clearTimeout(timeoutId);

					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message));
						return;
					}

					if (response && response.success) {
						resolve(true);
					} else {
						reject(new Error(response ? response.error : 'Unknown error'));
					}
				}
			);
		});

		// Wait for the message to be sent or timeout
		await messagePromise;
		console.log(
			'[SuperPage] Engagement sent to background script successfully'
		);

		// Reset the watch time data for this creator if we're ending the session
		if (endWatching) {
			watchTimeData[currentCreator] = 0;
		}
	} catch (error) {
		console.warn(
			'[SuperPage] Background reporting failed, falling back to direct API call:',
			error
		);

		// Fall back to direct fetch if background script fails
		try {
			const response = await fetch(`${API_URL}/engagements`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				console.log('[SuperPage] Engagement reported directly successfully');
				// Reset the watch time data for this creator if we're ending the session
				if (endWatching) {
					watchTimeData[currentCreator] = 0;
				}
			} else {
				throw new Error(`HTTP error ${response.status}`);
			}
		} catch (fetchError) {
			console.error(
				'[SuperPage] Direct engagement reporting failed:',
				fetchError
			);
		}
	}
};

// Start tracking for a creator
const startWatchTimeTracking = (creator: string): void => {
	// Don't restart tracking if we're already tracking this creator with this video
	const newVideoId = getCurrentVideoId();
	if (
		isWatching &&
		creator === currentCreator &&
		newVideoId === currentVideoId
	) {
		return;
	}

	// Update previous creator's time if we were already watching
	if (isWatching) {
		updateWatchTime(true);
	}

	// Only start tracking if video is playing
	const video = document.querySelector<HTMLVideoElement>('video');
	if (!video || video.paused || video.ended) {
		// Just store creator info but don't start timing yet
		currentCreator = creator;
		currentVideoId = newVideoId;
		isWatching = false;
		return;
	}

	currentCreator = creator;
	currentVideoId = newVideoId;
	watchStartTime = Date.now();
	isWatching = true;
	console.log(
		`[SuperPage] Started tracking watch time for: ${currentCreator} (video: ${currentVideoId})`
	);
};

// Extract channel name from page
const getChannelName = (): string => {
	let channelName: string = '';

	// Try to get from channel link href attribute first (most reliable)
	const channelLink = document.querySelector<HTMLAnchorElement>(
		'a.yt-simple-endpoint.ytd-video-owner-renderer'
	);
	if (channelLink && channelLink.getAttribute('href')) {
		const href: string = channelLink.getAttribute('href') || '';
		// Extract username from /@username format
		if (href.startsWith('/')) {
			channelName = href.substring(2); // Remove the leading /@
		}
	}

	// If not found, try other selectors as fallbacks
	if (!channelName) {
		channelName =
			document
				.querySelector<HTMLAnchorElement>('#text > a')
				?.textContent?.trim() ||
			document
				.querySelector<HTMLAnchorElement>('.ytd-channel-name a')
				?.textContent?.trim() ||
			'';
	}

	return channelName;
};

const injectTipButton = async (): Promise<void> => {
	injectCustomStyles();

	const ownerSection = await waitForElement('#owner');
	if (!ownerSection) return;

	if (document.getElementById('superpage-tip-btn')) return;

	const button = document.createElement('button');
	button.id = 'superpage-tip-btn';
	button.className = 'superpage-btn';

	// Better inner content with SVG icon
	button.innerHTML = `<span class="superpage-btn-icon">💸</span>`;

	button.onclick = (e: MouseEvent) => {
		e.stopPropagation(); // Prevent YouTube click events from interfering

		// Visual feedback on click
		button.style.transform = 'scale(0.95)';
		setTimeout(() => {
			button.style.transform = '';
		}, 100);

		// Get channel name more reliably with multiple fallbacks
		let channelName = getChannelName() || 'this creator';

		console.log('[SuperPage] Opening tip modal for:', channelName);
		createPopup(channelName, 'youtube');
	};

	// Insert button in a better position
	const metaArea = ownerSection.querySelector('#meta') || ownerSection;
	metaArea.appendChild(button);

	// Log for debugging
	console.log('[SuperPage] Tip button injected successfully');

	// Start tracking current creator
	const channelName = getChannelName();
	if (channelName) {
		startWatchTimeTracking(channelName);
	}
};

// Clean up old event listeners before setting up new ones
const cleanupVideoTracking = (): void => {
	// Remove existing event listeners from document
	document.removeEventListener('visibilitychange', handleVisibilityChange);
};

// Handle visibility change separately to allow removal
const handleVisibilityChange = (): void => {
	if (document.hidden && isWatching) {
		updateWatchTime(true);
		// Report engagement when tab is hidden
		reportEngagementToBackend(true);
		console.log(
			`[SuperPage] Tab hidden, paused tracking for: ${currentCreator}`
		);
	} else if (!document.hidden && currentCreator && !isWatching) {
		const videoNow = document.querySelector<HTMLVideoElement>('video');
		if (videoNow && !videoNow.paused && !videoNow.ended) {
			watchStartTime = Date.now();
			isWatching = true;
			console.log(
				`[SuperPage] Tab visible, resumed tracking for: ${currentCreator}`
			);
		}
	}
};

// Track video play/pause state
const setupVideoTracking = (): void => {
	// Clean up any existing listeners first
	cleanupVideoTracking();

	const video = document.querySelector<HTMLVideoElement>('video');
	if (!video) return;

	// Use named functions for event listeners to allow proper cleanup
	const handlePlay = (): void => {
		if (currentCreator) {
			watchStartTime = Date.now();
			isWatching = true;
			console.log(
				`[SuperPage] Started/resumed tracking for: ${currentCreator} (video: ${currentVideoId})`
			);
		}
	};

	const handlePause = (): void => {
		if (isWatching) {
			updateWatchTime(true);
			// Report engagement when video is paused
			reportEngagementToBackend(true);
			console.log(
				`[SuperPage] Paused tracking for: ${currentCreator} (video: ${currentVideoId})`
			);
		}
	};

	const handleEnded = (): void => {
		if (isWatching) {
			updateWatchTime(true);
			// Report engagement when video ends
			reportEngagementToBackend(true);
			console.log(
				`[SuperPage] Ended tracking for: ${currentCreator} (video: ${currentVideoId})`
			);
		}
	};

	// Add event listeners
	video.addEventListener('play', handlePlay);
	video.addEventListener('pause', handlePause);
	video.addEventListener('ended', handleEnded);

	// Handle tab visibility changes
	document.addEventListener('visibilitychange', handleVisibilityChange);

	// Store reference to listeners for cleanup
	video.setAttribute('data-superpage-tracking', 'true');
};

// Function to handle video change
const handleVideoChange = (): void => {
	// End current tracking session
	if (isWatching) {
		updateWatchTime(true);
		// Report engagement when changing videos
		reportEngagementToBackend(true);
	}

	// Reset tracking state
	isWatching = false;

	// Wait for new video page to fully load
	setTimeout(() => {
		// Get updated information
		const newChannelName = getChannelName();
		const newVideoId = getCurrentVideoId();

		// Update our globals
		currentCreator = newChannelName;
		currentVideoId = newVideoId;

		console.log(
			`[SuperPage] New video detected - Creator: ${newChannelName}, Video ID: ${newVideoId}`
		);

		if (newChannelName) {
			// Start tracking for the new creator and video
			startWatchTimeTracking(newChannelName);
		}

		// Re-inject button and setup tracking
		injectTipButton().then(() => {
			setupVideoTracking();
		});
	}, 1500);
};

// Initial injection
injectTipButton().then(() => {
	setupVideoTracking();
});

// Save data and report engagement before user leaves
window.addEventListener('beforeunload', () => {
	if (isWatching) {
		updateWatchTime(true);

		// For page unload, use sendBeacon directly to the API
		const sourceUrl = window.location.href;
		const engagedTime = Math.floor(watchTimeData[currentCreator] || 0);

		if (engagedTime >= 5) {
			navigator.sendBeacon(
				`${API_URL}/engagements`,
				JSON.stringify({
					creatorUsername: currentCreator,
					sourceUrl: sourceUrl,
					engagedTime: engagedTime,
					platform: 'youtube',
					videoId: currentVideoId,
					timestamp: new Date().toISOString(),
				})
			);
			console.log(
				`[SuperPage] Final engagement sent via beacon: ${engagedTime}s`
			);
		}
	}

	// Clean up observers to prevent memory leaks
	if (urlObserver) urlObserver.disconnect();
	if (domObserver) domObserver.disconnect();
});

// Setup more efficient URL change detection
const listenForURLChanges = (): void => {
	let lastUrl = location.href;

	// Clean up previous observer if it exists
	if (urlObserver) urlObserver.disconnect();

	urlObserver = new MutationObserver(() => {
		if (location.href !== lastUrl) {
			lastUrl = location.href;
			if (document.location.pathname.includes('/watch')) {
				console.log('[SuperPage] URL changed, updating tracking');
				handleVideoChange();
			}
		}
	});

	// Use more specific targeting to reduce overhead
	urlObserver.observe(document.querySelector('head > title') || document.body, {
		subtree: true,
		childList: true,
	});
};

// More efficient DOM observer for YouTube's SPA
const listenForDOMChanges = (): void => {
	// Clean up previous observer if it exists
	if (domObserver) domObserver.disconnect();

	domObserver = new MutationObserver((mutations: MutationRecord[]) => {
		// Only process if we're on a watch page
		if (!document.location.pathname.includes('/watch')) return;

		// Check if the mutations include changes to the video player area
		for (const mutation of mutations) {
			const target = mutation.target as HTMLElement;
			if (
				target &&
				(target.id === 'movie_player' ||
					target.id === 'primary-inner' ||
					target.id === 'container')
			) {
				// Get current video ID
				const videoId = getCurrentVideoId();

				// Only update if video ID changed or we don't have creator info
				if (videoId !== currentVideoId || !currentCreator) {
					console.log('[SuperPage] Detected player/content changes');
					handleVideoChange();
					break;
				}
			}
		}
	});

	// Target only relevant parts of the DOM
	const target = document.querySelector('#primary') || document.body;
	domObserver.observe(target, { childList: true, subtree: true });
};

// Initialize observers
listenForURLChanges();
listenForDOMChanges();

// Replace interval with less frequent updates to reduce overhead
let updateInterval = setInterval(() => {
	if (isWatching) {
		updateWatchTime();
		reportEngagementToBackend();
	}
}, 60000); // Increase from 30s to 60s

// Clean up on unload and report final engagement
window.addEventListener('unload', () => {
	if (isWatching) {
		updateWatchTime(true);
		// Use sendBeacon for unload as fetch may not complete
		const sourceUrl = window.location.href;
		const engagedTime = Math.floor(watchTimeData[currentCreator] || 0);

		if (engagedTime >= 5) {
			navigator.sendBeacon(
				`${API_URL}/engagements`,
				JSON.stringify({
					creatorUsername: currentCreator,
					sourceUrl: sourceUrl,
					engagedTime: engagedTime,
				})
			);
		}
	}

	clearInterval(updateInterval);
	if (urlObserver) urlObserver.disconnect();
	if (domObserver) domObserver.disconnect();
});
