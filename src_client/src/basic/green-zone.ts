import zones from 'data/green-zones.json';
import hud from './hud';

class GreenZone {
	private within = false;

	constructor() {
		this.init();
	}

	get playerWithin() {
		return this.within;
	}

	private create(x: number, y: number, range: number) {
		const colshape = mp.colshapes.newCircle(x, y, range);

		colshape.greenZone = true;
	}

	private getStreetName(position: Vector3Mp) {
		const data = mp.game.pathfind.getStreetNameAtCoord(
			position.x,
			position.y,
			position.z,
			0,
			0
		);

		return mp.game.ui.getStreetNameFromHashKey(data.streetName);
	}

	private getZoneName(position: Vector3Mp) {
		return mp.game.ui.getLabelText(
			mp.game.zone.getNameOfZone(position.x, position.y, position.z)
		);
	}

	private onEnter(colshape: ColshapeMp) {
		if (colshape.greenZone) {
			this.within = true;
			this.updateHUD();
		}
	}

	private onExit(colshape: ColshapeMp) {
		if (colshape.greenZone) {
			this.within = false;
			this.updateHUD();
		}
	}

	private updateHUD() {
		// Немедленно обновляем HUD при входе/выходе из зеленой зоны
		const { position } = mp.players.local;
		const street = this.getStreetName(position);
		const zone = this.getZoneName(position);
		
		hud.setLocation(street, zone, this.within);
	}

	private checkInitialState() {
		// Проверяем начальное состояние - находимся ли мы уже в зеленой зоне
		const { position } = mp.players.local;
		if (!position) return;
		
		let found = false;
		for (const zone of zones) {
			const distance = Math.sqrt(
				Math.pow(position.x - zone.x, 2) + Math.pow(position.y - zone.y, 2)
			);
			
			if (distance <= zone.range) {
				if (!this.within) {
					this.within = true;
					this.updateHUD();
				}
				found = true;
				break;
			}
		}
		
		// Если не нашли зону, но мы были в зоне - выходим
		if (!found && this.within) {
			this.within = false;
			this.updateHUD();
		}
	}

	private init() {
		zones.forEach(({ x, y, range }) => this.create(x, y, range));

		mp.events.subscribeToDefault({
			playerEnterColshape: this.onEnter.bind(this),
			playerExitColshape: this.onExit.bind(this)
		});

		// Проверяем начальное состояние после небольшой задержки
		setTimeout(() => this.checkInitialState(), 1000);
		
		// Периодическая проверка состояния каждые 2 секунды (на случай если события не сработали)
		setInterval(() => this.checkInitialState(), 2000);
	}
}

export default new GreenZone();
