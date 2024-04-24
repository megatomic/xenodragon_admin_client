import React, { useState } from 'react';
import {useMediaQuery} from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import SubMenuPanel from '../SubMenuPanel';
import LanguagePresetManagePanel from './LanguagePresetManagePanel';
import RewardPresetManagePanel from './RewardPresetManagePanel';
import QueryInboxMessageListPanel from './QueryInboxMessageListPanel';
import SendNewInboxMessagePanel from './SendNewInboxMessagePanel';
import QueryPushMessageListPanel from './QueryPushMessageListPanel';
import SendNewPushMessagePanel from './SendNewPushMessagePanel';

import useCommon from '../../../store/useCommonStorageManager';
import useAuth from '../../../store/useAuthDataManager';
import { toast } from 'react-toastify';

import * as aclManager from '../../../common/js/aclManager';

const menuTable = [
  { id: 1, name: '언어 프리셋 관리'},
  { id: 2, name: '보상 프리셋 관리', line:true},
  { id: 3, name: '우편함메세지 목록 조회' },
  { id: 4, name: '새 우편함메세지 보내기', line:true },
  { id: 5, name: '푸쉬메세지 목록 조회' },
  { id: 6, name: '새 푸쉬메세지 보내기' },
  { id: 7, name: '이메일 보내기' },
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

    if ((menuID === 4 || menuID === 6) && aclManager.checkAccessibleWithACL(authInfo.accountInfo.aclInfo, aclManager.ACL_POLICY_MESSAGE_INBOX_SEND) === false) {
      if(menuID === 4) {
        toast.error('새 우편함을 전송할 권한이 없습니다.');
        setActiveMenuID(3);
      } else {
        toast.error('새 푸쉬를 전송할 권한이 없습니다.');
        setActiveMenuID(5);
      }
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
        if (activeMenuID === 2 || activeMenuID === 4 || activeMenuID === 6) {
          setActiveMenuID(activeMenuID-1);
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
          {activeMenuID === 1 && <LanguagePresetManagePanel onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
          {activeMenuID === 2 && <RewardPresetManagePanel onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {activeMenuID === 3 && !msgEditMode && <QueryInboxMessageListPanel onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {(activeMenuID === 4 || (activeMenuID === 3 && msgEditMode === true)) && (
              <SendNewInboxMessagePanel
                editMode={msgEditMode}
                editInfo={editInfo}
                onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)}
                onApplyButtonClick={(e, data) => onSendButtonClick(e, data)}
                onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}
              />
            )}
            {activeMenuID === 5 && !msgEditMode && <QueryPushMessageListPanel onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {(activeMenuID === 6 || (activeMenuID === 5 && msgEditMode === true)) && (
              <SendNewPushMessagePanel
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
