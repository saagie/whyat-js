import jsdom from 'jsdom';

const {JSDOM} = jsdom;

global.window = new JSDOM('<!doctype html><html><body></body></html>');
global.document= window.document;
window.navigator = {
  appCodeName: 'Mozilla',
  appName: 'Netscape',
  appVersion: '5.0 Chrome/58.0',
  platform: 'MacIntel',
  userAgent: 'Mozilla/5.0 Chrome/58.0',
}