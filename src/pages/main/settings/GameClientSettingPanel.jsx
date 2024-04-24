import React, { useState,useEffect } from 'react';
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import CheckBox from '../../../components/CheckBox';
import RadioGroup from '../../../components/RadioGroup';
import DropBox from '../../../components/DropBox';
import TextArea1 from '../../../components/TextArea1';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useSetting from '../../../store/useSettingDataManager';
import { toast } from 'react-toastify';

const titleText = '게임 클라이언트 설정';

// 설정 항목 enum값들
const enumADType = ['광고 없음','테스트','라이브'];
const enumADPlatform = ['구글광고','유니티광고'];
const adTypeString = ['None','Test','Live'];
const enumLangCode = [
    {id:1, name:'한국어'},
    {id:2, name:'영어'}
];

const enumPlatform = [
  {id:1, name:'Android', tag:'android'},
  {id:2, name:'Android Xsolla', tag:'android_xsolla'},
  {id:3, name:'iOS', tag:'ios'}
];
const enumDeviceType = ['Android', 'iOS'];
const enumServiceState = ['정상 서비스','점검중'];
const enumReviewState = ['리뷰중 아님','리뷰중'];

const ADPLATFORM_GOOGLE = "GoogleAds";
const ADPLATFORM_UNITY = "UnityAds";

const getSettingValueSet = (itemList, groupID, itemName) => {
  for (let item of itemList) {
    if (item.groupID === groupID && item.itemName === itemName) {
      return [item.itemValue1, item.itemValue2, item.itemValue3];
    }
  }
  return [];
};

const updateSettingValueSet = (itemList, groupID, itemName, itemValue1, itemValue2, itemValue3) => {
  for (let item of itemList) {
    if (item.groupID === groupID && item.itemName === itemName) {
      item.itemValue1 = itemValue1;
      item.itemValue2 = itemValue2;
      item.itemValue3 = itemValue3;
    }
  }
  return itemList;
};

const GameClientSettingPanel = (props) => {
  const { startLoading, setStartLoading } = useCommon();
  const { settingInfo, setSettingInfo, requestClientConfig, requestUpdateClientConfig } = useSetting();
  const [clientConfig, setClientConfig] = useState(settingInfo.clientConfig);

  const [langType, setLangType] = useState(0);
  const [platformType, setPlatformType] = useState(0);
  const [inspectMessage, setInspectMessage] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  const [marketURL, setMarketURL] = useState('');
  const [clientVersion, setClientVersion] = useState('');
  const [patchVersion, setPatchVersion] = useState('');
  const [recommandVersion, setRecommandVersion] = useState('');
  const [reviewVersion, setReviewVersion] = useState('');
  const [admobID, setAdmobID] = useState('');
  const [unityAdsID, setUnityAdsID] = useState('');
  const [reviewURL, setReviewURL] = useState('');
  const [adType, setADType] = useState(0);
  const [adsPlatform, setADsPlatform] = useState(0);
  const [serviceState, setServiceState] = useState(0);
  const [reviewState, setReviewState] = useState(0);

  const [popupShown, setPopupShown] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [subMenuOpen,setSubMenuOpen] = useState(false);

  const [newFields, setNewFields] = useState({});

  const onApplyToS3ButtonClick = (e) => {

    setPopupContent('설정사항을 S3에 적용하시겠습니까?');
    setPopupShown(true);
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen(state=>!subMenuOpen);
};

const onRevertButtonClick = async (e) => {

  setStartLoading(true);
  const resultInfo = await requestClientConfig();
  if(resultInfo.resultCode === 0) {
    setClientConfig(resultInfo.data);
    updateConfigData(resultInfo.data);
  } else {
    toast.error(resultInfo.message);
  }

  setStartLoading(false);
};

const onLangCodeItemClick = (item) => {
  setLangType(item.id-1);
};

const onPlatformItemClick = (item) => {

  setPlatformType(type=>item.id-1);
};

const onInspectMessageChanged = (e) => {

  setInspectMessage(e.target.value);

  let newConfig = {...clientConfig};
  newConfig.InspectMessage[langType].content = e.target.value;
  setClientConfig(newConfig);
};

const onUpdateMessageChanged = (e) => {

  setUpdateMessage(e.target.value);

  let newConfig = {...clientConfig};
  newConfig.UpdateMessage[langType].content = e.target.value;
  setClientConfig(newConfig);
};

const onMarketURLChanged = (e) => {
    setMarketURL(e.target.value);

    let newConfig = {...clientConfig};

    const platformIndex = getPlatformIndexFromType(clientConfig,platformType);
    if(platformIndex >= 0) {
      newConfig.PlatformInfos[platformIndex].MarketURL = e.target.value;
      setClientConfig(newConfig);
    }
};

const onClientVersionChanged = (e) => {
    setClientVersion(e.target.value);

    let newConfig = {...clientConfig};

    const platformIndex = getPlatformIndexFromType(clientConfig,platformType);
    if(platformIndex >= 0) {
      newConfig.PlatformInfos[platformIndex].ClientVersion = e.target.value;
      setClientConfig(newConfig);
    }
};

const onPatchVersionChanged = (e) => {
    setPatchVersion(e.target.value);

    let newConfig = {...clientConfig};

    const platformIndex = getPlatformIndexFromType(clientConfig,platformType);
    if(platformIndex >= 0) {
      newConfig.PlatformInfos[platformIndex].PatchVersion = e.target.value;
      setClientConfig(newConfig);
    }
}

const onRecommandVersionChanged = (e) => {
  setRecommandVersion(e.target.value);

  let newConfig = {...clientConfig};

  const platformIndex = getPlatformIndexFromType(clientConfig,platformType);
  if(platformIndex >= 0) {
    newConfig.PlatformInfos[platformIndex].RecommandVersion = e.target.value;
    setClientConfig(newConfig);
  }
};

const onReviewVersionChanged = (e) => {
  setReviewVersion(e.target.value);

  let newConfig = {...clientConfig};

  const platformIndex = getPlatformIndexFromType(clientConfig,platformType);
  if(platformIndex >= 0) {
    newConfig.PlatformInfos[platformIndex].ReviewVersion = e.target.value;
    setClientConfig(newConfig);
  }
};

const onReviewURLChanged = (e) => {
  setReviewURL(e.target.value);

  let newConfig = {...clientConfig};

  const platformIndex = getPlatformIndexFromType(clientConfig,platformType);
  if(platformIndex >= 0) {
    newConfig.PlatformInfos[platformIndex].LoginServerURL_Review = e.target.value;
    setClientConfig(newConfig);
  }
};

const onADTypeRadioButtonClick = (idx) => {

  setADType(idx);

  let newConfig = {...clientConfig};
  const platformIndex = getPlatformIndexFromType(clientConfig,platformType);
  if(platformIndex >= 0) {
    newConfig.PlatformInfos[platformIndex].AdsType = idx;
    setClientConfig(newConfig);
  }
};

const onAdmobIDChanged = (e) => {
  setAdmobID(e.target.value);

  let newConfig = {...clientConfig};

  const platformIndex = getPlatformIndexFromType(clientConfig,platformType);
  if(platformIndex >= 0) {
    newConfig.PlatformInfos[platformIndex].AdsMobID = e.target.value;
    setClientConfig(newConfig);
  }
};

const onUnityAdsIDChanged = (e) => {
  setUnityAdsID(e.target.value);

  let newConfig = {...clientConfig};

  const platformIndex = getPlatformIndexFromType(clientConfig,platformType);
  if(platformIndex >= 0) {
    newConfig.PlatformInfos[platformIndex].UnityAdsID = e.target.value;
    setClientConfig(newConfig);
  }
};

const onADsPlatformRadioButtonClick = (idx) => {

  setADsPlatform(idx);

  let newConfig = {...clientConfig};
  const platformIndex = getPlatformIndexFromType(clientConfig,platformType);
  if(platformIndex >= 0) {
    newConfig.PlatformInfos[platformIndex].AdsPlatform = idx;
    setClientConfig(newConfig);
  }
};

const onServiceStateRadioButtonClick = (idx) => {
    setServiceState(idx);

    let newConfig = {...clientConfig};

    const platformIndex = getPlatformIndexFromType(clientConfig,platformType);
    if(platformIndex >= 0) {
      newConfig.PlatformInfos[platformIndex].ServiceState = idx;
      setClientConfig(newConfig);
    }
};

const onReviewStateRadioButtonClick = (idx) => {
  setReviewState(idx);

  let newConfig = {...clientConfig};

  const platformIndex = getPlatformIndexFromType(clientConfig,platformType);
  if(platformIndex >= 0) {
    newConfig.PlatformInfos[platformIndex].ReviewState = idx;
    setClientConfig(newConfig);
  }
};

const onPopupButtonClick = (buttonIdx) => {

  if (buttonIdx === 0) {
    setStartLoading(true);

    const newConfig = {};

    setTimeout(async () => {
      //console.log('clientConfig=',clientConfig);
      const resultInfo = await requestUpdateClientConfig(clientConfig);

      console.log(resultInfo);
      if (resultInfo.resultCode === 0) {
        toast.info('설정사항이 S3에 적용되었습니다.');
      } else {
        toast.error(resultInfo.message);
      }
      setStartLoading(false);
    }, 200);

    onPopupCloseButtonClick(null);
  } else {
    onPopupCloseButtonClick(null);
  }
};

const getPlatformIndexFromType = (config,type) => {

  const platformTag = enumPlatform[type].tag;
  let platformIndex = 0;
  for(let platformInfo of config.PlatformInfos) {
    if(platformInfo.PlatformName.trim() === platformTag) {
      break;
    } else {
      platformIndex++;
    }
  }

  if(config.PlatformInfos.length <= platformIndex) {
    platformIndex = -1;
  }
  return platformIndex;
};

const updateConfigData = (config) => {

  console.log('clientConfig=',config);
  
  if(config === undefined) {
    return;
  }
  
  let msgTable = [];
  if(config.InspectMessage !== undefined && config.InspectMessage.length > 0) {
    for(let locale of config.InspectMessage) {
      msgTable.push(locale.content);
    }
    setInspectMessage(msgTable[langType]);
  }

  msgTable = [];
  if(config.UpdateMessage !== undefined && config.UpdateMessage.length > 0) {
    for(let locale of config.UpdateMessage) {
      msgTable.push(locale.content);
    }
    setUpdateMessage(msgTable[langType]);
  }
  
  const platformIndex = getPlatformIndexFromType(config,platformType);

  //console.log('platformIndex=',platformIndex);
  //console.log('platformInfos=',JSON.stringify(config.PlatformInfos[platformIndex],null,2));

  setMarketURL(config.PlatformInfos[platformIndex].MarketURL);
  setClientVersion(config.PlatformInfos[platformIndex].ClientVersion);
  setPatchVersion(config.PlatformInfos[platformIndex].PatchVersion);

  setReviewURL(config.PlatformInfos[platformIndex].LoginServerURL_Review);
  setADType(config.PlatformInfos[platformIndex].AdsType);

  let newFieldsTemp = {...newFields};
  if(config.PlatformInfos[platformIndex].AdsPlatform !== undefined) {
    setADsPlatform(config.PlatformInfos[platformIndex].AdsPlatform);
    newFieldsTemp = {...newFieldsTemp,AdsPlatform:true};
  }

  if(config.PlatformInfos[platformIndex].RecommandVersion !== undefined) {
    setRecommandVersion(config.PlatformInfos[platformIndex].RecommandVersion);
    newFieldsTemp = {...newFieldsTemp,RecommandVersion:true};
  }

  if(config.PlatformInfos[platformIndex].ReviewVersion !== undefined) {
    setReviewVersion(config.PlatformInfos[platformIndex].ReviewVersion);
    newFieldsTemp = {...newFieldsTemp,ReviewVersion:true};
  }

  // 애드몹ID
  if(config.PlatformInfos[platformIndex].AdsMobID !== undefined) {
    setAdmobID(config.PlatformInfos[platformIndex].AdsMobID);
    newFieldsTemp = {...newFieldsTemp,AdsMobID:true};
  }

  // 유니티애즈ID
  if(config.PlatformInfos[platformIndex].UnityAdsID !== undefined) {
    setUnityAdsID(config.PlatformInfos[platformIndex].UnityAdsID);
    newFieldsTemp = {...newFieldsTemp,UnityAdsID:true};
  }

  setNewFields(newFieldsTemp);
  setServiceState(config.PlatformInfos[platformIndex].ServiceState);
  setReviewState(config.PlatformInfos[platformIndex].ReviewState);
};

const onPopupCloseButtonClick = (e) => {
    setPopupShown(false);
};

useEffect(()=> {
  async function fetchData() {
    const resultInfo = await requestClientConfig();

    setClientConfig(resultInfo.data);
    updateConfigData(resultInfo.data);
  };

  fetchData();
},[]);

useEffect(()=> {
  updateConfigData(clientConfig);
},[langType,platformType]);

useEffect(()=> {
    props.onSubMenuOpenClicked(subMenuOpen);
},[subMenuOpen]);

  return (
    <contentStyled.ContentWrapper>
      <contentStyled.ContentHeader>
      <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
        </MediaQuery>
        <span id="subtitle">{titleText}</span>
        <span>&nbsp;</span>
        <span id="button">
          <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onApplyToS3ButtonClick(e)}>
            S3에 적용하기
          </Button1>
        </span>
        <span id="button">
            <Button1 responsive='1.6' bgColor="var(--btn-secondary-color)" width="6vw" height="2vw" onClick={(e) => onRevertButtonClick(e)}>
            복원하기
          </Button1>
        </span>
      </contentStyled.ContentHeader>
      <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />

      <contentStyled.ContentBody>
        <br />
        <br />
        <contentStyled.SettingGroupArea leftMargin="4vw" width="90%">
          <div id="title">
            <label>푸쉬 알림</label>
            <div></div>
          </div>
          <contentStyled.SettingItemArea>
            <div id="item-part1" style={{ width:'5vw', verticalAlign: 'middle' }}>
              <p>점검 메세지</p>
            </div>
            <div id="item-part2">
                <DropBox responsive='1.3' width='10vw' height='2vw' fontSize='0.6vw' text={enumLangCode[langType].name} itemList={enumLangCode} menuItemClick={(item)=>onLangCodeItemClick(item)} />
            </div>
            <div id="item-part2a" style={{display:'flex'}}>
                <span style={{width:'6.8vw'}}></span>
                <TextArea1 responsive='1.8' value={inspectMessage} width="33vw" height="10vw" onChange={(e) => onInspectMessageChanged(e)} />
            </div>
          </contentStyled.SettingItemArea>
          <contentStyled.SettingItemArea>
            <div id="item-part1" style={{ width:'5vw', verticalAlign: 'middle' }}>
              <p>업데이트 메세지</p>
            </div>
            <div id="item-part2">
                <DropBox responsive='1.3' width='10vw' height='2vw' fontSize='0.6vw' text={enumLangCode[langType].name} itemList={enumLangCode} menuItemClick={(item)=>onLangCodeItemClick(item)} />
            </div>
            <div id="item-part2a" style={{display:'flex'}}>
                <span style={{width:'6.8vw'}}></span>
                <TextArea1 responsive='1.8' value={updateMessage} width="33vw" height="10vw" onChange={(e) => onUpdateMessageChanged(e)} />
            </div>
          </contentStyled.SettingItemArea>
        </contentStyled.SettingGroupArea>
        <contentStyled.SettingGroupArea leftMargin="4vw" bottomMargin="0.3vw" width="90%">
          <div id="title">
            <label style={{paddingTop:'0.4vw',width:'8vw',marginBottom:'1vw'}}>플랫폼</label>
            <div><DropBox responsive='1.3' width='10vw' height='2vw' fontSize='0.6vw' text={enumPlatform[platformType].name} itemList={enumPlatform} menuItemClick={(item)=>onPlatformItemClick(item)} /></div>
          </div>
          <contentStyled.SettingItemArea bottomMargin="0.3vw">
            <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
              <p>마켓 URL</p>
            </div>
            <div id="item-part2">
            <InputField1 responsive='1.8' value={marketURL} width="33vw" height="2vw" placeholder={'마켓 URL을 입력하세요.'} onChange={(e) => onMarketURLChanged(e)} />
            </div>
          </contentStyled.SettingItemArea>
          <contentStyled.SettingItemArea bottomMargin="0.6vw">
            <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
              <p>클라이언트 버전</p>
            </div>
            <div id="item-part2">
            <InputField1 responsive='1.8' value={clientVersion} width="5vw" height="2vw" placeholder={''} onChange={(e) => onClientVersionChanged(e)} />
            </div>
          </contentStyled.SettingItemArea>
          <contentStyled.SettingItemArea bottomMargin="0.6vw">
            <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
              <p>패치 버전</p>
            </div>
            <div id="item-part2">
            <InputField1 responsive='1.8' value={patchVersion} width="5vw" height="2vw" placeholder={''} onChange={(e) => onPatchVersionChanged(e)} />
            </div>
          </contentStyled.SettingItemArea>
          {newFields.RecommandVersion!==undefined &&
            (
              <contentStyled.SettingItemArea bottomMargin="0.6vw">
              <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                <p>권장 버전</p>
              </div>
              <div id="item-part2">
              <InputField1 responsive='1.8' value={recommandVersion} width="5vw" height="2vw" placeholder={''} onChange={(e) => onRecommandVersionChanged(e)} />
              </div>
            </contentStyled.SettingItemArea>
            )
          }
          {newFields.ReviewVersion!==undefined &&
            (
              <contentStyled.SettingItemArea bottomMargin="0.6vw">
              <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                <p>리뷰 버전</p>
              </div>
              <div id="item-part2">
              <InputField1 responsive='1.8' value={reviewVersion} width="5vw" height="2vw" placeholder={''} onChange={(e) => onReviewVersionChanged(e)} />
              </div>
            </contentStyled.SettingItemArea>
            )
          }
          <contentStyled.SettingItemArea bottomMargin="0.6vw">
            <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
              <p>리뷰 URL</p>
            </div>
            <div id="item-part2">
            <InputField1 responsive='1.8' value={reviewURL} width="33vw" height="2vw" placeholder={''} onChange={(e) => onReviewURLChanged(e)} />
            </div>
          </contentStyled.SettingItemArea>
          <br />
          <contentStyled.SettingItemArea bottomMargin="1.5vw">
            <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
              <p>광고 타입</p>
            </div>
            <div id="item-part2">
                <RadioGroup responsive='1.6' initButtonIndex={adType} interMargin="0.5vw" nameTable={enumADType} buttonClicked={(idx) => onADTypeRadioButtonClick(idx)} />
            </div>
          </contentStyled.SettingItemArea>
          {newFields.AdsPlatform!==undefined &&
            (
              <contentStyled.SettingItemArea bottomMargin="1.5vw">
              <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                <p>광고 플랫폼</p>
              </div>
              <div id="item-part2">
                  <RadioGroup responsive='1.6' initButtonIndex={adsPlatform} interMargin="0.5vw" nameTable={enumADPlatform} buttonClicked={(idx) => onADsPlatformRadioButtonClick(idx)} />
              </div>
              </contentStyled.SettingItemArea>
            )
          }
          {newFields.AdsMobID!==undefined &&
            (
              <contentStyled.SettingItemArea bottomMargin="0.6vw">
              <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                <p>애드몹ID</p>
              </div>
              <div id="item-part2">
              <InputField1 responsive='1.8' value={admobID} width="20vw" height="2vw" placeholder={''} onChange={(e) => onAdmobIDChanged(e)} />
              </div>
            </contentStyled.SettingItemArea>
            )
          }
          {newFields.UnityAdsID!==undefined &&
            (
              <contentStyled.SettingItemArea bottomMargin="0.6vw">
              <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                <p>유니티애즈ID</p>
              </div>
              <div id="item-part2">
              <InputField1 responsive='1.8' value={unityAdsID} width="20vw" height="2vw" placeholder={''} onChange={(e) => onUnityAdsIDChanged(e)} />
              </div>
            </contentStyled.SettingItemArea>
            )
          }
          <br />
          <contentStyled.SettingItemArea bottomMargin="0.6vw">
            <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
              <p>서비스 상태</p>
            </div>
            <div id="item-part2">
                <RadioGroup responsive='1.6' initButtonIndex={serviceState} interMargin="0.5vw" nameTable={enumServiceState} buttonClicked={(idx) => onServiceStateRadioButtonClick(idx)} />
            </div>
          </contentStyled.SettingItemArea>
          <contentStyled.SettingItemArea>
            <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
              <p>리뷰 상태</p>
            </div>
            <div id="item-part2">
                <RadioGroup responsive='1.6' initButtonIndex={reviewState} interMargin="0.5vw" nameTable={enumReviewState} buttonClicked={(idx) => onReviewStateRadioButtonClick(idx)} />
            </div>
          </contentStyled.SettingItemArea>
        </contentStyled.SettingGroupArea>
      </contentStyled.ContentBody>
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

export default GameClientSettingPanel;
