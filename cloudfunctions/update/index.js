// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    console.log("event", event);

    const tname = event.collection_name;
    const tcondition = event.condition;
    const tdata = event.udata;

    console.log("name", tname);
    console.log("condition", tcondition);
    console.log("tdata", tdata);

    try {
        return db.collection(tname).where(tcondition).update({
            data: tdata
        })
    }
    catch (e) {
        console.error(e);
    }
    
}