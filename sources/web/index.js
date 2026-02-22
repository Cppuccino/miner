let isPaused = false;
let isBusy = false;

function formatUptime(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (days > 0) {
    return `${days}d ${hh}:${mm}:${ss}`;
  }

  return `${hh}:${mm}:${ss}`;
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
  document.getElementById('version').innerHTML = `v${data.ver}`;
  let totalHashRate = 0;
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
      totalHashRate = totalHashRate + (gpu.hs / 1e6);
      tbody.appendChild(tr);
  });
  document.getElementsByClassName('total-hashrate')[0].innerHTML = `${totalHashRate.toFixed(2)} MH/s`;
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
