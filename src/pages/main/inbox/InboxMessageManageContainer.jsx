import React, { useState } from 'react';
import {useMediaQuery} from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import SubMenuPanel from '../SubMenuPanel';
import QueryInboxMessageListPanel from './QueryInboxMessageListPanel';
import SendNewInboxMessagePanel from './SendNewInboxMessagePanel';

import useCommon from '../../../store/useCommonStorageManager';
import useAuth from '../../../store/useAuthDataManager';
import { toast } from 'react-toastify';

import * as aclManager from '../../../common/js/aclManager';

const menuTable = [
  { id: 1, name: '메세지 목록 조회' },
  { id: 2, name: '새 메세지 보내기' },
];

const InboxMessageManageContainer = () => {
  const { eventInfo: commonInfo } = useCommon();
  const { authInfo } = useAuth();

  const initEditInfo = { parentTitle: '', msgInfo: null };
  const [activeMenuID, setActiveMenuID] = useState(1);
  const [msgEditMode, setMsgEditMode] = useState(false);
  const [editInfo, setEditInfo] = useState(initEditInfo);
  const isMobile = useMediaQuery({query: "(max-width:768px)"});
  const [subMenuOpen, setSubMenuOpen] = useState(isMobile?false:true);

  const onSendButtonClick = (e, data) => {
    setActiveMenuID(7);
  };

  const onSubMenuChange = (menuID) => {
    console.log('myACLInfo=', authInfo.accountInfo.aclInfo, ',menuID=', menuID);

    if (menuID === 2 && aclManager.checkAccessibleWithACL(authInfo.accountInfo.aclInfo, aclManager.ACL_POLICY_MESSAGE_INBOX_SEND) === false) {
      toast.error('새 메세지를 전송할 권한이 없습니다.');
      setActiveMenuID(1);
    } else {
      setEditInfo(initEditInfo);
      setMsgEditMode(false);
      setActiveMenuID(menuID);
    }
  };

  const onMsgEditModeChange = (start, data) => {
    if (start === true) {
      setEditInfo(data);
      setMsgEditMode(start);
    } else {
      if (msgEditMode === false) {
        if (activeMenuID === 2) {
          setActiveMenuID(1);
        }
      } else {
        setMsgEditMode(start);
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
      {commonInfo.testMode ? (
        <p>PushMessageManageContainer</p>
      ) : (
        <mainStyled.MainContentPanel>
          <div>
            {activeMenuID === 1 && !msgEditMode && <QueryInboxMessageListPanel onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {(activeMenuID === 2 || (activeMenuID === 1 && msgEditMode === true)) && (
              <SendNewInboxMessagePanel
                editMode={msgEditMode}
                editInfo={editInfo}
                onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)}
                onApplyButtonClick={(e, data) => onSendButtonClick(e, data)}
                onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}
              />
            )}
          </div>
        </mainStyled.MainContentPanel>
      )}
    </React.Fragment>
  );
};

export default InboxMessageManageContainer;
