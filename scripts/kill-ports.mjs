/**
 * Frees ports 3000, 24678, 24679 before the dev server starts.
 * Works on Windows (PowerShell) and Unix (lsof/fuser).
 */
import { execSync } from 'child_process';
import os from 'os';

const PORTS = [3000, 24678, 24679];
const isWindows = os.platform() === 'win32';

for (const port of PORTS) {
  try {
    if (isWindows) {
      // Get PIDs listening on the port, then kill them
      const result = execSync(
        `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"`,
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      ).trim();

      const pids = [...new Set(result.split(/\r?\n/).map(Number).filter(Boolean))];
      for (const pid of pids) {
        try {
          execSync(
            `powershell -NoProfile -Command "Stop-Process -Id ${pid} -Force -ErrorAction SilentlyContinue"`,
            { stdio: 'ignore' }
          );
          console.log(`[predev] Killed process ${pid} on port ${port}`);
        } catch { /* already gone */ }
      }
    } else {
      execSync(`fuser -k ${port}/tcp 2>/dev/null || true`, { stdio: 'ignore' });
      console.log(`[predev] Freed port ${port}`);
    }
  } catch { /* port was already free */ }
}
