import { request } from "../../request/index.js";
Page({
  data: {
    goodsObj:{},
    // 商品是否被收藏
    isCollect: false
  },
  GoodsInfo:[],
  onShow: function () {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length-1];
    let options = currentPage.options;
    const {goods_id} = options;
    this.getGoodsDetail(goods_id);
  },
  getGoodsDetail(goods_id){
    request({url:'/goods/detail',data:{goods_id}})
    .then(result=>{
      this.GoodsInfo = result.data.message;
      // 1 获取缓存中的商品收藏的数组
      let collect = wx.getStorageSync('collect')||[];
      // 2 判断当前商品是否被收藏
      let isCollect = collect.some(v=>v.goods_id===this.GoodsInfo.goods_id);
      this.setData({
        goodsObj:{
          goods_name:result.data.message.goods_name,
          goods_price:result.data.message.goods_price,
          goods_introduce:result.data.message.goods_introduce.replace(/\.webp/g,'.jpg'),
          pics:result.data.message.pics,
        },
        isCollect
      });
    })
  },
  // 点击轮播图放大预览
  handlePrevewImage(e){
    // 先构造要预览的图片数组
    const urls = this.GoodsInfo.pics.map(v=>v.pics_mid);
    const current = e.currentTarget.dataset.url;
    wx.previewImage({
      current,
      urls
    });
  },
  // 点击加入购物车
  handleCartAdd(){
    // 1 获取缓存中的购物车数组
    let cart  = wx.getStorageSync("cart")||[];
    // 2 判断商品对象是否存在于购物车数组中
    let index = cart.findIndex(v=>v.goods_id===this.GoodsInfo.goods_id);
    if(index===-1){
      // 3 不存在 第一次添加
      this.GoodsInfo.num = 1;
      this.GoodsInfo.checked = true;
      cart.push(this.GoodsInfo);
    }else{
      // 4 已经存在
      cart[index].num++;
    }
    // 5 把购物车重新添加回缓存中
    wx.setStorageSync("cart", cart);
    // 6 弹窗提示
    wx.showToast({
      title: '加入成功',
      icon: 'success',
      // true 防止用户手抖 疯狂点按钮
      mask: true
    });
  },
  handleCollect(){
    let isCollect = false;
    let collect = wx.getStorageSync('collect')||[];
    let index = collect.findIndex(v=>v.goods_id===this.GoodsInfo.goods_id);
    if(index!==-1){
      collect.splice(index,1);
      isCollect=false;
      wx.showToast({
        title: '取消成功',
        icon: 'success',
        mask: true
      });
    }else{
      collect.push(this.GoodsInfo);
      isCollect = true;
      wx.showToast({
        title: '收藏成功',
        icon: 'success',
        mask: true
      });
    }
    wx.setStorageSync("collect", collect);
    this.setData({isCollect})
  }
})