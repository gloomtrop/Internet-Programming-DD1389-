import Vue from 'vue';
import VueRouter from 'vue-router';
import ListView from '../views/List.vue';
import RoomView from '../views/Room.vue';
import LoginView from '../views/Login.vue';
import RegisterView from '../views/Register.vue';
import ProfileView from '../views/Profile.vue';
import store from '../store';


Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: 'list' },
  { path: '/list', component: ListView },
  { path: '/room/:roomName', component: RoomView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/profile', component: ProfileView },
];

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
});
// Setup Authentication guard
router.beforeEach((to, from, next) => {
  // Tell server to reset timer? :)

  if (store.state.isAuthenticated && (to.path === '/login')) {
    console.info('You are already logged in!');
    next('/');
  } else if (store.state.isAuthenticated || (to.path === '/login') || (to.path === '/register')) {
    next();
  } else {
    console.info('Unauthenticated user. Redirecting to login page.');
    next('/login');
  }
});

export default router;
