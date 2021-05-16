function setInLocalStorage(key, value) {
  localStorage.setItem(key, value);
}
function getFromLocalStorage(key) {
  return localStorage.getItem(key);
}
function removeFromLocalStorage(key) {
    localStorage.removeItem(key);
}

export {
  setInLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
};
