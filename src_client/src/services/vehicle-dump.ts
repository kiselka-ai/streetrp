mp.events.subscribe({
	'VehicleDump-ShowMenu': (model: string, price: number) => {
		mp.browsers.showPage('vehicle_dump', { model, price });
		mp.browsers.setHideBind(() => mp.browsers.hidePage(), 'esc');
	}
});

export {};
