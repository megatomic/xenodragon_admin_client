import React, {useState,useCallback,useEffect,useRef} from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';

import * as mainStyled from '../../MainPageStyles';
import * as contentStyled from '../../MainContentStyles';
import * as pageStyled from '../UserDetailInfoPageStyles';

import Button1 from '../../../../components/Button1';
import RadioGroup from '../../../../components/RadioGroup';
import Table from '../../../../components/Table';
import DropBox from '../../../../components/DropBox';

import useCommon from '../../../../store/useCommonStorageManager';
import useUser from '../../../../store/useUserDataManager';

const questTypeTable = [
    {id:1, name:'전체'},
    {id:2, name:'일일 퀘스트'},
    {id:3, name:'주간 퀘스트'},
    {id:4, name:'시즌 퀘스트'}
];

const tableHeader1Info = ['종류','퀘스트명','진행상태','보상내역'];
const tableContent1Info = [
    ['Daily','일일 퀘스트 모두 클리어하기','3 / 6', '500 골드'],
    ['일반','던전모드 5번 클리어하기','1 / 5', '미스터리 상자 1개']
];

const tableHSpace1Table = '1fr 1fr 1fr 2fr';


const tableHeader2Info = ['생성시각','퀘스트명','보상내역','수령여부'];
const tableContent2Info = [
    ['2022-12-15 12:07:25','일일 퀘스트 모두 클리어하기','100 골드', '수령'],
    ['2022-12-15 12:07:25','던전모드 5번 클리어하기','20 젬', '수령']
];

const tableHSpace2Table = '1fr 1.5fr 1.5fr 0.8fr';

const UserQuestInfoPanel = (props) => {

    const { startLoading, setStartLoading } = useCommon();
    const {requestUserQuestInfo} = useUser();  
    const [userQuestList, setUserQuestList] = useState([]);

    const [subMenuIndex, setSubMenuIndex] = useState(0);
    const [questTypeIndex, setQuestTypeIndex] = useState(0);

    const onQuestTypeDropMenuClick = (item) => {

    };

    const reloadUserQuestInfo = (userID) => {

        setStartLoading(true);
        setTimeout(async () => {
          const resultInfo = await requestUserQuestInfo(userID);
    
          console.log('questInfo=',resultInfo);
    
          setUserQuestList(resultInfo.data);
          // if (resultInfo.resultCode === 0) {
          //   setUserList(makeTableFromUserList(resultInfo.data));
          // } else {
          //   toast.error(resultInfo.message);
          // }
          setStartLoading(false);
        }, 200);
      };
    
    useEffect(()=> {
        reloadUserQuestInfo(props.targetUserID);
    },[]);

    const onSubMenuButtonClick = (idx) => {
        setSubMenuIndex(idx);
    };

    return (
        <contentStyled.ContentBody>
            <contentStyled.FilterGroup>
                {
                    subMenuIndex===0 && (
                        <>
                            <contentStyled.FilterItem>
                                <span id='name'>분류1</span>
                                <span id='dropdown'><DropBox width='10vw' height='2vw' text={questTypeTable[questTypeIndex].name} fontSize='0.6vw' itemList={questTypeTable} menuItemClick={(item)=>onQuestTypeDropMenuClick(item)} /></span>
                            </contentStyled.FilterItem>
                            <contentStyled.FilterItem marginLeft='22vw'>
                                <RadioGroup responsive='1.4' initButtonIndex={0} interMargin='0.4vw' nameTable={['진행 퀘스트 목록','퀘스트 보상수령 이력']} buttonClicked={(idx)=>onSubMenuButtonClick(idx)} />
                            </contentStyled.FilterItem>
                        </>
                    )
                }
                {
                    subMenuIndex===1 && (
                        <>
                            <contentStyled.FilterItem marginLeft='35.5vw'>
                                <RadioGroup responsive='1.4' initButtonIndex={1} interMargin='0.4vw' nameTable={['진행 퀘스트 목록','퀘스트 보상수령 이력']} buttonClicked={(idx)=>onSubMenuButtonClick(idx)} />
                            </contentStyled.FilterItem>
                        </>
                    )
                }
            </contentStyled.FilterGroup>
            <contentStyled.MainContentHeaderHorizontalLine marginBottom='1.5vw' />
            <br />
            {
                subMenuIndex===0 && ( // 진행 퀘스트 목록
                <div>
                {
                    userQuestList.map(questInfo=>(
                        <div>
                            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                            <div id="title">
                                <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;퀘스트({questInfo.id})</label>
                                <div></div>
                            </div>
                                </contentStyled.SettingGroupArea>
                                <pageStyled.Table marginLeft='2vw' marginRight='5vw'>
                                    <pageStyled.TableRow height='2vw'>
                                        <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>퀘스트ID</pageStyled.TableCell>
                                        <pageStyled.TableCell width='11.5vw'>{questInfo.questId}</pageStyled.TableCell>
                                        <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>Goal Type</pageStyled.TableCell>
                                        <pageStyled.TableCell width='11.5vw'>{questInfo.goalType}</pageStyled.TableCell>
                                        <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>Goal Qty</pageStyled.TableCell>
                                        <pageStyled.TableCell>{questInfo.goalQuantity}</pageStyled.TableCell>
                                    </pageStyled.TableRow>
                                    <pageStyled.TableRow height='2vw'>
                                        <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>달성 시각</pageStyled.TableCell>
                                        <pageStyled.TableCell>{dayjs(questInfo.achieveTime).format('YYYY-MM-DD HH:mm:ss')}</pageStyled.TableCell>
                                        <pageStyled.TableCell color='var(--primary-color)' bold>보상수령</pageStyled.TableCell>
                                        <pageStyled.TableCell>{questInfo.isReward===true?'O':'X'}</pageStyled.TableCell>
                                        <pageStyled.TableCell color='var(--primary-color)' bold>Reset Time</pageStyled.TableCell>
                                        <pageStyled.TableCell>{dayjs(questInfo.resetTime).format('YYYY-MM-DD HH:mm:ss')}</pageStyled.TableCell>
                                    </pageStyled.TableRow>
                                    <pageStyled.TableRow height='2vw'>
                                        <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>활성화</pageStyled.TableCell>
                                        <pageStyled.TableCell>{questInfo.isActive===true?'O':'X'}</pageStyled.TableCell>
                                        <pageStyled.TableCell color='var(--primary-color)' bold>업뎨이트 시각</pageStyled.TableCell>
                                        <pageStyled.TableCell>{dayjs(questInfo.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</pageStyled.TableCell>
                                        <pageStyled.TableCell color='var(--primary-color)' bold>생성 시각</pageStyled.TableCell>
                                        <pageStyled.TableCell>{dayjs(questInfo.createdAt).format('YYYY-MM-DD HH:mm:ss')}</pageStyled.TableCell>
                                    </pageStyled.TableRow>
                                    <pageStyled.TableRow height='2vw'>
                                        <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>퀘스트 시작일시</pageStyled.TableCell>
                                        <pageStyled.TableCell>{dayjs(questInfo.questInfo.questBegin).format('YYYY-MM-DD HH:mm:ss')}</pageStyled.TableCell>
                                        <pageStyled.TableCell color='var(--primary-color)' bold>퀘스트 종료일시</pageStyled.TableCell>
                                        <pageStyled.TableCell>{dayjs(questInfo.questInfo.questEnd).format('YYYY-MM-DD HH:mm:ss')}</pageStyled.TableCell>
                                        <pageStyled.TableCell color='var(--primary-color)' bold>보상ID</pageStyled.TableCell>
                                        <pageStyled.TableCell>{questInfo.questInfo.rewardId}</pageStyled.TableCell>
                                    </pageStyled.TableRow>
                                </pageStyled.Table>
                        <br /><br />
                        </div>
                    ))
                }
                </div>
                )
            }
            {
                subMenuIndex===1 && ( // 퀘스트 보상수령 이력
                    <Table responsive='1.6' marginLeft='3vw' marginRight='3vw' colFormat={tableHSpace2Table}
                    headerInfo={tableHeader2Info}
                    bodyInfo={tableContent2Info}
                    noPageControl={true}
                    />
                )
            }
        </contentStyled.ContentBody>
    )
};

export default UserQuestInfoPanel;