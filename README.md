# hajimepoker

## Qiitaの記事
https://qiita.com/hajimete/items/77e8047cb4244b758dd9#ttl%E3%81%AE%E8%A8%AD%E5%AE%9A

## 使い方
Dockerを使います。
```
docker-compose up -d
```

http://localhost:7000/


## 構成

### ディレクトリ

アプリのメインとなる `server/src` 配下の構成です。

```
src
├── app.js
├── public
│   ├── javascripts
│   │   ├── entrance_script.js
│   │   └── script.js
│   └── stylesheets
│       └── style.css
├── routes
│   └── index.js
└── views
    ├── entrance.ejs
    └── index.ejs
```

- app.js
    - サーバ側の処理を書いています。
    - イメージ的には各クライアントからのデータをみんなに丸投げするのと、DB処理です。
- 部屋入室前
    - テンプレートがentrance.ejs
    - 処理はentrance_script.js
- 部屋入室後（プランニングポーカーするとこ）
    - テンプレートがindex.ejs
    - 処理がscript.js


### MongoDB

実際に使うドキュメントはこんな感じです。

```
{ "_id" : ObjectId("5fa950e0f1f3fb6568bdcfd3"), "name" : "さとう", "choice" : "100", "time" : ISODate("2020-11-09T14:23:28.903Z") }
```

- name
    - ユーザー名
- choice
    - 選択したカード
- time
    - 入室時間
    - MongoDBでTTLを設定するにはこのデータが必須です。

#### TTLの設定

TTLの設定はコレクション（テーブル）ごとに設定が必要です。  
例えば、room1で120分(7200秒)後にドキュメントを削除する設定する時。

```
# ターミナルで
mongo
> use testdb
> db.room1.ensureIndex({time:1},{expireAfterSeconds:7200});
```
