//app.js
const config = require('./config/config.js');
const util = require('./utils/util.js')
App({
  onLaunch: function () {
    //console.log(config.mode); 获取小程序当前的环境
    if (config.mode === 'development') {
      this.globalData.config = config.development;
    } else if (config.mode === 'production') {
      this.globalData.config = config.production;
    }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        // console.log(res); 用户是否授权
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          // 可以将 res 发送给后台解码出 unionId
          this.globalData.userInfo = res.userInfo

          // 由于 getUserInfo 是网络(异步)请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况 此回调可以及时的刷新数据
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(res)
          }
          // wx.navigateTo({
          //   url: '/pages/ar/ar'
          // })
        } else {

        }
      }
    })
  },
  globalData: {
    userInfo: null,
    config: null,
    arResult: null
  }
})