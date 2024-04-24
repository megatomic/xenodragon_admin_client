import React,{useState} from 'react';
import {useMediaQuery} from 'react-responsive';
import { toast } from 'react-toastify';

import * as mainStyled from '../MainPageStyles';
import SubMenuPanel from '../SubMenuPanel';
import QueryAccountListPanel from './QueryAccountListPanel';
import RegisterNewAccountPanel from './RegisterNewAccountPanel';
import useAuth from '../../../store/useAuthDataManager';

import * as aclManager from '../../../common/js/aclManager';


const menuTable = [
    {id:1, name:'계정 목록 조회'},
    {id:2, name:'새 계정 추가'}
];

const AccountManageContainer = () => {

    const initEditInfo = {parentTitle:'',accountInfo:null};
    const {authInfo} = useAuth();

    const [activeMenuID, setActiveMenuID] = useState(1);
    const [accountEditMode,setAccountEditMode] = useState(false);
    const [editInfo, setEditInfo] = useState(initEditInfo);
    const isMobile = useMediaQuery({query: "(max-width:768px)"});
    const [subMenuOpen, setSubMenuOpen] = useState(isMobile?false:true);
    
    const onSubMenuChange = (menuID => {

        //console.log('myACLInfo=',authInfo.accountInfo.aclInfo,',menuID=',menuID);

        if(menuID === 2 && aclManager.checkAccessibleWithACL(authInfo.accountInfo.aclInfo,aclManager.ACL_POLICY_ACCOUNT_REGISTER) === false) {
            toast.error('새 계정을 추가할 권한이 없습니다.');
            setActiveMenuID(1);
        } else {
            setEditInfo(initEditInfo);
            setAccountEditMode(false);
            setActiveMenuID(menuID);
        }
    });

    const onAccountEditModeChange = (start,data) => {
        if(start === true) {
            setEditInfo(data);
            setAccountEditMode(start);
        } else {
            if(accountEditMode === false) {
                setActiveMenuID(1);
            } else {
                setAccountEditMode(start);
            }
        }
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
            {subMenuOpen && <SubMenuPanel activeMenuID={activeMenuID} subMenuTable={menuTable} onMenuClick={(menuID)=>onSubMenuChange(menuID)} onSubMenuCloseClick={(e)=>onSubMenuCloseClick(e)} />}
            <mainStyled.MainContentPanel>
                <div>
                    {activeMenuID === 1 && !accountEditMode && <QueryAccountListPanel onAccountEditModeChange={(flag,data)=>onAccountEditModeChange(flag,data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)} />}
                    {(activeMenuID === 2 || accountEditMode) && <RegisterNewAccountPanel editMode={accountEditMode} editInfo={editInfo} onAccountEditModeChange={(flag,data)=>onAccountEditModeChange(flag,data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)} />}
                </div>
            </mainStyled.MainContentPanel>
        </React.Fragment>
    )
};
    
export default AccountManageContainer;