var socketio = io();

// みんなの選ばれた番号と名前
var result_number = [];
var result_user = [];
// 自分の選んだカード番号
var card_num = '';

// カードボタン
$('.card').on({
'click': function() {
    // 空白と記号は弾く
    if (checkName() == false){
        return false
    }
    card_num = $(this).attr('id');
    // 自分の選んだ番号をセッションに入れる
    window.sessionStorage.setItem('select_num',card_num);
    var user_name = document.getElementById("input_name").value;
    // 名前と番号をサーバに送信
    socketio.emit('result_card_list', [card_num, user_name]);
    // ボタン無効化
    $(".select").prop("disabled", true);
    // 自分の選んだ番号を表示
    $(".select_num").remove();
    var select_num_div = document.createElement('div');
    select_num_div.className = 'select_num';
    select_num_div.innerHTML = 'Your Choice ' + card_num;
    info_panel.appendChild(select_num_div);
}})
// カード情報受信
socketio.on('result_card_list',function(result_arr){
    // console.log('クライアント' + result_arr[0] + result_arr[1]);
    // 番号と名前をセッションに入れる
    window.sessionStorage.setItem(['result_number'],[result_arr[0]]);
    window.sessionStorage.setItem(['result_user'],[result_arr[1]]);
    // カードを表示する
    selectCardLineUp()
});

// オープンボタンを押したとき
document.getElementById("open").onclick = function() {
    if(window.confirm('カードオープンしていいですか？')){
        socketio.emit('open', 'open');
	}
}
//　オープン情報受信
socketio.on('open',function(){
    // ここで名前をキーに数字を入れる
    openCardLineUp()
    $('.back').removeClass('back');
});

// リセットボタン
document.getElementById("reset").onclick = function() {
    if(window.confirm('リセットしていいですか？')){
        socketio.emit('reset', 'reset');
	}
}
// リセット情報受信
socketio.on('reset',function(){
    $('.result_bord').empty();
    window.sessionStorage.clear();
    // ボタン有効化
    $(".select").prop("disabled", false);
    // 自分の選んだ番号を削除
    $(".select_num").remove();
});

// セッションの情報でカードを並べる
function selectCardLineUp() {
    // var input_name = document.getElementById("input_name").value;
    // 配下をすべて削除
    $('.result_bord').empty();
    // セッションから値(str)を取る
    var result_user_str = window.sessionStorage.getItem(['result_user']);

    // strを配列化
    result_user = result_user_str.split(',');
    if (result_user[0] != ''){
    
        for (let i = 0; i < result_user.length; i++) {
            // 大本のdiv
            var frame_div = document.createElement('div');
            frame_div.className = 'frame';
            
            // 数字のdiv
            var result_card_div = document.createElement('div');
            result_card_div.className = 'card back';
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
}

function openCardLineUp() {
    // var input_name = document.getElementById("input_name").value;
    // 配下をすべて削除
    $('.result_bord').empty();
    // セッションから値(str)を取る
    var result_number_str = window.sessionStorage.getItem(['result_number']);
    var result_user_str = window.sessionStorage.getItem(['result_user']);

    // strを配列化
    result_number = result_number_str.split(',');
    // [TODO] ソートするならresult_numberの中身をstrをintに変換
    //// ∞は最後、?は最後から2番目とか？
    ////// そうするとnameも配列を入れ替えないといけないな。 
    result_user = result_user_str.split(',');
    if (result_number[0] != ''){
    
        for (let i = 0; i < result_number.length; i++) {
            // 大本のdiv
            var frame_div = document.createElement('div');
            frame_div.className = 'frame';
            
            // 数字のdiv
            var result_card_div = document.createElement('div');
            result_card_div.className = 'card back result';
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
}

// 画面リロード後はセッションのカードを再表示
if (window.performance) {
    if (performance.navigation.type === 1) {
      // リロードされた
      // 自分の選んだ番号を再描写
      card_num = window.sessionStorage.getItem(['select_num']);
      var select_num_div = document.createElement('div');
      select_num_div.className = 'select_num';
      select_num_div.innerHTML = 'Your Choice ' + card_num;
      info_panel.appendChild(select_num_div);
    } else {
      // リロードされていない
    }
}

// フォームが空か記号が入ってたらalertしてfalse
function checkName() {
    var check_name = document.getElementById("input_name").value;
    if(check_name == '') {
        alert('名前を入力してください');
        return false;
    }
    return validateString(check_name)
}

// フォームに記号が入っていたらfalse
function validateString(val) {
    var reg = new RegExp(/[!"#$%&'()\*\+\-\.,\/:;<=>?@\[\\\]^_`{|}~]/g);
    if(reg.test(val)) {
        alert('記号は使えません');
        document.getElementById("input_name").value = '';
        return false;
    }
    return true;
}

// var result_card_list = [[1,'ソン・イェジン'],
// [2,'愛の不時着'],
// [3,'梨泰院クラス'],
// [4,'秘密の森'],
// [5,'トッケビ']];