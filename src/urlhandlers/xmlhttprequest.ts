class XHRURLHandler {
  public xhr () {
    const xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
      return xhr;
    }
  }
  public supported () {
    return !!this.xhr();
  }
  public get(url: string, options: any, cb: any): any {
    if (window.location.protocol === "https:" && url.indexOf("http://") === 0) {
      cb(new Error("Cannot go from HTTPS to HTTP."));
    }
    try {
      const xhr = this.xhr();
      xhr.open("GET", url);
      xhr.timeout = options.timeout || 0;
      xhr.withCredentials = options.withCredentials || false;
      xhr.send();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          return cb(null, xhr.responseXML);
        }
      };
    } catch (_error) {
      cb();
    }
  }
}

export = XHRURLHandler
