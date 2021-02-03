import React, {Component} from 'react';


function Navigation ({className, pathName, classNameList, functionList}) {
    let isPromotions = false;
    if (pathName === "/promotions"){
        isPromotions = true;
    }
    return(
    <nav className={className} ispromotions={isPromotions.toString()}>
        <div key="navList" className={classNameList}>
            {functionList}
        </div>
    </nav>);
}

export default Navigation;