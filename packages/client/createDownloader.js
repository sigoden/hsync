const fs = require("fs");

module.exports = connection => {
  const { host, port, ssl } = connection;
  return (name, segs, cb) => {
    const opts = {
      host,
      port,
      path: `/args=${JSON.stringify({ name, segs })}`
    };
    if (ssl) {
      const { cert, key } = ssl;
      require("https").get(
        {
          cert,
          key,
          rejectUnauthorized: false,
          ...opts
        },
        cb
      );
    } else {
      require("http").get(opts, cb);
    }
  };
};
