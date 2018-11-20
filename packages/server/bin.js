const initServer = require(".");
const path = require("path");

const argv = require("yargs").options("config", {
  desc: "config file",
  alias: "c",
  required: true
}).argv;

const config = require(path.resolve(argv.config));

const { io } = initServer(config);

io.on("error", err => {
  console.log(err.message);
});
