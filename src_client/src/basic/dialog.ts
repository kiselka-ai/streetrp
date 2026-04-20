import { fromObject } from 'utils/vector';
import peds from 'data/peds.json';
import conversations from 'data/сonversations.json';
import hud from './hud';

const player = mp.players.local;

type Ped = {
	model: string;
	position: PositionEx;
	rotation: number;
	speech: string;
	voice: string;
	camera: {
		position: PositionEx;
		point: PositionEx;
	};
	conversation: number;
};
type Conversation = {
	title: string;
	text: string;
	answers: { text: string; callback?: [string, ...any[]] }[];
};
type Data = {
	index: number;
	ped: number;
};

class Dialog {
	private ped?: Ped;
	private currentConversation?: Conversation;

	constructor() {
		this.init();
	}

	stop() {
		this.ped = null;
		this.currentConversation = undefined;

		player.setAlpha(255);

		mp.cameras.reset(1500);
		mp.browsers.hidePage();
	}

	private async getCurrentConversation() {
		const conversation = conversations[this.ped?.conversation] as Conversation;
		
		if (!conversation) return null;

		// Проверяем, есть ли в диалоге опции для работы (Jobs-ShowMenu)
		const jobAnswers = conversation.answers.filter(
			(answer) => answer.callback && answer.callback[0] === 'Jobs-ShowMenu'
		);

		if (jobAnswers.length > 0) {
			// Получаем статус работы игрока с сервера
			const jobName = jobAnswers[0].callback[1]; // Название работы из callback
			
			try {
				const result = await mp.events.callServer('Jobs-CheckStatus', [jobName], true);
				
				// Проверяем результат (может быть boolean или undefined)
				if (result === true) {
					const modifiedConversation = {
						...conversation,
						answers: conversation.answers.map((answer) => {
							if (answer.callback && answer.callback[0] === 'Jobs-ShowMenu' && answer.callback[1] === jobName) {
								return {
									...answer,
									text: 'Уволиться'
								};
							}
							return answer;
						})
					};
					return modifiedConversation;
				}
			} catch (error) {
				// Игнорируем ошибки, показываем стандартный диалог
				// Ошибка может возникнуть, если сервер не обработал запрос
			}
		}

		return conversation;
	}

	private async show({ index }: Data) {
		if (player.vehicle) return;

		this.ped = peds[index];

		try {
			const conversation = await this.getCurrentConversation();
			this.currentConversation = conversation;

			if (conversation) {
				player.setAlpha(0);

				this.setCamera();

				mp.browsers.showPage('dialog', conversation, true, true);
				mp.browsers.setHideBind(() => this.stop(), 'esc');
			}
		} catch (error) {
			// Если произошла ошибка, показываем стандартный диалог без проверки статуса
			const conversation = conversations[this.ped?.conversation] as Conversation;
			if (conversation) {
				this.currentConversation = conversation;
				player.setAlpha(0);
				this.setCamera();
				mp.browsers.showPage('dialog', conversation, true, true);
				mp.browsers.setHideBind(() => this.stop(), 'esc');
			}
		}
	}

	private setCamera() {
		const { camera } = this.ped;

		mp.cameras.set(
			fromObject(camera.position),
			new mp.Vector3(0, 0, 0),
			camera.point,
			40,
			1500
		);
	}

	private onAnswer(index: number) {
		const conversation = this.currentConversation;

		if (!conversation) return;

		const answer = conversation.answers[index];

		this.stop();

		if (answer?.callback) {
			const [event, ...data] = answer.callback;

			mp.events.callServer(event, data, false);
		}
	}

	private onEnterPedZone({ index, ped }: Data) {
		const npc = mp.peds.at(ped);

		mp.game.audio.playAmbientSpeechWithVoice(
			npc.handle,
			peds[index].speech,
			peds[index].voice,
			'SPEECH_PARAMS_FORCE_NORMAL',
			false
		);

		hud.showInteract('E');
	}

	private init() {
		mp.events.subscribe({
			'Dialog-SendAnswer': this.onAnswer.bind(this)
		});

		peds.forEach((item, index) => {
			const ped = mp.peds.new(
				mp.game.joaat(item.model),
				fromObject(item.position),
				item.rotation,
				0
			);

			mp.colshapes.create(
				item.position,
				2.5,
				{
					onEnter: this.onEnterPedZone.bind(this),
					onKeyPress: (data: Data) => {
						// Вызываем асинхронный метод без await, чтобы не блокировать
						this.show(data).catch((error) => {
							console.error('[Dialog] Error showing dialog:', error);
						});
					},
					onExit: () => hud.showInteract()
				},
				{ index, ped: ped.id }
			);
		});
	}
}

export default new Dialog();
