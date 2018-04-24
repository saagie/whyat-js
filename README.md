[![Build Status](https://travis-ci.org/saagie/whyat-js.svg?branch=master)](https://travis-ci.org/saagie/whyat-js)
# whyat-js
Y@ (whyat) helps you to track your user’s actions within your application and store it directly in the data source of your choice

Use with [Y@ Server](https://github.com/saagie/whyat-server) to store your user's events.

## Installation 
```$ npm install whyat-js --save```

## Getting Started
```
import {init} from 'whyat-js';
  
//init the tracker  
let user = {id: 'j.doe@doe.corporation.com', name: 'John Doe'};
const tracker = init({
                        url: '127.0.0.1:5000',
                        area: 'datacenter 1'
                        tenant: 'myTenantName',   
                        platform: 'production',
                        application: 'myApplicationName', 
                        user
                    });

  
//use it  
track.linkClicked('My link name');
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
      area: yourDatacenterOrDeploymentArea,  
      tenant: yourTenantNameOrId
      browser: {
        appCodeName: window.navigator.appCodeName,
        appName: window.navigator.appName,
        appVersion: window.navigator.appVersion,
        platform: window.navigator.platform,
        userAgent: window.navigator.userAgent,
      },
      autoTrackPageVisited: {
        domContentLoaded: true, 
        hashChange: true
      },
      user: {
        id: your user id
        ... // others informations about your user
      }
    });
```

By default Y@-js track when a page is loaded (event listener on `domContentLoaded`) or the url's hash change (event listener on `hashchange`).  
If you don't want automatic tracking of visited pages, you can override the `defaultAutoPageTracking` configuration.

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
- area: your data center/ deployment area id or name (optional)  
- tenant: your customer/client id or name
- application: your application id or name
- platform: your platform id or name (production, test, dev, as you wish ...)
- user: an object to define properties of your user, only an id attribute is mandatory
- an optional browser configuration object with the following attributes :
    - appCodeName
    - appName
    - appVersion
    - platform
    - userAgent
- autoTrackPageVisited: a optional configuration to enable/disable auto-tracking of page visited. 
    - domContentLoaded: true by default, track page visited on `DOMContentLoaded` event
    - hashChange: true by default, track page visited on `hashchange` event, when url hash is modified (useful for app single page app)
- tenantConfig: a optional configuration to specify how to set tenant if not already define
    - extractTenant: is a function declaration with `document.location` as default parameter to define how get the tenant name or id  
  
By default the tenant (if not already define via the tenant option) is set from the `document.location.hostname`, we take the first part before the first `-` or `.`  
Example: `mytenant-myapp.mydomain.com` or `mytenant.myapp.mydomain.com`, we set tenant with `mytenant` value  

    

```
const tracker = init({
      url: 'https://tracker.saagie.io/track/event',
      area: 'datacenter1',
      tenant: 'Saagie',
      application: 'Saagie Datagovernance',
      platform: 'Production',
      user: {
        id: your user id
        ... // others informations about your user
      }
      browser: {
        appCodeName: window.navigator.appCodeName,
        appName: window.navigator.appName,
        appVersion: window.navigator.appVersion,
        platform: window.navigator.platform,
        userAgent: window.navigator.userAgent,
      },
      autoTrackPageVisited: {
        domContentLoaded: true, // Track a PAGE_VISITED event each time 'domContentLoaded' is triggered 
        hashChange: true // Track a PAGE_VISITED event each time url's hash change
       },
      tenantConfig: {
        extractTenant: url => extractTenant: url => url.pathname.split('/')[1], // function to extract tenant from first path element
      },
    });
```

### Post a generic event
There is one main function in Y@-js : ```postEvent()```
This function use post and log methods defined via the init function and take only 1 parameter : an Event object

The structure of the event object is :
- type: the type of the event (PAGE_VIEWED, LINK_CLICKED, your custom event ...)
- payload: to add some context informations to your event
- user: an object to override the configuration user's informations
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
<b>Reminder: by default page viewed are automatically tracker by Y@-js</b>  
If you want to track a page viewed event, you can use the helper function : ```pageViewed```  
This function take as parameters : 
- user: an object to override the configuration user's informations
- name: the name of the page, by default we use the document.title value
- payload: an object to add contextual information (if your provide a name attribut, it will be replace by the value of the name attribute of this function)
- uri: uri of the event's location, by default we use the document.location.href value

```
let user = {id: '123456', firstName: 'John', lastName: 'Doe, ...};

//Simplest option using document title and no contextual informations
track.pageViewed();

// Version with an override version of the user data
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
- user: an object to override the configuration user's informations
- name: the name of the link
- payload: an object to add contextual information (if your provide a name attribut, it will be replace by the value of the name attribute of this function)
- uri: uri of the event's location, by default we use the document.location.href value

```
let user = {id: '123456', firstName: 'John', lastName: 'Doe, ...};

//Version with a link name  
track.linkClicked('My link name');
  
//Version with an override version of the user data and link name
track.linkClicked(user, 'My link name');
  
//Version with a link name and contextual informations
track.linkClicked(user, 'My link name', {aCustomInfo: 'aCustomValue', ...});
  
//Full version of the helper function
track.linkClicked(user, 'My link name', {aCustomInfo: 'aCustomValue', ...}, 'http://my.website.com/awesome/resource');
```
 
### Form submitted event helper 
If you want to track a link clicked event, you can use the helper function : ```formSubmitted```   
This function take as parameters : 
- user: an object to override the configuration user's informations
- name: the name of the form
- payload: an object to add contextual information, usually data of the form (if your provide a name attribut, it will be replace by the value of the name attribute of this function)
- uri: uri of the event's location, by default we use the document.location.href value

```
let user = {id: '123456', firstName: 'John', lastName: 'Doe, ...};
 
//Version with a form name
track.formSubmitted('My form name');
  
//Version with an override version of the user data and a form name
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
