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
      platform,
      user,
      autoTrackPageVisited: {domContentLoaded: false, hashChange: false}
    };

    track = init(config, http.post);
  });

  const platform = 'test';
  const user = {
    id: '1453847392',
    name: 'John Doe'
  };
  const event = {
    type: EventType.PAGE_VISITED,
    platform,
    payload: {pageUrl: 'http://server.com/index.html'}
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
        uri: 'http://current.uri/',
        timestamp: match.number
      });
  });

  it('should track PAGE_VISITED event', async () => {
    event.type = 'ANOTHER_TYPE';

    await track.pageViewed(user, "page title", event.payload);
    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.PAGE_VISITED,
        applicationID: 'mocha',
        platformID: 'test',
        user: {id: '1453847392'},
        payload: {name: 'page title', pageUrl: 'http://server.com/index.html'},
        browser: match({appCodeName: 'Mozilla'}),
        uri: 'http://current.uri/',
        timestamp: match.number
      });

  });

  it('should not auto track PAGE_VISITED on DOMContentLoaded', async () => {
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);

    window.document.dispatchEvent(event);

    expect(http.post).to.not.have.been.called;
  });


  it('should auto track PAGE_VISITED on DOMContentLoaded', async () => {
    config.autoTrackPageVisited = Object.assign({}, config.autoTrackPageVisited, {domContentLoaded: true});
    track = init(config, http.post);

    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);

    window.document.dispatchEvent(event);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.PAGE_VISITED,
        applicationID: 'mocha',
        platformID: 'test',
        user: {id: '1453847392'},
        payload: {name: 'Y@ page title'},
        browser: match({appCodeName: 'Mozilla'}),
        uri: 'http://current.uri/',
        timestamp: match.number
      });
  });

  it('should not auto track PAGE_VISITED on hashChange', async () => {
    window.location.hash = '#/new.uri';

    expect(http.post).to.not.have.been.called;
  });

  it('should auto track PAGE_VISITED on hashChange', async () => {
    config.autoTrackPageVisited = Object.assign({}, config.autoTrackPageVisited, {hashChange: true});
    track = init(config, http.post);

    window.location.hash = '#/new.uri';

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.PAGE_VISITED,
        applicationID: 'mocha',
        platformID: 'test',
        user: {id: '1453847392'},
        payload: {name: 'Y@ page title'},
        browser: match({appCodeName: 'Mozilla'}),
        uri: 'http://current.uri/#/new.uri',
        timestamp: match.number
      });
    window.location.hash = '';
  });

  it('should track LINK_CLICKED event', async () => {

    await track.linkClicked(user, 'link name', event.payload);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.LINK_CLICKED,
        applicationID: 'mocha',
        platformID: 'test',
        user: {id: '1453847392'},
        payload: {name: 'link name', pageUrl: 'http://server.com/index.html'},
        browser: match({appCodeName: 'Mozilla'}),
        uri: 'http://current.uri/',
        timestamp: match.number
      });
  });

  it('should track FORM_SUBMITTED event', async () => {

    await track.formSubmitted(user, 'link name', event.payload);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.FORM_SUBMITTED,
        applicationID: 'mocha',
        platformID: 'test',
        user: {id: '1453847392'},
        payload: {name: 'link name', pageUrl: 'http://server.com/index.html'},
        browser: match({appCodeName: 'Mozilla'}),
        uri: 'http://current.uri/',
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