import React, { useState, useCallback, forwardRef, useRef, useEffect } from 'react';
import MediaQuery from 'react-responsive';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import * as utils from '../../../common/js/utils';

import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './EventManagePageStyles';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';
import Table from '../../../components/Table2';
import Popup from '../../../components/Popup';

import * as constants from '../../../common/constants';
import useCommon from '../../../store/useCommonStorageManager';
import useRewardEvent from '../../../store/useRewardEventDataManager';

import {getLangTypeFromCode,getTitle,getContent} from '../notifications/NotificationManageContainer';

import { toast } from 'react-toastify';

dayjs.extend(utc);

const RECNUM_PERPAGE = 10;
const titleText = '접속보상 이벤트 목록 조회';
const tableHeaderInfo = ['__checkbox', '이벤트 기간', '제목/내용', '진행 상황', '보상 내용'];

const tableHSpaceTable = '0.4fr 1.4fr 2fr 0.8fr 1.7fr';

const DatePickerInput = forwardRef((props) => {
  return <InputField1 responsive='1.2' width="12vw" height="2vw" {...props} />;
});

const makeTableFromEventList = (eventList) => {
  //console.log(eventList);

  let state = '비활성화';
  const result = eventList.map((eventInfo, idx) => {
    const startDate = dayjs(eventInfo.startTime);
    const endDate = dayjs(eventInfo.endTime);

    if (startDate.isAfter(dayjs()) === true) {
      state = dayjs(eventInfo.startTime).format('YYYY-MM-DD HH:mm');
    } else if (endDate.isAfter(dayjs()) === true) {
      state = '공지중';
    } else {
      state = '공지종료';
    }

    let title = getTitle(eventInfo.titleTable,getLangTypeFromCode(23));
    if(title.trim() === '') {
      title = getTitle(eventInfo.titleTable,getLangTypeFromCode(10));
    }

    let content = getContent(eventInfo.contentTable,getLangTypeFromCode(23));
    if(content.trim() === '') {
      content = getContent(eventInfo.contentTable,getLangTypeFromCode(10));
    }

    return {color:'var(--secondary-color)',record:[
      '__checkbox',
      `${dayjs(eventInfo.startTime).format('YYYY-MM-DD HH:mm')} ~ ${dayjs(eventInfo.endTime).format('YYYY-MM-DD HH:mm')}`,
      `[${title}] ${content}`,
      state,
      (eventInfo.rewardData===undefined?"":(JSON.stringify(eventInfo.rewardData).substr(0,40)+"...")),
    ]};
  });

  return result;
};

const QueryLoginEventListPanel = (props) => {
  const { startLoading, setStartLoading } = useCommon();
  const { eventInfo, totalPageNum,requestRewardEventList, requestDeleteRewardEvents } = useRewardEvent();
  const [eventList, setEventList] = useState([]);
  const [checkedEventIDList, setCheckedEventIDList] = useState([]);
  const [checkedFlagList, setCheckedFlagList] = useState([]);
  const [popupShown, setPopupShown] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [titleKeyword, setTitleKeyword] = useState('');

  const [eventState, setEventState] = useState(0); // 0: 모두, 1:비활성회, 2:대기중, 3:진행중, 4:종료
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subMenuOpen,setSubMenuOpen] = useState(false);

  const filterEventTypeList = [
    { id: 0, name: '모든 이벤트' },
    { id: 1, name: '비활성화 이벤트' },
    { id: 2, name: '대기중인 이벤트' },
    { id: 3, name: '진행중인 이벤트' },
    { id: 4, name: '종료된 이벤트' },
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

  const onEventTypeItemClick = useCallback((item) => {
    setEventState(item.id);
  });

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

  const queryfilterInfo = {
    titleKeyword: '',
    filterStartTime: null,
    filterState: 0,
    filterEndTime: null,
  };

  const onSearchEventClick = useCallback((event) => {
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

    queryfilterInfo.filterState = eventState;

    reloadEventList(queryfilterInfo);
  });

  const reloadEventList = async (queryFilterInfo) => {
    setStartLoading(true);
    setTimeout(async () => {
      const resultInfo = await requestRewardEventList({ queryFilterInfo, eventType: constants.EVENT_TYPE_LOGINREWARD, pageNo: 1 });

      console.log('eventInfo=',resultInfo);
      if (resultInfo.resultCode === 0) {
        const list1 = makeTableFromEventList(resultInfo.data.list);
        console.log("hahaha=",list1);
        setEventList(list1);
      }  else {
        toast.error(resultInfo.message);
      }
      setStartLoading(false);
    }, 200);
  };

  const onEditEventButtonClick = (e) => {
    if (checkedFlagList.length !== 1) {
      toast.info('보기/수정할 이벤트 항목을 1개 선택해주세요.');
      return;
    }

    for (let eInfo of eventInfo.eventList) {
      //console.log('notiInfo.notiID=', notiInfo.notiID, ',', checkedNotiIDList[0]);
      if (eInfo.eventID === checkedEventIDList[0]) {
        props.onEventEditModeChange(true, { parentTitle: titleText, eventInfo: eInfo });
        break;
      }
    }
  };

  const onTableCheckBoxChanged = useCallback((checkList) => {
    const idList = [];
    const flagList = [];
    for (let i = 0; i < checkList.length; i++) {
      if (checkList[i] === true) {
        idList.push(eventInfo.eventList[i].eventID);
        flagList.push(!eventInfo.eventList[i].activationFlag);
      }
    }

    setCheckedEventIDList(idList);
    setCheckedFlagList(flagList);
  });

  const onDeleteEventButtonClick = async (e) => {
    if (checkedEventIDList.length === 0) {
      toast.info('삭제할 공지사항 항목을 선택해주세요.');
      return;
    }

    setPopupContent('이벤트 항목 삭제를 정말로 진행하시겠습니까?');
    setPopupShown(true);
  };

  const onPopupButtonClick = async (buttonIdx) => {
    if (buttonIdx === 0) {
      setStartLoading(true);
      const resultInfo = await requestDeleteRewardEvents(checkedEventIDList);

      console.log(resultInfo);

      if (resultInfo.resultCode !== 0) {
        toast.error(resultInfo.message);
      } else {
        toast.info('선택한 이벤트 항목(들)이 삭제되었습니다.');
      }

      await reloadEventList(queryfilterInfo);

      setStartLoading(false);

      setCheckedEventIDList([]);
      setCheckedFlagList([]);
    }

    onPopupCloseButtonClick(null);
  };

  const onPopupCloseButtonClick = (e) => {
    setPopupShown(false);
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
    reloadEventList(queryfilterInfo);
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
          <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onEditEventButtonClick(e)}>
            보기/수정하기
          </Button1>
        </span>
        <span id="button">
          <Button1 responsive='1.6' bgColor="var(--btn-secondary-color)" width="6vw" height="2vw" onClick={(e) => onDeleteEventButtonClick(e)}>
            삭제하기
          </Button1>
        </span>
      </contentStyled.ContentHeader>
      <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />

      <contentStyled.ContentBody>
        <contentStyled.FilterGroup>
          <contentStyled.FilterItem>
            <span id="name">제목</span>
            <span id="input">
              <InputField1 responsive='1.3' width="12vw" height="2vw" placeholder={'제목을 입력하세요.'} value={titleKeyword} onChange={(e) => onTitleKeywordChange(e)} onKeyPress={(e) => onKeyPress(e)} />
            </span>
            <span id="search">
              <Button1 responsive='1.6' bgColor="var(--btn-primary-color)" width="4vw" height="1.8vw" onClick={(e) => onSearchEventClick(e)}>
                검색
              </Button1>
            </span>
          </contentStyled.FilterItem>
          <contentStyled.FilterItem>
            <span id="name">진행 타입</span>
            <span id="dropdown">
              <DropBox responsive='1.3' width="10vw" height="2vw" text={filterEventTypeList[0].name} fontSize="0.6vw" itemList={filterEventTypeList} menuItemClick={(item) => onEventTypeItemClick(item)} />
            </span>
          </contentStyled.FilterItem>
          <contentStyled.FilterItem>
            <span id="name" style={{ marginRight: '2vw' }}>
              이벤트 기간:
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
          height='3vw'
          colFormat={tableHSpaceTable}
          headerInfo={tableHeaderInfo}
          bodyInfo={eventList}
          onPageNoClick={onPageNoClick}
          onGotoFirstPageClick={onGotoFirstPageClick}
          onGotoPrevPageClick={onGotoPrevPageClick}
          onGotoNextPageClick={onGotoNextPageClick}
          onGotoLastPageClick={onGotoLastPageClick}
          noPageControl={false}
          recordNumPerPage={RECNUM_PERPAGE}
          totalRecordNum={eventInfo.totalCount}
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

export default QueryLoginEventListPanel;
