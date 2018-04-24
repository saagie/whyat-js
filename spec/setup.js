import jsdom from 'jsdom';

const { JSDOM } = jsdom;

global.dom = new JSDOM('<!doctype html><html><head><title>Y@ page title</title></head><body></body></html>',
  {
    url: 'http://current.uri',
  });

global.window = dom.window;
global.document= window.document;
global.HTMLElement = window.HTMLElement;
