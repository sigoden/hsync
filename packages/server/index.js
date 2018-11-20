const Watcher = require("./Watcher");
const pick_ = require("lodash.pick");
const createServer = require("./createServer");
const createHandler = require("./createHandler");
const debug = require("debug")("hsync:server");

module.exports = config => {
  const { host, port } = config.connection;
  const watcher = new Watcher(config.targets);
  const server = createServer(config.connection, createHandler(watcher));
  const io = require("socket.io")(server, { serveClient: false });

  watcher.on("change", change => {
    const { name, action, segs } = change;
    debug(`[${name}]: ${action} ${watcher.joinSegs(segs)}`);
    io.to(name).emit("change", change);
  });

  io.on("connection", function(socket) {
    socket.on("init", names => {
      try {
        watcher.checkNames(names);
        for (const name of names) {
          socket.join(name);
        }
      } catch (err) {
        socket.emit("error", err);
      }
      socket.emit("sync", pick_(watcher.getState(), names));
    });
  });

  server.listen(port, host);
  return { server, io };
};
