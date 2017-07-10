'use strict';

import {expect, use} from 'chai';
import {spy, match} from 'sinon';
import sinonChai from 'sinon-chai';
use(sinonChai);
import {init} from '../src/tracker';

describe('track event', () => {
  var track, http, config;

  beforeEach(() => {
    http = {
      post: () => Promise.resolve()
    };
    spy(http, 'post');

    config = {
      url: 'https://tracker.saagie.io/track/event',
      application: 'mocha',
      browser: {
        appCodeName: 'Mozilla',
        appName: 'Netscape',
        appVersion: '5.0 Chrome/58.0',
        platform: 'MacIntel',
        userAgent: 'Mozilla/5.0 Chrome/58.0',
      }
    };

    track = init(config, http.post);
  });

  const pageVisited = 'PAGE_VISITED';
  const platform = 'test';
  const user = {
    id: '1453847392',
    name: 'John Doe'
  };
  const uri = 'http://current.uri';
  const event = {
    type: pageVisited,
    platform,
    user,
    payload: {},
    uri
  };

  it('should not call post when server url is undefined', async () => {
      track = init(Object.assign({}, config, {url: undefined}), http.post);
      await track(event);

      expect(http.post).to.not.have.been.called;
  });

  it('should not call post when server url is empty', async () => {
      track = init(Object.assign({}, config, {url: ''}), http.post);
      await track(event);

      expect(http.post).to.not.have.been.called;
  });

  it('should not call post when server url is null', async () => {
      track = init(Object.assign({}, config, {url: null}), http.post);
      await track(event);

      expect(http.post).to.not.have.been.called;
  });

  it('should throw error when server url is not of type String', async () => {
      expect(() => init(Object.assign({}, config, {url: 2017}), http.post)).to.throw();
  });

  it('should track event', async () => {
    event.payload = {
      pageUrl: 'http://server.com/index.html'
    };

    await track(event);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: pageVisited,
        applicationID: 'mocha',
        platformID: 'test',
        user: {id: '1453847392'},
        payload: {pageUrl: 'http://server.com/index.html'},
        browser: match({appCodeName: 'Mozilla'}),
        uri: 'http://current.uri',
        timestamp: match.number
      });
  });

  it('should not raise an error when event has not been tracked', () => {
    http.post = () => Promise.reject(new Error('server unreachable'));

    track = init(config, http.post, () => {
    });

    event.payload = {
      pageUrl: 'http://no-server.com/index.html'
    };

    expect(async () => await track(event))
      .to.not.throw();
  });

  it('should log any error to keep track of it', async () => {
    http.post = () => Promise.reject(new Error('server unreachable'));
    const log = spy();

    track = init(config, http.post, log);

    event.payload = {
      pageUrl: 'http://no-server.com/index.html'
    };

    await track(event);

    expect(log).to.have.been.calledOnce;
  });
});