import React, {useState,useCallback,forwardRef,useRef,useEffect} from 'react';
import MediaQuery from 'react-responsive';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import dayjs from 'dayjs';

import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './UserManagePageStyles';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';
import Table from '../../../components/Table';
import RadioGroup from '../../../components/RadioGroup';

import useCommon from '../../../store/useCommonStorageManager';
import useUser from '../../../store/useUserDataManager';

const titleText = '유저 결제이력 조회';
const tableHeaderInfo = ['결제시각','유저ID','닉네임','상품ID','처리상태','주문ID'];

const tableHSpaceTable = '1fr 2fr 0.8fr 1.8fr 0.8fr 1.5fr';

const DatePickerInput = forwardRef((props) => {
    return (
        <InputField1 responsive='1.2' width='8vw' height='2vw' {...props} />
    )
});

const makeTableFromUserPayLogList = (userActLogList) => {
    console.log(userActLogList);
  
    const result = userActLogList.map((logInfo, idx) => {  
 
      let state = '구매완료';
      if(logInfo.purchaseState !== 9) {
        state = '구매실패';
      }

      return [
        `${dayjs(logInfo.payTime).format('YYYY-MM-DD HH:mm')}`,
        logInfo.userID,
        logInfo.userNick,
        logInfo.productID,
        state,
        logInfo.receiptID
      ];
    });
  
    return result;
  };

const QueryUserPayLogsPanel = (props) => {

    const { startLoading, setStartLoading } = useCommon();
    const { userPayLogInfo, requestUserPayLogList } = useUser();
    const [userPayLogList, setUserPayLogList] = useState([]);
    const [subMenuOpen,setSubMenuOpen] = useState(false);

    const totalRecordNum = 3;
    const totalPageNum = 25;

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

    });

    const onDeviceTypeItemClick = useCallback((item) => {
        setDeviceType(item.id);
    });

    const onDatePickerSelect = (date) => {

    };

    const onStartTimeDatePickerChanged = (date) => {
        setStartDate(date);
    };

    const onEndTimeDatePickerChanged = (date) => {
        setEndDate(date);
    };

    const [userKeyword, setUserKeyword] = useState('');
    const [durationType, setDurationType] = useState(0);
    const [deviceType, setDeviceType] = useState(0);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();

    const startInputRef = useRef(null);
    const endInputRef = useRef(null);

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
        queryFilterInfo.userKeyword = userKeyword;
        queryFilterInfo.deviceType = deviceType;
        queryFilterInfo.filterDurationType = durationType;
    
        console.log('queryFilterInfo=',queryFilterInfo);

        reloadUserPayLogList(queryFilterInfo);
      });
    
      const reloadUserPayLogList = async (queryFilterInfo) => {
        setStartLoading(true);
        setTimeout(async () => {
          const resultInfo = await requestUserPayLogList({ queryFilterInfo, pageNo: 1 });
    
          console.log(resultInfo);
          if (resultInfo.resultCode === 0) {
            setUserPayLogList(makeTableFromUserPayLogList(resultInfo.data));
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
        //reloadUserPayLogList(queryFilterInfo);
      },[]);
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
                <contentStyled.FilterGroup>
                    <contentStyled.FilterItem>
                        <span id='name'>유저 검색</span>
                        <span id='input'><InputField1 responsive='1.6' width='20vw' height='2vw' placeholder={'유저ID를 입력하세요.'} onKeyPress={(e)=>onKeyPress(e)} value={userKeyword} onChange={(e) => onUserKeywordChange(e)} /></span>
                        <span id='search'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onSearchEventClick(e)}>검색</Button1></span>
                    </contentStyled.FilterItem>
                </contentStyled.FilterGroup>
                <contentStyled.MainContentHeaderHorizontalLine marginBottom='1.5vw' />
                <Table colFormat={tableHSpaceTable}
                        headerInfo={tableHeaderInfo}
                        bodyInfo={userPayLogList}
                        onPageNoClick={onPageNoClick}
                        onGotoFirstPageClick={onGotoFirstPageClick}
                        onGotoPrevPageClick={onGotoPrevPageClick}
                        onGotoNextPageClick={onGotoNextPageClick}
                        onGotoLastPageClick={onGotoLastPageClick}
                        noPageControl={true}
                        recordNumPerPage={1000}
                        />
            </contentStyled.ContentBody>
        </contentStyled.ContentWrapper>
    )
};

export default QueryUserPayLogsPanel;