import React, {useState,useEffect,useCallback,useRef,forwardRef} from 'react';
import { CSVLink, CSVDownload } from "react-csv"; 
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as constants from '../../../common/constants';
import * as utils from '../../../common/js/utils';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import Table from '../../../components/Table';
import RadioGroup from '../../../components/RadioGroup';
import DropBox from '../../../components/DropBox';
import TextArea1 from '../../../components/TextArea1';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useSetting from '../../../store/useSettingDataManager';
import useNFT from '../../../store/useNFTDataManager';
import { toast } from 'react-toastify';

const titleText = '메타데이터 업데이트';

const DatePickerInput = forwardRef((props) => {
    return (
        <InputField1 responsive='1.2' width='8vw' height='2vw' {...props} />
    )
});

const NFTUpdateMetadataPanel = (props) => {

    const {startLoading, setStartLoading} = useCommon();
    const {nftInfo,requestMintedNFTMetadataList,requestUpdateMetadata} = useNFT();

    const [nftType, setNFTType] = useState(0);
    const [startTime, setStartTime] = useState(new Date(Date.now() + 10 * 60000));
    const [endTime, setEndTime] = useState(new Date(startTime.getTime() + 10 * 60000));

    const [totalTokenIDListStr, setTotalTokenIDListStr] = useState("");
    const [totalNFTPropNum, setTotalNFTPropNum] = useState(0);
    const [startNo, setStartNo] = useState(1);
    const [endNo, setEndNo] = useState(1);
    const [metadataBaseURI, setMetadataBaseURI] = useState("");
    const [updateUnitNum, setUpdateUnitNum] = useState(1);

    const [updatedTokenNum, setUpdatedTokenNum] = useState(0);
    const [remainTokenNum, setRemainTokenNum] = useState(0);
    const [updatedTokenIDListStr, setUpdatedTokenIDListStr] = useState("");
    const [remainTokenIDListStr, setRemainTokenIDListStr] = useState("");

    const [curUpdateNo, setCurUpdateNo] = useState(0);
    const [totalNumToUpdate, setTotalNumToUpdate] = useState(0);
    const [onUpdating, setOnUpdating] = useState(false);

    const [metadataInfoList, setMetadataInfoList] = useState([]);

    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [subMenuOpen,setSubMenuOpen] = useState(false);

    const startInputRef = useRef(null);
    const endInputRef = useRef(null);

    const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
    };

    const onUpdateButtonClick = (e) => {

        if(onUpdating === true) {
            toast.error('전송중입니다. 전송을 취소하려면 "취소"버튼을 선택하세요.');
            return;
        }

        setPopupContent('메타데이터를 업데이트하시겠습니까?');
        setPopupShown(true);
    };

    const onCancelButtonClick = (e) => {

        setOnUpdating(false);
    };

    const onNFTTypeRadioButtonClick = (idx) => {
        setNFTType(idx);
    };

    const onGetNFTCurPropInfoButtonClick = async (e) => {

        if(onUpdating === true) {
            toast.error('전송중입니다. 전송을 취소하려면 "취소"버튼을 선택하세요.');
            return;
        }

        setStartLoading(true);

        const startDate = utils.makeDateTimeStringFromDate(startTime);
        const endDate = utils.makeDateTimeStringFromDate(endTime);
        const resultInfo = await requestMintedNFTMetadataList({itemType:(nftType >=1 ?'Gear':'Dragon'),partType:nftType-1,startTime:startDate,endTime:endDate});

        if(resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
        } else {
            let tokenIDList = "";
            let count = 0;
            if(resultInfo.data.list.length > 0) {
                for(let attrInfo of resultInfo.data.list) {
                    tokenIDList += attrInfo.tokenID+",";
                    count++;
                }
                setTotalNFTPropNum(count);

                setMetadataInfoList(resultInfo.data.list);
                setEndNo(resultInfo.data.list.length);
            }

            setMetadataBaseURI(resultInfo.data.metadataBaseURI);
            setTotalTokenIDListStr(tokenIDList);

            toast.info('해당 데이터를 성공적으로 받았습니다.');
        }

        setStartLoading(false);
    };

    const onStartNoValueChange = (e) => {
        setStartNo(e.target.value);
    };

    const onEndNoValueChange = (e) => {
        setEndNo(e.target.value);
    };

    const onMetadataBaseURIValueChange = (e) => {
        setMetadataBaseURI(e.target.value);
    }

    const onUpdateUnitNumValueChange = (e) => {
        setUpdateUnitNum(e.target.value);
    }

    const onPopupButtonClick = async (buttonIdx) => {

        if (buttonIdx === 0) {
            setOnUpdating(true);
            onPopupCloseButtonClick(null);
            
            
            let count = 1;
            const bucketTableList = [];
            let bucketTable = null;
            let updateNum = 0;
            for(let metadataInfo of metadataInfoList) {
                if(count >= startNo && count <= endNo) {
                    if(bucketTable !== null && bucketTable.length >= updateUnitNum) {
                        bucketTable = null;
                    }

                    if(bucketTable === null) {
                        bucketTable = [];
                        bucketTableList.push(bucketTable);
                    }
                    bucketTable.push(metadataInfo);
                    updateNum++;
                }
                count++;
            }

            setTotalNumToUpdate(updateNum);

            let completeCount = 0;
            for await(let table of bucketTableList) {
                const resultInfo = await requestUpdateMetadata(table);
                if(resultInfo.resultCode !== 0) {
                    toast.error(resultInfo.message);
                    return;
                } else {
                    let tokenIDStr = "";
                    for(let i=0;i<table.length;i++) {
                        tokenIDStr += table[i].tokenID + ",";
                    }

                    setUpdatedTokenIDListStr(str=>str+tokenIDStr);
    
                    completeCount += table.length;
                    setUpdatedTokenNum(num=>completeCount);

                    setCurUpdateNo(curNo=>curNo+table.length);

                    console.log('completeCount=',completeCount);
                }
            }

            setOnUpdating(false);

            toast.info('성공적으로 업데이트하였습니다.');

          } else {
            onPopupCloseButtonClick(null);
          }
    };

    const onPopupCloseButtonClick = (e) => {

        setPopupShown(false);
    };

    useEffect(() => {

    },[]);

    return (
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader subtitleWidth="25vw">
            <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
        </MediaQuery>
            <span id='subtitle'>{titleText}</span>
            <span>전송단위:{updateUnitNum}</span>
            <span>전송중:{curUpdateNo}/{totalNumToUpdate}</span>
            <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' onClick={(e)=>onUpdateButtonClick(e)}>업데이트 하기</Button1></span>
            <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='8vw' height='2vw' onClick={(e)=>onCancelButtonClick(e)}>업데이트 중지하기</Button1></span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
            <div id='title'>
                <label style={{paddingTop:'0.4vw',color:'#ff0000'}}>[주의] 라이브 업데이트의 경우 반드시 타겟 경로와 해당 토큰ID가 맞는지 확인해주세요!</label>
                <br />
            </div>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>1.업데이트할 토큰속성 조회</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea bottomMargin="1vw">
                    <br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>NFT 타입</p>
                    </div>
                    <div id="item-part2">
                        <RadioGroup responsive='1.6' initButtonIndex={nftType} interMargin="0.5vw" buttonWidth="6vw" nameTable={['드래곤','헤드기어','바디기어','날개기어','꼬리기어']} buttonClicked={(idx) => onNFTTypeRadioButtonClick(idx)} />
                    </div>
                    <br />
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin="1vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                        <p>발행 기간</p>
                    </div>
                    <div id="item-part2">
                        <span id='input'><DatePicker selected={startTime} onChange={(date) => setStartTime(date)} showTimeSelect dateFormat='Pp' timeIntervals={1} customInput={<DatePickerInput ref={startInputRef} />} /></span>
                    </div>
                    <div id="item-part1" style={{ width:'0vw', verticalAlign: 'middle' }}>
                        <p>&nbsp;&nbsp;{"~"}&nbsp;&nbsp;</p>
                    </div>
                    <div id="item-part2">
                        <span id='input'><DatePicker selected={endTime} onChange={(date) => setEndTime(date)} showTimeSelect dateFormat='Pp' timeIntervals={1} customInput={<DatePickerInput ref={endInputRef} />} /></span>
                    </div>
                </contentStyled.SettingItemArea>
                <br />
                <contentStyled.SettingItemArea>
                    <div id="item-part1" style={{ width:'100%', display:'flex', justifyContent:'center' }}>
                        <Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='12vw' height='2vw' onClick={(e)=>onGetNFTCurPropInfoButtonClick(e)}>속성 조회하기</Button1>
                        <div style={{width:"8vw"}}>&nbsp;</div>
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>

            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <contentStyled.SettingItemArea>
                    <div id="item-part1" style={{height:'12vw', verticalAlign: 'top', marginTop: '1vw'}}>
                        <p>{totalNFTPropNum}개</p>
                    </div>
                    <div id="item-part2">
                        <TextArea1 responsive='1.6' value={totalTokenIDListStr} width="48vw" height="12vw" readOnly={true} />
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>

            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>2.업데이트 대상 정보</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <br />
                    <div id='item-part1'>
                    {'시작 번호'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='6vw' height='2vw' value={startNo} onChange={(e)=>onStartNoValueChange(e)} />
                    </div>
                    <div id='item-part2'>
                    {'끝 번호'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='6vw' height='2vw' value={endNo} onChange={(e)=>onEndNoValueChange(e)} />
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id='item-part1'>
                    {'메타데이터 URI'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='36vw' height='2vw' value={metadataBaseURI} onChange={(e)=>onMetadataBaseURIValueChange(e)} />
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id='item-part1'>
                    {'업데이트 단위'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='6vw' height='2vw' value={updateUnitNum} onChange={(e)=>onUpdateUnitNumValueChange(e)} />
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <contentStyled.SettingItemArea>
                    <div id="item-part1" style={{height:'12vw', verticalAlign: 'top', marginTop: '1vw'}}>
                        <p>성공한 토큰 그룹(총 {updatedTokenNum}개)</p>
                    </div>
                    <div id="item-part2">
                        <TextArea1 responsive='1.6' value={updatedTokenIDListStr} width="48vw" height="12vw" readOnly={true} />
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea>
                    <div id="item-part1" style={{height:'12vw', verticalAlign: 'top', marginTop: '1vw'}}>
                        <p>남은 토큰 그룹(총 {remainTokenNum}개)</p>
                    </div>
                    <div id="item-part2">
                        <TextArea1 responsive='1.6' value={remainTokenIDListStr} width="48vw" height="12vw" readOnly={true} />
                    </div>
                </contentStyled.SettingItemArea>
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
};

export default NFTUpdateMetadataPanel;