// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    const tname = event.collection_name;
    const tdata = event.udata;

    console.log("name", tname);
    console.log("tdata", tdata);

    try {
        return await db.collection(tname).where(tcondition).add({
            data: tdata
        })
    }
    catch (e) {
        console.error(e);
    }
}