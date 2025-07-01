const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const myIdSpan = document.getElementById("my-id");
const peerIdInput = document.getElementById("peer-id");
const incomingCallDiv = document.getElementById("incoming-call");
const callControls = document.getElementById("call-controls");
const acceptBtn = document.getElementById("acceptBtn");
const declineBtn = document.getElementById("declineBtn");
const callBtn = document.getElementById("callBtn");

let localStream;
let currentCall = null;

navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  },
  audio: true
}).then(stream => {
  localVideo.srcObject = stream;
  localStream = stream;
  callControls.classList.remove("hidden");
}).catch(err => {
  alert("Ошибка доступа к камере/микрофону: " + err.message);
});

const peer = new Peer();

peer.on("open", id => {
  myIdSpan.innerText = id;
});

// Когда приходит звонок
peer.on("call", call => {
  currentCall = call;
  incomingCallDiv.classList.remove("hidden");
  callControls.classList.add("hidden");
});

// Нажатие "Принять"
acceptBtn.onclick = () => {
  if (currentCall && localStream) {
    currentCall.answer(localStream);
    currentCall.on("stream", remoteStream => {
      remoteVideo.srcObject = remoteStream;
    });
    incomingCallDiv.classList.add("hidden");
    callControls.classList.add("hidden");
  }
};

// Нажатие "Отклонить"
declineBtn.onclick = () => {
  if (currentCall) {
    currentCall.close();
    currentCall = null;
  }
  incomingCallDiv.classList.add("hidden");
  callControls.classList.remove("hidden");
};

// Нажатие "Позвонить"
callBtn.onclick = () => {
  const peerId = peerIdInput.value.trim();
  if (!peerId) {
    alert("Введите ID собеседника");
    return;
  }
  const call = peer.call(peerId, localStream);
  call.on("stream", remoteStream => {
    remoteVideo.srcObject = remoteStream;
  });
  callControls.classList.add("hidden");
};