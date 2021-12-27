<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center;">
        <h1>Profile Page</h1>
        <h3>Change password</h3>
        <form v-on:submit.prevent="done()">
          <span>New password</span>
          <input class="form-control" type="password" v-model="password1" required autofocus />
          <span>Repeat password</span>
          <input class="form-control" type="password" v-model="password2" >
          <input class="btn btn-default" type="submit" value="Ok" />
        </form>
      </div>
      <!-- <form v-on:submit.prevent="send()">
        <input v-model="input" class="form-control" type="text" required autofocus />
      </form> -->
    </section>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  components: {},
  data: () => ({
    password1: '',
    password2: '',
  }),
  methods: {
    done() {
      fetch('/api/passwordChange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password1: this.password1,
          password2: this.password2,
        }),
      })
        .then((resp) => {
          
          if (resp.status === 301) {
            console.log(resp.status, "Status")
            this.$store.commit('setIsAuthenticated', false);
            this.$router.push({
              path: 'login',
            });
            throw new Error(resp.text);
            
          }
          if (resp.ok) return resp;
          throw new Error(resp.text);
          
        })
        .then(() => {
          this.$store.commit('setIsAuthenticated', true);
          this.$router.push({
            path: 'list',
          });
        })
        .catch((error) => {
          console.error('Authentication failed unexpectedly');
          this.$router.push({
            path: '',
          });
          throw error;
        });
    },
  },
  created() {

  },
};
</script>
<style>
.documentholder{
  height : 200;
}
.document{
  background-color:coral;
  height: 200;
}

textarea {
    padding: 5px;
}
