// Ethereum bridge using MetaMask and Pharos RPC

interface EthereumProvider {
	request: (args: { method: string; params?: any[] }) => Promise<any>;
	isMetaMask?: boolean;
}

declare global {
	interface Window {
		ethereum?: EthereumProvider;
	}
}

// Network configuration type
interface NetworkConfig {
	chainId: string;
	chainName: string;
	nativeCurrency: {
		name: string;
		symbol: string;
		decimals: number;
	};
	rpcUrls: string[];
	blockExplorerUrls: string[];
}

(async () => {
	console.log('[SuperPay] Pharos wallet bridge loaded');

	const ethereum = window.ethereum;
	if (!ethereum) {
		console.warn('[SuperPay] MetaMask not found');
		return;
	}

	window.addEventListener('message', async (event: MessageEvent) => {
		if (event.data?.type !== 'SUPERPAGE_TIP_ETHEREUM') return;

		const { recipient, amount, message } = event.data;
		const ethAmount = amount.toString(); // ETH as string

		console.log(
			`[SuperPay] Sending ${ethAmount} ETH to ${recipient} on Pharos Network`
		);

		try {
			// Define Pharos network configuration
			const pharosNetwork: NetworkConfig = {
				chainId: '0xC352',
				chainName: 'Pharos Ethereum',
				nativeCurrency: {
					name: 'Ether',
					symbol: 'ETH',
					decimals: 18,
				},
				rpcUrls: ['https://devnet.dplabs-internal.com'],
				blockExplorerUrls: ['https://pharosscan.xyz/'],
			};

			// First try to switch to Pharos network
			try {
				await ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: pharosNetwork.chainId }],
				});
			} catch (switchError: any) {
				// This error code indicates the chain hasn't been added to MetaMask
				if (switchError.code === 4902) {
					// Add the Pharos network if it doesn't exist
					await ethereum.request({
						method: 'wallet_addEthereumChain',
						params: [pharosNetwork],
					});
				} else {
					throw switchError;
				}
			}

			// Request accounts access
			await ethereum.request({ method: 'eth_requestAccounts' });
			const accounts: string[] = await ethereum.request({
				method: 'eth_accounts',
			});

			if (!accounts || accounts.length === 0) {
				throw new Error('No connected MetaMask accounts');
			}

			const sender = accounts[0];
			const valueHex = `0x${BigInt(amount * 1e18).toString(16)}`;
			const dataHex = message
				? `0x${Buffer.from(message, 'utf-8').toString('hex')}`
				: undefined;

			const txParams = {
				from: sender,
				to: recipient,
				value: valueHex,
				data: dataHex,
			};

			const txHash: string = await ethereum.request({
				method: 'eth_sendTransaction',
				params: [txParams],
			});

			console.log(`[SuperPay] Pharos transaction sent:`, txHash);

			// Get the explorer URL
			const explorerBaseUrl = pharosNetwork.blockExplorerUrls[0] || '';
			const explorerUrl = explorerBaseUrl
				? `${explorerBaseUrl}${
						explorerBaseUrl.endsWith('/') ? 'tx/' : '/tx/'
				  }${txHash}`
				: '';

			window.postMessage(
				{
					type: 'SUPERPAGE_TIP_RESULT',
					success: true,
					tx: txHash,
					network: 'pharos',
					explorerUrl,
				},
				'*'
			);
		} catch (err: any) {
			console.error(`[SuperPay] Pharos Tip failed:`, err);
			window.postMessage(
				{
					type: 'SUPERPAGE_TIP_RESULT',
					success: false,
					error: err.message,
					network: 'pharos',
				},
				'*'
			);
		}
	});
})();
