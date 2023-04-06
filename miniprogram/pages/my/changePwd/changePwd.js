const util = require('../../../utils/util.js');
const app = getApp();
const db = wx.cloud.database();
var key = "KUf4hM5rThssysJhcRFCfxLR8Imihjl0eMsyhh1M7Wk";

Page({
    data: {
        themeColor: app.globalData.themeColor,
        navBarHeight: app.globalData.navBarHeight,
        back: true,
        inputOldPwd:"",
        inputNewPwd:"",
        inputCheckPwd:""
    },

    // clear:function(){
    //     var obj=document.getElementById("input");
    //     obj.setAttribute("value","");
    // },

    back() {
        wx.navigateBack({
          delta: 1,
        })
    },

    checkPwd() {
        console.log("检查密码");
        let that = this;       

        for (let i in app.globalData) {
            console.log("--check--", "全局变量", i, app.globalData[i])
        }
            
        if (that.data.inputOldPwd == '' || that.data.inputNewPwd == '' || that.data.inputCheckPwd== '') {
            wx.showToast({
                title: '输入不能为空',
                icon:'error'
            });
        } else if (that.data.inputOldPwd != app.globalData['password']) {
            console.log("输入旧密码",that.data.inputOldPwd,"全局变量密码",app.globalData['password'])
            wx.showToast({
                title: '旧密码输入错误',
                icon:'error'
            });
            return;
        } else if (that.data.inputNewPwd != that.data.inputCheckPwd){
            wx.showToast({
                title: '两次输入不一致',
                icon:'error'
              });
            return;
        } else {
            wx.showLoading({
              title: '更新密码中...',
            })
            try {
                console.log("更新数据");
                wx.cloud.callFunction({
                    name: "update",
                    data: {
                        collection_name:"userInfo",
                        condition: {
                            id: parseInt(app.globalData.account)
                        },
                        udata: {
                            password: util.AES_ECB_ENCRYPT(that.data.inputNewPwd, key)
                        },
                    },
                    success: function() {
                        wx.hideLoading({
                          success: (res) => {
                              wx.showModal({
                                  content: '修改密码成功，请重新登录',
                                  showCancel: false,
                                  success: function() {
                                    wx.redirectTo({
                                        url: '../../login/index/index',
                                    })
                                }
                              })
                          },
                        })
                        
                    }
                })
            }
            catch (err) {
                console.error(err)
            } 
        }
    },
    inputOldPwdChanged(e) {
        this.setData({
            inputOldPwd: e.detail.value
        })
    },
    inputNewPwdChanged(e) {
        this.setData({
            inputNewPwd: e.detail.value
        })
    },
    inputCheckPwdChanged(e) {
        this.setData({
            inputCheckPwd: e.detail.value
        })
    },
    back(){
        wx.switchTab({
          url: '../my',
        })
    },  
    
    clearOldPwd(){
       this.setData(
           {
               inputOldPwd:""
           }
       )
    },
    clearNewPwd(){
        this.setData(
            {
                inputNewPwd:""
            }
        )
    },
    clearCheckPwd(){
        this.setData(
            {
                inputCheckPwd:""
            }
        )
    }
})

