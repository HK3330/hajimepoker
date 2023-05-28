const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 8080;
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://admin:admin@mongo:27017/pockerdb?authSource=admin";

/**
 * 追加オプション
 * MongoClient用オプション設定
 */
const connectOption = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const pokerdb = "pockerdb";

// テンプレートエンジンの指定
app.set("view engine", "ejs");
app.set("views", __dirname + "/views"); // ここを追加
// staticメソッドを利用し、指定ディレクトリ以下の静的ファイルを読み込む
app.use(express.static(__dirname + "/public"));
// routeの設定
app.use("/", require("./routes/index.js"));

const rooms = [];
for (let i = 1; i <= 6; i++) {
  const roomName = "room" + i;
  rooms.push(roomName);
}
console.log(rooms);

io.on("connection", function (socket) {
  // ----------------------------------------------------------------------
  // entranceにアクセス時、使用中の部屋を教える
  // ----------------------------------------------------------------------
  socket.on("entrance", async function (data) {
    let client;
    try {
      // client = await MongoClient.connect(url, connectOption);
      try {
        client = await MongoClient.connect(url, connectOption);
        console.log("Succesfully connected to mongo");
      } catch (e) {
        console.error(e);
        console.log("つながっていません");
      }
      const db = client.db(pokerdb);
      const vacant_room_arr = [];
      for await (room of rooms) {
        const collection = db.collection(room);
        const result = await collection.find({}).toArray();
        if (result.length != 0) {
          vacant_room_arr.push(room);
        }
      }
      io.emit("entrance", vacant_room_arr);
    } catch (err) {
      console.log(err);
    } finally {
      if (client) client.close();
    }
  });

  // ----------------------------------------------------------------------
  // 部屋入室時
  // ----------------------------------------------------------------------
  socket.on("from_client", async function (data) {
    const room = data.room;
    const name = data.name;
    console.log(name, room, new Date());
    // ユーザーをルームに参加させる
    socket.join(room);
    let client;
    try {
      client = await MongoClient.connect(url, connectOption);
      const db = client.db(pokerdb);
      const collection = db.collection(room);
      const user = await collection.findOne({ name });
      if (user) {
      } else {
        await collection.insertOne({ name, choice: "", time: new Date() });
      }
      const result = await collection.find({}).toArray();
      const result_number_arr = [];
      const result_user_arr = [];
      for (let i = 0; i < result.length; i++) {
        if (result[i].choice != "") {
          result_number_arr.push(result[i].choice);
          result_user_arr.push(result[i].name);
        }
      }
      io.to(room).emit("result_card_list", [
        result_number_arr,
        result_user_arr,
        result.length,
      ]);
      // ユーザーにルーム入室を知らせる
      io.to(room).emit('joinResult', { room, name });
    } catch (err) {
      console.log(err);
    } finally {
      if (client) client.close();
    }
  });

  // ----------------------------------------------------------------------
  // カードボタンを押されたとき
  // ----------------------------------------------------------------------
  socket.on("result_card_list", async function (result_arr) {
    const card_num = result_arr[0];
    const name = result_arr[1];
    const room = result_arr[2];
    const result_number_arr = [];
    const result_user_arr = [];

    let client;
    try {
      client = await MongoClient.connect(url, connectOption);
      const db = client.db(pokerdb);
      const collection = db.collection(room);
      const where = { name };
      const set = { $set: { choice: card_num } };
      await collection.updateMany(where, set);
      const result = await collection.find({}).toArray();
      for (let i = 0; i < result.length; i++) {
        if (result[i].choice != "") {
          result_number_arr.push(result[i].choice);
          result_user_arr.push(result[i].name);
        }
      }
      io.to(room).emit("result_card_list", [
        result_number_arr,
        result_user_arr,
        result.length,
      ]);
    } catch (err) {
      console.log(err);
    } finally {
      if (client) client.close();
    }
  });

  // ----------------------------------------------------------------------
  // オープンボタンを押されたとき
  // ----------------------------------------------------------------------
  socket.on("open", function (data) {
    const { room, name } = data;
    MongoClient.connect(url, connectOption, function (err, db) {
      const choice_arr = [];
      const name_arr = [];
      if (err) throw err;
      const dbo = db.db(pokerdb);
      // ----------------------------------------------------------------------
      // SELECT
      // ----------------------------------------------------------------------
      dbo
        .collection(room)
        .find()
        .toArray(function (err, result) {
          if (err) throw err;
          for (let i = 0; i < result.length; i++) {
            if (result[i].choice != "") {
              choice_arr.push(result[i].choice);
              name_arr.push(result[i].name);
            }
          }
          db.close();
          io.to(room).emit("open", [name_arr, choice_arr, name]);
        });
    });
  });

  // ----------------------------------------------------------------------
  // リセットボタンを押されたとき
  // ----------------------------------------------------------------------
  socket.on("reset", function (data) {
    const { room, name } = data;
    MongoClient.connect(url, connectOption, function (err, db) {
      if (err) throw err;
      const dbo = db.db(pokerdb);
      const where = {};
      const set = { $set: { choice: "" } };
      // ----------------------------------------------------------------------
      // UPDATE
      // ----------------------------------------------------------------------
      dbo.collection(room).updateMany(where, set, function (err, result) {
        if (err) throw err;
        db.close();
      });
    });
    io.to(room).emit("reset", { room, name });
  });

  // ----------------------------------------------------------------------
  // 部屋退出ボタンを押されたとき
  // ----------------------------------------------------------------------
  socket.on("leave", function (data) {
    const room = data[0];
    const name = data[1];
    MongoClient.connect(url, connectOption, function (err, db) {
      if (err) throw err;
      const dbo = db.db(pokerdb);
      const where = { name };
      dbo.collection(room).deleteMany(where, function (err, result) {
        if (err) throw err;
        db.close();
      });
    });
    io.to(room).emit("leaveResult", { room, name });
  });
});

http.listen(PORT, function () {
  // console.log('server listening. Port:' + PORT);
});
