/**
 * 馥森阪治 Trio 聚餐點餐與上餐追蹤系統
 * 前後台即時同步、長者友善代客點餐、認人不上桌、多餐支援、主廚備料儀表板
 */

(function () {
  'use strict';

  // ================= 1. 預設資料 (已自「報名人數.pdf」匯入 20 組，共 34 位出席) =================
  const DEFAULT_MEMBERS = [
    { id: 'mem_1', name: 'PP Rachel', nickname: 'Rachel', role: 'PP', extraGuests: 0, totalGuests: 1 },
    { id: 'mem_2', name: 'Ian', nickname: 'Ian', role: '社友', extraGuests: 1, totalGuests: 2 },
    { id: 'mem_3', name: 'PP Fred', nickname: 'Fred', role: 'PP', extraGuests: 0, totalGuests: 1 },
    { id: 'mem_4', name: 'P Robert', nickname: 'Robert', role: 'P', extraGuests: 1, totalGuests: 2 },
    { id: 'mem_5', name: 'PP Fruit', nickname: 'Fruit', role: 'PP', extraGuests: 2, totalGuests: 3 },
    { id: 'mem_6', name: 'PP Lawyer', nickname: 'Lawyer', role: 'PP', extraGuests: 1, totalGuests: 2 },
    { id: 'mem_7', name: 'PE Eric', nickname: 'Eric', role: 'PE', extraGuests: 0, totalGuests: 1 },
    { id: 'mem_8', name: 'PP Aircon', nickname: 'Aircon', role: 'PP', extraGuests: 1, totalGuests: 2 },
    { id: 'mem_9', name: 'PP Concord', nickname: 'Concord', role: 'PP', extraGuests: 1, totalGuests: 2 },
    { id: 'mem_10', name: 'PP IT Smooth', nickname: 'IT Smooth', role: 'PP', extraGuests: 0, totalGuests: 1 },
    { id: 'mem_11', name: 'AG Stainless', nickname: 'Stainless', role: 'AG', extraGuests: 1, totalGuests: 2 },
    { id: 'mem_12', name: 'PP Spring', nickname: 'Spring', role: 'PP', extraGuests: 1, totalGuests: 2 },
    { id: 'mem_13', name: 'Sophia', nickname: 'Sophia', role: '社友', extraGuests: 0, totalGuests: 1 },
    { id: 'mem_14', name: 'Sabrina', nickname: 'Sabrina', role: '社友', extraGuests: 1, totalGuests: 2 },
    { id: 'mem_15', name: 'Margo', nickname: 'Margo', role: '社友', extraGuests: 0, totalGuests: 1 },
    { id: 'mem_16', name: 'Ted', nickname: 'Ted', role: '社友', extraGuests: 1, totalGuests: 2 },
    { id: 'mem_17', name: 'Three M', nickname: 'Three M', role: '社友', extraGuests: 3, totalGuests: 4 },
    { id: 'mem_18', name: "J’s mart", nickname: "J’s mart", role: '社友', extraGuests: 0, totalGuests: 1 },
    { id: 'mem_19', name: 'Albert', nickname: 'Albert', role: '社友', extraGuests: 0, totalGuests: 1 },
    { id: 'mem_20', name: 'Philip', nickname: 'Philip', role: '社友', extraGuests: 0, totalGuests: 1 }
  ];

  const DEFAULT_MENU = {
    A: {
      id: 'A',
      name: '香煎鮭魚與北非小米',
      tag: 'A餐',
      desc: '【主菜】香煎鮭魚與北非小米\n【前菜小點1】鯷魚 蒔蘿希臘優格 小黃瓜、酥炸鮭魚皮 夏穆拉醬、醃漬小蕃茄\n【前菜小點2】夏卡蘇卡 中東茄子泥 鷹嘴豆泥 配酸種麵包\n【沙拉】雞胸 藜麥羽衣甘蘭綜合生菜沙拉 ＆ Tahini dressing\n【湯品】摩洛哥地瓜鷹嘴豆濃湯\n【甜點】香蕉麵包 打發奶油與燕麥脆片'
    },
    B: {
      id: 'B',
      name: '雞肉塔吉與香草飯',
      tag: 'B餐',
      desc: '【主菜】雞肉塔吉與香草飯\n【前菜小點1】鯷魚 蒔蘿希臘優格 小黃瓜、酥炸鮭魚皮 夏穆拉醬、醃漬小蕃茄\n【前菜小點2】夏卡蘇卡 中東茄子泥 鷹嘴豆泥 配酸種麵包\n【沙拉】雞胸 藜麥羽衣甘蘭綜合生菜沙拉 ＆ Tahini dressing\n【湯品】摩洛哥地瓜鷹嘴豆濃湯\n【甜點】香蕉麵包 打發奶油與燕麥脆片'
    },
    C: {
      id: 'C',
      name: '素食奶蛋素',
      tag: 'C餐',
      desc: '【主菜】特製主廚精緻蛋奶素蔬食套餐\n【前菜小點】精選蔬食小點與夏卡蘇卡佐酸種麵包\n【沙拉】藜麥羽衣甘蘭綜合生菜沙拉 ＆ Tahini dressing\n【湯品】摩洛哥地瓜鷹嘴豆濃湯 (蛋奶素蔬食)\n【甜點】香蕉麵包 打發奶油與燕麥脆片'
    }
  };

  // ================= 2. 應用程式狀態管理 (Store) =================
  const State = {
    members: [],
    orders: {}, // memberId -> order object
    menu: JSON.parse(JSON.stringify(DEFAULT_MENU)),
    firebaseConfig: null,
    
    // UI 暫存狀態
    currentSelectedMemberId: null,
    currentMealDrafts: [], // Array of meal draft objects for selected member
    memberFilter: 'all',   // 'all', 'unordered', 'ordered'
    memberSearch: '',
    kitchenFilter: 'all',  // 'all', 'unserved', 'served'
    kitchenSearch: '',
    isSoundEnabled: true,
    isBigFontMode: false,
    modalGuestTargetMemberId: null,
    modalGuestCurrentCount: 1,
    
    // 同步管道 (本地廣播與自訂 Firebase)
    broadcastChannel: null,
    firestoreDb: null,
    isFirebaseConnected: false,

    // MQTT 跨裝置雲端即時同步 (零設定自動連線)
    mqttClient: null,
    mqttClientId: 'trio_' + Math.random().toString(36).substring(2, 10),
    mqttTopic: 'fruit8428_rotary_songqing_fussen_trio_v1',
    mqttStatus: 'connecting', // 'connected' | 'syncing' | 'synced' | 'offline'
    lastSyncTime: '',
    lastRemoteTs: 0,
    isApplyingRemote: false
  };

  // ================= 3. 提示音合成 (Web Audio API - 跨平台無外部載入失敗問題) =================
  const Sound = {
    audioCtx: null,
    init() {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
    },
    playServeChime() {
      if (!State.isSoundEnabled) return;
      this.init();
      if (!this.audioCtx) return;

      try {
        const ctx = this.audioCtx;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.5);
      } catch (e) {
        console.warn('Audio play failed', e);
      }
    },
    playOrderSuccess() {
      if (!State.isSoundEnabled) return;
      this.init();
      if (!this.audioCtx) return;
      try {
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    }
  };

  // ================= 4. 本地儲存與跨分頁即時同步 (BroadcastChannel) =================
  const Storage = {
    load() {
      try {
        const CURRENT_VERSION = 'v7_add_c_meal_vegetarian_2026_09';
        const storedVersion = localStorage.getItem('trio_storage_version');

        if (storedVersion !== CURRENT_VERSION) {
          // 升級版本快取，載入含 C 餐 (素食奶蛋素) 最新完整菜單，並保留現有點餐資料
          localStorage.setItem('trio_storage_version', CURRENT_VERSION);
          const localMembers = localStorage.getItem('trio_members');
          State.members = localMembers ? JSON.parse(localMembers) : JSON.parse(JSON.stringify(DEFAULT_MEMBERS));
          const localOrders = localStorage.getItem('trio_orders');
          State.orders = localOrders ? JSON.parse(localOrders) : {};
          State.menu = JSON.parse(JSON.stringify(DEFAULT_MENU));
          localStorage.setItem('trio_menu', JSON.stringify(DEFAULT_MENU));
        } else {
          const localMembers = localStorage.getItem('trio_members');
          State.members = localMembers ? JSON.parse(localMembers) : JSON.parse(JSON.stringify(DEFAULT_MEMBERS));
          const localOrders = localStorage.getItem('trio_orders');
          State.orders = localOrders ? JSON.parse(localOrders) : {};
          const localMenu = localStorage.getItem('trio_menu');
          State.menu = localMenu ? JSON.parse(localMenu) : JSON.parse(JSON.stringify(DEFAULT_MENU));
          if (!State.menu.C) {
            State.menu.C = JSON.parse(JSON.stringify(DEFAULT_MENU.C));
            localStorage.setItem('trio_menu', JSON.stringify(State.menu));
          }
        }

        const localFb = localStorage.getItem('trio_firebase_config');
        if (localFb) State.firebaseConfig = JSON.parse(localFb);

        State.isSoundEnabled = localStorage.getItem('trio_sound') !== 'false';
        State.isBigFontMode = localStorage.getItem('trio_big_font') === 'true';
      } catch (err) {
        console.error('Storage load failed, resetting defaults', err);
        State.members = JSON.parse(JSON.stringify(DEFAULT_MEMBERS));
        State.menu = JSON.parse(JSON.stringify(DEFAULT_MENU));
        State.orders = {};
      }
    },

    saveMembers(sync = true) {
      localStorage.setItem('trio_members', JSON.stringify(State.members));
      if (sync) {
        Sync.broadcast({ type: 'MEMBERS_UPDATED', payload: State.members });
        Sync.pushToCloud();
      }
    },

    saveOrders(sync = true) {
      localStorage.setItem('trio_orders', JSON.stringify(State.orders));
      if (sync) {
        Sync.broadcast({ type: 'ORDERS_UPDATED', payload: State.orders });
        Sync.pushToCloud();
      }
    },

    saveMenu(sync = true) {
      localStorage.setItem('trio_menu', JSON.stringify(State.menu));
      if (sync) {
        Sync.broadcast({ type: 'MENU_UPDATED', payload: State.menu });
        Sync.pushToCloud();
      }
    }
  };

  // ================= 5. 即時同步引擎 (MQTT WebSocket 跨裝置雲端同步 + 本地廣播 + Firebase) =================
  const Sync = {
    brokers: [
      'wss://broker.emqx.io:8084/mqtt',
      'wss://broker.hivemq.com:8884/mqtt'
    ],
    currentBrokerIdx: 0,
    hasReceivedRetained: false,

    init() {
      // 1. 本地跨分頁 BroadcastChannel 初始化 (同台設備分頁 0 毫秒極速同步)
      if ('BroadcastChannel' in window) {
        try {
          State.broadcastChannel = new BroadcastChannel('trio_order_sync_channel');
          State.broadcastChannel.onmessage = (event) => {
            this.handleRemoteMessage(event.data);
          };
        } catch (e) {
          console.warn('BroadcastChannel not supported or error:', e);
        }
      }

      // 監聽跨視窗 localStorage storage event (作為舊瀏覽器備援)
      window.addEventListener('storage', (e) => {
        if (e.key === 'trio_orders' && e.newValue) {
          State.orders = JSON.parse(e.newValue);
          UI.renderAll();
        } else if (e.key === 'trio_members' && e.newValue) {
          State.members = JSON.parse(e.newValue);
          UI.renderAll();
        }
      });

      // 2. MQTT 跨裝置雲端全自動即時連線 (免設定、跨手機與電腦連動)
      this.initMqtt();

      // 3. Firebase 初始化（若使用者有另外填寫自訂配置）
      if (State.firebaseConfig) {
        this.initFirebase(State.firebaseConfig);
      }
    },

    initMqtt() {
      if (typeof window.mqtt === 'undefined') {
        console.warn('MQTT library not loaded, fallback to local sync');
        State.mqttStatus = 'offline';
        this.updateSyncBadge();
        return;
      }

      const brokerUrl = this.brokers[this.currentBrokerIdx];
      State.mqttStatus = 'connecting';
      this.updateSyncBadge();

      try {
        const client = window.mqtt.connect(brokerUrl, {
          clientId: State.mqttClientId,
          clean: true,
          connectTimeout: 8000,
          reconnectPeriod: 3000,
          keepalive: 30
        });

        State.mqttClient = client;

        client.on('connect', () => {
          State.mqttStatus = 'connected';
          this.updateSyncBadge();
          client.subscribe(State.mqttTopic, { qos: 1 }, (err) => {
            if (!err) {
              console.log('✅ 雲端即時同步頻道訂閱成功:', State.mqttTopic);
            }
          });

          // 首次連線 2.5 秒內若未收到雲端留存紀錄 (全新頻道)，且本機已有已點餐資料，自動發布至雲端初始化
          setTimeout(() => {
            if (!this.hasReceivedRetained && Object.keys(State.orders).length > 0 && client.connected) {
              this.pushToCloud();
            }
          }, 2500);
        });

        client.on('reconnect', () => {
          State.mqttStatus = 'connecting';
          this.updateSyncBadge();
        });

        client.on('offline', () => {
          State.mqttStatus = 'offline';
          this.updateSyncBadge();
        });

        client.on('error', (err) => {
          console.warn(`MQTT broker [${brokerUrl}] error:`, err);
          if (this.currentBrokerIdx < this.brokers.length - 1) {
            this.currentBrokerIdx++;
            try { client.end(true); } catch(e) {}
            setTimeout(() => this.initMqtt(), 1000);
          }
        });

        client.on('message', (topic, message) => {
          this.hasReceivedRetained = true;
          try {
            const payload = JSON.parse(message.toString());
            if (!payload || typeof payload !== 'object') return;
            // 忽略本機自己發出的廣播
            if (payload.senderId === State.mqttClientId) return;
            // 忽略較舊的時間戳資料，防止覆寫最新操作
            if (payload.timestamp && payload.timestamp <= State.lastRemoteTs) return;
            State.lastRemoteTs = payload.timestamp || Date.now();

            State.isApplyingRemote = true;

            // 1. 同步點餐資料
            if (payload.orders && typeof payload.orders === 'object') {
              State.orders = payload.orders;
              localStorage.setItem('trio_orders', JSON.stringify(State.orders));
            }
            // 2. 同步名冊資料
            if (payload.members && Array.isArray(payload.members) && payload.members.length > 0) {
              State.members = payload.members;
              localStorage.setItem('trio_members', JSON.stringify(State.members));
            }
            // 3. 同步菜單資料
            if (payload.menu && typeof payload.menu === 'object') {
              State.menu = payload.menu;
              if (!State.menu.C) {
                State.menu.C = JSON.parse(JSON.stringify(DEFAULT_MENU.C));
              }
              localStorage.setItem('trio_menu', JSON.stringify(State.menu));
            }

            const nowStr = new Date().toLocaleTimeString('zh-TW', { hour12: false });
            State.lastSyncTime = nowStr;
            State.mqttStatus = 'synced';
            this.updateSyncBadge();

            UI.renderAll();
            UI.showToast(`☁️ 雲端已即時同步最新點餐/上餐狀態 (${nowStr})`, 'info');

            setTimeout(() => {
              State.isApplyingRemote = false;
            }, 600);
          } catch (err) {
            console.error('MQTT message parsing error:', err);
          }
        });

      } catch (e) {
        console.error('MQTT connection init error:', e);
        State.mqttStatus = 'offline';
        this.updateSyncBadge();
      }
    },

    pushToCloud(force = false) {
      if (!force && State.isApplyingRemote) return;

      // 1. MQTT 雲端即時發布
      if (State.mqttClient && State.mqttClient.connected) {
        const payload = {
          senderId: State.mqttClientId,
          timestamp: Date.now(),
          orders: State.orders,
          members: State.members,
          menu: State.menu
        };
        try {
          State.mqttClient.publish(
            State.mqttTopic,
            JSON.stringify(payload),
            { retain: true, qos: 1 },
            (err) => {
              if (!err) {
                State.lastSyncTime = new Date().toLocaleTimeString('zh-TW', { hour12: false });
                State.mqttStatus = 'synced';
                this.updateSyncBadge();
              }
            }
          );
        } catch (e) {
          console.warn('MQTT publish error:', e);
        }
      }

      // 2. Firebase 備援發布 (若有設定)
      this.pushToFirestore();
    },

    forcePullFromCloud() {
      if (!State.mqttClient || !State.mqttClient.connected) {
        UI.showToast('⚠️ 正在嘗試重新連線至雲端即時同步伺服器...', 'warning');
        this.initMqtt();
        return;
      }
      try {
        State.lastRemoteTs = 0; // 重置本機遠端時間戳以強制接受雲端資料
        State.mqttClient.unsubscribe(State.mqttTopic, () => {
          State.mqttClient.subscribe(State.mqttTopic, { qos: 1 }, () => {
            UI.showToast('🔄 已重新向雲端發送資料抓取請求，稍候即可同步完成！', 'info');
          });
        });
      } catch (e) {
        console.error('forcePullFromCloud error:', e);
      }
    },

    broadcast(data) {
      if (State.broadcastChannel) {
        try {
          State.broadcastChannel.postMessage(data);
        } catch (e) {
          console.warn('Broadcast post error:', e);
        }
      }
    },

    handleRemoteMessage(msg) {
      if (!msg || !msg.type) return;
      if (msg.type === 'ORDERS_UPDATED') {
        State.orders = msg.payload || {};
        UI.renderAll();
        UI.showToast('本地分頁已即時連動更新', 'info');
      } else if (msg.type === 'MEMBERS_UPDATED') {
        State.members = msg.payload || [];
        UI.renderAll();
      } else if (msg.type === 'MENU_UPDATED') {
        State.menu = msg.payload || DEFAULT_MENU;
        UI.renderAll();
      }
    },

    initFirebase(config) {
      try {
        if (typeof firebase === 'undefined') {
          console.warn('Firebase SDK not loaded');
          return;
        }

        let app;
        if (!firebase.apps.length) {
          app = firebase.initializeApp(config);
        } else {
          app = firebase.app();
        }

        State.firestoreDb = firebase.firestore();
        State.isFirebaseConnected = true;
        this.updateSyncBadge();

        State.firestoreDb.collection('trio_sessions')
          .doc('rotary_event')
          .onSnapshot((doc) => {
            if (doc.exists) {
              const data = doc.data();
              if (data && data.orders) {
                State.orders = data.orders;
                localStorage.setItem('trio_orders', JSON.stringify(State.orders));
                UI.renderAll();
              }
            }
          }, (err) => {
            console.error('Firestore snapshot listener error:', err);
            this.updateSyncBadge();
          });

        UI.showToast('已成功連線至 Firebase 雲端即時同步！', 'success');
      } catch (err) {
        console.error('Firebase init failed:', err);
        State.isFirebaseConnected = false;
        this.updateSyncBadge();
        UI.showToast('Firebase 連線失敗，請檢查設定代碼', 'error');
      }
    },

    pushToFirestore() {
      if (!State.firestoreDb || !State.isFirebaseConnected) return;
      try {
        State.firestoreDb.collection('trio_sessions')
          .doc('rotary_event')
          .set({
            orders: State.orders,
            updatedAt: Date.now()
          }, { merge: true })
          .catch((err) => console.error('Push to Firestore failed:', err));
      } catch (e) {
        console.error('pushToFirestore error:', e);
      }
    },

    updateSyncBadge() {
      const badge = document.getElementById('syncBadge');
      const text = document.getElementById('syncText');
      const dot = document.getElementById('syncDot');

      const isOnline = State.mqttStatus === 'connected' || State.mqttStatus === 'synced' || State.isFirebaseConnected;
      const isConnecting = State.mqttStatus === 'connecting';

      if (badge && text) {
        if (isOnline) {
          badge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 cursor-pointer hover:bg-emerald-900/90 transition shadow-2xs select-none';
          if (dot) dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block';
          text.innerText = State.lastSyncTime ? `雲端即時同步中 (${State.lastSyncTime})` : '雲端即時同步中';
        } else if (isConnecting) {
          badge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-400/50 text-amber-300 cursor-pointer hover:bg-amber-900/90 transition shadow-2xs select-none';
          if (dot) dot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block';
          text.innerText = '雲端連線中...';
        } else {
          badge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/20 text-gray-300 cursor-pointer hover:bg-white/10 transition shadow-2xs select-none';
          if (dot) dot.className = 'w-2.5 h-2.5 rounded-full bg-gray-400 inline-block';
          text.innerText = '本地離線模式';
        }
      }

      // Update settings tab elements if visible
      const settingsMqttBadge = document.getElementById('settingsMqttBadge');
      const settingsMqttStatusText = document.getElementById('settingsMqttStatusText');
      const settingsLastSyncTime = document.getElementById('settingsLastSyncTime');
      const settingsClientId = document.getElementById('settingsClientId');
      const settingsTopicDisplay = document.getElementById('settingsTopicDisplay');

      if (settingsMqttBadge && settingsMqttStatusText) {
        if (isOnline) {
          settingsMqttBadge.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-2xs';
          settingsMqttStatusText.innerText = '🟢 雲端即時同步正常';
        } else if (isConnecting) {
          settingsMqttBadge.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs';
          settingsMqttStatusText.innerText = '🟡 雲端伺服器連線中...';
        } else {
          settingsMqttBadge.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300 flex items-center gap-1.5 shadow-2xs';
          settingsMqttStatusText.innerText = '⚪ 離線模式 (僅本機儲存)';
        }
      }
      if (settingsLastSyncTime) {
        settingsLastSyncTime.innerText = State.lastSyncTime ? `${State.lastSyncTime} (已同步)` : '連線建立中...';
      }
      if (settingsClientId) {
        settingsClientId.innerText = State.mqttClientId || '--';
      }
      if (settingsTopicDisplay) {
        settingsTopicDisplay.innerText = State.mqttTopic;
      }

      // Update Modal elements
      const modalSyncStatusBadge = document.getElementById('modalSyncStatusBadge');
      const modalSyncLastTime = document.getElementById('modalSyncLastTime');
      if (modalSyncStatusBadge) {
        modalSyncStatusBadge.innerText = isOnline ? '🟢 雲端即時連線正常' : (isConnecting ? '🟡 連線嘗試中...' : '⚪ 離線模式');
        modalSyncStatusBadge.className = isOnline 
          ? 'font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300'
          : 'font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300';
      }
      if (modalSyncLastTime) {
        modalSyncLastTime.innerText = State.lastSyncTime || '即時連線中';
      }
    }
  };

  // ================= 6. 核心業務邏輯 (訂單、社友、上餐) =================
  const OrderManager = {
    getMemberById(memberId) {
      return State.members.find(m => m.id === memberId) || null;
    },

    getOrderByMemberId(memberId) {
      return State.orders[memberId] || null;
    },

    selectMember(memberId) {
      State.currentSelectedMemberId = memberId;
      const member = this.getMemberById(memberId);
      if (!member) return;

      const existingOrder = this.getOrderByMemberId(memberId);
      if (existingOrder && existingOrder.meals && existingOrder.meals.length > 0) {
        // Deep copy existing meals to drafts
        State.currentMealDrafts = JSON.parse(JSON.stringify(existingOrder.meals));
        // 若先前舊紀錄有標籤選項而無自訂文字，自動整合至文字欄位以供檢視與編輯
        State.currentMealDrafts.forEach(draft => {
          if ((!draft.customNote || draft.customNote.trim() === '') && draft.specialNotes && draft.specialNotes.length > 0) {
            draft.customNote = draft.specialNotes.join('、 ');
          }
        });
      } else {
        // 依據「報名人數.pdf」登記人數，自動預先建立對應份數餐點 (例如 +1 自動初始化 2 份，+2 自動初始化 3 份)
        const expectedCount = member.totalGuests || (1 + (member.extraGuests || 0));
        State.currentMealDrafts = [];
        for (let i = 0; i < expectedCount; i++) {
          const label = i === 0 ? `本人 (${member.name})` : `同行寶眷 ${i}`;
          State.currentMealDrafts.push({
            id: 'meal_' + Date.now() + '_' + i,
            guestLabel: label,
            type: 'A',
            specialNotes: [],
            customNote: '',
            served: false,
            servedAt: null
          });
        }
      }

      UI.renderOrderViews();
      UI.renderSelectedMemberBanner();
      UI.renderMealDrafts();
      UI.renderSubmitBar();
      UI.renderMemberGrid();

      // 直接切換跳入點餐畫面，不再下拉，直接置頂顯示方便長者與工作人員直覺操作
      window.scrollTo({ top: 0, behavior: 'instant' });
    },

    exitOrderMode() {
      State.currentSelectedMemberId = null;
      State.currentMealDrafts = [];
      UI.renderOrderViews();
      UI.renderMemberGrid();
      UI.renderSelectedMemberBanner();
      UI.renderMealDrafts();
      UI.renderSubmitBar();
      UI.renderTopStats();
      window.scrollTo({ top: 0, behavior: 'instant' });
    },

    addMealDraft() {
      if (!State.currentSelectedMemberId) return;
      const index = State.currentMealDrafts.length;
      const label = index === 0 ? '社友本人' : `同行寶眷 / 來賓 ${index}`;
      State.currentMealDrafts.push({
        id: 'meal_' + Date.now() + '_' + index,
        guestLabel: label,
        type: 'A',
        specialNotes: [],
        customNote: '',
        served: false,
        servedAt: null
      });
      UI.renderMealDrafts();
      UI.renderSubmitBar();
    },

    removeMealDraft(draftId) {
      if (State.currentMealDrafts.length <= 1) {
        UI.showToast('至少需保留一份餐點。若欲取消該社友點餐，請至名冊刪除。', 'warning');
        return;
      }
      State.currentMealDrafts = State.currentMealDrafts.filter(m => m.id !== draftId);
      // Re-label nicely
      State.currentMealDrafts.forEach((m, idx) => {
        if (idx === 0) m.guestLabel = '社友本人';
        else if (m.guestLabel.startsWith('同行寶眷')) m.guestLabel = `同行寶眷 / 來賓 ${idx}`;
      });
      UI.renderMealDrafts();
      UI.renderSubmitBar();
    },

    submitCurrentOrder() {
      const memberId = State.currentSelectedMemberId;
      if (!memberId) {
        UI.showToast('請先選取點餐社友', 'warning');
        return;
      }
      const member = this.getMemberById(memberId);
      if (!member) return;

      if (!State.currentMealDrafts || State.currentMealDrafts.length === 0) {
        UI.showToast('請至少新增一份餐點', 'warning');
        return;
      }

      // Preserve served status if editing already served items
      const existingOrder = this.getOrderByMemberId(memberId);
      const existingMealMap = {};
      if (existingOrder && existingOrder.meals) {
        existingOrder.meals.forEach(m => {
          existingMealMap[m.id] = m;
        });
      }

      const finalizedMeals = State.currentMealDrafts.map((d, index) => {
        const prev = existingMealMap[d.id];
        return {
          id: d.id,
          guestLabel: d.guestLabel || (index === 0 ? '社友本人' : `同行寶眷 ${index}`),
          type: d.type || 'A',
          menuName: (State.menu[d.type] && State.menu[d.type].name) || '套餐',
          specialNotes: d.specialNotes || [],
          customNote: (d.customNote || '').trim(),
          served: prev ? prev.served : false,
          servedAt: prev ? prev.servedAt : null
        };
      });

      State.orders[memberId] = {
        memberId: member.id,
        memberName: member.name,
        memberRole: member.role,
        updatedAt: Date.now(),
        meals: finalizedMeals
      };

      Storage.saveOrders();
      Sound.playOrderSuccess();
      UI.showToast(`✅ 已成功提交【${member.name}】名下 ${finalizedMeals.length} 份餐點！`, 'success');

      // Clear selection
      State.currentSelectedMemberId = null;
      State.currentMealDrafts = [];
      UI.renderAll();
    },

    adjustMemberGuests(memberId, delta = 0, absoluteTotal = null) {
      const member = this.getMemberById(memberId);
      if (!member) return;

      let newTotal;
      if (absoluteTotal !== null) {
        newTotal = Math.max(1, absoluteTotal);
      } else {
        const currentTotal = member.totalGuests || (1 + (member.extraGuests || 0));
        newTotal = Math.max(1, currentTotal + delta);
      }

      const newExtra = newTotal - 1;
      if (member.totalGuests === newTotal && member.extraGuests === newExtra) {
        if (delta < 0) {
          UI.showToast(`【${member.name}】出席人數已是最低 1 位 (本人)`, 'info');
        }
        return;
      }

      const diff = newTotal - (member.totalGuests || 1);
      member.extraGuests = newExtra;
      member.totalGuests = newTotal;
      Storage.saveMembers();

      // 若目前正在為該社友點餐，同步自動增刪草稿餐點欄位
      if (State.currentSelectedMemberId === memberId) {
        if (diff > 0) {
          for (let i = 0; i < diff; i++) {
            const index = State.currentMealDrafts.length;
            State.currentMealDrafts.push({
              id: 'meal_' + Date.now() + '_' + index,
              guestLabel: `同行寶眷 ${index}`,
              type: 'A',
              specialNotes: [],
              customNote: '',
              served: false,
              servedAt: null
            });
          }
        } else if (diff < 0) {
          if (State.currentMealDrafts.length > newTotal) {
            State.currentMealDrafts = State.currentMealDrafts.slice(0, newTotal);
          }
        }
        UI.renderMealDrafts();
        UI.renderSubmitBar();
      }

      const desc = newExtra > 0 ? `${newTotal} 位 (+${newExtra} 寶眷)` : '1 位 (本人)';
      UI.showToast(`已將【${member.name}】攜帶人數更新為 ${desc}`, 'success');
      UI.renderAll();
    },

    toggleMealServed(memberId, mealId) {
      const order = State.orders[memberId];
      if (!order || !order.meals) return;

      const meal = order.meals.find(m => m.id === mealId);
      if (!meal) return;

      meal.served = !meal.served;
      meal.servedAt = meal.served ? Date.now() : null;

      Storage.saveOrders();

      if (meal.served) {
        Sound.playServeChime();
        UI.showToast(`已為【${order.memberName}】標記【${meal.type}餐】已上餐 🟢`, 'info');
      } else {
        UI.showToast(`已復原【${order.memberName}】的【${meal.type}餐】為未上餐 🔴`, 'warning');
      }

      UI.renderAll();
    },

    batchServeAllMealsForMember(memberId) {
      const order = State.orders[memberId];
      if (!order || !order.meals) return;

      const allAlreadyServed = order.meals.every(m => m.served);
      const newStatus = !allAlreadyServed;

      order.meals.forEach(m => {
        m.served = newStatus;
        m.servedAt = newStatus ? Date.now() : null;
      });

      Storage.saveOrders();
      if (newStatus) {
        Sound.playServeChime();
        UI.showToast(`已為【${order.memberName}】所有餐點一鍵標記已上餐！`, 'success');
      } else {
        UI.showToast(`已復原【${order.memberName}】所有餐點為未上餐`, 'warning');
      }

      UI.renderAll();
    },

    deleteOrder(memberId) {
      const order = State.orders[memberId];
      if (!order) return;
      if (confirm(`確定要清除【${order.memberName}】的點餐資料嗎？`)) {
        delete State.orders[memberId];
        Storage.saveOrders();
        if (State.currentSelectedMemberId === memberId) {
          State.currentSelectedMemberId = null;
          State.currentMealDrafts = [];
        }
        UI.showToast(`已清除【${order.memberName}】的點餐紀錄`, 'info');
        UI.renderAll();
      }
    },

    resetAllOrders() {
      if (confirm('⚠️ 警告：這將會清空「所有社友」的已點餐紀錄與上餐狀態！確定要執行嗎？')) {
        State.orders = {};
        State.currentSelectedMemberId = null;
        State.currentMealDrafts = [];
        Storage.saveOrders();
        UI.showToast('已清空所有點餐紀錄', 'warning');
        UI.renderAll();
      }
    }
  };

  // ================= 7. 使用者介面渲染引擎 (UI) =================
  const UI = {
    init() {
      this.bindTabEvents();
      this.bindGlobalActions();
      this.bindOrderEvents();
      this.bindKitchenEvents();
      this.bindSettingsEvents();
      this.bindModalEvents();
      this.applyBigFontClass();
      this.renderAll();
    },

    renderAll() {
      this.renderOrderViews();
      this.renderTopStats();
      this.renderMemberGrid();
      this.renderSelectedMemberBanner();
      this.renderMealDrafts();
      this.renderSubmitBar();
      this.renderKitchenDashboard();
      this.renderKitchenList();
      this.renderSummaryTable();
      this.renderSettingsMembers();
      this.renderSettingsMenu();
    },

    // 切換「社友名單總覽」與「點餐畫面」視圖（免下拉，直接切換顯示）
    renderOrderViews() {
      const listView = document.getElementById('orderListView');
      const mealOrderView = document.getElementById('mealOrderView');
      const submitBar = document.getElementById('submitBarSection');
      if (!listView || !mealOrderView) return;

      if (State.currentSelectedMemberId) {
        listView.classList.add('hidden');
        mealOrderView.classList.remove('hidden');
        if (submitBar) submitBar.classList.remove('hidden');
      } else {
        listView.classList.remove('hidden');
        mealOrderView.classList.add('hidden');
        if (submitBar) submitBar.classList.add('hidden');
      }
    },

    // 頂部統計與狀態徽章
    renderTopStats() {
      const totalMembers = State.members.length;
      const expectedTotalAttendees = State.members.reduce((sum, m) => sum + (m.totalGuests || (1 + (m.extraGuests || 0))), 0);
      const orderedMembersCount = Object.keys(State.orders).length;
      
      let totalMeals = 0;
      let totalServedMeals = 0;

      Object.values(State.orders).forEach(order => {
        if (order.meals) {
          totalMeals += order.meals.length;
          totalServedMeals += order.meals.filter(m => m.served).length;
        }
      });

      const unservedMeals = totalMeals - totalServedMeals;

      // Header Badges
      const orderCountBadge = document.getElementById('orderCountBadge');
      if (orderCountBadge) {
        orderCountBadge.innerText = `${orderedMembersCount}/${totalMembers}組 (共${expectedTotalAttendees}位)`;
      }

      const kitchenPendingBadge = document.getElementById('kitchenPendingBadge');
      if (kitchenPendingBadge) {
        kitchenPendingBadge.innerText = `${unservedMeals} 待上`;
        kitchenPendingBadge.className = unservedMeals > 0 
          ? 'ml-1 bg-trio-crimson text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse'
          : 'ml-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold';
      }

      // Tab 1 Sub-Stats
      const statOrderedMembers = document.getElementById('statOrderedMembers');
      if (statOrderedMembers) {
        statOrderedMembers.innerText = `${orderedMembersCount} / ${totalMembers} 組 (預計 ${expectedTotalAttendees} 位)`;
      }

      const statTotalMeals = document.getElementById('statTotalMeals');
      if (statTotalMeals) {
        let countA = 0, countB = 0, countC = 0;
        Object.values(State.orders).forEach(order => {
          (order.meals || []).forEach(m => {
            if (m.type === 'A') countA++;
            else if (m.type === 'B') countB++;
            else if (m.type === 'C') countC++;
          });
        });
        statTotalMeals.innerHTML = `${totalMeals} 份 <span class="text-xs font-normal text-gray-500 font-sans">(Ａ:${countA} / Ｂ:${countB} / Ｃ:${countC})</span>`;
      }
    },

    // 步驟一：社友快選格狀按鈕清單
    renderMemberGrid() {
      const container = document.getElementById('memberGrid');
      if (!container) return;

      const filter = State.memberFilter;
      const search = State.memberSearch.trim().toLowerCase();

      const filtered = State.members.filter(member => {
        const hasOrder = !!State.orders[member.id];
        if (filter === 'unordered' && hasOrder) return false;
        if (filter === 'ordered' && !hasOrder) return false;

        if (search) {
          const normSearch = search.replace(/[’'`]/g, "'");
          const normName = member.name.toLowerCase().replace(/[’'`]/g, "'");
          const normRole = member.role.toLowerCase().replace(/[’'`]/g, "'");
          const matchName = normName.includes(normSearch);
          const matchRole = normRole.includes(normSearch);
          return matchName || matchRole;
        }
        return true;
      });

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="col-span-full py-8 text-center text-gray-400 text-sm">
            查無符合的社友，請檢查搜尋關鍵字或點擊「新增臨時來賓」
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(member => {
        const originalIndex = State.members.findIndex(m => m.id === member.id) + 1;
        const isSelected = State.currentSelectedMemberId === member.id;
        const order = State.orders[member.id];
        const hasOrder = !!order;
        const mealCount = hasOrder ? order.meals.length : 0;
        const allServed = hasOrder && order.meals.every(m => m.served);

        let statusBadge = '';
        let mealBadgesHtml = '';

        if (hasOrder) {
          const countA = order.meals.filter(m => m.type === 'A').length;
          const countB = order.meals.filter(m => m.type === 'B').length;
          const countC = order.meals.filter(m => m.type === 'C').length;
          const aShort = State.menu.A ? (State.menu.A.name.split('與')[0] || '香煎鮭魚') : '香煎鮭魚';
          const bShort = State.menu.B ? (State.menu.B.name.split('與')[0] || '雞肉塔吉') : '雞肉塔吉';
          const cShort = State.menu.C ? (State.menu.C.name || '素食奶蛋素') : '素食奶蛋素';

          const badges = [];
          if (countA > 0) {
            badges.push(`
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                <i class="fa-solid fa-fish text-[11px] text-amber-700"></i>
                <span>Ａ餐 (${aShort})${countA > 1 ? ` × ${countA}` : ''}</span>
              </span>
            `);
          }
          if (countB > 0) {
            badges.push(`
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-2xs">
                <i class="fa-solid fa-bowl-rice text-[11px] text-emerald-700"></i>
                <span>Ｂ餐 (${bShort})${countB > 1 ? ` × ${countB}` : ''}</span>
              </span>
            `);
          }
          if (countC > 0) {
            badges.push(`
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-lg text-xs font-bold bg-teal-100 text-teal-950 border border-teal-300 shadow-2xs">
                <i class="fa-solid fa-leaf text-[11px] text-teal-700"></i>
                <span>Ｃ餐 (${cShort})${countC > 1 ? ` × ${countC}` : ''}</span>
              </span>
            `);
          }

          // Special dietary notes indicator
          const hasCustomNotes = order.meals.some(m => (m.customNote && m.customNote.trim()) || (m.specialNotes && m.specialNotes.length > 0));
          if (hasCustomNotes) {
            badges.push(`
              <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs" title="有特殊飲食需求備註">
                <i class="fa-solid fa-pen-to-square text-[10px] text-rose-600"></i>
                <span>有備註</span>
              </span>
            `);
          }

          mealBadgesHtml = badges.join('');

          // Friendly summary text for the button
          const partsSummary = [];
          if (countA > 0) partsSummary.push(countA === 1 ? 'Ａ餐' : `A×${countA}`);
          if (countB > 0) partsSummary.push(countB === 1 ? 'Ｂ餐' : `B×${countB}`);
          if (countC > 0) partsSummary.push(countC === 1 ? 'Ｃ素' : `C×${countC}`);
          const summaryStr = partsSummary.join(' ') || `${order.meals.length}份`;

          if (allServed) {
            statusBadge = `
              <div class="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-300/80 shrink-0 flex items-center gap-1.5 transition shadow-2xs cursor-pointer" title="點擊檢視或修改餐點">
                <span>🟢 已全上 (${summaryStr})</span>
                <i class="fa-solid fa-pen-to-square text-[10px] opacity-70"></i>
              </div>
            `;
          } else {
            statusBadge = `
              <div class="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-1.5 rounded-xl border border-amber-300/80 shrink-0 flex items-center gap-1.5 transition shadow-2xs cursor-pointer" title="點擊檢視或修改餐點">
                <span>🟡 已點：${summaryStr}</span>
                <i class="fa-solid fa-pen-to-square text-[10px] opacity-70"></i>
              </div>
            `;
          }
        } else {
          statusBadge = `
            <div class="text-xs bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs shrink-0 flex items-center gap-1.5 transition cursor-pointer">
              <i class="fa-solid fa-utensils text-[11px]"></i>
              <span>未點餐・點此進入</span>
              <i class="fa-solid fa-arrow-right text-[10px] opacity-80"></i>
            </div>
          `;
        }

        const guestBadge = `
          <div class="headcount-stepper inline-flex items-center rounded-lg border overflow-hidden shrink-0 text-xs shadow-xs transition ${isSelected ? 'bg-white/20 border-white/40 text-white' : (member.extraGuests > 0 ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-gray-100 border-gray-200 text-gray-700')}">
            <button type="button" data-guest-action="minus" data-member-id="${member.id}" 
                    class="px-2 py-1 hover:bg-black/10 active:scale-90 transition font-bold ${member.extraGuests === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}" 
                    title="減少攜帶人數" ${member.extraGuests === 0 ? 'disabled' : ''}>
              <i class="fa-solid fa-minus text-[10px]"></i>
            </button>
            <span data-guest-action="open-modal" data-member-id="${member.id}" 
                  class="px-1.5 py-0.5 font-bold whitespace-nowrap cursor-pointer hover:underline flex items-center gap-1" 
                  title="點擊自訂或增減人數">
              <i class="fa-solid fa-user-group text-[10px] ${member.extraGuests > 0 ? (isSelected ? 'text-amber-200' : 'text-amber-700') : 'text-gray-400'}"></i>
              <span>${member.extraGuests > 0 ? `+${member.extraGuests} (共${member.totalGuests}位)` : '本人 1 位'}</span>
            </span>
            <button type="button" data-guest-action="plus" data-member-id="${member.id}" 
                    class="px-2 py-1 hover:bg-black/10 active:scale-90 transition font-bold cursor-pointer" 
                    title="增加攜帶人數">
              <i class="fa-solid fa-plus text-[10px]"></i>
            </button>
          </div>
        `;

        return `
          <div role="button" tabindex="0" data-member-id="${member.id}"
               class="member-chip w-full text-left p-3 sm:p-3.5 rounded-xl border-2 ${hasOrder ? 'has-order bg-emerald-50/20 border-emerald-200/80' : 'bg-white border-gray-200'} 
                      ${isSelected ? 'selected' : 'hover:border-trio-wood hover:bg-gray-50/80'} flex items-center justify-between gap-3 transition-all cursor-pointer">
            <!-- Left info: Sequence No., Role, Name, Headcount & A/B Meal Badges -->
            <div class="flex items-center gap-2 sm:gap-2.5 flex-wrap min-w-0 flex-1">
              <span class="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${isSelected ? 'bg-trio-woodLight text-trio-dark' : 'bg-gray-100 text-gray-600'}">
                ${String(originalIndex).padStart(2, '0')}
              </span>
              <span class="role-badge text-xs px-2 py-0.5 rounded-md font-bold shrink-0 ${isSelected ? 'bg-trio-wood text-white' : 'bg-trio-forest/10 text-trio-forest'}">
                ${member.role}
              </span>
              <span class="font-serif font-bold text-base sm:text-lg tracking-wide shrink-0 ${isSelected ? 'text-white' : 'text-trio-forest'}">
                ${member.name}
              </span>
              <!-- 攜帶人數欄位：直接放置在社友名稱正旁邊 (含增加與減少按鈕) -->
              ${guestBadge}

              <!-- 已點餐餐點 A/B 提示標籤 (一眼看出點Ａ餐或Ｂ餐) -->
              ${hasOrder ? `
                <div class="inline-flex items-center gap-1.5 flex-wrap">
                  ${mealBadgesHtml}
                </div>
              ` : ''}
            </div>

            <!-- Right info: Order Status, Selection Arrow/Check -->
            <div class="flex items-center gap-2 sm:gap-3 shrink-0">
              <div class="status-badge-wrapper">
                ${statusBadge}
              </div>
              <div class="w-6 text-center text-sm shrink-0">
                ${isSelected 
                  ? '<i class="fa-solid fa-circle-check text-trio-woodLight text-base"></i>' 
                  : '<i class="fa-solid fa-chevron-right text-gray-300 text-xs"></i>'
                }
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Bind click handlers
      container.querySelectorAll('.member-chip').forEach(row => {
        row.addEventListener('click', (e) => {
          const actionBtn = e.target.closest('[data-guest-action]');
          if (actionBtn) {
            e.stopPropagation();
            const action = actionBtn.getAttribute('data-guest-action');
            const mId = actionBtn.getAttribute('data-member-id');
            if (action === 'plus') {
              OrderManager.adjustMemberGuests(mId, +1);
            } else if (action === 'minus') {
              OrderManager.adjustMemberGuests(mId, -1);
            } else if (action === 'open-modal') {
              UI.openGuestModal(mId);
            }
            return;
          }

          const mId = row.getAttribute('data-member-id');
          OrderManager.selectMember(mId);
        });
      });
    },

    renderSelectedMemberBanner() {
      const banner = document.getElementById('selectedMemberBanner');
      const sectionB = document.getElementById('mealSelectionSection');
      if (!banner || !sectionB) return;

      if (!State.currentSelectedMemberId) {
        banner.classList.add('hidden');
        sectionB.classList.add('opacity-50', 'pointer-events-none');
        return;
      }

      const member = OrderManager.getMemberById(State.currentSelectedMemberId);
      if (!member) return;

      banner.classList.remove('hidden');
      sectionB.classList.remove('opacity-50', 'pointer-events-none');

      document.getElementById('bannerMemberAvatar').innerText = member.name.charAt(0);
      document.getElementById('bannerMemberName').innerText = member.name;
      document.getElementById('bannerMemberRole').innerText = member.role;

      const guestsStepper = document.getElementById('bannerGuestStepper');
      const guestsEl = document.getElementById('bannerMemberGuests');
      if (guestsStepper && guestsEl) {
        guestsStepper.classList.remove('hidden');
        if (member.extraGuests > 0) {
          guestsEl.innerText = `+${member.extraGuests} (共 ${member.totalGuests} 位)`;
        } else {
          guestsEl.innerText = '本人 1 位';
        }
      }

      const order = State.orders[member.id];
      if (order && order.meals && order.meals.length > 0) {
        const countA = order.meals.filter(m => m.type === 'A').length;
        const countB = order.meals.filter(m => m.type === 'B').length;
        const countC = order.meals.filter(m => m.type === 'C').length;
        const aShort = State.menu.A ? (State.menu.A.name.split('與')[0] || '香煎鮭魚') : '香煎鮭魚';
        const bShort = State.menu.B ? (State.menu.B.name.split('與')[0] || '雞肉塔吉') : '雞肉塔吉';
        const cShort = State.menu.C ? (State.menu.C.name || '素食奶蛋素') : '素食奶蛋素';
        const parts = [];
        if (countA > 0) parts.push(`Ａ餐 (${aShort}) × ${countA} 份`);
        if (countB > 0) parts.push(`Ｂ餐 (${bShort}) × ${countB} 份`);
        if (countC > 0) parts.push(`Ｃ餐 (${cShort}) × ${countC} 份`);
        document.getElementById('bannerMemberStatus').innerHTML = `
          該社友目前已點：<strong class="text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300 font-bold">${parts.join('、 ')}</strong>（您可直接在此修改或增減後送出）。
        `;
      } else {
        document.getElementById('bannerMemberStatus').innerText = '正在為該社友建立全新點餐資訊。';
      }
    },

    // 步驟二：動態餐點列表與明細卡片
    renderMealDrafts() {
      const container = document.getElementById('mealsContainer');
      if (!container) return;

      if (!State.currentSelectedMemberId || State.currentMealDrafts.length === 0) {
        container.innerHTML = `
          <div class="text-center py-8 text-gray-400">
            <i class="fa-solid fa-arrow-up text-xl mb-1"></i>
            <p class="text-sm">請先於上方步驟一選取社友姓名</p>
          </div>
        `;
        return;
      }

      container.innerHTML = State.currentMealDrafts.map((draft, index) => {
        const isFirst = index === 0;
        const menuA = State.menu.A;
        const menuB = State.menu.B;
        const menuC = State.menu.C || DEFAULT_MENU.C;

        return `
          <div class="meal-draft-card p-4 sm:p-5 rounded-2xl border-2 ${index === 0 ? 'border-trio-wood/50 bg-amber-50/10' : 'border-gray-200 bg-white'} shadow-xs relative space-y-4">
            <!-- Card Header -->
            <div class="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <span class="w-7 h-7 rounded-full bg-trio-forest text-trio-sand flex items-center justify-center font-bold text-xs">
                  #${index + 1}
                </span>
                <input type="text" data-draft-id="${draft.id}" class="draft-label-input font-bold text-base text-trio-forest bg-transparent border-b border-dashed border-gray-300 focus:border-trio-wood focus:outline-none px-1" 
                       value="${draft.guestLabel}" title="點擊可自訂對象名稱 (例如：夫人、大公子)">
              </div>

              <div class="flex items-center gap-2">
                ${!isFirst ? `
                  <button type="button" data-remove-id="${draft.id}" class="text-xs text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition flex items-center gap-1 font-medium">
                    <i class="fa-solid fa-trash-can"></i> 刪除此份餐點
                  </button>
                ` : '<span class="text-xs text-trio-wood font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">主位 (本人)</span>'}
              </div>
            </div>

            <!-- Meal Type Selection (A / B / C) -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-2">
                請選擇套餐種類 <span class="text-gray-400 font-normal">(點擊可查看菜色明細)</span>：
              </label>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <!-- A Meal Option -->
                <div data-draft-id="${draft.id}" data-meal-type="A" 
                     class="meal-option-card p-3.5 sm:p-4 rounded-xl border-2 ${draft.type === 'A' ? 'selected' : 'border-gray-200 bg-white'} flex flex-col justify-between cursor-pointer">
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="font-bold text-sm text-amber-900">${menuA.tag}</span>
                      <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center ${draft.type === 'A' ? 'border-trio-forest bg-trio-forest' : 'border-gray-300'}">
                        ${draft.type === 'A' ? '<span class="w-1.5 h-1.5 rounded-full bg-white"></span>' : ''}
                      </span>
                    </div>
                    <div class="font-bold text-base text-trio-forest font-serif">${menuA.name}</div>
                    <div class="text-xs text-gray-700 mt-2 whitespace-pre-line leading-relaxed">${menuA.desc}</div>
                  </div>
                </div>

                <!-- B Meal Option -->
                <div data-draft-id="${draft.id}" data-meal-type="B" 
                     class="meal-option-card p-3.5 sm:p-4 rounded-xl border-2 ${draft.type === 'B' ? 'selected' : 'border-gray-200 bg-white'} flex flex-col justify-between cursor-pointer">
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="font-bold text-sm text-emerald-900">${menuB.tag}</span>
                      <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center ${draft.type === 'B' ? 'border-trio-forest bg-trio-forest' : 'border-gray-300'}">
                        ${draft.type === 'B' ? '<span class="w-1.5 h-1.5 rounded-full bg-white"></span>' : ''}
                      </span>
                    </div>
                    <div class="font-bold text-base text-trio-forest font-serif">${menuB.name}</div>
                    <div class="text-xs text-gray-700 mt-2 whitespace-pre-line leading-relaxed">${menuB.desc}</div>
                  </div>
                </div>

                <!-- C Meal Option (素食奶蛋素) -->
                <div data-draft-id="${draft.id}" data-meal-type="C" 
                     class="meal-option-card p-3.5 sm:p-4 rounded-xl border-2 ${draft.type === 'C' ? 'selected' : 'border-gray-200 bg-white'} flex flex-col justify-between cursor-pointer">
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="font-bold text-sm text-teal-900">${menuC.tag} (素食奶蛋素)</span>
                      <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center ${draft.type === 'C' ? 'border-trio-forest bg-trio-forest' : 'border-gray-300'}">
                        ${draft.type === 'C' ? '<span class="w-1.5 h-1.5 rounded-full bg-white"></span>' : ''}
                      </span>
                    </div>
                    <div class="font-bold text-base text-trio-forest font-serif">${menuC.name}</div>
                    <div class="text-xs text-gray-700 mt-2 whitespace-pre-line leading-relaxed">${menuC.desc}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Special Dietary Notes (純文字鍵入欄位，無多餘選項) -->
            <div class="bg-gray-50/90 p-3.5 rounded-xl border border-gray-200 space-y-2">
              <label class="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <i class="fa-solid fa-pen-to-square text-trio-wood"></i>
                <span>特殊飲食需求備註（針對此客餐點，選填）：</span>
              </label>

              <!-- Custom Note Text Field -->
              <div>
                <input type="text" data-draft-id="${draft.id}" class="draft-custom-note w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-trio-wood transition placeholder-gray-400" 
                       placeholder="請在此鍵入特殊需求（例如：不吃牛、不吃海鮮、全素食、少鹽、醬汁分開...）"
                       value="${draft.customNote || ''}">
              </div>
            </div>

          </div>
        `;
      }).join('');

      // Bind events for drafts
      // 1. Label change
      container.querySelectorAll('.draft-label-input').forEach(input => {
        input.addEventListener('change', (e) => {
          const draftId = e.target.getAttribute('data-draft-id');
          const draft = State.currentMealDrafts.find(d => d.id === draftId);
          if (draft) draft.guestLabel = e.target.value.trim();
          UI.renderSubmitBar();
        });
      });

      // 2. Meal type selection
      container.querySelectorAll('.meal-option-card').forEach(card => {
        card.addEventListener('click', () => {
          const draftId = card.getAttribute('data-draft-id');
          const mealType = card.getAttribute('data-meal-type');
          const draft = State.currentMealDrafts.find(d => d.id === draftId);
          if (draft) {
            draft.type = mealType;
            UI.renderMealDrafts();
            UI.renderSubmitBar();
          }
        });
      });

      // 4. Custom note input
      container.querySelectorAll('.draft-custom-note').forEach(input => {
        input.addEventListener('input', (e) => {
          const draftId = e.target.getAttribute('data-draft-id');
          const draft = State.currentMealDrafts.find(d => d.id === draftId);
          if (draft) {
            draft.customNote = e.target.value;
            UI.renderSubmitBar();
          }
        });
      });

      // 5. Remove draft button
      container.querySelectorAll('[data-remove-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const draftId = btn.getAttribute('data-remove-id');
          OrderManager.removeMealDraft(draftId);
        });
      });
    },

    // 懸浮送出與核對列
    renderSubmitBar() {
      const bar = document.getElementById('submitBarSection');
      if (!bar) return;

      if (!State.currentSelectedMemberId || State.currentMealDrafts.length === 0) {
        bar.classList.add('hidden');
        return;
      }

      const member = OrderManager.getMemberById(State.currentSelectedMemberId);
      if (!member) return;

      bar.classList.remove('hidden');
      document.getElementById('submitBarMemberName').innerText = `${member.name} (${member.role})`;

      // Summary of meal types
      const countA = State.currentMealDrafts.filter(d => d.type === 'A').length;
      const countB = State.currentMealDrafts.filter(d => d.type === 'B').length;
      const countC = State.currentMealDrafts.filter(d => d.type === 'C').length;

      const summaryParts = [];
      if (countA > 0) summaryParts.push(`A餐 x ${countA}`);
      if (countB > 0) summaryParts.push(`B餐 x ${countB}`);
      if (countC > 0) summaryParts.push(`C餐(素食) x ${countC}`);

      const totalMeals = State.currentMealDrafts.length;
      document.getElementById('submitBarMealSummary').innerText = `共 ${totalMeals} 份餐點：${summaryParts.join('、 ')}`;
    },

    // ================= 後台 Tab 2: 主廚備料儀表板 =================
    renderKitchenDashboard() {
      let totalMeals = 0;
      let totalServed = 0;
      let totalA = 0, servedA = 0;
      let totalB = 0, servedB = 0;
      let totalC = 0, servedC = 0;
      const specialDiets = []; // { note, memberName, mealType, guestLabel }

      Object.values(State.orders).forEach(order => {
        if (!order.meals) return;
        order.meals.forEach((meal, idx) => {
          totalMeals++;
          if (meal.served) totalServed++;

          if (meal.type === 'A') {
            totalA++;
            if (meal.served) servedA++;
          } else if (meal.type === 'B') {
            totalB++;
            if (meal.served) servedB++;
          } else if (meal.type === 'C') {
            totalC++;
            if (meal.served) servedC++;
          }

          // Check dietary notes
          const tags = meal.specialNotes || [];
          const custom = meal.customNote ? meal.customNote.trim() : '';
          if (tags.length > 0 || custom) {
            specialDiets.push({
              memberName: order.memberName,
              memberRole: order.memberRole,
              guestLabel: meal.guestLabel || `#${idx + 1}`,
              mealType: meal.type,
              served: meal.served,
              tags: tags,
              custom: custom
            });
          }
        });
      });

      // Update Top Metrics
      const dashTotalMeals = document.getElementById('dashTotalMeals');
      if (dashTotalMeals) dashTotalMeals.innerText = totalMeals;

      const dashTotalServedRatio = document.getElementById('dashTotalServedRatio');
      if (dashTotalServedRatio) dashTotalServedRatio.innerText = `已出 ${totalServed} / 剩 ${totalMeals - totalServed}`;

      // A Meal
      const dashTotalA = document.getElementById('dashTotalA');
      if (dashTotalA) dashTotalA.innerText = totalA;
      const dashARemaining = document.getElementById('dashARemaining');
      if (dashARemaining) dashARemaining.innerText = `待 ${totalA - servedA}`;
      const dashAServed = document.getElementById('dashAServed');
      if (dashAServed) dashAServed.innerText = `已出餐 ${servedA} 份`;

      // B Meal
      const dashTotalB = document.getElementById('dashTotalB');
      if (dashTotalB) dashTotalB.innerText = totalB;
      const dashBRemaining = document.getElementById('dashBRemaining');
      if (dashBRemaining) dashBRemaining.innerText = `待 ${totalB - servedB}`;
      const dashBServed = document.getElementById('dashBServed');
      if (dashBServed) dashBServed.innerText = `已出餐 ${servedB} 份`;

      // C Meal (素食奶蛋素)
      const dashTotalC = document.getElementById('dashTotalC');
      if (dashTotalC) dashTotalC.innerText = totalC;
      const dashCRemaining = document.getElementById('dashCRemaining');
      if (dashCRemaining) dashCRemaining.innerText = `待 ${totalC - servedC}`;
      const dashCServed = document.getElementById('dashCServed');
      if (dashCServed) dashCServed.innerText = `已出餐 ${servedC} 份`;

      // Progress bar
      const progressPercent = totalMeals > 0 ? Math.round((totalServed / totalMeals) * 100) : 0;
      const dashProgressBar = document.getElementById('dashProgressBar');
      if (dashProgressBar) dashProgressBar.style.width = `${progressPercent}%`;

      const dashProgressPercent = document.getElementById('dashProgressPercent');
      if (dashProgressPercent) dashProgressPercent.innerText = `${progressPercent}%`;

      const dashServedCountText = document.getElementById('dashServedCountText');
      if (dashServedCountText) dashServedCountText.innerText = `已出 ${totalServed} 份`;

      const dashUnservedCountText = document.getElementById('dashUnservedCountText');
      if (dashUnservedCountText) dashUnservedCountText.innerText = `尚欠 ${totalMeals - totalServed} 份`;

      // Special Diet Aggregation Box
      const dietBadge = document.getElementById('specialDietCountBadge');
      if (dietBadge) dietBadge.innerText = `${specialDiets.length} 筆需求`;

      const dietContainer = document.getElementById('specialDietContainer');
      if (dietContainer) {
        if (specialDiets.length === 0) {
          dietContainer.innerHTML = `<span class="text-gray-500 italic">目前所有已點餐點皆無特殊飲食限制</span>`;
        } else {
          dietContainer.innerHTML = specialDiets.map(item => {
            const allNotes = [...item.tags];
            if (item.custom) allNotes.push(item.custom);
            return `
              <div class="px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${item.served ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-100/90 border-rose-300 text-rose-900 font-bold'}">
                <span>${item.served ? '🟢' : '🔴'}</span>
                <span class="font-serif">${item.memberName} (${item.guestLabel}) [${item.mealType}餐]:</span>
                <span class="text-rose-700 font-medium underline">${allNotes.join('、 ')}</span>
              </div>
            `;
          }).join('');
        }
      }
    },

    // 主廚上餐列表 (認人不上桌、防呆復原、一鍵全上)
    renderKitchenList() {
      const container = document.getElementById('kitchenOrderList');
      const emptyState = document.getElementById('kitchenEmptyState');
      if (!container) return;

      const orderList = Object.values(State.orders);
      const filter = State.kitchenFilter;
      const search = State.kitchenSearch.trim().toLowerCase();

      // Counts for kitchen filter tabs
      const countAll = orderList.length;
      let countUnserved = 0;
      let countServed = 0;

      orderList.forEach(ord => {
        const allDone = ord.meals && ord.meals.every(m => m.served);
        if (allDone) countServed++;
        else countUnserved++;
      });

      const elCountAll = document.getElementById('countAllKitchen');
      if (elCountAll) elCountAll.innerText = countAll;
      const elCountUnserved = document.getElementById('countUnservedKitchen');
      if (elCountUnserved) elCountUnserved.innerText = countUnserved;
      const elCountServed = document.getElementById('countServedKitchen');
      if (elCountServed) elCountServed.innerText = countServed;

      const filtered = orderList.filter(order => {
        const allDone = order.meals && order.meals.every(m => m.served);
        if (filter === 'unserved' && allDone) return false;
        if (filter === 'served' && !allDone) return false;

        if (search) {
          const normSearch = search.replace(/[’'`]/g, "'");
          const normName = order.memberName.toLowerCase().replace(/[’'`]/g, "'");
          const normRole = (order.memberRole || '').toLowerCase().replace(/[’'`]/g, "'");
          const matchName = normName.includes(normSearch);
          const matchRole = normRole.includes(normSearch);
          return matchName || matchRole;
        }
        return true;
      });

      if (filtered.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
      }

      if (emptyState) emptyState.classList.add('hidden');

      container.innerHTML = filtered.map(order => {
        const meals = order.meals || [];
        const allServed = meals.length > 0 && meals.every(m => m.served);
        const servedCount = meals.filter(m => m.served).length;

        return `
          <div class="kitchen-card p-4 sm:p-5 rounded-2xl border-2 ${allServed ? 'all-served' : 'bg-white border-gray-200'} shadow-xs space-y-3">
            <!-- Member Header & Quick Batch Button -->
            <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full ${allServed ? 'bg-emerald-600' : 'bg-trio-forest'} text-white flex items-center justify-center text-lg font-bold font-serif shadow-xs">
                  ${order.memberName.charAt(0)}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg sm:text-xl font-bold font-serif text-trio-forest">${order.memberName}</h3>
                    <span class="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">${order.memberRole}</span>
                  </div>
                  <div class="text-xs text-gray-500 mt-0.5">
                    名下共 ${meals.length} 份餐點 ｜ 
                    <span class="${servedCount === meals.length ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}">
                      已上 ${servedCount} / 剩 ${meals.length - servedCount} 份
                    </span>
                  </div>
                </div>
              </div>

              <!-- Batch Toggle All for this member -->
              <div class="flex items-center gap-2">
                <button type="button" data-batch-member-id="${order.memberId}" 
                        class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${allServed ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-trio-forest hover:bg-trio-forestLight text-white shadow-xs'}">
                  <i class="fa-solid ${allServed ? 'fa-rotate-left' : 'fa-check-double'}"></i>
                  <span>${allServed ? '全部復原未上' : '一鍵全數上餐'}</span>
                </button>
              </div>
            </div>

            <!-- Meals List for this member -->
            <div class="space-y-2">
              ${meals.map((meal, idx) => {
                const isServed = meal.served;
                const menuInfo = State.menu[meal.type] || { tag: `${meal.type}餐`, name: '套餐' };
                const hasNotes = (meal.specialNotes && meal.specialNotes.length > 0) || meal.customNote;

                let tagBadgeClass = 'bg-amber-100 text-amber-900 border-amber-200';
                if (meal.type === 'B') tagBadgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-200';
                if (meal.type === 'C') tagBadgeClass = 'bg-teal-100 text-teal-900 border-teal-200';

                return `
                  <div class="kitchen-meal-row p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isServed ? 'is-served' : 'bg-gray-50/70 border-gray-200'}">
                    <!-- Meal Info & Notes -->
                    <div class="flex items-start sm:items-center gap-3 flex-1">
                      <span class="w-6 h-6 rounded-full bg-white text-gray-600 border border-gray-300 flex items-center justify-center text-xs font-bold shrink-0">
                        ${idx + 1}
                      </span>

                      <div class="space-y-1">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-xs font-bold px-2 py-0.5 rounded border ${tagBadgeClass}">
                            ${menuInfo.tag}
                          </span>
                          <span class="font-bold text-sm text-gray-900 font-serif">
                            ${menuInfo.name}
                          </span>
                          <span class="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                            ${meal.guestLabel || '本人'}
                          </span>
                        </div>

                        <!-- Special Notes Alert -->
                        ${hasNotes ? `
                          <div class="text-xs text-rose-800 font-bold flex items-center gap-1.5 flex-wrap mt-1">
                            <i class="fa-solid fa-triangle-exclamation text-rose-600"></i>
                            <span>特殊要求：</span>
                            ${(meal.specialNotes || []).map(n => `<span class="note-badge px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200 font-bold">${n}</span>`).join('')}
                            ${meal.customNote ? `<span class="note-badge px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200 font-bold">${meal.customNote}</span>` : ''}
                          </div>
                        ` : ''}
                      </div>
                    </div>

                    <!-- Serving Action Button (Big & Foolproof) -->
                    <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      ${isServed ? `
                        <div class="flex items-center gap-2">
                          <span class="text-xs text-emerald-700 font-bold bg-emerald-100 px-3 py-2 rounded-xl flex items-center gap-1 border border-emerald-200">
                            <i class="fa-solid fa-circle-check"></i>
                            <span>已上餐</span>
                          </span>
                          <button type="button" data-member-id="${order.memberId}" data-meal-id="${meal.id}"
                                  class="btn-toggle-serve text-xs text-gray-500 hover:text-red-600 px-2.5 py-2 rounded-xl hover:bg-gray-100 transition border border-gray-200" title="防呆復原">
                            <i class="fa-solid fa-rotate-left"></i> 復原
                          </button>
                        </div>
                      ` : `
                        <button type="button" data-member-id="${order.memberId}" data-meal-id="${meal.id}"
                                class="btn-toggle-serve serve-action-btn px-4 py-2.5 rounded-xl bg-trio-crimson hover:bg-trio-crimsonHover text-white font-bold text-sm transition shadow-sm flex items-center gap-1.5 active:scale-95">
                          <i class="fa-regular fa-circle-dot animate-ping"></i>
                          <span>🔴 點擊上餐</span>
                        </button>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');

      // Bind Kitchen Events
      container.querySelectorAll('.btn-toggle-serve').forEach(btn => {
        btn.addEventListener('click', () => {
          const mId = btn.getAttribute('data-member-id');
          const mealId = btn.getAttribute('data-meal-id');
          OrderManager.toggleMealServed(mId, mealId);
        });
      });

      container.querySelectorAll('[data-batch-member-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const mId = btn.getAttribute('data-batch-member-id');
          OrderManager.batchServeAllMealsForMember(mId);
        });
      });
    },

    // ================= 統計與對帳名冊 (Tab 3) =================
    renderSummaryTable() {
      const tbody = document.getElementById('summaryTableBody');
      if (!tbody) return;

      const orderList = Object.values(State.orders);
      if (orderList.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="py-8 text-center text-gray-400">目前尚無任何社友完成點餐</td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = orderList.map((order, idx) => {
        const meals = order.meals || [];
        const allDone = meals.length > 0 && meals.every(m => m.served);
        const servedCount = meals.filter(m => m.served).length;

        const mealDetailsHtml = meals.map((m, mIdx) => {
          const notes = [...(m.specialNotes || [])];
          if (m.customNote) notes.push(m.customNote);
          const noteStr = notes.length > 0 ? ` <span class="text-rose-600 font-bold">(${notes.join('、')})</span>` : '';
          const statusIcon = m.served ? '🟢' : '🔴';
          return `<div class="text-xs py-0.5">${statusIcon} ${mIdx + 1}. [${m.type}餐] ${m.guestLabel || '本人'}${noteStr}</div>`;
        }).join('');

        return `
          <tr class="hover:bg-gray-50/80 transition">
            <td class="py-3 px-4 text-gray-500">${idx + 1}</td>
            <td class="py-3 px-4 font-bold font-serif text-trio-forest">${order.memberName}</td>
            <td class="py-3 px-4 text-xs text-gray-600">${order.memberRole}</td>
            <td class="py-3 px-4 font-bold text-trio-wood">${meals.length} 份</td>
            <td class="py-3 px-4">${mealDetailsHtml}</td>
            <td class="py-3 px-4">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full ${allDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                ${servedCount}/${meals.length} 已上
              </span>
            </td>
            <td class="py-3 px-4 text-center">
              <div class="flex items-center justify-center gap-1">
                <button type="button" data-edit-member-id="${order.memberId}" class="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded text-xs" title="回到點餐頁面修改">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button type="button" data-delete-member-id="${order.memberId}" class="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded text-xs" title="刪除此紀錄">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Bind actions in summary table
      tbody.querySelectorAll('[data-edit-member-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const mId = btn.getAttribute('data-edit-member-id');
          UI.switchTab('orderTab');
          OrderManager.selectMember(mId);
        });
      });

      tbody.querySelectorAll('[data-delete-member-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const mId = btn.getAttribute('data-delete-member-id');
          OrderManager.deleteOrder(mId);
        });
      });
    },

    // ================= 設定頁面 (Tab 4) =================
    renderSettingsMembers() {
      const container = document.getElementById('settingsMemberList');
      if (!container) return;

      container.innerHTML = State.members.map((member, idx) => {
        return `
          <div class="p-2.5 bg-gray-50 hover:bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-2 text-xs transition">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-7 h-7 rounded-lg bg-white border border-gray-300 font-mono font-bold text-gray-600 flex items-center justify-center text-[11px] shrink-0">
                ${String(idx + 1).padStart(2, '0')}
              </span>
              <span class="px-2 py-0.5 bg-trio-forest/10 text-trio-forest font-bold rounded text-[11px] shrink-0">
                ${member.role}
              </span>
              <span class="font-bold text-trio-forest font-serif text-sm truncate">
                ${member.name}
              </span>
              <span class="text-gray-500 text-xs shrink-0">
                (${member.extraGuests > 0 ? `+${member.extraGuests}，共 ${member.totalGuests} 位` : '1 位'})
              </span>
            </div>
            <button type="button" data-delete-settings-member="${member.id}" class="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition shrink-0" title="從名冊中移除">
              <i class="fa-solid fa-trash-can text-sm"></i>
            </button>
          </div>
        `;
      }).join('');

      container.querySelectorAll('[data-delete-settings-member]').forEach(btn => {
        btn.addEventListener('click', () => {
          const mId = btn.getAttribute('data-delete-settings-member');
          const member = OrderManager.getMemberById(mId);
          if (confirm(`確定從名冊中移除【${member ? member.name : ''}】？`)) {
            State.members = State.members.filter(m => m.id !== mId);
            delete State.orders[mId];
            Storage.saveMembers();
            Storage.saveOrders();
            UI.renderAll();
          }
        });
      });
    },

    renderSettingsMenu() {
      const menuAName = document.getElementById('menuAName');
      const menuADesc = document.getElementById('menuADesc');
      const menuBName = document.getElementById('menuBName');
      const menuBDesc = document.getElementById('menuBDesc');
      const menuCName = document.getElementById('menuCName');
      const menuCDesc = document.getElementById('menuCDesc');

      if (menuAName && State.menu.A) menuAName.value = State.menu.A.name;
      if (menuADesc && State.menu.A) menuADesc.value = State.menu.A.desc;
      if (menuBName && State.menu.B) menuBName.value = State.menu.B.name;
      if (menuBDesc && State.menu.B) menuBDesc.value = State.menu.B.desc;
      if (menuCName && State.menu.C) menuCName.value = State.menu.C.name;
      if (menuCDesc && State.menu.C) menuCDesc.value = State.menu.C.desc;

      const fbInput = document.getElementById('firebaseConfigInput');
      if (fbInput && State.firebaseConfig) {
        fbInput.value = JSON.stringify(State.firebaseConfig, null, 2);
      }
    },

    // ================= 事件綁定 =================
    bindTabEvents() {
      document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetTabId = btn.getAttribute('data-tab');
          this.switchTab(targetTabId);
        });
      });
    },

    switchTab(tabId) {
      document.querySelectorAll('.nav-tab').forEach(b => {
        if (b.getAttribute('data-tab') === tabId) {
          b.classList.add('active');
          b.classList.remove('text-gray-300');
          b.classList.add('text-trio-sand');
        } else {
          b.classList.remove('active');
          b.classList.remove('text-trio-sand');
          b.classList.add('text-gray-300');
        }
      });

      document.querySelectorAll('.tab-content').forEach(content => {
        if (content.id === tabId) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });

      // Re-render
      if (tabId === 'orderTab') this.renderOrderViews(), this.renderMemberGrid(), this.renderSubmitBar();
      if (tabId === 'kitchenTab') this.renderKitchenDashboard(), this.renderKitchenList();
      if (tabId === 'summaryTab') this.renderSummaryTable();
    },

    bindGlobalActions() {
      // Sound Toggle
      const btnSound = document.getElementById('btnSoundToggle');
      const iconSound = document.getElementById('soundIcon');
      if (btnSound) {
        btnSound.addEventListener('click', () => {
          State.isSoundEnabled = !State.isSoundEnabled;
          localStorage.setItem('trio_sound', State.isSoundEnabled ? 'true' : 'false');
          if (iconSound) {
            iconSound.className = State.isSoundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark text-red-400';
          }
          UI.showToast(State.isSoundEnabled ? '已開啟操作提示音' : '已關閉提示音', 'info');
        });
      }

      // Big Font Mode Toggle
      const btnFont = document.getElementById('btnFontSizeToggle');
      if (btnFont) {
        btnFont.addEventListener('click', () => {
          State.isBigFontMode = !State.isBigFontMode;
          localStorage.setItem('trio_big_font', State.isBigFontMode ? 'true' : 'false');
          this.applyBigFontClass();
          UI.showToast(State.isBigFontMode ? '已切換為長者超大字體模式' : '已還原標準字體', 'info');
        });
      }

      // Dual Window Link Helper (方便前台外場與後台內場各開一個視窗測試)
      const btnDual = document.getElementById('btnOpenDual');
      if (btnDual) {
        btnDual.addEventListener('click', () => {
          window.open(window.location.href, '_blank', 'width=800,height=900');
          UI.showToast('已在新分頁開啟！一邊開「外場代點餐」、另一邊開「主廚上餐」，可立即體驗毫秒級雙向同步！', 'success');
        });
      }
    },

    applyBigFontClass() {
      if (State.isBigFontMode) {
        document.body.classList.add('big-font-mode');
      } else {
        document.body.classList.remove('big-font-mode');
      }
    },

    bindOrderEvents() {
      // Search
      const searchInput = document.getElementById('memberSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          State.memberSearch = e.target.value;
          this.renderMemberGrid();
        });
      }

      // Member Filters
      const filterAll = document.getElementById('filterAllMembers');
      const filterUnordered = document.getElementById('filterUnordered');
      const filterOrdered = document.getElementById('filterOrdered');

      const setFilterActive = (btn, filterValue) => {
        document.querySelectorAll('.member-filter-btn').forEach(b => {
          b.classList.remove('active', 'bg-white', 'shadow-xs', 'font-bold', 'text-trio-forest');
          b.classList.add('text-gray-600');
        });
        btn.classList.add('active', 'bg-white', 'shadow-xs', 'font-bold', 'text-trio-forest');
        btn.classList.remove('text-gray-600');
        State.memberFilter = filterValue;
        this.renderMemberGrid();
      };

      if (filterAll) filterAll.addEventListener('click', () => setFilterActive(filterAll, 'all'));
      if (filterUnordered) filterUnordered.addEventListener('click', () => setFilterActive(filterUnordered, 'unordered'));
      if (filterOrdered) filterOrdered.addEventListener('click', () => setFilterActive(filterOrdered, 'ordered'));

      // Back / Reset to Member List (Top, Banner & Bottom Buttons)
      const btnBackTop = document.getElementById('btnBackToMemberListTop');
      if (btnBackTop) {
        btnBackTop.addEventListener('click', () => {
          OrderManager.exitOrderMode();
        });
      }

      const btnBackBottom = document.getElementById('btnBackToMemberListBottom');
      if (btnBackBottom) {
        btnBackBottom.addEventListener('click', () => {
          OrderManager.exitOrderMode();
        });
      }

      const btnReset = document.getElementById('btnResetSelectedMember');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          OrderManager.exitOrderMode();
        });
      }

      const btnCancel = document.getElementById('btnCancelOrder');
      if (btnCancel) {
        btnCancel.addEventListener('click', () => {
          OrderManager.exitOrderMode();
        });
      }

      // Add Another Meal for Guest
      const btnAddAnother = document.getElementById('btnAddAnotherMeal');
      if (btnAddAnother) {
        btnAddAnother.addEventListener('click', () => {
          OrderManager.addMealDraft();
        });
      }

      // Submit Order (Both sticky submit bar and inline button)
      const btnSubmit = document.getElementById('btnSubmitOrder');
      if (btnSubmit) {
        btnSubmit.addEventListener('click', () => {
          OrderManager.submitCurrentOrder();
        });
      }

      const btnSubmitInline = document.getElementById('btnSubmitOrderInline');
      if (btnSubmitInline) {
        btnSubmitInline.addEventListener('click', () => {
          OrderManager.submitCurrentOrder();
        });
      }

      // Banner Guest Stepper Buttons
      const btnBannerMinus = document.getElementById('bannerGuestMinus');
      if (btnBannerMinus) {
        btnBannerMinus.addEventListener('click', (e) => {
          e.stopPropagation();
          if (State.currentSelectedMemberId) {
            OrderManager.adjustMemberGuests(State.currentSelectedMemberId, -1);
          }
        });
      }

      const btnBannerPlus = document.getElementById('bannerGuestPlus');
      if (btnBannerPlus) {
        btnBannerPlus.addEventListener('click', (e) => {
          e.stopPropagation();
          if (State.currentSelectedMemberId) {
            OrderManager.adjustMemberGuests(State.currentSelectedMemberId, +1);
          }
        });
      }

      const bannerGuestsText = document.getElementById('bannerMemberGuests');
      if (bannerGuestsText) {
        bannerGuestsText.addEventListener('click', (e) => {
          e.stopPropagation();
          if (State.currentSelectedMemberId) {
            UI.openGuestModal(State.currentSelectedMemberId);
          }
        });
      }
    },

    bindKitchenEvents() {
      // Kitchen Search
      const searchInput = document.getElementById('kitchenSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          State.kitchenSearch = e.target.value;
          this.renderKitchenList();
        });
      }

      // Kitchen Filters
      const filterAll = document.getElementById('filterKitchenAll');
      const filterUnserved = document.getElementById('filterKitchenUnserved');
      const filterServed = document.getElementById('filterKitchenServed');

      const setKitchenFilterActive = (btn, filterValue) => {
        document.querySelectorAll('.kitchen-filter-btn').forEach(b => {
          b.classList.remove('bg-trio-forest', 'text-white', 'shadow-xs');
          b.classList.add('bg-gray-100', 'text-gray-700');
        });
        btn.classList.remove('bg-gray-100', 'text-gray-700');
        btn.classList.add('bg-trio-forest', 'text-white', 'shadow-xs');
        State.kitchenFilter = filterValue;
        this.renderKitchenList();
      };

      if (filterAll) filterAll.addEventListener('click', () => setKitchenFilterActive(filterAll, 'all'));
      if (filterUnserved) filterUnserved.addEventListener('click', () => setKitchenFilterActive(filterUnserved, 'unserved'));
      if (filterServed) filterServed.addEventListener('click', () => setKitchenFilterActive(filterServed, 'served'));
    },

    bindSettingsEvents() {
      // Add Single Member
      const btnAddMember = document.getElementById('btnAddNewMember');
      if (btnAddMember) {
        btnAddMember.addEventListener('click', () => {
          const nameInput = document.getElementById('newMemberNameInput');
          const roleInput = document.getElementById('newMemberRoleInput');
          const name = (nameInput.value || '').trim();
          const role = (roleInput.value || '').trim() || '社友';
          if (!name) {
            UI.showToast('請輸入社友姓名', 'warning');
            return;
          }
          State.members.push({
            id: 'mem_' + Date.now(),
            name: name,
            role: role
          });
          nameInput.value = '';
          roleInput.value = '';
          Storage.saveMembers();
          UI.showToast(`已新增社友：${name}`, 'success');
          UI.renderAll();
        });
      }

      // Reset Default members (20 groups, 34 attendees from PDF)
      const btnResetMembers = document.getElementById('btnResetDefaultMembers');
      if (btnResetMembers) {
        btnResetMembers.addEventListener('click', () => {
          if (confirm('確定要還原為「報名人數.pdf」匯入的名冊嗎？（共 20 組，34 位出席）')) {
            State.members = JSON.parse(JSON.stringify(DEFAULT_MEMBERS));
            Storage.saveMembers();
            UI.showToast('已還原為「報名人數.pdf」20 組名冊 (共 34 位)', 'success');
            UI.renderAll();
          }
        });
      }

      // Reset Default Menu Settings (from 餐點.pdf)
      const btnResetMenu = document.getElementById('btnResetDefaultMenu');
      if (btnResetMenu) {
        btnResetMenu.addEventListener('click', () => {
          if (confirm('確定要還原為「餐點.pdf」匯入的菜單設定嗎？')) {
            State.menu = JSON.parse(JSON.stringify(DEFAULT_MENU));
            Storage.saveMenu();
            UI.renderSettingsMenu();
            UI.showToast('已還原為「餐點.pdf」預設菜單！', 'success');
            UI.renderAll();
          }
        });
      }

      // Save Menu Settings
      const btnSaveMenu = document.getElementById('btnSaveMenuSettings');
      if (btnSaveMenu) {
        btnSaveMenu.addEventListener('click', () => {
          if (!State.menu.A) State.menu.A = { id: 'A', tag: 'A餐' };
          if (!State.menu.B) State.menu.B = { id: 'B', tag: 'B餐' };
          if (!State.menu.C) State.menu.C = { id: 'C', tag: 'C餐' };

          if (document.getElementById('menuAName')) State.menu.A.name = document.getElementById('menuAName').value.trim();
          if (document.getElementById('menuADesc')) State.menu.A.desc = document.getElementById('menuADesc').value.trim();
          if (document.getElementById('menuBName')) State.menu.B.name = document.getElementById('menuBName').value.trim();
          if (document.getElementById('menuBDesc')) State.menu.B.desc = document.getElementById('menuBDesc').value.trim();
          if (document.getElementById('menuCName')) State.menu.C.name = document.getElementById('menuCName').value.trim();
          if (document.getElementById('menuCDesc')) State.menu.C.desc = document.getElementById('menuCDesc').value.trim();

          Storage.saveMenu();
          UI.showToast('菜單設定已成功儲存！', 'success');
          UI.renderAll();
        });
      }

      // Real-Time Cloud Sync: Settings Force Push
      const btnSettingsPush = document.getElementById('btnSettingsForcePush');
      if (btnSettingsPush) {
        btnSettingsPush.addEventListener('click', () => {
          Sync.pushToCloud(true);
          UI.showToast('☁️ 已將本機最新點餐資料強制發布至雲端！', 'success');
        });
      }

      // Real-Time Cloud Sync: Settings Force Pull
      const btnSettingsPull = document.getElementById('btnSettingsForcePull');
      if (btnSettingsPull) {
        btnSettingsPull.addEventListener('click', () => {
          Sync.forcePullFromCloud();
        });
      }

      // Real-Time Cloud Sync: Copy Share URL
      const btnCopyShareUrlSettings = document.getElementById('btnCopyShareUrlSettings');
      if (btnCopyShareUrlSettings) {
        btnCopyShareUrlSettings.addEventListener('click', () => {
          const shareUrl = window.location.href.split('#')[0];
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl).then(() => {
              UI.showToast('📋 已複製點餐系統網址！可直接貼給社友或廚房', 'success');
            }).catch(() => {
              prompt('請手動複製以下點餐系統網址：', shareUrl);
            });
          } else {
            prompt('請手動複製以下點餐系統網址：', shareUrl);
          }
        });
      }

      // Save Firebase Config
      const btnSaveFb = document.getElementById('btnSaveFirebaseConfig');
      if (btnSaveFb) {
        btnSaveFb.addEventListener('click', () => {
          const val = document.getElementById('firebaseConfigInput').value.trim();
          if (!val) {
            UI.showToast('請貼上 Firebase 設定 JSON 代碼', 'warning');
            return;
          }
          try {
            const parsed = JSON.parse(val);
            State.firebaseConfig = parsed;
            localStorage.setItem('trio_firebase_config', JSON.stringify(parsed));
            Sync.initFirebase(parsed);
          } catch (e) {
            UI.showToast('JSON 格式有誤，請確認複製完整的 Firebase Config 物件', 'error');
          }
        });
      }

      // Clear Firebase Config
      const btnClearFb = document.getElementById('btnClearFirebaseConfig');
      if (btnClearFb) {
        btnClearFb.addEventListener('click', () => {
          State.firebaseConfig = null;
          State.firestoreDb = null;
          State.isFirebaseConnected = false;
          localStorage.removeItem('trio_firebase_config');
          document.getElementById('firebaseConfigInput').value = '';
          Sync.updateSyncBadge(false);
          UI.showToast('已還原純本地同步模式', 'info');
        });
      }

      // Reset All Orders
      const btnResetOrders = document.getElementById('btnResetAllOrders');
      if (btnResetOrders) {
        btnResetOrders.addEventListener('click', () => {
          OrderManager.resetAllOrders();
        });
      }

      // Export CSV
      const btnExportCSV = document.getElementById('btnExportCSV');
      if (btnExportCSV) {
        btnExportCSV.addEventListener('click', () => {
          this.exportCSV();
        });
      }

      // Export JSON
      const btnExportJSON = document.getElementById('btnExportJSON');
      if (btnExportJSON) {
        btnExportJSON.addEventListener('click', () => {
          this.exportJSON();
        });
      }

      // Print Kitchen Sheet
      const btnPrint = document.getElementById('btnPrintKitchenSheet');
      if (btnPrint) {
        btnPrint.addEventListener('click', () => {
          this.printKitchenSheet();
        });
      }
    },

    openGuestModal(memberId) {
      const member = OrderManager.getMemberById(memberId);
      if (!member) return;

      State.modalGuestTargetMemberId = memberId;
      State.modalGuestCurrentCount = member.totalGuests || (1 + (member.extraGuests || 0));

      const titleEl = document.getElementById('guestModalTitle');
      if (titleEl) titleEl.innerText = `調整攜帶人數 ｜ ${member.name}`;

      const subtitleEl = document.getElementById('guestModalSubtitle');
      if (subtitleEl) subtitleEl.innerText = `${member.name} (${member.role})`;

      this.updateGuestModalDisplay();

      const modal = document.getElementById('guestCountModal');
      if (modal) modal.classList.remove('hidden');
    },

    updateGuestModalDisplay() {
      const total = State.modalGuestCurrentCount || 1;
      const extra = total - 1;
      const numEl = document.getElementById('modalGuestTotalNumber');
      const textEl = document.getElementById('modalGuestDetailText');
      if (numEl) numEl.innerText = total;
      if (textEl) {
        textEl.innerText = extra > 0 ? `本人 1 位 ＋ 寶眷 ${extra} 位 (共 ${total} 位)` : '本人 1 位 (無同行寶眷)';
      }
    },

    bindModalEvents() {
      // Close Modals
      document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.getElementById('batchImportModal').classList.add('hidden');
          document.getElementById('quickGuestModal').classList.add('hidden');
          const guestModal = document.getElementById('guestCountModal');
          if (guestModal) guestModal.classList.add('hidden');
          const syncModal = document.getElementById('syncStatusModal');
          if (syncModal) syncModal.classList.add('hidden');
        });
      });

      // Quick Add Guest
      const btnQuickGuest = document.getElementById('btnQuickAddGuest');
      if (btnQuickGuest) {
        btnQuickGuest.addEventListener('click', () => {
          document.getElementById('guestNameInput').value = '';
          document.getElementById('quickGuestModal').classList.remove('hidden');
        });
      }

      const btnConfirmGuest = document.getElementById('btnConfirmQuickGuest');
      if (btnConfirmGuest) {
        btnConfirmGuest.addEventListener('click', () => {
          const name = document.getElementById('guestNameInput').value.trim();
          const role = document.getElementById('guestRoleInput').value;
          if (!name) {
            UI.showToast('請輸入來賓姓名', 'warning');
            return;
          }
          const newId = 'mem_' + Date.now();
          State.members.push({ id: newId, name: name, role: role });
          Storage.saveMembers();
          document.getElementById('quickGuestModal').classList.add('hidden');
          UI.showToast(`已新增來賓【${name}】，立即開始點餐`, 'success');
          OrderManager.selectMember(newId);
        });
      }

      // Batch Import Modal
      const btnOpenBatch = document.getElementById('btnBatchImportMembersModal');
      if (btnOpenBatch) {
        btnOpenBatch.addEventListener('click', () => {
          document.getElementById('batchImportModal').classList.remove('hidden');
        });
      }

      const btnConfirmBatch = document.getElementById('btnConfirmBatchImport');
      if (btnConfirmBatch) {
        btnConfirmBatch.addEventListener('click', () => {
          const text = document.getElementById('batchImportTextarea').value.trim();
          if (!text) {
            UI.showToast('請輸入名單內容', 'warning');
            return;
          }
          const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          const newMembers = [];
          lines.forEach((line, idx) => {
            const parts = line.split(/[\s,，]+/);
            const name = parts[0];
            const role = parts[1] || '社友';
            if (name) {
              newMembers.push({
                id: 'mem_batch_' + Date.now() + '_' + idx,
                name: name,
                role: role
              });
            }
          });

          if (newMembers.length > 0) {
            State.members = newMembers;
            Storage.saveMembers();
            document.getElementById('batchImportModal').classList.add('hidden');
            UI.showToast(`成功匯入 ${newMembers.length} 位社友！`, 'success');
            UI.renderAll();
          }
        });
      }

      // Guest Count Stepper Modal Events
      const modalMinus = document.getElementById('modalGuestMinus');
      if (modalMinus) {
        modalMinus.addEventListener('click', () => {
          if (State.modalGuestCurrentCount > 1) {
            State.modalGuestCurrentCount--;
            UI.updateGuestModalDisplay();
          }
        });
      }

      const modalPlus = document.getElementById('modalGuestPlus');
      if (modalPlus) {
        modalPlus.addEventListener('click', () => {
          State.modalGuestCurrentCount++;
          UI.updateGuestModalDisplay();
        });
      }

      document.querySelectorAll('.btn-quick-set-guest').forEach(btn => {
        btn.addEventListener('click', () => {
          const count = parseInt(btn.getAttribute('data-count'), 10) || 1;
          State.modalGuestCurrentCount = count;
          UI.updateGuestModalDisplay();
        });
      });

      const btnConfirmGuestModal = document.getElementById('btnConfirmGuestModal');
      if (btnConfirmGuestModal) {
        btnConfirmGuestModal.addEventListener('click', () => {
          if (State.modalGuestTargetMemberId) {
            OrderManager.adjustMemberGuests(State.modalGuestTargetMemberId, 0, State.modalGuestCurrentCount);
          }
          const guestModal = document.getElementById('guestCountModal');
          if (guestModal) guestModal.classList.add('hidden');
        });
      }

      // Sync Badge Click -> Open Sync Modal
      const syncBadge = document.getElementById('syncBadge');
      if (syncBadge) {
        syncBadge.addEventListener('click', () => {
          Sync.updateSyncBadge();
          const syncModal = document.getElementById('syncStatusModal');
          if (syncModal) syncModal.classList.remove('hidden');
        });
      }

      // Sync Modal: Force Push
      const btnModalPush = document.getElementById('btnModalForcePush');
      if (btnModalPush) {
        btnModalPush.addEventListener('click', () => {
          Sync.pushToCloud(true);
          UI.showToast('☁️ 已將本機所有點餐資料強制同步至雲端！', 'success');
        });
      }

      // Sync Modal: Force Pull
      const btnModalPull = document.getElementById('btnModalForcePull');
      if (btnModalPull) {
        btnModalPull.addEventListener('click', () => {
          Sync.forcePullFromCloud();
        });
      }

      // Sync Modal: Copy Share URL
      const btnModalCopyShare = document.getElementById('btnModalCopyShare');
      if (btnModalCopyShare) {
        btnModalCopyShare.addEventListener('click', () => {
          const shareUrl = window.location.href.split('#')[0];
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl).then(() => {
              UI.showToast('📋 已複製點餐系統網址！可直接貼給社友或廚房', 'success');
            }).catch(() => {
              prompt('請手動複製以下點餐系統網址：', shareUrl);
            });
          } else {
            prompt('請手動複製以下點餐系統網址：', shareUrl);
          }
        });
      }
    },

    // ================= 匯出與列印引擎 =================
    exportCSV() {
      const orderList = Object.values(State.orders);
      if (orderList.length === 0) {
        UI.showToast('目前尚無點餐紀錄可供匯出', 'warning');
        return;
      }

      const rows = [
        ['社友姓名', '職稱', '餐點序號', '餐點對象', '套餐種類', '套餐名稱', '特殊飲食備註', '自訂備註', '上餐狀態', '點餐更新時間']
      ];

      orderList.forEach(ord => {
        (ord.meals || []).forEach((m, idx) => {
          const menuInfo = State.menu[m.type] || { tag: m.type, name: '' };
          rows.push([
            ord.memberName,
            ord.memberRole,
            idx + 1,
            m.guestLabel || '本人',
            menuInfo.tag,
            menuInfo.name,
            (m.specialNotes || []).join('; '),
            m.customNote || '',
            m.served ? '已上餐' : '未上餐',
            new Date(ord.updatedAt).toLocaleString('zh-TW')
          ]);
        });
      });

      // Add BOM for Excel utf-8 recognition
      const csvContent = '\uFEFF' + rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `馥森阪治Trio_松山松青扶輪社_點餐總表_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      UI.showToast('CSV 點餐名冊已匯出 (Excel 相容中文)', 'success');
    },

    exportJSON() {
      const exportData = {
        exportedAt: new Date().toISOString(),
        event: '馥森阪治 Trio 聚餐 - 松山松青扶輪社',
        members: State.members,
        orders: State.orders,
        menu: State.menu
      };
      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trio_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      UI.showToast('已下載 JSON 備份檔', 'success');
    },

    printKitchenSheet() {
      const container = document.getElementById('printContainer');
      if (!container) return;

      const orderList = Object.values(State.orders);
      let totalMeals = 0, countA = 0, countB = 0, countC = 0;
      orderList.forEach(ord => {
        (ord.meals || []).forEach(m => {
          totalMeals++;
          if (m.type === 'A') countA++;
          else if (m.type === 'B') countB++;
          else if (m.type === 'C') countC++;
        });
      });

      let rowsHtml = '';
      let index = 1;
      orderList.forEach(ord => {
        (ord.meals || []).forEach(m => {
          const notes = [...(m.specialNotes || [])];
          if (m.customNote) notes.push(m.customNote);
          const noteText = notes.length > 0 ? `⚠️ <strong>${notes.join('、')}</strong>` : '無';

          rowsHtml += `
            <tr style="border-bottom: 1px solid #ddd; height: 36px;">
              <td style="text-align: center; width: 40px;"><input type="checkbox"></td>
              <td style="text-align: center; width: 40px;">${index++}</td>
              <td style="font-weight: bold; font-size: 14pt;">${ord.memberName}</td>
              <td>${ord.memberRole}</td>
              <td>${m.guestLabel || '本人'}</td>
              <td style="font-weight: bold; font-size: 13pt;">${m.type} 餐</td>
              <td style="color: #b93838;">${noteText}</td>
            </tr>
          `;
        });
      });

      container.innerHTML = `
        <div style="font-family: 'Noto Serif TC', serif;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
            <h1 style="font-size: 22pt; margin: 0;">馥森阪治 Trio 聚餐 ｜ 主廚備料與上餐核對清單</h1>
            <p style="margin: 5px 0 0 0; font-size: 12pt;">松山松青扶輪社 ｜ 列印時間：${new Date().toLocaleString('zh-TW')}</p>
          </div>

          <div style="display: flex; justify-content: space-around; background: #f0f0f0; padding: 10px; margin-bottom: 20px; font-size: 13pt; font-weight: bold;">
            <div>總餐數：${totalMeals} 份</div>
            <div>A 餐 (${State.menu.A ? State.menu.A.name : '香煎鮭魚'})：${countA} 份</div>
            <div>B 餐 (${State.menu.B ? State.menu.B.name : '雞肉塔吉'})：${countB} 份</div>
            <div>C 餐 (${State.menu.C ? State.menu.C.name : '素食奶蛋素'})：${countC} 份</div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 11pt;">
            <thead>
              <tr style="background: #333; color: white; height: 32px;">
                <th>出餐</th>
                <th>序號</th>
                <th style="text-align: left; padding-left: 8px;">社友姓名</th>
                <th style="text-align: left;">職稱</th>
                <th style="text-align: left;">對象</th>
                <th style="text-align: left;">套餐</th>
                <th style="text-align: left;">特殊飲食備註</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;

      window.print();
    },

    // ================= Toast 通知系統 =================
    showToast(message, type = 'info') {
      const container = document.getElementById('toastContainer');
      if (!container) return;

      const toast = document.createElement('div');
      let bg = 'bg-gray-800 text-white';
      let icon = '<i class="fa-solid fa-circle-info"></i>';

      if (type === 'success') {
        bg = 'bg-emerald-800 text-white border border-emerald-500/40 shadow-xl';
        icon = '<i class="fa-solid fa-circle-check text-emerald-300"></i>';
      } else if (type === 'warning') {
        bg = 'bg-amber-800 text-white border border-amber-500/40 shadow-xl';
        icon = '<i class="fa-solid fa-triangle-exclamation text-amber-300"></i>';
      } else if (type === 'error') {
        bg = 'bg-rose-800 text-white border border-rose-500/40 shadow-xl';
        icon = '<i class="fa-solid fa-circle-exclamation text-rose-300"></i>';
      }

      toast.className = `toast-item ${bg} px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-2xl transition-all duration-300`;
      toast.innerHTML = `${icon} <span>${message}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }, 3200);
    }
  };

  // ================= 8. 系統啟動 =================
  document.addEventListener('DOMContentLoaded', () => {
    Storage.load();
    Sync.init();
    UI.init();
  });

})();
