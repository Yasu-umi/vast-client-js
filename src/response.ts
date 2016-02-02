import VASTAd = require("./ad");


class VASTResponse {
  public ads: VASTAd[];
  public errorURLTemplates: string[];
  constructor () {
    this.ads = [];
    this.errorURLTemplates = [];
  }
}

export = VASTResponse
