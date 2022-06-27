const app = getApp();
const fs = wx.getFileSystemManager();
const db = wx.cloud.database();
const _ = db.command;

let item;

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
    },

    onLoad(options) {
        const that = this;
        let md;
        let _index = options.index;
        item = app.globalData['d_items'][_index];
        let _contentID = item.contentID;
        console.log("File ID:", _contentID);
        wx.cloud.downloadFile({
            fileID: _contentID
        })
        .then(res => {
            console.log("http链接",res.tempFilePath);
            md = `# ${item.title}\n\n> 举办时间：${dateFormat("YY-mm-dd HH:MM", item.d)}\n\n>发布时间：${dateFormat("YY-mm-dd HH:MM", item.releaseDate)}\n\n![title-image](${item.imageURL})\n\n${fs.readFileSync(res.tempFilePath,"utf-8")}`;
            
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
        wx.switchTab({
          url: '/pages/index/index',
        })
    },

    signClicked() {
        // wx.navigateToMiniProgram({
        //   appId: 'wxd947200f82267e58',
        //   path: "pages/wjxqList/wjxqList?activityId=e4hxWyw"
        // //   path: 'pages/show/show'
        // })
        wx.showModal({
            title: '',
            content: '确定报名该活动吗？',
            success (res) {
                if (res.confirm) {
                    console.log('用户点击确认, account:', app.globalData.account);
                    console.log("更改前成员集合: ", item.members);
                    if (!item.members.includes(app.globalData.account))
                        item.members.push(app.globalData.account);
                    console.log("更改后成员集合:", item.members);
                    let events = db.collection('userInfo').where({
                        id: app.globalData.account
                    })
                    db.collection('userInfo').where({
                        id: app.globalData.account
                    }).update({
                        data: {
                            signedUpEventsID: 
                        }
                    })

                    db.collection('eventInfo').where({
                        ID: _.eq(item.ID)
                    }).update({
                        data: {
                            members: item.members
                        }
                    })
                    .then(res => {
                        console.log(res)
                        wx.showToast({
                            title: '报名成功！',
                            icon: 'success'
                        })
                        wx.navigateBack({
                          delta: 1,
                        })
                    })

                   
                }else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        
        })
    }
})