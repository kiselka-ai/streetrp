import React from 'react';
import classNames from 'classnames';
import { IconType } from 'react-icons/lib/cjs';

type Control = {
	name: string;
	label: string;
	icon: IconType;
};

type Props = {
	items: Control[];
	onClick: (type: string) => void;
	variant?: 'primary' | 'secondary';
};

export default function CallControls({ items, onClick, variant }: Props) {
	return (
		<div
			className={classNames(
				'call_controls',
				variant && `call_controls--${variant}`
			)}
		>
			{items.map((item) => (
				<button
					type="button"
					className={classNames('call_controls-item', `call_controls-item--${item.name}`)}
					key={item.name}
					onClick={() => onClick(item.name)}
				>
					<i className="icon">{React.createElement(item.icon)}</i>
					<span className="call_controls-label">{item.label}</span>
				</button>
			))}
		</div>
	);
}
