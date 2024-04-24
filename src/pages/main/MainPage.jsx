import React,{useState,useEffect,useCallback,useRef,useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import MediaQuery from 'react-responsive';
import useCommon from '../../store/useCommonStorageManager';
import useAuth from '../../store/useAuthDataManager';

import { TestContextStore } from '../../contexts/TestContext';
import {ToastContainer, toast, Slide} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/toastify.css';

import * as constants from '../../common/constants';
import * as styled from './MainPageStyles';
import Button1 from '../../components/Button1';
import Popup from '../../components/Popup';
import DropBox from '../../components/DropBox';
import LoadingPopup from '../../components/LoadingPopup';

import AccountManageContainer from './accounts/AccountManageContainer';
import UserManageContainer from './users/UserManageContainer';
import NotificationManageContainer from './notifications/NotificationManageContainer';
import MessageManageContainer from './messages/MessageManageContainer';
import EventManageContainer from './events/EventManageContainer';
import LogViewContainer from './logs/LogViewContainer';
import ToolManageContainer from './tools/ToolManageContainer';
import SettingsContainer from './settings/SettingsContainer';
import BlockchainContainer from './blockchain/BlockchainContainer';
import { css } from 'styled-components';

const mainMenuTable = [
  {id:1,name:'계정 관리'},
  {id:2,name:'유저 관리'},
  {id:3,name:'공지사항'},
  {id:4,name:'메세지'},
  {id:5,name:'이벤트'},
  {id:6,name:'통계/로그'},
  {id:7,name:'도구'},
  {id:8,name:'설정'},
  {id:9,name:'블록체인'}
];

const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
      savedCallback.current = callback;
  });

  useEffect(() => {
      const tick = () => {
          savedCallback.current();
      }

      const timerId = setInterval(tick, delay);
      return () => clearInterval(timerId);
  }, [delay]);
};

const MainPage = () => {

  const TestInfo = useContext(TestContextStore);
  //console.log(`TestInfo.name=${TestInfo?.name}`);

  const {authInfo} = useAuth();

  const navigate = useNavigate();

  const warningMessage = '현재 계정으로 사용할 수 없는 기능입니다.'
  const {startLoading,serverType,resetClockTimer, setResetClockTimer} = useCommon();
  const [activeMenuID, setActiveMenuID] = useState(1);
  const [popupContent, setPopupContent] = useState('');
  const [popupShown, setPopupShown] = useState(false);
  const [timerVal, setTimerVal] = useState(0);
  const [clockVal, setClockVal] = useState(authInfo.tokenExpireTime);

  const TIMEOUT = 10;//1800;

  //console.log("[MainPage] accountInfo=",authInfo.accountInfo);
  
  const onBackgroundClick = (e) => {

  };

  const onMainMenuClick = (e,menuID) => {
    setActiveMenuID(menuID);
  };

  const onLogoutClick = (e) => {
    navigate('/login');

    //window.open('https://www.naver.com','새창','top=500,left=500,width=400,height=400');
  };

  const onPopupButtonClick = async (buttonIdx) => {

    onPopupCloseButtonClick();
    navigate("/login");
  };

  const onPopupCloseButtonClick = () => {
    setPopupShown(false);
  };

  const makeClockString = (time) => {
    const hour = Math.floor(time/3600);
    const min = Math.floor((time - hour*3600)/60);
    const sec = Math.floor(time%60);

    let str = "";
    if(hour >= 10) {
      str = hour;
    } else {
      str = "0"+hour;
    }

    if(min >= 10) {
      str += ":" + min;
    } else {
      str += ":0"+ min;
    }

    if(sec >= 10) {
      str += ":" + sec;
    } else {
      str += ":0" + sec;
    }

    return str;
  };

  const clockTimerTick = () => {
    if(clockVal <= 0) {
      clearInterval(timerVal);

      if(authInfo.tokenExpireTime >= 3600) {
        setPopupContent(`${Math.floor(authInfo.tokenExpireTime/3600)}시간동안 사용하지 않아 자동으로 로그아웃됩니다.`);
      } else if(authInfo.tokenExpireTime >= 60) {
        setPopupContent(`${Math.floor(authInfo.tokenExpireTime/60)}분동안 사용하지 않아 자동으로 로그아웃됩니다.`);
      } else {
        setPopupContent(`${Math.floor(authInfo.tokenExpireTime)}초동안 사용하지 않아 자동으로 로그아웃됩니다.`);
      }
      setPopupShown(true);
      return;
    }

    if(resetClockTimer === true) {
      setClockVal(authInfo.tokenExpireTime);
      setResetClockTimer(false);
    } else {
      setClockVal(clockVal-1);
    }
  };

  useInterval(clockTimerTick,1000);

  if(authInfo.accountInfo === null || authInfo.accountInfo === undefined) {
    onLogoutClick(null);
    return;
  }

  return (
    <>
    <styled.MainPageWrapper onClick={(e)=>onBackgroundClick(e)}>
      <styled.MainFormPanel>
        <styled.MainHeaderPanel>
          <div className='deco'></div>
          <div className='header'>
          <styled.MainMenuPanel>
            <styled.MainTitlePanel>
            <p id='title'>&nbsp;&nbsp;Xeno Dragon 운영툴</p>
            <p id='ver'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;버전 {constants.TOOL_VERSION}&nbsp;(&nbsp;<span style={serverType==='live'?{color:'#ff7856ff'}:{color:'#ffffff'}}>{serverType.toUpperCase()}</span>&nbsp;)</p>
            </styled.MainTitlePanel>
            <MediaQuery maxWidth={768}>
              <DropBox width='37vw' height='6vw' text={mainMenuTable[0].name} fontSize='2vw' fontColor='#ffffff' itemList={mainMenuTable} menuItemClick={(item)=>onMainMenuClick(null,item.id)} />
            </MediaQuery>
            <MediaQuery minWidth={769}>
              {mainMenuTable.map((menuItem,idx) => {
                return (<styled.MainMenuItem key={idx} className={`menu${menuItem.id}`} active={activeMenuID === menuItem.id ? true : false} onClick={(e) => onMainMenuClick(e,menuItem.id)}><p>{menuItem.name}</p></styled.MainMenuItem>)
              })}
            </MediaQuery>
            <span className='login-info'>
              <div style={{position:'absolute',right:'9vw',top:'3.3vw',color:'#ffffff4f'}}>
                {makeClockString(clockVal)}
              </div>
              <span>
                {authInfo.loginID+`(${authInfo.accountInfo.accountNick})`}
              </span>
              <MediaQuery maxWidth={768}>
                <Button1 responsive='1.7' bgColor='var(--btn-secondary-color)' width='5vw' height='2.4vw' onClick={(e)=>onLogoutClick(e)}>로그아웃</Button1>
              </MediaQuery>
              <MediaQuery minWidth={769}>
                <Button1 bgColor='var(--btn-secondary-color)' width='6vw' height='2vw' onClick={(e)=>onLogoutClick(e)}>로그아웃</Button1>
              </MediaQuery>
              
            </span>
          </styled.MainMenuPanel>
          </div>
        </styled.MainHeaderPanel>
        <div className='content'>
        {activeMenuID === 1 && <AccountManageContainer />}
          {activeMenuID === 2 && <UserManageContainer />}
          {activeMenuID === 3 && <NotificationManageContainer />}
          {activeMenuID === 4 && <MessageManageContainer />}
          {activeMenuID === 5 && <EventManageContainer />}
          {activeMenuID === 6 && <LogViewContainer />}
          {activeMenuID === 7 && <ToolManageContainer />}
          {activeMenuID === 8 && <SettingsContainer />}
          {activeMenuID === 9 && <BlockchainContainer />}
        </div>
      </styled.MainFormPanel>
    </styled.MainPageWrapper>
    <Popup shown={popupShown} popupTypeInfo={{type:'Confirm',button1Text:'확인',button2Text:''}} title='알림' content={popupContent} buttonClick={(buttonNo)=>onPopupButtonClick(buttonNo)} closeClick={onPopupCloseButtonClick} />
    <LoadingPopup shown={startLoading} />
    <ToastContainer position='top-center' autoClose={2000} transition={Slide} hideProgressBar={true} theme='light' limit={1} />
    </>
  );
};

export default MainPage;
