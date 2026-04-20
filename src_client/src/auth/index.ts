import hud from 'basic/hud';
import gangZones from 'factions/gang/zones';

const player = mp.players.local;

class Auth {
	constructor() {
		mp.events.subscribe({
			'Auth-ShowMenu': this.showMenu,
			'Auth-SuccessLogin': this.onLogin,
			'Auth-SuccessRegister': this.onRegister.bind(this)
		});
	}

	private showMenu() {
		mp.browsers.showPage('auth', { email: mp.storage.data.login });
		gangZones.load();
	}

	private onLogin(email: string) {
		mp.storage.update({ login: email });

		setInterval(() => mp.discord.update('Играет', 'на server'), 10000);
		mp.gui.chat.push(`Добро пожаловать на Server RolePlay, ${player.name}`);
		mp.gui.chat.push(`!{FF0082} Сервер на этапе разработке возможны баги, ошибки и вылеты `);

		hud.updateOnline();
		hud.setPlayerId();

		if (player.getVariable('isNewbie')) {
			return mp.events.callServer('Character-ShowCreator');
		}

		mp.events.callServer('Spawn-ShowMenu');
		player.freezePosition(false);
	}

	private onRegister(email: string) {
		mp.storage.update({ login: email });
	}
}

const auth = new Auth();
