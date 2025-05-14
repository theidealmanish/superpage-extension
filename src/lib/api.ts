// TODO: Use this as environment variable
const apiBaseUrl = 'http://localhost:8000';

// Storage service for handling tokens
export const storageService = {
	async saveToken(token: string): Promise<void> {
		if (chrome?.storage?.local) {
			// Store in Chrome extension storage
			chrome.storage.local.set({ token });
		} else {
			// Fallback to localStorage for web
			localStorage.setItem('token', token);
		}
	},

	async getToken(): Promise<string | null> {
		if (chrome?.storage?.local) {
			// Get from Chrome extension storage
			const result = await chrome.storage.local.get('token');
			console.log('Token from storage:', result.token);
			return result.token || null;
		} else {
			// Fallback to localStorage for web
			return localStorage.getItem('token');
		}
	},

	async removeToken(): Promise<void> {
		if (chrome?.storage?.local) {
			// Remove from Chrome extension storage
			await chrome.storage.local.remove('token');
		} else {
			// Fallback to localStorage for web
			localStorage.removeItem('token');
		}
	},
};

// Auth API methods
export const authApi = {
	async login(identifier: string, password: string): Promise<any> {
		try {
			const response = await fetch(`${apiBaseUrl}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					identifier,
					password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Invalid credentials');
			}

			// Save token to storage
			if (data.token) {
				await storageService.saveToken(data.token);
			}

			return { success: true, user: data.user, token: data.token };
		} catch (error) {
			console.error('Login error:', error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Connection error. Please try again.',
			};
		}
	},

	async validateToken(): Promise<any> {
		try {
			const token = await storageService.getToken();

			if (!token) {
				return { success: false, error: 'No token found' };
			}

			const response = await fetch(`${apiBaseUrl}/auth/current-user`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (!response.ok) {
				await storageService.removeToken();
				throw new Error(data.message || 'Invalid token');
			}
			console.log('Token validation response:', data);
			return { success: true, user: data.data };
		} catch (error) {
			console.error('Token validation error:', error);
			return {
				success: false,
				error:
					error instanceof Error ? error.message : 'Error validating session',
			};
		}
	},

	async logout(): Promise<void> {
		await storageService.removeToken();
	},
};
