import React, { useState, useCallback, forwardRef, useRef } from 'react';
import MediaQuery from 'react-responsive';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import * as utils from '../../../common/js/utils';

import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './LogViewPageStyles';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';
import Table from '../../../components/Table';
import { useEffect } from 'react';

import * as constants from '../../../common/constants';
import useCommon from '../../../store/useCommonStorageManager';
import useAdminActLog from '../../../store/useLogDataManager';
import { toast } from 'react-toastify';

const RECNUM_PERPAGE = 10;
const titleText = '관리자 활동로그 조회';
const tableHeaderInfo = ['__checkbox', '로깅 시각', '계정ID', '활동 구분', '세부 사항'];

const tableHSpaceTable = '0.5fr 1.2fr 1fr 1fr 3fr';

const DatePickerInput = forwardRef((props) => {
  return <InputField1 responsive='1.2' width="12vw" height="2vw" {...props} />;
});

const getActivityNameFromID = (activityID) => {

  const resultTable = activityLogTypeTable.filter((e)=>e.code === activityID);

  console.log('activityID=',activityID,',resultTable=',resultTable);

  if(resultTable.length === 0) {
    return '';
  } else {
    return resultTable[0].name;
  }
};

const makeTableFromLogList = (logList) => {
  let state = '비활성화';
  const result = logList.map((logInfo, idx) => {
    const startDate = dayjs(logInfo.startTime);
    const endDate = dayjs(logInfo.endTime);

    if (logInfo.activationFlag === false) {
      state = '비활성화';
    } else {
      if (startDate.isAfter(dayjs()) === true) {
        state = dayjs(logInfo.startTime).format('YYYY-MM-DD HH:mm:ss');
      } else if (endDate.isAfter(dayjs()) === true) {
        state = '공지중';
      } else {
        state = '공지종료';
      }
    }

    const actDetailStr = logInfo.activityDetail.substr(0,70)+"...";

    return ['__checkbox', dayjs(logInfo.creationTime).format('YYYY-MM-DD HH:mm:ss'), logInfo.adminID, getActivityNameFromID(logInfo.activityID), actDetailStr];
  });

  return result;
};

export const ADMINACTIVITY_TYPE_ALL = '000000';
export const ADMINACTIVITY_TYPE_AUTH_LOGIN = '010101';
export const ADMINACTIVITY_TYPE_AUTH_LOGOUT = '010102';

// 계정 관련
export const ADMINACTIVITY_TYPE_ACCOUNT_VIEWLIST = '020101';
export const ADMINACTIVITY_TYPE_ACCOUNT_NEW = '020102';
export const ADMINACTIVITY_TYPE_ACCOUNT_CHANGEACL = '020103';
export const ADMINACTIVITY_TYPE_ACCOUNT_ACTIVATION = '020104';
export const ADMINACTIVITY_TYPE_ACCOUNT_DELETE = '020105';
export const ADMINACTIVITY_TYPE_ACCOUNT_CHANGEPW = '020106';

// 유저 관련
export const ADMINACTIVITY_TYPE_USER_VIEWLIST = '030101';
export const ADMINACTIVITY_TYPE_USER_VIEWDETAIL = '030102';
export const ADMINACTIVITY_TYPE_USER_BLACKLIST_ACTIVATION = '030103';
export const ADMINACTIVITY_TYPE_USER_UPDATE = '030105';
export const ADMINACTIVITY_TYPE_USER_ACTLOG_VIEWLIST = '030106';
export const ADMINACTIVITY_TYPE_USER_PAYLOG_VIEWLIST = '030107';
export const ADMINACTIVITY_TYPE_USER_REWARDTOUSERGROUP = '030108';

// 공지사항 관련
export const ADMINACTIVITY_TYPE_NOTIFICATION_VIEWLIST = '040101';
export const ADMINACTIVITY_TYPE_NOTIFICATION_NEW = '040102';
export const ADMINACTIVITY_TYPE_NOTIFICATION_UPDATE = '040103';
export const ADMINACTIVITY_TYPE_NOTIFICATION_DELETE = '040104';
export const ADMINACTIVITY_TYPE_NOTIFICATION_ACTIVATION = '040105';

// 우편함/푸쉬알람 메세지 관련
export const ADMINACTIVITY_TYPE_MESSAGE_VIEWLIST = '050101';
export const ADMINACTIVITY_TYPE_MESSAGE_SEND = '050102';
export const ADMINACTIVITY_TYPE_MESSAGE_UPDATE = '050103';
export const ADMINACTIVITY_TYPE_MESSAGE_DELETE = '050104';

// 이벤트 관련
export const ADMINACTIVITY_TYPE_EVENT_LOGINREWARD_VIEWLIST = '060101';
export const ADMINACTIVITY_TYPE_EVENT_LOGINREWARD_NEW = '060102';
export const ADMINACTIVITY_TYPE_EVENT_LOGINREWARD_UPDATE = '060103';
export const ADMINACTIVITY_TYPE_EVENT_LOGINREWARD_DELETE = '060104';
export const ADMINACTIVITY_TYPE_EVENT_LOGINREWARD_ACTIVATION = '060105';

// 활동로그/시스템로그 관련
export const ADMINACTIVITY_TYPE_ACTIVITYLOG_VIEWLIST = '070101';
export const ADMINACTIVITY_TYPE_SYSTEMLOG_VIEWLIST = '070201';

// 환경설정 관련
export const ADMINACTIVITY_TYPE_SETTING_VIEWLIST = '090101';
export const ADMINACTIVITY_TYPE_SETTING_UPDATE = '090102';

const activityLogTypeTable = [
  { id: 1, name: '전체', code: ADMINACTIVITY_TYPE_ALL },
  { id: 2, name: '로그인', code: ADMINACTIVITY_TYPE_AUTH_LOGIN },
  { id: 3, name: '로그아웃', code: ADMINACTIVITY_TYPE_AUTH_LOGOUT },
  { id: 4, name: '새 계정 생성', code: ADMINACTIVITY_TYPE_ACCOUNT_NEW },
  { id: 5, name: '계정 사용권한 변경', code: ADMINACTIVITY_TYPE_ACCOUNT_CHANGEACL },
  { id: 6, name: '계정 활성화/비활성화', code: ADMINACTIVITY_TYPE_ACCOUNT_ACTIVATION },
  { id: 7, name: '계정 삭제', code: ADMINACTIVITY_TYPE_ACCOUNT_DELETE },
  { id: 8, name: '계정 암호변경', code: ADMINACTIVITY_TYPE_ACCOUNT_CHANGEPW },
  { id: 9, name: '유저목록 조회', code: ADMINACTIVITY_TYPE_USER_VIEWLIST },
  { id: 10, name: '유저 상세정보 조회', code: ADMINACTIVITY_TYPE_USER_VIEWDETAIL },
  { id: 11, name: '유저 블랙리스트 등록/해제', code: ADMINACTIVITY_TYPE_USER_BLACKLIST_ACTIVATION },
  { id: 12, name: '유저정보 변경', code: ADMINACTIVITY_TYPE_USER_UPDATE },
  { id: 13, name: '새 공지사항 생성', code: ADMINACTIVITY_TYPE_NOTIFICATION_NEW },
  { id: 14, name: '공지사항 변경', code: ADMINACTIVITY_TYPE_NOTIFICATION_UPDATE },
  { id: 15, name: '공지사항 삭제', code: ADMINACTIVITY_TYPE_NOTIFICATION_DELETE },
  { id: 16, name: '공지사항 활성화/비활성화', code: ADMINACTIVITY_TYPE_NOTIFICATION_ACTIVATION },
  { id: 17, name: '메세지 목록 조회', code: ADMINACTIVITY_TYPE_MESSAGE_VIEWLIST },
  { id: 18, name: '새 메세지 전송', code: ADMINACTIVITY_TYPE_MESSAGE_SEND },
  { id: 19, name: '예약 메세지 수정', code: ADMINACTIVITY_TYPE_MESSAGE_UPDATE },
  { id: 20, name: '메세지 삭제', code: ADMINACTIVITY_TYPE_MESSAGE_DELETE },
  { id: 21, name: '이벤트 목록 조회', code: ADMINACTIVITY_TYPE_EVENT_LOGINREWARD_VIEWLIST },
  { id: 22, name: '새 이벤트 생성', code: ADMINACTIVITY_TYPE_EVENT_LOGINREWARD_NEW },
  { id: 23, name: '이밴트 정보 변경', code: ADMINACTIVITY_TYPE_EVENT_LOGINREWARD_UPDATE },
  { id: 24, name: '이벤트 삭제', code: ADMINACTIVITY_TYPE_EVENT_LOGINREWARD_DELETE },
  { id: 25, name: '이벤트 활성화/비활성화', code: ADMINACTIVITY_TYPE_EVENT_LOGINREWARD_ACTIVATION },
  { id: 26, name: '환경설정 조회', code: ADMINACTIVITY_TYPE_SETTING_VIEWLIST },
  { id: 27, name: '환경설정 변경', code: ADMINACTIVITY_TYPE_SETTING_UPDATE },
];

const QueryAdminActLogsPanel = (props) => {
  const { startLoading, setStartLoading } = useCommon();
  const { logInfo, totalPageNum, requestAdminActLogList } = useAdminActLog();
  const [logList, setLogList] = useState([]);
  const [checkedEventIDList, setCheckedEventIDList] = useState([]);
  const [checkedFlagList, setCheckedFlagList] = useState([]);
  const [popupShown, setPopupShown] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [titleKeyword, setTitleKeyword] = useState('');
  const [activityTypeCode, setActivityTypeCode] = useState(ADMINACTIVITY_TYPE_ALL);
  const [curPageNo, setCurPageNo] = useState(1);
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

  const queryFilterInfo = {
    titleKeyword: '',
    filterStartTime: null,
    filterActivityType: ADMINACTIVITY_TYPE_ALL,
    filterEndTime: null,
  };
  const onSearchEventClick = useCallback((event) => {
    queryFilterInfo.titleKeyword = titleKeyword;

    if (startDate === '') {
      queryFilterInfo.filterStartTime = null;
    } else {
      queryFilterInfo.filterStartTime = utils.makeDateTimeStringFromDate(startDate);
    }

    if (endDate === '') {
      queryFilterInfo.filterEndTime = null;
    } else {
      queryFilterInfo.filterEndTime = utils.makeDateTimeStringFromDate(endDate);
    }

    queryFilterInfo.filterActivityType = activityTypeCode;

    setCurPageNo(0);
    setCurPageNo(1); // 검색시 현재 페이비번호를 1로 초기화함!!
  });

  const onActivityTypeItemClick = useCallback((item) => {
    setActivityTypeCode(item.code);
  });

  const onSearchAllLoginDurationUserClick = useCallback((event) => {});

  const onDatePickerSelect = (date) => {};

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

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  const reloadUserActLogList = async (queryFilterInfo) => {
    setStartLoading(true);
    setTimeout(async () => {

      console.log('#### curPageNo=',curPageNo);

      const resultInfo = await requestAdminActLogList({ queryFilterInfo, pageNo: curPageNo });

      console.log('logList=',resultInfo);
      if (resultInfo.resultCode === 0) {
        setLogList(makeTableFromLogList(resultInfo.data.list));
      } else {
        toast.error(resultInfo.message);
      }
      setStartLoading(false);
    }, 200);
  };

  const onTitleKeywordChange = (e) => {
    setTitleKeyword(e.target.value);
  };

  const onKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearchEventClick(e);
    }
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen(state=>!subMenuOpen);
};

useEffect(()=> {
    props.onSubMenuOpenClicked(subMenuOpen);
},[subMenuOpen]);

  useEffect(() => {
    reloadUserActLogList(queryFilterInfo);
  }, [curPageNo]);

  return (
    <contentStyled.ContentWrapper>
      <contentStyled.ContentHeader>
        <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
        </MediaQuery>
        <span id="subtitle">{titleText}</span>
        <span>&nbsp;</span>
      </contentStyled.ContentHeader>
      <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />

      <contentStyled.ContentBody>
        <contentStyled.FilterGroup>
          <contentStyled.FilterItem>
            <span id="name">관리자</span>
            <span id="input">
              <InputField1 responsive='1.3' width="12vw" height="2vw" placeholder={'유저ID 또는 닉네임을 입력하세요.'} onChange={(e) => onTitleKeywordChange(e)} onKeyPress={(e) => onKeyPress(e)} />
            </span>
            <span id="search">
              <Button1 responsive='1.6' bgColor="var(--btn-primary-color)" width="4vw" height="1.8vw" onClick={(e) => onSearchEventClick(e)}>
                검색
              </Button1>
            </span>
          </contentStyled.FilterItem>
          <contentStyled.FilterItem>
            <span id="name">활동 구분</span>
            <span id="dropdown">
              <DropBox responsive='1.3' width="10vw" height="2vw" text={activityLogTypeTable[0].name} fontSize="0.6vw" itemList={activityLogTypeTable} menuItemClick={(item) => onActivityTypeItemClick(item)} />
            </span>
          </contentStyled.FilterItem>
          <contentStyled.FilterItem>
            <span id="name" style={{ marginRight: '2vw' }}>
              로깅 기간:
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
          bodyInfo={logList}
          onPageNoClick={(e,pageNo)=>onPageNoClick(e,pageNo)}
          onGotoFirstPageClick={onGotoFirstPageClick}
          onGotoPrevPageClick={onGotoPrevPageClick}
          onGotoNextPageClick={onGotoNextPageClick}
          onGotoLastPageClick={onGotoLastPageClick}
          noPageControl={false}
          recordNumPerPage={RECNUM_PERPAGE}
          totalRecordNum={logInfo.totalCount}
        />
      </contentStyled.ContentBody>
    </contentStyled.ContentWrapper>
  );
};

export default QueryAdminActLogsPanel;
