db.createUser({
  user: "admin",
  pwd: "admin",
  roles: [
    {
      role: "readWrite",
      db: "pockerdb",
    },
  ],
});

// pockerdbデータベースを選択
db = db.getSiblingDB("pockerdb");

// room1からroom6までの各コレクションを作成し、TTLインデックスを設定
for (let i = 1; i <= 6; i++) {
  const collectionName = "room" + i;
  db.createCollection(collectionName);
  db[collectionName].createIndex({ time: 1 }, { expireAfterSeconds: 7200 });
}
