import React, {useState,useRef, forwardRef, useCallback, useMemo,useEffect} from 'react';
import { CSVLink, CSVDownload } from "react-csv"; 
import MediaQuery from 'react-responsive';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import dayjs from 'dayjs';
import * as utils from '../../../common/js/utils';
import { toast } from 'react-toastify';

import * as constants from '../../../common/constants';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './InboxMessageManagePageStyles';
import RewardSettingPanel from './RewardSettingPanel';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import TextArea1 from '../../../components/TextArea1';
import CheckBox from '../../../components/CheckBox';
import DropBox from '../../../components/DropBox';
import RadioGroup from '../../../components/RadioGroup';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useMessage from '../../../store/useMessageDataManager';
import {enumLangCode,getLangValue,getLangCode,getTitle,getContent,getDefaultTable} from '../notifications/NotificationManageContainer';

const titleText1 = '새 메세지 보내기';
const titleText2 = '메세지 보기/수정';

const DatePickerInput = forwardRef((props) => {
    return (
        <InputField1 responsive='1.2' width='8vw' height='2vw' {...props} />
    )
});

let g_timerID1 = -1;
let g_timerID2 = -1;

const SendNewInboxMessagePanel = (props) => {

  const fileReader = new FileReader();

  //console.log('props=',props);

    const { startLoading, setStartLoading } = useCommon();
    const { msgList, requestNewMessage, requestModifyMessage, requestLanguagePreset, requestRewardPreset } = useMessage();
    const [langType, setLangType] = useState(0);
    const [sendType, setSendType] = useState(props.editMode ? (props.editInfo.msgInfo.targetUserID != '' ? constants.MSGTARGET_TYPE_USER : constants.MSGTARGET_TYPE_ALL) : constants.MSGTARGET_TYPE_ALL);
    const [targetUserID, setTargetUserID] = useState(props.editMode ? props.editInfo.msgInfo.targetUserID : '');
    const [targetUserIDTable, setTargetUserIDTable] = useState([]);
    //const [startDate, setStartDate] = useState(props.editMode ? new Date(props.editInfo.msgInfo.startTime) : new Date(Date.now() + 10 * 60000));
    const [startTime, setStartTime] = useState(props.editMode ? new Date(props.editInfo.msgInfo.startTime) : new Date(Date.now()));
    const [endTime, setEndTime] = useState(props.editMode ? new Date(props.editInfo.msgInfo.endTime) : new Date(startTime.getTime() + 31 * 24 * 60 * 60 * 1000));

    const [activationFlag, setActivationFlag] = useState(props.editMode ? props.editInfo.msgInfo.activationFlag : false);
    const [reservationFlag, setReservationFlag] = useState(props.editMode ? props.editInfo.msgInfo.reservationFlag : false);
    const [subMenuOpen,setSubMenuOpen] = useState(false);
    
    const [presetTitle, setPresetTitle] = useState('');
    const [langPresetID, setLangPresetID] = useState(0);
    const [rewardPresetID, setRewardPresetID] = useState(0);

    const [langPresetName, setLangPresetName] = useState('');
    const [rewardPresetName, setRewardPresetName] = useState('');

    const [titleTable, setTitleTable] = useState(props.editMode ? props.editInfo.msgInfo.titleTable : getDefaultTable);
    const [contentTable, setContentTable] = useState(props.editMode ? props.editInfo.msgInfo.contentTable : getDefaultTable);
    const [rewardInfo, setRewardInfo] = useState(props.editMode ? props.editInfo.msgInfo.rewardData : []);
    const [rewardDescInfo, setRewardDescInfo] = useState('');
    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');

    const [rewardSetting, setRewardSetting] = useState(false);
    const startInputRef = useRef(null);
    const endInputRef = useRef(null);

    const [langPresetItem, setLangPresetItem] = useState(null);
    const [rewardPresetItem, setRewardPresetItem] = useState(null);

    const [langPresetIDInputLock, setLangPresetIDInputLock] = useState(false);
    const [rewardPresetIDInputLock, setRewardPresetIDInputLock] = useState(false);

    const filterTargetUserList = [
        {id:1,name:'전체'},
        {id:2,name:'특정 유저'}
    ];

    const onPresetTitleValueChanged = (e) => {
      setPresetTitle(e.target.value);
    };

    const onLangPresetIDValueChanged = async (e) => {
      setLangPresetID(e.target.value);

      clearTimeout(g_timerID1);
      g_timerID1 = setTimeout(async () => {

        setStartLoading(true);
        setLangPresetIDInputLock(true);
        
        const resultInfo = await requestLanguagePreset({presetType:constants.PREMESSAGE_TYPE_SYSTEM,presetID:parseInt(e.target.value)});
        console.log('### resultInfo=',JSON.stringify(resultInfo,null,2));

        if(resultInfo.data !== null) {
          setLangPresetItem(resultInfo.data);
          setLangPresetName(resultInfo.data.presetName);

          const newTitleTable = [];
          const newContentTable = [];
          const langItems = resultInfo.data.messagePresetLanguages;
          if(langItems.length > 0) {
            for(let item of langItems) {
              newTitleTable.push({langCode:item.languageId,langValue:getLangValue(item.languageId),content:item.messageSubject});
              newContentTable.push({langCode:item.languageId,langValue:getLangValue(item.languageId),content:item.messageBody});
            }
            setTitleTable(table=>newTitleTable);
            setContentTable(table=>newContentTable);
          }

          console.log('newTitleTable=',JSON.stringify(newTitleTable,null,2));
          console.log('newContentTable=',JSON.stringify(newContentTable,null,2));
        }

        setLangPresetIDInputLock(false);
        setStartLoading(false);
      },2000);
    };

    const onRewardPresetIDValueChanged = (e) => {
      setRewardPresetID(e.target.value);

      clearTimeout(g_timerID2);
      g_timerID2 = setTimeout(async () => {

        setStartLoading(true);
        setRewardPresetIDInputLock(true);
        
        const resultInfo = await requestRewardPreset(parseInt(e.target.value));
        console.log('### resultInfo=',JSON.stringify(resultInfo,null,2));

        if(resultInfo.data !== null) {
          setRewardPresetItem(resultInfo.data);
          setRewardPresetName(resultInfo.data.rewardName);

          const rewardList = [];
          const rewardItems = resultInfo.data.rewardPresetItems;
          if(rewardItems.length > 0) {
            for(let item of rewardItems) {
              rewardList.push({ItemType:item.itemType,ItemId:item.itemId,Quantity:item.quantity});
            }
            setRewardInfo(rewardList);
          }
        }

        setRewardPresetIDInputLock(false);
        setStartLoading(false);
      },2000);
    };

    const onTargetUserItemClick = useCallback((item) => {
        setSendType(item.id === 1 ? constants.MSGTARGET_TYPE_ALL : constants.MSGTARGET_TYPE_USER);
        if (item.id === 1) {
          setTargetUserID('');
        }
      });
    
      // const onReservedNotiCheckBoxChanged = (date) => {
      //   setStartDate(date);
      // };
    
      const onStartTimeDatePickerChanged = (date) => {
        setStartTime(date);
    
        const startDate2 = dayjs(utils.makeDateTimeStringFromDate(date));
    
        if (startDate2.isBefore(dayjs()) === true) {
          toast.error('시작일은 지금 시각 이후이어야 합니다.');
        }
      };

      const onEndTimeDatePickerChanged = (date) => {
        setEndTime(date);
    
        const startDate2 = dayjs(utils.makeDateTimeStringFromDate(startTime));
        const endDate2 = dayjs(utils.makeDateTimeStringFromDate(date));
    
        if (endDate2.isBefore(startDate2) === true) {
          toast.error('종료일은 시작일 이후이어야 합니다.');
        }
      };
    
      const onTitleChanged = (e) => {

        const langCode = enumLangCode[langType].code;
        const langValue = getLangValue(langCode);
    
        const newTitleTable = titleTable.map(item=>{
          if(item.langValue === langValue) {
            return {...item,content:e.target.value};
          } else {
            return item;
          }
        });
    
        setTitleTable(table=>newTitleTable);
      };
    
      const onUserIDListContentChanged = (e) => {

        setTargetUserID(e.target.value);

        setTargetUserIDTable(e.target.value.split(","));
      };

      const onContentChanged = (e) => {
    
        const langCode = enumLangCode[langType].code;
        const langValue = getLangValue(langCode);
    
        const newContentTable = contentTable.map(item=>{
          if(item.langValue === langValue) {
            return {...item,content:e.target.value};
          } else {
            return item;
          }
        });
    
        setContentTable(table=>newContentTable);
      };
    
      const onActivationButtonClick = (idx) => {
        setActivationFlag(idx === 0 ? true : false);
      };
    
      const onReservationButtonClick = (idx) => {
        setReservationFlag(idx === 1 ? true : false);
      };
    
      const onSendButtonClick = async (e) => {
         
        const contentInfo=[];

        if(sendType === constants.MSGTARGET_TYPE_USER) {
          contentInfo.push(` `);
          contentInfo.push(`제목:${getTitle(titleTable,langType)}`);
          contentInfo.push(`내용:${getContent(contentTable,langType)}`);
          contentInfo.push(`보상항목:${JSON.stringify(rewardDescInfo)}`);
        } else {
          if(presetTitle.trim() === "") {
            toast.error("프리셋 제목을 올바로 입력하세요.");
            return;
          }
          if(langPresetID.trim() === "") {
            toast.error("언어 프리셋ID를 올바로 입력하세요.");
            return;
          }
          if(rewardPresetID.trim() === "") {
            toast.error("보상 프리셋ID를 올바로 입력하세요.");
            return;
          }
        }
        contentInfo.push(` `);
        contentInfo.push("우편함 보상메세지를 전송하시겠습니까?");
        contentInfo.push(` `);
    
        setPopupContent(contentInfo);
        setPopupShown(true);
      };
    
      const onPopupButtonClick = async (buttonIdx) => {
        if (buttonIdx === 0) {
          setStartLoading(true);
    
          //console.log('sendType=', sendType, ',targetUserID=', targetUserID);
      
          let resultInfo;
          if (props.editMode === true) {
            resultInfo = await requestModifyMessage({
              msgID: props.editInfo.msgInfo.msgID,
              msgType: constants.MESSAGE_TYPE_INBOX,
              targetType: sendType,
              targetUserID: sendType === constants.MSGTARGET_TYPE_ALL ? '' : targetUserID,
              targetUserIDTable: targetUserID,
              presetTitle,
              langPresetID,
              rewardPresetID,
              titleTable: titleTable,
              contentTable: contentTable,
              reservationFlag: reservationFlag.toString(),
              startTime: utils.makeDateTimeStringFromDate(startTime),
              endTime: utils.makeDateTimeStringFromDate(endTime),
              liveFlag: activationFlag.toString(),
              rewardData:rewardInfo
            });
          } else {
            resultInfo = await requestNewMessage({
              msgType: constants.MESSAGE_TYPE_INBOX,
              targetType: sendType,
              targetUserID: sendType === constants.MSGTARGET_TYPE_ALL ? '' : targetUserID,
              targetUserIDTable: targetUserIDTable,
              presetTitle,
              langPresetID,
              rewardPresetID,
              titleTable: titleTable,
              contentTable: contentTable,
              reservationFlag: reservationFlag.toString(),
              startTime: utils.makeDateTimeStringFromDate(startTime),
              endTime: utils.makeDateTimeStringFromDate(endTime),
              liveFlag: activationFlag.toString(),
              rewardData:rewardInfo
            });
          }
          console.log('[RESULT INFO]=',resultInfo);
      
          if (resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
          } else {
            if (props.editMode === true) {
              toast.info('우편함 항목이 수정되었습니다.');
            } else {
              if(resultInfo.data.failUserIDList !== undefined && resultInfo.data.failUserIDList.length > 0) {
                toast.info(`전송에 실패한 유저ID가 있습니다:${resultInfo.data.failUserIDList}`,{autoClose:60000});
              } else {
                toast.info('새 우편함 항목이 요청되었습니다.');
              }
            }
          }
          setStartLoading(false);
      
          onPopupCloseButtonClick(null);
          onCancelButtonClick(null);
        } else {
          onPopupCloseButtonClick(null);
        }
      };
    
      const onPopupCloseButtonClick = (e) => {
        setPopupShown(false);
      };

      const onCancelButtonClick = (e) => {
        props.onMsgEditModeChange(false);
      };

      const onRewardSettingButtonClick = (e) => {
        setRewardSetting(true);
      };

      const mainTitle = useMemo(()=> {
        return props.editMode ? `${props.editInfo.parentTitle} > ${titleText2}` : titleText1;
      });
    
      const onRewardSettingApplyButtonClick = (e,newRewardInfo,newRewardDescInfo) => {

        setRewardInfo(newRewardInfo);
        setRewardDescInfo(newRewardDescInfo);
        setRewardSetting(false);
      };

      const onRewardSettingCancelButtonClick = (e) => {

        setRewardSetting(false);
      };
      
      const onLoadCSVFileInfo = (e) => {

        const csvFileToArray = string => {
            const csvRows = string.split("\n");
             
            const curItemTable = [];
            const table1=[];
            let targetUserIDStr = "";
            for(let i=0;i<csvRows.length;i++) {
                const arr2 = csvRows[i].split(',');
                table1.push(arr2[0]);
                targetUserIDStr += arr2[0];
                if(i+1 < csvRows.length) {
                  targetUserIDStr += ",";
                }
            }

            console.log('targetUserIDStr=',targetUserIDStr);

            setTargetUserIDTable(table1);
            setTargetUserID(targetUserIDStr);
        };

        fileReader.onload = function (event) {
            const text = event.target.result;
            csvFileToArray(text);
        };

        if(e.target.files !== undefined && e.target.files.length > 0) {
            fileReader.readAsText(e.target.files[0]);
        }
    };

      const onLangCodeItemClick = (item) => {
        setLangType(item.id-1);
      };

      const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
      };
    
      useEffect(()=> {
        props.onSubMenuOpenClicked(subMenuOpen);
      },[subMenuOpen]);

    return (
      rewardSetting===true?
        <RewardSettingPanel parentTitle={mainTitle} rewardInfo={rewardInfo} onApplyButtonClick={(e,newRewardInfo,newRewardDescInfo)=>onRewardSettingApplyButtonClick(e,newRewardInfo,newRewardDescInfo)} onCancelButtonClick={(e)=>onRewardSettingCancelButtonClick(e)} /> :
        (
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader>
            <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
        </MediaQuery>
            <span id="subtitle">{mainTitle}</span>
                <span>&nbsp;</span>
                <span id='button'>
                    <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='6vw' height='2vw' onClick={(e) => onSendButtonClick(e)}>
                        {props.editMode ? '수정하기' : '전송하기'}
                    </Button1>
                </span>
                <span id="button">
                    <Button1 responsive='1.6' bgColor="var(--btn-secondary-color)" width="6vw" height="2vw" onClick={(e) => onCancelButtonClick(e)}>
                        취소하기
                    </Button1>
                </span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
                <br /><br />
            <contentStyled.FilterGroup marginLeft='5.4vw'>
                <contentStyled.FilterItem>
                    <span id='name'>전송 대상</span>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id='dropdown'><DropBox responsive='1.6' width='10vw' height='2vw'text={filterTargetUserList[targetUserID === '' ? 0 : 1].name} fontSize='0.6vw' itemList={filterTargetUserList} menuItemClick={(item)=>onTargetUserItemClick(item)} /></span>
                </contentStyled.FilterItem>
            </contentStyled.FilterGroup>
            <styled.InputArea leftMargin="4.2vw" width="90%">
              <span className="row1">
                <label>유저목록</label>
              </span>
              <span className="row2">
              <TextArea1 responsive='1.6' value={targetUserID} width='43.5vw' height='6vw' readOnly={sendType === constants.MSGTARGET_TYPE_ALL?true:false} onChange={(e) => onUserIDListContentChanged(e)} />
              </span>
              <span className="row3">&nbsp;</span>
            </styled.InputArea>
            <styled.InputArea leftMargin="0vw" width="90%">
              <form>
                  <input
                  type={"file"}
                  id={"csvFileInput"}
                  accept={".csv"}
                  onChange={onLoadCSVFileInfo}
                  />
              </form>
            </styled.InputArea>
            <br />
            {sendType===constants.MSGTARGET_TYPE_USER?(
              <>
                <styled.InputArea leftMargin="4.2vw" width="70%">
                  <span className="row1">
                    <label>언어</label>
                  </span>
                  <span className="row2">
                    <DropBox responsive='1.3' width='10vw' height='2vw' fontSize='0.6vw' text={enumLangCode[langType].name} itemList={enumLangCode} menuItemClick={(item)=>onLangCodeItemClick(item)} />
                  </span>
                  <span className="row3">&nbsp;</span>
                </styled.InputArea>
                <styled.InputArea leftMargin='4vw' width='70%'>
                    <span className="row1">
                        <label>제목</label>
                        <label>내용</label>
                    </span>
                    <span className="row2">
                        <InputField1 responsive='1.6' value={getTitle(titleTable,langType)} width='28vw' height='2vw' placeholder={'4자이상 20자 미만'} onChange={(e) => onTitleChanged(e)} />
                        <TextArea1 responsive='1.6' value={getContent(contentTable,langType)} width='28vw' height='12vw' onChange={(e) => onContentChanged(e)} />
                    </span>
                    <span className="row3">&nbsp;</span>
                </styled.InputArea>
              </>
            ):(
              <>
                <styled.InputArea leftMargin="4.2vw" width="90%">
                <span className="row1">
                  <label>프리셋 제목</label>
                </span>
                <span className="row2">
                  <InputField1 responsive='1.6' value={presetTitle} width='32vw' height='2vw' onChange={(e) => onPresetTitleValueChanged(e)} />
                </span>
                <span className="row3">&nbsp;</span>
              </styled.InputArea>
              <styled.InputArea leftMargin="4.2vw" width="90%">
                <span className="row1">
                  <label>언어 프리셋ID</label>
                </span>
                <span className="row2">
                  <span>
                  <InputField1 responsive='1.6' value={langPresetID} width='6vw' height='2vw' onChange={(e) => onLangPresetIDValueChanged(e)} />
                  &nbsp;&nbsp;&nbsp;&nbsp;<label>{langPresetName}</label>
                  </span>
                </span>
                <span className="row3">&nbsp;</span>
              </styled.InputArea>
              <styled.InputArea leftMargin="4.2vw" width="90%">
                <span className="row1">
                  <label>보상 프리셋ID</label>
                </span>
                <span className="row2">
                  <span>
                  <InputField1 responsive='1.6' value={rewardPresetID} width='6vw' height='2vw' onChange={(e) => onRewardPresetIDValueChanged(e)} />
                  &nbsp;&nbsp;&nbsp;&nbsp;<label>{rewardPresetName}</label>
                  </span>
                </span>
                <span className="row3">&nbsp;</span>
              </styled.InputArea>
              </>
            )}
            <br />
            <contentStyled.SettingGroupArea leftMargin='0vw' width='90%'>
            {sendType===constants.MSGTARGET_TYPE_USER?(
              <>
                <styled.OptionItem>
                <span id="option_title">보상 항목</span>
                    <span id='col1'>{JSON.stringify(rewardInfo)}</span>
                    <span id='col2'><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='6vw' height='2vw' onClick={(e)=>onRewardSettingButtonClick(e)}>설정</Button1></span>
                </styled.OptionItem>
              </>
            ):(
              <>
              </>
            )}
                <br />
                <styled.OptionItem>
                    <span id="option_title">활성화 여부</span>
                    <span id="col1">
                    <RadioGroup responsive='1.6' initButtonIndex={activationFlag === true ? 0 : 1} interMargin="1vw" nameTable={['활성화', '비활성화']} buttonClicked={(idx) => onActivationButtonClick(idx)} />
                    </span>
                </styled.OptionItem>
                <br />
                {sendType === constants.MSGTARGET_TYPE_ALL && (
                  <>
                <styled.OptionItem>
                    <span id="option_title">메세지 유효기간</span>
                    <span id="sub_col1">
                    <DatePicker selected={startTime} onChange={onStartTimeDatePickerChanged} showTimeSelect dateFormat="Pp" timeIntervals={10} customInput={<DatePickerInput ref={startInputRef} />} />
                    </span>
                    <span id="sub_col1">
                    ~&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
                    <span id="sub_col2">
                    <DatePicker selected={endTime} onChange={onEndTimeDatePickerChanged} showTimeSelect dateFormat="Pp" timeIntervals={10} customInput={<DatePickerInput ref={endInputRef} />} />
                    </span>
                </styled.OptionItem>
                <br />
                </>
                )}
            </contentStyled.SettingGroupArea>
            </contentStyled.ContentBody>
            <Popup
                shown={popupShown}
                popupTypeInfo={{ type: 'YesNo', button1Text: '예', button2Text: '아니오' }}
                title="주의"
                content={popupContent}
                buttonClick={(buttonNo) => onPopupButtonClick(buttonNo)}
                closeClick={onPopupCloseButtonClick}
            />
        </contentStyled.ContentWrapper>
        )
    )
};

export default SendNewInboxMessagePanel;