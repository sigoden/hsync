const path = require("path");
const mkdirp = require("mkdirp");
const fs = require("fs");
const { Transform } = require("stream");
const rimraf = require("rimraf");
const { EventEmitter } = require("events");
const log = require("npmlog");

class Queue extends EventEmitter {
  constructor(name, config, downloader) {
    super();
    this.name = name;
    this.config = config;
    this.downloader = downloader;
    this.queue = [];
    this.index = 0;
    log.info("watch", `[${name}] ${config.target}`);
  }
  syncState(state) {
    this.index = 0;
    const raws = [];
    iterate(raws, [], state);
    this.queue = raws.map(v => this._mapFn(v));
    this._next();
  }
  joinSegs(segs) {
    return segs.join(path.sep);
  }
  _isParentDir(p, parentDir) {
    return p.slice(0, parentDir.length) === parentDir;
  }
  add(change) {
    const mappedChange = this._mapFn(change);
    if (change.action === "unlinkDir") {
      this.queue.slice(this.index).forEach(v => {
        if (this._isParentDir(v.absPath, mappedChange.absPath)) {
          this.exec = () => {};
        }
      });
    }
    this.queue.push(mappedChange);
    if (!this.running) {
      this._next();
    }
  }
  _next() {
    if (this.index === this.queue.length) {
      this.running = false;
      return;
    }
    const change = this.queue[this.index];
    change.exec(err => {
      this.queue[this.index] = undefined;
      this.index++;
      if (err) {
        this.emit(err);
      }
      this._next();
    });
  }
  _absPath(segs) {
    return path.join(this.config.target, this.joinSegs(segs));
  }
  _mapFn(change) {
    const { action, segs, info } = change;
    const absPath = this._absPath(segs);
    const mode = info.mode ? info.mode & parseInt("777", 8) : 0;
    const exec = cb => {
      switch (action) {
        case "addDir":
          log.verbose("action", `mkdir ${absPath}`);
          mkdirp(absPath, err => {
            if (err) return cb(err);
            if (!mode) return cb();
            fs.chmod(absPath, mode, cb);
          });
          break;
        case "unlink":
        case "unlinkDir":
          log.verbose("action", `rm ${absPath}`);
          rimraf(absPath, cb);
          break;
        case "change":
        case "add":
          this.downloader(this.name, segs, function(res) {
            const raw = new Transform();
            res.on("error", err => cb(err));
            res.on("data", chunk => {
              raw.push(chunk);
            });
            res.on("end", () => {
              log.verbose("action", `download ${absPath}`);
              fs.writeFile(absPath, raw.read(), err => {
                if (err) return cb(err);
                if (!mode) return cb();
                fs.chmod(absPath, mode, cb);
              });
            });
          });
      }
    };
    return { action, segs, info, absPath, exec };
  }
}

function iterate(list, paths, obj) {
  if (obj.children) {
    list.push({ action: "addDir", segs: paths, info: obj.info });
    Object.keys(obj.children).forEach(sub => {
      iterate(list, paths.concat([sub]), obj.children[sub]);
    });
  } else {
    list.push({ action: "add", segs: paths, info: obj.info });
  }
}

module.exports = Queue;
