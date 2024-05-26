import { atom } from "recoil";
import { personalisedEvents } from '../data/personalised';
import { requestEvents } from '../data/request';
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
    default: 0
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