FROM node:18-slim

# アプリケーションディレクトリを作成する
WORKDIR /usr/src/

# キャッシュを利用するために、package.jsonとpackage-lock.jsonのみをコピーし、
# 依存関係を先にインストール
COPY package*.json ./
RUN npm install

# アプリケーションコードをコンテナにコピー
COPY . .

# EXPOSE 7000
CMD [ "node", "src/app.js" ]
# CMD ["ls"]