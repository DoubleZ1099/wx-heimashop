// pages/collect/index.js
Page({
  data: {
    tabs:[
      {
        id:0,
        value:'商品收藏',
        isActive:true
      },
      {
        id:1,
        value:'品牌收藏',
        isActive:false
      },
      {
        id:2,
        value:'店铺收藏',
        isActive:false
      },
      {
        id:2,
        value:'浏览足迹',
        isActive:false
      }
    ],
    collect:[]
  },
  onLoad: function (options) {

  },
  onShow: function () {
    const collect = wx.getStorageSync('collect');
    this.setData({collect})
  },
  // 根据标题索引来激活选中 标题数组
  handleTabsItemChange(e){
    const {index} = e.detail;
    let {tabs} = this.data;
    tabs.forEach((v,i) => i===index?v.isActive=true:v.isActive=false);
    this.setData({
      tabs
    })
  }
})