<template>
  <div class="main-container">
    <!-- Banner Start -->
    <div class="top-container">
      <div class="home-title">
        <h1>Jason AI 面 试 官</h1><br>
        <h2>智能在手 人才我有</h2>
        <p>MAKE A DIFFERENCE</p>
        <el-button v-if="isLoggedin" class="start" color="hsla(0,0%,100%,.8)" round size="large" @click="start"><span>开始面试</span></el-button>
        <el-button v-else class="start" color="hsla(0,0%,100%,.8)" round size="large" disabled><span>开始面试</span></el-button>
      </div>
      <div class="arrow-down"></div>
    </div>
    <!-- Banner End -->

    <div class="bottom-container"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoggedin: localStorage.getItem("log-status") ? JSON.parse(localStorage.getItem("log-status")) : false,
    }
  },
  mounted() {
    this.isLoggedin = localStorage.getItem("log-status")
  },
  methods: {
    start() {
      this.$router.push('/detect')
    }
  },
}
</script>

<style lang="scss">
.main-container{
  margin: 0;
}

.top-container{
  background: url("../assets/imgs/background4.jpg");
  height: 130vh;
  background-size: cover;
  display: flex;
  justify-content: center;
  /*align-items: center;*/
  text-align: center;

  .home-title{
    margin-top: 180px;
  }

  h1{
    color: white;
    font-size: 30px;
    font-family: "Gill Sans MT";
    letter-spacing: 2px;
    word-spacing: 4px;
  }

  h2{
    color: white;
    font-size: 45px;
    font-family: "Gill Sans MT";
    letter-spacing: 7px;
    word-spacing: 12px;
  }

  p{
    color: white;
    font-size: 25px;
    font-family: "Gill Sans MT";
    letter-spacing: 2px;
    word-spacing: 5px;
    line-height: 50px;
  }

  .start{
    margin-top: 70px;
    font-size: medium;
    color: #6098FF;
    letter-spacing: 2px;
    font-family: Haettenschweiler;
    font-weight: bold;
    height: 80px;
    width: auto;
    span{
      margin: 0px 20px;
      font-size: 24px;
    }
  }

  .start:hover{
    color: #6098FF;
    background-color: white;
    box-shadow: 1px 1px 20px 0px dodgerblue;
  }
}
.top-container .arrow-down{
  background: url("../assets/imgs/arrowdown.png") center no-repeat;
  width: 80px;
  height: 80px;
  position: absolute;
  left: 47.5%;
  bottom: -100px;
  -webkit-background-size: 100% 100%;
  background-size: 100% 100%;
  /* 必须加上-webkit-animation，否则Microsoft Edge浏览器中动画无效 */
  -webkit-animation: indexIconAnimation 4s linear 0s infinite normal;
  -webkit-animation-play-state: running;
  animation: indexIconAnimation 4s linear 0s infinite normal;
  animation-play-state: running;
}
/* 针对所有浏览器实现动画效果 */
@keyframes indexIconAnimation {
  0%, 30%, 60%, 100% {
    transform: translateY(0);
  }
  10%, 40%, 70% {
    transform: translateY(8px);
  }
  20%, 50%, 80% {
    transform: translateY(13px);
  }
  90% {
    transform: translateY(18px);
  }
}
/* 只针对Safari 和 Chrome浏览器 */
@-webkit-keyframes indexIconAnimation {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}
</style>