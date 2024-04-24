import React,{useState,useEffect,useRef} from 'react';
import styled from 'styled-components';
import * as contentStyled from '../pages/main/MainContentStyles';
import * as commonStyled from '../styles/commonStyles';
import dayjs from 'dayjs';
import * as constants from '../common/constants';
import Modal from './Modal';
import Button1 from './Button1';
import InputField1 from './InputField1';

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

const ReleaseNotePopup = (props) => {

    const [otpCodeTable, setOTPCodeTable] = useState([]);
    const [otpCode, setOTPCode] = useState('');

    const input1 = useRef(null);
    const input2 = useRef(null);
    const input3 = useRef(null);
    const input4 = useRef(null);
    const input5 = useRef(null);
    const input6 = useRef(null);
    const inputTable = [input1,input2,input3,input4,input5,input6];

    const onOTPCodeInputValueChange = (e,idx) => {

      //input2.current.focus();
    };

    const onKeyDown = (e,index) => {

      console.log('key=',e);

      if(e.key === 'enter') {

      } else if(e.key === 'Backspace') {
        if(index >= 0) {
          const table = [...otpCodeTable];
          for(let i=5;i>=index;i--) {
            table[i] = '';
          }
    
          setOTPCodeTable(table);

          if(index > 0) {
            inputTable[parseInt(index)-1].current.focus();
          }
        }

      } else {
        if(index <= 5) {
          const table = [...otpCodeTable];
          table[index] = parseInt(e.key)%10;
    
          setOTPCodeTable(table);
    
          if(index < 5) {
            inputTable[index+1].current.focus();
          }
        }
      }
    };

    useEffect(() => {

      setOTPCodeTable(["","","","","",""]);
      setOTPCode('');
      
      if(input1.current !== null) {
        input1.current.focus(); 
      }
    },[props.shown]);

    useEffect(() => {
      let otp = "";
      for(let code of otpCodeTable) {
        otp += code;
      }
      setOTPCode(otp);

    },[otpCodeTable]);

    if(props.shown === undefined || props.shown === false) {
      
        return null;
    } else {
    }

    return (
      <Modal onClose={null}>
        <commonStyled.StWrapper width='26vw' minHeight='17vw'>
          <StTitlePanel>
            <p>OTP 입력창</p>
          </StTitlePanel>
          <StBodyPanel>
            <contentStyled.SettingGroupArea leftMargin="0vw" width="90%">
              <contentStyled.SettingItemArea leftMargin='0vw' bottomMargin='0vw' itemMarginRight='1vw'>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <div id="item-part1" style={{ width:'90%', verticalAlign: 'middle', color:'var(--primary-color)', fontWeight:'bold' }}>
                      <p>OTP 코드 6자리를 입력하세요.</p>
                      <br />
                      <div style={{textAlign:"center"}}>
                      <InputField1 responsive='1.6' type="number" ref={input1} width="1.8vw" height="2.5vw" style={{fontSize:"1vw",justifyContent:"center"}} value={otpCodeTable[0]} onKeyDown={(e)=>onKeyDown(e,0)} readOnly={true} onChange={(e)=>onOTPCodeInputValueChange(e,0)} />
                      <InputField1 responsive='1.6' type="number" ref={input2} width="1.8vw" height="2.5vw" style={{fontSize:"1vw",justifyContent:"center"}} value={otpCodeTable[1]} onKeyDown={(e)=>onKeyDown(e,1)} readOnly={true} onChange={(e)=>onOTPCodeInputValueChange(e,1)} />
                      <InputField1 responsive='1.6' type="number" ref={input3} width="1.8vw" height="2.5vw" style={{fontSize:"1vw",justifyContent:"center"}} value={otpCodeTable[2]} onKeyDown={(e)=>onKeyDown(e,2)} readOnly={true} onChange={(e)=>onOTPCodeInputValueChange(e,2)} />
                      &nbsp;-&nbsp;
                      <InputField1 responsive='1.6' type="number" ref={input4} width="1.8vw" height="2.5vw" style={{fontSize:"1vw",justifyContent:"center"}} value={otpCodeTable[3]} onKeyDown={(e)=>onKeyDown(e,3)} readOnly={true} onChange={(e)=>onOTPCodeInputValueChange(e,3)} />
                      <InputField1 responsive='1.6' type="number" ref={input5} width="1.8vw" height="2.5vw" style={{fontSize:"1vw",justifyContent:"center"}} value={otpCodeTable[4]} onKeyDown={(e)=>onKeyDown(e,4)} readOnly={true} onChange={(e)=>onOTPCodeInputValueChange(e,4)} />
                      <InputField1 responsive='1.6' type="number" ref={input6} width="1.8vw" height="2.5vw" style={{fontSize:"1vw",justifyContent:"center"}} value={otpCodeTable[5]} onKeyDown={(e)=>onKeyDown(e,5)} readOnly={true} onChange={(e)=>onOTPCodeInputValueChange(e,5)} />
                      </div>
                      </div>
              </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
          </StBodyPanel>
          <StButtonGroupPanel>
            <div id='button-group'>
                <Button1 bgColor='var(--btn-confirm-color)' disable width='8vw' height='2.5vw' onClick={(e)=>props.onButtonClick(e,0,{otpCode})}>확인</Button1>
                <Button1 bgColor='var(--btn-secondary-color)' disable width='8vw' height='2.5vw' onClick={(e)=>props.onButtonClick(e,1,{otpCode})}>취소</Button1>
            </div>
          </StButtonGroupPanel>
        </commonStyled.StWrapper>
      </Modal>
    );
  };
  
  export default ReleaseNotePopup;