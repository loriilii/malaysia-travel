import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const THEME = {
  primary: '#183451',
  accent: '#A9501C',
  bg: '#F3ECDE',
  sand: '#D4AF83'
};

// ☁️ 全球 100% 免驗證開放直連資料庫通道 (跨手機 100% 互通)
const NPOINT_API_URL = "https://api.npoint.io/88ef3914a1a6f0227183";
const LOCAL_BACKUP_KEY = "MY_MALAYSIA_TRIP_FINAL_STORAGE_V6";

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

export default function App() {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // 1. React 本地狀態
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

  // 📱 個人手機獨立清單 (localStorage)
  const [prepList, setPrepList] = useState(() => {
    const saved = localStorage.getItem('my_malaysia_prep');
    return saved ? JSON.parse(saved) : [
      { id: 1, cat: "衣物配件", text: "排汗衫 / 薄短袖", done: false },
      { id: 2, cat: "衣物配件", text: "薄外套 / 防曬罩衫", done: false },
      { id: 3, cat: "待辦事項", text: "填寫馬來西亞數位入境卡 MDAC (8/13-8/15)", done: false }
    ];
  });
  const [newPrepText, setNewPrepText] = useState('');
  const [newPrepCat] = useState('個人物品');

  const [shoppingList, setShoppingList] = useState(() => {
    const saved = localStorage.getItem('my_malaysia_shopping');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "舊街場白咖啡 (OldTown)", target: "超市", bought: false },
      { id: 2, name: "Beryl's 巧克力", target: "專櫃/機場", bought: false }
    ];
  });
  const [newShopName, setNewShopName] = useState('');
  const [newShopTarget, setNewShopTarget] = useState('');

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  useEffect(() => { localStorage.setItem('my_malaysia_prep', JSON.stringify(prepList)); }, [prepList]);
  useEffect(() => { localStorage.setItem('my_malaysia_shopping', JSON.stringify(shoppingList)); }, [shoppingList]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // ☁️ 100% 跨手機真同步拉取 (GET)
  const pullFromCloud = async (isManualRetry = false) => {
    setSyncStatus('syncing');
    try {
      const res = await fetch(NPOINT_API_URL, { cache: 'no-cache' });
      if (res.ok) {
        const cloudObj = await res.json();
        if (cloudObj && cloudObj.itinerary) {
          setItinerary(cloudObj.itinerary);
          if (cloudObj.expenses) setExpenses(cloudObj.expenses);
          if (cloudObj.members) setMembers(cloudObj.members);

          localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(cloudObj));
          setSyncStatus('success');
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSyncTime(timeStr);

          if (isManualRetry) {
            alert(`🟢 跨手機雲端連線 100% 成功！\n\n- 通道狀態：200 OK (npoint API)\n- 行程天數：${cloudObj.itinerary.length} 天\n- 花費筆數：${(cloudObj.expenses || []).length} 筆\n- 同步時間：${timeStr}\n\n這代表所有手機開網頁都會看到這份資料！`);
          }
          return true;
        } else {
          // 如果雲端空了，自動寫入預設行程
          await pushToCloud(itinerary, expenses, members);
          return true;
        }
      }
    } catch (e) {
      console.error('Pull cloud error:', e);
    }

    setSyncStatus('error');
    if (isManualRetry) {
      alert('🔴 網路連線異常，已自動載入手機本地快存。');
    }
    return false;
  };

  // ☁️ 100% 跨手機真同步推送 (POST)
  const pushToCloud = async (newItinerary?: any, newExpenses?: any, newMembers?: any) => {
    const targetItinerary = newItinerary || itinerary;
    const targetExpenses = newExpenses || expenses;
    const targetMembers = newMembers || members;

    // 1. 立即更新 React 本地 UI
    if (newItinerary) setItinerary(newItinerary);
    if (newExpenses) setExpenses(newExpenses);
    if (newMembers) setMembers(newMembers);

    const payload = {
      itinerary: targetItinerary,
      expenses: targetExpenses,
      members: targetMembers,
      updatedAt: Date.now()
    };
    localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(payload));

    // 2. 推送到公共雲端點
    setSyncStatus('syncing');
    try {
      const res = await fetch(NPOINT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSyncStatus('success');
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(timeStr);
        showToast('☁️ 已即時同步給所有手機！');
        return;
      }
    } catch (e) {
      console.error('Push cloud error:', e);
    }

    setSyncStatus('error');
  };

  // 網頁開啟時 + 切換視窗時自動抓取最新雲端資料
  useEffect(() => {
    pullFromCloud(false);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') pullFromCloud(false);
    };
    window.addEventListener('visibilitychange', handleVisibility);
    return () => window.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // 🌤️ 動態即時氣象
  const [hourlyWeather, setHourlyWeather] = useState(DEFAULT_HOURLY_WEATHER);

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
          if (list.length === 24) setHourlyWeather(list);
        }
      })
      .catch(() => setHourlyWeather(DEFAULT_HOURLY_WEATHER));
  }, [selectedDayIdx, itinerary]);

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

  // 行程順序微調
  const handleMoveSpot = (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= itinerary[selectedDayIdx].items.length) return;

    const updatedItinerary = [...itinerary];
    const currentItems = [...updatedItinerary[selectedDayIdx].items];
    const [movedItem] = currentItems.splice(currentIndex, 1);
    currentItems.splice(targetIndex, 0, movedItem);
    updatedItinerary[selectedDayIdx].items = currentItems;

    pushToCloud(updatedItinerary, expenses, members);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => { if (!isEditMode) return; setDraggedItemIdx(index); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent, dropTargetIdx: number) => {
    e.preventDefault();
    if (!isEditMode || draggedItemIdx === null || draggedItemIdx === dropTargetIdx) return;
    const updatedItinerary = [...itinerary];
    const currentItems = [...updatedItinerary[selectedDayIdx].items];
    const [movedItem] = currentItems.splice(draggedItemIdx, 1);
    currentItems.splice(dropTargetIdx, 0, movedItem);
    updatedItinerary[selectedDayIdx].items = currentItems;

    pushToCloud(updatedItinerary, expenses, members);
    setDraggedItemIdx(null);
  };

  const handleDeleteSpot = (spotId: string) => {
    if (!confirm('確定刪除此行程嗎？')) return;
    const updatedItinerary = [...itinerary];
    updatedItinerary[selectedDayIdx].items = updatedItinerary[selectedDayIdx].items.filter(item => item.id !== spotId);
    pushToCloud(updatedItinerary, expenses, members);
  };

  const handleSaveEditSpot = () => {
    if (!editingSpot) return;
    const updatedItinerary = [...itinerary];
    const currentItems = [...updatedItinerary[selectedDayIdx].items];
    const idx = currentItems.findIndex(item => item.id === editingSpot.id);
    if (idx !== -1) {
      currentItems[idx] = { ...editingSpot };
      updatedItinerary[selectedDayIdx].items = currentItems;
      pushToCloud(updatedItinerary, expenses, members);
    }
    setEditingSpot(null);
  };

  const handleAddSpotSubmit = () => {
    if (!newSpot.name) return;
    const updatedItinerary = [...itinerary];
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
    const newExpenses = expenses.map(e => ({ ...e, splitFor: e.splitFor.map(s => s === oldName ? trimmed : s) }));
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
      if (filterMember === target) setFilterMember('全部');
    }
  };

  // 花費管理
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

  return (
    <div className="max-w-md mx-auto min-h-screen pb-20 shadow-2xl relative" style={{ backgroundColor: THEME.bg }}>
      
      {/* 浮動提示 Toast */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg z-50 animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="p-4 text-white shadow-md flex justify-between items-center sticky top-0 z-40" style={{ backgroundColor: THEME.primary }}>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-wide">馬來西亞 8天7夜</h1>
            
            <button
              onClick={() => pullFromCloud(true)}
              className="text-[10px] bg-white/10 hover:bg-white/20 active:scale-95 px-2.5 py-1 rounded-full text-slate-200 flex items-center space-x-1 border border-white/20 transition cursor-pointer"
              title="點擊診斷與拉取最新資料"
            >
              <span>{syncStatus === 'syncing' ? '🔄' : syncStatus === 'success' ? '🟢' : '🔴'}</span>
              <span>{syncStatus === 'syncing' ? '同步中...' : syncStatus === 'success' ? `全團同步 ${lastSyncTime}` : '點此重試'}</span>
            </button>

            <button onClick={() => setShowBackupModal(true)} className="text-xs p-1 bg-white/10 hover:bg-white/20 rounded-full text-slate-200 cursor-pointer" title="實體備份/匯入匯出">
              ⚙️
            </button>
          </div>
          <p className="text-xs mt-0.5" style={{ color: THEME.sand }}>2026.08.15 － 08.22 (npoint 跨手機連線)</p>
        </div>

        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`text-[10px] px-3 py-1.5 rounded-full font-bold border transition shadow-sm cursor-pointer ${
            isEditMode ? 'bg-amber-500 text-white border-amber-300' : 'bg-white/20 text-gray-200 border-white/30'
          }`}
        >
          {isEditMode ? '✏️ 編輯模式' : '👁️ 唯讀模式'}
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

            {/* 24 小時動態氣象 */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 rounded-2xl shadow-md border border-slate-700">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[11px] font-bold text-slate-300">🌤️ {itinerary[selectedDayIdx].city} 即時氣象預報 (00:00 - 23:00)</span>
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
              <h2 className="text-base font-bold mb-3" style={{ color: THEME.primary }}>🎒 個人檢查清單</h2>
              {prepList.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white">
                  <div className="flex items-center space-x-2 flex-1 cursor-pointer" onClick={() => setPrepList(prepList.map(p => p.id === item.id ? {...p, done: !p.done} : p))}>
                    <span className={`text-sm ${item.done ? 'line-through text-gray-400' : 'font-medium'}`}>
                      {item.done ? '✅' : '⬜'} {item.text}
                    </span>
                  </div>
                  <button onClick={() => setPrepList(prepList.filter(p => p.id !== item.id))} className="text-gray-300 hover:text-gray-600 font-bold text-xs p-1 cursor-pointer">✕</button>
                </div>
              ))}
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
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="商品名稱" value={newShopName} onChange={e => setNewShopName(e.target.value)} className="p-2 text-xs border rounded-xl" />
                <input type="text" placeholder="購買地點" value={newShopTarget} onChange={e => setNewShopTarget(e.target.value)} className="p-2 text-xs border rounded-xl" />
              </div>
              <button onClick={() => { if (!newShopName.trim()) return; setShoppingList([...shoppingList, { id: Date.now(), name: newShopName.trim(), target: newShopTarget.trim() || '超市', bought: false }]); setNewShopName(''); setNewShopTarget(''); }} className="w-full py-2 text-xs font-bold text-white rounded-xl shadow cursor-pointer" style={{ backgroundColor: THEME.accent }}>
                新增至清單
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-2">
              <h2 className="text-base font-bold mb-3" style={{ color: THEME.primary }}>🛍️ 個人購物清單</h2>
              {shoppingList.map(s => (
                <div key={s.id} className="p-3 bg-white border border-gray-100 rounded-xl flex justify-between items-center">
                  <div className="flex items-center space-x-2 flex-1 cursor-pointer" onClick={() => setShoppingList(shoppingList.map(item => item.id === s.id ? {...item, bought: !item.bought} : item))}>
                    <div>
                      <div className={`font-bold text-sm ${s.bought ? 'line-through text-gray-400' : ''}`}>{s.bought ? '✅ ' : '⬜ '}{s.name}</div>
                      <div className="text-xs text-gray-400">地點：{s.target}</div>
                    </div>
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

              <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-none">
                <button onClick={() => setFilterMember('全部')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 cursor-pointer ${filterMember === '全部' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  全部花費
                </button>
                {members.map(m => (
                  <div key={m} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-xl flex-shrink-0 border border-gray-200">
                    <button onClick={() => setFilterMember(m)} className={`text-xs font-bold cursor-pointer ${filterMember === m ? 'text-amber-800 font-extrabold' : 'text-gray-600'}`}>{m}</button>
                    {isEditMode && (
                      <>
                        <button onClick={() => handleRenameMember(m)} className="text-[10px] text-gray-400 hover:text-gray-700 font-bold ml-1 cursor-pointer">✏️</button>
                        <button onClick={() => handleDeleteMember(m)} className="text-gray-300 hover:text-gray-600 text-[10px] font-bold cursor-pointer">✕</button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 flex justify-between items-center">
                <div className="text-xs text-amber-900 font-bold">{filterMember === '全部' ? '全行程累積總花費：' : `【${filterMember}】相關花費加總：`}</div>
                <div className="text-lg font-black text-amber-900">
                  ${expenses.filter(e => filterMember === '全部' || e.splitFor.includes(filterMember)).reduce((sum, e) => sum + e.amount, 0)} <span className="text-xs font-normal">MYR</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>🧾 明細紀錄</h3>
                <span className="text-[10px] text-gray-400">共 {expenses.length} 筆</span>
              </div>

              <div className="space-y-2.5">
                {expenses.filter(e => filterMember === '全部' || e.splitFor.includes(filterMember)).map(exp => (
                  <div key={exp.id} className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 relative space-y-1">
                    <div className="flex justify-between items-start pr-6">
                      <div>
                        <span className="font-bold text-sm text-slate-800">{exp.item}</span>
                        {exp.note && <div className="text-[11px] text-gray-500 mt-0.5">💡 {exp.note}</div>}
                      </div>
                      <div className="text-right font-bold text-amber-900 text-sm">{exp.currency} ${exp.amount}</div>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-gray-200/50 text-[10px]">
                      <span className="text-gray-400">對象：{exp.splitFor.join(', ')}</span>
                      {isEditMode && (
                        <button onClick={() => setEditingExpense(exp)} className="text-amber-800 font-bold underline cursor-pointer">✏️ 編輯明細</button>
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
        <div className="max-w-md mx-auto flex justify-around py-2.5 font-bold text-[11px]">
          {[
            { id: 'itinerary', name: '行程總覽' },
            { id: 'prep', name: '行前準備' },
            { id: 'shopping', name: '購買清單' },
            { id: 'expenses', name: '行程花費' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center px-3 py-1 transition cursor-pointer ${activeTab === tab.id ? 'scale-110' : 'opacity-40'}`}
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
