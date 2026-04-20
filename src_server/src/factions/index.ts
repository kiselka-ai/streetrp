import logger from 'utils/logger';
import FactionModel from 'models/Faction';
import coords from 'data/factions/coords.json';
import Faction from './faction';
import gangZones from './gangs/zones';
import './api';
import './leader';
import './actions';

class Factions {
	public items: { [name: string]: Faction };

	constructor() {
		this.items = {};

		mp.events.subscribe({
			'Factions-StartWork': this.startWork.bind(this),
			'Factions-FinishWork': this.finishWork.bind(this)
		});
	}

	async load() {
		// Сначала загружаем данные из базы данных для уже созданных фракций
		const cursor = await FactionModel.find().lean().cursor();
		const dbFactions = new Map<string, FactionModel>();

		cursor.on('data', (data: FactionModel) => {
			dbFactions.set(data.name, data);
		});

		cursor.on('close', () => {
			// Загружаем данные из БД для существующих фракций
			Object.values(this.items).forEach((faction) => {
				const dbData = dbFactions.get(faction.name);
				if (dbData) {
					faction.load(dbData);
				} else {
					// Если фракции нет в БД, выводим предупреждение
					console.warn(
						`[FACTIONS] Faction "${faction.name}" not found in database. It will work with default values.`
					);
				}
			});

			gangZones.load();

			logger.success(`Factions loaded: ${Object.keys(this.items).length}`);
		});
	}

	getFaction(name: string) {
		return this.items[name];
	}

	addFaction(faction: Faction) {
		this.items[faction.name] = faction;
	}

	getCoords(faction: string) {
		return coords[faction];
	}

	isGovMember(player: Player) {
		const faction = this.getFaction(player.faction);

		return faction && faction.government;
	}

	loadForPlayer(player: Player, faction?: Faction) {
		const playerFaction =
			faction ??
			Object.values(this.items).find((item) => {
				return item.members.getMember(player);
			});

		if (!playerFaction) return;

		const inFaction = !faction || playerFaction.inFaction(player);

		player.faction = inFaction && playerFaction.name;
		player.mp.setVariable('faction', player.faction);
		player.mp.setOwnVariable('govMember', this.isGovMember(player));

		playerFaction.setPointsVisible(player, inFaction);
	}

	finishWork(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.finishWork(player);
	}

	private startWork(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.startWork(player);
	}
}

export { Faction };
export default new Factions();
