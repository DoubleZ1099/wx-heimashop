// pages/feedback/index.js
Page({
  data: {
    tabs:[
      {
        id:0,
        value:'体验问题',
        isActive:true
      },
      {
        id:1,
        value:'商品、商家投诉',
        isActive:false
      }
    ],
    chooseImg:[],
    textVal:''
  },
  // 外网的图片的路径数组
  UpLoadImgs:[],
  onLoad: function (options) {

  },
  onShow: function () {

  },
  // 根据标题索引来激活选中 标题数组
  handleTabsItemChange(e){
    const {index} = e.detail;
    let {tabs} = this.data;
    tabs.forEach((v,i) => i===index?v.isActive=true:v.isActive=false);
    this.setData({
      tabs
    })
  },
  // 点击 “+” 选择图片
  handleChooseImg(){
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        this.setData({
          // 图片数组 进行拼接
          chooseImg:[...this.data.chooseImg,...result.tempFilePaths]
        })
      }
    });
  },
  handleRemoveImg(e){
    const {index} = e.currentTarget.dataset;
    let {chooseImg} = this.data;
    chooseImg.splice(index,1);
    this.setData({chooseImg})
  },
  handleTextInput(e){
    this.setData({
      textVal:e.detail.value
    })
  },
  handleFormSubmit(){
    const {textVal,chooseImg} = this.data;
    if(!textVal.trim()){
      wx.showToast({
        title: '输入不合法',
        icon: 'none',
        mask: true,
      });
      return;
    }

    wx.showLoading({
      title: "正在上传中",
      mask: true
    });
      
    if(chooseImg.length!=0){
      chooseImg.forEach((v,i)=>{
        wx.uploadFile({
          // 图片要上传到哪里
          url: 'http://images.ac.cn/api/upload',
          // 被上传的文件的路径
          filePath: v,
          // 上传的文件的名称 自定义要和后台一致
          name: "file",
          // 顺带的文本信息
          formData: {},
          success: (result) => {
            console.log(result)
            wx.hideLoading();
            let url = JSON.parse(result.data).url;
            this.UpLoadImgs.push(url);
            if(i===chooseImg.length-1){
              // 把文本内容和外网图片数组都提交到后台中
              // 重置
              this.setData({
                textVal:"",
                chooseImg:[]
              })
              wx.navigateBack({
                delta: 1
              });
            }
          }
        });
      })
    }else{
      wx.hideLoading();
      console.log("只是提交了文本");
      wx.navigateBack({
        delta: 1
      });
    }
  }
})