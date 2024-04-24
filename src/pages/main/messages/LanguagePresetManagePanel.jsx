import React, { useState, useCallback, forwardRef, useRef, useEffect } from 'react';
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
import {getLangTypeFromCode,getTitle,getLangValue,getContent} from '../notifications/NotificationManageContainer';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';
import Table from '../../../components/Table';
import Popup from '../../../components/Popup';

import NewLanguagePresetPanel from './NewLanguagePresetPanel';

import useCommon from '../../../store/useCommonStorageManager';
import useMessage from '../../../store/useMessageDataManager';

const RECNUM_PERPAGE = 10;
const titleText = '언어 프리셋 관리';

const tableHeaderInfo = ['__checkbox', 'ID', '생성시각', '제목/내용', '설정 언어수'];

const tableHSpaceTable = '0.5fr 1fr 1fr 2.5fr 0.8fr';

const DatePickerInput = forwardRef((props) => {
  return <InputField1 responsive='1.2' width="12vw" height="2vw" {...props} />;
});

const convertLangPresetInfoToInternalInfo = (presetInfo) => {

  if(presetInfo === null) {
    return null;
  }

  const titleList = [];
  const contentList = [];
  for(let langInfo of presetInfo.messagePresetLanguages) {
    titleList.push({langCode:parseInt(langInfo.languageId), langValue:getLangValue(parseInt(langInfo.languageId)), content:langInfo.messageSubject});
    contentList.push({langCode:parseInt(langInfo.languageId), langValue:getLangValue(parseInt(langInfo.languageId)), content:langInfo.messageBody});
  }

  return {...presetInfo,titleTable:titleList,contentTable:contentList};
};

const makeTableFromLangPresetList = (presetList) => {
  //console.log(msgList);

  const presetList2 = [];
  for(let info of presetList) {
    if(info.messagePresetLanguages.length > 0) {
      presetList2.push(info);
    }
  }
  const result = presetList2.map((presetInfo, idx) => {
    
    let activeLangCount = 0;
    let defaultPresetLangInfo = {messageSubject:"",messageBody:""};
    for(let info of presetInfo.messagePresetLanguages) {
      if(info.messageSubject.trim() !== "" && info.messageBody.trim() !== "") {
        activeLangCount++;
      }
      if((info.languageId === 23 && info.messageSubject.trim() !== "") || (info.languageId === 10 && info.messageSubject.trim() !== "")) {
        if(info.languageId === 23 || defaultPresetLangInfo.messageSubject === "") {
          defaultPresetLangInfo = info;
        }
      }
    }

    return ['__checkbox', `${presetInfo.id}  (${presetInfo.presetName})`, `${dayjs(presetInfo.updatedAt).format('YYYY-MM-DD HH:mm')}`, `[${defaultPresetLangInfo.messageSubject}]${defaultPresetLangInfo.messageBody}`, `${activeLangCount}/${presetInfo.messagePresetLanguages.length}`];
  });

  return result;
};

const LanguagePresetManagePanel = (props) => {
  const { startLoading, setStartLoading } = useCommon();
  const [preMsgType, setPreMsgType] = useState(0);
  const { msgInfo, totalPageNum, requestLanguagePresetList, requestDeleteLanguagePresets } = useMessage();
  const [newPreset, setNewPreset] = useState(false);
  const [curPageNo, setCurPageNo] = useState(1);
  const [langPresetList, setLangPresetList] = useState([]);
  const [langPresetViewTable, setLangPresetViewTable] = useState([]);
  const [checkedPresetList, setCheckedPresetList] = useState([]);
  const [popupShown, setPopupShown] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [subMenuOpen,setSubMenuOpen] = useState(false);

  const onPageNoClick = useCallback((event,pageNo) => {
    setCurPageNo(pageNo);
    return true;
  });

  const onGotoFirstPageClick = useCallback((event) => {
    setCurPageNo(1);
    return true;
  });

  const onGotoPrevPageClick = useCallback((event) => {
    if(curPageNo > 1) {
      setCurPageNo(curPageNo-1);
    }
    return true;
  });

  const onGotoNextPageClick = useCallback((event) => {
    if(curPageNo < totalPageNum(RECNUM_PERPAGE)) {
      setCurPageNo(curPageNo+1);
    }
    return true;
  });

  const onGotoLastPageClick = useCallback((event) => {
    setCurPageNo(totalPageNum(RECNUM_PERPAGE));
    return true;
  });

  const onSearchMessageClick = useCallback((event) => {

    // queryfilterInfo.targetUserID = targetUserID;

    // if (startDate === '') {
    //   queryfilterInfo.filterStartTime = '';
    // } else {
    //   queryfilterInfo.filterStartTime = utils.makeDateTimeStringFromDate(startDate);
    // }

    // if (endDate === '') {
    //   queryfilterInfo.filterEndTime = '';
    // } else {
    //   queryfilterInfo.filterEndTime = utils.makeDateTimeStringFromDate(endDate);
    // }

    reloadLanguagePresetList(queryfilterInfo);
  });

  const queryfilterInfo = {
    targetUserID: '',
    filterStartTime: '',
    filterEndTime: '',
  };

  const onPreMessageTypeItemClick = (item) => {

    setPreMsgType(item.id-1);
    setCurPageNo(1);
  };

  const onAddPresetButtonClick = (e) => {

    setNewPreset(true);
  }

  const onEditPresetButtonClick = (e) => {
    if (checkedPresetList.length !== 1) {
      toast.info('보기/수정할 프리셋 항목을 1개 선택해주세요.');
      return;
    }

    setNewPreset(true);
  };

  const onTableCheckBoxChanged = useCallback((checkList) => {
    const presetList = [];
    for (let i = 0; i < checkList.length; i++) {
      if (checkList[i] === true) {
        presetList.push(langPresetList[i]);
      }
    }

    setCheckedPresetList(presetList);
  });

  const onDeletePresetButtonClick = (e) => {
    if (checkedPresetList.length !== 1) {
      toast.info('삭제할 프리셋 항목을 1개만 선택해주세요.');
      return;
    }

    setPopupContent('프리셋 항목 삭제를 정말로 진행하시겠습니까?');
    setPopupShown(true);
  };

  const onPopupButtonClick = async (buttonIdx) => {
    if (buttonIdx === 0) {
      setPopupShown(false);

      setStartLoading(true);
      const resultInfo = await requestDeleteLanguagePresets({presetIDList:[checkedPresetList[0].id]});

      console.log(resultInfo);

      if (resultInfo.resultCode !== 0) {
        toast.error(resultInfo.message);
      } else {
        toast.info('선택한 프리셋 항목(들)이 삭제되었습니다.');
      }

      await reloadLanguagePresetList(queryfilterInfo);

      setStartLoading(false);

      setCheckedPresetList([]);
    }

    onPopupCloseButtonClick(null);
  };

  const onPopupCloseButtonClick = (e) => {
    setPopupShown(false);
  };

  //   const onTitleKeywordChange = (e) => {
  //     setTitleKeyword(e.target.value);
  //   };

  const onKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearchMessageClick(e);
    }
  };

  const reloadLanguagePresetList = async (queryFilterInfo) => {
    setStartLoading(true);

    setTimeout(async () => {
      const resultInfo = await requestLanguagePresetList({ queryFilterInfo, presetType:constants.preMessageTypeTable[preMsgType].value, pageNo: curPageNo });

      console.log('langPresetListInfo=', resultInfo);
      if (resultInfo.resultCode === 0) {
        setLangPresetList(resultInfo.data.list);
        setLangPresetViewTable(makeTableFromLangPresetList(resultInfo.data.list));
      } else {
        toast.error(resultInfo.message);
      }
      setStartLoading(false);
      setCheckedPresetList([]);
    }, 200);
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen(state=>!subMenuOpen);
};

const onMsgEditModeChange = (start, data) => {
    if (start === true) {
    //   setEditInfo(data);
    //   setNotiEditMode(start);
    } else {
        setNewPreset(false);

        reloadLanguagePresetList(queryfilterInfo);
    }
  };

  const onSubMenuOpenClick = (flag) => {

  };

  useEffect(()=> {
      props.onSubMenuOpenClicked(subMenuOpen);
  },[subMenuOpen]);

  useEffect(() => {
    reloadLanguagePresetList(queryfilterInfo);
  },[preMsgType,curPageNo]);

  return (
    
        newPreset===true?(
            <NewLanguagePresetPanel parentTitle={titleText} editMode={checkedPresetList.length===1} presetType={constants.preMessageTypeTable[preMsgType].value} presetInfo={convertLangPresetInfoToInternalInfo(checkedPresetList.length>0?checkedPresetList[0]:null)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)} onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)}/>
        ):(
            <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader>
            <MediaQuery maxWidth={768}>
                  &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
              </MediaQuery>
              <span id="subtitle">{titleText}</span>
              <span>&nbsp;</span>
              <span id="button">
                <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onAddPresetButtonClick(e)}>
                  추가
                </Button1>
              </span>
              <span id="button">
                <Button1 responsive='1.6' bgColor="var(--btn-secondary-color)" width="6vw" height="2vw" onClick={(e) => onEditPresetButtonClick(e)}>
                  보기/수정하기
                </Button1>
              </span>
              <span id="button">
                <Button1 responsive='1.6' bgColor="var(--btn-secondary-color)" width="6vw" height="2vw" onClick={(e) => onDeletePresetButtonClick(e)}>
                  삭제
                </Button1>
              </span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />
      
            <contentStyled.ContentBody>
            <contentStyled.FilterGroup>
              <contentStyled.FilterItem>
                <span id="name">메세지 타입</span>
                <span id="dropdown">
                  <DropBox responsive='1.3' 
                    width="10vw"
                    height="2vw"
                    fontSize="0.6vw"
                    text={constants.preMessageTypeTable[0].name}
                    itemList={constants.preMessageTypeTable}
                    menuItemClick={(item) => onPreMessageTypeItemClick(item)}
                  />
                </span>
              </contentStyled.FilterItem>
            </contentStyled.FilterGroup>
              <contentStyled.MainContentHeaderHorizontalLine marginBottom="1.5vw" />
              <Table responsive='1.6'
                height='3vw'
                colFormat={tableHSpaceTable}
                headerInfo={tableHeaderInfo}
                bodyInfo={langPresetViewTable}
                onPageNoClick={onPageNoClick}
                onGotoFirstPageClick={onGotoFirstPageClick}
                onGotoPrevPageClick={onGotoPrevPageClick}
                onGotoNextPageClick={onGotoNextPageClick}
                onGotoLastPageClick={onGotoLastPageClick}
                noPageControl={false}
                recordNumPerPage={RECNUM_PERPAGE}
                totalRecordNum={msgInfo.totalCount}
                onTableCheckBoxChanged={onTableCheckBoxChanged}
              />
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
        )
    
  );
};

export default LanguagePresetManagePanel;
