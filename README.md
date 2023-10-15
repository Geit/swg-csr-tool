# SWG CSR Tool
A Kibana Plugin that allows server operators to search for and view information about in-game objects when dealing with Customer Support requests.

> Note, this plugin relies heavily on Legends-specific extensions to [`swg-graphql`](https://github.com/Geit/swg-graphql) and is totally untested without those extensions. Contributions that feature-flag those dependencies are welcome, but it's likely a complex undertaking.

---

## Development

See the [Kibana contributing guide](https://www.elastic.co/guide/en/kibana/master/development.html) for instructions setting up your development environment. This repository needs to be checked out as a child of the Kibana repository's `plugin` folder.

Run the following from within the Kibana root folder to start the project:

```
yarn es snapshot
---seperate terminal---
yarn start

Kibana starts at http://localhost:5601 and the default username/password is elastic/changeme
```

If you're running this for the first time, you'll need to setup [`swg-graphql`](https://github.com/Geit/swg-graphql) and run `yarn codegen` first.

## Project Structure
This repo is structured as a standard Kibana plugin. The [Kibana Developer Guide](https://www.elastic.co/guide/en/kibana/current/kibana-architecture.html) gives a good overview of the overall conventions that plugins follow. Briefly: Frontend code is served from `public`, and is compiled into an async bundle that is loaded when the Plugin's routes are active. Serverside code is run from `server`, this primarily consists of a proxy route to an `swg-graphql` instance, the location of which can be configured through Kibana's advanced settings. Finally, any code (mostly constants) shared by both server and Frontend is stored in `common.

This project is in Typescript, and the types for GraphQL requests are generated using `graphql-codegen`. You can use `yarn codegen` to regenerate any generated files (`*.generated.ts`, `*.queries.ts`). Do not edit these files by hand.

## Scripts

The following script are available

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