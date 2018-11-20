const createSocket = require("./createSocket");
const createDownloader = require("./createDownloader");

module.exports = config => {
  const socket = createSocket(config.connection);
  const downloader = createDownloader(config.connection);
  const bootstrap = () => {
    socket.emit("init", Object.keys(config.targets));
  };
  socket.on("connect", () => {
    bootstrap();
  });
  socket.on("sync", state => {
    console.log(state);
  });
  socket.on("change", change => {
    console.log(change);
  });
  socket.on("reconect", () => {
    bootstrap();
  });
  return socket;
};
