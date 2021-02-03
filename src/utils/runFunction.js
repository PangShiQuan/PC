function runFunction(name, args) {
  var fn = window[name];
  if (typeof fn !== 'function') return;

  fn.apply(window, args);
}
