# GeoCode Scaffolded Visual Programming platform

## About

The goal of GeoCode is to get students exploring geological threats using
the practice of programming. In this case, we are using Blockly to generate
code that runs a simple tephra distribution model and seismic activity model.

Students change eruption parameters using [Blockly](https://developers.google.com/blockly/).

## Links and branches

* `master`: The latest work, may not have been fully-QA'd so should not be used in production.
  http://geocode-app.concord.org/branch/master/index.html
* `production`: http://geocode-app.concord.org/
* `[tag]` (e.g. 2.1.0): Versioned releases. http://geocode-app.concord.org/version/2.1.0/index.html
* `[feature-branch]`: Feature branch. The built url will strip off any leading numbers in the branch (e.g.
  "1234-feature" -> "feature"). http://geocode-app.concord.org/branch/[feature]/index.html

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

### Contributing:

* Find a story from the [GeoCode - Pivotal Tracker](https://www.pivotaltracker.com/n/projects/2231509)
* Assign yourself the role story owner.
* Add `npaessel` or `sfentress` as a code reviewer for the story.
* Copy the Story ID, you will need it in the next step.
* Create a git topic branch in the format of  `#####-pt-story-headline-abbreviated`
where the PT story ID is thefirst part of the branch name.
* In your commit comment-body reference the PT Story ID  and URL.
e.g.: `[#1234567] https://www.pivotaltracker.com/story/show/1234567`
Commits should have concise headlines with details in the body.
* Test and lint your branch.
* Push it to GitHub e.g. `git push --set-upstream origin #####-pt-story-headline-abbreviated`
* After a few moments, your deployed branch should be available at
`http://geocode-app.concord.org/branch/<branchname>/index.html`.
Verify that your deploy worked, and copy the URL.
* When you are satisfied with your commits, and the deployment looks good, submit
a pull request for your branch in GitHub, adding `npaessel` or `sfentress`
as code reviewers. In your pull request summarize the work, reference the PT
story, and provide a link to the deployed demo branch.
* Update the PT story with a link to the demo deployment and the GitHub pull request.

### Stores

At the moment, all data is saved in the store `stores/simulation-store.ts`.
The store is coupled to the simulation and the code interpreter. It would be
nice to silo these three concerns better.

### The simulation and tephra calculation

The simulation is a simple tephra calculation function defined in `tephra2.ts`.
This function will be improved, modified with the help of our volcanologist partners.

### Developing new Blockly code blocks
The Blockly configurations and blocks are specified in the GeoCode project in the following locations:
* `src/blockly-blocks/blocks.js` Imports the files used for the custom blocks. Individual files are located in `src/blockly-blocks` (e.g., `src/blockly-blocks/block-add-town.js`, `src/blockly-blocks/block-add-volcano.js`, etc.).
* `src/assets/blockly-authoring/code/basic-setup.xml` and `src/assets/blockly-authoring/code/nested-loops.xml` These are the two default programs that are loaded in the Blocks panel (which file is used depends on settings).
* `src/assets/blockly-authoring/toolbox/first-toolbox.xml` and `src/assets/blockly-authoring/toolbox/full-toolbox.xml` These are the list of blocks available in the toolbox (which file is used depends on settings).

##### Creating a new block
You can create new blocks using the Blockly Developer Tools [block factory](https://blockly-demo.appspot.com/static/demos/blockfactory/index.html) or by copying and modifying an existing block in the GeoCode project.

If using the Block Factory, use the browser interface to create your new block.

If copying and modifying an existing block, start with one of the blocks located in `src/blockly-blocks` (e.g., `src/blockly-blocks/block-add-town.js`, `src/blockly-blocks/block-add-volcano.js`, etc.). Make a copy of one of the block files, and then make any needed changes or additions.

Whether using the Block Factory or copying and modifying an existing block, each new block must be added to the GeoCode project. To add a block to the project, create a new JavaScript module containing the block's UI and code generation methods. Name the new JavaScript module using kebab-case (e.g., `block-my-example-block.js`). Add the new JavaScript module to `src\blockly-blocks`, and add an import for the new JavaScript module in `blocks.js`. A new block must have a unique camelCase key (e.g., `myExampleBlock`).

Each existing GeoCode block has UI and code generation methods defined in its JavaScript module. Therefore, we must also define UI and code generation methods for our new block in the newly created JavaScript module that we added to `src\blockly-blocks` and imported in `blocks.js`. If you are using the Blockly Developer Tools Block Factory, take the Block Definition JavaScript and the Generator stub JavaScript and add it to your new block's JavaScript module. If copying and modifying an existing block, then be sure to make changes to both of these sections.

 The UI generation for the new block is defined in the `Blockly.Blocks` global object. This is done in the block's JavaScript module. Blocks register themselves in this object using a unique key (the block `name` field if you are using the Block Factory), such as `Blockly.Blocks['print']`.

Similarly, the code generation for the new block is defined in the block's JavaScript module in a global variable named `Blockly.JavaScript`.

Any custom functions added to a block's code generation must be defined in `interpreter.js` in the function named
`makeInterpreterFunc`.  Look at an example to see how the function is registered:

```
    addFunc("setWindspeed", (speed) => {
      simulation.setWindSpeed(speed);
    });
```

The above method adds "setWindspeed" as a new javascript function that the
blockly generated code can use.  In this example, it modifies a parameter in the
simulation store.

If a function needs to return data, in order to plug it into another block, the
return value must be wrapped in a `{ data: any }` object:

```
    addFunc("add", (params: {a: number, b: number}) => {
      const val = params.a + params.b;
      return {
        data: val
      };
    });
```

##### Adding the block to a toolbox
For a new block to be available in the list of blocks that a user can add from the Blocks panel, it must be added to one or both of the toolboxes located in `src/assets/blockly-authoring/toolbox/first-toolbox.xml` and `src/assets/blockly-authoring/toolbox/full-toolbox.xml`. Modify one or both of these XML files to include your new block. Create a new XML `block` element nested inside the proper `category` element. Be sure to set the `type` to the unique camelCase key that was created for your block (e.g., `myExampleBlock`). For example, the add volcano block is added to the volcano category by inserting `<block type="addVolcano"></block>` inside of the volcano category element. If your block requires default fields, then add the appropriate `field` elements inside of the `block` element.

##### Setting the default block program
To change the default block program that is shown in the Blocks panel when the app is loaded, modify the contents of `src/assets/blockly-authoring/code/basic-setup.xml`
or `src/assets/blockly-authoring/code/nested-loops.xml`. Depending on your settings, the program specified in one of these XML files will be loaded as the default program.

You can also create a program in the Blocks panel (from eg http://localhost:8080/), access a copy of the XML defining the program, and copy it into one of the above files. To access the XML of the current program in the Blocks panel by doing the following:
* in GeoCode open the model options and press Save current code to local storage
* open the browser developer tools
* click on the "Application" tab
* under "Storage" open "Local Storage"
* the program XML is stored in local storage under the key "blockly-workspace"

### Notes

1. Make sure if you are using Visual Studio Code that you use the workspace version of TypeScript.
   To ensure that you are open a TypeScript file in VSC and then click on the version number next to
   `TypeScript React` in the status bar and select 'Use Workspace Version' in the popup menu.

## Seismic data

See the [seismic data readme](docs/seismic-data/readme.md), and the `fetch-data` scripts in package.json.

## Deployment

Production releases to S3 are based on the contents of the /dist folder and are built automatically by Travis
for each branch pushed to GitHub and each merge into production.

Merges into production are deployed to http://geocode-app.concord.org.

Other branches are deployed to http://geocode-app.concord.org/branch/<name>.

You can view the status of all the branch deploys [here](https://app.travis-ci.com/github/concord-consortium/geocode/builds/).

The report-item-interactive is deployed next to the main app in a file called `report-item.html` eg: http://geocode-app.concord.org/branch/<name>/report-item.html

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
11. Use https://github.com/concord-consortium/geocode/releases to create a new release tag

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

## URL Parameters
- hide-model-options: when included, the model options authoring dialog in the upper-right is hidden.
- unit={name}: configure application for {unit}. Unit name can currently be set to `Seismic` or `Tephra` (e.g., `unit=Seismic`). Values are case sensitive.

## License

GeoCode is Copyright 2018 (c) by the Concord Consortium and is distributed under the [MIT license](http://www.opensource.org/licenses/MIT).

See license.md for the complete license text.
