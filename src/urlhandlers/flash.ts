
interface XDomainRequest {
  open: (type: string, url: string) => {};
  timeout: number;
  withCredentials: boolean;
  send: any;
  onprogress: any;
  onload: any;
  responseText: string;
}

interface InterfaceWindow {
  XDomainRequest: XDomainRequest;
}

class FlashURLHandle {
  public xdr(): XDomainRequest {
    let xdr: XDomainRequest;
    const tmpWindow = <any>window;
    if (tmpWindow.XDomainRequest) {
      xdr = new tmpWindow.XDomainRequest();
    }
    return xdr;
  }
  public supported() {
    return !!this.xdr();
  }
  public get(url: string, options: any, cb: any): any {
    let xmlDocument;
    const tmpWindow = <any>window;
    if (xmlDocument = typeof tmpWindow.ActiveXObject === "function" ? new tmpWindow.ActiveXObject("Microsoft.XMLDOM") : void 0) {
      xmlDocument.async = false;
    } else {
      return cb();
    }
    const xdr = this.xdr();
    xdr.open("GET", url);
    xdr.timeout = options.timeout || 0;
    xdr.withCredentials = options.withCredentials || false;
    xdr.send();
    xdr.onprogress = function() {};
    return xdr.onload = function() {
      xmlDocument.loadXML(xdr.responseText);
      return cb(null, xmlDocument);
    };
  }
}

export = FlashURLHandle
