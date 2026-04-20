class Property {
	constructor() {
		mp.events.subscribe({
			'House-ShowMenu': this.showHouseMenu,
			'Business-ShowMenu': this.showBusinessMenu
		});
	}

	private showHouseMenu(data: any) {
		mp.browsers.showPage('house', data, true, true);
		mp.browsers.setHideBind(() => mp.browsers.hidePage(), 'esc');
	}

	private showBusinessMenu(data: any) {
		mp.browsers.showPage('business', data, true, true);
		mp.browsers.setHideBind(() => mp.browsers.hidePage(), 'esc');
	}
}

const property = new Property();

export {};
