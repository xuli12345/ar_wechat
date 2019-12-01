// index.js
const app = getApp()
Page({
  data: {
    height: '360',
    width: '40',
    status: false, //拍摄照片的状态
    scanStatus: 'none',
    msg: "请对准需要识别的目标",
    src: '',
    setInter: '',
    vm: '',
    errorMsg:''//type中返回的错误信息
  },

  onLoad: function(options) {
    console.log("触发了监听页面加载的函数")
    this.ctx = wx.createCameraContext();
    this.vm = this
    wx.getSystemInfo({ //获取系统信息
      success: res => {
        //可使用窗口宽度,高度.单位px
        this.setData({
          height: res.windowHeight * 0.8,
          width: res.windowWidth
        });
      }
    });
    this.showCostDetailFun()
  },

  showCostDetailFun() {
    //创建动画实例
    var animation = wx.createAnimation({
      duration: 2000,
      timingFunction: "linear", //动画的效果
      delay: 0,
      transformOrigin: "50% 50%", //旋转时的原点，默认是元素中心
    })
    var next = true;
    //连续动画关键步骤
    setInterval(function() {
      if (next) {
        animation.translate(0, 400).step();
        next = !next;
      } else {
        animation.translate(0, 0).step();
        next = !next;
      }

      //导出动画数据传递给组件的animation属性。
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 2000)
  },
  stopScan: function() {
    this.setData({
      scanStatus: 'none'
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.status=false;
    console.log("监听页面隐藏")
  },

  /**
 * 生命周期函数--监听页面初次渲染完成
 */
  onReady: function () {
    // console.log("监听页面初次渲染完成")
  },

  /*
   *
   * 监听页面显示
   */
  onShow: function() {
    this.setData({
      msg: '识别中',
    });
    var that = this;
    //将计时器赋值给setInter
    that.data.setInter = setInterval(function() {
      console.log(11111)
      that.takePhoto()
    }, 2000);
  },

  error: function(e) {
    this.setData({
      msg: '打开摄像头失败，请点击“立即体验'
    });
  },


  urlTobase64(imgPath) {
    let that = this;
    console.log(imgPath)
    wx.getFileSystemManager().readFile({ //获取全局唯一的文件管理器读取本地文件内容
      filePath: imgPath, //选择图片返回的相对路径
      encoding: 'base64', //编码格式
      success: res => { //成功的回调
        console.log('data:image/png;base64,' + res.data)
        let imageBase64 = 'data:image/png;base64,' + res.data
        that.searchPhotp(imageBase64)

      }
    })
  },

  //后台验证接口
  searchPhotp: function(imageBase64) {
    let that = this;
    wx.request({
      url: app.globalData.config.HOST_URL + '/ar/image/recognize/recognize',
      data: {
        openId: wx.getStorageSync('openId'),
        image: imageBase64,
      },
      method: 'POST',
      success(res) {
        console.log(res)
        if (res.data.code == 200) {
          that.status = true;
          that.setData({
            msg: '识别成功'
          });
         
          app.globalData.arResult = res.data.result
          clearInterval(that.data.setInter)
          if (res.data.result.type == "3d") {
            console.log("three3d");
            wx.navigateTo({
              url: '/pages/three3d/three3d'
            })
          } else if (res.data.result.type == "video") {
            console.log("video");
            wx.navigateTo({
              url: '/pages/detail/detail'
            })
          } else if (res.data.result.type == "h5") {
            console.log("h5");
            wx.navigateTo({
              url: '/pages/activity/activity'
            })
          } else if (res.data.result.type == "error") {
            console.log("error");
            wx.navigateTo({
              url: '/pages/error/error'
            });
            that.setData({
              errorMsg: '出错啦!'
            });
          }else {
            that.setData({
              msg: '跳转有异常'
            });
          }


        } else if (res.data.code == 10001){
          console.log("10001重复扫描")
        } else {
          that.status = false;
          that.setData({
            // msg: '识别失败' + res.data.code+ ":" +res.data.message
            msg: '识别失败'
          });
        }

      },
      fail(err) {
        console.log(err)
        that.status = false;
        clearInterval(that.data.setInter)
        that.setData({
          // msg: '识别失败，请返回重试' + err
          msg: '识别失败，请返回重试'
        });
      }
    })
  },

  takePhoto: function(e) { //拍摄照片
    if (this.status) return;
    // this.status = true;
    let vm = this
    wx.getSetting({
      success(res) {
        console.log(res)
        if (res.authSetting['scope.camera']) {

          vm.ctx.takePhoto({
            //成像质量(low低质量)
            quality: 'low',
            success: result => {
              console.log(result)
              vm.setData({
                msg: '识别中...'
              });
              //temImagePath 照片文件的临时路径,andriod为jpg图片格式,ios是png格式
              vm.urlTobase64(result.tempImagePath);
            },
            fail: err => {
              vm.stopScan();
              console.log(err)
              vm.setData({
                msg: '未识别到目标'
              });
            }
          });
        }
      }
    })
  },
  //监听页面卸载
  onUnload: function() {
    var that = this;
    //清除计时器  即清除setInter
    clearInterval(that.data.setInter)
  },
})