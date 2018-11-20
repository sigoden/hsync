const initServer = require("./server");

const config = require("./config.example");

const { io } = initServer(config);

io.on("error", err => {
  console.error(err);
});
