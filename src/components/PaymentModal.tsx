import {
	encodeURL,
	createQR,
	findReference,
	validateTransfer,
} from '@solana/pay';

import { PublicKey, Connection, clusterApiUrl, Keypair } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { Buffer } from 'buffer';
import getRecipientAddress from '@/lib/getRecipientAddress';

// Make sure Buffer is available globally
if (typeof window !== 'undefined') {
	window.Buffer = Buffer;
}

// Solana connection for devnet or mainnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export const createPopup = async (username: string, platform: string) => {
	if (document.getElementById('superpage-popup')) return;
	console.log(`[SuperPay] Opening tip modal for ${username}`);

	let recipient;
	console.log('Fetching recipient address for', username, platform);
	try {
		const data: any = await getRecipientAddress(username, platform);
		console.log('Recipient data:', data.wallets);
		recipient = data.wallets['sui'];
		console.log('Recipient wallet:', recipient);
	} catch (error) {
		console.error('Error fetching recipient address:', error);
		showToast('This user is not registered on SuperPage.', 'error');
		return;
	}

	const backdrop = document.createElement('div');
	backdrop.id = 'superpage-backdrop';
	backdrop.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
            backdrop-filter: blur(4px);
        `;
	document.body.appendChild(backdrop);

	const popup = document.createElement('div');
	popup.id = 'superpage-popup';
	popup.style.cssText = `
            position: fixed;
            top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white;
            border-radius: 12px;
            padding: 24px;
            z-index: 9999;
            width: 360px;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
            animation: fade-in 0.3s ease;
        `;
	popup.innerHTML = `
    <style>
        @keyframes fade-in {
            0% { opacity: 0 !important; transform: translate(-50%, -60%) scale(0.95) !important; }
            100% { opacity: 1 !important; transform: translate(-50%, -50%) scale(1) !important; }
        }
        #superpage-popup .super-btn {
            padding: 12px !important;
            border-radius: 8px !important;
            font-weight: bold !important;
            border: none !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 6px !important;
            width: 100% !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
        }
        #superpage-popup .super-btn.primary {
            background: linear-gradient(to right, #8b5cf6, #6366f1) !important;
            color: white !important;
        }
        #superpage-popup .super-btn.secondary {
            border: 1px solid #ccc !important;
            background: #fff !important;
            color: #333 !important;
        }
        #superpage-popup select {
            width: 100% !important;
            padding: 10px 12px !important;
            border: 1px solid #ccc !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
            color: #333 !important;
            background-color: white !important;
            appearance: none !important;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E") !important;
            background-repeat: no-repeat !important;
            background-position: right 12px center !important;
            cursor: pointer !important;
        }
        #superpage-popup select:focus {
            outline: none !important;
            border-color: #8b5cf6 !important;
            box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
        }
        #superpage-popup .network-icon {
            width: 18px !important;
            height: 18px !important;
            margin-right: 8px !important;
            vertical-align: middle !important;
        }
        @keyframes spin {
            0% { transform: rotate(0deg) !important; }
            100% { transform: rotate(360deg) !important; }
        }
        #superpage-popup .animate-spin {
            animation: spin 1s linear infinite !important;
        }
        #superpage-popup .solscan-link {
            display: block !important;
            background-color: #10B981 !important;
            color: white !important;
            padding: 8px 16px !important;
            border-radius: 8px !important;
            text-decoration: none !important;
            text-align: center !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-top: 8px !important;
            transition: background-color 0.2s !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
            font-size: 14px !important;
        }
        #superpage-popup .solscan-link:hover {
            background-color: #059669 !important;
        }
        #superpage-popup .payment-text {
            color: #10B981 !important;
            font-weight: 500 !important;
            margin-bottom: 8px !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
        }
        #superpage-popup .payment-status {
            font-size: 14px !important;
            text-align: center !important;
            color: #666 !important;
            margin-top: 12px !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
        }
        @keyframes pulse {
            0% { opacity: 0.6 !important; }
            50% { opacity: 1 !important; }
            100% { opacity: 0.6 !important; }
        }
        #superpage-popup .pulse-animation {
            animation: pulse 2s infinite !important;
        }
        #superpage-popup * {
            box-sizing: border-box !important;
        }
        #superpage-popup textarea {
            resize: none !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
        }
        #superpage-popup .form-group {
            margin-bottom: 16px !important;
        }
        #superpage-popup label {
            font-size: 14px !important;
            color: #444 !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
            display: block !important;
            margin-bottom: 6px !important;
        }
    </style>
    <div style="display:flex !important;justify-content:space-between !important;align-items:center !important;margin-bottom:16px !important">
        <div style="display:flex !important;align-items:center !important;gap:8px !important">
            <div style="background:#8b5cf6 !important;color:#fff !important;border-radius:50% !important;width:32px !important;height:32px !important;display:flex !important;align-items:center !important;justify-content:center !important">💸</div>
            <h3 style="margin:0 !important;font-size:18px !important;font-weight:600 !important;color:#000 !important;font-family:system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;">SuperPage</h3>
        </div>
        <button id="superpage-close" style="background:none !important;border:none !important;color:#999 !important;font-size:18px !important;cursor:pointer !important;padding:0 !important;">✕</button>
    </div>
    <div>
        <p style="text-align:center !important;color:#666 !important;margin-bottom:16px !important;font-family:system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;font-size:14px !important;">Send a tip to <strong style="color:#8b5cf6 !important;">${username}</strong></p>
        
        <div class="form-group">
            <label for="superpage-network">Network</label>
            <select id="superpage-network">
				<option value="sui" selected>
					SUI Network (SUI)
				</option>
                <option value="solana">
                    Solana (SOL)
                </option>
                <option value="stellar">
                    Stellar (XLM)
                </option>
                <option value="ethereum">
                    Pharos (ETH)
                </option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="superpage-amount">Amount</label>
            <div style="position:relative !important;margin-top:4px !important;">
                <input id="superpage-amount" type="number" min="0.001" step="0.001" placeholder="0.05"
                    style="width:100% !important;padding:10px 40px 10px 12px !important;border:1px solid #ccc !important;border-radius:8px !important;font-size:14px !important;font-family:system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;color:#333 !important;background-color:white !important;">
                <span id="currency-label" style="position:absolute !important;right:12px !important;top:50% !important;transform:translateY(-50%) !important;color:#999 !important;font-size:14px !important;font-family:system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;pointer-events:none !important;">SOL</span>
            </div>
        </div>
        
        <div class="form-group">
            <label for="superpage-message">Message (optional)</label>
            <div>
                <textarea id="superpage-message" placeholder="Add a personal message..." rows="2"
                    style="width:100% !important;padding:10px 12px !important;border:1px solid #ccc !important;border-radius:8px !important;font-size:14px !important;font-family:system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;color:#333 !important;background-color:white !important;"></textarea>
            </div>
        </div>
    </div>
    <div style="display:flex !important;flex-direction:column !important;gap:12px !important" id="buttons-container">
        <button id="superpage-use-extension" class="super-btn primary">
            <span>Pay with Wallet Extension</span>
        </button>
        <button id="superpage-send" class="super-btn secondary">
            <span>Generate QR Code</span>
        </button>
    </div>
    <div id="qr-code" style="display:none !important;flex-direction:column !important;align-items:center !important;margin-top:24px !important">
        <div id="qr-img" style="background-color:white !important;"></div>
        <p style="font-size:12px !important;color:#888 !important;margin-top:8px !important;font-family:system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;text-align:center !important;">Scan with a compatible wallet</p>
    </div>
`;
	document.body.appendChild(popup);

	document.getElementById('superpage-close')?.addEventListener('click', () => {
		document.getElementById('superpage-backdrop')?.remove();
		popup.remove();
	});
	backdrop.addEventListener('click', () => {
		document.getElementById('superpage-backdrop')?.remove();
		popup.remove();
	});

	// Handle currency label update based on selected network
	const networkSelector = document.getElementById(
		'superpage-network'
	) as HTMLSelectElement;
	const currencyLabel = document.getElementById('currency-label');
	const extensionButton = document.getElementById('superpage-use-extension');

	// Initialize based on default selection
	updateInterfaceForNetwork('sui');

	if (networkSelector) {
		networkSelector.addEventListener('change', () => {
			const selectedNetwork = networkSelector.value;
			updateInterfaceForNetwork(selectedNetwork);
		});
	}

	function updateInterfaceForNetwork(network: string) {
		if (currencyLabel) {
			switch (network) {
				case 'solana':
					currencyLabel.textContent = 'SOL';
					break;
				case 'sui':
					currencyLabel.textContent = 'SUI';
					break;
				case 'stellar':
					currencyLabel.textContent = 'XLM';
					break;
				case 'ethereum':
					currencyLabel.textContent = 'ETH';
					break;
				default:
					currencyLabel.textContent = 'SOL';
			}
		}

		// Update wallet button text based on network
		if (extensionButton) {
			let walletName = 'Wallet';
			switch (network) {
				case 'sui':
					walletName = 'Sui Wallet';
					break;
				case 'solana':
					walletName = 'Phantom';
					break;
				case 'stellar':
					walletName = 'Stellar Wallet';
					break;
				case 'ethereum':
					walletName = 'Metamask Wallet';
					break;
			}
			extensionButton.innerHTML = `<span>Pay with ${walletName}</span>`;
		}
	}

	// Update the phantom extension click handler to include the message and network
	document
		.getElementById('superpage-use-extension')
		?.addEventListener('click', () => {
			const amountStr = (
				document.getElementById('superpage-amount') as HTMLInputElement
			).value;
			const amount = parseFloat(amountStr);
			if (!amount || amount < 0.001) {
				// Create toast notification instead of alert
				showToast('Please enter a valid amount (minimum 0.001)');
				return;
			}

			// Get the user's message
			const messageText = (
				document.getElementById('superpage-message') as HTMLTextAreaElement
			).value.trim();

			// Get selected network
			const selectedNetwork = (
				document.getElementById('superpage-network') as HTMLSelectElement
			).value;

			// Add transaction processing UI
			const btnElement = document.getElementById('superpage-use-extension');
			if (btnElement) {
				btnElement.innerHTML = `
            <svg class="animate-spin" style="width: 20px !important; height: 20px !important; margin-right: 8px !important;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style="opacity: 0.25 !important;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path style="opacity: 0.75 !important;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
        `;
				btnElement.setAttribute('disabled', 'true');
				btnElement.style.cssText +=
					'opacity: 0.75 !important; cursor: not-allowed !important;';
			}

			// Setup message listener for transaction result
			const transactionListener = (event: MessageEvent) => {
				if (event.data?.type === 'SUPERPAGE_TIP_RESULT') {
					window.removeEventListener('message', transactionListener);

					// TODO: Transaction was successful
					if (event.data.success) {
						const txid = event.data.tx;

						// Get appropriate explorer URL based on network
						let explorerUrl = '';
						switch (selectedNetwork) {
							case 'solana':
								explorerUrl = `https://solscan.io/tx/${txid}?cluster=devnet`;
								break;
							case 'sui':
								explorerUrl = `https://testnet.suivision.xyz/txblock/${txid}`;
								break;
							case 'stellar':
								explorerUrl = `https://stellar.expert/explorer/public/tx/${txid}`;
								break;
							case 'ethereum':
								explorerUrl = `https://pharosscan.xyz/tx/${txid}`;
								break;
							default:
								explorerUrl = `https://solscan.io/tx/${txid}?cluster=devnet`;
						}

						// fetch('http://localhost:8000/transactions', {
						// 	method: 'POST',
						// 	headers: {
						// 		'Content-Type': 'application/json',
						// 	},
						// 	body: JSON.stringify({
						// 		to: user!._id,
						// 		amount: amount,
						// 		network: selectedNetwork,
						// 		message: messageText,
						// 	}),
						// })
						// 	.then(async (res) => {
						// 		if (!res.ok) {
						// 			const errorData = await res.json();
						// 			throw new Error(errorData.message || 'Request failed');
						// 		}
						// 		return res.json();
						// 	})
						// 	.then((data) => {
						// 		console.log('[SuperPay] Transaction recorded:', data);
						// 	})
						// 	.catch((error) => {
						// 		console.error(
						// 			'[SuperPay] Error submitting transaction:',
						// 			error.message
						// 		);
						// 	});

						// Create a success message with explorer link
						const statusContainer = document.createElement('div');
						statusContainer.style.cssText =
							'margin-top: 24px !important; text-align: center !important;';
						statusContainer.innerHTML = `
                    <div class="payment-text">Payment successful! ✓</div>
                    <a href="${explorerUrl}" target="_blank" class="solscan-link">
                        <span>View transaction</span>
                        <svg xmlns="http://www.w3.org/2000/svg" style="height: 16px !important; width: 16px !important; margin-left: 4px !important;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                `;

						// Insert the success message below the buttons
						const buttonsContainer =
							document.getElementById('buttons-container');
						if (buttonsContainer) {
							buttonsContainer.parentNode?.insertBefore(
								statusContainer,
								buttonsContainer.nextSibling
							);
						}

						// Reset button state but keep it disabled
						if (btnElement) {
							btnElement.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" style="height: 20px !important; width: 20px !important; margin-right: 8px !important;" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
                        </svg>
                        Payment Completed
                    `;
						}

						showToast('Payment confirmed! Thank you.', 'success');

						// Keep the modal open for 5 seconds to allow clicking the Solscan link
						setTimeout(() => {
							document.getElementById('superpage-backdrop')?.remove();
							popup.remove();
						}, 5000);
					} else {
						// Transaction failed
						showToast(
							`Transaction failed: ${event.data.error || 'Unknown error'}`,
							'error'
						);

						// Reset button state
						if (btnElement) {
							// Get wallet name based on network
							let walletName = 'Wallet';
							switch (selectedNetwork) {
								case 'sui':
									walletName = 'Sui Wallet';
									break;
								case 'solana':
									walletName = 'Phantom';
									break;
								case 'stellar':
									walletName = 'Stellar Wallet';
									break;
								case 'ethereum':
									walletName = 'Metamask Wallet';
									break;
							}

							btnElement.innerHTML = `<span>Pay with ${walletName}</span>`;
							btnElement.removeAttribute('disabled');
							btnElement.style.opacity = '';
							btnElement.style.cursor = '';
						}
					}
				}
			};

			// Add the event listener before sending the message
			window.addEventListener('message', transactionListener);

			// Send the message to the injected script with the optional message and network
			window.postMessage(
				{
					type: `SUPERPAGE_TIP_${networkSelector.value.toUpperCase()}`,
					recipient,
					amount,
					message: messageText || undefined,
					network: selectedNetwork,
				},
				'*'
			);
		});

	// Update the QR code generation part in the event listener
	// document
	// 	.getElementById('superpage-send')
	// 	?.addEventListener('click', async () => {
	// 		const amountStr = (
	// 			document.getElementById('superpage-amount') as HTMLInputElement
	// 		).value;
	// 		const amount = parseFloat(amountStr);
	// 		if (!amount || amount < 0.001) {
	// 			showToast('Please enter a valid amount (minimum 0.001)');
	// 			return;
	// 		}

	// 		// Get the user's message
	// 		const messageText = (
	// 			document.getElementById('superpage-message') as HTMLTextAreaElement
	// 		).value.trim();
	// 		const finalMessage = messageText
	// 			? `${messageText}`
	// 			: `Tip to ${username}`;

	// 		// Get selected network
	// 		const selectedNetwork = (
	// 			document.getElementById('superpage-network') as HTMLSelectElement
	// 		).value;

	// 		try {
	// 			// Generate a unique reference for this payment
	// 			const reference = Keypair.generate().publicKey;

	// 			// First get the recipient address data
	// 			let recipientPubkey;
	// 			try {
	// 				const data = await getRecipientAddress(username, platform);
	// 				console.log('Recipient data:', data);
	// 				if (!data?.data?.user?.walletAddress) {
	// 					throw new Error('No wallet address found');
	// 				}
	// 				recipientPubkey = new PublicKey(data.data.user.walletAddress);
	// 			} catch (error) {
	// 				console.error('Error fetching recipient address:', error);
	// 				showToast('This user is not registered on SuperPage.', 'error');
	// 				return;
	// 			}

	// 			// Now create the URL with the valid recipient address
	// 			const url = encodeURL({
	// 				recipient: recipientPubkey,
	// 				amount: new BigNumber(amount),
	// 				reference,
	// 				label: `SuperPage ${selectedNetwork.toUpperCase()} Tip`,
	// 				message: finalMessage,
	// 				memo: `SuperPage-${selectedNetwork}`,
	// 			});

	// 			// Get the QR code container ready
	// 			const qrContainer = document.getElementById('qr-code') as HTMLElement;
	// 			qrContainer.style.display = 'flex';
	// 			qrContainer.style.flexDirection = 'column';
	// 			qrContainer.style.alignItems = 'center';
	// 			qrContainer.style.marginTop = '24px';
	// 			qrContainer.innerHTML = ''; // Clear any existing content

	// 			// Create QR code
	// 			const qr = createQR(url, 256);
	// 			const qrDiv = document.createElement('div');
	// 			qrDiv.id = 'qr-img';
	// 			qrContainer.appendChild(qrDiv);
	// 			qr.append(qrDiv);

	// 			// Add status message
	// 			const statusMsg = document.createElement('div');
	// 			statusMsg.id = 'payment-status';
	// 			statusMsg.className = 'payment-status pulse-animation';
	// 			statusMsg.textContent = 'Waiting for payment...';
	// 			qrContainer.appendChild(statusMsg);

	// 			// Begin polling for transaction
	// 			pollForTransaction(
	// 				reference,
	// 				recipientPubkey,
	// 				amount,
	// 				popup,
	// 				selectedNetwork
	// 			).then(() => {
	// 				fetch('http://localhost:8000/api/transactions', {
	// 					method: 'POST',
	// 					headers: {
	// 						'Content-Type': 'application/json',
	// 					},
	// 					body: JSON.stringify({
	// 						to: user!._id,
	// 						amount: amount,
	// 						message: messageText,
	// 						network: selectedNetwork,
	// 					}),
	// 				})
	// 					.then(async (res) => {
	// 						if (!res.ok) {
	// 							const errorData = await res.json();
	// 							throw new Error(errorData.message || 'Request failed');
	// 						}
	// 						return res.json();
	// 					})
	// 					.then((data) => {
	// 						console.log('[SuperPay] Transaction recorded:', data);
	// 					})
	// 					.catch((error) => {
	// 						console.error(
	// 							'[SuperPay] Error submitting transaction:',
	// 							error.message
	// 						);
	// 					});
	// 			});
	// 		} catch (error) {
	// 			console.error('[SuperPay] QR generation error:', error);
	// 			showToast('Error generating QR code. Please try again.', 'error');
	// 		}
	// 	});
};

// Function to poll for transaction completion with network support
// async function pollForTransaction(
// 	reference: PublicKey,
// 	recipient: PublicKey,
// 	amount: number,
// 	popupElement: HTMLElement,
// 	network: string = 'solana'
// ) {
// 	const statusElement = document.getElementById('payment-status');
// 	let paymentComplete = false;

// 	const interval = setInterval(async () => {
// 		try {
// 			if (statusElement) {
// 				statusElement.textContent = 'Checking for payment...';
// 			}

// 			const signatureInfo = await findReference(connection, reference, {
// 				finality: 'confirmed',
// 			});

// 			if (signatureInfo) {
// 				await validateTransfer(connection, signatureInfo.signature, {
// 					recipient,
// 					amount: new BigNumber(amount),
// 					reference,
// 				});

// 				paymentComplete = true;
// 				clearInterval(interval);

// 				if (statusElement) {
// 					// Get appropriate explorer URL based on network
// 					let explorerLabel = '';
// 					let explorerUrl = '';

// 					switch (network) {
// 						case 'solana':
// 							explorerUrl = `https://solscan.io/tx/${signatureInfo.signature}?cluster=devnet`;
// 							explorerLabel = 'View on Solscan';
// 							break;
// 						case 'sui':
// 							explorerUrl = `https://explorer.sui.io/txblock/${signatureInfo.signature}?network=devnet`;
// 							explorerLabel = 'View on Sui Explorer';
// 							break;
// 						case 'stellar':
// 							explorerUrl = `https://stellar.expert/explorer/public/tx/${signatureInfo.signature}`;
// 							explorerLabel = 'View on Stellar Expert';
// 							break;
// 						case 'ethereum':
// 							explorerUrl = `https://pharosscan.com/tx/${signatureInfo.signature}`;
// 							explorerLabel = 'View on Pharos Explorer';
// 							break;
// 						default:
// 							explorerUrl = `https://solscan.io/tx/${signatureInfo.signature}?cluster=devnet`;
// 							explorerLabel = 'View on Explorer';
// 					}

// 					// Stop any animations
// 					statusElement.style.animation = 'none';

// 					// Update the status element with a clickable success button
// 					statusElement.innerHTML = `
//                         <div style="color: #10B981; font-weight: 500; margin-bottom: 8px;">Payment successful! ✓</div>
//                         <a href="${explorerUrl}" target="_blank" class="solscan-link">
//                             <span>${explorerLabel}</span>
//                             <svg xmlns="http://www.w3.org/2000/svg" style="height: 16px; width: 16px; margin-left: 4px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//                             </svg>
//                         </a>
//                     `;
// 				}

// 				showToast('Payment confirmed! Thank you.', 'success');

// 				// Keep the modal open for 5 seconds to allow clicking the explorer link
// 				setTimeout(() => {
// 					document.getElementById('superpage-backdrop')?.remove();
// 					popupElement.remove();
// 				}, 5000);
// 			}
// 		} catch (error: any) {
// 			if (
// 				error.name !== 'ReferenceNotFoundError' &&
// 				error.name !== 'TransactionNotConfirmedError'
// 			) {
// 				console.error('[SuperPay] Poll error:', error);
// 			}
// 			if (statusElement && !paymentComplete) {
// 				statusElement.textContent = 'Waiting for payment...';
// 			}
// 		}
// 	}, 3000);

// 	// Set timeout for payment window
// 	setTimeout(() => {
// 		if (!paymentComplete) {
// 			clearInterval(interval);
// 			if (statusElement) {
// 				statusElement.style.animation = 'none';
// 				statusElement.style.color = '#F97316';
// 				statusElement.textContent = 'Payment window expired. Try again.';
// 			}
// 		}
// 	}, 5 * 60 * 1000); // 5 minutes timeout
// }

// Toast notification function with fixed animation
function showToast(
	message: string,
	type: 'error' | 'success' | 'info' = 'error'
) {
	// Remove existing toast if any
	const existingToast = document.getElementById('superpage-toast');
	if (existingToast) existingToast.remove();

	const toast = document.createElement('div');
	toast.id = 'superpage-toast';

	// Set icon based on type
	let icon = `<svg style="width: 20px; height: 20px; margin-right: 8px;" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`;

	if (type === 'success') {
		icon = `<svg style="width: 20px; height: 20px; margin-right: 8px;" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`;
	} else if (type === 'info') {
		icon = `<svg style="width: 20px; height: 20px; margin-right: 8px;" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clip-rule="evenodd"></path></svg>`;
	}

	// Use direct style setting instead of classes for the animation
	toast.style.position = 'fixed';
	toast.style.bottom = '16px';
	toast.style.right = '16px';
	toast.style.zIndex = '10000';
	toast.style.display = 'flex';
	toast.style.alignItems = 'center';
	toast.style.padding = '12px 16px';
	toast.style.borderRadius = '8px';
	toast.style.color = 'white';
	toast.style.fontSize = '16px';
	toast.style.boxShadow =
		'0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
	toast.style.opacity = '0';
	toast.style.transform = 'translateY(20px)';

	// Set color based on type
	toast.style.backgroundColor =
		type === 'success' ? '#10B981' : type === 'info' ? '#3B82F6' : '#EF4444';

	toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;

	document.body.appendChild(toast);

	// Force reflow to ensure the initial CSS state is applied
	void toast.offsetWidth;

	// Start the animation after a tiny delay
	setTimeout(() => {
		toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
		toast.style.opacity = '1';
		toast.style.transform = 'translateY(0)';
	}, 10);

	// Remove toast after 3 seconds with animation
	setTimeout(() => {
		toast.style.opacity = '0';
		toast.style.transform = 'translateY(20px)';

		// Remove the element after the animation completes
		setTimeout(() => toast.remove(), 300);
	}, 3000);
}
