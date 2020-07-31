/**防抖 定时器 节流
 * 0 防抖 一般用在输入框中 防止重复输入
 * 1 节流 一般用在页面上拉和下拉
 * 2 定义全局的定时器id
 *  */ 
import { request } from "../../request/index.js";
Page({
  data: {
    goods:[],
    isFocus:false,
    inpValue:''
  },
  TimeId:-1,
  onLoad: function (options) {

  },
  onShow: function () {

  },
  handleInput(e){
    const {value} = e.detail;
    if(!value.trim()){
      this.setData({
        goods:[],
        isFocus:false
      })
      return;
    }
    this.setData({
      isFocus:true
    })
    clearTimeout(this.TimeId);
    this.TimeId = setTimeout(()=>{
      request({url:'/goods/qsearch',data:{query:value}}).then(res=>{
        this.setData({
          goods:res.data.message,
        })
      });
    },1000);
  },
  handleCancel(){
    this.setData({
      goods:[],
      isFocus:false,
      inpValue:''
    })
  }
})