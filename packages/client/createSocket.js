const fs = require("fs");
const initSocket = require("socket.io-client");

module.exports = connection => {
  const { host, port, ssl } = connection;
  const protocol = ssl ? "https" : "http";
  const socket = initSocket(`${protocol}://${host}${port ? ":" + port : ""}`, {
    secure: true,
    reconnect: true,
    rejectUnauthorized: false,
    ...(ssl || {})
  });
  return socket;
};
