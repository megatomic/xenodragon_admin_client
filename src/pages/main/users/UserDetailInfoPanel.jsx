import React, {useState,useEffect,useRef,useCallback} from 'react';
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './UserManagePageStyles';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import CheckBox from '../../../components/CheckBox';
import TextArea1 from '../../../components/TextArea1';
import DropBox from '../../../components/DropBox';

import useCommon from '../../../store/useCommonStorageManager';
import useUser from '../../../store/useUserDataManager';
import useSetting from '../../../store/useSettingDataManager';
import { toast } from 'react-toastify';

import UserBasicInfoPanel from './detailinfo/UserBasicInfoPanel';
import UserDragonInfoPanel from './detailinfo/UserDragonInfoPanel';
import UserGearInfoPanel from './detailinfo/UserGearInfoPanel';
import UserDragonTeamInfoPanel from './detailinfo/UserDragonTeamInfoPanel';
import UserInventoryInfoPanel from './detailinfo/UserInventoryInfoPanel';
import UserQuestInfoPanel from './detailinfo/UserQuestInfoPanel';
import UserTutorialInfoPanel from './detailinfo/UserTutorialInfoPanel';
import UserFriendInfoPanel from './detailinfo/UserFriendInfoPanel';
import UserInboxInfoPanel from './detailinfo/UserInboxInfoPanel';
import UserAdventureInfoPanel from './detailinfo/UserAdventureInfoPanel';
import UserDungeonInfoPanel from './detailinfo/UserDungeonInfoPanel';
import UserExpeditionInfoPanel from './detailinfo/UserExpeditionInfoPanel';
import UserArenaInfoPanel from './detailinfo/UserArenaInfoPanel';

const titleText = '상세 정보';

const detailInfoMenuList = [
    {id:1, name:'기본 정보'},
    {id:2, name:'드래곤 정보'},
    {id:3, name:'기어 정보'},
    {id:4, name:'팀 & 팀 포메이션 정보'},
    {id:5, name:'인벤토리 정보'},
    {id:6, name:'퀘스트 정보'},
    {id:7, name:'튜토리얼 정보'},
    {id:8, name:'친구 정보'},
    {id:9, name:'우편함 정보'},
    {id:10, name:'모험 전투 정보'},
    {id:11, name:'던전 전투 정보'},
    {id:12, name:'탐험 정보'},
    {id:13, name:'아레나 전투 정보'}
];

const UserDetailInfoPanel = (props) => {

  const { startLoading, setStartLoading } = useCommon();
  const {requestUserDetailInfo} = useUser();  
  const [userDetailInfo, setUserDetailInfo] = useState({});

  const [activeMenuID, setActiveMenuID] = useState(1);
  const [subMenuOpen,setSubMenuOpen] = useState(false);

  const onMenuItemClick = (item) => {
      setActiveMenuID(item.id);
  };

  const onApplyButtonClick = (e) => {
      props.onApplyButtonClick(e);
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen(state=>!subMenuOpen);
  };

  const reloadUserBasicInfo = (userID) => {

    setStartLoading(true);
    setTimeout(async () => {
      const resultInfo = await requestUserDetailInfo(userID);

      console.log('userInfo=',resultInfo);

      setUserDetailInfo(resultInfo.data);
      // if (resultInfo.resultCode === 0) {
      //   setUserList(makeTableFromUserList(resultInfo.data));
      // } else {
      //   toast.error(resultInfo.message);
      // }
      setStartLoading(false);
    }, 200);
  };

useEffect(()=> {
    reloadUserBasicInfo(props.targetUserID);
},[]);

  useEffect(()=> {
      props.onSubMenuOpenClicked(subMenuOpen);
  },[subMenuOpen]);

  if(userDetailInfo.userInfo === undefined) {
    return null;
  }

    return (
        <contentStyled.ContentWrapper>
        <contentStyled.ContentHeader>
        <MediaQuery maxWidth={768}>
                    &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
                </MediaQuery>
          <span id="subtitle">{`${props.parentTitle} > ${titleText} > ${userDetailInfo.userInfo.pId} (${userDetailInfo.userInfo.userNickname})`}</span>
          <span>&nbsp;</span>
          <span id='label'>카테고리</span>
          <span id='dropdown'><DropBox responsive='1.6' width='10vw' height='2vw' text={detailInfoMenuList[0].name} fontSize='0.6vw' itemList={detailInfoMenuList} menuItemClick={(item)=>onMenuItemClick(item)} /></span>
          <span id="button">
            <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onApplyButtonClick(e)}>
              확인
            </Button1>
          </span>
        </contentStyled.ContentHeader>
        <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />
        {activeMenuID===1 && <UserBasicInfoPanel basicInfo={userDetailInfo.userInfo} />}
        {activeMenuID===2 && <UserDragonInfoPanel targetUserID={props.targetUserID} />}
        {activeMenuID===3 && <UserGearInfoPanel targetUserID={props.targetUserID} />}
        {activeMenuID===4 && <UserDragonTeamInfoPanel teamInfo={userDetailInfo.userTeams} teamFormInfo={userDetailInfo.userTeamFormations} />}
        {activeMenuID===5 && <UserInventoryInfoPanel targetUserID={props.targetUserID} />}
        {activeMenuID===6 && <UserQuestInfoPanel targetUserID={props.targetUserID} />}
        {activeMenuID===7 && <UserTutorialInfoPanel />}
        {activeMenuID===8 && <UserFriendInfoPanel targetUserID={props.targetUserID} />}
        {activeMenuID===9 && <UserInboxInfoPanel targetUserID={props.targetUserID} />}
        {activeMenuID===10 && <UserAdventureInfoPanel />}
        {activeMenuID===11 && <UserDungeonInfoPanel />}
        {activeMenuID===12 && <UserExpeditionInfoPanel />}
        {activeMenuID===13 && <UserArenaInfoPanel />}
        </contentStyled.ContentWrapper>
    )
};

export default UserDetailInfoPanel;