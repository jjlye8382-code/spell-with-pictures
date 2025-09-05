// Basic meeting recorder logic

const recordView = document.getElementById('view-record');
const historyView = document.getElementById('view-history');
const navRecord = document.getElementById('nav-record');
const navHistory = document.getElementById('nav-history');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const transcriptEl = document.getElementById('transcript');
const statusEl = document.getElementById('status');
const langSelect = document.getElementById('lang');
const meetingList = document.getElementById('meeting-list');
const searchInput = document.getElementById('search');
const summarySection = document.getElementById('summary');
const summaryText = document.getElementById('summary-text');
const actionList = document.getElementById('action-list');
const exportBtn = document.getElementById('export-btn');
const shareBtn = document.getElementById('share-btn');

let mediaRecorder;
let chunks = [];
let recognition;
let currentTranscript = '';
let meetingTitle = '';

// Navigation
navRecord.onclick = () => {
  recordView.hidden = false;
  historyView.hidden = true;
};
navHistory.onclick = () => {
  recordView.hidden = true;
  historyView.hidden = false;
  loadMeetings();
};

// Audio recording setup
async function initRecorder() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = e => chunks.push(e.data);
  mediaRecorder.onstop = handleStop;
}

function startRecording() {
  if (!mediaRecorder) return;
  chunks = [];
  mediaRecorder.start();
  statusEl.textContent = 'Recording';
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  stopBtn.disabled = false;
  startRecognition();
}

function pauseRecording() {
  if (mediaRecorder.state === 'recording') {
    mediaRecorder.pause();
    recognition.stop();
    statusEl.textContent = 'Paused';
  } else {
    mediaRecorder.resume();
    startRecognition();
    statusEl.textContent = 'Recording';
  }
}

function stopRecording() {
  mediaRecorder.stop();
  recognition.stop();
  statusEl.textContent = 'Processing';
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;
}

async function handleStop() {
  const blob = new Blob(chunks, { type: 'audio/webm' });
  const url = URL.createObjectURL(blob);

  meetingTitle = prompt('Meeting title', new Date().toLocaleString()) || 'Untitled';
  const id = Date.now();
  const meeting = {
    id,
    title: meetingTitle,
    language: langSelect.value,
    audioUrl: url,
    transcript: currentTranscript,
    summary: await summarise(currentTranscript),
    actions: await generateActions(currentTranscript)
  };
  saveMeeting(meeting);
  showSummary(meeting);
}

startBtn.onclick = () => startRecording();
pauseBtn.onclick = () => pauseRecording();
stopBtn.onclick = () => stopRecording();

// Speech recognition
function startRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    transcriptEl.textContent = 'Speech recognition not supported.';
    return;
  }
  recognition = new SR();
  recognition.lang = langSelect.value;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = e => {
    let text = '';
    for (let i = 0; i < e.results.length; i++) {
      text += e.results[i][0].transcript;
    }
    transcriptEl.textContent = text;
    currentTranscript = text;
  };
  recognition.onerror = e => console.error(e);
  recognition.start();
}

// AI summarisation placeholder
async function summarise(text) {
  if (window.zai && window.zai.summarise) {
    return await window.zai.summarise(text);
  }
  return 'Summary placeholder.';
}

// Action plan generation placeholder
async function generateActions(text) {
  return [
    { task: 'Follow up', assignee: 'TBD', due: null }
  ];
}

function showSummary(meeting) {
  summarySection.hidden = false;
  summaryText.textContent = meeting.summary;
  actionList.innerHTML = '';
  meeting.actions.forEach(a => {
    const li = document.createElement('li');
    li.textContent = `${a.task} (${a.assignee || 'unassigned'})`;
    actionList.appendChild(li);
  });

  exportBtn.onclick = () => exportMeeting(meeting);
  shareBtn.onclick = () => shareMeeting(meeting);
}

// Storage
function saveMeeting(meeting) {
  const meetings = JSON.parse(localStorage.getItem('meetings') || '[]');
  meetings.push(meeting);
  localStorage.setItem('meetings', JSON.stringify(meetings));
}

function loadMeetings() {
  const meetings = JSON.parse(localStorage.getItem('meetings') || '[]');
  const q = searchInput.value.toLowerCase();
  meetingList.innerHTML = '';
  meetings.filter(m => m.title.toLowerCase().includes(q)).forEach(m => {
    const li = document.createElement('li');
    li.textContent = m.title;
    li.onclick = () => playMeeting(m);
    meetingList.appendChild(li);
  });
}

searchInput.oninput = loadMeetings;

function playMeeting(meeting) {
  const audio = new Audio(meeting.audioUrl);
  let index = 0;
  audio.ontimeupdate = () => {
    // simple highlight by time proportion
    const progress = audio.currentTime / audio.duration;
    const chars = Math.floor(progress * meeting.transcript.length);
    transcriptEl.textContent = meeting.transcript.slice(0, chars);
  };
  audio.play();
  showSummary(meeting);
}

function exportMeeting(meeting) {
  const data = JSON.stringify(meeting, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${meeting.title}.json`;
  a.click();
}

function shareMeeting(meeting) {
  if (navigator.share) {
    navigator.share({
      title: meeting.title,
      text: meeting.summary,
      url: meeting.audioUrl
    }).catch(err => console.error(err));
  } else {
    alert('Web Share API not supported');
  }
}

// Init
initRecorder();
