interface Creative {
  type: string;
}

class VASTAd {
  public id = "";
  public errorURLTemplates = [];
  public impressionURLTemplates = [];
  public creatives: Creative[] = [];
  public nextWrapperURL: string = "";
  public trackingEvents: any;
  public videoClickTrackingURLTemplates: any;
}

export = VASTAd
