import React, { Component } from 'react';
import rpc from 'utils/rpc';

type State = {
	greenZone: boolean;
};

export default class GreenZone extends Component<{}, State> {
	readonly state: State = {
		greenZone: false
	};

	componentDidMount() {
		rpc.register('HUD-SetLocation', (data: { greenZone?: boolean; street?: string; zone?: string }) => {
			// Обновляем состояние greenZone при любом обновлении локации
			if (data && typeof data.greenZone === 'boolean') {
				this.setState({ greenZone: data.greenZone });
			}
		});

		// Получаем начальное состояние
		this.getCurrentLocation();
		
		// Периодически проверяем состояние (каждые 2 секунды)
		this.checkInterval = setInterval(() => {
			this.getCurrentLocation();
		}, 2000);
	}

	componentWillUnmount() {
		rpc.unregister('HUD-SetLocation');
		if (this.checkInterval) {
			clearInterval(this.checkInterval);
		}
	}

	async getCurrentLocation() {
		try {
			const location = await rpc.callClient('getPlayerLocation');
			if (location && location.greenZone !== undefined) {
				this.setState({ greenZone: location.greenZone });
			}
		} catch (err) {
			// Игнорируем ошибки при получении локации
		}
	}

	render() {
		const { greenZone } = this.state;

		if (!greenZone) return null;

		return (
			<div className="hud_green-zone">
				<div className="hud_green-zone-icon">🟢</div>
				<span className="hud_green-zone-text">Green Zone</span>
			</div>
		);
	}
}
