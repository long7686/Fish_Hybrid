//Contain only network event for NetworkParser and Network Socket
const gfNetworkEvent = {
    EVENT_NETWORK_RECONNECTED : 'network-reconnected',
    EVENT_NETWORK_CONNECTED : 'network-connected',
    EVENT_NETWORK_POOR : 'network-poor',
    EVENT_NETWORK_DIE : 'network-die',
    EVENT_AUTHEN_FAIL : 'authen-fail',
    EVENT_LOGIN_IN_OTHER_DEVICE : 'login-in-other-device',
    EVENT_NO_ACTION_LONG_TIME: 'no-action-long-time',


    EVENT_NEW_MESSAGE : 'new-message',
    EVENT_NETWORK_PINGPONG : 'ping-pong',
    LIST_EVENT_QUEUE: [2014],
};

module.exports = gfNetworkEvent;
