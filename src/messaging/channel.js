const Channel = (async function initChannel() {
  const options = {webWorkerSupport: false};
  let Broadcast = BroadcastChannel;

  if (!BroadcastChannel)
    Broadcast = await import(/* webpackChunkName:"broadcast-channel" */ 'broadcast-channel');

  return {Auth: new Broadcast('auth', options)};
})();

export default Channel;
