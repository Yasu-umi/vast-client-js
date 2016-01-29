class VASTMediaFile {
  public id;
  public fileURL;
  public deliveryType: string;
  public mimeType;
  public codec;
  public bitrate: number;
  public minBitrate: number;
  public maxBitrate: number;
  public width: number;
  public height: number;
  public apiFramework;
  public scalable;
  public maintainAspectRatio;
  constructor () {
    this.id = null;
    this.fileURL = null;
    this.deliveryType = "progressive";
    this.mimeType = null;
    this.codec = null;
    this.bitrate = 0;
    this.minBitrate = 0;
    this.maxBitrate = 0;
    this.width = 0;
    this.height = 0;
    this.apiFramework = null;
    this.scalable = null;
    this.maintainAspectRatio = null;
  }
}

export = VASTMediaFile
