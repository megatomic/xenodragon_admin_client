import React from 'react';
import styled from 'styled-components';

import * as contentStyled from '../../MainContentStyles';
import * as pageStyled from '../UserDetailInfoPageStyles';

import Button1 from '../../../../components/Button1';
import RadioGroup from '../../../../components/RadioGroup';
import Table from '../../../../components/Table';

const StExpditionInfoWrapper = styled.div`
    border: 0.07vw solid var(--primary-color);
    border-radius: 0.4vw;
    margin: 0 1vw 1vw 1vw;
    padding: 1.2vw;
    font-size: 0.7vw;
`;


const StExpeditionBasicInfoPanel = styled.div`
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

const StExpeditionPropertyPanel = styled.div`
    margin-top: 1vw;
`;

const ExpeditionBasicInfoPanel = (props) => {
    return (
        <contentStyled.ContentBody>
        <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
        <div id="title">
            <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;기본 정보</label>
            <div></div>
        </div>
    </contentStyled.SettingGroupArea>
    <pageStyled.Table marginLeft='2vw' marginRight='5vw'>
        <pageStyled.TableRow height='2vw'>
            <pageStyled.TableCell width='16vw' color='var(--primary-color)' bold>남은 탐험횟수</pageStyled.TableCell>
            <pageStyled.TableCell width='16vw' color='var(--primary-color)' bold>탐험 드래곤 수</pageStyled.TableCell>
            <pageStyled.TableCell width='16vw' color='var(--primary-color)' bold>최근 탐험완료 정보</pageStyled.TableCell>
        </pageStyled.TableRow>
        <pageStyled.TableRow height='2vw'>
            <pageStyled.TableCell>2</pageStyled.TableCell>
            <pageStyled.TableCell>13</pageStyled.TableCell>
            <pageStyled.TableCell>오팔숲</pageStyled.TableCell>
        </pageStyled.TableRow>
    </pageStyled.Table>
    <br /><br />
    <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
        <div id="title">
            <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;지역별 탐험현황</label>
            <div></div>
        </div>
    </contentStyled.SettingGroupArea>            
    <br />
        {props.expeditionInfoList.map((info,index)=>{
            return (
                <StExpditionInfoWrapper>
                    <StExpeditionBasicInfoPanel>
                        <span id='name'>이름</span>
                        <span id='value'>{info.name}</span>
                        <span id='name'>탐험 드래곤수/해금 슬롯수</span>
                        <span id='value'>{info.dragonNumOnExpedition}/{info.unlockedSlotNum}</span>
                        <span id='name'>탐험 시작시각</span>
                        <span id='value'>{info.expditionStartTime}</span>
                        <span id='name'>탐험 종료시각</span>
                        <span id='value'>{info.expeditionEndTime}</span>
                    </StExpeditionBasicInfoPanel>
                    <StExpeditionPropertyPanel>
                    <pageStyled.Table marginLeft='1vw' marginRight='1vw'>
                        <pageStyled.TableRow height='2vw'>
                            <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>1시간 보상</pageStyled.TableCell>
                            <pageStyled.TableCell width='15vw'><label>20 골드</label></pageStyled.TableCell>
                            <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>3시간 보상</pageStyled.TableCell>
                            <pageStyled.TableCell width='15vw'><label>30 골드</label></pageStyled.TableCell>
                        </pageStyled.TableRow>
                        <pageStyled.TableRow height='2vw'>
                            <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>6시간 보상</pageStyled.TableCell>
                            <pageStyled.TableCell><label>50 골드</label></pageStyled.TableCell>
                            <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>12시간 보상</pageStyled.TableCell>
                            <pageStyled.TableCell><label>100 골드,10 젬</label></pageStyled.TableCell>
                        </pageStyled.TableRow>
                    </pageStyled.Table>
                    <br />
                    <pageStyled.Table marginLeft='1vw' marginRight='1vw'>
                        <pageStyled.TableRow height='2vw'>
                            <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>슬롯1 드래곤</pageStyled.TableCell>
                            <pageStyled.TableCell width='15vw'><label>{info.dragonOnSlot1!==null?info.dragonOnSlot1:'-'}</label></pageStyled.TableCell>
                            <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>슬롯2 드래곤</pageStyled.TableCell>
                            <pageStyled.TableCell width='15vw'><label>{info.dragonOnSlot2!==null?info.dragonOnSlot2:'-'}</label></pageStyled.TableCell>
                        </pageStyled.TableRow>
                        <pageStyled.TableRow height='2vw'>
                            <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>슬롯3 드래곤</pageStyled.TableCell>
                            <pageStyled.TableCell><label>{info.dragonOnSlot3!==null?info.dragonOnSlot3:'-'}</label></pageStyled.TableCell>
                            <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>슬롯4 드래곤</pageStyled.TableCell>
                            <pageStyled.TableCell><label>{info.dragonOnSlot4!==null?info.dragonOnSlot4:'-'}</label></pageStyled.TableCell>
                        </pageStyled.TableRow>
                    </pageStyled.Table>
                    </StExpeditionPropertyPanel>
                </StExpditionInfoWrapper>
            )
        })}
        </contentStyled.ContentBody>
    )
}

export default ExpeditionBasicInfoPanel;