import {createRouter, createWebHistory} from 'vue-router';


const routes = [
	{
		path: '/',
		name: 'home',
		component: () => import('./components/Home.vue')
	},
	{
		path: '/logbook/:logbook',
		name: 'logbook',
		meta: { keepAlive: true }, // Enable component cache
		component: () => import('./components/Logbook.vue')
	},
	{
		path: '/logbook/:logbook/:log',
		name: 'logedit',
		component: () => import('./components/LogEdit.vue')
	},
	{
		path: '/log/:logbook/:id',
		name: 'log',
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

// Add previous route
// router.afterEach((to, from) => {
// 	to.from = from;
// });


export default router;