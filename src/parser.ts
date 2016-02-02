/// <reference path="../typings/eventemitter2/eventemitter2.d.ts" />

import EventEmitter2 = require("eventemitter2");
import URLHandler = require ("./urlhandler");
import VASTResponse = require ("./response");
import VASTAd = require ("./ad");
import VASTUtil = require ("./util");
import creative = require ("./creative");
import VASTMediaFile = require ("./mediafile");
import VASTCompanionAd = require ("./companionad");


interface Filter {
  (url: string): string;
}

class VASTParser {
  private static _URLTemplateFilters: Filter[] = [];
  private static _eventemitter = new EventEmitter2.EventEmitter2();

  public static addURLTemplateFilter = (func: Filter): void => {
    if (typeof func === "function") {
      VASTParser._URLTemplateFilters.push(func);
    }
  };

  public static removeURLTemplateFilter = (): Filter => {
    return VASTParser._URLTemplateFilters.pop();
  };

  public static countURLTemplateFilters = (): number => {
    return VASTParser._URLTemplateFilters.length;
  };

  public static clearURLTemplateFilters = (): void => {
    VASTParser._URLTemplateFilters = [];
  };

  public static parse = (url: string, options: any, cb: any): void => {
    if (!cb) {
      if (typeof options === "function") {
        cb = options;
      }
      options = {};
    }
    VASTParser._parse(url, null, options, (err, response) => {
      cb(response);
    });
  };

  public static track = (templates: string[], errorCode): string[] => {
    VASTParser._eventemitter.emit("VAST-error", errorCode);
    return VASTUtil.track(templates, errorCode);
  };

  /* tslint:disable */
  public static on = (eventName: string, cb: any): void => {
    VASTParser._eventemitter.on(eventName, cb);
  };

  public static once = (eventName: string, cb: any): void => {
    VASTParser._eventemitter.once(eventName, cb);
  };
  /* tslint:disable */

  public static childByName = (node: Node, name: string): Node => {
    const ref = node.childNodes;
    for (let i = 0, len = ref.length; i < len; i++) {
      const child = ref[i];
      if (child.nodeName === name) {
        return child;
      }
    }
  };

  public static childsByName = (node: Node, name: string): Node[] => {
    const childs: Node[] = [];
    const ref = node.childNodes;
    for (let i = 0, len = ref.length; i < len; i++) {
      const child = ref[i];
      if (child.nodeName === name) {
        childs.push(child);
      }
    }
    return childs;
  };

  public static parseAdElement = (adElement): VASTAd => {
    const ref: NodeList = adElement.childNodes;
    for (let i = 0, len = ref.length; i < len; i++) {
      const adTypeElement = <HTMLElement>ref[i];
      adTypeElement.id = adElement.getAttribute("id");
      if (adTypeElement.nodeName === "Wrapper") {
        return VASTParser.parseWrapperElement(adTypeElement);
      } else if (adTypeElement.nodeName === "InLine") {
        return VASTParser.parseInLineElement(adTypeElement);
      }
    }
  };

  public static parseWrapperElement = (wrapperElement: Node): VASTAd => {
    const ad = VASTParser.parseInLineElement(<HTMLElement>wrapperElement);
    let wrapperURLElement = VASTParser.childByName(wrapperElement, "VASTAdTagURI");
    if (wrapperURLElement != null) {
      ad.nextWrapperURL = VASTParser.parseNodeText(wrapperURLElement);
    } else {
      wrapperURLElement = VASTParser.childByName(wrapperElement, "VASTAdTagURL");
      if (wrapperURLElement != null) {
        ad.nextWrapperURL = VASTParser.parseNodeText(VASTParser.childByName(wrapperURLElement, "URL"));
      }
    }
    let wrapperCreativeElement  = null;
    const ref = ad.creatives;
    for (let i = 0, len = ref.length; i < len; i++) {
      const _creative = ref[i];
      if (_creative.type === "linear") {
        wrapperCreativeElement = _creative;
        break;
      }
    }
    if (wrapperCreativeElement != null) {
      if (wrapperCreativeElement.trackingEvents != null) {
        ad.trackingEvents = wrapperCreativeElement.trackingEvents;
      }
      if (wrapperCreativeElement.videoClickTrackingURLTemplates != null) {
        ad.videoClickTrackingURLTemplates = wrapperCreativeElement.videoClickTrackingURLTemplates;
      }
    }
    if (ad.nextWrapperURL != null) {
      return ad;
    }
  };

  public static parseInLineElement = (inLineElement: HTMLElement): VASTAd => {
    const ad = new VASTAd();
    ad.id = inLineElement.id;
    const ref = inLineElement.childNodes;
    for (let i = 0, len = ref.length; i < len; i++) {
      const node = ref[i];
      switch (node.nodeName) {
        case "Error":
          ad.errorURLTemplates.push(VASTParser.parseNodeText(node));
          break;
        case "Impression":
          ad.impressionURLTemplates.push(VASTParser.parseNodeText(node));
          break;
        case "Creatives":
          const ref1 = VASTParser.childsByName(node, "Creative");
          for (let j = 0, len1 = ref1.length; j < len1; j++) {
            const creativeElement = ref1[j];
            const ref2 = creativeElement.childNodes;
            let _creative;
            for (let k = 0, len2 = ref2.length; k < len2; k++) {
              const creativeTypeElement = ref2[k];
              switch (creativeTypeElement.nodeName) {
                case "Linear":
                  _creative = VASTParser.parseCreativeLinearElement(<HTMLElement>creativeTypeElement);
                  if (_creative) {
                    ad.creatives.push(_creative);
                  }
                  break;
                case "CompanionAds":
                  _creative = VASTParser.parseCompanionAd(creativeTypeElement);
                  if (_creative) {
                    ad.creatives.push(_creative);
                  }
              }
            }
          }
      }
    }
    return ad;
  };

  public static parseCreativeLinearElement = (creativeElement: HTMLElement): creative.VASTCreativeLinear => {
    const _creative = new creative.VASTCreativeLinear();
    _creative.duration = VASTParser.parseDuration(VASTParser.parseNodeText(VASTParser.childByName(creativeElement, "Duration")));
    if (_creative.duration === -1 && creativeElement.parentNode.parentNode.parentNode.nodeName !== "Wrapper") {
      return null;
    }
    const skipOffset = creativeElement.getAttribute("skipoffset");
    if (skipOffset == null) {
      _creative.skipDelay = null;
    } else if (skipOffset.charAt(skipOffset.length - 1) === "%") {
      const percent = parseInt(skipOffset, 10);
      _creative.skipDelay = _creative.duration * (percent / 100);
    } else {
      _creative.skipDelay = VASTParser.parseDuration(skipOffset);
    }
    const videoClicksElement = VASTParser.childByName(creativeElement, "VideoClicks");
    if (videoClicksElement != null) {
      _creative.videoClickThroughURLTemplate = VASTParser.parseNodeText(VASTParser.childByName(videoClicksElement, "ClickThrough"));
      const ref = VASTParser.childsByName(videoClicksElement, "ClickTracking");
      for (let i = 0, len = ref.length; i < len; i++) {
        const clickTrackingElement = ref[i];
        _creative.videoClickTrackingURLTemplates.push(VASTParser.parseNodeText(clickTrackingElement));
      }
      const ref1 = VASTParser.childsByName(videoClicksElement, "CustomClick");
      for (let j = 0, len1 = ref1.length; j < len1; j++) {
        const customClickElement = ref1[j];
        _creative.videoCustomClickURLTemplates.push(VASTParser.parseNodeText(customClickElement));
      }
    }
    const adParamsElement = VASTParser.childByName(creativeElement, "AdParameters");
    if (adParamsElement != null) {
      _creative.adParameters = VASTParser.parseNodeText(adParamsElement);
    }
    const ref2 = VASTParser.childsByName(creativeElement, "TrackingEvent");
    for (let k = 0, len2 = ref2.length; k < len2; k++) {
      const trackingEventElement = ref2[k];
      const ref3 = VASTParser.childsByName(trackingEventElement, "Tracking");
      for (let l = 0, len3 = ref3.length; l < len3; l++) {
        const trackingElement = <HTMLElement>ref3[l];
        let eventName = trackingElement.getAttribute("event");
        const trackingURLTemplate = VASTParser.parseNodeText(trackingElement);
        if ((eventName != null) && (trackingURLTemplate != null)) {
          if (eventName === "progress") {
            const offset = trackingElement.getAttribute("offset");
            if (!offset) {
              continue;
            }
            if (offset.charAt(offset.length - 1) === "%") {
              eventName = "progress-" + offset;
            } else {
              eventName = "progress-" + (Math.round(VASTParser.parseDuration(offset)));
            }
          }
          let base;
          if ((base = _creative.trackingEvents)[eventName] == null) {
            base[eventName] = [];
          }
          _creative.trackingEvents[eventName].push(trackingURLTemplate);
        }
      }
    }
    const ref4 = VASTParser.childsByName(creativeElement, "MediaFiles");
    for (let m = 0, len4 = ref4.length; m < len4; m++) {
      const mediaFilesElement = ref4[m];
      const ref5 = VASTParser.childsByName(mediaFilesElement, "MediaFile");
      for (let n = 0, len5 = ref5.length; n < len5; n++) {
        const mediaFileElement = <HTMLElement>ref5[n];
        const mediaFile = new VASTMediaFile();
        mediaFile.id = mediaFileElement.getAttribute("id");
        mediaFile.fileURL = VASTParser.parseNodeText(mediaFileElement);
        mediaFile.deliveryType = mediaFileElement.getAttribute("delivery");
        mediaFile.codec = mediaFileElement.getAttribute("codec");
        mediaFile.mimeType = mediaFileElement.getAttribute("type");
        mediaFile.apiFramework = mediaFileElement.getAttribute("apiFramework");
        mediaFile.bitrate = parseInt(String(mediaFileElement.getAttribute("bitrate") || 0));
        mediaFile.minBitrate = parseInt(String(mediaFileElement.getAttribute("minBitrate") || 0));
        mediaFile.maxBitrate = parseInt(String(mediaFileElement.getAttribute("maxBitrate") || 0));
        mediaFile.width = parseInt(String(mediaFileElement.getAttribute("width") || 0));
        mediaFile.height = parseInt(String(mediaFileElement.getAttribute("height") || 0));
        let scalable = mediaFileElement.getAttribute("scalable");
        if (scalable && typeof scalable === "string") {
          scalable = scalable.toLowerCase();
          if (scalable === "true") {
            mediaFile.scalable = true;
          } else if (scalable === "false") {
            mediaFile.scalable = false;
          }
        }
        let maintainAspectRatio = mediaFileElement.getAttribute("maintainAspectRatio");
        if (maintainAspectRatio && typeof maintainAspectRatio === "string") {
          maintainAspectRatio = maintainAspectRatio.toLowerCase();
          if (maintainAspectRatio === "true") {
            mediaFile.maintainAspectRatio = true;
          } else if (maintainAspectRatio === "false") {
            mediaFile.maintainAspectRatio = false;
          }
        }
        _creative.mediaFiles.push(mediaFile);
      }
    }
    return _creative;
  };

  public static parseCompanionAd = (creativeElement: Node): creative.VASTCreativeCompanion => {
    const _creative = new creative.VASTCreativeCompanion();
    const ref = VASTParser.childsByName(creativeElement, "Companion");
    for (let i = 0, len = ref.length; i < len; i++) {
      const companionResource = <HTMLElement>ref[i];
      const companionAd = new VASTCompanionAd();
      companionAd.id = companionResource.getAttribute("id") || null;
      companionAd.width = Number(companionResource.getAttribute("width"));
      companionAd.height = Number(companionResource.getAttribute("height"));
      const ref1 = VASTParser.childsByName(companionResource, "HTMLResource");
      for (let j = 0, len1 = ref1.length; j < len1; j++) {
        const htmlElement = <HTMLElement>ref1[j];
        companionAd.type = htmlElement.getAttribute("creativeType") || "text/html";
        companionAd.htmlResource = VASTParser.parseNodeText(htmlElement);
      }
      const ref2 = VASTParser.childsByName(companionResource, "IFrameResource");
      for (let k = 0, len2 = ref2.length; k < len2; k++) {
        const iframeElement = <HTMLElement>ref2[k];
        companionAd.type = String(iframeElement.getAttribute("creativeType") || 0);
        companionAd.iframeResource = VASTParser.parseNodeText(iframeElement);
      }
      const ref3 = VASTParser.childsByName(companionResource, "StaticResource");
      for (let l = 0, len3 = ref3.length; l < len3; l++) {
        const staticElement = <HTMLElement>ref3[l];
        companionAd.type = String(staticElement.getAttribute("creativeType") || 0);
        companionAd.staticResource = VASTParser.parseNodeText(staticElement);
      }
      const ref4 = VASTParser.childsByName(companionResource, "TrackingEvent");
      for (let m = 0, len4 = ref4.length; m < len4; m++) {
        const trackingEventElement = ref4[m];
        const ref5 = VASTParser.childsByName(trackingEventElement, "Tracking");
        for (let n = 0, len5 = ref5.length; n < len5; n++) {
          const trackingElement = <HTMLElement>ref5[n];
          const eventName = trackingElement.getAttribute("event");
          const trackingURLTemplate = VASTParser.parseNodeText(trackingElement);
          if ((eventName != null) && (trackingURLTemplate != null)) {
            let base;
            if ((base = companionAd.trackingEvents)[eventName] == null) {
              base[eventName] = [];
            }
            companionAd.trackingEvents[eventName].push(trackingURLTemplate);
          }
        }
      }
      companionAd.companionClickThroughURLTemplate
        = VASTParser.parseNodeText(VASTParser.childByName(companionResource, "CompanionClickThrough"));
      _creative.variations.push(companionAd);
    }
    return _creative;
  };

  public static parseDuration = (durationString: string): number => {
    if (!(durationString != null)) {
      return -1;
    }
    const durationComponents = durationString.split(":");
    if (durationComponents.length !== 3) {
      return -1;
    }
    const secondsAndMS = durationComponents[2].split(".");
    let seconds = parseInt(secondsAndMS[0]);
    if (secondsAndMS.length === 2) {
      seconds += parseFloat("0." + secondsAndMS[1]);
    }
    const minutes = parseInt(String(Number(durationComponents[1]) * 60));
    const hours = parseInt(String(Number(durationComponents[0]) * 60 * 60));
    if (isNaN(hours || Number(isNaN(minutes || Number(isNaN(Number(seconds || minutes > 60 * 60 || seconds > 60))))))) {
      return -1;
    }
    return hours + minutes + seconds;
  };

  public static parseNodeText = (node: Node): string => {
    const text = 
      (typeof node === "string") ? node :
      ("textContent" in node) ? node.textContent.trim() :
      ("textContent" in node) ? node["text"].trim() :
      "".trim()
    return text;
  };

  public static _parse = (url: string, parentURLs: string[], options: any, cb: any): void => {
    if (!cb) {
      if (typeof options === "function") {
        cb = options;
      }
      options = {};
    }
    for (let i = 0, len = VASTParser._URLTemplateFilters.length; i < len; i++) {
      const filter = VASTParser._URLTemplateFilters[i];
      url = filter(url);
    }
    if (parentURLs == null) {
      parentURLs = [];
    }
    parentURLs.push(url);

    const complete = (response, errorAlreadyRaised?) => {
      if (!response) {
        return;
      }
      if (errorAlreadyRaised == null) {
        errorAlreadyRaised = false;
      }
      for (let l = 0, len3 = response.ads.length; l < len3; l++) {
        if (response.ads[l].nextWrapperURL != null) {
          return;
        }
      }
      if (response.ads.length === 0) {
        if (!errorAlreadyRaised) {
          VASTParser.track(response.errorURLTemplates, { ERRORCODE: 303 });
        }
        response = null;
      }
      cb(null, response);
    },
    loop = (response) => {
      let loopIndex = response.ads.length;
      let ad;
      while (loopIndex--) {
        ad = response.ads[loopIndex];
        if (ad.nextWrapperURL == null) {
          continue;
        }
        let ref3;
        if (parentURLs.length >= 10 || (ref3 = ad.nextWrapperURL, parentURLs.indexOf(ref3) >= 0)) {
          VASTParser.track(ad.errorURLTemplates, {ERRORCODE: 302});
          response.ads.splice(response.ads.indexOf(ad), 1);
          complete(response);
        }
        if (ad.nextWrapperURL.indexOf("//") === 0) {
          const protocol = location.protocol;
          ad.nextWrapperURL = "" + protocol + ad.nextWrapperURL;
        } else if (ad.nextWrapperURL.indexOf("://") === -1) {
          ad.nextWrapperURL = url.slice(0, url.lastIndexOf("/")) + "/" + ad.nextWrapperURL;
        }

        const calback = (err, wrappedResponse) => {
          let errorAlreadyRaised = false;
          if (err != null) {
            VASTParser.track(ad.errorURLTemplates, {
              ERRORCODE: 301
            });
            response.ads.splice(response.ads.indexOf(ad), 1);
            errorAlreadyRaised = true;
          } else if (wrappedResponse == null) {
            VASTParser.track(ad.errorURLTemplates, {
              ERRORCODE: 303
            });
            response.ads.splice(response.ads.indexOf(ad), 1);
            errorAlreadyRaised = true;
          } else {
            response.errorURLTemplates = response.errorURLTemplates.concat(wrappedResponse.errorURLTemplates);
            response.ads.splice(response.ads.indexOf(ad), 1);
            for (let l = 0, len3 = wrappedResponse.ads.length; l < len3; l++) {
              const wrappedAd = wrappedResponse.ads[l];
              wrappedAd.errorURLTemplates = ad.errorURLTemplates.concat(wrappedAd.errorURLTemplates);
              wrappedAd.impressionURLTemplates = ad.impressionURLTemplates.concat(wrappedAd.impressionURLTemplates);
              if (ad.trackingEvents != null) {
                const ref4 = wrappedAd.creatives;
                for (let m = 0, len4 = ref4.length; m < len4; m++) {
                  const creative = ref4[m];
                  if (creative.type === "linear") {
                    const ref5 = Object.keys(ad.trackingEvents);
                    for (let n = 0, len5 = ref5.length; n < len5; n++) {
                      const eventName = ref5[n];
                      const base = creative.trackingEvents;
                      if (base[eventName]) base[eventName] = [];
                      creative.trackingEvents[eventName] = creative.trackingEvents[eventName].concat(ad.trackingEvents[eventName]);
                    }
                  }
                }
              }
              if (ad.videoClickTrackingURLTemplates != null) {
                for (let o = 0, len6 = wrappedAd.creatives.length; o < len6; o++) {
                  const creative = wrappedAd.creatives[o];
                  if (creative.type === "linear") {
                    creative.videoClickTrackingURLTemplates
                      = creative.videoClickTrackingURLTemplates.concat(ad.videoClickTrackingURLTemplates);
                  }
                }
              }
              response.ads.splice(response.ads.indexOf(ad), 0, wrappedAd);
            }
          }
          delete ad.nextWrapperURL;
          complete(response, errorAlreadyRaised);
        };
        VASTParser._parse(ad.nextWrapperURL, parentURLs, options, calback);
      }
      complete(response);
    },
    callback = (err, xml) => {
      if (err != null) {
        cb(err);
        return;
      }

      let response = new VASTResponse();
      if (!(((xml != null ? xml.documentElement : void 0) != null) && xml.documentElement.nodeName === "VAST")) {
        cb();
        return;
      }

      const ref = xml.documentElement.childNodes;
      for (let j = 0, len1 = ref.length; j < len1; j++) {
        if (ref[j].nodeName === "Error") {
          response.errorURLTemplates.push(VASTParser.parseNodeText(ref[j]));
        }
      }
      const ref1 = xml.documentElement.childNodes;
      for (let k = 0, len2 = ref1.length; k < len2; k++) {
        if (ref1[k].nodeName === "Ad") {
          const ad = VASTParser.parseAdElement(ref1[k]);
          if (ad != null) {
            response.ads.push(ad);
          } else {
            VASTParser.track(response.errorURLTemplates, { ERRORCODE: 101 });
          }
        }
      }

      loop(response);
    };

    URLHandler.get(url, options, callback);
  };
}

export = VASTParser
