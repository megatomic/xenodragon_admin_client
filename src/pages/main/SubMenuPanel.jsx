import React, {useState} from 'react';
import {useMediaQuery} from 'react-responsive';
import * as mainStyled from './MainPageStyles';

const SubMenuPanel = ({activeMenuID, subMenuTable, onMenuClick, onSubMenuCloseClick}) => {

    const isMobile = useMediaQuery({query: "(max-width:768px)"});

    return (
        <mainStyled.SubMenuPanel>
            <div id='deco'></div>
            <div id='deco2'></div>
            <div id='sub-menu'>{
                subMenuTable.map((menu,idx)=> {
                    if(menu.line !== undefined && menu.id < subMenuTable.length) {
                        return (
                            <>
                                <mainStyled.SubMenuItem key={menu.id} active={menu.id === activeMenuID} onClick={(e)=>onMenuClick(menu.id)}>{menu.name}</mainStyled.SubMenuItem>
                                <mainStyled.SubmenuItemHorizontalLine />
                            </>
                        )
                    } else {
                        return <mainStyled.SubMenuItem key={menu.id} active={menu.id === activeMenuID} onClick={(e)=>onMenuClick(menu.id)}>{menu.name}</mainStyled.SubMenuItem>
                    }
                })
            }</div>
            {isMobile &&
            <div id='footer'>
                <p><i className='fas fa-arrow-left' onClick={(e)=>onSubMenuCloseClick(e)} /></p>
            </div>}
        </mainStyled.SubMenuPanel>
    )
};

export default SubMenuPanel;