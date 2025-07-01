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

// Создаём peer-соединение
const peer = new Peer();

peer.on("open", id => {
  myIdSpan.innerText = id;
  callControls.classList.remove("hidden");
});

// Получение входящего звонка
peer.on("call", call => {
  currentCall = call;
  incomingCallDiv.classList.remove("hidden");
  callControls.classList.add("hidden");
});

// Принятие звонка
acceptBtn.onclick = () => {
  if (localStream) {
    answerCall(localStream);
  } else {
    // Запрос разрешений после нажатия
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

// Отклонение звонка
declineBtn.onclick = () => {
  if (currentCall) {
    currentCall.close();
    currentCall = null;
  }
  incomingCallDiv.classList.add("hidden");
  callControls.classList.remove("hidden");
};

// Исходящий звонок
callBtn.onclick = () => {
  const peerId = peerIdInput.value.trim();
  if (!peerId) {
    alert("Введите ID собеседника");
    return;
  }

  // Запрос камеры/микрофона при исходящем вызове
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