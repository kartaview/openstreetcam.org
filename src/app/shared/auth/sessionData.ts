export class SessionData {
  storage: Storage = localStorage;
  name: string;

  construct(storage?: Storage) {
    if (storage) {
      this.storage = storage;
    }
  }

  setStorage(storage: Storage) {
    this.storage = storage;
  }

  getStorage() {
    return this.storage;
  }

  set(key: string, value: string) {
    this.storage.setItem(key, value);
  }

  get(key: string) {
    return this.storage.getItem(key);
  }

  unset(key: string) {
    this.storage.removeItem(key);
  }

  clear() {
    this.storage.clear();
  }

}
