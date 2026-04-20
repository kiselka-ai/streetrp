import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';

export default class SettingsAudio extends Component {
	async reload() {
		try {
			await rpc.callClient('Voice-Reload');
			showNotification('info', 'Голосовой чат перезагружен');
		} catch (error) {
			showNotification('error', 'Ошибка перезагрузки голосового чата');
		}
	}

	render() {
		return (
			<div className="daily_tab-settings-audio">
				<h3 className="daily_tab-settings-section-title">Настройки аудио</h3>
				<div className="daily_tab-settings-audio-content">
					<p className="daily_tab-settings-audio-desc">
						Управление настройками звука и голосового чата
					</p>
					<button
						type="button"
						className="daily_tab-settings-audio-reload"
						onClick={this.reload.bind(this)}
					>
						Перезагрузить голосовой чат
					</button>
				</div>
			</div>
		);
	}
}
