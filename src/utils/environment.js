export const env = {
  SIT: 'SIT',
  UAT: 'UAT',
  PROD: 'PROD',
};

const sitEnv = [
  {
    adminId: '2',
    brand: '101',
  },
  {adminId: '5', brand: '201'},
  {adminId: '6', brand: '301'},
];

export const getEnvironment = appData => {
  const {
    adminBrand: {adminId, brand},
  } = appData;

  let environment = env.PROD;

  if (sitEnv.some(x => x.adminId === adminId && x.brand === brand)) {
    environment = env.SIT;
  } else if (brand.indexOf('uat') !== -1) {
    environment = env.UAT;
  }
  return environment;
};
