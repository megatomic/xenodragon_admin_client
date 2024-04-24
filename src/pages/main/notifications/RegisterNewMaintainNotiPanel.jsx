import React, { useState, useRef, forwardRef } from 'react';
import MediaQuery from 'react-responsive';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import * as utils from '../../../common/js/utils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import useCommon from '../../../store/useCommonStorageManager';
import useAuth from '../../../store/useAuthDataManager';
import useNotification from '../../../store/useNotificationDataManager';

import * as constants from '../../../common/constants';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './NotificationManagePageStyles';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import TextArea1 from '../../../components/TextArea1';
import CheckBox from '../../../components/CheckBox';
import RadioGroup from '../../../components/RadioGroup';
import DropBox from '../../../components/DropBox';
import { useEffect } from 'react';

import {langTable} from '../../../common/LangTable';

const titleText1 = '새 유지보수 공지사항 등록';
const titleText2 = '공지사항 정보 보기/수정';

const enumLangCode = [
  {id:1, name:'한국어'},
  {id:2, name:'영어'}
];

const DatePickerInput = forwardRef((props) => {
  return <InputField1 responsive='1.3' width="12vw" height="2vw" {...props} />;
});

const checkValidReservationDate = (startTime, endTime) => {
  const startDate = dayjs(utils.makeDateTimeStringFromDate(startTime));
  const endDate = dayjs(utils.makeDateTimeStringFromDate(endTime));
  let curDate = dayjs();

  if (endDate.isBefore(startDate.add(9, 'minute')) === true) {
    toast.error('공지종료 일자는 시작일자보다 10분 이후이어야 합니다.');
  }
};

const RegisterNewMaintainNotiPanel = (props) => {
  
  const { setStartLoading } = useCommon();
  const { requestNewNotification, requestModifyNotification } = useNotification();

  const [langType, setLangType] = useState(0);
  const [startTime, setStartTime] = useState(props.editMode ? new Date(props.editInfo.notiInfo.startTime) : new Date(Date.now() + 10 * 60000));
  const [endTime, setEndTime] = useState(props.editMode ? new Date(props.editInfo.notiInfo.endTime) : new Date(startTime.getTime() + 10 * 60000));
  const [title, setTitle] = useState(props.editMode ? props.editInfo.notiInfo.title : '');
  const [content, setContent] = useState(props.editMode ? props.editInfo.notiInfo.title : '');
  const [reservationFlag, setReservationFlag] = useState(props.editMode ? props.editInfo.notiInfo.notShowAgainFlag : false);
  const [activationFlag, setActivationFlag] = useState(props.editMode ? props.editInfo.notiInfo.activationFlag : false);
  const [subMenuOpen,setSubMenuOpen] = useState(false);

  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  console.log('startTime=', startTime.toISOString(), ',endTime=', endTime.toISOString());
  const onDatePickerSelect = (date) => {};

  const onTitleChanged = (e) => {
    setTitle(e.target.value);
  };

  const onContentChanged = (e) => {
    setContent(e.target.value);
  };

  const onReservedNotiCheckBoxChanged = (idx) => {
    setReservationFlag(idx === 0 ? false : true);
  };

  const onActivationButtonClick = (idx) => {
    setActivationFlag(idx === 0 ? true : false);
  };

  const onRegisterButtonClick = async (e) => {
    //props.onApplyButtonClick(e,null);

    if (title.trim() === '') {
      toast.error('제목을 작성해주세요.');
      return;
    }

    if (content.trim() === '') {
      toast.error('공지내용을 작성해주세요.');
      return;
    }

    setStartLoading(true);

    let resultInfo;
    if (props.editMode === true) {
      resultInfo = await requestModifyNotification({
        notiID: props.editInfo.notiInfo.notiID,
        notiType: constants.NOTIFICATION_TYPE_MAINTENANCE,
        title: title,
        content: content,
        notShowAgainFlag: reservationFlag,
        startTime: utils.makeDateTimeStringFromDate(startTime),
        endTime: utils.makeDateTimeStringFromDate(endTime),
        activationFlag: activationFlag,
      });
    } else {
      resultInfo = await requestNewNotification({
        notiType: constants.NOTIFICATION_TYPE_MAINTENANCE,
        title: title,
        content: content,
        notShowAgainFlag: reservationFlag,
        startTime: utils.makeDateTimeStringFromDate(startTime),
        endTime: utils.makeDateTimeStringFromDate(endTime),
        activationFlag: activationFlag,
      });
    }
    console.log(resultInfo);

    if (resultInfo.resultCode !== 0) {
      toast.error(resultInfo.message);
    } else {
      if (props.editMode === true) {
        toast.info('공지사항이 수정되었습니다.');
      } else {
        toast.info('새 공지사항이 등록되었습니다.');
      }
    }
    setStartLoading(false);

    onCancelButtonClick(null);
  };

  const onCancelButtonClick = async (e) => {
    props.onNotiEditModeChange(false);
  };

  useEffect(() => {
    checkValidReservationDate(startTime, endTime);
  }, [startTime, endTime]);

  const onSubMenuClick = (e) => {
    setSubMenuOpen(state=>!subMenuOpen);
};

const onLangCodeItemClick = (item) => {
  setLangType(item.id-1);
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
        <span id="subtitle">{props.editMode ? `${props.editInfo.parentTitle} > ${titleText2}` : titleText1}</span>
        <span>&nbsp;</span>
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
        <br />
        <br />
        <styled.InputArea leftMargin="3.2vw" width="70%">
          <span className="row1">
            <label>언어</label>
          </span>
          <span className="row2">
            <DropBox responsive='1.3' width='10vw' height='2vw' fontSize='0.6vw' text={enumLangCode[langType].name} itemList={enumLangCode} menuItemClick={(item)=>onLangCodeItemClick(item)} />
          </span>
          <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <styled.InputArea leftMargin="4vw" width="70%">
          <span className="row1">
            <label>제목</label>
            <label>내용</label>
          </span>
          <span className="row2">
            <InputField1 responsive='1.8' value={title} width="33vw" height="2vw" placeholder={'제목을 입력하세요.(40자 이내)'} onChange={(e) => onTitleChanged(e)} />
            <TextArea1 responsive='1.8' value={content} width="33vw" height="22vw" placeholder={'내용을 입력하세요.(500자 이내)'} onChange={(e) => onContentChanged(e)} />
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
            <span id="option_title">공지 게시 시점</span>
            <span id="col1">
              <RadioGroup responsive='1.6' initButtonIndex={0} interMargin="1vw" nameTable={['즉시', '예약']} buttonClicked={(idx) => onReservedNotiCheckBoxChanged(idx)} />
            </span>
          </styled.OptionItem>
          <br />
          <styled.OptionItem>
            <span id="option_title">공지 시작일</span>
            <span id="sub_col1">
              <DatePicker selected={startTime} onChange={(date) => setStartTime(date)} showTimeSelect dateFormat="Pp" timeIntervals={10} customInput={<DatePickerInput ref={startInputRef} />} />
            </span>
            <span id="option_title">공지 종료일</span>
            <span id="sub_col1">
              <DatePicker selected={endTime} onChange={(date) => setEndTime(date)} showTimeSelect dateFormat="Pp" timeIntervals={10} customInput={<DatePickerInput ref={endInputRef} />} />
            </span>
          </styled.OptionItem>
          <br />
        </contentStyled.SettingGroupArea>
      </contentStyled.ContentBody>
    </contentStyled.ContentWrapper>
  );
};

export default RegisterNewMaintainNotiPanel;
