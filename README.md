# xAPI Profile Server
The overall goal of the ADL Initiative’s xAPI profile effort is to advance semantic interoperability and simplify xAPI implementation, helping to make data-driven learning accessible and impactful to practitioners and learners.  The xAPI Profile Server offers an enhanced set of tools to create profiles, link vocabularies semantically, persist identifiers, and provide lookup services for tool vendors and practitioners.

More information on this project is available at **[adlnet.gov](https://adlnet.gov/projects/xapi-profile-server/)**.

### Project Structure
Docker Folder/
| Root Project folder/  
| -- _base project files - Readme, server app, dependencies list.._  
| ---- client/ - React app, React dependencies list, UI components, HTML assets, etc  
| ---- server/ - Express app, server routes, profile db models

__Note:__ _You can still build as detailed in the root project folder, project was dockerized to assist with development and deployment._

## Dependencies
Development environment dependencies to run the profile server. Download and install.

- node (v. 12.16.2): https://nodejs.org/en/download/
- yarn (v.1.21.1): https://yarnpkg.com/
- mongo (v. 4.0.1): https://www.mongodb.com/download-center/community
- docker (v. 20.10.6) https://docs.docker.com/get-docker/
- docker-compose (v. 1.18.0) https://docs.docker.com/compose/install/

A full list of library dependencies can be found in: 
- package.json
- client/package.json

## Client
A React Single Page App created using `yarn create react-app client`. Follow the [Deliverable History](https://github.com/adlnet/profile-server/wiki/Deliverable-History) for development and builds. You will need to `$client: yarn` to install node_modules.

## Server
Express server configured to serve a React SPA. It also has the API designed for the Profile server. It uses MongoDB as its database. You will need to `$: yarn` to install server node_modules.

## Dev Setup
1. Create the .env file in the `Root Project Folder`
2. In a terminal, run 'docker-compose up -d'
3. Go to localhost to test installation runs (No Admin has been created, will update as needed)

## Run
A browser tab should open and show the index page of the app after executing the `$client: yarn start` command in the client folder. _If it didn't automatically open, you can navigate to http://localhost:3000_


# High-Level List of Features / Tasks
You can find a list of tasks performed / features added for a given deliverable here:

[Deliverable History](https://github.com/adlnet/profile-server/wiki/Deliverable-History)
