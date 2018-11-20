module.exports = connection => {
  const { host, port, ssl } = connection;
  return (name, rp, cb) => {
    const opts = {
      host,
      port,
      path: `/name=${name}&rp=${rp}`
    };
    if (ssl) {
      const { cert, key } = ca;
      require("https").get(
        {
          cert,
          key,
          ...opts
        },
        cb
      );
    } else {
      require("http").get(opts, cb);
    }
  };
};
