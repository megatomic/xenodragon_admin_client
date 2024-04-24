import React, {useState,useEffect,useCallback} from 'react';
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from '../users/UserDetailInfoPageStyles';
import dayjs from 'dayjs';
import * as utils from '../../../common/js/utils';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import CheckBox from '../../../components/CheckBox';
import Table from '../../../components/Table';
import TextArea1 from '../../../components/TextArea1';

import * as constants from '../../../common/constants';

const titleText = 'NFT 민팅내역 상세보기';

const NFTMintingDetailInfoPanel = (props) => {

    if(props.mintingLogInfo === undefined || props.mintingLogInfo === null) {
        return <></>;
    } else {
        console.log('mintingLogInfo=',props.mintingLogInfo);
    }

    const onOKButtonClick = (e) => {

        props.onNotiEditModeChange(false);
    };

    const onSubMenuClick = (e) => {

    };

    return (
        <contentStyled.ContentWrapper>
        <contentStyled.ContentHeader>
        <MediaQuery maxWidth={768}>
        &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
    </MediaQuery>
            <span id='subtitle'>{titleText}</span>
            <span>&nbsp;</span>
            <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='6vw' height='2vw' onClick={(e)=>onOKButtonClick(e)}>확인</Button1></span>
        </contentStyled.ContentHeader>
        <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
        <br />
        <contentStyled.ContentBody>
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
            <div id="title">
                <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;기본 정보</label>
                <div></div>
            </div>
            </contentStyled.SettingGroupArea>
            <styled.Table marginLeft='2vw' marginRight='8vw'>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>회차</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start'}}>{props.mintingLogInfo.activityCount}</styled.TableCell>
            </styled.TableRow>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>패키지 여부</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start'}}>{props.mintingLogInfo.packageType===0?"일반":"패키지"}</styled.TableCell>
            </styled.TableRow>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>설명</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start'}}>{props.mintingLogInfo.desc}</styled.TableCell>
            </styled.TableRow>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>수량</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start'}}>{props.mintingLogInfo.quantity}</styled.TableCell>
            </styled.TableRow>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>민팅 주소</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start'}}>{props.mintingLogInfo.targetAddress}</styled.TableCell>
            </styled.TableRow>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>민팅 일시</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start'}}>{dayjs(props.mintingLogInfo.creationTime).format('YYYY-MM-DD HH:mm:ss')}</styled.TableCell>
            </styled.TableRow>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>그룹ID</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start'}}>{props.mintingLogInfo.reqGroupID}</styled.TableCell>
            </styled.TableRow>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>민팅 데이터</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start',paddingTop:'0.5vw',paddingBottom:'0.5vw'}}>{props.mintingLogInfo.data}</styled.TableCell>
            </styled.TableRow>
            </styled.Table>
            <br /><br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;패키지 정보</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea>
                    <br />
                    <div id='item-part1'>
                        &nbsp;&nbsp;{''}&nbsp;&nbsp;&nbsp;&nbsp;<TextArea1 responsive='1.6' value={props.mintingLogInfo.packageData} width="54vw" height="6vw" readOnly={true} />
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
        </contentStyled.ContentBody>
    </contentStyled.ContentWrapper>
    )
};

export default NFTMintingDetailInfoPanel;