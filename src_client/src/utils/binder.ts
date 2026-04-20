import { debounce } from 'lodash';
import keycode from 'keycode';

type Bind = {
	key?: string;
	hold: boolean;
	handler: Function;
};

class Binder {
	private binds: Map<string, Bind>;

	constructor() {
		this.binds = new Map();

		mp.events.subscribe({
			'Binder-Rebind': this.rebind.bind(this)
		});
	}

	getBind(name: string) {
		return this.binds.get(name);
	}

	bind(action: string, key: string, handler: Function, cursor = false, hold = false) {
		if (this.isDeclared(key)) throw new Error('Bind has been declared');

		// Safely get binds from storage (storage should be initialized by helpers/storage.ts)
		const binds = (mp.storage?.data?.binds as Record<string, string>) || {};
		// Телефон всегда на P (игнорируем сохранённый бинд)
		const newKey = action === 'phone' ? 'P' : (binds[action] ?? key);
		const wrappedHandler = cursor !== null ? this.wrapHandler(handler, cursor) : handler;

		mp.keys.bind(+keycode(newKey), hold, wrappedHandler);

		// temp crutch
		if (action === 'mic') mp.keys.bind(+keycode(newKey), false, wrappedHandler);

		// Update storage if available
		if (mp.storage?.update) {
			mp.storage.update({ binds: { ...binds, [action]: newKey } });
		}

		this.binds.set(action, { hold, handler: wrappedHandler, key: newKey });
	}

	unbind(action: string, key: string) {
		if (!this.isDeclared(key)) throw new Error('Bind has not been declared');

		mp.keys.unbind(+keycode(key), false);
		
		// Update storage if available
		if (mp.storage?.update) {
			const binds = (mp.storage.data?.binds as Record<string, string>) || {};
			mp.storage.update({ binds: { ...binds, [action]: null } });
		}

		this.binds.set(action, { ...this.getBind(action), key: null });
	}

	wrapHandler(handler: Function, cursor: boolean) {
		return debounce(() => mp.gui.cursor.visible === cursor && handler(), 250, {
			leading: true,
			trailing: false
		});
	}

	private rebind(action: string, key: string) {
		if (action === 'phone') {
			return mp.events.reject('Клавиша телефона закреплена за P');
		}
		const bind = this.getBind(action);

		if (!bind || this.isDeclared(key)) {
			return mp.events.reject('Bind not exists or has been declared');
		}

		mp.keys.unbind(+keycode(bind.key), bind.hold, bind.handler);
		mp.keys.bind(+keycode(key), bind.hold, bind.handler);

		// temp crutch
		if (action === 'mic') {
			mp.keys.unbind(+keycode(bind.key), false, bind.handler);
			mp.keys.bind(+keycode(key), false, bind.handler);
		}

		// Update storage if available
		if (mp.storage?.update) {
			const binds = (mp.storage.data?.binds as Record<string, string>) || {};
			mp.storage.update({ binds: { ...binds, [action]: key } });
		}

		this.binds.set(action, { ...bind, key });
	}

	private isDeclared(key: string) {
		const bind = Array.from(this.binds).find(([, item]) => key === item.key);

		return !!bind;
	}
}

export default new Binder();
