const initClient = require(".");
const path = require("path");

const argv = require("yargs").options("config", {
  desc: "config file",
  alias: "c",
  required: true
}).argv;

const config = require(path.resolve(argv.config));

const socket = initClient(config);

socket.on("error", err => {
  console.error(err);
});
