import React from 'react';
import { InventoryItem } from './index';
import Cell from './cell';
import Item from './item';

function isQuickSlot( id: number | string ): id is string {
	return typeof id === 'string' && id.startsWith( 'quick_' );
}

type Props = {
	equip: (cell: number, slot: string) => void;
	swap: (sourceSlot: string, targetSlot: string) => void;
	items: { [name: string]: InventoryItem };
};

export default function InventoryQuick( { items, equip, swap }: Props ) {
	function onDrop( sourceId: number | string, targetId: number | string ) {
		if ( isQuickSlot( sourceId ) && isQuickSlot( targetId ) ) {
			if ( sourceId !== targetId ) swap( sourceId, targetId );
			return;
		}
		if ( typeof sourceId === 'number' && isQuickSlot( targetId ) ) {
			equip( sourceId, targetId );
		}
	}

	function canDrop( dragged: { id: number | string }, targetHasItem: boolean ) {
		return !targetHasItem || isQuickSlot( dragged.id );
	}

	return (
		<div className="inventory_quick">
			<h3 className="inventory_quick-title">Быстрый доступ</h3>

			<div className="inventory_quick-grid">
				{[ ...Array( 3 ) ].map( ( _, index ) => {
					const id = `quick_${index + 1}`;
					const item = items[ id ];
					const hasItem = !!item;

					return (
						<Cell
							className="inventory_quick-cell"
							id={id}
							key={index}
							onDrop={onDrop}
							blocked={hasItem}
							canDrop={( dragged ) => canDrop( dragged, hasItem )}
						>
							{item && <Item id={id} name={item.name} amount={1} hideAmount />}

							<span className="inventory_quick-key">{index + 1}</span>
						</Cell>
					);
				} )}
			</div>
		</div>
	);
}
