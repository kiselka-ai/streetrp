import { IRoute } from 'routes';
import Bank from './bank';
import Barbershop from './barbershop';
import ClothingShop from './clothing-shop';
import Gas from './gas';
import Licenses from './licenses';
import LSC from './lsc';
import Passport from './passport';
import Supermarket from './supermarket';
import Surgeon from './surgeon';
import TattooShop from './tattoo-shop';
import VehicleDump from './vehicle-dump';
import VehicleShop from './vehicle-shop';
import Weapons from './weapons';

export default [
	{
		path: '/bank',
		component: Bank
	},
	{
		path: '/barbershop',
		component: Barbershop
	},
	{
		path: '/clothing_shop',
		component: ClothingShop
	},
	{
		path: '/gas',
		component: Gas
	},
	{
		path: '/licenses',
		component: Licenses
	},
	{
		path: '/lsc',
		component: LSC
	},
	{
		path: '/passport',
		component: Passport
	},
	{
		path: '/supermarket',
		component: Supermarket
	},
	{
		path: '/surgeon',
		component: Surgeon
	},
	{
		path: '/tattoo_shop',
		component: TattooShop
	},
	{
		path: '/vehicle_dump',
		component: VehicleDump
	},
	{
		path: '/vehicle_shop',
		component: VehicleShop
	},
	{
		path: '/weapons',
		component: Weapons
	}
] as IRoute[];
