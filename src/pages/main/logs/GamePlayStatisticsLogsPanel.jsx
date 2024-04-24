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
import RadioGroup from '../../../components/RadioGroup';
import Table from '../../../components/Table';
import { useEffect } from 'react';

import * as constants from '../../../common/constants';
import useCommon from '../../../store/useCommonStorageManager';
import useAdminActLog from '../../../store/useLogDataManager';
import { toast } from 'react-toastify';

const titleText = '게임플레이 통계';

const DatePickerInput = forwardRef((props) => {
    return <InputField1 responsive='1.2' width="8vw" height="2vw" {...props} />;
});

let refreshFlag = false;
const GamePlayStatisticsLogsPanel = (props) => {
    const { startLoading, setStartLoading } = useCommon();
    const { logInfo, totalPageNum, requestAdminActLogList } = useAdminActLog();
    const [baseTime, setBaseTime] = useState(new Date(Date.now() + 10 * 60000));

    const [playMode, setPlayMode] = useState(0);
    const [statisticType, setStatisticType] = useState(0);
    const [detailStatisticType1, setDetailStatisticType1] = useState(0);
    const [detailStatisticType2, setDetailStatisticType2] = useState(0);

    const [displayNum, setDisplayNum] = useState(10);
    const [baseDirectionIndex,] = useState(1);
    const [timeIntervalData,setTimeIntervalData] = useState([]);
    const [timeIntervalIndex, setTimeIntervalIndex] = useState(0);
    const [cashTypeIndex, setCashTypeIndex] = useState(0);

    const [curPageNo, setCurPageNo] = useState(1);
    const [subMenuOpen,setSubMenuOpen] = useState(false);
  
    const baseTimeInputRef = useRef(null);

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
    //   if(curPageNo < totalPageNum(RECNUM_PERPAGE)) {
    //     setCurPageNo(curPageNo+1);
    //   }
      return true;
    });
  
    const onGotoLastPageClick = useCallback((event) => {
      //setCurPageNo(totalPageNum(RECNUM_PERPAGE));
      return true;
    });
  
    const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
    };

    const onTitleKeywordChange = (e) => {

    };

    const onKeyPress = (e) => {
        if (e.key === 'Enter') {
            onQueryButtonClick(e);
        }
    };

    const onBaseTimeDatePickerChanged = (date) => {
        setBaseTime(date);  
        // const baseTime2 = dayjs(utils.makeDateTimeStringFromDate(date));
    
        // if (baseTime2.isBefore(dayjs()) === true) {
        //   toast.error('시작일은 지금 시각 이후이어야 합니다.');
        // }
    };

    const onQueryPrevButtonClick = (e) => {

        // if(parseInt(displayNum) < 10) {
        //   toast.error('표시 갯수는 10이상 이어야 합니다.');
        //   setDisplayNum(10);
        //   return;
        // }
  
        // refreshFlag = true;
        // setOffsetValue(value=>value-parseInt(displayNum-1));
      };
  
      const onQueryNextButtonClick = (e) => {
  
        // if(parseInt(displayNum) < 10) {
        //   toast.error('표시 갯수는 10이상 이어야 합니다.');
        //   setDisplayNum(10);
        //   return;
        // }
  
        // refreshFlag = true;
        // setOffsetValue(value=>value+parseInt(displayNum-1));
      };

    const onQueryButtonClick = (e) => {

    };

    const onPlayModeRadioButtonClick = (idx) => {

        setPlayMode(idx);
    };

    const onStatisticTypeRadioButtonClick = (idx) => {

        setStatisticType(idx);
    };

    const onDisplayNumChanged = (e) => {

        setDisplayNum(e.target.value);
    }

    const onTimeIntervalRadioButtonClick = async (idx) => {

        refreshFlag = true;
        setTimeIntervalIndex(index=>idx);
    }

    const onDetailStatisticType1RadioButtonClick = async (idx) => {

        setDetailStatisticType1(idx);
    };

    const onDetailStatisticType2RadioButtonClick = async (idx) => {

        setDetailStatisticType2(idx);
    };

    const onCashTypeRadioButtonClick = async (idx) => {

        refreshFlag = true;
        setCashTypeIndex(index=>idx);
    };

    return (
      <contentStyled.ContentWrapper>
        <contentStyled.ContentHeader>
            <MediaQuery maxWidth={768}>
                &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
            </MediaQuery>
            <span id="subtitle">{titleText}</span>
            <span>&nbsp;</span>
            <span id="button" style={{flexBasis:'4vw'}}>
                <Button1 responsive='1.6' bgColor="var(--btn-primary-color)" width="4vw" height="2vw" onClick={(e) => onQueryPrevButtonClick(e)}>
                    {'<'}
                </Button1>
            </span>
            <span id="button">
                <Button1 responsive='1.6' bgColor="var(--btn-primary-color)" width="6vw" height="2vw" onClick={(e) => onQueryButtonClick(e)}>
                    조회
                </Button1>
            </span>
            <span id="button">
                <Button1 responsive='1.6' bgColor="var(--btn-primary-color)" width="4vw" height="2vw" onClick={(e) => onQueryNextButtonClick(e)}>
                    {'>'}
                </Button1>
            </span>
        </contentStyled.ContentHeader>
        <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />
  
        <contentStyled.ContentBody>
            <contentStyled.FilterGroup marginBottom="0vw">
                <contentStyled.FilterItem>
                    <label style={{fontWeight:'bold',color:'var(--btn-primary-color)'}}>{'*1회이상 게임플레이 유저수:'}&nbsp;{'25,000'}명</label>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label style={{fontWeight:'bold',color:'var(--btn-primary-color)'}}>{'*어드벤처/던전/탐험/아레나 플레이 유저수:'}&nbsp;{'25,000'}({'50%'})&nbsp;/&nbsp;{'25,000'}({'50%'})&nbsp;/&nbsp;{'25,000'}({'50%'})&nbsp;/&nbsp;{'25,000'}({'50%'})</label>
                </contentStyled.FilterItem>
            </contentStyled.FilterGroup>
            <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />
          <contentStyled.FilterGroup>
          <contentStyled.FilterItem marginLeft="1vw">
            <span id="name">전투모드</span>
            <span id="input">
            <RadioGroup responsive='1.6' initButtonIndex={playMode}  interMargin='0.2vw' nameTable={['어드벤처', '던전', '탐험', '아레나']} buttonClicked={(idx) => onPlayModeRadioButtonClick(idx)} />
            </span>
            &nbsp;&nbsp;&nbsp;&nbsp;<span id="name">통계 타입</span>
            <span id="input">
            <RadioGroup responsive='1.6' initButtonIndex={statisticType}  buttonWidth='5.5vw' interMargin='0.2vw' nameTable={['일자별', (playMode===2?'시간타입별':(playMode===3?'티어별':'구간별'))]} buttonClicked={(idx) => onStatisticTypeRadioButtonClick(idx)} />
            </span>
        </contentStyled.FilterItem>
        {statisticType===0 ?
        (
            <contentStyled.FilterItem marginLeft="0vw">
            &nbsp;&nbsp;&nbsp;&nbsp;<span id="name">시간 간격</span>
            <span id="input">
            <RadioGroup responsive='1.6' initButtonIndex={timeIntervalIndex}  buttonWidth='4.5vw' interMargin='0.2vw' nameTable={['일간', '주간', '월간']} buttonClicked={(idx) => onTimeIntervalRadioButtonClick(idx)} />
            </span>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id="name">표시 갯수</span>
            <span id="input">
            <InputField1 responsive='1.6' value={displayNum} width='5vw' height='2vw' onChange={(e) => onDisplayNumChanged(e)} />
            </span>
            </contentStyled.FilterItem>
        ):(
            
            playMode===2?(
                <contentStyled.FilterItem marginLeft="0vw">
                &nbsp;&nbsp;&nbsp;&nbsp;<span id="name">탐험시간</span>
                <span id="input">
                <RadioGroup responsive='1.6' initButtonIndex={detailStatisticType1}  buttonWidth='4.5vw' interMargin='0.2vw' nameTable={['전체', '1시간', '3시간', '6시간', '12시간']} buttonClicked={(idx) => onDetailStatisticType1RadioButtonClick(idx)} />
                </span>
                </contentStyled.FilterItem>
            ):(
                
                playMode===3?(
                    <contentStyled.FilterItem marginLeft="0vw">

                    </contentStyled.FilterItem>
                ):(
                    <contentStyled.FilterItem marginLeft="0vw">
                    &nbsp;&nbsp;&nbsp;&nbsp;<span id="name">챕터</span>
                    <span id="input">
                    <RadioGroup responsive='1.6' initButtonIndex={detailStatisticType1}  buttonWidth='3.5vw' interMargin='0.2vw' nameTable={['챕터1', '챕터2', '챕터3', '챕터4']} buttonClicked={(idx) => onDetailStatisticType1RadioButtonClick(idx)} />
                    </span>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span id="name">세부 분류</span>
                    <span id="input">
                    <RadioGroup responsive='1.6' initButtonIndex={detailStatisticType2}  buttonWidth='4.5vw' interMargin='0.2vw' nameTable={['클리어수', '재시도수', '별 획득수']} buttonClicked={(idx) => onDetailStatisticType2RadioButtonClick(idx)} />
                    </span>
                    </contentStyled.FilterItem>
                )
                
            )
        )}
          </contentStyled.FilterGroup>
          <contentStyled.MainContentHeaderHorizontalLine marginBottom="1.5vw" />
          {/* <Table responsive='1.6' 
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
          /> */}
        </contentStyled.ContentBody>
      </contentStyled.ContentWrapper>
    );
  };
  
  export default GamePlayStatisticsLogsPanel;