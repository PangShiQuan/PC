import React, {Component} from 'react';
// import image from '../../assets/image/dream.gif';

function DreamLogo ({classNameprofileNav, classNamelogoCol, classNamelistCol,
    datalogon, logo, login, pathname, navigation}) {
    return (
        <div className={classNameprofileNav} data-logon={datalogon}>
            <div className={classNamelogoCol}>
                {logo}
            </div>
            <div className={classNamelistCol}>
               {login}
               {navigation}
            </div>
        </div>);
}
export default DreamLogo;