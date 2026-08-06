import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const THEME = {
  primary: '#183451',
  accent: '#A9501C',
  bg: '#F3ECDE',
  sand: '#D4AF83'
};

// ☁️ 全團唯一固定的 Google Firebase 實時資料庫端點 (全手機 100% 互通)
const FIXED_FIREBASE_URL = "https://malaysia-trip-2026-ec3e3-default-rtdb.asia-southeast1.firebasedatabase.app/master_trip.json";
const LOCAL_BACKUP_KEY = "MY_MALAYSIA_TRIP_LOCAL_STORAGE_BACKUP_V5";

// 自動輪詢間隔 (毫秒) - 讓多裝置間更接近「即時」同步
const AUTO_POLL_INTERVAL_MS = 12000;

// 匯率 API：MYR 為基準幣別，免金鑰、支援 TWD
const EXCHANGE_RATE_URL = "https://open.er-api.com/v6/latest/MYR";
const RATE_CACHE_KEY = "MY_MALAYSIA_TRIP_RATE_CACHE_V1";

// 預設氣象
const DEFAULT_HOURLY_WEATHER = [
  { time: "00:00", temp: "26°", rain: "0%", icon: "🌙" },
  { time: "03:00", temp: "25°", rain: "0%", icon: "🌙" },
  { time: "06:00", temp: "26°", rain: "10%", icon: "🌤️" },
  { time: "09:00", temp: "29°", rain: "20%", icon: "☀️" },
  { time: "12:00", temp: "33°", rain: "30%", icon: "🌤️" },
  { time: "15:00", temp: "31°", rain: "70%", icon: "🌧️" },
  { time: "18:00", temp: "28°", rain: "40%", icon: "⛅" },
  { time: "21:00", temp: "27°", rain: "10%", icon: "🌙" }
];

// 完整 8 天行程 (依據使用者提供的行程表整理，景點皆補上簡介)
const MASTER_ITINERARY = [
  {
    day: "8/15 Sat.", title: "臺灣 → 吉隆坡", city: "吉隆坡", lat: 3.1390, lng: 101.6869,
    items: [
      { id: "1-1", time: "06:45 前", name: "家 → 桃園機場", type: "交通", note: "辦理登機手續", map: "", img: "" },
      { id: "1-2", time: "08:45 - 13:25", name: "華航 CI72 航班 (08:45 起飛 → 13:25 抵達)", type: "交通", note: "抵達吉隆坡國際機場", map: "", img: "" },
      { id: "1-3", time: "14:20 - 15:10", name: "【機場快線】機場 → 市區", type: "交通", note: "車程約 30 分鐘", map: "", img: "" },
      { id: "1-4", time: "15:10 - 16:00", name: "Check-in｜吉隆坡豪亞酒店式公寓", type: "住宿", note: "遠東集團酒店式公寓辦理入住", map: "https://maps.app.goo.gl/HWipQ6etWXGk3qdp8", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80" },
      { id: "1-5", time: "16:00 - 16:55", name: "【火車 / Grab】前往黑風洞", type: "交通", note: "可搭乘 Seremban Line 火車往 Batu Caves 方向", map: "", img: "" },
      { id: "1-6", time: "16:55 - 18:45", name: "黑風洞 (Batu Caves)", type: "景點", note: "供奉印度教戰神穆魯干的石灰岩山洞聖地，272 階彩虹階梯是熱門拍照地標，內部主洞穴挑高巨大、終年香煙裊裊。營業時間 07:00-21:00，請著過膝長褲/裙入內。", map: "https://maps.app.goo.gl/4VH85Uz17DKdey1b6", img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80" },
      { id: "1-7", time: "18:45 - 19:30", name: "附近下午茶", type: "飲食", note: "黑風洞周邊稍作休息、補充水分", map: "", img: "" },
      { id: "1-8", time: "19:30 - 20:10", name: "【火車 / Grab】前往亞羅街", type: "交通", note: "", map: "", img: "" },
      { id: "1-9", time: "20:10 - 22:00", name: "【晚餐】麗豐啦啦米 / 亞羅街美食街", type: "飲食", note: "必吃鮮味啦啦米粉與燒雞翅", map: "https://maps.app.goo.gl/doRqhPSg5X6EmYaJ8", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80" },
      { id: "1-10", time: "22:00 - 22:30", name: "吉隆坡城中城公園 (KLCC Park)", type: "景點", note: "位於雙子星塔正下方的都市綠洲，夜晚可近距離仰望雙子星塔燈光與噴泉水舞秀，是拍攝地標夜景的經典角度。", map: "https://maps.app.goo.gl/3Jg9NDVbQwaUjGVq6", img: "" },
      { id: "1-11", time: "22:30 -", name: "Rest｜吉隆坡豪亞酒店式公寓", type: "住宿", note: "返回酒店休息", map: "https://maps.app.goo.gl/HWipQ6etWXGk3qdp8", img: "" }
    ]
  },
  {
    day: "8/16 Sun.", title: "布城 & 馬六甲古城巡禮", city: "馬六甲", lat: 2.1896, lng: 102.2501,
    items: [
      { id: "2-1", time: "08:30 - 09:30", name: "【早餐】", type: "飲食", note: "", map: "", img: "" },
      { id: "2-2", time: "09:30 - 10:00", name: "包車出發，前往布城 (Putrajaya)", type: "交通", note: "車程約 30 分鐘", map: "", img: "" },
      { id: "2-3", time: "10:00 - 10:45", name: "粉紅清真寺 (布城水上清真寺)", type: "景點", note: "座落於布城人工湖畔，以粉紅色花崗岩打造而成，故有「粉紅清真寺」之稱，是馬來西亞極具代表性的水上清真寺。", map: "", img: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80" },
      { id: "2-4", time: "10:45 - 11:15", name: "布特拉橋 (Putra Bridge)", type: "景點", note: "仿阿拉伯風格設計的五拱橋，橫跨布城湖，橋上可眺望粉紅清真寺與布城的行政建築群。", map: "", img: "" },
      { id: "2-5", time: "11:15 - 13:45", name: "【包車移動】前往馬六甲", type: "交通", note: "車程約 2.5 小時", map: "", img: "" },
      { id: "2-6", time: "13:45 - 14:15", name: "馬六甲海峽清真寺", type: "景點", note: "建於人工島上的水上清真寺，漲潮時彷彿漂浮於馬六甲海峽海面上，是欣賞海峽日落的知名地點。", map: "", img: "" },
      { id: "2-7", time: "14:15 - 14:45", name: "【包車移動】前往馬六甲古城區", type: "交通", note: "車程約 30 分鐘", map: "", img: "" },
      { id: "2-8", time: "14:45 - 16:15", name: "荷蘭紅屋 & 聖地牙哥城堡", type: "景點", note: "荷蘭紅屋 (Stadthuys) 是東南亞現存最古老的荷蘭建築群，磚紅色外牆極具特色；聖地牙哥城堡 (A Famosa) 則是 16 世紀葡萄牙人所建城堡的遺跡，兩者皆為馬六甲世界文化遺產的重要地標。", map: "", img: "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=600&q=80" },
      { id: "2-9", time: "19:00 - 22:00", name: "雞場街夜市 (Jonker Street)", type: "景點", note: "馬六甲最熱鬧的週末夜市，沿街可品嚐娘惹糕點、海南雞飯粒等在地小吃，也能挖寶古董與手工藝品，晚餐可於此解決。", map: "", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80" },
      { id: "2-10", time: "22:00 - 00:30", name: "【包車移動】返回吉隆坡", type: "交通", note: "車程約 2.5 小時", map: "", img: "" },
      { id: "2-11", time: "00:30 -", name: "Rest｜吉隆坡豪亞酒店式公寓", type: "住宿", note: "返回酒店休息", map: "https://maps.app.goo.gl/HWipQ6etWXGk3qdp8", img: "" }
    ]
  },
  {
    day: "8/17 Mon.", title: "吉隆坡城市漫遊", city: "吉隆坡", lat: 3.1390, lng: 101.6869,
    items: [
      { id: "3-1", time: "09:00 - 09:30", name: "Ready｜吉隆坡豪亞酒店式公寓 (收拾行李)", type: "住宿", note: "當晚需換房，請收好行李", map: "https://maps.app.goo.gl/HWipQ6etWXGk3qdp8", img: "" },
      { id: "3-2", time: "09:30 - 10:30", name: "【早餐】", type: "飲食", note: "", map: "", img: "" },
      { id: "3-3", time: "10:30 - 12:00", name: "樂聖嶺天后宮", type: "景點", note: "建於樂聖嶺上的媽祖廟，是東南亞規模數一數二的中式廟宇建築，六角形主殿搭配上千盞紅燈籠，是熱門的祈福與拍照景點。", map: "", img: "" },
      { id: "3-4", time: "12:00 - 13:30", name: "獨立廣場 (Merdeka Square)", type: "景點", note: "1957 年馬來西亞在此宣布獨立，廣場周邊環繞著英式殖民時期的摩爾式建築，草坪上的旗桿曾是全球最高的旗桿之一。", map: "", img: "" },
      { id: "3-5", time: "13:30 - 14:45", name: "【午餐】", type: "飲食", note: "", map: "", img: "" },
      { id: "3-6", time: "14:45 - 16:30", name: "中央市場 (Central Market)", type: "景點", note: "建於 1888 年的 Art Deco 風格建築，現已改建為文創手作與紀念品市集，是感受馬來西亞多元文化與選購伴手禮的好去處。營業時間 10:00-22:00。", map: "https://maps.app.goo.gl/smpbQKkoT5YwFAGq7", img: "" },
      { id: "3-7", time: "16:30 - 19:00", name: "柏威年廣場 (Pavilion KL)", type: "景點", note: "武吉免登 (Bukit Bintang) 區的指標型高端百貨，聚集眾多國際精品與美食餐廳，是吉隆坡最熱門的購物地標之一。", map: "https://maps.app.goo.gl/Rf7sEgBUhrixPdx97", img: "" },
      { id: "3-8", time: "19:00 - 21:30", name: "【晚餐】亞羅街夜市 (Jalan Alor)", type: "飲食", note: "吉隆坡最著名的美食街，入夜後兩側攤販林立、燈火通明，沙嗲、炒粿條、燒雞翅都是必吃美食。", map: "https://maps.app.goo.gl/jzcuhW96KAtXym5C9", img: "" },
      { id: "3-9", time: "21:30 -", name: "Rest｜吉隆坡豪亞酒店式公寓", type: "住宿", note: "", map: "https://maps.app.goo.gl/HWipQ6etWXGk3qdp8", img: "" }
    ]
  },
  {
    day: "8/18 Tue.", title: "吉隆坡 → 檳城喬治市", city: "檳城", lat: 5.4141, lng: 100.3288,
    items: [
      { id: "4-1", time: "09:00", name: "Ready｜吉隆坡豪亞酒店式公寓", type: "住宿", note: "收拾行李準備退房", map: "https://maps.app.goo.gl/HWipQ6etWXGk3qdp8", img: "" },
      { id: "4-2", time: "09:00 - 10:45", name: "【早餐】chaFei Wisma Cosway 咖椰多士", type: "飲食", note: "美味咖椰吐司", map: "https://maps.app.goo.gl/goNaQNtVyjhxcSERA", img: "" },
      { id: "4-3", time: "10:45 - 11:00", name: "Check-out｜吉隆坡豪亞酒店式公寓", type: "住宿", note: "", map: "https://maps.app.goo.gl/HWipQ6etWXGk3qdp8", img: "" },
      { id: "4-4", time: "11:00 - 11:15", name: "【步行】前往吉隆坡中央車站", type: "交通", note: "步行約 15 分鐘", map: "", img: "" },
      { id: "4-5", time: "11:40 - 15:15", name: "【火車】吉隆坡中央車站 → 檳城北海車站", type: "交通", note: "乘坐 ETS 高速火車，車票已購買", map: "", img: "" },
      { id: "4-6", time: "15:15 - 15:40", name: "【步行】前往渡輪站 Penang Sentral", type: "交通", note: "", map: "", img: "" },
      { id: "4-7", time: "16:00 - 16:20", name: "【渡輪】前往喬治市", type: "交通", note: "", map: "", img: "" },
      { id: "4-8", time: "16:20 - 17:00", name: "Check-in｜檳城雙威喬治市酒店", type: "住宿", note: "", map: "https://maps.app.goo.gl/NqEmnTULihQ4FVVy9", img: "" },
      { id: "4-9", time: "17:30 - 18:20", name: "姓氏橋 (Clan Jetties)", type: "景點", note: "喬治市沿海而建的水上木屋聚落，由不同姓氏的華人家族世代居住而得名，是聯合國教科文組織世界遺產的一部分，傍晚時分是欣賞日落的絕佳地點。", map: "https://maps.app.goo.gl/E5ENPqHFHnBiiUeb9", img: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80" },
      { id: "4-10", time: "18:20 - 19:30", name: "【晚餐】", type: "飲食", note: "", map: "", img: "" },
      { id: "4-11", time: "19:30 -", name: "逛超市 Giant Penang Plaza", type: "景點", note: "採買零食伴手禮", map: "https://maps.app.goo.gl/zi2r7GcbqgAFeX4A6", img: "" }
    ]
  },
  {
    day: "8/19 Wed.", title: "檳城自然探索", city: "檳城", lat: 5.4141, lng: 100.3288,
    items: [
      { id: "5-1", time: "09:00", name: "Ready｜檳城雙威喬治市酒店", type: "住宿", note: "", map: "https://maps.app.goo.gl/NqEmnTULihQ4FVVy9", img: "" },
      { id: "5-2", time: "09:00 - 10:00", name: "【早餐】", type: "飲食", note: "", map: "", img: "" },
      { id: "5-3", time: "10:50 - 14:00", name: "檳城升旗山 The Habitat 生態公園", type: "景點", note: "搭乘纜車登上檳城最高點升旗山，園區內設有雨林空中步道與觀景台，可俯瞰喬治市與海峽全景，享受涼爽的高地氣候。Klook 門票已購買。", map: "https://maps.app.goo.gl/n3zDSQiEk6sqeCD26", img: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80" },
      { id: "5-4", time: "14:00 - 14:30", name: "【Grab】前往植物園", type: "交通", note: "", map: "", img: "" },
      { id: "5-5", time: "15:00 - 16:10", name: "檳城植物園 (Penang Botanic Gardens)", type: "景點", note: "又稱瀑布花園，是超過百年歷史的熱帶植物園，園內綠意盎然、隨處可見野生獼猴出沒，是市區內難得的自然喘息角落。", map: "", img: "" },
      { id: "5-6", time: "16:10 - 16:25", name: "【Grab】前往葛尼廣場", type: "交通", note: "", map: "", img: "" },
      { id: "5-7", time: "16:25 - 18:00", name: "葛尼廣場 (Gurney Plaza)", type: "景點", note: "鄰近葛尼海濱的大型購物中心，商場林立、餐廳選擇豐富，也是欣賞海濱夕陽的好地點。", map: "", img: "" },
      { id: "5-8", time: "18:00 -", name: "【晚餐】", type: "飲食", note: "", map: "", img: "" },
      { id: "5-9", time: "夜間", name: "Rest｜檳城雙威喬治市酒店", type: "住宿", note: "", map: "https://maps.app.goo.gl/NqEmnTULihQ4FVVy9", img: "" }
    ]
  },
  {
    day: "8/20 Thu.", title: "檳城人文漫遊", city: "檳城", lat: 5.4141, lng: 100.3288,
    items: [
      { id: "6-1", time: "09:00", name: "Ready｜檳城雙威喬治市酒店", type: "住宿", note: "", map: "https://maps.app.goo.gl/NqEmnTULihQ4FVVy9", img: "" },
      { id: "6-2", time: "09:00 - 10:00", name: "【早餐】", type: "飲食", note: "", map: "", img: "" },
      { id: "6-3", time: "10:00 - 12:00", name: "張弼士故居 + 檳島市政廳 + 娘惹博物館", type: "景點", note: "張弼士故居 (藍屋) 是南洋首富張弼士所建的靛藍色豪宅，融合中西建築工藝；娘惹博物館則完整呈現土生華人 (峇峇娘惹) 的生活文化與古董收藏，兩者皆是認識檳城多元文化的重要景點。", map: "", img: "" },
      { id: "6-4", time: "12:00 - 13:45", name: "【午餐】", type: "飲食", note: "", map: "", img: "" },
      { id: "6-5", time: "13:45 - 15:30", name: "喬治市壁畫街 + 亞美尼亞街 + 小印度", type: "景點", note: "喬治市老街區以街頭壁畫聞名，「姐弟共騎腳踏車」等作品是熱門打卡地標；沿路穿梭至亞美尼亞街與小印度，可感受殖民建築、香料市集與印度廟宇交織的多元風情。", map: "", img: "" },
      { id: "6-6", time: "15:30 - 16:30", name: "【下午茶】", type: "飲食", note: "", map: "", img: "" },
      { id: "6-7", time: "16:30 - 18:00", name: "孫中山檳城基地紀念館", type: "景點", note: "孫中山先生早年在檳城策劃革命行動的基地舊址，館內保存當年革命相關文物與史料，見證檳城與辛亥革命的歷史淵源。", map: "", img: "" },
      { id: "6-8", time: "18:00 - 19:50", name: "光大大廈 68 樓彩虹步道 (Top 68 KOMTAR)", type: "景點", note: "位於檳城地標建築光大大廈頂樓的透明玻璃天空步道，可 360 度俯瞰喬治市與海峽全景，是欣賞日落與夜景的高空景點。已購票。", map: "", img: "" },
      { id: "6-9", time: "19:50 -", name: "【晚餐】", type: "飲食", note: "", map: "", img: "" },
      { id: "6-10", time: "夜間", name: "Rest｜檳城雙威喬治市酒店", type: "住宿", note: "", map: "https://maps.app.goo.gl/NqEmnTULihQ4FVVy9", img: "" }
    ]
  },
  {
    day: "8/21 Fri.", title: "檳城海灘渡假", city: "檳城", lat: 5.4667, lng: 100.2452,
    items: [
      { id: "7-1", time: "09:00", name: "Ready｜檳城雙威喬治市酒店", type: "住宿", note: "退房前收拾行李", map: "https://maps.app.goo.gl/NqEmnTULihQ4FVVy9", img: "" },
      { id: "7-2", time: "09:00 - 10:00", name: "【早餐】", type: "飲食", note: "", map: "", img: "" },
      { id: "7-3", time: "10:00 - 10:30", name: "【Grab】前往香格里拉金沙酒店", type: "交通", note: "", map: "", img: "" },
      { id: "7-4", time: "10:30 - 11:00", name: "Check-in｜檳城香格里拉金沙酒店", type: "住宿", note: "海灘渡假飯店入住", map: "https://maps.app.goo.gl/Pn9N6CRjeMv7c2Ks9", img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80" },
      { id: "7-5", time: "11:00 - 14:00", name: "熱帶香料花園 (Tropical Spice Garden)", type: "景點", note: "佔地廣闊的熱帶植物園，園內種植數百種香料與藥用植物，沿著林蔭步道漫遊，能認識東南亞香料文化的起源。", map: "", img: "" },
      { id: "7-6", time: "14:00 - 15:00", name: "【午餐】", type: "飲食", note: "", map: "", img: "" },
      { id: "7-7", time: "15:00 - 18:00", name: "Relax｜檳城香格里拉金沙酒店", type: "住宿", note: "享用飯店設施、休息睡覺", map: "https://maps.app.goo.gl/Pn9N6CRjeMv7c2Ks9", img: "" },
      { id: "7-8", time: "18:00 -", name: "峇都丁宜海灘 (Batu Ferringhi)", type: "景點", note: "檳城最知名的度假海灘，沿岸飯店林立，黃昏時分的落日景色相當迷人，晚上沿海灘也有夜市可逛。", map: "", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
      { id: "7-9", time: "19:30 - 20:30", name: "【晚餐】", type: "飲食", note: "", map: "", img: "" },
      { id: "7-10", time: "夜間", name: "Rest｜檳城香格里拉金沙酒店", type: "住宿", note: "", map: "https://maps.app.goo.gl/Pn9N6CRjeMv7c2Ks9", img: "" }
    ]
  },
  {
    day: "8/22 Sat.", title: "檳城 → 臺灣", city: "檳城", lat: 5.2971, lng: 100.2768,
    items: [
      { id: "8-1", time: "08:30 - 09:30", name: "早餐：飯店享用", type: "飲食", note: "", map: "", img: "" },
      { id: "8-2", time: "09:30 - 11:00", name: "Ready｜檳城香格里拉金沙酒店", type: "住宿", note: "退房、收拾行李", map: "https://maps.app.goo.gl/Pn9N6CRjeMv7c2Ks9", img: "" },
      { id: "8-3", time: "11:00 - 12:00", name: "前往市區用餐地點", type: "交通", note: "", map: "", img: "" },
      { id: "8-4", time: "12:00 - 13:10", name: "【午餐】", type: "飲食", note: "", map: "", img: "" },
      { id: "8-5", time: "13:10 - 13:30", name: "前往檳城國際機場", type: "交通", note: "", map: "", img: "" },
      { id: "8-6", time: "15:10 - 19:55", name: "華航 CI732 (15:10 起飛 → 19:55 抵達)", type: "交通", note: "順利返抵桃園國際機場！", map: "", img: "" }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // 1. React 狀態（從 LocalStorage 快存啟動，絕不白屏）
  const [itinerary, setItinerary] = useState(() => {
    const saved = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (saved) {
      try { return JSON.parse(saved).itinerary || MASTER_ITINERARY; } catch (e) {}
    }
    return MASTER_ITINERARY;
  });

  const [members, setMembers] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (saved) {
      try { return JSON.parse(saved).members || ['我', '成員A', '成員B']; } catch (e) {}
    }
    return ['我', '成員A', '成員B'];
  });

  const [expenses, setExpenses] = useState<any[]>(() => {
    const saved = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).expenses || [
          { id: 1, date: '8/15', item: '機場快線車票', amount: 220, currency: 'MYR', splitFor: ['我', '成員A', '成員B'], note: '全團車票' },
          { id: 2, date: '8/15', item: '亞羅街海鮮晚餐', amount: 180, currency: 'MYR', splitFor: ['我', '成員A', '成員B'], note: '晚餐' }
        ];
      } catch (e) {}
    }
    return [
      { id: 1, date: '8/15', item: '機場快線車票', amount: 220, currency: 'MYR', splitFor: ['我', '成員A', '成員B'], note: '全團車票' },
      { id: 2, date: '8/15', item: '亞羅街海鮮晚餐', amount: 180, currency: 'MYR', splitFor: ['我', '成員A', '成員B'], note: '晚餐' }
    ];
  });

  // ☁️ 雲端狀態與提示
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'success' | 'error'>('syncing');
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  // 記錄本地資料最後一次變更的時間戳，用來避免「輪詢拉取」把還沒推送成功的最新編輯蓋掉
  const [localUpdatedAt, setLocalUpdatedAt] = useState(0);

  // 📱 個人手機獨立清單 (localStorage)
  const [prepList, setPrepList] = useState(() => {
    const saved = localStorage.getItem('my_malaysia_prep');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    const defaultPrepItems = [
      "輕便透氣衣物", "薄外套 / 防曬罩衫", "泳衣", "好走的涼鞋 / 運動鞋", "雨具", "太陽眼鏡",
      "行動電源、充電器", "萬用轉接頭", "台幣千元鈔", "下載 Grab，並事先綁定信用卡",
      "實體 sim 卡", "防蚊液", "防曬乳", "常備藥品"
    ];
    return defaultPrepItems.map((text, idx) => ({ id: idx + 1, cat: "個人物品", text, done: false }));
  });
  const [newPrepText, setNewPrepText] = useState('');
  const [newPrepCat] = useState('個人物品');

  const [shoppingList, setShoppingList] = useState(() => {
    const saved = localStorage.getItem('my_malaysia_shopping');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return [
      { id: 1, name: "舊街場白咖啡 (OldTown)", bought: false },
      { id: 2, name: "Beryl's 巧克力", bought: false }
    ];
  });
  const [newShopName, setNewShopName] = useState('');

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  useEffect(() => { localStorage.setItem('my_malaysia_prep', JSON.stringify(prepList)); }, [prepList]);
  useEffect(() => { localStorage.setItem('my_malaysia_shopping', JSON.stringify(shoppingList)); }, [shoppingList]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // 深複製小工具：避免物件參照被意外共用、造成「明明存了卻沒真的變」的怪異 bug
  const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

  // ☁️ 100% 全球同一通道 Firebase 雲端讀取
  const pullFromCloud = async (isManualRetry = false) => {
    if (isManualRetry) setSyncStatus('syncing');
    try {
      const res = await fetch(`${FIXED_FIREBASE_URL}?_ts=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const cloudObj = await res.json();
        if (cloudObj && cloudObj.itinerary) {
          // 如果本地才剛剛編輯過、還沒確定推送成功，避免輪詢把畫面蓋回舊版
          const cloudUpdatedAt = cloudObj.updatedAt || 0;
          if (cloudUpdatedAt >= localUpdatedAt) {
            setItinerary(cloudObj.itinerary);
            if (cloudObj.expenses) setExpenses(cloudObj.expenses);
            if (cloudObj.members) setMembers(cloudObj.members);
            localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(cloudObj));
          }
          setSyncStatus('success');
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSyncTime(timeStr);

          if (isManualRetry) {
            alert(`🟢 全球雲端連線成功！\n\n- 通道：Google Firebase 固定端點\n- 最新同步時間：${timeStr}\n- 雲端行程天數：${cloudObj.itinerary.length} 天\n- 雲端花費筆數：${(cloudObj.expenses || []).length} 筆\n\n其他同行手機只要整理網頁，即可看到此最新數據！`);
          }
          return true;
        } else if (cloudObj === null) {
          // 如果雲端尚未有資料，把本地預設行程推上去初始化
          await pushToCloud(itinerary, expenses, members);
          return true;
        }
      } else {
        console.error('Pull cloud non-ok status:', res.status);
        if (isManualRetry) {
          alert(`🔴 雲端連線失敗 (HTTP ${res.status})。\n\n最常見原因：Firebase Realtime Database 的「安全性規則 (Rules)」目前不允許公開讀寫。\n請至 Firebase 主控台 → Realtime Database → Rules，確認設定為：\n{"rules": {".read": true, ".write": true}}\n\n（測試模式的規則預設 30 天後就會失效，需要手動改成上面這樣才能讓所有裝置永久互通）`);
        }
      }
    } catch (e) {
      console.error('Pull cloud error:', e);
    }

    setSyncStatus('error');
    if (isManualRetry) {
      alert('🔴 雲端連線失敗，已自動啟用手機本地快存。\n💡 請檢查手機網路，連線恢復時將自動同步。');
    }
    return false;
  };

  // ☁️ 100% 全球同一通道 Firebase 雲端寫入 (PUT)
  const pushToCloud = async (newItinerary?: any, newExpenses?: any, newMembers?: any) => {
    const targetItinerary = newItinerary !== undefined ? newItinerary : itinerary;
    const targetExpenses = newExpenses !== undefined ? newExpenses : expenses;
    const targetMembers = newMembers !== undefined ? newMembers : members;

    const stamp = Date.now();
    setLocalUpdatedAt(stamp);

    // 1. 先更新本地 State 與備份 (立即反應在畫面上)
    if (newItinerary !== undefined) setItinerary(targetItinerary);
    if (newExpenses !== undefined) setExpenses(targetExpenses);
    if (newMembers !== undefined) setMembers(targetMembers);

    const payload = {
      itinerary: targetItinerary,
      expenses: targetExpenses,
      members: targetMembers,
      updatedAt: stamp
    };
    localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(payload));

    // 2. 直連推送到全團唯一的 Firebase 雲端點
    setSyncStatus('syncing');
    try {
      const res = await fetch(FIXED_FIREBASE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSyncStatus('success');
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(timeStr);
        showToast('☁️ 已即時同步至全團共享雲端！');
        return;
      } else {
        console.error('Push cloud non-ok status:', res.status);
        showToast(`⚠️ 雲端寫入失敗 (HTTP ${res.status})，請確認 Firebase 規則`);
      }
    } catch (e) {
      console.error('Push cloud error:', e);
      showToast('⚠️ 雲端寫入失敗，請檢查網路連線');
    }

    setSyncStatus('error');
  };

  // 網頁開啟時 + 切換視窗時 + 每隔一段時間自動抓取全團最新雲端資料
  useEffect(() => {
    pullFromCloud(false);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') pullFromCloud(false);
    };
    window.addEventListener('visibilitychange', handleVisibility);

    // 定時輪詢，讓其他裝置不用手動切換視窗也能較快看到更新
    const pollId = setInterval(() => {
      if (document.visibilityState === 'visible') pullFromCloud(false);
    }, AUTO_POLL_INTERVAL_MS);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(pollId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🌤️ 動態即時氣象 (若尚無可靠預報資料，不顯示假資料，改顯示提示文字)
  // 注意：只在「切換日期分頁」時才重新抓取／捲動，避免雲端輪詢造成畫面一直跳回目前時間
  const [hourlyWeather, setHourlyWeather] = useState(DEFAULT_HOURLY_WEATHER);
  const [weatherStatus, setWeatherStatus] = useState<'loading' | 'ok' | 'unavailable'>('loading');

  useEffect(() => {
    const currentDay = itinerary[selectedDayIdx];
    if (!currentDay) return;

    setWeatherStatus('loading');
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${currentDay.lat}&longitude=${currentDay.lng}&hourly=temperature_2m,precipitation_probability,weathercode&timezone=Asia%2FKuala_Lumpur`)
      .then(res => res.json())
      .then(data => {
        if (data && data.hourly && data.hourly.time && data.hourly.time.length >= 24) {
          const list = [];
          for (let i = 0; i < 24; i++) {
            if (data.hourly.time[i]) {
              const hourStr = `${i.toString().padStart(2, '0')}:00`;
              const rain = data.hourly.precipitation_probability[i] || 0;
              const temp = Math.round(data.hourly.temperature_2m[i]);
              let icon = "☀️";
              if (rain > 60) icon = "🌧️";
              else if (rain > 30) icon = "⛅";
              else if (i < 6 || i >= 19) icon = "🌙";
              else if (temp > 32) icon = "🌤️";

              list.push({ time: hourStr, temp: `${temp}°`, rain: `${rain}%`, icon: icon });
            }
          }
          if (list.length === 24) {
            setHourlyWeather(list);
            setWeatherStatus('ok');
            // 只在這次抓取完成時捲動一次到目前時間，之後不會再自動跳動
            const klHour = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', hour12: false }).format(new Date()), 10);
            const nearestIdx = list.findIndex(hw => parseInt(hw.time.split(':')[0], 10) === klHour);
            const idx = nearestIdx >= 0 ? nearestIdx : 0;
            setTimeout(() => {
              const el = document.getElementById(`weather-hour-${idx}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }, 150);
          } else {
            setWeatherStatus('unavailable');
          }
        } else {
          setWeatherStatus('unavailable');
        }
      })
      .catch(() => setWeatherStatus('unavailable'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayIdx]);

  // 💱 馬幣 ↔ 台幣 即時匯率換算工具
  const [rateInfo, setRateInfo] = useState<{ rate: number | null; updatedAt: string; error: boolean }>(() => {
    const saved = localStorage.getItem(RATE_CACHE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { rate: parsed.rate || null, updatedAt: parsed.updatedAt || '', error: false };
      } catch (e) {}
    }
    return { rate: null, updatedAt: '', error: false };
  });
  const [rateLoading, setRateLoading] = useState(false);
  const [amountMYR, setAmountMYR] = useState('100');
  const [amountTWD, setAmountTWD] = useState('');

  const fetchExchangeRate = async (isManual = false) => {
    setRateLoading(true);
    try {
      const res = await fetch(EXCHANGE_RATE_URL);
      const data = await res.json();
      const twdRate = data?.rates?.TWD;
      if (twdRate) {
        const timeStr = new Date().toLocaleString('zh-TW', { hour12: false });
        const info = { rate: twdRate, updatedAt: timeStr, error: false };
        setRateInfo(info);
        localStorage.setItem(RATE_CACHE_KEY, JSON.stringify(info));
      } else {
        setRateInfo(prev => ({ ...prev, error: true }));
        if (isManual) alert('🔴 匯率資料格式異常，請稍後再試');
      }
    } catch (e) {
      console.error('Exchange rate fetch error:', e);
      setRateInfo(prev => ({ ...prev, error: true }));
      if (isManual) alert('🔴 匯率查詢失敗，請檢查網路連線');
    }
    setRateLoading(false);
  };

  useEffect(() => {
    fetchExchangeRate(false);
    const rateInterval = setInterval(() => fetchExchangeRate(false), 30 * 60 * 1000); // 每 30 分鐘自動更新一次
    return () => clearInterval(rateInterval);
  }, []);

  useEffect(() => {
    if (!rateInfo.rate) return;
    const myrNum = parseFloat(amountMYR);
    if (!isNaN(myrNum)) {
      setAmountTWD((myrNum * rateInfo.rate).toFixed(2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateInfo.rate]);

  const handleMYRChange = (val: string) => {
    setAmountMYR(val);
    const num = parseFloat(val);
    if (!isNaN(num) && rateInfo.rate) {
      setAmountTWD((num * rateInfo.rate).toFixed(2));
    } else {
      setAmountTWD('');
    }
  };

  const handleTWDChange = (val: string) => {
    setAmountTWD(val);
    const num = parseFloat(val);
    if (!isNaN(num) && rateInfo.rate) {
      setAmountMYR((num / rateInfo.rate).toFixed(2));
    } else {
      setAmountMYR('');
    }
  };

  // UI State
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedItemIdx, setDraggedItemIdx] = useState<number | null>(null);
  const [filterMember, setFilterMember] = useState(() => members[0] || '');
  const [newMemberInput, setNewMemberInput] = useState('');

  const [editingSpot, setEditingSpot] = useState<any>(null);
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);
  const [newSpot, setNewSpot] = useState({ name: '', time: '', type: '景點', note: '', map: '', img: '' });
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [newExpense, setNewExpense] = useState({ item: '', amount: '', currency: 'MYR', selectedMembers: [] as string[], splitMode: 'equal' as 'equal' | 'custom', customAmounts: {} as Record<string, string>, note: '' });

  // 行程順序微調
  const handleMoveSpot = (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= itinerary[selectedDayIdx].items.length) return;

    const updatedItinerary = deepClone(itinerary);
    const currentItems = updatedItinerary[selectedDayIdx].items;
    const [movedItem] = currentItems.splice(currentIndex, 1);
    currentItems.splice(targetIndex, 0, movedItem);

    pushToCloud(updatedItinerary, expenses, members);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => { if (!isEditMode) return; setDraggedItemIdx(index); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent, dropTargetIdx: number) => {
    e.preventDefault();
    if (!isEditMode || draggedItemIdx === null || draggedItemIdx === dropTargetIdx) return;
    const updatedItinerary = deepClone(itinerary);
    const currentItems = updatedItinerary[selectedDayIdx].items;
    const [movedItem] = currentItems.splice(draggedItemIdx, 1);
    currentItems.splice(dropTargetIdx, 0, movedItem);

    pushToCloud(updatedItinerary, expenses, members);
    setDraggedItemIdx(null);
  };

  const handleDeleteSpot = (spotId: string) => {
    if (!confirm('確定刪除此行程嗎？')) return;
    const updatedItinerary = deepClone(itinerary);
    updatedItinerary[selectedDayIdx].items = updatedItinerary[selectedDayIdx].items.filter((item: any) => item.id !== spotId);
    pushToCloud(updatedItinerary, expenses, members);
  };

  const handleSaveEditSpot = () => {
    if (!editingSpot) return;
    const updatedItinerary = deepClone(itinerary);
    const currentItems = updatedItinerary[selectedDayIdx].items;
    const idx = currentItems.findIndex((item: any) => item.id === editingSpot.id);
    if (idx !== -1) {
      currentItems[idx] = { ...editingSpot };
      pushToCloud(updatedItinerary, expenses, members);
    }
    setEditingSpot(null);
  };

  const handleAddSpotSubmit = () => {
    if (!newSpot.name) return;
    const updatedItinerary = deepClone(itinerary);
    updatedItinerary[selectedDayIdx].items.push({ ...newSpot, id: Date.now().toString() });
    pushToCloud(updatedItinerary, expenses, members);
    setNewSpot({ name: '', time: '', type: '景點', note: '', map: '', img: '' });
    setShowAddSpotModal(false);
  };

  // 團員管理
  const handleRenameMember = (oldName: string) => {
    const newName = prompt(`請輸入成員【${oldName}】的新名字：`, oldName);
    if (!newName || !newName.trim() || newName.trim() === oldName) return;
    const trimmed = newName.trim();
    const newMembers = members.map(m => m === oldName ? trimmed : m);
    const newExpenses = expenses.map(e => ({ ...e, splitFor: e.splitFor.map((s: string) => s === oldName ? trimmed : s) }));
    pushToCloud(itinerary, newExpenses, newMembers);
    if (filterMember === oldName) setFilterMember(trimmed);
  };

  const handleAddMember = () => {
    if (!newMemberInput.trim()) return;
    if (members.includes(newMemberInput.trim())) return alert('成員已存在');
    const newMembers = [...members, newMemberInput.trim()];
    pushToCloud(itinerary, expenses, newMembers);
    setNewMemberInput('');
  };

  const handleDeleteMember = (target: string) => {
    if (members.length <= 1) return alert('請至少留一位成員');
    if (confirm(`確定刪除成員【${target}】嗎？`)) {
      const newMembers = members.filter(m => m !== target);
      pushToCloud(itinerary, expenses, newMembers);
      if (filterMember === target) setFilterMember(newMembers[0] || '');
    }
  };

  // 成員排序：拖移 (桌機) + 上下箭頭 (手機更穩定好用)
  const [draggedMemberIdx, setDraggedMemberIdx] = useState<number | null>(null);

  const handleMoveMember = (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;
    const newMembers = [...members];
    const [moved] = newMembers.splice(currentIndex, 1);
    newMembers.splice(targetIndex, 0, moved);
    pushToCloud(itinerary, expenses, newMembers);
  };

  const handleMemberDragStart = (e: React.DragEvent, index: number) => {
    if (!isEditMode) return;
    setDraggedMemberIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleMemberDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleMemberDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!isEditMode || draggedMemberIdx === null || draggedMemberIdx === dropIndex) return;
    const newMembers = [...members];
    const [moved] = newMembers.splice(draggedMemberIdx, 1);
    newMembers.splice(dropIndex, 0, moved);
    pushToCloud(itinerary, expenses, newMembers);
    setDraggedMemberIdx(null);
  };

  // 花費管理
  const handleOpenAddExpense = () => {
    setNewExpense({
      item: '',
      amount: '',
      currency: 'MYR',
      selectedMembers: [],
      splitMode: 'equal',
      customAmounts: {},
      note: ''
    });
    setShowAddExpenseModal(true);
  };

  const toggleNewExpenseMember = (m: string) => {
    setNewExpense(prev => {
      const has = prev.selectedMembers.includes(m);
      const selectedMembers = has ? prev.selectedMembers.filter(x => x !== m) : [...prev.selectedMembers, m];
      const customAmounts = { ...prev.customAmounts };
      if (has) delete customAmounts[m];
      else if (customAmounts[m] === undefined) customAmounts[m] = '';
      return { ...prev, selectedMembers, customAmounts };
    });
  };

  const applyEqualSplitToNewExpense = () => {
    const total = parseFloat(newExpense.amount);
    if (isNaN(total) || newExpense.selectedMembers.length === 0) return;
    const per = (total / newExpense.selectedMembers.length).toFixed(2);
    const customAmounts = { ...newExpense.customAmounts };
    newExpense.selectedMembers.forEach(m => { customAmounts[m] = per; });
    setNewExpense({ ...newExpense, customAmounts });
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.item) return alert('請輸入花費項目');
    if (newExpense.selectedMembers.length === 0) return alert('請至少勾選一位分攤成員！');

    let shares: Record<string, number> = {};
    let totalAmount = 0;

    if (newExpense.splitMode === 'custom') {
      newExpense.selectedMembers.forEach(m => {
        const v = parseFloat(newExpense.customAmounts[m]) || 0;
        shares[m] = v;
        totalAmount += v;
      });
      if (totalAmount <= 0) return alert('請輸入每人分攤的金額（或改用「平均分攤」快速帶入）');
    } else {
      if (!newExpense.amount) return alert('請輸入金額');
      totalAmount = parseFloat(newExpense.amount);
      const per = totalAmount / newExpense.selectedMembers.length;
      newExpense.selectedMembers.forEach(m => { shares[m] = per; });
    }

    const newExpenses = [...expenses, {
      id: Date.now(),
      date: itinerary[selectedDayIdx].day.split(' ')[0],
      item: newExpense.item,
      amount: Math.round(totalAmount * 100) / 100,
      currency: newExpense.currency,
      splitFor: newExpense.selectedMembers,
      shares,
      note: newExpense.note
    }];
    pushToCloud(itinerary, newExpenses, members);
    setShowAddExpenseModal(false);
  };

  // 判斷現有花費是否為「均分」，決定編輯視窗預設顯示模式
  const isUniformShares = (shares: Record<string, number>) => {
    const vals = Object.values(shares);
    if (vals.length <= 1) return true;
    return vals.every(v => Math.abs(v - vals[0]) < 0.01);
  };

  const openEditExpense = (exp: any) => {
    const shares: Record<string, number> = exp.shares || Object.fromEntries(exp.splitFor.map((m: string) => [m, exp.amount / (exp.splitFor.length || 1)]));
    const customAmounts: Record<string, string> = {};
    exp.splitFor.forEach((m: string) => { customAmounts[m] = String(Math.round((shares[m] || 0) * 100) / 100); });
    setEditingExpense({ ...exp, splitMode: isUniformShares(shares) ? 'equal' : 'custom', customAmounts });
  };

  const toggleEditExpenseMember = (m: string) => {
    setEditingExpense((prev: any) => {
      const has = prev.splitFor.includes(m);
      const splitFor = has ? prev.splitFor.filter((x: string) => x !== m) : [...prev.splitFor, m];
      const customAmounts = { ...prev.customAmounts };
      if (has) delete customAmounts[m];
      else if (customAmounts[m] === undefined) customAmounts[m] = '';
      return { ...prev, splitFor, customAmounts };
    });
  };

  const applyEqualSplitToEditExpense = () => {
    const total = parseFloat(editingExpense.amount);
    if (isNaN(total) || editingExpense.splitFor.length === 0) return;
    const per = (total / editingExpense.splitFor.length).toFixed(2);
    const customAmounts = { ...editingExpense.customAmounts };
    editingExpense.splitFor.forEach((m: string) => { customAmounts[m] = per; });
    setEditingExpense({ ...editingExpense, customAmounts });
  };

  const handleSaveEditExpense = () => {
    if (!editingExpense) return;
    if (editingExpense.splitFor.length === 0) return alert('請至少勾選一位分攤成員！');

    const shares: Record<string, number> = {};
    let totalAmount = 0;
    editingExpense.splitFor.forEach((m: string) => {
      const v = parseFloat(editingExpense.customAmounts[m]) || 0;
      shares[m] = v;
      totalAmount += v;
    });
    if (totalAmount <= 0) return alert('請輸入每人分攤的金額（或改用「平均分攤」快速帶入）');

    const finalExpense = {
      id: editingExpense.id,
      date: editingExpense.date,
      item: editingExpense.item,
      amount: Math.round(totalAmount * 100) / 100,
      currency: editingExpense.currency,
      splitFor: editingExpense.splitFor,
      shares,
      note: editingExpense.note
    };
    const newExpenses = expenses.map(e => e.id === editingExpense.id ? finalExpense : e);
    pushToCloud(itinerary, newExpenses, members);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: number) => {
    if (!confirm('確定刪除此筆花費嗎？')) return;
    const newExpenses = expenses.filter(e => e.id !== id);
    pushToCloud(itinerary, newExpenses, members);
  };

  // 實體備份匯出匯入
  const handleExportData = () => {
    const fullData = { itinerary, expenses, members, exportedAt: new Date().toLocaleString() };
    const str = JSON.stringify(fullData, null, 2);
    navigator.clipboard.writeText(str);
    alert('📋 行程與花費完整 JSON 資料已複製到剪貼簿！');
  };

  const handleImportData = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (parsed && parsed.itinerary) {
        pushToCloud(parsed.itinerary, parsed.expenses || [], parsed.members || ['我']);
        alert('🟢 成功匯入資料並同步至全團雲端！');
        setShowBackupModal(false);
        setImportJsonText('');
      } else {
        alert('🔴 資料格式不正確，請確定包含 itinerary 欄位');
      }
    } catch (e) {
      alert('🔴 JSON 格式解析失敗，請檢查輸入內容');
    }
  };

  // 花費分頁用：依目前選取成員計算「該成員分帳後」的加總，馬幣／台幣分開列計
  const filteredExpenses = expenses.filter(e => e.splitFor.includes(filterMember));
  const shareOf = (e: any) => e.amount / (e.splitFor.length || 1);
  const filteredTotalMYR = filteredExpenses.filter(e => e.currency === 'MYR').reduce((sum, e) => sum + shareOf(e), 0);
  const filteredTotalTWD = filteredExpenses.filter(e => e.currency === 'TWD').reduce((sum, e) => sum + shareOf(e), 0);

  return (
    <div className="max-w-md mx-auto min-h-screen pb-20 shadow-2xl relative" style={{ backgroundColor: THEME.bg }}>
      
      {/* 浮動提示 Toast */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg z-50 animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="p-4 text-white shadow-md sticky top-0 z-40" style={{ backgroundColor: THEME.primary }}>
        <h1 className="text-lg font-bold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">馬來西亞 吉隆坡．檳城</h1>
        <div className="flex items-center justify-between mt-1.5 flex-nowrap">
          <p className="text-xs whitespace-nowrap" style={{ color: THEME.sand }}>2026.08.15 － 08.22</p>
          <div className="flex items-center space-x-1.5 flex-nowrap flex-shrink-0">
            <button
              onClick={() => pullFromCloud(true)}
              className="text-[10px] bg-white/10 hover:bg-white/20 active:scale-95 px-2 py-1 rounded-full text-slate-200 flex items-center space-x-1 border border-white/20 transition cursor-pointer whitespace-nowrap"
              title={lastSyncTime ? `最後同步時間：${lastSyncTime}（點擊強制拉取全團最新資料）` : '點擊強制拉取全團最新雲端資料'}
            >
              <span>{syncStatus === 'syncing' ? '🔄' : syncStatus === 'success' ? '🟢' : '🔴'}</span>
              <span>{syncStatus === 'syncing' ? '同步中' : syncStatus === 'success' ? '已同步' : '未同步'}</span>
            </button>

            <button onClick={() => setShowBackupModal(true)} className="text-xs p-1 bg-white/10 hover:bg-white/20 rounded-full text-slate-200 cursor-pointer flex-shrink-0" title="實體備份/匯入匯出">
              ⚙️
            </button>

            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`text-[10px] px-2.5 py-1 rounded-full font-bold border transition shadow-sm cursor-pointer whitespace-nowrap flex-shrink-0 ${
                isEditMode ? 'bg-amber-500 text-white border-amber-300' : 'bg-white/20 text-gray-200 border-white/30'
              }`}
            >
              {isEditMode ? '✏️ 編輯' : '👁️ 唯讀'}
            </button>
          </div>
        </div>
      </header>

      {/* 雲端連線異常時的明顯提示條 */}
      {syncStatus === 'error' && (
        <div className="bg-red-600 text-white text-[11px] px-4 py-2 text-center leading-relaxed">
          🔴 雲端連線異常，編輯可能無法同步給其他人！請點擊上方「點此重試」，若持續失敗請檢查 Firebase Rules 設定。
        </div>
      )}

      <main className="p-4 space-y-4">

        {/* TAB 1: 行程總覽 */}
        {activeTab === 'itinerary' && (
          <div className="space-y-3">
            <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-none">
              {itinerary.map((d, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedDayIdx === idx ? 'text-white scale-105 shadow-md' : 'bg-white text-gray-600'
                  }`}
                  style={{ backgroundColor: selectedDayIdx === idx ? THEME.accent : '' }}
                >
                  <div>Day {idx + 1}</div>
                  <div className="opacity-75">{d.day.split(' ')[0]}</div>
                </button>
              ))}
            </div>

            <div className="p-3 bg-white rounded-xl shadow-xs border border-amber-900/10 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-sm" style={{ color: THEME.primary }}>Day {selectedDayIdx + 1}: {itinerary[selectedDayIdx].title}</h2>
                <p className="text-[10px] text-gray-400">📍 區域：{itinerary[selectedDayIdx].city}</p>
              </div>
              {isEditMode && (
                <button onClick={() => setShowAddSpotModal(true)} className="text-xs px-2.5 py-1.5 rounded-lg text-white font-bold shadow cursor-pointer" style={{ backgroundColor: THEME.accent }}>
                  ➕ 新增行程
                </button>
              )}
            </div>

            {/* 24 小時動態氣象 */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 rounded-2xl shadow-md border border-slate-700">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[11px] font-bold text-slate-300">🌤️ {itinerary[selectedDayIdx].city} {itinerary[selectedDayIdx].day.split(' ')[0]} 氣象預報</span>
                {weatherStatus === 'ok' && <span className="text-[10px] text-slate-400">橫向滑動 →</span>}
              </div>

              {weatherStatus === 'loading' && (
                <div className="text-[11px] text-slate-400 py-4 text-center">氣象資料讀取中...</div>
              )}
              {weatherStatus === 'unavailable' && (
                <div className="text-[11px] text-slate-400 py-4 text-center">此日期天氣預報尚不準確，暫不提供顯示</div>
              )}
              {weatherStatus === 'ok' && (
                <div className="flex overflow-x-auto space-x-2.5 pb-1 pt-1 scrollbar-none">
                  {hourlyWeather.map((hw, index) => (
                    <div id={`weather-hour-${index}`} key={index} className="flex-shrink-0 flex flex-col items-center justify-between bg-white/10 px-2.5 py-2 rounded-xl min-w-[56px] border border-white/10">
                      <span className="text-[10px] text-slate-300">{hw.time}</span>
                      <span className="text-base my-1">{hw.icon}</span>
                      <span className="text-xs font-bold">{hw.temp}</span>
                      <span className="text-[9px] text-sky-300">💧{hw.rain}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 行程卡片 */}
            <div className="space-y-3 pt-1">
              {itinerary[selectedDayIdx].items.map((spot, index) => (
                <div
                  key={spot.id}
                  draggable={isEditMode}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-900/10 transition ${isEditMode ? 'ring-1 ring-slate-300' : ''}`}
                >
                  {spot.img && (
                    <div className="h-36 w-full overflow-hidden relative">
                      <img src={spot.img} alt={spot.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-3.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold text-white" style={{ backgroundColor: THEME.primary }}>{spot.type}</span>
                        <span className="text-xs text-gray-400 font-mono">{spot.time}</span>
                      </div>

                      {/* 編輯模式：微調控制 */}
                      {isEditMode && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleMoveSpot(index, 'up')}
                            disabled={index === 0}
                            className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs disabled:opacity-25 border border-gray-200 transition cursor-pointer"
                            title="向上移動"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleMoveSpot(index, 'down')}
                            disabled={index === itinerary[selectedDayIdx].items.length - 1}
                            className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs disabled:opacity-25 border border-gray-200 transition cursor-pointer"
                            title="向下移動"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => setEditingSpot(spot)}
                            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs font-medium border border-gray-200 transition cursor-pointer"
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => handleDeleteSpot(spot.id)}
                            className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded text-xs border border-gray-200 transition cursor-pointer"
                            title="刪除"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-sm mt-2" style={{ color: THEME.primary }}>{spot.name}</h3>
                    
                    {spot.note && <p className="text-xs text-gray-600 mt-2 bg-amber-50/60 p-2 rounded-lg border border-amber-100">{spot.note}</p>}
                    
                    {spot.map && (
                      <a
                        href={spot.map}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs mt-3 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 font-medium transition"
                      >
                        Google Map 導航 ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: 行前準備 */}
        {activeTab === 'prep' && (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-amber-900/10 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-600">➕ 新增準備項目</h3>
                <span className="text-[10px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded">📱 存於您個人手機</span>
              </div>
              <div className="flex space-x-2">
                <input type="text" placeholder="物品名稱" value={newPrepText} onChange={e => setNewPrepText(e.target.value)} className="flex-1 p-2 text-xs border rounded-xl" />
                <button onClick={() => { if (!newPrepText.trim()) return; setPrepList([...prepList, { id: Date.now(), cat: newPrepCat, text: newPrepText.trim(), done: false }]); setNewPrepText(''); }} className="px-3 py-2 text-xs font-bold text-white rounded-xl shadow cursor-pointer" style={{ backgroundColor: THEME.accent }}>
                  新增
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-2">
              <h2 className="text-base font-bold mb-3" style={{ color: THEME.primary }}>檢查清單</h2>
              {prepList.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white">
                  <div className="flex items-center space-x-2 flex-1 cursor-pointer" onClick={() => setPrepList(prepList.map(p => p.id === item.id ? {...p, done: !p.done} : p))}>
                    <span className={`text-sm ${item.done ? 'text-gray-400 font-medium' : 'font-medium'}`}>
                      {item.done ? '✅' : '⬜'} {item.text}
                    </span>
                  </div>
                  <button onClick={() => setPrepList(prepList.filter(p => p.id !== item.id))} className="text-gray-300 hover:text-gray-600 font-bold text-xs p-1 cursor-pointer">✕</button>
                </div>
              ))}
            </div>

            {/* 🔔 小叮嚀 - 固定釘選於行前準備底部，唯讀/編輯模式皆顯示 */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-900/10 space-y-3">
              <h2 className="text-base font-bold" style={{ color: THEME.primary }}>🔔 小叮嚀</h2>
              <div>
                <h4 className="text-xs font-bold text-amber-800 mb-1.5">【衣物】</h4>
                <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>室內冷氣通常非常強，建議攜帶薄外套</li>
                  <li>進入部分宗教場所需遮蓋肩膀與腿部。</li>
                  <li>檳城香格里拉金沙酒店附設泳池，可攜帶泳衣</li>
                  <li>檳城喬治敦有許多步行行程，且黑風洞與升旗山皆需大量步行，請攜帶好走的鞋子</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-800 mb-1.5">【電子與支付】</h4>
                <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>馬來西亞插座為英式三孔，240V</li>
                  <li>馬來西亞當地換匯建議攜帶乾淨、無摺痕的千元鈔票</li>
                  <li>下載 Grab 後，請事先綁定信用卡，方便叫車使用（屆時移動會叫 3 台車，3+3+3 配車）</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 購買清單 */}
        {activeTab === 'shopping' && (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-amber-900/10 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-600">➕ 新增想買伴手禮</h3>
                <span className="text-[10px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded">📱 存於您個人手機</span>
              </div>
              <div className="flex space-x-2">
                <input type="text" placeholder="商品名稱" value={newShopName} onChange={e => setNewShopName(e.target.value)} className="flex-1 p-2 text-xs border rounded-xl" />
                <button onClick={() => { if (!newShopName.trim()) return; setShoppingList([...shoppingList, { id: Date.now(), name: newShopName.trim(), bought: false }]); setNewShopName(''); }} className="px-3 py-2 text-xs font-bold text-white rounded-xl shadow cursor-pointer" style={{ backgroundColor: THEME.accent }}>
                  新增
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-2">
              <h2 className="text-base font-bold mb-3" style={{ color: THEME.primary }}>購買清單</h2>
              {shoppingList.map(s => (
                <div key={s.id} className="p-3 bg-white border border-gray-100 rounded-xl flex justify-between items-center">
                  <div className="flex items-center space-x-2 flex-1 cursor-pointer" onClick={() => setShoppingList(shoppingList.map(item => item.id === s.id ? {...item, bought: !item.bought} : item))}>
                    <span className={`font-bold text-sm ${s.bought ? 'text-gray-400' : ''}`}>{s.bought ? '✅ ' : '⬜ '}{s.name}</span>
                  </div>
                  <button onClick={() => setShoppingList(shoppingList.filter(item => item.id !== s.id))} className="text-gray-300 hover:text-gray-600 font-bold text-xs p-1 cursor-pointer">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: 行程花費 */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {isEditMode && (
              <button onClick={handleOpenAddExpense} className="w-full py-3 rounded-2xl text-white font-bold text-sm shadow-md flex items-center justify-center space-x-1 cursor-pointer" style={{ backgroundColor: THEME.accent }}>
                <span>➕ 新增花費紀錄</span>
              </button>
            )}

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-900/10 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold text-gray-500">👥 成員名單與花費統計</h2>
                <span className="text-[10px] text-gray-400">{isEditMode ? '編輯模式' : '唯讀模式'}</span>
              </div>

              {isEditMode && (
                <div className="flex space-x-2">
                  <input type="text" placeholder="輸入新成員名字" value={newMemberInput} onChange={e => setNewMemberInput(e.target.value)} className="flex-1 p-1.5 text-xs border rounded-lg" />
                  <button onClick={handleAddMember} className="px-3 py-1.5 text-xs font-bold text-white rounded-lg cursor-pointer" style={{ backgroundColor: THEME.accent }}>新增成員</button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {members.map((m, mIdx) => (
                  <div
                    key={m}
                    draggable={isEditMode}
                    onDragStart={(e) => handleMemberDragStart(e, mIdx)}
                    onDragOver={handleMemberDragOver}
                    onDrop={(e) => handleMemberDrop(e, mIdx)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-xl border-2 transition ${filterMember === m ? 'bg-amber-100 border-amber-600' : 'bg-gray-100 border-transparent'} ${isEditMode ? 'cursor-move' : ''}`}
                  >
                    {isEditMode && <span className="text-gray-300 text-xs">⠿</span>}
                    <button onClick={() => setFilterMember(m)} className={`text-xs font-bold cursor-pointer ${filterMember === m ? 'text-amber-900 font-extrabold' : 'text-gray-600'}`}>{m}</button>
                    {isEditMode && (
                      <>
                        <button onClick={() => handleMoveMember(mIdx, 'up')} disabled={mIdx === 0} className="text-[10px] text-gray-400 hover:text-gray-700 font-bold disabled:opacity-20 cursor-pointer">▲</button>
                        <button onClick={() => handleMoveMember(mIdx, 'down')} disabled={mIdx === members.length - 1} className="text-[10px] text-gray-400 hover:text-gray-700 font-bold disabled:opacity-20 cursor-pointer">▼</button>
                        <button onClick={() => handleRenameMember(m)} className="text-[10px] text-gray-400 hover:text-gray-700 font-bold cursor-pointer">✏️</button>
                        <button onClick={() => handleDeleteMember(m)} className="text-gray-300 hover:text-gray-600 text-[10px] font-bold cursor-pointer">✕</button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 space-y-2">
                <div className="text-xs text-amber-900 font-bold">【{filterMember}】相關花費加總：</div>
                {filteredTotalMYR > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-amber-700">馬幣花費</span>
                    <div className="text-right">
                      <div className="text-lg font-black text-amber-900">${filteredTotalMYR.toFixed(0)} <span className="text-xs font-normal">MYR</span></div>
                      {rateInfo.rate && (
                        <div className="text-[10px] text-amber-700">≈ NT$ {(filteredTotalMYR * rateInfo.rate).toFixed(0)}</div>
                      )}
                    </div>
                  </div>
                )}
                {filteredTotalTWD > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-amber-700">台幣花費</span>
                    <div className="text-lg font-black text-amber-900">${filteredTotalTWD.toFixed(0)} <span className="text-xs font-normal">TWD</span></div>
                  </div>
                )}
                {filteredTotalMYR === 0 && filteredTotalTWD === 0 && (
                  <div className="text-xs text-gray-400 text-center py-1">目前尚無相關花費紀錄</div>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>🧾 明細紀錄</h3>
                <span className="text-[10px] text-gray-400">共 {expenses.length} 筆</span>
              </div>

              <div className="space-y-2.5">
                {filteredExpenses.map(exp => (
                  <div key={exp.id} className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 relative space-y-1.5">
                    <div className="flex justify-between items-start pr-6">
                      <div>
                        <span className="font-bold text-sm text-slate-800">{exp.item}</span>
                        {exp.note && <div className="text-[11px] text-gray-500 mt-0.5">💡 {exp.note}</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-900 text-sm">{exp.currency} ${shareOf(exp).toFixed(0)}</div>
                        {exp.currency === 'MYR' && rateInfo.rate && (
                          <div className="text-[10px] text-gray-400">≈ NT$ {(shareOf(exp) * rateInfo.rate).toFixed(0)}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1.5 border-t border-gray-200/50">
                      <div className="text-[10px] text-gray-400">全部花費－${exp.amount}</div>
                      {isEditMode && (
                        <button onClick={() => setEditingExpense(exp)} className="text-[10px] text-amber-800 font-bold underline cursor-pointer">✏️ 編輯明細</button>
                      )}
                    </div>

                    {isEditMode && (
                      <button onClick={() => handleDeleteExpense(exp.id)} className="absolute top-2.5 right-2.5 text-gray-300 hover:text-red-500 font-bold text-xs cursor-pointer">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: 匯率換算 */}
        {activeTab === 'rate' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-md border border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">💱 馬幣 → 台幣 即時匯率</span>
                <button
                  onClick={() => fetchExchangeRate(true)}
                  className="text-[10px] bg-white/10 hover:bg-white/20 active:scale-95 px-2.5 py-1 rounded-full flex items-center space-x-1 border border-white/20 transition cursor-pointer"
                >
                  {rateLoading ? '🔄 更新中...' : '🔄 手動更新'}
                </button>
              </div>
              <div className="mt-3 text-center">
                {rateInfo.rate ? (
                  <>
                    <div className="text-3xl font-black">1 MYR ≈ {rateInfo.rate.toFixed(4)} TWD</div>
                    <div className="text-[10px] text-slate-400 mt-1">最後更新：{rateInfo.updatedAt}</div>
                  </>
                ) : (
                  <div className="text-sm text-slate-300 py-2">{rateLoading ? '匯率讀取中...' : '尚無匯率資料'}</div>
                )}
                {rateInfo.error && <div className="text-[10px] text-red-300 mt-1">⚠️ 上次更新失敗，目前顯示為快取匯率</div>}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-900/10 space-y-3">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>🧮 雙向快速換算</h3>

              <div>
                <label className="text-[10px] font-bold text-gray-500">馬幣 MYR (RM)</label>
                <input
                  type="number"
                  value={amountMYR}
                  onChange={e => handleMYRChange(e.target.value)}
                  placeholder="輸入馬幣金額"
                  className="w-full p-3 mt-1 text-lg font-bold border rounded-xl focus:outline-none focus:ring-2"
                  style={{ borderColor: THEME.sand }}
                />
              </div>

              <div className="flex justify-center text-gray-300">⇅</div>

              <div>
                <label className="text-[10px] font-bold text-gray-500">台幣 TWD (NT$)</label>
                <input
                  type="number"
                  value={amountTWD}
                  onChange={e => handleTWDChange(e.target.value)}
                  placeholder="輸入台幣金額"
                  className="w-full p-3 mt-1 text-lg font-bold border rounded-xl focus:outline-none focus:ring-2"
                  style={{ borderColor: THEME.sand }}
                />
              </div>

              <p className="text-[10px] text-gray-400 text-center pt-1">
                匯率資料來源：open.er-api.com（每 30 分鐘自動更新一次，也可手動點擊上方按鈕即時刷新）
              </p>
            </div>

            {/* 快速對照表 */}
            {rateInfo.rate && (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-900/10">
                <h3 className="font-bold text-sm mb-2" style={{ color: THEME.primary }}>📋 常用金額對照</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[10, 50, 100, 200, 500, 1000].map(myr => (
                    <div key={myr} className="flex justify-between p-2 bg-amber-50/60 rounded-lg border border-amber-100">
                      <span className="text-gray-500">RM {myr}</span>
                      <span className="font-bold text-amber-900">NT$ {(myr * rateInfo.rate!).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* 實體備份 Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>⚙️ 實體備份與備用匯入</h3>
              <button onClick={() => setShowBackupModal(false)} className="text-gray-400 font-bold cursor-pointer">✕</button>
            </div>

            <button onClick={handleExportData} className="w-full py-2.5 bg-slate-800 text-white rounded-xl font-bold text-xs shadow hover:bg-slate-700 cursor-pointer">
              📋 一鍵複製完整行程花費 (JSON)
            </button>

            <div className="border-t pt-2 space-y-2">
              <label className="text-xs font-bold text-gray-600">貼上 JSON 進行資料匯入：</label>
              <textarea
                value={importJsonText}
                onChange={e => setImportJsonText(e.target.value)}
                placeholder="把複製的 JSON 內容貼在這裡..."
                className="w-full p-2 text-xs border rounded-xl h-24 font-mono"
              />
              <button onClick={handleImportData} className="w-full py-2 bg-amber-800 text-white rounded-xl font-bold text-xs shadow cursor-pointer">
                確認匯入並覆蓋更新
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 編輯景點 Modal */}
      {editingSpot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>✏️ 修改景點資訊</h3>
              <button onClick={() => setEditingSpot(null)} className="text-gray-400 font-bold cursor-pointer">✕</button>
            </div>
            <input type="text" value={editingSpot.name} onChange={e => setEditingSpot({...editingSpot, name: e.target.value})} className="w-full p-2 text-xs border rounded-lg" placeholder="景點名稱" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={editingSpot.time} onChange={e => setEditingSpot({...editingSpot, time: e.target.value})} className="p-2 text-xs border rounded-lg" placeholder="時間" />
              <select value={editingSpot.type} onChange={e => setEditingSpot({...editingSpot, type: e.target.value})} className="p-2 text-xs border rounded-lg bg-white">
                <option value="景點">景點</option>
                <option value="飲食">飲食</option>
                <option value="交通">交通</option>
                <option value="住宿">住宿</option>
              </select>
            </div>
            <textarea value={editingSpot.note} onChange={e => setEditingSpot({...editingSpot, note: e.target.value})} className="w-full p-2 text-xs border rounded-lg h-16" placeholder="備註說明" />
            <input type="text" value={editingSpot.map} onChange={e => setEditingSpot({...editingSpot, map: e.target.value})} className="w-full p-2 text-xs border rounded-lg" placeholder="Google Map 網址" />
            <input type="text" value={editingSpot.img} onChange={e => setEditingSpot({...editingSpot, img: e.target.value})} className="w-full p-2 text-xs border rounded-lg" placeholder="圖片網址 URL" />
            <button onClick={handleSaveEditSpot} className="w-full py-2 text-xs font-bold text-white rounded-lg shadow cursor-pointer" style={{ backgroundColor: THEME.accent }}>儲存修改</button>
          </div>
        </div>
      )}

      {/* 新增景點 Modal */}
      {showAddSpotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>➕ 動態新增當天行程</h3>
              <button onClick={() => setShowAddSpotModal(false)} className="text-gray-400 font-bold cursor-pointer">✕</button>
            </div>
            <input type="text" placeholder="行程/景點名稱" value={newSpot.name} onChange={e => setNewSpot({...newSpot, name: e.target.value})} className="w-full p-2 text-xs border rounded-lg" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="時間 (如 15:30)" value={newSpot.time} onChange={e => setNewSpot({...newSpot, time: e.target.value})} className="p-2 text-xs border rounded-lg" />
              <select value={newSpot.type} onChange={e => setNewSpot({...newSpot, type: e.target.value})} className="p-2 text-xs border rounded-lg bg-white">
                <option value="景點">景點</option>
                <option value="飲食">飲食</option>
                <option value="交通">交通</option>
                <option value="住宿">住宿</option>
              </select>
            </div>
            <textarea placeholder="說明/備註" value={newSpot.note} onChange={e => setNewSpot({...newSpot, note: e.target.value})} className="w-full p-2 text-xs border rounded-lg h-16" />
            <input type="text" placeholder="Google Map 網址 (選填)" value={newSpot.map} onChange={e => setNewSpot({...newSpot, map: e.target.value})} className="w-full p-2 text-xs border rounded-lg" />
            <input type="text" placeholder="圖片網址 URL (選填)" value={newSpot.img} onChange={e => setNewSpot({...newSpot, img: e.target.value})} className="w-full p-2 text-xs border rounded-lg" />
            <button onClick={handleAddSpotSubmit} className="w-full py-2 text-xs font-bold text-white rounded-lg shadow cursor-pointer" style={{ backgroundColor: THEME.accent }}>確認新增</button>
          </div>
        </div>
      )}

      {/* 新增花費 Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>➕ 記錄新花費</h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-gray-400 font-bold cursor-pointer">✕</button>
            </div>
            <input type="text" placeholder="花費項目 (例: 亞羅街晚餐)" value={newExpense.item} onChange={e => setNewExpense({...newExpense, item: e.target.value})} className="w-full p-2 text-xs border rounded-lg" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="金額" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="p-2 text-xs border rounded-lg" />
              <select value={newExpense.currency} onChange={e => setNewExpense({...newExpense, currency: e.target.value})} className="p-2 text-xs border rounded-lg bg-white">
                <option value="MYR">馬幣 (MYR)</option>
                <option value="TWD">台幣 (TWD)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500">此筆費用包含哪些成員？(預設全選)</label>
              <div className="grid grid-cols-2 gap-2 mt-1 p-2 bg-amber-50/60 rounded-xl border border-amber-200">
                {members.map(m => (
                  <label key={m} className="flex items-center space-x-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newExpense.selectedMembers.includes(m)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewExpense({ ...newExpense, selectedMembers: [...newExpense.selectedMembers, m] });
                        } else {
                          setNewExpense({ ...newExpense, selectedMembers: newExpense.selectedMembers.filter(x => x !== m) });
                        }
                      }}
                      className="rounded text-amber-800 focus:ring-amber-800"
                    />
                    <span className="font-medium text-slate-800">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            <input type="text" placeholder="備註說明 (選填)" value={newExpense.note} onChange={e => setNewExpense({...newExpense, note: e.target.value})} className="w-full p-2 text-xs border rounded-lg" />
            <button onClick={handleAddExpenseSubmit} className="w-full py-2 text-xs font-bold text-white rounded-lg shadow cursor-pointer" style={{ backgroundColor: THEME.accent }}>儲存紀錄</button>
          </div>
        </div>
      )}

      {/* 編輯花費 Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>✏️ 修改花費明細</h3>
              <button onClick={() => setEditingExpense(null)} className="text-gray-400 font-bold cursor-pointer">✕</button>
            </div>
            <input type="text" value={editingExpense.item} onChange={e => setEditingExpense({...editingExpense, item: e.target.value})} className="w-full p-2 text-xs border rounded-lg" placeholder="項目" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={editingExpense.amount} onChange={e => setEditingExpense({...editingExpense, amount: parseFloat(e.target.value) || 0})} className="p-2 text-xs border rounded-lg" placeholder="金額" />
              <select value={editingExpense.currency} onChange={e => setEditingExpense({...editingExpense, currency: e.target.value})} className="p-2 text-xs border rounded-lg bg-white">
                <option value="MYR">馬幣 (MYR)</option>
                <option value="TWD">台幣 (TWD)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500">修改此費用包含的成員：</label>
              <div className="grid grid-cols-2 gap-2 mt-1 p-2 bg-amber-50/60 rounded-xl border border-amber-200">
                {members.map(m => (
                  <label key={m} className="flex items-center space-x-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingExpense.splitFor.includes(m)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditingExpense({ ...editingExpense, splitFor: [...editingExpense.splitFor, m] });
                        } else {
                          setEditingExpense({ ...editingExpense, splitFor: editingExpense.splitFor.filter((x: string) => x !== m) });
                        }
                      }}
                      className="rounded text-amber-800 focus:ring-amber-800"
                    />
                    <span className="font-medium text-slate-800">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            <input type="text" value={editingExpense.note} onChange={e => setEditingExpense({...editingExpense, note: e.target.value})} className="w-full p-2 text-xs border rounded-lg" placeholder="備註" />
            <button onClick={handleSaveEditExpense} className="w-full py-2 text-xs font-bold text-white rounded-lg shadow cursor-pointer" style={{ backgroundColor: THEME.accent }}>儲存修改</button>
          </div>
        </div>
      )}

      {/* 底部 Tab */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-900/10 z-40">
        <div className="max-w-md mx-auto flex justify-around py-2.5 font-bold text-[10px]">
          {[
            { id: 'itinerary', name: '行程總覽' },
            { id: 'rate', name: '匯率換算' },
            { id: 'expenses', name: '行程花費' },
            { id: 'shopping', name: '購買清單' },
            { id: 'prep', name: '行前準備' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center px-2 py-1 transition cursor-pointer ${activeTab === tab.id ? 'scale-110' : 'opacity-40'}`}
              style={{ color: activeTab === tab.id ? THEME.accent : THEME.primary }}
            >
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}

// 渲染安裝
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
