const app = new Vue({
  el: "#root",
  data: {
    loggedIn: [],
    game: { students: [], nextTick: undefined }
  },

  created: function() {
    // `this` points to the vm instance
    const client = new WebSocket("wss://innsjekk.myklevoll.com/server");
    const instance = this;
    client.onmessage = function(message) {
      const json = JSON.parse(message.data);
      if (json.type === "status") {
        instance.loggedIn = json.data.filter(student => student.checkedIn);
      } else if (json.type === "overallGame") {
        const data = json.data;
        console.log(data);

        instance.game = {
          nextTick: new Date(data.nextTick).toLocaleTimeString(),
          students: data.students.sort((a, b) => b.score - a.score)
        };
      }
    };
    console.log(instance);
  }
});
