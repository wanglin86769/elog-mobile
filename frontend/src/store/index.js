import { createStore } from 'vuex'
import { authentication } from './authentication_store';


export const store = createStore({
    modules: {
        authentication,
    }
})
