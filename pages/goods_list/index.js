import { request } from "../../request/index.js";
Page({
  data: {
    tabs:[
      {
        id:0,
        value:'综合',
        isActive:true
      },
      {
        id:1,
        value:'销量',
        isActive:false
      },
      {
        id:2,
        value:'价格',
        isActive:false
      }
    ],
    goodsList:[]
  },
  // 接口要的参数
  QueryParams:{
    query:"",
    cid:"",
    pagenum:1,
    pagesize:10
  },
  totalPages:1,
  onLoad: function (options) {
    this.QueryParams.cid = options.cid||"";
    this.QueryParams.query = options.query||"";
    this.getGoodsList();
  },
  // 获取商品列表数据
  getGoodsList(){
    request({url:'/goods/search',data:this.QueryParams})
    .then(result=>{
      const total = result.data.message.total;
      this.totalPages = Math.ceil(total/this.QueryParams.pagesize);
      this.setData({
        // 拼接数组
        goodsList:[...this.data.goodsList,...result.data.message.goods]
      })
      // 关闭下拉刷新的窗口
      wx.stopPullDownRefresh();
    })
  },
  handleTabsItemChange(e){
    const {index} = e.detail;
    let {tabs} = this.data;
    tabs.forEach((v,i) => i===index?v.isActive=true:v.isActive=false);
    this.setData({
      tabs
    })
  },
  // 下拉加载
  onReachBottom: function () {
    if(this.QueryParams.pagenum>=this.totalPages){
      wx.showToast({ title: '没有下一页数据' });
    }else{
      this.QueryParams.pagenum++;
      this.getGoodsList();
    }
  },
  // 上拉刷新
  onPullDownRefresh: function(){
    this.QueryParams.pagenum = 1;
    this.setData({
      goodsList:[]
    });
    this.getGoodsList();
  }
})