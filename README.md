# GeoCode Scaffolded Visual Programming platform

## About

The goal of GeoCode is to get students exploring geological theats using
the practice of programming. In this case, we are using Blockly to generate
code that runs a simple tephra distrobution model.

Students change eruption parameters using [Blockly](https://developers.google.com/blockly/).

## Technology reference links:
* [Blockly](https://developers.google.com/blockly/) Block programming tool developed by Google.
* [JS-interpreter](https://github.com/NeilFraser/JS-Interpreter) An isolated javascript evaluation engine.
* [mobx](https://github.com/mobxjs/mobx) Simple, scalable state management.
* [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)  Transactional, MobX powered state container
* [styled-components](https://www.styled-components.com/) CSS only components via ES6.
* [PixiJS](http://www.pixijs.com/) 2D Graphics and scene-graph utlity.
* [React-Pixi](https://reactpixi.org/) Use react state to drive Pixi scenes.
* [React](https://reactjs.org/) Web Components.
* [TypeScript](https://www.typescriptlang.org/) Javascript that scales.


## Development

### Initial steps

1. Clone this repo and `cd` into it
2. Run `npm install` to pull dependencies.
3. Run `npm start` to run `webpack-dev-server` in development mode with hot module replacement.

### Building

If you want to build a local version run `npm build`, it will create the files in the `dist` folder.
You *do not* need to build to deploy the code, that is automatic.  See more info in the Deployment section below.

### Stores

At the moment all data is saved in the store `stores/simulation-store.ts`.
The store is coupled to the simulation, and the code interpreter. It would be
nice to silo these three concerns better.

### The simulation and tephra calculation

The simulation is a simple tephra calculation function defined in `tephra2.ts`.
This function will be improved, modified with the help of our volcanologist partners.

### Developing new Blockly code blocks
The Blockly configurations and blocks are configured in:
* `public/blocks.js` These are the custom blocks.
* `public/normal-setup.xml` This is the saved workspace (program in progress).
* `public/toolboc.xml` This is the list of blocks available in the toolbox.

You can use the [block factory](https://blockly-demo.appspot.com/static/demos/blockfactory/index.html)
to create new block elements, or you can just look at `blocks.js` for examples to copy from.

If you want to set a default block program modify the contents of `public/normal-setup.xml`.
You can copy your current workspace (from eg http://localhost:8080/) by viewing the
developer tools, ckicking on the "Application" tab, and looking in Local Storage. The
XML will be stored in local storage under the key "blockly-workspace".

The block's UI and code generation methods are both defined in `blocks.js`.  

The UI the blocks get defined in the `Blockly.Blocks` global object.
Blocks register themselves in this object using a unique key, such as
`Blockly.Blocks['print]`.

The Code generation for the blocks are defined in the same file in a global variable
named `Blockly.JavaScript`.

The any custom functions must be defined in `interpeter.js` in the function named
`makeInterperterFunc`.  Look at example to see how the function is registered:

```
    addFunc("setWindspeed", (...args) => {
      const params = (unwrap(args)[0]);
      simulation.setWindSpeed(params);
    });

```

The above method adds "setWindspeed" as a new javascript function that the
blockly generated code can use.  In this example, it modifies a parameter in the
simulation store.

### Notes

1. Make sure if you are using Visual Studio Code that you use the workspace version of TypeScript.
   To ensure that you are open a TypeScript file in VSC and then click on the version number next to
   `TypeScript React` in the status bar and select 'Use Workspace Version' in the popup menu.

## Deployment

*TODO* Set up Travis Deployment

Production releases to S3 are based on the contents of the /dist folder and are built automatically by Travis
for each branch pushed to GitHub and each merge into production.

Merges into production are deployed to http://geocode.concord.org.

Other branches are deployed to http://geocode.concord.org/branch/<name>.

You can view the status of all the branch deploys [here](https://travis-ci.org/concord-consortium/geocode/branches).

To deploy a production release:

1. Increment version number in package.json
2. Create new entry in CHANGELOG.md
3. Run `git log --pretty=oneline --reverse <last release tag>...HEAD | grep '#' | grep -v Merge` and add contents (after edits if needed to CHANGELOG.md)
4. Run `npm run build`
5. Copy asset size markdown table from previous release and change sizes to match new sizes in `dist`
6. Create `release-<version>` branch and commit changes, push to GitHub, create PR and merge
7. Checkout master and pull
8. Checkout production
9. Run `git merge master --no-ff`
10. Push production to GitHub
11. Use https://github.com/concord-consortium/starter-projects/releases to create a new release tag

### Testing

Run `npm test` to run jest tests. Run `npm run test:full` to run jest and Cypress tests.

##### Cypress Run Options

Inside of your `package.json` file:
1. `--browser browser-name`: define browser for running tests
2. `--group group-name`: assign a group name for tests running
3. `--spec`: define the spec files to run
4. `--headed`: show cypress test runner GUI while running test (will exit by default when done)
5. `--no-exit`: keep cypress test runner GUI open when done running
6. `--record`: decide whether or not tests will have video recordings
7. `--key`: specify your secret record key
8. `--reporter`: specify a mocha reporter

##### Cypress Run Examples

1. `cypress run --browser chrome` will run cypress in a chrome browser
2. `cypress run --headed --no-exit` will open cypress test runner when tests begin to run, and it will remain open when tests are finished running.
3. `cypress run --spec 'cypress/integration/examples/smoke-test.js'` will point to a smoke-test file rather than running all of the test files for a project.

## License

GeoCode  Projects are Copyright 2018 (c) by the Concord Consortium and is distributed under the [MIT license](http://www.opensource.org/licenses/MIT).

See license.md for the complete license text.
