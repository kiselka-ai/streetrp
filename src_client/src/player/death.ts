import effects from 'helpers/effects';
import antiCheat from 'basic/anti-cheat';

const localPlayer = mp.players.local;

class PlayerDeath {
	private timeout?: NodeJS.Timeout;

	private groundCheckTimeout?: NodeJS.Timeout;

	constructor() {
		mp.events.subscribe({
			'Player-ShowDeathMenu': this.showMenu.bind(this),
			'Player-ClientDie': this.die.bind(this)
		});

		mp.events.subscribeToData({
			isDying: (player: PlayerMp, status: boolean) => {
				if (status || localPlayer.handle !== player.handle) return;

				this.die(false);
			}
		});
	}

	private fixFloatingBody() {
		if (localPlayer.vehicle) return;

		const pos = localPlayer.position;
		const groundZ = mp.game.gameplay.getGroundZFor3dCoord(
			pos.x,
			pos.y,
			pos.z + 1,
			0.0,
			false
		);

		const diff = pos.z - groundZ;
		const validGround = (groundZ !== 0 || pos.z < 2) && groundZ < pos.z;
		if (validGround && diff > 0.15 && diff < 20) {
			localPlayer.position = new mp.Vector3(pos.x, pos.y, groundZ);
		}
	}

	private showMenu(duration: number, medics: number) {
		this.reset();
		this.timeout = setTimeout(this.die.bind(this), duration);

		mp.browsers.showPage('player/death', { duration, medics }, true, true);

		this.groundCheckTimeout = setTimeout(() => {
			this.groundCheckTimeout = undefined;
			this.fixFloatingBody();
		}, 150);
	}

	private async die(remote = true) {
		this.reset();
		effects.stopAll();

		if (remote) {
			antiCheat.sleep(6000);
			await mp.events.callServer('Player-Die');
		}

		mp.browsers.hidePage();
	}

	private reset() {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = undefined;
		}
		if (this.groundCheckTimeout) {
			clearTimeout(this.groundCheckTimeout);
			this.groundCheckTimeout = undefined;
		}
	}
}

const death = new PlayerDeath();
