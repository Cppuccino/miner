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

  document.querySelector('.uptime').textContent = data.uptime;
  document.getElementById('version').innerHTML = `v${data.ver}`;

  const tbody = document.querySelector('#stats-table tbody');
  tbody.innerHTML = '';
  data.gpus.forEach(gpu => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${gpu.id}</td>
          <td>${(gpu.hs / 1e6).toFixed(2)} MH/s</td>
          <td>${gpu.temp}°C</td>
          <td>${gpu.fan}%</td>
          <td>${gpu.power} W</td>
          <td>${gpu.shares.valid}/${gpu.shares.invalid}</td>
      `;
      tbody.appendChild(tr);
  });
}

async function pauseMiner() {
  if (isBusy) return;

  isBusy = true;
  updateButton(true);

  try {
    const response = await fetch('http://localhost:8080/api/miner/pause');

    if (!response.ok)
      throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    console.log(data);
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
