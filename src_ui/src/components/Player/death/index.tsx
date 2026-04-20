import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { RouteComponentProps } from 'react-router-dom';
import { showNotification } from 'utils/notifications';
import PrimaryTitle from 'components/Common/primary-title';
import OutlineButton from 'components/Common/outline-button';
import GradientButton from 'components/Common/gradient-button';
import Timer from './timer';

type Props = {} & RouteComponentProps;
type State = {
	duration: number;
	medics: number;
};

export default class Death extends Component<Props, State> {
	readonly state: State = {
		duration: 0,
		medics: 0
	};

	componentDidMount() {
		this.setState(() => this.props.location.state);
	}

	die() {
		rpc.callClient('Player-ClientDie');
	}

	callMedic() {
		rpc
			.callServer('EmsCalls-Create')
			.then(() => showNotification('info', 'Ваш вызов был зарегистрирован'));
	}

	render() {
		const { duration } = this.state;

		return (
			<div className="death">
				<div className="death_inner">
					<PrimaryTitle className="death_title">Вы ранены</PrimaryTitle>

					<Timer duration={duration / 1000} />

					<div className="death_actions">
						<GradientButton
							className="death_btn death_btn--primary"
							color="green"
							onClick={this.callMedic}
						>
							Вызов медиков
						</GradientButton>
						<OutlineButton className="death_btn" onClick={this.die}>
							Обморок
						</OutlineButton>
					</div>

					<div className="death_descr">Обморок — доставка в больницу</div>
				</div>
			</div>
		);
	}
}
