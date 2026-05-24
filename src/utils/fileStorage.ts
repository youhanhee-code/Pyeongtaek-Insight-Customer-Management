// Simple IndexedDB wrapper for persisting uploaded files locally in the browser
const DB_NAME = 'real_estate_crm_files_db';
const STORE_NAME = 'files_store';
const DB_VERSION = 1;

interface FileData {
  key: string;       // customerId##fileName
  blob: Blob;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('IndexedDB could not be opened'));
    };

    request.onsuccess = (e) => {
      resolve((e.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Stores a file blob in IndexedDB
 */
export async function storeFileBlob(customerId: string, fileName: string, file: File | Blob): Promise<void> {
  try {
    const db = await getDB();
    const key = `${customerId}##${fileName}`;
    const fileData: FileData = {
      key,
      blob: file,
      name: file instanceof File ? file.name : fileName,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(fileData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to store file blob in IndexedDB:', err);
  }
}

/**
 * Retrieves a file blob from IndexedDB
 */
export async function getFileBlob(customerId: string, fileName: string): Promise<FileData | null> {
  try {
    const db = await getDB();
    const key = `${customerId}##${fileName}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get file blob from IndexedDB:', err);
    return null;
  }
}

/**
 * Deletes a file blob from IndexedDB
 */
export async function deleteFileBlob(customerId: string, fileName: string): Promise<void> {
  try {
    const db = await getDB();
    const key = `${customerId}##${fileName}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to delete file blob from IndexedDB:', err);
  }
}
