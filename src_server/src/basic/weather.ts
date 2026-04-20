import { random, round } from 'lodash';
import moment from 'moment';
import axios from 'axios';

type ForecastItem = {
	temperature: number;
	condition: string;
	date: string;
};

const weatherTypes = {
	Thunderstorm: ['THUNDER'],
	Drizzle: ['CLEARING'],
	Rain: ['RAIN', 'CLEARING'],
	Snow: ['XMAS', 'SNOWLIGHT'],
	Clear: ['EXTRASUNNY', 'CLEAR'],
	Clouds: ['CLOUDS', 'OVERCAST'],
	Fog: ['SMOG', 'FOGGY', 'NEUTRAL']
};

const DEFAULT_WEATHER = {
	temperature: 20,
	condition: 'EXTRASUNNY',
	date: moment().toISOString()
};

class Weather {
	private city: string;

	private forecast: ForecastItem[];

	get current() {
		return this.forecast[0] || DEFAULT_WEATHER;
	}

	set location(name: string) {
		this.city = name;
		this.forecast = [];

		this.loadForecast().catch((error) => {
			console.error(`[WEATHER] Failed to load forecast for ${name}:`, error.message);
			// Устанавливаем дефолтную погоду при ошибке
			this.forecast = [DEFAULT_WEATHER];
			this.changeCurrentWeather(true);
		});
	}

	init() {
		this.location = process.env.WEATHER_CITY;
	}

	changeCurrentWeather(firstRunning = false) {
		if (!firstRunning && this.forecast.length > 0) {
			this.forecast.splice(0, 1);
		}

		if (this.forecast.length === 0) {
			this.forecast = [DEFAULT_WEATHER];
		}

		mp.world.weather = this.current.condition;
		mp.world.setWeatherTransition(this.current.condition);

		mp.players.call('Weather-Change', [this.current.condition]);
	}

	setPlayerWeather(player: Player) {
		player.callEvent('Weather-Change', this.current.condition);
	}

	private async loadForecast() {
		try {
			const data = await this.fetchData();

			if (!data || !data.list || !Array.isArray(data.list)) {
				throw new Error('Invalid weather data received');
			}

			data.list.forEach((item) => {
				const temperature = round(item.main.temp);
				const types: string[] = weatherTypes[item.weather[0].main];

				if (!types) return;

				const weather = {
					temperature,
					condition: types[random(0, types.length - 1)],
					date: moment.unix(item.dt).toISOString()
				};

				this.forecast.push(weather);
			});

			if (this.forecast.length === 0) {
				throw new Error('No valid weather data processed');
			}

			this.changeCurrentWeather(true);
		} catch (error) {
			console.error('[WEATHER] Error loading forecast:', error.message);
			throw error;
		}
	}

	private async fetchData() {
		const url = `http://api.openweathermap.org/data/2.5/forecast?q=${this.city}&units=metric&lang=ru&appid=${process.env.WEATHER_KEY}`;

		try {
			const { data } = await axios.get(url, {
				timeout: 10000, // 10 секунд таймаут
				validateStatus: (status) => status < 500 // Принимаем только статусы < 500
			});

			return data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
					console.warn(`[WEATHER] Network error fetching weather data: ${error.message}`);
				} else if (error.response) {
					console.warn(`[WEATHER] API error: ${error.response.status} - ${error.response.statusText}`);
				} else {
					console.warn(`[WEATHER] Request error: ${error.message}`);
				}
			} else {
				console.warn(`[WEATHER] Unexpected error: ${error.message}`);
			}
			throw error;
		}
	}
}

export default new Weather();
