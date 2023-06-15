<template>
  <div class="detect-page">
    <!--最外层盒子-->
    <div class="detect-box">
      <!--左侧盒子，显示摄像头画面和麦克风音量大小，及可供选择的设备资源-->
      <div class="video-box">
        <video
          class="camera"
          ref="video"
          autoplay
        ></video> <!--将指定视频显示在网页上-->
        <!--选项列表框-->
        <div class="option-list">
          <br />摄像头：
          <select
            class="option"
            v-model="selectedCamera"
            @change="onCameraChange"
          >
            <option
              v-for="(device, index) in cameras"
              :key="index"
              :value="device.deviceId"
            >{{ device.label }}</option>
          </select>
          <br />麦克风：
          <select
            class="option"
            v-model="selectedMic"
            @change="onMicChange"
          >
            <option
              v-for="(device, index) in microphones"
              :key="index"
              :value="device.deviceId"
            >{{ device.label }}</option>
          </select>
        </div>
        <!--麦克风音量监测-->
        <div class="volume-bar">
          <el-icon>
            <Microphone />
          </el-icon>
          <!--用进度条展示当前麦克风的音量值 micVolume-->
          <el-progress
            class="volume-progress"
            :percentage="micVolume"
            :stroke-width="10"
          >
          </el-progress>
        </div>
        <audio
          ref="audio"
          autoplay
        ></audio>
      </div>
      <!--右侧盒子，显示检测结果-->
      <div class="list-box">
        <!--标题盒子-->
        <div class="list-title">
          <h2>设备与网络检测</h2>
        </div>
        <!--检测结果列表盒子-->
        <div class="list">
          <div class="items">
            <el-icon class="icon">
              <Camera />
            </el-icon>
            摄像头<span class="status">{{ cameraStatus }}</span>
          </div>
          <div class="items">
            <el-icon class="icon">
              <Microphone />
            </el-icon>
            麦克风<span class="status">{{ microphoneStatus }}</span>
          </div>
          <div class="items">
            <el-icon class="icon">
              <Monitor />
            </el-icon>
            当前网速<span class="status1">{{ networkSpeed }}Mbps</span>
          </div>
        </div>
        <!--检测完成按钮-->
        <div class="detect-button">
          <el-button
            id="button"
            type="primary"
            @click="handleClick"
          >检测完成</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cameras: [],
      selectedCamera: "",
      microphones: [],
      selectedMic: "",
      micVolume: 0,
      cameraStatus: null,
      microphoneStatus: null,
      networkSpeed: null,
    };
  },

  mounted() {

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        this.cameraStatus = "可用";
      })
      .catch(() => {
        this.cameraStatus = "不可用";
      });

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        this.microphoneStatus = "可用";
      })
      .catch(() => {
        this.microphoneStatus = "不可用";
      });
      
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (connection) {
      this.networkSpeed = connection.downlink.toFixed(2);
    } else {
      this.networkSpeed = "不支持";
    }

    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        this.cameras = devices.filter((device) => device.kind === "videoinput");
        this.microphones = devices.filter(
          (device) => device.kind === "audioinput"
        );
        this.selectedCamera =
          this.cameras.length > 0 ? this.cameras[0].deviceId : "";
        this.selectedMic =
          this.microphones.length > 0 ? this.microphones[0].deviceId : "";
        this.startStream();
      })
      .catch((error) => {
        console.error("Failed to enumerate devices", error);
      });
  },

  methods: {
    startStream() {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            deviceId: this.selectedCamera,
          },
          audio: {
            deviceId: this.selectedMic,
          },
        })
        .then((stream) => {
          this.$refs.video.srcObject = stream;
          this.$refs.audio.srcObject = stream;
          this.startMicVolumeDetection(stream);
        })
        .catch((error) => {
          console.error("Failed to get user media", error);
        });
    },

    onCameraChange(event) {
      this.selectedCamera = event.target.value;
      this.startStream();
    },

    onMicChange(event) {
      this.selectedMic = event.target.value;
      this.startStream();
    },

    startMicVolumeDetection(stream) {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, val) => acc + val);
        this.micVolume = Math.round(sum / bufferLength);
      }, 100);
    },

    handleClick() {
      // 跳转页面前关闭摄像头和麦克风（跳转后过一会儿才关掉）
      this.$refs.video.srcObject.getTracks().forEach((track) => track.stop());
      this.$refs.video.srcObject = null;
      this.$refs.audio.srcObject.getTracks().forEach((track) => track.stop());
      this.$refs.video.srcObject = null;

      this.$router.push("/interview");
    },
  },
};
</script>

<style lang="scss">
/* 页面盒子 */
.detect-page{
  height: 100vh;
  overflow-x: hidden;     /* 如果溢出元素的内容区域的话，裁剪该元素中内容的左/右边缘 */
  display: flex;
  background-color: snow;
}

/* 最外层的大盒子 */
.detect-box{
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

/* 大盒子内左侧、右侧的盒子 */
.video-box,
.list-box {
  /* 宽度为大盒子的一半 */
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;      /* 相对定位 */
  left: 0;                 /* 距离大盒子左侧为0 */
  top: 0;                  /* 距离大盒子顶部为0 */
  z-index: 99;
  //border-radius: 4px;
  background-color: white;
  //box-shadow: 2px 1px 19px rgba(0, 0, 0, 0.1);
}
.video-box{
  border-right: 0.5px dashed;
}

/* 摄像头画面盒子 */
.camera{
  padding: 60px 60px 0 60px;
}
/* 可选多媒体资源列表盒子 */
.option-list{
  margin: 0 60px;
  text-align: left;
}
.option{
  margin: 5px 0;
}
/* 音量进度条盒子 */
.volume-bar{
  margin: 0 60px;
  display: flex;
  flex-direction: row;
}
.volume-progress{
  width: 100%;
  height: 80%;
}

/* 右侧盒子的标题盒子 */
.list-title{
  padding: 80px 200px 40px 40px;
}

/* 检测结果列表盒子 */
.list{
  padding: 20px 80px;
  display: flex;
  flex-direction: column;
  text-align: left;
}
.items{
  margin: 10px 0;
  display: flex;
}
.icon{
  height: 100%;
  margin: 0 4px 0 0;
}
.status{
  width: 75%;
  height: 100%;
  text-align: right;
}
.status1{
  width: 70%;
  height: 100%;
  text-align: right;
}

/* 完成按钮 */
.detect-button{
  padding: 20px 80px;
  #button{
    width: 100%;
  }
}

</style>