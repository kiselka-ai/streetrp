mp.events.subscribe({
	'FactionWorkshop-ShowMenu': (materials: number, prices: { [name: string]: number }) => {
		mp.browsers.showPage('factions/workshop', { materials, prices }, true, true);
		mp.browsers.setHideBind(() => mp.browsers.hidePage(), 'esc');
	}
});

export {};
