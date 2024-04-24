
import React,{useState} from 'react';
import styled from 'styled-components';

import * as mainStyled from '../../MainPageStyles';
import * as contentStyled from '../../MainContentStyles';
import * as pageStyled from '../UserDetailInfoPageStyles';

import Button1 from '../../../../components/Button1';

const StDragonInfoWrapper = styled.div`
    border: 0.07vw solid var(--primary-color);
    border-radius: 0.4vw;
    margin: 0 1vw 1vw 1vw;
    padding: 1.2vw;
    font-size: 0.7vw;
`;


const StDragonBasicInfoPanel = styled.div`
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

const StDragonPropertyPanel = styled.div`
    margin-top: 1vw;
`;

const DragonListInfoPanel = (props) => {

    const dragonList = props.dragonList;

    return (
        <contentStyled.ContentBody>
                    {
                dragonList.map((dragonInfo,index)=>{
                    return (
                        <StDragonInfoWrapper>
                            <StDragonBasicInfoPanel>
                                <span id='name'>이름</span>
                                <span id='value'>{dragonInfo.dragonInfo.name}</span>
                                <span id='name'>DUID</span>
                                <span id='value'>{dragonInfo.dragonUId}</span>
                                <span id='name'>등급</span>
                                <span id='value'>{dragonInfo.grade}</span>
                                <span id='name'>레벨</span>
                                <span id='value'>{dragonInfo.level}</span>
                                <span id='name'>파워</span>
                                <span id='value'>{dragonInfo.power}</span>
                                <span id='name'>경험치</span>
                                <span id='value'>{dragonInfo.exp}</span>
                                <span id='name'>사용중</span>
                                <span id='value'>{dragonInfo.isUse===true?'O':'X'}</span>
                            </StDragonBasicInfoPanel>
                            <StDragonPropertyPanel>
                            <pageStyled.Table marginLeft='1vw' marginRight='1vw'>
                                <pageStyled.TableRow height='2vw'>
                                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>스피릿</pageStyled.TableCell>
                                    <pageStyled.TableCell width='15vw'>
                                    <pageStyled.TableCellContent>
                                        <label>{dragonInfo.id}%</label>
                                        <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                            변경
                                        </Button1></span>
                                    </pageStyled.TableCellContent>
                                    </pageStyled.TableCell>
                                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>레벨</pageStyled.TableCell>
                                    <pageStyled.TableCell width='15vw'>
                                    <pageStyled.TableCellContent>
                                        <label>{dragonInfo.id}</label>
                                        <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                            변경
                                        </Button1></span>
                                    </pageStyled.TableCellContent>
                                    </pageStyled.TableCell>
                                </pageStyled.TableRow>
                                <pageStyled.TableRow height='2vw'>
                                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>EXP</pageStyled.TableCell>
                                    <pageStyled.TableCell>
                                        <pageStyled.TableCellContent>
                                            <label>{dragonInfo.id} / {dragonInfo.id}</label>
                                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                            변경
                                        </Button1></span>
                                        </pageStyled.TableCellContent>
                                    </pageStyled.TableCell>
                                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>헤더 장착 기어</pageStyled.TableCell>
                                    <pageStyled.TableCell>
                                        <pageStyled.TableCellContent>
                                            <label>{dragonInfo.id}</label>
                                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                            변경
                                        </Button1></span>
                                        </pageStyled.TableCellContent>
                                    </pageStyled.TableCell>
                                </pageStyled.TableRow>
                                <pageStyled.TableRow height='2vw'>
                                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>왼앞발 장착 기어</pageStyled.TableCell>
                                    <pageStyled.TableCell>
                                        <pageStyled.TableCellContent>
                                            <label>{dragonInfo.id}</label>
                                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                            변경
                                        </Button1></span>
                                        </pageStyled.TableCellContent>
                                    </pageStyled.TableCell>
                                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>오른앞발 장착 기어</pageStyled.TableCell>
                                    <pageStyled.TableCell>
                                        <pageStyled.TableCellContent>
                                            <label>{dragonInfo.id}</label>
                                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                            변경
                                        </Button1></span>
                                        </pageStyled.TableCellContent>
                                    </pageStyled.TableCell>
                                </pageStyled.TableRow>
                                <pageStyled.TableRow height='2vw'>
                                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>왼뒷발 장착 기어</pageStyled.TableCell>
                                    <pageStyled.TableCell>
                                        <pageStyled.TableCellContent>
                                            <label>{dragonInfo.id}</label>
                                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                            변경
                                        </Button1></span>
                                        </pageStyled.TableCellContent>
                                    </pageStyled.TableCell>
                                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>오른뒷발 장착 기어</pageStyled.TableCell>
                                    <pageStyled.TableCell>
                                        <pageStyled.TableCellContent>
                                            <label>{dragonInfo.id}</label>
                                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                            변경
                                        </Button1></span>
                                        </pageStyled.TableCellContent>
                                    </pageStyled.TableCell>
                                </pageStyled.TableRow>
                            </pageStyled.Table>
                            </StDragonPropertyPanel>
                        </StDragonInfoWrapper>
                    )
                })
            }
        </contentStyled.ContentBody>
    )
}

export default DragonListInfoPanel;