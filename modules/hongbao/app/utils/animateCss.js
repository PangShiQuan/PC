import one from './one';

function addOnTimeListenerMulti(el, eventsName, fn) {
  eventsName.split(' ').forEach(event => one(el, event, fn));
}

function removeAnimation() {
  if (!this || this === window)
    throw new Error(
      'Please bind this function with context object consist of animationName and node.',
    );
  this.node.classList.remove(this.animationName);
  if (this.callback && typeof this.callback === 'function') this.callback();
}

export default function animateCss(node, animationName, callback) {
  const animationEnd = 'animationend'; // 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
  const bindRemoveAnimation = removeAnimation.bind({
    animationName,
    callback,
    node,
  });
  addOnTimeListenerMulti(node, animationEnd, bindRemoveAnimation);

  node.classList.add('animated');
  node.classList.add(animationName);
}
