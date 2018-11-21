const resolveCerts = require("./resovleCerts");
const createSocket = require("./createSocket");
const createDownloader = require("./createDownloader");
const Queue = require("./Queue");
const log = require("npmlog");

module.exports = config => {
  resolveCerts(config.connection);
  const socket = createSocket(config.connection);
  const downloader = createDownloader(config.connection);
  const queues = {};
  const bootstrap = () => {
    socket.emit("init", Object.keys(config.targets));
  };
  socket.on("connect", () => {
    bootstrap();
  });
  socket.on("sync", state => {
    Object.keys(state).forEach(name => {
      const queue = new Queue(name, config.targets[name], downloader);
      queue.syncState(state[name]);
      queue.on("error", err => socket.emit("error", err));
      queues[name] = queue;
    });
  });
  socket.on("change", change => {
    const { name, action, segs, info } = change;
    const queue = queues[name];
    log.verbose("change", `[${name}]: ${action} ${queue.joinSegs(segs)}`);
    queue.add({ action, segs, info });
  });
  socket.on("reconect", () => {
    bootstrap();
  });
  return socket;
};
