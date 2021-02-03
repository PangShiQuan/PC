if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function forEach(callback, thisArg) {
    const arg = thisArg || window;

    for (let i = 0; i < this.length; i++) {
      callback.call(arg, this[i], i, this);
    }
  };
}
