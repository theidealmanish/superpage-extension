// src/background.ts
import type { RecipientUser } from '@/lib/getReciepientAddress';

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
	if (msg.type === 'getRecipientAddress') {
		const { username, platform } = msg;
		fetch(
			`https://api.superpa.ge/profile/find/${encodeURIComponent(username)}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ platform }),
			}
		)
			.then(async (res) => {
				if (res.status === 404) {
					sendResponse({ error: 'NOT_FOUND' });
				} else if (!res.ok) {
					sendResponse({ error: 'FETCH_FAILED', status: res.status });
				} else {
					const payload = (await res.json()) as {
						data: { user: RecipientUser };
					};
					sendResponse({ user: payload.data.user });
				}
			})
			.catch((err) => {
				console.error('Background fetch error:', err);
				sendResponse({ error: 'NETWORK_ERROR' });
			});
		return true; // tell Chrome we’ll call sendResponse asynchronously
	}
});
