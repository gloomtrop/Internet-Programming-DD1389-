<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center;">
        <h1>Admin Page</h1>
      </div>
      <form v-on:submit.prevent="add()">
        <input v-model="addroom" class="form-control" type="text" required autofocus />
        <button type="submit" onclick="submit">Add Timeslot</button>
      </form>
      <button type="button" @click="logout()">Logout</button>
      <div class="row">
        <div class="well" v-bind:class="{active: room.reserv, booked: room.booked}"
        v-for="room in rooms" :key="room.name">
          <div class="row" style="text-align: center;">
            <button v-on:click = "remove(room.name)">Delete</button>
            <h4>
              <span>{{ room.name }}</span>
              <br>
              <span v-if="room.booked">Booked by {{ room.bookedBy }}</span>
            </h4>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Admin',
  components: {},
  data: () => ({
    rooms: [],
    addroom: '',
  }),
  methods: {
    remove(roomname) {
      fetch('/api/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomname,

        }),
      })
        .catch(console.error);
    },
    add() {
      fetch('/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.addroom,
        }),
      })
        .catch(console.error);
      this.addroom = '';
    },
    logout() {
      // fetch('/api/logout', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // })
      //   .catch(console.error);
      this.$store.commit('setIsAuthenticated', false);
      this.$router.push('/login');
    },
  },
  created() {
    fetch('/api/roomList')
      .then(res => res.json())
      .then((data) => {
        this.rooms = data.list;
      })
      .catch(console.error);
    this.socket = this.$root.socket;
    this.socket.on('update', (rooms) => {
      this.rooms = rooms;
    });
  },
};
</script>
<style>
.active{
  background-color:coral;
}
.booked{
  background-color: crimson;
}
</style>
