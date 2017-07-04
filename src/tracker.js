'use strict';

import 'whatwg-fetch';

const defaultLog = (...params) => console.log(...params);

const defaultPost = (url, body) => fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
});

export const init =
  ({url, application, browser}, post = defaultPost, log = defaultLog) =>
    async ({type, payload, platform, user:{id}, uri}) => {
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
    };
