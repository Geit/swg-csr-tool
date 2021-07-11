# SWG CSR Tool
A Kibana Plugin that to allow server operators to search for and view information about in-game objects when dealing with Customer Support requests.

---

## Development

See the [Kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) for instructions setting up your development environment. This repository needs to be checked out as a child of the Kibana repository's `plugin` folder.

If you're running this for the first time, you'll need to setup [swg-graphql](https://github.com/Geit/swg-graphql) and run `yarn codegen` first.

## Project Structure
This repo is structured as a standard Kibana plugin. The [Kibana Developer Guide](https://www.elastic.co/guide/en/kibana/current/kibana-architecture.html) gives a good overview of the overall conventions that plugins follow. Briefly: Frontend code is served from `public`, and is compiled into an async bundle that is loaded when the Plugin's routes are active. Serverside code is run from `server`, this primarily consists of a proxy route to an `swg-graphql` instance, the location of which can be configured through Kibana's advanced settings. Finally, any code (mostly constants) shared by both server and Frontend is stored in `common.

This project is in Typescript, and the types for GraphQL requests are generated using `graphql-codegen`. You can use `yarn codegen` to regenerate any generated files (`*.generated.ts`, `*.queries.ts`). Do not edit these files by hand.

## Scripts

The following script are aviailable

### `yarn codegen`
  Runs GraphQL Codegen on the repository. By default codegen is setup to query a `[swg-graphql](https://github.com/Geit/swg-graphql)` server that is running on port 4000. 

### `yarn plugin-helpers`
  Allows raw access to anything the Kibana Plugin Helpers CLI can do.

### `yarn build`
  Packages the plugin for installation on a production Kibana instance. See the Kibana documentatuon on [Installing Plugins](https://www.elastic.co/guide/en/kibana/current/kibana-plugins.html#install-plugin) for more information.

### `yarn kbn`
  Allows kbn commands to be run.

### `yarn lint`
  Runs ESLint on the codebase.