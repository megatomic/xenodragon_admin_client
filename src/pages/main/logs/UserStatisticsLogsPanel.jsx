import React, { useState, useCallback, forwardRef, useRef } from 'react';
import Chart from 'react-apexcharts';
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
import useStatistics from '../../../store/useStatisticsDataManager';
import { toast } from 'react-toastify';

const titleText = '사용자 통계';

const DatePickerInput = forwardRef((props) => {
    return <InputField1 responsive='1.2' width="8vw" height="2vw" {...props} />;
});

let refreshFlag = false;
const UserStatisticsLogsPanel = (props) => {
    const { startLoading, setStartLoading } = useCommon();
    const { requestUserStatisticsData } = useStatistics();
    const [baseTime, setBaseTime] = useState(new Date(Date.now() + 10 * 60000));
    const [offsetValue, setOffsetValue] = useState(0);

    const [startTimeTable,setStartTimeTable] = useState([]);
    const [yAxisMaxValue, setYAxisMaxValue] = useState(10);

    const [graphType, setGraphType] = useState(0);
    const [displayNum, setDisplayNum] = useState(20);
    const [baseDirectionIndex, setBaseDirectionIndex] = useState(1);
    const [timeIntervalData,setTimeIntervalData] = useState([]);
    const [timeIntervalIndex, setTimeIntervalIndex] = useState(0);
    const [cashTypeIndex, setCashTypeIndex] = useState(0);

    const [userTotalRegisterNum,setUserTotalRegisterNum] = useState(0);
    const [userAccRegisterNumTable, setUserAccRegisterNumTable] = useState([]);
    const [userNewRegisterNumTable, setUserNewRegisterNumTable] = useState([]);
    const [userPlayNumTable, setUserPlayNumTable] = useState([]);

    const [curPageNo, setCurPageNo] = useState(1);
    const [subMenuOpen,setSubMenuOpen] = useState(false);
  
    const [offsetFlag, setOffsetFlag] = useState(false);
    const [refreshGraph, setRefreshGraph] = useState(false);
    const [chartSeries,setChartSeries] = useState([]);

    const baseTimeInputRef = useRef(null);

    const convertToChartLabel = (startTime,endTime,gType) => {

        let spaceChar="";
        if(gType === 1) {
          spaceChar=" ";
        }
        if(timeIntervalIndex === 0) {
          return `${(dayjs(endTime).get('month')+1)+'월'} ${dayjs(endTime).get('date')+'일'+spaceChar}`;
        } else if(timeIntervalIndex === 1) {
          return `${(dayjs(startTime).get('month')+1)}/${dayjs(startTime).get('date')+spaceChar}~${(dayjs(endTime).get('month')+1)}/${dayjs(endTime).get('date')+spaceChar}`;
        } else if(timeIntervalIndex === 2) {
          return `${(dayjs(endTime).get('month')+1)+'월'+spaceChar}`;
        }
    };
  
    const updateGraph = () => {
  
        let maxValue = 0;
        if(offsetFlag === true) {
          maxValue = yAxisMaxValue/1.1;
        }
  
        for(let i=0;i<userAccRegisterNumTable.length;i++) {
          if(userAccRegisterNumTable[i] > maxValue) {
            maxValue = Math.floor(userAccRegisterNumTable[i]);
          }
        }
  
        if(maxValue > 10) {
          console.log('maxValue=',maxValue,',yAxisMaxValue=',yAxisMaxValue);
          setYAxisMaxValue(value=>maxValue*1.1);
        }
  
        if(baseDirectionIndex === 0) {
          setStartTimeTable(table=>timeIntervalData.map(e=>convertToChartLabel(e.startTime,e.endTime,graphType)));
        } else {
          setStartTimeTable(table=>timeIntervalData.map(e=>convertToChartLabel(e.startTime,e.endTime,graphType)).reverse());
        }
  
        setChartSeries([
          {
            name: "신규 가입자 수",
            data: userNewRegisterNumTable
          },
          {
            name: "누적 가입자 수",
            data: userAccRegisterNumTable
          },
          {
            name: "플레이 수",
            data: userPlayNumTable
          },
        ]);
    };
  
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

        if(parseInt(displayNum) < 10) {
          toast.error('표시 갯수는 10이상 이어야 합니다.');
          setDisplayNum(10);
          return;
        }
  
        refreshFlag = true;
        setOffsetValue(value=>value-parseInt(displayNum-1));
      };
  
      const onQueryNextButtonClick = (e) => {
  
        if(parseInt(displayNum) < 10) {
          toast.error('표시 갯수는 10이상 이어야 합니다.');
          setDisplayNum(10);
          return;
        }
  
        refreshFlag = true;
        setOffsetValue(value=>value+parseInt(displayNum-1));
      };

    const onQueryButtonClick = async (e) => {

        if(parseInt(displayNum) < 10) {
            toast.error('표시 갯수는 10이상 이어야 합니다.');
            setDisplayNum(10);
            return;
          }
    
          refreshFlag = true;
    
          setYAxisMaxValue(value=>8);
    
          if(offsetValue !== 0) {
            setOffsetValue(0);
          } else {
            await processQuery(false);
        }
    };

    const onBaseDirectionRadioButtonClick = (idx) => {

        setBaseDirectionIndex(idx);
    };

    const onDisplayNumChanged = (e) => {

        setDisplayNum(e.target.value);
    }

    const onTimeIntervalRadioButtonClick = async (idx) => {

        refreshFlag = true;
        setTimeIntervalIndex(index=>idx);
    }

    const onCashTypeRadioButtonClick = async (idx) => {

        refreshFlag = true;
        setCashTypeIndex(index=>idx);
    };

    const onGraphTypeChanged = (idx) => {

        refreshFlag = true;

        //setYAxisMaxValue(value=>9);
        setGraphType(value=>idx);
    };

    const processQuery = async (flag) => {

        setStartLoading(true);
        setOffsetFlag(value=>flag);
  
        const queryInfo = {baseTime:utils.makeDateTimeStringFromDate(baseTime),baseDirection:baseDirectionIndex===0?true:false,displayNum:parseInt(displayNum),timeIntervalType:timeIntervalIndex,offsetValue};
  
        console.log('queryInfo=',queryInfo);
  
        const result = await requestUserStatisticsData(queryInfo);
        
        setStartLoading(false);
  
        if(result.resultCode !== 0) {
          toast.error(result.message);
          return;
        }
  
        console.log('resultInfo=',result);

        setUserTotalRegisterNum(parseInt(result.data.totalUserRegisterNum));
        setTimeIntervalData(data=>result.data.timeIntervalTable);
        const userRegisterTable = result.data.registerInfoTable;
        const userPlayTable = result.data.playInfoTable;
  
        setUserNewRegisterNumTable(table=>userRegisterTable.map(e=>e.count));
        setUserAccRegisterNumTable(table=>userRegisterTable.map(e=>e.accCount));
        setUserPlayNumTable(table=>userPlayTable.map(e=>e.count));

        if(refreshFlag === true) {
          setRefreshGraph(value=>!value);
          refreshFlag = false;
        }
    };

    const fetch = async (flag) => {
      if(flag === false) {
        refreshFlag = true;
      }
        await processQuery(flag);
    };

    useEffect(() => {
        updateGraph();
    },[refreshGraph]);

    useEffect(() => {
        fetch(true);
    },[offsetValue]);

    useEffect(() => {
      fetch(false);
    },[]);

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
            <contentStyled.FilterGroup>
              <contentStyled.FilterItem>
                    <label style={{fontWeight:'bold',color:'var(--btn-secondary-color)'}}>{'[주의] 플레이 수는 일간 1회이상 전투에 참가한 중복되지 않는 유저수 입니다. (주간,월간 플레이 수는 단순 합산으로 데이터가 없어 잘못 표시되므로 참고하지 마시길 바랍니다)'}</label>
                </contentStyled.FilterItem>
                <br />
            </contentStyled.FilterGroup>
            <contentStyled.FilterGroup marginBottom="0vw">
                <contentStyled.FilterItem>
                    <label style={{fontWeight:'bold',color:'var(--btn-primary-color)'}}>{'*전체 가입자수:'}&nbsp;{userTotalRegisterNum===undefined?0:userTotalRegisterNum.toLocaleString()}명</label>
                </contentStyled.FilterItem>
            </contentStyled.FilterGroup>
            <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />
          <contentStyled.FilterGroup>
          <contentStyled.FilterItem marginLeft="1vw">
            <span id="name">날짜/시간</span>
            <span id="input">
            {timeIntervalIndex===0&&(<DatePicker selected={baseTime} onChange={onBaseTimeDatePickerChanged} showTimeSelect dateFormat="Pp" dateFormatCalendar="yyyy년 MM월" timeIntervals={60} customInput={<DatePickerInput ref={baseTimeInputRef} />} />)}
            {timeIntervalIndex>0&&timeIntervalIndex<3&&(<DatePicker selected={baseTime} onChange={onBaseTimeDatePickerChanged} dateFormat="P" dateFormatCalendar="yyyy년 MM월" timeIntervals={60} customInput={<DatePickerInput ref={baseTimeInputRef} />} />)}
            {timeIntervalIndex===3&&(<DatePicker selected={baseTime} onChange={onBaseTimeDatePickerChanged} dateFormat="P" timeIntervals={60} dateFormatCalendar="yyyy년 MM월" customInput={<DatePickerInput ref={baseTimeInputRef} />} />)}
            </span>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id="name">기준</span>
            <span id="input">
            <RadioGroup responsive='1.6' initButtonIndex={baseDirectionIndex}  interMargin='0.2vw' nameTable={['시작 기준', '끝 기준']} buttonClicked={(idx) => onBaseDirectionRadioButtonClick(idx)} />
            </span>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id="name">표시 갯수</span>
            <span id="input">
            <InputField1 responsive='1.6' value={displayNum} width='3vw' height='2vw' onChange={(e) => onDisplayNumChanged(e)} />
            </span>
            &nbsp;&nbsp;&nbsp;&nbsp;<span id="name">시간 간격</span>
            <span id="input">
            <RadioGroup responsive='1.6' initButtonIndex={timeIntervalIndex}  buttonWidth='3.5vw' interMargin='0.2vw' nameTable={['일간', '주간', '월간']} buttonClicked={(idx) => onTimeIntervalRadioButtonClick(idx)} />
            </span>
        </contentStyled.FilterItem>
          </contentStyled.FilterGroup>
          <contentStyled.MainContentHeaderHorizontalLine marginBottom="1.5vw" />
          <br />
          <Chart
            id="chart"
            options={
              {  
                colors: ['#00b2c4ff', '#ff9277ff', '#b4a7d6ff'],
                fill: {
                  colors: ['#00b2c4ff', '#ff9277ff', '#b4a7d6ff']
                },
                chart: {
                  id: "basic-bar",
                  animations: {
                    enabled: false
                  },
                  zoom: {
                    enabled: false
                  }
                },
                dataLabels: {
                  enabled: true,
                  style: {
                    colors: ["#000000"]
                  },
                  formatter: function(value, { seriesIndex, dataPointIndex, w }) {
                    return value.toLocaleString()
                  }
                },
                stroke: {
                  curve: 'straight'
                },
                title: {
                  text: '신규/누적 가입자 대비 전투 플레이수 그래프',
                  align: 'left'
                },
                grid: {
                  row: {
                    colors: ['#f3f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                    opacity: 0.5
                  },
                },
                xaxis: {
                  categories: startTimeTable
                },
                yaxis: {
                  max: (max) => {
                    return yAxisMaxValue;
                  }
                }
              }
            }
            series={chartSeries}
            type="bar"
            width="98%"
            height="500"
            />
        </contentStyled.ContentBody>
      </contentStyled.ContentWrapper>
    );
  };
  
  export default UserStatisticsLogsPanel;