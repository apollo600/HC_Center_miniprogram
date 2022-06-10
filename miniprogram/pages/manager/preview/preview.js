const app = getApp();
const fs = wx.getFileSystemManager();

Page({
    data: {
        themeColor: app.globalData.themeColor,
        navBarHeight: app.globalData.navBarHeight,
        back: true,
        md_text: undefined
    },

    onLoad(options) {
        const that = this;
        let md;
        let item = options;
        let _contentID = options.contentID;
        console.log("File ID:", _contentID);
        wx.cloud.downloadFile({
            fileID: _contentID
        })
        .then(res => {
            console.log("http链接",res.tempFilePath);
            md = `# ${item.title}\n\n> 举办时间：${item.t1}\n\n>发布时间：${item.t2}\n\n![title-image](${item.imageURL})\n\n${fs.readFileSync(res.tempFilePath,"utf-8")}`;
            
            console.log("文件正文处理后:", md);
            that.setData({
                md_text: md
            })
        })
        .catch(err => {
            console.error(err)
        })
    },

    back() {
        wx.navigateBack({
            delta: 1
        })
    }
})