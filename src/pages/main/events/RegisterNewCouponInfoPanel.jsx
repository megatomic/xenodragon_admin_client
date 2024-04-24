import React, {useState,useEffect,useCallback,forwardRef,useRef,useMemo} from 'react';
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as constants from '../../../common/constants';
import * as styled from './EventManagePageStyles';
import RewardSettingPanel from '../inbox/RewardSettingPanel';

import dayjs from 'dayjs';
import * as utils from '../../../common/js/utils';
import DatePicker from 'react-datepicker';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import RadioGroup from '../../../components/RadioGroup';
import TextArea1 from '../../../components/TextArea1';
import DropBox from '../../../components/DropBox';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useRewardEvent from '../../../store/useRewardEventDataManager';
import { toast } from 'react-toastify';

import {enumLangCode,getLangValue,getLangCodeFromType,getTitle,getContent,getDefaultTable, getLangTypeFromCode} from '../notifications/NotificationManageContainer';

const titleText = '새 쿠폰 발급하기';
const COUPONDIGIT_MIN = 12;

const DatePickerInput = forwardRef((props) => {
    return <InputField1 responsive='1.2' width="12vw" height="2vw" {...props} />;
  });

const RegisterNewCouponInfoPanel = (props) => {

    // console.log('props.groupIDTable=',props.groupIDTable);

    const { startLoading, setStartLoading } = useCommon();
    const { requestNewCoupon,requestMessagePresetInfoList } = useRewardEvent();

    const [couponType, setCouponType] = useState(props.transferInfo!==undefined?1:0);
    const [couponDigit, setCouponDigit] = useState(COUPONDIGIT_MIN);
    const [sharedCouponCode, setSharedCouponCode] = useState('');
    const [couponNum, setCouponNum] = useState(0);
    const [activationFlag, setActivationFlag] = useState(0);
    const [couponIssued, setCouponIssued] = useState(false);
    const [couponQty, setCouponQty] = useState(0);
    const [issuedCouponListStr, setIssuedCouponListStr] = useState('');
    
    const [nextPresetID, setNextPresetID] = useState(0);
    const [titleLock, setTitleLock] = useState(false);
    const [contentLock, setContentLock] = useState(false);
    // const [presetTitle, setPresetTitle] = useState('');
    // const [presetContent, setPresetContent] = useState('');

    const [rewardInfo, setRewardInfo] = useState([]);
    const [rewardSetting, setRewardSetting] = useState(false);
    const [rewardDescInfo, setRewardDescInfo] = useState('');

    const [presetItemID, setPresetItemID] = useState(0);
    const [presetInfoTable, setPresetInfoTable] = useState([{id:1,name:"새 프리셋ID"}]);

    const [langType, setLangType] = useState(0);
    const [titleTable, setTitleTable] = useState(getDefaultTable);
    const [contentTable, setContentTable] = useState(getDefaultTable);

    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [subMenuOpen,setSubMenuOpen] = useState(false);


    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
  
    const startInputRef = useRef(null);
    const endInputRef = useRef(null);

    const onCouponTypeRadioButtonClick = useCallback((idx) => {

        setCouponType(idx);
    });

    const onCouponDigitValueChange = (e) => {

        setCouponDigit(e.target.value);
    };

    const onSharedCouponCodeValueChange = (e) => {

        setSharedCouponCode(e.target.value);
    };

    const onCouponQtyValueChange = (e) => {

        setCouponQty(e.target.value);
    };

    const updateTitle = (langCode,value) => {

        const langValue = getLangValue(langCode);

        const newTitleTable = titleTable.map(item=>{
            if(item.langValue === langValue) {
            return {...item,content:value};
            } else {
            return item;
            }
        });
    
        setTitleTable(table=>newTitleTable);
    };

    const updateContent = (langCode,value) => {

        const langValue = getLangValue(langCode);

        const newContentTable = contentTable.map(item=>{
            if(item.langValue === langValue) {
            return {...item,content:value};
            } else {
            return item;
            }
        });
    
        setContentTable(table=>newContentTable);
    };

    const onTitleChanged = (e) => {

        const langCode = enumLangCode[langType].code;
        updateTitle(langCode,e.target.value);
    };

    const onContentChanged = (e) => {

        const langCode = enumLangCode[langType].code;
        updateContent(langCode,e.target.value);
    };

    const onPresetIDItemClick = (item) => {
        setPresetItemID(item.id-1);
        if(item.id === 1) { // 새 프리셋ID 생성
            setTitleLock(false);
            setContentLock(false);
        } else {
            setTitleLock(true);
            setContentLock(true);

            for(let langInfo of item.languageTable) {
                if(langInfo.languageId === getLangCodeFromType(langType)) {
                    // setPresetTitle(langInfo.messageSubject);
                    // setPresetContent(langInfo.messageBody);

                    updateTitle(langInfo.languageId,langInfo.messageSubject);
                    updateContent(langInfo.languageId,langInfo.messageBody);
                }
            }
        }
    };

    const onLangCodeItemClick = (item) => {
        setLangType(item.id-1);
    };

    const onStartTimeDatePickerChanged = (date) => {
        setStartDate(date);
    
        if (endDate === '') {
          return;
        }
    
        const startDate2 = dayjs(utils.makeDateTimeStringFromDate(date));
        const endDate2 = dayjs(utils.makeDateTimeStringFromDate(endDate));
    
        if (startDate2.isBefore(endDate2) === false) {
          toast.error('시작일자는 종료일자보다 더 이전이어야 합니다.');
        }
      };
    
      const onEndTimeDatePickerChanged = (date) => {
        setEndDate(date);
    
        if (startDate === '') {
          return;
        }
    
        const startDate2 = dayjs(utils.makeDateTimeStringFromDate(startDate));
        const endDate2 = dayjs(utils.makeDateTimeStringFromDate(date));
    
        if (startDate2.isBefore(endDate2) === false) {
          toast.error('종료일자는 시작일자보다 더 나중이어야 합니다.');
        }
      };

    const onRewardSettingButtonClick = (e) => {
        
        setRewardSetting(true);
    };

    const onRewardSettingCancelButtonClick = (e) => {

        setRewardSetting(false);
    };

    const onRewardSettingApplyButtonClick = (e,newRewardInfo,newRewardDescInfo) => {

        setRewardInfo(newRewardInfo);
        setRewardDescInfo(newRewardDescInfo);
        setRewardSetting(false);
    };

    const onActivationFlagRadioButtonClick = (idx) => {

        setActivationFlag(idx);
    };

    const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
    };

    const onCancelButtonClick = async (e) => {

        props.onEventEditModeChange(false,null);
    };

    const onPopupButtonClick = async (buttonIdx) => {

        if (buttonIdx === 0) {
            setStartLoading(true);

            let presetID = nextPresetID;
            let newPresetFlag = true;
            if(presetItemID > 0) { // 기존 프리셋ID 설정인 경우
                for(let info of presetInfoTable) {
                    if(presetInfoTable.id-1 === presetItemID) {
                        newPresetFlag = false;
                        presetID = presetInfoTable.presetId;
                        break;
                    }
                }
            }

            const resultInfo= await requestNewCoupon({
                newPresetFlag,
                presetID,
                titleTable: titleTable,
                contentTable: contentTable,
                couponType:couponType,
                couponDigit:couponDigit,
                sharedCouponCode:sharedCouponCode,
                couponQty:parseInt(couponQty),
                activationFlag:activationFlag,
                startTime: dayjs(startDate).utc().format(),
                endTime: dayjs(endDate).utc().format(),
                rewardData:rewardInfo
            });
      
            console.log(resultInfo);
            if (resultInfo.resultCode !== 0) {
              toast.error(resultInfo.message);
            } else {
                toast.info('발급이 완료드되었습니다.');

                setTimeout(() => {
                    onCancelButtonClick(null);
                },500);
            }
            setStartLoading(false);
    
            onPopupCloseButtonClick(null);

          } else {
            onPopupCloseButtonClick(null);
          }
    };

    const onPopupCloseButtonClick = (e) => {

        setPopupShown(false);
    };

    const onQueryTokenIDListButtonClick = async (e) => {

        setStartLoading(true);

        let resultInfo;
        // if(couponType === 0) {
        //     resultInfo = await requestNFTListForGroupMinting({groupID:curGroupID});
          
        // } else {
        //     resultInfo = await requestNFTList({address:sourceAddress});
        // }

        console.log("tokenInfoList=",resultInfo);

        setStartLoading(false);
    }

    const onTransferButtonClick = async (e) => {

        const contentInfo=[];
        contentInfo.push(` `);
        contentInfo.push(`제목: ${getTitle(titleTable,langType)}`);
        contentInfo.push(`내용: ${getContent(contentTable,langType)}`);
        contentInfo.push(` `);
        contentInfo.push(`쿠폰타입: ${couponType===0?"개별코드":"공용코드"}`);
        if(couponType === 1) {
            if(sharedCouponCode.trim() === '') {
                toast.error('공용코드를 입력하세요.');
                return;
            }
            contentInfo.push(`공용코드: ${sharedCouponCode}`);
        } else {
            const couponDigitValue = parseInt(couponDigit);
            if(isNaN(couponDigitValue) || couponDigitValue < COUPONDIGIT_MIN) {
                toast.error(`쿠폰 자릿수가 유효하지 않습니다.(숫자 ${COUPONDIGIT_MIN}이상)`);
                return;
            }
            contentInfo.push(`자릿수: ${couponDigit}`);
        }

        const qty = parseInt(couponQty);
        if(isNaN(qty) || qty < 1) {
            toast.error('발급수량이 유효하지 않습니다.(숫자 0이상)');
            return;
        }
        contentInfo.push(`발급수량: ${couponQty} 개`);
        contentInfo.push(`시작시간: ${dayjs(startDate).format('YYYY-MM-DD HH:mm')}`);
        contentInfo.push(`종료시간: ${dayjs(endDate).format('YYYY-MM-DD HH:mm')}`);
        contentInfo.push(` `);
        contentInfo.push(`지급항목: ${JSON.stringify(rewardDescInfo)}`);
        contentInfo.push(` `);
        contentInfo.push("쿠폰을 발급하시겠습니까?");
        contentInfo.push(` `);
    
        setPopupContent(contentInfo);
        setPopupShown(true);
    };

    const mainTitle = useMemo(()=> {
        return titleText;
    });

    useEffect(()=> {
        
        const fetchData = async() => {
            setStartLoading(true);
            const resultInfo = await requestMessagePresetInfoList();
            if(resultInfo.resultCode !== 0) {
                toast.error(resultInfo.message);

            } else {
                const table = resultInfo.data;
                if(table.length > 0) {
                    const msgPresetInfoTable = [...presetInfoTable];
                    let count = 2;
                    let biggestPresetID = 0;
                    for(let info of table) {
                        msgPresetInfoTable.push({id:count, presetId:info.id, name:info.presetName+"("+info.id+")", languageTable:info.messagePresetLanguages});
                        if(biggestPresetID < info.id) {
                            biggestPresetID = info.id;
                        }
                        count++;
                    }

                    setNextPresetID(biggestPresetID+1);
                    setPresetInfoTable(msgPresetInfoTable);
                }
            }

            setStartLoading(false);
        };

        if(props.transferInfo === undefined) {
            fetchData();
        }
    },[]);

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
            <span id='subtitle'>{titleText}</span>
            <span>&nbsp;</span>
            <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='6vw' height='2vw' onClick={(e)=>onTransferButtonClick(e)}>발급하기</Button1></span>
            <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='6vw' height='2vw' onClick={(e)=>onCancelButtonClick(e)}>취소하기</Button1></span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>1.일반 정보</label>
                    <div></div>
                </div>
                <br />
                <contentStyled.SettingItemArea>
                    <styled.InputArea leftMargin="0vw" width="70%">
                    <span className="row1">
                        <label>프리셋ID</label>
                    </span>
                    <span className="row2">
                        <DropBox responsive='1.3' width='10vw' height='2vw' fontSize='0.6vw' text={presetInfoTable[presetItemID].name} itemList={presetInfoTable} menuItemClick={(item)=>onPresetIDItemClick(item)} />
                    </span>
                    <span className="row3">&nbsp;</span>
                    </styled.InputArea>
                    <styled.InputArea leftMargin="0vw" width="70%">
                    <span className="row1">
                        <label>언어</label>
                    </span>
                    <span className="row2">
                        <DropBox responsive='1.3' width='10vw' height='2vw' fontSize='0.6vw' text={enumLangCode[langType].name} itemList={enumLangCode} menuItemClick={(item)=>onLangCodeItemClick(item)} />
                    </span>
                    <span className="row3">&nbsp;</span>
                    </styled.InputArea>
                    <styled.InputArea leftMargin='0vw' width='70%'>
                    <span className="row1">
                        <label>제목</label>
                        <label>내용</label>
                    </span>
                    <span className="row2">
                        <InputField1 responsive='1.6' value={getTitle(titleTable,langType)} width='28vw' height='2vw' placeholder={'4자이상 20자 미만'} readOnly={titleLock} onChange={(e) => onTitleChanged(e)} />
                        <TextArea1 responsive='1.6' value={getContent(contentTable,langType)} width='28vw' height='12vw' readOnly={contentLock} onChange={(e) => onContentChanged(e)} />
                    </span>
                    <span className="row3">&nbsp;</span>
                    </styled.InputArea>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea>
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>초기 활성화</p>
                    </div>
                    <div id="item-part2">
                    <RadioGroup responsive='1.6' initButtonIndex={activationFlag} interMargin="0.5vw" buttonWidth="6vw" nameTable={['활성화','비활성화']} buttonClicked={(idx) => onActivationFlagRadioButtonClick(idx)} />
                    </div>
                    <br />
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>2.발급 정보</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea>
                    <br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>쿠폰 타입</p>
                    </div>
                    <div id="item-part2">
                        <RadioGroup responsive='1.6' initButtonIndex={couponType} interMargin="0.5vw" buttonWidth="6vw" nameTable={['개별 코드','공용 코드','제한 수량']} buttonClicked={(idx) => onCouponTypeRadioButtonClick(idx)} />
                    </div>
                    <br />
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin="1vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>{couponType === 0?"총 자릿수":"공용 코드"}</p>
                    </div>
                    <div id="item-part2" style={{width:'46vw'}}>
                        {couponType === 0?(
                            <InputField1 responsive='1.6' width='6vw' height='2vw' placeholder={"8자리 이상"} value={couponDigit} onChange={(e)=>onCouponDigitValueChange(e)} />
                        ):(
                            <InputField1 responsive='1.6' width='12vw' height='2vw' value={sharedCouponCode} onChange={(e)=>onSharedCouponCodeValueChange(e)} />
                        )}
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin="1vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;수량</p>
                    </div>
                    <div id="item-part2" style={{width:'46vw'}}>
                        <InputField1 responsive='1.6' width='8vw' height='2vw' value={couponQty} onChange={(e)=>onCouponQtyValueChange(e)} />
                    </div>
                    
                </contentStyled.SettingItemArea>
                <contentStyled.FilterItem>
                    <span id="name" style={{ marginLeft: '1.7vw', marginRight: '2vw' }}>
                        유효 기간:
                    </span>
                    <span id="name">시작일시</span>
                    <span id="input">
                        <DatePicker selected={startDate} onChange={onStartTimeDatePickerChanged} showTimeSelect dateFormat="Pp" timeIntervals={10} customInput={<DatePickerInput ref={startInputRef} />} />
                    </span>
                    <span id="name">종료일시</span>
                    <span id="input">
                        <DatePicker selected={endDate} onChange={onEndTimeDatePickerChanged} showTimeSelect dateFormat="Pp" timeIntervals={10} customInput={<DatePickerInput ref={endInputRef} />} />
                    </span>
                    </contentStyled.FilterItem>

                <br />
                <contentStyled.SettingGroupArea leftMargin='0vw' width='90%'>
                    <styled.OptionItem noHeight>
                        <span id="option_title" style={{paddingRight:'2.1vw'}}>보상 항목</span>
                        <span id='col1'>{JSON.stringify(rewardInfo)}</span>
                        <span id='col2'><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='6vw' height='2vw' onClick={(e)=>onRewardSettingButtonClick(e)}>설정</Button1></span>
                    </styled.OptionItem>
                </contentStyled.SettingGroupArea>
            </contentStyled.SettingGroupArea>
            </contentStyled.ContentBody>
            <Popup
                shown={popupShown}
                popupTypeInfo={{ type: 'YesNo', button1Text: '예', button2Text: '아니오' }}
                title="알림"
                content={popupContent}
                buttonClick={(buttonNo) => onPopupButtonClick(buttonNo)}
                closeClick={onPopupCloseButtonClick}
            />
        </contentStyled.ContentWrapper>
        )
    )
};

export default RegisterNewCouponInfoPanel;