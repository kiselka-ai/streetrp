import { isNumber } from 'lodash';
import money from 'helpers/money';
import inventoryHelper from 'basic/inventory/helper';
import playerInventory from 'player/inventory';
import { SilentError } from 'utils/errors';
import Service from './service';

type Product = {
	name: string;
	amount: number;
};

const prices = {
	burger: 130,
	donut: 75,
	chocolate: 30,
	soda: 10,
	cigarettes: 30,
	beer: 50,
	wine: 80,
	vodka: 120,
	whiskey: 200,
	flashlight: 400,
	lockpick: 100,
	bandage: 100,
	medkit: 700,
	sack: 150,
	cable_tie: 250,
	backpack_small: 3500,
	backpack_medium: 15500,
	rod: 5000,
	fish_bait: 350
};

class Supermarket extends Service {
	constructor() {
		super('supermarket', { name: '24/7', model: 52, color: 81 });
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'Supermarket-Buy': this.buy.bind(this)
		});
	}

	onKeyPress(player: Player) {
		if (player.mp.vehicle) return;

		player.callEvent('Supermarket-ShowMenu', prices);
	}

	private getPrice(product: Product) {
		const { name, amount } = product;

		if (!prices[name] || !isNumber(amount) || amount <= 0 || amount > 10000) {
			throw new SilentError('wrong product');
		}

		return prices[name] * amount;
	}

	private static readonly MAX_PER_ITEM = 15;

	private async buy(player: Player, product: Product, payment: PaymentType) {
		const { name, amount } = product;
		const current = inventoryHelper.getTotalAmount(player.inventory, name);
		const canBuy = Math.min(amount, Math.max(0, Supermarket.MAX_PER_ITEM - current));

		if (canBuy <= 0) {
			return mp.events.reject(`Максимум ${Supermarket.MAX_PER_ITEM} шт. на вид товара в инвентаре`);
		}

		const item = { name, amount: canBuy };
		const price = this.getPrice(item);

		playerInventory.checkEnoughSlots(player, [item]);

		await money.change(player, payment, -price, 'supermarket');
		await playerInventory.addItem(player, item, Supermarket.MAX_PER_ITEM);
	}
}

const service = new Supermarket();