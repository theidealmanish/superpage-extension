import { createPopup } from '@/components/PaymentModal';
import { waitForElement, injectWalletBridge } from '@/injected/common';

injectWalletBridge();

function injectCustomStyles(): void {
	const id = 'superpage-custom-styles';
	if (document.getElementById(id)) return;

	const style = document.createElement('style');
	style.id = id;
	style.textContent = `
    .superpage-btn {
      background: linear-gradient(to right, #8b5cf6, #6366f1);
      color: white;
      padding: 10px;
      border-radius: 50%;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      border: none;
      cursor: pointer;
      margin-left: 12px;
      position: relative;
      width: 36px;
      height: 36px;
      overflow: visible;
    }
    
    .superpage-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(139, 92, 246, 0.3);
      background: linear-gradient(to right, #7c3aed, #4f46e5);
    }
    
    .superpage-btn:active {
      transform: translateY(1px) scale(0.95);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.1s;
    }
    
    .superpage-btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));
    }
    
    .superpage-tooltip {
      position: absolute;
      background: #1e293b;
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      bottom: -36px;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
      pointer-events: none;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999;
    }
    
    .superpage-tooltip:after {
      content: '';
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 0 6px 6px 6px;
      border-style: solid;
      border-color: transparent transparent #1e293b transparent;
    }
    
    .superpage-btn:hover .superpage-tooltip {
      opacity: 1;
      visibility: visible;
      bottom: -40px;
    }
    
    .superpage-pulse {
      animation: superpage-pulse 2s infinite;
    }
    
    @keyframes superpage-pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    /* Enhanced mobile support */
    @media (max-width: 640px) {
      .superpage-btn {
        padding: 8px;
        width: 32px;
        height: 32px;
        margin-left: 8px;
      }
      
      .superpage-btn-icon {
        font-size: 16px;
      }
      
      .superpage-tooltip {
        display: none;
      }
    }
  `;
	document.head.appendChild(style);
}

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
