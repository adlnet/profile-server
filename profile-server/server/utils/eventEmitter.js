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

class Event {
    constructor(name) {
        this.name = name;
        this.canceled = false;
    }
    cancel() {
        this.canceled = true;
    }
    isCanceled() {
        return this.canceled;
    }
}

module.exports = class EventEmitter {
    constructor(name) {
        this.name = name;
        this.events = {};
    }
    on(eventName, handler) {
        if (typeof handler !== 'function') {
            throw (new Error('Handler should be a function'));
        }
        this.off(eventName, handler);
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(handler);
    }
    off(eventName, handler) {
        if (this.events[eventName]) {
            let idx = -1;
            for (const i in this.events[eventName]) {
                if (this.events[eventName][i] === handler) { idx = i; }
            }
            if (idx !== -1) {
                this.events[eventName].splice(idx, 1);
            }
        }
    }
    async emit(eventName, ...args) {
        if (this.handles(eventName)) { } else { return undefined; }
        let result;
        const event = new Event(eventName);
        if (this.events[eventName]) {
            for (const i in this.events[eventName]) {
                const thisResult = await this.events[eventName][i](event, ...args);
                if (thisResult !== undefined) { result = thisResult; }
                if (event.isCanceled()) { break; }
            }
        }
        return result;
    }
    async gather(eventName, ...args) {
        if (this.handles(eventName)) { } else { return undefined; }
        const result = [];
        const event = new Event(eventName);
        if (this.events[eventName]) {
            for (const i in this.events[eventName]) {
                const thisResult = await this.events[eventName][i](event, ...args);
                if (thisResult !== undefined) {
                    if (Array.isArray(thisResult)) {
                        result.push(...thisResult);
                    } else {
                        result.push(thisResult);
                    }
                }
                if (event.isCanceled()) { break; }
            }
        }
        return result;
    }
    async emitCB(eventName, cb, ...args) {
        await this.emit(eventName, args);
        if (cb) { cb(); }
    }
    handles(eventName) {
        return (this.events[eventName] && this.events[eventName].length);
    }
};
