<template>
  <!-- 最外层的大盒子 -->
  <div class="bigBox">
    <div class="box" ref="box">
      <!-- 滑动盒子 -->
      <div class="pre-box">
        <h1>USE IT</h1>
        <p>MAKE YOUR INTERVIEW<br>MORE EFFICIENT</p>
        <div class="img-box">
          <img id="avatar" src="../assets/imgs/login.png" alt=""/>
        </div>
      </div>
      <!-- 注册盒子 -->
      <div class="register-form">
        <!-- 标题盒子 -->
        <div class="title-box">
          <h1>注册</h1>
        </div>
        <!-- 输入框盒子 -->
        <el-form class="input-box"
                 ref="registerFormRef"
                 :model="registerForm"
                 :rules="rules"
                 label-with="5px">
          <el-form-item prop="userPhone" label=" ">
            <el-input class="input"
                      type="text"
                      placeholder="用户名"
                      prefix-icon="el-icon-user"
                      v-model="registerForm.userPhone"/>
          </el-form-item>
          <el-form-item prop="password" label=" ">
            <el-input class="input"
                      type="password"
                      placeholder="密码"
                      prefix-icon="el-icon-lock"
                      show-password
                      v-model="registerForm.password"/>
          </el-form-item>
          <el-form-item prop="confirmPassword" label=" ">
            <el-input class="input"
                      type="password"
                      placeholder="确认密码"
                      prefix-icon="el-icon-lock"
                      show-password
                      v-model="registerForm.confirmPassword"/>
          </el-form-item>
        </el-form>
        <!-- 按钮盒子 -->
        <div class="btn-box">
          <button @click="register">注册</button>
          <!-- 绑定点击事件 -->
          <p @click="mySwitch">已有账号?<span>去登录</span></p>
        </div>
      </div>
      <!-- 登录盒子 -->
      <div class="login-form">
        <!-- 标题盒子 -->
        <div class="title-box">
          <h1>登录</h1>
        </div>
        <!-- 输入框盒子 -->
        <el-form class="input-box"
                 ref="loginFormRef"
                 :model="loginForm"
                 :rules="rules"
                 label-with="5px">
          <el-form-item prop="userPhone" label=" ">
            <el-input class="input"
                      type="text"
                      placeholder="用户名"
                      prefix-icon="el-icon-user"
                      v-model="loginForm.userPhone"/>
          </el-form-item>
          <el-form-item prop="password" label=" ">
            <el-input class="input"
                      type="password"
                      placeholder="密码"
                      prefix-icon="el-icon-lock"
                      show-password
                      v-model="loginForm.password"/>
          </el-form-item>
        </el-form>
        <!-- 按钮盒子 -->
        <div class="btn-box">
          <button @click="login">登录</button>
          <!-- 绑定点击事件 -->
          <p @click="mySwitch">没有账号?<span>去注册</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import api from '@/api/login.js'
import { ElMessage } from 'element-plus'
import axios from "axios";

export default {
  name: "Login",
  data() {
    return {
      loginForm: {},
      registerForm: {},
      logStatus: localStorage.getItem("log-status"),   // 这里不需要用JSON.parse()
      flag: true,    // 用于switch
      rules: {
        userPhone: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {pattern: /^1[3456789]\d{9}$/, message: '手机号格式不正确', trigger: 'blur'},
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, message: '长度应该大于6', trigger: 'blur'},
        ],
        confirmPassword: [
          {required: true, message: '请输入确认密码', trigger: 'blur'},
          {min: 6, message: '长度应该大于6', trigger: 'blur'},
        ],
      }
    }
  },
  methods: {
    login() {
      this.$refs.loginFormRef.validate((valid) => {
        if (valid) {  // 表单校验合法
          axios.post("http://127.0.0.1:8081/user/login", this.loginForm)
              .then(res => {
                console.log(res.data)
                console.log(res.status)
                console.log(res.config)
                if (res.data) {  // controller中返回值为true
                  // 登陆成功后的处理逻辑
                  ElMessage.success('登录成功')
                  localStorage.setItem("userPhone", this.loginForm.userPhone)  // 将用户名存在浏览器中
                  this.logStatus = true;
                  localStorage.setItem("log-status", this.logStatus)
                  this.$router.push('/home')
                } else {    // controller中返回值为false
                  this.$message.error('用户名或密码错误')
                }
              })
        } else {
          return false;
        }
      })
    },
    register() {
      this.$refs.registerFormRef.validate((valid) => {
        if (valid) {  // 表单校验合法
          if(this.registerForm.password !== this.registerForm.confirmPassword) {
            this.$message.error("两次输入的密码不一致")
            return false;
          }
          axios.post("http://127.0.0.1:8081/user/register", this.registerForm)
              .then(res => {
                console.log(res.data)
                console.log(res.status)
                console.log(res.config)
                if (res.data) {  // controller中返回值为true
                  // 登陆成功后的处理逻辑
                  ElMessage.success('注册成功，前往登录')
                  this.mySwitch()
                } else {    // controller中返回值为false
                  this.$message.error('用户名或密码错误')
                }
              })
        } else {
          return false;
        }
      })
    },
    mySwitch () {
      const pre_box = document.querySelector('.pre-box')
      const img = document.querySelector('#avatar')
      if (this.flag) {
        pre_box.style.transform = "translateX(100%)"
        pre_box.style.backgroundColor = "#6098FF"
        img.src = require("@/assets/imgs/register.png")
      }
      else {
        pre_box.style.transform = "translateX(0%)"
        pre_box.style.backgroundColor = "#6098FF"
        img.src = require("@/assets/imgs/login.png")
      }
      this.flag = !this.flag
    }
  }
};
</script>

<style lang="scss">
/* 去除input的轮廓 */
.input {
  outline: none;
}

.bigBox {
  /* 溢出隐藏 */
  height: 100vh;
  overflow-x: hidden;
  display: flex;
  /* 渐变方向从左到右 */
  /*background: linear-gradient(to right, rgb(247, 209, 215), rgb(191, 227, 241));*/
  background-color: snow;
}

/* 最外层的大盒子 */
.box {
  width: 950px;
  height: 500px;
  display: flex;
  /* 相对定位 */
  position: relative;
  z-index: 2;
  margin: auto;
  /* 设置圆角 */
  border-radius: 8px;
  /* 设置边框 */
  border: 1px solid rgba(255, 255, 255, 0.6);
  /* 设置盒子阴影 */
  box-shadow: 2px 1px 19px rgba(0, 0, 0, 0.1);
  background-color: white;
}

/* 滑动的盒子 */
.pre-box {
  /* 宽度为大盒子的一半 */
  width: 50%;
  height: 100%;
  /* 绝对定位 */
  position: absolute;
  /* 距离大盒子左侧为0 */
  left: 0;
  /* 距离大盒子顶部为0 */
  top: 0;
  z-index: 99;
  border-radius: 4px;
  background-color: #6098FF;
  box-shadow: 2px 1px 19px rgba(0, 0, 0, 0.1);
  /* 动画过渡，先加速再减速 */
  transition: 0.5s ease-in-out;
}

/* 滑动盒子的标题 */
.pre-box h1 {
  margin-top: 100px;
  text-align: center;
  /* 文字间距 */
  letter-spacing: 5px;
  color: white;
  /* 禁止选中 */
  user-select: none;
  /* 文字阴影 */
  text-shadow: 4px 4px 3px rgba(0, 0, 0, 0.1);
}

/* 滑动盒子的文字 */
.pre-box p {
  height: 30px;
  line-height: 30px;
  text-align: center;
  margin: 20px 0 50px 0;
  /* 禁止选中 */
  user-select: none;
  font-weight: bold;
  color: white;
  text-shadow: 4px 4px 3px rgba(0, 0, 0, 0.1);
}

/* 图片盒子 */
.img-box {
  width: 200px;
  height: 200px;
  margin: 20px auto;
  /* 设置为圆形 */
  border-radius: 50%;
  /* 设置用户禁止选中 */
  user-select: none;
  overflow: hidden;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 4px 4px 3px rgba(0, 0, 0, 0.1);
}

/* 图片 */
.img-box img {
  width: 100%;
  transition: 0.5s;
}

/* 登录和注册盒子 */
.login-form,
.register-form {
  flex: 1;           /*父容器display: flex后，子元素可以使用flex: 1表示flex-grow: 1，用作自适应布局*/
  height: 100%;
}

/* 标题盒子 */
.title-box {
  height: 180px;
  line-height: 200px;
}

/* 标题 */
.title-box h1 {
  text-align: center;
  color: black;
  /* 禁止选中 */
  user-select: none;
  letter-spacing: 5px;
  text-shadow: 4px 4px 3px rgba(0, 0, 0, 0.1);
}

/* 输入框盒子 */
.input-box {
  display: flex;
  /* 纵向布局 */
  flex-direction: column;
  /* 水平居中 */
  align-items: center;
}

/* 输入框 */
.input {
  width: 300px;       /* 用百分比会随着输入内容改变，用确切的值就是固定的长度 */
  height: 40px;
  margin-bottom: 5px;
  text-indent: 10px;
  border: 1px solid #ffff;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 120px;
  /* 增加磨砂质感 */
  backdrop-filter: blur(10px);
}

.input:focus {
  /* 光标颜色 */
  color: #b0cfe9;
}

/* 聚焦时隐藏文字 */
.input:focus::placeholder {
  opacity: 0;
}

/* 按钮盒子 */
.btn-box {
  display: flex;
  justify-content: center;
}

/* 按钮 */
button {
  width: 100px;
  height: 30px;
  margin: 0 7px;
  line-height: 30px;
  border: none;
  border-radius: 4px;
  background-color: #6098FF;
  color: white;
}

/* 按钮悬停时 */
button:hover {
  /* 鼠标小手 */
  cursor: pointer;
  /* 透明度 */
  opacity: 0.8;
}

/* 按钮文字 */
.btn-box p {
  height: 30px;
  line-height: 30px;
  /* 禁止选中 */
  user-select: none;
  font-size: 14px;
  color: black;
}

.btn-box span:hover {
  cursor: pointer;
  border-bottom: 1px solid #6098FF;
  color: #6098FF;
}
</style>
