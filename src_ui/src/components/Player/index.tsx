import { IRoute } from 'routes';
import Passport from './passport';
import Licenses from './licenses';
import Death from './death';
import Menu from './menu';

export default [
	{
		path: '/player/passport',
		component: Passport
	},
	{
		path: '/player/licenses',
		component: Licenses
	},
	{
		path: '/player/death',
		component: Death
	},
	{
		path: '/player/menu',
		component: Menu
	}
] as IRoute[];
