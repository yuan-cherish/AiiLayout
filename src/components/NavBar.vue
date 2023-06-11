<template>
  <div class="navbar">
    <a href="/main"><img src="../assets/imgs/logo1.png" alt="logo"/></a>
    <ul>
      <li>
        <el-button class="button" text @click="jumpHome">首页</el-button>
      </li>
      <li>
        <el-button v-if="isLoggedin" class="button" text @click="jumpDetect">AI面试</el-button>
        <el-button v-else class="button" text disabled>AI面试</el-button>
      </li>
      <li>
        <el-button v-if="isLoggedin" class="button" text @click="jumpResult">评分结果</el-button>
        <el-button v-else class="button" text disabled>评分结果</el-button>
      </li>
      <li>
        <div v-if="!isLoggedin">
          <el-button class="login-register" color="#6098FF" round @click="login">
            登录/注册
          </el-button>
        </div>
        <div v-else class="user-logout">
          <div id="user">{{ username }} | 您好</div>
          <el-button class="logout" @click="logout">
            退出登录
          </el-button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      isLoggedin: localStorage.getItem("log-status") ? JSON.parse(localStorage.getItem("log-status")) : false,
      username: localStorage.getItem("userPhone") ? JSON.parse(localStorage.getItem("userPhone")) : {}
    }
  },
  mounted() {
    this.isLoggedin = localStorage.getItem("log-status")
    this.username = localStorage.getItem("userPhone")
  },
  methods: {
    login() {
      // 执行登录逻辑，跳转至登录界面
      this.$router.push('/login');
      // localStorage.setItem("log-status", this.isLoggedin);
    },
    logout() {
      // 执行退出登录逻辑，例如发送退出登录请求等等
      this.$router.push('/home');
      localStorage.removeItem("userPhone")
      localStorage.removeItem("log-status")
      localStorage.removeItem("totalScore")
      this.$message.success("退出成功")
      this.isLoggedin = false;              // 退出登录成功后将 isLoggedin 设置为 false
    },
    jumpHome() {
      this.$router.push('/home')
    },
    jumpDetect() {
      this.$router.push('/detect')
    },
    jumpResult() {
      this.$router.push('/result')
    }
  },
  // mounted() {
  //   this.isLoggedin = JSON.parse(localStorage.getItem("log-status"))  // 这里需要将json转换为parse
  //   const user = JSON.parse(window.sessionStorage.getItem('user'));
  //   if (user) {
  //     this.isLoggedin = true;  // 标记用户已登录
  //     this.username = user.username;  // 显示当前用户名
  //   }
  // }
}
</script>

<style lang="scss">
.navbar{
  display: flex;
  position: fixed;
  background-color: rgba(0,0,0,0.2);
  width: 100%;
  height: 100px;
  justify-content: space-between;
  align-items: center;
  box-shadow: 10px 0px 30px -10px skyblue;
  z-index: 9999;     // 使导航栏总是在图层最顶层

  img{
    height: 80px;
    margin-left: 60px;
    //filter: brightness(310%);
  }

  ul{
    display: flex;
    list-style-type: none;

    li{
      margin-right: 10px;
      margin-left: 10px;

      .button{
        font-weight: bold;
        font-size: large;
        color: white;
        margin: 0 10px;
        padding: 0 40px;
      }

      .button:hover{
        color: #6098FF;
      }

      .login-register{
        padding: 6px 30px;
        margin-right: 50px;
        color: white;
      }

      .user-logout{
        margin-right: 20px;
        display: flex;
        flex-direction: row;
        #user{
          padding: 5px;
          color: white;
        }
        .logout{
          border: none;
          background-color: #6098FF;
          color: white;
        }
      }
    }
  }
}
</style>