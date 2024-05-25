import { atom } from "recoil";

export const userState = atom({
    key: 'user',
    default: {
        password: '',
        email: '',
        phone: '',
        gender: '',
    }
});

export const eventIdState = atom({
    key: 'eventIdState',
    default: 0
});

export const interestLevel = atom({
    key: 'interestLevel',
    default: {
        environment: 0,
        health: 0,
        mentalHealth: 0,
        animalWelfare: 0,
        education: 0,
        socialServices: 0,
    }
});