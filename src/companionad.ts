class VASTCompanionAd {
  public id: any;
  public width: number;
  public height: number;
  public type: string;
  public staticResource: any;
  public htmlResource: any;
  public iframeResource: any;
  public companionClickThroughURLTemplate: any;
  public trackingEvents: any;
  constructor () {
    this.id = null;
    this.width = 0;
    this.height = 0;
    this.type = null;
    this.staticResource = null;
    this.htmlResource = null;
    this.iframeResource = null;
    this.companionClickThroughURLTemplate = null;
    this.trackingEvents = {};
  }
}

export = VASTCompanionAd
