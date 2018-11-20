const resolveCerts = require("./resovleCerts");
const createSocket = require("./createSocket");
const createDownloader = require("./createDownloader");
const Queue = require("./Queue");
const debug = require("debug")("hsync:client");

module.exports = config => {
  resolveCerts(config.connection);
  const socket = createSocket(config.connection);
  const downloader = createDownloader(config.connection);
  const queue = new Queue(config.targets, downloader);
  const bootstrap = () => {
    socket.emit("init", Object.keys(config.targets));
  };
  socket.on("connect", () => {
    bootstrap();
  });
  socket.on("sync", state => {
    debug(`sync: ${Object.keys(state).join(",")}`);
    queue.syncState(state);
  });
  socket.on("change", change => {
    const { name, action, segs } = change;
    debug(`[${name}]: ${action} ${queue.joinSegs(segs)}`);
    queue.add(change);
  });
  socket.on("reconect", () => {
    bootstrap();
  });
  return socket;
};
