import React, {useState,useCallback,useEffect,useRef} from 'react';
import styled from 'styled-components';

import * as mainStyled from '../../MainPageStyles';
import * as contentStyled from '../../MainContentStyles';
import * as pageStyled from '../UserDetailInfoPageStyles';

import Button1 from '../../../../components/Button1';
import InputField1 from '../../../../components/InputField1';
import Table from '../../../../components/Table';
import DropBox from '../../../../components/DropBox';

const chapterTable = [
    {id:1, name:'챕터1'},
    {id:2, name:'챕터2'},
    {id:3, name:'챕터3'},
    {id:4, name:'챕터4'},
];

const tableHeaderInfo = ['스테이지','최근 플레이시간','클리어 상태','보상내역','수령여부'];
const tableContentInfo = [
    ['1','2023-05-25 03:20:51','별:3','200 골드, 10 젬', '수령'],
    ['2','2023-05-25 03:20:51','별:2','300 골드, 20 젬', '수령'],
    ['3','2023-05-25 03:20:51','별:1','400 골드, 25 젬', '수령'],
    ['4','2023-05-25 03:20:51','별:2','500 골드, 30 젬', '수령'],
    ['5','2023-05-25 03:20:51','별:3','600 골드, 35 젬', '수령'],
];

const tableHSpaceTable = '0.8fr 1.2fr 0.8fr 2.5fr 0.8fr';

const UserAdventureInfoPanel = (props) => {

    const [chapterNo, setChapterNo] = useState(0);

    const onRewardHistoryChapterMenuClick = (item) => {

    };

    return (
        <pageStyled.Wrapper>
            <br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;기본 정보</label>
                    <div></div>
                </div>
            </contentStyled.SettingGroupArea>
            <pageStyled.Table marginLeft='2vw' marginRight='5vw'>
                <pageStyled.TableRow height='2vw'>
                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>최종 챕터</pageStyled.TableCell>
                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>최종 스테이지</pageStyled.TableCell>
                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>최근 플레이 정보</pageStyled.TableCell>
                </pageStyled.TableRow>
                <pageStyled.TableRow height='2vw'>
                    <pageStyled.TableCell>2</pageStyled.TableCell>
                    <pageStyled.TableCell>5</pageStyled.TableCell>
                    <pageStyled.TableCell>2-4</pageStyled.TableCell>
                </pageStyled.TableRow>
            </pageStyled.Table>
            <br /><br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;스테이지 보상이력</label>
                    <div></div>
                </div>
            </contentStyled.SettingGroupArea>

            <contentStyled.FilterGroup>
                <contentStyled.FilterItem>
                    <span id='name'>챕터</span>
                    <span id='dropdown'><DropBox width='10vw' height='2vw' text={chapterTable[chapterNo].name} fontSize='0.6vw' itemList={chapterTable} menuItemClick={(item)=>onRewardHistoryChapterMenuClick(item)} /></span>
                </contentStyled.FilterItem>
            </contentStyled.FilterGroup>

            <br />
            <Table responsive='1.6' marginLeft='4vw' marginRight='4vw' colFormat={tableHSpaceTable}
                        headerInfo={tableHeaderInfo}
                        bodyInfo={tableContentInfo}
                        noPageControl={true}
                        />
        </pageStyled.Wrapper>
    )
};

export default UserAdventureInfoPanel;