let port, writer, reader;

async function sendCommand(obj) {
  const encoder = new TextEncoder();
  await writer.write(encoder.encode(JSON.stringify(obj) + '\n'));
}

async function readLine() {
  const decoder = new TextDecoder();
  const { value } = await reader.read();
  return decoder.decode(value);
}

async function sendAndRefresh(obj) {
  try {
    await sendCommand(obj);
    await readLine();
    await sendCommand({ cmd: "get_status" });
    const status = await readLine();
    document.getElementById('output').textContent = status;
  } 
  catch (err) {
    handleDisconnect('Connection lost: ' + err);
  }
}

function handleDisconnect(message) {
  document.getElementById('connectionStatus').textContent = message;
  document.querySelectorAll('.effectBtn').forEach(btn => btn.disabled = true);
  document.getElementById('brightnessSlider').disabled = true;
  document.getElementById('disconnectBtn').disabled = true;
}

const ledPreview = document.getElementById('ledPreview');
const ledDivs = [];
for (let i = 0; i < 16; i++) {
  const div = document.createElement('div');
  div.style.width = '20px';
  div.style.height = '20px';
  div.style.borderRadius = '50%';
  div.style.background = '#333';
  ledPreview.appendChild(div);
  ledDivs.push(div);
}

let animationFrame;
function stopAnimation() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
}

function simulateSteady() {
  stopAnimation();
  ledDivs.forEach(div => div.style.background = 'rgb(255,120,0)');
}

function simulateWave() {
  stopAnimation();
  let t = 0;
  function frame() {
    ledDivs.forEach((div, i) => {
      const brightness = (Math.sin(t + i * 0.4) + 1) / 2;
      const val = Math.floor(brightness * 255);
      div.style.background = `rgb(${val}, ${Math.floor(val * 0.47)}, 0)`;
    });
    t += 0.15;
    animationFrame = requestAnimationFrame(frame);
  }
  frame();
}

function simulatePulse() {
  stopAnimation();
  let on = true;
  function frame() {
    ledDivs.forEach(div => div.style.background = on ? 'rgb(255,120,0)' : '#333');
    on = !on;
    setTimeout(() => { animationFrame = requestAnimationFrame(frame); }, 150);
  }
  frame();
}

document.getElementById('connectBtn').addEventListener('click', async () => {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    writer = port.writable.getWriter();
    reader = port.readable.getReader();
    document.getElementById('connectionStatus').textContent = 'Connected';
    document.querySelectorAll('.effectBtn').forEach(btn => btn.disabled = false);
    document.getElementById('brightnessSlider').disabled = false;
    document.getElementById('disconnectBtn').disabled = false;
  } 
  catch (err) {
    document.getElementById('connectionStatus').textContent = 'Connection failed: ' + err;
  }
});

document.querySelectorAll('.effectBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.effectBtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    sendAndRefresh({ effect: btn.dataset.effect });
    if (btn.dataset.effect === 'Steady') simulateSteady();
    if (btn.dataset.effect === 'Wave') simulateWave();
    if (btn.dataset.effect === 'Pulse') simulatePulse();
  });
});

document.getElementById('brightnessSlider').addEventListener('change', () => {
  const val = parseInt(document.getElementById('brightnessSlider').value);
  document.getElementById('brightnessValue').textContent = val;
  sendAndRefresh({ brightness: val });
});

document.getElementById('disconnectBtn').addEventListener('click', async () => {
  try {
    await reader.cancel();
    await writer.close();
    await port.close();
  } 
  catch (err) {
    console.error(err);
  }
  handleDisconnect('Not connected');
});

