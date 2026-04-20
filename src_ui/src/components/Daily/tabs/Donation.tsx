import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { connect } from 'react-redux';
import { StoreState } from 'store';
import { showNotification } from 'utils/notifications';
import PrimaryTitle from 'components/Common/primary-title';
import Point from 'components/Common/point';
import GradientButton from 'components/Common/gradient-button';
import products from '../../Phone/donation/products.json';

type Props = ReturnType<typeof mapStateToProps>;
type State = { prices: Record<string, number> };

class TabDonation extends Component<Props, State> {
	readonly state: State = { prices: {} };

	componentDidMount() {
		rpc
			.callServer('Donation-GetPrices')
			.then((prices: Record<string, number>) => this.setState(() => ({ prices })))
			.catch(() => {});
	}

	async buy(name: string) {
		try {
			await rpc.callServer('Donation-Buy', name);
			showNotification('success', 'Успешная покупка!');
		} catch (e: any) {
			showNotification('error', e?.msg || 'Ошибка');
		}
	}

	render() {
		const { prices } = this.state;

		return (
			<div className="daily_tab daily_tab--donation">
				<PrimaryTitle className="daily_tab-title">Донат</PrimaryTitle>
				<div className="daily_tab-inner">
					<div className="daily_tab-donation-balance">
						<Point amount={this.props.money.points} />
					</div>
					<ul className="daily_tab-donation-list">
						{Object.entries(prices).map(([name, price]) => {
							const item = (products as any)[name];
							if (!item) return null;
							return (
								<li key={name} className="daily_tab-donation-item">
									<div>
										<strong>{item.title}</strong>
										<span>{item.description}</span>
									</div>
									<div className="daily_tab-donation-right">
										<Point amount={price} />
										<GradientButton
											className="daily_tab-donation-btn"
											onClick={() => this.buy(name)}
										>
											Купить
										</GradientButton>
									</div>
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state: StoreState) => ({
	money: state.player.money
});

export default connect(mapStateToProps, {})(TabDonation);
