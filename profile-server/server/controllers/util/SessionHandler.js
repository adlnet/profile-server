/** ***************************************************************
* Copyright 2022 Advanced Distributed Learning (ADL)
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
/**
 * Pure JS class for linking Passport users with the Express Session ID.  
 * 
 * Currently, this has to be tracked manually with calls in existing middleware,
 * but I'd like to port this to a library at some point given how barebones Passport
 * is about actually doing this. 
 */
const Redis = require("ioredis").default;
const redisHelper = require("../../utils/redis");

const PROFILE_SESSION_KEY = "PROFILE_SESSION_KEY";
const PROFILE_SESSION_SAVE_FREQUENCY_MS = (process.env.PROFILE_SESSION_SAVE_FREQUENCY_MS || 2000);

class SessionHandler {
    
    /** @type {Redis} */
    redisClient = null;
    sessionMap = {};
    
    constructor() {
        this.redisClient = redisHelper.createClient();
        this.sessionMap = {};
    }

    async init() {
        let existsResponse = await this.redisClient.exists(PROFILE_SESSION_KEY);
        if (existsResponse === 1) {
            let previousSessionStr = await this.redisClient.get(PROFILE_SESSION_KEY);
            this.sessionMap = JSON.parse(previousSessionStr);
        }

        else {
            this.sessionMap = {};
        }

        setInterval(async() => await this.saveSession(), PROFILE_SESSION_SAVE_FREQUENCY_MS);
    }

    async saveSession() {
        let sessionStr = JSON.stringify(this.sessionMap);
        await this.redisClient.set(PROFILE_SESSION_KEY, sessionStr);
    }

    /**
     * Check if the given User's UUID corresponds to the given Session ID.
     * @param {string} userID 
     * @param {string} sessionID 
     * @returns {boolean}
     */
    userHasKnownSession(userID, sessionID) {
        if (this.sessionMap[userID] == undefined)
            return false;

        return this.sessionMap[userID].includes(sessionID);
    }

    /**
     * Adds the User ID and Session pair to the tracking. 
     * @param {string} userID 
     * @param {string} sessionID 
     */
    addToSessionMap(userID, sessionID) {
        if (this.sessionMap[userID] == undefined)
            this.sessionMap[userID] = [];

        this.sessionMap[userID].push(sessionID);
    }

    /**
     * Removes the given user session from tracking.
     * @param {string} userID 
     * @param {string} sessionID 
     */
    clearSingleSession(userID, sessionID) {
        if (this.sessionMap[userID] == undefined)
            this.sessionMap[userID] = [];

        this.sessionMap[userID] = this.sessionMap[userID].filter(knownSessionID => knownSessionID != sessionID);
    }

    /**
     * Clears all tracked sessions for the given user.
     * @param {string} userID 
     */
    clearUserSessionMap(userID) {
        this.sessionMap[userID] = [];
    }

    /**
     * Kills the current session, including the actual destruction of the Express Session object
     * and removal from our User / Session tracking.
     * 
     * Used mostly during logout or forcing an untracked user to logout.
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @param {Function} callback 
     */
    killThisSession(req, res, callback) {
        let user = req.user;
        if (user == undefined)
            return callback();

        let userID = req.user.uuid;
        let sessionID = req.sessionID;

        this.clearSingleSession(userID, sessionID);

        req.session.destroy(err => callback());
    }

    /**
     * 
     * Kills all other sessions for the current user, including the actual destruction of the Express Session object
     * and removal from our User / Session tracking.
     * 
     * Used mostly during password changes or other events that should invalidate a foreign session.
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @param {Function} callback 
     * @returns 
     */
    killOtherUserSessions(req, res, callback) {

        let user = req.user;
        if (user == undefined)
            return callback();

        let activeSessions = this.sessionMap[user.uuid];
        if (activeSessions != undefined) {
            for (let sessionID of activeSessions) {
                if (req.sessionID == sessionID)
                    continue;
                
                delete req.sessionStore.destroy(sessionID, err => {});
            }
        }

        callback();
    }
}

/** @type {SessionHandler} */
const sessionHandler = new SessionHandler();

module.exports = {
    getSessionHandler: () => sessionHandler,
    initSessionHandler: async() => {
        await sessionHandler.init();
    },
    SessionHandler
};
