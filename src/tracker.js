import 'whatwg-fetch';
import t from 'tcomb';

// eslint-disable-next-line no-console
const defaultLog = (...params) => console.log('[Y@]: ', ...params);

const defaultPost = (url, body) => fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

const defaultBrowserConfig = {
  appCodeName: window.navigator.appCodeName,
  appName: window.navigator.appName,
  appVersion: window.navigator.appVersion,
  platform: window.navigator.platform,
  userAgent: window.navigator.userAgent,
};

const defaultUser = { id: 'unknown' };

const defaultAutoPageTracking = {
  domContentLoaded: true,
  hashChange: true,
};

export const EventType = {
  PAGE_VISITED: 'PAGE_VISITED',
  LINK_CLICKED: 'LINK_CLICKED',
  FORM_SUBMITTED: 'FORM_SUBMITTED',
};

const URL = t.maybe(t.String);

const ServerUrlDefined = t.refinement(t.String, s => s.length > 0);
const DotNotTrack = t.refinement(t.String, s => !!window.navigator.doNotTrack === true);

const preparePostEvent =
  ({ url, application, platform, user: globalUser = defaultUser, browser = defaultBrowserConfig }, post, log) =>
    async ({ type, payload = {}, user = globalUser, uri = document.location.href,
      platform: currentPlatform = platform }) => {
      try {
        await post(`${url}/event`, {
          applicationID: application,
          platformID: currentPlatform,
          user: { id: user.id || defaultUser.id },
          type,
          payload,
          browser,
          uri,
          timestamp: Date.now(),
        });
      } catch (error) {
        log(`Error while logging event ${type} with values`, payload);
      }
    };

// eslint-disable-next-line func-names
const autoTrack = function ({ autoTrackPageVisited, user }, postPageVisited) {
  const { domContentLoaded, hashChange } = Object.assign({}, defaultAutoPageTracking, autoTrackPageVisited);
  const postAutoPageVisited = () => postPageVisited(user, document.title, {}, document.url);

  if (domContentLoaded) {
    window.addEventListener('DOMContentLoaded', postAutoPageVisited);
  }

  if (hashChange && 'onhashchange' in window) {
    window.addEventListener('hashchange', postAutoPageVisited);
  }
};

const tracker = (options, post, log) => {
  const postEvent = preparePostEvent(options, post, log);
  const applyPostEvent = type => (user = options.user, name, payload, uri) => postEvent({
    type,
    user,
    uri,
    payload: Object.assign({}, payload, { name }),
  });

  const postPageVisited = applyPostEvent(EventType.PAGE_VISITED);

  autoTrack(options, postPageVisited);

  return {
    postEvent,
    pageViewed: postPageVisited,
    linkClicked: applyPostEvent(EventType.LINK_CLICKED),
    formSubmitted: applyPostEvent(EventType.FORM_SUBMITTED),
  };
};

const noop = () => Promise.resolve();

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
        log('Dot Not Track option detected, no data will be transmitted.');
        return noTracker();
      },
      ServerUrlDefined, () => tracker(options, post, log),
      t.Any, () => {
        log('No server url defined');
        return noTracker();
      // eslint-disable-next-line comma-dangle
      }
    );
