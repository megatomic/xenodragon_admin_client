import React, {useState,useEffect,useCallback} from 'react';
import { CSVLink, CSVDownload } from "react-csv"; 
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as constants from '../../../common/constants';

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

import TokenTransferStatePopup from './TokenTransferStatePopup';

const TRANSFERTOKENMAX_PERREQ = 500;

const getSettingValueSet = (itemList, groupID, itemName) => {
    for (let item of itemList) {
      if (item.groupID === groupID && item.itemName === itemName) {
        return [item.itemValue1, item.itemValue2, item.itemValue3];
      }
    }
    return [];
  };

const titleText = '토큰 대량전송';

const tableHeaderInfo = ['__checkbox','등급','어트리뷰트ID','수량','구분1','구분2','구분3'];

const tableHSpaceTable = '0.5fr 0.8fr 1.2fr 1.2fr 1.2fr 1.2fr 1.2fr';

const TRANSFERUNIT_KSTA_GASFEE = 0.1;
const TRANSFERUNIT_NST_GASFEE = 0.1;
const TRANSFERUNIT_XDC_GASFEE = 0.1;

const makeMintingItemTable = (tokenGenInfo) => {

    const table1=[];
    for(let info of tokenGenInfo) {
        table1.push(['__checkbox','SR',info.attributeID,info.qty.toString(),'Thunder','Thunder','Thunder']);
    }
    
    return table1;
};

const ERC20TokenTransferPanel = (props) => {

    const fileReader = new FileReader();

    const {startLoading, setStartLoading} = useCommon();
    const {nftInfo, requestQueryWalletInfoList} = useNFT();

    const [walletInfoList, setWalletInfoList] = useState([]);
    const [walletListDropTable, setWalletListDropTable] = useState([{id:1,name:'지갑을 선택해주세요.'}]);
    const [curWalletDropID, setCurWalletDropID] = useState(0);

    const [qtyKSTA, setQtyKSTA] = useState(0);
    const [qtyNST, setQtyNST] = useState(0);
    const [qtyXDC, setQtyXDC] = useState(0);
    const [gasFee, setGasFee] = useState(0.0);
    const [targetAddressListStr, setTargetAddressListStr] = useState("");
    const [targetAddressInfoList, setTargetAddressInfoList] = useState([]);
    const [transferGroupUnit, setTransferGroupUnit] = useState(0);

    const [transferCompleteAddressListStr, setTransferCompleteAddressListStr] = useState("");
    const [transferCompleteAddressListNum, setTransferCompleteAddressListNum] = useState(0);
    const [transferFailAddressListStr, setTransferFailAddressListStr] = useState("");
    const [transferFailAddressListNum, setTransferFailAddressListNum] = useState(0);

    const [transferStatePopupShown,setTransferStatePopupShown] = useState(false);
    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [subMenuOpen,setSubMenuOpen] = useState(false);


    const updateGasFee = () => {

        let totalGas = 0.0;
        if(targetAddressInfoList.length > 0) {
            totalGas += TRANSFERUNIT_KSTA_GASFEE*targetAddressInfoList.length;
            if(qtyNST > 0) {
                totalGas += TRANSFERUNIT_NST_GASFEE*targetAddressInfoList.length;
            }
            if(qtyXDC > 0) {
                totalGas += TRANSFERUNIT_XDC_GASFEE*targetAddressInfoList.length;
            }
            setGasFee(totalGas);
        }
    };

    const onQtyKSTAValueChanged = (e) => {
        setQtyKSTA(e.target.value);
        updateGasFee();
    };

    const onQtyNSTValueChanged = (e) => {
        setQtyNST(e.target.value);
        updateGasFee();
    };

    const onQtyXDCValueChanged = (e) => {
        setQtyXDC(e.target.value);
        updateGasFee();
    };

    const onTransferGroupUnitValueChanged = (e) => {
        setTransferGroupUnit(e.target.value);
    };

    const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
    };

    const transferingERC20CoinCallback = (resultInfo) => {

        setTransferStatePopupShown(false);

        if (resultInfo.resultCode === 0) {
            reloadWalletInfoList();

            toast.info(`토큰인 전송되었습니다.`);

            let addressListStr = "";
            for(let address of resultInfo.data.completeAddressList) {
                addressListStr += address + ",";
            }

            setTransferCompleteAddressListNum(resultInfo.data.completeAddressList.length);
            setTransferCompleteAddressListStr(addressListStr);

            // setTimeout(() => {
            //     props.onNotiEditModeChange(false);
            // },500);

        } else {
            toast.error(resultInfo.message,{autoClose:7000});

            let addressListStr = "";
            for(let address of resultInfo.data.completeAddressList) {
                addressListStr += address + ",";
            }

            setTransferCompleteAddressListNum(resultInfo.data.completeAddressList.length);
            setTransferCompleteAddressListStr(addressListStr);

            addressListStr = "";
            for(let address of resultInfo.data.failAddressList) {
                addressListStr += address + ",";
            }

            setTransferFailAddressListNum(resultInfo.data.failAddressList.length);
            setTransferFailAddressListStr(addressListStr);
        }
    };

    const onTransferStatePopupCancelButtonClick = (event) => {
        setTransferStatePopupShown(false);
        toast.info("코인 전송요청이 취소되었습니다!");
    };

    const onPopupButtonClick = async (buttonIdx) => {

        if (buttonIdx === 0) {
            // setStartLoading(true);
            // const resultInfo = await requestTransferNFT({sourceType, groupID:curGroupID, sourceAddress,targetContractAddress,targetAddress,comment,tokenIDList:transferTokenIDList,itemInfoList,marketTrigger:triggerMarketURL});
      
            // console.log(resultInfo);
            // if (resultInfo.resultCode !== 0) {
            //   toast.error(resultInfo.message);
            // } else {
            //     toast.info('전송이 완료드되었습니다.');

            //     setTimeout(() => {
            //         props.onNotiEditModeChange(false);
            //     },500);
            // }
            // setStartLoading(false);
    
            onPopupCloseButtonClick(null);
            setTransferStatePopupShown(true);

          } else {
            onPopupCloseButtonClick(null);
          }
    };

    const onPopupCloseButtonClick = (e) => {

        setPopupShown(false);
    };



    const onTransferButtonClick = async (e) => {

        const ksta = parseInt(walletInfoList[curWalletDropID-1].balanceInfo.ksta);
        const nst = parseInt(walletInfoList[curWalletDropID-1].balanceInfo.nst);
        const xdc = parseInt(walletInfoList[curWalletDropID-1].balanceInfo.xdc);

        const ksta2 = qtyKSTA*targetAddressInfoList.length+gasFee;
        const nst2 = qtyNST*targetAddressInfoList.length;
        const xdc2 = qtyXDC*targetAddressInfoList.length;

        if(ksta < ksta2) {
            toast.error(`KSTA 잔액이 전송 총액보다 작습니다.(전송액:${ksta2}, 잔액:${ksta})`);
            return;
        }

        if(nst < nst2) {
            toast.error(`NST 잔액이 전송 총액보다 작습니다.(전송액:${ksta2}, 잔액:${ksta})`);
            return;
        }

        if(xdc < xdc2) {
            toast.error(`XDC 잔액이 전송 총액보다 작습니다.(전송액:${ksta2}, 잔액:${ksta})`);
            return;
        }

        if(transferGroupUnit <= 0) {
            toast.error('전송 단위값은 0보다 커야 합니다.');
            return;
        }

        const contentInfo=[];
        contentInfo.push(` `);
        contentInfo.push(`인출계정:${walletInfoList[curWalletDropID-1].walletAddress}`);
        contentInfo.push(`주소당비용: ${qtyKSTA}KSTA, ${qtyNST}NST, ${qtyXDC}XDC`);
        contentInfo.push(`주소갯수:${targetAddressInfoList.length}개`);
        contentInfo.push(`예상가스비:${gasFee}`);
        contentInfo.push(`총비용:${qtyKSTA*targetAddressInfoList.length+gasFee}KSTA, ${qtyNST*targetAddressInfoList.length}NST, ${qtyXDC*targetAddressInfoList.length}XDC`);
        contentInfo.push(` `);
        contentInfo.push("코인/토큰을 전송하시겠습니까?");
        contentInfo.push(` `);
    
        setPopupContent(contentInfo);
        setPopupShown(true);
    };

    const onWalletAddressItemClick = (item) => {

        setCurWalletDropID(item.id-1);
    };

    const onTokenIDTableToTransferValueChange = (e) => {

        // setTgtAddressTokenIDListStr(e.target.value);

        // let tokenList = e.target.value.split(',');
        // console.log('tokenList=',tokenList);

        // tokenList = tokenList.filter((item)=>item.trim() !== "");

        // setTgtAddressTokenNum(tokenList.length);
        // setTransferTokenIDList(tokenList);
    };

    const onTargetAddressListValueChanged = (e) => {

        const addressListStr = e.target.value.trim();
        const addressTable = addressListStr.split(",");

        setTargetAddressListStr(addressListStr);
        setTargetAddressInfoList(addressTable);

        if(addressTable.length <= 10) {
            setTransferGroupUnit(addressTable.length);
        }
        console.log('targetAddressTable=',addressTable);
    };

    const onLoadCSVFileInfo = (e) => {

        const csvFileToArray = string => {
            const csvRows = string.split("\n");
            const table1=[];
            let addressListStr="";
            for(let i=0;i<csvRows.length;i++) {
                const arr2 = csvRows[i].split(',');
                if(arr2[0].trim() != 'address' && arr2[0].trim() != '') {
                    table1.push(arr2[0]);
                    addressListStr += arr2[0];
                    if(i+1 < csvRows.length) {
                        addressListStr += ',';
                    }
                }
            }
        
            setTargetAddressListStr(addressListStr);
            setTargetAddressInfoList(table1);

            if(table1.length <= 10) {
                setTransferGroupUnit(table1.length);
            }
        };

        fileReader.onload = function (event) {
            const text = event.target.result;
            csvFileToArray(text);
        };

        if(e.target.files !== undefined && e.target.files.length > 0) {
            fileReader.readAsText(e.target.files[0]);
        }
    };

    const reloadWalletInfoList = async () => {
        setStartLoading(true);
        const resultInfo = await requestQueryWalletInfoList(1);
        if(resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
        } else {
            const walletList = resultInfo.data.list;
            setWalletInfoList(walletList);

            const dropTable = [{id:1,name:'지갑을 선택해주세요.'}];
            for(let i=1;i<=walletList.length;i++) {
                dropTable.push({id:(i+1),name:`${walletList[i-1].walletName} (${walletList[i-1].walletAddress})`});
            }

            setWalletListDropTable(dropTable);
            updateGasFee();
        }
        setStartLoading(false);
    };

    useEffect(()=> {
        reloadWalletInfoList();
    },[]);

    useEffect(()=> {
        props.onSubMenuOpenClicked(subMenuOpen);
    },[subMenuOpen]);

    return (
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader>
            <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
        </MediaQuery>
            <span id='subtitle'>{titleText}</span>
            <span>&nbsp;</span>
            <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='6vw' height='2vw' onClick={(e)=>onTransferButtonClick(e)}>전송하기</Button1></span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
            <div id='title'>
                <label style={{paddingTop:'0.4vw',color:'#ff0000'}}>[주의] 전송전 반드시 소스지갑의 계정주소와 잔액을 확인하세요!<br /></label>
                <br />
            </div>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>1.전송 소스</label>
                    <div></div>
                </div>
                <br />
                <contentStyled.SettingItemArea bottomMargin="1vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>소스 지갑</p>
                    </div>
                    <div id="item-part2" style={{width:'46vw'}}>
                        &nbsp;<DropBox responsive='1.3' enable={true} width='30vw' height='2vw' fontSize='0.6vw' text={walletListDropTable[curWalletDropID].name} itemList={walletListDropTable} menuItemClick={(item)=>onWalletAddressItemClick(item)} />
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin="0.6vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>코인 잔액</p>
                    </div>
                    <div id="item-part2" style={{width:'30vw'}}>
                        {
                            curWalletDropID > 0 ? (
                                <div>
                                    <span>{walletInfoList[curWalletDropID-1].balanceInfo.ksta}</span><span style={{color:'var(--third-color)',fontWeight:'bold'}}>&nbsp;&nbsp;KSTA</span>
                                    &nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;
                                    <span>{walletInfoList[curWalletDropID-1].balanceInfo.nst}</span><span style={{color:'var(--third-color)',fontWeight:'bold'}}>&nbsp;&nbsp;NST</span>
                                    &nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;
                                    <span>{walletInfoList[curWalletDropID-1].balanceInfo.xdc}</span><span style={{color:'var(--third-color)',fontWeight:'bold'}}>&nbsp;&nbsp;XDC</span>
                                </div>
                            ):(
                                <></>
                            )
                        }
                    </div>
                </contentStyled.SettingItemArea>
                <br />
                <contentStyled.SettingItemArea bottomMargin="0.6vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>주소별 전송수량</p>
                    </div>
                    <div id="item-part2">
                        <InputField1 type='number' responsive='1.6' width='8vw' height='2vw' value={qtyKSTA} onChange={(e)=>onQtyKSTAValueChanged(e)} />
                    </div>
                    <div id="item-part2">
                        <p>&nbsp;&nbsp;KSTA</p>
                    </div>
                    <div id="item-part2">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 type='number' responsive='1.6' width='8vw' height='2vw' value={qtyNST} onChange={(e)=>onQtyNSTValueChanged(e)} />
                    </div>
                    <div id="item-part2">
                        <p>&nbsp;&nbsp;NST</p>
                    </div>
                    <div id="item-part2">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 type='number' responsive='1.6' width='8vw' height='2vw' value={qtyXDC} onChange={(e)=>onQtyXDCValueChanged(e)} />
                    </div>
                    <div id="item-part2">
                        <p>&nbsp;&nbsp;XDC</p>
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>2.전송 대상</label>
                    <div></div>
                </div>
                <br />
                <contentStyled.SettingItemArea bottomMargin="0.6vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>&nbsp;</p>
                    </div>
                    <div id="item-part2">
                        <span><TextArea1 responsive='1.6' value={targetAddressListStr} width="48vw" height="14vw" onChange={(e)=>onTargetAddressListValueChanged(e)} /></span>
                    </div>
                    
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin="0.6vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                        <label style={{verticalAlign:"start"}}>&nbsp;</label>
                    </div>
                    <div id="item-part2">
                    <form>
                    <input
                            type={"file"}
                            id={"csvFileInput"}
                            accept={".csv"}
                            onChange={onLoadCSVFileInfo}
                            />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{width:'53vw',fontSize:'0.9vw',textAlign:'end'}}><label>{targetAddressInfoList.length}개</label></span>
                        </form>
                        
                    </div>
                </contentStyled.SettingItemArea>
                <br />
                <contentStyled.SettingItemArea bottomMargin="0.6vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>전송 단위</p>
                    </div>
                    <div id="item-part2">
                        <InputField1 responsive='1.6' type='number' width='8vw' height='2vw' value={transferGroupUnit} onChange={(e)=>onTransferGroupUnitValueChanged(e)} />
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>

            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>3.전송 요약정보</label>
                    <div></div>
                </div>
                <br />
                <contentStyled.SettingItemArea bottomMargin="0vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p style={{fontWeight:'bold'}}>전송 총액</p>
                    </div>
                    <div id="item-part2" style={{width:'30vw'}}>
                        {
                            targetAddressInfoList.length > 0 ? (
                                <div>
                                    <span>{qtyKSTA*targetAddressInfoList.length}</span><span style={{color:'var(--third-color)',fontWeight:'bold'}}>&nbsp;&nbsp;KSTA</span>
                                    &nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;
                                    <span>{qtyNST*targetAddressInfoList.length}</span><span style={{color:'var(--third-color)',fontWeight:'bold'}}>&nbsp;&nbsp;NST</span>
                                    &nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;
                                    <span>{qtyXDC*targetAddressInfoList.length}</span><span style={{color:'var(--third-color)',fontWeight:'bold'}}>&nbsp;&nbsp;XDC</span>
                                </div>
                            ):(
                                <></>
                            )
                        }
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin="0vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p style={{fontWeight:'bold'}}>예상 가스비</p>
                    </div>
                    <div id="item-part2" style={{width:'30vw'}}>
                        <span>{gasFee}</span><span style={{color:'var(--third-color)',fontWeight:'bold'}}>&nbsp;&nbsp;KSTA</span>
                    </div>
                </contentStyled.SettingItemArea>
                <br />
            </contentStyled.SettingGroupArea>

            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>전송에 성공한 주소목록</label>
                    <div></div>
                </div>
                <br />
                <contentStyled.SettingItemArea bottomMargin="0.6vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>&nbsp;</p>
                    </div>
                    <div id="item-part2">
                        <span><TextArea1 responsive='1.6' value={transferCompleteAddressListStr} width="48vw" height="14vw" readOnly={true} /></span>
                    </div>
                    
                </contentStyled.SettingItemArea>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{width:'53vw',fontSize:'0.9vw',textAlign:'end'}}><label>{transferCompleteAddressListNum}개</label></span>
                
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>전송에 실패한 주소목록</label>
                    <div></div>
                </div>
                <br />
                <contentStyled.SettingItemArea bottomMargin="0.6vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>&nbsp;</p>
                    </div>
                    <div id="item-part2">
                        <span><TextArea1 responsive='1.6' value={transferFailAddressListStr} width="48vw" height="14vw" readOnly={true} /></span>
                    </div>
                    
                </contentStyled.SettingItemArea>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{width:'53vw',fontSize:'0.9vw',textAlign:'end'}}><label>{transferFailAddressListNum}개</label></span>
            </contentStyled.SettingGroupArea>
            </contentStyled.ContentBody>
            <Popup
                width={'32vw'}
                shown={popupShown}
                popupTypeInfo={{ type: 'YesNo', button1Text: '예', button2Text: '아니오' }}
                title="알림"
                content={popupContent}
                buttonClick={(buttonNo) => onPopupButtonClick(buttonNo)}
                closeClick={onPopupCloseButtonClick}
            />
            <TokenTransferStatePopup shown={transferStatePopupShown} paramInfo={{transferGroupUnit,senderWalletAddress:(curWalletDropID > 0?walletInfoList[curWalletDropID-1].walletAddress:""),tokenInfo:[qtyKSTA,qtyNST,qtyXDC],targetAddressList:targetAddressInfoList}} callback={transferingERC20CoinCallback} cancelClick={onTransferStatePopupCancelButtonClick} />
        </contentStyled.ContentWrapper>
    )
};

export default ERC20TokenTransferPanel;