import * as FileSaver from 'file-saver'    // 用于保存录制的视频
const fs = require('fs')
function saveVideoToPath(videoBlob, videoName, userFolder) {
    if(!fs.existsSync(userFolder)) {
        // 如果文件夹不存在则创建文件夹
        fs.mkdirSync(userFolder, {recursive: true});
    }
    // 构建完整的视频文件路径
    const videoPath = `${userFolder}/${videoName}`;
    // 将视频 Blob 对象写入文件
    fs.writeFileSync(videoPath, videoBlob);
    FileSaver.saveAs(videoBlob, videoName)    //保存本题的最终答题视频（不能指定保存路径）
}

module.exports = {saveVideoToPath};