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

export const EventType = {
  PAGE_VISITED: 'PAGE_VISITED',
  LINK_CLICKED: 'LINK_CLICKED',
  FORM_SUBMITTED: 'FORM_SUBMITTED'
};

const URL = t.maybe(t.String);
const NotEmptyString = t.refinement(t.String, s => s.length > 0);

const postEvent =
  ({url, application, platform, browser}, post, log) =>
      async ({type, payload, user: {id}, uri, platform: currentPlatform = platform}) => {
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

const tracker = (options, post, log) => ({
  postEvent: postEvent(options, post, log),
  pageViewed: (user, name = document.title, payload = {}, uri = document.location.href) => postEvent(options, post, log)({
    type: EventType.PAGE_VISITED,
    user,
    uri,
    payload: Object.assign({}, payload, {name})
  }),
  linkClicked: (user, name, payload = {}, uri = document.location.href) => postEvent(options, post, log)({
    type: EventType.LINK_CLICKED,
    user,
    uri,
    payload: Object.assign({},payload, {name})
  }),
  formSubmitted: (user, name, payload, uri = document.location.href) => postEvent(options, post, log)({
    type: EventType.FORM_SUBMITTED,
    user,
    uri,
    payload : Object.assign({},payload, {name})
  })
});

const noop = (options, post, log) => ({
    postEvent: (options, post, log) => {},
    pageViewed:(user, name) => {},
    linkClicked: (user, name, payload) => {}
  });

export const init =
  (options, post = defaultPost, log = defaultLog) =>
    t.match(URL(options.url),
      NotEmptyString, () => tracker(options, post, log),
      t.Any, () => { log("No server url defined"); return noop(options, post, log);}
    );
