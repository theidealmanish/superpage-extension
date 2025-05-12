import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { ChevronLeft, Loader2, Camera } from 'lucide-react';

interface ProfilePageProps {
	user: any;
	onNavigate: (
		page: 'login' | 'dashboard' | 'profile' | 'settings' | '404'
	) => void;
	isExtension: boolean;
}

export default function ProfilePage({
	user,
	onNavigate,
	isExtension,
}: ProfilePageProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: user.name || '',
		username: user.username || '',
		bio: user.bio || '',
		website: user.website || '',
		youtube: user.youtube || '',
		twitter: user.twitter || '',
		tiktok: user.tiktok || '',
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast.success('Profile updated successfully');
		} catch (error) {
			toast.error('Failed to update profile');
		} finally {
			setIsLoading(false);
		}
	};

	const getInitials = (name: string) => {
		if (!name) return 'SP';
		return name
			.split(' ')
			.map((n) => n[0])
			.slice(0, 2)
			.join('')
			.toUpperCase();
	};

	return (
		<div
			className={`min-h-screen bg-background min-w-screen flex flex-col ${
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
				<h1 className='text-xl font-bold'>Profile Settings</h1>
			</header>

			<Card className={isExtension ? 'shadow-none border-0' : ''}>
				<CardHeader>
					<CardTitle>Your Profile</CardTitle>
					<CardDescription>
						Update your personal information and social links
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div className='flex flex-col items-center space-y-3'>
							<div className='relative'>
								<Avatar className='h-20 w-20'>
									<AvatarImage
										src={user.avatar}
										alt={user.name || user.username}
									/>
									<AvatarFallback className='bg-primary text-lg text-primary-foreground'>
										{getInitials(user.name || user.username)}
									</AvatarFallback>
								</Avatar>
								<Button
									size='icon'
									variant='secondary'
									className='absolute -bottom-1 -right-1 rounded-full h-7 w-7'
									onClick={() => toast.info('Avatar upload coming soon')}
								>
									<Camera className='h-3 w-3' />
								</Button>
							</div>
							<p className='text-sm text-muted-foreground'>@{user.username}</p>
						</div>

						<div className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='name'>Full Name</Label>
								<Input
									id='name'
									name='name'
									value={formData.name}
									onChange={handleChange}
									placeholder='Your full name'
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='bio'>Bio</Label>
								<Textarea
									id='bio'
									name='bio'
									value={formData.bio}
									onChange={handleChange}
									placeholder='Tell others a bit about yourself...'
									className='resize-none h-20'
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='website'>Website</Label>
								<Input
									id='website'
									name='website'
									value={formData.website}
									onChange={handleChange}
									placeholder='https://your-website.com'
								/>
							</div>

							<div className='border-t pt-4 mt-4'>
								<h3 className='text-sm font-medium mb-3'>Social Links</h3>
								<div className='space-y-3'>
									<div className='space-y-2'>
										<Label
											htmlFor='youtube'
											className='flex items-center gap-2'
										>
											<svg
												className='h-4 w-4 text-red-500'
												viewBox='0 0 24 24'
												xmlns='http://www.w3.org/2000/svg'
												fill='currentColor'
											>
												<path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
											</svg>
											YouTube
										</Label>
										<Input
											id='youtube'
											name='youtube'
											value={formData.youtube}
											onChange={handleChange}
											placeholder='@yourchannel'
										/>
									</div>

									<div className='space-y-2'>
										<Label
											htmlFor='twitter'
											className='flex items-center gap-2'
										>
											<svg
												className='h-4 w-4 text-[#1DA1F2]'
												viewBox='0 0 24 24'
												xmlns='http://www.w3.org/2000/svg'
												fill='currentColor'
											>
												<path d='M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z' />
											</svg>
											Twitter
										</Label>
										<Input
											id='twitter'
											name='twitter'
											value={formData.twitter}
											onChange={handleChange}
											placeholder='@yourusername'
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='tiktok' className='flex items-center gap-2'>
											<svg
												className='h-4 w-4'
												viewBox='0 0 24 24'
												xmlns='http://www.w3.org/2000/svg'
											>
												<path d='M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' />
											</svg>
											TikTok
										</Label>
										<Input
											id='tiktok'
											name='tiktok'
											value={formData.tiktok}
											onChange={handleChange}
											placeholder='@yourusername'
										/>
									</div>
								</div>
							</div>
						</div>
					</form>
				</CardContent>

				<CardFooter
					className={`flex justify-between ${isExtension ? 'pt-0' : ''}`}
				>
					<Button variant='outline' onClick={() => onNavigate('dashboard')}>
						Cancel
					</Button>
					<Button
						type='submit'
						className='bg-primary hover:bg-primary/90'
						disabled={isLoading}
						onClick={handleSubmit}
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
