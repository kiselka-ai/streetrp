import './helpers';
import './basic/waypoint';
import './basic/weather';
import './basic/location';
import './basic/voice';
import './basic/doors';
import './basic/inventory';
import './basic/dialog';
import './basic/offer';
import './admin';
import './auth';
import './player';
import './vehicle';
import './property';
import './services';
import './weapons';
import './jobs';
import './games';
import './trading';
import './factions';
import blips from './helpers/blips';

const interiorId = mp.game.interior.getInteriorAtCoords(311.2546, -592.4204, 42.32737);

const ipls = [
	'rc12b_fixed',
	'rc12b_destroyed',
	'rc12b_default',
	'rc12b_hospitalinterior_lod',
	'rc12b_hospitalinterior'
];

mp.game.streaming.requestIpl('gabz_pillbox_milo_');

ipls.forEach(
	(ipl) => mp.game.streaming.isIplActive(ipl) && mp.game.streaming.removeIpl(ipl)
);

mp.game.interior.enableInteriorProp(interiorId, 'gabz_pillbox_milo_');
mp.game.interior.refreshInterior(interiorId);

mp.game.gxt.set('PM_PAUSE_HDR', 'Street Role Play');
mp.game.ui.setMinimapComponent(15, true, -1);

// Блип для NPC "Незнакомец" в аэропорту
// Координаты аэропорта: -1037, -2737
setTimeout(() => {
	mp.events.call('Blips-CreateItem', [
		'Незнакомец',
		280,
		{ x: -1037.0, y: -2737.0, z: 13.9 },
		{ name: 'Незнакомец', color: 2, scale: 0.95 }
	]);
}, 1000);
