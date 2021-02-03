import {API, ENVIRONMENT} from 'utils';

export const getChatDomain = appData => {
  const env = ENVIRONMENT.getEnvironment(appData);

  let domain = API.chatDomain;
  if (env === ENVIRONMENT.env.SIT) {
    domain = API.chatDomainSIT;
  } else if (env === ENVIRONMENT.env.UAT) {
    domain = API.chatDomainUAT;
  }
  return domain;
};
