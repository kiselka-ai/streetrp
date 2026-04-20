import binder from 'utils/binder';
import scenarios from './scenarios';
import voice from './voice';

const localPlayer = mp.players.local;

class Phone {
	public interlocutor: PlayerMp;

	private menu: boolean;

	constructor() {
		binder.bind('phone', 'P', this.toggleMenu.bind(this), null);

		this.subscribeToEvents();
	}

	canOpenMenu() {
		if (localPlayer.getVariable('inHand')) {
			mp.game.ui.notifications.show('error', 'Уберите предмет из рук');
			return false;
		}

		return (
			!mp.gui.cursor.visible &&
			mp.browsers.hud &&
			!localPlayer.isFalling() &&
			!localPlayer.isSwimmingUnderWater() &&
			!localPlayer.isCuffed() &&
			!localPlayer.getVariable('isPlayingAnim') &&
			!localPlayer.getVariable('imprisoned')
		);
	}

	private async toggleMenu() {
		if (this.menu) {
			const canClose = await mp.events.callBrowser('Phone-CanClose');
			if (!canClose) return;

			scenarios.stopLocal();

			this.menu = false;
			mp.browsers.hidePage();
		} else if (this.canOpenMenu()) {
			this.openMenu();
		}
	}

	private openMenu() {
		scenarios.playLocal('use_phone');

		const wallpaper = mp.storage?.data?.phone?.wallpaper || '0';
		mp.events.callBrowser('Phone-SetWallpaper', wallpaper);
		mp.browsers.showPage('phone');
		mp.browsers.setHideBind(() => this.toggleMenu(), 'esc');
		mp.game.ui.displayRadar(true);
		mp.gui.chat.show(true);

		this.menu = true;
	}

	private async startCall(player: PlayerMp) {
		if (this.interlocutor) return;

		this.interlocutor = player;

		mp.events.callRemote('Voice-AddListener', player);

		player.voiceVolume = 1.0;
		player.voice3d = false;

		voice.removeListener(player, false);

		await mp.events.callBrowser('Phone-AcceptCall');
	}

	private async stopCall() {
		await mp.events.callBrowser('Phone-DeclineCall');

		if (!this.interlocutor) return;

		if (mp.players.exists(this.interlocutor)) {
			const localPos = localPlayer.position;
			const playerPos = this.interlocutor.position;
			const dist = mp.game.system.vdist(
				playerPos.x,
				playerPos.y,
				playerPos.z,
				localPos.x,
				localPos.y,
				localPos.z
			);

			if (dist > voice.range) {
				mp.events.callRemote('Voice-RemoveListener', this.interlocutor);
			} else voice.addListener(this.interlocutor, false);
		} else mp.events.callRemote('Voice-RemoveListener', this.interlocutor);

		this.interlocutor = null;
	}

	private setWallpaper(name: string) {
		const currentPhone = mp.storage?.data?.phone || {};
		mp.storage.update({ phone: { ...currentPhone, wallpaper: name } });
		mp.events.callBrowser('Phone-SetWallpaper', name, false);
	}

	private playNotificationSound(name: string) {
		// Воспроизводим звук уведомления через системный звук
		// В реальном проекте здесь будет путь к файлу звука iPhone
		mp.game.audio.playSoundFrontend(-1, 'CHECKPOINT_PERFECT', 'HUD_MINI_GAME_SOUNDSET', true);
	}

	private playRingtoneSound(name: string) {
		// Воспроизводим рингтон через системный звук
		// В реальном проекте здесь будет путь к файлу рингтона iPhone
		mp.game.audio.playSoundFrontend(-1, 'CHECKPOINT_PERFECT', 'HUD_MINI_GAME_SOUNDSET', true);
	}

	private setNotificationSound(name: string) {
		const currentPhone = mp.storage?.data?.phone || {};
		mp.storage.update({ phone: { ...currentPhone, notificationSound: name } });
	}

	private setRingtoneSound(name: string) {
		const currentPhone = mp.storage?.data?.phone || {};
		mp.storage.update({ phone: { ...currentPhone, ringtoneSound: name } });
	}

	private subscribeToEvents() {
		mp.events.subscribe({
			'Phone-StartCall': this.startCall.bind(this),
			'Phone-StopCall': this.stopCall.bind(this),
			'Phone-SetWallpaper': this.setWallpaper,
			'Phone-CanOpen': this.canOpenMenu,
			'Phone-SetNotificationSound': this.setNotificationSound.bind(this),
			'Phone-PlayNotificationSound': this.playNotificationSound.bind(this),
			'Phone-SetRingtoneSound': this.setRingtoneSound.bind(this),
			'Phone-PlayRingtoneSound': this.playRingtoneSound.bind(this)
		});
	}
}

export default new Phone();
