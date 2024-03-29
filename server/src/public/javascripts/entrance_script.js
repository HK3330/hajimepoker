const socketio = io();

// 空き部屋情報
//　emit.entrance
socketio.emit("entrance");
socketio.on("entrance", function (vacant_room_arr) {
  $(".in_use").remove();
  for (const vacant_room of vacant_room_arr) {
    // divを作る
    const in_use_div = document.createElement("div");
    in_use_div.className = "in_use";
    in_use_div.innerHTML = "IN USE";
    // $('#panel').prepend(member_num_p);
    $("#" + vacant_room).append(in_use_div);
  }
});

// 入室ボタン
$("button").on("click", function () {
  const room = $(this).attr("id");
  // alert(room);
  if (checkName() == false) {
    return false;
  }
  const user_name = document.getElementById("input_name").value;
  window.sessionStorage.setItem("name", user_name);
  window.sessionStorage.setItem("room", room);
  window.location.href = "/room/";
});

// dbに追加テストボタン
document.getElementById("test").onclick = function () {
  socketio.emit("db_test", {});
};

// フォームが空か記号が入ってたらalertしてfalse
function checkName() {
  const check_name = document.getElementById("input_name").value;
  if (check_name == "") {
    alert("名前を入力してください");
    return false;
  }
  return validateString(check_name);
}

// フォームに記号が入っていたらfalse
function validateString(val) {
  const reg = new RegExp(/[!"#$%&'()\*\+\-\.,\/:;<=>?@\[\\\]^_`{|}~]/g);
  if (reg.test(val)) {
    alert("記号は使えません");
    document.getElementById("input_name").value = "";
    return false;
  }
  return true;
}
