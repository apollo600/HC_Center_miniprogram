// app.js
App({
  onLaunch: function () {
    // 云服务
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      });
    }

    this.globalData = {
      isTeacher:undefined,
      loggedIn: false,
      navBarHeight: undefined, // 导航栏高度
      menuBotton: undefined, // 胶囊距底部间距（保持底部间距一致）
      menuRight: undefined, // 胶囊距右方间距（方保持左、右间距一致）
      menuHeight: undefined, // 胶囊高度（自定义内容可与胶囊高度保证一致）
      account: undefined,
      password: undefined,
      rememberme: undefined,
      themeColor: "#2669af",
      userInfo: undefined,
      d_items: [],
      hasReload: false, // 只用于告诉主页面需不需要重新加载
    }

    this.setNavBarInfo().then(
      this.load().then(
        this.chooseHomePage().then(
        //   this.getUserInfo()
        )
      )
    )
  },

  async setNavBarInfo () {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    // 胶囊按钮位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    // 导航栏高度 = 状态栏到胶囊的间距（胶囊距上距离-状态栏高度） * 2 + 胶囊高度 + 状态栏高度
    wx.setStorageSync('navBarHeight', (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight);
    wx.setStorageSync('menuBotton', menuButtonInfo.top - systemInfo.statusBarHeight);
    wx.setStorageSync('menuRight', systemInfo.screenWidth - menuButtonInfo.right);
    wx.setStorageSync('menuHeight', menuButtonInfo.height);
  },

  async load() {
      let that = this;
    let data = that.globalData;
    for (let i in data) {
      if (data[i] === undefined) {
        data[i] = wx.getStorageSync(i);
        console.log("--init--", "从缓存获取数据", i, data[i])
      }
    }
    if (data['rememberme'] === true) {
        console.log("自动加载成功");
        data['loggedIn'] = true;
    } else {
        data['loggedIn'] = false;
    }
  },

  // 判断是否需要登录
  async chooseHomePage() {
    console.log('loggedIn', this.globalData.loggedIn)
    if (this.globalData.loggedIn == true) {
    //   wx.navigateTo({
    //     url: '/pages/login/index/index',
    //   })
        wx.switchTab({
          url: '/pages/index/index',
        })
    }
  },

  async getUserInfo() {
    let that = this;
    wx.getUserInfo({
      success(res) {
        console.log("获取用户信息成功", res)
        wx.setStorageSync('userInfo', res.userInfo)
        that.globalData.userInfo = res.userInfo
        console.log(that.globalData);
      }
    })
  }
  
});
