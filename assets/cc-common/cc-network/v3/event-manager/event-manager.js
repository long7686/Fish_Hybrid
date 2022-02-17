const EventEmitter = require('events').EventEmitter;
const Duplicate = require('deduplicate');
const HashMap = require('hashmap');
const logger = require('logger');

const NEW_EVENT_MAPPING = {
    'jgr' : 'client-join-game-result',
    'sud' : 'state-updated',
    'spu' : 'state-pushed',
    'erp' : 'error-pushed',
    'mep' : 'message-pushed'
};
class EventManager {
    constructor () {
        this._emitter = new EventEmitter();
        this._duplicateEventId = new Duplicate(1000);

        this._waitForEventTimeOutId = new HashMap();
    }

    registerEvent(eventName, listener) {
        this._emitter.on(eventName, listener);
    }

    unregisterEvent(eventName, listener) {
        this._emitter.removeListener(eventName, listener);
    }

    registerOnce(eventName, listener) {
        this._emitter.once(eventName, listener);
    }

    removeAllEventListeners () {
        this._emitter.removeAllListeners();
    }

    waitForEvent(timeoutMs, verifyFn, timeoutCallback) {
        let timeoutId = setTimeout( () => {
            logger.debug('EventManager - waitForEvent was timeout. %s');
            timeoutCallback();
        }, timeoutMs);
        this._waitForEventTimeOutId.set(timeoutId, verifyFn);
        return timeoutId;
    }

    removeWaitingQueue() {
        this._waitForEventTimeOutId.keys().forEach( (timeoutId) => {
            clearTimeout(timeoutId);
        });
        this._waitForEventTimeOutId.clear();
    }

    removeWaiting(timeoutId) {
        clearTimeout(timeoutId);
        this._waitForEventTimeOutId.delete(timeoutId);
    }

    cleanUp() {
        logger.debug('EventManager - cleanUp.');
        this._emitter.removeAllListeners(); //concerns remove or not?
        this._duplicateEventId.clearAll();

        // clear up remaining waitForEventTimeout
        this.removeWaitingQueue();
    }

    onConnected() {
        logger.debug('EventManager - connected.');
        this._emitter.emit(EventManager.CONNECTED);
    }

    onPong(data) {
        this._emitter.emit(EventManager.PONG, data);
    }

    onCannotConnect() {
        logger.debug('EventManager - cannotConnect.');
        this._emitter.emit(EventManager.CAN_NOT_CONNECT);
    }

    onEvent(eventData) {
        // logger.debug("EventManager - newEvent: %j", eventData);

        if(eventData && eventData.event) {
            eventData.event = NEW_EVENT_MAPPING[eventData.event] ? NEW_EVENT_MAPPING[eventData.event] : eventData.event;
        }

        let {event, data, eventId} = eventData;

        if (!data) {
            logger.error('EventManager - newEvent: data is null.');
            return; // ignore this event
        }
        
        if (this._duplicateEventId.exists(eventId)) {
            logger.error('EventManager - newEvent: duplicate eventId %s', eventId);
            return; // ignore duplicate eventId
        }
        this._duplicateEventId.insert(eventId);

        this._waitForEventTimeOutId.keys().forEach( (timeoutId) => {
            let verifyFn = this._waitForEventTimeOutId.get(timeoutId);
            if (verifyFn(eventData)) {
                clearTimeout(timeoutId);
                this._waitForEventTimeOutId.delete(timeoutId);
            }
        });

        //Add for testing. TODO remove.
        if (event == 'error-pushed') {
            logger.warn('error-pushed %j', eventData);
        }

        this._emitter.emit(event, eventData);
    }

}

EventManager.CONNECTED = 'connected';
EventManager.PONG = 'pong';
EventManager.CAN_NOT_CONNECT = 'can-not-connect';
EventManager.EXPECTED_EVENT_TIMEOUT = 'expected-event-timeout';
EventManager.MISMATCH_COMMAND_ID = 'mismatch-command';
EventManager.MISMATCH_DATA_VERSION = 'mismatch-version';

module.exports = EventManager;