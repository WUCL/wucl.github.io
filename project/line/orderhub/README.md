[Name]
LINE/orderhub

-
[Language]
HTML
javascript
jQuery
css
scss

-

[Featured]
（壓縮檔內 public/ & index.html）

透過 LINE LIFF 連動 Google Sheet data
處理訂單事宜，包含訂單的新增/編輯
與未來延展的基本數據統計
另外也因為使用 LINE LIFF 所以也可以即時的在聊天視窗中做更新的動態（透過 messenger api）


-
[Google Sheet]
（壓縮檔內的 gas/）

這邊主要代碼是寫在Google Apps Script

=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

# Module-Gulp
此為 Gulp 的 Module 開發環境

#### 環境建置
電腦環境需安裝有 nodejs

- Step1. 於資料夾中執行 `npm install` 安裝套件
- Step2. 當安裝完成後執行 `gulp`
- Step3. 將自動開啟頁面，預設 `Port:1234`

#### 資料夾結構為
`/_ASSETS` ***主要放原始檔（包括設計原始檔、業務原始檔）***

`/dist` ***執行 gulp 最後輸出位置，都於此資料夾***
```
/dist/public  主要放靜態檔，會同步於 src 建立而產生內容
/dist/public/css
/dist/public/js
/dist/public/img
/dist/pubilc/lib  主要放置第三方用檔
/dist/public/index.html
```
`/src` ***gulp 主要讀取資料夾，結束後建立於資料夾 `/dist`***
```
/scr/scss 主要使用 scss 來完成 css
/src/js
/src/img
/src/tpl  放置 html 模組化使用
/src/index.html
```
`gulpfile.js`  ***gulp config***

#### 指令使用
`gulp`

*執行 gulp，開啟網頁並即時監測編譯*


`gulp view`

*執行 gulp，純看網頁開啟網頁*


`gulp build`

*執行 gulp，純編譯全部 `\src`*


----
##### by Allen
