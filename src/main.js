import Vue from 'vue'
import App from './App.vue'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
// Import Material Design Icons if not already included in your index.html
import '@mdi/font/css/materialdesignicons.css'

Vue.use(Buefy, {
  defaultIconPack: 'mdi'
})

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
