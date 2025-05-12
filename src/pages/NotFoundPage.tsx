import { Button } from '@/components/ui/button';

interface NotFoundPageProps {
	onNavigate: (
		page: 'login' | 'dashboard' | 'profile' | 'settings' | '404'
	) => void;
	isExtension: boolean;
}

export default function NotFoundPage({
	onNavigate,
	isExtension,
}: NotFoundPageProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center min-w-screen min-h-screen bg-background ${
				isExtension ? 'p-2' : 'p-4'
			}`}
		>
			<div className='text-center space-y-4'>
				<h1 className='text-6xl font-bold text-primary'>404</h1>
				<h2 className='text-2xl font-semibold'>Page Not Found</h2>
				<p className='text-muted-foreground'>
					The page you're looking for doesn't exist or has been moved.
				</p>
				<Button
					className='bg-primary hover:bg-primary/90'
					onClick={() => onNavigate('dashboard')}
				>
					Return to Dashboard
				</Button>
			</div>
		</div>
	);
}
