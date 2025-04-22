export interface RecipientUser {
	_id: string;
	walletAddress: string;
	// add any other user-specific fields here
}

export interface GetRecipientResponse {
	user?: RecipientUser;
	error?: string;
}

/**
 * Fetch recipient address from background script via messaging.
 * @param username - the username to look up
 * @param platform - the platform identifier (e.g., "youtube", "github")
 * @returns promise resolving to the user object containing walletAddress, or throws an error
 */
export default function getRecipientAddress(
	username: string,
	platform: string
): Promise<{ data: { user: RecipientUser } }> {
	return new Promise((resolve, reject) => {
		try {
			chrome.runtime.sendMessage(
				{
					type: 'getRecipientAddress',
					username,
					platform,
				},
				(response: GetRecipientResponse) => {
					if (chrome.runtime.lastError) {
						return reject(new Error(chrome.runtime.lastError.message));
					}
					if (!response) {
						return reject(new Error('No response from background script'));
					}
					if (response.error) {
						return reject(new Error(response.error));
					}
					if (!response.user) {
						return reject(new Error('User not found'));
					}
					resolve({ data: { user: response.user } });
				}
			);
		} catch (err) {
			reject(err);
		}
	});
}
