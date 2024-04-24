
import React,{useState} from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';

import * as mainStyled from '../../MainPageStyles';
import * as contentStyled from '../../MainContentStyles';
import * as pageStyled from '../UserDetailInfoPageStyles';

import Button1 from '../../../../components/Button1';

const StGearInfoWrapper = styled.div`
    border: 0.07vw solid var(--primary-color);
    border-radius: 0.4vw;
    margin: 0 1vw 1vw 1vw;
    padding: 1.2vw;
    font-size: 0.7vw;
`;


const StGearBasicInfoPanel = styled.div`
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

const StGearPropertyPanel = styled.div`
    margin-top: 1vw;
`;

const GearListInfoPanel = (props) => {

    const gearList = props.gearList;

    return (
        <contentStyled.ContentBody>
                    {
                gearList.map((gearInfo,index)=>{
                    return (
                        <StGearInfoWrapper>
                            <StGearBasicInfoPanel>
                                <span id='name'>기어UID</span>
                                <span id='value'>{gearInfo.gearUId}</span>
                                <span id='name'>기어 타입</span>
                                <span id='value'>{gearInfo.dragonGearType}</span>
                                <span id='name'>등급</span>
                                <span id='value'>{gearInfo.grade}</span>
                                <span id='name'>레벨</span>
                                <span id='value'>{gearInfo.level}</span>
                                <span id='name'>생성 일시</span>
                                <span id='value'>{dayjs(gearInfo.createdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                                <span id='name'>Usable</span>
                                <span id='value'>{gearInfo.usable}</span>
                            </StGearBasicInfoPanel>
                            <StGearPropertyPanel>
                            <pageStyled.Table marginLeft='1vw' marginRight='1vw'>
                                <pageStyled.TableRow height='2vw'>
                                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>민트 No.</pageStyled.TableCell>
                                    <pageStyled.TableCell width='15vw'>
                                    <pageStyled.TableCellContent>
                                        <label>{gearInfo.gearInfo.mintNo}</label>
                                        <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                            변경
                                        </Button1></span>
                                    </pageStyled.TableCellContent>
                                    </pageStyled.TableCell>
                                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>스킬ID</pageStyled.TableCell>
                                    <pageStyled.TableCell width='15vw'>
                                    <pageStyled.TableCellContent>
                                        <label>{gearInfo.gearInfo.skillId}</label>
                                        <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                            변경
                                        </Button1></span>
                                    </pageStyled.TableCellContent>
                                    </pageStyled.TableCell>
                                </pageStyled.TableRow>
                                <pageStyled.TableRow height='2vw'>
                                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>내구도</pageStyled.TableCell>
                                    <pageStyled.TableCell>
                                        <pageStyled.TableCellContent>
                                            <label>{gearInfo.id}</label>
                                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                            변경
                                        </Button1></span>
                                        </pageStyled.TableCellContent>
                                    </pageStyled.TableCell>
                                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>장착 드래곤</pageStyled.TableCell>
                                    <pageStyled.TableCell>
                                        <pageStyled.TableCellContent>
                                            <label>{gearInfo.equipUserDragonId}</label>
                                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                            변경
                                        </Button1></span>
                                        </pageStyled.TableCellContent>
                                    </pageStyled.TableCell>
                                </pageStyled.TableRow>
                                
                            </pageStyled.Table>
                            </StGearPropertyPanel>
                        </StGearInfoWrapper>
                    )
                })
            }
        </contentStyled.ContentBody>
    )
}

export default GearListInfoPanel;