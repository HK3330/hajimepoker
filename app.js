var express = require('express');
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 7000;
const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient
var MongoClient = require('mongodb').MongoClient;
var dburl = "mongodb://localhost:27017/myDB";
const assert = require('assert')

/**
 * 追加オプション
 * MongoClient用オプション設定
 */
const connectOption = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}
        // const insertDocuments = (db, callback) => {
        //     const documents = [
        //         { a: 1 },
        //         { a: 2 },
        //         { a: 3 }
        //     ]
        //     // myDBデータベースのdocumentsコレクションに対して
        //     // ドキュメントを3つ追加します
        //     db.collection('documents').insertMany(documents, (err, result) => {
        //         // insert結果の確認
        //         assert.equal(err, null)
        //         assert.equal(3, result.result.n)
        //         assert.equal(3, result.ops.length)

        //         callback(result)
        //     })
        // }
                // io.sockets.emit('receiveMessage', { name: name, message: message });
                // MongoClient.connect('mongodb://127.0.0.1:27017/myDB', (err, db) => {
                // // MongoClient.connect('mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb', (err, db) => {
                //     assert.equal(null, err)
                //     db.close()
                // })
// moDBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB

// テンプレートエンジンの指定
app.set("view engine", "ejs");
// staticメソッドを利用し、指定ディレクトリ以下の静的ファイルを読み込む
// app.use("/public", express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public"));
// routeの設定
app.use("/", require("./routes/index.js"));

// カード情報
var result_number_arr = [];
var result_user_arr = [];

var room = '';

io.on('connection',function(socket){
    // console.log('connection')
    // ここから
    // 部屋
    var name = "";
    // 部屋に入る
    socket.on("from_client", function(data) {
        room = data.room;
        name = data.name;
        // console.log("クライアントから送信されたroom: %s", room);
        // console.log("クライアントから送信されたname: %s", name);
        // ここで部屋のテーブルに追加する
        MongoClient.connect(dburl, connectOption, function(err, db) {
            if (err) throw err;
            var dbo = db.db("testdb");
            // ----------------------------------------------------------------------
            // INSERT
            // ----------------------------------------------------------------------
            var obj = { name: name, choice: "" };
            dbo.collection(room).insertOne(obj , function(err, res) {
              if (err) throw err;
              db.close();
            // ----------------------------------------------------------------------
            // SELECT
            // ----------------------------------------------------------------------
            // var obj = {name: "Company Inc"};
            // dbo.collection("testCollection").find(obj).toArray(function(err, result) {
            //     if (err) throw err;
                // console.log(result);
            //     db.close();
            // });
        });
        });
        joinRoom(socket, room);
        // TODO 部屋の人数をカウントして部屋先に知らせる
        // TODO? 部屋に入ったタイミングですでにDBに入っているリスト並べる
        MongoClient.connect(dburl, connectOption, function(err, db) {
            if (err) throw err;
            var dbo = db.db("testdb");
            // ----------------------------------------------------------------------
            // INSERT
            // ----------------------------------------------------------------------
            // var obj = { name: name, choice: "" };
            // dbo.collection(room).insertOne(obj , function(err, res) {
            //   if (err) throw err;
            //   db.close();
            // ----------------------------------------------------------------------
            // SELECT
            // ----------------------------------------------------------------------
            var obj = {name: "Company Inc"};
            dbo.collection(room).find().toArray(function(err, result) {
                if (err) throw err;
                // console.log(result);
                // console.log(result[0]);//{ _id: 5fa0e02a580e500873000879, name: 'cc', choice: '' }
                // console.log(result[0]["name"]);//cc
                // console.log(result[0]["choice"]);
                result_number_arr=[]
                result_user_arr=[]
                for (let i=0;i < result.length; i++){
                    if (result[i]["choice"] != "") {
                        result_number_arr.push(result[i]["choice"]);
                        result_user_arr.push(result[i]["name"]);
                    }
                }
                // console.log(result_number_arr)
                // console.log(result_user_arr)
                db.close();
                io.to(room).emit('result_card_list', [result_number_arr, result_user_arr]);
            // });
        });
        });


    });
    function joinRoom(socket, room) {
        // ユーザーをルームに参加させる
        socket.join(room);
        // ユーザに新しいルームに入ったことを知らせる
        // TODO 入った部屋先にメッセージを送る
        socket.emit('joinResult', { room: room });
    }
    // room1だけのメッセージ
    // クライアントから送られてきたメッセージ受け取り
    socket.on("from_client_message", function(name, message) {
        // console.log("クライアントから送信されたname: %s", name);
        // console.log("クライアントから送信されたmessage: %s", message);
        MongoClient.connect(dburl, connectOption, function(err, db) {
            if (err) throw err;
            var dbo = db.db("testdb");
            // var obj = { name: "Company Inc", address: "Highway 37" };
            // // ----------------------------------------------------------------------
            // // INSERT
            // // ----------------------------------------------------------------------
            // dbo.collection("testCollection").insertOne(obj , function(err, res) {
            //   if (err) throw err;
            //   db.close();
            var obj = {name: "Company Inc"};
            // ----------------------------------------------------------------------
            // SELECT
            // ----------------------------------------------------------------------
            dbo.collection("testCollection").find(obj).toArray(function(err, result) {
                if (err) throw err;
                // console.log(result);
                db.close();
            });
        });
        // mongoDBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
        // MongoClient.connect('mongodb://localhost:27017/myDB', connectOption, (err, db) => {
        //     assert.equal(null, err)
            console.log("Connected successfully to server")
        //     // insertDocuments(db, () => {
        //     //     db.close()
        //     // })
        //     const insertDocuments = (db, callback) => {
        //         const documents = [
        //             { a: 1 },
        //             { a: 2 },
        //             { a: 3 }
        //         ]
        //         // myDBデータベースのdocumentsコレクションに対して
        //         // ドキュメントを3つ追加します
        //         db.collection('documents').insertMany(documents, (err, result) => {
        //             // insert結果の確認
        //             assert.equal(err, null)
        //             assert.equal(3, result.result.n)
        //             assert.equal(3, result.ops.length)
    
        //             callback(result)
        //         })
        //     }
        // })
        // io.to('testroom').emit('receiveMessage', { name: name, message: message });
        io.to('roomA').emit('receiveMessage', { name: name, message: message });
    });
    // ここまで
    // ----------------------------------------------------------------------
    // カードボタンを押されたとき
    // ----------------------------------------------------------------------
    socket.on('result_card_list',function(result_arr){// TODO 部屋情報も持ってくる
        console.log(result_arr);
        // セッションバージョン
        // var card_num = result_arr[0];
        // var name = result_arr[1];
        // console.log('サーバサイド' + card_num + name);
        // result_number_arr.push(card_num);
        // result_user_arr.push(name);
        // // io.emit('result_card_list', [result_arr[0], result_arr[1]]);
        // io.emit('result_card_list', [result_number_arr, result_user_arr]);

        // DBバージョン
        var card_num = result_arr[0];
        var name = result_arr[1];
        room = result_arr[2];
        // console.log('サーバサイド' + card_num + name);
        // ここで部屋ごとのテーブルにupdateする。名前は入ってるからupdate
        result_number_arr.push(card_num);
        result_user_arr.push(name);
        // dbに追加
        MongoClient.connect(dburl, connectOption, function(err, db) {
            if (err) throw err;
            var dbo = db.db("testdb");
            var where = {name: name};
            var set = {$set: {choice: card_num}};
            // ----------------------------------------------------------------------
            // UPDATE
            // ----------------------------------------------------------------------
            dbo.collection(room).updateMany(where, set, function(err, result) {
              if (err) throw err;
            //   console.log("update");
              db.close();
            });
        });
        // dbの情報を取得
        MongoClient.connect(dburl, connectOption, function(err, db) {
            if (err) throw err;
            var dbo = db.db("testdb");
            // ----------------------------------------------------------------------
            // INSERT
            // ----------------------------------------------------------------------
            // var obj = { name: name, choice: "" };
            // dbo.collection(room).insertOne(obj , function(err, res) {
            //   if (err) throw err;
            //   db.close();
            // ----------------------------------------------------------------------
            // SELECT
            // ----------------------------------------------------------------------
            // var obj = {name: "Company Inc"};
            dbo.collection(room).find().toArray(function(err, result) {
                if (err) throw err;
                // console.log(result);
                // console.log(result[0]);//{ _id: 5fa0e02a580e500873000879, name: 'cc', choice: '' }
                // console.log(result[0]["name"]);//cc
                // console.log(result[0]["choice"]);
                result_number_arr=[]
                result_user_arr=[]
                for (let i=0;i < result.length; i++){
                    if (result[i]["choice"] != "") {
                        result_number_arr.push(result[i]["choice"]);
                        result_user_arr.push(result[i]["name"]);
                    }
                }
                // console.log(result_number_arr)
                // console.log(result_user_arr)
                db.close();
                io.to(room).emit('result_card_list', [result_number_arr, result_user_arr]);
            // });
        });
        });
        // io.emit('result_card_list', [result_number_arr, result_user_arr]);
    });

    // ----------------------------------------------------------------------
    // オープンボタンを押されたとき
    // ----------------------------------------------------------------------
    socket.on('open',function(room){
        MongoClient.connect(dburl, connectOption, function(err, db) {
            var choice_arr = [];
            var name_arr = [];
            if (err) throw err;
            var dbo = db.db("testdb");
            // ----------------------------------------------------------------------
            // SELECT
            // ----------------------------------------------------------------------
            dbo.collection(room).find().toArray(function(err, result) {
                if (err) throw err;
                for (let i=0;i < result.length; i++){
                    if (result[i]["choice"] != "") {
                        choice_arr.push(result[i]["choice"]);
                        name_arr.push(result[i]["name"]);
                    }
                }
                db.close();
                io.to(room).emit('open', [name_arr, choice_arr]);
            });
        });
    });

    // ----------------------------------------------------------------------
    // リセットボタンを押されたとき
    // ----------------------------------------------------------------------
    socket.on('reset',function(room){
        result_number_arr = [];
        result_user_arr = [];
        MongoClient.connect(dburl, connectOption, function(err, db) {
            if (err) throw err;
            var dbo = db.db("testdb");
            var where = {};
            var set = {$set: {choice: ''}};
            // ----------------------------------------------------------------------
            // UPDATE
            // ----------------------------------------------------------------------
            dbo.collection(room).updateMany(where, set, function(err, result) {
              if (err) throw err;
              db.close();
            });
        });
        //　全削除だと、リセット後にカードを押してもupdate先がないので、できない。nameは残さないといけなかった。
        // MongoClient.connect(dburl, connectOption, function(err, db) {
        //     if (err) throw err;
        //     var dbo = db.db("testdb");
        //     // ----------------------------------------------------------------------
        //     // DELETE
        //     // ----------------------------------------------------------------------
        //     dbo.collection(room).deleteMany();
        // });
        io.to(room).emit('reset', 'reset');
    });
});

http.listen(PORT, function(){
    // console.log('server listening. Port:' + PORT);
});


//return が帰らない
function findAll(room){
    var name_arr=[]
    var choice_arr=[]
    MongoClient.connect(dburl, connectOption, function(err, db) {
        if (err) throw err;
        var dbo = db.db("testdb");
        // ----------------------------------------------------------------------
        // SELECT
        // ----------------------------------------------------------------------
        dbo.collection(room).find().toArray(function(err, result) {
            // if (err) throw err;
            // console.log("roomはどこじゃ");
            // console.log(result);
            // console.log(result[0]);//{ _id: 5fa0e02a580e500873000879, name: 'cc', choice: '' }
            // console.log(result[0]["name"]);//cc
            // console.log(result[0]["choice"]);
            for (let i=0;i < result.length; i++){
                if (result[i]["choice"] != "") {
                    choice_arr.push(result[i]["choice"]);
                    name_arr.push(result[i]["name"]);
                }
            }
            // console.log(result_number_arr);
            // console.log(a);
            db.close();
            // io.to(room).emit('result_card_list', [result_number_arr, result_user_arr]);
            // console.log(name_arr);
            // console.log(choice_arr);
            return ['hoge','tt'];
            // return result_user_arr;
            // return result_user_arr;
        // });
    });
    // console.log(result_user_arr);
    });
    console.log(choice_arr);
    // return [result_user_arr, result_number_arr]
    // console.log("hogehogehgoehogheogheo");
    // console.log(result_number_arr);
    // return 'hoge';
    // console.log(a);
    // console.log(choice_arr);
    // return ['hoge','tt'];
}