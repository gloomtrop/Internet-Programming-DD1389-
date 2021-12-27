<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center;">
        <h1>Documents</h1>
      </div>

      <div class="row">
        <form v-on:submit.prevent="add()">
        <input v-model="addroom" class="form-control" placeholder="Enter document name"
        type="text" required autofocus />
        <button type="submit" onclick="submit">Add document</button>
      </form>
        <p v-if="errors.length">
    <b>Please correct the following error(s):</b>
    <ul>
      <li v-for="error in errors" v-bind:key="error">{{ error }}</li>
    </ul>
  </p>
        <div class="well" v-for="room in rooms" @click="redirect(room.name)" :key="room.name">
          <div class="row" style="text-align: center;">
            <h4>
              <span>{{ room.name }}</span><br>
              <span>Owner {{ room.owner }}</span>
            </h4>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'List',
  components: {},
  data: () => ({
    errors: [],
    rooms: [],
    addroom: '',
  }),
  methods: {
    add() {
      this.errors = [];
      this.addroom = this.addroom.trim();
      if (this.addroom === '') {
        this.errors.push('Document name can\'t be whitespace only!');
      }


      if (this.errors.length === 0) {
        fetch('/api/roomList/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: this.addroom,
          }),
        })
          .then((resp) => {
            console.log('Responds status', resp.status);
            if (resp.status === 301) {
              console.log('We are in');
              this.$store.commit('setIsAuthenticated', false);
              this.$router.push('login');
              return resp;
            }
            if (resp.ok) return resp;
            throw new Error(resp.text);
          })
          .catch(console.error);
        this.addroom = '';
      }
    },

    redirect(roomName) {
      fetch(`/api/room/${roomName}/access`)
        .then((resp) => {
          console.log('Responds status', resp.status);
          if (resp.status === 301) {
            console.log('We are in');
            this.$store.commit('setIsAuthenticated', false);
            this.$router.push('login');
            return resp;
          }
          if (resp.ok) return resp;
          throw new Error(resp.text);
        })
        // This makes the Auth activate
        .then(() => {
          console.log('This is here');
          this.$router.push(`/room/${roomName}`);
        })
        .catch((error) => {
          console.error('Authentication failed unexpectedly List');
          throw error;
        });
    },
  },
  created() {
    this.socket = this.$root.socket;
    this.socket.on('add', (roomlist) => {
      this.rooms = roomlist;
    });

    fetch('/api/roomList')
      .then((resp) => {
        console.log('Responds status', resp.status);
        if (resp.status === 301) {
          this.$store.commit('setIsAuthenticated', false);
          this.$router.push('login');
          return resp.json();
        }
        if (resp.ok) return resp.json();
        throw new Error(resp.text);
      })
      .then((data) => {
        this.rooms = data.list;
      })
      .catch(console.error);
  },
};
</script>
