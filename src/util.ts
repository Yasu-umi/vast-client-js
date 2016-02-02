class ExtendedStrage extends Storage {
  private _data;
  public length: number = 0;
  public getItem(key: string): any {
    return this._data[key];
  }
  public setItem (key: string, value: any): void {
    this._data[key] = value;
    this.length = Object.keys(this._data).length;
  }
  public removeItem (key: string): void {
    delete this._data[key];
    this.length = Object.keys(this._data).length;
  }
  public clear (): void {
    this._data = {};
    this.length = 0;
  }
}

function isDisabled (store: Storage): boolean {
  try {
    const testValue = "__VASTUtil__";
    store.setItem(testValue, testValue);
    if (store.getItem(testValue) !== testValue) {
      return true;
    }
  } catch (_error) {
    const e = _error;
    return true;
  }
  return false;
};

function getStorage (): ExtendedStrage {
  let storage: Storage;
  try {
    storage = typeof window !== "undefined" && window !== null ? window.localStorage || window.sessionStorage : null;
  } catch (_error) {
    const storageError = _error;
    storage = null;
  }
  const _storage = ((storage == null) || isDisabled(storage)) ? new ExtendedStrage() : <ExtendedStrage>storage;
  return _storage;
}

namespace VASTUtil {
  export function track (urlTemplates: string[], variables: any): string[] {
    const urls = VASTUtil.resolveURLTemplates(urlTemplates, variables);
    const results: string[] = [];
    for (let j = 0, len = urls.length; j < len; j++) {
      const url = urls[j];
      if (typeof window !== "undefined" && window !== null) {
        const i = new Image();
        results.push(i.src = url);
      }
    }
    return results;
  };

  export function resolveURLTemplates (urlTemplates: string[], variables: any): string[] {
    const urls: string[] = [];
    if (variables == null) {
      variables = {};
    }
    if (!("CACHEBUSTING" in variables)) {
      variables["CACHEBUSTING"] = Math.round(Math.random() * 1.0e+10);
    }
    variables["random"] = variables["CACHEBUSTING"];
    for (let j = 0, len = urlTemplates.length; j < len; j++) {
      const urlTemplate = urlTemplates[j];
      let resolveURL = urlTemplate;
      if (!resolveURL) {
        continue;
      }
      for (let key in variables) {
        if (variables.hasOwnProperty(key)) {
          const value = variables[key];
          const macro1 = "[" + key + "]";
          const macro2 = "%%" + key + "%%";
          resolveURL = resolveURL.replace(macro1, value);
          resolveURL = resolveURL.replace(macro2, value);
        }
      }
      urls.push(resolveURL);
    }
    return urls;
  };

  export const storage: ExtendedStrage = getStorage();
}

export = VASTUtil
