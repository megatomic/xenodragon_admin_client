import React, { useState,useEffect } from 'react';
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as constants from '../../../common/constants';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import CheckBox from '../../../components/CheckBox';

import useCommon from '../../../store/useCommonStorageManager';
import useSetting from '../../../store/useSettingDataManager';
import { toast } from 'react-toastify';

import {updateSettingItemTable} from './SettingsContainer';

const titleText = '환경 설정';

const getSettingValueSet = (itemList, groupID, itemName) => {
  for (let item of itemList) {
    if (item.groupID === groupID && item.itemName === itemName) {
      return [item.itemValue1, item.itemValue2, item.itemValue3];
    }
  }
  return [];
};

const NormalSettingPanel = (props) => {
  const { startLoading, setStartLoading } = useCommon();
  const { settingInfo, requestSettingList, requestUpdateSettings } = useSetting();

  const [modifiedSettingItemTable, setModifiedSettingItemTable] = useState([]);

  const [settingItemList, setSettingItemList] = useState([]);
  const [PAMAutoRemoveFlag, setPAMAutoRemoveFlag] = useState(false); // 푸쉬알람 메세지:자동 삭제 여부
  const [PAMAutoRemoveDay, setPAMAutoRemoveDay] = useState(0); // 푸쉬알람 메세지:XX일후 자동 삭제
  const [INBAutoExpireFlag, setINBAutoExpireFlag] = useState(false); // 우편함 메세지:자동 소멸 여부
  const [INBAutoExpireDay, setINBAutoExpireDay] = useState(0); // 우편함 메세지:XX일후 자동 소멸
  const [BKLAutoReleaseFlag, setBKLAutoReleaseFlag] = useState(false); // 블랙리스트:자동 해제 여부
  const [BKLAutoReleaseDay, setBKLAutoReleaseDay] = useState(0); // 블랙리스트:XX일후 자동 해제
  const [subMenuOpen,setSubMenuOpen] = useState(false);

  // 푸쉬알람 자동 삭제
  const onPushAlarmAutoRemoveCheckBoxChanged = (e) => {
    setPAMAutoRemoveFlag(e.target.checked);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_PAM,
      constants.SETTINGS_ITEM_AUTOREMOVE,0,(e.target.checked===true?"on":"off")));
  };

  const onPushAlarmAutoRemoveValueChanged = (e) => {

    const value = e.target.value;
    setPAMAutoRemoveDay(value);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_PAM,
      constants.SETTINGS_ITEM_AUTOREMOVE,1,value));
  };

  // 우편함 자동 소멸
  const onInboxExpireAfterCheckBoxChanged = (e) => {
    setINBAutoExpireFlag(e.target.checked);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_INB,
      constants.SETTINGS_ITEM_AUTOEXPIRE,0,(e.target.checked===true?"on":"off")));
  };

  const onInboxExpireAfterValueChanged = (e) => {

    const value = e.target.value;
    setINBAutoExpireDay(value);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_INB,
      constants.SETTINGS_ITEM_AUTOEXPIRE,1,value));
  };

  // 블랙리스트 자동 해제
  const onActivationAutoReleaseCheckBoxChanged = (e) => {
    setBKLAutoReleaseFlag(e.target.checked);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_BKL,
      constants.SETTINGS_ITEM_AUTORELEASE,0,(e.target.checked===true?"on":"off")));
  };

  const onActivationAutoReleaseValueChanged = (e) => {

    const value = e.target.value;
    setBKLAutoReleaseDay(value);

    setModifiedSettingItemTable(table=>updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_BKL,
      constants.SETTINGS_ITEM_AUTORELEASE,1,value));
  };

  const onApplyButtonClick = (e) => {

    console.log('modifiedSettingItemTable=',JSON.stringify(modifiedSettingItemTable,null,2));
    
    setStartLoading(true);

    setTimeout(async () => {
      const resultInfo = await requestUpdateSettings(modifiedSettingItemTable,"");

      console.log(resultInfo);
      if (resultInfo.resultCode === 0) {
        toast.info('설정사항이 적용되었습니다.');
      } else {
        toast.error(resultInfo.message);
      }
      setStartLoading(false);
    }, 200);
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen(state=>!subMenuOpen);
};

useEffect(() => {
  console.log('modifiedSettingItemTable=',JSON.stringify(modifiedSettingItemTable,null,2));
},[modifiedSettingItemTable]);

useEffect(()=> {
    props.onSubMenuOpenClicked(subMenuOpen);
},[subMenuOpen]);

  useEffect(() => {
    const fetchLoad = async () => {
      setStartLoading(true);
      const resultInfo = await requestSettingList();

      console.log(resultInfo);
      if (resultInfo.resultCode !== 0) {
        toast.error(resultInfo.message);
      } else {
        const itemList = resultInfo.data;

        const pamInfo = getSettingValueSet(itemList, 'PAM', 'auto_remove');
        setPAMAutoRemoveFlag(pamInfo[0] === 'on' ? true : false);
        setPAMAutoRemoveDay(parseInt(pamInfo[1]));

        const inbInfo = getSettingValueSet(itemList, 'INB', 'auto_expire');
        setINBAutoExpireFlag(inbInfo[0] === 'on' ? true : false);
        setINBAutoExpireDay(parseInt(inbInfo[1]));

        const bklInfo = getSettingValueSet(itemList, 'BKL', 'auto_release');
        setBKLAutoReleaseFlag(bklInfo[0] === 'on' ? true : false);
        setBKLAutoReleaseDay(parseInt(bklInfo[1]));

        setSettingItemList(itemList);
      }
      setStartLoading(false);
    };

    fetchLoad();
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
            <label>푸쉬 알림</label>
            <div></div>
          </div>
          <contentStyled.SettingItemArea>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <CheckBox
                checked={PAMAutoRemoveFlag}
                checkChanged={(e) => onPushAlarmAutoRemoveCheckBoxChanged(e)}
                text={'푸쉬알림 자동삭제'}
                textHidden={false}
                fontSize={'0.7vw'}
                checkColor={'var(--primary-color)'}
              />
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="3vw" height="2vw" placeholder={'4자이상 20자 미만'} value={PAMAutoRemoveDay} onChange={(e) => onPushAlarmAutoRemoveValueChanged(e)} />
              <span>일 후 자동삭제</span>
            </div>
          </contentStyled.SettingItemArea>
        </contentStyled.SettingGroupArea>
        <contentStyled.SettingGroupArea leftMargin="4vw" width="90%">
          <div id="title">
            <label>우편함</label>
            <div></div>
          </div>
          <contentStyled.SettingItemArea>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <CheckBox
                checked={INBAutoExpireFlag}
                checkChanged={(e) => onInboxExpireAfterCheckBoxChanged(e)}
                text={'일정기간 후 자동소멸'}
                textHidden={false}
                fontSize={'0.7vw'}
                checkColor={'var(--primary-color)'}
              />
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="3vw" height="2vw" placeholder={'4자이상 20자 미만'} value={INBAutoExpireDay} onChange={(e) => onInboxExpireAfterValueChanged(e)} />
              <span>일간 보관후 소멸</span>
            </div>
          </contentStyled.SettingItemArea>
        </contentStyled.SettingGroupArea>
        <contentStyled.SettingGroupArea leftMargin="4vw" width="90%">
          <div id="title">
            <label>블랙 리스트</label>
            <div></div>
          </div>
          <contentStyled.SettingItemArea>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <CheckBox
                checked={BKLAutoReleaseFlag}
                checkChanged={(e) => onActivationAutoReleaseCheckBoxChanged(e)}
                text={'일정기간 후 자동해제'}
                textHidden={false}
                fontSize={'0.7vw'}
                checkColor={'var(--primary-color)'}
              />
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="3vw" height="2vw" placeholder={'4자이상 20자 미만'} value={BKLAutoReleaseDay} onChange={(e) => onActivationAutoReleaseValueChanged(e)} />
              <span>일 후 자동해제</span>
            </div>
          </contentStyled.SettingItemArea>
        </contentStyled.SettingGroupArea>
      </contentStyled.ContentBody>
    </contentStyled.ContentWrapper>
  );
};

export default NormalSettingPanel;
