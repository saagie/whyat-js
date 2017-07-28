'use strict';

import 'whatwg-fetch';
import t from 'tcomb';

const defaultLog = (...params) => console.log('[Y@]: ', ...params);

const defaultPost = (url, body) => fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
});

const defaultBrowserConfig = {
  appCodeName: window.navigator.appCodeName,
  appName: window.navigator.appName,
  appVersion: window.navigator.appVersion,
  platform: window.navigator.platform,
  userAgent: window.navigator.userAgent,
};

const defaultAutoPageTracking = {
  domContentLoaded: true,
  hashChange: true
};

export const EventType = {
  PAGE_VISITED: 'PAGE_VISITED',
  LINK_CLICKED: 'LINK_CLICKED',
  FORM_SUBMITTED: 'FORM_SUBMITTED'
};

const URL = t.maybe(t.String);

const ServerUrlDefined = t.refinement(t.String, s => s.length > 0);
const DotNotTrack = t.refinement(t.String, s => !!window.navigator.doNotTrack === true)

const preparePostEvent =
  ({url, application, platform, user, browser = defaultBrowserConfig}, post, log) =>
    async ({type, payload, user: {id} = user, uri = document.location.href, platform: currentPlatform = platform}) => {
      try {
        await post(`${url}/event`, {
          applicationID: application,
          platformID: currentPlatform,
          user: {id},
          type,
          payload,
          browser,
          uri,
          timestamp: Date.now()
        });
      } catch (error) {
        log(`Error while logging event ${type} with values`, payload);
      }
    };

const tracker = (options, post, log) => {
  const postEvent = preparePostEvent(options, post, log);
  const applyPostEvent = (type) => (user = options.user, name, payload, uri) => postEvent({
    type,
    user,
    uri,
    payload: Object.assign({}, payload, {name})
  });

  const autoTrackPageViewed = Object.assign({}, defaultAutoPageTracking, options.autoTrackPageVisited);
  const postAutoPageVisited = () => applyPostEvent(EventType.PAGE_VISITED)(options.user, document.title, {}, document.url);

  if (autoTrackPageViewed.domContentLoaded) {
    window.addEventListener('DOMContentLoaded', postAutoPageVisited);
  }

  if (autoTrackPageViewed.hashChange && 'onhashchange' in window) {
    window.addEventListener('hashchange', applyPostEvent(EventType.PAGE_VISITED)(options.user, document.title, {}, document.url));
  }


  return {
    postEvent,
    pageViewed: applyPostEvent(EventType.PAGE_VISITED),
    linkClicked: applyPostEvent(EventType.LINK_CLICKED),
    formSubmitted: applyPostEvent(EventType.FORM_SUBMITTED)
  };
};

const noop = () => {};

const noTracker = () => ({
  postEvent: noop,
  pageViewed: noop,
  linkClicked: noop,
  formSubmitted: noop,
});

export const init =
  (options, post = defaultPost, log = defaultLog) =>
    t.match(URL(options.url),
      DotNotTrack, () => {
        log("Dot Not Track option detected, no data will be transmitted.");
        return noTracker();
      },
      ServerUrlDefined, () => tracker(options, post, log),
      t.Any, () => {
        log("No server url defined");
        return noTracker();
      }
    );
