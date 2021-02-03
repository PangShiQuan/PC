export const assets = {
  logo: 'assets/image/logo.png',
  logo_small: 'assets/image/logo.png',
  logo_invert: 'assets/image/logo-invert.png',
};

export const version = 'Dsf';
export const edition = 'New';

export const plugin = {
  HomePage: 3,
  Marquee: 3,
  TopTray: 2,
  ProfileNav: 2,
  Header: 2,
  Login: 2,
  Navigation: 2,
  UserQuickAccessBar: 2,
  Promotions: 2,
  Sports: 2,
  Cards: 2,
  Game: 2,
  Fishing: 2,
};

export const PATH_BINDING = {
  PAGE_BG: {
    '/promotions': '',
  },
};

export const BAIDU_ANALYSIS_SCRIPT = () => {
  var _hmt = _hmt || [];
  (function() {
    var hm = document.createElement('script');
    hm.src = 'https://hm.baidu.com/hm.js?e5b72fe005ca39624003269d5aa1eddf';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(hm, s);
  })();
};