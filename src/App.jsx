import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calculator,
  Palette,
  Gamepad2,
  Music,
  Video,
  Globe,
  Settings,
  Plus,
  Trash2,
  X,
  Lock,
  Save,
  Smile,
  AlertTriangle
} from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';

// 初期のアプリデータ（サンプル）
const INITIAL_APPS = [
  { name: 'こくご', url: 'https://www.nhk.or.jp/school/kokugo/', icon: 'book', color: 'bg-red-400' },
  { name: 'さんすう', url: 'https://www.nhk.or.jp/school/sansuu/', icon: 'calc', color: 'bg-blue-400' },
  { name: 'おえかき', url: 'https://quickdraw.withgoogle.com/', icon: 'art', color: 'bg-yellow-400' },
  { name: 'タイピング', url: 'https://typing.twi1.me/', icon: 'game', color: 'bg-purple-400' },
];

const ICONS = {
  book: <BookOpen size={48} className="text-white" />,
  calc: <Calculator size={48} className="text-white" />,
  art: <Palette size={48} className="text-white" />,
  game: <Gamepad2 size={48} className="text-white" />,
  music: <Music size={48} className="text-white" />,
  video: <Video size={48} className="text-white" />,
  world: <Globe size={48} className="text-white" />,
  smile: <Smile size={48} className="text-white" />,
};

const COLOR_OPTIONS = [
  { label: 'あか', value: 'bg-red-400' },
  { label: 'あお', value: 'bg-blue-400' },
  { label: 'きいろ', value: 'bg-yellow-400' },
  { label: 'みどり', value: 'bg-green-400' },
  { label: 'むらさき', value: 'bg-purple-400' },
  { label: 'ぴんく', value: 'bg-pink-400' },
  { label: 'おれんじ', value: 'bg-orange-400' },
];

const ICON_OPTIONS = [
  { label: 'ほん', value: 'book' },
  { label: 'けいさん', value: 'calc' },
  { label: 'え', value: 'art' },
  { label: 'げーむ', value: 'game' },
  { label: 'おんがく', value: 'music' },
  { label: 'どうが', value: 'video' },
  { label: 'ちきゅう', value: 'world' },
  { label: 'にこにこ', value: 'smile' },
];

export default function App() {
  const [apps, setApps] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // 新規追加・編集用のState
  const [editingApp, setEditingApp] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null); // 削除確認用
  const [formData, setFormData] = useState({ name: '', url: '', icon: 'book', color: 'bg-red-400' });

  useEffect(() => {
    // 時計の更新
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Firestoreからデータを取得（リアルタイム更新）
    const q = query(collection(db, 'apps'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // データが空の場合、初期データを投入（初回のみ）
      if (appsData.length === 0 && !localStorage.getItem('initialized')) {
        INITIAL_APPS.forEach(async (app) => {
          await addDoc(collection(db, 'apps'), {
            ...app,
            createdAt: new Date()
          });
        });
        localStorage.setItem('initialized', 'true');
      } else {
        setApps(appsData);
      }
    });

    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, []);

  // 管理画面ログイン
  const handleLogin = () => {
    if (password === '0807') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setPassword('');
    } else {
      alert('パスワードがちがいます');
    }
  };

  // アプリ削除フロー開始
  const startDelete = (id) => {
    setDeleteTargetId(id);
  };

  // アプリ削除実行
  const executeDelete = async () => {
    if (deleteTargetId !== null) {
      await deleteDoc(doc(db, 'apps', deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  // 編集開始
  const startEdit = (app) => {
    if (app) {
      setFormData(app);
      setEditingApp(app);
    } else {
      setFormData({ name: '', url: 'https://', icon: 'book', color: 'bg-red-400' });
      setEditingApp({ id: 'new' });
    }
  };

  // アプリ保存（追加・更新）
  const handleSaveApp = async () => {
    if (!formData.name || !formData.url) return;

    if (editingApp.id === 'new') {
      await addDoc(collection(db, 'apps'), {
        ...formData,
        createdAt: new Date()
      });
    } else {
      const { id, ...data } = formData;
      await updateDoc(doc(db, 'apps', editingApp.id), data);
    }

    setEditingApp(null);
  };

  // 時間フォーマット
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getDayString = (date) => {
    const days = ['にち', 'げつ', 'か', 'すい', 'もく', 'きん', 'ど'];
    return `${date.getMonth() + 1}がつ ${date.getDate()}にち (${days[date.getDay()]})`;
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-amber-200 ${isAdmin ? 'bg-slate-50' : 'bg-amber-50'}`}>
      {/* 管理者モードインジケーター */}
      {isAdmin && (
        <div className="bg-red-500 text-white text-center py-1 font-bold tracking-widest sticky top-0 z-20">
          🔧 せんせい もーど （おわったら かぎを かけてね）
        </div>
      )}

      {/* ヘッダー */}
      <header className={`bg-white p-4 shadow-sm border-b-4 flex justify-between items-center sticky ${isAdmin ? 'top-8' : 'top-0'} z-10 ${isAdmin ? 'border-red-200' : 'border-amber-200'}`}>
        <div className="flex items-center gap-4">
          <div className={`${isAdmin ? 'bg-red-100' : 'bg-amber-100'} p-3 rounded-2xl transition-colors`}>
            <span className="text-4xl">🏫</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-700">
              1ねんせい アプリらんど
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              {getDayString(currentTime)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-4xl font-bold text-slate-700 font-mono tracking-wider">
              {formatTime(currentTime)}
            </p>
          </div>

          <button
            onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)}
            className={`p-3 rounded-full transition-colors ${isAdmin ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            title="せんせいのぼたん"
          >
            {isAdmin ? <Lock size={24} /> : <Settings size={24} />}
          </button>
        </div>
      </header>

      {/* メインエリア */}
      <main className="p-6 max-w-6xl mx-auto">

        {/* あいさつエリア */}
        <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm border-2 border-amber-100 text-center">
          <h2 className="text-3xl font-bold text-slate-700">
            {currentTime.getHours() < 12 ? 'おはようございます！🌞' : 'こんにちは！😊'}
          </h2>
          <p className="text-xl text-slate-500 mt-2">
            きょうも げんきに がんばろう
          </p>
        </div>

        {/* アプリ一覧グリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div key={app.id} className="relative group">
              <a
                href={isAdmin ? '#' : app.url}
                target={isAdmin ? '_self' : '_blank'}
                rel="noreferrer"
                className={`
                  block h-48 rounded-3xl p-6 transition-all duration-300 transform hover:-translate-y-2 shadow-md hover:shadow-xl
                  flex flex-col items-center justify-center gap-4 text-decoration-none
                  ${app.color}
                  ${isAdmin ? 'ring-4 ring-offset-2 ring-slate-300 cursor-default hover:translate-y-0' : ''}
                `}
                onClick={(e) => isAdmin && e.preventDefault()}
              >
                <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                  {ICONS[app.icon] || ICONS['book']}
                </div>
                <span className="text-2xl font-bold text-white tracking-wider drop-shadow-md">
                  {app.name}
                </span>
              </a>

              {/* 管理モード時の操作ボタン */}
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => startEdit(app)}
                    className="bg-white p-3 rounded-full text-blue-500 shadow-lg hover:bg-blue-50 hover:scale-110 transition-all z-10"
                    title="へんしゅう"
                  >
                    <Settings size={24} />
                  </button>
                  <button
                    onClick={() => startDelete(app.id)}
                    className="bg-white p-3 rounded-full text-red-500 shadow-lg hover:bg-red-50 hover:scale-110 transition-all z-10"
                    title="けす"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* 追加ボタン（管理モードのみ） */}
          {isAdmin && (
            <button
              onClick={() => startEdit(null)}
              className="h-48 rounded-3xl border-4 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <Plus size={48} />
              <span className="text-xl font-bold mt-2">アプリをついか</span>
            </button>
          )}
        </div>
      </main>

      {/* 管理者ログインモーダル */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Settings className="text-slate-400" />
              せんせいの ぺーじ
            </h3>
            <p className="mb-4 text-slate-500">パスワードを いれてください</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-2xl p-4 border-2 border-slate-200 rounded-xl mb-6 focus:border-blue-400 outline-none text-center tracking-widest"
              placeholder="****"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowAdminLogin(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              >
                やめる
              </button>
              <button
                onClick={handleLogin}
                className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル（安全設計） */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 bg-red-900/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-red-100 animate-in fade-in zoom-in duration-200 text-center">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">
              ほんとうに けしますか？
            </h3>
            <p className="mb-8 text-slate-500 text-lg">
              「{apps.find(a => a.id === deleteTargetId)?.name}」が なくなります。
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 text-lg"
              >
                やめる
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg text-lg flex items-center justify-center gap-2"
              >
                <Trash2 size={24} />
                けす
              </button>
            </div>
          </div>
        </div>
      )}

      {/* アプリ編集モーダル */}
      {editingApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2">
              {editingApp.id === 'new' ? <Plus className="text-blue-500" /> : <Settings className="text-blue-500" />}
              {editingApp.id === 'new' ? 'あたらしい アプリ' : 'アプリの へんしゅう'}
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-slate-500 font-bold mb-2">なまえ (ひらがな)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-4 border-2 border-slate-200 rounded-xl text-xl focus:border-blue-400 outline-none"
                  placeholder="例：さんすう ドリル"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-2">URL (リンク)</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full p-4 border-2 border-slate-200 rounded-xl text-lg font-mono text-slate-600 focus:border-blue-400 outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-2">いろ</label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setFormData({ ...formData, color: c.value })}
                      className={`w-14 h-14 rounded-full border-4 transition-transform ${c.value} ${formData.color === c.value ? 'border-slate-600 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-2">あいこん</label>
                <div className="flex flex-wrap gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                  {ICON_OPTIONS.map((i) => (
                    <button
                      key={i.value}
                      onClick={() => setFormData({ ...formData, icon: i.value })}
                      className={`p-3 rounded-2xl transition-all ${formData.icon === i.value ? 'bg-white shadow-md scale-110 ring-2 ring-blue-400' : 'hover:bg-white/50'}`}
                      title={i.label}
                    >
                      <div className="text-slate-500">
                        {React.cloneElement(ICONS[i.value], { className: formData.icon === i.value ? 'text-blue-500' : 'text-slate-400', size: 36 })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setEditingApp(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 text-lg"
              >
                やめる
              </button>
              <button
                onClick={handleSaveApp}
                className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-lg flex items-center justify-center gap-2 text-lg"
              >
                <Save size={24} />
                ほぞん
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
