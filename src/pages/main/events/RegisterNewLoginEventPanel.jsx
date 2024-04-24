import React, { useState, useRef, forwardRef, useCallback, useEffect, useMemo } from 'react';
import MediaQuery from 'react-responsive';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import * as utils from '../../../common/js/utils';

import useCommon from '../../../store/useCommonStorageManager';
import useAuth from '../../../store/useAuthDataManager';
import useMessage from '../../../store/useMessageDataManager';
import useRewardEvent from '../../../store/useRewardEventDataManager';
import RewardSettingPanel from '../inbox/RewardSettingPanel';
import {enumLangCode,getLangValue,getLangCodeFromType,getTitle,getContent,getDefaultTable, getLangTypeFromCode} from '../notifications/NotificationManageContainer';

import * as constants from '../../../common/constants';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './EventManagePageStyles';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import TextArea1 from '../../../components/TextArea1';
import CheckBox from '../../../components/CheckBox';
import DropBox from '../../../components/DropBox';
import RadioGroup from '../../../components/RadioGroup';
import Popup from '../../../components/Popup';

const titleText1 = '새 접속보상 이벤트 등록';
const titleText2 = '이벤트 보기/수정';

const DatePickerInput = forwardRef((props) => {
  return <InputField1 responsive='1.3' width="8vw" height="2vw" {...props} />;
});

const checkValidReservationDate = (startTime, endTime) => {
  const startDate = dayjs(utils.makeDateTimeStringFromDate(startTime));
  const endDate = dayjs(utils.makeDateTimeStringFromDate(endTime));
  let curDate = dayjs();

  if (endDate.isBefore(startDate.add(9, 'minute')) === true) {
    toast.error('이벤트 종료일자는 시작일자보다 10분 이후이어야 합니다.');
  }
};

const checkLoginTimeFormat = (timeStr) => {

  const arr1 = timeStr.split(":");
  if(arr1.length !== 2) {
    return false;
  }

  const hour = parseInt(arr1[0]);
  const min = parseInt(arr1[1]);

  if(hour < 0 || hour > 23 || min < 0 || min > 59) {
    return false;
  }

  return true;
};

let g_timerID1 = -1;
let g_timerID2 = -1;

const RegisterNewLoginEventPanel = (props) => {
  //console.log('props.editInfo=', props.editInfo);

  const { setStartLoading } = useCommon();
  const { msgList, requestLanguagePreset, requestRewardPreset } = useMessage();
  const { requestNewRewardEvent, requestModifyRewardEvent, requestMessagePresetInfoList, requestRewardPresetInfoList } = useRewardEvent();

  // const [nextLangPresetID, setNextLangPresetID] = useState(0);
  // const [nextRewardPresetID, setNextRewardPresetID] = useState(0);
  // const [langPresetItemID, setLangPresetItemID] = useState(0);
  // const [langPresetInfoTable, setLangPresetInfoTable] = useState([{id:1,name:"새 프리셋ID"}]);
  // const [rewardPresetItemID, setRewardPresetItemID] = useState(0);
  // const [rewardPresetInfoTable, setRewardPresetInfoTable] = useState([{id:1,name:"새 프리셋ID"}]);
  const [titleLock, setTitleLock] = useState(false);
  const [contentLock, setContentLock] = useState(false);
  const [rewardButtonLock, setRewardButtonLock] = useState(false);

  const [langType, setLangType] = useState(0);
  const [startTime, setStartTime] = useState(props.editMode ? new Date(props.editInfo.eventInfo.startTime) : new Date(Date.now() + 10 * 60000));
  const [endTime, setEndTime] = useState(props.editMode ? new Date(props.editInfo.eventInfo.endTime) : new Date(startTime.getTime() + 10 * 60000));
  const [loginFullTime, setLoginFullTime] = useState(true);
  const [loginStartTime, setLoginStartTime] = useState('');
  const [loginEndTime, setLoginEndTime] = useState('');
  const [activationFlag, setActivationFlag] = useState(props.editMode ? props.editInfo.eventInfo.activationFlag : false);
  const [subMenuOpen,setSubMenuOpen] = useState(false);
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);
  const [popupShown, setPopupShown] = useState(false);
  const [popupContent, setPopupContent] = useState('');

  const [presetTitle, setPresetTitle] = useState('');
  const [langPresetID, setLangPresetID] = useState(0);
  const [rewardPresetID, setRewardPresetID] = useState(0);
  const [langPresetName, setLangPresetName] = useState('');
  const [rewardPresetName, setRewardPresetName] = useState('');

  const [langPresetItem, setLangPresetItem] = useState(null);
  const [rewardPresetItem, setRewardPresetItem] = useState(null);

  const [langPresetIDInputLock, setLangPresetIDInputLock] = useState(false);
  const [rewardPresetIDInputLock, setRewardPresetIDInputLock] = useState(false);

  const [titleTable, setTitleTable] = useState(props.editMode ? props.editInfo.eventInfo.titleTable : getDefaultTable);
  const [contentTable, setContentTable] = useState(props.editMode ? props.editInfo.eventInfo.contentTable : getDefaultTable);

  const [rewardInfo, setRewardInfo] = useState(props.editMode ? JSON.parse(props.editInfo.eventInfo.rewardData) : []);
  const [rewardDescInfo, setRewardDescInfo] = useState('');
  const [rewardSetting, setRewardSetting] = useState(false);

  const filterTargetUserList = [
    { id: 1, name: '전체' },
    { id: 2, name: '특정 유저' },
  ];

  const onPresetTitleValueChanged = (e) => {
    setPresetTitle(e.target.value);
  };

  const onLangPresetIDValueChanged = async (e) => {
    setLangPresetID(e.target.value);

    clearTimeout(g_timerID1);
    g_timerID1 = setTimeout(async () => {

      setStartLoading(true);
      setLangPresetIDInputLock(true);
      
      const resultInfo = await requestLanguagePreset({presetType:constants.PREMESSAGE_TYPE_SYSTEM,presetID:parseInt(e.target.value)});
      console.log('### resultInfo=',JSON.stringify(resultInfo,null,2));

      if(resultInfo.data !== null) {
        setLangPresetItem(resultInfo.data);
        setLangPresetName(resultInfo.data.presetName);

        const newTitleTable = [];
        const newContentTable = [];
        const langItems = resultInfo.data.messagePresetLanguages;
        if(langItems.length > 0) {
          for(let item of langItems) {
            newTitleTable.push({langCode:item.languageId,langValue:getLangValue(item.languageId),content:item.messageSubject});
            newContentTable.push({langCode:item.languageId,langValue:getLangValue(item.languageId),content:item.messageBody});
          }
          setTitleTable(table=>newTitleTable);
          setContentTable(table=>newContentTable);
        }

        console.log('newTitleTable=',JSON.stringify(newTitleTable,null,2));
        console.log('newContentTable=',JSON.stringify(newContentTable,null,2));
      }

      setLangPresetIDInputLock(false);
      setStartLoading(false);
    },2000);
  };

  const onRewardPresetIDValueChanged = (e) => {
    setRewardPresetID(e.target.value);

    clearTimeout(g_timerID2);
    g_timerID2 = setTimeout(async () => {

      setStartLoading(true);
      setRewardPresetIDInputLock(true);
      
      const resultInfo = await requestRewardPreset(parseInt(e.target.value));
      console.log('### resultInfo=',JSON.stringify(resultInfo,null,2));

      if(resultInfo.data !== null) {
        setRewardPresetItem(resultInfo.data);
        setRewardPresetName(resultInfo.data.rewardName);

        const rewardList = [];
        const rewardItems = resultInfo.data.rewardPresetItems;
        if(rewardItems.length > 0) {
          for(let item of rewardItems) {
            rewardList.push({ItemType:item.itemType,ItemId:item.itemId,Quantity:item.quantity});
          }
          setRewardInfo(rewardList);
        }
      }

      setRewardPresetIDInputLock(false);
      setStartLoading(false);
    },2000);
  };

  const onTargetUserItemClick = useCallback((item) => {
    console.log(item.name);
  });

  const onReservedNotiCheckBoxChanged = (date) => {
    setStartTime(date);
  };

  const onDatePickerSelect = (date) => {};

  const onSearchUserClick = useCallback((event) => {});

  const onStartTimeDatePickerChanged = (date) => {
    setStartTime(date);
  };

  const onEndTimeDatePickerChanged = (date) => {
    setEndTime(date);
  };

  const onActivationButtonClick = (idx) => {
    setActivationFlag(idx === 0 ? true : false);
  };

  const onLoginFullTimeButtonClick = (idx) => {
    if(idx === 0) {
      setLoginStartTime('');
      setLoginEndTime('');
    }
    setLoginFullTime(idx === 0 ? true : false);
  };

  const onRegisterButtonClick = async (e) => {
         
    const contentInfo=[];
    contentInfo.push(` `);
    contentInfo.push(`제목: ${getTitle(titleTable,langType)}`);
    contentInfo.push(`내용: ${getContent(contentTable,langType)}`);
    contentInfo.push(`시작시간: ${utils.makeDateTimeStringFromDate(startTime)}`);
    contentInfo.push(`종료시간: ${utils.makeDateTimeStringFromDate(endTime)}`);
    if(loginFullTime === true) {
      contentInfo.push(`시간대: 24시간`);
    } else {
      contentInfo.push(`시간대: ${loginStartTime} ~ ${loginEndTime}`);
    }
    contentInfo.push(`보상항목: ${JSON.stringify(rewardDescInfo)}`);
    contentInfo.push(` `);
    contentInfo.push("접속보상 메세지를 전송하시겠습니까?");
    contentInfo.push(` `);

    setPopupContent(contentInfo);
    setPopupShown(true);
  };

  const onPopupButtonClick = async (buttonIdx) => {
    if (buttonIdx === 0) {
      if(loginFullTime === false && (checkLoginTimeFormat(loginStartTime) === false || checkLoginTimeFormat(loginEndTime) === false)) {
        toast.error('접속 시간대의 시작시간 또는 종료시간의 형식이 잘못되었습니다.');
        return;
      }
  
      setStartLoading(true);
  
      let resultInfo;
      if (props.editMode === true) {
        resultInfo = await requestModifyRewardEvent({
          eventID: props.editInfo.eventInfo.eventID,
          presetTitle:presetTitle,
          langPresetID:langPresetID,
          rewardPresetID:rewardPresetID,
          titleTable: titleTable,
          contentTable: contentTable,
          startTime: dayjs(startTime).utc().format(),
          endTime: dayjs(endTime).utc().format(),
          loginStartTime: (loginFullTime===true?"0:00":loginStartTime),
          loginEndTime: (loginFullTime===true?"0:00":loginEndTime),
          activationFlag: activationFlag.toString(),
          rewardData: rewardInfo,
        });
      } else {
        resultInfo = await requestNewRewardEvent({
          eventType: constants.EVENT_TYPE_LOGINREWARD,
          presetTitle:presetTitle,
          langPresetID:langPresetID,
          rewardPresetID:rewardPresetID,
          titleTable: titleTable,
          contentTable: contentTable,
          startTime: dayjs(startTime).utc().format(),
          endTime: dayjs(endTime).utc().format(),
          loginStartTime: (loginFullTime===true?"0:00":loginStartTime),
          loginEndTime: (loginFullTime===true?"0:00":loginEndTime),
          activationFlag: activationFlag.toString(),
          rewardData: rewardInfo,
        });
      }
      console.log(resultInfo);
  
      if (resultInfo.resultCode !== 0) {
        toast.error(resultInfo.message);
      } else {
        if (props.editMode === true) {
          toast.info('보상이벤트 항목이 수정되었습니다.');
        } else {
          toast.info('새 보상이벤트 항목이 등록되었습니다.');
        }
      }
      setStartLoading(false);

      onCancelButtonClick(null);
      onPopupCloseButtonClick(null);

    } else {
      onPopupCloseButtonClick(null);
    }
  };

  const onPopupCloseButtonClick = (e) => {
    setPopupShown(false);
  };

  const onCancelButtonClick = (e) => {
    props.onEventEditModeChange(false);
  };

  const mainTitle = useMemo(()=> {
    return props.editMode ? `${props.editInfo.parentTitle} > ${titleText2}` : titleText1;
  });

  const onLoginStartTimeChanged = (e) => {

    setLoginStartTime(e.target.value);
  };

  const onLoginEndTimeChanged = (e) => {

    setLoginEndTime(e.target.value);
  };

  const onRewardSettingButtonClick = (e) => {
    setRewardSetting(true);
  };

  const onRewardSettingApplyButtonClick = (e,newRewardInfo,newRewardDescInfo) => {

    setRewardInfo(newRewardInfo);
    setRewardDescInfo(newRewardDescInfo);
    setRewardSetting(false);
  };

  const onRewardSettingCancelButtonClick = (e) => {
    setRewardSetting(false);
  };

  const onLangCodeItemClick = (item) => {
    setLangType(item.id-1);
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen(state=>!subMenuOpen);
  };

  const updateTitle = (langCode,value) => {

    const langValue = getLangValue(langCode);

    const newTitleTable = titleTable.map(item=>{
        if(item.langValue === langValue) {
        return {...item,content:value};
        } else {
        return item;
        }
    });

    setTitleTable(table=>newTitleTable);
};

const updateContent = (langCode,value) => {

    const langValue = getLangValue(langCode);

    const newContentTable = contentTable.map(item=>{
        if(item.langValue === langValue) {
        return {...item,content:value};
        } else {
        return item;
        }
    });

    setContentTable(table=>newContentTable);
  };

  useEffect(()=> {
    props.onSubMenuOpenClicked(subMenuOpen);
  },[subMenuOpen]);

  useEffect(() => {
    checkValidReservationDate(startTime, endTime);
  }, [startTime, endTime]);

  useEffect(() => {
  },[]);

  return (
    rewardSetting===true?
    <RewardSettingPanel parentTitle={mainTitle} rewardInfo={rewardInfo} onApplyButtonClick={(e,newRewardInfo,newRewardDescInfo)=>onRewardSettingApplyButtonClick(e,newRewardInfo,newRewardDescInfo)} onCancelButtonClick={(e)=>onRewardSettingCancelButtonClick(e)} /> :
    (
    <contentStyled.ContentWrapper>
      <contentStyled.ContentHeader>
      <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
        </MediaQuery>
        <span id="subtitle">{props.editMode ? `${props.editInfo.parentTitle} > ${titleText2}` : titleText1}</span>
        <span>&nbsp;</span>
        <span id="button">
          {props.editMode && <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onRegisterButtonClick(e)}>
            새로 전송하기
          </Button1>}
        </span>
        <span id="button">
          <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onRegisterButtonClick(e)}>
            {props.editMode ? '수정하기' : '등록하기'}
          </Button1>
        </span>
        <span id="button">
          <Button1 responsive='1.6' bgColor="var(--btn-secondary-color)" width="6vw" height="2vw" onClick={(e) => onCancelButtonClick(e)}>
            취소하기
          </Button1>
        </span>
      </contentStyled.ContentHeader>
      <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />

      <contentStyled.ContentBody>
        <br /><br />
        <styled.InputArea leftMargin="4.2vw" width="90%">
          <span className="row1">
            <label>프리셋 제목</label>
          </span>
          <span className="row2">
            <InputField1 responsive='1.6' value={presetTitle} width='32vw' height='2vw' onChange={(e) => onPresetTitleValueChanged(e)} />
          </span>
          <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <styled.InputArea leftMargin="4.2vw" width="90%">
          <span className="row1">
            <label>언어 프리셋ID</label>
          </span>
          <span className="row2">
            <span>
            <InputField1 responsive='1.6' value={langPresetID} width='6vw' height='2vw' onChange={(e) => onLangPresetIDValueChanged(e)} />
            &nbsp;&nbsp;&nbsp;&nbsp;<label>{langPresetName}</label>
            </span>
          </span>
          <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <styled.InputArea leftMargin="4.2vw" width="90%">
          <span className="row1">
            <label>보상 프리셋ID</label>
          </span>
          <span className="row2">
            <span>
            <InputField1 responsive='1.6' value={rewardPresetID} width='6vw' height='2vw' onChange={(e) => onRewardPresetIDValueChanged(e)} />
            &nbsp;&nbsp;&nbsp;&nbsp;<label>{rewardPresetName}</label>
            </span>
          </span>
          <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <br />
        <contentStyled.SettingGroupArea leftMargin="0vw" width="90%">
          <styled.OptionItem>
            <span id="option_title">활성화 여부</span>
            <span id="col1">
              <RadioGroup responsive='1.6' initButtonIndex={activationFlag === true ? 0 : 1} interMargin="1vw" nameTable={['활성화', '비활성화']} buttonClicked={(idx) => onActivationButtonClick(idx)} />
            </span>
          </styled.OptionItem>
          <br />
          <styled.OptionItem>
            <span id="option_title">이벤트 기간</span>
            <span id="col1">
              <div id="sub_title">시작일</div>
              <div id="sub_col1">
                <DatePicker selected={startTime} onChange={(date) => setStartTime(date)} showTimeSelect dateFormat="Pp" timeIntervals={10} customInput={<DatePickerInput ref={startInputRef} />} />
              </div>
            </span>
            <span id="col2">
              <div id="sub_title">종료일</div>
              <div id="sub_col1">
                <DatePicker selected={endTime} onChange={(date) => setEndTime(date)} showTimeSelect dateFormat="Pp" timeIntervals={10} customInput={<DatePickerInput ref={endInputRef} />} />
              </div>
            </span>
          </styled.OptionItem>
          <br />
          <styled.OptionItem>
            <span id="option_title">접속 시간대</span>
            <span id="col1">
              <RadioGroup responsive='1.6' initButtonIndex={loginFullTime === true ? 0 : 1} interMargin="1vw" nameTable={['24시간', '특정 시간']} buttonClicked={(idx) => onLoginFullTimeButtonClick(idx)} />
            </span>
            <span id='col2'>
              <InputField1 responsive='1.6' value={loginStartTime} width="4vw" height="2vw" placeholder={'10:00'} readOnly={loginFullTime} onChange={(e) => onLoginStartTimeChanged(e)} /><label>부터</label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <InputField1 responsive='1.6' value={loginEndTime} width="4vw" height="2vw" placeholder={'16:00'} readOnly={loginFullTime} onChange={(e) => onLoginEndTimeChanged(e)} /><label>까지</label>
            </span>
          </styled.OptionItem>
          <br />
        </contentStyled.SettingGroupArea>
      </contentStyled.ContentBody>
      <Popup
          shown={popupShown}
          popupTypeInfo={{ type: 'YesNo', button1Text: '예', button2Text: '아니오' }}
          title="주의"
          content={popupContent}
          buttonClick={(buttonNo) => onPopupButtonClick(buttonNo)}
          closeClick={onPopupCloseButtonClick}
      />
    </contentStyled.ContentWrapper>
    )
  );
};

export default RegisterNewLoginEventPanel;
