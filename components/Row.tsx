import React, {ReactNode} from 'react';

export default function Row({
	label, 
	alt, 
	heading,
	className,
	children
}: {
	label?: ReactNode, 
	alt?: boolean,
	heading?: boolean
	className?: string, 
	children?: ReactNode
}) {
	return <div className={`
		px-2 py-1 flex items-center justify-between 
		${alt ? 'bg-red-400/5' : ''}
		${heading ? 'mt-2 border-t dark:border-red-900/40': ''}
		${className}`}>
		<div className={'grow'}>{label}</div>{children}
	</div>;
}