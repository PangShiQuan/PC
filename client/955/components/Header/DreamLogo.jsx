import React, {Component} from 'react';
import image from '../../assets/image/dream.gif';
import css from '../../variable/navigation.less';
import Marquee from 'plugins/Header/Dsf/Marquee1';

function DreamLogo ({classNameprofileNav, classNamelogoCol, classNamelistCol,
    datalogon, logo, login, pathname, navigation}) {
        let logodream = '';
        let marquee = '';
        if (pathname === "/promotions") {
            classNameprofileNav = css.profileNavRow;
            classNamelistCol = css.listCol;
            logodream = <div className={css.logoDream}>
                            <img src={image}/>
                        </div>;
            marquee =   <div className={css.Marquee}>
                            <Marquee ispromotions={true}/>
                        </div>;
        }
    return (
        <React.Fragment>
        {marquee}
        <div className={classNameprofileNav} data-logon={datalogon}>
            <div className={classNamelogoCol}>
                {logo}
            </div>
                {datalogon ? '' : logodream}
            <div className={classNamelistCol}>
               {login}
               {navigation}
            </div>
        </div>
        </React.Fragment>);
}
export default DreamLogo;