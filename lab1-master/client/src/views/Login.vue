
<template>
  <div class="text-box col-md-4 col-md-offset-4" style="text-align: center">
    <h1>Sign in</h1>
    <form v-on:submit.prevent="done()">
      <input class="form-control" type="text" v-model="name" required autofocus />
      <input class="form-control" type="password" v-model="password" >
      <input class="btn btn-default" type="submit" value="Ok" />
    </form>
    <button v-on:click="redirect('/register')" >Register</button>
  </div>
</template>

<script>
export default {
  name: 'Login',
  components: {},
  data: () => ({
    name: '',
    password: '',
  }),
  methods: {
    done() {
      fetch('/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.name,
          password: this.password,
        }),
      })
        .then((resp) => {
          if (resp.ok) return resp;
          this.$store.commit('setIsAuthenticated', false);
          this.$router.push({
            path: '',
          });
          throw new Error(resp.text);
        })
        .then(() => {
          this.$store.commit('setIsAuthenticated', true);
          this.$router.push({
            path: 'list',
          });
        })
        .catch((error) => {
          console.error('Authentication failed unexpectedly Login');
          this.$router.push({
            path: '',
          });
          throw error;
        });
    },
    redirect(target) {
      this.$router.push(target);
    },
  },
};
</script>
