const fs = require("fs");

module.exports = connection => {
  const { host, port, ssl } = connection;
  return (name, segs, cb) => {
    const opts = {
      host,
      port,
      path: `/?args=${encodeURIComponent(JSON.stringify({ name, segs }))}`
    };
    if (ssl) {
      require("https").get(
        Object.assign({ rejectUnauthorized: false }, ssl, opts),
        cb
      );
    } else {
      require("http").get(opts, cb);
    }
  };
};
