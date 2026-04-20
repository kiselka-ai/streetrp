import React from 'react';
import Ban from './ban';
import Reports from './reports';
import Vehicle from './vehicle';
import Kick from './kick';
import Skin from './skin';
import Money from './money';
import Teleport from './teleport';
import Spectator from './spectator';
import Chat from './chat';
import House from './house';
import Demorgan from './demorgan';
import Faction from './faction';
import Journal from './journal';

type Tab = {
	name: string;
	component?: React.ComponentClass<any, any> | React.FunctionComponent;
};

// Helper (уровень 1)
const helperTabs: Tab[] = [
	{ name: 'Кик', component: Kick },
	{ name: 'Деморган', component: Demorgan },
	{ name: 'Наблюдение', component: Spectator },
	{ name: 'Телепорт', component: Teleport },
	{ name: 'Репорты', component: Reports }
];

// Admin (уровень 2)
const adminTabs: Tab[] = [
	...helperTabs,
	{ name: 'Бан', component: Ban },
	{ name: 'Скин игрока', component: Skin },
	{ name: 'Транспорт', component: Vehicle },
	{ name: 'Уведомления', component: Chat }
];

// GM (уровень 3)
const gmTabs: Tab[] = [
	...adminTabs,
	{ name: 'Валюта', component: Money },
	{ name: 'Организации', component: Faction },
	{ name: 'Журнал действий', component: Journal }
];

// Owner (уровень 4)
const ownerTabs: Tab[] = [
	...gmTabs,
	{ name: 'Дома', component: House }
];

export default [
	helperTabs,
	adminTabs,
	gmTabs,
	ownerTabs
];
