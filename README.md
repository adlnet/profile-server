# xAPI Profile Server
The profile server is based on the MERN (Mongo, Express, React, Node) stack. All source files are included in the zip. 

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
A React Single Page App created using `yarn create react-app client`. Follow the [Readme](./client/README.md) for development and builds. You will need to `$client: yarn` to install node_modules.

## Server
Express server configured to serve a React SPA. It also has the API designed for the Profile server. It uses MongoDB as its database. You will need to `$: yarn` to install server node_modules.

## Dev Setup
1. In a terminal, start the mongodb server `mongod`
1. Extract the project
1. In a new terminal navigate inside the project folder and enter the command `$: yarn` to install node modules
1. Verify there is an `.env` file at the root of the project. If not,
    1. Create the missing `.env` file,
        1. add `connectionString=mongodb://localhost:27017/profileServer`
        1. add `profileRootIRI=https://profiles.adlnet.gov/xapi`
        1. add `QUERY_RESULT_LIMIT=10`
        1. add `email_user=`"your email address"
        1. add `email_pass=`"your email password or app key"
        1. add `email_server=`"your email smtp server address"
        1. add `system_email_from=`"your email address"
        1. add `clientURL=http://localhost:3000`
        1. add `debug=true`
        1. add `MONGOMS_SYSTEM_BINARY=`path to your mongod.exe file
        1. add `lockTimeout=600000`  (time in milliseconds)
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
The following is a list of tasks performed / features added for a given deliverable. 

## Feb 7 Deliverable
**Project Environment**  
- Set up project structure  
- Installed MERN stack   
- Configured dev environment   

**Server**  
- Created an initial Express app   
- Created ODM to reflect concepts necessary for creating and publishing a profile  
- Created the REST API routes necessary for creating and publishing a profile  
- Created routes to deliver the client app  

**Client**  
- Created home view for a logged-in, registered user that shows a list of Organizations the user is a member of  
- Created bare-bones organization pages necessary for profile creation  
- Created Profile pages  
    - Created Profile details view  
    - Created Edit Profile form  
- Created Statement Template pages  
    - Created Statement Template details view  
    - Created Statement Template create & edit forms  
    - Created Statement Template search and add template view  
- Created Pattern pages  
    - Created Pattern details view  
    - Created Pattern create & edit forms  
    - Created Pattern search and add template view  
- Created Concept pages  
    - Created Concept details view  
    - Created Concept create & edit forms   
    - Created Concept search and add template view  
- Added client side state management  
    - Created client state model  
    - Created client state management actions  
- Added client API proxy for accessing server API  
- Started connecting views to client state  

## June 30 Deliverable  
**Project Environment**  
- Installed Jest, a unit test framework  

**Server**  
- Created key authentication for the public API  
- Added support for persisting profiles  
    - Added profile versioning management  
    - Added default IRI and URL generation  
- Added support for persisting statement templates  
    - Added way to create and store template rules  
    - Added way to create and store determining properties of the template  
- Added support for persisting concepts  
    - Added ways to create various concept types  
    - Added properties that define those types  
- Added support for persisting patterns  
    - Added ways to create various pattern types  
    - Added various properties to contain reference patterns and templates  
- Created the process for importing a valid jsonld profile  
- Created the process for retrieving a valid jsonld profile  
- Created profile validation  
- Created user authentication  
- Created user management features  
- Created permission levels  

**Client**  
- Created User login page  
- Created UI components to support joining a Working Group (Organization)  
- Updated Profile pages to align with UI design  
- Updated Statement Template pages to align with UI design  
- Updated Pattern pages to align with UI design  
- Updated Concept pages to align with UI design  
- Added metrics and sparkline  
- Created global error handling for the UI  
- Added info panels for additional information  
- Refactored client state management  

## October 19 Deliverable
**Project Environment**
- created build script that generate executables to simplify deployment
- added configuration for various components of the profile server
- added command line script to configure the profile server
- added script to generate the system admin

**Server**
- Created a messaging bus to enable publishing and subscribing to events in the system
- Created an analytics module to record data about events in the system
- Created analytics pipelines to aggregate data and prepare it for presentation to the user
- Added a SPARQL library and endpoint for semantic queries
- Added a webhook interface to send messages to registered clients about profile creation
- Added harvesting components from statement to ease creation of profiles
- Added concurrency checking through modified headers for create and update endpoints
- Added basic statement and profile comparisons and matching to show relationships between profiles
- Updated user, group and admin features and authorization levels 

**Client**
- Created profile search pages
- Created admin management pages
- Created working group management pages
- Created home page
- Created addtional charts to visualize usage of api keys and accessing of profiles
- Created harvest statement pages
- Updated the UI based on the usability testing
- Added rule validation based on a schema and compare rules against determining properties for conflicts
