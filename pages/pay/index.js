/**
 * 1 页面加载的时候
 *    1 从缓存中获取购物车数据 渲染到页面中
 *      这些数据 checked = true
 * 2 微信支付
 *    1 哪些人 哪些账号 可以实现微信支付
 *    2 企业账号的小程序后台中 必须给开发者 添加上白名单
 *      1 一个appid 可以同时绑定多个开发者
 *      2 这些开发就可以共用这个appid 和 它的开发权限
 * 3 支付按钮
 *    1 先判断缓存中有没有token
 *    2 没有 跳转到授权页面 进而获取token
 *    3 有token。。。
 *    4 创建订单 获取订单编号
 *    5 已经完成了微信支付
 *    6 手动删除缓存中 已经被选中了的商品
 *    7 删除后的购物车数据 填充回缓存
 *    8 再跳转页面
 */
import { requestPayment } from "../../utils/asyncWX.js";
import { request } from "../../request/index.js";
Page({
  data:{
    address:{},
    cart:[],
    totalPrice:0,
    totalNum:0
  },
  onShow(){
    // 1 获取缓存中的收获地址信息
    const address = wx.getStorageSync("address");
    let cart = wx.getStorageSync("cart")||[];
    cart = cart.filter(v=>v.checked);
    let totalPrice = 0;
    let totalNum = 0;
    cart.forEach(element => {
      totalPrice += element.num*element.goods_price;
      totalNum += element.num;
    });
    this.setData({
      cart,
      totalPrice,
      totalNum,
      address
    });
  },
  handleOrderPay(){
    // 1 判断缓存中有没有token
    const token = wx.getStorageSync("token");
    if(!token){
      wx.navigateTo({
        url: '/pages/auth/index'
      });
      return;
    }
    console.log('已经存在token')
    // 3 创建订单
    // 3.1 准备 请求头参数
    const header = {Authorization:token};
    // 3.2 准备 请求体参数
    const order_price = this.data.totalPrice;
    const consignee_addr = this.data.address.all;
    const cart = this.data.cart;
    let goods = [];
    cart.forEach(v=>goods.push({
      goods_id:v.goods_id,
      goods_number:v.goods_number,
      goods_price:v.goods_price
    }))
    const orderParams = {order_price,consignee_addr,goods};
    request({url:'/my/orders/create',data:orderParams,header})
    .then(result=>{
      const {order_number} = result;
      request({url:'/my/orders/req_unifiedorder',data:{order_number},header,method:"POST"})
      .then(result=>{
        console.log(result);
        requestPayment(result).then(result1=>{
          console.log(result1);
        });
      });
    });
    request({url:'/my/orders/chkOrder',data:{order_number},method:"POST"})
    .then(result=>{
      showToast({title:"支付成功"}).then(result=>{});
      wx.navigateTo({
        url: '/pages/order/index'
      });
    });
    // 8 手动删除缓存中 已经支付了的商品
    let newCart = wx.getStorageSync("cart");
    newCart = newCart.filter(v=!v.checked);
    wx.setStorageSync("cart", newCart);
    wx.navigateTo({
      url: '/pages/order/index'
    });
      
  }
})
