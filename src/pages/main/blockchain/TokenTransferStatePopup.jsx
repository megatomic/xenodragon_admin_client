import React,{useState,useEffect,useRef} from 'react';
import styled from 'styled-components';
import * as commonStyled from '../../../styles/commonStyles';
import dayjs from 'dayjs';
import useCommon from '../../../store/useCommonStorageManager';
import useNFT from '../../../store/useNFTDataManager';

import Modal from '../../../components/Modal';
import Button1 from '../../../components/Button1';


let intervalTimerID;
const useInterval = (callback, delay) => {
    const savedCallback = useRef();
  
    useEffect(() => {
        savedCallback.current = callback;
    });
  
    useEffect(() => {
        const tick = () => {
            savedCallback.current();
        }
  
        intervalTimerID = setInterval(tick, delay);
        return () => clearInterval(intervalTimerID);
    }, [delay]);
  };

const StTitlePanel = styled.div`
  flex: 0 0 3vw;
  width: 100%;
  background-color: var(--primary-color);
  border-top-left-radius: 0.4vw;
  border-top-right-radius: 0.4vw;

  > p {
    color: #ffffff;
    font-size: 0.8vw;
    padding: 0.8vw 0;
  }
`;

const StBodyPanel = styled.div`
  flex: 1;
  padding: 0.4vw 0.4vw;

  display: flex;
  flex-direction: column;
  justify-content: center;
  > #content {
    color: var(--secondary-color);
    vertical-align: center;
  }
`;

const StButtonGroupPanel = styled.div`
  flex: 0 0 4vw;
  > #button-group button {
    margin: 0.3vw 1vw;
  }
`;

let totalPackageIDTable;
let packageIDTable;

const TokenTransferStatePopup = ({shown,paramInfo,callback,cancelClick}) => {

    const setBackground = '';

    const {startLoading, setStartLoading} = useCommon();
    const {nftInfo, requestTokenTransfer} = useNFT();

    const [stateContent,setStateContent] = useState('');
    const [leftTime, setLeftTime] = useState('');
    const [requestCanceled,setRequestCanceled] = useState(false);
    const [requestCanceled2,setRequestCanceled2] = useState(false);

    const showLeftTime = (startDate,curNum,totalNum) => {

      const curDate = dayjs();
      const secDiff = curDate.diff(startDate,"second"); // 초 단위
      const totalSec = Math.floor((totalNum*secDiff)/curNum);
      let leftSec = totalSec - secDiff;
      let leftMin = Math.floor(leftSec/60);
      const leftSec2 = leftSec-leftMin*60;

      //console.log('leftSec=',leftSec,',leftMin=',leftMin,',leftSec2=',leftSec2);

      let timeText = `${leftMin}분 ${leftSec2}초 남음`;
      if(leftMin <= 0) {
        timeText = `${leftSec2}초 남음`;
      }
      setLeftTime(timeText);
    };

    const onCancelButtonClick = (e) => {

      setStartLoading(true);
        setRequestCanceled(true);

        const intervalID = setInterval(()=> {

          console.log('requestCancel2=',requestCanceled2);

            if(requestCanceled2 === true) {
              setStartLoading(false);
                clearInterval(intervalID);
                cancelClick(e);
            }
        },500);
    };

    // {transNumUnit, sourceType, groupID:curGroupID, sourceAddress,targetContractAddress,targetAddress,comment,tokenIDList:transferTokenIDList,itemInfoList,marketTrigger:triggerMarketURL}

    useEffect(() => {
        const fetchData = async () => {

          if(shown === undefined || shown === false) {
            return;
          }
          
          const transferGroupUnit = paramInfo.transferGroupUnit;
          const senderWalletAddress = paramInfo.senderWalletAddress;
          const tokenInfo = paramInfo.tokenInfo;
          const targetAddressList = paramInfo.targetAddressList;

          let bucketCount = 0;
          let addressInfo = null;
          const addressBucketList = [];
          for(let i=0;i<targetAddressList.length;i++) {
              if(bucketCount === 0) {
                addressInfo = [];
                addressBucketList.push(addressInfo);
              }

              addressInfo.push(targetAddressList[i]);
              bucketCount++;

              if(bucketCount >= transferGroupUnit) {
                  bucketCount = 0;
              }
          }

          let reqNum=0;
          let count = 0;
          let startDate = dayjs();
          let curDate = dayjs();
          let totalQty = targetAddressList.length;
          let transferCompleteAddressTable = [];
          for await (let addressTable of addressBucketList) {

              setStateContent(`ERC20 토큰전송 처리중...(${reqNum}/${totalQty})`);

              const resultInfo2 = await requestTokenTransfer({initReq:(count===0 ? true:false),senderWalletAddress, tokenInfo,targetAddressList:addressTable});
              
              console.log(resultInfo2);

              if(resultInfo2.resultCode !== 0) {
                  resultInfo2.data = {completeAddressList:transferCompleteAddressTable,failAddressList:addressTable,completeCount:count};
                  callback(resultInfo2);
                  return;
              } else {
                transferCompleteAddressTable = [...transferCompleteAddressTable,...addressTable];
              }

              if(requestCanceled === true) {
                  setRequestCanceled2(true);
                  break;
              }

              reqNum += addressTable.length;
              count++;

              showLeftTime(startDate,reqNum,totalQty);
          }

          callback({resultCode:0, data:{completeAddressList:transferCompleteAddressTable}, message:""});
        };
        
        fetchData();
    },[shown]);

    if(shown === undefined || shown === false) {
        return null;
    }

    return (
      <Modal onClose={null}>
        <commonStyled.StWrapper>
          <StTitlePanel>
            <p>ERC20 토큰 전송중</p>
          </StTitlePanel>
          <StBodyPanel>
            <div id='content'>
            {stateContent}
            <br />
            <p>{leftTime}</p>
            </div>
          </StBodyPanel>
          <StButtonGroupPanel>
            <div id='button-group'>
                    <Button1 bgColor='var(--btn-confirm-color)' disable width='8vw' height='2.5vw' onClick={(e)=>onCancelButtonClick(e)}>취소</Button1>
                </div>
          </StButtonGroupPanel>
        </commonStyled.StWrapper>
      </Modal>
    );
  };
  
  export default TokenTransferStatePopup;