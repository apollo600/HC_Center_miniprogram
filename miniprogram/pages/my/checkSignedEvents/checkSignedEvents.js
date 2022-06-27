const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
const MAX_LIMIT = 20;
const processors = 10;
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


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

Page({
    data: {
        themeColor: app.globalData.themeColor,
        navBarHeight: app.globalData.navBarHeight,
        back: true,
        onSearch: false,
        onDelete: false,
        onEdit: false,
        items: [],
        searchContent: "",
        showSearch: false,
        isEmpty: false
    },

    onShow() {
        const that = this;
        wx.showLoading({
            title: 'waiting...',
        })     
        let d_items = [];
        let userItem;
        let ids = [];
        db.collection('userInfo').where({
            id: parseInt(app.globalData.account)
        }).get().then(res => {
            console.log(res);
            console.log(res.data[0]);
            userItem = res.data[0];
            ids = userItem.signedUpEventsID; 
            db.collection('eventInfo').where({
                ID: _.in(ids)
            })
            .count()
            .then(res => {
                let total = res.total;
                let limit = Math.ceil(total / processors);
                limit = limit > MAX_LIMIT ? MAX_LIMIT : limit;
                const batches = Math.ceil(total / limit);
                let tasks = [];
                console.log(`数据库大小为:${total}, 分${batches}次取出`);
                for (let i = 0; i < batches; ++i) {
                    const promise = db.collection('eventInfo').skip(i*limit).limit(limit).get();
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
    
                    // 同步到globalData和data
                    app.globalData['d_items'] = d_items;
                    that.setData({
                        items: d_items,
                        isEmpty: d_items.length==0
                    }, () => {
                        console.log("setData后的结果", that.data.items);
                        wx.hideLoading();
                    })
                })
            })           
        })

       
    },
    
    openItem(e) {
        const that = this;
        let _index = e.currentTarget.dataset.reply;
        if (!(that.data.onDelete || that.data.onEdit)) {
            console.log("跳转到",_index,"值为:",that.data.items[_index],"内容ID:",that.data.items[_index].contentID);
            wx.navigateTo({
                url: `modal/index?index=${_index}`,
            })
        }
    },

    searchClicked() {
        this.setData({
            onSearch: true
        })
        console.log("onSearch", this.data.onSearch);

    },

    searchCompleted(e) {
        const that = this;
        that.setData({
            onSearch: false,
            searchContent: e.detail.value
        })
        console.log("onSearch", that.data.onSearch, "搜索内容", that.data.searchContent);
    },

    searchCompleted_Left(e) {
        const that = this;
        that.setData({
            onSearch: false,
            searchContent: e.detail.value
        }, () => {
            wx.showLoading();
            const that = this;

            // 使用正则进行模糊搜索
            let t_items = [];
            let searchKey = that.data.searchContent;
            console.log("搜索内容", searchKey);
            db.collection('eventInfo').count().then(res => {
                let total = res.total;
                const batches = Math.ceil(total / MAX_LIMIT);
                let tasks = [];
                console.log(`数据库大小为:${total}, 分${batches}次取出`);
                for (let i = 0; i < batches; ++i) {
                    const promise = db.collection('eventInfo').skip(i*MAX_LIMIT).limit(MAX_LIMIT).where(_.or([
                        {
                            // 题目
                            title: db.RegExp({
                                regexp: searchKey,
                                options: 'i', // 不区分大小写
                            })
                        },
                        {
                            // 类型
                            type: db.RegExp({
                                regexp: searchKey,
                                options: 'i', // 不区分大小写
                            })
                        }
                    ])
                    ).get();
                    tasks.push(promise);
                }
                // 等待所有数据取完
                Promise.all(tasks).then((values) => {
                    console.log("取出的所有结果:",values);
                    for (let i = 0; i < values.length; ++i) {
                        t_items.push.apply(t_items, values[i].data);
                        console.log("拼接后", t_items);
                    }
                    // 预处理t
                    t_items.sort(function(a, b) {
                        return a.d < b.d ? 1 : -1;
                    })
                    console.log("搜索 ",searchKey," 结果:", t_items);
                    
                    // 按Date排序加月份信息
                    // 添加是否被选中键
                    console.log("排序后结果:",t_items);
                    for (let i = 0; i < t_items.length; ++i) {
                        if (t_items[i].d.getDate() < 10) {
                            t_items[i].short_date = months[t_items[i].d.getMonth()] + "   " + t_items[i].d.getDate();
                        } else {
                            t_items[i].short_date = months[t_items[i].d.getMonth()] + " " + t_items[i].d.getDate();
                        }
                        t_items[i].time = dateFormat("HH:MM", t_items[i].d);
                        t_items[i].date = dateFormat("YY-mm-dd", t_items[i].d);;
                        t_items[i].isSelected = false;
                    }
                    
                    wx.hideLoading({
                    success: (res) => {},
                    })
                    if (t_items.length == 0) {
                        wx.showToast({
                        title: '未搜索到相关内容',
                        icon: 'none'
                        })
                        console.log("未搜索到相关数据");
                    }
                    else {
                        // 同步到data
                        setTimeout(function() {
                            that.setData({
                                items: t_items,
                                showSearch: true
                            })
                        }, 1000)
                        console.log("搜索数据已同步",t_items);
                    }
                })
            })
        })
        console.log("onSearch", that.data.onSearch, "搜索内容", that.data.searchContent);
    },

    cancelSearch() {
        let that = this;
        setTimeout(function() {
            that.setData({
                showSearch: false,
                items: app.globalData['d_items'],
                searchContent: ""
            })
        })
        console.log("取消搜索");
    },

    searchLeft() {
        wx.showLoading();
        const that = this;

        // 使用正则进行模糊搜索
        let t_items = [];
        let searchKey = that.data.searchContent;
        console.log("搜索内容", searchKey);
        db.collection('eventInfo').count().then(res => {
            let total = res.total;
            const batches = Math.ceil(total / MAX_LIMIT);
            let tasks = [];
            console.log(`数据库大小为:${total}, 分${batches}次取出`);
            for (let i = 0; i < batches; ++i) {
                const promise = db.collection('eventInfo').skip(i*MAX_LIMIT).limit(MAX_LIMIT).where(_.or([
                    {
                        // 题目
                        title: db.RegExp({
                            regexp: searchKey,
                            options: 'i', // 不区分大小写
                        })
                    },
                    {
                        // 类型
                        type: db.RegExp({
                            regexp: searchKey,
                            options: 'i', // 不区分大小写
                        })
                    }
                ])
                ).get();
                tasks.push(promise);
            }
            // 等待所有数据取完
            Promise.all(tasks).then((values) => {
                console.log("取出的所有结果:",values);
                for (let i = 0; i < values.length; ++i) {
                    t_items.push.apply(t_items, values[i].data);
                    console.log("拼接后", t_items);
                }
                // 预处理t
                t_items.sort(function(a, b) {
                    return a.d < b.d ? 1 : -1;
                })
                console.log("搜索 ",searchKey," 结果:", t_items);
                
                // 按Date排序加月份信息
                // 添加是否被选中键
                console.log("排序后结果:",t_items);
                for (let i = 0; i < t_items.length; ++i) {
                    if (t_items[i].d.getDate() < 10) {
                        t_items[i].short_date = months[t_items[i].d.getMonth()] + "   " + t_items[i].d.getDate();
                    } else {
                        t_items[i].short_date = months[t_items[i].d.getMonth()] + " " + t_items[i].d.getDate();
                    }
                    t_items[i].time = dateFormat("HH:MM", t_items[i].d);
                    t_items[i].date = dateFormat("YY-mm-dd", t_items[i].d);;
                    t_items[i].isSelected = false;
                }
                
                wx.hideLoading({
                  success: (res) => {},
                })
                if (t_items.length == 0) {
                    wx.showToast({
                      title: '未搜索到相关内容',
                      icon: 'none'
                    })
                    console.log("未搜索到相关数据");
                }
                else {
                    // 同步到data
                    setTimeout(function() {
                        that.setData({
                            items: t_items,
                            showSearch: true
                        })
                    }, 1000)
                    console.log("搜索数据已同步",t_items);
                }
            })
        })
    },

    back() {
        wx.switchTab ({
            url: '../my',
        })
    },


})