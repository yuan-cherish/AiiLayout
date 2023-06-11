<template>
  <div class="interview-page">
    <div class="interview-box">
      <!--问题进度条-->
      <div class="progress">
        <el-progress class="question-progress"
                    :percentage="progress"
                    stroke-width="10">
        </el-progress>
        <div class="prompt">
          <span id="left">【问答题】第{{currQuesNum+1}}题 / 共{{total}}题，每题准备时间10s，答题时间20s</span>
          <span id="right"> {{prep}}</span>
          <!--el-button对ref属性无效，必须用button标签-->
          <button id="start-button" ref="start" v-if="!start_used" @click="startRecord">开始答题</button>
        </div>
      </div>
      <!--问答盒子-->
      <div class="answer-box">
        <!-- 问题框 -->
        <div class="question">
          <div id="tittleQues">
            <el-icon id="q-a"><ChatLineSquare /></el-icon>
            <span id="q">{{currentQuestion.tittleQuestion}}</span>
          </div>
          <el-radio-group class="options" v-model="optionIndex">
            <el-radio class="option" v-for="(option, index) in options" :key="index" :label="index" size="large" :disabled="isDisabled">{{option}}</el-radio>
          </el-radio-group>
        </div>
        <!-- 答题框 -->
        <div class="answer">
          <video id="play" ref="Video"></video>
        </div>
      </div>
      <!--下一题跳转或提交面试按钮盒子-->
      <div class="next-ques">
        <button v-if="start_used" class="stop-button" ref="stop" @click="stopRecord">停止作答</button>
        <button v-else class="stop-button" ref="stop">停止作答</button>
        <button v-if="stop_used" class="next-button" v-loading.fullscreen.lock="fullscreenLoading" @click="nextQues">{{nextSubmit}}</button>
        <button v-else class="next-button">{{nextSubmit}}</button>
      </div>
    </div>
  </div>
</template>

<script>
import RecordRTC from 'recordrtc';   // 用于录制并播放视频
// import * as FileSaver from 'file-saver'    // 用于保存录制的视频
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from "axios";

export default {
  data() {
    return {
      questions: [],         // 题目列表
      total: 0,            // 总题数
      currQuesNum: 0,       // 当前题目序号
      optionIndex: null,      // 选项索引
      totalScore: 0,         // 答题总分

      prep_time: 10,      // 准备时间初始值
      preptimeStatus: true,    // 准备时间倒计时运行状态
      ans_time: 20,     // 答题时间初始值
      anstimeStatus: true,     // 答题时间倒计时运行状态
      prep: null,         // 每一题开始时的初始文本内容
      start_used: false,     // 开始答题按钮是否点击
      stop_used:false,        // 停止作答按钮是否点击
      prep_timer: null,    // 倒计时定时器
      ans_timer: null,    // 倒计时定时器

      localStream: null,     // 摄像头采集的视频流
      recordObj: null,        // 录制器对象
      recordedBlob: null,    // 录制后的视频文件
      remoteUrl: null,        // 录制后的视频文件的 URL
      videoElement: null,

      nextSubmit: '下一题',
      chance: 3,
      submitPopwindow: null,

      fullscreenLoading: false,
      isDisabled: true,
    }
  },

  async created() {
    // 从后端返回json数据的url地址获取题目
    await fetch("http://localhost:8081/tittle10/all")
        .then(res => res.json())
        .then(res => {
          console.log(res)
          this.questions = res.data;
          this.total = res.total;
        })
  },

  computed: {
    progress() {
      return (this.currQuesNum+1)*100/this.total;
    },
    currentQuestion() {
      return this.questions[this.currQuesNum];
    },
    options() {
      // 选项为null的就不显示选项
      const optionsContents = [];
      for(let i=0; i<6; ++i){
        const option = this.questions[this.currQuesNum][`tittle${String.fromCharCode(65 + i)}`];
        if(option) {
          optionsContents.push(option);
        }
      }
      return optionsContents;
    }
  },

  methods: {
    getStream() {
      // 获取并显示本地视频流
      navigator.mediaDevices.getUserMedia({video: true, audio: true})
          .then(stream => {
            this.videoElement = document.getElementById('play');
            this.videoElement.autoplay = true;
            this.$refs.Video.srcObject = stream;
            this.localStream = stream;
          });
    },
    startRecord() {
      // 创建录制器对象
      this.recordObj = new RecordRTC(this.localStream, {type: 'video'});

      // 开始录制
      this.recordObj.startRecording();
      console.log('开始录制...');
      this.start_used = true;    // 点击开始答题按钮后按钮消失

      // 答题倒计时
      this.preptimeStatus = false;
      this.ans_timer = setInterval(() => {
        if (this.anstimeStatus && this.ans_time > 1) {
          this.prep = `现在是答题时间，剩余${this.ans_time}s`;
          this.ans_time--;
        } else {
          // 答题时间倒数结束自动触发停止作答按钮的点击事件
          clearInterval(this.ans_timer);
          console.log(this.$refs.stop)
          if (this.$refs.stop !== null) {
            this.$refs.stop.click()
          }
        }
      }, 1000)
    },
    stopRecord() {
      // 停止录制
      console.log(this.recordObj)
      this.recordObj.stopRecording(() => {
        this.anstimeStatus = false;    // 停止答题时间倒计时
        this.prep = '本次答题已结束';
        this.stop_used = true;
        // 获取录制后的视频文件
        this.recordedBlob = this.recordObj.getBlob();

        console.log('录制完成：', this.recordedBlob);

        // 播放录制后的视频
        this.videoElement.autoplay = false;
        this.videoElement.controls = true;
        const remoteUrl = URL.createObjectURL(this.recordedBlob);
        this.$refs.Video.srcObject = null;     // 原本占着video中的视频流删去给录制好的视频让空间
        this.$refs.Video.src = remoteUrl;
        this.remoteUrl = remoteUrl;

        // 释放资源
        this.recordObj.destroy();
        // this.recordObj = null;  不要用这句，否则直接点击停止答题按钮时就recorder对象就为null了，无法调用stopRecording()
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      });
    },
    startCountdown() {
      this.prep_timer = setInterval(() => {
        if (this.preptimeStatus && this.prep_time > 0) {
          this.prep = `现在是准备时间，${this.prep_time}s后将自动开始答题`  // 更新文本内容（不是单引号，是`）
          this.prep_time--;          // 每秒减少直到为0
        } else {
          // 准备时间倒数结束自动触发开始答题按钮的点击事件
          clearInterval(this.prep_timer);
          console.log(this.$refs.start)  // 当直接点击按钮时这里就为null，此时就不执行该句
          if (this.$refs.start !== null) {
            this.$refs.start.click()
          }
          /* 需要注意，如果在组件的 mounted 生命周期钩子函数中尝试使用 $refs 获取元素引用，但是该组件实例还没有渲染完成，那么 $refs 将会返回 undefined，导致调用 click() 方法失败。
           * 这种情况下，可以通过在 nextTick 回调函数中执行相关代码，确保组件已经正确渲染完成。
           * el-button对ref属性无效，必须用button标签
           * 等待组件渲染完成后自动触发按钮点击*/
        }
      }, 1000)
    },
    async nextQues() {
      this.chance--;
      // 最后一题
      if (this.currQuesNum + 1 === this.questions.length) {
        // 答题机会未用完
        if (this.chance > 0) {
          this.submitPopwindow = `本题共有3次作答机会，您还剩${this.chance}次。是否进入下一题？`
          ElMessageBox.confirm(
              `${this.submitPopwindow}`,
              '注意',
              {
                cancelButtonText: '是',
                confirmButtonText: '否',
                type: 'warning',
              }
          )
              .then(() => {
                ElMessage({
                  type: 'success',
                  message: '重新作答当前题目',
                })
                // 重新作答该题，刷新视频框、按钮的状态、倒计时开始值
                this.refreshStatus()
                this.getStream();
                this.startCountdown();
              })
              .catch(() => {
                ElMessage({
                  type: 'info',
                  message: '不重新作答，结束面试',
                })
                // FileSaver.saveAs(this.recordedBlob, `${this.currQuesNum}.mp4`)    //保存本题的最终答题视频（不能指定保存路径）
                // this.totalScore += this.calculateScore()
                // console.log(this.totalScore)
                this.fullscreenLoading=true
                setTimeout(()=>{
                  this.fullscreenLoading=false
                },10000)
                this.processVideoEnd(this.recordedBlob)   // 保存并异步处理视频
                // this.$router.push({name: 'result', params: {score: this.totalScore}})    // 在跳转时将totalScore作为参数传递过去
              })
        }
        // 答题机会已用完
        else {
          this.submitPopwindow = '您已完成最后一题，面试结束。'
          ElMessageBox.alert(
              `${this.submitPopwindow}`,
              '注意',
              {
                confirmButtonText: '确定',
                callback: () => {
                  ElMessage({
                    type: 'info',
                    message: `面试结束`,
                  })
                  // 答题机会用完自动结束面试的处理逻辑
                  // FileSaver.saveAs(this.recordedBlob, `${this.currQuesNum}.mp4`)    //保存本题的最终答题视频（不能指定保存路径）
                  // this.totalScore += this.calculateScore()
                  // console.log(this.totalScore)
                  // // this.saveScore(this.totalScore)
                  // this.$router.push({name: 'result', params: {score: this.totalScore}})    // 在跳转时将totalScore作为参数传递过去
                  this.fullscreenLoading=true
                  setTimeout(()=>{
                    this.fullscreenLoading=false
                  },10000)
                  this.processVideoEnd(this.recordedBlob)   // 保存并异步处理视频
                },
              })
        }
      }
      // 非最后一题
      else {
        // 答题机会未用完
        if (this.chance > 0) {
          this.submitPopwindow = `本题共有3次作答机会，您还剩${this.chance}次。是否进入下一题作答？`
          ElMessageBox.confirm(
              `${this.submitPopwindow}`,
              '注意',
              {
                cancelButtonText: '是',
                confirmButtonText: '否',
                type: 'warning',
              }
          )
              .then(() => {
                ElMessage({
                  type: 'success',
                  message: '重新作答当前题目',
                })
                // 重新作答该题，刷新视频框、按钮的状态、倒计时开始值
                this.refreshStatus()
                this.getStream();
                this.startCountdown();
              })
              .catch(() => {
                ElMessage({
                  type: 'info',
                  message: '不重新作答，直接进入下一题',
                })
                // 跳转至下一题的处理逻辑
                // FileSaver.saveAs(this.recordedBlob, `${this.currQuesNum}.mp4`)    //保存本题的最终答题视频（不能指定保存路径）
                // this.totalScore += this.calculateScore()
                // console.log(this.totalScore)
                this.fullscreenLoading=true
                setTimeout(()=>{
                  this.fullscreenLoading=false
                },1000)
                this.processVideo(this.recordedBlob)   // 保存并异步处理视频
                this.refreshStatus()
                this.currQuesNum++
                if (this.currQuesNum + 1 === this.questions.length) {
                  this.nextSubmit = '提交'
                } else {
                  this.nextSubmit = '下一题'
                }
                this.chance = 3
                this.getStream();
                this.startCountdown();
              })
        }
        // 答题机会已用完
        else {
          this.submitPopwindow = '您已完成本题作答，进入下一题。'
          ElMessageBox.alert(
              `${this.submitPopwindow}`,
              '注意',
              {
                confirmButtonText: '确定',
                callback: () => {
                  ElMessage({
                    type: 'info',
                    message: `跳转至下一题`,
                  })
                  // 答题次数用完后自动跳转至下一题的处理逻辑
                  // FileSaver.saveAs(this.recordedBlob, `${this.currQuesNum}.mp4`)    //保存本题的最终答题视频（不能指定保存路径）
                  // this.totalScore += this.calculateScore()
                  // console.log(this.totalScore)
                  // this.fullscreenLoading=true
                  // setTimeout(()=>{
                  //   this.fullscreenLoading=false
                  // },10000)
                  this.fullscreenLoading=true
                  setTimeout(()=>{
                    this.fullscreenLoading=false
                  },1000)
                  this.processVideo(this.recordedBlob)   // 保存并异步处理视频
                  this.refreshStatus()
                  this.currQuesNum++
                  if (this.currQuesNum + 1 === this.questions.length) {
                    this.nextSubmit = '提交'
                  } else {
                    this.nextSubmit = '下一题'
                  }
                  this.chance = 3
                  this.getStream();
                  this.startCountdown();
                  
                },
              }
          )
        }
      }
    },
    processVideo(videoBlob) {
      const formData = new FormData();
      formData.append('video', videoBlob)
      this.options.forEach((answer) => {
        formData.append('answers[]', answer);
      });
      axios.post('http://47.102.104.144:8088/getAnswer', formData)
          .then(response => {
            console.log("视频处理成功！")
            // console.log(response)
            // 处理接口返回的数据
            // console.log(response.data.index)
            this.totalScore += this.calculateScore(response.data.index)
            // console.log(this.totalScore)
            localStorage.setItem('totalScore', this.totalScore)

            // this.chance = 3
            // this.getStream();
            // this.startCountdown();
          })
          .catch(error => {
            console.log("视频处理失败！", error)
            // 处理错误
          })
    },
    refreshStatus() {
      // 刷新视频框、按钮的状态、倒计时开始值
      this.prep_time = 10
      this.preptimeStatus = true
      this.ans_time = 20
      this.anstimeStatus = true
      this.prep = null
      this.start_used = false
      this.stop_used = false
      this.localStream = null
      this.recordObj = null
      this.recordedBlob = null
      this.remoteUrl = null
      this.videoElement = null
      this.nextSubmit = "下一题"
    },
    processVideoEnd(videoBlob) {
      const formData = new FormData();
      formData.append('video', videoBlob)
      this.options.forEach((answer) => {
        formData.append('answers[]', answer);
      });
      axios.post('http://47.102.104.144:8088/getAnswer', formData)
          .then(response => {
            console.log("视频处理成功！")
            console.log(response)
            // 处理接口返回的数据
            // console.log(response.data.index)
            this.totalScore += this.calculateScore(response.data.index)
            // console.log(this.totalScore)
            localStorage.setItem('totalScore', this.totalScore)

            this.$router.push('/result')
          })
          .catch(error => {
            console.log("视频处理失败！", error)
            // 处理错误
          })
    },
    // 根据每题视频传入后端返回的题目索引计算总分
    calculateScore(optionIndex) {
      // 根据选择的选项计算该题的得分
      if (optionIndex !== null) {
        const scores = this.questions[this.currQuesNum]['tittleScore'].split(',');
        return parseInt(scores[optionIndex], 10);
      }
      return 0;
    },
  },

  mounted() {
    this.getStream();    // 在组件挂载后，初始化视频
    this.startCountdown();    // 组件渲染完成后自动开始
  },
}
</script>

<style lang="scss">
// 页面样式
.interview-page{
  height: 100vh;
  overflow-x: hidden;     /* 如果溢出元素的内容区域的话，裁剪该元素中内容的左/右边缘 */
  display: flex;
  background-color: snow;
}

// 中间内容盒子
.interview-box{
  width: 100%;
  height: 90%;
  margin: 120px 200px;
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
  align-items: center;
  // 问题进度条
  .progress{
    width: 95%;
    height: 15%;
    padding: 20px 20px 10px 20px;
    .question-progress{
      width: 100%;
      padding: 5px;
    }
    .prompt{
      width: 100%;
      display: flex;
      flex-direction: row;
      padding: 10px;
      // 左边提示文字
      #left{
        width: 50%;
        text-align: left;
      }
      // 右边提示文字
      #right{
        width: 50%;
        text-align: right;
        margin-right: 15px;
      }
      // 开始按钮
      #start-button{
        width: 10%;
        padding: 10px 20px;
        margin: -8px 5px;
        border: 1px solid lightgrey;
        border-radius: 4px;
        background-color: white;
      }
      #start-button:hover{
        background-color: #6098FF;
        color: white;
        font-weight: bold;
        cursor: pointer;
      }
    }
  }
  // 问答盒子
  .answer-box{
    width: 85%;
    height: 65%;
    display: flex;
    flex-direction: row;
    /* 设置边框 */
    border: 1px solid rgba(255, 255, 255, 0.6);
    /* 设置盒子阴影 */
    box-shadow: 2px 1px 19px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    .question{
      width: 50%;
      height: 100%;
      margin-top: 40px;
      margin-left: 30px;
      text-align: left;
      #tittleQues{
        margin-bottom: 15px;
        #q-a{
          padding: 8px;
        }
        #q{
          font-size: large;
          font-weight: bold;
          padding: 10px 0;
        }
      }
      .options{
        display: flex;
        flex-direction: column;
        align-items: start;
        .option{
          padding: 0 20px;
          font-weight: bold;
        }
      }
    }
    .answer{
      width: 50%;
      height: 100%;
      padding: 20px;
      #play{
        width: 100%;
        height: 85%;
      }
    }
  }
  .next-ques{
    height: 15%;
    display: flex;
    justify-content: center;
    align-items: center;
    .stop-button, .next-button{
      padding: 20px 30px;
      margin: 0 30px;
      //padding: 10px 20px;
      //margin: -8px 5px;
      border: 1px solid lightgrey;
      border-radius: 4px;
      background-color: white;
      letter-spacing: 2px;
    }
    .stop-button:hover, .next-button:hover{
      background-color: #6098FF;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }
  }
}
</style>