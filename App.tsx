import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const THEME = {
  primary: '#183451',
  accent: '#A9501C',
  bg: '#F3ECDE',
  sand: '#D4AF83'
};

// ☁️ 全團唯一固定的 Google Firebase 實時資料庫端點
const FIXED_FIREBASE_URL = "https://malaysia-trip-2026-ec3e3-default-rtdb.asia-southeast1.firebasedatabase.app/master_trip.json";
const LOCAL_BACKUP_KEY = "MY_MALAYSIA_TRIP_LOCAL_STORAGE_BACKUP_V6";
const AUTO_POLL_INTERVAL_MS = 12000;

// 匯率 API
const EXCHANGE_RATE_URL = "https://open.er-api.com/v6/latest/MYR";
const RATE_CACHE_KEY = "MY_MALAYSIA_TRIP_RATE_CACHE_V2";

// 預設 8 天行程
const MASTER_ITINERARY = [
  {
    day: "8/15 Sat.", title: "臺灣 → 吉隆坡", city: "吉隆坡", lat: 3.1390, lng: 101.6869,
    items: [
      { id: "1-1", time: "06:45 前", name: "家 → 桃園機場", type: "交通", note: "辦理登機手續", map: "", img: "" },
      { id: "1-2", time: "08:45 - 13:25", name: "華航 CI72 航班 (08:45 起飛 → 13:25 抵達)", type: "交通", note: "抵達吉隆坡國際機場", map: "", img: "" },
      { id: "1-3", time: "14:20 - 15:10", name: "【機場快線】機場 → 市區", type: "交通", note: "車程約 30 分鐘", map: "", img: "" },
      { id: "1-4", time: "15:10 - 16:00", name: "Check-in｜吉隆坡豪亞酒店式公寓", type: "住宿", note: "遠東集團酒店式公寓辦理入住", map: "https://maps.app.goo.gl/HWipQ6etWXGk3qdp8", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80" },
      { id: "1-5", time: "16:55 - 18:45", name: "黑風洞 (Batu Caves)", type: "景點", note: "272 階彩虹階梯，請著過膝長褲/裙", map: "https://maps.app.goo.gl/4VH85Uz17DKdey1b6", img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80" },
      { id: "1-6", time: "20:10 - 22:00", name: "【晚餐】麗豐啦啦米 / 亞羅街美食街", type: "飲食", note: "必吃鮮味啦啦米粉與燒雞翅", map: "https://maps.app.goo.gl/doRqhPSg5X6EmYaJ8", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80" }
    ]
  },
  {
    day: "8/16 Sun.", title: "馬六甲古城巡禮", city: "馬六甲", lat: 2.1896, lng: 102.2501,
    items: [
      { id: "2-1", time: "09:30", name: "包車前往馬六甲古城", type: "交通", note: "9:30 集合包車出發", map: "", img: "" },
      { id: "2-2", time: "停留", name: "粉紅清真寺 & 布特拉橋", type: "景點", note: "拍照打卡水上粉紅清真寺", map: "", img: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80" },
      { id: "2-3", time: "停留", name: "荷蘭紅屋 & 聖地牙哥城堡", type: "景點", note: "漫步紅屋廣場", map: "", img: "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=600&q=80" },
      { id: "2-4", time: "晚上", name: "雞場街夜市 (Jonker Street)", type: "景點", note: "週末夜市與海南雞飯粒", map: "", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80" }
    ]
  },
  {
    day: "8/17 Mon.", title: "吉隆坡城市漫遊", city: "吉隆坡", lat: 3.1390, lng: 101.6869,
    items: [
      { id: "3-1", time: "09:30", name: "Ready｜吉隆坡豪亞酒店式公寓 (收拾行李)", type: "住宿", note: "當晚需換房，請收好行李", map: "", img: "" },
      { id: "3-2", time: "10:30 - 12:00", name: "樂聖嶺天后宮", type: "景點", note: "東南亞最大媽祖廟，燈籠陣打卡點", map: "", img: "" },
      { id: "3-3", time: "14:45 - 16:30", name: "中央市場 (Central Market)", type: "景點", note: "文創手作市集", map: "https://maps.app.goo.gl/smpbQKkoT5YwFAGq7", img: "" },
      { id: "3-4", time: "16:30 - 21:30", name: "柏威年廣場 (Pavilion) / 亞羅街", type: "景點", note: "晚餐 + 百貨逛街換匯", map: "https://maps.app.goo.gl/Rf7sEgBUhrixPdx97", img: "" }
    ]
  },
  {
    day: "8/18 Tue.", title: "吉隆坡 → 檳城喬治市", city: "檳城", lat: 5.4141, lng: 100.3288,
    items: [
      { id: "4-1", time: "09:00 - 10:45", name: "【早餐】chaFei Wisma Cosway 咖椰多士", type: "飲食", note: "美味咖椰吐司", map: "https://maps.app.goo.gl/goNaQNtVyjhxcSERA", img: "" },
      { id: "4-2", time: "11:40 - 15:15", name: "【火車】吉隆坡中央車站 → 檳城北海車站", type: "交通", note: "乘坐 ETS 高速火車", map: "", img: "" },
      { id: "4-3", time: "16:00 - 16:20", name: "【渡輪】前往喬治市", type: "交通", note: "渡輪搭乘", map: "", img: "" },
      { id: "4-4", time: "17:30 - 18:20", name: "姓氏橋 (Clan Jetties)", type: "景點", note: "體驗水上人家生活、觀賞落日夕陽", map: "https://maps.app.goo.gl/E5ENPqHFHnBiiUeb9", img: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80" },
      { id: "4-5", time: "19:30 -", name: "逛超市 Giant Penang Plaza", type: "景點", note: "採買零食伴手禮", map: "https://maps.app.goo.gl/zi2r7GcbqgAFeX4A6", img: "" }
    ]
  },
  {
    day: "8/19 Wed.", title: "檳城自然探索", city: "檳城", lat: 5.4141, lng: 100.3288,
    items: [
      { id: "5-1", time: "10:50 - 14:00", name: "升旗山 The Habitat 生態公園", type: "景點", note: "Klook 門票已購買，體驗空中步道", map: "https://maps.app.goo.gl/n3zDSQiEk6sqeCD26", img: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80" },
      { id: "5-2", time: "16:25 - 18:00", name: "葛尼廣場 (Gurney Plaza)", type: "景點", note: "海邊購物中心", map: "", img: "" }
    ]
  },
  {
    day: "8/20 Thu.", title: "檳城人文漫遊", city: "檳城", lat: 5.4141, lng: 100.3288,
    items: [
      { id: "6-1", time: "10:00 - 12:00", name: "張弼士故居 + 娘惹博物館", type: "景點", note: "藍屋與娘惹文化巡禮", map: "", img: "" },
      { id: "6-2", time: "13:45 - 15:30", name: "喬治市壁畫街 & 小印度", type: "景點", note: "尋找「姐弟共騎」壁畫", map: "", img: "" },
      { id: "6-3", time: "18:00 - 19:50", name: "光大大廈 68 樓彩虹步道", type: "景點", note: "俯瞰喬治市高空夜景", map: "", img: "" }
    ]
  },
  {
    day: "8/21 Fri.", title: "檳城海灘渡假", city: "檳城", lat: 5.4667, lng: 100.2452,
    items: [
      { id: "7-1", time: "10:30 Check-in", name: "檳城香格里拉金沙酒店", type: "住宿", note: "海灘渡假飯店入住", map: "https://maps.app.goo.gl/Pn9N6CRjeMv7c2Ks9", img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80" },
      { id: "7-2", time: "18:00 -", name: "峇都丁宜海灘 (Batu Ferringhi)", type: "景點", note: "觀賞著名落日夕陽", map: "", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" }
    ]
  },
  {
    day: "8/22 Sat.", title: "檳城 → 臺灣", city: "檳城", lat: 5.2971, lng: 100.2768,
    items: [
      { id: "8-1", time: "11:00 - 12:00", name: "前往檳城國際機場", type: "交通", note: "搭乘 Grab 移動前往機場", map: "", img: "" },
      { id: "8-2", time: "15:10 - 19:55", name: "華航 CI732 (15:10 起飛 → 19:55 抵達)", type: "交通", note: "順利返抵桃園國際機場！", map: "", img: "" }
    ]
  }
];

// 預設檢查清單 14 項（依據 PDF 指定內容）
const INITIAL_PREP_LIST = [
  { id: 1, text: "輕便透氣衣物", done: false },
  { id: 2, text: "薄外套/防曬罩衫", done: false },
  { id: 3, text: "泳衣", done: false },
  { id: 4, text: "好走的涼鞋/運動鞋", done: false },
  { id: 5, text: "雨具", done: false },
  { id: 6, text: "太陽眼鏡", done: false },
  { id: 7, text: "行動電源、充電器", done: false },
  { id: 8, text: "萬用轉接頭", done: false },
  { id: 9, text: "台幣千元鈔", done: false },
  { id: 10, text: "下載Grab，並事先綁定信用卡", done: false },
  { id: 11, text: "實體sim卡", done: false },
  { id: 12, text: "防蚊液", done: false },
  { id: 13, text: "防曬乳", done: false },
  { id: 14, text: "常備藥品", done: false }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // 1. 本地與雲端資料狀態
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
      try { return JSON.parse(saved).members || ['我', 'Lori', '成員B']; } catch (e) {}
    }
    return ['我', 'Lori', '成員B'];
  });

  const [expenses, setExpenses] = useState<any[]>(() => {
    const saved = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).expenses || [
          { id: 1, date: '8/15', item: '機場快線車票', amount: 220, currency: 'MYR', splitFor: ['我', 'Lori', '成員B'], note: '全團車票' },
          { id: 2, date: '8/15', item: '亞羅街晚餐', amount: 200, currency: 'MYR', splitFor: ['我', 'Lori'], note: '晚餐兩人平分' }
        ];
      } catch (e) {}
    }
    return [
      { id: 1, date: '8/15', item: '機場快線車票', amount: 220, currency: 'MYR', splitFor: ['我', 'Lori', '成員B'], note: '全團車票' },
      { id: 2, date: '8/15', item: '亞羅街晚餐', amount: 200, currency: 'MYR', splitFor: ['我', 'Lori'], note: '晚餐兩人平分' }
    ];
  });

  // 雲端同步狀態
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'success' | 'error'>('syncing');
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [localUpdatedAt, setLocalUpdatedAt] = useState(0);

  // 📱 個人手機獨立清單 (localStorage)
  const [prepList, setPrepList] = useState(() => {
    const saved = localStorage.getItem('my_malaysia_prep_v2');
    return saved ? JSON.parse(saved) : INITIAL_PREP_LIST;
  });
  const [newPrepText, setNewPrepText] = useState('');

  const [shoppingList, setShoppingList] = useState(() => {
    const saved = localStorage.getItem('my_malaysia_shopping_v2');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "舊街場白咖啡 (OldTown)", bought: false },
      { id: 2, name: "Beryl's 巧克力", bought: false }
    ];
  });
  const [newShopName, setNewShopName] = useState('');

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  useEffect(() => { localStorage.setItem('my_malaysia_prep_v2', JSON.stringify(prepList)); }, [prepList]);
  useEffect(() => { localStorage.setItem('my_malaysia_shopping_v2', JSON.stringify(shoppingList)); }, [shoppingList]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

  // ☁️ Firebase 雲端同步
  const pullFromCloud = async (isManualRetry = false) => {
    if (isManualRetry) setSyncStatus('syncing');
    try {
      const res = await fetch(`${FIXED_FIREBASE_URL}?_ts=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const cloudObj = await res.json();
        if (cloudObj && cloudObj.itinerary) {
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
            alert(`🟢 雲端同步成功！\n最新時間：${timeStr}`);
          }
          return true;
        } else if (cloudObj === null) {
          await pushToCloud(itinerary, expenses, members);
          return true;
        }
      }
    } catch (e) {
      console.error('Pull cloud error:', e);
    }

    setSyncStatus('error');
    if (isManualRetry) alert('🔴 雲端連線失敗，已自動啟用手機本地快存。');
    return false;
  };

  const pushToCloud = async (newItinerary?: any, newExpenses?: any, newMembers?: any) => {
    const targetItinerary = newItinerary !== undefined ? newItinerary : itinerary;
    const targetExpenses = newExpenses !== undefined ? newExpenses : expenses;
    const targetMembers = newMembers !== undefined ? newMembers : members;

    const stamp = Date.now();
    setLocalUpdatedAt(stamp);

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
      }
    } catch (e) {
      console.error('Push cloud error:', e);
    }
    setSyncStatus('error');
  };

  useEffect(() => {
    pullFromCloud(false);
    const handleVisibility = () => { if (document.visibilityState === 'visible') pullFromCloud(false); };
    window.addEventListener('visibilitychange', handleVisibility);
    const pollId = setInterval(() => { if (document.visibilityState === 'visible') pullFromCloud(false); }, AUTO_POLL_INTERVAL_MS);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(pollId);
    };
  }, []);

  // 🌤️ 動態即時氣象
  const [hourlyWeather, setHourlyWeather] = useState<any[]>([]);

  useEffect(() => {
    const currentDay = itinerary[selectedDayIdx];
    if (!currentDay) return;

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${currentDay.lat}&longitude=${currentDay.lng}&hourly=temperature_2m,precipitation_probability,weathercode&timezone=Asia%2FKuala_Lumpur`)
      .then(res => res.json())
      .then(data => {
        if (data && data.hourly) {
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
          if (list.length > 0) setHourlyWeather(list);
        }
      })
      .catch(() => setHourlyWeather([]));
  }, [selectedDayIdx, itinerary]);

  // 💱 匯率換算
  const [rateInfo, setRateInfo] = useState<{ rate: number | null; updatedAt: string; error: boolean }>(() => {
    const saved = localStorage.getItem(RATE_CACHE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { rate: parsed.rate || 7.15, updatedAt: parsed.updatedAt || '', error: false };
      } catch (e) {}
    }
    return { rate: 7.15, updatedAt: '', error: false };
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
      }
    } catch (e) {
      console.error('Exchange rate fetch error:', e);
    }
    setRateLoading(false);
  };

  useEffect(() => {
    fetchExchangeRate(false);
  }, []);

  useEffect(() => {
    if (!rateInfo.rate) return;
    const myrNum = parseFloat(amountMYR);
    if (!isNaN(myrNum)) {
      setAmountTWD((myrNum * rateInfo.rate).toFixed(1));
    }
  }, [rateInfo.rate, amountMYR]);

  const handleMYRChange = (val: string) => {
    setAmountMYR(val);
    const num = parseFloat(val);
    if (!isNaN(num) && rateInfo.rate) {
      setAmountTWD((num * rateInfo.rate).toFixed(1));
    } else {
      setAmountTWD('');
    }
  };

  const handleTWDChange = (val: string) => {
    setAmountTWD(val);
    const num = parseFloat(val);
    if (!isNaN(num) && rateInfo.rate) {
      setAmountMYR((num / rateInfo.rate).toFixed(1));
    } else {
      setAmountMYR('');
    }
  };

  // UI State
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedItemIdx, setDraggedItemIdx] = useState<number | null>(null);
  const [filterMember, setFilterMember] = useState('全部');
  const [newMemberInput, setNewMemberInput] = useState('');

  const [editingSpot, setEditingSpot] = useState<any>(null);
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);
  const [newSpot, setNewSpot] = useState({ name: '', time: '', type: '景點', note: '', map: '', img: '' });
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [newExpense, setNewExpense] = useState({ item: '', amount: '', currency: 'MYR', selectedMembers: [] as string[], note: '' });

  // 行程微調
  const handleMoveSpot = (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= itinerary[selectedDayIdx].items.length) return;

    const updatedItinerary = deepClone(itinerary);
    const currentItems = updatedItinerary[selectedDayIdx].items;
    const [movedItem] = currentItems.splice(currentIndex, 1);
    currentItems.splice(targetIndex, 0, movedItem);

    pushToCloud(updatedItinerary, expenses, members);
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

  // 團員與花費管理
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
      if (filterMember === target) setFilterMember('全部');
    }
  };

  const handleOpenAddExpense = () => {
    setNewExpense({
      item: '',
      amount: '',
      currency: 'MYR',
      selectedMembers: [...members],
      note: ''
    });
    setShowAddExpenseModal(true);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.item || !newExpense.amount) return;
    if (newExpense.selectedMembers.length === 0) return alert('請至少勾選一位分攤成員！');

    const newExpenses = [...expenses, {
      id: Date.now(),
      date: itinerary[selectedDayIdx].day.split(' ')[0],
      item: newExpense.item,
      amount: parseFloat(newExpense.amount),
      currency: newExpense.currency,
      splitFor: newExpense.selectedMembers,
      note: newExpense.note
    }];
    pushToCloud(itinerary, newExpenses, members);
    setShowAddExpenseModal(false);
  };

  const handleSaveEditExpense = () => {
    if (!editingExpense) return;
    if (editingExpense.splitFor.length === 0) return alert('請至少勾選一位分攤成員！');
    const newExpenses = expenses.map(e => e.id === editingExpense.id ? editingExpense : e);
    pushToCloud(itinerary, newExpenses, members);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: number) => {
    if (!confirm('確定刪除此筆花費嗎？')) return;
    const newExpenses = expenses.filter(e => e.id !== id);
    pushToCloud(itinerary, newExpenses, members);
  };

  // 計算特定成員的分攤金額
  const calculateFilteredExpense = (exp: any) => {
    if (filterMember === '全部') {
      return exp.amount;
    }
    if (exp.splitFor.includes(filterMember)) {
      return exp.amount / (exp.splitFor.length || 1);
    }
    return 0;
  };

  const currentFilteredExpenses = expenses.filter(e => filterMember === '全部' || e.splitFor.includes(filterMember));
  const totalMYR = currentFilteredExpenses.reduce((sum, e) => sum + (e.currency === 'MYR' ? calculateFilteredExpense(e) : 0), 0);
  const totalTWD = currentFilteredExpenses.reduce((sum, e) => sum + (e.currency === 'TWD' ? calculateFilteredExpense(e) : 0), 0);

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24 shadow-2xl relative" style={{ backgroundColor: THEME.bg }}>
      
      {/* Toast 提示 */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg z-50 animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="p-4 text-white shadow-md flex justify-between items-center sticky top-0 z-40" style={{ backgroundColor: THEME.primary }}>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-wide">馬來西亞 8.15-8.22</h1>
            
            <button
              onClick={() => pullFromCloud(true)}
              className="text-[10px] bg-white/10 hover:bg-white/20 active:scale-95 px-2.5 py-1 rounded-full text-slate-200 flex items-center space-x-1 border border-white/20 transition cursor-pointer"
            >
              <span>{syncStatus === 'syncing' ? '🔄' : syncStatus === 'success' ? '🟢' : '🔴'}</span>
              <span>{syncStatus === 'syncing' ? '同步中' : syncStatus === 'success' ? `已同步` : '重試'}</span>
            </button>

            <button onClick={() => setShowBackupModal(true)} className="text-xs p-1 bg-white/10 hover:bg-white/20 rounded-full text-slate-200 cursor-pointer">
              ⚙️
            </button>
          </div>
          <p className="text-xs mt-0.5" style={{ color: THEME.sand }}>馬來西亞 吉隆坡．檳城</p>
        </div>

        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`text-[10px] px-3 py-1.5 rounded-full font-bold border transition shadow-sm cursor-pointer ${
            isEditMode ? 'bg-amber-500 text-white border-amber-300' : 'bg-white/20 text-gray-200 border-white/30'
          }`}
        >
          {isEditMode ? '編輯中' : '唯讀/編輯'}
        </button>
      </header>

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

            {/* 即時氣象預報 */}
            {hourlyWeather.length > 0 && (
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 rounded-2xl shadow-md border border-slate-700">
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-[11px] font-bold text-slate-300">🌤️ {itinerary[selectedDayIdx].city} 8/{15 + selectedDayIdx}氣象預報</span>
                  <span className="text-[10px] text-slate-400">橫向滑動 →</span>
                </div>
                <div className="flex overflow-x-auto space-x-2.5 pb-1 pt-1 scrollbar-none">
                  {hourlyWeather.map((hw, index) => (
                    <div key={index} className="flex-shrink-0 flex flex-col items-center justify-between bg-white/10 px-2.5 py-2 rounded-xl min-w-[56px] border border-white/10">
                      <span className="text-[10px] text-slate-300">{hw.time}</span>
                      <span className="text-base my-1">{hw.icon}</span>
                      <span className="text-xs font-bold">{hw.temp}</span>
                      <span className="text-[9px] text-sky-300">💧{hw.rain}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 行程卡片列表 */}
            <div className="space-y-3 pt-1">
              {itinerary[selectedDayIdx].items.map((spot, index) => (
                <div
                  key={spot.id}
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

                      {isEditMode && (
                        <div className="flex items-center space-x-1">
                          <button onClick={() => handleMoveSpot(index, 'up')} disabled={index === 0} className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-600 rounded text-xs border cursor-pointer">▲</button>
                          <button onClick={() => handleMoveSpot(index, 'down')} disabled={index === itinerary[selectedDayIdx].items.length - 1} className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-600 rounded text-xs border cursor-pointer">▼</button>
                          <button onClick={() => setEditingSpot(spot)} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs border cursor-pointer">編輯</button>
                          <button onClick={() => handleDeleteSpot(spot.id)} className="w-6 h-6 flex items-center justify-center bg-gray-100 text-red-500 rounded text-xs border cursor-pointer">✕</button>
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-sm mt-2" style={{ color: THEME.primary }}>{spot.name}</h3>
                    {spot.note && <p className="text-xs text-gray-600 mt-2 bg-amber-50/60 p-2 rounded-lg border border-amber-100">{spot.note}</p>}
                    
                    {spot.map && (
                      <a href={spot.map} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs mt-3 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 font-medium transition">
                        Google Map 導航 ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ⚠️ 底部新增欄位：小叮嚀 */}
            <div className="mt-6 bg-amber-100/70 border border-amber-300 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-sm text-amber-900 flex items-center space-x-1">
                <span>⚠️ 小叮嚀</span>
              </h3>

              <div className="space-y-1.5 text-xs text-amber-900/90 leading-relaxed">
                <div className="font-bold text-amber-950 mt-1">【衣物】</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>室內冷氣通常非常強，建議攜帶薄外套。</li>
                  <li>進入部分宗教場所需遮蓋肩膀與腿部。</li>
                  <li>檳城香格里拉金沙酒店附設泳池，可攜帶泳衣。</li>
                  <li>檳城喬治敦有許多步行行程，且黑風洞與升旗山皆需大量步行，請攜帶好走的鞋子。</li>
                </ul>

                <div className="font-bold text-amber-950 mt-2">【電子與支付】</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>馬來西亞插座為英式三孔，240V。</li>
                  <li>馬來西亞當地換匯建議攜帶乾淨、無摺痕的千元鈔票。</li>
                  <li>下載 Grab 後，請事先綁定信用卡，方便叫車使用（屆時移動會叫 3 台車，3+3+3 配車）。</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 匯率換算 */}
        {activeTab === 'rate' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-md border border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">💱 馬幣 ↔ 台幣 即時匯率</span>
                <button onClick={() => fetchExchangeRate(true)} className="text-[10px] bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full border border-white/20 transition cursor-pointer">
                  {rateLoading ? '🔄 更新中' : '🔄 刷新匯率'}
                </button>
              </div>
              <div className="mt-3 text-center">
                {rateInfo.rate ? (
                  <>
                    <div className="text-3xl font-black">1 MYR ≈ {rateInfo.rate.toFixed(3)} TWD</div>
                    <div className="text-[10px] text-slate-400 mt-1">更新時間：{rateInfo.updatedAt || '系統即時換算'}</div>
                  </>
                ) : (
                  <div className="text-sm text-slate-300 py-2">匯率載入中...</div>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-900/10 space-y-3">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>🧮 雙向快速試算</h3>

              <div>
                <label className="text-[10px] font-bold text-gray-500">馬幣 MYR (RM)</label>
                <input
                  type="number"
                  value={amountMYR}
                  onChange={e => handleMYRChange(e.target.value)}
                  placeholder="輸入馬幣金額"
                  className="w-full p-3 mt-1 text-lg font-bold border rounded-xl focus:outline-none"
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
                  className="w-full p-3 mt-1 text-lg font-bold border rounded-xl focus:outline-none"
                  style={{ borderColor: THEME.sand }}
                />
              </div>
            </div>

            {rateInfo.rate && (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-900/10">
                <h3 className="font-bold text-sm mb-2" style={{ color: THEME.primary }}>📋 常用金額對照</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[10, 20, 50, 100, 200, 500].map(myr => (
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

        {/* TAB 3: 行程花費 */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {isEditMode && (
              <button onClick={handleOpenAddExpense} className="w-full py-3 rounded-2xl text-white font-bold text-sm shadow-md flex items-center justify-center space-x-1 cursor-pointer" style={{ backgroundColor: THEME.accent }}>
                <span>➕ 新增花費紀錄</span>
              </button>
            )}

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-900/10 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold text-gray-500">👥 成員選擇與個人總結</h2>
                {isEditMode && <span className="text-[10px] text-amber-800 font-bold">可新增/刪除成員</span>}
              </div>

              {isEditMode && (
                <div className="flex space-x-2">
                  <input type="text" placeholder="成員名稱" value={newMemberInput} onChange={e => setNewMemberInput(e.target.value)} className="flex-1 p-1.5 text-xs border rounded-lg" />
                  <button onClick={handleAddMember} className="px-3 py-1.5 text-xs font-bold text-white rounded-lg cursor-pointer" style={{ backgroundColor: THEME.accent }}>新增</button>
                </div>
              )}

              {/* 成員選擇按鈕 (點擊外框明顯突出) */}
              <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-none">
                <button
                  onClick={() => setFilterMember('全部')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                    filterMember === '全部'
                      ? 'bg-slate-900 text-white ring-2 ring-slate-900 shadow-md'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  全團總花費
                </button>
                {members.map(m => {
                  const isSelected = filterMember === m;
                  return (
                    <div
                      key={m}
                      onClick={() => setFilterMember(m)}
                      className={`flex items-center space-x-1 px-3.5 py-2 rounded-xl flex-shrink-0 transition cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-800 text-white ring-4 ring-amber-400 font-extrabold shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-xs">{m}</span>
                      {isEditMode && (
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteMember(m); }} className="text-gray-300 hover:text-red-300 text-[10px] font-bold ml-1">✕</button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 分開提列馬幣與台幣，下附小字換算 */}
              <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 space-y-1">
                <div className="text-xs text-amber-900 font-bold">
                  {filterMember === '全部' ? '全團總花費金額：' : `【${filterMember}】個人應付總金額：`}
                </div>
                
                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <span className="text-2xl font-black text-amber-900">${totalMYR.toFixed(1)}</span>
                    <span className="text-xs text-amber-900 font-bold ml-1">MYR (馬幣)</span>
                  </div>
                  {rateInfo.rate && (
                    <div className="text-xs text-amber-800/80 font-medium">
                      ≈ NT$ {(totalMYR * rateInfo.rate).toFixed(0)} 台幣
                    </div>
                  )}
                </div>

                {totalTWD > 0 && (
                  <div className="border-t border-amber-200/60 pt-1 mt-1 flex justify-between items-baseline">
                    <div>
                      <span className="text-lg font-bold text-slate-800">${totalTWD}</span>
                      <span className="text-xs text-slate-600 ml-1">TWD (台幣直付)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 花費明細清單 */}
            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3 border border-amber-900/10">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>
                  🧾 花費明細 ({filterMember === '全部' ? '全項目' : `${filterMember}個人分攤`})
                </h3>
                <span className="text-[10px] text-gray-400">共 {currentFilteredExpenses.length} 筆</span>
              </div>

              <div className="space-y-2.5">
                {currentFilteredExpenses.map(exp => {
                  const splitCount = exp.splitFor.length || 1;
                  const myShare = calculateFilteredExpense(exp);

                  return (
                    <div key={exp.id} className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 relative space-y-1">
                      <div className="flex justify-between items-start pr-6">
                        <div>
                          <span className="font-bold text-sm text-slate-800">{exp.item}</span>
                          {exp.note && <div className="text-[11px] text-gray-500 mt-0.5">💡 {exp.note}</div>}
                        </div>

                        {/* 金額顯示：馬幣大字，下方小字依匯率換算台幣 */}
                        <div className="text-right">
                          <div className="font-bold text-amber-900 text-sm">
                            {exp.currency} ${myShare.toFixed(1)}
                            {filterMember !== '全部' && splitCount > 1 && (
                              <span className="text-[10px] text-gray-400 font-normal block">
                                (總額 ${exp.amount} / {splitCount}人)
                              </span>
                            )}
                          </div>
                          {exp.currency === 'MYR' && rateInfo.rate && (
                            <div className="text-[10px] text-gray-500">
                              ≈ NT$ {(myShare * rateInfo.rate).toFixed(0)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-gray-200/50 text-[10px]">
                        <span className="text-gray-400">分攤對象：{exp.splitFor.join(', ')}</span>
                        {isEditMode && (
                          <button onClick={() => setEditingExpense(exp)} className="text-amber-800 font-bold underline cursor-pointer">✏️ 編輯</button>
                        )}
                      </div>

                      {isEditMode && (
                        <button onClick={() => handleDeleteExpense(exp.id)} className="absolute top-2.5 right-2.5 text-gray-300 hover:text-red-500 font-bold text-xs cursor-pointer">✕</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 購買清單 (依要求移除購買地點) */}
        {activeTab === 'shopping' && (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-amber-900/10 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-600">➕ 新增購買項目</h3>
                <span className="text-[10px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded">📱 存於您個人手機</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="輸入商品名稱"
                  value={newShopName}
                  onChange={e => setNewShopName(e.target.value)}
                  className="flex-1 p-2 text-xs border rounded-xl"
                />
                <button
                  onClick={() => {
                    if (!newShopName.trim()) return;
                    setShoppingList([...shoppingList, { id: Date.now(), name: newShopName.trim(), bought: false }]);
                    setNewShopName('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow cursor-pointer"
                  style={{ backgroundColor: THEME.accent }}
                >
                  新增
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-2 border border-amber-900/10">
              <h2 className="text-sm font-bold mb-3" style={{ color: THEME.primary }}>🛍️ 購買清單</h2>
              {shoppingList.map(s => (
                <div key={s.id} className="p-3 bg-white border border-gray-100 rounded-xl flex justify-between items-center">
                  {/* 完成後文字反灰，不劃掉 */}
                  <div
                    className="flex items-center space-x-2 flex-1 cursor-pointer"
                    onClick={() => setShoppingList(shoppingList.map(item => item.id === s.id ? {...item, bought: !item.bought} : item))}
                  >
                    <span className={`text-sm font-medium transition ${s.bought ? 'text-gray-400 opacity-60' : 'text-slate-800'}`}>
                      {s.bought ? '✅' : '⬜'} {s.name}
                    </span>
                  </div>
                  <button onClick={() => setShoppingList(shoppingList.filter(item => item.id !== s.id))} className="text-gray-300 hover:text-gray-600 font-bold text-xs p-1 cursor-pointer">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: 行前準備 (檢查清單) */}
        {activeTab === 'prep' && (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-amber-900/10 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-600">➕ 新增檢查項目</h3>
                <span className="text-[10px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded">📱 存於您個人手機</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="新增物品或注意事項"
                  value={newPrepText}
                  onChange={e => setNewPrepText(e.target.value)}
                  className="flex-1 p-2 text-xs border rounded-xl"
                />
                <button
                  onClick={() => {
                    if (!newPrepText.trim()) return;
                    setPrepList([...prepList, { id: Date.now(), text: newPrepText.trim(), done: false }]);
                    setNewPrepText('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow cursor-pointer"
                  style={{ backgroundColor: THEME.accent }}
                >
                  新增
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-2 border border-amber-900/10">
              <h2 className="text-sm font-bold mb-3" style={{ color: THEME.primary }}>✅ 檢查清單</h2>
              {prepList.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white">
                  {/* 完成後打勾，文字反灰，不需要劃掉 */}
                  <div
                    className="flex items-center space-x-2 flex-1 cursor-pointer"
                    onClick={() => setPrepList(prepList.map(p => p.id === item.id ? {...p, done: !p.done} : p))}
                  >
                    <span className={`text-sm font-medium transition ${item.done ? 'text-gray-400 opacity-60' : 'text-slate-800'}`}>
                      {item.done ? '✅' : '⬜'} {item.text}
                    </span>
                  </div>
                  <button onClick={() => setPrepList(prepList.filter(p => p.id !== item.id))} className="text-gray-300 hover:text-gray-600 font-bold text-xs p-1 cursor-pointer">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* 備份與匯入 Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>⚙️ 資料備份與匯入</h3>
              <button onClick={() => setShowBackupModal(false)} className="text-gray-400 font-bold cursor-pointer">✕</button>
            </div>

            <button onClick={() => {
              navigator.clipboard.writeText(JSON.stringify({ itinerary, expenses, members }));
              alert('📋 完整資料 JSON 已複製到剪貼簿！');
            }} className="w-full py-2.5 bg-slate-800 text-white rounded-xl font-bold text-xs shadow cursor-pointer">
              📋 一鍵複製行程 JSON
            </button>

            <div className="border-t pt-2 space-y-2">
              <label className="text-xs font-bold text-gray-600">貼上 JSON 匯入：</label>
              <textarea
                value={importJsonText}
                onChange={e => setImportJsonText(e.target.value)}
                placeholder="貼上內容..."
                className="w-full p-2 text-xs border rounded-xl h-20 font-mono"
              />
              <button onClick={() => {
                try {
                  const parsed = JSON.parse(importJsonText);
                  if (parsed.itinerary) {
                    pushToCloud(parsed.itinerary, parsed.expenses || [], parsed.members || ['我']);
                    alert('🟢 匯入成功！');
                    setShowBackupModal(false);
                  }
                } catch (e) { alert('🔴 JSON 解析失敗'); }
              }} className="w-full py-2 bg-amber-800 text-white rounded-xl font-bold text-xs shadow cursor-pointer">
                確認覆蓋匯入
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
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>✏️ 修改景點</h3>
              <button onClick={() => setEditingSpot(null)} className="text-gray-400 font-bold cursor-pointer">✕</button>
            </div>
            <input type="text" value={editingSpot.name} onChange={e => setEditingSpot({...editingSpot, name: e.target.value})} className="w-full p-2 text-xs border rounded-lg" placeholder="名稱" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={editingSpot.time} onChange={e => setEditingSpot({...editingSpot, time: e.target.value})} className="p-2 text-xs border rounded-lg" placeholder="時間" />
              <select value={editingSpot.type} onChange={e => setEditingSpot({...editingSpot, type: e.target.value})} className="p-2 text-xs border rounded-lg bg-white">
                <option value="景點">景點</option>
                <option value="飲食">飲食</option>
                <option value="交通">交通</option>
                <option value="住宿">住宿</option>
              </select>
            </div>
            <textarea value={editingSpot.note} onChange={e => setEditingSpot({...editingSpot, note: e.target.value})} className="w-full p-2 text-xs border rounded-lg h-16" placeholder="備註" />
            <input type="text" value={editingSpot.map} onChange={e => setEditingSpot({...editingSpot, map: e.target.value})} className="w-full p-2 text-xs border rounded-lg" placeholder="Google Map 網址" />
            <button onClick={handleSaveEditSpot} className="w-full py-2 text-xs font-bold text-white rounded-lg shadow cursor-pointer" style={{ backgroundColor: THEME.accent }}>儲存修改</button>
          </div>
        </div>
      )}

      {/* 新增景點 Modal */}
      {showAddSpotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>➕ 新增行程</h3>
              <button onClick={() => setShowAddSpotModal(false)} className="text-gray-400 font-bold cursor-pointer">✕</button>
            </div>
            <input type="text" placeholder="名稱" value={newSpot.name} onChange={e => setNewSpot({...newSpot, name: e.target.value})} className="w-full p-2 text-xs border rounded-lg" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="時間" value={newSpot.time} onChange={e => setNewSpot({...newSpot, time: e.target.value})} className="p-2 text-xs border rounded-lg" />
              <select value={newSpot.type} onChange={e => setNewSpot({...newSpot, type: e.target.value})} className="p-2 text-xs border rounded-lg bg-white">
                <option value="景點">景點</option>
                <option value="飲食">飲食</option>
                <option value="交通">交通</option>
                <option value="住宿">住宿</option>
              </select>
            </div>
            <textarea placeholder="備註" value={newSpot.note} onChange={e => setNewSpot({...newSpot, note: e.target.value})} className="w-full p-2 text-xs border rounded-lg h-16" />
            <input type="text" placeholder="Google Map 網址" value={newSpot.map} onChange={e => setNewSpot({...newSpot, map: e.target.value})} className="w-full p-2 text-xs border rounded-lg" />
            <button onClick={handleAddSpotSubmit} className="w-full py-2 text-xs font-bold text-white rounded-lg shadow cursor-pointer" style={{ backgroundColor: THEME.accent }}>確認新增</button>
          </div>
        </div>
      )}

      {/* 新增花費 Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>➕ 記錄花費</h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-gray-400 font-bold cursor-pointer">✕</button>
            </div>
            <input type="text" placeholder="項目" value={newExpense.item} onChange={e => setNewExpense({...newExpense, item: e.target.value})} className="w-full p-2 text-xs border rounded-lg" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="金額" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="p-2 text-xs border rounded-lg" />
              <select value={newExpense.currency} onChange={e => setNewExpense({...newExpense, currency: e.target.value})} className="p-2 text-xs border rounded-lg bg-white">
                <option value="MYR">馬幣 (MYR)</option>
                <option value="TWD">台幣 (TWD)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500">平分成員：</label>
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
                      className="rounded text-amber-800"
                    />
                    <span className="font-medium text-slate-800">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            <input type="text" placeholder="備註" value={newExpense.note} onChange={e => setNewExpense({...newExpense, note: e.target.value})} className="w-full p-2 text-xs border rounded-lg" />
            <button onClick={handleAddExpenseSubmit} className="w-full py-2 text-xs font-bold text-white rounded-lg shadow cursor-pointer" style={{ backgroundColor: THEME.accent }}>儲存</button>
          </div>
        </div>
      )}

      {/* 編輯花費 Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>✏️ 修改花費</h3>
              <button onClick={() => setEditingExpense(null)} className="text-gray-400 font-bold cursor-pointer">✕</button>
            </div>
            <input type="text" value={editingExpense.item} onChange={e => setEditingExpense({...editingExpense, item: e.target.value})} className="w-full p-2 text-xs border rounded-lg" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={editingExpense.amount} onChange={e => setEditingExpense({...editingExpense, amount: parseFloat(e.target.value) || 0})} className="p-2 text-xs border rounded-lg" />
              <select value={editingExpense.currency} onChange={e => setEditingExpense({...editingExpense, currency: e.target.value})} className="p-2 text-xs border rounded-lg bg-white">
                <option value="MYR">馬幣 (MYR)</option>
                <option value="TWD">台幣 (TWD)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500">平分成員：</label>
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
                      className="rounded text-amber-800"
                    />
                    <span className="font-medium text-slate-800">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            <input type="text" value={editingExpense.note} onChange={e => setEditingExpense({...editingExpense, note: e.target.value})} className="w-full p-2 text-xs border rounded-lg" />
            <button onClick={handleSaveEditExpense} className="w-full py-2 text-xs font-bold text-white rounded-lg shadow cursor-pointer" style={{ backgroundColor: THEME.accent }}>儲存修改</button>
          </div>
        </div>
      )}

      {/* 📌 釘選於下方之導航欄 (指定順序：行程總覽 / 匯率換算 / 行程花費 / 購買清單 / 行前準備) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-900/10 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around py-2 font-bold text-[11px]">
          {[
            { id: 'itinerary', name: '行程總覽' },
            { id: 'rate', name: '匯率換算' },
            { id: 'expenses', name: '行程花費' },
            { id: 'shopping', name: '購買清單' },
            { id: 'prep', name: '行前準備' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center px-2 py-1 transition cursor-pointer ${
                  isActive ? 'scale-105 font-extrabold' : 'opacity-50'
                }`}
                style={{ color: isActive ? THEME.accent : THEME.primary }}
              >
                <span>{tab.name}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: THEME.accent }}></span>}
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
