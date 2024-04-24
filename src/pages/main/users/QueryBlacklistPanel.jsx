import React, {useState,useCallback,forwardRef,useRef,useEffect} from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import dayjs from 'dayjs';
import * as utils from '../../../common/js/utils';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './UserManagePageStyles';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';
import Table from '../../../components/Table';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useUser from '../../../store/useUserDataManager';
import useSetting from '../../../store/useSettingDataManager';
import { toast } from 'react-toastify';

const titleText = '블랙리스트 관리';
const tableHeaderInfo = ['__checkbox','추가시각','유저ID','기간','해제타입','사유'];

const tableHSpaceTable = '0.5fr 1fr 1fr 0.8fr 0.8fr 2fr';

const DatePickerInput = forwardRef((props) => {
    return (
        <InputField1 responsive='1.2' width='8vw' height='2vw' {...props} />
    )
});

const makeTableFromBlacklist = (blacklist) => {
    console.log(blacklist);
  
    const result = blacklist.map((userInfo, idx) => {

      const day = Math.floor(userInfo.duration/24);
      const hour = userInfo.duration - day*24;

      let durationStr='';
      if(day === 0) {
        if(hour === 0) {
          durationStr = `영구`;
        } else {
          durationStr = `${hour}시간`;
        }
      } else {
        if(hour === 0) {
            durationStr = `${day}일`;
        } else {
            durationStr = `${day}일 ${hour}시간`;
        }
      }

      return ['__checkbox', dayjs(userInfo.registerTime).format('YYYY-MM-DD HH:mm:ss'), userInfo.userID, durationStr, (userInfo.autoReleaseFlag?'자동':'수동'), userInfo.reason];
    });
  
    return result;
  };

const QueryBlacklistPanel = (props) => {

    const { startLoading, setStartLoading } = useCommon();
    const [titleKeyword, setTitleKeyword] = useState('');
    const [deviceType, setDeviceType] = useState('');
    const {blackList,requestBlacklist,requestReleaseFromBlacklist } = useUser();
    const [blacklist, setBlacklist] = useState([]);
    const [checkedMsgIDList, setCheckedMsgIDList] = useState([]);
    const [checkedFlagList, setCheckedFlagList] = useState([]);
    const [checkedUserIDList, setCheckedUserIDList] = useState([]);
    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [subMenuOpen,setSubMenuOpen] = useState(false);

    const filterDeviceList = [
        {id:1,name:'iOS'},
        {id:2,name:'안드로이드'}
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

    const onDeviceTypeItemClick = useCallback((item) => {
        console.log(item.name);
    });

    const onSearchAllBlacklistUserClick = useCallback((event) => {
      setStartDate('');
      setEndDate('');
    });

    const onDatePickerSelect = (date) => {

    };

    const onStartTimeDatePickerChanged = (date) => {
      setStartDate(date);
  
      if (endDate === '') {
        return;
      }
  
      const startDate2 = dayjs(utils.makeDateTimeStringFromDate(date));
      const endDate2 = dayjs(utils.makeDateTimeStringFromDate(endDate));
  
      if (startDate2.isBefore(endDate2) === false) {
        toast.error('시작일자는 종료일자보다 더 이전이어야 합니다.');
        setStartDate('');
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
        setEndDate('');
      }
    };

    const onTableCheckBoxChanged = useCallback((checkList) => {
        const idList = [];
        const flagList = [];
        const userIDList2 = [];
        for (let i = 0; i < checkList.length; i++) {
          if (checkList[i] === true) {
            idList.push(i);
            flagList.push(false);
            userIDList2.push(blackList[i].userID);
          }
        }
    
        setCheckedMsgIDList(idList);
        setCheckedFlagList(flagList);
        setCheckedUserIDList(userIDList2);
      });

      const queryFilterInfo = {
        titleKeyword: '',
        deviceType:'',
        filterStartTime: null,
        filterEndTime: null,
      };
      const onSearchUserClick = useCallback((event) => {
        queryFilterInfo.titleKeyword = titleKeyword;
        queryFilterInfo.deviceType = deviceType;

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
    
        //console.log('queryFilterInfo=',queryFilterInfo);

        reloadBlacklist(queryFilterInfo);
      });

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
  
    const startInputRef = useRef(null);
    const endInputRef = useRef(null);

    const reloadBlacklist = async (queryFilterInfo) => {
        setStartLoading(true);
        setTimeout(async () => {
          const resultInfo = await requestBlacklist({ queryFilterInfo, pageNo: 1 });
    
          console.log(resultInfo);
          if (resultInfo.resultCode === 0) {
            setBlacklist(makeTableFromBlacklist(resultInfo.data));
          }
          setStartLoading(false);
        }, 200);
      };

      const onReleaseFromBlacklistButtonClick = (e) => {
        if (checkedFlagList.length === 0) {
            toast.info('해제할 유저항목을 1개이상 선택해주세요.');
            return;
        }

        setPopupContent('해당 유저들을 블랙리스트 목록에서 해제하시겠습니까?');
        setPopupShown(true);
      };

      const onPopupButtonClick = async (buttonIdx) => {
        if (buttonIdx === 0) {
          setStartLoading(true);

          const resultInfo = await requestReleaseFromBlacklist({userIDList:checkedUserIDList});
    
          console.log(resultInfo);
    
          if (resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
          } else {
            toast.info('지정된 유저들이 블랙리스트에서 해제되었습니다.');
          }
     
          setStartLoading(false);
          reloadBlacklist(queryFilterInfo);
        }
    
        onPopupCloseButtonClick(null);
      };

      const onPopupCloseButtonClick = (e) => {
        setPopupShown(false);
      };

      const onUserKeywordChange = (e) => {
        setTitleKeyword(e.target.value);
        };
      const onKeyPress = (e) => {
        if (e.key === 'Enter') {
          onSearchUserClick(e);
        }
      };

    useEffect(() => {
        reloadBlacklist(queryFilterInfo);
      }, []);

    return (
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader>
                <span id='subtitle'>{titleText}</span>
                <span>&nbsp;</span>
                <span id='button'><Button1 bgColor='var(--btn-confirm-color)' width='6vw' height='2vw'>상세보기</Button1></span>
                <span id='button'><Button1 bgColor='var(--btn-secondary-color)' width='8vw' height='2vw' onClick={(e)=>onReleaseFromBlacklistButtonClick(e)}>블랙리스트 해제</Button1></span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
                <contentStyled.FilterGroup>
                    <contentStyled.FilterItem>
                        <span id='name'>유저 검색</span>
                        <span id='input'><InputField1 responsive='1.6' width='12vw' height='2vw' placeholder={'유저ID를 입력하세요.'} onKeyPress={(e)=>onKeyPress(e)} value={titleKeyword} onChange={(e) => onUserKeywordChange(e)}/></span>
                        <span id='search'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onSearchUserClick(e)}>검색</Button1></span>
                    </contentStyled.FilterItem>
                    <contentStyled.FilterItem>
                        <span id='name'>기기 종류</span>
                        <span id='dropdown'><DropBox width='10vw' height='2vw' text={filterDeviceList[0].name} fontSize='0.6vw' itemList={filterDeviceList} menuItemClick={(item)=>onDeviceTypeItemClick(item)} /></span>
                    </contentStyled.FilterItem>
                    <contentStyled.FilterItem>
                        <span id='name' style={{marginRight:'2vw'}}>추가 시각:</span>
                        <span id='name'>시작일시</span>
                        <span id='input'><DatePicker selected={startDate} onChange={onStartTimeDatePickerChanged} showTimeSelect dateFormat='Pp' timeIntervals={10} customInput={<DatePickerInput ref={startInputRef} />} /></span>
                        <span id='name'>종료일시</span>
                        <span id='input'><DatePicker selected={endDate} onChange={onEndTimeDatePickerChanged} showTimeSelect dateFormat='Pp' timeIntervals={10} customInput={<DatePickerInput ref={endInputRef} />} /></span>
                        <span id='search'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onSearchAllBlacklistUserClick(e)}>전체</Button1></span>
                    </contentStyled.FilterItem>
                </contentStyled.FilterGroup>
                <contentStyled.MainContentHeaderHorizontalLine marginBottom='1.5vw' />
                <Table colFormat={tableHSpaceTable}
                        headerInfo={tableHeaderInfo}
                        bodyInfo={blacklist}
                        onPageNoClick={onPageNoClick}
                        onGotoFirstPageClick={onGotoFirstPageClick}
                        onGotoPrevPageClick={onGotoPrevPageClick}
                        onGotoNextPageClick={onGotoNextPageClick}
                        onGotoLastPageClick={onGotoLastPageClick}
                        noPageControl={false}
                        recordNumPerPage={10}
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
    )
};

export default QueryBlacklistPanel;