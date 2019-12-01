// pages/detail/detail.js
const app = getApp()
const amapFile = require('../../libs/amap-wx.js');//导入小程序组件 高德地图API
Page({

  /**
   * 页面的初始数据
   */
  data: {
    OpenId: '',
    content: '',
    videoUrl: '',      //视频路径
    videoScreenPath: '',//视频的第一帧图片路径
    imageUrl: '',      //图片路径
    content1: '',
    content2: '',
    isShow:false //元素是否显示

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData.arResult)
    let arResult = app.globalData.arResult
    console.log(arResult);
    // this.videoUrl = arResult.videoUrl
    this.setData({
      'videoUrl': arResult.videoUrl,
      'imageUrl': arResult.imageUrl,
      'content1': arResult.description,
      'videoScreenPath': arResult.videoScreenPath
    })
    this.checkString(arResult.description)
    let that = this;
    //获取地理位置
    const myAmapFun = new amapFile.AMapWX({ key: '586e28bf43934a1ee0ba9a2c3d623fee' });
    myAmapFun.getRegeo({
      success: function (data) {
        console.log(data)
        //成功回调
        let address = data[0].regeocodeData.addressComponent;
        var country = data[0].regeocodeData.addressComponent.country //国家
        var province = data[0].regeocodeData.addressComponent.province //省
        var city = data[0].regeocodeData.addressComponent.city  //市
        var _district = data[0].regeocodeData.addressComponent.district //区
        var _township = data[0].regeocodeData.addressComponent.township //街
        var district//区

        if (_district.length > 0) {
          district = _district[0]
        } else {
          district = _township
        }

        //获取openId
        var openId = wx.getStorageSync('openId');
        console.log(openId)

        //判断城市
        wx.request({
          url: app.globalData.config.HOST_URL + '/ar/image/recognize/saveLocation',
          method: 'POST',
          data: {
            openId: openId,
            province: province,
            city: city,
            district: district,
            country: country
          },
          success: function (res) {
            console.log(res)  //位置保存成功
            if(res.data.code===200){
              that.setData({
                isShow: true,
              })
            }      
          }
        })
      },
      fail: function (info) {
        //失败回调
        console.log(info)
      }
    })

  },
  //授权获取用户手机号码
  getPhoneNumber: function (e) {
    let that = this;
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      wx.request({
        url: app.globalData.config.HOST_URL + '/ar/image/recognize/getPhoneNumber',
        data: {
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          sessionKey: wx.getStorageSync('sessionKey'),
          openId: wx.getStorageSync("openId")
        },
        method: "post",
        success: function (res) {
          console.log(res);
          that.setData({
            isShow: false,
          })
        }
      })
    }
  },
  checkString(str) {
    if (str.length > 20) {
      this.setData({
        'content1': str.substring(0, 20),
        'content2': str.substring(20)
      })
    } else {
      this.setData({
        'content1': str.substring(0, 20),
        'content2': ""
      })
    }
  },
  // 详情页面底布重新扫描跳转
  home: function () {
    wx.navigateTo({
      url: '../ar/ar',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})