import {
	Connection,
	PublicKey,
	SystemProgram,
	Transaction,
	clusterApiUrl,
	TransactionInstruction,
} from '@solana/web3.js';
import { Buffer } from 'buffer';

window.Buffer = Buffer;

(async () => {
	console.log('[SuperPay] Phantom wallet bridge loaded');

	if (!('solana' in window)) {
		console.warn('[SuperPay] Phantom wallet not found');
		return;
	}

	window.addEventListener('message', async (event) => {
		if (event.data?.type === 'SUPERPAGE_TIP') {
			const recipient = new PublicKey(event.data.recipient);
			const lamports = event.data.lamports;
			const message = event.data.message || 'SuperPay Tip';

			console.log(
				`[SuperPay] Sending ${lamports} lamports to ${recipient.toBase58()}`
			);

			try {
				const provider = (window as any).solana;
				await provider.connect();

				const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
				const fromPubkey = provider.publicKey;

				// Create a memo instruction using Solana Cookbook pattern
				const memoInstruction = new TransactionInstruction({
					keys: [],
					programId: new PublicKey(
						'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
					),
					data: Buffer.from(message, 'utf-8'),
				});

				// Create transaction with both transfer and memo
				const transaction = new Transaction().add(
					SystemProgram.transfer({
						fromPubkey,
						toPubkey: recipient,
						lamports,
					}),
					memoInstruction
				);

				transaction.feePayer = fromPubkey;
				const { blockhash } = await connection.getLatestBlockhash();
				transaction.recentBlockhash = blockhash;

				const signedTx = await provider.signTransaction(transaction);
				const txid = await connection.sendRawTransaction(signedTx.serialize());

				console.log('[SuperPay] Transaction sent:', txid);

				window.postMessage(
					{ type: 'SUPERPAGE_TIP_RESULT', success: true, tx: txid },
					'*'
				);
			} catch (err: any) {
				console.error('[SuperPay] Tip failed:', err.message);
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
