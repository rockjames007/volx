import { atom } from "recoil";
import { personalisedEvents } from '../data/personalised';
import { requestEvents,attendedEvents } from '../data/request';
export const userState = atom({
    key: 'user',
    default: {
        password: '',
        email: '',
        phone: '',
        gender: '',
        isOrg: false,
        isLoggedIn: false
    }
});

export const eventIdState = atom({
    key: 'eventIdState',
    default: ""
});

export const interestLevel = atom({
    key: 'interestLevel',
    default: personalisedEvents
});

export const personalisedState = atom({
    key: 'personalised',
    default: personalisedEvents
});

export const requestedState = atom({
    key: 'requested',
    default: requestEvents
});

export const attendedState = atom({
    key: 'requested',
    default: attendedEvents
});