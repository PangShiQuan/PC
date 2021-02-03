import Broadcaster from '../caster';

export default new Broadcaster('Auth');

export const COMMAND = {
  AUTH: 'auth',
  UNAUTH: 'unauth',
};
