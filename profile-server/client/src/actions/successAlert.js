/** ***************************************************************
* Copyright 2020 Advanced Distributed Learning (ADL)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**************************************************************** */
export const CLEAR = 'CLEAR';
export const ADDED = 'ADDED';
export const CREATED = 'CREATED';
export const EDITED = 'EDITED';
export const REMOVED = 'REMOVED';
export const DEPRECATED = 'DEPRECATED';
export const PUBLISHED = 'PUBLISHED';
export const VERIFICATION_REQUESTED = 'VERIFICATION_REQUESTED';


export function clear() {
    return {
        type: CLEAR
    };
}

export function added(subject) {
    return {
        type: ADDED,
        message: 'was successfully added.',
        subject: subject
    };
}

export function created(name) {
    return {
        type: CREATED,
        message: 'was successfully created.',
        subject: name
    };
}

export function edited() {
    return {
        type: EDITED,
        message: "Your changes have been saved."
    };
}

export function removed(subject) {
    return {
        type: REMOVED,
        message: "was successfully removed.",
        subject: subject
    };
}

export function deprecated(subject) {
    return {
        type: DEPRECATED,
        message: "was successfully deprecated.",
        subject: subject
    };
}

export function published(subject) {
    return {
        type: PUBLISHED,
        message: "was successfully published.",
        subject: subject
    };
}

export function verificationRequested() {
    return {
        type: VERIFICATION_REQUESTED,
        message: "The profile verification request was successfully sent."
    };
}

export function verificationResponded(verified) {
    return {
        type: VERIFICATION_REQUESTED,
        message: `This profile’s submission for verification is ${verified ? 'approved. The profile is now verified.' : 'not approved.'}`
    };
}