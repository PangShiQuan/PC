import {PLATFORM} from 'utils/type.config';
import {routerRedux} from 'dva/router';

export const assets = {
  logo: 'assets/image/logo-invert.png',
  logo_small: 'assets/image/logo-square-invert.png',
  logo_invert: 'assets/image/logo-invert.png',
};

export const PATH_BINDING = {
  PAGE_BG: {
    '/cards': '',
    '/games': '',
    '/sports': '',
  },
};

export const version = 'Dsf';
export const edition = 'Old';

export const HOMEPAGE_CONFIG = {
  activities: {
    caipiao: {
      title: '彩票游戏',
      desc: '彩票游戏，全网彩种多给你一种无前列的购彩体验',
      pathname: '/betcenter',
    },
    qipai: {
      title: '棋牌游戏',
      desc: '棋牌游戏 万人在线，火热PK，全球顶级竞技棋牌中心',
      pathname: '/cards',
      MATCH: {
        platform: PLATFORM.CARD,
      },
    },
    dianzi: {
      title: '电子游戏',
      desc: '热门电子游戏，免费旋转爆率高',
      pathname: '/games',
      MATCH: {
        platform: PLATFORM.GAME,
      },
    },
    realis: {
      title: '真人视频',
      desc: '',
      pathname: '/realis',
      MATCH: {
        platform: PLATFORM.REALI,
      },
    },
    tiyu: {
      title: '体育竞技',
      desc: '世界杯来临，全球一同参与体育热潮',
      pathname: '/sports',
      MATCH: {
        platform: PLATFORM.SPORT,
      },
    },
  },
  directories: {
    youhui: {
      title: '优惠活动',
      subtitle: '最新优惠内容',
      desc: '全新超值优惠大升级，疯狂优惠攻略 Ready go！',
      pathname: '/promotions',
      type: 'featured-left',
    },
    shouji: {
      title: 'APP下载',
      subtitle: '点击扫描二维码',
      desc: '点击扫描二维码下载手机APP，购彩投注更便捷',
      pathname: '/mobilesite',
      type: 'featured-left',
    },
    yonghu: {
      title: '用户中心',
      subtitle: '用户中心极速充提',
      desc: '用户中心极速充提，微信、支付宝、充值提款各大银行方便快捷',
      dispatchItem: routerRedux.push({pathname: '/user'}),
      fallbackDispatch: {
        type: 'layoutModel/updateState',
        payload: {shouldShowAuthModel: true},
      },
      type: 'featured-right',
    },
    kaijiang: {
      title: '开奖大厅',
      subtitle: '随时随地及时开奖',
      desc: '随时随地及时开奖，操作简单，玩法丰富，满足用户个性化游戏需求',
      pathname: '/result',
      type: 'featured-right',
    },
  },
};

export const CUSTOM_LIVECHAT_SCRIPT = null;
export const CUSTOM_LIVECHAT_TRIGGER = null;
export const GET_CS_LIVECHAT_LINK = null;
export const BAIDU_ANALYSIS_SCRIPT = null;
