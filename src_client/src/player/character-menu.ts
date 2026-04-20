import binder from 'utils/binder';

const player = mp.players.local;

function toggleCharacterMenu() {
	if (player.getVariable('isDying')) return;

	// Не открывать меню, если игрок печатает в чате
	if (player.isTypingInTextChat) return;

	const page = mp.browsers.getPage?.();

	if (page === 'daily') {
		mp.browsers.hidePage();
		return;
	}

	mp.browsers.showPage('daily', {}, true, false);
	mp.browsers.setHideBind(() => mp.browsers.hidePage(), 'esc');
}

(() => {
	binder.bind('character', 'M', toggleCharacterMenu, null);
})();
