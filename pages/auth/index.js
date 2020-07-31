import { request } from "../../request/index.js";
import { login } from "../../utils/asyncWX.js";
Page({
  // 获取用户信息
  handleGetUserInfo(e){
    // 1 获取用户信息
    const { encryptedData,rawData,iv,signature } = e.detail;
    // 2 获取小程序登录成功后的code
    login().then(result=>{
      const {code} = result;
      const loginParams = { encryptedData,rawData,iv,signature,code };
      request({url:'/users/wxlogin',data:{code}})
      .then(result=>{
        console.log(result)
        const {token} = result;
        wx.setStorageSync("token", token);
        wx.navigateBack({
          delta: 1
        });
      })
    })
  }
})