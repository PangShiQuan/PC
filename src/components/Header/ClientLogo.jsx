import React from 'react';
import classnames from 'classnames';
import {Link} from 'dva/router';

import css from 'styles/header/clientLogo.less';
import resolve from 'clientResolver';
import {assets, PATH_BINDING} from 'config';
import {url} from 'utils';

const {all, ...paths} = PATH_BINDING.LOGO || {all: assets.logo};
if (!all) throw new Error(`请设置${CLIENT}的标志`);
const Logo = resolve.client(all);
const SmallLogo = resolve.client(assets.logo_small);
const SloganLogo = assets.logo_slogan
  ? resolve.client(assets.logo_slogan)
  : null;

const pathsLogo = {};

Object.entries(paths || {}).forEach(([path, asset]) => {
  pathsLogo[path] = resolve.client(asset);
});

function ClientLogo({siteName, useSmall, useSlogan, className, pathname}) {
  const logoAlt =
    useSlogan && SloganLogo
      ? SloganLogo
      : (pathname && pathsLogo[url.basePath(pathname)]) || Logo;
  const logoSrc = useSmall ? SmallLogo : logoAlt;
  return (
    <Link to="/">
      <img
        src={logoSrc}
        alt={siteName}
        className={classnames(css.logoImg, className)}
        data-slogan={Boolean(useSlogan && SloganLogo)}
      />
    </Link>
  );
}

export default ClientLogo;
