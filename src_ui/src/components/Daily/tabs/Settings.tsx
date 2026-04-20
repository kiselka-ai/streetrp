import React, { Component } from 'react';
import classNames from 'classnames';
import PrimaryTitle from 'components/Common/primary-title';
import SettingsKeys from './settings/Keys';
import SettingsAudio from './settings/Audio';
import SettingsMacros from './settings/Macros';

type TabId = 'keys' | 'audio' | 'macros';

const TABS: { id: TabId; label: string }[] = [
	{ id: 'keys', label: 'Клавиши' },
	{ id: 'audio', label: 'Аудио' },
	{ id: 'macros', label: 'Макросы' }
];

type State = {
	activeTab: TabId;
};

export default class TabSettings extends Component<{}, State> {
	readonly state: State = {
		activeTab: 'keys'
	};

	renderContent() {
		const { activeTab } = this.state;

		switch (activeTab) {
			case 'keys':
				return <SettingsKeys />;
			case 'audio':
				return <SettingsAudio />;
			case 'macros':
				return <SettingsMacros />;
			default:
				return null;
		}
	}

	render() {
		const { activeTab } = this.state;

		return (
			<div className="daily_tab daily_tab--settings">
				<PrimaryTitle className="daily_tab-title">Настройки</PrimaryTitle>
				<div className="daily_tab-settings-container">
					<nav className="daily_tab-settings-sidebar">
						{TABS.map(({ id, label }) => (
							<button
								key={id}
								type="button"
								className={classNames('daily_tab-settings-sidebar-item', {
									active: activeTab === id
								})}
								onClick={() => this.setState(() => ({ activeTab: id }))}
							>
								{label}
							</button>
						))}
					</nav>
					<div className="daily_tab-settings-content">{this.renderContent()}</div>
				</div>
			</div>
		);
	}
}
