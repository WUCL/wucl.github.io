# 專案說明註記與資源參考

#### phase - todo
1. 確認基本畫面呈現內容
	1. 參考 APPLE iOS 天氣APP 製作
	2. 顯示 溫度（最大/最小/平均）、體感溫度（最大/最小）、降雨機率、濕度、風、紫外線、天氣描述
2. 降低 opendata api request 其中包含 Google api /CWB
	1. 將兩項資訊 1.座標（小數點後4碼判斷）與該對應地區 2.天氣預報 存到 localStorage 降低避免重複 request // 0724已完成
	2. 測試壓縮 localStorage 儲存容量 => 使用 lz-string 壓縮; weather 1687.82 KB -> 62.05 KB // 0724完成
	https://stackoverflow.com/questions/20773945/storing-compressed-json-data-in-local-storage
	https://pieroxy.net/blog/pages/lz-string/index.html
	https://github.com/pieroxy/lz-string/
3. 新增天氣圖形
	1. 依照中央氣象局提供的 天氣現象 Wx 代號 判斷如何做天氣圖像顯示
4. 確認 localStorage 更新頻率，針對 中央氣象局 更新為主
	1. 確認 request 內容更新頻率，是否主動要求更新
	2. 做 按鈕 ，主動 request 更新天氣預報內容
5. 一週天氣大略溫度與降雨機率

#### optimization todo or not - 優化 Vue
1. 測試 vue store 使用
https://cn.vuejs.org/v2/guide/state-management.html#%E7%AE%80%E5%8D%95%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86%E8%B5%B7%E6%AD%A5%E4%BD%BF%E7%94%A8

#### ref
1. 使用Google Map API (Geocoding API) 得到點位縣市鄉鎮資料
https://medium.com/@icelandcheng/%E4%BD%BF%E7%94%A8google-map-api-geocoding-api-%E5%BE%97%E5%88%B0%E9%BB%9E%E4%BD%8D%E7%B8%A3%E5%B8%82%E9%84%89%E9%8E%AE%E8%B3%87%E6%96%99-25bf5f0e4a21
2. Geocoding資源分享
https://medium.com/@shihwenwutw/geocoding%E8%B3%87%E6%BA%90%E5%88%86%E4%BA%AB-2e7614aba49

因為 google API 應用程式限制 似乎只能綁定ip，先試著改用 HERE
3. HERE - Reverse Geocode the District containing a Location
https://developer.here.com/documentation/examples/rest/geocoder/reverse-geocode-district

#### google api - Google Cloud Platform
1. request count
https://console.cloud.google.com/google/maps-apis/apis/geocoding-backend.googleapis.com/metrics?project=dosomethings-193716&hl=zh-tw&supportedpurview=project
2. billing
https://console.cloud.google.com/billing/006A84-764CB7-39FF1D/reports/cost-breakdown?project=dosomethings-193716
3. 訂價與方案
https://cloud.google.com/maps-platform/pricing?hl=zh-TW
4. 價目表
https://cloud.google.com/maps-platform/pricing?hl=zh-TW
Geocoding - 每月 $200 美元抵免額 對應的免費用量 - 最多 40,000 次呼叫

#### gov opendata
1. 氣象資料開放平臺
https://opendata.cwb.gov.tw/index
2. 氣象局 OpenData 抓取「目前天氣」、「天氣預報」
https://www.latech.tw/2018/03/opendata.html

3. 鄉鎮天氣預報-台灣未來1週天氣預報 - 用到
https://opendata.cwb.gov.tw/dataset/statisticDays/F-D0047-091
https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/F-D0047-091?Authorization=CWB-88D7AA92-6D43-431B-9E43-10642FE8C162&format=JSON
4. 一般天氣預報-一週縣市天氣預報
https://opendata.cwb.gov.tw/dataset/statisticDays/F-C0032-005
https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/F-C0032-005?Authorization=CWB-88D7AA92-6D43-431B-9E43-10642FE8C162&format=JSON
5. 鄉鎮天氣預報-台灣未來2天天氣預報 - 用到
https://opendata.cwb.gov.tw/dataset/statisticDays/F-D0047-089
https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/F-D0047-089?Authorization=CWB-88D7AA92-6D43-431B-9E43-10642FE8C162&format=JSON
