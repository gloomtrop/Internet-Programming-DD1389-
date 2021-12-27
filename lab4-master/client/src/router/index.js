import Vue from 'vue';
import VueRouter from 'vue-router';
import ListView from '../views/List.vue';
import RoomView from '../views/Room.vue';
import LoginView from '../views/Login.vue';
import AdminView from '../views/Admin.vue';
import store from '../store';

Vue.use(VueRouter);
// ADD /edit path
const routes = [
  { path: '/', redirect: '/list' },
  { path: '/list', component: ListView },
  { path: '/room/:roomName', component: RoomView },
  { path: '/login', component: LoginView },
  { path: '/admin', component: AdminView },
];

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
});
// THIS MAKES THE LIST PAGE UNREACHABLE IF YOU HAVEN'T LOGGED IN
// Why won't the rooms show?? Could be the socket configuration at server/index.js
//                            Coule be the SyntaxError which the console gave
// Fixed!!! But should be added to the admin page

// Setup Authentication guard
router.beforeEach((to, from, next) => {
  if (store.state.isAuthenticated || to.path !== '/admin') {
    console.log('Authenticated');
    next();
  } else {
    console.info('Unauthenticated user. Redirecting to login page.');
    next('/login');
  }
});

export default router;
