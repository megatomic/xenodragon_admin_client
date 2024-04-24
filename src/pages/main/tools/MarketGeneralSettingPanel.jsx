import React, { useState, useEffect, useRef, forwardRef, useCallback } from 'react';
import MediaQuery from 'react-responsive';
import BigNumber from '../../../common/js/bignumber';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

import styled, { css } from 'styled-components';
import * as contentStyled from '../MainContentStyles';
import * as commonStyled from '../../../styles/commonStyles';

import * as utils from '../../../common/js/utils';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import RadioGroup from '../../../components/RadioGroup';
import Table from '../../../components/Table';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useTool from '../../../store/useToolDataManager';
import useNFT from '../../../store/useNFTDataManager';
import ResultCode from '../../../common/constants';

const DatePickerInput = forwardRef((props) => {
  return <InputField1 responsive="1.3" width="9vw" height="2vw" {...props} />;
});

const checkValidReservationDate = (startTime, endTime) => {
  const startDate = dayjs(utils.makeDateTimeStringFromDate(startTime));
  const endDate = dayjs(utils.makeDateTimeStringFromDate(endTime));
  let curDate = dayjs();

  if (endDate.isBefore(startDate.add(29, 'minute')) === true) {
    toast.error('점검종료 일자는 시작일자보다 30분 이후이어야 합니다.');
  }
};

const RECNUM_PERPAGE = 10;
const titleText = '마켓 일반 설정';
const tableHeaderInfo = [
    '',
    '유저ID',
    '닉네임',
    '지갑주소',
    '활성여부',
    '상태변경',
  ];
const tableHSpaceTable = '0.4fr 0.8fr 1.0fr 2.0fr 0.6fr 0.7fr';

const tableButton1 = `__button={"name":"변경","bgColor":"var(--btn-primary-color)","width":"4vw","height":"1.6vw","tag":"${1}"}`;
const whiteuserList = [
    ['__checkbox','asdfasdf','megatomic','0x89238459234539485793754345345','활성',tableButton1]
];

const makeTableFromList = (whiteList) => {

    const result = whiteList.map((whiteInfo, idx) => {
      return ['__checkbox', whiteInfo.uid, whiteInfo.name, whiteInfo.walletAddress, (whiteInfo.isActive===true?"활성":"비활성"), `__button={"name":"변경","bgColor":"var(--btn-primary-color)","width":"4vw","height":"1.6vw","tag":"${idx}"}`];
    });
  
    return result;
  };

const MarketGeneralSettingPanel = (props) => {
  const { startLoading, setStartLoading } = useCommon();
  const {
    requestMarketDownloadInfoQuery,
    requestMarketDownloadInfoUpdate,
    requestMarketMaintenanceInfoQuery,
    requestMarketMaintenanceInfoUpdate,
    requestMarketWhitelistInfoQuery,
    requestMarketNewWhiteUser,
    requestMarketWhiteUserStateChange
  } = useTool();

  const [lastUpdateTime, setLastUpdateTime] = useState('');
  const [apkDownloadURL, setAPKDownloadURL] = useState('');
  const [iosMarketURL, setIOSMarketURL] = useState('');
  const [androidMarketURL, setAndroidMarketURL] = useState('');

  const [marketMaintenanceState, setMarketMaintenanceState] = useState(false);
  const [marketMaintenanceTitle, setMarketMaintenanceTitle] = useState('');
  const [marketMaintenanceContent, setMarketMaintenanceContent] = useState('');

  const [whitelistInfo, setWhitelistInfo] = useState([]);
  const [newWhiteUserInfo, setNewWhiteUserInfo] = useState('');

  const [startTime, setStartTime] = useState(new Date(Date.now() + 10 * 60000));
  const [endTime, setEndTime] = useState(
    new Date(startTime.getTime() + 40 * 60000)
  );

  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  const [popupShown, setPopupShown] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [popupID, setPopupID] = useState('');
  const [subMenuOpen, setSubMenuOpen] = useState(false);

  const onPageNoClick = useCallback((event, pageNo) => {
    return true;
  });

  const onGotoFirstPageClick = useCallback((event) => {
    return true;
  });

  const onGotoPrevPageClick = useCallback((event) => {
    return true;
  });

  const onGotoNextPageClick = useCallback((event) => {
    return true;
  });

  const onGotoLastPageClick = useCallback((event) => {
    return true;
  });

  const onChangeStateButtonClick = async (e,tag) => {

    console.log('tag=',tag);

    setStartLoading(true);
    await requestMarketWhiteUserStateChange({userID:whitelistInfo[tag].uid,activationFlag:!whitelistInfo[tag].isActive});
    await reloadMarketWhiteListInfo();
    setStartLoading(false);
};

const onNewWhiteUserInfoValueChange = (e) => {
    setNewWhiteUserInfo(e.target.value);
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen((state) => !subMenuOpen);
  };

  const onRegisterNewWhiteUserButtonClick = async (e) => {

    const userInfo = newWhiteUserInfo.trim();
    setStartLoading(true);
    const resultInfo = await requestMarketNewWhiteUser({keyword:userInfo});
    if(resultInfo.resultCode !== ResultCode.SUCCESS) {
        if(resultInfo.resultCode === 999) {
            toast.error('입력한 유저정보가 이미 화이트리스트에 존재합니다.');
        } else {
            toast.error('입력한 유저ID 또는 지갑주소로 유저를 찾을 수 없습니다.');
        }
    } else {
        toast.info('새 유저가 등록되었습니다.');
        await reloadMarketWhiteListInfo();
    }
    setStartLoading(false);
  };

  const onUpdateMarketDownloadURLInfoButtonClick = (e) => {
    setPopupContent('마켓 다운로드주소 정보를 저장하시겠습니까?');
    setPopupID('popup.download-url');
    setPopupShown(true);
  };

  const onUpdateMarketMaintenanceInfoButtonClick = (e) => {
    setPopupContent('마켓 점검 설정을 저장하시겠습니까?');
    setPopupID('popup.maintenance');
    setPopupShown(true);
  };

  const onPopupButtonClick = async (buttonIdx) => {
    if (buttonIdx === 0) {
      setTimeout(async () => {
        setStartLoading(true);

        if (popupID === 'popup.download-url') {
          const resultInfo = await requestMarketDownloadInfoUpdate({
            apkDownloadURL,
            iosMarketURL,
            androidMarketURL,
          });
          if (resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
          } else {
            toast.info('설정한 다운로드 정보가 저장되었습니다.');
          }
        } else if (popupID === 'popup.maintenance') {
          const resultInfo = await requestMarketMaintenanceInfoUpdate({
            activeFlag: marketMaintenanceState,
            startTime,
            endTime,
            title: marketMaintenanceTitle,
            content: marketMaintenanceContent,
          });
          if (resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
          } else {
            toast.info('설정한 마켓 점검 정보가 저장되었습니다.');
          }
        }

        setStartLoading(false);
        onPopupCloseButtonClick(null);
      }, 200);
    } else {
      onPopupCloseButtonClick(null);
    }
  };

  const onPopupCloseButtonClick = (e) => {
    setPopupShown(false);
  };

  const reloadMarketDownloadURLInfo = async () => {
    setStartLoading(true);
    const resultInfo = await requestMarketDownloadInfoQuery();
    if (resultInfo.resultCode !== 0) {
      toast.error(resultInfo.message);
    } else {
      const info = resultInfo.data;

      setLastUpdateTime(
        dayjs(info.timestamp).format('YYYY년MM월DD일 HH시mm분ss초')
      );
      setAPKDownloadURL(info.apkDownloadURL);
      setIOSMarketURL(info.iosMarketURL);
      setAndroidMarketURL(info.androidMarketURL);
    }
    setStartLoading(false);
  };

  const reloadMarketMaintenanceInfo = async () => {
    setStartLoading(true);
    const resultInfo = await requestMarketMaintenanceInfoQuery();
    if (resultInfo.resultCode !== 0) {
      toast.error(resultInfo.message);
    } else {
      const info = resultInfo.data;

      setMarketMaintenanceState(info.activeFlag);
      setMarketMaintenanceTitle(info.title);
      setMarketMaintenanceContent(info.content);

      setStartTime(new Date(info.startTime));
      setEndTime(new Date(info.endTime));
    }
    setStartLoading(false);
  };

  const reloadMarketWhiteListInfo = async () => {
    setStartLoading(true);
    const resultInfo = await requestMarketWhitelistInfoQuery();
    if (resultInfo.resultCode !== 0) {
      toast.error(resultInfo.message);
    } else {
      setWhitelistInfo(resultInfo.data);
    }
    setStartLoading(false);
  };

  const onAPKDownloadURLValueChange = (e) => {
    setAPKDownloadURL(e.target.value.trim());
  };

  const onIOSMarketURLValueChange = (e) => {
    setIOSMarketURL(e.target.value.trim());
  };

  const onAndroidMarketURLValueChange = (e) => {
    setAndroidMarketURL(e.target.value.trim());
  };

  const onMarketMaintenanceStateRadioButtonClick = (idx) => {
    setMarketMaintenanceState(idx === 0 ? false : true);
  };

  const onMarketMaintenanceTitleValueChange = (e) => {
    setMarketMaintenanceTitle(e.target.value);
  };

  const onMarketMaintenanceContentValueChange = (e) => {
    setMarketMaintenanceContent(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      await reloadMarketDownloadURLInfo();
      await reloadMarketMaintenanceInfo();
      await reloadMarketWhiteListInfo();
    };
    fetchData();
  }, []);

  return (
    <>
      <contentStyled.ContentWrapper>
        <contentStyled.ContentHeader subtitleWidth="20vw">
          <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;
            <i
              className="fas fa-bars"
              style={{ fontSize: '3vw' }}
              onClick={(e) => onSubMenuClick(e)}
            />
          </MediaQuery>
          <span id="subtitle">{titleText}</span>
          <span id="button">&nbsp;</span>
        </contentStyled.ContentHeader>
        <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />

        <contentStyled.ContentBody>
          <br />
          <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
            <div id="title">
              <label style={{ fontSize: '0.8vw' }}>
                <i
                  className="fas fa-stop"
                  style={{ fontSize: '0.6vw', verticalAlign: 'center' }}
                />
                &nbsp;&nbsp;게임 마켓 및 다운로드 주소&nbsp;(최근 갱신:
                {lastUpdateTime})
              </label>
              <div></div>
            </div>
            <br />
            <contentStyled.SettingItemArea bottomMargin="0vw">
              <div
                id="item-part1"
                style={{ width: '8vw', verticalAlign: 'middle' }}
              >
                <label>APK 다운로드 주소</label>
              </div>
              <div
                id="item-part2"
                style={{ width: '33vw', verticalAlign: 'middle' }}
              >
                <div>
                  <InputField1
                    responsive="1.6"
                    width="32vw"
                    height="2vw"
                    value={apkDownloadURL}
                    readOnly={false}
                    onChange={(e) => onAPKDownloadURLValueChange(e)}
                  />
                </div>
              </div>
            </contentStyled.SettingItemArea>
            <contentStyled.SettingItemArea bottomMargin="0vw">
              <div
                id="item-part1"
                style={{ width: '8vw', verticalAlign: 'middle' }}
              >
                <label>iOS 마켓 주소</label>
              </div>
              <div
                id="item-part2"
                style={{ width: '33vw', verticalAlign: 'middle' }}
              >
                <div>
                  <InputField1
                    responsive="1.6"
                    width="32vw"
                    height="2vw"
                    value={iosMarketURL}
                    readOnly={false}
                    onChange={(e) => onIOSMarketURLValueChange(e)}
                  />
                </div>
              </div>
            </contentStyled.SettingItemArea>
            <contentStyled.SettingItemArea bottomMargin="0vw">
              <div
                id="item-part1"
                style={{ width: '8vw', verticalAlign: 'middle' }}
              >
                <label>안드로이드 마켓 주소</label>
              </div>
              <div
                id="item-part2"
                style={{ width: '33vw', verticalAlign: 'middle' }}
              >
                <div>
                  <InputField1
                    responsive="1.6"
                    width="32vw"
                    height="2vw"
                    value={androidMarketURL}
                    readOnly={false}
                    onChange={(e) => onAndroidMarketURLValueChange(e)}
                  />
                </div>
              </div>
            </contentStyled.SettingItemArea>
            <contentStyled.SettingItemArea bottomMargin="0vw">
              <div
                id="item-part1"
                style={{ width: '4vw', verticalAlign: 'middle' }}
              >
                <Button1
                  responsive="1.6"
                  bgColor="var(--btn-confirm-color)"
                  width="8vw"
                  height="2vw"
                  onClick={(e) => onUpdateMarketDownloadURLInfoButtonClick(e)}
                >
                  설정하기
                </Button1>
              </div>
            </contentStyled.SettingItemArea>
          </contentStyled.SettingGroupArea>
          <br />
          <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
            <div id="title">
              <label style={{ fontSize: '0.8vw' }}>
                <i
                  className="fas fa-stop"
                  style={{ fontSize: '0.6vw', verticalAlign: 'center' }}
                />
                &nbsp;&nbsp;로비 점검설정
              </label>
              <div></div>
            </div>
            <br />
            <contentStyled.SettingItemArea bottomMargin="0vw">
              <div
                id="item-part1"
                style={{ width: '8vw', verticalAlign: 'middle' }}
              >
                <label>점검 상태</label>
              </div>
              <div
                id="item-part2"
                style={{ width: '23vw', verticalAlign: 'middle' }}
              >
                <div>
                  <RadioGroup
                    responsive="1.6"
                    initButtonIndex={marketMaintenanceState === false ? 0 : 1}
                    interMargin="0.5vw"
                    buttonWidth="6vw"
                    nameTable={['점검해제', '점검중']}
                    buttonClicked={(idx) =>
                      onMarketMaintenanceStateRadioButtonClick(idx)
                    }
                  />
                </div>
              </div>
            </contentStyled.SettingItemArea>
            <contentStyled.SettingItemArea bottomMargin="0vw">
              <div
                id="item-part1"
                style={{ width: '8vw', verticalAlign: 'middle' }}
              >
                <label>점검 기간</label>
              </div>
              <div
                id="item-part1"
                style={{ width: '3vw', verticalAlign: 'middle' }}
              >
                <label>시작일자:</label>
              </div>
              <div
                id="item-part2"
                style={{ width: '12vw', verticalAlign: 'middle' }}
              >
                <div>
                  <DatePicker
                    selected={startTime}
                    onChange={(date) => setStartTime(date)}
                    showTimeSelect
                    dateFormat="Pp"
                    timeIntervals={10}
                    customInput={<DatePickerInput ref={startInputRef} />}
                  />
                </div>
              </div>
              <div
                id="item-part1"
                style={{ width: '3vw', verticalAlign: 'middle' }}
              >
                <label>종료일자:</label>
              </div>
              <div
                id="item-part2"
                style={{ width: '10vw', verticalAlign: 'middle' }}
              >
                <div>
                  <DatePicker
                    selected={endTime}
                    onChange={(date) => setEndTime(date)}
                    showTimeSelect
                    dateFormat="Pp"
                    timeIntervals={10}
                    customInput={<DatePickerInput ref={endInputRef} />}
                  />
                </div>
              </div>
            </contentStyled.SettingItemArea>
            <contentStyled.SettingItemArea bottomMargin="0vw">
              <div
                id="item-part1"
                style={{ width: '8vw', verticalAlign: 'middle' }}
              >
                <label>점검 제목</label>
              </div>
              <div
                id="item-part2"
                style={{ width: '33vw', verticalAlign: 'middle' }}
              >
                <div>
                  <InputField1
                    responsive="1.6"
                    width="32vw"
                    height="2vw"
                    value={marketMaintenanceTitle}
                    readOnly={false}
                    onChange={(e) => onMarketMaintenanceTitleValueChange(e)}
                  />
                </div>
              </div>
            </contentStyled.SettingItemArea>
            <contentStyled.SettingItemArea bottomMargin="0vw">
              <div
                id="item-part1"
                style={{ width: '8vw', verticalAlign: 'middle' }}
              >
                <label>점검 내용</label>
              </div>
              <div
                id="item-part2"
                style={{ width: '33vw', verticalAlign: 'middle' }}
              >
                <div>
                  <InputField1
                    responsive="1.6"
                    width="32vw"
                    height="2vw"
                    value={marketMaintenanceContent}
                    readOnly={false}
                    onChange={(e) => onMarketMaintenanceContentValueChange(e)}
                  />
                </div>
              </div>
            </contentStyled.SettingItemArea>
            <contentStyled.SettingItemArea bottomMargin="0vw">
              <div
                id="item-part1"
                style={{ width: '4vw', verticalAlign: 'middle' }}
              >
                <Button1
                  responsive="1.6"
                  bgColor="var(--btn-confirm-color)"
                  width="8vw"
                  height="2vw"
                  onClick={(e) => onUpdateMarketMaintenanceInfoButtonClick(e)}
                >
                  설정하기
                </Button1>
              </div>
            </contentStyled.SettingItemArea>
          </contentStyled.SettingGroupArea>
          <br />
          <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
            <div id="title">
              <label style={{ fontSize: '0.8vw' }}>
                <i
                  className="fas fa-stop"
                  style={{ fontSize: '0.6vw', verticalAlign: 'center' }}
                />
                &nbsp;&nbsp;화이트 리스트
              </label>
              <div></div>
            </div>
            <br />
            <contentStyled.SettingItemArea bottomMargin="0vw">
              <div
                id="item-part1"
                style={{ width: '8vw', verticalAlign: 'middle' }}
              >
                <label>등록 정보</label>
              </div>
              <div
                id="item-part2"
                style={{ width: '24vw', verticalAlign: 'middle' }}
              >
                <div>
                  <InputField1
                    responsive="1.6"
                    width="23vw"
                    height="2vw"
                    value={newWhiteUserInfo}
                    placeholder="유저ID 또는 지갑주소를 입력하세요."
                    readOnly={false}
                    onChange={(e) => onNewWhiteUserInfoValueChange(e)}
                  />
                </div>
              </div>
              <div
                id="item-part2"
                style={{ width: '4vw', verticalAlign: 'middle' }}
              >
                <Button1
                  responsive="1.6"
                  bgColor="var(--btn-confirm-color)"
                  width="8vw"
                  height="2vw"
                  onClick={(e) => onRegisterNewWhiteUserButtonClick(e)}
                >
                  등록하기
                </Button1>
              </div>
            </contentStyled.SettingItemArea>
            <contentStyled.SettingItemArea bottomMargin="0vw">
              <div
                id="item-part1"
                style={{ width: '52vw', verticalAlign: 'middle' }}
              >
                <Table
                  responsive="1.6"
                  colFormat={tableHSpaceTable}
                  headerInfo={tableHeaderInfo}
                  bodyInfo={makeTableFromList(whitelistInfo)}
                  onPageNoClick={onPageNoClick}
                  onGotoFirstPageClick={onGotoFirstPageClick}
                  onGotoPrevPageClick={onGotoPrevPageClick}
                  onGotoNextPageClick={onGotoNextPageClick}
                  onGotoLastPageClick={onGotoLastPageClick}
                  noPageControl={true}
                  recordNumPerPage={RECNUM_PERPAGE}
                  totalRecordNum={10}
                  onButtonClick={(e,tag)=>onChangeStateButtonClick(e,tag)}
                />
              </div>
            </contentStyled.SettingItemArea>
          </contentStyled.SettingGroupArea>
        </contentStyled.ContentBody>
        <Popup
          shown={popupShown}
          popupTypeInfo={{
            type: 'YesNo',
            button1Text: '예',
            button2Text: '아니오',
          }}
          title="알림"
          content={popupContent}
          buttonClick={(buttonNo) => onPopupButtonClick(buttonNo)}
          closeClick={onPopupCloseButtonClick}
        />
      </contentStyled.ContentWrapper>
    </>
  );
};

export default MarketGeneralSettingPanel;
