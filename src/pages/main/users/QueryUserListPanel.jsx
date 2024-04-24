import React, {
  useState,
  useCallback,
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
import * as styled from './UserManagePageStyles';

import UserDetailInfoPanel from './UserDetailInfoPanel';
import AddUserToBlacklist from './AddUserToBlacklistPanel';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';
import Table from '../../../components/Table';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useUser from '../../../store/useUserDataManager';

const titleText = '유저 목록 조회';
const tableHeaderInfo = [
  '__checkbox',
  '유저ID',
  '닉네임',
  '골드',
  '젬',
  '에너지',
  '최근 로그인 시각',
  '블랙리스트',
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

const tableHSpaceTable = '0.5fr 2.6fr 0.8fr 0.8fr 1fr 0.6fr 1.4fr 0.8fr';

const DatePickerInput = forwardRef((props) => {
  return <InputField1 responsive="1.2" width="8vw" height="2vw" {...props} />;
});

const makeTableFromUserList = (userList) => {
  console.log('userList=', userList);

  let userNick;
  let state;
  const result = userList.map((userInfo, idx) => {
    state = '즉시 전송됨';
    userNick =
      userInfo.userNickname === undefined || userInfo.userNickname === null
        ? userInfo.deviceId
        : userInfo.userNickname;
    return [
      '__checkbox',
      userInfo.pId,
      userNick,
      `${userInfo.gold}`,
      `${userInfo.gemFree}/${userInfo.gem}`,
      `${userInfo.energy}`,
      `${dayjs(userInfo.connectAt).format('YYYY-MM-DD HH:mm')}`,
      userInfo.userState !== 101 ? 'X' : 'O',
    ];
  });

  return result;
};

const QueryUserListPanel = (props) => {
  const { startLoading, setStartLoading } = useCommon();
  const { userInfo, requestUserList, requestUserNicknameByWalletAddress } =
    useUser();
  const [userList, setUserList] = useState([]);

  const [searchUser, setSearchUser] = useState('');
  const [checkedMsgIDList, setCheckedMsgIDList] = useState([]);
  const [checkedFlagList, setCheckedFlagList] = useState([]);
  const [checkedUserIDList, setCheckedUserIDList] = useState([]);
  const [popupShown, setPopupShown] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [addToBlacklist, setAddToBlacklist] = useState(false);

  const [userDetailInfo, setUserDetailInfo] = useState(false);

  const totalRecordNum = 3;
  const totalPageNum = 25;

  const filterDeviceList = [
    { id: 1, name: 'iOS' },
    { id: 2, name: '안드로이드' },
  ];

  const queryfilterInfo = {
    targetUserID: '',
    targetWalletAddress: '',
    filterStartTime: null,
    filterEndTime: null,
  };

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

  const onSearchUserClick = useCallback((event) => {
    const userInfo = searchUser.trim();
    if (userInfo.length <= 1) {
      toast.info('검색할 유저 정보를 1자이상 입력해주세요.');
      return;
    }

    if (userInfo.indexOf('0x') === 0 && userInfo.length === 42) {
      // 지갑주소 입력
      queryfilterInfo.targetWalletAddress = userInfo;
    } else {
      queryfilterInfo.targetUserID = userInfo;
    }

    reloadUserList(queryfilterInfo);
  });

  const onDeviceTypeItemClick = useCallback((item) => {
    console.log(item.name);
  });

  const onSearchAllLoginDurationUserClick = useCallback((event) => {});

  const onDatePickerSelect = (date) => {};

  const onStartTimeDatePickerChanged = (date) => {
    setStartDate(date);
  };

  const onEndTimeDatePickerChanged = (date) => {
    setEndDate(date);
  };

  const onUserDetailInfoButtonClick = (e) => {
    if (checkedMsgIDList.length !== 1) {
      toast.info('상세보기할 유저항목을 1개 선택해주세요.');
      return;
    }

    setUserDetailInfo(true);
  };

  const onAddToBlacklistButtonClick = (e) => {
    if (checkedMsgIDList.length == 0) {
      toast.info('블랙리스트로 등록할 유저를 1명이상 선택해주세요.');
      return;
    }

    setAddToBlacklist(true);
  };

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

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

  const onUserDetailInfoApplyButtonClick = (e) => {
    setUserDetailInfo(false);
  };

  const onApplyButtonClick = (e) => {
    setAddToBlacklist(false);
  };

  const onCancelButtonClick = (e) => {
    setAddToBlacklist(false);
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen((state) => !subMenuOpen);
  };

  const reloadUserList = async (queryFilterInfo) => {
    if (
      (queryFilterInfo.targetUserID.trim() === '' ||
        queryFilterInfo.targetUserID.length <= 1) &&
      queryFilterInfo.targetWalletAddress.trim() === ''
    ) {
      return;
    }

    //console.log('queryFilterInfo=',queryFilterInfo);

    setStartLoading(true);
    setTimeout(async () => {
      let resultInfo;
      if (queryFilterInfo.targetWalletAddress !== '') {
        resultInfo = await requestUserNicknameByWalletAddress(
          queryFilterInfo.targetWalletAddress
        );
        if (resultInfo.data === null) {
          setStartLoading(false);
          toast.error('지갑주소에 대한 유저 닉네임이 존재하지 않습니다.');
          setUserList([]);
          return;
        } else {
          queryFilterInfo.targetWalletAddress = '';
          queryFilterInfo.targetUserID = resultInfo.data;
          resultInfo = await requestUserList({ queryFilterInfo, pageNo: 1 });
        }
      } else {
        resultInfo = await requestUserList({ queryFilterInfo, pageNo: 1 });
      }

      console.log('userInfo=', resultInfo);
      if (resultInfo.resultCode === 0) {
        setUserList(makeTableFromUserList(resultInfo.data));
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

  useEffect(() => {
    props.onSubMenuOpenClicked(subMenuOpen);
  }, [subMenuOpen]);

  useEffect(() => {
    reloadUserList(queryfilterInfo);
  }, []);

  return userDetailInfo === true ? (
    <UserDetailInfoPanel
      parentTitle={titleText}
      targetUserID={checkedUserIDList[0]}
      onApplyButtonClick={(e) => onUserDetailInfoApplyButtonClick(e)}
      onSubMenuOpenClicked={(flag) => setSubMenuOpen(flag)}
    />
  ) : addToBlacklist === true ? (
    <AddUserToBlacklist
      parentTitle={titleText}
      userIDList={checkedUserIDList}
      onApplyButtonClick={(e) => onApplyButtonClick(e)}
      onCancelButtonClick={(e) => onCancelButtonClick(e)}
      onSubMenuOpenClicked={(flag) => setSubMenuOpen(flag)}
    />
  ) : (
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
        <span id="button">
          <Button1
            responsive="1.6"
            bgColor="var(--btn-confirm-color)"
            width="10vw"
            height="2vw"
            onClick={(e) => onAddToBlacklistButtonClick(e)}
          >
            블랙리스트로 등록하기
          </Button1>
        </span>
        <span id="button">
          <Button1
            responsive="1.6"
            bgColor="var(--btn-secondary-color)"
            width="6vw"
            height="2vw"
            onClick={(e) => onUserDetailInfoButtonClick(e)}
          >
            상세정보
          </Button1>
        </span>
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
                placeholder={'닉네임 또는 지갑주소를 입력하세요.'}
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
          </contentStyled.FilterItem>
          <contentStyled.FilterItem>
            <span id="name">기기 종류</span>
            <span id="dropdown">
              <DropBox
                responsive="1.3"
                width="10vw"
                height="2vw"
                text={filterDeviceList[0].name}
                fontSize="0.6vw"
                itemList={filterDeviceList}
                menuItemClick={(item) => onDeviceTypeItemClick(item)}
              />
            </span>
          </contentStyled.FilterItem>
          <contentStyled.FilterItem>
            <span id="name" style={{ marginRight: '2vw' }}>
              접속 시각:
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
                전체
              </Button1>
            </span>
          </contentStyled.FilterItem>
        </contentStyled.FilterGroup>
        <contentStyled.MainContentHeaderHorizontalLine marginBottom="1.5vw" />
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
          noPageControl={true}
          recordNumPerPage={10}
          totalRecordNum={userList.length}
          onTableCheckBoxChanged={onTableCheckBoxChanged}
        />
      </contentStyled.ContentBody>
    </contentStyled.ContentWrapper>
  );
};

export default QueryUserListPanel;
