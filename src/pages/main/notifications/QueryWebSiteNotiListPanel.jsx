import React, { useState, useCallback, forwardRef, useRef } from 'react';
import MediaQuery from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import * as utils from '../../../common/js/utils';

import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './NotificationManagePageStyles';
import {getLangTypeFromCode,getTitle,getContent} from './NotificationManageContainer';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';
import Table from '../../../components/Table';
import Popup from '../../../components/Popup';

import * as constants from '../../../common/constants';
import useCommon from '../../../store/useCommonStorageManager';
import useNotification from '../../../store/useNotificationDataManager';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

dayjs.extend(utc);

const RECNUM_PERPAGE = 10;
const titleText = '웹사이트 공지사항 조회';
const tableHeaderInfo = ['__checkbox', '생성 시각', '제목', '내용', '공지 현황', '작성자'];
const tableHSpaceTable = '0.5fr 1fr 1fr 2fr 0.8fr 0.8fr';

const DatePickerInput = forwardRef((props) => {
  return <InputField1 responsive='1.2' width="8vw" height="2vw" {...props} />;
});

const makeTableFromNotificationList = (notificationList) => {
  console.log(notificationList);

  let state = '비활성화';
  const result = notificationList.map((notiInfo, idx) => {
    const startDate = dayjs(notiInfo.startTime);
    const endDate = dayjs(notiInfo.endTime);

    if (notiInfo.activationFlag === false) {
      state = '비활성화';
    } else {
      if (startDate.isAfter(dayjs()) === true) {
        state = dayjs(notiInfo.startTime).format('YYYY-MM-DD HH:mm:ss');
      } else if (startDate.isBefore(dayjs()) === true && endDate.isAfter(dayjs()) === true) {
        state = '공지중';
      } else {
        state = '공지종료';
      }
    }

    return ['__checkbox', dayjs(notiInfo.creationTime).format('YYYY-MM-DD HH:mm:ss'), getTitle(notiInfo.titleTable,getLangTypeFromCode(23)), getContent(notiInfo.contentTable,getLangTypeFromCode(23)), state, notiInfo.creatorID];
  });

  return result;
};

const QueryWebSiteNotiListPanel = (props) => {
  const navigate = useNavigate();

  const { startLoading, setStartLoading } = useCommon();
  const { notificationInfo, totalPageNum,requestNotificationList, requestDeleteNotifications } = useNotification();
  const [notificationList, setNotificationList] = useState([]);
  const [checkedNotiIDList, setCheckedNotiIDList] = useState([]);
  const [checkedFlagList, setCheckedFlagList] = useState([]);
  const [popupShown, setPopupShown] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [titleKeyword, setTitleKeyword] = useState('');
  const [subMenuOpen,setSubMenuOpen] = useState(false);


  const filterDeviceList = [
    { id: 1, name: 'iOS' },
    { id: 2, name: 'Android' },
  ];

  const onPageNoClick = useCallback((event) => {
    return true;
  });

  const onGotoFirstPageClick = useCallback((event) => {
    return true;
  });

  const onGotoPrevPageClick = useCallback((event) => {
    return true;
  });

  const onGotoNextPageClick = useCallback((event) => {
    return true;
  });

  const onGotoLastPageClick = useCallback((event) => {
    return true;
  });

  const onTitleKeywordChange = useCallback((event) => {
    setTitleKeyword(event.target.value);
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const queryfilterInfo = {
    titleKeyword: '',
    filterStartTime: null,
    filterEndTime: null,
  };
  const onSearchNotiClick = useCallback((event) => {
    queryfilterInfo.titleKeyword = titleKeyword;

    if (startDate === '') {
      queryfilterInfo.filterStartTime = null;
    } else {
      queryfilterInfo.filterStartTime = utils.makeDateTimeStringFromDate(startDate);
    }

    if (endDate === '') {
      queryfilterInfo.filterEndTime = null;
    } else {
      queryfilterInfo.filterEndTime = utils.makeDateTimeStringFromDate(endDate);
    }

    reloadNotificationList(queryfilterInfo);
  });

  const onDeviceTypeItemClick = useCallback((item) => {
    console.log(item.name);
  });

  const onDatePickerSelect = (date) => {};

  const onSearchAllLoginDurationUserClick = useCallback((event) => {
    setStartDate('');
    setEndDate('');
  });

  const onStartTimeDatePickerChanged = (date) => {
    setStartDate(date);

    if (endDate === '') {
      return;
    }

    const startDate2 = dayjs(utils.makeDateTimeStringFromDate(date));
    const endDate2 = dayjs(utils.makeDateTimeStringFromDate(endDate));

    if (startDate2.isBefore(endDate2) === false) {
      toast.error('시작일자는 종료일자보다 더 이전이어야 합니다.');
    }
  };

  const onEndTimeDatePickerChanged = (date) => {
    setEndDate(date);

    if (startDate === '') {
      return;
    }

    const startDate2 = dayjs(utils.makeDateTimeStringFromDate(startDate));
    const endDate2 = dayjs(utils.makeDateTimeStringFromDate(date));

    if (startDate2.isBefore(endDate2) === false) {
      toast.error('종료일자는 시작일자보다 더 나중이어야 합니다.');
    }
  };

  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  const onNotiEditClick = useCallback((event) => {
    if (checkedFlagList.length !== 1) {
      toast.info('보기/수정할 공지사항 항목을 1개 선택해주세요.');
      return;
    }

    for (let notiInfo of notificationInfo.notificationList) {
      //console.log('notiInfo.notiID=', notiInfo.notiID, ',', checkedNotiIDList[0]);
      if (notiInfo.notiID === checkedNotiIDList[0]) {
        props.onNotiEditModeChange(true, { parentTitle: titleText, notiInfo });
        break;
      }
    }
  });

  const reloadNotificationList = async (queryFilterInfo) => {
    setStartLoading(true);
    setTimeout(async () => {
      const resultInfo = await requestNotificationList({ queryFilterInfo, notiType: constants.NOTIFICATION_TYPE_WEBSITE, pageNo: 1 });

      console.log(resultInfo);
      if (resultInfo.resultCode === 0) {
        setNotificationList(makeTableFromNotificationList(resultInfo.data.list));
      } else {
        toast.error(resultInfo.message);
      }
      setStartLoading(false);
    }, 200);
  };

  const onTableCheckBoxChanged = useCallback((checkList) => {
    const idList = [];
    const flagList = [];
    for (let i = 0; i < checkList.length; i++) {
      if (checkList[i] === true) {
        idList.push(notificationInfo.notificationList[i].notiID);
        flagList.push(!notificationInfo.notificationList[i].activationFlag);
      }
    }

    setCheckedNotiIDList(idList);
    setCheckedFlagList(flagList);
  });

  const onDeleteNotiButtonClick = async (e) => {
    if (checkedNotiIDList.length === 0) {
      toast.info('삭제할 공지사항 항목을 선택해주세요.');
      return;
    }

    setPopupContent('공지사항 항목 삭제를 정말로 진행하시겠습니까?');
    setPopupShown(true);
  };

  const onPopupButtonClick = async (buttonIdx) => {
    if (buttonIdx === 0) {
      setStartLoading(true);
      const resultInfo = await requestDeleteNotifications(checkedNotiIDList);

      console.log(resultInfo);

      if (resultInfo.resultCode !== 0) {
        toast.error(resultInfo.message);
      } else {
        toast.info('선택한 공지사항 항목(들)이 삭제되었습니다.');
      }

      await reloadNotificationList(queryfilterInfo);

      setStartLoading(false);

      setCheckedNotiIDList([]);
      setCheckedFlagList([]);
    }

    onPopupCloseButtonClick(null);
  };

  const onPopupCloseButtonClick = (e) => {
    setPopupShown(false);
  };

  const onKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearchNotiClick(e);
    }
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen(state=>!subMenuOpen);
};

useEffect(()=> {
    props.onSubMenuOpenClicked(subMenuOpen);
},[subMenuOpen]);

  useEffect(() => {
    reloadNotificationList(queryfilterInfo);
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
          <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onNotiEditClick(e)}>
            보기/수정하기
          </Button1>
        </span>
        <span id="button">
          <Button1 responsive='1.6' bgColor="var(--btn-secondary-color)" width="6vw" height="2vw" onClick={(e) => onDeleteNotiButtonClick(e)}>
            삭제하기
          </Button1>
        </span>
      </contentStyled.ContentHeader>
      <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />

      <contentStyled.ContentBody>
        <contentStyled.FilterGroup>
          <contentStyled.FilterItem>
            <span id="name">공지사항 검색</span>
            <span id="input">
              <InputField1
                responsive='1.6' 
                width="12vw"
                height="2vw"
                placeholder={'공지사항 제목의 일부를 입력하세요.'}
                value={titleKeyword}
                onChange={(e) => onTitleKeywordChange(e)}
                onKeyPress={(e) => onKeyPress(e)}
              />
            </span>
            <span id="search">
              <Button1 responsive='1.6' bgColor="var(--btn-primary-color)" width="4vw" height="1.8vw" onClick={(e) => onSearchNotiClick(e)}>
                검색
              </Button1>
            </span>
          </contentStyled.FilterItem>
          <contentStyled.FilterItem>
            <span id="name" style={{ marginRight: '2vw' }}>
              생성 시각:
            </span>
            <span id="name">시작일시</span>
            <span id="input">
              <DatePicker selected={startDate} onChange={onStartTimeDatePickerChanged} showTimeSelect dateFormat="Pp" timeIntervals={10} customInput={<DatePickerInput ref={startInputRef} />} />
            </span>
            <span id="name">종료일시</span>
            <span id="input">
              <DatePicker selected={endDate} onChange={onEndTimeDatePickerChanged} showTimeSelect dateFormat="Pp" timeIntervals={10} customInput={<DatePickerInput ref={endInputRef} />} />
            </span>
            <span id="search">
              <Button1 responsive='1.6' bgColor="var(--btn-primary-color)" width="4vw" height="1.8vw" onClick={(e) => onSearchAllLoginDurationUserClick(e)}>
                전체
              </Button1>
            </span>
          </contentStyled.FilterItem>
        </contentStyled.FilterGroup>
        <contentStyled.MainContentHeaderHorizontalLine marginBottom="1.5vw" />
        <Table responsive='1.6' 
          colFormat={tableHSpaceTable}
          headerInfo={tableHeaderInfo}
          bodyInfo={notificationList}
          onPageNoClick={onPageNoClick}
          onGotoFirstPageClick={onGotoFirstPageClick}
          onGotoPrevPageClick={onGotoPrevPageClick}
          onGotoNextPageClick={onGotoNextPageClick}
          onGotoLastPageClick={onGotoLastPageClick}
          noPageControl={false}
          recordNumPerPage={RECNUM_PERPAGE}
          totalRecordNum={notificationInfo.totalCount}
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
  );
};

export default QueryWebSiteNotiListPanel;
