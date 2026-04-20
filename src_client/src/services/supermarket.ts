mp.events.subscribe({
	'Supermarket-ShowMenu': (prices: { [name: string]: number }) => {
		mp.browsers.showPage('supermarket', { prices }, true, true);
		mp.browsers.setHideBind(() => mp.browsers.hidePage(), 'esc');
	}
});

export {};
