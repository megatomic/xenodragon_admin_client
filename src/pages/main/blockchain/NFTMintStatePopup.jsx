import React,{useState,useEffect,useRef} from 'react';
import styled from 'styled-components';
import * as commonStyled from '../../../styles/commonStyles';
import * as constants from '../../../common/constants';

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

async function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

const NFTMintStatePopup = ({shown,paramInfo,callback,cancelClick}) => {

    const setBackground = '';

    const {startLoading, setStartLoading} = useCommon();
    const {nftInfo, requestMintNFT} = useNFT();
    const [stateContent,setStateContent] = useState('');
    const [requestCanceled,setRequestCanceled] = useState(false);
    const [requestCanceled2,setRequestCanceled2] = useState(false);
  
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

    useEffect(() => {
        const fetchData = async () => {

            if(shown === undefined || shown === false) {
            return;
            }

            const packageType = paramInfo.packageType;
            const packageIDTable = paramInfo.packageIDTable;
            const targetAddress = paramInfo.mintingInfoList[0].targetAddress;
            const tempList = [...paramInfo.mintingInfoList[0].tokenIDList];
            const mintingInterval = paramInfo.mintingInterval * 1000;

            let bucketCount = 0;
            let bucketInfo = null;
            const tokenIDBucketList = [];
            for(let i=0;i<tempList.length;i++) {
                if(bucketCount === 0) {
                    bucketInfo = [];
                    tokenIDBucketList.push(bucketInfo);
                }

                bucketInfo.push(tempList[i]);
                bucketCount++;

                if(bucketCount >= paramInfo.mintTokenMaxPerReq) {
                    bucketCount = 0;
                }
            }

            console.log('##### mintTokenMaxPerReq=',paramInfo.mintTokenMaxPerReq,', tokenIDBucketList.length=',tokenIDBucketList.length);

            let reqGroupID = paramInfo.groupID;
            let reqNum=paramInfo.mintTokenMaxPerReq*paramInfo.startIndex;
            let count = 0;
            for await (let tokenIDBucket of tokenIDBucketList) {
                if(count >= paramInfo.startIndex) {
                  setStateContent(`NFT 민팅 처리중...(${reqNum}/${paramInfo.mintingInfoList[0].tokenIDList.length})`);

                  const resultInfo2 = await requestMintNFT({logID:paramInfo.logID,finalReq:(count+1 >= tokenIDBucketList.length ? true:false),reqGroupID, packageType, packageIDTable, activityType:constants.NFT_ACTIVITYTYPE_MINTING, desc:paramInfo.mintingComment, mintingCount:paramInfo.newMintingCount, mintingInfoList:[{targetAddress,tokenIDList:tokenIDBucket}], tokenGenData:JSON.stringify(paramInfo.attrIDQtyPairList), totalMintingNum:tempList.length});
  
                  //const resultInfo2 = await requestGenerateNFTAttributes({type:idQtyPair.type,groupID:reqGroupID,mintingCount:paramInfo.mintingCount,attrIDQtyPairList:[idQtyPair],restartMintingCount});
                  
                  console.log(resultInfo2);
  
                  if(resultInfo2.resultCode !== 0) {
                      resultInfo2.data = {mintingStopped:true,mintedTokenIDList:[...tokenIDBucket]};
                      callback(true,resultInfo2);
                      return;
                  }
                  if(requestCanceled === true) {
                      setRequestCanceled2(true);
                      break;
                  }
  
                  reqNum += tokenIDBucket.length;
                  callback(false,{resultCode:0,message:"",data:tokenIDBucket});

                  if(mintingInterval > 0) {
                    await sleep(mintingInterval);
                  }
                }

                count++;
            }

            callback(true,{resultCode:0, data:null, message:""});
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
            <p>NFT 민팅 처리중</p>
          </StTitlePanel>
          <StBodyPanel>
            <div id='content'>
            {stateContent}
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
  
  export default NFTMintStatePopup;