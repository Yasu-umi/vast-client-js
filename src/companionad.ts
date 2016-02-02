interface InterfaceEvents {
  eventName?: string;
}

class VASTCompanionAd {
  public id: string;
  public width: number;
  public height: number;
  public type: string;
  public staticResource: string;
  public htmlResource: string;
  public iframeResource: string;
  public companionClickThroughURLTemplate: string;
  public trackingEvents: InterfaceEvents;
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
