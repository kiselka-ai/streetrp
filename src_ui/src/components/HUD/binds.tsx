import React from 'react';
import images from 'utils/images';
import Key from './key';

const controls: { [name: string]: string } = {
	cursor: '`',
	inventory: 'I',
	target: 'K',
	phone: 'P',
	noHUD: '0'
};

type Props = {
	items: {
		[name: string]: string;
	};
};

export default function Binds({ items }: Props) {
	return (
		<div className="hud_binds">
			<ul className="hud_binds-list">
				{Object.entries(controls).map(([key, value], index) => (
					<li className="hud_binds-item" key={index}>
						<img src={images.getImage(`${key}.svg`)} alt="bind icon" />

						<Key>{key === 'phone' ? 'P' : (items[key] ?? value)}</Key>
					</li>
				))}
			</ul>
		</div>
	);
}
