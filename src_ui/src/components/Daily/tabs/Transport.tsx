import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';
import vehiclesList from 'data/vehicles.json';
import PrimaryTitle from 'components/Common/primary-title';
import GradientButton from 'components/Common/gradient-button';
import OutlineButton from 'components/Common/outline-button';

type VehicleData = {
	id: string;
	model: string;
	govNumber: string;
	spawned: boolean;
};

type State = {
	vehicles: VehicleData[];
	selected?: VehicleData;
};

export default class TabTransport extends Component<{}, State> {
	readonly state: State = { vehicles: [] };

	componentDidMount() {
		rpc
			.callServer('Vehicle-GetPlayerList')
			.then((items: VehicleData[]) => this.setState(() => ({ vehicles: items })))
			.catch(() => {});
	}

	selectVehicle(v?: VehicleData) {
		this.setState(() => ({ selected: v }));
	}

	async getPosition() {
		const { selected } = this.state;
		if (!selected) return;
		try {
			await rpc.callServer('Vehicle-MarkPosition', selected.id);
			showNotification('info', 'Местоположение ТС отмечено на карте');
		} catch (e: any) {
			showNotification('error', 'Сначала закажите данное ТС');
		}
	}

	async spawn() {
		const { selected } = this.state;
		if (!selected) return;
		try {
			const position = await rpc.callClient('Vehicle-GetSpawnCoords', selected.model);
			await rpc.callServer('Vehicle-DeliverForPlayer', [selected.id, position]);
			showNotification('info', 'Ваше ТС скоро будет доставлено');
		} catch (e: any) {
			showNotification('error', e?.msg || 'Ошибка');
		}
	}

	async despawn() {
		const { selected } = this.state;
		if (!selected) return;
		try {
			await rpc.callServer('Vehicle-DespawnItem', selected.id);
			showNotification('info', 'Ожидайте эвакуации в ближайшее время.');
			this.setState((s) => ({
				vehicles: s.vehicles.map((v) =>
					v.id === selected.id ? { ...v, spawned: false } : v
				),
				selected: { ...selected, spawned: false }
			}));
		} catch (e: any) {
			showNotification('error', e?.msg || 'Ошибка');
		}
	}

	render() {
		const { vehicles, selected } = this.state;

		return (
			<div className="daily_tab daily_tab--transport">
				<PrimaryTitle className="daily_tab-title">Транспорт</PrimaryTitle>
				<div className="daily_tab-inner">
					{selected ? (
						<>
							<div className="daily_tab-transport-info">
								<h4>{(vehiclesList as any)[selected.model] ?? selected.model}</h4>
								<span>{selected.govNumber}</span>
							</div>
							<div className="daily_tab-transport-actions">
								<OutlineButton onClick={this.getPosition.bind(this)}>
									Отметить на карте
								</OutlineButton>
								<GradientButton
									color="green"
									onClick={this.spawn.bind(this)}
									disabled={selected.spawned}
								>
									Заказать
								</GradientButton>
								<GradientButton
									onClick={this.despawn.bind(this)}
									disabled={!selected.spawned}
								>
									Эвакуировать
								</GradientButton>
								<OutlineButton onClick={() => this.selectVehicle()}>
									Назад
								</OutlineButton>
							</div>
						</>
					) : (
						<ul className="daily_tab-transport-list">
							{vehicles.length === 0 ? (
								<li className="daily_tab-transport-empty">Нет транспорта</li>
							) : (
								vehicles.map((v) => (
									<li
										key={v.id}
										className="daily_tab-transport-item"
										onClick={() => this.selectVehicle(v)}
									>
										<span>{(vehiclesList as any)[v.model] ?? v.model}</span>
										<span>{v.govNumber}</span>
									</li>
								))
							)}
						</ul>
					)}
				</div>
			</div>
		);
	}
}
