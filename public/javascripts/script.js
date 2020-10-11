// var result_card_list = [[1,'ソン・イェジン'],
// [2,'愛の不時着'],
// [3,'梨泰院クラス'],
// [4,'秘密の森'],
// [5,'トッケビ']];

var result_card_list = [];
var result_number = [];
var result_user = [];
var socketio = io();

$('.card').on({
'click': function() {
    var card_num = $(this).attr('id');
    console.log('クリックされました！');
    console.log(card_num);
    // 配列に追加
    var name = document.getElementById("input_name").value;
    result_card_list.push([card_num,name]);
    result_number.push(card_num);
    result_user.push(name);
    console.log('送信前')
    console.log(result_user)
    // 送信
    socketio.emit('result_card_list', [result_number, result_user]);
    // socketio.on('message',function(msg){
    //     console.log('クライアント' + msg);
    //   }); b
    // cardLineUp();
}})

// 受信
socketio.on('result_card_list',function(result_arr){
    console.log('クライアント' + result_arr[0] + result_arr[1]);
    // セッションに入れる
    window.sessionStorage.setItem(['result_number'],[result_arr[0]]);
    window.sessionStorage.setItem(['result_user'],[result_arr[1]]);
    // カードを表示する
    cardLineUp()
});

// var p = document.getElementById('img');
// function hogehoge(){
//   console.log('clickしたお');
// }
// p.attachEvent('onclick', hogehoge);
document.getElementById("open").onclick = function() {
    socketio.emit('open', 'open');
    console.log('open送信');
    // $('.back').removeClass('back');
}
socketio.on('open',function(){
    console.log('open受信');
    $('.back').removeClass('back');
});

// リセット
document.getElementById("reset").onclick = function() {
    // $('.result_bord').empty();
    // result_card_list = [];
    // result_number = [];
    // result_user = [];
    // window.sessionStorage.clear();
    socketio.emit('reset', 'reset');
}
socketio.on('reset',function(){
    console.log('reset受信');
    $('.result_bord').empty();
    result_card_list = [];
    result_number = [];
    result_user = [];
    window.sessionStorage.clear();
});

// ページ更新されたらセッションに入っているカードを並べる
window.addEventListener('unload', function(e){
    /** 更新される直前の処理 */
    console.log('unload');
    cardLineUp()
});

// 画面リロード後はセッションのカードを再表示
if (window.performance) {
    if (performance.navigation.type === 1) {
      // リロードされた
      cardLineUp()
    } else {
      // リロードされていない
    }
  }

function cardLineUp() {
    var input_name = document.getElementById("input_name").value;
    console.log(input_name);
    var card_id = $(this).attr('id');
    // 配下をすべて削除
    $('.result_bord').empty();
    // セッションから値(str)を取る
    var result_number_str = window.sessionStorage.getItem(['result_number']);
    var result_user_str = window.sessionStorage.getItem(['result_user']);

    // strを配列化
    var result_number_arr = result_number_str.split(',');
    result_number=[];
    for(i=0; i < result_number_arr.length; i++){
        result_number.push(parseInt(result_number_arr[i]));
    }
    result_user = result_user_str.split(',');

    console.log(result_number);
    console.log(result_user);
    for (let i = 0; i < result_number.length; i++) {
        // 大本のdiv
        var frame_div = document.createElement('div');
        frame_div.className = 'frame';
        
        // 数字のdiv
        // var div = document.createElement('div');
        // div.className = 'card back';
        // div.innerHTML = result_card_list[i];
        // panel.appendChild(div);
        var result_card_div = document.createElement('div');
        result_card_div.className = 'card back';
        result_card_div.innerHTML = result_number[i];
        frame_div.appendChild(result_card_div);

        // 名前のp
        var card_name_p = document.createElement('p');
        card_name_p.className = 'card_name';
        card_name_p.innerHTML = result_user[i];
        frame_div.appendChild(card_name_p);

        // result_bordに追加
        panel.appendChild(frame_div);
    }
}