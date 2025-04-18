import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from './components/ui/card';
import { Label } from './components/ui/label';
import { Loader } from 'lucide-react';

function App() {
	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isExtension, setIsExtension] = useState(false);

	useEffect(() => {
		// Check if we're running in a Chrome extension context
		const isExtensionEnvironment = !!chrome?.runtime?.id;
		setIsExtension(isExtensionEnvironment);

		if (isExtensionEnvironment) {
			// Add the extension class to the body for specific styling
			document.body.classList.add('chrome-extension');
		}
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Simulate API call
		setTimeout(() => {
			console.log('Login attempt with:', { identifier, password });
			setIsLoading(false);
		}, 1500);
	};

	return (
		<div
			className={`flex items-center justify-center min-h-screen w-full ${
				isExtension ? 'p-2' : 'p-4'
			} bg-transparent`}
		>
			<Card
				className={`w-full max-w-md mx-auto ${
					isExtension
						? 'shadow-none border-0'
						: 'shadow-lg border border-gray-200'
				} responsive-card`}
			>
				<CardHeader
					className={`space-y-1 text-center ${isExtension ? 'p-3' : 'p-6'}`}
				>
					<CardTitle className='text-3xl font-bold text-primary'>
						D-Page
					</CardTitle>
					<CardDescription>
						<div>
							<img
								src='/images/d-page.png'
								alt='D-Page Logo'
								className={`w-16 h-16 mx-auto mb-2`}
							/>
						</div>
						<div>Sign in to your account</div>
					</CardDescription>
				</CardHeader>
				<CardContent className={isExtension ? 'px-3 py-2' : ''}>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='identifier'>Username or Email</Label>
							<Input
								id='identifier'
								placeholder='Enter your username or email'
								type='text'
								autoComplete='username'
								required
								value={identifier}
								onChange={(e) => setIdentifier(e.target.value)}
								className={isExtension ? 'h-9' : ''}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								placeholder='Enter your password'
								type='password'
								autoComplete='current-password'
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className={isExtension ? 'h-9' : ''}
							/>
						</div>

						<div className='flex flex-wrap items-center justify-between gap-2'>
							<a
								href='#'
								className='text-sm font-medium text-primary hover:underline'
							>
								Forgot password?
							</a>
						</div>

						<Button
							type='submit'
							className='w-full'
							variant='default'
							disabled={isLoading}
						>
							{isLoading && <Loader className='mr-2 h-4 w-4 animate-spin' />}
							{isLoading ? 'Signing in...' : 'Sign in'}
						</Button>
					</form>
				</CardContent>
				<CardFooter
					className={`flex justify-center ${isExtension ? 'pt-0 pb-3' : ''}`}
				>
					<p className='text-sm text-muted-foreground'>
						Don't have an account?{' '}
						<a href='#' className='text-primary font-medium hover:underline'>
							Sign up
						</a>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}

export default App;
