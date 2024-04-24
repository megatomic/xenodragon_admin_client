import React, {useState,useCallback,useEffect,useRef} from 'react';
import styled from 'styled-components';

import * as mainStyled from '../../MainPageStyles';
import * as contentStyled from '../../MainContentStyles';
import * as pageStyled from '../UserDetailInfoPageStyles';

import Button1 from '../../../../components/Button1';
import InputField1 from '../../../../components/InputField1';
import Table from '../../../../components/Table';
import DropBox from '../../../../components/DropBox';

import useCommon from '../../../../store/useCommonStorageManager';
import useUser from '../../../../store/useUserDataManager';
import { toast } from 'react-toastify';

const questTypeTable = [
    {id:1, name:'우편함 목록'},
    {id:2, name:'수령 이력'}
];

const tableHeader1Info = ['우편함ID','타이틀/내용','전송시각','보상내역'];
const tableContent1Info = [
    ['393029034','[접속장애 보상]:접속 장애에 대한 보상입니다.','2022-12-13 10:38:16', '500 골드,20 젬'],
    ['393029034','[접속장애 보상]:접속 장애에 대한 보상입니다.','2022-12-13 10:38:16', '500 골드,20 젬'],
    ['393029034','[접속장애 보상]:접속 장애에 대한 보상입니다.','2022-12-13 10:38:16', '500 골드,20 젬'],
    ['393029034','[접속장애 보상]:접속 장애에 대한 보상입니다.','2022-12-13 10:38:16', '500 골드,20 젬'],
    ['393029034','[접속장애 보상]:접속 장애에 대한 보상입니다.','2022-12-13 10:38:16', '500 골드,20 젬']
];
const tableHSpace1Table = '1fr 2fr 1fr 1.4fr';

const tableHeader2Info = ['수령일자','우편함ID','타이틀/내용','보상내역'];
const tableContent2Info = [
    ['2022-12-13 10:38:16', '393029034', '[접속장애 보상]:접속 장애에 대한 보상입니다.', '500 골드,20 젬'],
    ['2022-12-13 10:38:16', '393029034', '[접속장애 보상]:접속 장애에 대한 보상입니다.', '500 골드,20 젬']
];
const tableHSpace2Table = '1fr 1fr 2fr 1.4fr';

const UserInboxInfoPanel = (props) => {

    const { startLoading, setStartLoading } = useCommon();
    const {requestUserInboxInfo} = useUser();  
    const [userInboxList, setUserInboxList] = useState([]);

    const [questTypeIndex, setQuestTypeIndex] = useState(0);

    const onQuestTypeDropMenuClick = (item) => {
        setQuestTypeIndex(item.id-1);
    };

    const reloadUserInboxInfo = (userID) => {

        setStartLoading(true);
        setTimeout(async () => {
          const resultInfo = await requestUserInboxInfo(userID);
    
          console.log('inboxInfo=',resultInfo);
    
          if(resultInfo.resultCode === 0) {
            setUserInboxList(resultInfo.data);
          } else {
            toast.error(resultInfo.message);
          }

          // if (resultInfo.resultCode === 0) {
          //   setUserList(makeTableFromUserList(resultInfo.data));
          // } else {
          //   toast.error(resultInfo.message);
          // }
          setStartLoading(false);
        }, 200);
      };
    
    useEffect(()=> {
        reloadUserInboxInfo(props.targetUserID);
    },[]);

    return (
        <contentStyled.ContentBody>
            <contentStyled.FilterGroup>
                <contentStyled.FilterItem>
                    <span id='name'>유형</span>
                    <span id='dropdown'><DropBox width='10vw' height='2vw' text={questTypeTable[questTypeIndex].name} fontSize='0.6vw' itemList={questTypeTable} menuItemClick={(item)=>onQuestTypeDropMenuClick(item)} /></span>
                </contentStyled.FilterItem>
            </contentStyled.FilterGroup>
            <contentStyled.MainContentHeaderHorizontalLine marginBottom='1.5vw' />
            <br />
            {questTypeIndex===0?
            (
                <div>
                {
                    userInboxList.map(inboxInfo=>(
                        <div>
                            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                            <div id="title">
                                <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;우편({inboxInfo.id})</label>
                                <div></div>
                            </div>
                                </contentStyled.SettingGroupArea>
                                <pageStyled.Table marginLeft='2vw' marginRight='5vw'>
                                    <pageStyled.TableRow height='2vw'>
                                        <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>전송일시</pageStyled.TableCell>
                                        <pageStyled.TableCell>{inboxInfo.updatedAt}</pageStyled.TableCell>
                                    </pageStyled.TableRow>
                                    <pageStyled.TableRow height='2vw'>
                                        <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>제목</pageStyled.TableCell>
                                        <pageStyled.TableCell>{inboxInfo.messageSubject}</pageStyled.TableCell>
                                    </pageStyled.TableRow>
                                    <pageStyled.TableRow height='2vw'>
                                        <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>내용</pageStyled.TableCell>
                                        <pageStyled.TableCell>{inboxInfo.messageBody}</pageStyled.TableCell>
                                    </pageStyled.TableRow>
                                    <pageStyled.TableRow height='2vw'>
                                        <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>보상내용</pageStyled.TableCell>
                                        <pageStyled.TableCell style={{padding:'0.4vw',textAlign:'left'}}>
                                        {
                                           inboxInfo.userMessageItems !== null ? inboxInfo.userMessageItems.map(rewardItemInfo=>(
                                            <div style={{margin:'0.2vw'}}>
                                                <label>아이템 타입:{rewardItemInfo.itemType},&nbsp;</label>
                                                <label>아이템 ID:{rewardItemInfo.itemId},&nbsp;</label>
                                                <label>수량:{rewardItemInfo.quantity}</label>
                                            </div>
                                           )):<p></p>
                                        }</pageStyled.TableCell>
                                    </pageStyled.TableRow>
                                </pageStyled.Table>
                        <br /><br />
                        </div>
                    ))
                }
                </div>
            ):
            (
                <Table responsive='1.6' marginLeft='1vw' marginRight='1vw' colFormat={tableHSpace2Table}
                headerInfo={tableHeader2Info}
                bodyInfo={tableContent2Info}
                noPageControl={true}
                />
            )}

        </contentStyled.ContentBody>
    )
};

export default UserInboxInfoPanel;