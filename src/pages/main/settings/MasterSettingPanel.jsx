import React, {useState,useEffect} from 'react';
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import CheckBox from '../../../components/CheckBox';

import useCommon from '../../../store/useCommonStorageManager';
import useAccount from '../../../store/useAccountDataManager';
import { toast } from 'react-toastify';

import {updateSettingItemTable} from './SettingsContainer';

const titleText = 'MASTER 설정';


const NormalSettingPanel = (props) => {

    const {startLoading, setStartLoading} = useCommon();
    const {accountInfo, requestChangeMasterPW} = useAccount();

    const [authTokenDuration, setAuthTokenDuration] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [subMenuOpen,setSubMenuOpen] = useState(false);

    const onOldPasswordValueChanged = (e) => {
        setOldPassword(e.target.value);
    };

    const onNewPasswordValueChanged = (e) => {
        setNewPassword(e.target.value);
    };

    const onConfirmPasswordValueChanged = (e) => {
        setConfirmPassword(e.target.value);
    };

    const onPossibleRewardCheckBoxChanged = (e) => {

    };

    const onChangePWButtonClick = async (e) => {

        setStartLoading(true);
        const resultInfo = await requestChangeMasterPW(oldPassword,newPassword,confirmPassword);
  
        console.log(resultInfo);
        if (resultInfo.resultCode !== 0) {
          toast.error(resultInfo.message);
        } else {
          toast.info('암호가 변경되었습니다.');
        }
        setStartLoading(false);
    };

    const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
    };

    const onAuthTokenDurationValueChanged = (e) => {
        setAuthTokenDuration(e.target.value);
    };

    useEffect(()=> {
        props.onSubMenuOpenClicked(subMenuOpen);
    },[subMenuOpen]);

    return (
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader>
            <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
        </MediaQuery>
                <span id='subtitle'>{titleText}</span>
                <span>&nbsp;</span>
                <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='6vw' height='2vw'>적용하기</Button1></span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
                <br /><br />
            <contentStyled.SettingGroupArea leftMargin='4vw' width='90%'>
                <div id='title'>
                    <label>비밀 번호 변경</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea>
                    <div id='item-part1'>
                        {'기존 비밀번호'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' type='password' width='12vw' height='2vw' value={oldPassword} onChange={(e)=>onOldPasswordValueChanged(e)} />
                    </div>
                    <br /><br />
                    <div id='item-part1'>
                    {'신규 비밀번호'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' type='password' width='12vw' height='2vw' value={newPassword} onChange={(e)=>onNewPasswordValueChanged(e)} />
                    </div>
                    <br />
                    <div id='item-part1'>
                    {'비밀번호 확인'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' type='password' width='12vw' height='2vw' value={confirmPassword} onChange={(e)=>onConfirmPasswordValueChanged(e)} />
                        &nbsp;&nbsp;
                        <Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='6vw' height='2vw' onClick={(e)=>onChangePWButtonClick(e)}>비밀번호 변경</Button1>
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <contentStyled.SettingGroupArea leftMargin="4vw" width="90%">
                <div id="title">
                    <label>설정 일반</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea>
                    <div id="item-part1" style={{ verticalAlign: 'middle' }}>
                        <span>관리자 인증토큰 유효기간</span>
                    </div>
                    <div id="item-part1" style={{ verticalAlign: 'middle' }}>
                        <InputField1 responsive='1.6' width="3vw" height="2vw" placeholder={'분단위'} value={'10'} onChange={(e) => onAuthTokenDurationValueChanged(e)} />
                        <span>분</span>
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <contentStyled.SettingGroupArea leftMargin='4vw' width='90%'>
                <div id='title'>
                    <label>유저보상 가능 목록</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea>
                    <div id='item-part1' style={{verticalAlign:'middle'}}>
                        <CheckBox checkChanged={(e)=>onPossibleRewardCheckBoxChanged(e,0)} text={'골드'} textHidden={false} fontSize={'0.7vw'} checkColor={'var(--primary-color)'} />
                    </div>
                    <div id='item-part1' style={{verticalAlign:'middle'}}>
                        <CheckBox checkChanged={(e)=>onPossibleRewardCheckBoxChanged(e,1)} text={'젬'} textHidden={false} fontSize={'0.7vw'} checkColor={'var(--primary-color)'} />
                    </div>
                    <div id='item-part1' style={{verticalAlign:'middle'}}>
                        <CheckBox checkChanged={(e)=>onPossibleRewardCheckBoxChanged(e,2)} text={'드래곤'} textHidden={false} fontSize={'0.7vw'} checkColor={'var(--primary-color)'} />
                    </div>
                    <div id='item-part1' style={{verticalAlign:'middle'}}>
                        <CheckBox checkChanged={(e)=>onPossibleRewardCheckBoxChanged(e,3)} text={'기어'} textHidden={false} fontSize={'0.7vw'} checkColor={'var(--primary-color)'} />
                    </div>
                    <div id='item-part1' style={{verticalAlign:'middle'}}>
                        <CheckBox checkChanged={(e)=>onPossibleRewardCheckBoxChanged(e,4)} text={'포션'} textHidden={false} fontSize={'0.7vw'} checkColor={'var(--primary-color)'} />
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            </contentStyled.ContentBody>
        </contentStyled.ContentWrapper>
    )
};

export default NormalSettingPanel;