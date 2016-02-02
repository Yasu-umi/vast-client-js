import xhr = require("./urlhandlers/xmlhttprequest");
import flash = require("./urlhandlers/flash");
// import node = require("./urlhandlers/node");

class URLHandler {
  public static get (url: string, options: any, cb: any) {
    if (!cb) {
      if (typeof options === "function") {
        cb = options;
      }
      options = {};
    }
    const _xhr = new xhr();
    const _flash = new flash();
    if (options.urlhandler && options.urlhandler.supported()) {
      options.urlhandler.get(url, options, cb);
    } else if (typeof window === "undefined" || window === null) {
      // return node.get(url, options, cb);
    } else if (_xhr.supported()) {
      _xhr.get(url, options, cb);
    } else if (_flash.supported()) {
      _flash.get(url, options, cb);
    } else {
      cb();
    }
  }
}

export = URLHandler
