import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import OutlineButton from 'components/Common/outline-button';
import PrimaryTitle from 'components/Common/primary-title';
import tabs from './tabs';

type Props = {} & RouteComponentProps;
type State = {
	level: number;
	activeTab?: string;
};

export default class Admin extends Component<Props, State> {
	readonly state: State = {
		level: 0,
		activeTab: undefined
	};

	componentDidMount() {
		this.setState(() => this.props.location.state);
	}

	openTab(name: string) {
		this.setState(() => ({ activeTab: name }));
	}

	closeTab() {
		this.setState(() => ({ activeTab: undefined }));
	}

	render() {
		const { level, activeTab } = this.state;

		if (!level) return null;

		const availableTabs = tabs[level - 1].filter((tab) => tab.component);
		const activeTabData = availableTabs.find((tab) => tab.name === activeTab);

		if (activeTabData && activeTabData.component) {
			return (
				<div className="admin">
					<div className="admin_content">
						<PrimaryTitle className="admin_content-title">{activeTabData.name}</PrimaryTitle>
						<div className="admin_content-body">
							{React.createElement(activeTabData.component)}
						</div>
						<div className="admin_content-footer">
							<OutlineButton onClick={this.closeTab.bind(this)}>Назад</OutlineButton>
							<OutlineButton isClose>
								Закрыть
							</OutlineButton>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className="admin">
				<PrimaryTitle className="admin_title">Панель администратора</PrimaryTitle>

				<div className="admin_grid">
					{availableTabs.map((item, index) => (
						<div
							key={index}
							className={item.component ? 'admin_card' : 'admin_card disabled'}
							onClick={() => item.component && this.openTab(item.name)}
						>
							<h3 className="admin_card-title">{item.name}</h3>
						</div>
					))}
				</div>
				<OutlineButton className="admin_close-btn" isClose>
					Закрыть
				</OutlineButton>
			</div>
		);
	}
}
