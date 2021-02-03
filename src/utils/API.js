export const gameSetting = '/api/v1/adminsettings/user/prizeSettings';
export const downloadLink = '/config/downConfig.json';

export const homeInfo = '/api/v1/cms/internal/pc/$adminId/contents';
export const annoucementsList = '/api/v1/cms/internal/announcement';
export const messageList = '/api/v1/cms/Message/playerMessages';
export const playerMessageCount = '/api/v1/cms/Message/playerMessagesStatus';
export const SingleCollection =
  '/api/v1/adminsettings/user/prizeSettings/checkVersion';

export const allResults = '/api/v1/result/service/mobile/results/lastOpen';
export const currentResults = '/api/v1/result/service/mobile/results/current';
export const getCurrentTwo = '/api/v1/result/service/mobile/results/currentTwo';
export const uniqueGameHistory = '/api/v1/result/service/mobile/results/hist';
export const uniqueGameHistoryByDate =
  '/api/v1/result/service/mobile/results/histByDate';
export const betPlanGetResults = '/api/v1/result/service/mobile/results/next';

export const getValidatePic =
  '/api/v1/account/webapi/account/validateCode/getValidatePic';
export const changePwd =
  '/api/v1/account/webapi/account/users/change/encryptPassword';
export const updateRealName =
  '/api/v1/account/webapi/account/users/updateRealName';
export const updateUserInfo = '/api/v1/account/webapi/account/users';
export const createDownline =
  '/api/v1/account/webapi/account/users/createEncryptUser';
export const updateBankInfo =
  '/api/v1/account/webapi/account/users/encryptRegister_info';
export const updateCardInfo = '/api/v1/cashmgt/me/cards';
export const userCheckIn = '/api/v1/account/webapi/operate/users/signIn';
export const webLogin = '/api/v1/account/webapi/account/users/webEncryptLogin';
export const loginHistory = '/api/v1/account/webapi/account/users/loginHistory';
export const userInfo = '/api/v1/account/webapi/account/users/current';
export const userId = '/api/v1/account/webapi/account/users/chekcUserId';
export const logout = '/api/v1/account/account/system/logout';

export const userBankOptions = '/api/v1/cashmgt/me/cards/list';
export const topupGroups = '/api/v1/cashmgt/me/payments/name';
export const bankTransfers =
  '/api/v1/cashmgt/me/transfer/topups/banktransfers/v4';
export const userBanksAccount =
  '/api/v1/cashmgt/me/cards/cardsAndWithdrawDetail';
export const userTotalBalance = '/api/v1/balance/me/totalBalance';
export const userTotalRecoverBalance = '/api/v1/balance/me/totalRecoverBalance';
export const bankList =
  '/api/v1/cashmgt/me/transfer/topups/banktransfers/banklist/v2';
export const oddTransferInfo = `/api/v1/cashmgt/me/transfer/topups/banktransfers/banklist/v2`;
export const alipayAndBankSetting =
  '/api/v1/cashmgt/me/transfer/withdraw/settings';
export const userRewardTogetInfo = '/api/v1/rewards/vip/user/rewardtoget';
export const userAdminId = '/api/v1/account/webapi/account/users/adminid';
export const userWithDraw = '/api/v1/cashmgt/me/transfer/withdrawalsV2';
export const paymentList = '/api/v1/cashmgt/me/transfer/topups/payment/listV2';
export const paymentBankList = '/api/v1/cashmgt/me/paymentbanklist';
export const transactionHistory = '/api/v1/cashmgt/me/transfer/orderhistory';
export const cancelTransaction = '/api/v1/cashmgt/me/transfer/withdraw/cancel';
export const topups = '/api/v1/cashmgt/me/transfer/topups';
export const topupAgentList = '/api/v1/account/webapi/topupAgent/list';
export const topupAgentAnnouncement = 'api/v1/cashmgt/me/payments/vipTopup';

export const ordercap = '/api/v1/ordercap/me/order';
export const cancelOrder = '/api/v1/ordercap/me/cancel';

export const orderHistory = '/api/v1/orderdata/me/orders/findByState';
export const orderHistoryCount = '/api/v1/orderdata/me/orders/countByState';
export const orderDetail = '/api/v1/orderdata/me/orders/findByTimeuuid';
export const findTopWinners = '/api/v1/orderdata/me/orders/findTopWinners';

export const userBalance = '/api/v1/balance/me/trans/byDate';
export const myCommissions = '/api/v1/balance/me/commissions/';
export const commissionDetail = '/api/v1/balance/me/commissions/details';

export const teamReport = '/api/v1/balance/me/statements/team';
export const teamReportQuery = '/api/v1/balance/me/statements/team/query';
export const personalReport = '/api/v1/balance/me/statements/user';

export const memberList = '/api/v1/account/webapi/team/users/list';
export const affCodeList = '/api/v1/account/webapi/team/affiliates/list';
export const affCode = '/api/v1/account/webapi/team/affiliates';

export const helpList = '/api/v1/cms/internal/helpList';
export const specialOfferList =
  '/api/v1/cms/internal/promotion?contentType=PC_PROMOTION';
export const playerListQa = '/api/v1/cms/internal/playerListQa';
export const qa = '/api/v1/cms/QA';
export const systemMaintenance = 'api/v1/common/systemcheck';
export const playerBalanceTransfer =
  '/api/v1/dsf/center/player/iwallet/dsfTrans';
export const playerGetBetLog = '/api/v1/dsf/center/player/getBetLog';
export const playerGetBalance = '/api/v1/dsf/center/player/getBalance';
export const playerGetTransfer =
  '/api/v1/dsf/center/player/iwallet/getTransOrder';
export const playerStartGame = '/api/v1/dsf/center/player/startGame';
export const playerStartDemoGame = '/api/v1/dsf/center/player/startDemoGame';
export const playerStatementsPersonalList =
  '/api/v1/dsf/center/player/statements/personal/list';
export const playerStatementsPersonalTotal =
  '/api/v1/dsf/center/player/statements/personal/total';
export const playerTeamCalc = '/api/v1/dsf/center/player/teamCalc';
export const playerOpenPlatform = '/api/v1/dsf/center/player/open/platform';
export const collectDsfBalanceAndTransToCentral =
  '/api/v1/dsf/center/player/iwallet/collectDsfBalanceAndTransToCentral';
export const getAllBalance = '/api/v1/dsf/center/player/getAllBalance';
export const HbInfos = '/api/v1/balance/me/hb/current';
export const userListExport = 'api/v1/account/webapi/team/users/userListExport';
export const getServerTime = `/api/v1/result/service/mobile/results/currentTime`;
export const getDeviceInfo = '/api/v1/bi/users/info/collect/device/up';

/*
 * 聊天室接口
 */
export const chatIframeDomainDev = 'http://192.168.2.43:7200';
export const chatGetUserShareDetails = `/api/v1/chat/me/user/getUserShareDetail`;
export const chatGetVisitorChatToken = `/api/v1/chat/me/token/getVisitorChatToken`;
export const chatGetUserChatToken = `/api/v1/chat/me/token/getChatToken`;
export const shareBetToChat = '/api/v1/ordercap/order/share';
export const chatGetAllRooms = '/api/v1/chat/me/jwt/room/all';
export const chatGetUserPrinciple = '/api/v1/chat/me/jwt/user/getUserPrinciple';
export const chatGetIsEnabled = 'api/v1/cms/platform/settings/chat';
export const chatFollowOrder = 'api/v1/ordercap/order/follow';
export const chatDomain = 'api.iwillbeauty.com';
export const chatDomainSIT = 'sit.allspeak.io';
export const chatDomainUAT = 'uatapi.bcsyq.com';
export const chatSendMessage = 'api/v1/messages';
export const chatHistoryMessages = 'api/v1/rooms/$roomId/messages';

/*
 * 第三方接口
 */
export const bankCardIdentification =
  'https://ccdcapi.alipay.com/validateAndCacheCardInfo.json';

/*
 * dsf categories & games
 */
export const getAllDsfGamesAndCategories =
  '/api/v1/dsf/center/player/open/igPlatform/getAllGamesAndCategories';
export const getDsfGames = '/api/v1/dsf/center/player/open/igPlatform/getGames';
export const getDsfAllGamesByCategory =
  '/api/v1/dsf/center/player/open/igPlatform/getGamesAndCategories';
export const getDsfGamesChineseName =
  '/api/v1/dsf/center/player/open/igPlatform/getDsfPlatformTypeGroupByPlatform';

/*
 * mission center
 */
export const taskPlanRewards = `/api/v1/rewards/user/task/getTaskPlanRewards`;
export const receiveAvailableTaskRewards = `/api/v1/rewards/user/task/receiveAvailableTaskRewards`;
export const getMissionHistory = `/api/v1/rewards/user/task/getTaskPlanRewardsHistory`;

/*
 * mission center
 */
export const sosFundRewards = `/api/v1/rewards/user/sos/getSosFundRewards`;
export const receiveAvailableSosFundRewards = `/api/v1/rewards/user/sos/receiveAvailableSosFundRewards`;
export const getSosFundHistory = `/api/v1/rewards/user/sos/getSosFundRewardsHistory`;

/*
 * festival theme
 */
export const festivalTheme = `api/v1/cms/platform/getFestiveTheme`;
