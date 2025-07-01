const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const myIdSpan = document.getElementById("my-id");
const peerIdInput = document.getElementById("peer-id");
const incomingCallDiv = document.getElementById("incoming-call");
const callControls = document.getElementById("call-controls");
const acceptBtn = document.getElementById("acceptBtn");
const declineBtn = document.getElementById("declineBtn");
const callBtn = document.getElementById("callBtn");

let localStream = null;
let currentCall = null;

// ✅ Подключение к рабочему PeerJS-серверу
const peer = new Peer(undefined, {
  host: '0.peerjs.com',
  port: 443,
  path: '/',
  secure: true
});

peer.on("open", id => {
  console.log("My peer ID:", id);
  myIdSpan.innerText = id;
  callControls.classList.remove("hidden");
});

// 📥 Входящий звонок
peer.on("call", call => {
  console.log("📥 Incoming call from", call.peer);
  currentCall = call;
  incomingCallDiv.classList.remove("hidden");
  callControls.classList.add("hidden");
});

// ✅ Принять звонок
acceptBtn.onclick = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    localVideo.srcObject = localStream;
    currentCall.answer(localStream);
    currentCall.on("stream", remoteStream => {
      console.log("📡 Получен поток собеседника");
      remoteVideo.srcObject = remoteStream;
    });
    currentCall.on("close", () => {
      console.log("🔕 Вызов завершён");
    });
    incomingCallDiv.classList.add("hidden");
  } catch (err) {
    alert("Ошибка доступа к камере/микрофону: " + err.message);
  }
};

// ❌ Отклонить
declineBtn.onclick = () => {
  if (currentCall) currentCall.close();
  incomingCallDiv.classList.add("hidden");
  callControls.classList.remove("hidden");
};

// 📤 Исходящий звонок
callBtn.onclick = async () => {
  const peerId = peerIdInput.value.trim();
  if (!peerId) return alert("Введите ID");

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    localVideo.srcObject = localStream;

    const call = peer.call(peerId, localStream);
    currentCall = call;

    call.on("stream", remoteStream => {
      console.log("📡 Получен поток собеседника");
      remoteVideo.srcObject = remoteStream;
    });

    call.on("error", err => {
      console.error("Ошибка вызова:", err);
    });

    call.on("close", () => {
      console.log("🔕 Вызов завершён");
    });

    callControls.classList.add("hidden");
  } catch (err) {
    alert("Ошибка доступа к камере/микрофону: " + err.message);
  }
};