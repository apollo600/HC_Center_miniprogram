// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    const tdata = event.data;
    const tpage = event.page;
    const ttemplateId = event.templateId;

    try {
        result = await cloud.openapi.subscribeMessage.send({
            "touser": wxContext.OPENID,
            "page": tpage,
            "lang": "zh_CN",
            "data": tdata,
            "templateId": ttemplateId,
            "miniprogramState": 'developer'
        })
        return result;
    } catch (err) {
        return err;
    }
}