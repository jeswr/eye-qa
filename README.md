# EYE QA

A repo for doing well-typed question-answering between [eye-js](https://github.com/eyereasoner/eye-js) and TypeScript code

<!-- Template repo for my Typescript projects
[![GitHub license](https://img.shields.io/github/license/jeswr/useState.svg)](https://github.com/jeswr/useState/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@jeswr/use-state.svg)](https://www.npmjs.com/package/@jeswr/use-state)
[![build](https://img.shields.io/github/actions/workflow/status/jeswr/useState/nodejs.yml?branch=main)](https://github.com/jeswr/useState/tree/main/)
[![Dependabot](https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot)](https://dependabot.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) -->

## Usage
This is in experimental stages for now.

The key ideas here are:
 - You define the expected shape of graphs that are called by `log:askQuery` in [./shapes](./shapes); these shapes should use the [fno](https://fno.io/) ontology
 - These shapes can be used as the premise of a `log:askQuery` like in [./rules/graphAsks/claims.n3q](rules/graphAsks/claims.n3q). Running `npm run build` will compile this into a valid `n3` file and then bundle all `.n3` files in the [./rules/](./rules/) folder to be executed when `reason` is called.
 - Types for the shapes that are defined will be compiled to [./lib/ldo](./lib/ldo/). You can then define callback functions [./lib/handlers/fetch.ts](./lib/handlers/fetch.ts) which can be registered to the `DatasetHandler` like in [./lib/index.ts](./lib/index.ts).

<!-- When this repository is used as a template, you will need to do the following:
 - Provide secrets tokens for github (`GH_TOKEN`) and NPM (`NPM_TOKEN`)
   NPM tokens (`NPM_TOKEN`) should be automation tokens generated at https://www.npmjs.com/settings/[user]/tokens/
   Github tokens (`GH_TOKEN`) should be generated at https://github.com/settings/tokens/new?scopes=repo
   Secrets should be added at https://github.com/jeswr/[repository-name]/settings/secrets/actions
 - Fill in missing entries in the package.json -->

## License
©2024–present
[Jesse Wright](https://github.com/jeswr),
[MIT License](https://github.com/jeswr/useState/blob/master/LICENSE).
