interface Creative {
  type: string;
}

class VASTAd {
  public id: string = "";
  public errorURLTemplates: string[] = [];
  public impressionURLTemplates: string[] = [];
  public creatives: Creative[] = [];
  public nextWrapperURL: string = "";
  public trackingEvents: any;
  public videoClickTrackingURLTemplates: string[];
}

export = VASTAd
