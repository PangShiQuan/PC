import setprototypeof from 'setprototypeof';

if (!('setPrototypeOf' in Object))
  Object.setPrototypeOf = setprototypeof;
