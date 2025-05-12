import { Loader2 } from 'lucide-react';

interface LoadingPageProps {
	isExtension: boolean;
}

export default function LoadingPage({ isExtension }: LoadingPageProps) {
	return (
		<div
			className={`flex items-center justify-center min-w-screen min-h-screen bg-background ${
				isExtension ? 'p-2' : 'p-4'
			}`}
		>
			<div className='flex flex-col items-center gap-2'>
				<Loader2 className='h-8 w-8 text-primary animate-spin' />
				<p className='text-sm text-muted-foreground'>Loading SuperPage...</p>
			</div>
		</div>
	);
}
