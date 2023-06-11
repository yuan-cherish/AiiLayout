import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// element官方文档有教程
import ElementPlus from "element-plus"    // 导入element-ui的插件
import "element-plus/dist/index.css"    // 一定要引入element的css样式，否则组件样式就会丢失
import * as ElementPlusIconsVue from "@element-plus/icons-vue"      // 导入element-ui库中的所有图标并进行全局注册

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(store).use(router).use(ElementPlus).mount('#app')
