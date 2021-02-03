const OptionsMap = {
  passive: false,
  capture: false,
  once: false,
};

const SupportMap = (function() {
  Object.keys(OptionsMap).forEach(k => {
    OptionsMap[k] = checkSupportForProperty(k);
  });

  return OptionsMap;
})();

function checkSupportForProperty(property) {
  if (OptionsMap[property]) {
    return OptionsMap[property];
  }

  try {
    const opts = Object.defineProperty({}, property, {
      get() {
        OptionsMap[property] = true;
        return true;
      },
    });
    window.addEventListener('test', null, opts);
    window.removeListener('test', null);
  } catch (e) {
    return false;
  }

  return OptionsMap[property];
}

export default SupportMap;
