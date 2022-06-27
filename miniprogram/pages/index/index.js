// index.js
const app = getApp()
const db = wx.cloud.database();
const MAX_LIMIT = 20;
const processors = 10;
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let d_items = [];


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
    back: false,
    items: []
  },

  onShow() {
    if (!app.globalData['loggedIn']) {
        wx.redirectTo({
          url: '../login/index/index',
        })
    }
    console.time("首屏时间")
    let that = this;
    wx.showLoading({
      title: '加载中...',
    })
    if (app.globalData['hasReload'] == false) {
        d_items = [];
        
        // 从数据库获取结果
        db.collection('eventInfo').count().then(res => {
            console.time("pull");
            let total = res.total;
            let limit = Math.ceil(total / processors);
            limit = limit > MAX_LIMIT ? MAX_LIMIT : limit;
            const batches = Math.ceil(total / limit);
            let tasks = [];
            console.log(`数据库大小为:${total}, 分${batches}次取出，每次取出${limit}`);
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
                

                // 同步数据到globalData
                app.globalData['d_items'] = d_items;
                // 同步数据到data
                wx.hideLoading({});
                that.setData({
                    items: app.globalData['d_items']
                },() => {
                    console.log("展示数据:", that.data.items, "全局数据:", app.globalData['d_items']);
                    console.timeEnd("首屏时间");
                })
            })
            console.timeEnd("pull");
            
        })
        
    } else {
        app.globalData['hasReload'] = false;
        // 同步数据到data
        wx.hideLoading({});
        that.setData({
            items: app.globalData['d_items']
        }, () => {
            console.log("展示数据:", that.data.items, "全局数据:", app.globalData['d_items']);
        })
    }
    
  },

  back() {
    console.log('clicked back')
    wx.navigateBack({
      delta: 1
    })
  },

  openItem(e) {
    const that = this;
    let _index = e.currentTarget.dataset.reply;
    console.log("跳转到",_index,"值为:",that.data.items[_index],"内容ID:",that.data.items[_index].contentID);
    wx.navigateTo({
        url: `modal/index?index=${_index}`,
    })
  },

  tmp_clear() {
    console.log('storage cleared');
    wx.clearStorageSync();
  }
  
});
