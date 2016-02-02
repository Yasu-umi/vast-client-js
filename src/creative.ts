import VASTMediaFile = require("./mediafile");

interface InterfaceEvents {
  eventName?: string;
}

namespace creative {
  export class VASTCreative {
    public trackingEvents: InterfaceEvents;
    constructor () {
      this.trackingEvents = {};
    }
  }

  export class VASTCreativeLinear extends VASTCreative {
    public type: string;
    public duration: number;
    public skipDelay: number;
    public mediaFiles: VASTMediaFile[];
    public videoClickThroughURLTemplate: string;
    public videoClickTrackingURLTemplates: string[];
    public videoCustomClickURLTemplates: string[];
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
    public variations: string[];
    public videoClickTrackingURLTemplates: string[];
    constructor () {
      super();
      this.type = "companion";
      this.variations = [];
      this.videoClickTrackingURLTemplates = [];
    }
  }
}

export = creative
