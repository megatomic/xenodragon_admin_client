import React,{useState,useEffect,useRef} from 'react';
import styled from 'styled-components';
import * as commonStyled from '../../../styles/commonStyles';

import useCommon from '../../../store/useCommonStorageManager';
import useMessage from '../../../store/useMessageDataManager';

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

const SendStatePopup = ({shown,requestID,callback,cancelClick}) => {

    const setBackground = '';
    const { requestPushMessageState } = useMessage();
    const [stateContent,setStateContent] = useState('');
  
    const timerTick = async () => {
        if(shown !== undefined && shown === true) {
            const resultInfo = await requestPushMessageState(requestID);
            
            console.log('resultInfo=',resultInfo);

            if(resultInfo.resultCode !== 0) {
              setStateContent("푸쉬메세지 서버가 바빠서 현재 요청을 처리할 수 없습니다.");
              setTimeout(()=> {
                callback({resultCode:resultInfo.resultCode,message:resultInfo.message,data:null});
              },500);

            } else {
              if(resultInfo.data !== null) {
                let content = "푸쉐메세지 전송이 완료되었습니다.";
                if(resultInfo.data.count < resultInfo.data.total) {
                    content = `푸쉬메세지 전송중... ${resultInfo.data.count}/${resultInfo.data.total} (실패한 갯수:${resultInfo.data.fail})`;
                }
                
                setStateContent(content);

                if(resultInfo.data.code > 0 || resultInfo.data.count >= resultInfo.data.total) {
                    setTimeout(()=> {
                        callback({resultCode:0, message:"", data:null});
                    },500);
                }
            }
            }
        } else {
          console.log("haha");
        }
    };

    useInterval(timerTick,1000);

    const onCancelButtonClick = (e) => {

        clearInterval(intervalTimerID);
        cancelClick(e);
    };

    if(shown === undefined || shown === false) {
        return null;
    }

    return (
      <Modal onClose={null}>
        <commonStyled.StWrapper>
          <StTitlePanel>
            <p>푸쉬메세지 전송중</p>
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
  
    return <p></p>;
  };
  
  export default SendStatePopup;