const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    count: null,
    price: null,
    remind: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  clickSubmit(e) {
    const { name, count, price, remind } = this.data
    if (!name) {
      wx.showModal({
        content: '请输入名称',
        showCancel: false,
      })
      return
    } else if (!count) {
      wx.showModal({
        content: '请输入数量',
        showCancel: false,
      })
      return
    }
    // 两个小数点报错
    if (String(price).match(/\d*\.\d*\..*/)) {
      wx.showModal({
        content: '请输入正确价格',
        showCancel: false,
      })
      return
    }
    const turePrice = ~~(Number((+price).toFixed(2)) * 100)
    console.log({ turePrice })
    if (!turePrice && turePrice !== 0) {
      wx.showModal({
        content: '请输入单价',
        showCancel: false,
      })
      return
    }
    wx.showLoading({
      title: '处理中...',
    })
    const Item = db.collection('Item')
    const currentTime = new Date().getTime()
    Item.add({
      data: {
        name,
        remind,
        price: turePrice,
        count,
        createTime: currentTime,
        updateTime: currentTime,
      },
      success: ret => {
        console.log(ret)
      },
      fail: err => {

      },
      complete: _ => {
        wx.hideLoading({
          success: (res) => { },
        })
      }
    })
  }
})