const util = require('../../utils/util.js')
const app = getApp();
const db = wx.cloud.database();
var key = "KUf4hM5rThssysJhcRFCfxLR8Imihjl0eMsyhh1M7Wk";


Page ({
    data: {
        back: false,
        navBarHeight: app.globalData.navBarHeight,
        id:"",
        identity:"",
        faceUrl: "",
        rememberme: undefined
    },

    onLoad() {
        let that = this;
        var status = app.globalData['isTeacher']?"老师":"学生";
        var face = wx.getStorageSync('face') || "https://636c-cloud1-1gb1yapbda6aac93-1306747047.tcb.qcloud.la/face.svg?sign=adb5ceecb1b4754948dbdb3a97503326&t=1652531261";
        that.setData({
            id: app.globalData.account,
            identity: status,
            faceUrl: face,
            rememberme: app.globalData['rememberme']
        }, () => {
            console.log("rememberme: ", that.data.rememberme);
            return;
        })
    },

    logOut: function () {
      wx.clearStorageSync()
      wx.redirectTo({
        url: '../login/index/index',
      })
    },

      postInfo:function(){
        wx.navigateTo({
          url: '../manager/manager',
        })
      },

      checkSignedEvents:function(){
        wx.navigateTo({
          url: 'checkSignedEvents/checkSignedEvents',
        })
      },

      clearCache:function(){
          wx.clearStorageSync();
          wx.showToast({
            title: '缓存已全部清除',
            icon:'none',
            time: 1000
          })
      },

      cancelAutomaticLogin:function(){
            let t_rememberme = !this.data.rememberme;
            wx.setStorageSync('rememberme', t_rememberme);
            app.globalData.rememberme = t_rememberme;
            this.setData({
                rememberme: t_rememberme
            })
      },

      changePwd:function(){
        wx.navigateTo({
          url: 'changePwd/changePwd',
        })
      },

      changeFace:function(){
        var that = this;
        wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                  var imgPaths = res.tempFilePaths;
                  console.log(imgPaths);
                  that.setData({
                      faceUrl: imgPaths[0]
                  })
          that.updateFaceService(imgPaths[0]);
			}
		  })
      },

      updateFaceService(imgPath) {
        var that = this;
        wx.setStorageSync('face', imgPath);   
    },

    previewFace() {
        const that = this;
        console.log([that.data.faceUrl]);
        wx.previewImage({
          urls: [that.data.faceUrl],
        })
    }

    
   

})