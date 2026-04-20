import logger from 'utils/logger';
import ServiceModel from 'models/Service';
import { data as servicesData, ServiceData } from './data';

const items: Record<string, Service> = {};

export default abstract class Service {
	protected name: string;

	private readonly blip: BlipsOptions;

	private readonly radius: number;

	protected constructor(name: string, blip: BlipsOptions, radius = 0) {
		this.name = name;
		this.blip = blip;
		this.radius = radius;

		this.subscribeToEvents();

		items[name] = this;
	}

	abstract onKeyPress(player: Player): void;

	protected onEnterShape?(player: Player): void;

	protected onExitShape?(player: Player): void;

	protected abstract subscribeToEvents(): void;

	load(data: (PositionEx & { radius?: number })[]) {
		data.forEach(({ radius, ...position }, index) =>
			this.create(position, radius || this.radius, index)
		);
	}

	private create(position: PositionEx, radius: number, index: number) {
		if (radius) {
			mp.colshapes.create(
				position,
				radius,
				{
					onKeyPress: this.onKeyPress.bind(this),
					onEnter: this.onEnterShape ? this.onEnterShape.bind(this) : undefined,
					onExit: this.onExitShape ? this.onExitShape.bind(this) : undefined
				},
				{ dimension: 0, data: index }
			);
		}

		if (this.blip) mp.blips.create(position, { ...this.blip });
	}
}

mp.events.subscribe({
	'Services-ShowMenu': (player: Player, name: string) => {
		const service = items[name];
		if (service) {
			service.onKeyPress(player);
		}
	}
});

export async function loadServices(): Promise<void> {
	const count = await ServiceModel.findOne().countDocuments();
	const loadedServices = new Set<string>();

	if (count) {
		const cursor = await ServiceModel.find().lean().cursor();

		cursor.on('data', (data: ServiceModel) => {
			const service = items[data.name];
			if (service) {
				service.load(data.positions);
				loadedServices.add(data.name);
			}
		});

		cursor.on('close', () => {
			// Загружаем сервисы из fallback, если их нет в БД
			servicesData.forEach((item: ServiceData) => {
				if (!loadedServices.has(item.name)) {
					const service = items[item.name];
					if (service && item.positions.length > 0) {
						service.load(item.positions);
					}
				}
			});

			logger.success(`Services loaded: ${Object.keys(items).length}`);
		});
	} else {
		// Если база пустая, загружаем все из data.ts
		servicesData.forEach((item: ServiceData) => {
			const service = items[item.name];
			if (service && item.positions.length > 0) {
				service.load(item.positions);
			}
		});

		logger.success(`Services loaded from fallback: ${Object.keys(items).length}`);
	}
}
