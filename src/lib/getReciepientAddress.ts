// fetch the profile
// const PROD = 'https://api.superpa.ge';
const DEV = 'http://localhost:8000';

export const getRecipientAddress = async (
	username: string,
	platform: string
) => {
	const response = await fetch(`${DEV}/api/profile/find/${username}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			platform: platform,
		}),
	});
	console.log(response);

	if (!response.ok) {
		throw new Error('Failed to fetch recipient address');
	}

	const data = await response.json();
	return data;
};
