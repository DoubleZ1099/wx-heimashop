/**
 * 1 获取用户的收货地址
 *    1 绑定点击事件
 *    2 调用小程序内置 api 获取用户的收货地址 wx.chooseAddress
 *    3 获取用户对小程序所授予获取地址的权限状态 scope
 *      1 假设用户点击获取收获地址的提示框 确定 authSetting scope.address
 *        scope = true 直接调用 获取收获地址
 *      2 假设用户从来没有调用过收货地址的api
 *        scope = undefined 直接调用 获取收获地址
 *      3 假设用户点击获取收获地址的提示框 取消
 *        scope = false
 *        1 诱导用户自己打开授权设置页面（wx.openSetting），当用户重新给与获取地址权限的时候
 *        2 获取收货地址
 *      4 把获取到的收货地址 存入到 本地存储中
 * 2 页面加载完毕
 *    1 获取本地存储中的地址数据
 *    2 把数据 设置给data中的一个变量
 * 3 onShow
 *    1 获取缓存中的购物车数组
 *    2 把购物车数据 填充到data中
 * 4 全选的实现 数据的展示
 *    1 onShow 获取缓存中的购物车数组
 *    2 根据购物车中的商品数据 所有的商品都被选中 checked=true 全选就被选中
 * 5 总价格和总数量
 *    1 都需要商品被选中 我们才拿它来计算
 *    2 获取购物车数组
 *    3 遍历
 *    4 判断商品是否被选中
 *    5 总价格 += 商品的单价 * 商品的数量
 *    6 总数量 += 商品的数量
 *    7 把计算后的价格和数量 设置回data中即可
 * 6 商品的选中
 *    1 绑定change事件
 *    2 获取到被修改的商品对象
 *    3 商品对象的选中状态取反
 *    4 重新填充回data中和缓存中
 *    5 重新计算全选 总价格、总数量等
 * 7 全选和反选
 *    1 全选复选框绑定事件 change
 *    2 获取data中的全选变量 allChecked
 *    3 直接取反 allChecked = !allChecked
 *    4 遍历购物车数组 让里面商品选中状态跟随 allChecked 改变而改变
 *    5 把购物车数组 和 allChecked 重新设置回data把购物车重新设置回缓存中
 * 8 商品数量的编辑
 *    1 "+","-"按钮，绑定同一个点击事件 区分的关键 自定义属性
 *    2 传递被点击的商品id goods_id
 *    3 获取data中的购物车数组 来获取需要被修改的商品对象
 *    4 直接修改商品对象中的数量
 *    5 把cart数组重新设置回缓存中和data中
 * 9 点击结算
 *    1 判断有没有收货地址信息
 *    2 判断用户有没有选购商品
 *    3 经过以上的验证 跳转到 支付页面
 */
import { getSetting,chooseAddress,openSetting,showModal,showToast } from "../../utils/asyncWX.js";
Page({
  data:{
    address:{},
    cart:[],
    allChecked: false,
    totalPrice:0,
    totalNum:0
  },
  onShow(){
    // 1 获取缓存中的收获地址信息
    const address = wx.getStorageSync("address");
    const cart = wx.getStorageSync("cart")||[];
    // 计算全选
    // every 数组方法 会遍历 会接收一个回调函数 如果每一个回调函数都返回true，那么every方法的返回值为true
    // 只要 有一个回调函数返回了false 那么就不再循环执行，直接返回false
    // 空数组 调用every，返回值就是true
    // const allChecked = cart.length?cart.every(v=>v.checked):false;
    this.setData({ address });
    this.setCart(cart);
  },
  // 点击收货地址
  handleChooseAddress(){
    // 1 获取权限状态
    getSetting().then(result=>{
      const scopeAddress = result.authSetting["scope.address"];
      // 2 判断权限状态
      if(scopeAddress===true||scopeAddress===undefined){
        chooseAddress().then(result1=>{
          result1.all = result1.provinceName+result1.cityName+result1.countyName+result1.detailInfo;
          wx.setStorageSync("address", result1);
        })
      }else{
        openSetting().then(result2=>{
          chooseAddress().then(result3=>{
            result3.all = result3.provinceName+result3.cityName+result3.countyName+result3.detailInfo;
            wx.setStorageSync("address", result3);
          })
        })
      }
    })
    // wx.getSetting({
    //   success: (result) => {
    //     // 2 获取权限状态 主要发现一些属性名很怪异的时候，都要使用[]形式来获取属性值
    //     const scopeAddress = result.authSetting["scope.address"];
    //     if(scopeAddress===true||scopeAddress===undefined){
    //       wx.chooseAddress({
    //         success: (result1) => {
    //           console.log(result1)
    //         }
    //       });
    //     }else{
    //       // 3 用户以前拒绝过授予权限，先诱导用户打开授权页面
    //       wx.openSetting({
    //         success: (result2) => {
    //           // 4 可以调用获取收货地址代码
    //           wx.chooseAddress({
    //             success: (result3) => {
    //               console.log(result3)
    //             }
    //           });
    //         }
    //       });
            
    //     }
    //   }
    // });
  },
  handeItemChange(e){
    const goods_id = e.currentTarget.dataset.id;
    let {cart} = this.data;
    let index = cart.findIndex(v=>v.goods_id===goods_id);
    cart[index].checked = !cart[index].checked;
    this.setCart(cart);
  },
  setCart(cart){
    let allChecked = true;
    let totalPrice = 0;
    let totalNum = 0;
    cart.forEach(element => {
      if(element.checked){
        totalPrice += element.num*element.goods_price;
        totalNum += element.num;
      }else{
        allChecked = false;
      }
    });
    allChecked = cart.length!=0?allChecked:false;
    this.setData({
      cart,
      allChecked,
      totalPrice,
      totalNum
    });
    wx.setStorageSync("cart", cart);
  },
  handleItemAllCheck(){
    let {cart,allChecked} = this.data;
    allChecked = !allChecked;
    cart.forEach(element => {
      element.checked = allChecked;
    });
    this.setCart(cart);
  },
  handItemNumEdit(e){
    const {operation,id} = e.currentTarget.dataset;
    let {cart} = this.data;
    const index = cart.findIndex(v=>v.goods_id===id);
    if(cart[index].num===1&&operation===-1){
      showModal({content:'您是否要删除'}).then(result=>{
        if (result.confirm) {
          cart.splice(index,1);
          this.setCart(cart);
        }else if(result.cancel){
          console.log('用户点击取消')
        }
      });
    }else{
      cart[index].num += operation;
      this.setCart(cart);
    }
  },
  handlePay(){
    const {address,totalNum} = this.data;
    if(!address.userName){
      showToast({title:"您还没有选择收货地址"}).then(result=>{});
      return;
    }
    if(totalNum===0){
      showToast({title:"您还没有选购商品"}).then(result=>{});
      return;
    }
    wx.navigateTo({
      url: '/pages/pay/index'
    });
  }
})
