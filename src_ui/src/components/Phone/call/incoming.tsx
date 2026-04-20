import React from 'react';
import { IoIosAlarm, IoIosText, IoIosCall } from 'react-icons/io';
import Info from './info';
import Controls from './controls';

type Props = {
	name: string;
	onControlClick: (control: string) => void;
};

const secondary = [
	{ name: 'remember', label: 'Напомнить', icon: IoIosAlarm },
	{ name: 'message', label: 'Сообщение', icon: IoIosText }
];

const primary = [
	{ name: 'decline', label: 'Отклонить', icon: IoIosCall },
	{ name: 'accept', label: 'Ответить', icon: IoIosCall }
];

export default function IncomingCall({ name, onControlClick }: Props) {
	return (
		<div className="call_incoming">
			<Info status="сотовый" name={name} />
			<Controls items={secondary} onClick={onControlClick} variant="secondary" />
			<Controls items={primary} onClick={onControlClick} variant="primary" />
		</div>
	);
}
