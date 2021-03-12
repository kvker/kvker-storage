const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const id = options.id
    if (id) {
      this.getDetail(id)
    }
  },

  getDetail(id) {
    wx.showLoading({
      title: '加载中...',
    })
    const Item = db.collection('Item')
    Item.doc(id).get().then(ret => {
      console.log(ret.data)
      this.setData({
        detail: ret.data,
      })
      wx.setNavigationBarTitle({
        title: ret.data.name,
      })
    }).catch(err => {
      wx.showModal({
        showCancel: false,
        content: err.message,
      })
    }).finally(_ => {
      wx.hideLoading({
        success: (res) => {},
      })
    })
  }
})