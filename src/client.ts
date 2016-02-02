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
  public static options = {
    withCredentials: false,
    timeout: 0
  };

  public static get = (url: string , opts: any, cb: any): void => {
    const now = new Date().getTime();
    if (!cb) {
      if (typeof opts === "function") {
        cb = opts;
      }
    }

    for (let key in opts) {
      if (opts.hasOwnProperty(key)) {
        let val = opts[key];
        VASTClient.options[key] = val;
      }
    }
    const options = VASTClient.options;

    if (VASTClient.totalCallsTimeout < now) {
      VASTClient.totalCalls = 1;
      VASTClient.totalCallsTimeout = now + (60 * 60 * 1000);
    } else {
      VASTClient.totalCalls++;
    }
    if (VASTClient.cappingFreeLunch >= VASTClient.totalCalls ||
      now - VASTClient.lastSuccessfullAd < VASTClient.cappingMinimumTimeInterval) {
      cb(null);
    } else {
      VASTParser.parse(url, options, (response) => {
        cb(response);
      });
    }
  };
}

export = VASTClient
