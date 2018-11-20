const path = require("path");
const mkdirp = require("mkdirp");
const fs = require("fs");
const rimraf = require("rimraf");
const { EventEmitter } = require("events");

class Queue extends EventEmitter {
  constructor(targets, downloader) {
    super();
    this.targets = targets;
    this.downloader = downloader;
    this.queue = [];
    this.index = 0;
  }
  syncState(state) {
    this.queue = [];
    this.index = 0;
    state2ChangeList(state).forEach(change =>
      this.queue.push(this._mapChange(change))
    );
    this._next();
  }
  joinSegs(segs) {
    return segs.join(path.sep);
  }
  _isParentDir(p, parentDir) {
    return p.slice(0, parentDir.length) === parentDir;
  }
  add(change) {
    const mappedChange = this._mapChange(change);
    this.queue.push(mappedChange);
    if (change.action === "unlinkDir") {
      this.queue.slice(this.index).forEach(v => {
        if (this._isParentDir(v.absPath, mappedChange.absPath)) {
          this.exec = () => {};
        }
      });
    }
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
    this.index++;
    change.exec(err => {
      if (err) {
        this.emit(err);
      }
      this._next();
    });
  }
  _absPath(name, segs) {
    return path.join(this.targets[name].target, this.joinSegs(segs));
  }
  _mapChange(change) {
    const { name, action, segs, info } = change;
    const absPath = this._absPath(name, segs);
    change.absPath = absPath;
    change.exec = cb => {
      switch (action) {
        case "addDir":
          mkdirp(absPath, cb);
          break;
        case "unlink":
        case "unlinkDir":
          rimraf(absPath, cb);
          break;
        case "change":
        case "add":
          this.downloader(name, segs, function(res) {
            let raw = "";
            res.on("error", err => cb(err));
            res.on("data", chunk => {
              raw += chunk;
            });
            res.on("end", () => {
              fs.writeFile(absPath, raw, cb);
            });
          });
      }
    };
    return change;
  }
}

function state2ChangeList(state) {
  const result = [];
  Object.keys(state).forEach(name => {
    iterate(result, name, [], state[name]);
  });
  return result;
}

function iterate(list, name, paths, obj) {
  if (obj.children) {
    list.push({ name, action: "addDir", segs: paths, info: obj.info });
    Object.keys(obj.children).forEach(sub => {
      iterate(list, name, paths.concat([sub]), obj.children[sub]);
    });
  } else {
    list.push({ name, action: "add", segs: paths, info: obj.info });
  }
}

module.exports = Queue;
