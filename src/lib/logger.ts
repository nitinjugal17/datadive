
import fs from 'fs/promises';
import path from 'path';

const LOGS_DIR = path.join(process.cwd(), 'logs');

async function ensureLogsDirExists() {
  try {
    await fs.access(LOGS_DIR);
  } catch {
    await fs.mkdir(LOGS_DIR, { recursive: true });
  }
}

function getLogFilePath() {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(LOGS_DIR, `${date}.log`);
}

export async function logError(message: string, error?: any) {
  await ensureLogsDirExists();
  const filePath = getLogFilePath();
  const timestamp = new Date().toISOString();
  let logMessage = `${timestamp} - ERROR - ${message}\n`;
  if (error) {
    logMessage += `Details: ${error instanceof Error ? error.stack : JSON.stringify(error)}\n`;
  }
  logMessage += '--------------------------------------------------\n';

  try {
    await fs.appendFile(filePath, logMessage, 'utf-8');
  } catch (writeError) {
    console.error('FATAL: Could not write to log file.', writeError);
    console.error('Original error:', message, error);
  }
}

export async function logInfo(message: string) {
    await ensureLogsDirExists();
    const filePath = getLogFilePath();
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - INFO - ${message}\n`;

    try {
        await fs.appendFile(filePath, logMessage, 'utf-8');
    } catch (writeError) {
        console.error('FATAL: Could not write to log file.', writeError);
        console.error('Original info message:', message);
    }
}
