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
				console.log('Response from recipient address fetch:', res);
				if (res.ok) {
					const data: any = await res.json();
					sendResponse({ status: 'success', data: data.data });
				} else {
					sendResponse({ error: 'FETCH_FAILED', status: res.status });
				}
			})
			.catch((err) => {
				console.error('Background fetch error:', err);
				sendResponse({ error: 'NETWORK_ERROR' });
			});
		return true;
	}
});
