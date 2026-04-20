import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { RouteComponentProps } from 'react-router-dom';
import PrimaryTitle from 'components/Common/primary-title';

type MenuData = {
	name: string;
	level: number;
	experience: [number, number];
	faction: string;
	registerAt: string;
};

type Props = {} & RouteComponentProps;
type State = Partial<MenuData> & { loading: boolean };

export default class PlayerMenu extends Component<Props, State> {
	readonly state: State = {
		loading: true,
		name: '',
		level: 0,
		experience: [0, 1],
		faction: '—',
		registerAt: '—'
	};

	componentDidMount() {
		rpc
			.callServer('Player-GetCharacterMenuData')
			.then((data: MenuData) =>
				this.setState(() => ({ ...data, loading: false }))
			)
			.catch(() => this.setState(() => ({ loading: false })));
	}

	close() {
		rpc.callClient('Browser-HidePage');
	}

	render() {
		const { loading, name, level, experience, faction, registerAt } = this.state;
		const expPercent = Math.min(
			100,
			((experience?.[0] ?? 0) / (experience?.[1] || 1)) * 100
		);

		return (
			<div className="player-menu">
				<p className="player-menu_username">{name}</p>

				<div className="player-menu_container">
					<div className="player-menu_stats">
						<PrimaryTitle className="player-menu_stats-title">
							Персонаж
						</PrimaryTitle>

						{loading ? (
							<div className="player-menu_loading">Загрузка...</div>
						) : (
							<div className="player-menu_stats-inner">
								<div className="player-menu_exp">
									<h4 className="player-menu_label">Опыт</h4>
									<div className="player-menu_progress">
										<div className="player-menu_progress-bar">
											<div
												className="player-menu_progress-fill"
												style={{ width: `${expPercent}%` }}
											/>
										</div>
										<div className="player-menu_progress-points">
											{experience?.[0] ?? 0} / {experience?.[1] ?? 1}
										</div>
									</div>
								</div>

								<div className="player-menu_level">
									<h4 className="player-menu_label">Уровень</h4>
									<span className="player-menu_level-value">{level}</span>
								</div>

								<div className="player-menu_row">
									<span className="player-menu_label">Организация</span>
									<span className="player-menu_value">{faction}</span>
								</div>

								<div className="player-menu_row">
									<span className="player-menu_label">Дата регистрации</span>
									<span className="player-menu_value">{registerAt}</span>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="player-menu_footer">
					<button
						type="button"
						className="player-menu_btn player-menu_btn--close"
						onClick={this.close.bind(this)}
					>
						Закрыть
					</button>
				</div>
			</div>
		);
	}
}
