import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { connect } from 'react-redux';
import { StoreState } from 'store';
import classNames from 'classnames';
import GradientButton from 'components/Common/gradient-button';
import OutlineButton from 'components/Common/outline-button';
import Bonus from './bonus';
import Stats from './stats';
import Tasks from './tasks';
import TabTransport from './tabs/Transport';
import TabReferral from './tabs/Referral';
import TabReports from './tabs/Reports';
import TabDonation from './tabs/Donation';
import TabSettings from './tabs/Settings';

const TABS = [
	{ id: 'stats', label: 'Статистика' },
	{ id: 'tasks', label: 'Задания' },
	{ id: 'bonus', label: 'Ежедневный бонус' },
	{ id: 'transport', label: 'Транспорт' },
	{ id: 'referral', label: 'Рефералы' },
	{ id: 'reports', label: 'Репорты' },
	{ id: 'donation', label: 'Донат' },
	{ id: 'settings', label: 'Настройки' }
] as const;

type TabId = (typeof TABS)[number]['id'];

type Props = ReturnType<typeof mapStateToProps>;
type State = {
	activeTab: TabId;
	experience: [number, number];
	level: number;
	name: string;
	day: number;
	tasks: { [name: string]: number[] };
	news: string;
	bonuses: number[];
};

class Daily extends Component<Props, State> {
	private checkInterval?: NodeJS.Timeout;

	readonly state: State = {
		activeTab: 'stats',
		experience: [0, 0],
		level: 0,
		name: '',
		day: 0,
		tasks: {},
		news: 'update',
		bonuses: [1000, 2000, 3000, 4000, 5000, 6000, 7000]
	};

	componentDidMount() {
		rpc.callServer('Daily-GetData').then((data) => this.setState(() => data));
	}

	async getBonus() {
		await rpc.callServer('Daily-GetAward');
		this.setState(() => ({ day: -1 }));
	}

	renderTabContent() {
		const { level, experience, tasks, day, bonuses } = this.state;
		const { activeTab } = this.state;

		switch (activeTab) {
			case 'stats':
				return (
					<div className="daily_tab daily_tab--stats">
						<Stats
							money={this.props.money.points}
							level={level}
							experience={experience}
						/>
					</div>
				);
			case 'tasks':
				return (
					<div className="daily_tab daily_tab--tasks">
						<Tasks items={tasks} />
					</div>
				);
			case 'bonus':
				return (
					<div className="daily_tab daily_tab--bonus">
						<Bonus current={day} items={bonuses} />
					</div>
				);
			case 'transport':
				return <TabTransport />;
			case 'referral':
				return <TabReferral />;
			case 'reports':
				return <TabReports />;
			case 'donation':
				return <TabDonation />;
			case 'settings':
				return <TabSettings />;
			default:
				return null;
		}
	}

	render() {
		const { name, activeTab, day, bonuses } = this.state;
		const isBonusTab = activeTab === 'bonus';

		return (
			<div className="daily">
				<div className="daily_container-wrapper">
					<p className="daily_username">{name}</p>

					<div className="daily_wrapper">
						<nav className="daily_tabs">
							{TABS.map(({ id, label }) => (
								<button
									key={id}
									type="button"
									className={classNames('daily_tabs-item', {
										active: activeTab === id
									})}
									onClick={() => this.setState(() => ({ activeTab: id }))}
								>
									{label}
								</button>
							))}
						</nav>

						<div className="daily_content">
							<div className="daily_container">{this.renderTabContent()}</div>

							<div className="daily_footer">
								{isBonusTab && (
									<GradientButton
										disabled={day < 0}
										onClick={this.getBonus.bind(this)}
									>
										Забрать
									</GradientButton>
								)}
								<OutlineButton className="daily_footer-close" isClose>
									Закрыть
								</OutlineButton>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state: StoreState) => ({
	money: state.player.money
});

export default connect(mapStateToProps, {})(Daily);
