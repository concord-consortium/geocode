import { defineConfig } from "cypress"
import { addMatchImageSnapshotPlugin } from "@simonsmith/cypress-image-snapshot/plugin"
const fs = require('fs-extra');
const path = require('path');

function getConfigFile (name) {
  const pathToConfigFile = path.resolve('config', name);
  return fs.readJson(pathToConfigFile)
    // Don't throw an error if config file does not exist. Just return an empty config.
    .catch(_ => {})
}

function getEnvVariablesStartingWith(prefix: string) {
  const result = {};
  Object.keys(process.env).forEach(key => {
    if (key.startsWith(prefix)) {
      const [_, configKey] = key.split(prefix);
      if (configKey) { // Ensure configKey is not an empty string
        result[configKey] = process.env[key];
      }
    }
  });
  return result
}

export default defineConfig({
  e2e: {
    "video": false,
    "defaultCommandTimeout": 10000,
    "projectId": "97wsoi",
    "viewportWidth": 1000,
    "viewportHeight": 660,

    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        // Note that it needs to match or exceed viewportHeight and viewportWidth values specified in cypress.json.
        // TODO: types error?
        // launchOptions.args.width = 1000
        // launchOptions.args.height = 660
        // open issue for Cypress screenshot, fix sizes https://github.com/cypress-io/cypress/issues/587
        launchOptions.preferences['width'] = 1000
        launchOptions.preferences['height'] = 660
        launchOptions.preferences['resizable'] = false
        return launchOptions
      })

      addMatchImageSnapshotPlugin(on, config)

      // Why do we need to read process.env again? Cypress preprocess environment variables. If it finds one with name
      // that matches one of the Cypress config options, it will update the config and remove this entry from environment
      // variables set. It would work fine unless the same option is specified in our own environments.json or user-config.json.
      // In that case, env variable would be lost and overwritten. However, we always do want env variable to be the
      // most important, final value. That's why we read unprocessed process.env variables again and add them back to the set.
      const unifiedCypressEnvVariables = Object.assign(getEnvVariablesStartingWith("CYPRESS_"), config.env);
      const environment = unifiedCypressEnvVariables.testEnv || 'dev';

      // First, read environments.json
      return getConfigFile("environments.json")
        .then(content => {
          // Pick correct set of values for given environment.
          const envSpecificConfig = content?.[environment] || { "baseUrl": "http://localhost:8080/" };
          return Object.assign(envSpecificConfig, unifiedCypressEnvVariables)
        })
    }
  }
})
