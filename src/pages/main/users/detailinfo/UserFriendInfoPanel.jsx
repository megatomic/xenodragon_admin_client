import React, {useState,useCallback,useEffect,useRef} from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import * as mainStyled from '../../MainPageStyles';
import * as contentStyled from '../../MainContentStyles';
import * as pageStyled from '../UserDetailInfoPageStyles';

import Button1 from '../../../../components/Button1';
import InputField1 from '../../../../components/InputField1';
import Table from '../../../../components/Table';
import DropBox from '../../../../components/DropBox';

import useCommon from '../../../../store/useCommonStorageManager';
import useUser from '../../../../store/useUserDataManager';

const listTypeTable = [
    {id:1, name:'친구 목록'},
    {id:2, name:'요청한 메세지'},
    {id:3, name:'요청받은 메세지'}
];

const tableHeader1Info = ['유저ID','닉네임','최근접속시각','계정생성시각'];
const tableHSpace1Table = '1.8fr 1fr 1fr 1fr';
const makeTableFromFriendList = (friendList) => {
  
    const result = friendList.map((friendInfo, idx) => {  
      return [
        friendInfo.friendId,
        friendInfo.friendNickname,
        `${dayjs(friendInfo.updatedAt).format('YYYY-MM-DD HH:mm')}`,
        `${dayjs(friendInfo.createdAt).format('YYYY-MM-DD HH:mm')}`
      ];
    });
  
    return result;
  };


const tableHeader2Info = ['초대한 일시','대상 유저ID','대상 닉네임','초대 상태'];
const tableHSpace2Table = '1.2fr 2fr 1.2fr 0.8fr';
const makeTableFromInviteList = (inviteList) => {
  
    const result = inviteList.map((inviteInfo, idx) => {  
      return [
        `${dayjs(inviteInfo.updatedAt).format('YYYY-MM-DD HH:mm')}`,
        inviteInfo.invitedUserId,
        inviteInfo.nickName,
        inviteInfo.inviteState.toString()
      ];
    });
  
    return result;
  };

const tableHeader3Info = ['초대받은 일시','초대한 유저ID','초대한 닉네임','수락 상태'];
const tableHSpace3Table = '1.2fr 2fr 1.2fr 0.8fr';
const makeTableFromInvitedList = (invitedList) => {
  
    const result = invitedList.map((invitedInfo, idx) => {  
      return [
        `${dayjs(invitedInfo.updatedAt).format('YYYY-MM-DD HH:mm')}`,
        invitedInfo.invitedUserId,
        invitedInfo.nickName,
        invitedInfo.inviteState.toString()
      ];
    });
  
    return result;
  };

const UserFriendInfoPanel = (props) => {

    const { startLoading, setStartLoading } = useCommon();
    const {requestUserFriendInfo} = useUser();

    const [listTypeIndex, setListTypeIndex] = useState(0);
    const [friendListViewTable, setFriendListViewTable] = useState([]);
    const [friendInviteListViewTable, setFriendInviteListViewTable] = useState([]);
    const [friendInvitedListViewTable, setFriendInvitedListViewTable] = useState([]);

    const onQuestTypeDropMenuClick = (item) => {
        setListTypeIndex(item.id-1);
    };

    const reloadUserFriendInfo = async (userID) => {
        setStartLoading(true);

        let resultInfo;
        setTimeout(async () => {
          if(listTypeIndex === 0) {
            resultInfo = await requestUserFriendInfo(userID,0);
            if(resultInfo.resultCode !== 0) {
              toast.error(resultInfo.message);
            } else {
              setFriendListViewTable(makeTableFromFriendList(resultInfo.data));
              if(resultInfo.data.length === 0) {
                toast.info('친구정보가 없습니다.');
              }
            }

          } else if(listTypeIndex === 1) {
            resultInfo = await requestUserFriendInfo(userID,1);
            if(resultInfo.resultCode !== 0) {
              toast.error(resultInfo.message);
            } else {
              setFriendInviteListViewTable(makeTableFromInviteList(resultInfo.data));
              if(resultInfo.data.length === 0) {
                toast.info('친구를 요청한 메세지가 없습니다.');
              }
            }

          } else if(listTypeIndex === 2) {
            resultInfo = await requestUserFriendInfo(userID,2);
            if(resultInfo.resultCode !== 0) {
              toast.error(resultInfo.message);
            } else {
              setFriendInvitedListViewTable(makeTableFromInvitedList(resultInfo.data));
              if(resultInfo.data.length === 0) {
                toast.info('친구에게 요청받은 메세지가 없습니다.');
              }
            }
          }

          console.log('resultInfo=',JSON.stringify(resultInfo,null,2));

          setStartLoading(false);
        }, 200);
    };

    useEffect(() => {
        const fetchData = async () => {
            await reloadUserFriendInfo(props.targetUserID);
        };

        fetchData();
    },[listTypeIndex]);

    return (
        <contentStyled.ContentBody>
            <contentStyled.FilterGroup>
                <contentStyled.FilterItem>
                    <span id='name'>유형</span>
                    <span id='dropdown'><DropBox width='10vw' height='2vw' text={listTypeTable[listTypeIndex].name} fontSize='0.6vw' itemList={listTypeTable} menuItemClick={(item)=>onQuestTypeDropMenuClick(item)} /></span>
                </contentStyled.FilterItem>
                <contentStyled.FilterItem marginLeft='27vw'>
                    <span id='button'><Button1 responsive='1.6' bgColor="var(--btn-secondary-color)" width="10vw" height="1.7vw" onClick={(e) => {return false}}>
                        퀘스트 보상수령이력 보기
                    </Button1></span>
                </contentStyled.FilterItem>
            </contentStyled.FilterGroup>
            <contentStyled.MainContentHeaderHorizontalLine marginBottom='1.5vw' />
            <br />
            {listTypeIndex===0?
            (
                <Table responsive='1.6' marginLeft='1vw' marginRight='1vw' colFormat={tableHSpace1Table}
                headerInfo={tableHeader1Info}
                bodyInfo={friendListViewTable}
                noPageControl={true}
                />
            ):
            (
                <Table responsive='1.6' marginLeft='1vw' marginRight='1vw' colFormat={listTypeIndex===1?tableHSpace2Table:tableHSpace3Table}
                headerInfo={listTypeIndex===1?tableHeader2Info:tableHeader3Info}
                bodyInfo={listTypeIndex===1?friendInviteListViewTable:friendInvitedListViewTable}
                noPageControl={true}
                />
            )}

        </contentStyled.ContentBody>
    )
};

export default UserFriendInfoPanel;