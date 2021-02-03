export const assets = {
  logo: 'assets/image/logo.png',
  logo_small: 'assets/image/logo.png',
  logo_invert: 'assets/image/logo-invert.png',
};

export const version = 'Dsf';

export const plugin = {
  HomePage: 2,
  TopTray: 2,
  ProfileNav: 2,
  Header: 2,
  Login: 2,
  Navigation: 2,
  UserQuickAccessBar: 2,
};

export const PATH_BINDING = {
  LOGO: {
    all: assets.logo_invert,
    '/betcenter': assets.logo,
  },
  PAGE_BG: {
    '/cards': 'assets/image/cards/cardsBg.png',
    '/games': 'assets/image/games/gamesBg.png',
    '/sports': 'assets/image/sports/sportsBg.png',
  },
};

export const REPORT_SUGGEST = 'http://666ts.cc/';
