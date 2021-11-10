import {createRouter, createWebHistory} from 'vue-router';


const routes = [
	{
		path: '/',
		name: 'home',
		meta: { keepAlive: true },
		component: () => import('./components/Home.vue')
	},
	{
		path: '/logbook/:logbook',
		name: 'logbook',
		meta: { keepAlive: true },
		component: () => import('./components/Logbook.vue')
	},
	{
		path: '/log/:logbook/:id',
		name: 'log',
		meta: { keepAlive: true },
		component: () => import('./components/Log.vue')
	},
	{
		path: '/about',
		name: 'about',
		component: () => import('./components/About.vue')
	},
    {
        path: "/:catchAll(.*)",
        name: 'notfound',
        component: () => import('./components/NotFound.vue')
    },
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
    routes: routes
});


export default router;