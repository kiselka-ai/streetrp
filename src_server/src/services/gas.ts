import { isNumber } from 'lodash';
import money from 'helpers/money';
import tasks from 'awards/tasks';
import playerInventory from 'player/inventory';
import vehicleCtrl from 'vehicle';
import vehicleFuel from 'vehicle/fuel';
import ServiceModel from 'models/Service';
import { SilentError } from 'utils/errors';
import { data as servicesData } from './data';
import Service from './service';

type Basket = {
	fuel: number;
	jerrycan: number;
	repair_kit: number;
};

const prices = {
	fuel: {
		diesel: 5,
		low: 10,
		mid: 15
	},
	jerrycan: 400,
	repair_kit: 600
};

const GAS_EXPLOSION_RADIUS = 25;
let gasPositionsCache: PositionEx[] | null = null;

class Gas extends Service {
	constructor() {
		super('gas', { name: 'АЗС', model: 361, color: 78, scale: 0.75 }, 5);
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'Gas-Buy': this.buy.bind(this)
		});
		mp.events.add('vehicleDeath', this.onVehicleDeath.bind(this));
	}

	private async getGasPositions(): Promise<PositionEx[]> {
		if (gasPositionsCache) {
			return gasPositionsCache;
		}

		try {
			const doc = await ServiceModel.findOne({ name: 'gas' }).lean();
			gasPositionsCache = doc?.positions ?? [];
		} catch {
			gasPositionsCache = [];
		}

		if (!gasPositionsCache.length) {
			const fallback = servicesData.find((s) => s.name === 'gas');
			gasPositionsCache = fallback?.positions ?? [];
		}

		return gasPositionsCache;
	}

	private onVehicleDeath(vehicle: VehicleMp) {
		if (!vehicle || !mp.vehicles.exists(vehicle)) return;
		const position = vehicle.position;
		this.getGasPositions().then((positions) => {
			const near = positions.some((p) => {
				const dx = position.x - p.x;
				const dy = position.y - p.y;
				const dz = position.z - p.z;
				return Math.sqrt(dx * dx + dy * dy + dz * dz) <= GAS_EXPLOSION_RADIUS;
			});
			if (!near) return;
			if (vehicle && mp.vehicles.exists(vehicle)) mp.vehicles.delete(vehicle);
		});
	}

	onKeyPress(player: Player) {
		const fuelType = this.getFuelType(player.mp.vehicle);

		player.callEvent('Gas-ShowMenu', [
			fuelType,
			{ ...prices, fuel: this.getPricePerLiter(fuelType) }
		]);
	}

	private getPricePerLiter(type: string) {
		return prices.fuel[type] as number;
	}

	private getFullPrice(basket: Basket, fuelType: string) {
		let fullPrice = 0;

		Object.entries(basket).forEach(([product, count]) => {
			if (!prices[product] || !isNumber(count) || count < 0 || count > 10000)
				throw new SilentError('wrong product');

			const price =
				product === 'fuel' ? this.getPricePerLiter(fuelType) : prices[product];

			fullPrice += price * count;
		});

		return fullPrice;
	}

	private getFuelType(vehicle: VehicleMp) {
		return vehicleCtrl.getTypeData(vehicle?.name).fuel;
	}

	private checkInventorySlots(player: Player, basket: Basket) {
		const items = Object.entries(basket).map(([name, amount]) => ({ name, amount }));

		playerInventory.checkEnoughSlots(player, items);
	}

	private addToInventory(player: Player, basket: Basket) {
		Object.entries(basket).forEach(([name, amount]) => {
			if (name !== 'fuel' && amount) playerInventory.addItem(player, { name, amount });
		});
	}

	private async buy(player: Player, basket: Basket, payment: PaymentType) {
		const { vehicle } = player.mp;
		const price = this.getFullPrice(basket, this.getFuelType(vehicle));

		this.checkInventorySlots(player, basket);

		await money.change(player, payment, -price, 'gas');

		if (basket.fuel && vehicle && player.isDriver()) {
			vehicleFuel.fillUp(vehicle, basket.fuel);
			await tasks.implement(player, 'refuel');
		}

		this.addToInventory(player, basket);
	}
}

const service = new Gas();
