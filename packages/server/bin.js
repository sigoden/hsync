#!/usr/bin/env node

const initServer = require(".");
const path = require("path");
const log = require("npmlog");

const argv = require("yargs").options({
  config: {
    desc: "Give a config file",
    alias: "c",
    type: "string",
    required: true
  },
  silent: {
    desc: "Set silent or quiet mode",
    type: "string"
  },
  verbose: {
    desc: "Set verbose mode",
    type: "boolean"
  }
}).argv;

const config = require(path.resolve(argv.config));

log.level = argv.verbose ? "verbose" : argv.silent ? "error" : "info";

try {
  const { io } = initServer(config);
  io.on("error", err => {
    log.error("socket", err.message);
  });
} catch (err) {
  log.error("hsync", err.message);
}
