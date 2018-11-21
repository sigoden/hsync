const url = require("url");
const fs = require("fs");
const log = require("npmlog");

module.exports = watcher => {
  return (req, res) => {
    const { args } = url.parse(req.url, true).query;
    try {
      const { name, segs } = JSON.parse(args);
      const file = watcher.resolveFile(name, segs);
      fs.readFile(file, (err, data) => {
        if (err) {
          throw err;
        }
        res.statusCode = 200;
        res.write(data);
        return res.end();
      });
      log.verbose("download", `${file}`);
    } catch (err) {
      log.warn("download", `${file} with err ${err.message}`);
      res.writeHead(404, "Not Found");
      res.write("404: File Not Found!");
      return res.end();
    }
  };
};
