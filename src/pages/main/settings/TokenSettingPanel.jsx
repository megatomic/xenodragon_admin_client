import React, { useState,useEffect } from 'react';
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as constants from '../../../common/constants';

import Button1 from '../../../components/Button1';
import RadioGroup from '../../../components/RadioGroup';
import InputField1 from '../../../components/InputField1';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useSetting from '../../../store/useSettingDataManager';
import { toast } from 'react-toastify';

import {updateSettingItemTable} from './SettingsContainer';
import OTPInputPopup from '../../../components/OTPInputPopup';

const titleText = 'XDS/XDC 설정';

const getSettingValueSet = (itemList, groupID, itemName) => {
  for (let item of itemList) {
    if (item.groupID === groupID && item.itemName === itemName) {
      return [item.itemValue1, item.itemValue2, item.itemValue3];
    }
  }
  return [];
};

const TokenSettingPanel = (props) => {
  const { startLoading, setStartLoading } = useCommon();
  const { settingInfo, requestSettingList, requestUpdateSettings } = useSetting();
  const [otpPopupShown, setOTPPopupShown] = useState(false);

  const [modifiedSettingItemTable, setModifiedSettingItemTable] = useState([]);
  const [minXDS, setMinXDS] = useState(0);
  const [maxXDS, setMaxXDS] = useState(0);
  const [minXDC, setMinXDC] = useState(0);
  const [maxXDC, setMaxXDC] = useState(0);

  const [excXDS, setExcXDS] = useState(0);
  const [excXDC, setExcXDC] = useState(0);

  const [feeType, setFeeType] = useState(1);
  const [feeRateFromXDS, setFeeRateFromXDS] = useState(0);
  const [feeRateFromXDC, setFeeRateFromXDC] = useState(0);
  const [gasAmount, setGasAmount] = useState(0);
  const [unitGasFee, setUnitGasFee] = useState(0);

  const [settingItemList, setSettingItemList] = useState([]);
  const [popupShown, setPopupShown] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [subMenuOpen,setSubMenuOpen] = useState(false);

  const onOTPPopupButtonClick = async (e,idx,data) => {
    
    setOTPPopupShown(false);

    console.log('otpCode=',data.otpCode);

    if(idx === 1) {
      return;
    }

    if(data.otpCode.length !== 6) {
      toast.error('OTP 코드를 올바로 입력해주세요.');
    } else {
      setStartLoading(true);

      console.log('modifiedSettingItemTable=',JSON.stringify(modifiedSettingItemTable,null,2));
  
      const resultInfo = await requestUpdateSettings(modifiedSettingItemTable,data.otpCode);
  
      console.log(resultInfo);
      if (resultInfo.resultCode === 0) {
        toast.info('설정사항이 적용되었습니다.');
  
        reloadSettingInfo();
  
      } else {
        toast.error(resultInfo.message);
      }
      setStartLoading(false);
    }
  };

  const onXDSMinValueFromXDSChanged = (e) => {

    const value = e.target.value.trim();
    setMinXDS(value);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_TOKEN,
      constants.SETTINGS_ITEM_XDSRANGE,0,value));
  };

  const onXDSMaxValueFromXDSChanged = (e) => {

    const value = e.target.value.trim();
    setMaxXDS(value);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_TOKEN,
      constants.SETTINGS_ITEM_XDSRANGE,1,value));
  };

  const onXDCMinValueFromXDCChanged = (e) => {

    const value = e.target.value.trim();
    setMinXDC(value);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_TOKEN,
      constants.SETTINGS_ITEM_XDCRANGE,0,value));
  };

  const onXDCMaxValueFromXDCChanged = (e) => {

    const value = e.target.value.trim();
    setMaxXDC(value);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_TOKEN,
      constants.SETTINGS_ITEM_XDCRANGE,1,value));
  };

  const onXDSExchangeValueChanged = (e) => {

    const value = e.target.value.trim();
    setExcXDS(value);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_TOKEN,
      constants.SETTINGS_ITEM_EXCRATE,0,value));
  };

  const onXDCExchangeValueChanged = (e) => {

    const value = e.target.value.trim();
    setExcXDC(value);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_TOKEN,
      constants.SETTINGS_ITEM_EXCRATE,1,value));
  };

  const onFeeTypeButtonClick = (idx) => {

    setFeeType(idx);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_TOKEN,
      constants.SETTINGS_ITEM_FEETYPE,0,idx.toString()));
  };

  const onFeeRateFromXDSValueChanged = (e) => {

    const value = e.target.value.trim();
    setFeeRateFromXDS(value);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_TOKEN,
      constants.SETTINGS_ITEM_FEEVALUE,0,value));
  };

  const onFeeRateFromXDCValueChanged = (e) => {

    const value = e.target.value.trim();
    setFeeRateFromXDC(value);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_TOKEN,
      constants.SETTINGS_ITEM_FEEVALUE,1,value));
  };

  const onGasAmountValueChanged = (e) => {

    const value = e.target.value.trim();
    setGasAmount(value);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_TOKEN,
      constants.SETTINGS_ITEM_GASAMOUNT,0,value));
  };

  const onUintGasFeeValueChanged = (e) => {

    const value = e.target.value.trim();
    setUnitGasFee(value);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_TOKEN,
      constants.SETTINGS_ITEM_GASFEE,0,value));
  };

  const onApplyButtonClick = (e) => {

    setPopupContent(`설정된 사항을 저장하시겠습니까?`);
    setPopupShown(true);
  };

  const onPopupButtonClick = async (buttonIdx) => {

    onPopupCloseButtonClick(null);
    if (buttonIdx === 0) {
      setOTPPopupShown(true);
    }
};

const onPopupCloseButtonClick = (e) => {

    setPopupShown(false);
};

  const onSubMenuClick = (e) => {
    setSubMenuOpen(state=>!subMenuOpen);
    };

  const reloadSettingInfo = async () => {
    setStartLoading(true);
    const resultInfo = await requestSettingList();

    console.log(resultInfo);
    if (resultInfo.resultCode !== 0) {
      toast.error(resultInfo.message);
    } else {
      const itemList = resultInfo.data;

      let settingInfo = getSettingValueSet(itemList, constants.SETTINGS_GROUP_TOKEN, constants.SETTINGS_ITEM_XDSRANGE);
      setMinXDS(settingInfo[0]);
      setMaxXDS(settingInfo[1]);

      settingInfo = getSettingValueSet(itemList, constants.SETTINGS_GROUP_TOKEN, constants.SETTINGS_ITEM_XDCRANGE);
      setMinXDC(settingInfo[0]);
      setMaxXDC(settingInfo[1]);

      settingInfo = getSettingValueSet(itemList, constants.SETTINGS_GROUP_TOKEN, constants.SETTINGS_ITEM_EXCRATE);
      setExcXDC(settingInfo[0]);
      setExcXDS(settingInfo[1]);

      settingInfo = getSettingValueSet(itemList, constants.SETTINGS_GROUP_TOKEN, constants.SETTINGS_ITEM_FEETYPE);
      setFeeType(parseInt(settingInfo[0]));

      settingInfo = getSettingValueSet(itemList, constants.SETTINGS_GROUP_TOKEN, constants.SETTINGS_ITEM_FEEVALUE);
      setFeeRateFromXDS(settingInfo[0]);
      setFeeRateFromXDC(settingInfo[1]);

      settingInfo = getSettingValueSet(itemList, constants.SETTINGS_GROUP_TOKEN, constants.SETTINGS_ITEM_GASAMOUNT);
      setGasAmount(settingInfo[0]);

      settingInfo = getSettingValueSet(itemList, constants.SETTINGS_GROUP_TOKEN, constants.SETTINGS_ITEM_GASFEE);
      setUnitGasFee(settingInfo[0]);

      setSettingItemList(itemList);
    }
    setStartLoading(false);
};

useEffect(()=> {
    props.onSubMenuOpenClicked(subMenuOpen);
},[subMenuOpen]);

  useEffect(() => {
    reloadSettingInfo();
  }, []);

  return (
    <contentStyled.ContentWrapper>
      <contentStyled.ContentHeader>
      <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
        </MediaQuery>
        <span id="subtitle">{titleText}</span>
        <span>&nbsp;</span>
        <span id="button">
          <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onApplyButtonClick(e)}>
            적용하기
          </Button1>
        </span>
      </contentStyled.ContentHeader>
      <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />

      <contentStyled.ContentBody>
      <br />
        <br />
        <contentStyled.SettingGroupArea leftMargin="4vw" width="90%">
          <div id="title">
            <label>XDS/XDC 교환</label>
            <div></div>
          </div>
          <br />
          <contentStyled.SettingItemArea bottomMargin='1.0vw'>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>XDS 범위: </label>
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>최소값</label>
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="8vw" height="2vw" value={minXDS}onChange={(e)=>onXDSMinValueFromXDSChanged(e)} />
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label>최대값</label>
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="8vw" height="2vw" value={maxXDS} onChange={(e)=>onXDSMaxValueFromXDSChanged(e)} />
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label>{"(XDS -> XDC)"}</label>
            </div>
          </contentStyled.SettingItemArea>
          <contentStyled.SettingItemArea>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>XDC 범위: </label>
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>최소값</label>
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="8vw" height="2vw" value={minXDC} onChange={(e)=>onXDCMinValueFromXDCChanged(e)} />
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label>최대값</label>
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="8vw" height="2vw" value={maxXDC} onChange={(e)=>onXDCMaxValueFromXDCChanged(e)} />
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label>{"(XDC -> XDS)"}</label>
            </div>
          </contentStyled.SettingItemArea>
          <contentStyled.SettingItemArea>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>교환 비율: </label>
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>XDS:XDC</label>
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="6vw" height="2vw" value={excXDC} onChange={(e)=>onXDCExchangeValueChanged(e)} />
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              &nbsp;&nbsp;<label>:</label>
              &nbsp;&nbsp;<InputField1 responsive='1.6' width="6vw" height="2vw" value={excXDS} onChange={(e)=>onXDSExchangeValueChanged(e)} />
            </div>
            <div id="item-part2" style={{ verticalAlign: 'middle' }}>
            <Button1 responsive='1.6' bgColor="var(--btn-primary-color)" width="6vw" height="2vw" onClick={(e) => onApplyButtonClick(e)}>
            XDS 기준
          </Button1>
            </div>
          </contentStyled.SettingItemArea>
        </contentStyled.SettingGroupArea>
        <br />
        <contentStyled.SettingGroupArea leftMargin="4vw" width="90%">
          <div id="title">
            <label>XDC 수수료</label>
            <div></div>
          </div>
          <br />
          <contentStyled.SettingItemArea bottomMargin='1.0vw'>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>{"수수료 타입"}</label>
            </div>
            <div id="item-part2">
                <RadioGroup responsive='1.6' initButtonIndex={feeType} interMargin="0.5vw" nameTable={['고정방식','비율방식']} buttonClicked={(idx) => onFeeTypeButtonClick(idx)} />
            </div>
          </contentStyled.SettingItemArea>
          <contentStyled.SettingItemArea bottomMargin='1.0vw'>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>{"XDS -> XDC:"}</label>
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>XDC 기준</label>
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="6vw" height="2vw" value={feeRateFromXDS} onChange={(e)=>onFeeRateFromXDSValueChanged(e)} />
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              {
                feeType===0?(
                  <label>&nbsp;&nbsp;XDC</label>
                ):(
                  <label>&nbsp;&nbsp;%</label>
                )
              }
            </div>
          </contentStyled.SettingItemArea>
          <contentStyled.SettingItemArea bottomMargin='1.0vw'>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>{"XDC -> XDS:"}</label>
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>XDS 기준</label>
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="6vw" height="2vw" value={feeRateFromXDC} onChange={(e)=>onFeeRateFromXDCValueChanged(e)} />
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              {
                feeType===0?(
                  <label>&nbsp;&nbsp;XDS</label>
                ):(
                  <label>&nbsp;&nbsp;%</label>
                )
              }
            </div>
          </contentStyled.SettingItemArea>
          </contentStyled.SettingGroupArea>
          <br />
        <contentStyled.SettingGroupArea leftMargin="4vw" width="90%">
          <div id="title">
            <label>XDC 전송</label>
            <div></div>
          </div>
          <br />
          <contentStyled.SettingItemArea bottomMargin='1.0vw'>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>전송 가스비: </label>
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>가스량</label>
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="8vw" height="2vw" value={gasAmount} onChange={(e)=>onGasAmountValueChanged(e)} />
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label>단위 가스비</label>
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="8vw" height="2vw" value={unitGasFee} onChange={(e)=>onUintGasFeeValueChanged(e)} />
            </div>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
            &nbsp;&nbsp;&nbsp;&nbsp;<label>{"WEI"}</label>
            </div>
          </contentStyled.SettingItemArea>
          </contentStyled.SettingGroupArea>
      </contentStyled.ContentBody>
      <OTPInputPopup shown={otpPopupShown} onButtonClick={(e,idx,data)=>onOTPPopupButtonClick(e,idx,data)} />
      <Popup
                shown={popupShown}
                popupTypeInfo={{ type: 'YesNo', button1Text: '예', button2Text: '아니오' }}
                title="알림"
                content={popupContent}
                buttonClick={(buttonNo) => onPopupButtonClick(buttonNo)}
                closeClick={onPopupCloseButtonClick}
            />
    </contentStyled.ContentWrapper>
  );
};

export default TokenSettingPanel;
