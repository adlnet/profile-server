/** ***********************************************************************
*
* Veracity Technology Consultants CONFIDENTIAL
* __________________
*
*  2019 Veracity Technology Consultants
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Veracity Technology Consultants and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Veracity Technology Consultants
* and its suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Veracity Technology Consultants.
*/
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');

require('dotenv').config();

const mongoose = require('mongoose');
mongoose.connect(process.env.connectionString, { useNewUrlParser: true });

// var routes = require('./server/routes/index');
// var users = require('./server/routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'server', 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client', 'build')));
app.use(express.static(path.join(__dirname, 'client', 'public')));
app.use(compression());


app.get('/api/test', (req, res, next) => {
    res.json({ ants: ['bob', 'harry'] });
});

// this is just me adding crap...
app.get('/api/profile/:p_id/template/:t_id', (req, res, next) => {
    res.json({
        templateRes: `template id from the api: ${req.params.t_id}`,
    });
});

app.get('/api/profile/:id', (req, res, next) => {
    res.json({
        id: req.params.id,
        uri: 'https://w3id.org/xapi/scorm',
        name: 'SCORM Profile',
        description: 'The SCORM profile includes Verbs, Activity Types and xAPI Document definitions used to represent SCORM learning experiences in xAPI.',
        translations: ['Spanish'],
        moreInformation: 'https://adl.gitbooks.io/scorm-profile-xapi/content/',
        tags: ['tag1', 'tag2', 'tag3'],
        status: 'DRAFT',
        version: '1.0',
        updated: '10/24/2017',
        author: 'Advanced Distributed Learning',
        templates: [
            {
                id: '3e830324-c72a-4692-8599-c8567c52be98',
                url: `/api/profile/${req.params.id}/template/3e830324-c72a-4692-8599-c8567c52be98`,
                name: 'Statement Template A',
                description: 'This is a description for Template A that explains the use case for this template that wraps instead of truncates.',
                parentProfileName: 'Other Profile Name',
                updated: '05/23/2018',
                author: 'Template A. Author',
                translations: ['Spanish', 'German'],
                tags: ['tag4', 'tag5'],
                concepts: [
                    {
                        id: '3e830324-c72a-4692-8599-c8567c52be44',
                        url: `/api/profile/${req.params.id}/concept/3e830324-c72a-4692-8599-c8567c52be44`,
                        iri: 'https://w3id.org/xapi/concepta',
                        name: 'Concept A',
                        description: 'The concept example used as an example.',
                        type: 'Activity',
                        moreInformation: 'https://adl.gitbooks.io/scorm-profile-xapi/concept A/',
                        translations: ['Spanish'],
                        activityType: 'Multiple Choice',
                        parentProfileName: 'Other Profile Name',
                        updated: '02/12/2019',
                        author: 'Concept A. Author',
                    },
                ],
                rules: [
                    {
                        location: '$.timestamp',
                        presense: 'included',
                        value: '',
                    },
                    {
                        location: '$.verb',
                        presense: 'included',
                        value: 'IRI',
                    },
                ],
                test: '{"test": "this is a test"}',
                statementExample: '{"id": "https://w3id.org/xapi/scorm#generalrestrictions","type": "StatementTemplate","prefLabel": {"en": "general restrictions on statements"},"definition": {"en": "This is the general template that defines restrictions for all statements conforming to the SCORM profile."},"rules": [{"location": "context.contextActivities.grouping[*].definition.type","any": ["http://adlnet.gov/expapi/activities/attempt"]},{"location": "context.contextActivities.grouping[*].definition.type","any": ["http://adlnet.gov/expapi/activities/course"]},{"location": "timestamp","presence": "included"}]}',
            },
            {
                id: '3e830324-c72a-4692-8599-c8567c52be00',
                url: `/api/profile/${req.params.id}/template/3e830324-c72a-4692-8599-c8567c52be00`,
                name: 'Statement Template B',
                description: 'This is a description for Template B',
                parentProfileName: 'Another Profile Name',
                updated: '09/30/2019',
                author: 'Template B. Author',
                translations: ['French'],
                tags: ['tag6', 'tag7', 'tag8'],
                concepts: [],
                rules: [
                    {
                        location: '$.actor.objectType.agent',
                        presense: 'included',
                        value: 'Any:value1,value2,value3,value4,value5',
                    },
                ],
                statementExample: '{"id": "https://w3id.org/xapi/scorm#generalrestrictions","type": "StatementTemplate","prefLabel": {"en": "general restrictions on statements"},"definition": {"en": "This is the general template that defines restrictions for all statements conforming to the SCORM profile."},"rules": [{"location": "context.contextActivities.grouping[*].definition.type","any": ["http://adlnet.gov/expapi/activities/attempt"]},{"location": "context.contextActivities.grouping[*].definition.type","any": ["http://adlnet.gov/expapi/activities/course"]},{"location": "timestamp","presence": "included"}]}',
            },
        ],
        patterns: [
            {
                id: '3e830324-c72a-4692-8599-c8567c52be33',
                url: `/api/profile/${req.params.id}/pattern/3e830324-c72a-4692-8599-c8567c52be33`,
                iri: 'https://w3id.org/xapi/patterna',
                name: 'Pattern A',
                description: 'This is a description of pattern A that describes the pattern and wraps the text and does not truncate it.',
                type: 'Sequence',
                primaryOrSecondary: 'Primary',
                parentProfileName: 'Another Profile Name',
                moreInformation: 'https://adl.gitbooks.io/scorm-profile-xapi/patterna/',
                author: 'Pattern A. Author',
                updated: '04/30/2019',
                translations: ['Spanish', 'German'],
                tags: ['tag9', 'tag10', 'tag11'],
                components: [
                    {
                        name: 'Statement Template Name',
                        type: 'Statement Template',
                        parentProfileName: 'Other Profile Name',
                    },
                    {
                        name: 'Pattern Name 1',
                        type: 'Pattern',
                        parentProfileName: 'Other Profile Name',
                    },
                    {
                        name: 'Pattern Name 2',
                        type: 'Pattern',
                        parentProfileName: 'Other Profile Name',
                    },
                ],
            },
            {
                id: '2ff175eb-9a9e-4fbb-b4bb-a6e3192bcae9',
                url: `/api/profile/${req.params.id}/pattern/2ff175eb-9a9e-4fbb-b4bb-a6e3192bcae9`,
                iri: 'https://w3id.org/xapi/patternb',
                name: 'Pattern B',
                description: 'This is a description of pattern B that describes the pattern and wraps the text and does not truncate it.',
                type: 'Alternate',
                primaryOrSecondary: 'Primary',
                parentProfileName: 'Another Profile Name',
                moreInformation: 'https://adl.gitbooks.io/scorm-profile-xapi/patternb/',
                author: 'Pattern B. Author',
                updated: '04/30/2019',
                translations: ['French', 'German'],
                tags: ['tag12', 'tag13', 'tag14'],
                components: [
                    {
                        name: 'Statement Template Name',
                        type: 'Statement Template',
                        parentProfileName: 'Other Profile Name',
                    },
                    {
                        name: 'Pattern Name 1',
                        type: 'Pattern',
                        parentProfileName: 'Other Profile Name',
                    },
                    {
                        name: 'Pattern Name 2',
                        type: 'Pattern',
                        parentProfileName: 'Other Profile Name',
                    },
                ],
            },
            {
                id: '20e747604-5c42-4411-8f0b-fc629fd0733d',
                url: `/api/profile/${req.params.id}/pattern/20e747604-5c42-4411-8f0b-fc629fd0733d`,
                iri: 'https://w3id.org/xapi/patternc',
                name: 'Pattern C',
                description: 'This is a description of pattern C that describes the pattern and wraps the text and does not truncate it.',
                type: 'Optional',
                primaryOrSecondary: 'Primary',
                parentProfileName: 'Another Profile Name',
                moreInformation: 'https://adl.gitbooks.io/scorm-profile-xapi/patternc/',
                author: 'Pattern C. Author',
                updated: '04/30/2019',
                translations: ['Spanish', 'German'],
                tags: ['tag15', 'tag16', 'tag17'],
                components: [
                    {
                        name: 'Statement Template Name',
                        type: 'Statement Template',
                        parentProfileName: 'Other Profile Name',
                    },
                ],
            },
        ],
        concepts: [
            {
                id: '3e830324-c72a-4692-8599-c8567c52be44',
                url: `/api/profile/${req.params.id}/concept/3e830324-c72a-4692-8599-c8567c52be44`,
                iri: 'https://w3id.org/xapi/concepta',
                name: 'Concept A',
                description: 'The concept example used as an example.',
                moreInformation: 'https://adl.gitbooks.io/scorm-profile-xapi/concepta/',
                translations: ['Spanish'],
                activityType: 'Multiple Choice',
                parentProfileName: 'Other Profile Name',
                updated: '02/12/2019',
                author: 'Concept A. Author',
                type: 'Activity',
            },
            {
                id: '6d88431a-1222-430f-9cc5-c30f22bdf7f0',
                url: `/api/profile/${req.params.id}/concept/6d88431a-1222-430f-9cc5-c30f22bdf7f0`,
                iri: 'https://w3id.org/xapi/conceptb',
                name: 'Concept B',
                description: 'The concept example used as an example.',
                type: 'Verb',
                moreInformation: 'https://adl.gitbooks.io/scorm-profile-xapi/conceptb/',
                translations: ['Spanish'],
                parentProfileName: 'Other Profile Name',
                updated: '02/12/2019',
                author: 'Concept B. Author',
                similarTerms: [
                    'Concept Name 1',
                    'Concept Name 2',
                ],
            },
            {
                id: '8d3cbeb7-37dd-41ac-8a59-4fa55bf4669b',
                url: `/api/profile/${req.params.id}/concept/8d3cbeb7-37dd-41ac-8a59-4fa55bf4669b`,
                iri: 'https://w3id.org/xapi/conceptc',
                name: 'Concept C',
                description: 'The concept example used as an example.',
                type: 'Document',
                moreInformation: 'https://adl.gitbooks.io/scorm-profile-xapi/conceptc/',
                translations: ['Spanish'],
                parentProfileName: 'Other Profile Name',
                updated: '02/12/2019',
                author: 'Concept C. Author',
                documentResourceType: 'state',
                mediaType: 'application',
                contextIri: 'None provided',
                schemaIri: 'http://iri/schema',
            },
            {
                id: 'a5ab1a8e-290a-4a15-974c-7a7f171fdb09',
                url: `/api/profile/${req.params.id}/concept/a5ab1a8e-290a-4a15-974c-7a7f171fdb09`,
                iri: 'https://w3id.org/xapi/conceptd',
                name: 'Concept D',
                description: 'The concept example used as an example.',
                type: 'Extension',
                moreInformation: 'https://adl.gitbooks.io/scorm-profile-xapi/conceptd/',
                translations: ['Spanish'],
                parentProfileName: 'Other Profile Name',
                updated: '02/12/2019',
                author: 'Concept A. Author',
                extentionType: 'Activity',
                recommendedTerms: [
                    'Concept Name 3',
                    'Concept Name 4',
                ],
                contextIri: 'None provided',
                schemaIri: 'http://iri/schema',
            },
        ],
    });
});

app.use('/api', require('./server/routes/index.js'));
app.get('*', (req, res, next) => {
    // res.render('index', { title: 'Express' });
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});
// app.use('/users', users);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
    });
});

app.listen(process.argv[2] || process.env.PORT || 3005);
console.log('server started');
// module.exports = app;
