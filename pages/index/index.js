//index.js
//获取应用实例
const app = getApp()
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
var qqmapsdk
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    address: {},
    hasLocation: false,
    city: '北京市',
    longitude: '',
    latitude: '',
    indicatorDots: true,
    autoplay: true,
    circular: true,
    current: 0,
    interval: 3000,
    duration: 500,
    imgUrls: [],
    // 导航
    navArry: []
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  // 加载
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    // 使用sdk
    qqmapsdk = new QQMapWX({
      key: 'XYBBZ-RQXWU-2OEVP-2IAYT-LJXL6-XBBYG'
    })
  },
  onShow: function () {
    let vm = this
    vm.getUserLocation()
    // 加载轮播图
    vm.bannerImg()
    // 加载nav
    vm.navArry()
  },
  // 获取授权
  getUserLocation: function () {
    let vm = this;
    wx.getSetting({
      success: (res) => {
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面  
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权  
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权  
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function (res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API  
                      vm.getLocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //调用wx.getLocation的API  
          vm.getLocation();
        }
        else {
          //调用wx.getLocation的API  
          vm.getLocation();
        }
      }
    })
  },
  getUserInfo: function(e) {
    // console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 微信获得经纬度
  getLocation: function () {
    let vm = this
    wx.getLocation({
      type: 'wgs84',
      altitude: true,
      success: function(res) {
        // console.log(JSON.stringify(res))
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
        vm.getLocal(latitude,longitude)
      },
      fail: function(res) {
        // console.log('fail' + JSON.stringify(res)) 
      },
      complete: function(res) {},
    })
  },
  // 获取当前地理位置
  getLocal: function (latitude, longitude) {
    let vm = this
    qqmapsdk.reverseGeocoder({
      locationL: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        // console.log(JSON.stringify(res));
        let province = res.result.ad_info.province
        let city = res.result.ad_info.city
        vm.setData({
          province: province,
          city: city,
          latitude: latitude,
          longitude: longitude 
        })
      },
      fail: function (res) {
        // console.log(res);
      },
      complete: function (res) {
        // console.log(res);  
      } 
    })
  },
  // 轮播图
  bannerImg: function() {
    let vm = this
    wx.request({
      url: 'http://localhost:8888/banner',
      data: '',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        var imgs = res.data
        for (var i = 0; i < imgs.length; i++) {
          imgs[i] = 'http://localhost:8888/images/index/' + imgs[i].i_url
        }
        vm.setData({
          imgUrls: imgs
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  // 加载nav
  navArry: function () {
    let vm = this
    wx.request({
      url: 'http://localhost:8888/navArry',
      data: '',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        console.log(res.data)
        vm.setData({
          navArry: res.data
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  }
})
