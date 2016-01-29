namespace creative {
  export class VASTCreative {
    public trackingEvents: any;
    constructor () {
      this.trackingEvents = {};
    }
  }

  export class VASTCreativeLinear extends VASTCreative {
    public type: string;
    public duration: number;
    public skipDelay: any;
    public mediaFiles: any[];
    public videoClickThroughURLTemplate: any;
    public videoClickTrackingURLTemplates: any[];
    public videoCustomClickURLTemplates: any[];
    public adParameters: any;
    constructor () {
      super();
      this.type = "linear";
      this.duration = 0;
      this.skipDelay = null;
      this.mediaFiles = [];
      this.videoClickThroughURLTemplate = null;
      this.videoClickTrackingURLTemplates = [];
      this.videoCustomClickURLTemplates = [];
      this.adParameters = null;
    }
  }

  export class VASTCreativeNonLinear extends VASTCreative {
  }

  export class VASTCreativeCompanion extends VASTCreative {
    public type: string;
    public variations: any[];
    public videoClickTrackingURLTemplates: any[];
    constructor () {
      super();
      this.type = "companion";
      this.variations = [];
      this.videoClickTrackingURLTemplates = [];
    }
  }
}

export = creative
