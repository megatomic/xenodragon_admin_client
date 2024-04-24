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

const NFTTransferStatePopup = ({shown,paramInfo,callback,cancelClick}) => {

    const setBackground = '';

    const {startLoading, setStartLoading} = useCommon();
    const {nftInfo, requestTransferNFT} = useNFT();

    const [stateContent,setStateContent] = useState('');
    const [requestCanceled,setRequestCanceled] = useState(false);
    const [requestCanceled2,setRequestCanceled2] = useState(false);

    const [targetAddressContent, setTargetAddressContent] = useState('');

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

          console.log('paramInfo.tokenInfoList=',paramInfo.tokenInfoList);
          
          let totalTokenNumToTransfer = 0;
          for(let tokenInfo of paramInfo.tokenInfoList) {
            totalTokenNumToTransfer += tokenInfo.tokenIDList.length;
          }

          const sourceType = paramInfo.sourceType;
          const groupID = paramInfo.groupID;
          const sourceAddress = paramInfo.sourceAddress;
          const targetContractAddress = paramInfo.targetContractAddress;
          const comment = paramInfo.comment;
          const itemInfoList = paramInfo.itemInfoList;
          const packageIDTable = paramInfo.packageIDTable;
          const marketTrigger = paramInfo.marketTrigger;
          

          //console.log('paramInfo.tokenInfoList=',paramInfo.tokenInfoList);

          let bucketCount = 0;
          let bucketInfo = null;
          const tokenIDBucketList = [];

          for(let tokenInfo of paramInfo.tokenInfoList) {
            if(tokenInfo.tokenIDList.length > paramInfo.transNumUnit) {
              for(let i=0;i<tokenInfo.tokenIDList.length;i++) {
                if(bucketCount === 0) {
                    bucketInfo = [];
                    tokenIDBucketList.push({targetAddress:tokenInfo.targetAddress, tokenIDList:bucketInfo});
                }
  
                bucketInfo.push(tokenInfo.tokenIDList[i]);
                bucketCount++;
  
                if(bucketCount >= paramInfo.transNumUnit) {
                    bucketCount = 0;
                }
              }
            } else {
              tokenIDBucketList.push(tokenInfo);
            }
          }

          //console.log('tokenIDBucketList=',tokenIDBucketList);

          let reqNum=0;
          let count = 0;
          for await (let tokenIDBucket of tokenIDBucketList) {

              setStateContent(`NFT 전송 처리중...(${reqNum}/${totalTokenNumToTransfer})`);
              setTargetAddressContent(tokenIDBucket.targetAddress);
              const resultInfo2 = await requestTransferNFT({finalReq:(count+1 >= tokenIDBucketList.length ? true:false),packageIDTable, sourceType, groupID, sourceAddress,targetContractAddress,targetAddress:tokenIDBucket.targetAddress,comment,tokenIDList:tokenIDBucket.tokenIDList,itemInfoList,marketTrigger:marketTrigger,totalTransferNum:totalTokenNumToTransfer});
              
              console.log(resultInfo2);

              if(resultInfo2.resultCode !== 0) {
                  callback(resultInfo2);
                  return;
              }
              if(requestCanceled === true) {
                  setRequestCanceled2(true);
                  break;
              }

              reqNum += tokenIDBucket.tokenIDList.length;
              count++;
          }

          callback({resultCode:0, data:null, message:""});
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
            <p>NFT 전송중</p>
          </StTitlePanel>
          <StBodyPanel>
            <div id='content'>
            {stateContent}
            <br />
            {"대상주소:"+targetAddressContent}
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
  
  export default NFTTransferStatePopup;