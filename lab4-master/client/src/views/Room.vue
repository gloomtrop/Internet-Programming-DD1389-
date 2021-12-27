<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center;">
        <h1>{{ room }}</h1>
      </div>
      <div style="border: 3px solid black">
        <h2>{{ timerCount }}</h2>
      </div>
      <label>Name: </label>
      <form v-on:submit.prevent="send()">
        <input v-model="input" class="form-control" type="text" required autofocus />
        <button type="submit" onclick="submit">Book Timeslot</button>
      </form>
      <button type="button" @click="cancel()">Cancel Booking</button>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Room',
  components: {},
  data() {
    return {
      room: this.$route.params.roomName,
      entries: [],
      socket: null,
      input: '',
      timerCount: 10,
    };
  },
  watch: {
    timerCount: {
      handler(value) {
        if (value > 0) {
          setTimeout(() => {
            this.timerCount -= 1;
          }, 1000);
        } else {
          this.$router.push('/list');
          console.log('Pushing to List');
        }
      },
      immediate: true,
    },
  },
  methods: {
    send() {
      fetch(`/api/room/${this.room}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: this.input,
        }),
      }).catch(console.error);
      this.input = '';
      this.$router.push('/list');
    },
    cancel() {
      fetch(`/api/cancel/${this.room}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: this.input,
        }),
      }).catch(console.error);
      this.input = '';
      this.$router.push('/list');
    },
  },
  created() {
    this.socket = this.$root.socket;
    this.socket.on('msg', (msg) => {
      this.entries = [...this.entries, msg];
    });

    fetch(`/api/room/${this.room}/join`)
      .then((resp) => {
        if (!resp.ok) {
          this.$router.push('/list');
          // throw new Error(`Unexpected failure when joining room: ${this.room}`);
        }
        return resp.json();
      })
      .catch(console.error)
      .then((data) => {
        this.entries = data.list;
      });
  },
};
</script>
