import moment from 'moment';
import level from 'player/level';
import factions from 'factions';

class PlayerMenu {
	constructor() {
		mp.events.subscribe({
			'Player-GetCharacterMenuData': this.getData.bind(this)
		});
	}

	private getData(player: Player) {
		const currentLevel = level.getLevelFromExp(player.experience);
		const faction = player.faction
			? factions.getFaction(player.faction)?.name ?? player.faction
			: null;

		return {
			name: player.getName(),
			level: currentLevel,
			experience: [player.experience, level.getNeededExp(currentLevel)] as [number, number],
			faction: faction ?? '—',
			registerAt: player.registerAt
				? moment(player.registerAt).format('DD.MM.YYYY')
				: '—'
		};
	}
}

export default new PlayerMenu();
