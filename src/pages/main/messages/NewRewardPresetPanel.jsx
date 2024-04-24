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

import RewardSettingPanel,{makeRewardDescInfo} from './RewardSettingPanel';

import useCommon from '../../../store/useCommonStorageManager';
import useMessage from '../../../store/useMessageDataManager';
import {enumLangCode,getLangValue,getLangCode,getTitle,getContent,getDefaultTable, getLangTypeFromCode} from '../notifications/NotificationManageContainer';

const titleText1 = '프리셋 추가';
const titleText2 = '프리셋 보기/수정';

const DatePickerInput = forwardRef((props) => {
  return <InputField1 width="8vw" height="2vw" {...props} />;
});

const rewardPresetBodyInfo = {
  "id":0,
  "rewardName":"",
  "presetCount":0,
  "supportItem":"",
  "updatedAt":"",
  "createdAt":"",
  "rewardPresetItems":[]
};

const rewardPresetItemInfo = {
  "id":0,
  "presetId":0,
  "itemType":0,
  "itemId":0,
  "quantity":0,
  "rate":10000,
  "updatedAt":"",
  "createdAt":""
};

const makeNewRewardPresetInfo = (presetTitle,rewardInfo) => {

  rewardPresetBodyInfo.rewardPresetItems = [];

  const bodyInfo = {...rewardPresetBodyInfo};
  bodyInfo.rewardName = presetTitle;
  bodyInfo.presetCount = rewardInfo.length;
  bodyInfo.updatedAt = dayjs().format('YYYY-MM-DDTHH:mm:ss');
  bodyInfo.createdAt = dayjs().format('YYYY-MM-DDTHH:mm:ss');

  for(let item of rewardInfo) {
    const itemInfo = {...rewardPresetItemInfo};
    itemInfo.itemType = item.ItemType;
    itemInfo.itemId = item.ItemId;
    itemInfo.quantity = item.Quantity;
    itemInfo.updatedAt = dayjs().format('YYYY-MM-DDTHH:mm:ss');
    itemInfo.createdAt = dayjs().format('YYYY-MM-DDTHH:mm:ss');

    bodyInfo.rewardPresetItems.push(itemInfo);
  }

  return bodyInfo;
};

const makeRewardInfoFromPresetInfo = (presetInfo) => {

    const rewardInfo = [];
    for(let info of presetInfo.rewardPresetItems) {
        rewardInfo.push({ItemType:info.itemType,ItemId:info.itemId,Quantity:info.quantity});
    }

    return rewardInfo;
};

const convertInternalInfoToRewardPresetInfo = (info,presetTitle,rewardInfo) => {

    const bodyInfo = {...info};
    bodyInfo.rewardPresetItems = [];

    bodyInfo.rewardName = presetTitle;
    bodyInfo.presetCount = rewardInfo.length;
    bodyInfo.updatedAt = dayjs().format('YYYY-MM-DDTHH:mm:ss');

    for(let item of rewardInfo) {
        const itemInfo = {...rewardPresetItemInfo};
        itemInfo.itemType = item.ItemType;
        itemInfo.itemId = item.ItemId;
        itemInfo.quantity = item.Quantity;
        itemInfo.updatedAt = dayjs().format('YYYY-MM-DDTHH:mm:ss');
        itemInfo.createdAt = dayjs().format('YYYY-MM-DDTHH:mm:ss');

        bodyInfo.rewardPresetItems.push(itemInfo);
    }

    console.log('#### bodyInfo=',bodyInfo);
    
    return bodyInfo;
};

const NewRewardPresetPanel = (props) => {

  const { startLoading, setStartLoading } = useCommon();
  const { msgList, requestAddRewardPreset, requestUpdateRewardPreset } = useMessage();

  const [rewardSetting, setRewardSetting] = useState(false);
  const [presetType, setPresetType] = useState(props.editMode ? props.presetType:0);
  const [presetID, setPresetID] = useState(0);
  const [presetTitle, setPresetTitle] = useState(props.editMode ? props.presetInfo.rewardName:'');
  const [rewardInfo, setRewardInfo] = useState([]);
  const [rewardDescInfo, setRewardDescInfo] = useState('');
  const [subMenuOpen,setSubMenuOpen] = useState(false);
  const [popupShown, setPopupShown] = useState(false);
  const [popupContent, setPopupContent] = useState('');


  const onPresetTitleChanged = (e) => {

    setPresetTitle(e.target.value);
  };

  const onApplyButtonClick = async (e) => {

    if(presetTitle.trim() === "") {
        toast.error('프리셋 제목이 설정되지 않았습니다.');
        return;
    }
    if(rewardInfo.length === 0) {
        toast.error('프리셋 보상내용이 설정되지 않았습니다.');
        return;
    }

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

      //console.log('presetID=', presetID, ',titleTable=', titleTable, ',contentTable=', contentTable);
  
      let resultInfo;
      if (props.editMode === true) {
          resultInfo = await requestUpdateRewardPreset({
            presetID:presetID,
            rewardData:convertInternalInfoToRewardPresetInfo(props.presetInfo,presetTitle,rewardInfo)
          });
      } else {
          resultInfo = await requestAddRewardPreset({
            presetID:presetID,
            rewardData:makeNewRewardPresetInfo(presetTitle,rewardInfo)
          });
      }
      console.log(resultInfo);
  
      setStartLoading(false);
      onPopupCloseButtonClick(null);

      if (resultInfo.resultCode !== 0) {
        toast.error(resultInfo.message);
      } else {
        if(props.editMode === true) {
          toast.info("수정한 프리셋 항목이 서버에 반영되었습니다.");
        } else {
          toast.info("입력한 프리셋 항목이 서버에 추가되었습니다.");
        }

        setTimeout(() => {
          props.onMsgEditModeChange(false);
        },1000);
      }
    } else {
      onPopupCloseButtonClick(null);
    }
  };

  const onPopupCloseButtonClick = (e) => {
    setPopupShown(false);
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen(state=>!subMenuOpen);
};

const onRewardSettingButtonClick = (e) => {

    setRewardSetting(true);
};

const onRewardSettingApplyButtonClick = (e,newRewardInfo,newRewardDescInfo) => {

    console.log('newRewardInfo=',newRewardInfo);

    setRewardInfo(newRewardInfo);
    setRewardDescInfo(newRewardDescInfo);
    setRewardSetting(false);
  };

  const onRewardSettingCancelButtonClick = (e) => {

    setRewardSetting(false);
  };

useEffect(()=> {
    props.onSubMenuOpenClicked(subMenuOpen);
},[subMenuOpen]);

useEffect(() => {
  if(props.editMode === true) {
    setPresetID(props.presetInfo.id);
    setPresetTitle(props.presetInfo.rewardName);

    const rewardInfo2 = makeRewardInfoFromPresetInfo(props.presetInfo);
    setRewardInfo(rewardInfo2);
    setRewardDescInfo(makeRewardDescInfo(rewardInfo2));

    console.log('rewardInfo=',rewardInfo2);
  }
},[]);

  return (
    rewardSetting===true?
    <RewardSettingPanel parentTitle={props.parentTitle} rewardInfo={rewardInfo} onApplyButtonClick={(e,newRewardInfo,newRewardDescInfo)=>onRewardSettingApplyButtonClick(e,newRewardInfo,newRewardDescInfo)} onCancelButtonClick={(e)=>onRewardSettingCancelButtonClick(e)} /> :
    (
    <contentStyled.ContentWrapper>
      <contentStyled.ContentHeader>
      <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
        </MediaQuery>
        <span id="subtitle">{props.editMode ? `${props.parentTitle} > ${titleText2}` : `${props.parentTitle} > ${titleText1}`}</span>
        <span>&nbsp;</span>
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
            <label>보상 내용</label>
          </span>
          <span className="row2">
          <TextArea1 responsive='1.6' value={JSON.stringify(rewardDescInfo)} width="28vw" height="12vw" readOnly={true} />
          </span>
          <span className="row3"><Button1 responsive='1.6' bgColor="var(--btn-primary-color)" width="6vw" height="2vw" onClick={(e) => onRewardSettingButtonClick(e)}>
            보상설정
          </Button1></span>
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
    )
  );
};

export default NewRewardPresetPanel;
