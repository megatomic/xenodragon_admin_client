import React, {useState,useCallback,useEffect,useRef} from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';

import * as mainStyled from '../../MainPageStyles';
import * as contentStyled from '../../MainContentStyles';
import * as pageStyled from '../UserDetailInfoPageStyles';

import Button1 from '../../../../components/Button1';
import InputField1 from '../../../../components/InputField1';
import CheckBox from '../../../../components/CheckBox';
import Table from '../../../../components/Table';

const StTeamInfoWrapper = styled.div`
    border: 0.07vw solid var(--primary-color);
    border-radius: 0.4vw;
    margin: 0 1vw 1vw 1vw;
    padding: 1.2vw;
    font-size: 0.7vw;
`;


const StTeamBasicInfoPanel = styled.div`
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

const StTeamPropertyPanel = styled.div`
    margin-top: 1vw;
`;


const tableHeaderInfo = ['ID','포메이션','레벨','갱신시각'];
const tableContentInfo = [
    ['기본형','1','1,2,3','__button='+JSON.stringify({name:'강화 이력 보기',bgColor:'var(--btn-primary-color)',width:'7vw',height:'1.6vw',tag:'button.row1'})],
    ['정면 방어형','2','4,5,6','__button='+JSON.stringify({name:'강화 이력 보기', bgColor:'var(--btn-primary-color)',width:'7vw',height:'1.6vw',tag:'button.row2'})]
];

const tableHSpaceTable = '1fr 1fr 1fr 2fr';

const makeTableFromTeamFormList = (teamFormList) => {
    const result = teamFormList.map((formInfo, idx) => {
      return [formInfo.id.toString(), formInfo.formation.toString(), formInfo.level.toString(), formInfo.updatedAt];
    });
  
    return result;
};

const UserDragonTeamInfoPanel = (props) => {

    const teamList = props.teamInfo;
    const teamFormList = makeTableFromTeamFormList(props.teamFormInfo);

    const [teamInfoList, setTeamInfoList] = useState([
        {
            tag:'Team #1', desc:'최애 팀', formation:'기본형', level:1,
            dragonOnSlot1:'234234523534435', dragonOnSlot2:'234234523534435', dragonOnSlot3:'234234523534435'
        },
        {
            tag:'Team #2', desc:'최강 팀', formation:'기본형', level:2,
            dragonOnSlot1:'234234523534435', dragonOnSlot2:'234234523534435', dragonOnSlot3:'234234523534435'
        }
    ]);

    const onTableButtonClick = (e,tag) => {
        console.log(tag);
    };

    return (
        <contentStyled.ContentBody>
            <br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;팀 포메이션</label>
                    <div></div>
                </div>
            </contentStyled.SettingGroupArea>
            <Table responsive='1.6' marginLeft='3vw' marginRight='3vw' colFormat={tableHSpaceTable}
                        headerInfo={tableHeaderInfo}
                        bodyInfo={teamFormList}
                        noPageControl={true}
                        onButtonClick={(e,tag)=>onTableButtonClick(e,tag)}
                        />
            <br /><br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;팀 정보</label>
                    <div></div>
                </div>
            </contentStyled.SettingGroupArea>
            <br />
            {
                teamList.map((info,index)=>{
                    return (
                        <StTeamInfoWrapper>
                            <StTeamBasicInfoPanel>
                                <span id='name'>팀번호</span>
                                <span id='value'>{info.teamNo}</span>
                                <span id='name'>팀이름</span>
                                <span id='value'>{info.teamName}</span>
                                <span id='name'>배치 드래곤 수</span>
                                <span id='value'>{info.dragonCount}</span>
                                <span id='name'>사용여부</span>
                                <span id='value'>{info.isUse===true?'O':'X'}</span>
                                <span id='name'>포메이션</span>
                                <span id='value'>{info.selectFormation}</span>
                                <span id='name'>갱신 시각</span>
                                <span id='value'>{dayjs(info.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                            </StTeamBasicInfoPanel>
                            <StTeamPropertyPanel>
                            <pageStyled.Table marginLeft='1vw' marginRight='1vw'>
                                <pageStyled.TableRow height='2vw'>
                                    <pageStyled.TableCell width='16vw' color='var(--primary-color)' bold>SLOT1 장착 드래곤</pageStyled.TableCell>
                                    <pageStyled.TableCell width='16vw' color='var(--primary-color)' bold>SLOT2 장착 드래곤</pageStyled.TableCell>
                                    <pageStyled.TableCell width='16vw' color='var(--primary-color)' bold>SLOT3 장착 드래곤</pageStyled.TableCell>
                                </pageStyled.TableRow>
                                <pageStyled.TableRow height='2vw'>
                                    {
                                        info.userTeamDragons!==null && (
                                            info.userTeamDragons.map(dragonInfo=>
                                                <pageStyled.TableCell width='16vw'>dragonNo:{dragonInfo.dragonNo}, userTeamId:{dragonInfo.userTeamId}, userDragonId:{dragonInfo.userDragonId}</pageStyled.TableCell>
                                            )
                                        )
                                    }
                                </pageStyled.TableRow>  
                            </pageStyled.Table>
                            </StTeamPropertyPanel>
                        </StTeamInfoWrapper>
                    )
                })
            }
        </contentStyled.ContentBody>
    )
};

export default UserDragonTeamInfoPanel;