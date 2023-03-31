import AuthenticationService from '@/service/AuthenticationService';
import config from "@/config/configuration.js";

const authenticationService = new AuthenticationService();

const user = JSON.parse(localStorage.getItem(config.localStorageUser));
const options = JSON.parse(localStorage.getItem(config.localStorageOptions));
const initialState = { user: user, options: options };

export const authentication = {
    namespaced: true,
    state: initialState,
    actions: {
        login({ commit }, { username, password, logbook }) {
            return authenticationService.login(username, password, logbook)
                .then(
                    result => {
                        // console.log('Login success');
                        commit('loginSuccess', result);
                        Promise.resolve(result);
                    })
                .catch(
                    error => {
                        // console.log('Login error');
                        commit('loginFailure', error);
                        return Promise.reject(error);
                    }
                );
        },

        logout({ commit }) {
            authenticationService.logout();
            commit('logout');
            Promise.resolve();
        }
    },
    mutations: {
        loginSuccess(state, result) {
            state.user = result.user;
            state.options = result.options;
        },
        loginFailure(state) {
            state.user = null;
            state.options = null;
        },
        logout(state) {
            state.user = null;
            state.options = null;
        }
    }
}
