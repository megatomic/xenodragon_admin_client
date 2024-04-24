import React,{useState} from 'react';
import {useMediaQuery} from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import SubMenuPanel from '../SubMenuPanel';
import QueryUserListPanel from './QueryUserListPanel';
import QueryUserActivityLogsPanel from './QueryUserActivityLogsPanel';
import QueryUserPayLogsPanel from './QueryUserPayLogsPanel';
import QueryBlacklistPanel from './QueryBlacklistPanel';
import ViewUserDetailInfoPanel from './ViewUserDetailInfoPanel';

import useCommon from '../../../store/useCommonStorageManager';

const menuTable = [
    {id:1, name:'유저 목록 조회'},
    {id:2, name:'유저 활동이력 조회'},
    {id:3, name:'유저 결제이력 조회'},
    {id:4, name:'블랙리스트 관리'}
];

const UserManageContainer = () => {

    const {eventInfo} = useCommon();
    const [activeMenuID, setActiveMenuID] = useState(1);
    const [editUserMode, setEditUserMode] = useState(false);
    const [parentTitle, setParentTitle] = useState('');
    const isMobile = useMediaQuery({query: "(max-width:768px)"});
    const [subMenuOpen, setSubMenuOpen] = useState(isMobile?false:true);

    const onEnterEditUserMode = (e,title) => {
        setParentTitle(title);
        setEditUserMode(true);
    };

    const onExitEditUserMode = (e) => {
        setEditUserMode(false);
    };

    const onSubMenuOpenClick = (flag) => {
        if(isMobile) {
            setSubMenuOpen(flag);
        }
    };

    const onSubMenuCloseClick = (e) => {
        if(isMobile) {
            setSubMenuOpen(false);
        }
    };

    return (
        <React.Fragment>
            {subMenuOpen && <SubMenuPanel activeMenuID={activeMenuID} subMenuTable={menuTable} onMenuClick={(menuID)=>setActiveMenuID(menuID)} onSubMenuCloseClick={(e)=>onSubMenuCloseClick(e)}/>}
            {eventInfo.testMode?<p>UserManageContainer</p>:
                (<mainStyled.MainContentPanel>
                <div>
                    {activeMenuID === 1 && (
                        editUserMode === true?
                        <ViewUserDetailInfoPanel title={parentTitle} onExitEditUserMode={onExitEditUserMode} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>:
                        <QueryUserListPanel onEnterEditUserMode={onEnterEditUserMode} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>)}
                    {activeMenuID === 2 && <QueryUserActivityLogsPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 3 && <QueryUserPayLogsPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 4 && <QueryBlacklistPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                </div>
                </mainStyled.MainContentPanel>)
            }
        </React.Fragment>
    )
};
    
export default UserManageContainer;