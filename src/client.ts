import VASTParser = require("./parser");
import VASTUtil = require("./util");

class VASTClient {
  public static cappingFreeLunch = 0;
  public static cappingMinimumTimeInterval = 0;
  static set lastSuccessfullAd (value) {
    VASTUtil.storage.setItem("lastSuccessfullAd", value);
  }
  static get lastSuccessfullAd (): number {
    return VASTUtil.storage.getItem("lastSuccessfullAd");
  }
  static set totalCalls (value) {
    VASTUtil.storage.setItem("totalCalls", value);
  }
  static get totalCalls (): number {
    return VASTUtil.storage.getItem("totalCalls") || 0;
  }
  static set totalCallsTimeout (value) {
    VASTUtil.storage.setItem("totalCallsTimeout", value);
  }
  static get totalCallsTimeout (): number {
    return VASTUtil.storage.getItem("totalCallsTimeout") || 0;
  }
  public options = {
    withCredentials: false,
    timeout: 0
  };
  public get (url: string , opts: any, cb: any): any {
    let options;
    const now = new Date().getTime();
    const extend =  (object, properties) => {
      for (let key in properties) {
        if (properties.hasOwnProperty(key)) {
          let val = properties[key];
          object[key] = val;
        }
      }
      return object;
    };
    if (!cb) {
      if (typeof opts === "function") {
        cb = opts;
      }
      options = {};
    }
    options = extend(this.options, opts);
    if (VASTClient.totalCallsTimeout < now) {
      VASTClient.totalCalls = 1;
      VASTClient.totalCallsTimeout = now + (60 * 60 * 1000);
    } else {
      VASTClient.totalCalls++;
    }
    if (VASTClient.cappingFreeLunch >= VASTClient.totalCalls) {
      cb(null);
      return;
    }
    if (now - VASTClient.lastSuccessfullAd < VASTClient.cappingMinimumTimeInterval) {
      cb(null);
      return;
    }
    return VASTParser.parse(url, options, (response) => {
      return cb(response);
    });
  }
}

export = VASTClient
