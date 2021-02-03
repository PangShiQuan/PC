import SupportMap from './detectSupport';

export default function one(node, type, callback) {
  if (SupportMap.once)
    node.addEventListener(type, callback, {capture: false, once: true});
  else {
    const handler = function handler(event) {
      event.target.removeEventListener(event.type, handler, false);
      callback(event);
    };
    node.addEventListener(type, handler, false);
  }
}
