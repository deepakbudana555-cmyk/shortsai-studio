const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn, fork } = require('child_process');
const fs = require('fs');

let mainWindow;
let pythonProcess;
let nextProcess;
const NEXT_PORT = 3000;

// Load environment variables from .env files
function loadEnv() {
  const envPaths = [
    // 1. Root folder in dev
    path.join(__dirname, '..', '.env.local'),
    path.join(__dirname, '..', '.env'),
    // 2. Executable root directory in production
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env'),
    // 3. App resources path in production
    path.join(process.resourcesPath, '.env.local'),
    path.join(process.resourcesPath, '.env'),
    // 4. User data folder
    path.join(app.getPath('userData'), '.env.local'),
    path.join(app.getPath('userData'), '.env')
  ];

  console.log('Searching for env files...');
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      console.log(`Loading env variables from: ${envPath}`);
      try {
        const fileContent = fs.readFileSync(envPath, 'utf8');
        const lines = fileContent.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const match = trimmed.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            process.env[key] = value;
          }
        }
      } catch (err) {
        console.error(`Failed to read env file: ${envPath}`, err);
      }
    }
  }
}

function startPythonBackend() {
  console.log('Starting Python backend...');
  const backendPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'backend', 'main.py')
    : path.join(__dirname, '..', 'backend', 'main.py');
    
  // Check for local virtual environment python
  let pythonBin = 'python';
  const venvPython = app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'venv', 'Scripts', 'python.exe')
    : path.join(__dirname, '..', 'backend', 'venv', 'Scripts', 'python.exe');
  
  if (fs.existsSync(venvPython)) {
    pythonBin = venvPython;
    console.log(`Detected virtual environment Python: ${pythonBin}`);
  } else {
    const venvPythonUnix = app.isPackaged
      ? path.join(process.resourcesPath, 'backend', 'venv', 'bin', 'python')
      : path.join(__dirname, '..', 'backend', 'venv', 'bin', 'python');
    if (fs.existsSync(venvPythonUnix)) {
      pythonBin = venvPythonUnix;
      console.log(`Detected Unix virtual environment Python: ${pythonBin}`);
    }
  }

  pythonProcess = spawn(pythonBin, [backendPath], {
    cwd: app.isPackaged ? process.resourcesPath : path.join(__dirname, '..'),
    shell: true,
  });

  pythonProcess.stdout.on('data', (data) => console.log(`Python: ${data.toString()}`));
  pythonProcess.stderr.on('data', (data) => console.error(`Python Error: ${data.toString()}`));
}

function startNextJs() {
  if (app.isPackaged) {
    console.log('Starting packaged Next.js server...');
    const serverPath = path.join(__dirname, '..', '.next', 'standalone', 'server.js');
    const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
    
    // Set up the environment for the standalone server
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      PORT: NEXT_PORT.toString(),
      HOSTNAME: '127.0.0.1'
    };

    // Critical: set cwd to the standalone directory so Next.js resolves public/ and .next/static/ correctly
    nextProcess = fork(serverPath, [], { 
      cwd: standaloneDir,
      env, 
      stdio: 'pipe' 
    });

    if (nextProcess.stdout) {
      nextProcess.stdout.on('data', (data) => console.log(`Next.js: ${data.toString()}`));
    }
    if (nextProcess.stderr) {
      nextProcess.stderr.on('data', (data) => console.error(`Next.js Error: ${data.toString()}`));
    }
  } else {
    // In dev mode, concurrently handles Next.js startup
    console.log('Using Next.js dev server...');
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'ShortsAI Studio',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const appUrl = `http://localhost:${NEXT_PORT}/dashboard`;
  
  // Try loading until the server is ready
  const loadWithRetry = () => {
    mainWindow.loadURL(appUrl).catch((err) => {
      console.log('Waiting for Next.js server to be ready...');
      setTimeout(loadWithRetry, 1000);
    });
  };
  
  loadWithRetry();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  loadEnv();
  startPythonBackend();
  startNextJs();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (pythonProcess) {
    console.log('Killing Python backend...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', pythonProcess.pid, '/t', '/f']);
    } else {
      pythonProcess.kill();
    }
  }
  if (nextProcess) {
    nextProcess.kill();
  }
});
