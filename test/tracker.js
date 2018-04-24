/* eslint-disable no-undef,no-unused-expressions */

import { expect, use } from 'chai';
import { spy, match } from 'sinon';
import sinonChai from 'sinon-chai';
import { init, EventType } from '../src/tracker';

use(sinonChai);

describe('track event', () => {
  let track;
  let http;
  let config;
  let event;

  const area = 'Datacenter1';
  const tenant = 'Saagie';
  const platform = 'test';
  const user = {
    id: '1453847392',
    name: 'John Doe',
  };


  beforeEach(() => {
    http = {
      post: () => Promise.resolve(),
    };
    spy(http, 'post');

    config = {
      url: 'https://tracker.saagie.io/track/event',
      application: 'mocha',
      area,
      tenant,
      platform,
      user,
      autoTrackPageVisited: { domContentLoaded: false, hashChange: false },
    };

    event = {
      type: EventType.PAGE_VISITED,
      platform,
      payload: { pageUrl: 'http://server.com/index.html' },
    };

    track = init(config, http.post);
  });

  afterEach(() => {
    window.location.hash = '';
    window.navigator.doNotTrack = 0;
  });

  it('should not call post when server url is undefined', async () => {
    track = init(Object.assign({}, config, { url: undefined }), http.post);
    await track.postEvent(event);

    expect(http.post).to.not.have.been.called;
  });

  it('should not call post when server url is empty', async () => {
    track = init(Object.assign({}, config, { url: '' }), http.post);
    await track.postEvent(event);

    expect(http.post).to.not.have.been.called;
  });

  it('should not call post when server url is null', async () => {
    track = init(Object.assign({}, config, { url: null }), http.post);
    await track.postEvent(event);

    expect(http.post).to.not.have.been.called;
  });

  it('should throw error when server url is not of type String', async () => {
    expect(() => init(Object.assign({}, config, { url: 2017 }), http.post)).to.throw();
  });

  it('should track event', async () => {
    await track.postEvent(event);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.PAGE_VISITED,
        area,
        tenant,
        applicationID: 'mocha',
        platformID: 'test',
        user: { id: '1453847392' },
        payload: { pageUrl: 'http://server.com/index.html' },
        browser: match({ appCodeName: 'Mozilla' }),
        uri: 'http://current.uri/',
        timestamp: match.number,
      });
  });

  it('should track PAGE_VISITED event', async () => {
    event.type = 'ANOTHER_TYPE';

    await track.pageViewed(user, 'page title', event.payload);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.PAGE_VISITED,
        area,
        tenant,
        applicationID: 'mocha',
        platformID: 'test',
        user: { id: '1453847392' },
        payload: { name: 'page title', pageUrl: 'http://server.com/index.html' },
        browser: match({ appCodeName: 'Mozilla' }),
        uri: 'http://current.uri/',
        timestamp: match.number,
      });
  });

  it('should not auto track PAGE_VISITED on DOMContentLoaded', async () => {
    event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);

    window.document.dispatchEvent(event);

    expect(http.post).to.not.have.been.called;
  });

  it('should auto track PAGE_VISITED on DOMContentLoaded', async () => {
    config.autoTrackPageVisited = Object.assign({}, config.autoTrackPageVisited, { domContentLoaded: true });
    track = init(config, http.post);

    event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);

    window.document.dispatchEvent(event);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.PAGE_VISITED,
        area,
        tenant,
        applicationID: 'mocha',
        platformID: 'test',
        user: { id: '1453847392' },
        payload: { name: 'Y@ page title' },
        browser: match({ appCodeName: 'Mozilla' }),
        uri: 'http://current.uri/',
        timestamp: match.number,
      });
  });

  it('should not auto track PAGE_VISITED on hashChange', async () => {
    window.location.hash = '#/new.uri';

    expect(http.post).to.not.have.been.called;
  });

  it('should auto track PAGE_VISITED on hashChange', (done) => {
    config.autoTrackPageVisited = Object.assign({}, config.autoTrackPageVisited, { hashChange: true });
    track = init(config, http.post);

    expect(http.post).to.not.have.been.called;

    setTimeout(() => {
      expect(http.post).to.have.been.calledWithMatch(
        'https://tracker.saagie.io/track/event', {
          type: EventType.PAGE_VISITED,
          area,
          tenant,
          applicationID: 'mocha',
          platformID: 'test',
          user: { id: '1453847392' },
          payload: { name: 'Y@ page title' },
          browser: match({ appCodeName: 'Mozilla' }),
          uri: 'http://current.uri/#/new.uri',
          timestamp: match.number,
        });
      done();
    }, 100);

    window.location.hash = '#/new.uri';
  });

  it('should track LINK_CLICKED event', async () => {
    await track.linkClicked(user, 'link name', event.payload);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.LINK_CLICKED,
        area,
        tenant,
        applicationID: 'mocha',
        platformID: 'test',
        user: { id: '1453847392' },
        payload: { name: 'link name', pageUrl: 'http://server.com/index.html' },
        browser: match({ appCodeName: 'Mozilla' }),
        uri: 'http://current.uri/',
        timestamp: match.number,
      });
  });

  it('should track FORM_SUBMITTED event', async () => {
    await track.formSubmitted(user, 'link name', event.payload);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.FORM_SUBMITTED,
        area,
        tenant,
        applicationID: 'mocha',
        platformID: 'test',
        user: { id: '1453847392' },
        payload: { name: 'link name', pageUrl: 'http://server.com/index.html' },
        browser: match({ appCodeName: 'Mozilla' }),
        uri: 'http://current.uri/',
        timestamp: match.number,
      });
  });

  it('should not raise an error when event has not been tracked', () => {
    http.post = () => Promise.reject(new Error('server unreachable'));

    track = init(config, http.post, () => {
    });

    event.payload = {
      pageUrl: 'http://no-server.com/index.html',
    };

    // eslint-disable-next-line no-return-await
    expect(async () => await track.postEvent(event))
      .to.not.throw();
  });

  it('should log any error to keep track of it', async () => {
    http.post = () => Promise.reject(new Error('server unreachable'));
    const log = spy();

    track = init(config, http.post, log);

    event.payload = {
      pageUrl: 'http://no-server.com/index.html',
    };

    await track.postEvent(event);

    expect(log).to.have.been.calledOnce;
  });

  it('should not call post when "Do not track" option is set', async () => {
    window.navigator.doNotTrack = 1;
    track = init(config, http.post);
    await track.postEvent(event);

    expect(http.post).to.not.have.been.called;
  });

  it('should use the tenant value set on tracker initialisation', async () => {
    config.tenant = 'myDefinedTenant';
    track = init(config, http.post);
    await track.postEvent(event);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.PAGE_VISITED,
        tenant: 'myDefinedTenant',
      });
  });

  it('should detect tenant from the uri `myTenant-manager.uri.com`', async () => {
    config.tenant = undefined;
    track = init(config, http.post);
    global.dom.reconfigure({ url: 'https://mytenant-manager.current.uri' });
    await track.postEvent(event);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.PAGE_VISITED,
        tenant: 'mytenant',
      });
  });

  it('should detect tenant from the uri `myTenant.uri.com`', async () => {
    config.tenant = undefined;
    track = init(config, http.post);
    global.dom.reconfigure({ url: 'https://mytenant.current.uri' });

    await track.postEvent(event);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.PAGE_VISITED,
        tenant: 'mytenant',
      });
  });

  it('should log message for UndefinedTenantError from the uri `http://localhost:9000`', async () => {
    const log = spy();
    config.tenant = undefined;
    global.dom.reconfigure({ url: 'http://localhost:9000' });
    track = init(config, http.post, log);

    await track.postEvent(event);

    expect(log).to.have.been.calledOnce;
  });

  it('should use user define function to set the tenant', async () => {
    config.tenant = undefined;
    global.dom.reconfigure({ url: 'https://www.current.uri/tenantFromPath/restOfPath?search=test' });
    config.tenantConfig = {
      extractTenant: url => url.pathname.split('/')[1],
    };
    track = init(config, http.post);
    await track.postEvent(event);

    expect(http.post).to.have.been.calledWithMatch(
      'https://tracker.saagie.io/track/event', {
        type: EventType.PAGE_VISITED,
        tenant: 'tenantFromPath',
      });
  });
});
