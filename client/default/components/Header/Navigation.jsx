import React, {Component} from 'react';

function Navigation ({className, classNameList, functionList}) {
    return(
    <nav className={className}>
        <div key="navList" className={classNameList}>
            {functionList}
        </div>
    </nav>);
}

export default Navigation;