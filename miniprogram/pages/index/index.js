const app = getApp()
const db = wx.cloud.database()
let page = 0, nomore = false

Page({
  data: {
    userInfo: JSON.parse(wx.getStorageSync('userInfo') || null),
    list: [],
  },

  onLoad() {
    wx.showLoading({
      title: '刷新中...',
    })
    this.getList()
  },

  onPullDownRefresh() {
    page = 0
    this.setData({
      list: [],
    })
    nomore = false
    this.getList()
  },

  onReachBottom() {
    this.getList()
  },

  getList() {
    if (nomore) return
    const Item = db.collection('Item')
    Item.where({
      _openid: app.globalData.openid
    }).skip(page * 20).limit(20).orderBy('updateTime', 'desc').get().then(ret => {
      console.log(ret.data)
      this.setData({
        list: [...this.data.list, ...ret.data],
      })
      // console.log(this.data.list)
      if (ret.data.length) {
        page++
      } else {
        nomore = true
      }
      wx.stopPullDownRefresh({
        success: (res) => { },
      })
    }).catch(err => {
      wx.showModal({
        showCancel: false,
        content: err.message,
      })
    }).finally(_ => {
      wx.hideLoading({
        success: (res) => { },
      })
    })
  },

  /**
   * 委托
   * @param {event} e 点击事件
   */
  clickHandle(e) {
    const { name, idx } = e.target.dataset
    // console.log({ name, idx })
    const item = this.data.list[idx]
    const Item = db.collection('Item')
    if (name === 'delete') {
      wx.showModal({
        title: '提示',
        content: '确定删除吗？',
        success: ret => {
          if (ret.confirm) {
            wx.showLoading({
              title: '删除中...',
            })
            Item.doc(item._id).remove().then(ret => {
              console.log(ret)
              this.data.list.splice(idx, 1)
              this.setData({
                list: this.data.list,
              })
            }).catch(err => {
              wx.showModal({
                showCancel: false,
                content: err.message,
              })
            }).finally(_ => {
              wx.hideLoading({
                success: (res) => { },
              })
            })
          }
        }
      })
    } else if(name === 'detail') {
      wx.navigateTo({
        url: '/pages/detail/detail?id=' + item._id,
      })
    }
  },

  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
        })
        console.log(this.data.userInfo)
        // 调用云函数，获取openid
        wx.cloud.callFunction({
          name: 'login',
          success: res => {
            console.log('[云函数] [login] user openid: ', res.result.openid)
            app.globalData.openid = res.result.openid
            wx.setStorageSync('openid', res.result.openid)
            // 放在后面确保保存openid成功
            wx.setStorageSync('userInfo', JSON.stringify(this.data.userInfo))
            wx.showToast({
              title: '登录成功',
            })
          },
          fail: err => {
            console.error('[云函数] [login] 调用失败\n', err)
            wx.navigateTo({
              url: '../deployFunctions/deployFunctions',
            })
          },
          complete: _ => {
            wx.hideLoading({
              success: (res) => { },
            })
          }
        })
      }
    })
  },
})
