import React, { useState, useRef, forwardRef, useCallback,useEffect } from 'react';
import MediaQuery from 'react-responsive';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import * as utils from '../../../common/js/utils';
import { toast } from 'react-toastify';

import * as constants from '../../../common/constants';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './PushMessageManagePageStyles';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import TextArea1 from '../../../components/TextArea1';
import CheckBox from '../../../components/CheckBox';
import DropBox from '../../../components/DropBox';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useMessage from '../../../store/useMessageDataManager';
import {enumLangCode,getLangValue,getLangCode,getTitle,getContent,getDefaultTable, getLangTypeFromCode} from '../notifications/NotificationManageContainer';

const titleText1 = '언어 프리셋 추가';
const titleText2 = '언어 프리셋 보기/수정';

const DatePickerInput = forwardRef((props) => {
  return <InputField1 width="8vw" height="2vw" {...props} />;
});

const langPresetBodyInfo = {
  "id":0,
  "presetName":"",
  "messageType":0,
  "presetCount":0,
  "supportLanguage":"",
  "updatedAt":"",
  "createdAt":"",
  "messagePresetLanguages":[]
};

const langPresetLangInfo = {
  "id":0,
  "presetId":0,
  "languageId":23,
  "messageSubject":"",
  "messageBody":"",
  "updatedAt":"",
  "createdAt":""
};

const makeNewLangPresetInfo = (presetType,presetTitle,titleTable,contentTable) => {

  const langInfoTable = [];
  let langCodeListStr = "";
  for(let i=0;i<titleTable.length;i++) {
    const langInfo = {...langPresetLangInfo};
    langInfo.languageId = titleTable[i].langCode;
    langInfo.messageSubject = titleTable[i].content;
    langInfo.messageBody = contentTable[i].content;
    langInfo.updatedAt = dayjs().format('YYYY-MM-DDTHH:mm:ss');
    langInfo.createdAt = dayjs().format('YYYY-MM-DDTHH:mm:ss');

    langInfoTable.push(langInfo);

    langCodeListStr += langInfo.languageId + (i+1 < titleTable.length?",":"");
  }

  const bodyInfo = {...langPresetBodyInfo};
  bodyInfo.presetName = presetTitle;
  bodyInfo.messageType = presetType;
  bodyInfo.presetCount = titleTable.length;
  bodyInfo.supportLanguage = langCodeListStr;
  bodyInfo.createdAt = dayjs().format('YYYY-MM-DDTHH:mm:ss');
  bodyInfo.updatedAt = dayjs().format('YYYY-MM-DDTHH:mm:ss');
  bodyInfo.messagePresetLanguages = langInfoTable;

  return bodyInfo;
};

const convertInternalInfoToLangPresetInfo = (info,presetTitle,titleTable,contentTable) => {

  const bodyInfo = {
    "id":info.id,
    "presetName":presetTitle,
    "messageType":info.messageType,
    "presetCount":info.presetCount,
    "supportLanguage":info.supportLanguage,
    "updatedAt":dayjs().format('YYYY-MM-DDTHH:mm:ss'),
    "createdAt":info.createdAt,
    "messagePresetLanguages":info.messagePresetLanguages
  };

  for(let langInfo of bodyInfo.messagePresetLanguages) {
    langInfo.messageSubject = getTitle(titleTable,getLangTypeFromCode(langInfo.languageId));
    langInfo.messageBody = getContent(contentTable,getLangTypeFromCode(langInfo.languageId));
    langInfo.updatedAt = dayjs().format('YYYY-MM-DDTHH:mm:ss');
  }

  return bodyInfo;
};

const NewLanguagePresetPanel = (props) => {

  const { startLoading, setStartLoading } = useCommon();
  const { msgList, requestAddLanguagePreset, requestUpdateLanguagePreset } = useMessage();

  const [addClone, setAddClone] = useState(false);
  const [presetType, setPresetType] = useState(props.editMode ? props.presetType:0);
  const [presetIndex, setPresetIndex] = useState(0);
  const [presetID, setPresetID] = useState(0);
  const [presetTitle, setPresetTitle] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [langType, setLangType] = useState(0);
  const [titleTable, setTitleTable] = useState(props.editMode ? (props.presetInfo.titleTable !== undefined?props.presetInfo.titleTable:getDefaultTable) : getDefaultTable);
  const [contentTable, setContentTable] = useState(props.editMode ? (props.presetInfo.contentTable !== undefined?props.presetInfo.contentTable:getDefaultTable) : getDefaultTable);
  const [subMenuOpen,setSubMenuOpen] = useState(false);
  const [popupShown, setPopupShown] = useState(false);
  const [popupContent, setPopupContent] = useState('');


  const onPresetTitleChanged = (e) => {

    setPresetTitle(e.target.value);
  };

  const onTitleChanged = (e) => {

    const langCode = enumLangCode[langType].code;
    const langValue = getLangValue(langCode);

    const newTitleTable = titleTable.map(item=>{
      if(item.langValue === langValue) {
        return {...item,content:e.target.value};
      } else {
        return item;
      }
    });

    setTitleTable(table=>newTitleTable);

    setLastUpdated(dayjs().format('YYYY-MM-DD HH:mm:ss'));
  };

  const onContentChanged = (e) => {

    const langCode = enumLangCode[langType].code;
    const langValue = getLangValue(langCode);

    const newContentTable = contentTable.map(item=>{
      if(item.langValue === langValue) {
        return {...item,content:e.target.value};
      } else {
        return item;
      }
    });

    setContentTable(table=>newContentTable);

    setLastUpdated(dayjs().format('YYYY-MM-DD HH:mm:ss'));
  };

  const onAddCloneButtonClick = async (e) => {

    setAddClone(true);
    setPopupContent("수정된 프리셋 항목을 서버에 새로 추가하시겠습니까?");
    setPopupShown(true);
  }

  const onApplyButtonClick = async (e) => {

    let text = "";
    if(props.editMode === true) {
      text = "수정된 프리셋 항목을 서버에 업데이트하시겠습니까?";
    } else {
      text = "입력한 프리셋 항목을 서버에 추가하시겠습니까?";
    }

    setPopupContent(text);
    setPopupShown(true);
  };

  const onCancelButtonClick = (e) => {
    props.onMsgEditModeChange(false);
  };

  const onPopupButtonClick = async (buttonIdx) => {
    if (buttonIdx === 0) {
      setStartLoading(true);

      console.log('presetID=', presetID, ',titleTable=', titleTable, ',contentTable=', contentTable);
  
      let resultInfo;
      if (props.editMode === true && addClone === false) {
          resultInfo = await requestUpdateLanguagePreset({
            presetID:presetID,
            bodyInfo:convertInternalInfoToLangPresetInfo(props.presetInfo,presetTitle,titleTable,contentTable)
          });
      } else {
          resultInfo = await requestAddLanguagePreset({
            presetID:(addClone === true? 0 : presetID),
            bodyInfo:makeNewLangPresetInfo(presetType,presetTitle,titleTable,contentTable)
          });
      }
      console.log(resultInfo);
  
      setStartLoading(false);
      onPopupCloseButtonClick(null);

      if (resultInfo.resultCode !== 0) {
        toast.error(resultInfo.message);
      } else {
        if(props.editMode === true) {
          if(addClone === true) {
            toast.info("수정한 프리셋 항목으로 서버에 새로 추가하였습니다.");
          } else {
            toast.info("수정한 프리셋 항목이 서버에 반영되었습니다.");
          }
        } else {
          toast.info("입력한 프리셋 항목이 서버에 추가되었습니다.");
        }

        setTimeout(() => {
          props.onMsgEditModeChange(false);
        },1000);
      }
    }
  };

  const onPopupCloseButtonClick = (e) => {
    setPopupShown(false);
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen(state=>!subMenuOpen);
};

const onPresetMessageTypeItemClick = (item) => {
  setPresetIndex(item.id-1);
  setPresetType(constants.preMessageTypeTable[item.id-1].value);
};

const onLangCodeItemClick = (item) => {
  setLangType(item.id-1);
};

useEffect(()=> {
    props.onSubMenuOpenClicked(subMenuOpen);
},[subMenuOpen]);

useEffect(() => {
  if(props.editMode === true) {
    console.log('presetInfo=',props.presetInfo);

    let count = 0;
    for(let item of constants.preMessageTypeTable) {
      if(item.value === props.presetType) {
        setPresetIndex(count);
        break;
      }
      count++;
    }

    setPresetType(props.presetType);
    setPresetID(props.presetInfo.id);
    setPresetTitle(props.presetInfo.presetName);
    setLastUpdated(dayjs(props.presetInfo.updatedAt).format('YYYY-MM-DD HH:mm:ss'));
  }
},[]);

  return (
    <contentStyled.ContentWrapper>
      <contentStyled.ContentHeader>
      <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
        </MediaQuery>
        <span id="subtitle">{props.editMode ? `${props.parentTitle} > ${titleText2}` : titleText1}</span>
        <span>&nbsp;</span>
        <span id="button">
        {props.editMode ? (
            <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onAddCloneButtonClick(e)}>
              {'추가하기'}
            </Button1>
          ):(<></>)}
        </span>
        <span id="button">
          <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onApplyButtonClick(e)}>
            {props.editMode ? '수정하기' : '추가하기'}
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
        <br />
        <br />
        <styled.InputArea leftMargin="2.1vw" width="70%">
          <span className="row1">
            <label>프리셋ID</label>
          </span>
          <span className="row2">
          <InputField1 responsive='1.6' value={presetID} width="6vw" height="2vw" readOnly={true} />
          </span>
          <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <styled.InputArea leftMargin="2.2vw" width="70%">
          <span className="row1">
            <label>프리셋 타입</label>
          </span>
          <span className="row2">
            <DropBox responsive='1.3' width='10vw' height='2vw' fontSize='0.6vw' text={constants.preMessageTypeTable[presetIndex].name} itemList={constants.preMessageTypeTable} menuItemClick={(item)=>onPresetMessageTypeItemClick(item)} />
          </span>
          <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <styled.InputArea leftMargin="2.1vw" width="70%">
          <span className="row1">
            <label>프리셋 제목</label>
          </span>
          <span className="row2">
          <InputField1 responsive='1.6' value={presetTitle} width="28vw" height="2vw" onChange={(e) => onPresetTitleChanged(e)} />
          </span>
          <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <br />
        <styled.InputArea leftMargin="2.2vw" width="70%">
          <span className="row1">
            <label>언어</label>
          </span>
          <span className="row2">
            <DropBox responsive='1.3' width='10vw' height='2vw' fontSize='0.6vw' text={enumLangCode[langType].name} itemList={enumLangCode} menuItemClick={(item)=>onLangCodeItemClick(item)} />
          </span>
          <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <styled.InputArea leftMargin="2vw" width="70%">
          <span className="row1">
            <label>제목</label>
            <label>내용</label>
          </span>
          <span className="row2">
            <InputField1 responsive='1.6' value={getTitle(titleTable,langType)} width="28vw" height="2vw" placeholder={'4자이상 20자 미만'} onChange={(e) => onTitleChanged(e)} />
            <TextArea1 responsive='1.6' value={getContent(contentTable,langType)} width="28vw" height="12vw" onChange={(e) => onContentChanged(e)} />
          </span>
          <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <styled.InputArea leftMargin="2.1vw" width="70%">
          <span className="row1">
            <label>최종 갱신일</label>
          </span>
          <span className="row2">
          <InputField1 responsive='1.6' value={lastUpdated} width="10vw" height="2vw" readOnly={true} />
          </span>
          <span className="row3">&nbsp;</span>
        </styled.InputArea>
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
  );
};

export default NewLanguagePresetPanel;
