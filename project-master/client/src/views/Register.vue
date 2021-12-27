
<template>
  <div class="text-box col-md-4 col-md-offset-4" style="text-align: center">
    <h1>Register</h1>
    <form v-on:submit.prevent="done()">
      <input class="form-control" type="text" v-model="name" required autofocus />
      <input class="form-control" type="password" v-model="password">
      <input class="btn btn-default" type="submit" value="Ok" />
    </form>
    <button v-on:click="redirect('/list')" >List</button>
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
    redirect(target) {
      this.$router.push(target);
    },
    done() {
      fetch('/api/register', {
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
          this.$router.push({
            path: 'register',
          });
          throw new Error(resp.text);
        })
        .then(() => {
          this.$router.push({
            path: 'login',
          });
        })
        .catch((error) => {
          console.error('Authentication failed unexpectedly');
          throw error;
        });
    },
  },
};
</script>
