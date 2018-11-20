const fs = require("fs");
const initSocket = require("socket.io-client");

module.exports = connection => {
  const { host, port, ssl } = connection;
  const protocol = ssl ? "https" : "http";
  const sslOpts = ssl
    ? {
        cert: fs.readFileSync(ssl.cert),
        key: fs.readFileSync(ssl.key)
      }
    : {};
  const socket = initSocket(`${protocol}://${host}${port ? ":" + port : ""}`, {
    secure: true,
    reconnect: true,
    rejectUnauthorized: false,
    ...sslOpts
  });
  return socket;
};
