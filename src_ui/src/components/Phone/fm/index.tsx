import React, { Component } from 'react';
import rpc from 'utils/rpc';

type Station = {
	id: number;
	name: string;
	artist: string;
	track: string;
	cover: string;
};

type State = {
	currentStation: number;
	stations: Station[];
	isPlaying: boolean;
	visualizer: number[];
};

const defaultStations: Station[] = [
	{
		id: 0,
		name: 'Dance Radio',
		artist: 'Young Shot',
		track: 'Streets Talks',
		cover: 'dance'
	},
	{
		id: 1,
		name: 'Hip-Hop Radio',
		artist: 'Various Artists',
		track: 'Mix Tape',
		cover: 'hiphop'
	},
	{
		id: 2,
		name: 'Rock Radio',
		artist: 'Rock Band',
		track: 'Classic Hits',
		cover: 'rock'
	}
];

export default class FM extends Component<{}, State> {
	private visualizerInterval?: NodeJS.Timeout;

	readonly state: State = {
		currentStation: 0,
		stations: defaultStations,
		isPlaying: false,
		visualizer: Array(50).fill(0).map(() => Math.random() * 10)
	};

	componentDidMount() {
		this.startVisualizer();
	}

	componentWillUnmount() {
		if (this.visualizerInterval) {
			clearInterval(this.visualizerInterval);
		}
	}

	startVisualizer() {
		this.visualizerInterval = setInterval(() => {
			if (this.state.isPlaying) {
				this.setState(() => ({
					visualizer: Array(50)
						.fill(0)
						.map(() => {
							const rand = Math.random();
							// Создаем более реалистичный визуализатор с оранжевыми пиками
							return rand > 0.7 ? Math.random() * 80 + 20 : Math.random() * 30;
						})
				}));
			} else {
				// Когда не играет, визуализатор показывает минимальные значения
				this.setState(() => ({
					visualizer: Array(50).fill(0).map(() => Math.random() * 5)
				}));
			}
		}, 100);
	}

	togglePlay() {
		const isPlaying = !this.state.isPlaying;
		this.setState(() => ({ isPlaying }));

		// Отправка события на сервер для управления радио
		rpc.callServer('FM-Toggle', [isPlaying, this.state.currentStation]).catch(() => {
			// Игнорируем ошибки, если сервер не обрабатывает это событие
		});
	}

	changeStation(direction: 'prev' | 'next') {
		const { currentStation, stations } = this.state;
		let newStation = currentStation;

		if (direction === 'prev') {
			newStation = currentStation === 0 ? stations.length - 1 : currentStation - 1;
		} else {
			newStation = currentStation === stations.length - 1 ? 0 : currentStation + 1;
		}

		this.setState(() => ({ currentStation: newStation }));

		// Отправка события на сервер
		rpc.callServer('FM-ChangeStation', [newStation]).catch(() => {
			// Игнорируем ошибки, если сервер не обрабатывает это событие
		});
	}

	render() {
		const { currentStation, stations, isPlaying, visualizer } = this.state;
		const station = stations[currentStation];

		return (
			<div className="phone_fm">
				{/* Album Art Carousel */}
				<div className="phone_fm-carousel">
					<div className="phone_fm-carousel-wrapper">
						{stations.map((s, index) => {
							const offset = index - currentStation;
							const isActive = offset === 0;
							const isVisible = Math.abs(offset) <= 1;

							if (!isVisible) return null;

							return (
								<div
									key={s.id}
									className={`phone_fm-cover ${isActive ? 'active' : ''}`}
									style={{
										transform: `translateX(${offset * 100}%) scale(${isActive ? 1 : 0.85})`,
										opacity: isActive ? 1 : 0.4
									}}
								>
									<div className="phone_fm-cover-image">
										<div className="phone_fm-cover-placeholder">
											{/* Буква для placeholder */}
											<span>{s.name.charAt(0)}</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Track Info */}
				<div className="phone_fm-info">
					<div className="phone_fm-track">
						{station.artist} - {station.track}
					</div>
					<div className="phone_fm-station">{station.name}</div>
				</div>

				{/* Visualizer */}
				<div className="phone_fm-visualizer">
					{visualizer.map((height, index) => {
						const isActive = height > 30;
						return (
							<div
								key={index}
								className="phone_fm-visualizer-bar"
								style={{
									height: `${Math.max(height, 2)}%`,
									backgroundColor: isActive ? '#ff6b35' : 'rgba(255, 255, 255, 0.3)'
								}}
							/>
						);
					})}
				</div>

				{/* Controls */}
				<div className="phone_fm-controls">
					<button
						className="phone_fm-control phone_fm-control--prev"
						onClick={() => this.changeStation('prev')}
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path
								d="M15 18L9 12L15 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M9 18L3 12L9 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<span className="phone_fm-control-label">Prev Station</span>
					</button>

					<button
						className="phone_fm-control phone_fm-control--play"
						onClick={() => this.togglePlay()}
					>
						{isPlaying ? (
							<svg width="32" height="32" viewBox="0 0 24 24" fill="white">
								<rect x="6" y="4" width="4" height="16" />
								<rect x="14" y="4" width="4" height="16" />
							</svg>
						) : (
							<svg width="32" height="32" viewBox="0 0 24 24" fill="white">
								<polygon points="5 3 19 12 5 21" />
							</svg>
						)}
					</button>

					<button
						className="phone_fm-control phone_fm-control--next"
						onClick={() => this.changeStation('next')}
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path
								d="M9 18L15 12L9 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M15 18L21 12L15 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<span className="phone_fm-control-label">Next Station</span>
					</button>
				</div>
			</div>
		);
	}
}
