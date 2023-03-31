import axios from 'axios';
import config from '../config/configuration.js';

export default class AuthenticationService {

    login(username, password, logbook) {
        let uri = `${config.serverPath}/api/authenticate`;

        return axios.post(uri, { username: username, password: password, logbook: logbook })
            .then((response) => {
                let data = response.data;
                if(data.user && data.options) {
                    localStorage.setItem(config.localStorageUser, JSON.stringify(data.user));
                    localStorage.setItem(config.localStorageOptions, JSON.stringify(data.options));
                }
                return data;
            }).catch ((error) => {
                return Promise.reject(error);
            })
    }

    logout() {
        localStorage.removeItem(config.localStorageUser);
        localStorage.removeItem(config.localStorageOptions);
    }

}

