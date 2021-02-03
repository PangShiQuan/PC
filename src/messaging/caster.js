import Channel from './channel';

function virtual() {}

class Broadcaster {
  constructor(ch) {
    this.ch = {
      postMessage: virtual,
      addEventListener: virtual,
      removeEventListener: virtual,
      close: virtual,
    };
    Promise.resolve(Channel)
      .then(value => {
        this.ch = value[ch];
        return value;
      })
      .catch(err => {});
    this.registry = new Map();
  }
  post(msg) {
    this.ch.postMessage(msg);
  }
  add(handler) {
    this.ch.addEventListener('message', handler);
    const id = performance.now() || Date.now();
    this.registry.set(id, handler);
    return id;
  }
  remove({handler, id}) {
    const removal = handler || (id && this.registry.get(id));
    this.ch.removeEventListener('message', removal);
  }
  close() {
    this.ch.close();
  }
}

export default Broadcaster;
