const socketio = io();

// みんなの選ばれた番号と名前
let result_number = [];
let result_user = [];
// 自分の選んだカード番号
let card_num = "";
// 参加人数
let all_member = 0;
let voted_member = 0;
// 平均ポイント
let average_num = 0;

// 名前取得
const room = window.sessionStorage.getItem(["room"]);
const name = window.sessionStorage.getItem(["name"]);
if (room == null || name == null) {
  window.location.href = "/";
}

// 部屋に入室させる
socketio.emit("from_client", { room, name });

// 部屋情報に追加する
const updateInfo = (message) => {
  const content = document.createElement("p");
  content.textContent = message;
  room_info.appendChild(content);
  // スクロールを最下部に移動
  room_info.scrollTo(0, room_info.scrollHeight - room_info.clientHeight);
}

// 入室情報を受信
socketio.on("joinResult", function(data) {
  updateInfo(`${data.name} さんが入室しました。`);
});

// 退出情報を受信
socketio.on("leaveResult", function(data) {
  updateInfo(`${data.name} さんが退出しました。`);
});

// カードボタン
$(".card").on({
  click: function () {
    card_num = $(this).attr("id");
    // 自分の選んだ番号をセッションに入れる
    window.sessionStorage.setItem("select_num", card_num);
    // 名前と番号をサーバに送信
    socketio.emit("result_card_list", [card_num, name, room]);
    // 自分の選んだ番号を表示
    $(".select_num").remove();
    const select_num_div = document.createElement("div");
    select_num_div.className = "select_num";
    select_num_div.innerHTML = "Your Choice < " + card_num + " >";
    // 要素の先頭に追加
    $("#select_panel").prepend(select_num_div);
  },
});
// カード情報受信
socketio.on("result_card_list", function (result_arr) {
  const result_user = result_arr[1];
  const number_of_people = result_arr[2];
  // カードを表示する
  selectCardLineUp(result_user, number_of_people);
});

// オープンボタンを押したとき
document.getElementById("open").onclick = function () {
  socketio.emit("open", { room, name });
};
//　オープン情報受信
socketio.on("open", function (result_arr) {
  // ここで名前をキーに数字を入れる
  // オープン状態のカードを並べる
  openCardLineUp(result_arr[0], result_arr[1]);
  const name = result_arr[2];
  $(".back").removeClass("back");
  // 情報を投稿
  updateInfo(`${name} さんがカードをオープンしました。`)
});

// リセットボタン
document.getElementById("reset").onclick = function () {
  if (window.confirm("リセットしていいですか？")) {
    socketio.emit("reset", { room, name });
  }
};
// リセット情報受信
socketio.on("reset", function (data) {
  const { room, name } = data;
  $(".result_bord").empty();
  // ボタン有効化
  $(".select").prop("disabled", false);
  // 自分の選んだ番号を削除
  $(".select_num").remove();
  // 平均を削除
  $(".average_num").remove();
  voted_member = 0;
  result_user = [];
  result_number = [];
  member_num(voted_member, all_member);
  // 情報を投稿
  updateInfo(`${name} さんがリセットしました。`);
});

// 退出ボタン
document.getElementById("leave").onclick = function () {
  if (window.confirm("部屋を退出しますか？")) {
    socketio.emit("leave", [room, name]);
    window.sessionStorage.clear();
    window.location.href = "/";
  }
};

// カードを並べる
function selectCardLineUp(result_user, number_of_people) {
  // 配下をすべて削除
  $(".result_bord").empty();

  if (result_user[0] != "") {
    for (let i = 0; i < result_user.length; i++) {
      // 大本のdiv
      const frame_div = document.createElement("div");
      frame_div.className = "frame";

      // 数字のdiv
      const result_card_div = document.createElement("div");
      result_card_div.className = "card back";
      frame_div.appendChild(result_card_div);

      // 名前のp
      const card_name_p = document.createElement("p");
      card_name_p.className = "card_name";
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
  $(".result_bord").empty();
  // 平均
  const average_num_arr = [];

  if (result_number[0] != "") {
    for (let i = 0; i < result_number.length; i++) {
      // 大本のdiv
      const frame_div = document.createElement("div");
      frame_div.className = "frame";

      // 数字のdiv
      const result_card_div = document.createElement("div");
      result_card_div.className = "card back result";
      result_card_div.innerHTML = result_number[i];
      frame_div.appendChild(result_card_div);

      // 名前のp
      const card_name_p = document.createElement("p");
      card_name_p.className = "card_name";
      card_name_p.innerHTML = result_user[i];
      frame_div.appendChild(card_name_p);

      // result_bordに追加
      panel.appendChild(frame_div);

      // 平均を出すためにint化する
      average_num_arr.push(parseFloat(result_number[i]));
    }
  }
  // 平均を出す。
  // タイミングはOpenボタンを押したとき
  // カード情報はresult_numberの配列
  // 表示する場所は　div class memberのところ
  if (isNaN(Math.max(...average_num_arr))) {
    average_num = "Average: 🤔";
  } else {
    const average = function (arr, fn) {
      return (sum(arr, fn) / arr.length).toFixed(1);
    };
    average_num = "Average: " + String(average(average_num_arr));
  }
  return_average_num(average_num);
}

// 画面リロード後はセッションのカードを再表示
if (window.performance) {
  if (performance.navigation.type === 1) {
    // リロードされた
    // 自分の選んだ番号を再描写
    card_num = window.sessionStorage.getItem(["select_num"]);
    const select_num_div = document.createElement("div");
    select_num_div.className = "select_num";
    select_num_div.innerHTML = "Your Choice <  " + card_num + "  >";
    //   info_panel.appendChild(select_num_div);
    // select_panel.appendChild(select_num_div);
    $("#select_panel").prepend(select_num_div);
  } else {
    // リロードされていない
  }
}

function member_num(voted, all) {
  $(".member_num").remove();
  // メンバー数を表示
  /// / 人数要素を作成
  const member_num_p = document.createElement("p");
  if (voted == all) {
    member_num_p.className = "member_num text_flash";
  } else {
    member_num_p.className = "member_num";
  }
  member_num_p.innerHTML = voted + "/" + all;
  $(".member_num_area").prepend(member_num_p);
  // $('#member').append(member_num_p);
}

function return_average_num(average_num) {
  $(".average_num").remove();
  // メンバー数を表示
  /// / 人数要素を作成
  const member_num_p = document.createElement("p");
  member_num_p.className = "average_num";
  member_num_p.innerHTML = average_num;
  $(".average_num_area").prepend(member_num_p);
  // $('#member').append(member_num_p);
}

const sum = function (arr) {
  return arr.reduce(function (prev, current, i, arr) {
    return prev + current;
  });
};
