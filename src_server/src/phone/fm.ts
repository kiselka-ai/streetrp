class PhoneFM {
	constructor() {
		this.subscribeToEvents();
	}

	private toggleRadio(player: Player, isPlaying: boolean, stationId: number) {
		// Здесь можно добавить логику для управления радио на сервере
		// Например, сохранение состояния радио в базу данных
		// Управление радио происходит на клиенте через игровое радио
	}

	private changeStation(player: Player, stationId: number) {
		// Смена станции происходит на клиенте
	}

	private subscribeToEvents() {
		mp.events.subscribe({
			'FM-Toggle': this.toggleRadio.bind(this),
			'FM-ChangeStation': this.changeStation.bind(this)
		});
	}
}

export default new PhoneFM();
