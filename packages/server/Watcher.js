const chokidar = require("chokidar");
const { EventEmitter } = require("events");
const path = require("path");
const difference_ = require("lodash.difference");
const set_ = require("lodash.set");
const unset_ = require("lodash.unset");

const DIR_CHILDREN = "children";

class Watcher extends EventEmitter {
  constructor(targets) {
    super();
    this.state = {};
    this.names = [];
    this.targets = targets;
    Object.keys(targets).forEach(name => {
      this.names.push(name);
      this.state[name] = { info: {}, [DIR_CHILDREN]: {} };
      const { target, ignored } = targets[name];
      const watcher = chokidar.watch(target, {
        ignored
      });
      watcher.on("addDir", (p, stats) => {
        this._emitChange(name, target, "addDir", p, { mode: stats.mode });
      });
      watcher.on("unlinkDir", p => {
        this._emitChange(name, target, "unlinkDir", p);
      });
      watcher.on("add", (p, stats) => {
        this._emitChange(name, target, "add", p, { mode: stats.mode });
      });
      watcher.on("change", (p, stats) => {
        this._emitChange(name, target, "change", p, { mode: stats.mode });
      });
      watcher.on("unlink", p => {
        this._emitChange(name, target, "unlink", p);
      });
      watcher.on("error", err => {
        err.$ = { target, name };
        this.emit("error", err);
      });
    });
  }
  getState() {
    return this.state;
  }
  resovleFile(name, segs) {
    if (this.names.indexOf(name) === -1) {
      throw new Error(`no target ${name}`);
    }
    return path.join(this.targets[name], this.joinSegs(segs));
  }
  joinSegs(segs) {
    return segs.join(path.sep);
  }
  checkNames(names) {
    const diffNames = difference_(names, this.names);
    if (diffNames.length > 0) {
      throw new Error(`unsupport targets ${diffNames.join(",")}`);
    }
  }
  _emitChange(name, target, action, p, info = {}) {
    const rp = path.relative(target, p);
    const segs = rp === "" ? [] : rp.split(path.sep);
    this.emit("change", {
      name,
      action,
      segs,
      info
    });
    this._updateState(action, name, segs, info);
  }
  _updateState(action, name, segs, info) {
    const localState = this.state[name];
    const paths = segs.reduce((a, c) => {
      a.push(DIR_CHILDREN);
      a.push(c);
      return a;
    }, []);
    switch (action) {
      case "addDir":
        set_(localState, paths, { info, [DIR_CHILDREN]: {} });
        break;
      case "add":
        set_(localState, paths, { info });
        break;
      case "unlinkDir":
      case "unlink":
        unset_(localState, paths);
        break;
    }
  }
}

module.exports = Watcher;
