export function saveObjectToLocalStorage(key: string, object: any) {
    localStorage.setItem(key, JSON.stringify(object));
};