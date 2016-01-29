import _client = require("./client");
import _tracker = require("./tracker");
import _parser = require("./parser");
import _util = require("./util");

namespace DMVAST {
  export const client = _client;
  export const tracker = _tracker;
  export const parser = _parser;
  export const util = _util;
}

export = DMVAST
