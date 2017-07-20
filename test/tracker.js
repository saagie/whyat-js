'use strict';

import {expect, use} from 'chai';
import {spy, match} from 'sinon';
import sinonChai from 'sinon-chai';
import {init, EventType} from '../src/tracker';
use(sinonChai);


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
      platform
    };

    track = init(config, http.post);
  });

  const platform = 'test';
  const user = {
    id: '1453847392',
    name: 'John Doe'
  };
  const uri = 'http://current.uri';
  const event = {
    type: EventType.PAGE_VISITED,
    platform,
    user,
    payload: {pageUrl: 'http://server.com/index.html'},
    uri
  };

  it('should not call post when server url is undefined', async () => {
    track = init(Object.assign({}, config, {url: undefined}), http.post);
    await track.postEvent(event);

    expect(http.post).to.not.have.been.called;
  });

  it('should not call post when server url is empty', async () => {
    track = init(Object.assign({}, config, {url: ''}), http.post);
    await track.postEvent(event);

    expect(http.post).to.not.have.been.called;
  });

  it('should not call post when server url is null', async () => {
    track = init(Object.assign({}, config, {url: null}), http.post);
    await track.postEvent(event);

    expect(http.post).to.not.have.been.called;
  });

  it('should throw error when server url is not of type String', async () => {
    expect(() => init(Object.assign({}, config, {url: 2017}), http.post)).to.throw();
  });

  it('should track event', async () => {
    await track.postEvent(event);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.PAGE_VISITED,
        applicationID: 'mocha',
        platformID: 'test',
        user: {id: '1453847392'},
        payload: {pageUrl: 'http://server.com/index.html'},
        browser: match({appCodeName: 'Mozilla'}),
        uri: 'http://current.uri',
        timestamp: match.number
      });
  });

  it('should track PAGE_VISITED event', async () => {
    event.type = 'ANOTHER_TYPE';

    await track.pageViewed(user, "page title", event.payload, uri);
    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.PAGE_VISITED,
        applicationID: 'mocha',
        platformID: 'test',
        user: {id: '1453847392'},
        payload: {name: 'page title', pageUrl: 'http://server.com/index.html'},
        browser: match({appCodeName: 'Mozilla'}),
        uri: 'http://current.uri',
        timestamp: match.number
      });

  });

  it('should track LINK_CLICKED event', async () => {

    await track.linkClicked(user, 'link name', event.payload, uri);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.LINK_CLICKED,
        applicationID: 'mocha',
        platformID: 'test',
        user: {id: '1453847392'},
        payload: {name: 'link name', pageUrl: 'http://server.com/index.html'},
        browser: match({appCodeName: 'Mozilla'}),
        uri: 'http://current.uri',
        timestamp: match.number
      });
  });

  it('should track FORM_SUBMITTED event', async () => {

    await track.formSubmitted(user, 'link name', event.payload, uri);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.FORM_SUBMITTED,
        applicationID: 'mocha',
        platformID: 'test',
        user: {id: '1453847392'},
        payload: {name: 'link name', pageUrl: 'http://server.com/index.html'},
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

    expect(async () => await track.postEvent(event))
      .to.not.throw();
  });

  it('should log any error to keep track of it', async () => {
    http.post = () => Promise.reject(new Error('server unreachable'));
    const log = spy();

    track = init(config, http.post, log);

    event.payload = {
      pageUrl: 'http://no-server.com/index.html'
    };

    await track.postEvent(event);

    expect(log).to.have.been.calledOnce;
  });

  it('should not call post when "Do not track" option is set', async () => {
    window.navigator.doNotTrack = 1;
    track = init(config);
    await track.postEvent(event);

    expect(http.post).to.not.have.been.called;
  });
});