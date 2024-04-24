import React, { useState } from 'react';
import {useMediaQuery} from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import SubMenuPanel from '../SubMenuPanel';
import GameDBTableQueryPanel from './GameDBTableQueryPanel';
import ArenaToolPanel from './ArenaToolPanel';
import AttendanceToolPanel from './AttendanceToolPanel';
import MarketUserQueryPanel from './MarketUserQueryPanel';
import MarketNFTRegistrationPanel from './MarketNFTRegistrationPanel';
import MarketBalanceTransferPanel from './MarketBalanceTransferPanel';
import MarketContractSettingPanel from './MarketContractSettingPanel';
import MarketGeneralSettingPanel from './MarketGeneralSettingPanel';
import InboxBatchTransferPanel from './InboxBatchTransferPanel';

import useCommon from '../../../store/useCommonStorageManager';
import useAuth from '../../../store/useAuthDataManager';
import { toast } from 'react-toastify';

import * as aclManager from '../../../common/js/aclManager';


const MenuTableID = {
  GAMEDB_GENERAL:1,
  GAMEDB_ARENA:2,
  GAMEDB_DAILY:3,
  MARKET_QUERY_USER:4,
  MARKET_NFT_REGISTER:5,
  MARKET_SALE_TRANSFER:6,
  MARKET_CONTRACT_SETTING:7,
  MARKET_GENERAL_SETTING:8,
  POSTBOX_BATCH_TRANSFER:9
};

const menuTable = [
  { id: MenuTableID.GAMEDB_GENERAL, name: '게임DB 조회'},
  { id: MenuTableID.GAMEDB_ARENA, name: '아레나 DB' },
  { id: MenuTableID.GAMEDB_DAILY, name: '출석보상 DB', line:true },
  { id: MenuTableID.MARKET_QUERY_USER, name: '마켓 유저 조회'},
  { id: MenuTableID.MARKET_NFT_REGISTER, name: '마켓에 NFT 등록'},
  { id: MenuTableID.MARKET_SALE_TRANSFER, name: '마켓매출 지갑 전송'},
  { id: MenuTableID.MARKET_CONTRACT_SETTING, name: '마켓 컨트랙트 설정'},
  { id: MenuTableID.MARKET_GENERAL_SETTING, name: '마켓 일반 설정', line:true },
  { id: MenuTableID.POSTBOX_BATCH_TRANSFER, name: '우편함 배치 전송'}
];

const ToolManageContainer = () => {
  const { eventInfo: commonInfo } = useCommon();
  const { authInfo } = useAuth();

  const initEditInfo = { parentTitle: '', msgInfo: null };
  const [activeMenuID, setActiveMenuID] = useState(MenuTableID.GAMEDB_GENERAL);
  const [msgEditMode, setMsgEditMode] = useState(false);
  const [editInfo, setEditInfo] = useState(initEditInfo);
  const isMobile = useMediaQuery({query: "(max-width:768px)"});
  const [subMenuOpen, setSubMenuOpen] = useState(isMobile?false:true);

  const onSendButtonClick = (e, data) => {
    setActiveMenuID(MenuTableID.MARKET_GENERAL_SETTING);
  };

  const onSubMenuChange = (menuID) => {
    console.log('myACLInfo=', authInfo.accountInfo.aclInfo, ',menuID=', menuID);

    if (menuID === MenuTableID.GAMEDB_ARENA && aclManager.checkAccessibleWithACL(authInfo.accountInfo.aclInfo, aclManager.ACL_POLICY_MESSAGE_PUSH_SEND) === false) {
      toast.error('새 푸쉬알람을 전송할 권한이 없습니다.');
      setActiveMenuID(MenuTableID.GAMEDB_GENERAL);
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
        if (activeMenuID === MenuTableID.GAMEDB_ARENA) {
          setActiveMenuID(MenuTableID.GAMEDB_GENERAL);
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
        <p>ToolManageContainer</p>
      ) : (
        <mainStyled.MainContentPanel>
          <div>
          {activeMenuID === MenuTableID.GAMEDB_GENERAL && !msgEditMode && <GameDBTableQueryPanel onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {activeMenuID === MenuTableID.GAMEDB_ARENA && !msgEditMode && <ArenaToolPanel onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {(activeMenuID === MenuTableID.GAMEDB_DAILY || (activeMenuID === MenuTableID.GAMEDB_ARENA && msgEditMode === true)) && (
              <AttendanceToolPanel
                editMode={msgEditMode}
                editInfo={editInfo}
                onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)}
                onApplyButtonClick={(e, data) => onSendButtonClick(e, data)}
                onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}
              />
            )}
            {activeMenuID === MenuTableID.MARKET_QUERY_USER && !msgEditMode && <MarketUserQueryPanel onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {activeMenuID === MenuTableID.MARKET_NFT_REGISTER && !msgEditMode && <MarketNFTRegistrationPanel onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {activeMenuID === MenuTableID.MARKET_SALE_TRANSFER && !msgEditMode && <MarketBalanceTransferPanel onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {activeMenuID === MenuTableID.MARKET_CONTRACT_SETTING && !msgEditMode && <MarketContractSettingPanel onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {activeMenuID === MenuTableID.MARKET_GENERAL_SETTING && !msgEditMode && <MarketGeneralSettingPanel onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
            {activeMenuID === MenuTableID.POSTBOX_BATCH_TRANSFER && !msgEditMode && <InboxBatchTransferPanel onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
          </div>
        </mainStyled.MainContentPanel>
      )}
    </React.Fragment>
  );
};

export default ToolManageContainer;
