# xAPI Profile Server
The overall goal of the ADL Initiative’s xAPI profile effort is to advance semantic interoperability and simplify xAPI implementation, helping to make data-driven learning accessible and impactful to practitioners and learners.  The xAPI Profile Server offers an enhanced set of tools to create profiles, link vocabularies semantically, persist identifiers, and provide lookup services for tool vendors and practitioners.

More information on this project is available at **[adlnet.gov](https://adlnet.gov/projects/xapi-profile-server/)**.

### Project Structure
Root Project folder/  
|  _base project files - Readme, server app, dependencies list.._  
| -- client/ - React app, React dependencies list, UI components, HTML assets, etc  
| -- server/ - Express app, server routes, profile db models

## Dependencies
Development environment dependencies to run the profile server. Download and install.

- node (v. 12.16.2): https://nodejs.org/en/download/
- yarn (v.1.21.1): https://yarnpkg.com/
- mongo (v. 4.0.1): https://www.mongodb.com/download-center/community

A full list of library dependencies can be found in: 
- package.json
- client/package.json

## Client
A React Single Page App created using `yarn create react-app client`. Follow the [Deliverable History](https://github.com/adlnet/profile-server/wiki/Deliverable-History) for development and builds. You will need to `$client: yarn` to install node_modules.

## Server
Express server configured to serve a React SPA. It also has the API designed for the Profile server. It uses MongoDB as its database. You will need to `$: yarn` to install server node_modules.

## Dev Setup
1. In a terminal, start the mongodb server `mongod`
1. Extract the project
1. In a new terminal navigate inside the project folder and enter the command `$: yarn` to install node modules
1. Verify there is an `.env` file at the root of the project. If not, check the included `.env.example` file that is included in the root directory [here](https://github.com/adlnet/profile-server/blob/main/.env.example).
1. Type `$: yarn start` to start the profile server
1. Open another terminal and navigate to `<project_folder>/client`
1. Type `yarn` to install the profile client modules
1. Then type `$: yarn start` to start the client app.
    1. The initial start of the client development server takes significant time to start-up. This is due to dependency mapping it needs to run to figure out where required files exist in the project. Subsequent starts of the development server are much faster.

## Test
Server-side unit tests are located at `/test`. They can be run by using the command `$: yarn test` at the command line. Results will be printed in the terminal.

> NOTE: There are parallel tests in /server/test/routes/publicAPI/profile/metadata.test.js that will occasionally fail when running the full test suite. You can individually run those metadata tests by running the command `$: yarn test metadata`. 

The profileValidator module has tests that use the profiles found in ADL's `https://github.com/adlnet/xapi-authored-profiles` project. Download or clone the project into the `/server/profileValidator` folder before running these tests.

## Run
A browser tab should open and show the index page of the app after executing the `$client: yarn start` command in the client folder. _If it didn't automatically open, you can navigate to http://localhost:3000_


# High-Level List of Features / Tasks
You can find a list of tasks performed / features added for a given deliverable here:

[Deliverable History](https://github.com/adlnet/profile-server/wiki/Deliverable-History)
