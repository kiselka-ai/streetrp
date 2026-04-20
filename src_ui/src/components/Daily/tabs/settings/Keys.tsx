import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';
import KeysList from './KeysList';

const items: { [name: string]: string } = {
	cursor: 'Курсор',
	noHUD: 'Видимость интерфейса',
	mic: 'Голосовой чат',
	target: 'Меню игрока',
	inventory: 'Инвентарь',
	tablet: 'Планшет организации',
	engine: 'Двигатель',
	lock: 'Замок ТС',
	seatbelt: 'Ремень безопасности',
	cruise: 'Круиз-контроль',
	left_ind: 'Левый поворотник',
	right_ind: 'Правый поворотник',
	quick_1: 'Быстрый доступ 1',
	quick_2: 'Быстрый доступ 2',
	quick_3: 'Быстрый доступ 3'
};

type State = {
	binds: { [name in keyof typeof items]: string };
	selected?: string;
};

export default class SettingsKeys extends Component<{}, State> {
	readonly state: State = {
		binds: {}
	};

	componentDidMount() {
		this.getBindsFromClient();
	}

	getBindsFromClient() {
		rpc.callClient('HUD-GetBinds').then((data) => this.setState(() => ({ binds: data })));
	}

	selectKeyBind(name?: string) {
		this.setState(() => ({ selected: name }));
	}

	async saveKeyBind(key: string) {
		const { selected, binds } = this.state;

		if (!selected || binds[selected] === key) return;

		try {
			await rpc.callClient('Binder-Rebind', [selected, key]);

			this.setState(() => ({ binds: { ...binds, [selected]: key } }));
			this.selectKeyBind(undefined);
		} catch (error) {
			showNotification('error', 'Эта клавиша уже используется');
		}
	}

	render() {
		const { selected, binds } = this.state;

		if (selected) {
			return (
				<KeysList
					name={items[selected]}
					current={binds[selected]}
					selectKey={this.saveKeyBind.bind(this)}
					close={this.selectKeyBind.bind(this, undefined)}
				/>
			);
		}

		return (
			<div className="daily_tab-settings-keys">
				<h3 className="daily_tab-settings-section-title">Назначение клавиш</h3>
				<ul className="daily_tab-settings-keys-list">
					{Object.entries(items).map(([name, title]) => (
						<li
							key={name}
							className="daily_tab-settings-keys-item"
							onClick={() => this.selectKeyBind(name)}
						>
							<span className="daily_tab-settings-keys-label">{title}</span>
							<span className="daily_tab-settings-keys-value">{binds[name] || '—'}</span>
						</li>
					))}
				</ul>
			</div>
		);
	}
}
