import cryptoRandomString from 'crypto-random-string';
import VehicleModel from 'models/Vehicle';
import Builder from './builder';
import vehicleState from './state';
import vehicleCtrl from './index';
import { Tuning } from './tuning';

class VehicleCreator {
	async buildForPlayer(player: Player, builder: Builder) {
		const govNumber = await this.generateNumber();

		builder.setNumberPlate(govNumber);
		builder.setOwner(player.dbId);

		const vehicle = builder.build();
		const fuel = vehicle.getVariable('fuel');
		const tuning = vehicle.getVariable('tuning');

		if (!fuel) {
			// Защита: если fuel не установлен, устанавливаем его
			const { tank } = vehicleCtrl.getTypeData(vehicle.name);
			vehicle.setVariable('fuel', { current: tank, max: tank });
		}

		const doc = await VehicleModel.create({
			name: vehicle.name,
			owner: player.dbId,
			fuel: fuel?.current ?? vehicle.getVariable('fuel').current,
			govNumber,
			tuning
		});

		mp.vehicles.authorize(vehicle, doc._id);
		player.vehicles.push(vehicle.dbId);

		return vehicle;
	}

	buildTemporary(
		model: string,
		position: PositionEx,
		heading = 90,
		owner?: VehicleOwner,
		tuning?: Partial<Tuning>
	) {
		const builder = new Builder(model, position, heading);

		builder.setNumberPlate('STREETRP');
		builder.installTuning(tuning);
		if (owner) builder.setOwner(owner.player, owner.faction);

		return builder.build();
	}

	spawnForPlayer(player: Player, position: PositionEx, data: VehicleModel) {
		const builder = new Builder(data.name, position, 90);

		builder.setNumberPlate(data.govNumber);
		builder.installTuning(data.tuning);
		builder.setOwner(player.dbId);

		const vehicle = builder.build();

		vehicle.locked = data.state?.locked || false;
		vehicle.inventory = data.inventory;
		vehicleState.update(vehicle, data.state);
		
		// Принудительно заглушаем двигатель при спавне через телефон
		vehicleState.setEngineStatus(vehicle, false);
		
		const existingFuel = vehicle.getVariable('fuel');
		const { tank } = vehicleCtrl.getTypeData(data.name);
		vehicle.setVariable('fuel', {
			current: data.fuel ?? (existingFuel?.current ?? tank),
			max: existingFuel?.max ?? tank
		});

		mp.vehicles.authorize(vehicle, data._id);

		return vehicle;
	}

	private async generateNumber() {
		let number: string;

		do {
			const str = cryptoRandomString({ length: 8 }).toUpperCase();
			const isExists = await VehicleModel.findOne({ govNumber: str }).countDocuments();

			if (!isExists) number = str;
		} while (!number);

		return number;
	}
}

export { Builder };
export default new VehicleCreator();
