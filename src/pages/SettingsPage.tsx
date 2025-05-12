import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ChevronLeft, Moon, Sun, Bell, Shield, Loader2 } from 'lucide-react';

interface SettingsPageProps {
	user: any;
	onNavigate: (
		page: 'login' | 'dashboard' | 'profile' | 'settings' | '404'
	) => void;
	isExtension: boolean;
}

export default function SettingsPage({
	onNavigate,
	isExtension,
}: SettingsPageProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [settings, setSettings] = useState({
		darkMode: false,
		notifications: {
			tips: true,
			earnings: true,
			watchTime: true,
			updates: false,
		},
		privacy: {
			shareWatchData: true,
			allowTips: true,
			showProfile: true,
		},
	});

	const handleToggle = (
		category: 'notifications' | 'privacy',
		setting: string
	) => {
		setSettings((prev) => ({
			...prev,
			[category]: {
				...(prev[category] as Record<string, boolean>),
				[setting]: !(prev[category] as Record<string, boolean>)[setting],
			},
		}));
	};

	const handleSave = async () => {
		setIsLoading(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast.success('Settings saved successfully');
		} catch (error) {
			toast.error('Failed to save settings');
		} finally {
			setIsLoading(false);
		}
	};

	const handleThemeToggle = () => {
		setSettings((prev) => ({
			...prev,
			darkMode: !prev.darkMode,
		}));

		// In a real app, this would also update the actual theme
		toast.info(`${settings.darkMode ? 'Light' : 'Dark'} mode activated`);
	};

	return (
		<div
			className={`min-h-screen min-w-screen bg-background flex flex-col ${
				isExtension ? 'p-2' : 'p-4 md:p-8'
			}`}
		>
			<header className='flex items-center gap-2 mb-6'>
				<Button
					variant='ghost'
					size='sm'
					className='p-0 h-8 w-8'
					onClick={() => onNavigate('dashboard')}
				>
					<ChevronLeft className='h-5 w-5' />
				</Button>
				<h1 className='text-xl font-bold'>Settings</h1>
			</header>

			<Card className={isExtension ? 'shadow-none border-0' : ''}>
				<CardHeader className={isExtension ? 'pb-2' : ''}>
					<CardTitle>Preferences</CardTitle>
					<CardDescription>
						Manage your account settings and preferences
					</CardDescription>
				</CardHeader>

				<CardContent className='space-y-6'>
					<div className='space-y-3'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								{settings.darkMode ? (
									<Moon className='h-4 w-4' />
								) : (
									<Sun className='h-4 w-4' />
								)}
								<div>
									<h4 className='text-sm font-medium'>Theme</h4>
									<p className='text-xs text-muted-foreground'>
										{settings.darkMode ? 'Dark mode' : 'Light mode'}
									</p>
								</div>
							</div>
							<Switch
								checked={settings.darkMode}
								onCheckedChange={handleThemeToggle}
							/>
						</div>
					</div>

					<Separator />

					<div className='space-y-3'>
						<div className='flex items-center gap-2'>
							<Bell className='h-4 w-4' />
							<h3 className='text-sm font-medium'>Notifications</h3>
						</div>

						<div className='ml-6 space-y-3'>
							<div className='flex items-center justify-between'>
								<div>
									<h4 className='text-sm font-medium'>Tips & Donations</h4>
									<p className='text-xs text-muted-foreground'>
										Get notified when someone tips you
									</p>
								</div>
								<Switch
									checked={settings.notifications.tips}
									onCheckedChange={() => handleToggle('notifications', 'tips')}
								/>
							</div>

							<div className='flex items-center justify-between'>
								<div>
									<h4 className='text-sm font-medium'>Earnings Updates</h4>
									<p className='text-xs text-muted-foreground'>
										Receive periodic earning reports
									</p>
								</div>
								<Switch
									checked={settings.notifications.earnings}
									onCheckedChange={() =>
										handleToggle('notifications', 'earnings')
									}
								/>
							</div>

							<div className='flex items-center justify-between'>
								<div>
									<h4 className='text-sm font-medium'>Watch Time</h4>
									<p className='text-xs text-muted-foreground'>
										Updates on your engagement metrics
									</p>
								</div>
								<Switch
									checked={settings.notifications.watchTime}
									onCheckedChange={() =>
										handleToggle('notifications', 'watchTime')
									}
								/>
							</div>

							<div className='flex items-center justify-between'>
								<div>
									<h4 className='text-sm font-medium'>Product Updates</h4>
									<p className='text-xs text-muted-foreground'>
										Learn about new features and updates
									</p>
								</div>
								<Switch
									checked={settings.notifications.updates}
									onCheckedChange={() =>
										handleToggle('notifications', 'updates')
									}
								/>
							</div>
						</div>
					</div>

					<Separator />

					<div className='space-y-3'>
						<div className='flex items-center gap-2'>
							<Shield className='h-4 w-4' />
							<h3 className='text-sm font-medium'>Privacy</h3>
						</div>

						<div className='ml-6 space-y-3'>
							<div className='flex items-center justify-between'>
								<div>
									<h4 className='text-sm font-medium'>Share Watch Data</h4>
									<p className='text-xs text-muted-foreground'>
										Allow SuperPage to track your content engagement
									</p>
								</div>
								<Switch
									checked={settings.privacy.shareWatchData}
									onCheckedChange={() =>
										handleToggle('privacy', 'shareWatchData')
									}
								/>
							</div>

							<div className='flex items-center justify-between'>
								<div>
									<h4 className='text-sm font-medium'>Allow Tips</h4>
									<p className='text-xs text-muted-foreground'>
										Let viewers support you with monetary tips
									</p>
								</div>
								<Switch
									checked={settings.privacy.allowTips}
									onCheckedChange={() => handleToggle('privacy', 'allowTips')}
								/>
							</div>

							<div className='flex items-center justify-between'>
								<div>
									<h4 className='text-sm font-medium'>Public Profile</h4>
									<p className='text-xs text-muted-foreground'>
										Make your creator profile visible to others
									</p>
								</div>
								<Switch
									checked={settings.privacy.showProfile}
									onCheckedChange={() => handleToggle('privacy', 'showProfile')}
								/>
							</div>
						</div>
					</div>
				</CardContent>

				<CardFooter className='flex justify-between'>
					<Button variant='outline' onClick={() => onNavigate('dashboard')}>
						Cancel
					</Button>
					<Button
						className='bg-primary hover:bg-primary/90'
						onClick={handleSave}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Saving...
							</>
						) : (
							'Save Changes'
						)}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
