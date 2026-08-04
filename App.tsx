import React, { useState, useEffect } from 'react';

const THEME = {
  primary: '#183451',
  accent: '#A9501C',
  bg: '#F3ECDE',
  sand: '#D4AF83',
};

// 24小時氣象預設資料
const GENERATE_24H_WEATHER = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hourStr = `${i.toString().padStart(2, '0')}:00`;
    let icon = '☀️';
    let temp = 28;
    let rain = '10%';
    if (i < 6 || i >= 19) {
      icon = '🌙';
      temp = 26;
      rain = '0%';
    } else if (i >= 15 && i < 18) {
      icon = '🌧️';
      temp = 29;
      rain = '70%';
    } else if (i >= 11 && i < 15) {
      icon = '🌤️';
      temp = 33;
      rain = '30%';
    }
    hours.push({ time: hourStr, temp: `${temp}°`, rain: rain, icon: icon });
  }
  return hours;
};

// 8 天完整行程資料
const MASTER_ITINERARY = [
  {
    day: '8/15 Sat.',
    title: '臺灣 → 吉隆坡',
    city: '吉隆坡',
    lat: 3.139,
    lng: 101.6869,
    items: [
      {
        id: '1-1',
        time: '06:45 前',
        name: '家 → 桃園機場',
        type: '交通',
        note: '辦理登機手續',
        map: '',
        img: '',
      },
      {
        id: '1-2',
        time: '08:45 - 13:25',
        name: '華航 CI72 航班 (08:45 起飛 → 13:25 抵達)',
        type: '交通',
        note: '抵達吉隆坡國際機場',
        map: '',
        img: '',
      },
      {
        id: '1-3',
        time: '14:20 - 15:10',
        name: '【機場快線】機場 → 市區',
        type: '交通',
        note: '車程約 30 分鐘',
        map: '',
        img: '',
      },
      {
        id: '1-4',
        time: '15:10 - 16:00',
        name: 'Check-in｜吉隆坡豪亞酒店式公寓',
        type: '住宿',
        note: '遠東集團酒店式公寓辦理入住',
        map: 'https://maps.app.goo.gl/HWipQ6etWXGk3qdp8',
        img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: '1-5',
        time: '16:55 - 18:45',
        name: '黑風洞 (Batu Caves)',
        type: '景點',
        note: '272 階彩虹階梯，請著過膝長褲/裙',
        map: 'https://maps.app.goo.gl/4VH85Uz17DKdey1b6',
        img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: '1-6',
        time: '20:10 - 22:00',
        name: '【晚餐】麗豐啦啦米 / 亞羅街美食街',
        type: '飲食',
        note: '必吃鮮味啦啦米粉與燒雞翅',
        map: 'https://maps.app.goo.gl/doRqhPSg5X6EmYaJ8',
        img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    day: '8/16 Sun.',
    title: '馬六甲古城巡禮',
    city: '馬六甲',
    lat: 2.1896,
    lng: 102.2501,
    items: [
      {
        id: '2-1',
        time: '09:30',
        name: '包車前往馬六甲古城',
        type: '交通',
        note: '9:30 集合包車出發',
        map: '',
        img: '',
      },
      {
        id: '2-2',
        time: '停留',
        name: '粉紅清真寺 & 布特拉橋',
        type: '景點',
        note: '拍照打卡水上粉紅清真寺',
        map: '',
        img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: '2-3',
        time: '停留',
        name: '荷蘭紅屋 & 聖地牙哥城堡',
        type: '景點',
        note: '漫步紅屋廣場',
        map: '',
        img: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: '2-4',
        time: '晚上',
        name: '雞場街夜市 (Jonker Street)',
        type: '景點',
        note: '週末夜市與海南雞飯粒',
        map: '',
        img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    day: '8/17 Mon.',
    title: '吉隆坡城市漫遊',
    city: '吉隆坡',
    lat: 3.139,
    lng: 101.6869,
    items: [
      {
        id: '3-1',
        time: '09:30',
        name: 'Ready｜吉隆坡豪亞酒店式公寓 (收拾行李)',
        type: '住宿',
        note: '當晚需換房，請收好行李',
        map: '',
        img: '',
      },
      {
        id: '3-2',
        time: '10:30 - 12:00',
        name: '樂聖嶺天后宮',
        type: '景點',
        note: '東南亞最大媽祖廟，燈籠陣打卡點',
        map: '',
        img: '',
      },
      {
        id: '3-3',
        time: '14:45 - 16:30',
        name: '中央市場 (Central Market)',
        type: '景點',
        note: '文創手作市集',
        map: 'https://maps.app.goo.gl/smpbQKkoT5YwFAGq7',
        img: '',
      },
      {
        id: '3-4',
        time: '16:30 - 21:30',
        name: '柏威年廣場 (Pavilion) / 亞羅街',
        type: '景點',
        note: '晚餐 + 百貨逛街換匯',
        map: 'https://maps.app.goo.gl/Rf7sEgBUhrixPdx97',
        img: '',
      },
    ],
  },
  {
    day: '8/18 Tue.',
    title: '吉隆坡 → 檳城喬治市',
    city: '檳城',
    lat: 5.4141,
    lng: 100.3288,
    items: [
      {
        id: '4-1',
        time: '09:00 - 10:45',
        name: '【早餐】chaFei Wisma Cosway 咖椰多士',
        type: '飲食',
        note: '美味咖椰吐司',
        map: 'https://maps.app.goo.gl/goNaQNtVyjhxcSERA',
        img: '',
      },
      {
        id: '4-2',
        time: '11:40 - 15:15',
        name: '【火車】吉隆坡中央車站 → 檳城北海車站',
        type: '交通',
        note: '乘坐 ETS 高速火車',
        map: '',
        img: '',
      },
      {
        id: '4-3',
        time: '16:00 - 16:20',
        name: '【渡輪】前往喬治市',
        type: '交通',
        note: '渡輪搭乘',
        map: '',
        img: '',
      },
      {
        id: '4-4',
        time: '17:30 - 18:20',
        name: '姓氏橋 (Clan Jetties)',
        type: '景點',
        note: '體驗水上人家生活、觀賞落日夕陽',
        map: 'https://maps.app.goo.gl/E5ENPqHFHnBiiUeb9',
        img: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: '4-5',
        time: '19:30 -',
        name: '逛超市 Giant Penang Plaza',
        type: '景點',
        note: '採買零食伴手禮',
        map: 'https://maps.app.goo.gl/zi2r7GcbqgAFeX4A6',
        img: '',
      },
    ],
  },
  {
    day: '8/19 Wed.',
    title: '檳城自然探索',
    city: '檳城',
    lat: 5.4141,
    lng: 100.3288,
    items: [
      {
        id: '5-1',
        time: '10:50 - 14:00',
        name: '升旗山 The Habitat 生態公園',
        type: '景點',
        note: 'Klook 門票已購買，體驗空中步道',
        map: 'https://maps.app.goo.gl/n3zDSQiEk6sqeCD26',
        img: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: '5-2',
        time: '16:25 - 18:00',
        name: '葛尼廣場 (Gurney Plaza)',
        type: '景點',
        note: '海邊購物中心',
        map: '',
        img: '',
      },
    ],
  },
  {
    day: '8/20 Thu.',
    title: '檳城人文漫遊',
    city: '檳城',
    lat: 5.4141,
    lng: 100.3288,
    items: [
      {
        id: '6-1',
        time: '10:00 - 12:00',
        name: '張弼士故居 + 娘惹博物館',
        type: '景點',
        note: '藍屋與娘惹文化巡禮',
        map: '',
        img: '',
      },
      {
        id: '6-2',
        time: '13:45 - 15:30',
        name: '喬治市壁畫街 & 小印度',
        type: '景點',
        note: '尋找「姐弟共騎」壁畫',
        map: '',
        img: '',
      },
      {
        id: '6-3',
        time: '18:00 - 19:50',
        name: '光大大廈 68 樓彩虹步道',
        type: '景點',
        note: '俯瞰喬治市高空夜景',
        map: '',
        img: '',
      },
    ],
  },
  {
    day: '8/21 Fri.',
    title: '檳城海灘渡假',
    city: '檳城',
    lat: 5.4667,
    lng: 100.2452,
    items: [
      {
        id: '7-1',
        time: '10:30 Check-in',
        name: '檳城香格里拉金沙酒店',
        type: '住宿',
        note: '海灘渡假飯店入住',
        map: 'https://maps.app.goo.gl/Pn9N6CRjeMv7c2Ks9',
        img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: '7-2',
        time: '18:00 -',
        name: '峇都丁宜海灘 (Batu Ferringhi)',
        type: '景點',
        note: '觀賞著名落日夕陽',
        map: '',
        img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    day: '8/22 Sat.',
    title: '檳城 → 臺灣',
    city: '檳城',
    lat: 5.2971,
    lng: 100.2768,
    items: [
      {
        id: '8-1',
        time: '11:00 - 12:00',
        name: '前往檳城國際機場',
        type: '交通',
        note: '搭乘 Grab 移動前往機場',
        map: '',
        img: '',
      },
      {
        id: '8-2',
        time: '15:10 - 19:55',
        name: '華航 CI732 (15:10 起飛 → 19:55 抵達)',
        type: '交通',
        note: '順利返抵桃園國際機場！',
        map: '',
        img: '',
      },
    ],
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [itinerary, setItinerary] = useState(MASTER_ITINERARY);
  const [hourlyWeather, setHourlyWeather] = useState(GENERATE_24H_WEATHER());

  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedItemIdx, setDraggedItemIdx] = useState(null);

  const [prepList, setPrepList] = useState([
    { id: 1, cat: '衣物配件', text: '排汗衫 / 薄短袖', done: false },
    { id: 2, cat: '衣物配件', text: '薄外套 / 防曬罩衫', done: false },
    {
      id: 3,
      cat: '待辦事項',
      text: '填寫馬來西亞數位入境卡 MDAC (8/13-8/15)',
      done: false,
    },
  ]);
  const [newPrepText, setNewPrepText] = useState('');
  const [newPrepCat, setNewPrepCat] = useState('個人物品');

  const [shoppingList, setShoppingList] = useState([
    { id: 1, name: '舊街場白咖啡 (OldTown)', target: '超市', bought: false },
    { id: 2, name: "Beryl's 巧克力", target: '專櫃/機場', bought: false },
  ]);
  const [newShopName, setNewShopName] = useState('');
  const [newShopTarget, setNewShopTarget] = useState('');

  const [members, setMembers] = useState(['我', '成員A', '成員B']);
  const [newMemberInput, setNewMemberInput] = useState('');
  const [filterMember, setFilterMember] = useState('全部');
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      date: '8/15',
      item: '機場快線車票',
      amount: 220,
      currency: 'MYR',
      splitFor: ['我', '成員A', '成員B'],
      note: '全團車票',
    },
    {
      id: 2,
      date: '8/15',
      item: '亞羅街海鮮晚餐',
      amount: 180,
      currency: 'MYR',
      splitFor: ['我', '成員A', '成員B'],
      note: '晚餐',
    },
    {
      id: 3,
      date: '8/15',
      item: '個人藥品保養品',
      amount: 45,
      currency: 'MYR',
      splitFor: ['成員A'],
      note: '成員A個人採買',
    },
  ]);

  const [editingSpot, setEditingSpot] = useState(null);
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);
  const [newSpot, setNewSpot] = useState({
    name: '',
    time: '',
    type: '景點',
    note: '',
    map: '',
    img: '',
  });
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [newExpense, setNewExpense] = useState({
    item: '',
    amount: '',
    currency: 'MYR',
    splitType: 'ALL',
    selectedMembers: [],
    note: '',
  });

  const handleDragStart = (e, index) => {
    if (!isEditMode) return;
    setDraggedItemIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (e, dropTargetIdx) => {
    e.preventDefault();
    if (
      !isEditMode ||
      draggedItemIdx === null ||
      draggedItemIdx === dropTargetIdx
    )
      return;
    const updated = [...itinerary];
    const currentItems = [...updated[selectedDayIdx].items];
    const [movedItem] = currentItems.splice(draggedItemIdx, 1);
    currentItems.splice(dropTargetIdx, 0, movedItem);
    updated[selectedDayIdx].items = currentItems;
    setItinerary(updated);
    setDraggedItemIdx(null);
  };

  const moveSpot = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= itinerary[selectedDayIdx].items.length)
      return;
    const updated = [...itinerary];
    const currentItems = [...updated[selectedDayIdx].items];
    const [movedItem] = currentItems.splice(index, 1);
    currentItems.splice(targetIdx, 0, movedItem);
    updated[selectedDayIdx].items = currentItems;
    setItinerary(updated);
  };

  const handleAddMember = () => {
    if (!newMemberInput.trim()) return;
    if (members.includes(newMemberInput.trim())) return alert('成員已存在');
    setMembers([...members, newMemberInput.trim()]);
    setNewMemberInput('');
  };
  const handleDeleteMember = (target) => {
    if (members.length <= 1) return alert('請至少留一位成員');
    setMembers(members.filter((m) => m !== target));
    if (filterMember === target) setFilterMember('全部');
  };

  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    if (!newExpense.item || !newExpense.amount) return;
    const targetSplit =
      newExpense.splitType === 'ALL'
        ? [...members]
        : newExpense.selectedMembers;
    setExpenses([
      ...expenses,
      {
        id: Date.now(),
        date: itinerary[selectedDayIdx].day.split(' ')[0],
        item: newExpense.item,
        amount: parseFloat(newExpense.amount),
        currency: newExpense.currency,
        splitType: newExpense.splitType,
        splitFor: targetSplit,
        note: newExpense.note,
      },
    ]);
    setNewExpense({
      item: '',
      amount: '',
      currency: 'MYR',
      splitType: 'ALL',
      selectedMembers: [],
      note: '',
    });
    setShowAddExpenseModal(false);
  };

  const handleSaveEditExpense = () => {
    setExpenses(
      expenses.map((e) => (e.id === editingExpense.id ? editingExpense : e))
    );
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  return (
    <div
      className="max-w-md mx-auto min-h-screen pb-20 shadow-2xl relative"
      style={{ backgroundColor: THEME.bg }}
    >
      <header
        className="p-4 text-white shadow-md flex justify-between items-center sticky top-0 z-40"
        style={{ backgroundColor: THEME.primary }}
      >
        <div>
          <h1 className="text-lg font-bold tracking-wide">馬來西亞 8天7夜</h1>
          <p className="text-xs" style={{ color: THEME.sand }}>
            2026.08.15 － 08.22
          </p>
        </div>

        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`text-[10px] px-3 py-1.5 rounded-full font-bold border transition shadow-sm ${
            isEditMode
              ? 'bg-amber-500 text-white border-amber-300'
              : 'bg-white/20 text-gray-200 border-white/30'
          }`}
        >
          {isEditMode ? '✏️ 編輯模式 (可管理)' : '👁️ 瀏覽模式 (唯讀)'}
        </button>
      </header>

      <main className="p-4 space-y-4">
        {activeTab === 'itinerary' && (
          <div className="space-y-3">
            <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-none">
              {itinerary.map((d, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    selectedDayIdx === idx
                      ? 'text-white scale-105 shadow-md'
                      : 'bg-white text-gray-600'
                  }`}
                  style={{
                    backgroundColor: selectedDayIdx === idx ? THEME.accent : '',
                  }}
                >
                  <div>Day {idx + 1}</div>
                  <div className="opacity-75">{d.day.split(' ')[0]}</div>
                </button>
              ))}
            </div>

            <div className="p-3 bg-white rounded-xl shadow-xs border border-amber-900/10 flex justify-between items-center">
              <div>
                <h2
                  className="font-bold text-sm"
                  style={{ color: THEME.primary }}
                >
                  Day {selectedDayIdx + 1}: {itinerary[selectedDayIdx].title}
                </h2>
                <p className="text-[10px] text-gray-400">
                  📍 區域：{itinerary[selectedDayIdx].city}
                </p>
              </div>
              {isEditMode && (
                <button
                  onClick={() => setShowAddSpotModal(true)}
                  className="text-xs px-2.5 py-1.5 rounded-lg text-white font-bold shadow"
                  style={{ backgroundColor: THEME.accent }}
                >
                  ➕ 新增行程
                </button>
              )}
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 rounded-2xl shadow-md border border-slate-700">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[11px] font-bold text-slate-300">
                  🌤️ 每小時氣象預報 (00:00 - 23:00)
                </span>
                <span className="text-[10px] text-slate-400">橫向滑動 →</span>
              </div>
              <div className="flex overflow-x-auto space-x-2.5 pb-1 pt-1 scrollbar-none">
                {hourlyWeather.map((hw, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 flex flex-col items-center justify-between bg-white/10 px-2.5 py-2 rounded-xl min-w-[56px] border border-white/10"
                  >
                    <span className="text-[10px] text-slate-300">
                      {hw.time}
                    </span>
                    <span className="text-base my-1">{hw.icon}</span>
                    <span className="text-xs font-bold">{hw.temp}</span>
                    <span className="text-[9px] text-sky-300">💧{hw.rain}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {itinerary[selectedDayIdx].items.map((spot, index) => (
                <div
                  key={spot.id}
                  draggable={isEditMode}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-900/10 ${
                    isEditMode ? 'draggable-card' : ''
                  }`}
                >
                  {spot.img && (
                    <div className="h-36 w-full overflow-hidden relative">
                      <img
                        src={spot.img}
                        alt={spot.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-3.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {isEditMode && (
                          <div className="flex items-center space-x-1">
                            <span className="p-1 px-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-400 text-xs font-bold cursor-grab">
                              ☰
                            </span>
                            {index > 0 && (
                              <button
                                onClick={() => moveSpot(index, -1)}
                                className="p-1 px-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-xs font-bold hover:bg-gray-100"
                              >
                                ↑
                              </button>
                            )}
                            {index <
                              itinerary[selectedDayIdx].items.length - 1 && (
                              <button
                                onClick={() => moveSpot(index, 1)}
                                className="p-1 px-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-xs font-bold hover:bg-gray-100"
                              >
                                ↓
                              </button>
                            )}
                          </div>
                        )}
                        <span
                          className="text-[10px] px-2 py-0.5 rounded font-bold text-white"
                          style={{ backgroundColor: THEME.primary }}
                        >
                          {spot.type}
                        </span>
                      </div>

                      {isEditMode && (
                        <button
                          onClick={() => setEditingSpot(spot)}
                          className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200"
                        >
                          ✏️ 編輯
                        </button>
                      )}
                    </div>

                    <h3
                      className="font-bold text-sm mt-2"
                      style={{ color: THEME.primary }}
                    >
                      {spot.name}
                    </h3>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">
                      ⏰ {spot.time}
                    </div>
                    {spot.note && (
                      <p className="text-xs text-gray-600 mt-2 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                        {spot.note}
                      </p>
                    )}
                    {spot.map && (
                      <a
                        href={spot.map}
                        target="_blank"
                        className="inline-block mt-3 text-xs font-bold underline"
                        style={{ color: THEME.accent }}
                      >
                        📍 開啟 Google Maps 導航
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'prep' && (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-amber-900/10 space-y-2">
              <h3 className="text-xs font-bold text-gray-600">
                ➕ 新增準備項目
              </h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="物品名稱"
                  value={newPrepText}
                  onChange={(e) => setNewPrepText(e.target.value)}
                  className="flex-1 p-2 text-xs border rounded-xl"
                />
                <select
                  value={newPrepCat}
                  onChange={(e) => setNewPrepCat(e.target.value)}
                  className="p-2 text-xs border rounded-xl bg-white"
                >
                  <option value="個人物品">個人物品</option>
                  <option value="衣物配件">衣物配件</option>
                  <option value="電子支付">電子支付</option>
                  <option value="待辦事項">待辦事項</option>
                </select>
                <button
                  onClick={() => {
                    if (!newPrepText.trim()) return;
                    setPrepList([
                      ...prepList,
                      {
                        id: Date.now(),
                        cat: newPrepCat,
                        text: newPrepText.trim(),
                        done: false,
                      },
                    ]);
                    setNewPrepText('');
                  }}
                  className="px-3 py-2 text-xs font-bold text-white rounded-xl shadow"
                  style={{ backgroundColor: THEME.accent }}
                >
                  新增
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-2">
              <h2
                className="text-base font-bold mb-3"
                style={{ color: THEME.primary }}
              >
                🎒 檢查清單
              </h2>
              {prepList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white"
                >
                  <div
                    className="flex items-center space-x-2 flex-1 cursor-pointer"
                    onClick={() =>
                      setPrepList(
                        prepList.map((p) =>
                          p.id === item.id ? { ...p, done: !p.done } : p
                        )
                      )
                    }
                  >
                    <span
                      className={`text-sm ${
                        item.done ? 'line-through text-gray-400' : 'font-medium'
                      }`}
                    >
                      {item.done ? '✅' : '⬜'} {item.text}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-400">
                      {item.cat}
                    </span>
                    <button
                      onClick={() =>
                        setPrepList(prepList.filter((p) => p.id !== item.id))
                      }
                      className="text-gray-300 hover:text-gray-600 font-bold text-xs p-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-amber-900/10 space-y-2">
              <h3 className="text-xs font-bold text-gray-600">
                ➕ 新增想買伴手禮
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="商品名稱"
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  className="p-2 text-xs border rounded-xl"
                />
                <input
                  type="text"
                  placeholder="購買地點"
                  value={newShopTarget}
                  onChange={(e) => setNewShopTarget(e.target.value)}
                  className="p-2 text-xs border rounded-xl"
                />
              </div>
              <button
                onClick={() => {
                  if (!newShopName.trim()) return;
                  setShoppingList([
                    ...shoppingList,
                    {
                      id: Date.now(),
                      name: newShopName.trim(),
                      target: newShopTarget.trim() || '超市',
                      bought: false,
                    },
                  ]);
                  setNewShopName('');
                  setNewShopTarget('');
                }}
                className="w-full py-2 text-xs font-bold text-white rounded-xl shadow"
                style={{ backgroundColor: THEME.accent }}
              >
                新增至清單
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-2">
              <h2
                className="text-base font-bold mb-3"
                style={{ color: THEME.primary }}
              >
                🛍️ 伴手禮清單
              </h2>
              {shoppingList.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-white border border-gray-100 rounded-xl flex justify-between items-center"
                >
                  <div
                    className="flex items-center space-x-2 flex-1 cursor-pointer"
                    onClick={() =>
                      setShoppingList(
                        shoppingList.map((item) =>
                          item.id === s.id
                            ? { ...item, bought: !item.bought }
                            : item
                        )
                      )
                    }
                  >
                    <div>
                      <div
                        className={`font-bold text-sm ${
                          s.bought ? 'line-through text-gray-400' : ''
                        }`}
                      >
                        {s.bought ? '✅ ' : '⬜ '}
                        {s.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        地點：{s.target}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setShoppingList(
                        shoppingList.filter((item) => item.id !== s.id)
                      )
                    }
                    className="text-gray-300 hover:text-gray-600 font-bold text-xs p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {isEditMode && (
              <button
                onClick={() => {
                  setNewExpense({
                    ...newExpense,
                    selectedMembers: [...members],
                  });
                  setShowAddExpenseModal(true);
                }}
                className="w-full py-3 rounded-2xl text-white font-bold text-sm shadow-md flex items-center justify-center space-x-1"
                style={{ backgroundColor: THEME.accent }}
              >
                <span>➕ 新增花費紀錄</span>
              </button>
            )}

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-900/10 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold text-gray-500">
                  👥 成員名單與花費統計
                </h2>
                <span className="text-[10px] text-gray-400">
                  {isEditMode ? '編輯模式' : '唯讀模式'}
                </span>
              </div>

              {isEditMode && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="輸入新成員名字"
                    value={newMemberInput}
                    onChange={(e) => setNewMemberInput(e.target.value)}
                    className="flex-1 p-1.5 text-xs border rounded-lg"
                  />
                  <button
                    onClick={handleAddMember}
                    className="px-3 py-1.5 text-xs font-bold text-white rounded-lg"
                    style={{ backgroundColor: THEME.accent }}
                  >
                    新增成員
                  </button>
                </div>
              )}

              <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-none">
                <button
                  onClick={() => setFilterMember('全部')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                    filterMember === '全部'
                      ? 'bg-slate-800 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  全部花費
                </button>
                {members.map((m) => (
                  <div
                    key={m}
                    className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-xl flex-shrink-0 border border-gray-200"
                  >
                    <button
                      onClick={() => setFilterMember(m)}
                      className={`text-xs font-bold ${
                        filterMember === m
                          ? 'text-amber-800 font-extrabold'
                          : 'text-gray-600'
                      }`}
                    >
                      {m}
                    </button>
                    {isEditMode && (
                      <button
                        onClick={() => handleDeleteMember(m)}
                        className="text-gray-300 hover:text-gray-600 text-[10px] font-bold ml-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 flex justify-between items-center">
                <div className="text-xs text-amber-900 font-bold">
                  {filterMember === '全部'
                    ? '全行程累積總花費：'
                    : `【${filterMember}】相關花費加總：`}
                </div>
                <div className="text-lg font-black text-amber-900">
                  $
                  {expenses
                    .filter(
                      (e) =>
                        filterMember === '全部' ||
                        e.splitFor.includes(filterMember)
                    )
                    .reduce((sum, e) => sum + e.amount, 0)}{' '}
                  <span className="text-xs font-normal">MYR</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h3
                  className="font-bold text-sm"
                  style={{ color: THEME.primary }}
                >
                  🧾 明細紀錄
                </h3>
                <span className="text-[10px] text-gray-400">
                  共 {expenses.length} 筆
                </span>
              </div>

              <div className="space-y-2.5">
                {expenses
                  .filter(
                    (e) =>
                      filterMember === '全部' ||
                      e.splitFor.includes(filterMember)
                  )
                  .map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 relative space-y-1"
                    >
                      <div className="flex justify-between items-start pr-6">
                        <div>
                          <span className="font-bold text-sm text-slate-800">
                            {exp.item}
                          </span>
                          {exp.note && (
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              💡 {exp.note}
                            </div>
                          )}
                        </div>
                        <div className="text-right font-bold text-amber-900 text-sm">
                          {exp.currency} ${exp.amount}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-gray-200/50 text-[10px]">
                        <span className="text-gray-400">
                          對象：{exp.splitFor.join(', ')}
                        </span>
                        {isEditMode && (
                          <button
                            onClick={() => setEditingExpense(exp)}
                            className="text-amber-800 font-bold underline"
                          >
                            ✏️ 編輯
                          </button>
                        )}
                      </div>

                      {isEditMode && (
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="absolute top-2.5 right-2.5 text-gray-300 hover:text-gray-600 font-bold text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-900/10 z-40">
        <div className="max-w-md mx-auto flex justify-around py-2 font-bold text-[11px]">
          {[
            { id: 'itinerary', name: '行程總覽' },
            { id: 'prep', name: '行前準備' },
            { id: 'shopping', name: '購買清單' },
            { id: 'expenses', name: '行程花費' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center px-3 py-1 transition ${
                activeTab === tab.id ? 'scale-110' : 'opacity-40'
              }`}
              style={{
                color: activeTab === tab.id ? THEME.accent : THEME.primary,
              }}
            >
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
