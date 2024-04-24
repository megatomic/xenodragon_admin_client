import React, {
  useState,
  useRef,
  forwardRef,
  useCallback,
  useEffect,
} from 'react';
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
import RadioGroup from '../../../components/RadioGroup';
import Popup from '../../../components/Popup';
import SendStatePopup from './SendStatePopup';

import useCommon from '../../../store/useCommonStorageManager';
import useMessage from '../../../store/useMessageDataManager';
import {
  enumLangCode,
  getLangValue,
  getLangCode,
  getTitle,
  getContent,
  getDefaultTable,
} from '../notifications/NotificationManageContainer';

const titleText1 = '새 푸쉬알림 보내기';
const titleText2 = '푸쉬알림 보기/수정';

const DatePickerInput = forwardRef((props) => {
  return <InputField1 width="8vw" height="2vw" {...props} />;
});

const SendNewPushMessagePanel = (props) => {
  const { startLoading, setStartLoading } = useCommon();
  const { msgList, requestNewMessage, requestModifyMessage } = useMessage();
  const [langType, setLangType] = useState(0);
  const [sendType, setSendType] = useState(
    props.editMode
      ? props.editInfo.msgInfo.targetUserID != ''
        ? constants.MSGTARGET_TYPE_USER
        : constants.MSGTARGET_TYPE_ALL
      : constants.MSGTARGET_TYPE_ALL
  );
  const [targetUserID, setTargetUserID] = useState(
    props.editMode ? props.editInfo.msgInfo.targetUserID : ''
  );
  const [startDate, setStartDate] = useState(
    props.editMode
      ? new Date(props.editInfo.msgInfo.startTime)
      : new Date(Date.now() + 10 * 60000)
  );
  const [dryRun, setDryRun] = useState(1);
  const [reservationFlag, setReservationFlag] = useState(
    props.editMode ? props.editInfo.msgInfo.reservationFlag : false
  );
  const [pushReqID, setPushReqID] = useState(-1);
  const [sendStatePopupShown, setSendStatePopupShown] = useState(false);
  const [popupShown, setPopupShown] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [subMenuOpen, setSubMenuOpen] = useState(false);

  const [titleTable, setTitleTable] = useState(
    props.editMode ? props.editInfo.msgInfo.titleTable : getDefaultTable
  );
  const [contentTable, setContentTable] = useState(
    props.editMode ? props.editInfo.msgInfo.titleTable : getDefaultTable
  );

  const startInputRef = useRef(null);

  const filterTargetUserList = [
    { id: 1, name: '전체' },
    { id: 2, name: '안드로이드 유저' },
    { id: 3, name: 'iOS 유저' },
    { id: 4, name: '특정 유저' },
  ];

  const onTargetUserItemClick = useCallback((item) => {
    setSendType(item.id);
    if (item.id !== constants.MSGTARGET_TYPE_USER) {
      setTargetUserID('');
    }
  });

  const onReservedNotiCheckBoxChanged = (date) => {
    setStartDate(date);
  };

  const onStartTimeDatePickerChanged = (date) => {
    setStartDate(date);

    const startDate2 = dayjs(utils.makeDateTimeStringFromDate(date));

    if (startDate2.isBefore(dayjs()) === true) {
      toast.error('예약 전송일은 지금 시각 이후이어야 합니다.');
    }
  };

  const onTargetUserIDChanged = (e) => {
    setTargetUserID(e.target.value);
  };

  const onTitleChanged = (e) => {
    const langCode = enumLangCode[langType].code;
    const langValue = getLangValue(langCode);

    const newTitleTable = titleTable.map((item) => {
      if (item.langValue === langValue) {
        return { ...item, content: e.target.value };
      } else {
        return item;
      }
    });

    setTitleTable((table) => newTitleTable);
  };

  const onContentChanged = (e) => {
    const langCode = enumLangCode[langType].code;
    const langValue = getLangValue(langCode);

    const newContentTable = contentTable.map((item) => {
      if (item.langValue === langValue) {
        return { ...item, content: e.target.value };
      } else {
        return item;
      }
    });

    setContentTable((table) => newContentTable);
  };

  const onActivationButtonClick = (idx) => {
    setDryRun(idx);
  };

  const onReservationButtonClick = (idx) => {
    setReservationFlag(idx === 1 ? true : false);
  };

  const onSendButtonClick = async (e) => {
    const contentInfo = [];
    contentInfo.push(` `);
    contentInfo.push(`제목:${getTitle(titleTable, langType)}`);
    contentInfo.push(`내용:${getContent(contentTable, langType)}`);
    if (sendType === constants.MSGTARGET_TYPE_USER) {
      contentInfo.push(`타겟: 특정유저(${targetUserID})`);
    } else if (sendType === constants.MSGTARGET_TYPE_ANDROID) {
      contentInfo.push(`타겟: 안드로이드`);
    } else if (sendType === constants.MsGTARGET_TYPE_IOS) {
      contentInfo.push(`타겟: iOS`);
    } else {
      contentInfo.push(`타겟: 전체유저`);
    }
    contentInfo.push(` `);
    contentInfo.push('푸시 메세지를 전송하시겠습니까?');
    contentInfo.push(` `);

    setPopupContent(contentInfo);
    setPopupShown(true);
  };

  const getSendTypeValue = (type) => {
    if (type === constants.MSGTARGET_TYPE_USER) {
      return 'user';
    } else if (type === constants.MSGTARGET_TYPE_ANDROID) {
      return 'android';
    } else if (type === constants.MsGTARGET_TYPE_IOS) {
      return 'ios';
    } else {
      return 'all';
    }
  };

  const onPopupButtonClick = async (buttonIdx) => {
    if (buttonIdx === 0) {
      setStartLoading(true);

      //console.log('sendType=', sendType, ',targetUserID=', targetUserID);

      let resultInfo;
      if (props.editMode === true) {
        resultInfo = await requestModifyMessage({
          msgID: props.editInfo.msgInfo.msgID,
          msgType: constants.MESSAGE_TYPE_PUSHALARM,
          targetType: getSendTypeValue(sendType),
          targetUserID:
            sendType !== constants.MSGTARGET_TYPE_USER ? '' : targetUserID,
          titleTable: titleTable,
          contentTable: contentTable,
          reservationFlag: reservationFlag.toString(),
          startTime: utils.makeDateTimeStringFromDate(startDate),
          liveFlag: dryRun === 1 ? true : false,
        });
      } else {
        resultInfo = await requestNewMessage({
          msgType: constants.MESSAGE_TYPE_PUSHALARM,
          targetType: getSendTypeValue(sendType),
          targetUserID:
            sendType !== constants.MSGTARGET_TYPE_USER ? '' : targetUserID,
          titleTable: titleTable,
          contentTable: contentTable,
          reservationFlag: reservationFlag.toString(),
          startTime: utils.makeDateTimeStringFromDate(startDate),
          liveFlag: dryRun === 1 ? true : false,
        });
      }
      console.log(resultInfo);

      setStartLoading(false);

      onPopupCloseButtonClick(null);

      if (resultInfo.resultCode !== 0) {
        toast.error(resultInfo.message);
        onCancelButtonClick(null);
      } else {
        //toast.info('푸쉬 메세지를 전송하였습니다.');

        if (
          resultInfo.data.reservationFlag !== undefined &&
          resultInfo.data.reservationFlag === true
        ) {
          toast.info(
            `푸쉬메세지 전송이 예약되었습니다.(시간:${resultInfo.data.startTime})`
          );
        } else {
          setPushReqID(resultInfo.data.reqID);
          setSendStatePopupShown(true);
        }
      }
    } else {
      onPopupCloseButtonClick(null);
    }
  };

  const onPopupCloseButtonClick = (e) => {
    setPopupShown(false);
  };

  const onCancelButtonClick = (e) => {
    props.onMsgEditModeChange(false);
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen((state) => !subMenuOpen);
  };

  const onLangCodeItemClick = (item) => {
    setLangType(item.id - 1);
  };

  const onSendStatePopupCancelButtonClick = (event) => {
    setSendStatePopupShown(false);
    toast.info('푸쉬메세지 전송이 취소되었습니다!');
  };

  const sendingFinishCallback = (resultInfo) => {
    if (resultInfo.resultCode === 0) {
      toast.info('푸쉬메세지 전송을 완료하였습니다.');
    } else {
      toast.error(
        '푸쉬메세지 전송에 실패하였습니다:(code=' + resultInfo.resultCode + ')'
      );
    }
    onCancelButtonClick(null);
  };

  useEffect(() => {
    props.onSubMenuOpenClicked(subMenuOpen);
  }, [subMenuOpen]);

  return (
    <contentStyled.ContentWrapper>
      <contentStyled.ContentHeader>
        <MediaQuery maxWidth={768}>
          &nbsp;&nbsp;
          <i
            className="fas fa-bars"
            style={{ fontSize: '3vw' }}
            onClick={(e) => onSubMenuClick(e)}
          />
        </MediaQuery>
        <span id="subtitle">
          {props.editMode
            ? `${props.editInfo.parentTitle} > ${titleText2}`
            : titleText1}
        </span>
        <span>&nbsp;</span>
        <span id="button">
          <Button1
            responsive="1.6"
            bgColor="var(--btn-confirm-color)"
            width="6vw"
            height="2vw"
            onClick={(e) => onSendButtonClick(e)}
          >
            {props.editMode ? '수정하기' : '전송하기'}
          </Button1>
        </span>
        <span id="button">
          <Button1
            responsive="1.6"
            bgColor="var(--btn-secondary-color)"
            width="6vw"
            height="2vw"
            onClick={(e) => onCancelButtonClick(e)}
          >
            취소하기
          </Button1>
        </span>
      </contentStyled.ContentHeader>
      <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />

      <contentStyled.ContentBody>
        <br />
        <br />
        <contentStyled.FilterGroup marginLeft="5.4vw">
          <contentStyled.FilterItem>
            <span id="name">전송 대상</span>
            <span id="dropdown">
              <DropBox
                width="10vw"
                text={filterTargetUserList[sendType - 1].name}
                height="2vw"
                fontSize="0.6vw"
                itemList={filterTargetUserList}
                menuItemClick={(item) => onTargetUserItemClick(item)}
              />
            </span>
          </contentStyled.FilterItem>
          <contentStyled.FilterItem>
            <span id="name">유저ID</span>
            <span id="input">
              <InputField1
                responsive="1.2"
                width="12vw"
                height="2vw"
                placeholder={'유저ID 또는 닉네임을 입력하세요.'}
                readOnly={sendType !== constants.MSGTARGET_TYPE_USER}
                value={targetUserID}
                onChange={(e) => onTargetUserIDChanged(e)}
              />
            </span>
          </contentStyled.FilterItem>
        </contentStyled.FilterGroup>
        <br />
        <styled.InputArea leftMargin="4.2vw" width="70%">
          <span className="row1">
            <label>언어</label>
          </span>
          <span className="row2">
            <DropBox
              responsive="1.3"
              width="10vw"
              height="2vw"
              fontSize="0.6vw"
              text={enumLangCode[langType].name}
              itemList={enumLangCode}
              menuItemClick={(item) => onLangCodeItemClick(item)}
            />
          </span>
          <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <styled.InputArea leftMargin="4vw" width="70%">
          <span className="row1">
            <label>제목</label>
            <label>내용</label>
          </span>
          <span className="row2">
            <InputField1
              responsive="1.6"
              value={getTitle(titleTable, langType)}
              width="28vw"
              height="2vw"
              placeholder={'4자이상 20자 미만'}
              onChange={(e) => onTitleChanged(e)}
            />
            <TextArea1
              responsive="1.6"
              value={getContent(contentTable, langType)}
              width="28vw"
              height="12vw"
              onChange={(e) => onContentChanged(e)}
            />
          </span>
          <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <br />
        <contentStyled.SettingGroupArea leftMargin="0vw" width="90%">
          <styled.OptionItem>
            <span id="option_title">테스트 모드</span>
            <span id="col1">
              <RadioGroup
                initButtonIndex={dryRun}
                interMargin="1vw"
                nameTable={['실제 전송', '테스트 전송']}
                buttonClicked={(idx) => onActivationButtonClick(idx)}
              />
            </span>
          </styled.OptionItem>
          <br />
          <styled.OptionItem>
            <span id="option_title">푸쉬알림 게시 시점</span>
            <span id="col1">
              <RadioGroup
                initButtonIndex={reservationFlag ? 1 : 0}
                interMargin="1vw"
                nameTable={['즉시', '예약']}
                buttonClicked={(idx) => onReservationButtonClick(idx)}
              />
            </span>
            <span id="option_title">예약 전송일</span>
            <span id="sub_col1">
              <DatePicker
                selected={startDate}
                onChange={onStartTimeDatePickerChanged}
                showTimeSelect
                dateFormat="Pp"
                timeIntervals={10}
                customInput={<DatePickerInput ref={startInputRef} />}
              />
            </span>
          </styled.OptionItem>

          <br />
        </contentStyled.SettingGroupArea>
      </contentStyled.ContentBody>
      <Popup
        shown={popupShown}
        popupTypeInfo={{
          type: 'YesNo',
          button1Text: '예',
          button2Text: '아니오',
        }}
        title="주의"
        content={popupContent}
        buttonClick={(buttonNo) => onPopupButtonClick(buttonNo)}
        closeClick={onPopupCloseButtonClick}
      />
      <SendStatePopup
        shown={sendStatePopupShown}
        requestID={pushReqID}
        callback={sendingFinishCallback}
        cancelClick={onSendStatePopupCancelButtonClick}
      />
    </contentStyled.ContentWrapper>
  );
};

export default SendNewPushMessagePanel;
