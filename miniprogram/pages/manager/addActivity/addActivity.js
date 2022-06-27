const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
const fs = wx.getFileSystemManager();
const MAX_LIMIT = 20;

let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let item = {
    title: "",
    type: "",
    d: undefined,
    imageURL: "",
    contentID: "",
    ID: "",
    releaseDate:"",
    members: []
};

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
        title: "",
        typeIndex: 0,
        types: ['启真沙龙', '启真学堂', '宣讲会', '国际化沙龙', '与学长有约'],
        date: "2022-05-13",
        _date: [],
        time: "12:10",
        _time: [],
        images: [""],
        uploadCompleted: false,
        onUpload: false,
        contentID: "",
        content: "",
        releaseDate:""
    },

    onShow() {
        this.setData({
            title: wx.getStorageSync('title'),
            typeIndex: wx.getStorageSync('typeIndex'),
            date: wx.getStorageSync('date'),
            time: wx.getStorageSync('time'),
            images: wx.getStorageSync('images'),
            content: wx.getStorageSync('content'),
            releaseDate: wx.getStorageSync('releaseDate')
        })
        console.log("缓存恢复数据完毕",this.data);
    },

    onUnload() {
        let _clr = ['title', 'typeIndex', 'date', 'time', 'images', 'content','releaseDate']
        for (let s in _clr) {
            wx.clearStorageSync(s);
        }
    },

    chooseImage() {
        const that = this;
        that.setData({
            uploadCompleted: false,
            onUpload: true
        })
        wx.chooseImage({
          sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success(res) {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            wx.cloud.uploadFile({
                cloudPath: `${new Date().toISOString()}.png`,
                filePath: res.tempFilePaths[0]
            }).then(res => {
                that.setData({
                    images: [res.fileID],
                    uploadCompleted: true,
                    onUpload: false
                });
                wx.setStorageSync('images', [res.fileID])
            }).catch(err => {
                console.error(err);
            })
          },
        });
    },
      
    previewImage(e) {
        wx.previewImage({
          current: e.currentTarget.id, // 当前显示图片的http链接
          urls: this.data.images, // 需要预览的图片http链接列表
        });
    },

    back() {
        wx.showModal({
            content: `确认退出添加活动吗？已经填写的内容可能丢失！`,
        }).then(res => {
            console.log("是否确认返回:", res.confirm);
            if (res.confirm == true) {
                wx.redirectTo({
                  url: '../manager',
                })
            }
        })
      },

    titleChanged(e) {
        console.log("活动名称:", e.detail.value)
        this.setData({
            title: e.detail.value
        })
        wx.setStorageSync('title', e.detail.value)
    },

    typeChanged(e) {
        let _index = e.detail.value;
        console.log("活动种类:", _index)
        this.setData({
            typeIndex: _index
        })
        wx.setStorageSync('typeIndex', _index)
    },

    dateChanged(e) {
        let _res = e.detail.value;
        console.log("日期:", _res)
        this.setData({
            date: _res
        })
        wx.setStorageSync('date', _res)
        // this.data._date = _res.split('-')
        // console.log("日期：",_res,"分解后：",this.data._date);
    },

    timeChanged(e) {
        let _res = e.detail.value;
        console.log("时间:", _res)
        this.setData({
            time: _res
        })
        wx.setStorageSync('time', _res)
        // this.data._time = _res.split(':')
        // console.log("时间：",_res,"分解后：",this.data._time);
    },

    contentChanged(e) {
        let _res = e.detail.value;
        console.log("活动详情:",_res);
        this.setData({
            content: _res
        })
        wx.setStorageSync('content', _res)
    },

    releaseActivity() {
        console.log("====发布活动====");

        const that = this;
        // 检查缺项
        if (that.data.title == "" || that.data.date == "" || that.data.time == "" || that.data.images.length == 0 || that.data.content == "") 
        {
            wx.showToast({
              title: '有未填写内容',
              icon: 'error'
            })
            console.log("检测发现缺项:", that.data)
            return;
        }
        console.log("检查缺项完成")

        // 提示加载中
        wx.showLoading({
        title: '正在上传...',
        })

        //预处理数据，以及获取md文件链接
        that.data._date = that.data.date.split('-');
        that.data._time = that.data.time.split(':');
        fs.writeFileSync(`${wx.env.USER_DATA_PATH}/tmp.txt`, `${that.data.content}`, "utf-8");
        wx.cloud.uploadFile({
            cloudPath: `${new Date().toISOString()}.txt`,
            filePath: `${wx.env.USER_DATA_PATH}/tmp.txt`
        })
        .then(res => {
            console.log("云端存储md成功，存储结果:", res);
            item.contentID = res.fileID;
            that.setData({
                contentID: res.fileID
            })

            // 按照Item格式存储
            item.title = that.data.title;
            item.type = that.data.types[that.data.typeIndex];
            item.d = new Date(that.data._date[0], that.data._date[1] - 1, that.data._date[2], that.data._time[0], that.data._time[1]);
            item.imageURL = that.data.images[0]
            item.ID = `${that.data.date}_${that.data.time}_${item.type}_${item.title}`
            item.releaseDate = new Date();
            console.log("存储至item完成:",item);

            // 存入数据库
            let total;
            db.collection('eventInfo').where({
                ID: item.ID,
            }).get({
                success: function(res) {
                    total = res.data.length;
                    console.log("当前id数据库中数量",total);
                    if (total != 0) {
                        console.log("将进行数据库更新");
                        db.collection('eventInfo').where({
                            ID: _.eq(item.ID)
                        })
                        .remove()
                        .then(res => {
                            console.log("从数据库删除",res);
                            db.collection('eventInfo')
                            .add({
                                data: {
                                    ID: item.ID,
                                    title: item.title,
                                    type: item.type,
                                    d: item.d,
                                    imageURL: item.imageURL,
                                    contentID: item.contentID,
                                    releaseDate: item.releaseDate,
                                    members: item.members
                                },
                            })
                            .then(res => {
                                console.log("向数据库添加",res);
                                wx.hideLoading({
                                    success: (res) => {},
                                })
                                app.globalData['hasReload'] = true;
                                wx.navigateBack({
                                    delta: 1,
                                })
                            })
                        })
                        
                            
                    }
                    else {
                        // for (let i = 0; i < 188; ++i) {
                        //     console.log("数据不存在，添加活动");
                        //     db.collection('eventInfo').add({
                        //         data: {
                        //             ID: item.ID,
                        //             title: item.title,
                        //             type: item.type,
                        //             d: item.d,
                        //             imageURL: item.imageURL,
                        //             contentID: item.contentID
                        //         }, success: function() {
                        //             console.log("数据添加成功");
                        //         }
                        //     })
                        // }
                        console.log("数据不存在，添加活动");
                        db.collection('eventInfo').add({
                            data: {
                                ID: item.ID,
                                title: item.title,
                                type: item.type,
                                d: item.d,
                                imageURL: item.imageURL,
                                contentID: item.contentID,
                                releaseDate: item.releaseDate,
                                members: item.members
                            },
                        })
                        .then(res => {
                            console.log(res);
                            wx.hideLoading({
                                success: (res) => {},
                            })
                            app.globalData['hasReload'] = true;
                            wx.navigateBack({
                                delta: 1,
                            })
                        })
                    }
                }
            })
            
        }).catch(error => {
            console.error(error);
        })
    },

    // disabled | deprecated
    reload() {
        let d_items = [];
        let that = this;

        db.collection('eventInfo').count().then(res => {
            let total = res.total;
            const batches = Math.ceil(total / MAX_LIMIT);
            let tasks = [];
            console.log(`数据库大小为:${total}, 分${batches}次取出`);
            for (let i = 0; i < batches; ++i) {
                const promise = db.collection('eventInfo').skip(i*MAX_LIMIT).limit(MAX_LIMIT).get();
                tasks.push(promise);
            }
            // 等待所有数据取完
            Promise.all(tasks).then((values) => {
                console.log("取出的所有结果:",values);
                for (let i = 0; i < values.length; ++i) {
                    d_items.push.apply(d_items, values[i].data);
                    console.log("拼接后", d_items);
                }
                // 排序
                d_items.sort(function(a, b) {
                    return a.d < b.d ? 1 : -1;
                })
                console.log("主页面获取数据库结果:", d_items);
        
                // 按Date排序加月份信息
                // 添加是否被选中键
                console.log("排序后结果:",d_items);
                for (let i = 0; i < d_items.length; ++i) {
                    if (d_items[i].d.getDate() < 10) {
                        d_items[i].short_date = months[d_items[i].d.getMonth()] + "   " + d_items[i].d.getDate();
                    } else {
                        d_items[i].short_date = months[d_items[i].d.getMonth()] + " " + d_items[i].d.getDate();
                    }
                    d_items[i].time = dateFormat("HH:MM", d_items[i].d);
                    d_items[i].date = dateFormat("YY-mm-dd", d_items[i].d);
                    d_items[i].isSelected = false;
                }
            })
        })
    },

    previewActivity() {
        console.log("====预览活动====");

        const that = this;
        // 检查缺项
        if (that.data.title == "" || that.data.date == "" || that.data.time == "" || that.data.images.length == 0 || that.data.content == "") 
        {
            wx.showToast({
              title: '有未填写内容',
              icon: 'error'
            })
            console.log("检测发现缺项:", that.data)
            return;
        }
        console.log("检查缺项完成")

        // 提示加载中
        wx.hideToast();
        wx.showLoading({
          title: '正在上传...',
        })

        //预处理数据，以及获取md文件链接
        that.data._date = that.data.date.split('-');
        that.data._time = that.data.time.split(':');
        fs.writeFileSync(`${wx.env.USER_DATA_PATH}/tmp.txt`, `${that.data.content}`, "utf-8");
        wx.cloud.uploadFile({
            cloudPath: `${new Date().toISOString()}.txt`,
            filePath: `${wx.env.USER_DATA_PATH}/tmp.txt`
        }).then(res => {
            console.log("云端存储md成功，存储结果:", res);
            item.contentID = res.fileID;

            // 按照Item格式存储
            item.title = that.data.title;
            item.type = that.data.types[that.data.typeIndex];
            item.d = new Date(that.data._date[0], that.data._date[1] - 1, that.data._date[2], that.data._time[0], that.data._time[1]);
            item.imageURL = that.data.images[0]
            item.ID = `${that.data.date}_${that.data.time}_${item.type}_${item.title}`
            item.releaseDate = new Date()
            console.log("存储至item完成:",item);
            
            wx.hideLoading();
            console.log("跳转至:",that.data.contentID);
            wx.navigateTo({
                url: `../preview/preview?title=${item.title}&time1=${dateFormat("YY-mm-dd HH:MM", item.d)}&time2=${dateFormat("YY-mm-dd HH:MM",item.releaseDate)}&imageURL=${item.imageURL}&contentID=${item.contentID}`,
            })
        })
    }
})