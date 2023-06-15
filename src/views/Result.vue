<template>
  <div class="result-page">
    <div class="result-box">
      <h2>你的得分为：{{ localScore }} 分</h2>
      <h3>你的性格为：{{yourNature.natureTittle}}</h3>
      <p>{{yourNature.natureDesc}}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Result",
  data() {
    return {
      localScore: localStorage.getItem("totalScore") ? JSON.parse(localStorage.getItem("totalScore")) : null,
      natures: [],
      total: 0,
      natureRank: 0,
    }
  },
  created() {
    // 从后端返回json数据的url地址获取题目
    fetch(this.$baseUrl + ":8081/nature10/all")
        .then(res => res.json())
        .then(res => {
          console.log(res)
          this.natures = res.data;
          this.total = res.total;
        })
  },
  computed: {
    yourNature() {
      this.calculateRank()
      return this.natures[this.natureRank-1];
    }
  },
  mounted() {
    // 获取传递过来的score参数
    this.localScore=localStorage.getItem('totalScore');
    this.saveScore(this.localScore);
  },
  methods: {
    getScore() {
      // 从数据库中获取分数
      const userPhone = localStorage.getItem("userPhone");   // 获取当前用户名
      const params = {
        "userPhone": userPhone
      }
      axios.get(this.$baseUrl + ':8081/user/getScore', {
        data: params,
        headers: {
          'Content-Type': 'application/json'
        }})
          .then(response => {
            console.log(response.data)
            this.localScore = response.data
          })
          .catch(error => {
            console.log(error);
          });
    },
    calculateRank() {
      if(this.localScore<=20) this.natureRank=1
      else if(this.localScore>=21 && this.localScore<=30) this.natureRank=2
      else if(this.localScore>=31 && this.localScore<=40) this.natureRank=3
      else if(this.localScore>=41 && this.localScore<=50) this.natureRank=4
      else if(this.localScore>=51 && this.localScore<=60) this.natureRank=5
      else if(this.localScore>=61) this.natureRank=6
    },
    saveScore(totalScore) {
      // 将总分存入数据库
      const userPhone = localStorage.getItem("userPhone");   // 获取当前用户名
      const currentDate = new Date();
      const year = currentDate.getFullYear();   // 获取当前年份
      const month = currentDate.getMonth() + 1;    // 获取当前月份（注意月份从0开始，所以需要加1）
      const day = currentDate.getDate();           // 获取当前日期
      const hours = currentDate.getHours();       // 获取当前小时
      const minutes = currentDate.getMinutes();     // 获取当前分钟
      const seconds = currentDate.getSeconds();     // 获取当前秒数
      console.log(this.natures[this.natureRank-1].natureTittle)
      const params = {
        "userPhone": userPhone,
        "score": totalScore,
        "nature": this.natures[this.natureRank-1].natureTittle,
        "answerTime": `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      }
      axios.post(this.$baseUrl + ':8081/user/saveScore', params)
          .then(response => {
            console.log(response.data)
          })
          .catch(error => {
            console.log(error)
          })
    },
  }
};
</script>

<style lang="scss">
// 页面样式
.result-page{
  height: 100vh;
  overflow-x: hidden;     /* 如果溢出元素的内容区域的话，裁剪该元素中内容的左/右边缘 */
  display: flex;
  background-color: snow;
}

.result-box{
  width: 100%;
  height: 80%;
  margin: 120px 200px;
  padding: 0px 100px;
  display: flex;
  flex-direction: column;
  /* 相对定位 */
  position: relative;
  z-index: 2;
  /* 设置圆角 */
  border-radius: 8px;
  /* 设置边框 */
  border: 1px solid rgba(255, 255, 255, 0.6);
  /* 设置盒子阴影 */
  box-shadow: 2px 1px 19px rgba(0, 0, 0, 0.1);
  background-color: white;
  align-items: start;
  justify-content: center;
  h2,h3{
    padding: 20px;
  }
  p{
    padding: 20px;
    text-align: left;
  }
}
</style>