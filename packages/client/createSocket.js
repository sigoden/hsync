const client = require("socket.io-client");
const log = require("npmlog");

module.exports = connection => {
  const { host, port, ssl } = connection;
  const protocol = ssl ? "https" : "http";
  const url = `${protocol}://${host}${port ? ":" + port : ""}`;
  const socket = client.connect(
    url,
    Object.assign(
      {
        secure: true,
        reconnect: true,
        rejectUnauthorized: false
      },
      ssl || {}
    )
  );
  socket.on("connect_error", err => {
    log.error(`connect to ${url} failed, ${err.message}`);
  });
  return socket;
};
