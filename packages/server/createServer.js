const fs = require("fs");

module.exports = (connection, listener) => {
  const { ssl } = connection;
  if (ssl) {
    const { ca, cert, key } = ssl;
    server = require("https").createServer(
      {
        ca: fs.readFileSync(ca),
        cert: fs.readFileSync(cert),
        key: fs.readFileSync(key),
        requestCert: true,
        rejectUnauthorized: false
      },
      listener
    );
  } else {
    server = require("http").createServer(listener);
  }
  return server;
};
