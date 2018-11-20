const initClient = require('./client');

const config = require("./config.example");

const socket = initClient(config);

socket.on("error", err => {
  console.error(err);
})