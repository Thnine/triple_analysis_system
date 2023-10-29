import Vue from "vue";
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state:{
        all_nodes : [],             //所有数据
    },
    mutations:{
        set_all_nodes(state,all_nodes){
            state.all_nodes = all_nodes
        },
    },
})

export default store