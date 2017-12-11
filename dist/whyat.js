(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.whyatJs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = exports.EventType = undefined;

require('whatwg-fetch');

var _tcomb = require('tcomb');

var _tcomb2 = _interopRequireDefault(_tcomb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// eslint-disable-next-line no-console
var defaultLog = function defaultLog() {
  var _console;

  for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
    params[_key] = arguments[_key];
  }

  return (_console = console).log.apply(_console, ['[Y@]: '].concat(params));
};

var defaultPost = function defaultPost(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
};

var defaultBrowserConfig = {
  appCodeName: window.navigator.appCodeName,
  appName: window.navigator.appName,
  appVersion: window.navigator.appVersion,
  platform: window.navigator.platform,
  userAgent: window.navigator.userAgent
};

var defaultAutoPageTracking = {
  domContentLoaded: true,
  hashChange: true
};

var EventType = exports.EventType = {
  PAGE_VISITED: 'PAGE_VISITED',
  LINK_CLICKED: 'LINK_CLICKED',
  FORM_SUBMITTED: 'FORM_SUBMITTED'
};

var URL = _tcomb2.default.maybe(_tcomb2.default.String);

var ServerUrlDefined = _tcomb2.default.refinement(_tcomb2.default.String, function (s) {
  return s.length > 0;
});
var DotNotTrack = _tcomb2.default.refinement(_tcomb2.default.String, function (s) {
  return !!window.navigator.doNotTrack === true;
});

var preparePostEvent = function preparePostEvent(_ref, post, log) {
  var url = _ref.url,
      application = _ref.application,
      platform = _ref.platform,
      user = _ref.user,
      _ref$browser = _ref.browser,
      browser = _ref$browser === undefined ? defaultBrowserConfig : _ref$browser;
  return function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref2) {
      var type = _ref2.type,
          payload = _ref2.payload,
          _ref2$user = _ref2.user;
      _ref2$user = _ref2$user === undefined ? user : _ref2$user;
      var id = _ref2$user.id,
          _ref2$uri = _ref2.uri,
          uri = _ref2$uri === undefined ? document.location.href : _ref2$uri,
          _ref2$platform = _ref2.platform,
          currentPlatform = _ref2$platform === undefined ? platform : _ref2$platform;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return post(url + '/event', {
                applicationID: application,
                platformID: currentPlatform,
                user: { id: id },
                type: type,
                payload: payload,
                browser: browser,
                uri: uri,
                timestamp: Date.now()
              });

            case 3:
              _context.next = 8;
              break;

            case 5:
              _context.prev = 5;
              _context.t0 = _context['catch'](0);

              log('Error while logging event ' + type + ' with values', payload);

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined, [[0, 5]]);
    }));

    return function (_x) {
      return _ref3.apply(this, arguments);
    };
  }();
};

// eslint-disable-next-line func-names
var autoTrack = function autoTrack(_ref4, postPageVisited) {
  var autoTrackPageVisited = _ref4.autoTrackPageVisited,
      user = _ref4.user;

  var _Object$assign = Object.assign({}, defaultAutoPageTracking, autoTrackPageVisited),
      domContentLoaded = _Object$assign.domContentLoaded,
      hashChange = _Object$assign.hashChange;

  var postAutoPageVisited = function postAutoPageVisited() {
    return postPageVisited(user, document.title, {}, document.url);
  };

  if (domContentLoaded) {
    window.addEventListener('DOMContentLoaded', postAutoPageVisited);
  }

  if (hashChange && 'onhashchange' in window) {
    window.addEventListener('hashchange', postAutoPageVisited);
  }
};

var tracker = function tracker(options, post, log) {
  var postEvent = preparePostEvent(options, post, log);
  var applyPostEvent = function applyPostEvent(type) {
    return function () {
      var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options.user;
      var name = arguments[1];
      var payload = arguments[2];
      var uri = arguments[3];
      return postEvent({
        type: type,
        user: user,
        uri: uri,
        payload: Object.assign({}, payload, { name: name })
      });
    };
  };

  var postPageVisited = applyPostEvent(EventType.PAGE_VISITED);

  autoTrack(options, postPageVisited);

  return {
    postEvent: postEvent,
    pageViewed: postPageVisited,
    linkClicked: applyPostEvent(EventType.LINK_CLICKED),
    formSubmitted: applyPostEvent(EventType.FORM_SUBMITTED)
  };
};

var noop = function noop() {};

var noTracker = function noTracker() {
  return {
    postEvent: noop,
    pageViewed: noop,
    linkClicked: noop,
    formSubmitted: noop
  };
};

var init = exports.init = function init(options) {
  var post = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultPost;
  var log = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultLog;
  return _tcomb2.default.match(URL(options.url), DotNotTrack, function () {
    log('Dot Not Track option detected, no data will be transmitted.');
    return noTracker();
  }, ServerUrlDefined, function () {
    return tracker(options, post, log);
  }, _tcomb2.default.Any, function () {
    log('No server url defined');
    return noTracker();
    // eslint-disable-next-line comma-dangle
  });
};

},{"tcomb":"tcomb","whatwg-fetch":"whatwg-fetch"}]},{},[1])(1)
});