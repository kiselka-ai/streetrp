import React from 'react';
import classNames from 'classnames';

type Category = 'food' | 'drinks' | 'medicine' | 'tools';

type Props = {
	active: Category;
	onSelect: (category: Category) => void;
};

const categories: { id: Category; name: string }[] = [
	{ id: 'food', name: 'Еда' },
	{ id: 'drinks', name: 'Напитки' },
	{ id: 'medicine', name: 'Медицина' },
	{ id: 'tools', name: 'Инструменты' }
];

export default function SupermarketTabs({ active, onSelect }: Props) {
	return (
		<div className="supermarket_tabs">
			{categories.map((category) => (
				<button
					key={category.id}
					className={classNames('supermarket_tabs-item', {
						active: active === category.id
					})}
					onClick={() => onSelect(category.id)}
				>
					{category.name}
				</button>
			))}
		</div>
	);
}
