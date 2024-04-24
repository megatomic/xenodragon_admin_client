import React,{useState} from 'react';
import {useMediaQuery} from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import SubMenuPanel from '../SubMenuPanel';
import NormalSettingPanel from './NormalSettingPanel';
import MasterSettingPanel from './MasterSettingPanel';
import GameClientSettingPanel from './GameClientSettingPanel';
import NFTSettingPanel from './NFTSettingPanel';
import TokenSettingPanel from './TokenSettingPanel';
import settings from '../../../common/settings';

import useCommon from '../../../store/useCommonStorageManager';
import useAuth from '../../../store/useAuthDataManager';

export const updateSettingItemTable = (settingItemTable,groupID,itemName,slotIndex,itemValue) => {

    const newSettingItemTable = [...settingItemTable];
    let newSettingItem = null;
    for(let settingItem of newSettingItemTable) {
        if(settingItem.groupID === groupID && settingItem.itemName === itemName) {
            settingItem.valueTable[slotIndex] = itemValue;
            newSettingItem = settingItem;
            break;
        }
    }

    if(newSettingItem === null) {
        newSettingItem = {groupID,itemName,valueTable:["","",""]};
        newSettingItem.valueTable[slotIndex] = itemValue;
        newSettingItemTable.push(newSettingItem);
    }

    return newSettingItemTable;
};

const menuTable = [
    {id:1, name:'환경 설정'},
    {id:2, name:'MASTER 설정'},
    {id:3, name:'게임 클라이언트 설정', line:true},
    {id:4, name:'XDS/XDC 설정'},
    {id:5, name:'NFT 설정'}
];

const SettingsContainer = () => {

    const {eventInfo} = useCommon();
    const {authInfo} = useAuth();
    const [activeMenuID, setActiveMenuID] = useState(1);
    const isMobile = useMediaQuery({query: "(max-width:768px)"});
    const [subMenuOpen, setSubMenuOpen] = useState(isMobile?false:true);

    const subMenuTable = [];
    for( let menu of menuTable) {
        if(menu.id !== 2 || (menu.id === 2 && authInfo.loginID === settings.MASTER_ID)) {
            subMenuTable.push(menu);
        }
    }

    const onSubMenuChange = (menuID => {

        setActiveMenuID(menuID);

        // if(menuID === 2 && aclManager.checkAccessibleWithACL(authInfo.accountInfo.aclInfo,aclManager.ACL_POLICY_ACCOUNT_REGISTER) === false) {
        //     toast.error('새 계정을 추가할 권한이 없습니다.');
        //     setActiveMenuID(1);
        // } else {
        //     setEditInfo(initEditInfo);
        //     setAccountEditMode(false);
        //     setActiveMenuID(menuID);
        // }
    });

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
            {subMenuOpen && <SubMenuPanel activeMenuID={activeMenuID} subMenuTable={subMenuTable} onMenuClick={(menuID)=>onSubMenuChange(menuID)} onSubMenuCloseClick={(e)=>onSubMenuCloseClick(e)}/>}
            {eventInfo.testMode?<p>SettingsContainer</p>:
                (
            <mainStyled.MainContentPanel>
                <div>
                    {activeMenuID === 1 && <NormalSettingPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 2 && <MasterSettingPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 3 && <GameClientSettingPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 4 && <TokenSettingPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 5 && <NFTSettingPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                </div>
            </mainStyled.MainContentPanel>)}
        </React.Fragment>
    )
};
    
export default SettingsContainer;