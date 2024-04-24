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

const titleText = '쿠폰 발급내역 상세보기';

const processCouponCodeFormatting = (table) => {

    let result="";
    for(let coupon of table) {
        result += coupon + "\n";
    }
    return result;
}

const CouponDetailInfoPanel = (props) => {

    if(props.couponInfo === undefined || props.couponInfo === null) {
        return <></>;
    } else {
        console.log('couponInfo=',props.mintingLogInfo);
    }

    const onOKButtonClick = (e) => {

        props.onNotiEditModeChange(false);
    };

    const onDownloadCouponButtonClick = (e) => {

    };

    const onSubMenuClick = (e) => {

    };

    // couponID: number;
    // couponType: number;
    // couponDigit: number;
    // sharedCouponCode: string;
    // couponQty: number;
    // titleTable: any;
    // contentTable: any;
    // rewardData: string;
    // startTime: string;
    // endTime: string;
    // activationFlag: boolean;
    // creationTime: string;
    // couponData: string;

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
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>쿠폰 타입</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start'}}>{props.couponInfo.couponType===0?"개별쿠폰":(props.couponInfo.couponType===1?"공용쿠폰":"제한쿠폰")}</styled.TableCell>
            </styled.TableRow>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>쿠폰 자릿수</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start'}}>{props.couponInfo.couponDigit}</styled.TableCell>
            </styled.TableRow>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>발행 수량</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start'}}>{props.couponInfo.couponQty}</styled.TableCell>
            </styled.TableRow>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>보상내역</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start'}}>{JSON.stringify(props.couponInfo.rewardData)}</styled.TableCell>
            </styled.TableRow>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>유효 시작시간</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start'}}>{dayjs(props.couponInfo.startTime).format('YYYY-MM-DD HH:mm:ss')}</styled.TableCell>
            </styled.TableRow>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>유효 종료시간</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start'}}>{dayjs(props.couponInfo.endTime).format('YYYY-MM-DD HH:mm:ss')}</styled.TableCell>
            </styled.TableRow>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>제목</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start'}}>{JSON.stringify(props.couponInfo.titleTable)}</styled.TableCell>
            </styled.TableRow>
            <styled.TableRow height='2vw'>
                <styled.TableCell width='4vw' color='var(--primary-color)' bold>설명</styled.TableCell>
                <styled.TableCell width='12vw' style={{paddingLeft:'4vw',textAlign:'start',paddingTop:'0.5vw',paddingBottom:'0.5vw'}}>{JSON.stringify(props.couponInfo.contentTable)}</styled.TableCell>
            </styled.TableRow>
            </styled.Table>
            <br /><br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;발행 쿠폰</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea bottomMargin="0.3vw">
                    <br />
                    <div id='item-part1'>
                        &nbsp;&nbsp;{''}&nbsp;&nbsp;&nbsp;&nbsp;<TextArea1 responsive='1.6' value={props.couponInfo.couponType===0?processCouponCodeFormatting(props.couponInfo.couponData):props.couponInfo.sharedCouponCode} width="54vw" height="16vw" readOnly={true} />
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
        </contentStyled.ContentBody>
    </contentStyled.ContentWrapper>
    )
};

export default CouponDetailInfoPanel;