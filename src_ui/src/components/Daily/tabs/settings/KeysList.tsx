import React from 'react';

const items: string[] = [
	'F2',
	'F3',
	'F4',
	'F5',
	'F6',
	'F7',
	'F8',
	'F9',
	'F10',
	'F12',
	'`',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'0',
	'-',
	'=',
	'Tab',
	'Q',
	'W',
	'Y',
	'U',
	'I',
	'O',
	'[',
	']',
	'Caps lock',
	'A',
	'S',
	'D',
	'H',
	'J',
	'K',
	'L',
	';',
	"'",
	'Shift',
	'Z',
	'X',
	'C',
	'V',
	'B',
	'N',
	',',
	'.',
	'/',
	'Ctrl',
	'Alt',
	'Left',
	'Up',
	'Down',
	'Right',
	'Insert',
	'Home',
	'Delete',
	'Page up',
	'Page down',
	'End'
];

type Props = {
	name: string;
	current: string;
	selectKey: (keyName: string) => void;
	close: () => void;
};

export default function KeysList({ name, current, selectKey, close }: Props) {
	return (
		<div className="daily_tab-settings-keys-select">
			<div className="daily_tab-settings-keys-select-header">
				<button
					type="button"
					className="daily_tab-settings-keys-select-back"
					onClick={close}
				>
					← Назад
				</button>
				<h3 className="daily_tab-settings-section-title">{name}</h3>
			</div>
			<ul className="daily_tab-settings-keys-select-list">
				{items.map((item, index) => (
					<li
						key={index}
						className={current === item ? 'active' : ''}
						onClick={() => selectKey(item)}
					>
						{item}
					</li>
				))}
			</ul>
		</div>
	);
}
