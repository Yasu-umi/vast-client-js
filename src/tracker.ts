/// <reference path="../typings/eventemitter2/eventemitter2.d.ts" />

import EventEmitter2 = require("eventemitter2");
import VASTAd = require("./ad");
import VASTClient = require("./client");
import VASTUtil = require("./util");
import creative = require("./creative");

class VASTTracker extends EventEmitter2.EventEmitter2 {
  public ad: VASTAd;
  public creative: creative.VASTCreative;
  public muted: boolean;
  public impressed: boolean;
  public skipable: boolean;
  public skipDelayDefault: number;
  public trackingEvents: any;
  public emitAlwaysEvents: string[];
  public skipDelay: number;
  public linear: boolean;
  public clickThroughURLTemplate: string;
  public clickTrackingURLTemplates: string[];
  public assetDuration: number;
  public quartiles: {firstQuartile: number, midpoint: number, thirdQuartile: number};
  public progress: string;
  public paused: boolean;
  public fullscreen: boolean;

  constructor(ad: VASTAd, creative: creative.VASTCreativeLinear);
  constructor(ad: VASTAd, creative: any) {
    super();
    this.ad = ad;
    this.creative = creative;
    this.muted = false;
    this.impressed = false;
    this.skipable = false;
    this.skipDelayDefault = -1;
    this.trackingEvents = {};
    this.emitAlwaysEvents = [
      "creativeView",
      "start", "firstQuartile", "midpoint", "thirdQuartile", "complete",
      "resume", "pause", "rewind", "skip", "closeLinear", "close"
    ];
    const ref = this.creative.trackingEvents;
    for (let eventName in ref) {
      if (ref.hasOwnProperty(eventName)) {
        const events = ref[eventName];
        this.trackingEvents[eventName] = events.slice(0);
      }
    }
    if (this.creative instanceof creative.VASTCreativeLinear) {
      const creative = <creative.VASTCreativeLinear>this.creative;
      this.setDuration(creative.duration);
      this.skipDelay = creative.skipDelay;
      this.linear = true;
      this.clickThroughURLTemplate = creative.videoClickThroughURLTemplate;
      this.clickTrackingURLTemplates = creative.videoClickTrackingURLTemplates;
    } else {
      this.skipDelay = -1;
      this.linear = false;
    }
    this.on("start", function() {
      VASTClient.lastSuccessfullAd = new Date().getTime();
    });
  }

  public setDuration = (duration: number): void => {
    this.assetDuration = duration;
    this.quartiles = {
      "firstQuartile": Math.round(25 * this.assetDuration) / 100,
      "midpoint": Math.round(50 * this.assetDuration) / 100,
      "thirdQuartile": Math.round(75 * this.assetDuration) / 100,
    };
  };

  public setProgress = (progress): void => {
    const skipDelay = (this.skipDelay === null) ? this.skipDelayDefault : this.skipDelay;

    if (skipDelay !== -1 && !this.skipable) {
      if (skipDelay > progress) {
        this.emit("skip-countdown", skipDelay - progress);
      } else {
        this.skipable = true;
        this.emit("skip-countdown", 0);
      }
    }
    if (this.linear && this.assetDuration > 0) {
      const events = [];
      if (progress > 0) {
        events.push("start");
        const percent = Math.round(progress / this.assetDuration * 100);
        events.push("progress-" + percent + "%");
        events.push("progress-" + (Math.round(progress)));
        const ref = this.quartiles;
        for (let quartile in ref) {
          if (ref.hasOwnProperty(quartile)) {
            const time = ref[quartile];
            if ((time <= progress && progress <= (time + 1))) {
              events.push(quartile);
            }
          }
        }
      }
      for (let i = 0, len = events.length; i < len; i++) {
        const eventName = events[i];
        this.track(eventName, true);
      }
      if (progress < this.progress) {
        this.track("rewind");
      }
    }
    this.progress = progress;
  };

  public setMuted = (muted): void => {
    if (this.muted !== muted) {
      this.track(muted ? "mute" : "unmute");
    }
    this.muted = muted;
  };

  public setPaused = (paused): void => {
    if (this.paused !== paused) {
      this.track(paused ? "pause" : "resume");
    }
    this.paused = paused;
  };

  public setFullscreen = (fullscreen): void => {
    if (this.fullscreen !== fullscreen) {
      this.track(fullscreen ? "fullscreen" : "exitFullscreen");
    }
    this.fullscreen = fullscreen;
  };

  public setSkipDelay = (duration: number): void => {
    if (typeof duration === "number") {
      this.skipDelay = duration;
    }
  };

  public load = (): void => {
    if (!this.impressed) {
      this.impressed = true;
      this.trackURLs(this.ad.impressionURLTemplates);
      this.track("creativeView");
    }
  };

  public errorWithCode = (errorCode): void => {
    this.trackURLs(this.ad.errorURLTemplates, {
      ERRORCODE: errorCode
    });
  };

  public complete = (): void => {
    this.track("complete");
  };

  public close = (): void => {
    this.track(this.linear ? "closeLinear" : "close");
  };

  public stop = (): void => {};

  public skip = (): void => {
    this.track("skip");
    this.trackingEvents = [];
  };

  public click = (): void => {
    const ref = this.clickTrackingURLTemplates;
    if (ref != null ? ref.length : void 0) {
      this.trackURLs(this.clickTrackingURLTemplates);
    }
    if (this.clickThroughURLTemplate != null) {
      const variables = (this.linear) ? { CONTENTPLAYHEAD: this.progressFormated() } : undefined;
      const clickThroughURL = VASTUtil.resolveURLTemplates([this.clickThroughURLTemplate], variables)[0];
      this.emit("clickthrough", clickThroughURL);
    }
  };

  public track (eventName: string, once: boolean = false): void {
    if (eventName === "closeLinear" &&
      ((this.trackingEvents[eventName] == null) &&
      (this.trackingEvents["close"] != null))
    ) {
      eventName = "close";
    }
    const trackingURLTemplates = this.trackingEvents[eventName];
    const idx = this.emitAlwaysEvents.indexOf(eventName);
    if (trackingURLTemplates != null) {
      this.emit(eventName, "");
      this.trackURLs(trackingURLTemplates);
    } else if (idx !== -1) {
      this.emit(eventName, "");
    }
    if (once === true) {
      delete this.trackingEvents[eventName];
      if (idx > -1) {
        this.emitAlwaysEvents.splice(idx, 1);
      }
    }
  }

  /* tslint:disable */
  public trackURLs (URLTemplates: string[], variables: any = {}) {
    if (this.linear) {
      variables["CONTENTPLAYHEAD"] = this.progressFormated();
    }
    VASTUtil.track(URLTemplates, variables);
  }
  /* tslint:disable */

  public progressFormated (): string {
    const seconds = parseInt(this.progress);
    const h = String(seconds / (60 * 60));
    const _h = (h.length < 2) ? ("0" + h) : h;
    const m = String(seconds / 60 % 60);
    const _m = (m.length < 2) ? ("0" + m) : m;
    const s = String(seconds % 60);
    const _s = (s.length < 2) ? ("0" + s) : s;
    const ms = parseInt(String((Number(this.progress) - seconds) * 100));
    return _h + ":" + _m + ":" + _s + "." + ms;
  }
}

export = VASTTracker
