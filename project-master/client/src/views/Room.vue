<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center;">
        <h1>{{ room }}</h1>
      </div>
        <form v-on:submit.prevent="addMemb()">
        <input v-model="input" class="form-control" type="text"  placeholder='Add new username'/>
        </form>

      <div id='documentholder' style="border: 2px solid black">
        <!-- <div v-for="(entry,index) in entries" :key="index">
          {{ entry }}
          <br />
        </div> -->
        <textarea id='document' contenteditable placeholder='Type something here'
        @input="liveEdit" rows=30 cols=150 v-model="txt" autofocus>
        </textarea>
      </div>
      <!-- <form v-on:submit.prevent="send()">
        <input v-model="input" class="form-control" type="text" required autofocus />
      </form> -->
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
      txt: '',
    };
  },
  methods: {
    liveEdit(evt) {
      const src = evt.target.value;
      console.log(src);
      fetch(`/api/room/${this.room}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: src,
        }),
      })
        .then((resp) => {
          console.log('Responds status', resp.status);
          if (resp.status === 301) {
            this.$store.commit('setIsAuthenticated', false);
            this.$router.push('login');
            return resp;
          }
          if (resp.ok) return resp;
          throw new Error(resp.text);
        })
        .catch(console.error);
    },
    addMemb() {
      fetch(`/api/room/${this.room}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.input,
        }),
      })
        .then((resp) => {
          console.log('Responds status', resp.status);
          if (resp.status === 301) {
            this.$store.commit('setIsAuthenticated', false);
            this.$router.push('login');
            return resp;
          }
          if (resp.ok) return resp;
          throw new Error(resp.text);
        })
        .catch(console.error);
      this.input = '';
    },

    // send() {
    //   fetch(`/api/room/${this.room}/message`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       message: this.input,
    //     }),
    //   }).catch(console.error);
    //   this.input = '';
    // },
  },
  created() {
    this.socket = this.$root.socket;
    this.socket.on('msg', (msg) => {
      this.entries = [...this.entries, msg];
    });
    this.socket.on('edit', (text) => {
      this.txt = text;
    });
    fetch(`/api/room/${this.room}/join`)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`Unexpected failure when joining room: ${this.room}`);
        }
        if (resp.status === 301) {
          this.$store.commit('setIsAuthenticated', false);
          this.$router.push('login');
        }
        return resp.json();
      })
      .catch(console.error)
      .then((data) => {
        this.txt = data.text;
        this.entries = data.list;
      });
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
