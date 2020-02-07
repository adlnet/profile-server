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
const pattern = new mongoose.Schema({
    uuid: String,
    id: String,
    primary: Boolean,
    deprecated: Boolean,
    prefLabel: {
        type: Object,
    },
    definition: {
        type: Object,
    },
    oneOrMore: {
        type: [String],
    },
    zeroOrMore: {
        type: [String],
    },
    sequence: {
        type: [String],
    },
});

module.exports = pattern;
