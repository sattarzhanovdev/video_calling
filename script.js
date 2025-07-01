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

// ✅ Подключение к публичному PeerJS серверу (стабильному)
const peer = new Peer(undefined, {
  host: '0.peerjs.com',
  port: 443,
  path: '/',
  secure: true,
});

peer.on("open", id => {
  myIdSpan.innerText = id;
  callControls.classList.remove("hidden");
});

// 📞 Входящий звонок
peer.on("call", call => {
  currentCall = call;
  incomingCallDiv.classList.remove("hidden");
  callControls.classList.add("hidden");
});

// ✅ Принять звонок
acceptBtn.onclick = () => {
  if (localStream) {
    answerCall(localStream);
  } else {
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: true
    }).then(stream => {
      localStream = stream;
      localVideo.srcObject = stream;
      answerCall(stream);
    }).catch(err => {
      alert("Ошибка доступа к камере/микрофону: " + err.message);
    });
  }
};

function answerCall(stream) {
  currentCall.answer(stream);
  currentCall.on("stream", remoteStream => {
    remoteVideo.srcObject = remoteStream;
  });
  incomingCallDiv.classList.add("hidden");
}

// ❌ Отклонить звонок
declineBtn.onclick = () => {
  if (currentCall) {
    currentCall.close();
    currentCall = null;
  }
  incomingCallDiv.classList.add("hidden");
  callControls.classList.remove("hidden");
};

// 📤 Сделать звонок
callBtn.onclick = () => {
  const peerId = peerIdInput.value.trim();
  if (!peerId) {
    alert("Введите ID собеседника");
    return;
  }

  if (localStream) {
    makeCall(peerId, localStream);
  } else {
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: true
    }).then(stream => {
      localStream = stream;
      localVideo.srcObject = stream;
      makeCall(peerId, stream);
    }).catch(err => {
      alert("Ошибка доступа к камере/микрофону: " + err.message);
    });
  }
};

function makeCall(peerId, stream) {
  const call = peer.call(peerId, stream);
  call.on("stream", remoteStream => {
    remoteVideo.srcObject = remoteStream;
  });
  callControls.classList.add("hidden");
}