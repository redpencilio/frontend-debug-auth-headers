'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    // Add options here
    codemirror: {
      modes: ['javascript', 'sparql'],
    }
  });
  app.import('vendor/materialize/js/materialize.min.js');

  app.import('vendor/materialize/css/materialize.min.css');
  app.import('vendor/google/google-icons.css');

  app.import('vendor/google/google-icons.woff2');
  
  //hack
  app.import('vendor/codemirror/theme/duotone-light.css');
  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree();
};
