// suiBridge.ts
import { getWallets } from '@mysten/wallet-standard';
import {
	WalletAccount,
	StandardConnectFeature,
	SuiSignAndExecuteTransactionFeature,
	Wallet,
} from '@mysten/wallet-standard';
import { Transaction } from '@mysten/sui/transactions';

interface SuiWalletWithFeatures extends Wallet {
	name: string;
	accounts: WalletAccount[];
	features: {
		'standard:connect': StandardConnectFeature;
		'sui:signAndExecuteTransaction': SuiSignAndExecuteTransactionFeature;
	};
}

(async () => {
	console.log('[SuperPay] Sui wallet bridge loaded');

	// Check for wallet availability
	const wallets = getWallets().get();
	console.log(wallets);
	const suiWallet = wallets.find((w) => w.name === 'Sui Wallet');

	if (!suiWallet) {
		console.warn('[SuperPay] Sui Wallet not found');
		return;
	}

	window.addEventListener('message', async (event) => {
		if (event.data?.type === 'SUPERPAGE_TIP_SUI') {
			const recipient = event.data.recipient;
			const amount = parseFloat(event.data.amount);
			const mist = Math.floor(amount * 1_000_000_000);
			const message = event.data.message || 'SuperPay Tip';

			console.log(`[SuperPay] Sending ${mist} mist to ${recipient}`);

			try {
				const typedWallet = suiWallet as SuiWalletWithFeatures;

				// Connect to the wallet
				// @ts-ignore
				await typedWallet.features['standard:connect'].connect({
					chain: 'sui:testnet',
				});

				const senderAccount = typedWallet.accounts[0];

				// Create transaction
				const tx = new Transaction();
				const txAny = tx as any;

				// Add message if supported
				// Note: This would need to be implemented based on SUI's memo capability
				// For now we're just logging it
				console.log(`[SuperPay] Message: ${message}`);

				// Setup the transfer
				const [coin] = txAny.splitCoins(txAny.gas, [mist]);
				txAny.transferObjects([coin], recipient);

				// Sign and send transaction
				const result = await typedWallet.features[
					'sui:signAndExecuteTransaction'
					// @ts-ignore
				].signAndExecuteTransaction({
					account: senderAccount,
					chain: 'sui:testnet',
					transaction: txAny,
				});

				console.log('[SuperPay] Transaction sent:', result.digest);

				// Notify the application about successful transaction
				window.postMessage(
					{ type: 'SUPERPAGE_TIP_RESULT', success: true, tx: result.digest },
					'*'
				);
			} catch (err: any) {
				console.error('[SuperPay] SUI Tip failed:', err.message);
				window.postMessage(
					{
						type: 'SUPERPAGE_TIP_RESULT',
						success: false,
						error: err.message,
					},
					'*'
				);
			}
		}
	});
})();
