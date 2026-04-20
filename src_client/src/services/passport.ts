import playerCtrl from 'player';

mp.events.subscribe({
	'Passport-ShowMenu': (price: number) => {
		mp.browsers.showPage('passport', {
			price,
			name: playerCtrl.getName(mp.players.local)
		});
		mp.browsers.setHideBind(() => mp.browsers.hidePage(), 'esc');
	}
});
