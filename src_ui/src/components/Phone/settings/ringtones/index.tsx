import React, { Component } from 'react';
import rpc from 'utils/rpc';
import Navigation from '../../partials/navigation';
import Item from './item';

import soundLockpick from 'assets/audio/lockpick.mp3';
import soundLock from 'assets/audio/lock.mp3';
import soundCash from 'assets/audio/cash-pay.mp3';
import soundBank from 'assets/audio/bank-pay.mp3';

const RINGTONE_SAMPLES = [soundLock, soundBank, soundCash, soundLockpick];

// Рингтоны iPhone 15 Pro Max
const ringtoneSounds = [
	{ id: 'opening', name: 'Opening' },
	{ id: 'night-owl', name: 'Night Owl' },
	{ id: 'radar', name: 'Radar' },
	{ id: 'summit', name: 'Summit' },
	{ id: 'waves', name: 'Waves' },
	{ id: 'by-the-seaside', name: 'By The Seaside' },
	{ id: 'bright-lights', name: 'Bright Lights' },
	{ id: 'chimes', name: 'Chimes' },
	{ id: 'constellation', name: 'Constellation' },
	{ id: 'cosmic', name: 'Cosmic' },
	{ id: 'crystals', name: 'Crystals' },
	{ id: 'dreams', name: 'Dreams' },
	{ id: 'early-sun', name: 'Early Sun' },
	{ id: 'first-light', name: 'First Light' },
	{ id: 'hillside', name: 'Hillside' },
	{ id: 'playtime', name: 'Playtime' },
	{ id: 'presto', name: 'Presto' },
	{ id: 'reflection', name: 'Reflection' },
	{ id: 'ripples', name: 'Ripples' },
	{ id: 'sencha', name: 'Sencha' },
	{ id: 'signal', name: 'Signal' },
	{ id: 'slow-rise', name: 'Slow Rise' },
	{ id: 'stargaze', name: 'Stargaze' },
	{ id: 'timba', name: 'Timba' },
	{ id: 'twinkle', name: 'Twinkle' }
];

type Props = {
	close: () => void;
};

type State = {
	current?: string;
	playing?: string;
};

export default class SettingsRingtones extends Component<Props, State> {
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
		await rpc.callClient('Phone-SetRingtoneSound', name);
	}

	playSound(name: string) {
		if (this.state.playing === name) {
			this.stopPlayback();
			return;
		}

		this.stopPlayback();

		const idx = ringtoneSounds.findIndex((s) => s.id === name);
		const src = RINGTONE_SAMPLES[idx % RINGTONE_SAMPLES.length];
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
			<div className="settings_ringtones">
				<Navigation title="Рингтоны" close={{ title: 'Настройки', onClick: this.props.close }} />

				<div className="settings_ringtones-items">
					<div className="settings_ringtones-group">
						{ringtoneSounds.map((sound) => (
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
