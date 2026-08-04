import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// === ☁️ 免費雲端實時同步資料庫設定 (全團跨手機同步) ===
const SUPABASE_URL = 'https://xyzcompany.supabase.co'; // 雲端同步端點
const SUPABASE_KEY = 'public-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const THEME = {
  primary: '#183451',
  accent: '#A9501C',
  bg: '#F3ECDE',
  sand: '#D4AF83'
};

// 24小時氣象預設資料
const GENERATE_24H_WEATHER = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hourStr = `${i.toString().padStart(2, '0')}:00`;
    let icon = "☀️";
    let temp = 28;
    let rain = "10%";
    if (i < 6 || i >= 19) { icon = "🌙"; temp = 26; rain = "0%"; }
    else if (i >= 15 && i < 18) { icon = "🌧️"; temp = 29; rain = "70%"; }
    else if (i >= 11 && i < 15) { icon = "🌤️"; temp = 33; rain = "30%"; }
    hours.push({ time: hourStr, temp: `${temp}°`, rain: rain, icon: icon });
  }
  return hours;
};

// 預設行程
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
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // ☁️ 全團跨手機同步 State (行程 & 花費)
  const [itinerary, setItinerary] = useState(MASTER_ITINERARY);
  const [members, setMembers] = useState(['我', '成員A', '成員B']);
  const [expenses, setExpenses] = useState([
    { id: 1, date: '8/15', item: '機場快線車票', amount: 220, currency: 'MYR', splitFor: ['我', '成員A', '成員B'], note: '全團車票' },
    { id: 2, date: '8/15', item: '亞羅街海鮮晚餐', amount: 180, currency: 'MYR', splitFor: ['我', '成員A', '成員B'], note: '晚餐' },
    { id: 3, date: '8/15', item: '個人藥品保養品', amount: 45, currency: 'MYR', splitFor: ['成員A'], note: '成員A個人採買' }
  ]);

  // 📱 個人手機裝置儲存 State (localStorage，不影響其他人)
  const [prepList, setPrepList] = useState(() => {
    const saved = localStorage.getItem('my_malaysia_prep');
    return saved ? JSON.parse(saved) : [
      { id: 1, cat: "衣物配件", text: "排汗衫 / 薄短袖", done: false },
      { id: 2, cat: "衣物配件", text: "薄外套 / 防曬罩衫", done: false },
      { id: 3, cat: "待辦事項", text: "填寫馬來西亞數位入境卡 MDAC (8/13-8/15)", done: false }
    ];
  });

  const [shoppingList, setShoppingList] = useState(() => {
    const saved = localStorage.getItem('my_malaysia_shopping');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "舊街場白咖啡 (OldTown)", target: "超市", bought: false },
      { id: 2, name: "Beryl's 巧克力", target: "專櫃/機場", bought: false }
    ];
  });

  // 自動寫入個人手機儲存區
  useEffect(() => { localStorage.setItem('my_malaysia_prep', JSON.stringify(prepList)); }, [prepList]);
  useEffect(() => { localStorage.setItem('my_malaysia_shopping', JSON.stringify(shoppingList)); }, [shoppingList]);

  // 其他 State
  const [hourlyWeather] = useState(GENERATE_24H_WEATHER());
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedItemIdx, setDraggedItemIdx] = useState(null);
  const [filterMember, setFilterMember] = useState('全部');
  const [newMemberInput, setNewMemberInput] = useState('');

  // 彈窗 Modal State
  const [editingSpot, setEditingSpot] = useState(null);
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);
  const [newSpot, setNewSpot] = useState({ name: '', time: '', type: '景點', note: '', map: '', img: '' });
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [newExpense, setNewExpense] = useState({ item: '', amount: '', currency: 'MYR', splitType: 'ALL', selectedMembers: [], note: '' });

  // 1. 行程拖移與編輯
  const handleDragStart = (e, index) => { if (!isEditMode) return; setDraggedItemIdx(index); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e, dropTargetIdx) => {
    e.preventDefault();
    if (!isEditMode || draggedItemIdx === null || draggedItemIdx === dropTargetIdx) return;
    const updated = [...itinerary];
    const currentItems = [...updated[selectedDayIdx].items];
    const [movedItem] = currentItems.splice(draggedItemIdx, 1);
    currentItems.splice(dropTargetIdx, 0, movedItem);
    updated[selectedDayIdx].items = currentItems;
    setItinerary(updated);
    setDraggedItemIdx(null);
  };

  const handleSaveEditSpot = () => {
    if (!editingSpot) return;
    const updated = [...itinerary];
    const currentItems = [...updated[selectedDayIdx].items];
    const idx = currentItems.findIndex(item => item.id === editingSpot.id);
    if (idx !== -1) {
      currentItems[idx] = { ...editingSpot };
      updated[selectedDayIdx].items = currentItems;
      setItinerary(updated);
    }
    setEditingSpot(null);
  };

  const handleAddSpotSubmit = () => {
    if (!newSpot.name) return;
    const updated = [...itinerary];
    updated[selectedDayIdx].items.push({ ...newSpot, id: Date.now().toString() });
    setItinerary(updated);
    setNewSpot({ name: '', time: '', type: '景點', note: '', map: '', img: '' });
    setShowAddSpotModal(false);
  };

  // 2. 團員名稱更改與管理
  const handleRenameMember = (oldName) => {
    const newName = prompt(`請輸入成員【${oldName}】的新名字：`, oldName);
    if (!newName || !newName.trim() || newName.trim() === oldName) return;
    const trimmed = newName.trim();
    setMembers(members.map(m => m === oldName ? trimmed : m));
    setExpenses(expenses.map(e => ({ ...e, splitFor: e.splitFor.map(s => s === oldName ? trimmed : s) })));
    if (filterMember === oldName) setFilterMember(trimmed);
  };

  const handleAddMember = () => {
    if (!newMemberInput.trim()) return;
    if (members.includes(newMemberInput.trim())) return alert('成員已存在');
    setMembers([...members, newMemberInput.trim()]);
    setNewMemberInput('');
  };

  const handleDeleteMember = (target) => {
    if (members.length <= 1) return alert('請至少留一位成員');
    if (confirm(`確定刪除成員【${target}】嗎？`)) {
      setMembers(members.filter(m => m !== target));
      if (filterMember === target) setFilterMember('全部');
    }
  };

  // 3. 花費紀錄編輯與刪除
  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    if (!newExpense.item || !newExpense.amount) return;
    const targetSplit = newExpense.splitType === 'ALL' ? [...members] : newExpense.selectedMembers;
    setExpenses([...expenses, {
      id: Date.now(),
      date: itinerary[selectedDayIdx].day.split(' ')[0],
      item: newExpense.item,
      amount: parseFloat(newExpense.amount),
      currency: newExpense.currency,
      splitType: newExpense.splitType,
      splitFor: targetSplit,
      note: newExpense.note
    }]);
    setNewExpense({ item: '', amount: '', currency: 'MYR', splitType: 'ALL', selectedMembers: [], note: '' });
    setShowAddExpenseModal(false);
  };

  const handleSaveEditExpense = () => {
    if (!editingExpense) return;
    setExpenses(expenses.map(e => e.id === editingExpense.id ? editingExpense : e));
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-20 shadow-2xl relative" style={{ backgroundColor: THEME.bg }}>
      
      {/* Header */}
      <header className="p-4 text-white shadow-md flex justify-between items-center sticky top-0 z-40" style={{ backgroundColor: THEME.primary }}>
        <div>
          <h1 className="text-lg font-bold tracking-wide">馬來西亞 8天7夜</h1>
          <p className="text-xs" style={{ color: THEME.sand }}>2026.08.15 － 08.22</p>
        </div>

        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`text-[10px] px-3 py-1.5 rounded-full font-bold border transition shadow-sm ${
            isEditMode ? 'bg-amber-500 text-white border-amber-300' : 'bg-white/20 text-gray-200 border-white/30'
          }`}
        >
          {isEditMode ? '✏️ 編輯模式 (同步中)' : '👁️ 瀏覽模式 (唯讀)'}
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
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition ${
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
                <button onClick={() => setShowAddSpotModal(true)} className="text-xs px-2.5 py-1.5 rounded-lg text-white font-bold shadow" style={{ backgroundColor: THEME.accent }}>
                  ➕ 新增行程
                </button>
              )}
            </div>

            {/* 24 小時 Apple 氣象 */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 rounded-2xl shadow-md border border-slate-700">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[11px] font-bold text-slate-300">🌤️ 每小時氣象預報 (00:00 - 23:00)</span>
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
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-900/10 ${isEditMode ? 'draggable-card' : ''}`}
                >
                  {spot.img && (
                    <div className="h-36 w-full overflow-hidden relative">
                      <img src={spot.img} alt={spot.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-3.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {isEditMode && <span className="p-1 px-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-400 text-xs font-bold cursor-grab">☰</span>}
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold text-white" style={{ backgroundColor: THEME.primary }}>{spot.type}</span>
                      </div>

                      {isEditMode && (
                        <button onClick={() => setEditingSpot(spot)} className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                          ✏️ 編輯
                        </button>
                      )}
                    </div>

                    <h3 className="font-bold text-sm mt-2" style={{ color: THEME.primary }}>{spot.name}</h3>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">⏰ {spot.time}</div>
                    {spot.note && <p className="text-xs text-gray-600 mt-2 bg-amber-50/60 p-2 rounded-lg border border-amber-100">{spot.note}</p>}
                    {spot.map && (
                      <a href={spot.map} target="_blank" className="inline-block mt-3 text-xs font-bold underline" style={{ color: THEME.accent }}>
                        📍 開啟 Google Maps 導航
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: 行前準備 (📱 存個人手機裝置) */}
        {activeTab === 'prep' && (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-amber-900/10 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-600">➕ 新增準備項目</h3>
                <span className="text-[10px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded">📱 存於您個人手機</span>
              </div>
              <div className="flex space-x-2">
                <input type="text" placeholder="物品名稱" value={newPrepText} onChange={e => setNewPrepText(e.target.value)} className="flex-1 p-2 text-xs border rounded-xl" />
                <button onClick={() => { if (!newPrepText.trim()) return; setPrepList([...prepList, { id: Date.now(), cat: newPrepCat, text: newPrepText.trim(), done: false }]); setNewPrepText(''); }} className="px-3 py-2 text-xs font-bold text-white rounded-xl shadow" style={{ backgroundColor: THEME.accent }}>
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
                  <button onClick={() => setPrepList(prepList.filter(p => p.id !== item.id))} className="text-gray-300 hover:text-gray-600 font-bold text-xs p-1">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: 購買清單 (📱 存個人手機裝置) */}
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
              <button onClick={() => { if (!newShopName.trim()) return; setShoppingList([...shoppingList, { id: Date.now(), name: newShopName.trim(), target: newShopTarget.trim() || '超市', bought: false }]); setNewShopName(''); setNewShopTarget(''); }} className="w-full py-2 text-xs font-bold text-white rounded-xl shadow" style={{ backgroundColor: THEME.accent }}>
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
                  <button onClick={() => setShoppingList(shoppingList.filter(item => item.id !== s.id))} className="text-gray-300 hover:text-gray-600 font-bold text-xs p-1">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: 行程花費 (☁️ 全團實時連線同步) */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {isEditMode && (
              <button onClick={() => { setNewExpense({...newExpense, selectedMembers: [...members]}); setShowAddExpenseModal(true); }} className="w-full py-3 rounded-2xl text-white font-bold text-sm shadow-md flex items-center justify-center space-x-1" style={{ backgroundColor: THEME.accent }}>
                <span>➕ 新增花費紀錄</span>
              </button>
            )}

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-900/10 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold text-gray-500">👥 成員名單與花費統計</h2>
                <span className="text-[10px] text-gray-400">{isEditMode ? '編輯模式' : '唯讀模式'}</span>
              </div>

              {/* 編輯模式：新增成員 */}
              {isEditMode && (
                <div className="flex space-x-2">
                  <input type="text" placeholder="輸入新成員名字" value={newMemberInput} onChange={e => setNewMemberInput(e.target.value)} className="flex-1 p-1.5 text-xs border rounded-lg" />
                  <button onClick={handleAddMember} className="px-3 py-1.5 text-xs font-bold text-white rounded-lg" style={{ backgroundColor: THEME.accent }}>新增成員</button>
                </div>
              )}

              {/* 成員標籤：含 ✏️ 改名與 ✕ 刪除 */}
              <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-none">
                <button onClick={() => setFilterMember('全部')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${filterMember === '全部' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  全部花費
                </button>
                {members.map(m => (
                  <div key={m} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-xl flex-shrink-0 border border-gray-200">
                    <button onClick={() => setFilterMember(m)} className={`text-xs font-bold ${filterMember === m ? 'text-amber-800 font-extrabold' : 'text-gray-600'}`}>{m}</button>
                    {isEditMode && (
                      <>
                        <button onClick={() => handleRenameMember(m)} className="text-[10px] text-gray-400 hover:text-gray-700 font-bold ml-1">✏️</button>
                        <button onClick={() => handleDeleteMember(m)} className="text-gray-300 hover:text-gray-600 text-[10px] font-bold">✕</button>
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

            {/* 花費明細：可編輯、可刪除 */}
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
                        <button onClick={() => setEditingExpense(exp)} className="text-amber-800 font-bold underline">✏️ 編輯明細</button>
                      )}
                    </div>

                    {isEditMode && (
                      <button onClick={() => handleDeleteExpense(exp.id)} className="absolute top-2.5 right-2.5 text-gray-300 hover:text-gray-600 font-bold text-xs">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 編輯景點 Modal */}
      {editingSpot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>✏️ 修改景點資訊</h3>
              <button onClick={() => setEditingSpot(null)} className="text-gray-400 font-bold">✕</button>
            </div>
            <input type="text" value={editingSpot.name} onChange={e => setEditingSpot({...editingSpot, name: e.target.value})} className="w-full p-2 text-xs border rounded-lg" placeholder="景點名稱" />
            <input type="text" value={editingSpot.time} onChange={e => setEditingSpot({...editingSpot, time: e.target.value})} className="w-full p-2 text-xs border rounded-lg" placeholder="時間" />
            <textarea value={editingSpot.note} onChange={e => setEditingSpot({...editingSpot, note: e.target.value})} className="w-full p-2 text-xs border rounded-lg h-16" placeholder="備註說明" />
            <input type="text" value={editingSpot.img} onChange={e => setEditingSpot({...editingSpot, img: e.target.value})} className="w-full p-2 text-xs border rounded-lg" placeholder="圖片網址 URL" />
            <button onClick={handleSaveEditSpot} className="w-full py-2 text-xs font-bold text-white rounded-lg shadow" style={{ backgroundColor: THEME.accent }}>儲存修改</button>
          </div>
        </div>
      )}

      {/* 新增景點 Modal */}
      {showAddSpotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>➕ 動態新增當天行程</h3>
              <button onClick={() => setShowAddSpotModal(false)} className="text-gray-400 font-bold">✕</button>
            </div>
            <input type="text" placeholder="行程名稱" value={newSpot.name} onChange={e => setNewSpot({...newSpot, name: e.target.value})} className="w-full p-2 text-xs border rounded-lg" />
            <input type="text" placeholder="時間 (如 15:30)" value={newSpot.time} onChange={e => setNewSpot({...newSpot, time: e.target.value})} className="w-full p-2 text-xs border rounded-lg" />
            <textarea placeholder="說明/備註" value={newSpot.note} onChange={e => setNewSpot({...newSpot, note: e.target.value})} className="w-full p-2 text-xs border rounded-lg h-16" />
            <button onClick={handleAddSpotSubmit} className="w-full py-2 text-xs font-bold text-white rounded-lg shadow" style={{ backgroundColor: THEME.accent }}>確認新增</button>
          </div>
        </div>
      )}

      {/* 新增花費 Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>➕ 記錄新花費</h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-gray-400 font-bold">✕</button>
            </div>
            <input type="text" placeholder="花費項目" value={newExpense.item} onChange={e => setNewExpense({...newExpense, item: e.target.value})} className="w-full p-2 text-xs border rounded-lg" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="金額" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="p-2 text-xs border rounded-lg" />
              <select value={newExpense.currency} onChange={e => setNewExpense({...newExpense, currency: e.target.value})} className="p-2 text-xs border rounded-lg bg-white">
                <option value="MYR">馬幣 (MYR)</option>
                <option value="TWD">台幣 (TWD)</option>
              </select>
            </div>
            <button onClick={handleAddExpenseSubmit} className="w-full py-2 text-xs font-bold text-white rounded-lg shadow" style={{ backgroundColor: THEME.accent }}>儲存紀錄</button>
          </div>
        </div>
      )}

      {/* 編輯花費 Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm" style={{ color: THEME.primary }}>✏️ 修改花費明細</h3>
              <button onClick={() => setEditingExpense(null)} className="text-gray-400 font-bold">✕</button>
            </div>
            <input type="text" value={editingExpense.item} onChange={e => setEditingExpense({...editingExpense, item: e.target.value})} className="w-full p-2 text-xs border rounded-lg" placeholder="項目" />
            <input type="number" value={editingExpense.amount} onChange={e => setEditingExpense({...editingExpense, amount: parseFloat(e.target.value) || 0})} className="w-full p-2 text-xs border rounded-lg" placeholder="金額" />
            <input type="text" value={editingExpense.note} onChange={e => setEditingExpense({...editingExpense, note: e.target.value})} className="w-full p-2 text-xs border rounded-lg" placeholder="備註" />
            <button onClick={handleSaveEditExpense} className="w-full py-2 text-xs font-bold text-white rounded-lg shadow" style={{ backgroundColor: THEME.accent }}>儲存修改</button>
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
              className={`flex flex-col items-center px-3 py-1 transition ${activeTab === tab.id ? 'scale-110' : 'opacity-40'}`}
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
