import React, { Component } from 'react';
import rpc from 'utils/rpc';
import Navigation from '../../partials/navigation';
import Item from './item';

import soundLockpick from 'assets/audio/lockpick.mp3';
import soundLock from 'assets/audio/lock.mp3';
import soundCash from 'assets/audio/cash-pay.mp3';
import soundBank from 'assets/audio/bank-pay.mp3';

const NOTIFICATION_SAMPLES = [soundLockpick, soundLock, soundCash, soundBank];

// Звуки уведомлений iPhone 15 Pro Max
const notificationSounds = [
	{ id: 'note', name: 'Note' },
	{ id: 'anticipate', name: 'Anticipate' },
	{ id: 'aurora', name: 'Aurora' },
	{ id: 'beacon', name: 'Beacon' },
	{ id: 'bulletin', name: 'Bulletin' },
	{ id: 'by-the-seaside', name: 'By The Seaside' },
	{ id: 'chimes', name: 'Chimes' },
	{ id: 'circuit', name: 'Circuit' },
	{ id: 'constellation', name: 'Constellation' },
	{ id: 'cosmic', name: 'Cosmic' },
	{ id: 'crystals', name: 'Crystals' },
	{ id: 'hillside', name: 'Hillside' },
	{ id: 'news-flash', name: 'News Flash' },
	{ id: 'opening', name: 'Opening' },
	{ id: 'playtime', name: 'Playtime' },
	{ id: 'presto', name: 'Presto' },
	{ id: 'radar', name: 'Radar' },
	{ id: 'reflection', name: 'Reflection' },
	{ id: 'ripples', name: 'Ripples' },
	{ id: 'sencha', name: 'Sencha' },
	{ id: 'signal', name: 'Signal' },
	{ id: 'slow-rise', name: 'Slow Rise' },
	{ id: 'summit', name: 'Summit' },
	{ id: 'timba', name: 'Timba' },
	{ id: 'trill', name: 'Trill' },
	{ id: 'twinkle', name: 'Twinkle' },
	{ id: 'waves', name: 'Waves' }
];

type Props = {
	close: () => void;
};

type State = {
	current?: string;
	playing?: string;
};

export default class SettingsNotifications extends Component<Props, State> {
	private currentAudio: HTMLAudioElement | null = null;

	readonly state: State = {};

	componentWillUnmount() {
		this.stopPlayback();
	}

	stopPlayback() {
		if (this.currentAudio) {
			this.currentAudio.pause();
			this.currentAudio.currentTime = 0;
			this.currentAudio = null;
		}
		this.setState({ playing: undefined });
	}

	async changeSound(name: string) {
		this.setState({ current: name });
		await rpc.callClient('Phone-SetNotificationSound', name);
	}

	playSound(name: string) {
		if (this.state.playing === name) {
			this.stopPlayback();
			return;
		}

		this.stopPlayback();

		const idx = notificationSounds.findIndex((s) => s.id === name);
		const src = NOTIFICATION_SAMPLES[idx % NOTIFICATION_SAMPLES.length];
		const audio = new Audio(src);

		audio.onended = () => this.setState({ playing: undefined });
		audio.onerror = () => this.setState({ playing: undefined });
		audio.play().catch(() => this.setState({ playing: undefined }));

		this.currentAudio = audio;
		this.setState({ playing: name });
	}

	render() {
		const { current, playing } = this.state;

		return (
			<div className="settings_notifications">
				<Navigation title="Уведомления" close={{ title: 'Настройки', onClick: this.props.close }} />

				<div className="settings_notifications-items">
					<div className="settings_notifications-group">
						{notificationSounds.map((sound) => (
							<Item
								key={sound.id}
								name={sound.name}
								id={sound.id}
								selected={current === sound.id}
								playing={playing === sound.id}
								onSelect={this.changeSound.bind(this, sound.id)}
								onPlay={this.playSound.bind(this, sound.id)}
							/>
						))}
					</div>
				</div>
			</div>
		);
	}
}
