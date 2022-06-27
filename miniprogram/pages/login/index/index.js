import auth from '../../../utils/auth';
const util = require('../../../utils/util.js')
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
const MAX_LIMIT = 20;
const key = "KUf4hM5rThssysJhcRFCfxLR8Imihjl0eMsyhh1M7Wk";
const rand_name = require('../../../utils/rand_name.js')

// for(var i = 0; i < 7; i++){
//     db.collection('eventInfo').where({}).update({
//         data:{
//             releaseDate: 'Sun May 1 2022 00:00:00 GMT+0800 (中国标准时间)'
//         },
//         success: function(res){
//             console.log(res)
//         }
//     })
// }

// for(var i = 0; i < 10; i++){
//     db.collection('userInfo').add({
//         data:{
//             id: 2020300000 + i,
//             password: util.AES_ECB_ENCRYPT('000'+ i.toString(),key),
//             isTeacher: false
//         },
//         success: function(res){
//             console.log(res)
//         }
//     })
// }

// for(var i = 0; i < 100; i++){
//     db.collection('userInfo').where({
//         id:2020300000 + i
//     }).update({
//         data:{
//             name: rand_name.getName()
//         },
//         success: function(res){
//             console.log(res)
//         }
//     })
// }

// db.collection('userInfo').add({
//     data:{
//         id:777,
//         password:util.AES_ECB_ENCRYPT('123',key),
//         isTeacher:true
//     },
//     success:function(res){
//         console.log(res)
//     }
// })


// for(var i = 0; i < 100; i++){
//     try{
//     db.collection('userInfo').where({
//         id: 2020300000 + i 
//     }).remove()
//     console.log("删除成功");
//     }
//     catch(e){
//         console.error(e)
//     }
// }


Page({
    data: {
        testdate:"",
        account: app.globalData.account,
        inputPassword: "",
        rememberme: app.globalData.rememberme,
        themeColor: app.globalData.themeColor,
        loginDisabled: false,
        userInfo: {},
    },

    onLoad:function(){
        //调用函数时传入new Date()参数，返回值是日期和时间
        var date = util.formatTime(new Date());
        //通过setData更改Page()里面的data，动态更新页面的数据
        this.setData({
            testdate:date
        });
    },

    // onLaunch: function() {
    //     wx.authorize({
    //       scope: 'scope.address',
    //     })
    // },

    getUserInfo: function(e) {
        let that = this;
        let _res = [];
        wx.showLoading({
          title: '加载中...',
        })

        // 从数据库获取结果
        db.collection('userInfo').count().then(res => {
            let total = res.total;
            const batches = Math.ceil(total / MAX_LIMIT);
            let tasks = [];
            console.log(`数据库大小为:${total}, 分${batches}次取出`);
            for (let i = 0; i < batches; ++i) {
                const promise = db.collection('userInfo').skip(i*MAX_LIMIT).limit(MAX_LIMIT).get();
                tasks.push(promise);
            }
            // 等待所有数据取完
            Promise.all(tasks).then((values) => {
                console.log("取出的所有结果:",values);
                // 赋给res
                for (let i = 0; i < values.length; ++i) {
                    _res.push.apply(_res, values[i].data);
                }
                console.log("获取到结果:", _res);

                // 原处理部分
                var flag = 0;
                console.log("数据库大小"+_res.length)
                for(var i = 0; i < _res.length; i++){
                    if(that.data.account == _res[i].id) {
                        flag = 1;
                         
                        // console.log(typeof(util.AES_ECB_DECRYPT(_res[i].password, key)))
                        wx.setStorageSync('password', util.AES_ECB_DECRYPT(_res[i].password, key));
                        app.globalData['password'] = util.AES_ECB_DECRYPT(_res[i].password, key);
                        console.log("存储全局变量password",app.globalData['password']);  
                        console.log("密码：",util.AES_ECB_DECRYPT(_res[i].password, key));
                        if(util.AES_ECB_DECRYPT(_res[i].password, key) == that.data.inputPassword){
                            console.log("用户信息", _res[i]);
                            wx.setStorageSync('account', that.data.account);
                            wx.setStorageSync('isTeacher', _res[i].isTeacher);  
                            wx.setStorageSync('name', _res[i].name);
                            app.globalData.account = that.data.account;
                            app.globalData.isTeacher = _res[i].isTeacher;
                            app.globalData.loggedIn = true;
                            app.globalData.name = _res[i].name;
                            wx.showToast({
                                title: '登录成功',
                                icon:'su'
                            })
                            wx.hideLoading();
                            that.loginTouched();
                        } 
                        else{
                            wx.showToast({
                                title: '密码错误',
                                icon:"error"
                            })
                            break;
                        }
                    }
                    else {
                        console.log("no");
                        continue;
                    }
                }
                if(flag == 0) {
                    wx.showToast({
                        title: '账号不存在',
                        icon:'error'
                    })
                }
            })
        })
    },

     // 打开权限设置页提示框
    showSettingToast: function(e) {
        wx.showModal({
        title: '提示',
        confirmText: '前往设置权限',
        showCancel: false,
        content: e,
        success: function(res) {
            if (res.confirm) {
            wx.navigateTo({
                url: '../../setting/index',
            })
            }
        }
        })
    },
    
    tapDialogButton(e) {
        let index = e.detail.index;
        if (index) {
            app.globalData.loggedIn = true;
            app.chooseHomePage();
        }
    },

    accountChanged(e) {
        console.log(e.detail.value);
        let t_account = e.detail.value;
        this.setData({
            account: t_account
        })
        wx.setStorageSync('account', t_account);
    },
    
    inputPasswordChanged(e) {
        this.setData({
            inputPassword: e.detail.value
        })
        console.log("password", this.data.inputPassword);
    },

    remembermeChanged() {
        let t_rememberme = this.data.rememberme ? false : true;
        this.setData({
            rememberme: t_rememberme
        })
        app.globalData.rememberme = t_rememberme;
        console.log("global rememberme: ", app.globalData.rememberme);
        wx.setStorageSync('rememberme', t_rememberme);
    },
    
    showHelp() {
        wx.showModal({
            content: "账号为学号，默认密码为学号后四位，请登录后及时修改密码",
            showCancel: false,
            confirmColor: this.data.themeColor
        })
    },

    async loginTouched() {
        wx.setStorageSync('loggedIn', true);
        wx.reLaunch({
          url: '../../index/index',
        })
    }
})