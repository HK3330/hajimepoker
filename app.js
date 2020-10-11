var express = require('express');
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 7000;

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

io.on('connection',function(socket){
    console.log('connection')
    // 接続した段階でカード情報があったら、読み込ませる。
    io.emit('result_card_list', [result_number_arr, result_user_arr]);
    // カードボタンを押されたとき
    socket.on('result_card_list',function(result_arr){
        var card_num = result_arr[0];
        var name = result_arr[1];
        console.log('サーバサイド' + card_num + name);
        result_number_arr.push(card_num);
        result_user_arr.push(name);
        // io.emit('result_card_list', [result_arr[0], result_arr[1]]);
        io.emit('result_card_list', [result_number_arr, result_user_arr]);
    });
    // オープンボタンを押されたとき
    socket.on('open',function(){
        io.emit('open', 'open');
    });
    // リセットボタンを押されたとき
    socket.on('reset',function(){
        result_number_arr = [];
        result_user_arr = [];
        io.emit('reset', 'reset');
    });
});

http.listen(PORT, function(){
    console.log('server listening. Port:' + PORT);
});