async function entropyRandom(size) {
  const [isaac, {Entropy}] = await Promise.all([
    import(/* webpackChunkName:"isaac" */ 'isaac'),
    import(/* webpackChunkName:"entropy-string" */ 'entropy-string/dist/entropy-string'),
  ]);
  // https://github.com/dcodeIO/bcrypt.js/blob/684fac6814a81d974c805a15e22fd69922c7ca6e/src/bcrypt.js#L28
  const buf = new Uint32Array(size);
  const options = {total: 1e6, risk: 1e9};

  // finall resolve to generate none cryptographically strong string using psuedo-random number generator Math.random
  if (!(window.crypto || window.msCrypto)) options.prng = true;

  const entropy = new Entropy(options);
  const string = entropy.string();

  isaac.seed(string);

  const rand = () => Math.floor(isaac.random() * 256);

  return Array.prototype.slice.call(buf.map(rand));
}

export {entropyRandom};
