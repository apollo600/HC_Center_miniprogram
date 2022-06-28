// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    const tname = event.collection_name;
    const tcondition = event.condition;

    console.log("name", tname);
    console.log("condition", tcondition);

    try {
        return await db.collection(tname).where(tcondition).remove()
    }
    catch (e) {
        console.error(e);
    }
}