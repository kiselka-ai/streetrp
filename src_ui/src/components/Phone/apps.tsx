import Main from './main';
import Keypad from './keypad';
import Contacts from './contacts';
import Settings from './settings';
import Maps from './maps';
import Sim from './sim';
import Vehicles from './vehicles';
import FM from './fm';

export type PhoneApp = {
	name: string;
	component: any;
	attached?: boolean;
};

const apps: { [key: string]: PhoneApp } = {
	maps: {
		name: 'GPS',
		component: Maps
	},
	sim: {
		name: 'Racoon',
		component: Sim
	},
	vehicles: {
		name: 'Транспорт',
		component: Vehicles
	},
	fm: {
		name: 'FM',
		component: FM
	},

	calls: {
		name: 'Звонки',
		component: Keypad,
		attached: true
	},
	contacts: {
		name: 'Контакты',
		component: Contacts,
		attached: true
	},
	messages: {
		name: 'Сообщения',
		component: Main,
		attached: true
	},
	settings: {
		name: 'Настройки',
		component: Settings,
		attached: true
	}
};

export default apps;
