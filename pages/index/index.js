// pages/loading/loading.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用(组件的属性)
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    msg: "",
  },

  /**
   * 获取用户信息接口后的处理逻辑
   */
  getUserInfo: function(e) {
    console.log(e)
    // 将获取的用户信息赋值给全局 userInfo 变量，再跳到相机页面
    if (e.detail.userInfo) {
      wx.setStorageSync('status',true)
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        msg: "AR扫描"
      })
      wx.navigateTo({
        url: '/pages/ar/ar'
      })
      // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
      wx.request({
        url: app.globalData.config.HOST_URL + '/ar/image/recognize/userInfo',
        method: 'POST',
        data: {
          encryptedData: e.detail.encryptedData, //完整用户信息密文通过getUserInfo()获取
          sessionKey: wx.getStorageSync('sessionKey'), //将本地的sessionKey取出
          iv: e.detail.iv //加密算法的初始向量
        },
        dataType: 'json',
        success: function(res) {
          console.log(res); //保存数据到后台
        }
      })
    }

  },
  /**
   * 登录获取code码
   */
  wxLogin: function() {
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {

          console.log(res)
          //发起网络请求
          wx.request({
            url: app.globalData.config.HOST_URL + '/ar/image/recognize/session',
            method: 'POST',
            data: {
              code: res.code
            },
            dataType: 'json',
            success: function(res) {
              console.log(res.data)
              //将获取到的sessionKey openId存入本地
              wx.setStorageSync('sessionKey', res.data.result.session_key)
              wx.setStorageSync('openId', res.data.result.openid)

            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
          callback(false)
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var status=wx.getStorageSync('status');
    if (status) {  
      this.setData({
        msg: "AR扫描"
      })
    }else{
      this.setData({
        msg: "请授权登录体验AR"
      })
    }
  
    this.wxLogin()
    // 在没有 open-type=getUserInfo 版本的兼容处理
    if (!this.data.canIUse) {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo

        }
      })
    }


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})