import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';

interface LoginPageProps {
	onLogin: (user: any, token: string) => void;
	isExtension: boolean;
}

export default function LoginPage({ onLogin, isExtension }: LoginPageProps) {
	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const result = await authApi.login(identifier, password);

			if (result.success) {
				toast.success('Logged in successfully!');
				onLogin(result.user, result.token);
			} else {
				toast.error(result.error || 'Invalid credentials');
			}
		} finally {
			setIsLoading(false);
		}
	};

	const openExternalLink = (url: string) => {
		if (isExtension && chrome?.tabs) {
			chrome.tabs.create({ url });
		} else {
			window.open(url, '_blank');
		}
	};

	return (
		<div className='flex flex-col items-center justify-center min-w-screen min-h-screen p-4 bg-background'>
			<div
				className={`w-full mx-auto ${isExtension ? 'max-w-none' : 'max-w-sm'}`}
			>
				<div className='text-center mb-5'>
					<h1 className='text-xl font-semibold text-primary'>SuperPage</h1>
					<p className='text-muted-foreground text-sm'>
						Creator monetization for everyone
					</p>
				</div>

				<Card
					className={isExtension ? 'shadow-none border border-border/40' : ''}
				>
					<CardHeader className='space-y-1 pb-3'>
						<CardTitle className='text-center text-lg font-medium'>
							Sign in
						</CardTitle>
						<CardDescription className='text-center text-sm'>
							Enter your email to access your account
						</CardDescription>
					</CardHeader>

					<CardContent>
						<form onSubmit={handleLogin} className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='identifier' className='text-sm'>
									Email or Username
								</Label>
								<Input
									id='identifier'
									type='text'
									placeholder='you@example.com'
									value={identifier}
									onChange={(e) => setIdentifier(e.target.value)}
									required
									disabled={isLoading}
									autoComplete='username'
									className='h-9'
								/>
							</div>

							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<Label htmlFor='password' className='text-sm'>
										Password
									</Label>
									<span
										className='text-xs text-primary cursor-pointer hover:underline'
										onClick={() =>
											openExternalLink('https://superpa.ge/forgot-password')
										}
									>
										Forgot password?
									</span>
								</div>
								<Input
									id='password'
									type='password'
									placeholder='••••••••'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={isLoading}
									autoComplete='current-password'
									className='h-9'
								/>
							</div>

							<div className='flex items-center space-x-2'>
								<Checkbox
									id='remember'
									checked={rememberMe}
									onCheckedChange={(checked) => setRememberMe(checked === true)}
								/>
								<Label
									htmlFor='remember'
									className='text-xs font-normal text-muted-foreground'
								>
									Remember me for 30 days
								</Label>
							</div>

							<Button type='submit' className='w-full h-9' disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										<span>Signing in</span>
									</>
								) : (
									'Sign In'
								)}
							</Button>
						</form>
					</CardContent>

					<CardFooter className='flex justify-center px-6 pt-0 pb-6'>
						<p className='text-center text-xs text-muted-foreground'>
							Don't have an account?{' '}
							<span
								className='text-primary cursor-pointer hover:underline'
								onClick={() => openExternalLink('https://superpa.ge/register')}
							>
								Sign up
							</span>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
