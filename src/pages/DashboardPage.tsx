import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	BarChart,
	Activity,
	Users,
	Wallet,
	Settings,
	LogOut,
	ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardPageProps {
	user: any;
	onLogout: () => void;
	onNavigate: (
		page: 'login' | 'dashboard' | 'profile' | 'settings' | '404'
	) => void;
	isExtension: boolean;
}

export default function DashboardPage({
	user,
	onLogout,
	onNavigate,
	isExtension,
}: DashboardPageProps) {
	const [activeTab, setActiveTab] = useState('overview');

	console.log('user', user);

	const getInitials = (name: string) => {
		if (!name) return 'SP';
		return name
			.split(' ')
			.map((n) => n[0])
			.slice(0, 2)
			.join('')
			.toUpperCase();
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
		}).format(amount);
	};

	return (
		<div
			className={`min-h-screen min-w-screen bg-background flex flex-col ${
				isExtension ? 'p-2' : 'p-4 md:p-8'
			}`}
		>
			<header className='flex justify-between items-center mb-6'>
				<div className='flex items-center gap-2'>
					<Avatar className='h-10 w-10'>
						<AvatarImage src={user.avatar} alt={user.name || user.username} />
						<AvatarFallback className='bg-primary text-primary-foreground'>
							{getInitials(user.name || user.username)}
						</AvatarFallback>
					</Avatar>
					<div>
						<h1 className='text-lg font-semibold'>
							Hi, {user.name?.split(' ')[0] || user.username}!
						</h1>
						<p className='text-xs text-muted-foreground'>
							Welcome to SuperPage
						</p>
					</div>
				</div>

				<Button variant='ghost' size='icon' onClick={onLogout}>
					<LogOut className='h-5 w-5' />
				</Button>
			</header>

			<Tabs
				defaultValue={activeTab}
				onValueChange={setActiveTab}
				className='space-y-4'
			>
				<TabsList className='grid grid-cols-2 md:grid-cols-4'>
					<TabsTrigger value='overview'>Overview</TabsTrigger>
					<TabsTrigger value='earnings'>Earnings</TabsTrigger>
					<TabsTrigger value='engagement'>Engagement</TabsTrigger>
					<TabsTrigger value='tips'>Tips</TabsTrigger>
				</TabsList>

				<TabsContent value='overview' className='space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<Card>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium'>
									Total Balance
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{formatCurrency(user.balance || 0)}
								</div>
								<p className='text-xs text-muted-foreground mt-1'>
									{user.pendingBalance > 0 &&
										`+ ${formatCurrency(user.pendingBalance)} pending`}
								</p>
								<Button
									variant='default'
									size='sm'
									className='w-full mt-3 bg-primary hover:bg-primary/90'
									onClick={() => {
										if (isExtension) {
											chrome.tabs.create({
												url: 'https://superpage.com/dashboard/wallet',
											});
										} else {
											window.open(
												'https://superpage.com/dashboard/wallet',
												'_blank'
											);
										}
									}}
								>
									Withdraw Funds
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium'>
									Recent Earnings
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{formatCurrency(user.recentEarnings || 0)}
								</div>
								<p className='text-xs text-muted-foreground mt-1'>
									Last 7 days
								</p>
								<div className='mt-2'>
									<div className='flex justify-between text-xs mb-1'>
										<span>Weekly Goal</span>
										<span>
											{formatCurrency(10)} / {formatCurrency(50)}
										</span>
									</div>
									<Progress value={20} className='h-2' />
								</div>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium'>
								Quick Actions
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-2'>
							<Button
								variant='outline'
								className='w-full justify-between'
								onClick={() => toast.info('Coming soon!')}
							>
								<div className='flex items-center gap-2'>
									<Activity className='h-4 w-4' />
									<span>View Analytics</span>
								</div>
								<ChevronRight className='h-4 w-4' />
							</Button>

							<Button
								variant='outline'
								className='w-full justify-between'
								onClick={() => onNavigate('profile')}
							>
								<div className='flex items-center gap-2'>
									<Users className='h-4 w-4' />
									<span>Manage Profile</span>
								</div>
								<ChevronRight className='h-4 w-4' />
							</Button>

							<Button
								variant='outline'
								className='w-full justify-between'
								onClick={() => onNavigate('settings')}
							>
								<div className='flex items-center gap-2'>
									<Settings className='h-4 w-4' />
									<span>Settings</span>
								</div>
								<ChevronRight className='h-4 w-4' />
							</Button>

							<Button
								className='w-full justify-between bg-primary hover:bg-primary/90'
								onClick={() => {
									if (isExtension) {
										chrome.tabs.create({
											url: 'https://superpage.com/dashboard',
										});
									} else {
										window.open('https://superpage.com/dashboard', '_blank');
									}
								}}
							>
								<div className='flex items-center gap-2'>
									<BarChart className='h-4 w-4' />
									<span>Open Full Dashboard</span>
								</div>
								<ChevronRight className='h-4 w-4' />
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='earnings' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>Earnings Overview</CardTitle>
							<CardDescription>
								Your revenue streams and performance
							</CardDescription>
						</CardHeader>
						<CardContent className='flex flex-col gap-4'>
							<div className='space-y-2'>
								<h3 className='font-medium'>Revenue Sources</h3>
								<div className='space-y-2'>
									<div className='flex justify-between items-center'>
										<div>
											<div className='flex items-center gap-2'>
												<div className='h-3 w-3 rounded-full bg-primary'></div>
												<span className='text-sm'>Tips</span>
											</div>
											<span className='text-xs text-muted-foreground pl-5'>
												Direct support from viewers
											</span>
										</div>
										<div className='font-medium'>
											{formatCurrency(user.tipEarnings || 0)}
										</div>
									</div>

									<div className='flex justify-between items-center'>
										<div>
											<div className='flex items-center gap-2'>
												<div className='h-3 w-3 rounded-full bg-blue-500'></div>
												<span className='text-sm'>Watch Time</span>
											</div>
											<span className='text-xs text-muted-foreground pl-5'>
												Engagement rewards
											</span>
										</div>
										<div className='font-medium'>
											{formatCurrency(user.engagementEarnings || 0)}
										</div>
									</div>

									<div className='flex justify-between items-center'>
										<div>
											<div className='flex items-center gap-2'>
												<div className='h-3 w-3 rounded-full bg-green-500'></div>
												<span className='text-sm'>Referrals</span>
											</div>
											<span className='text-xs text-muted-foreground pl-5'>
												Creator referrals
											</span>
										</div>
										<div className='font-medium'>
											{formatCurrency(user.referralEarnings || 0)}
										</div>
									</div>
								</div>
							</div>

							<Button
								variant='outline'
								className='mt-2'
								onClick={() => {
									if (isExtension) {
										chrome.tabs.create({
											url: 'https://superpage.com/dashboard/earnings',
										});
									} else {
										window.open(
											'https://superpage.com/dashboard/earnings',
											'_blank'
										);
									}
								}}
							>
								View Detailed Reports
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='engagement' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>Engagement Stats</CardTitle>
							<CardDescription>
								How users are interacting with your content
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								<div className='space-y-2'>
									<div className='flex justify-between'>
										<h4 className='text-sm font-medium'>Watch Time</h4>
										<span className='text-sm'>
											{user.watchTimeHours || 0} hrs
										</span>
									</div>
									<Progress
										value={
											user.watchTimeHours
												? Math.min((user.watchTimeHours / 10) * 100, 100)
												: 0
										}
										className='h-2'
									/>
								</div>

								<div className='space-y-2'>
									<div className='flex justify-between'>
										<h4 className='text-sm font-medium'>Viewer Retention</h4>
										<span className='text-sm'>{user.retentionRate || 0}%</span>
									</div>
									<Progress value={user.retentionRate || 0} className='h-2' />
								</div>

								<div className='grid grid-cols-2 gap-4'>
									<div className='bg-muted p-3 rounded-md'>
										<div className='text-sm font-medium'>Total Views</div>
										<div className='text-lg font-bold'>
											{user.totalViews?.toLocaleString() || 0}
										</div>
									</div>

									<div className='bg-muted p-3 rounded-md'>
										<div className='text-sm font-medium'>Unique Viewers</div>
										<div className='text-lg font-bold'>
											{user.uniqueViewers?.toLocaleString() || 0}
										</div>
									</div>
								</div>

								<Button
									variant='outline'
									className='w-full'
									onClick={() => {
										if (isExtension) {
											chrome.tabs.create({
												url: 'https://superpage.com/dashboard/analytics',
											});
										} else {
											window.open(
												'https://superpage.com/dashboard/analytics',
												'_blank'
											);
										}
									}}
								>
									View Full Analytics
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='tips' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>Fan Support</CardTitle>
							<CardDescription>
								Recent tips and supporter activity
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								{user.recentTips?.length > 0 ? (
									<div className='space-y-3'>
										{(user.recentTips || []).map((tip: any, index: number) => (
											<div
												key={index}
												className='flex items-center gap-3 p-3 rounded-md border'
											>
												<Avatar className='h-8 w-8'>
													<AvatarFallback className='bg-primary/10 text-primary text-xs'>
														{tip.sender.substring(0, 2).toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div className='flex-1'>
													<p className='text-sm font-medium'>{tip.sender}</p>
													<p className='text-xs text-muted-foreground'>
														{new Date(tip.date).toLocaleDateString()}
													</p>
												</div>
												<div className='text-right'>
													<p className='text-sm font-bold'>
														{formatCurrency(tip.amount)}
													</p>
													<p className='text-xs text-muted-foreground'>
														{tip.platform}
													</p>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className='text-center py-6'>
										<Wallet className='mx-auto h-8 w-8 text-muted-foreground mb-2' />
										<h3 className='font-medium'>No tips yet</h3>
										<p className='text-sm text-muted-foreground'>
											Tips from your supporters will appear here
										</p>
									</div>
								)}

								<Button
									variant='outline'
									className='w-full'
									onClick={() => {
										if (isExtension) {
											chrome.tabs.create({
												url: 'https://superpage.com/dashboard/supporters',
											});
										} else {
											window.open(
												'https://superpage.com/dashboard/supporters',
												'_blank'
											);
										}
									}}
								>
									View All Supporters
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
