const fs = require("fs");

module.exports = connection => {
  const { ssl } = connection;
  if (ssl) {
    ssl.cert = fs.readFileSync(ssl.cert);
    ssl.key = fs.readFileSync(ssl.key);
  }
};
