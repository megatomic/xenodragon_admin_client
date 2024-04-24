import React, {useState,useCallback,forwardRef,useRef,useEffect} from 'react';
import MediaQuery from 'react-responsive';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import dayjs from 'dayjs';

import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './LogViewPageStyles';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';
import Table from '../../../components/Table';

const titleText = '시스템 로그 조회';
const tableHeaderInfo = ['__checkbox','보낸 시각','제목','내용','전송 상황','대상'];
const tableContentInfo = [
    ['__checkbox','2022-12-11 12:34:28','결제 문제로 개발보상','일시:2022년10월3일 부터...','2022-12-11 12:34:28','Bale외 9명'],
    ['__checkbox','2022-12-11 12:34:28','설 이벤트 보상','일시:2022년10월3일 부터...','전송 완료','전체'],
    ['__checkbox','2022-12-11 12:34:28','접속 장애 보상','일시:2022년10월3일 부터...','전송 완료','ANDROID']
];

const tableHSpaceTable = '0.5fr 1fr 1fr 2fr 0.8fr 0.8fr';

const DatePickerInput = forwardRef((props) => {
    return (
        <InputField1 responsive='1.2' width='12vw' height='2vw' {...props} />
    )
});

const QuerySystemLogsPanel = (props) => {

    const [subMenuOpen,setSubMenuOpen] = useState(false);

    const totalRecordNum = 3;
    const totalPageNum = 25;

    const filterLogTypeList = [
        {id:1,name:'일반 로그'},
        {id:2,name:'오류 로그'}
    ];

    const errorLogTable = [
        "[2022-11-23 8:23:12.982] [ERROR] File not found exception.",
        "[2022-11-23 8:23:12.982] [ERROR] File not found exception.",
        "[2022-11-23 8:23:12.982] [ERROR] File not found exception.",
        "[2022-11-23 8:23:12.982] [ERROR] File not found exception.",
        "[2022-11-23 8:23:12.982] [ERROR] File not found exception.",
        "[2022-11-23 8:23:12.982] [ERROR] File not found exception.",
        "[2022-11-23 8:23:12.982] [ERROR] File not found exception.",
        "[2022-11-23 8:23:12.982] [ERROR] File not found exception.",
        "[2022-11-23 8:23:12.982] [ERROR] File not found exception.",
        "[2022-11-23 8:23:12.982] [ERROR] File not found exception."
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

    const onSearchUserClick = useCallback((event) => {

    });

    const onTargetUserItemClick = useCallback((item) => {
        console.log(item.name);
    });

    const onSearchAllLoginDurationUserClick = useCallback((event) => {

    });

    const onDatePickerSelect = (date) => {

    };

    const onStartTimeDatePickerChanged = (date) => {
        setStartDate(date);
    };

    const onEndTimeDatePickerChanged = (date) => {
        setEndDate(date);
    };

    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();

    const startInputRef = useRef(null);
    const endInputRef = useRef(null);

    const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
    };
    
    useEffect(()=> {
        props.onSubMenuOpenClicked(subMenuOpen);
    },[subMenuOpen]);

    return (
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader>
            <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
        </MediaQuery>
                <span id='subtitle'>{titleText}</span>
                <span>&nbsp;</span>
                <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='6vw' height='2vw'>상세보기</Button1></span>
                <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='6vw' height='2vw'>삭제</Button1></span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
                <contentStyled.FilterGroup>
                    <contentStyled.FilterItem>
                        <span id='name'>로그 구분</span>
                        <span id='dropdown'><DropBox responsive='1.3' width='10vw' height='2vw' text={filterLogTypeList[0].name} fontSize='0.6vw' itemList={filterLogTypeList} menuItemClick={(item)=>onTargetUserItemClick(item)} /></span>
                    </contentStyled.FilterItem>
                    <contentStyled.FilterItem>
                        <span id='name'>로깅 날짜</span>
                        <span id='input'><DatePicker selected={startDate} onChange={onStartTimeDatePickerChanged} showTimeSelect dateFormat='Pp' timeIntervals={10} customInput={<DatePickerInput ref={startInputRef} />} /></span>
                    </contentStyled.FilterItem>
                </contentStyled.FilterGroup>
                <contentStyled.MainContentHeaderHorizontalLine marginBottom='1.5vw' />
                <styled.LogContent>
                    {
                        errorLogTable.map((errorLog,idx) => {
                            return <p>{errorLog}</p>
                        })
                    }
                </styled.LogContent>
            </contentStyled.ContentBody>
        </contentStyled.ContentWrapper>
    )
};

export default QuerySystemLogsPanel;