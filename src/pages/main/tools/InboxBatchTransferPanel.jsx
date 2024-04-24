
import React, {useState,useRef, forwardRef, useCallback, useMemo,useEffect} from 'react';

import MediaQuery from 'react-responsive';
import * as constants from '../../../common/constants';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from '../messages/InboxMessageManagePageStyles';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import TextArea1 from '../../../components/TextArea1';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useMessage from '../../../store/useMessageDataManager';
import {enumLangCode,getLangValue,getLangCode,getTitle,getContent,getDefaultTable} from '../notifications/NotificationManageContainer';
import { CSVLink, CSVDownload } from "react-csv"; 
import dayjs from 'dayjs';
import * as utils from '../../../common/js/utils';
import { toast } from 'react-toastify';

const dragonTextInfo = {
    title:"Reward for Dragon Purchase",
    content:"Gem: 2000 \n Play Energy: 500"
};

const gearTextInfo = {
    title:"Reward for Gear Purchase",
    content:"Gem: 2000 \n Play Energy: 500"
};

const packageTextInfo = {
    title:"Reward for Package Purchase",
    content:"Gem: 2000 \n Play Energy: 500"
};

const titleText = "우편함 배치 전송하기";

let transferCancelFlag = false;
let onTransferFlag = false;
let fakeMode = false;

const InboxBatchTransferPanel = (props) => {

    const fileReader = new FileReader();

    const { startLoading, setStartLoading } = useCommon();
    const { msgList, requestNewMessage } = useMessage();
    const [sendType, setSendType] = useState(constants.MSGTARGET_TYPE_USER);
    const [totalTransferNum, setTotalTransferNum] = useState(0);
    const [firstUserID, setFirstUserID] = useState("");
    const [lastUserID, setLastUserID] = useState("");
    const [transferingNo, setTransferingNo] = useState(0);
    const [transferingUserID, setTransferingUserID] = useState('');
    const [transferingRewardInfo,setTransferingRewardInfo] = useState('');
    const [targetUserIDTable,setTargetUserIDTable] = useState('');
    const [rewardInfo, setRewardInfo] = useState([]);

    const [title,setTitle] = useState('');
    const [content,setContent] = useState('');

    const [transferStartingNo, setTransferStartingNo] = useState(1);
    const [rewardTransferInfoTable, setRewardTransferInfoTable] = useState([]);
    const [transferResultInfo, setTransferResultInfo] = useState({});

    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [popupID, setPopupID] = useState('');

    const onSubMenuClick = (e) => {
        //setSubMenuOpen(state=>!subMenuOpen);
    };

    const onTitleValueChanged = (e) => {
        setTitle(e.target.value);
    };

    const onContentValueChanged = (e) => {
        setContent(e.target.value);
    };

    const onTotalTransferNumValueChanged = (e) => {

        setTotalTransferNum(e.target.value);
    };

    const onTransferStartingNoValueChanged = (e) => {

        setTransferStartingNo(e.target.value);
    };

    const onTansferCancelButtonClick = async (e) => {
        transferCancelFlag = true;
    };

    const sendFake = async (count,userID,titleTable,contentTable,rewardInfo) => {

        return new Promise(function(resolve,reject) {
            console.log(`[${count}] userID=${userID}, titleTable=${JSON.stringify(titleTable)}, contentTable=${JSON.stringify(contentTable)}, rewardInfo=${JSON.stringify(rewardInfo)}`);
            setTimeout(() => {
                resolve({resultCode:0,message:"",data:null});
            },200);
        });
    };

    const onTansferStartButtonClick = async (e) => {

        if(onTransferFlag === true) {
            toast.error('전송중에는 전송버튼을 누르지 마세요.');
            return;
        }

        if(totalTransferNum === 0 || rewardTransferInfoTable.length === 0) {
            toast.error('전송할 유저목록이 로드되지 않았습니다.');
            return;
        }

        if(title.trim() === "" || content.trim() === "") {
            toast.error('제목 또는 내용이 입력되지 않았습니다.');
            return;
        }

        setPopupContent("우편함 배치전송을 시작하시겠습니까?");
        setPopupShown(true);
        setPopupID("start");
    };

    const onLoadCSVFileInfo = (e) => {

        setRewardTransferInfoTable(table=>[]);
        setTotalTransferNum(num=>0);
        
        const csvFileToArray = string => {
            const csvRows = string.split("\n");
             
            const sendTable=[];
            let count = 0;
            for(let row of csvRows) {
                const arr2 = row.split(',');

                const table1 = arr2[3].split("-");
                const rewardTable = [];
                for(let item of table1) {
                    const table2 = item.split(":");
                    const itemInfo = {ItemType:parseInt(table2[0]),ItemID:parseInt(table2[1]),Quantity:parseInt(table2[2])};
                    rewardTable.push({...itemInfo});
                }
                sendTable.push({count:arr2[0],userID:arr2[1].trim(),itemType:arr2[2],rewardInfo:[...rewardTable]});

                if(count === 0) {
                    setFirstUserID(arr2[1].trim());
                    setTransferingUserID(arr2[1].trim());
                    setTransferingRewardInfo(JSON.stringify(rewardTable));

                } else if(count+1 >= csvRows.length) {
                    setLastUserID(arr2[1].trim());
                }
                count++;
            }
        
            setRewardTransferInfoTable(sendTable);
            setTotalTransferNum(count);
            // setCSVData(table1);
            // setMintingItemTable(curItemTable);
        };

        fileReader.onload = function (event) {
            const text = event.target.result;
            csvFileToArray(text);
        };

        if(e.target.files !== undefined && e.target.files.length > 0) {
            fileReader.readAsText(e.target.files[0]);
        }
    };

    const onPopupButtonClick = async (buttonIdx) => {

        console.log('buttonIndex=',buttonIdx);

        if (buttonIdx === 0) {

            onPopupCloseButtonClick(null);
            onTransferFlag = true;
            transferCancelFlag = false;
    
            let transferedCount = 0;
            for await (const sendInfo of rewardTransferInfoTable) {    
    
                if(parseInt(transferStartingNo) <= sendInfo.count) {
                    setTransferingNo(sendInfo.count);
                    setTransferingUserID(sendInfo.userID);
                    setTransferingRewardInfo(JSON.stringify(sendInfo.rewardInfo));
        
                    const titleTable = [{langCode:10, langValue:getLangValue(10), content:""}];
                    const contentTable = [{langCode:10, langValue:getLangValue(10), content:""}];
                    if(sendInfo.itemType === 'dragon') {
                        titleTable[0].content = title;
                        contentTable[0].content = content;
        
                    } else if(sendInfo.itemType === 'gear') {
                        titleTable[0].content = title;
                        contentTable[0].content = content;
        
                    } else {
                        titleTable[0].content = title;
                        contentTable[0].content = content;
                    }
        
                    let resultInfo;
                    if(fakeMode === true) {
                        resultInfo = await sendFake(sendInfo.count, sendInfo.userID, titleTable, contentTable, sendInfo.rewardInfo);
                    } else {
    
                        console.log('sendInfo.rewardInfo=',sendInfo.rewardInfo);
                        
                        //sendInfo.userID = '08b4de47-a81c-4fdd-8384-e07a7e29dd42';//'c08c5403-101e-44d0-b472-535c52a06a36';
                        resultInfo = await requestNewMessage({
                            msgType: constants.MESSAGE_TYPE_INBOX,
                            targetType: sendType,
                            targetUserID: sendInfo.userID,
                            targetUserIDTable: [sendInfo.userID],
                            presetTitle:`nft_reward${sendInfo.count}`,
                            langPresetID: '0',
                            rewardPresetID: '0',
                            titleTable: titleTable,
                            contentTable: contentTable,
                            reservationFlag: "1",
                            startTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
                            endTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
                            liveFlag: '1',
                            rewardData:sendInfo.rewardInfo
                        });
                    }
        
                    setTransferResultInfo(JSON.stringify(resultInfo));
    
                    //console.log("flag=",transferCancelFlag);
                    if(resultInfo.resultCode !== 0 || transferCancelFlag === true) {
                        if(resultInfo.resultCode !== 0) {
                            toast.error('서버 오류로 전송이 중지되었습니다.');
                        } else {
                            toast.error('중지버튼에 의해 강제로 중지되었습니다.');
                        }
                        onTransferFlag = false;
                        break;
                    } else {
                        transferedCount++;
                        if(transferedCount >= parseInt(totalTransferNum)) {
                            toast.info('목표 갯수까지 전송이 완료되었습니다.');
                            onTransferFlag = false;
                            break;
                        }
                    }
                }
            }
        } else {
            onPopupCloseButtonClick(null);
        }
    };

    const onPopupCloseButtonClick = async (e) => {

        setPopupID('');
        setPopupShown(false);
    };
    
    return (
    <contentStyled.ContentWrapper>
    <contentStyled.ContentHeader>
    <MediaQuery maxWidth={768}>
        &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
    </MediaQuery>
    <span id="subtitle">{titleText}</span>
        <span>&nbsp;</span>
        <span id="button">
          <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onTansferStartButtonClick(e)}>
            전송하기
          </Button1>
        </span>
        <span id="button">
          <Button1 responsive='1.6' bgColor="var(--btn-secondary-color)" width="6vw" height="2vw" onClick={(e) => onTansferCancelButtonClick(e)}>
            취소하기
          </Button1>
        </span>
    </contentStyled.ContentHeader>
    <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

    <contentStyled.ContentBody>
    <br />
        <form>
        <input
        type={"file"}
        id={"csvFileInput"}
        accept={".csv"}
        onChange={onLoadCSVFileInfo}
        />
    </form>
        <styled.InputArea leftMargin='4vw' width='70%'>
            <span className="row1">
                <label>제목</label>
            </span>
            <span className="row2">
            <InputField1 responsive='1.6' value={title} width='30vw' height='2vw' onChange={(e)=>onTitleValueChanged(e)} />
            </span>
            <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <styled.InputArea leftMargin='4vw' width='70%'>
            <span className="row1">
                <label>내용</label>
            </span>
            <span className="row2">
            <TextArea1 responsive='1.6' value={content} width='30vw' height='10vw' onChange={(e)=>onContentValueChanged(e)} />
            </span>
            <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <styled.InputArea leftMargin='4vw' width='90%'>
            <span className="row1">
                <label>총 전송할 갯수</label>
            </span>
            <span className="row2" style={{width:"7vw"}}>
            <InputField1 responsive='1.6' value={totalTransferNum} width='6vw' height='2vw' onChange={(e)=>onTotalTransferNumValueChanged(e)} />
            </span>
            {firstUserID.trim()!=='' && (<span className="row2" style={{width:"28vw",marginTop:'0.6vw'}}>유저ID: {firstUserID} ~ {lastUserID})</span>)}
            <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <styled.InputArea leftMargin='4vw' width='70%'>
            <span className="row1">
                <label>다음 전송할 번호</label>
            </span>
            <span className="row2">
            <InputField1 responsive='1.6' value={transferStartingNo} width='6vw' height='2vw' onChange={(e)=>onTransferStartingNoValueChanged(e)} />
            </span>
            <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <styled.InputArea leftMargin='4vw' width='70%'>
            <span className="row1">
                <label>전송중인 번호</label>
            </span>
            <span className="row2" style={{marginTop:'0.5vw'}}>
            {transferingNo}&nbsp;/&nbsp;{totalTransferNum}
            </span>
            <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <styled.InputArea leftMargin='4vw' width='70%'>
            <span className="row1">
                <label>전송중인 유저ID</label>
            </span>
            <span className="row2">
            <InputField1 responsive='1.6' value={transferingUserID} width='26vw' height='2vw' readOnly={true} />
            </span>
            <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <styled.InputArea leftMargin='4vw' width='70%'>
            <span className="row1">
                <label>전송중인 보상내역</label>
            </span>
            <span className="row2">
            <TextArea1 responsive='1.6' value={transferingRewardInfo} width='30vw' height='6vw' readOnly={true} />
            </span>
            <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <br />
        <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
        <br /><br />
        <styled.InputArea leftMargin='4vw' width='70%'>
            <span className="row1">
                <label>전송결과</label>
            </span>
            <span className="row2">
            <TextArea1 responsive='1.6' value={transferResultInfo} width='30vw' height='8vw' readOnly={true} />
            </span>
            <span className="row3">&nbsp;</span>
        </styled.InputArea>
        <Popup
                shown={popupShown}
                popupTypeInfo={{ type: 'YesNo', button1Text: '예', button2Text: '아니오' }}
                title="알림"
                width="30vw"
                content={popupContent}
                buttonClick={(buttonNo) => onPopupButtonClick(buttonNo)}
                closeClick={onPopupCloseButtonClick}
            />
    </contentStyled.ContentBody>
    </contentStyled.ContentWrapper>)
};

export default InboxBatchTransferPanel;