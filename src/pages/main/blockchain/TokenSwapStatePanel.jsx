import React, {useState,useEffect,useRef,forwardRef} from 'react';
import Chart from 'react-apexcharts'
import DatePicker from 'react-datepicker';

import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as pageStyled from '../blockchain/NFTContentPageStyles';
import * as utils from '../../../common/js/utils';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import RadioGroup from '../../../components/RadioGroup';
import Table from '../../../components/Table';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useBlockchain from '../../../store/useBlockchainDataManager';

const titleText = "유저 토큰스왑 현황 조회";

const tableHeaderInfo = ['랭킹','유저ID','닉네임','XDS->XDC','XDC->XDS'];
const tableHSpaceTable = '0.4fr 1.8fr 1.0fr 1.0fr 1.0fr';


const DatePickerInput = forwardRef((props) => {
  return <InputField1 responsive='1.2' width="8vw" height="2vw" {...props} />;
});

let refreshFlag = false;

const makeTableFromUserSwapInfoList = (userSwapList) => {

  const result = userSwapList.map((userSwapInfo, idx) => {  

    return [(idx+1).toString(), userSwapInfo.userId, userSwapInfo.userNick, userSwapInfo.xds2xdc.toString()+" XDC", userSwapInfo.xdc2xds.toString()+" XDS"];
  });

  return result;
};

// [주의]:: yAxis 레이블은 그래프 하단의 레이블의 배열값과 yAxis값이 동시에 변경되어야만 변경사항이 반영됨!!

const TokenSwapStatePanel = (props) => {

  const { startLoading, setStartLoading } = useCommon();
  const { requestUserSwapGraphData } = useBlockchain();

  const [baseTime, setBaseTime] = useState(new Date(Date.now() + 10 * 60000));
  const [offsetValue, setOffsetValue] = useState(0);
  const [timeIntervalIndex, setTimeIntervalIndex] = useState(1);
  
  const [yAxisMaxValue, setYAxisMaxValue] = useState(10);

  const [gameOperatorInfo, setGameOperatorInfo] = useState({ksta:"0",nst:"0",xdc:"0"});
  const [swapTotalXDSNum, setSwapTotalXDSNum] = useState(0);
  const [swapTotalXDCNum, setSwapTotalXDCNum] = useState(0);
  const [swapTotalXDSValue1, setSwapTotalXDSValue1] = useState(0.0);
  const [swapTotalXDSValue2, setSwapTotalXDSValue2] = useState(0.0);
  const [swapTotalXDCValue1, setSwapTotalXDCValue1] = useState(0.0);
  const [swapTotalXDCValue2, setSwapTotalXDCValue2] = useState(0.0);

  const [graphType, setGraphType] = useState(0);
  const [displayNum, setDisplayNum] = useState(10);
  const [baseDirectionIndex, setBaseDirectionIndex] = useState(1);
  const [timeIntervalData,setTimeIntervalData] = useState([]);
  const [xdc2XDSSwapNumTable,setXDC2XDSSwapNumTable] = useState([]);
  const [xdc2XDSSwapTotalTable,setXDC2XDSSwapTotalTable] = useState([]);
  const [xds2XDCSwapNumTable,setXDS2XDCSwapNumTable] = useState([]);
  const [xds2XDCSwapTotalTable,setXDS2XDCSwapTotalTable] = useState([]);
  const [userSwapInfoTable, setUserSwapInfoTable] = useState([]);
  const [userSwapInfoView, setUserSwapInfoView] = useState([]);

  const [offsetFlag, setOffsetFlag] = useState(false);
  const [refreshGraph, setRefreshGraph] = useState(false);

  const [startTimeTable,setStartTimeTable] = useState([]);

  const baseTimeInputRef = useRef(null);

    const [chartSeries,setChartSeries] = useState([]);

    const onRefreshButtonClick = (e) => {

    };
    const onSubMenuClick = (e) => {
        //setSubMenuOpen(state=>!subMenuOpen);
    };

    const onBaseTimeDatePickerChanged = (date) => {
      setBaseTime(date);  
      // const baseTime2 = dayjs(utils.makeDateTimeStringFromDate(date));
  
      // if (baseTime2.isBefore(dayjs()) === true) {
      //   toast.error('시작일은 지금 시각 이후이어야 합니다.');
      // }
    };

    const onGraphTypeChanged = (idx) => {

      refreshFlag = true;

      //setYAxisMaxValue(value=>9);
      setGraphType(value=>idx);
    };

    const convertToChartLabel = (startTime,endTime,gType) => {

      let spaceChar="";
      if(gType === 1) {
        spaceChar=" ";
      }
      if(timeIntervalIndex === 0) {
        return `${dayjs(endTime).get('date')+'일'} ${dayjs(endTime).get('hour')+'시'+spaceChar}`;
      } else if(timeIntervalIndex === 1) {
        return `${(dayjs(endTime).get('month')+1)+'월'} ${dayjs(endTime).get('date')+'일'+spaceChar}`;
      } else if(timeIntervalIndex === 2) {
        return `${(dayjs(startTime).get('month')+1)}/${dayjs(startTime).get('date')+spaceChar}~${(dayjs(endTime).get('month')+1)}/${dayjs(endTime).get('date')+spaceChar}`;
      } else if(timeIntervalIndex === 3) {
        return `${(dayjs(endTime).get('month')+1)+'월'+spaceChar}`;
      }
    };

    const updateGraph = () => {

      let maxValue = 0;
      if(offsetFlag === true) {
        maxValue = yAxisMaxValue/1.1;
      }

      if(graphType === 0) {
        for(let i=0;i<xdc2XDSSwapNumTable.length;i++) {
          if(xdc2XDSSwapNumTable[i] > maxValue) {
            maxValue = Math.floor(xdc2XDSSwapNumTable[i]);
          }
          if(xds2XDCSwapNumTable[i] > maxValue) {
            maxValue = Math.floor(xds2XDCSwapNumTable[i]);
          }
        }
      } else {
        for(let i=0;i<xdc2XDSSwapTotalTable.length;i++) {
          if(xdc2XDSSwapTotalTable[i] > maxValue) {
            maxValue = xdc2XDSSwapTotalTable[i];
          }
          if(xds2XDCSwapTotalTable[i] > maxValue) {
            maxValue = xds2XDCSwapTotalTable[i];
          }
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
          name: "XDC2XDS",
          data: (graphType === 0?xdc2XDSSwapNumTable:xdc2XDSSwapTotalTable)
        },
        {
          name: "XDS2XDC",
          data: (graphType === 0?xds2XDCSwapNumTable:xds2XDCSwapTotalTable)
        },
      ]);
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

    const processQuery = async (flag) => {

      setStartLoading(true);
      setOffsetFlag(value=>flag);

      const queryInfo = {baseTime:utils.makeDateTimeStringFromDate(baseTime),baseDirection:baseDirectionIndex===0?true:false,displayNum:parseInt(displayNum),timeIntervalType:timeIntervalIndex,offsetValue};

      console.log('queryInfo=',queryInfo);

      const result = await requestUserSwapGraphData(queryInfo);
      
      setStartLoading(false);

      if(result.resultCode !== 0) {
        toast.error(result.message);
        return;
      }

      console.log('timeIntervalData:',timeIntervalData);

      setGameOperatorInfo(result.data.operatorInfo);
      setUserSwapInfoView(table=>makeTableFromUserSwapInfoList(result.data.userSwapInfoTable));

      setTimeIntervalData(data=>result.data.timeIntervalTable);
      const swapTable = result.data.swapInfoTable;

      let xdc2XDSSwapNumTable1 = [];
      let xdc2XDSSwapTotalTable1 = [];
      let xds2XDCSwapNumTable1 = [];
      let xds2XDCSwapTotalTable1 = [];

      let xdc2xdsNum = 0;
      let xds2xdcNum = 0;
      let xdc2xdsTotal1 = 0;
      let xdc2xdsTotal2 = 0;
      let xds2xdcTotal1 = 0;
      let xds2xdcTotal2 = 0;
      for(let swapInfo of swapTable) {
        xdc2XDSSwapNumTable1.push(swapInfo.xdc2xdsNum);
        xdc2XDSSwapTotalTable1.push(swapInfo.fromXDCTotal);
        xds2XDCSwapNumTable1.push(swapInfo.xds2xdcNum);
        xds2XDCSwapTotalTable1.push(swapInfo.fromXDSTotal);

        xdc2xdsNum += swapInfo.xdc2xdsNum;
        xds2xdcNum += swapInfo.xds2xdcNum;
        xdc2xdsTotal1 += parseFloat(swapInfo.fromXDCTotal);
        xdc2xdsTotal2 += parseFloat(swapInfo.toXDSTotal);
        xds2xdcTotal1 += parseFloat(swapInfo.fromXDSTotal);
        xds2xdcTotal2 += parseFloat(swapInfo.toXDCTotal);
      }

      setSwapTotalXDSNum(xds2xdcNum);
      setSwapTotalXDCNum(xdc2xdsNum);
      setSwapTotalXDSValue1(xds2xdcTotal1);
      setSwapTotalXDSValue2(xds2xdcTotal2);
      setSwapTotalXDCValue1(xdc2xdsTotal1);
      setSwapTotalXDCValue2(xdc2xdsTotal2);

      if(baseDirectionIndex === 0) {
        setXDC2XDSSwapNumTable(xdc2XDSSwapNumTable1);
        setXDC2XDSSwapTotalTable(xdc2XDSSwapTotalTable1);
        setXDS2XDCSwapNumTable(xds2XDCSwapNumTable1);
        setXDS2XDCSwapTotalTable(xds2XDCSwapTotalTable1);
      } else {
        setXDC2XDSSwapNumTable(xdc2XDSSwapNumTable1.reverse());
        setXDC2XDSSwapTotalTable(xdc2XDSSwapTotalTable1.reverse());
        setXDS2XDCSwapNumTable(xds2XDCSwapNumTable1.reverse());
        setXDS2XDCSwapTotalTable(xds2XDCSwapTotalTable1.reverse());
      }

      if(refreshFlag === true) {
        setRefreshGraph(value=>!value);
        refreshFlag = false;
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

    useEffect(() => {
      updateGraph();
    },[refreshGraph]);

    const fetch = async (flag) => {
      if(flag === false) {
        refreshFlag = true;
      }
      await processQuery(flag);
    };

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
        <Button1 responsive='1.6' bgColor="var(--btn-primary-color)" width="4vw" height="1.8vw" onClick={(e) => onQueryPrevButtonClick(e)}>
          {'<'}
        </Button1>
      </span>
      <span id="button">
        <Button1 responsive='1.6' bgColor="var(--btn-primary-color)" width="6vw" height="1.8vw" onClick={(e) => onQueryButtonClick(e)}>
          조회
        </Button1>
      </span>
      <span id="button">
        <Button1 responsive='1.6' bgColor="var(--btn-primary-color)" width="4vw" height="1.8vw" onClick={(e) => onQueryNextButtonClick(e)}>
          {'>'}
        </Button1>
      </span>
      </contentStyled.ContentHeader>
      <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

      <contentStyled.ContentBody>
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
          <RadioGroup responsive='1.6' initButtonIndex={timeIntervalIndex}  buttonWidth='3.5vw' interMargin='0.2vw' nameTable={['시간', '일간', '주간', '월간']} buttonClicked={(idx) => onTimeIntervalRadioButtonClick(idx)} />
        </span>
      </contentStyled.FilterItem>
      <contentStyled.FilterItem marginLeft="10vw">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id="name">그래프 종류</span>
        <span id="input">
          <RadioGroup responsive='1.6' initButtonIndex={graphType}  interMargin='0.2vw' nameTable={['스왑 건수', '스왑 총액']} buttonClicked={(idx) => onGraphTypeChanged(idx)} />
        </span>
      </contentStyled.FilterItem>
      <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
      <contentStyled.FilterItem marginLeft="0.5vw">
        <span id="name" style={{fontWeight:'bold',fontSize:'0.7vw'}}>
          <label>*게임운영자 지갑:</label>
        </span>
        <span id="name" style={{marginLeft:'0.5vw',fontWeight:'bold',fontSize:'0.7vw'}}>
        &nbsp;&nbsp;{Math.floor(parseFloat(gameOperatorInfo.ksta)).toLocaleString()}{' KSTA,'}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{Math.floor(parseFloat(gameOperatorInfo.nst)).toLocaleString()}{' NST,'}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{Math.floor(parseFloat(gameOperatorInfo.xdc)).toLocaleString()}{' XDC'}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'*지갑에서 지급된 XDC:'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{(30000000-Math.floor(parseFloat(gameOperatorInfo.xdc))).toLocaleString()}{' XDC'}
        </span>
      </contentStyled.FilterItem>
      <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
        <contentStyled.FilterItem marginLeft="0.5vw">
          <span id="name" style={{fontWeight:'bold',fontSize:'0.7vw'}}>
            {timeIntervalIndex===0 && '*시간:'}
            {timeIntervalIndex===1 && '*일간:'}
            {timeIntervalIndex===2 && '*주간:'}
            {timeIntervalIndex===3 && '*월간:'}
          </span>
          <span id="name" style={{marginLeft:'0.5vw',fontWeight:'bold',fontSize:'0.7vw'}}>{'XDS2XDC 총 건수:'}&nbsp;&nbsp;{swapTotalXDSNum}{'건,'}</span>
          &nbsp;<span id="name" style={{fontWeight:'bold',fontSize:'0.7vw'}}>{'XDC2XDS 총 건수:'}&nbsp;&nbsp;{swapTotalXDCNum}{'건'}</span>
          <span id="name" style={{marginLeft:'2vw',fontWeight:'bold',fontSize:'0.7vw'}}>{'XDS2XDC 총량:'}&nbsp;&nbsp;{swapTotalXDSValue1.toLocaleString()}{' XDS =>'}&nbsp;{swapTotalXDSValue2.toLocaleString()}{' XDC,'}</span>
          &nbsp;&nbsp;<span id="name" style={{fontWeight:'bold',fontSize:'0.7vw'}}>{'XDC2XDS 총량:'}&nbsp;&nbsp;{swapTotalXDCValue1.toLocaleString()}{' XDC =>'}&nbsp;{swapTotalXDCValue2.toLocaleString()}{' XDS'}</span>
        </contentStyled.FilterItem>
      <br />
            <Chart
            id="chart"
            options={
              {  
                colors: ['#00b2c4ff', '#ff9277ff'],
                fill: {
                  colors: ['#00b2c4ff', '#ff9277ff']
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
                  text: '유저 토큰스왑 그래프',
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

        <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
        <br />
        {timeIntervalData.length > 0 ? (
          <>
            <contentStyled.FilterItem marginLeft="0.5vw">
              <span id="name" style={{fontWeight:'bold',fontSize:'0.8vw'}}>
                <label>유저별 토큰 스왑량 Top 10 ({timeIntervalData[timeIntervalData.length-1].startTime} ~ {timeIntervalData[0].endTime})</label>
              </span>
            </contentStyled.FilterItem>
            <contentStyled.FilterItem marginLeft="0.5vw">
              <span id="name">
                <label>* 스왑량은 타겟 토큰량이며 랭킹은 XDS기준임</label>
              </span>
            </contentStyled.FilterItem>
            <Table responsive='1.6' marginLeft='3vw' marginRight='3vw'
                        colFormat={tableHSpaceTable}
                        headerInfo={tableHeaderInfo}
                        bodyInfo={userSwapInfoView}
                        onPageNoClick={()=>{}}
                        onGotoFirstPageClick={()=>{}}
                        onGotoPrevPageClick={()=>{}}
                        onGotoNextPageClick={()=>{}}
                        onGotoLastPageClick={()=>{}}
                        noPageControl={true}
                        recordNumPerPage={10}
                        onTableCheckBoxChanged={()=>{}}
                        totalRecordNum={10}
                        onButtonClick={(e,tag)=>{}}
                    />
          </>
        ):(<></>)}

      </contentStyled.ContentBody>
      </contentStyled.ContentWrapper>
    )
};

export default TokenSwapStatePanel;