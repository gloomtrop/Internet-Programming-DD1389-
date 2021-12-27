<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center;">
        <h1>Queues</h1>
      </div>

      <div class="row">
        <div class="well" v-bind:class="{active: room.reserv, booked: room.booked}"
        v-for="room in rooms" @click="redirect(room)" :key="room.name"
        >
          <div class="row" style="text-align: center;">
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
  name: 'List',
  components: {},
  data: () => ({
    rooms: [],
    socket: null,
  }),
  methods: {
    redirect(room) {
      this.$router.push(`/room/${room.name}`);
      console.log('Redirecting to Room');
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
