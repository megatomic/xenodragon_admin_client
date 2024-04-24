import React, {useState,useCallback,useEffect,useRef,forwardRef} from 'react';
import styled from 'styled-components';
import * as pageStyled from '../UserDetailInfoPageStyles';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as utils from '../../../../common/js/utils';
import { toast } from 'react-toastify';

import * as mainStyled from '../../MainPageStyles';
import * as contentStyled from '../../MainContentStyles';

import Button1 from '../../../../components/Button1';
import InputField1 from '../../../../components/InputField1';
import DropBox from '../../../../components/DropBox';
import Table from '../../../../components/Table';
import Popup from '../../../../components/Popup';
import dayjs from 'dayjs';

const StArenaInfoWrapper = styled.div`
    border: 0.07vw solid var(--primary-color);
    border-radius: 0.4vw;
    margin: 0 1vw 1vw 1vw;
    padding: 1.2vw;
    font-size: 0.7vw;
`;


const StArenaBasicInfoPanel = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    #name {
        color: var(--primary-color);
        font-weight: bold;
        margin-right: 1vw;
    }
    #value {
        margin-right: 1.5vw;
    }
`;

const StArenaPropertyPanel = styled.div`
    margin-top: 1vw;
`;

const StArenaInfoFooterPanel = styled.div`
    margin-top: 1vw;

    display: flex;
    justify-content: center;

    #button {
        margin: 0 0.6vw;
    }
`;

const arenaFinalResultTable = [
    {id:1, name:'전체'},
    {id:2, name:'승'},
    {id:3, name:'무'},
    {id:4, name:'패'}
];

const DatePickerInput = forwardRef((props) => {
    return (
        <InputField1 width='8vw' height='2vw' {...props} />
    )
});

const UserArenaInfoPanel = (props) => {
    const [arenaRivalID, setArenaRivalID] = useState('');
    const [arenaResultIndex, setArenaResultIndex] = useState(0);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const startInputRef = useRef();
    const endInputRef = useRef();

    const [arenaHistoryInfoList, setArenaHistoryInfoList] = useState([
        {
            battleTime:'2022-12-15 12:17:54', rivalID:'pycaso99',playTime:'90',battleNum:2,battleResult:2,
            rivalDragon1:'칼리고(SSR,Lv.13,9870)',rivalDragon2:'칼리고(SSR,Lv.13,9870)',rivalDragon3:'칼리고(SSR,Lv.13,9870)',
            rewardInfo:'[{"type":"gold","value":300},{"type":"gem","value":20}]'
        },
        {
            battleTime:'2022-12-14 10:22:31', rivalID:'megatomic',playTime:'86',battleNum:1,battleResult:2,
            rivalDragon1:'칼리고(SSR,Lv.13,9870)',rivalDragon2:'칼리고(SSR,Lv.13,9870)',rivalDragon3:'칼리고(SSR,Lv.13,9870)',
            rewardInfo:'[{"type":"gold","value":300},{"type":"gem","value":20}]'
        },
        {
            battleTime:'2022-12-12 10:22:31', rivalID:'megatomic',playTime:'86',battleNum:1,battleResult:3,
            rivalDragon1:'칼리고(SSR,Lv.13,9870)',rivalDragon2:'칼리고(SSR,Lv.13,9870)',rivalDragon3:'칼리고(SSR,Lv.13,9870)',
            rewardInfo:'[{"type":"gold","value":300},{"type":"gem","value":20}]'
        },
        {
            battleTime:'2022-12-11 10:22:31', rivalID:'bale1971',playTime:'86',battleNum:1,battleResult:4,
            rivalDragon1:'칼리고(SSR,Lv.13,9870)',rivalDragon2:'칼리고(SSR,Lv.13,9870)',rivalDragon3:'칼리고(SSR,Lv.13,9870)',
            rewardInfo:'[{"type":"gold","value":300},{"type":"gem","value":20}]'
        }
    ]);

    const [filterHistoryInfoList, setFilterHistoryInfoList] = useState([]);

    const onTitleKeywordChanged = (e) => {
        setArenaRivalID(e.target.value.trim());
    };

    const onKeyPress = (e) => {
        if(e.key === 'Enter') {
            onSearchBattleHistoryClick(e);
        }
    };

    const onSearchBattleHistoryClick = (e) => {

        makeFilteredHistoryList();
    };

    const makeFilteredHistoryList = () => {
        
        let infoList = arenaHistoryInfoList;
        
        if(arenaRivalID.trim() !== '') {
            infoList = infoList.filter(info=> {
                return (info.rivalID.indexOf(arenaRivalID) >= 0);
            });
        }

        if(startDate !== '' && endDate !== '') {
            const startTime = dayjs(utils.makeDateTimeStringFromDate(startDate));
            const endTime = dayjs(utils.makeDateTimeStringFromDate(endDate));
            infoList = infoList.filter(info=>{
                return dayjs(info.battleTime).isAfter(startTime) && dayjs(info.battleTime).isBefore(endTime);
            });
        }

        if(arenaResultIndex > 0) {
            infoList = infoList.filter(info=>{
                return (info.battleResult === arenaResultIndex+1);
            });
        }

        setFilterHistoryInfoList(infoList);
    };

    const onStartTimeDatePickerChanged = (date) => {
        setStartDate(date);
    
        if (endDate === '') {
          return;
        }
    
        const startDate2 = dayjs(utils.makeDateTimeStringFromDate(date));
        const endDate2 = dayjs(utils.makeDateTimeStringFromDate(endDate));
    
        if (startDate2.isBefore(endDate2) === false) {
          toast.error('시작일자는 종료일자보다 더 이전이어야 합니다.');
        }
      };
    
      const onEndTimeDatePickerChanged = (date) => {
        setEndDate(date);
    
        if (startDate === '') {
          return;
        }
    
        const startDate2 = dayjs(utils.makeDateTimeStringFromDate(startDate));
        const endDate2 = dayjs(utils.makeDateTimeStringFromDate(date));
    
        if (startDate2.isBefore(endDate2) === false) {
          toast.error('종료일자는 시작일자보다 더 나중이어야 합니다.');
        }
      };

    const onArenaResultDropMenuClick = (item) => {
        setArenaResultIndex(item.id-1);
    };

    const onSearchAllRivalUserClick = (e) => {
        setStartDate('');
        setEndDate('');
    };

    useEffect(()=> {
        makeFilteredHistoryList();
    },[arenaResultIndex]);

    return (
        <contentStyled.ContentBody>
        <contentStyled.FilterGroup>
            <contentStyled.FilterItem>
                <span id='name'>상대ID</span>
                <span id='input'><InputField1 width='12vw' height='2vw' placeholder={'대전 상대ID를 입력하세요.'} value={arenaRivalID} onKeyPress={(e)=>onKeyPress(e)} onChange={(e)=>onTitleKeywordChanged(e)} /></span>
                <span id='search'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onSearchBattleHistoryClick(e)}>검색</Button1></span>
            </contentStyled.FilterItem>
            <contentStyled.FilterItem>
                <span id='name'>최종 결과</span>
                <span id='dropdown'><DropBox width='10vw' height='2vw' text={arenaFinalResultTable[0].name} fontSize='0.6vw' itemList={arenaFinalResultTable} menuItemClick={(item)=>onArenaResultDropMenuClick(item)} /></span>
            </contentStyled.FilterItem>
            <contentStyled.FilterItem>
                <span id='name' style={{marginRight:'2vw'}}>대전 시각:</span>
                <span id='name'>시작일시</span>
                <span id='input'><DatePicker selected={startDate} onChange={onStartTimeDatePickerChanged} showTimeSelect dateFormat='Pp' timeIntervals={10} customInput={<DatePickerInput ref={startInputRef} />} /></span>
                <span id='name'>종료일시</span>
                <span id='input'><DatePicker selected={endDate} onChange={onEndTimeDatePickerChanged} showTimeSelect dateFormat='Pp' timeIntervals={10} customInput={<DatePickerInput ref={endInputRef} />} /></span>
                <span id='search'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onSearchAllRivalUserClick(e)}>전체</Button1></span>
            </contentStyled.FilterItem>
        </contentStyled.FilterGroup>
        <contentStyled.MainContentHeaderHorizontalLine marginBottom='1.5vw' />

        <br />
            {
                filterHistoryInfoList.map((info,index)=>{
                    return (
                        <StArenaInfoWrapper>
                            <StArenaBasicInfoPanel>
                                <span id='name'>대전시각</span>
                                <span id='value'>{info.battleTime}</span>
                                <span id='name'>상대ID</span>
                                <span id='value'>{info.rivalID}</span>
                                <span id='name'>플레이 시간</span>
                                <span id='value'>{info.playTime}</span>
                                <span id='name'>대전 횟수</span>
                                <span id='value'>{info.battleNum}</span>
                                <span id='name'>최종 결과</span>
                                <span id='value'>{arenaFinalResultTable[info.battleResult-1].name}</span>
                            </StArenaBasicInfoPanel>
                            <StArenaPropertyPanel>
                            <pageStyled.Table marginLeft='1vw' marginRight='1vw'>
                                <pageStyled.TableRow height='2vw'>
                                    <pageStyled.TableCell width='12vw' color='var(--primary-color)' bold>상대 드래곤1</pageStyled.TableCell>
                                    <pageStyled.TableCell width='33vw'><label>{'칼리고(등급:SSR,레벨:13,DUID:278238743874,배틀파워:27514)'}</label></pageStyled.TableCell>
                                </pageStyled.TableRow>
                                <pageStyled.TableRow height='2vw'>
                                    <pageStyled.TableCell width='12vw' color='var(--primary-color)' bold>상대 드래곤2</pageStyled.TableCell>
                                    <pageStyled.TableCell width='33vw'><label>{'칼리고(등급:SSR,레벨:13,DUID:278238743874,배틀파워:27514)'}</label></pageStyled.TableCell>
                                </pageStyled.TableRow>
                                <pageStyled.TableRow height='2vw'>
                                    <pageStyled.TableCell width='12vw' color='var(--primary-color)' bold>상대 드래곤3</pageStyled.TableCell>
                                    <pageStyled.TableCell width='33vw'><label>{'칼리고(등급:SSR,레벨:13,DUID:278238743874,배틀파워:27514)'}</label></pageStyled.TableCell>
                                </pageStyled.TableRow>
                            </pageStyled.Table>
                            <br />
                            <pageStyled.Table marginLeft='1vw' marginRight='1vw'>
                                <pageStyled.TableRow height='2vw'>
                                    <pageStyled.TableCell width='12vw' color='var(--primary-color)' bold>상대 드래곤1</pageStyled.TableCell>
                                    <pageStyled.TableCell width='33vw'><label>{'300 골드, 20 젬, 바람속성 포션 Lv.1x2개'}</label></pageStyled.TableCell>
                                </pageStyled.TableRow>
                            </pageStyled.Table>
                            </StArenaPropertyPanel>
                        </StArenaInfoWrapper>
                    )
                })
            }

    </contentStyled.ContentBody>
    )
};

export default UserArenaInfoPanel;