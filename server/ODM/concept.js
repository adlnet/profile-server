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
const mongoose = require('mongoose');
const concept = new mongoose.Schema({
    uuid: String,
    id: String,
    iri: String,
    hasIri: Boolean,
    updatedOn: Date,
    createdOn: Date,
    createdBy: String,
    parentProfile: {
        uuid: String,
        name: String },
    type: {
        type: String,
        enum: ['verb', 'activityType', 'attachmentUsage', 'document', 'extension', 'activity'],
    },
    translations: [
        {
            language: String,
            translationDesc: String,
            translationName: String,
        },
    ],
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    moreInfo: {
        type: String,
    },
    activityType: {
        type: String,
    },
    documentResourceType: {
        type: String,
    },
    mediaType: {
        type: String,
    },
    contextIri: {
        type: String,
    },
    extensionType: String,
    _schema: {
        type: {
            type: String,
        },
        iri: String,
        string: String,
    },
});

module.exports = concept;
