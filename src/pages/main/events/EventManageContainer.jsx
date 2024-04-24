import React, { useState,useEffect } from 'react';
import {useMediaQuery} from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import { toast } from 'react-toastify';

import SubMenuPanel from '../SubMenuPanel';
import QueryLoginEventListPanel from './QueryLoginEventListPanel';
import RegisterNewLoginEventPanel from './RegisterNewLoginEventPanel';
import QueryCouponInfoListPanel from './QueryCouponInfoListPanel';
import RegisterNewCouponInfoPanel from './RegisterNewCouponInfoPanel';

import useCommon from '../../../store/useCommonStorageManager';
import useAuth from '../../../store/useAuthDataManager';

import * as aclManager from '../../../common/js/aclManager';

const menuTable = [
  { id: 1, name: '접속보상 이벤트 목록 조회' },
  { id: 2, name: '새 접속보상 이벤트 등록', line:true },
  { id: 3, name: '쿠폰 발급 목록 조회'},
  { id: 4, name: '새 쿠폰 발급하기'}
];

const EventManageContainer = () => {
  const { eventInfo } = useCommon();
  const { authInfo } = useAuth();

  const initEditInfo = { parentTitle: '', eventInfo: null };
  const [activeMenuID, setActiveMenuID] = useState(1);
  const [eventEditMode, setEventEditMode] = useState(false);
  const [editInfo, setEditInfo] = useState(initEditInfo);
  const isMobile = useMediaQuery({query: "(max-width:768px)"});
  const [subMenuOpen, setSubMenuOpen] = useState(isMobile?false:true);

  const onRegisterEventButtonClick = (e, data) => {
    setActiveMenuID(7);
  };

  const onSubMenuChange = (menuID) => {
    console.log('myACLInfo=', authInfo.accountInfo.aclInfo, ',menuID=', menuID);

    if (menuID === 2 && aclManager.checkAccessibleWithACL(authInfo.accountInfo.aclInfo, aclManager.ACL_POLICY_EVENT_LOGINREWARD_REGISTER) === false) {
      toast.error('새 이벤트를 추가할 권한이 없습니다.');
      setActiveMenuID(1);
    } else {
      setEditInfo(initEditInfo);
      setEventEditMode(false);
      setActiveMenuID(menuID);
    }
  };

  const onEventEditModeChange = (start, data) => {
    if (start === true) {
      setEditInfo(data);
      setEventEditMode(start);
    } else {
      if (eventEditMode === false) {
        if (activeMenuID === 2) {
          setActiveMenuID(1);
        } else if(activeMenuID === 4) {
          setActiveMenuID(3);
        }
      } else {
        setEventEditMode(start);
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
      {subMenuOpen && <SubMenuPanel activeMenuID={activeMenuID} subMenuTable={menuTable} onMenuClick={(menuID) => onSubMenuChange(menuID)} onSubMenuCloseClick={(e)=>onSubMenuCloseClick(e)}/>}
      {eventInfo.testMode ? (
        <p>EventManageContainer</p>
      ) : (
        <mainStyled.MainContentPanel>
          <div>
            {activeMenuID === 1 && !eventEditMode && <QueryLoginEventListPanel onEventEditModeChange={(flag, data) => onEventEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {(activeMenuID === 2 || (activeMenuID === 1 && eventEditMode === true)) && (
              <RegisterNewLoginEventPanel
                editMode={eventEditMode}
                editInfo={editInfo}
                onEventEditModeChange={(flag, data) => onEventEditModeChange(flag, data)}
                onApplyButtonClick={(e, data) => onRegisterEventButtonClick(e, data)}
                onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}
              />
            )}
            {activeMenuID === 3 && !eventEditMode && <QueryCouponInfoListPanel onEventEditModeChange={(flag, data) => onEventEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {(activeMenuID === 4 || (activeMenuID === 3 && eventEditMode === true)) && (
              <RegisterNewCouponInfoPanel
                editMode={eventEditMode}
                editInfo={editInfo}
                onEventEditModeChange={(flag, data) => onEventEditModeChange(flag, data)}
                onApplyButtonClick={(e, data) => onRegisterEventButtonClick(e, data)}
                onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}
              />
            )}
          </div>
        </mainStyled.MainContentPanel>
      )}
    </React.Fragment>
  );
};

export default EventManageContainer;
