import React,{useState} from 'react';
import {useMediaQuery} from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import SubMenuPanel from '../SubMenuPanel';
import UserStatisticsLogsPanel from './UserStatisticsLogsPanel';
import GamePlayStatisticsLogsPanel from './GamePlayStatisticsLogsPanel';
import CashStatisticsLogsPanel from './CashStatisticsLogsPanel';
import QueryAdminActivityLogsPanel from './QueryAdminActivityLogsPanel';
import QuerySystemLogsPanel from './QuerySystemLogsPanel';

import useCommon from '../../../store/useCommonStorageManager';

const menuTable = [
    {id:1, name:'사용자 통계'},
    {id:2, name:'게임플레이 통계'},
    {id:3, name:'재화 통계', line:true},
    {id:4, name:'관리자 활동로그 조회'},
    {id:5, name:'시스템 로그 조회'}
];

const LogViewContainer = () => {

    const {eventInfo} = useCommon();
    const [activeMenuID, setActiveMenuID] = useState(1);
    const isMobile = useMediaQuery({query: "(max-width:768px)"});
    const [subMenuOpen, setSubMenuOpen] = useState(isMobile?false:true);

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
            {eventInfo.testMode?<p>LogViewContainer</p>:
                (
            <mainStyled.MainContentPanel>
                <div>
                    {activeMenuID === 1 && <UserStatisticsLogsPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 2 && <GamePlayStatisticsLogsPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 3 && <CashStatisticsLogsPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 4 && <QueryAdminActivityLogsPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 5 && <QuerySystemLogsPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                </div>
            </mainStyled.MainContentPanel>)}
        </React.Fragment>
    )
};
    
export default LogViewContainer;