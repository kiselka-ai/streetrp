import React from 'react';
import classNames from 'classnames';
import images from 'utils/images';
import prettify from 'utils/prettify';
import inventoryItems from 'data/inventory.json';
import Hint from './hint';

type Category = 'food' | 'drinks' | 'medicine' | 'tools';

type Props = {
	items: { [name: string]: number };
	selected?: string;
	selectItem: (name: string) => void;
	category: Category;
};

function getItemCategory(name: string): Category {
	const item = (inventoryItems as any)[name];
	if (!item) return 'tools';

	const type = item.type;

	// Специальная обработка для soda - это напиток, хотя type === "food"
	if (name === 'soda') return 'drinks';

	switch (type) {
		case 'food':
			return 'food';
		case 'alcohol':
			return 'drinks';
		case 'medicine':
		case 'drugs': // Сигареты и другие вещества
			return 'medicine';
		case 'tool':
		case 'weapon':
		case 'backpack':
			return 'tools';
		default:
			return 'tools';
	}
}

export default function SupermarketProducts({ items, selected, selectItem, category }: Props) {
	const filteredItems = Object.entries(items).filter(
		([name]) => getItemCategory(name) === category
	);

	return (
		<div className="supermarket_products">
			<Hint>1. Выберите товар</Hint>

			<div className="supermarket_products-list">
				{filteredItems.length > 0 ? (
					filteredItems.map(([name, price]) => (
						<div
							className={classNames('supermarket_products-item', {
								active: selected === name
							})}
							key={name}
							onClick={() => selectItem(name)}
						>
							<h4>{(inventoryItems as any)[name].name}</h4>

							<img src={images.getImage(`${name}.png`, 'inventory')} alt={name} />

							<span>{prettify.price(price)}</span>
						</div>
					))
				) : (
					<div className="supermarket_products-empty">В этой категории нет товаров</div>
				)}
			</div>
		</div>
	);
}
