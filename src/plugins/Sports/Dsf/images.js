import resolve from 'clientResolver';

const IMONE = resolve.client('assets/image/sports/im.png');
const AVIA = resolve.client('assets/image/sports/avia.png');
const IMSPORT = resolve.client('assets/image/sports/imsport.png');
const CP = resolve.client('assets/image/sports/cp.png');
const CR = resolve.client('assets/image/sports/cr.png');
const SSSPORT = resolve.client('assets/image/sports/sssport.png');
const SB = resolve.client('assets/image/sports/sb.png');

const ImageIcon = {
  IMONE: resolve.client('assets/image/sports/old.png'),
  IMSPORT: resolve.client('assets/image/sports/new.png'),
  SSSPORT: resolve.client('assets/image/sports/new.png'),
};

export {IMONE, AVIA, IMSPORT, CP, CR, SSSPORT, SB, ImageIcon};
