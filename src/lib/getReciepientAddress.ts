// fetch the profile
export const getRecipientAddress = async (
	username: string,
	platform: string
) => {
	const response = await fetch(
		`http://localhost:8000/api/profile/find/${username}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				platform: platform,
			}),
		}
	);
	console.log(response);

	if (!response.ok) {
		throw new Error('Failed to fetch recipient address');
	}

	const data = await response.json();
	return data;
};
