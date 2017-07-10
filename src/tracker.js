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

const URL = t.maybe(t.String);
const NotEmptyString = t.refinement(t.String, s => s.length > 0);

export const init =
  ({url, application, browser}, post = defaultPost, log = defaultLog) =>
    t.match(URL(url),
        NotEmptyString, () => async ({type, payload, platform, user:{id}, uri}) => {
            try {
                await post(`${url}/event`, {
                    applicationID: application,
                    platformID: platform,
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
        },
        t.Any, () => {
                log("No server url defined");
                return async () => void(0);
            }
      );
