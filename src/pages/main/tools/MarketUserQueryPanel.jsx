import React, {
  useState,
  useCallback,
  useContext,
  forwardRef,
  useRef,
  useEffect,
} from 'react';
import MediaQuery from 'react-responsive';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import * as utils from '../../../common/js/utils';
import { toast } from 'react-toastify';

import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './ToolManagePageStyles';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';
import Table from '../../../components/Table';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useTool from '../../../store/useToolDataManager';

import { TestContextStore } from '../../../contexts/TestContext';

const RECNUM_PERPAGE = 10;
const titleText = '마켓 유저 조회';
const tableHeaderInfo = [
  '유저ID',
  '닉네임',
  '이메일',
  '지갑주소',
  '국가',
  '최근활동시각',
];
const tableContentInfo = [
  [
    '__checkbox',
    'yspark99',
    '박윤석',
    '20,000',
    '30',
    '5',
    '2022-12-11 12:34:28',
    'X',
  ],
  [
    '__checkbox',
    'megatomic',
    '손흥민',
    '5,000',
    '560',
    '3',
    '2022-10-9 12:34:28',
    'X',
  ],
  [
    '__checkbox',
    'bale1971',
    '가레스베일',
    '170,000',
    '130',
    '5',
    '2022-11-3 12:34:28',
    'X',
  ],
  [
    '__checkbox',
    'breaklee14',
    '이재문',
    '170,000',
    '130',
    '5',
    '2022-11-3 12:34:28',
    'X',
  ],
  [
    '__checkbox',
    'seawind',
    '정재운',
    '170,000',
    '130',
    '5',
    '2022-11-3 12:34:28',
    'X',
  ],
  [
    '__checkbox',
    'kimgoon',
    '김군',
    '170,000',
    '130',
    '5',
    '2022-11-3 12:34:28',
    'X',
  ],
];

const tableHSpaceTable = '0.7fr 1.0fr 1.4fr 1.8fr 0.4fr 0.8fr';

const DatePickerInput = forwardRef((props) => {
  return <InputField1 responsive="1.2" width="8vw" height="2vw" {...props} />;
});

const makeTableFromUserList = (userList) => {

  const result = userList.map((userInfo, idx) => {
    return [
      userInfo.userID,
      userInfo.name,
      userInfo.email,
      userInfo.walletAddress,
      userInfo.nationCode,
      dayjs(userInfo.timestamp).format('YYYY-MM-DD HH:mm:ss')
    ];
  });

  return result;
};

const MarketUserQueryPanel = (props) => {
  const { startLoading, setStartLoading } = useCommon();
  const ContextInfo = useContext(TestContextStore);

  const { toolInfo, totalPageNum, requestMarketUserList } =
    useTool();
  const [userList, setUserList] = useState([]);

  const [searchUser, setSearchUser] = useState('');
  const [checkedMsgIDList, setCheckedMsgIDList] = useState([]);
  const [checkedFlagList, setCheckedFlagList] = useState([]);
  const [checkedUserIDList, setCheckedUserIDList] = useState([]);
  const [popupShown, setPopupShown] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [curPageNo, setCurPageNo] = useState(1);
  const [resetTable, setResetTable] = useState(false);

  const filterDeviceList = [
    { id: 1, name: 'iOS' },
    { id: 2, name: '안드로이드' },
  ];

  const queryfilterInfo = {
    targetUserKeyword: '',
    targetUserEmail: '',
    targetWalletAddress: '',
    filterStartTime: null,
    filterEndTime: null,
  };

  const onPageNoClick = useCallback((event, pageNo) => {
    setCurPageNo(pageNo);
    return true;
  });

  const onGotoFirstPageClick = useCallback((event) => {
    setCurPageNo(1);
    return true;
  });

  const onGotoPrevPageClick = useCallback((event) => {
    if (curPageNo > 1) {
      setCurPageNo(curPageNo - 1);
    }
    return true;
  });

  const onGotoNextPageClick = useCallback((event) => {
    if (curPageNo < totalPageNum(RECNUM_PERPAGE)) {
      setCurPageNo(curPageNo + 1);
    }
    return true;
  });

  const onGotoLastPageClick = useCallback((event) => {
    setCurPageNo(totalPageNum(RECNUM_PERPAGE));
    return true;
  });

  const onSearchUserClick = (event) => {

    const userInfo = searchUser.trim();
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

    if (userInfo.indexOf('0x') === 0) {
      // 지갑주소 입력
      queryfilterInfo.targetWalletAddress = userInfo;
    } else if(userInfo.indexOf('@') >= 0) {
      queryfilterInfo.targetUserEmail = userInfo;
    } else if(userInfo.length >= 1) {
        queryfilterInfo.targetUserKeyword = userInfo;
    }

    ContextInfo.setQueryFilterInfo(queryfilterInfo);
    
    setResetTable(true);
    setCurPageNo(0);
    setCurPageNo(1);
  };

  const onDeviceTypeItemClick = useCallback((item) => {
    console.log(item.name);
  });

  const onSearchAllLoginDurationUserClick = useCallback((event) => {

    setStartDate('');
    setEndDate('');
    setSearchUser('');
  });

  const onDatePickerSelect = (date) => {};

  const onStartTimeDatePickerChanged = (date) => {
    setStartDate(date);
  };

  const onEndTimeDatePickerChanged = (date) => {
    setEndDate(date);
  };

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  const onTableCheckBoxChanged = useCallback((checkList) => {
    const idList = [];
    const flagList = [];
    const userIDList = [];
    for (let i = 0; i < checkList.length; i++) {
      if (checkList[i] === true) {
        idList.push(i);
        flagList.push(false);
        userIDList.push(userList[i][1]);
      }
    }

    setCheckedMsgIDList(idList);
    setCheckedFlagList(flagList);
    setCheckedUserIDList(userIDList);
  });

  const onSearchUserChanged = (e) => {
    setSearchUser(e.target.value);
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen((state) => !subMenuOpen);
  };

  const reloadUserList = async () => {

    console.log(`queryFilterInfo=${JSON.stringify(ContextInfo.queryFilterInfo,null,2)}`);

    if(ContextInfo.queryFilterInfo.targetWalletAddress === undefined) {
        return;
    }

    setStartLoading(true);
    setTimeout(async () => {
      let resultInfo = await requestMarketUserList({ queryFilterInfo:ContextInfo.queryFilterInfo, pageNo:curPageNo });
      console.log('userInfo=', resultInfo);
      if (resultInfo.resultCode === 0) {
        setUserList(makeTableFromUserList(resultInfo.data.list));
      } else {
        toast.error(resultInfo.message);
      }
      setStartLoading(false);
    }, 200);
  };

  const onKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearchUserClick(e);
    }
  };

  const onResetTable = useCallback((event) => {
    if(resetTable === true) {
      setResetTable(false);
      return true;
    } else {
      return false;
    }
  });

  useEffect(() => {
    props.onSubMenuOpenClicked(subMenuOpen);
  }, [subMenuOpen]);

  useEffect(() => {
    ContextInfo.setQueryFilterInfo(queryfilterInfo);
  }, []);

  useEffect(() => {
    reloadUserList();
  }, [curPageNo,ContextInfo.queryFilterInfo]);

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
        <span id="subtitle">{titleText}</span>
        <span>&nbsp;</span>
      </contentStyled.ContentHeader>
      <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />

      <contentStyled.ContentBody>
        <contentStyled.FilterGroup>
          <contentStyled.FilterItem>
            <span id="name">유저 검색</span>
            <span id="input">
              <InputField1
                responsive="1.6"
                width="25vw"
                height="2vw"
                placeholder={'유저ID,닉네임,이메일,국가코드 또는 지갑주소를 입력하세요.'}
                value={searchUser}
                onChange={(e) => onSearchUserChanged(e)}
                onKeyPress={(e) => onKeyPress(e)}
              />
            </span>
            <span id="search">
              <Button1
                responsive="1.6"
                bgColor="var(--btn-primary-color)"
                width="4vw"
                height="1.8vw"
                onClick={(e) => onSearchUserClick(e)}
              >
                검색
              </Button1>
            </span>
            <span id="result">
                <label>{"("}{"전체갯수:"}{toolInfo.totalCount}{")"}</label>
            </span>
          </contentStyled.FilterItem>
          <contentStyled.FilterItem>
            <span id="name" style={{ marginRight: '2vw' }}>
              활동시각:
            </span>
            <span id="name">시작일시</span>
            <span id="input">
              <DatePicker
                selected={startDate}
                onChange={onStartTimeDatePickerChanged}
                showTimeSelect
                dateFormat="Pp"
                timeIntervals={10}
                customInput={<DatePickerInput ref={startInputRef} />}
              />
            </span>
            <span id="name">종료일시</span>
            <span id="input">
              <DatePicker
                selected={endDate}
                onChange={onEndTimeDatePickerChanged}
                showTimeSelect
                dateFormat="Pp"
                timeIntervals={10}
                customInput={<DatePickerInput ref={endInputRef} />}
              />
            </span>
            <span id="search">
              <Button1
                responsive="1.6"
                bgColor="var(--btn-primary-color)"
                width="4vw"
                height="1.8vw"
                onClick={(e) => onSearchAllLoginDurationUserClick(e)}
              >
                리셋
              </Button1>
            </span>
          </contentStyled.FilterItem>
        </contentStyled.FilterGroup>
        <contentStyled.MainContentHeaderHorizontalLine marginBottom="1vw" />
        <Table
          responsive="1.6"
          colFormat={tableHSpaceTable}
          headerInfo={tableHeaderInfo}
          bodyInfo={userList}
          onPageNoClick={onPageNoClick}
          onGotoFirstPageClick={onGotoFirstPageClick}
          onGotoPrevPageClick={onGotoPrevPageClick}
          onGotoNextPageClick={onGotoNextPageClick}
          onGotoLastPageClick={onGotoLastPageClick}
          noPageControl={false}
          recordNumPerPage={RECNUM_PERPAGE}
          totalRecordNum={toolInfo.totalCount}
          onTableCheckBoxChanged={onTableCheckBoxChanged}
          onResetTable={onResetTable}
        />
      </contentStyled.ContentBody>
    </contentStyled.ContentWrapper>
  );
};

export default MarketUserQueryPanel;
