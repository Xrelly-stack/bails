import { Mutex } from 'async-mutex';
import { rmSync } from 'node:fs';
import { mkdir, readFile, rename, rm, stat, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { proto } from '../../WAProto/compiler.js';
import { initAuthCreds } from './auth-utils.js';
import { BufferJSON } from './generics.js';
const fileLocks = new Map();
const folderLocks = new Map();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const acquireFolderLock = async folder => {
  if (folderLocks.has(folder)) return;
  const lockPath = join(folder, '.auth-state.lock');
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      await writeFile(lockPath, JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }), { encoding: 'utf8', flag: 'wx', mode: 0o600 });
      folderLocks.set(folder, lockPath);
      process.once('exit', () => {
        try { rmSync(lockPath, { force: true }); } catch {}
      });
      return;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      try {
        const info = await stat(lockPath);
        if (Date.now() - info.mtimeMs > 300000) {
          await rm(lockPath, { force: true });
          continue;
        }
      } catch {}
      await sleep(Math.min(250 + attempt * 100, 2000));
    }
  }
  throw new Error(`auth state sedang dipakai proses lain: ${folder}`);
};
const getFileLock = path => {
  let mutex = fileLocks.get(path);
  if (!mutex) {
    mutex = new Mutex();
    fileLocks.set(path, mutex);
  }
  return mutex;
};
export const useMultiFileAuthState = async folder => {
  const writeData = async (data, file) => {
    const filePath = join(folder, fixFileName(file));
    const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    const mutex = getFileLock(filePath);
    return mutex.acquire().then(async release => {
      try {
        await writeFile(tempPath, JSON.stringify(data, BufferJSON.replacer), { encoding: 'utf8', mode: 0o600 });
        await rename(tempPath, filePath);
      } finally {
        await rm(tempPath, { force: true }).catch(() => {});
        release();
      }
    });
  };
  const readData = async file => {
    const filePath = join(folder, fixFileName(file));
    const mutex = getFileLock(filePath);
    try {
      return await mutex.acquire().then(async release => {
        try {
          const data = await readFile(filePath, { encoding: 'utf-8' });
          try {
            return JSON.parse(data, BufferJSON.reviver);
          } catch (error) {
            throw new Error(`auth state JSON rusak pada ${filePath}: ${error.message}`);
          }
        } finally {
          release();
        }
      });
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  };
  const removeData = async file => {
    try {
      const filePath = join(folder, fixFileName(file));
      const mutex = getFileLock(filePath);
      return mutex.acquire().then(async release => {
        try {
          await unlink(filePath);
        } catch {} finally {
          release();
        }
      });
    } catch {}
  };
  const folderInfo = await stat(folder).catch(() => {});
  if (folderInfo) {
    if (!folderInfo.isDirectory()) {
      throw new Error(`found something that is not a directory at ${folder}, either delete it or specify a different location`);
    }
  } else {
    await mkdir(folder, {
      recursive: true,
      mode: 0o700
    });
  }
  await acquireFolderLock(folder);
  const fixFileName = file => file?.replace(/\//g, '__')?.replace(/:/g, '-');
  const creds = (await readData('creds.json')) || initAuthCreds();
  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(ids.map(async id => {
            let value = await readData(`${type}-${id}.json`);
            if (type === 'app-state-sync-key' && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }
            data[id] = value;
          }));
          return data;
        },
        set: async data => {
          const tasks = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const file = `${category}-${id}.json`;
              tasks.push(value ? writeData(value, file) : removeData(file));
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: async () => {
      return writeData(creds, 'creds.json');
    }
  };
};
