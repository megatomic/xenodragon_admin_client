import React, {useState,useEffect,useCallback} from 'react';
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

const RECNUM_PERPAGE = 10;

const titleText = "유동성풀 현황 조회";
const tableHeaderInfo = ['ID','토큰종류','유저액션','타겟값','소스지갑','거래일시'];
const tableHSpaceTable = '0.4fr 0.8fr 0.7fr 1.4fr 2.8fr 1.2fr';

const makeTableFromLogList = (logList) => {

  const result = logList.map((logInfo, idx) => {  


    return [logInfo.logID.toString(),(logInfo.tokenID === 5?"XDS":"XDC"),(logInfo.userActionType === 1?"XDC로 교환":"XDS로 교환"),logInfo.userActionValue,logInfo.userWalletAddress,dayjs(logInfo.timestamp).format("YYYY-MM-DD HH:mm:ss")];
  });

  return result;
};

const TokenLiquidPoolStatePanel = (props) => {

  const { startLoading, setStartLoading } = useCommon();
  const { blockchainInfo, totalPageNum, requestLiquidPoolData } = useBlockchain();

  const [curPageNo, setCurPageNo] = useState(1);
  const [poolXDCValue, setPoolXDCValue] = useState('');
  const [poolXDSValue, setPoolXDSValue] = useState('');
  const [userXDCValue, setUserXDCValue] = useState(0);
  const [userXDSValue, setUserXDSValue] = useState(0);
  const [tokenType, setTokenType] = useState(0);

  const [logList, setLogList] = useState([]);
  const [logViewTable, setLogViewTable] = useState([]);

  const onRefreshButtonClick = (e) => {

  };
  const onSubMenuClick = (e) => {
      //setSubMenuOpen(state=>!subMenuOpen);
  };

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

  const onTokenTypeButtonClick = useCallback((idx) => {
    setTokenType(idx);
  });

  const reloadLiquidPoolData = async (onlyLog) => {
    setStartLoading(true);

    const resultInfo = await requestLiquidPoolData({tokenType, logOnly:onlyLog, pageNo:curPageNo});

    console.log('resultInfo=',resultInfo);

    if(resultInfo.data.liquidPoolStateInfo !== null) {
      const totalXDC = Math.floor(resultInfo.data.liquidPoolStateInfo.xdcPoolTotal);
      const totalXDS = Math.floor(resultInfo.data.liquidPoolStateInfo.xdsPoolTotal);

      setPoolXDCValue(totalXDC.toLocaleString());
      setPoolXDSValue(totalXDS.toLocaleString());
      setUserXDCValue(resultInfo.data.liquidPoolStateInfo.xdcUserTotal);
      setUserXDSValue(resultInfo.data.liquidPoolStateInfo.xdsUserTotal);
    }

    setLogViewTable(makeTableFromLogList(resultInfo.data.liquidPoolLogInfo.list));

    setStartLoading(false);
  };

  useEffect(() => {
    reloadLiquidPoolData(true);
  }, [curPageNo,tokenType]);

  useEffect(() => {
    reloadLiquidPoolData(false);
  },[]);

  return (
    <contentStyled.ContentWrapper>
      <contentStyled.ContentHeader>
      <MediaQuery maxWidth={768}>
          &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
      </MediaQuery>
      <span id="subtitle">{titleText}</span>
      <span>&nbsp;</span>

      </contentStyled.ContentHeader>
      <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
      <br />
      <contentStyled.ContentBody>
        <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
          <div id='title'>
              <label>1.유동성 풀/유저 보유 현황</label>
              <div></div>
          </div>
          <br />
          <contentStyled.SettingItemArea bottomMargin="0.5vw">
              <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>풀 보유 XDC</label>
              </div>
              <div id="item-part2">
              <InputField1 type='string' responsive='1.6' width='12vw' height='2vw' style={{fontSize:'0.7vw'}} value={poolXDCValue} readOnly={true} />
              </div>
              <div id="item-part1" style={{ marginLeft:'4vw', verticalAlign: 'middle' }}>
              <p>풀 보유 XDS</p>
              </div>
              <div id="item-part2">
              <InputField1 type='string' responsive='1.6' width='12vw' height='2vw' style={{fontSize:'0.7vw'}} value={poolXDSValue} readOnly={true} />
              </div>
          </contentStyled.SettingItemArea>
        </contentStyled.SettingGroupArea>
        <br />
        <contentStyled.SettingGroupArea leftMargin='2vw' width='93%'>
          <div id='title'>
              <label>2.유동성 풀 로그</label>
              <div></div>
          </div>
          <br />
          <contentStyled.SettingItemArea leftMargin='0vw' bottomMargin="0vw">
            <div id='item-part1'>
                {'구분'}
            </div>
            <div id='item-part2'>
            <RadioGroup responsive='1.6' initButtonIndex={tokenType} interMargin="0.2vw" buttonWidth="5vw" nameTable={['전체','XDS','XDC']} buttonClicked={(idx) => onTokenTypeButtonClick(idx)} />
            </div>
          </contentStyled.SettingItemArea>
          <br />
          <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
          <contentStyled.SettingItemArea leftMargin='0vw' bottomMargin="0vw">
            <Table responsive='1.6' marginLeft='3vw' marginRight='3vw'
                        colFormat={tableHSpaceTable}
                        headerInfo={tableHeaderInfo}
                        bodyInfo={logViewTable}
                        onPageNoClick={onPageNoClick}
                        onGotoFirstPageClick={onGotoFirstPageClick}
                        onGotoPrevPageClick={onGotoPrevPageClick}
                        onGotoNextPageClick={onGotoNextPageClick}
                        onGotoLastPageClick={onGotoLastPageClick}
                        noPageControl={false}
                        recordNumPerPage={RECNUM_PERPAGE}
                        totalRecordNum={blockchainInfo.totalCount}
                    />
          </contentStyled.SettingItemArea>
          <br />
        </contentStyled.SettingGroupArea>
      </contentStyled.ContentBody>
    </contentStyled.ContentWrapper>
  );
};

export default TokenLiquidPoolStatePanel;