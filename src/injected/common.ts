export function injectCustomStyles(): void {
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

export function injectWalletBridge(): void {
	// Inject Solana bridge
	const solanaId = 'solana-bridge-script';
	if (!document.getElementById(solanaId)) {
		const solanaScript = document.createElement('script');
		solanaScript.id = solanaId;
		solanaScript.src = chrome.runtime.getURL('solanaBridge.js');
		solanaScript.type = 'module';
		(document.head || document.documentElement).appendChild(solanaScript);
	}

	// Inject SUI bridge
	const suiId = 'sui-bridge-script';
	if (!document.getElementById(suiId)) {
		const suiScript = document.createElement('script');
		suiScript.id = suiId;
		suiScript.src = chrome.runtime.getURL('suiBridge.js');
		suiScript.type = 'module';
		(document.head || document.documentElement).appendChild(suiScript);
	}

	// Inject ETH bridge
	const ethId = 'eth-bridge-script';
	if (!document.getElementById(ethId)) {
		const ethScript = document.createElement('script');
		ethScript.id = ethId;
		ethScript.src = chrome.runtime.getURL('ethereumBridge.js');
		ethScript.type = 'module';
		(document.head || document.documentElement).appendChild(ethScript);
	}
}

export function waitForElement(
	selector: string,
	timeout = 5000
): Promise<Element | null> {
	return new Promise((resolve) => {
		const existingElement = document.querySelector(selector);
		if (existingElement) {
			resolve(existingElement);
			return;
		}

		const interval = setInterval(() => {
			const el = document.querySelector(selector);
			if (el) {
				clearInterval(interval);
				resolve(el);
			}
		}, 500);

		setTimeout(() => {
			clearInterval(interval);
			resolve(null);
		}, timeout);
	});
}
