import React, {useState,useEffect,useRef,useCallback} from 'react';
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './UserManagePageStyles';

import Button1 from '../../../components/Button1';
import RadioGroup from '../../../components/RadioGroup';
import InputField1 from '../../../components/InputField1';
import TextArea1 from '../../../components/TextArea1';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useUser from '../../../store/useUserDataManager';
import useSetting from '../../../store/useSettingDataManager';
import { toast } from 'react-toastify';


const titleText = '블랙리스트에 등록하기';

const durationTable = [6,12,24,72,168,0];

const convertUserIDListToString = (userIDList) => {
    if(userIDList.length === 0) {
        return '';
    }

    let userIDListStr = '';
    for(let userID of userIDList) {
        userIDListStr += userID + ',';
    }

    if(userIDListStr.charAt(userIDListStr.length-1) === ',') {
        return userIDListStr.substring(0,userIDListStr.length-1);
    } else {
        return userIDListStr;
    }
};

const convertStringToUserIDList = (str) => {

    if(str === null || str === undefined || str.trim() === '') {
        return [];
    }

    return str.split(',');
};

const AddUserToBlacklistPanel = (props) => {

    //console.log('convertUserIDListToString:',convertUserIDListToString(['megatomic','yspark','pycaso99']));
    //console.log('convertStringToUserIDList:',convertStringToUserIDList('megatomic,yspark,pycaso99'));
    const { startLoading, setStartLoading } = useCommon();
    const {requestAddToBlacklist } = useUser();
    const [userIDList, setUserIDList] = useState(props.userIDList);
    const [reason, setReason] = useState('');
    const [durationTypeIndex, setDurationTypeIndex] = useState(0);
    const [releaseTypeIndex, setReleaseTypeIndex] = useState(0);
    const [customDurationValue, setCustomDurationValue] = useState(0);
    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [activeMenuID, setActiveMenuID] = useState(1);
    const [subMenuOpen,setSubMenuOpen] = useState(false);

    const onMenuItemClick = (item) => {
        setActiveMenuID(item.id);
    };

    const onRegisterButtonClick = (e) => {

      if(reason.trim() === '') {
        toast.error('사유를 입력해주세요.');
        return;
      }

      if(durationTable[durationTypeIndex] === 0 && releaseTypeIndex === 1) {
        toast.error('기간이 "영구"인 경우, 자동해제를 선택할 수 없습니다.');
        return;
      }

      setPopupContent('해당 유저들을 블랙리스트 목록에 추가하시겠습니까?');
      setPopupShown(true);
        //props.onApplyButtonClick(e);
    };

    const onPopupButtonClick = async (buttonIdx) => {
        if (buttonIdx === 0) {
          setStartLoading(true);

          let duration = durationTable[durationTypeIndex];
          if(customDurationValue > 0) {
            duration = customDurationValue;
          }
          const resultInfo = await requestAddToBlacklist({userIDList,reason,duration,autoReleaseFlag:(releaseTypeIndex===1?true:false)});
    
          console.log(resultInfo);
    
          if (resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
          } else {
            toast.info('지정된 유저들이 블랙리스트에 등록되었습니다.');
          }
     
          setStartLoading(false);

          setTimeout(() => {
            onCancelButtonClick(null);
        },0.2);
        }
    
        onPopupCloseButtonClick(null);
      };

      const onPopupCloseButtonClick = (e) => {
        setPopupShown(false);
      };

    const onCancelButtonClick = (e) => {
        props.onCancelButtonClick(e);
    };

    const onSubMenuClick = (e) => {
      setSubMenuOpen(state=>!subMenuOpen);
  };

  const onUserIDsChanged = (e) => {
    setUserIDList(convertStringToUserIDList(e.target.value));
  }
  
  const onReasonChanged = (e) => {
    setReason(e.target.value);
  }

  const onDurationRadioButtonClick = (idx) => {
    setCustomDurationValue(0);
    setDurationTypeIndex(idx);
  }

  const onReleaseTypeRadioButtonClick = (idx) => {
    setReleaseTypeIndex(idx);
  };

  const onCustomDurationValueChanged = (e) => {
    setCustomDurationValue(e.target.value);
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
          <span id="subtitle">{`${props.parentTitle} > ${titleText}`}</span>
          <span>&nbsp;</span>
          <span id="button">
            <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onRegisterButtonClick(e)}>
              등록
            </Button1>
          </span>
          <span id="button">
            <Button1 responsive='1.6' bgColor="var(--btn-secondary-color)" width="6vw" height="2vw" onClick={(e) => onCancelButtonClick(e)}>
              취소
            </Button1>
          </span>
        </contentStyled.ContentHeader>
        <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />
        <contentStyled.ContentBody>
        <br />
        <styled.InputArea leftMargin="4vw" width="70%">
          <span className="row1">
            <label>유저IDs</label>
            <label>사유</label>
          </span>
          <span className="row2">
            <TextArea1 responsive='1.8' readOnly={true} value={convertUserIDListToString(userIDList)} width="33vw" height="4vw" onChange={(e) => onUserIDsChanged(e)} />
            <TextArea1 responsive='1.8' value={reason} width="33vw" height="6vw" onChange={(e) => onReasonChanged(e)} />
          </span>
          <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <br />
        <contentStyled.SettingGroupArea leftMargin="0vw" width="90%">
          <styled.OptionItem>
            <span id="option_title">기간</span>
            <span id="col1">
              <RadioGroup responsive='1.6' initButtonIndex={durationTypeIndex} interMargin="0.3vw" nameTable={['6시간', '12시간', '1일', '3일', '7일', '영구']} buttonClicked={(idx) => onDurationRadioButtonClick(idx)} />
            </span>
            <span id='col2'>
                <span>특정기간</span>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <InputField1 responsive='1.6' width="5vw" height="2vw" placeholder={'4자이상 20자 미만'} value={customDurationValue} onChange={(e) => onCustomDurationValueChanged(e)} />
              <span>시간</span>
            </span>
          </styled.OptionItem>
          <br />
          <styled.OptionItem>
            <span id="option_title">해제타입</span>
            <span id="col1">
              <RadioGroup responsive='1.6' initButtonIndex={releaseTypeIndex} interMargin="0.3vw" nameTable={['수동 해제', '자동 해제']} buttonClicked={(idx) => onReleaseTypeRadioButtonClick(idx)} />
            </span>
          </styled.OptionItem>
          <br />
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
    )
};

export default AddUserToBlacklistPanel;