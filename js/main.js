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
  btn.addEventListener('click', () => sendAndRefresh({ effect: btn.dataset.effect }));
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