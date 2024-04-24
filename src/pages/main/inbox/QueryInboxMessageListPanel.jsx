import React, {useState,useCallback,forwardRef,useRef,useEffect} from 'react';
import MediaQuery from 'react-responsive';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import * as utils from '../../../common/js/utils';
import * as constants from '../../../common/constants';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './InboxMessageManagePageStyles';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';
import Table from '../../../components/Table';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useMessage from '../../../store/useMessageDataManager';
import {getLangTypeFromCode,getTitle,getContent} from '../notifications/NotificationManageContainer';

const RECNUM_PERPAGE = 10;

const titleText = '메세지 목록 조회';
const tableHeaderInfo = ['__checkbox','보낸 시각','제목/내용','전송 상황','대상','첨부'];

const tableHSpaceTable = '0.5fr 1fr 2.5fr 0.7fr 1.0fr 1.4fr';

const DatePickerInput = forwardRef((props) => {
    return (
        <InputField1 responsive='1.2' width='12vw' height='2vw' {...props} />
    )
});

const makeTableFromMsgList = (msgList) => {

  console.log('msgList=',msgList);
  
    let state;
    let rewardData;
    const result = msgList.map((msgInfo, idx) => {
      state = '즉시 전송됨';
      if (msgInfo.reservationFlag === true) {
        const startDate = dayjs(msgInfo.startTime);
        if (startDate.isBefore(dayjs()) === true) {
          state = '예약 전송됨';
        } else {
          state = dayjs(msgInfo.startTime).format('YYYY-MM-DD HH:mm');
        }
      }
  
      let targetID = msgInfo.targetUserID.substr(0,10);
      if(targetID.length < msgInfo.targetUserID.length) {
        targetID += "...";
      }

      if(msgInfo.rewardData === '[]') {
        rewardData = '-';
      } else {
        rewardData = msgInfo.rewardData;
      }

      return ['__checkbox', `${dayjs(msgInfo.creationTime).format('YYYY-MM-DD HH:mm')}`, `[${getTitle(msgInfo.titleTable,getLangTypeFromCode(23))}] ${getContent(msgInfo.contentTable,getLangTypeFromCode(23))}`, state, msgInfo.targetUserID === '' ? '전체' : targetID, JSON.stringify(rewardData).substr(0,30)];
    });
  
    return result;
  };

const QueryInboxMessageListPanel = (props) => {

    const { startLoading, setStartLoading } = useCommon();
    const { msgInfo, totalPageNum, requestMessageList, requestDeleteMessages } = useMessage();
    const [msgList, setMsgList] = useState([]);
    const [checkedMsgIDList, setCheckedMsgIDList] = useState([]);
    const [checkedFlagList, setCheckedFlagList] = useState([]);
    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [targetUserType, setTargetUserType] = useState(1);
    const [targetUserID, setTargetUserID] = useState('');
    const [curPageNo, setCurPageNo] = useState(1);
    const [subMenuOpen,setSubMenuOpen] = useState(false);

    const filterTargetUserList = [
        {id:1,name:'전체'},
        {id:2,name:'특정 유저'}
    ];

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

    const onSearchMessageClick = useCallback((event) => {

        queryfilterInfo.targetUserID = targetUserID;
    
        if (startDate === '') {
          queryfilterInfo.filterStartTime = '';
        } else {
          queryfilterInfo.filterStartTime = utils.makeDateTimeStringFromDate(startDate);
        }
    
        if (endDate === '') {
          queryfilterInfo.filterEndTime = '';
        } else {
          queryfilterInfo.filterEndTime = utils.makeDateTimeStringFromDate(endDate);
        }
    
        reloadMessageList(queryfilterInfo);
      });
    
      const onTargetUserItemClick = useCallback((item) => {
        setTargetUserType(item.id);
        if(item.id === 1) {
            setTargetUserID('');
        }
      });

    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();

    const startInputRef = useRef(null);
    const endInputRef = useRef(null);

    const queryfilterInfo = {
        targetUserID: '',
        filterStartTime: '',
        filterEndTime: '',
      };
    
      const onSearchAllDurationUserClick = useCallback((event) => {
        setStartDate('');
        setEndDate('');
      });
    
      const onTargetUserIDChange = (e) => {
        setTargetUserID(e.target.value);
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
    
      const onEditMsgButtonClick = (e) => {
        if (checkedFlagList.length !== 1) {
          toast.info('보기/수정할 메세지 항목을 1개 선택해주세요.');
          return;
        }
    
        for (let mInfo of msgInfo.msgList) {
          console.log('mInfo.msgID=', mInfo.msgID, ',', checkedMsgIDList[0]);
          if (mInfo.msgID === checkedMsgIDList[0]) {
            props.onMsgEditModeChange(true, { parentTitle: titleText, msgInfo: mInfo });
            break;
          }
        }
      };

    const onTableCheckBoxChanged = useCallback((checkList) => {
        const idList = [];
        const flagList = [];
        for (let i = 0; i < checkList.length; i++) {
          if (checkList[i] === true) {
            idList.push(msgInfo.msgList[i].msgID);
            flagList.push(!msgInfo.msgList[i].activationFlag);
          }
        }
    
        setCheckedMsgIDList(idList);
        setCheckedFlagList(flagList);
      });
    
      const onDeleteMsgButtonClick = (e) => {
        if (checkedMsgIDList.length === 0) {
          toast.info('삭제할 메세지 항목을 선택해주세요.');
          return;
        }
    
        setPopupContent('메세지 항목 삭제를 정말로 진행하시겠습니까?');
        setPopupShown(true);
      };
    
      const onPopupButtonClick = async (buttonIdx) => {
        if (buttonIdx === 0) {
          setStartLoading(true);
          const resultInfo = await requestDeleteMessages(constants.MESSAGE_TYPE_INBOX, checkedMsgIDList);
    
          console.log(resultInfo);
    
          if (resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
          } else {
            toast.info('선택한 이벤트 항목(들)이 삭제되었습니다.');
          }
    
          await reloadMessageList(queryfilterInfo);
    
          setStartLoading(false);
    
          setCheckedMsgIDList([]);
          setCheckedFlagList([]);
        }
    
        onPopupCloseButtonClick(null);
      };
    
      const onPopupCloseButtonClick = (e) => {
        setPopupShown(false);
      };

    const onKeyPress = (e) => {
        if (e.key === 'Enter') {
          onSearchMessageClick(e);
        }
      };
    
      const reloadMessageList = async (queryFilterInfo) => {
        setStartLoading(true);
        setTimeout(async () => {
          const resultInfo = await requestMessageList({ queryFilterInfo, msgType: constants.MESSAGE_TYPE_INBOX, pageNo: curPageNo });
    
          console.log('messageInfo=', resultInfo);
          if (resultInfo.resultCode === 0) {
            setMsgList(makeTableFromMsgList(resultInfo.data.list));
          }  else {
            toast.error(resultInfo.message);
          }
          setStartLoading(false);
        }, 200);
      };

      const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
    };

    useEffect(()=> {
        props.onSubMenuOpenClicked(subMenuOpen);
    },[subMenuOpen]);

    useEffect(() => {
        reloadMessageList(queryfilterInfo);
      }, []);

    useEffect(() => {
      reloadMessageList(queryfilterInfo);
    }, [curPageNo]);

    return (
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader>
                <MediaQuery maxWidth={768}>
                  &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
                </MediaQuery>
                <span id='subtitle'>{titleText}</span>
                <span>&nbsp;</span>
                <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='6vw' height='2vw' onClick={(e) => onEditMsgButtonClick(e)}>보기/수정하기</Button1></span>
                <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='6vw' height='2vw' onClick={(e) => onDeleteMsgButtonClick(e)}>삭제</Button1></span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
                <contentStyled.FilterGroup>
                    <contentStyled.FilterItem>
                        <span id='name'>전송 대상</span>
                        <span id='dropdown'><DropBox responsive='1.3' width='10vw' height='2vw' fontSize='0.6vw' text={filterTargetUserList[targetUserType - 1].name} itemList={filterTargetUserList} menuItemClick={(item)=>onTargetUserItemClick(item)} /></span>
                    </contentStyled.FilterItem>
                    <contentStyled.FilterItem>
                        <span id='name'>유저ID</span>
                        <span id='input'><InputField1 responsive='1.3' width='12vw' height='2vw' placeholder={'유저ID 또는 닉네임을 입력하세요.'} readOnly={targetUserType===1?true:false} value={targetUserID} onChange={(e) => onTargetUserIDChange(e)} onKeyPress={(e) => onKeyPress(e)}/></span>
                        <span id='search'><Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onSearchMessageClick(e)}>검색</Button1></span>
                    </contentStyled.FilterItem>
                    <contentStyled.FilterItem>
                        <span id='name' style={{marginRight:'2vw'}}>보낸 날짜:</span>
                        <span id='name'>시작일시</span>
                        <span id='input'><DatePicker selected={startDate} onChange={onStartTimeDatePickerChanged} showTimeSelect dateFormat='Pp' timeIntervals={10} customInput={<DatePickerInput ref={startInputRef} />} /></span>
                        <span id='name'>종료일시</span>
                        <span id='input'><DatePicker selected={endDate} onChange={onEndTimeDatePickerChanged} showTimeSelect dateFormat='Pp' timeIntervals={10} customInput={<DatePickerInput ref={endInputRef} />} /></span>
                        <span id='search'><Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onSearchAllDurationUserClick(e)}>전체</Button1></span>
                    </contentStyled.FilterItem>
                </contentStyled.FilterGroup>
                <contentStyled.MainContentHeaderHorizontalLine marginBottom='1.5vw' />
                <Table responsive='1.6' colFormat={tableHSpaceTable}
                        headerInfo={tableHeaderInfo}
                        bodyInfo={msgList}
                        onPageNoClick={onPageNoClick}
                        onGotoFirstPageClick={onGotoFirstPageClick}
                        onGotoPrevPageClick={onGotoPrevPageClick}
                        onGotoNextPageClick={onGotoNextPageClick}
                        onGotoLastPageClick={onGotoLastPageClick}
                        noPageControl={false}
                        recordNumPerPage={RECNUM_PERPAGE}
                        totalRecordNum={msgInfo.totalCount}
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

export default QueryInboxMessageListPanel;