mp.events.subscribe({
	'Factions-ShowGarage': (vehicles: string[]) => {
		mp.browsers.showPage('factions/garage', { vehicles }, true, true);
		mp.browsers.setHideBind(() => mp.browsers.hidePage(), 'esc');
	}
});

export {};
