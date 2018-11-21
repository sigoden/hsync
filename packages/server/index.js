const pick_ = require("lodash.pick");
const log = require("npmlog");

const Watcher = require("./Watcher");
const createServer = require("./createServer");
const createHandler = require("./createHandler");
const verifyConfig = require("./verifyConfig");

module.exports = config => {
  verifyConfig(config);
  const { host, port } = config.connection;
  const watcher = new Watcher(config.targets);
  const server = createServer(config.connection, createHandler(watcher));
  const io = require("socket.io")(server, { serveClient: false });

  watcher.on("change", change => {
    const { name, action, segs } = change;
    log.verbose("change", `[${name}]: ${action} ${watcher.joinSegs(segs)}`);
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
      log.info("client", `connect ${names.join(",")}`);
    });
  });

  server.listen(port, host);
  log.info("server", `listening on ${host}:${port}`);
  return { server, io };
};
