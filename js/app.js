// Gestione delle Tabs
const tabLinks = document.querySelectorAll('.tab-link');
const tabs = document.querySelectorAll('.tab');

tabLinks.forEach(link => {
  link.addEventListener('click', () => {
    // Rimuovi la classe active da tutti i link
    tabLinks.forEach(btn => btn.classList.remove('active'));
    // Aggiungi la classe active al link cliccato
    link.classList.add('active');

    // Nascondi tutte le tabs
    tabs.forEach(tab => tab.classList.remove('active'));
    // Mostra la tab corrispondente
    const activeTab = document.getElementById(link.getAttribute('data-tab'));
    activeTab.classList.add('active');
  });
});

// Codice esistente del Cetriolo Timer
// Riferimenti a elementi del DOM
const timeDisplay = document.getElementById('timeDisplay');
const modeText = document.getElementById('modeText');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const breakBtn = document.getElementById('breakBtn');
const themeSwitch = document.getElementById('themeSwitch');
const cupContainer = document.getElementById('cupContainer');
const alarmSound = document.getElementById('alarmSound');
const totalStudiedTimeDisplay = document.getElementById('totalStudiedTimeDisplay');
const resetTotalBtn = document.getElementById('resetTotalBtn');
const goalInput = document.getElementById('goalInput');
const goalRange = document.getElementById('goalRange');
const progressBar = document.getElementById('progressBar');
const muteBtn = document.getElementById('muteBtn');
const goalTimeDisplay = document.getElementById('goalTimeDisplay');

// Variabili di stato
let timerInterval = null;
let totalSeconds = 0;         // Tempo accumulato per la sessione di studio corrente
let breakSeconds = 0;         // Tempo di pausa (countdown)
let totalStudiedTime = 0;     // Tempo di studio totale accumulato
let isBreak = false;          // Flag: siamo in pausa o no?
let isRunning = false;        // Flag: il timer sta scorrendo?
let isPaused = false;         // Flag: siamo in pausa (studio) o no?
let isMuted = false;          // Flag: allarme silenziato

// Funzione per formattare i secondi in mm:ss
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, '0') + ":" + String(s).padStart(2, '0');
}

// Funzione per formattare i minuti in hh:mm
function formatMinutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m < 10 ? '0' : ''}${m}`;
}

// Aggiorna il display e il titolo (document.title)
function updateDisplay() {
  let currentTime;
  if (!isBreak) {
    currentTime = formatTime(totalSeconds);
    timeDisplay.textContent = currentTime;
    // Aggiorna anche il titolo della pagina
    document.title = `Timer ${currentTime}`;
  } else {
    currentTime = formatTime(breakSeconds);
    timeDisplay.textContent = currentTime;
    document.title = `Break ${currentTime}`;
  }
}

// Aggiorna il display del tempo totale studiato
function updateTotalStudiedTimeDisplay() {
  totalStudiedTimeDisplay.textContent =
    "Total Study Time: " + formatTime(totalStudiedTime);
}

// Aggiorna la barra di progresso
function updateProgressBar() {
  const goalMinutes = parseInt(goalInput.value, 10);
  const goalSeconds = goalMinutes * 60;
  const percentage = goalSeconds > 0 ? Math.min((totalStudiedTime / goalSeconds) * 100, 100) : 0;
  progressBar.style.width = percentage + '%';
}

// Funzione per avviare il timer
function startTimer() {
  if (isRunning) return; // se sta già andando, non fa nulla

  isRunning = true;
  isPaused = false;
  
  timerInterval = setInterval(() => {
    if (!isBreak) {
      // Modalità studio: contiamo in avanti
      totalSeconds++;
      updateDisplay();
    } else {
      // Modalità pausa: contiamo alla rovescia
      if (breakSeconds > 0) {
        breakSeconds--;
        updateDisplay();
      } else {
        // La pausa è finita
        clearInterval(timerInterval);
        isRunning = false;
        // Suoniamo il suono se non è mutato e togliamo la GIF
        if (!isMuted) {
          alarmSound.play();
        }
        cupContainer.style.display = 'none';

        // Torniamo in modalità studio
        isBreak = false;
        modeText.textContent = 'Timer';
        // Reset timer a 0 e ripartiamo in automatico
        totalSeconds = 0;
        updateDisplay();
        startTimer(); // riparte lo studio
        return;
      }
    }
  }, 1000);
}

// Funzione per mettere in pausa (solo in modalità studio)
function pauseTimer() {
  if (isBreak) return; 
  if (!isRunning) return;

  isPaused = true;
  clearInterval(timerInterval);
  isRunning = false;
  isPaused = true;
}

// Funzione per resettare il timer a zero
function resetTimer() {
  // "Reset" qui azzera il cronometro a 00:00
  if (!isBreak) {
    totalSeconds = 0;
    updateDisplay();
  } else {
    breakSeconds = 0;
    updateDisplay();
  }
}

// Inizio pausa (Tea & Coffee)
function startBreak() {
  if (isBreak) return; // Evita di iniziare una pausa se già in pausa

  // Aggiungiamo il tempo di questa sessione al totale
  totalStudiedTime += totalSeconds;
  updateTotalStudiedTimeDisplay();
  updateProgressBar();

  // Calcoliamo la pausa: totalSeconds è in secondi, convertiamolo in minuti
  const studiedMinutes = Math.floor(totalSeconds / 60);
  let breakMinutes = Math.floor(studiedMinutes / 5);

  // Se breakMinutes è 0, forziamo almeno 1 min di pausa
  if (breakMinutes === 0) {
    breakMinutes = 1;
  }

  // Convertiamo i breakMinutes in secondi
  breakSeconds = breakMinutes * 60;
  
  // Cambiamo UI
  modeText.textContent = 'Relax';
  isBreak = true;
  updateDisplay();

  // Mostra la gif
  cupContainer.style.display = 'flex';

  // Stoppiamo se stava andando
  clearInterval(timerInterval);
  isRunning = false;

  // Avviamo di nuovo il timer in modalità pausa
  startTimer();
}

// Reset del Tempo Studiato Totale
function resetTotalStudiedTime() {
  totalStudiedTime = 0;
  updateTotalStudiedTimeDisplay();
  updateProgressBar();
}

// Funzione per silenziare/riattivare l'allarme
function toggleMute() {
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? 'Unmute Alarm' : 'Mute Alarm';
  muteBtn.classList.toggle('active', isMuted);
}

// Funzione per sincronizzare la rotella con l'input
function syncRangeToInput(value) {
  goalInput.value = value;
  goalTimeDisplay.textContent = formatMinutesToTime(value);
  updateProgressBar();
}

// Funzione per sincronizzare l'input con la rotella
function syncInputToRange(value) {
  goalRange.value = value;
  goalTimeDisplay.textContent = formatMinutesToTime(value);
  updateProgressBar();
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
breakBtn.addEventListener('click', startBreak);
resetTotalBtn.addEventListener('click', resetTotalStudiedTime);
muteBtn.addEventListener('click', toggleMute);

// Switch tema
themeSwitch.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeSwitch.classList.toggle('dark');
});

// Sincronizzazione Rotella -> Input
goalRange.addEventListener('input', (e) => {
  const value = parseInt(e.target.value, 10);
  syncRangeToInput(value);
});

// Sincronizzazione Input -> Rotella
goalInput.addEventListener('input', (e) => {
  let value = parseInt(e.target.value, 10);
  if (isNaN(value) || value < 1) {
    value = 1;
  } else if (value > 900) {
    value = 900;
  }
  syncInputToRange(value);
});

// Inizializza i display
syncRangeToInput(goalInput.value);
updateDisplay();
updateTotalStudiedTimeDisplay();
updateProgressBar();

// Codice per la sezione Statistiche
const statisticsButtons = document.querySelectorAll('.statistics-buttons button');
const statsChartCtx = document.getElementById('statsChart').getContext('2d');
let statsChart;

// Funzione per caricare e parse il CSV
async function loadCSVData() {
  try {
    // Adesso il file CSV è nella cartella data
    const response = await fetch('data/il_mio_CSV.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    const workbook = XLSX.read(csvText, { type: 'string' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    return jsonData;
  } catch (error) {
    console.error('Errore nel caricamento del CSV:', error);
    return [];
  }
}

// Funzione per ottenere i dati filtrati in base al periodo
function getFilteredData(data, period) {
  const today = new Date();
  let filteredData = [];

  if (period === 'week') {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = data.find(d => d.Data === dateStr);
      filteredData.push({
        label: date.toLocaleDateString('it-IT', { weekday: 'short' }),
        value: entry ? parseInt(entry.TempoStudiato) : 0
      });
    }
  } else if (period === 'month') {
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = data.find(d => d.Data === dateStr);
      filteredData.push({
        label: date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
        value: entry ? parseInt(entry.TempoStudiato) : 0
      });
    }
  } else if (period === 'year') {
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = date.toLocaleDateString('it-IT', { month: 'short' });
      const monthData = data.filter(d => {
        const dDate = new Date(d.Data);
        return dDate.getMonth() === date.getMonth() && dDate.getFullYear() === date.getFullYear();
      });
      const totalMinutes = monthData.reduce((sum, d) => sum + parseInt(d.TempoStudiato), 0);
      filteredData.push({
        label: monthStr,
        value: totalMinutes
      });
    }
  }

  const labels = filteredData.map(d => d.label);
  const dataValues = filteredData.map(d => d.value);

  return { labels, data: dataValues };
}

// Funzione per calcolare la media mobile
function calculateMovingAverage(data, windowSize = 3) {
  let ma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      ma.push(null); // Non sufficiente dati per la media
    } else {
      const window = data.slice(i - windowSize + 1, i + 1);
      const sum = window.reduce((a, b) => a + b, 0);
      ma.push(Math.round(sum / windowSize));
    }
  }
  return ma;
}

// Funzione per aggiornare il grafico con i dati reali
async function updateChartWithRealData(period) {
  const csvData = await loadCSVData();
  const filtered = getFilteredData(csvData, period);
  const movingAverage = calculateMovingAverage(filtered.data);

  // Rimuovere i valori null dalla media mobile per Chart.js
  const filteredMovingAverage = movingAverage.map(value => value !== null ? value : undefined);

  if (statsChart) {
    statsChart.destroy();
  }

  statsChart = new Chart(statsChartCtx, {
    type: 'bar',
    data: {
      labels: filtered.labels,
      datasets: [
        {
          label: 'Minuti Studiati',
          data: filtered.data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Media Mobile',
          data: filteredMovingAverage,
          type: 'line',
          fill: false,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          spanGaps: true
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Minuti'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Periodo'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
}

// Event listeners per i pulsanti delle statistiche
statisticsButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Rimuovi active da tutti i pulsanti
    statisticsButtons.forEach(btn => btn.classList.remove('active'));
    // Aggiungi active al pulsante cliccato
    button.classList.add('active');

    const period = button.getAttribute('data-period');
    updateChartWithRealData(period);
  });
});

// Inizializza con le statistiche settimanali
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.statistics-buttons button[data-period="week"]').click();
});


