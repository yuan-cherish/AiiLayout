import { ref } from 'vue'
let flag = ref(true)
const mySwitch = () => {
    const pre_box = document.querySelector('.pre-box')
    const img = document.querySelector("#avatar")
    if (flag.value) {
        pre_box.style.transform = "translateX(100%)"
        pre_box.style.backgroundColor = "#6098FF"
        img.src = require("@/assets/imgs/register.png")
    }
    else {
        pre_box.style.transform = "translateX(0%)"
        pre_box.style.backgroundColor = "#6098FF"
        img.src = require("@/assets/imgs/login.png")
    }
    flag.value = !flag.value
}
export default mySwitch