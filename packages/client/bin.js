const initClient = require(".");
const path = require("path");
const log = require("npmlog");

const argv = require("yargs").options({
  config: {
    desc: "config file",
    alias: "c",
    type: "string",
    required: true
  },
  silent: {
    desc: "silent or quiet mode",
    type: "string"
  },
  verbose: {
    desc:
      'Makes verbose, userful for debugging and seeing what\'s goging on "under the hood"',
    type: "boolean"
  }
}).argv;

const config = require(path.resolve(argv.config));

log.level = argv.verbose ? "verbose" : argv.silent ? "error" : "info";

const socket = initClient(config);

socket.on("error", err => {
  log.error("socket", err.message);
});
