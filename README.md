[![Build Status](https://travis-ci.org/saagie/whyat-js.svg?branch=master)](https://travis-ci.org/saagie/whyat-js)
# whyat-js
Y@ (whyat) helps you to track your user’s actions within your application and store it directly in the data source of your choice

Use with [Y@ Server](https://github.com/saagie/whyat-server) to store your user's events.

## Installation 
```$ npm install whyat-js --save```

Y@-js require peer dependencies, you need to install ```whatwg-fetch``` and ```babel-polyfill```  
For ```babel-polyfill```, you also need to add ```required('babel-polyfill')``` in your application.

## Getting Started
```
import {init} from 'whyat-js';
  
//init the tracker  
const tracker = init('127.0.0.1:5000');

let user = {id: 'j.doe@doe.corporation.com', name: 'John Doe'};
  
//use it  
tracker.pageViewed(user);
```

## Overview

Y@-js give you the ability to simply track your user's behaviour on your website or webapp.

Init the tracker with the environment configuration : 

```
const tracker = init(
{
      url: urlOfTheWhyatServer,
      application: yourApplicationNameOrId,
      platform: yourPlatformNameOrId,
      browser: {
        appCodeName: window.navigator.appCodeName,
        appName: window.navigator.appName,
        appVersion: window.navigator.appVersion,
        platform: window.navigator.platform,
        userAgent: window.navigator.userAgent,
      }
    });
```

Tracking a event is done with only one method ```postEvent()```  
  
``` 
tracker.postEvent({ type: typeOfYourEvent',
                    user : {id: 'myCustomId', firstName:'John', lastName: 'Doe' ...},
                    payload: {...}, // extra data to add context to your event
                    uri: 'http://my.website.com/awesome/resource'
                    });
```

But you can use some of the helper functions to facilitate the tracking of common events

```
let user =  {id: 'myCustomId', firstName:'John', lastName: 'Doe' ...};
  
// When a user view a page
tracker.pageViewed(user);
  
//When a user click a link
tracker.linkClicked(user, myLinkNameOrId);
  
//When a user submit a form
tracker.formSubmitted(user, myFormNameOrIf, {...myFormValues});
```

## Usage
### Initialisation of the tracker 

The init method of the tracker take 3 parameters : 
- A configuration object
- An optional post function (by default we use whatwg-fetch)
- An optional log function (by default log looks like ``` [Y@]:  your log message```)

The configuration object is composed of : 
- url : the url of Y@ server
- application: your application id or name
- platform: your platform id or name (production, test, dev, as you wish ...)
- an optional browser configuration object with the following attributes :
    - appCodeName
    - appName
    - appVersion
    - platform
    - userAgent
    

```
const tracker = init({
      url: 'https://tracker.saagie.io/track/event',
      application: 'Saagie Datagovernance',
      platform: 'Production',
      browser: {
        appCodeName: window.navigator.appCodeName,
        appName: window.navigator.appName,
        appVersion: window.navigator.appVersion,
        platform: window.navigator.platform,
        userAgent: window.navigator.userAgent,
      }
    });
```

### Post a generic event
There is one main function in Y@-js : ```postEvent()```
This function use post and log methods defined via the init function and take only 1 parameter : an Event object

The structure of the event object is :
- type: the type of the event (PAGE_VIEWED, LINK_CLICKED, your custom event ...)
- payload: to add some context informations to your event
- user: a object to define your user's informations which need to have an ```id``` attribute
- uri: uri of the event's page 

```
tracker.postEvent({
                      type: 'PAGE_VIEWED',
                      payload: {aCustomInfo: 'aCustomValue', ...},
                      user: {id: '123456', firstName: 'John', lastName: 'Doe, ...},
                      uri: 'http://my.website.com/awesome/resource'
                  });
```

### Page viewed event helper
If you want to track a page viewed event, you can use the helper function : ```pageViewed```  
This function take as parameters : 
- user: object which represent your user
- name: the name of the page, by default we use the document.title value
- payload: an object to add contextual information (if your provide a name attribut, it will be replace by the value of the name attribute of this function)
- uri: uri of the event's location, by default we use the document.location.href value

```
let user = {id: '123456', firstName: 'John', lastName: 'Doe, ...};

//Simplest option using document title and no contextual informations
track.pageViewed(user);
  
//Version with a custom title and no contextual informations
track.pageViewed(user, 'My custom title');
  
//Version with a custom title and contextual informations
track.pageViewed(user, 'My custom title', {aCustomInfo: 'aCustomValue', ...});
  
//Full version of the helper function
track.pageViewed(user, 'My custom title', {aCustomInfo: 'aCustomValue', ...}, 'http://my.website.com/awesome/resource');
```
 
### Link clicked event helper
If you want to track a link clicked event, you can use the helper function : ```linkClicked```   
This function take as parameters : 
- user: object which represent your user
- name: the name of the link
- payload: an object to add contextual information (if your provide a name attribut, it will be replace by the value of the name attribute of this function)
- uri: uri of the event's location, by default we use the document.location.href value

```
let user = {id: '123456', firstName: 'John', lastName: 'Doe, ...};
  
//Version with a link name
track.linkClicked(user, 'My link name');
  
//Version with a link name and contextual informations
track.linkClicked(user, 'My link name', {aCustomInfo: 'aCustomValue', ...});
  
//Full version of the helper function
track.linkClicked(user, 'My link name', {aCustomInfo: 'aCustomValue', ...}, 'http://my.website.com/awesome/resource');
```
 
### Form submitted event helper 
If you want to track a link clicked event, you can use the helper function : ```formSubmitted```   
This function take as parameters : 
- user: object which represent your user
- name: the name of the form
- payload: an object to add contextual information, usually data of the form (if your provide a name attribut, it will be replace by the value of the name attribute of this function)
- uri: uri of the event's location, by default we use the document.location.href value

```
let user = {id: '123456', firstName: 'John', lastName: 'Doe, ...};
  
//Version with a form name
track.formSubmitted(user, 'My form name');
  
//Version with a form name and contextual informations
track.formSubmitted(user, 'My form name', {myform: {form.attr1, form.attr2 ...});
  
//Full version of the helper function
track.formSubmitted(user, 'My form name', {myform: {form.attr1, form.attr2 ...}, 'http://my.website.com/awesome/resource');
```

##Tests

To run test you can simply : 
```
$ npm test
```

if you are in a TDD loop, you can watch changes to auto execute tests

```
$ npm test -- -w
```

## Authors

* **Guillaume Lours** - [glours](https://github.com/glours)
* **Jérôme Avoustin** - [rehia](https://github.com/rehia)

See also the list of [contributors](https://github.com/saagie/whyat-js/contributors) who participated in this project.

## License

This project is licensed under the Apache Licence version 2.0 - see the [LICENSE](LICENSE) file for details