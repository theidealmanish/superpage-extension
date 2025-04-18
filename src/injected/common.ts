export function injectCustomStyles(): void {
	const id = 'superpage-custom-styles';
	if (document.getElementById(id)) return;

	const style = document.createElement('style');
	style.id = id;
	style.textContent = `
        .superpage-btn {
            background: linear-gradient(to right, #8b5cf6, #6366f1);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 500;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            transition: all 0.2s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            border: none;
            cursor: pointer;
            margin-left: 8px;
            position: relative;
            overflow: hidden;
        }
        
        .superpage-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            background: linear-gradient(to right, #7c3aed, #4f46e5);
        }
        
        .superpage-btn:active {
            transform: translateY(1px);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .superpage-btn-icon {
            margin-right: 6px;
            display: inline-block;
        }
        
        .superpage-btn .superpage-tooltip {
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
        }
        
        .superpage-btn:hover .superpage-tooltip {
            opacity: 1;
            bottom: -25px;
        }
        
        .superpage-logo-pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(0.95); }
            50% { transform: scale(1.05); }
            100% { transform: scale(0.95); }
			}
			`;
	document.head.appendChild(style);
}

export function injectPhantomBridge(): void {
	const id = 'phantom-bridge-script';
	if (document.getElementById(id)) return;

	const script = document.createElement('script');
	script.id = id;
	script.src = chrome.runtime.getURL('phantomBridge.js');
	script.type = 'module';
	(document.head || document.documentElement).appendChild(script);
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
