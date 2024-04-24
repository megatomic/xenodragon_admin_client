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
import {getLangTypeFromCode,getTitle,getContent} from '../notifications/NotificationManageContainer';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';
import Table from '../../../components/Table';
import Popup from '../../../components/Popup';

import NewRewardPresetPanel from './NewRewardPresetPanel';

import useCommon from '../../../store/useCommonStorageManager';
import useMessage from '../../../store/useMessageDataManager';

const RECNUM_PERPAGE = 10;
const titleText = '보상 프리셋 관리';
const tableHeaderInfo = ['__checkbox', 'ID', '갱신 시각', '제목', '보상내용'];

const tableHSpaceTable = '0.5fr 0.5fr 0.7fr 1.5fr 2.5fr';

const convertRewardPresetInfoToInternalInfo = (presetInfo) => {

  if(presetInfo === null) {
    return null;
  }

  // const titleList = [];
  // const contentList = [];
  // for(let langInfo of presetInfo.messagePresetLanguages) {
  //   titleList.push({langCode:parseInt(langInfo.languageId), langValue:getLangValue(parseInt(langInfo.languageId)), content:langInfo.messageSubject});
  //   contentList.push({langCode:parseInt(langInfo.languageId), langValue:getLangValue(parseInt(langInfo.languageId)), content:langInfo.messageBody});
  // }

  return {...presetInfo};
};

const makeTableFromRewardPresetList = (presetList) => {
  //console.log(msgList);

  const presetList2 = [];
  for(let info of presetList) {
    if(info.rewardPresetItems.length > 0) {
      presetList2.push(info);
    }
  }
  const result = presetList2.map((presetInfo, idx) => {
    
    const rewardInfoList = [];
    for(let info of presetInfo.rewardPresetItems) {
      rewardInfoList.push({ItemType:info.itemType,ItemId:info.itemId,Quantity:info.quantity});
    }

    return ['__checkbox', `${presetInfo.id}`, `${dayjs(presetInfo.updatedAt).format('YYYY-MM-DD HH:mm')}`, `${presetInfo.rewardName}`, `${JSON.stringify(rewardInfoList)}`];
  });

  return result;
};

const RewardPresetManagePanel = (props) => {
  const { startLoading, setStartLoading } = useCommon();
  const [rewardInfo, setRewardInfo] = useState([]);
  const [rewardDescInfo, setRewardDescInfo] = useState('');
  const { msgInfo, totalPageNum, requestRewardPresetList, requestUpdateRewardPreset, requestDeleteRewardPresets } = useMessage();
  const [newPreset, setNewPreset] = useState(false);
  const [curPageNo, setCurPageNo] = useState(1);
  const [rewardPresetList, setRewardPresetList] = useState([]);
  const [rewardPresetViewTable, setRewardPresetViewTable] = useState([]);
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

  const queryfilterInfo = {
    targetUserID: '',
    filterStartTime: '',
    filterEndTime: '',
  };

  const onAddPresetButtonClick = (e) => {
    
    setCheckedPresetList([]);
    setNewPreset(true);
  };

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
        presetList.push(rewardPresetList[i]);
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
      const resultInfo = await requestDeleteRewardPresets({presetIDList:[checkedPresetList[0].id]});

      console.log(resultInfo);

      if (resultInfo.resultCode !== 0) {
        toast.error(resultInfo.message);
      } else {
        toast.info('선택한 프리셋 항목(들)이 삭제되었습니다.');
      }

      await reloadRewardPresetList(queryfilterInfo);

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

  // const onKeyPress = (e) => {
  //   if (e.key === 'Enter') {
  //     onSearchMessageClick(e);
  //   }
  // };

  const reloadRewardPresetList = async (queryFilterInfo) => {
    setStartLoading(true);

    setTimeout(async () => {
      const resultInfo = await requestRewardPresetList({ queryFilterInfo, pageNo: curPageNo });

      console.log('rewardPresetListInfo=', resultInfo);
      if (resultInfo.resultCode === 0) {
        setRewardPresetList(resultInfo.data.list);
        setRewardPresetViewTable(makeTableFromRewardPresetList(resultInfo.data.list));
      } else {
        toast.error(resultInfo.message);
      }
      setStartLoading(false);
    }, 200);
  };

const onMsgEditModeChange = (start, data) => {
    if (start === true) {
    //   setEditInfo(data);
    //   setNotiEditMode(start);
    } else {
        setNewPreset(false);

        reloadRewardPresetList(queryfilterInfo);
    }
  };

    const onRewardSettingApplyButtonClick = (e,newRewardInfo,newRewardDescInfo) => {

        setRewardInfo(newRewardInfo);
        setRewardDescInfo(newRewardDescInfo);
        setNewPreset(false);
    };

    const onRewardSettingCancelButtonClick = (e) => {

        setNewPreset(false);
    };

    const onSubMenuOpenClick = (flag) => {

    };

    useEffect(()=> {
        props.onSubMenuOpenClicked(subMenuOpen);
    },[subMenuOpen]);

    useEffect(() => {
      reloadRewardPresetList(queryfilterInfo);
    },[curPageNo]);

  return (
    
        newPreset===true?(
          <NewRewardPresetPanel parentTitle={titleText} editMode={checkedPresetList.length===1} presetInfo={convertRewardPresetInfoToInternalInfo(checkedPresetList.length>0?checkedPresetList[0]:null)} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)} onMsgEditModeChange={(flag, data) => onMsgEditModeChange(flag, data)}/>
        ):(
            <contentStyled.ContentWrapper>
      <contentStyled.ContentHeader>
      <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuOpenClick(e)} />
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
        <br />
        <Table responsive='1.6'
          height='6vw'
          colFormat={tableHSpaceTable}
          headerInfo={tableHeaderInfo}
          bodyInfo={rewardPresetViewTable}
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

export default RewardPresetManagePanel;
