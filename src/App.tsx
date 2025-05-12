import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingPage from './pages/LoadingPage';

type AppProps = {
	context?: 'popup' | 'sidepanel';
};

type Page = 'login' | 'dashboard' | 'profile' | 'settings' | '404';

function App({ context = 'popup' }: AppProps) {
	const [currentPage, setCurrentPage] = useState<Page>('login');
	const [isLoading, setIsLoading] = useState(true);
	const [isExtension, setIsExtension] = useState(false);
	const [userData, setUserData] = useState<any>(null);

	useEffect(() => {
		// Check if we're running in a Chrome extension context
		const isExtensionEnvironment = !!chrome?.runtime?.id;
		setIsExtension(isExtensionEnvironment);

		if (isExtensionEnvironment) {
			// Add the extension class to the body for specific styling
			document.body.classList.add('chrome-extension');
			document.body.classList.add(`context-${context}`);
		}

		// Check if user is already logged in by checking local storage
		const token = localStorage.getItem('token');
		if (token) {
			console.log('Token found:', token);
			validateToken(token);
			return;
		} else {
			setIsLoading(false);
			setCurrentPage('login');
		}
	}, [context]);

	// Validate saved token
	const validateToken = async (token: string) => {
		try {
			setIsLoading(true);
			const response = await fetch('http://localhost:8000/auth/current-user', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				console.log('User data:', data);
				setUserData(data.user);
				setCurrentPage('dashboard');
			} else {
				// If token is invalid, remove it and show login
				localStorage.removeItem('token');
				setCurrentPage('login');
			}
		} catch (error) {
			console.error('Error validating token:', error);
			localStorage.removeItem('token');
			setCurrentPage('login');
		} finally {
			setIsLoading(false);
		}
	};

	const navigateTo = (page: Page) => {
		setCurrentPage(page);
	};

	const handleLogin = (user: any, token: string) => {
		localStorage.setItem('token', token);
		setUserData(user);
		setCurrentPage('dashboard');
	};

	const handleLogout = () => {
		localStorage.removeItem('token');
		setUserData(null);
		setCurrentPage('login');
	};

	// Show loading state
	if (isLoading) {
		return <LoadingPage isExtension={isExtension} />;
	}

	// Render the appropriate page based on current state
	return (
		<main
			className={`min-h-screen bg-background ${isExtension ? 'extension' : ''}`}
		>
			{currentPage === 'login' && (
				<LoginPage onLogin={handleLogin} isExtension={isExtension} />
			)}

			{currentPage === 'dashboard' && (
				<DashboardPage
					user={userData}
					onLogout={handleLogout}
					onNavigate={navigateTo}
					isExtension={isExtension}
				/>
			)}

			{currentPage === 'profile' && (
				<ProfilePage
					user={userData}
					onNavigate={navigateTo}
					isExtension={isExtension}
				/>
			)}

			{currentPage === 'settings' && (
				<SettingsPage
					user={userData}
					onNavigate={navigateTo}
					isExtension={isExtension}
				/>
			)}

			{currentPage === '404' && (
				<NotFoundPage onNavigate={navigateTo} isExtension={isExtension} />
			)}

			<Toaster
				position={isExtension ? 'bottom-center' : 'bottom-right'}
				richColors
			/>
		</main>
	);
}

export default App;
