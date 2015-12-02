## 2015年11月21日 第二回 T2CCTF


### 目次
1. このページの概要
2. 簡易可視化システムの説明
3. その他の T2CCTF における実装情報
4. 諸注意
5. サーバー環境
6. 環境構築
7. 実行方法
8. 問題挿入方法
9. おわりに

### このページの概要
このページは、第二回 T2CCTF で使われた各種ソースと環境構築、実行方法を説明するページとなります。  
また[先のページ](https://totti-t2cctf.github.io)は T2CCTF で用いられた [three.js](http://threejs.org) によるフラグの送受信を3Dで可視化するページのデモとなります。  
※デモページでは実際にフラグの送受信は行なっておりません。デモページのソースは[こちら](http://github.com/totti-t2cctf/totti-t2cctf.github.io)から！  

さらに自身がここまでの知識や技術を身につけるまでの小さなプログラム群によるソースと簡易説明も用意しましたので是非こちらもご覧ください。  
[Node.js(各種モジュールを含む), MongoDB, Three.js 簡易入門ページ](https://github.com/totti-t2cctf/basic_t2cctf)  
※ HTML, CSS, JavaScript, jQuery, bootstrap なども用いていますが、それらの説明は省略させていただきます、ご了承ください。

### 簡易可視化システムの説明
[Node.js](https://nodejs.org/en/) （サーバーサイドの言語）のモジュールである [Socket.IO](http://socket.io/) と、 [WebGL](https://ja.wikipedia.org/wiki/WebGL) を利用しやすくした three.js によってフラグの送受信の可視化を3Dで実現しています。  
またページ内におけるスコアや各種アイコンのリアルタイム更新等も実現しています。  
サーバー内で3Dの処理を行いストリーミング配信するようなサーバー側に負荷のかかる処理(クライアント側もダウンロード状況によっては閲覧に支障がでてしまう)は行なわず、  
クライアント側にある程度の処理を持たせる形にすることで、全てのクライアントでできるだけストレスを感じさせずに3Dによる可視化の閲覧を可能とさせるシステムとなっています。  

### その他のT2CCTF における実装情報
PCのスペック次第では 3D の処理自体が厳しいため T2CCTF では先の 3D の可視化システムのみ除いたページも用意しました。  
![challenges](https://raw.githubusercontent.com/totti-t2cctf/other_t2cctf/master/imgs/challenges.png)  



簡易的なスコア表示ページも用意していました。  
![scoreboard](https://raw.githubusercontent.com/totti-t2cctf/other_t2cctf/master/imgs/scoreboard.png)  

TOPページやダッシュボード等の画像はこちらから　↓  
<a href="https://raw.githubusercontent.com/totti-t2cctf/other_t2cctf/master/imgs/top.png" target="_blank">Top ページ</a>  
<a href="https://raw.githubusercontent.com/totti-t2cctf/other_t2cctf/master/imgs/login.png" target="_blank">Login ページ</a>  
<a href="https://raw.githubusercontent.com/totti-t2cctf/other_t2cctf/master/imgs/regist.png" target="_blank">Regist ページ</a>  
<a href="https://raw.githubusercontent.com/totti-t2cctf/other_t2cctf/master/imgs/dashboard.png" target="_blank">Dashboard ページ</a>  

またユーザーやチームなどの登録やセッション管理等も Node.js によって実装しています。  
T2CCTF 各種機能一覧は[簡易入門ページ](https://github.com/totti-t2cctf/basic_t2cctf)でご確認ください。

### 諸注意
基本的にフレームワーク等を利用せずにフルスクラッチで実装しております。  
これは単純に自身がCTFを運営するにあたり、インフラやサーバーのセキュリティを含む基本的なところから学びたいという意識があったためです。  
なので CTF を運営する側としてはあるまじき事ですが、現状なんらかの脆弱性を含む場合がございます。  
（サーバーへのアクセスを参加者のみに制限をかけていた等あり、参加者を信じてCSRF対策やXSS対策をしていません...ごめんなさい><）  
よって本システムを使用する上でなんらかの不備や問題があった場合、自己責任でお願い致します。  
また、今回実際に T2CCTF で使用された問題を例としていくつか残してあります。（厳密には #1, #4, #11, #23）  
全ての問題を公開しているわけではないのでご注意ください。（DEMO ページでは全ての問題が見られません。）

### サーバー環境
以下環境となります。少々古いバージョンのものあります。  
バージョンアップによる使用の変更等はご自身でご確認ください。

###### 今回使用しているもの（バージョンや細かいものは後述）
* OS           : Ubuntu 14.04 LTS 64bit版 日本語  
* 言語         : Node.js
* データベース : MongoDB
* WebGL        : three.js (r71)

###### バージョン情報
```
$ uname -a
Linux vm 3.13.0-24-generic #46-Ubuntu SMP Thu Apr 10 19:11:08 UTC 2014 x86_64 x86_64 x86_64 GNU/Linux

$ nodejs -v
v0.10.25

$ mongo --version
MongoDB shell version: 3.0.6
```

###### 環境構築
```
$ sudo apt-get update
$ sudo apt-get install nodejs npm
$ sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
$ echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
$ sudo apt-get update
$ sudo apt-get install -y mongodb-org
$ sudo apt-get install git
$ mkdir t2cctf_server
$ cd t2cctf_server
$ git clone https://github.com/totti-t2cctf/system_t2cctf.git
$ cd system_t2cctf
$ npm install mongodb
$ npm install cookie
$ npm install socket.io
$ npm install ejs
$ mongo t2cctfdb --quiet < insert_flags.js
```

### 実行方法
Ubuntu 14.04 LTS 64bit版（日本語）を何かしらでインストールしていただき、上記の環境構築を行なってもらった上で以下のコマンドを実行してください。  
※ IPアドレスとポートはデフォルトで以下のようになっています。IP や Port をご自身で設定しておきたい場合は各自エディタ等を用いて変更してください。(別のマシンからアクセスする場合は IP を設定する必要があります)  
IP : localhost  
Port : 1337  
```
nodejs t2cctf_server.js
```

これでブラウザにて localhost:1337 でアクセスしていただくか、ip(ubuntu):1337 でアクセスしていただければ起動している事が確認できると思います。  

※dashboard ページの coming soon ... について  
ここの coming soon ...は管理者ページである superuser.html から Send_URL! をクリックすると、各クライアントに URL が表示される形となっています。  
また一度送信すると次のページの更新時からは、 URL は表示されたままとなります。サーバーを立ち上げなおすと元の coming soon ... の状態へと戻ります。  


### 問題挿入方法
問題の挿入方法は何点か書きかえなければならない点があるためこちらのページでは説明を省略します。  
詳しくは上部の方で説明した[簡易入門ページ](https://github.com/totti-t2cctf/basic_t2cctf)でご確認ください。  

### おわりに
大学で HTML を習いはしたが CSS とか何それ状態の人間が今年(2015年)の3月頃から今回のシステム作成に取り組み始めました。  
なので不十分な知識や技術が散りばめられていると思いますが、何卒寛大な心でお許しください。  
ご指摘やご質問に関してですが、できるだけ github 上で受け答えしたいと思います。  
ですが github も初心者なものですから、迅速な対応は出来かねますのでご了承ください。  

最後になりますが、第二回 T2CCTF において学内 CTF に向けて無料でサーバー(ニフティクラウド)を貸し出して頂いたニフティ株式会社様に感謝致します。
