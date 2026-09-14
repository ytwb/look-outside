import { useEffect, useRef, useState } from "react";

import type { Route } from "./+types/home";

const TIMER_DURATION_SECONDS = 20 * 60;
const MOVEMENT_REMINDER_DURATION_SECONDS = 30 * 60;
const EYE_REST_DURATION_SECONDS = 20;
type Locale = "en" | "zh" | "zh-CN";

type NotificationHistoryItem = {
  id: string;
  title: string;
  body: string;
  sentAt: Date;
  isChecked: boolean;
};

const LOCALE_OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: "en", label: "English" },
  { value: "zh", label: "繁體中文" },
  { value: "zh-CN", label: "简体中文" },
];

const MOVEMENT_REMINDERS = [
  {
    title: { en: "Side neck stretch", zh: "頸部側壓" },
    body: {
      en: "Sit tall, place one hand on top of your head, and gently guide your head to the side until you feel a stretch along your neck. Hold 15 to 30 seconds, then switch sides.",
      zh: "坐直身體，將一隻手放在頭頂，輕輕將頭部往側邊壓，直到感覺脖子側邊有拉伸感，維持15至30秒再換邊。",
    },
  },
   {
    title: { en: "45-Degree Diagonal Stretch", zh: "45度斜向拉伸" },
    body: {
      en: "Sit upright and turn your head 45 degrees to the left. Use your left hand to gently pull your head diagonally down toward your armpit. Hold for 10 to 15 seconds, then switch sides.",
      zh: "採坐姿，將頭轉向 45 度角。用手輕輕將頭往斜下方壓，伸展後頸及肩膀交界處。每次保持 10 至 15 秒，左右交替。",
    },
  },
  {
    title: { en: "Chin tuck", zh: "烏龜頸收縮" },
    body: {
      en: "Slide your chin straight back so your head stacks over your shoulders. Hold for 10 seconds to ease forward-head posture.",
      zh: "將下巴水平往後平移，讓頭部重新疊在肩膀上方，維持10秒，改善前傾姿勢。",
    },
  },
  {
    title: { en: "Shoulder shrugs", zh: "肩膀聳動" },
    body: {
      en: "Lift both shoulders toward your ears, pause for a few seconds, then relax them down. Repeat 10 times.",
      zh: "雙肩同時向上聳起靠近耳朵，停留幾秒後放鬆下垂，重複10次。",
    },
  },
  {
    title: { en: "Chest opener", zh: "擴胸仰頭" },
    body: {
      en: "Interlace your fingers behind your head, open your elbows, gently lift your chest, and slightly tilt your head back. Breathe slowly for 5 breaths.",
      zh: "雙手十指交叉放在腦後，手肘向外打開，輕輕挺胸並微微仰頭，配合緩慢呼吸維持5次。",
    },
  },
  {
    title: { en: "Seated back twist", zh: "腰背旋轉" },
    body: {
      en: "Sit near the front of your chair, hold the chair back with one hand, and rotate your upper body to each side to stretch your middle and lower back.",
      zh: "坐在椅子前半段，一手拉住椅背，轉動上半身向左右兩側旋轉，伸展中下背部。",
    },
  },
  {
    title: { en: "Overhead reach", zh: "雙臂高舉" },
    body: {
      en: "Interlace your fingers and reach both arms overhead with palms up. Lengthen your body and gently side-bend left and right for 10 to 15 seconds.",
      zh: "雙手十指交握向上高舉過頭，掌心朝上盡量延伸身體，左右微幅側拉10至15秒。",
    },
  },
  {
    title: { en: "Figure-four glute stretch", zh: "4字形臀部拉筋" },
    body: {
      en: "Place your right ankle above your left knee to make a figure-four shape. Lean forward until you feel a glute and hip stretch. Hold 15 to 30 seconds, then switch legs.",
      zh: "將右腳踝放在左膝上方呈「4」字形，上半身向前傾，感受臀部與髖部的拉伸，維持15至30秒後換腳。",
    },
  },
  {
    title: { en: "Hamstring stretch", zh: "腿後肌伸展" },
    body: {
      en: "Sit on the edge of your chair, extend one leg forward with your heel on the floor and toes pulled up, then lean forward to stretch the back of your thigh. Hold 15 to 30 seconds.",
      zh: "坐在椅緣，將單腿向前伸直、腳跟著地、腳尖勾起，身體向前傾，伸展大腿後側，維持15至30秒。",
    },
  },
    {
    title: { en: "Seated Cat-Cow Stretch", zh: "坐姿貓牛式" },
    body: {
      en: "Cat: Round your spine, drop your head, and look toward your belly button. Cow: Arch your back, lift your chest, and look slightly upward.",
      zh: "雙手扶膝。吸氣挺胸抬頭拱背，呼氣低頭含胸駝背。重複5次。",
    },
  },
  {
    title: { en: "Seated Chest Opener", zh: "椅上大開胸" },
    body: {
      en: "Interlace your fingers behind your back. Roll your shoulders back, straighten your arms, and lift your chest.",
      zh: "雙手在背後十指交扣。吸氣時手肘伸直，雙肩後旋，胸口向天花板延伸。",
    },
  },
    {
    title: { en: "Seated Ankle Rolls and Toe Flexes", zh: "坐姿腳踝腳趾運動" },
    body: {
      en: "Ankle Rolls: Circle your ankles clockwise and counterclockwise. Toe Flexes: Curl your toes inward, then spread them out wide.",
      zh: "雙腳抬離地面。順時針及逆時針旋轉腳踝各10圈。接著用力抓趾再張開。",
    },
  },
];

const COPY = {
  en: {
    activeRest: "Look outside for",
    anotherMovementReminder: "Another movement reminder",
    bothRemindersRunning: "Both reminders are running.",
    combinedNotificationBody: "Click here to start your eye rest. Take a 20-second look outside. Then try {title}: {body}",
    combinedNotificationTitle: "Eye rest and movement break",
    clearNotifications: "Clear notifications",
    darkMode: "Dark mode",
    eyeRestAria: "{minutes} minutes and {seconds} seconds until your next eye rest",
    eyeRestInProgressNotificationBody: "Look outside and rest your eyes for 20 seconds.",
    eyeRestNotificationBody: "Click here to start your eye rest. Take a 20-second rest. Look outside and let your eyes relax.",
    eyeRestNotificationTitle: "Eye rest",
    eyebrow: "Focus and movement ritual",
    intro: "Rest your eyes every twenty minutes and leave your seat every thirty.",
    lightMode: "Light mode",
    localeToggle: "Language",
    moveIn: "Move in",
    notificationBlocked: "Browser notifications are blocked for this site.",
    notificationCenterEmpty: "No notifications yet.",
    notificationCenterTitle: "Notification center",
    notificationEnabled: "Browser notifications are on.",
    notificationPrompt: "Start once to allow browser notifications.",
    notificationUnsupported: "This browser does not support notifications.",
    reset: "Reset",
    resumeTimers: "Resume timers",
    startTimer: "Start focus timer",
    timerCaption: "until eye rest",
    title: "Outside",
    pausedStatus: "You will be reminded to rest your eyes and leave your seat.",
    pauseTimers: "Pause timers",
    pendingEyeRest: "Eye rest is ready.",
    startEyeRest: "Start 20-second eye rest",
  },
  zh: {
    activeRest: "看向窗外",
    anotherMovementReminder: "換一個活動提醒",
    bothRemindersRunning: "兩個提醒計時中。",
    combinedNotificationBody: "點擊這裡開始護眼休息。看向窗外20秒，然後試試「{title}」：{body}",
    combinedNotificationTitle: "護眼休息與活動提醒",
    clearNotifications: "清除通知",
    darkMode: "深色模式",
    eyeRestAria: "距離下一次護眼休息還有{minutes}分{seconds}秒",
    eyeRestInProgressNotificationBody: "看向窗外，讓眼睛休息20秒。",
    eyeRestNotificationBody: "點擊這裡開始護眼休息。休息20秒，看向窗外放鬆眼睛。",
    eyeRestNotificationTitle: "護眼休息",
    eyebrow: "專注與活動節奏",
    intro: "每20分鐘讓眼睛休息，每30分鐘離開座位活動一下。",
    lightMode: "淺色模式",
    localeToggle: "語言",
    moveIn: "活動倒數",
    notificationBlocked: "此網站的瀏覽器通知已被封鎖。",
    notificationCenterEmpty: "尚無通知。",
    notificationCenterTitle: "通知中心",
    notificationEnabled: "瀏覽器通知已開啟。",
    notificationPrompt: "啟動一次以允許瀏覽器通知。",
    notificationUnsupported: "此瀏覽器不支援通知。",
    reset: "重設",
    resumeTimers: "繼續計時",
    startTimer: "開始專注計時",
    timerCaption: "距離護眼休息",
    title: "窗外",
    pausedStatus: "系統會提醒你休息眼睛並離開座位。",
    pauseTimers: "暫停計時",
    pendingEyeRest: "護眼休息已準備好。",
    startEyeRest: "開始20秒護眼休息",
  },
  "zh-CN": {
    activeRest: "看向窗外",
    anotherMovementReminder: "换一个活动提醒",
    bothRemindersRunning: "两个提醒计时中。",
    combinedNotificationBody: "点击这里开始护眼休息。看向窗外20秒，然后试试「{title}」：{body}",
    combinedNotificationTitle: "护眼休息与活动提醒",
    clearNotifications: "清除通知",
    darkMode: "深色模式",
    eyeRestAria: "距离下一次护眼休息还有{minutes}分{seconds}秒",
    eyeRestInProgressNotificationBody: "看向窗外，让眼睛休息20秒。",
    eyeRestNotificationBody: "点击这里开始护眼休息。休息20秒，看向窗外放松眼睛。",
    eyeRestNotificationTitle: "护眼休息",
    eyebrow: "专注与活动节奏",
    intro: "每20分钟让眼睛休息，每30分钟离开座位活动一下。",
    lightMode: "浅色模式",
    localeToggle: "语言",
    moveIn: "活动倒数",
    notificationBlocked: "此网站的浏览器通知已被屏蔽。",
    notificationCenterEmpty: "暂无通知。",
    notificationCenterTitle: "通知中心",
    notificationEnabled: "浏览器通知已开启。",
    notificationPrompt: "启动一次以允许浏览器通知。",
    notificationUnsupported: "此浏览器不支持通知。",
    reset: "重置",
    resumeTimers: "继续计时",
    startTimer: "开始专注计时",
    timerCaption: "距离护眼休息",
    title: "窗外",
    pausedStatus: "系统会提醒你休息眼睛并离开座位。",
    pauseTimers: "暂停计时",
    pendingEyeRest: "护眼休息已准备好。",
    startEyeRest: "开始20秒护眼休息",
  },
};

function getSecondsUntil(timestamp: number) {
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
}

function getMovementReminder() {
  return MOVEMENT_REMINDERS[Math.floor(Math.random() * MOVEMENT_REMINDERS.length)];
}

function getLocalizedText<T extends Record<string, string | undefined>>(values: T, locale: Locale) {
  return values[locale] ?? values.zh ?? values.en ?? "";
}

function getInitialNotificationPermission() {
  if (typeof Notification === "undefined") return "unsupported";

  return Notification.permission;
}

type EyeRestNotificationMessage = {
  notificationHistoryId?: string;
  type?: "start-eye-rest";
};

type EyeRestStartSource = "page" | "notification";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Outside | Focus Break Timer" },
    {
      name: "description",
      content: "A gentle 20-minute reminder to rest your eyes.",
    },
  ];
}

export default function Home() {
  const [eyeRestSecondsRemaining, setEyeRestSecondsRemaining] = useState(TIMER_DURATION_SECONDS);
  const [movementSecondsRemaining, setMovementSecondsRemaining] = useState(MOVEMENT_REMINDER_DURATION_SECONDS);
  const [activeEyeRestSecondsRemaining, setActiveEyeRestSecondsRemaining] = useState(EYE_REST_DURATION_SECONDS);
  const [latestMovementReminder, setLatestMovementReminder] = useState<(typeof MOVEMENT_REMINDERS)[number] | null>(null);
  const [eyeRestEndsAt, setEyeRestEndsAt] = useState<number | null>(null);
  const [movementEndsAt, setMovementEndsAt] = useState<number | null>(null);
  const [activeEyeRestEndsAt, setActiveEyeRestEndsAt] = useState<number | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(getInitialNotificationPermission);
  const [isEyeRestPending, setIsEyeRestPending] = useState(false);
  const [isEyeRestActive, setIsEyeRestActive] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistoryItem[]>([]);
  const isEyeRestPendingRef = useRef(false);
  const isEyeRestActiveRef = useRef(false);
  const activeEyeRestSecondsRemainingRef = useRef(EYE_REST_DURATION_SECONDS);
  const pendingEyeRestNotificationIdRef = useRef<string | null>(null);
  const activeEyeRestNotificationIdRef = useRef<string | null>(null);
  const completedEyeRestNotificationIdsRef = useRef(new Set<string>());
  const isCompletingEyeRestRef = useRef(false);
  const notificationRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [locale, setLocale] = useState<Locale>("zh");
  const [isLocaleMenuOpen, setIsLocaleMenuOpen] = useState(false);
  const localeMenuRef = useRef<HTMLDivElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const copy = COPY[locale];
  const currentLocaleLabel = LOCALE_OPTIONS.find((option) => option.value === locale)?.label ?? copy.localeToggle;

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let isMounted = true;

    function handleServiceWorkerMessage(event: MessageEvent<EyeRestNotificationMessage>) {
      if (event.data?.type !== "start-eye-rest") return;

      startActiveEyeRest(event.data.notificationHistoryId, "notification");
    }

    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((registration) => {
        if (isMounted) notificationRegistrationRef.current = registration;
      })
      .catch(() => {
        // Fall back to the standard Notification API when registration is unavailable.
      });

    return () => {
      isMounted = false;
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, []);

  function getNextMovementReminder() {
    setLatestMovementReminder((currentReminder) => {
      let nextReminder = getMovementReminder();

      while (nextReminder === currentReminder) {
        nextReminder = getMovementReminder();
      }

      return nextReminder;
    });
  }

  useEffect(() => {
    if (!isLocaleMenuOpen) return;

    function closeLocaleMenu(event: PointerEvent) {
      if (localeMenuRef.current?.contains(event.target as Node)) return;

      setIsLocaleMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeLocaleMenu);

    return () => {
      document.removeEventListener("pointerdown", closeLocaleMenu);
    };
  }, [isLocaleMenuOpen]);

  useEffect(() => {
    if (!isRunning || eyeRestEndsAt === null || movementEndsAt === null) return;

    const currentEyeRestEndsAt = eyeRestEndsAt;
    const currentMovementEndsAt = movementEndsAt;

    function updateTimers() {
      setEyeRestSecondsRemaining(getSecondsUntil(currentEyeRestEndsAt));
      setMovementSecondsRemaining(getSecondsUntil(currentMovementEndsAt));
    }

    updateTimers();
    const interval = window.setInterval(updateTimers, 1000);
    window.addEventListener("visibilitychange", updateTimers);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("visibilitychange", updateTimers);
    };
  }, [eyeRestEndsAt, isRunning, movementEndsAt]);

  useEffect(() => {
    if (!isEyeRestActive || activeEyeRestEndsAt === null) return;

    const currentActiveEyeRestEndsAt = activeEyeRestEndsAt;

    function updateActiveEyeRestTimer() {
      const remainingSeconds = getSecondsUntil(currentActiveEyeRestEndsAt);

      setActiveEyeRestSecondsRemaining(remainingSeconds);

      if (remainingSeconds === 0) {
        completeActiveEyeRest();
      }
    }

    updateActiveEyeRestTimer();
    const interval = window.setInterval(updateActiveEyeRestTimer, 1000);
    window.addEventListener("focus", updateActiveEyeRestTimer);
    window.addEventListener("visibilitychange", updateActiveEyeRestTimer);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", updateActiveEyeRestTimer);
      window.removeEventListener("visibilitychange", updateActiveEyeRestTimer);
    };
  }, [activeEyeRestEndsAt, isEyeRestActive, isRunning]);

  useEffect(() => {
    activeEyeRestSecondsRemainingRef.current = activeEyeRestSecondsRemaining;
  }, [activeEyeRestSecondsRemaining]);

  function clearActiveEyeRestState() {
    setIsEyeRestActive(false);
    isEyeRestActiveRef.current = false;
    isCompletingEyeRestRef.current = false;
    setIsEyeRestPending(false);
    isEyeRestPendingRef.current = false;
    pendingEyeRestNotificationIdRef.current = null;
    activeEyeRestNotificationIdRef.current = null;
    setActiveEyeRestEndsAt(null);
    activeEyeRestSecondsRemainingRef.current = EYE_REST_DURATION_SECONDS;
    setActiveEyeRestSecondsRemaining(EYE_REST_DURATION_SECONDS);
  }

  function completeActiveEyeRest() {
    if (isCompletingEyeRestRef.current) return;

    isCompletingEyeRestRef.current = true;
    const notificationHistoryId = activeEyeRestNotificationIdRef.current;

    if (notificationHistoryId) {
      checkNotificationMessage(notificationHistoryId);
    }

    clearActiveEyeRestState();
    setEyeRestSecondsRemaining(TIMER_DURATION_SECONDS);

    if (isRunning) {
      setEyeRestEndsAt(Date.now() + TIMER_DURATION_SECONDS * 1000);
    } else {
      setEyeRestEndsAt(null);
    }
  }

  useEffect(() => {
    if (!isEyeRestActive || activeEyeRestSecondsRemaining !== 0) return;

    completeActiveEyeRest();
  }, [activeEyeRestSecondsRemaining, isEyeRestActive, isRunning]);

  useEffect(() => {
    const isEyeRestDue = eyeRestSecondsRemaining === 0 && !isEyeRestPending && !isEyeRestActive;
    const isMovementDue = movementSecondsRemaining === 0;

    if (!isRunning || (!isEyeRestDue && !isMovementDue)) return;

    const now = Date.now();

    if (isEyeRestDue) {
      setIsEyeRestPending(true);
      isEyeRestPendingRef.current = true;
    }

    if (isMovementDue) {
      setMovementEndsAt(now + MOVEMENT_REMINDER_DURATION_SECONDS * 1000);
      setMovementSecondsRemaining(MOVEMENT_REMINDER_DURATION_SECONDS);
    }

    if (isEyeRestDue && isMovementDue) {
      const movementReminder = getMovementReminder();
      setLatestMovementReminder(movementReminder);

      showReminderNotification(
        copy.combinedNotificationTitle,
        copy.combinedNotificationBody
          .replace("{title}", getLocalizedText(movementReminder.title, locale))
          .replace("{body}", getLocalizedText(movementReminder.body, locale)),
        startActiveEyeRest,
      );
      return;
    }

    if (isEyeRestDue) {
      showReminderNotification(copy.eyeRestNotificationTitle, copy.eyeRestNotificationBody, startActiveEyeRest);
      return;
    }

    const movementReminder = getMovementReminder();
    setLatestMovementReminder(movementReminder);
    showReminderNotification(
      getLocalizedText(movementReminder.title, locale),
      getLocalizedText(movementReminder.body, locale),
    );
  }, [copy, eyeRestSecondsRemaining, isEyeRestActive, isEyeRestPending, isRunning, locale, movementSecondsRemaining, notificationPermission]);

  const eyeRestMinutes = Math.floor(eyeRestSecondsRemaining / 60);
  const eyeRestSeconds = eyeRestSecondsRemaining % 60;
  const eyeRestTimerLabel = `${String(eyeRestMinutes).padStart(2, "0")}:${String(eyeRestSeconds).padStart(2, "0")}`;
  const movementMinutes = Math.floor(movementSecondsRemaining / 60);
  const movementSeconds = movementSecondsRemaining % 60;
  const movementTimerLabel = `${String(movementMinutes).padStart(2, "0")}:${String(movementSeconds).padStart(2, "0")}`;
  const activeEyeRestTimerLabel = `00:${String(activeEyeRestSecondsRemaining).padStart(2, "0")}`;
  const notificationStatus = notificationPermission === "granted"
    ? copy.notificationEnabled
    : notificationPermission === "denied"
      ? copy.notificationBlocked
      : notificationPermission === "unsupported"
        ? copy.notificationUnsupported
        : copy.notificationPrompt;

  async function requestNotificationPermission() {
    if (typeof Notification === "undefined") {
      setNotificationPermission("unsupported");
      return "unsupported";
    }

    if (Notification.permission !== "default") {
      setNotificationPermission(Notification.permission);
      return Notification.permission;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission;
  }

  function pauseActiveEyeRest() {
    if (activeEyeRestEndsAt !== null) {
      const remainingSeconds = getSecondsUntil(activeEyeRestEndsAt);
      activeEyeRestSecondsRemainingRef.current = remainingSeconds;
      setActiveEyeRestSecondsRemaining(remainingSeconds);
    }

    setIsEyeRestActive(false);
    isEyeRestActiveRef.current = false;
    setIsEyeRestPending(false);
    isEyeRestPendingRef.current = false;
    setActiveEyeRestEndsAt(null);
  }

  function startActiveEyeRest(
    notificationHistoryId = pendingEyeRestNotificationIdRef.current,
    source: EyeRestStartSource = "page",
  ) {
    if (notificationHistoryId && completedEyeRestNotificationIdsRef.current.has(notificationHistoryId)) return;

    if (isEyeRestActiveRef.current) return;

    if (!isEyeRestPendingRef.current && !isEyeRestActiveRef.current) {
      if (activeEyeRestSecondsRemainingRef.current === EYE_REST_DURATION_SECONDS) {
        isEyeRestPendingRef.current = true;
        setIsEyeRestPending(true);
      }
    }

    if (!isEyeRestPendingRef.current && !isEyeRestActiveRef.current) return;

    setActiveEyeRestEndsAt(Date.now() + activeEyeRestSecondsRemainingRef.current * 1000);
    setIsEyeRestPending(true);
    isEyeRestPendingRef.current = true;
    setIsEyeRestActive(true);
    isEyeRestActiveRef.current = true;

    if (notificationHistoryId) {
      completedEyeRestNotificationIdsRef.current.add(notificationHistoryId);
      activeEyeRestNotificationIdRef.current = notificationHistoryId;

      if (source === "page") {
        closeBrowserNotification(notificationHistoryId);
      }
    }
  }

  function closeBrowserNotification(notificationHistoryId: string) {
    const registration = notificationRegistrationRef.current;
    if (!registration) return;

    void registration.getNotifications().then((notifications) => {
      notifications.forEach((notification) => {
        if (notification.data?.notificationHistoryId === notificationHistoryId) {
          notification.close();
        }
      });
    });
  }

  function checkNotificationMessage(notificationHistoryId: string) {
    setNotificationHistory((currentHistory) => currentHistory.map((message) => (
      message.id === notificationHistoryId ? { ...message, isChecked: true } : message
    )));
  }

  function toggleNotificationMessage(notificationHistoryId: string) {
    setNotificationHistory((currentHistory) => currentHistory.map((message) => (
      message.id === notificationHistoryId ? { ...message, isChecked: !message.isChecked } : message
    )));
  }

  function recordNotificationMessage(title: string, body: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    setNotificationHistory((currentHistory) => [
      {
        id,
        title,
        body,
        isChecked: false,
        sentAt: new Date(),
      },
      ...currentHistory,
    ]);

    return id;
  }

  function showReminderNotification(title: string, body: string, onClick?: (notificationHistoryId?: string) => void) {
    const notificationHistoryId = recordNotificationMessage(title, body);

    if (onClick) {
      pendingEyeRestNotificationIdRef.current = notificationHistoryId;
    }

    if (notificationPermission !== "granted" || typeof Notification === "undefined") return;

    const tag = `outside-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const registration = notificationRegistrationRef.current;

    if (registration) {
      const notificationOptions: NotificationOptions & {
        actions?: Array<{ action: string; title: string }>;
      } = {
        actions: onClick ? [{ action: "start-eye-rest", title: copy.startEyeRest }] : [],
        body,
        data: { inProgressBody: copy.eyeRestInProgressNotificationBody, notificationHistoryId },
        requireInteraction: true,
        tag,
      };

      void registration.showNotification(title, notificationOptions);
      return;
    }

    const notification = new Notification(title, {
      body,
      requireInteraction: true,
      tag,
    });

    if (onClick) {
      notification.onclick = () => {
        window.focus();
        onClick(notificationHistoryId);
        notification.close();
      };
    }
  }

  async function handleTimerToggle() {
    if (isRunning) {
      if (eyeRestEndsAt !== null) {
        setEyeRestSecondsRemaining(getSecondsUntil(eyeRestEndsAt));
      }

      if (movementEndsAt !== null) {
        setMovementSecondsRemaining(getSecondsUntil(movementEndsAt));
      }

      pauseActiveEyeRest();
      setEyeRestEndsAt(null);
      setMovementEndsAt(null);
      setIsRunning(false);
      return;
    }

    await requestNotificationPermission();

    const now = Date.now();
    setEyeRestEndsAt(now + eyeRestSecondsRemaining * 1000);
    setMovementEndsAt(now + movementSecondsRemaining * 1000);

    if (activeEyeRestSecondsRemaining > 0 && activeEyeRestSecondsRemaining < EYE_REST_DURATION_SECONDS) {
      setActiveEyeRestEndsAt(now + activeEyeRestSecondsRemaining * 1000);
      setIsEyeRestActive(true);
      isEyeRestActiveRef.current = true;
      setIsEyeRestPending(true);
      isEyeRestPendingRef.current = true;
    }

    setIsRunning(true);
  }

  function handleReset() {
    setIsRunning(false);
    setEyeRestEndsAt(null);
    setMovementEndsAt(null);
    setLatestMovementReminder(null);
    clearActiveEyeRestState();
    setEyeRestSecondsRemaining(TIMER_DURATION_SECONDS);
    setMovementSecondsRemaining(MOVEMENT_REMINDER_DURATION_SECONDS);
  }

  function handleDarkModeToggle() {
    setIsDarkMode((currentMode) => !currentMode);
  }

  function handleLocaleSelect(selectedLocale: Locale) {
    setLocale(selectedLocale);
    setIsLocaleMenuOpen(false);
  }

  return (
    <main className={`timer-page${isDarkMode ? " dark-mode" : ""}`}>
      <section className="timer-shell" aria-labelledby="timer-heading">
        <div className="top-controls">
          <div className="language-picker" ref={localeMenuRef}>
            <span>{copy.localeToggle}</span>
            <button
              className="language-select-button"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isLocaleMenuOpen}
              onClick={() => setIsLocaleMenuOpen((isOpen) => !isOpen)}
            >
              {currentLocaleLabel}
            </button>
            {isLocaleMenuOpen && (
              <div className="language-options" role="listbox" aria-label={copy.localeToggle}>
                {LOCALE_OPTIONS.map((option) => (
                  <button
                    className="language-option"
                    type="button"
                    role="option"
                    aria-selected={option.value === locale}
                    key={option.value}
                    onClick={() => handleLocaleSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="mode-toggle"
            type="button"
            aria-pressed={isDarkMode}
            onClick={handleDarkModeToggle}
          >
            {isDarkMode ? copy.lightMode : copy.darkMode}
          </button>
        </div>

        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="timer-heading">{copy.title}</h1>
        <p className="intro">{copy.intro}</p>

        <div className="timer-display" aria-label={copy.eyeRestAria.replace("{minutes}", String(eyeRestMinutes)).replace("{seconds}", String(eyeRestSeconds))}>
          <span>{eyeRestTimerLabel}</span>
          <small>{copy.timerCaption}</small>
        </div>

        <p className="movement-timer" aria-live="polite">
          <span>{copy.moveIn}</span> <strong>{movementTimerLabel}</strong>
        </p>

        <p className="notification-status" aria-live="polite">{notificationStatus}</p>

        <section className="notification-center" aria-labelledby="notification-center-heading">
          <div className="notification-center-header">
            <h2 id="notification-center-heading">{copy.notificationCenterTitle}</h2>
            {notificationHistory.length > 0 && (
              <button className="notification-clear-button" type="button" onClick={() => setNotificationHistory([])}>
                {copy.clearNotifications}
              </button>
            )}
          </div>
          {notificationHistory.length === 0 ? (
            <p className="notification-empty">{copy.notificationCenterEmpty}</p>
          ) : (
            <ol className="notification-list">
              {notificationHistory.map((message) => (
                <li className="notification-item" key={message.id}>
                  <label className="notification-check">
                    <input
                      type="checkbox"
                      checked={message.isChecked}
                      onChange={() => toggleNotificationMessage(message.id)}
                      aria-label={message.title}
                    />
                    <span>
                      <time dateTime={message.sentAt.toISOString()}>{message.sentAt.toLocaleTimeString(locale)}</time>
                      <strong>{message.title}</strong>
                      <p>{message.body}</p>
                    </span>
                  </label>
                </li>
              ))}
            </ol>
          )}
        </section>

        {isEyeRestPending && !isEyeRestActive && (
          <article className="pending-eye-rest-card" aria-live="assertive">
            <p>{copy.pendingEyeRest}</p>
            <button className="inline-action-button" type="button" onClick={() => startActiveEyeRest()}>
              {copy.startEyeRest}
            </button>
          </article>
        )}

        {latestMovementReminder && (
          <article className="movement-reminder-card" aria-live="polite">
            <h2>{getLocalizedText(latestMovementReminder.title, locale)}</h2>
            <p>{getLocalizedText(latestMovementReminder.body, locale)}</p>
            <button
              className="inline-action-button"
              type="button"
              onClick={getNextMovementReminder}
            >
              {copy.anotherMovementReminder}
            </button>
          </article>
        )}

        {(isEyeRestActive || activeEyeRestSecondsRemaining < EYE_REST_DURATION_SECONDS) && (
          <p className="active-rest-timer" aria-live="polite">
            {copy.activeRest} <strong>{activeEyeRestTimerLabel}</strong>
          </p>
        )}

        <button className="timer-button" type="button" onClick={handleTimerToggle}>
          {isRunning ? copy.pauseTimers : eyeRestSecondsRemaining === TIMER_DURATION_SECONDS && movementSecondsRemaining === MOVEMENT_REMINDER_DURATION_SECONDS ? copy.startTimer : copy.resumeTimers}
        </button>
        <button className="reset-button" type="button" onClick={handleReset} disabled={eyeRestSecondsRemaining === TIMER_DURATION_SECONDS && movementSecondsRemaining === MOVEMENT_REMINDER_DURATION_SECONDS && !isRunning}>
          {copy.reset}
        </button>

        <p className="status" aria-live="polite">
          {isRunning ? copy.bothRemindersRunning : copy.pausedStatus}
        </p>
      </section>
    </main>
  );
}
