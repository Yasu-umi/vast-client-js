import _client = require("./client");
import _tracker = require("./tracker");
import _parser = require("./parser");
import _util = require("./util");

namespace VAST {
  export var client = _client;
  export var tracker = _tracker;
  export var parser = _parser;
  export var util = _util;
}

export = VAST
