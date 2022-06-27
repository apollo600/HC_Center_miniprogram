const app = getApp();
const fs = wx.getFileSystemManager();



function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}

Page ({
    data: {
        themeColor: app.globalData.themeColor,
        navBarHeight: app.globalData.navBarHeight,
        back: true,
        md_text: undefined,
        members: []
    },

    onLoad(options) {
        const that = this;
        let md;
        let _index = options.index;
        let item = app.globalData['d_items'][_index];
        let _contentID = item.contentID;
        console.log("File ID:", _contentID);
        wx.cloud.downloadFile({
            fileID: _contentID
        })
        .then(res => {
            console.log("http链接",res.tempFilePath);
            console.log(item);
            md = `# ${item.title}\n\n> 举办时间：${dateFormat("YY-mm-dd HH:MM", item.d)}\n\n>发布时间：${dateFormat("YY-mm-dd HH:MM", item.releaseDate)}\n\n![title-image](${item.imageURL})\n\n${fs.readFileSync(res.tempFilePath,"utf-8")}`;
            
            console.log("文件正文处理后:", md);
            that.setData({
                md_text: md,
                members: item.members
            })
        })
        .catch(err => {
            console.error(err)
        })
    },

    back() {
        wx.navigateBack({
          delta: 1,
        })
    },

    signClicked() {
        wx.navigateToMiniProgram({
          appId: 'wxd947200f82267e58',
          path: "pages/wjxqList/wjxqList?activityId=e4hxWyw"
        //   path: 'pages/show/show'
        })
    }
})