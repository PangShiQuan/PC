import Fingerprint2 from 'fingerprintjs2';

export default function fingerprint(resolve) {
  const options = {};

  Fingerprint2.get(options, components => {
    const values = components.map(component => component.value);
    const murmur = Fingerprint2.x64hash128(values.join(''), 31);

    resolve(murmur);
  });
}
