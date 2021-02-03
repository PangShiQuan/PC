import React, {Component} from 'react';
import image from '../../assets/image/dream.gif';
import css from '../../variable/navigation2.less';
import Marquee from 'components/Header/Marquee';

function DreamLogo ({classNameprofileNav, classNamelogoCol, classNamelistCol,
    datalogon, logo, login, pathname}) {
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
            </div>
        </div>
        </React.Fragment>);
}
export default DreamLogo;