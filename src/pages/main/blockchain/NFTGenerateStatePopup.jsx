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

const NFTGenerateStatePopup = ({shown,paramInfo,callback,cancelClick}) => {

    const setBackground = '';

    const {startLoading, setStartLoading} = useCommon();
    const {nftInfo, requestGenerateNFTAttributes} = useNFT();
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

    useEffect(() => {
        const fetchData = async () => {

          if(shown === undefined || shown === false) {
            return;
          }

          totalPackageIDTable = [];
          packageIDTable = [];

          let reqGroupID = paramInfo.groupID;
          let genNum = 0;
          const idQtyPairList = [];
          const resultInfo = {resultCode:0, message:"", data:null};
          let totalQty = 0;
          for(let mintItem of paramInfo.mintingItemTable) {
              idQtyPairList.push({attributeID:mintItem[2],type:mintItem[4],qty:parseInt(mintItem[3]),grade:mintItem[1]});
              totalQty += parseInt(mintItem[3]);
          }
  
          let count=1;
          let restartMintingCount = true;
          let startDate = dayjs();
          let curDate = dayjs();
          let packageStart=true;
          const tokenIDItemIDPairTable = [];
          let logID = -1;
          for await (let idQtyPair of idQtyPairList) {

              if(idQtyPair.type.toUpperCase() === 'DRAGON') {
                packageIDTable = [];
                packageStart = true;
              }
              setStateContent(`속성(ID:${idQtyPair.attributeID},수량:${idQtyPair.qty}) 생성요청중...(${count}/${idQtyPairList.length})`);
              const resultInfo2 = await requestGenerateNFTAttributes({finalReq:(count >= idQtyPairList.length ? true:false),type:idQtyPair.type,groupID:reqGroupID,packageType:paramInfo.packageType,packageIDTable,mintingCount:paramInfo.mintingCount,attrIDQtyPairList:[idQtyPair],totalAttrIDQtyPairList:(count>=idQtyPairList.length?idQtyPairList:[]),restartMintingCount,desc:paramInfo.mintingComment,totalTokenNum:totalQty});
              
              console.log(resultInfo2);

              if(resultInfo2.resultCode !== 0) {
                  callback(resultInfo2);
                  return;
              } else {
                if(count >= idQtyPairList.length) {
                  logID = resultInfo2.data.logID;
                }

                for(let tokenID of resultInfo2.data.tokenIDListTable[0].tokenIDList) {
                  tokenIDItemIDPairTable.push([tokenID,resultInfo2.data.tokenIDListTable[0].attributeID]);
                }

                packageIDTable = [...resultInfo2.data.packageIDTable];
                if(packageStart === true) {
                  totalPackageIDTable = [...totalPackageIDTable,...packageIDTable];
                }

                console.log('packageIDTable=',JSON.stringify(totalPackageIDTable,null,2));
              }
              if(requestCanceled === true) {
                  setRequestCanceled2(true);
                  break;
              }

              reqGroupID = resultInfo2.data.reqGroupID;
              genNum += resultInfo2.data.totalNum;

              restartMintingCount = false;
              count++;

              showLeftTime(startDate,genNum,totalQty);
              packageStart = false;
          }

          resultInfo.data = {logID,reqGroupID,totalNum:genNum,idQtyPairList,packageIDTable:totalPackageIDTable,tokenIDItemIDPairTable};
          callback(resultInfo);
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
            <p>NFT속성정보 생성중</p>
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
  
  export default NFTGenerateStatePopup;