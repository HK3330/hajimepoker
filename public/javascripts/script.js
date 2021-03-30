var socketio = io();

// みんなの選ばれた番号と名前
var result_number = [];
var result_user = [];
// 自分の選んだカード番号
var card_num = '';
// 参加人数
var all_member = 0;
var voted_member = 0;

// 名前取得
var room = window.sessionStorage.getItem(['room']);
var name = window.sessionStorage.getItem(['name']);
if (room == null || name == null) {
    window.location.href = '/';
}

// 部屋に入室させる
socketio.emit('from_client', { room: room, name: name });

// カードボタン
$('.card').on({
'click': function() {
    card_num = $(this).attr('id');
    // 自分の選んだ番号をセッションに入れる
    window.sessionStorage.setItem('select_num',card_num);
    // 名前と番号をサーバに送信
    socketio.emit('result_card_list', [card_num, name, room]);
    // 自分の選んだ番号を表示
    $(".select_num").remove();
    var select_num_div = document.createElement('div');
    select_num_div.className = 'select_num';
    select_num_div.innerHTML = 'Your Choice < ' + card_num + ' >';
    // 要素の先頭に追加
    $('#select_panel').prepend(select_num_div);
}})
// カード情報受信
socketio.on('result_card_list',function(result_arr){
    var result_user = result_arr[1];
    var number_of_people = result_arr[2];
    // カードを表示する
    selectCardLineUp(result_user, number_of_people);
});

// オープンボタンを押したとき
document.getElementById("open").onclick = function() {
    socketio.emit('open', room);
}
//　オープン情報受信
socketio.on('open',function(result_arr){
    // ここで名前をキーに数字を入れる
    // オープン状態のカードを並べる
    openCardLineUp(result_arr[0], result_arr[1]);
    $('.back').removeClass('back');
});

// リセットボタン
document.getElementById("reset").onclick = function() {
    if(window.confirm('リセットしていいですか？')){
        socketio.emit('reset', room);
	}
}
// リセット情報受信
socketio.on('reset',function(){
    $('.result_bord').empty();
    // ボタン有効化
    $(".select").prop("disabled", false);
    // 自分の選んだ番号を削除
    $(".select_num").remove();
    voted_member = 0;
    result_user = [];
    result_number = [];
    member_num(voted_member, all_member);
});

// 退出ボタン
document.getElementById('leave').onclick = function() {
    if(window.confirm('部屋を退出しますか？')){
        socketio.emit('leave', [room, name]);
        window.sessionStorage.clear();
        window.location.href = '/';
	}
}

// カードを並べる
function selectCardLineUp(result_user, number_of_people) {
    // 配下をすべて削除
    $('.result_bord').empty();

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
        // // メンバー数を表示
        voted_member = result_user.length;
        all_member = number_of_people;
        member_num(voted_member, all_member);
    }
}

// カードを裏返す
function openCardLineUp(result_user, result_number) {
    // 配下をすべて削除
    $('.result_bord').empty();

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
      select_num_div.innerHTML = 'Your Choice <  ' + card_num + '  >';
    //   info_panel.appendChild(select_num_div);
    // select_panel.appendChild(select_num_div);
    $('#select_panel').prepend(select_num_div);
    } else {
      // リロードされていない
    }
}

function member_num(voted, all) {
        $(".member_num").remove();
        // メンバー数を表示
        //// 人数要素を作成
        var member_num_p = document.createElement('p');
        if (voted == all ){
            member_num_p.className = 'member_num text_flash'
        }else{
            member_num_p.className = 'member_num'
        }
        member_num_p.innerHTML = voted + '/' + all;
        $('.member').prepend(member_num_p);
        // $('#member').append(member_num_p);
}