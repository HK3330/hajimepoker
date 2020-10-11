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

io.on('connection',function(socket){
    console.log()
    socket.on('result_card_list',function(result_arr){
        console.log('サーバサイド' + result_arr[0] + result_arr[1]);
        io.emit('result_card_list', [result_arr[0], result_arr[1]]);
    });
    socket.on('open',function(){
        console.log('オープン');
        io.emit('open', 'open');
    });
    socket.on('reset',function(){
        console.log('リセット');
        io.emit('reset', 'reset');
    });
});


http.listen(PORT, function(){
    console.log('server listening. Port:' + PORT);
});