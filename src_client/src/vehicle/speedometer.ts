import controls from './controls';
import cruise from './cruise-control';
import vehicleCtrl from './index';
import vehicleTuning from './tuning';

const player = mp.players.local;

type State = {
	engine: {
		health: number;
		active: boolean;
	};
	velocity: number;
	rpm: number;
	gear: number;
	fuel: {
		current: number;
		max: number;
	};
	locked: boolean;
	seatbelt: boolean;
	cruise: boolean;
};

class Speedometer {
	private updateInterval: NodeJS.Timeout;

	show() {
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
			this.updateInterval = null;
		}

		this.updateInterval = setInterval(this.update.bind(this), 50);
	}

	private getMaxSpeed(vehicle: VehicleMp): number {
		// Получаем базовую максимальную скорость модели
		const baseMaxSpeed = mp.game.vehicle.getVehicleModelMaxSpeed(vehicle.model);
		
		// Учитываем тюнинг двигателя и трансмиссии
		const tuning = vehicleTuning.get(vehicle);
		const engineLevel = tuning?.engine ?? -1;
		const transmissionLevel = tuning?.transmission ?? -1;
		
		// Базовый множитель от максимальной скорости модели (в м/с, переводим в км/ч)
		let maxSpeed = baseMaxSpeed * 3.6;
		
		// Увеличение максимальной скорости от тюнинга двигателя (каждый уровень +5%)
		if (engineLevel >= 0) {
			maxSpeed *= (1 + (engineLevel + 1) * 0.05);
		}
		
		// Увеличение от тюнинга трансмиссии (каждый уровень +3%)
		if (transmissionLevel >= 0) {
			maxSpeed *= (1 + (transmissionLevel + 1) * 0.03);
		}
		
		return maxSpeed;
	}

	private getGear(vehicle: VehicleMp, velocity: number, maxSpeed: number): number {
		const isEngineRunning = !!vehicle.getIsEngineRunning();
		
		if (!isEngineRunning || velocity < 1) {
			return 0; // N (нейтральная)
		}

		// Получаем уровень тюнинга для определения логики переключения
		const tuning = vehicleTuning.get(vehicle);
		const engineLevel = tuning?.engine ?? -1;
		const transmissionLevel = tuning?.transmission ?? -1;
		const isTuned = engineLevel >= 2 || transmissionLevel >= 2; // Считаем прокаченным если есть тюнинг 2+ уровня
		
		// Реалистичное переключение передач
		// Для прокаченных авто переключение происходит позже (выше обороты)
		if (isTuned) {
			// Прокаченные авто: переключение на более высоких скоростях
			if (velocity < 20) return 1;      // 1-я до 20 км/ч
			if (velocity < 45) return 2;       // 2-я до 45 км/ч
			if (velocity < 75) return 3;       // 3-я до 75 км/ч
			if (velocity < 110) return 4;       // 4-я до 110 км/ч
			
			// Для высоких передач используем процент от максимальной скорости
			const speedPercent = (velocity / maxSpeed) * 100;
			
			// 5-я передача: от 110 км/ч до 35% от максимальной скорости
			if (velocity >= 110 && speedPercent < 35) return 5;
			
			// 6-я передача: от 35% от максимальной скорости
			if (speedPercent >= 35) return 6;
			
			return 5;
		} else {
			// Обычные авто: стандартное переключение
			if (velocity < 20) return 1;      // 1-я до 20 км/ч
			if (velocity < 45) return 2;      // 2-я до 45 км/ч
			if (velocity < 70) return 3;      // 3-я до 70 км/ч
			if (velocity < 100) return 4;    // 4-я до 100 км/ч
			
			// Для высоких передач используем процент от максимальной скорости
			const speedPercent = (velocity / maxSpeed) * 100;
			
			// 5-я передача: от 100 км/ч до 30% от максимальной скорости
			if (velocity >= 100 && speedPercent < 30) return 5;
			
			// 6-я передача: от 30% от максимальной скорости
			if (speedPercent >= 30) return 6;
			
			return 5;
		}
	}

	private calculateRPM(vehicle: VehicleMp, velocity: number, gear: number, maxSpeed: number): number {
		if (!vehicle.getIsEngineRunning() || gear === 0 || velocity < 1) {
			return 0;
		}

		// Получаем уровень тюнинга
		const tuning = vehicleTuning.get(vehicle);
		const engineLevel = tuning?.engine ?? -1;
		const transmissionLevel = tuning?.transmission ?? -1;
		const isTuned = engineLevel >= 2 || transmissionLevel >= 2;
		
		// Полностью рассчитываем обороты на основе скорости и передачи
		// Игнорируем реальные обороты из игры, так как они могут быть неточными
		let idealRpm = 0;
		
		if (isTuned) {
			// Прокаченные авто: более высокие обороты и другой диапазон
			if (gear === 1) {
				// 1-я передача: 0-20 км/ч, обороты 25-70%
				idealRpm = 25 + Math.min(1, velocity / 20) * 45;
			} else if (gear === 2) {
				// 2-я передача: 20-45 км/ч, обороты 30-75%
				const gearPercent = Math.min(1, (velocity - 20) / 25);
				idealRpm = 30 + gearPercent * 45;
			} else if (gear === 3) {
				// 3-я передача: 45-75 км/ч, обороты 35-80%
				const gearPercent = Math.min(1, (velocity - 45) / 30);
				idealRpm = 35 + gearPercent * 45;
			} else if (gear === 4) {
				// 4-я передача: 75-110 км/ч, обороты 40-85%
				const gearPercent = Math.min(1, (velocity - 75) / 35);
				idealRpm = 40 + gearPercent * 45;
			} else if (gear === 5) {
				// 5-я передача: 110+ км/ч до 35% от макс, обороты 45-90%
				const gearMinSpeed = 110;
				const gearMaxSpeed = Math.max(gearMinSpeed, maxSpeed * 0.35);
				if (velocity >= gearMaxSpeed) {
					idealRpm = 90;
				} else if (velocity >= gearMinSpeed) {
					const gearPercent = (velocity - gearMinSpeed) / (gearMaxSpeed - gearMinSpeed);
					idealRpm = 45 + gearPercent * 45;
				} else {
					idealRpm = 45;
				}
			} else if (gear === 6) {
				// 6-я передача: 35%+ от макс, обороты 30-85%
				// Обороты растут медленнее, чтобы не уходить в красную зону раньше времени
				const gearMinSpeed = maxSpeed * 0.35;
				const gearMaxSpeed = maxSpeed;
				if (velocity <= gearMinSpeed) {
					idealRpm = 30;
				} else {
					// Используем более плавную кривую роста оборотов
					// Обороты достигают максимума только на максимальной скорости
					const gearSpeedPercent = Math.min(1, (velocity - gearMinSpeed) / (gearMaxSpeed - gearMinSpeed));
					// Квадратичная функция для более плавного роста в начале и ускорения в конце
					const smoothPercent = gearSpeedPercent * gearSpeedPercent;
					idealRpm = 30 + smoothPercent * 55; // Максимум 85% вместо 95%
				}
			}
		} else {
			// Обычные авто: стандартные обороты
			if (gear === 1) {
				// 1-я передача: 0-20 км/ч, обороты 20-60%
				idealRpm = 20 + Math.min(1, velocity / 20) * 40;
			} else if (gear === 2) {
				// 2-я передача: 20-45 км/ч, обороты 25-65%
				const gearPercent = Math.min(1, (velocity - 20) / 25);
				idealRpm = 25 + gearPercent * 40;
			} else if (gear === 3) {
				// 3-я передача: 45-70 км/ч, обороты 30-70%
				const gearPercent = Math.min(1, (velocity - 45) / 25);
				idealRpm = 30 + gearPercent * 40;
			} else if (gear === 4) {
				// 4-я передача: 70-100 км/ч, обороты 35-75%
				const gearPercent = Math.min(1, (velocity - 70) / 30);
				idealRpm = 35 + gearPercent * 40;
			} else if (gear === 5) {
				// 5-я передача: 100+ км/ч до 30% от макс, обороты 40-80%
				const gearMinSpeed = 100;
				const gearMaxSpeed = Math.max(gearMinSpeed, maxSpeed * 0.3);
				if (velocity >= gearMaxSpeed) {
					idealRpm = 80;
				} else if (velocity >= gearMinSpeed) {
					const gearPercent = (velocity - gearMinSpeed) / (gearMaxSpeed - gearMinSpeed);
					idealRpm = 40 + gearPercent * 40;
				} else {
					idealRpm = 40;
				}
			} else if (gear === 6) {
				// 6-я передача: 30%+ от макс, обороты 25-80%
				// Обороты растут медленнее, чтобы не уходить в красную зону раньше времени
				const gearMinSpeed = maxSpeed * 0.3;
				const gearMaxSpeed = maxSpeed;
				if (velocity <= gearMinSpeed) {
					idealRpm = 25;
				} else {
					// Используем более плавную кривую роста оборотов
					// Обороты достигают максимума только на максимальной скорости
					const gearSpeedPercent = Math.min(1, (velocity - gearMinSpeed) / (gearMaxSpeed - gearMinSpeed));
					// Квадратичная функция для более плавного роста в начале и ускорения в конце
					const smoothPercent = gearSpeedPercent * gearSpeedPercent;
					idealRpm = 25 + smoothPercent * 55; // Максимум 80% вместо 90%
				}
			}
		}
		
		// Ограничиваем обороты
		idealRpm = Math.min(95, Math.max(15, idealRpm));
		
		return Math.round(idealRpm);
	}

	private getFullState(vehicle: VehicleMp): State {
		const maxHealth = vehicle.getVariable('maxHealth') || 1000;
		const engineHealth = vehicle.getEngineHealth();
		const health = maxHealth > 0 ? (engineHealth * 100) / maxHealth : 0;

		const fuelData = vehicle.getVariable('fuel');
		const fuel = fuelData || { current: 0, max: 100 };

		const velocity = Math.round(vehicle.getSpeed() * 3.6);
		const maxSpeed = this.getMaxSpeed(vehicle);
		const gear = this.getGear(vehicle, velocity, maxSpeed);
		const rpm = this.calculateRPM(vehicle, velocity, gear, maxSpeed);

		return {
			engine: {
				active: !!vehicle.getIsEngineRunning(),
				health: health >= 0 && health <= 100 ? health : 0
			},
			velocity,
			rpm,
			gear,
			fuel: {
				current: fuel.current || 0,
				max: fuel.max || 100
			},
			locked: vehicle.getDoorLockStatus() > 1,
			seatbelt: controls.seatbelt,
			cruise: cruise.isActivated
		};
	}

	private update() {
		const { vehicle } = player;

		if (!mp.browsers.hud) return;

		if (!vehicleCtrl.isDriver(vehicle) || vehicle?.getClass() === 13) {
			clearInterval(this.updateInterval);
			this.updateInterval = null;

			mp.events.callBrowser('Speedometer-UpdateState', { inVehicle: false }, false);
		} else {
			mp.events.callBrowser(
				'Speedometer-UpdateState',
				{
					...this.getFullState(vehicle),
					inVehicle: true
				},
				false
			);
		}
	}
}

export default new Speedometer();
