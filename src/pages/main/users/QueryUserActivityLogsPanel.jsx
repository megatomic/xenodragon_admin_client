import React, {useState,useCallback,forwardRef,useRef} from 'react';
import MediaQuery from 'react-responsive';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import dayjs from 'dayjs';

import * as constants from '../../../common/constants';
import * as itemTable from '../../../common/ItemTable';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './UserManagePageStyles';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';
import Table from '../../../components/Table';
import RadioGroup from '../../../components/RadioGroup';
import { useEffect } from 'react';

import useCommon from '../../../store/useCommonStorageManager';
import useUser from '../../../store/useUserDataManager';

const RECNUM_PERPAGE = 10;
const titleText = '유저 활동이력 조회';
const tableHeaderInfo = ['활동시각','닉네임','구분','아이템 타입','아이템ID','수량','세부사항'];

const tableHSpaceTable = '1fr 1fr 0.7fr 0.7fr 0.7fr 1.2fr 2.2fr';

let filterItemTypeTable = [
  {id:0, name:'전체', itemType:-1}
];

const DatePickerInput = forwardRef((props) => {
    return (
        <InputField1 responsive='1.2' width='8vw' height='2vw' {...props} />
    )
});

const makeTableFromUserActLogList = (userActLogList) => {
    console.log(userActLogList);
  
    let state = '비활성화';
    const result = userActLogList.map((logInfo, idx) => {

      let actionCase='획득';
      if(logInfo.actionCase === 2) {
        actionCase='소모';
      }
      return [
        `${dayjs(logInfo.logTime).format('YYYY-MM-DD HH:mm')}`,
        logInfo.userNick,
        actionCase,
        getItemNameFromType(logInfo.itemType),
        logInfo.itemID.toString(),
        logInfo.quantity.toString(),
        logInfo.logData
      ];
    });
  
    return result;
  };

const getItemNameFromType = (itemType) => {

  for(let itemInfo of itemTable.gameRscTypeTable) {
    if(itemInfo.value === itemType) {
      return itemInfo.key;
    }
  }

  return "Unknown";
};

const QueryUserActivityLogsPanel = (props) => {

    const { startLoading, setStartLoading } = useCommon();
    const { userInfo, totalPageNum, requestUserActLogList } = useUser();
    const [itemTypeInfo, setItemTypeInfo] = useState(filterItemTypeTable[0]);
    const [userActLogList, setUserActLogList] = useState([]);
    const [curPageNo, setCurPageNo] = useState(1);
    const [resetTable,setResetTable] = useState(false);
    const [subMenuOpen,setSubMenuOpen] = useState(false);


    filterItemTypeTable = [
      {id:0, name:'전체', itemType:-1}
    ];
    let i=1;
    for(let itemInfo of itemTable.gameRscTypeTable) {
      filterItemTypeTable.push({id:i,name:itemInfo.key,itemType:itemInfo.value});
      i++;
    }

    const onItemTypeItemClick = useCallback((item) => {
      setItemTypeInfo(item);
    });

    const onResetTable = useCallback((event) => {
      if(resetTable === true) {
        setResetTable(false);
        return true;
      } else {
        return false;
      }
    });

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

    const [userKeyword, setUserKeyword] = useState('');
    const [actionCase, setActionCase] = useState(0);
    const [durationType, setDurationType] = useState(1);
    const [deviceType, setDeviceType] = useState(0);


    const onFilterActionCaseButtonClick = (idx) => {

      setActionCase(idx);
    };

    const onFilterRangeButtonClick = (idx) => {
        setDurationType(idx);
    };

    const onUserKeywordChange = (e) => {
        setUserKeyword(e.target.value);
    };

    const queryFilterInfo = {
        userKeyword: '',
        filterDurationType: 0,
        deviceType: 0,
      };
    
      const onSearchEventClick = useCallback((event) => {

        setCurPageNo(1);
        setResetTable(true);

        queryFilterInfo.userKeyword = userKeyword;
        queryFilterInfo.filterItemType = itemTypeInfo.itemType;
        queryFilterInfo.filterActionCase = actionCase;
        queryFilterInfo.filterDurationType = durationType;
    
        console.log('queryFilterInfo=',queryFilterInfo);

        reloadUserActLogList(queryFilterInfo);
      });
    
      const reloadUserActLogList = async (queryFilterInfo) => {

        setStartLoading(true);
        setTimeout(async () => {
          const resultInfo = await requestUserActLogList({ queryFilterInfo, pageNo: curPageNo, queryNum:RECNUM_PERPAGE });
    
          console.log(resultInfo);
          if (resultInfo.resultCode === 0) {
            setUserActLogList(makeTableFromUserActLogList(resultInfo.data.list));
          }
          setStartLoading(false);
        }, 200);
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

      if(queryFilterInfo !== null && userKeyword.trim() !== '') {
        queryFilterInfo.userKeyword = userKeyword;
        queryFilterInfo.filterItemType = itemTypeInfo.itemType;
        queryFilterInfo.filterActionCase = actionCase;
        queryFilterInfo.filterDurationType = durationType;

        reloadUserActLogList(queryFilterInfo);
      }
    }, [curPageNo]);

    return (
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader>
            <MediaQuery maxWidth={768}>
                    &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
                </MediaQuery>
                <span id='subtitle'>{titleText}</span>
                <span>&nbsp;</span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
              <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
              <div id='title'>
                  <label style={{paddingTop:'0.4vw',color:'#ff0000'}}>[주의] 라이브 로그의 경우 한번 쿼리에 많은 시간이 걸리오니 신중하게 쿼리해주시길 바랍니다!</label>
                  <div></div>
              </div>
              </contentStyled.SettingGroupArea>
              <br />
                <contentStyled.FilterGroup>
                    <contentStyled.FilterItem>
                        <span id='name'>유저 검색</span>
                        <span id='input'><InputField1 responsive='1.6' width='16vw' height='2vw' placeholder={'유저ID를 입력하세요.'} onKeyPress={(e)=>onKeyPress(e)} value={userKeyword} onChange={(e) => onUserKeywordChange(e)} /></span>
                        <span id='search'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onSearchEventClick(e)}>검색</Button1></span>
                    </contentStyled.FilterItem>
                    <contentStyled.FilterItem>
                      <span id='name'>아이템 종류</span>
                      <span id='dropbox'><DropBox responsive='1.3' width="10vw" height="2vw" text={itemTypeInfo.name} fontSize="0.6vw" itemList={filterItemTypeTable} menuItemClick={(item) => onItemTypeItemClick(item)} /></span>
                    </contentStyled.FilterItem>
                    <contentStyled.FilterItem>
                    <span id='name'>&nbsp;&nbsp;&nbsp;&nbsp;구분</span>
                        <span id='dropdown'><RadioGroup initButtonIndex={actionCase} nameTable={['전체','자원 획득','자원 소모']} buttonClicked={(idx)=>onFilterActionCaseButtonClick(idx)} /></span>
                        <span id='search' style={{marginLeft:'3vw'}}><RadioGroup initButtonIndex={durationType} nameTable={['전체','오늘','최근 1주일', '최근 1개월', '최근 1년']} buttonClicked={(idx)=>onFilterRangeButtonClick(idx)} /></span>
                    </contentStyled.FilterItem>
                </contentStyled.FilterGroup>
                <contentStyled.MainContentHeaderHorizontalLine marginBottom='1.5vw' />
                <Table colFormat={tableHSpaceTable}
                        headerInfo={tableHeaderInfo}
                        bodyInfo={userActLogList}
                        onPageNoClick={onPageNoClick}
                        onGotoFirstPageClick={onGotoFirstPageClick}
                        onGotoPrevPageClick={onGotoPrevPageClick}
                        onGotoNextPageClick={onGotoNextPageClick}
                        onGotoLastPageClick={onGotoLastPageClick}
                        noPageControl={false}
                        recordNumPerPage={RECNUM_PERPAGE}
                        totalRecordNum={userInfo.totalCount}
                        onResetTable={onResetTable}
                        />
            </contentStyled.ContentBody>
        </contentStyled.ContentWrapper>
    )
};

export default QueryUserActivityLogsPanel;