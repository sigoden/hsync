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

  io.on("connection", function(socket) {
    socket.on("init", names => {
      try {
        watcher.checkNames(names);
        socket.emit("sync", pick_(watcher.getState(), names));
        for (const name of names) {
          socket.join(name);
        }
      } catch (err) {
        socket.emit("error", err);
      }
    });
    watcher.on("change", change => {
      const { name, action, segs } = change;
      debug(`${action}: ${name}|${watcher.joinSegs(segs)}`);
      io.to(name).emit("change", change);
    });
  });

  server.listen(port, host);
  return { server, io };
};
