import React, { useContext } from 'react';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';
import { IoIosLock } from 'react-icons/io';
import InventoryContext from './context';

type Props = {
	id: number | string;
	blocked?: boolean;
	storage?: string;
	className?: string;
	children?: React.ReactNode;
	onDrop?: (id: number | string, cell?: number | string, storage?: string) => void;
	canDrop?: (item: { id: number | string; storage?: string }) => boolean;
};

export default function InventoryCell({
	id,
	blocked = false,
	className,
	children,
	storage = 'self',
	canDrop: canDropProp,
	...props
}: Props) {
	const context = useContext(InventoryContext);
	const { onDrop }: any = props.onDrop ? props : context;

	const canDropFn = (item: any) =>
		canDropProp ? canDropProp(item) : !blocked;

	const [{ isOver }, drop] = useDrop({
		accept: 'item',
		canDrop: canDropFn,
		drop: (item: any) => {
			if (item.storage !== storage) context!.transferItem(item.id, id as number, storage);
			else onDrop(item.id, id, storage);
		},
		collect: (monitor) => ({
			isOver: monitor.isOver()
		})
	});

	return (
		<div
			ref={drop}
			className={classNames('inventory_cell', className, {
				'is-over': isOver,
				'is-blocked': blocked
			})}
		>
			{blocked && !children ? <IoIosLock /> : children}
		</div>
	);
}
