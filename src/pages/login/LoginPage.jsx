import React, {useState,useRef,useContext,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import {ToastContainer, toast, Slide} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useCommon from '../../store/useCommonStorageManager';
import useAuth from '../../store/useAuthDataManager';

import * as styled from './LoginPageStyles';
import Button1 from '../../components/Button1';
import InputField1 from '../../components/InputField1';
import CheckBox from '../../components/CheckBox';
import DropBox from '../../components/DropBox';

import * as constants from '../../common/constants';
import * as Utils from '../../common/Utils';
import LoadingPopup from '../../components/LoadingPopup';
import { TestContextStore } from '../../contexts/TestContext';

export const serverTable = [
  {id:1, name:'내부 서버', code:'local'},
  {id:2, name:'내부 QA 서버', code:'qa'},
  {id:3, name:'리뷰 서버', code:'review'},
  {id:4, name:'LIVE 서버', code:'live'}
];

const saveID = (window.localStorage.getItem("__save_id__")!=="null" ? window.localStorage.getItem("__save_id__"):"");
const savePW = (window.localStorage.getItem("__save_pw__")!=="null" ? window.localStorage.getItem("__save_pw__"):"");
console.log('saveID=',window.localStorage.getItem("__save_id__"));

const LoginPage = () => {

  const TestInfo = useContext(TestContextStore);
  //console.log(`TestInfo.name=${TestInfo.name}`);

  const {startLoading, setStartLoading, serverType, setServerType} = useCommon();

  const inputRef1 = useRef(null);
  const inputRef2 = useRef(null);

  const navigate = useNavigate();
  const {authInfo, requestLogin, requestLogout} = useAuth();
  const [serverIndex, setServerIndex] = useState(0);
  const [loginID, setLoginID] = useState(saveID!=="null"?saveID:"");
  const [loginPW, setLoginPW] = useState(savePW!=="null"?savePW:"");
  const [saveIDFlag, setSaveIDFlag] = useState((saveID!==""&&saveID!=="null")?true:false);

  const onServerTypeItemClick = (item) => {

    setServerIndex(item.id-1);
  };

  const onLoginIDChanged = (e) => {
    setLoginID(e.target.value);
  };

  const onLoginPWChanged = (e) => {
    setLoginPW(e.target.value);
  };

  const onLoginButtonClick = async (e) => {

    console.log('serverType=',serverType);

    setStartLoading(true);
    const result = await requestLogin(loginID, loginPW);

    console.log('[LOGIN] result=',result);

    if(result.logined === false) {
      toast.error(result.message);
    } else {
      if(saveIDFlag === true) {
        window.localStorage.setItem("__save_id__",loginID);
        window.localStorage.setItem("__save_pw__",loginPW);
      } else {
        window.localStorage.setItem("__save_id__",null);
        window.localStorage.setItem("__save_pw__",null);
      }

      navigate('/main');
    }
    setStartLoading(false);
  };

  const onSignUpButtonClick = (e) => {
    TestInfo.setName('baledrone');
  };

  const onKeyPress = (e,index) => {
    if(e.key === 'Enter') {
      if(index === 0) {
        inputRef2.current.focus();
      } else {
        onLoginButtonClick(e);
      }
    }
  };

  const onSaveIDCheckChanged = (e) => {
    setSaveIDFlag(e.target.checked);
    if(e.target.checked === false) {
      setLoginID('');
      setLoginPW('');
      window.localStorage.setItem("__save_id__",null);
      window.localStorage.setItem("__save_pw__",null);
    }
  };

  useEffect(() => {
    setServerType(serverTable[serverIndex].code);
  },[serverIndex]);

  return (
    <styled.LoginPageWrapper>
      <styled.LoginFormPanel>
        <styled.LoginHeader>
          <p className="title">Xeno Dragon 운영툴</p>
          <p className="subtitle">버전 {constants.TOOL_VERSION} ({serverType.toUpperCase()})</p>
          <div className="tail">
            &nbsp;
          </div>
        </styled.LoginHeader>
        <styled.LoginContent>
          <p className="loginText">로그인</p>
          <styled.InputArea>
            <span className="row1">
              <label>서버</label>
              <label>계정ID</label>
              <label>비밀번호</label>
            </span>
            <span className="row2">
              <DropBox responsive='3.4' width='12vw' height='2vw' style={{marginBottom:'0.15vw'}} fontSize='0.6vw' text={serverTable[serverIndex].name} itemList={serverTable} menuItemClick={(item)=>onServerTypeItemClick(item)} />
              <InputField1 responsive='3.4' width='12vw' height='2vw' placeholder={'4자이상 20자 미만'} value={loginID} onChange={(e)=>onLoginIDChanged(e)} onKeyPress={(e)=>onKeyPress(e,0)} ref={inputRef1} />
              <InputField1 responsive='3.4' type='password' width='12vw' height='2vw' placeholder={'대소문자, 영숫자 및 특수기호 조합'} value={loginPW} onChange={(e)=>onLoginPWChanged(e)} onKeyPress={(e)=>onKeyPress(e,1)} ref={inputRef2} />
            </span>
            <span className="row3">&nbsp;</span>
          </styled.InputArea>
          <CheckBox checked={saveIDFlag} checkChanged={(e) => onSaveIDCheckChanged(e)} text={'아이디 저장'} fontSize={'0.7vw'} checkColor={'var(--primary-color)'} />
          <br />
          <Button1 responsive='3.5' bgColor='var(--btn-primary-color)' width='12vw' height='2vw' onClick={(e)=>onLoginButtonClick(e)}>로그인</Button1>
          <Button1 responsive='3.5' bgColor='var(--btn-secondary-color)' width='12vw' height='2vw' onClick={(e)=>onSignUpButtonClick(e)}>회원가입</Button1>
          <styled.LinkText href="">ID 또는 비밀번호 찾기</styled.LinkText>
        </styled.LoginContent>
      </styled.LoginFormPanel>
      <LoadingPopup shown={startLoading} />
      <ToastContainer position='top-center' autoClose={2000} transition={Slide} hideProgressBar={true} theme='light' limit={1} />
    </styled.LoginPageWrapper>
  );
};

export default LoginPage;
