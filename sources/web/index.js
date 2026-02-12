let isPaused = false;
let isBusy = false;

function secondsToHMS(secs) {
    secs = Math.max(0, parseInt(secs) || 0);
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h}h ${m}m ${s}s`;
}

function updateButton(loading) {
  const btn = document.querySelector('.pause-btn');

  if (loading) {
    btn.textContent = "Processing...";
    btn.disabled = true;
    return;
  }

  btn.disabled = false;
  btn.textContent = isPaused ? "Resume" : "Pause";
}


async function fetchStatsAndDisplay() {
  const res = await fetch('http://127.0.0.1:8080/api/miner/status');
  const data = await res.json();

  isPaused = data.paused;
  updateButton(false);

  document.querySelector('.uptime').textContent = formatUptime(data.uptime);
  document.querySelector('.ver').textContent = `v${data.version}`;

  const tbody = document.querySelector('#stats-table tbody');
  tbody.innerHTML = '';
  data.gpus.forEach(gpu => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${gpu.name}</td>
          <td>${(gpu.hashrate / 1e6).toFixed(2)} MH/s</td>
          <td>${gpu.temperature}°C</td>
          <td>${gpu.fan}%</td>
          <td>${gpu.power} W</td>
          <td>${gpu.shares.accepted}/${gpu.shares.rejected}</td>
      `;
      tbody.appendChild(tr);
  });
}

async function pauseMiner() {
  if (isBusy) return;

  isBusy = true;
  updateButton(true);

  try {
    const response = await fetch('http://127.0.0.1:8080/api/miner/pause', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paused: !isPaused })
    });

    if (!response.ok)
      throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    isPaused = data.paused;
    updateButton(false);

  } catch (error) {
    document.querySelector('.updated').textContent =
      'Failed to change miner state';
    updateButton(false);
  }

  isBusy = false;
}


fetchStatsAndDisplay();
setInterval(fetchStatsAndDisplay, 5000);
