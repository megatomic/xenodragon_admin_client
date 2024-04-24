import React, { useState } from 'react';
import {useMediaQuery} from 'react-responsive';
import { toast } from 'react-toastify';

import * as mainStyled from '../MainPageStyles';
import SubMenuPanel from '../SubMenuPanel';
import QueryMaintainNotiListPanel from './QueryMaintainNotiListPanel';
import RegisterNewMaintainNotiPanel from './RegisterNewMaintainNotiPanel';
import QueryLobbyNotiListPanel from './QueryLobbyNotiListPanel';
import RegisterNewLobbyNotiPanel from './RegisterNewLobbyNotiPanel';
import QueryWebSiteNotiListPanel from './QueryWebSiteNotiListPanel';
import RegisterNewWebSiteNotiPanel from './RegisterNewWebSiteNotiPanel';
import QueryAlarmNotiListPanel from './QueryAlarmNotiListPanel';
import RegisterNewAlarmNotiPanel from './RegisterNewAlarmNotiPanel';

import useCommon from '../../../store/useCommonStorageManager';
import useAuth from '../../../store/useAuthDataManager';

import * as aclManager from '../../../common/js/aclManager';

import {langTable} from '../../../common/LangTable';

const menuTable = [
  // { id: 1, name: '유지보수 공지사항 조회' },
  // { id: 2, name: '새 유지보수 공지사항 등록' },
  { id: 1, name: '로비 공지사항 조회' },
  { id: 2, name: '새 로비 공지사항 등록', line:true },
  { id: 3, name: '웹사이트 공지사항 조회' },
  { id: 4, name: '새 웹사이트 공지사항 등록', line:true },
  { id: 5, name: '띠알림 공지사항 조회' },
  { id: 6, name: '새 띠알림 공지사항 등록' },
];

export const enumLangCode = [
  {id:1, name:'한국어', code:23},
  {id:2, name:'영어', code:10},
  {id:3, name:'인도어', code:20},
  {id:4, name:'베트남어', code:39}
];

export const getLangCodeFromType = (langType) => {

  return enumLangCode[langType].code;
};

export const getLangTypeFromCode = (langCode) => {

  for(let item of enumLangCode) {
    if(item.code === langCode) {
      return (item.id-1);
    }
  }
  return -1;
};

export const getLangValue = (langCode) => {

  for(let item of langTable) {
    if(item.code === langCode) {
      return item.value;
    }
  }
  return null;
};

export const getLangCode = (langValue) => {

  for(let item of langTable) {
    if(item.value === langValue) {
      return item.code;
    }
  }
  return -1;
}

export const getTitle = (titleTable,langType) => {

  const langCode = enumLangCode[langType].code;
  const langValue = getLangValue(langCode);

  for(let titleInfo of titleTable) {
    if(titleInfo.langValue === langValue) {
      return titleInfo.content;
    }
  }
  return null;
};

export const getContent = (contentTable,langType) => {

  const langCode = enumLangCode[langType].code;
  const langValue = getLangValue(langCode);

  for(let contentInfo of contentTable) {
    if(contentInfo.langValue === langValue) {
      return contentInfo.content;
    }
  }
  return null;
};

export const getDefaultTable = () => {

  const table = [];
  for(let item of enumLangCode) {
    table.push({langCode:item.code, langValue:getLangValue(item.code), content:""});
  }
  return table;
};

const NotificationManageContainer = () => {
  const { authInfo } = useAuth();

  const initEditInfo = { parentTitle: '', notiInfo: null };
  const { eventInfo } = useCommon();
  const [activeMenuID, setActiveMenuID] = useState(1);
  const [notiEditMode, setNotiEditMode] = useState(false);
  const [editInfo, setEditInfo] = useState(initEditInfo);
  const isMobile = useMediaQuery({query: "(max-width:768px)"});
  const [subMenuOpen, setSubMenuOpen] = useState(isMobile?false:true);

  const onRegisterNotiButtonClick = (e, data) => {
    setActiveMenuID(7);
  };

  const onSubMenuChange = (menuID) => {
    console.log('myACLInfo=', authInfo.accountInfo.aclInfo, ',menuID=', menuID);

    if (menuID === 8 && aclManager.checkAccessibleWithACL(authInfo.accountInfo.aclInfo, aclManager.ACL_POLICY_NOTIFICATION_LINESCROLL_REGISTER) === false) {
      toast.error('새 공지사항을 추가할 권한이 없습니다.');
      setActiveMenuID(1);
    } else {
      setEditInfo(initEditInfo);
      setNotiEditMode(false);
      setActiveMenuID(menuID);
    }
  };

  const onNotiEditModeChange = (start, data) => {
    if (start === true) {
      setEditInfo(data);
      setNotiEditMode(start);
    } else {
      if (notiEditMode === false) {
        setActiveMenuID(activeMenuID-1);
      } else {
        setNotiEditMode(start);
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
        <p>InboxMessageManageContainer</p>
      ) : (
        <mainStyled.MainContentPanel>
          <div>
            {activeMenuID === 1 && !notiEditMode && <QueryLobbyNotiListPanel onNotiEditModeChange={(flag, data) => onNotiEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {(activeMenuID === 2 || (activeMenuID === 1 && notiEditMode === true)) && (
              <RegisterNewLobbyNotiPanel
                editMode={notiEditMode}
                editInfo={editInfo}
                onNotiEditModeChange={(flag, data) => onNotiEditModeChange(flag, data)}
                onApplyButtonClick={(e, data) => onRegisterNotiButtonClick(e, data)}
                onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}
              />
            )}
            {activeMenuID === 3 && !notiEditMode && <QueryWebSiteNotiListPanel onNotiEditModeChange={(flag, data) => onNotiEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {(activeMenuID === 4 || (activeMenuID === 3 && notiEditMode === true)) && (
              <RegisterNewWebSiteNotiPanel
                editMode={notiEditMode}
                editInfo={editInfo}
                onNotiEditModeChange={(flag, data) => onNotiEditModeChange(flag, data)}
                onApplyButtonClick={(e, data) => onRegisterNotiButtonClick(e, data)}
                onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}
              />
            )}
            {activeMenuID === 5 && !notiEditMode && <QueryAlarmNotiListPanel onNotiEditModeChange={(flag, data) => onNotiEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {(activeMenuID === 6 || (activeMenuID === 5 && notiEditMode === true)) && (
              <RegisterNewAlarmNotiPanel
                editMode={notiEditMode}
                editInfo={editInfo}
                onNotiEditModeChange={(flag, data) => onNotiEditModeChange(flag, data)}
                onApplyButtonClick={(e, data) => onRegisterNotiButtonClick(e, data)}
                onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}
              />
            )}
          </div>
        </mainStyled.MainContentPanel>
      )}
    </React.Fragment>
  );
};

export default NotificationManageContainer;
