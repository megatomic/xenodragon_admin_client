import React, {useState,useEffect,useCallback} from 'react';
import { CSVLink, CSVDownload } from "react-csv"; 
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as constants from '../../../common/constants';
import * as utils from '../../../common/Utils';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import TextArea1 from '../../../components/TextArea1';
import Table from '../../../components/Table';
import RadioGroup from '../../../components/RadioGroup';
import DropBox from '../../../components/DropBox';
import Popup from '../../../components/Popup';
import NFTGenerateStatePopup from './NFTGenerateStatePopup';
import NFTMintStatePopup from './NFTMintStatePopup';

import useCommon from '../../../store/useCommonStorageManager';
import useAccount from '../../../store/useAccountDataManager';
import useSetting from '../../../store/useSettingDataManager';
import useNFT from '../../../store/useNFTDataManager';
import { toast } from 'react-toastify';

const MINTTOKENMAX_PERREQ = 100; // 한번 민팅시 요청하는 최대 토큰갯수
const MINTING_INTERVAL = 0; // 속성별 민팅시 민팅간 지연시간

const getSettingValueSet = (itemList, groupID, itemName) => {
    for (let item of itemList) {
      if (item.groupID === groupID && item.itemName === itemName) {
        return [item.itemValue1, item.itemValue2, item.itemValue3];
      }
    }
    return [];
  };

const titleText = 'NFT 새 민팅';

const tableHeaderInfo = ['__checkbox','등급','어트리뷰트ID','수량','타입','속성','기타'];

const tableHSpaceTable = '0.5fr 0.8fr 1.2fr 1.2fr 1.2fr 1.2fr 1.2fr';

const makeMintingItemTable = (tokenGenInfo) => {

    const table1=[];
    for(let info of tokenGenInfo) {
        table1.push(['__checkbox','-',info.attributeID.toString(),info.qty.toString(),info.type,'-','-']);
    }
    
    return table1;
};

let mintingCompleteTokenIDList = [];
let mintingRemainTokenIDList = [];

const NFTNewMintPanel = (props) => {

    const [csvData, setCSVData] = useState([]);

    const {startLoading, setStartLoading} = useCommon();
    const {accountInfo, requestChangeMasterPW} = useAccount();
    const {settingInfo, requestSettingList } = useSetting();
    const {nftInfo, initMinting, requestDeleteNFTAttributes, requestSaveMetadataToStorage, requestQueryWalletInfoList, requestNFTListForGroupMinting} = useNFT();
    const [tokenIDList, setTokenIDList] = useState(['1232400000000','1232400000001','1232400000002']);

    const [logID, setLogID] = useState(-1);
    const [curWalletDropID, setCurWalletDropID] = useState(0);
    const [walletInfoList, setWalletInfoList] = useState([]);
    const [walletListDropTable, setWalletListDropTable] = useState([{id:1,name:'지갑을 선택해주세요.'}]);
    const [mintingNumUnit, setMintingNumUnit] = useState(MINTTOKENMAX_PERREQ);

    const [nftType, setNFTType] = useState(0);
    const [packageType, setPackageType] = useState(0);
    const [attributeID, setAttributeID] = useState('');
    const [tokenNumToCreate, setTokenNumToCreate] = useState(0);
    const [mintingComment, setMintingComment] = useState('');
    const [mintingType, setMintingType] = useState(0);

    const [packageIDTable, setPackageIDTable] = useState([]);
    const [tokenIDListPerItemIDTable, setTokenIDListPerItemIDTable] = useState([]);
    const [reqGroupID, setReqGroupID] = useState(props.mintingLogInfo!==null?props.mintingLogInfo.reqGroupID:0);
    const [totalNumToMint, setTotalNumToMint] = useState(0);
    const [attrIDQtyPairList,setAttrIDQtyPairList] = useState([]);
    const [metadataBaseURI, setmMtadataBaseURI] = useState(nftInfo.metadataBaseURI);
    const [targetAddressTable, setTargetAddressTable] = useState(['']);
    const [progressInfo, setProgressInfo] = useState([0,0,0]);
    const [mintingItemTable, setMintingItemTable] = useState(makeMintingItemTable(props.mintingLogInfo===null?[]:props.mintingLogInfo.tokenGenInfo));
    const [mintingItemCheckTable, setMintingItemCheckTable] = useState([]);

    const [mintingStartIndex, setMintingStartIndex] = useState(0);
    const [continueMintingFlag,setContinueMintingFlag] = useState(false);
    const [mintingCompleteTokenIDListStr,setMintingCompleteTokenIDListStr] = useState('');
    const [mintingRemainTokenIDListStr,setMintingRemainTokenIDListStr] = useState('');

    const [generateStatePopupShown,setGenerateStatePopupShown] = useState(false);
    const [mintStatePopupShown,setMintStatePopupShown] = useState(false);
    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [subMenuOpen,setSubMenuOpen] = useState(false);

    const fileReader = new FileReader();

    const onWalletAddressItemClick = (item) => {

        setCurWalletDropID(item.id-1);

        const table = [...targetAddressTable];
        if(item.id === 1) {
            table[0] = "";
        } else {
            table[0] = walletInfoList[item.id-2].walletAddress;
        }

        setTargetAddressTable(table);
    };

    const onPageNoClick = useCallback((event) => {
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

    const onNFTTypeRadioButtonClick = useCallback((idx) => {

        setNFTType(idx);
    });

    const onPackageTypeRadioButtonClick = useCallback((idx) => {

        setPackageType(idx);
    });

    const onDeleteAttributesButtonClick = async (e) => {

        setStartLoading(true);
        const resultInfo = await requestDeleteNFTAttributes({groupID:reqGroupID,mintingCount:props.newMintingCount});
    
        console.log(resultInfo);

        if(resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
        } else {
            toast.info(`NFT 속성정보가 삭제되었습니다.(groupID=${reqGroupID},mintingCount=${props.newMintingCount}`);

            setProgressInfo(table=>[0,0,0]);
        }
        setStartLoading(false);
    };

    const onAttributeIDValueChanged = useCallback((e) => {

        setAttributeID(e.target.value);
    });

    const onTokenNumToCreateValueChanged = useCallback((e) => {

        setTokenNumToCreate(e.target.value);
    });

    const onMintingItemTableCheckBoxChanged = useCallback((checkList) => {

        setMintingItemCheckTable(checkList);
    });

    const onMintingCommentValueChanged = (e) => {
        setMintingComment(e.target.value);
    };

    const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
    };

    const onCancelButtonClick = async (e) => {
        props.onNotiEditModeChange(false);
    };

    const onMintTypeRadioButtonClick = (idx) => {

        if(idx === 2) {

        } else if(idx === 1) {

        } else {

        }

        setMintingType(idx);
    };

    const onAddMintingItemButtonClick = (e) => {

        if(attributeID === null || attributeID.trim().length === 0) {
            toast.info("어트리뷰트ID값이 비었거나 부적절합니다.");
            return;
        }

        if(tokenNumToCreate <= 0) {
            toast.info("생성할 토큰수를 입력하세요.");
            return;
        }

        const curItemTable = [...mintingItemTable];
        curItemTable.push(['__checkbox','-',attributeID,tokenNumToCreate,(nftType===0?'Dragon':'Gear'),'-','-']);
        setMintingItemTable(curItemTable);

        setCSVData(table=>[...table,[attributeID.toString(),(nftType===0?"Dragon":"Gear"),tokenNumToCreate.toString()]]);
    };

    const getTotalTokenNumToCreate = () => {

        let sum = 0;
        mintingItemTable.map((item)=>{sum += parseInt(item[3]);return item});

        return sum;
    };

    const onDeleteMintingItemButtonClick = (e) => {

        const newMintingItemTable = [];
        const newCSVData = [];
        for(let i=0;i<mintingItemCheckTable.length;i++) {
            if(mintingItemCheckTable[i] === false) {
                newMintingItemTable.push(mintingItemTable[i]);
                newCSVData.push([mintingItemTable[i][2].toString(),mintingItemTable[i][4],mintingItemTable[i][3].toString()]);
            }
        }

        setCSVData(newCSVData);
        setMintingItemTable(newMintingItemTable);
    };

    const checkIfValidPackageData = () => {

        let dragonQty = 0;
        let gearQty = 0;
        let dragonNum = 0;
        let gearNum = 0;
        for(let mintingItem of mintingItemTable) {
            
            if(mintingItem[4] === 'Dragon') {
                dragonNum++;
                dragonQty += parseInt(mintingItem[3]);

            } else if(mintingItem[4] === 'Gear') {
                gearNum++;
                gearQty += parseInt(mintingItem[3]);
            }
        }

        console.log('dragonQty=',dragonQty,', gearQty=',gearQty);
        console.log('dragonNum=',dragonNum,',gearNum=',gearNum);
        if(dragonQty !== Math.floor(gearQty/4) || dragonNum !== Math.floor(gearNum/4)) {
            return false;
        } else {
            return true;
        }
    };

    const onCreateNFTAttributeListButtonClick = (e) => {

        if(progressInfo[0] === 1) {
            toast.error('속성이 이미 생성되었습니다. 다시 하려면 "취소"를 선택해서 다시 시작하십시오.');
            return;
        }

        if(mintingItemTable.length === 0) {
            toast.error("생성할 속성정보를 추가하세요.");
            return;
        }

        if(packageType === 1 && checkIfValidPackageData() === false) {
            toast.error('올바른 패키지구성이 아닙니다.');
            return;
        }

        setPopupContent(`총 ${getTotalTokenNumToCreate()}개의 NFT를 생성하시겠습니까?`);
        setPopupShown(true);
    };

    const generatingNFTAttrsCallback = (resultInfo) => {

        //console.log('generatingNFTAttrsCallback() resultInfo=',JSON.stringify(resultInfo,null,2));

        setGenerateStatePopupShown(false);

        if (resultInfo.resultCode === 0) {
            setLogID(resultInfo.data.logID);
            setMintingType(resultInfo.data.totalNum > 1?1:0);
            setTotalNumToMint(resultInfo.data.totalNum);

            if(reqGroupID === 0) {
                setReqGroupID(resultInfo.data.reqGroupID);
            }

            setProgressInfo(table=>[1,table[1],table[2]]);
            setAttrIDQtyPairList(resultInfo.data.idQtyPairList);
            setPackageIDTable(resultInfo.data.packageIDTable);
            setTokenIDListPerItemIDTable(resultInfo.data.tokenIDItemIDPairTable);

            toast.info(`NFT토큰이 ${resultInfo.data.totalNum}개 생성되었습니다.`);

        } else {
            toast.error(resultInfo.message);
        }
    };

    const onMintingRemainTokenIDListChange = (e) => {

        if(continueMintingFlag === true) {
            const tokenIDList2 = e.target.value.split(",");

            const tempList = [];
            for(let tokenID of mintingRemainTokenIDList) {
                if(tokenIDList2.includes(tokenID) === false) {
                    tempList.push(tokenID);
                }
            }

            setMintingStartIndex(index=>index+Math.floor(tempList.length/mintingNumUnit));
            mintingCompleteTokenIDList = [...mintingCompleteTokenIDList,...tempList];

            mintingRemainTokenIDList = tokenIDList2;
            setMintingRemainTokenIDListStr(e.target.value);
        }
    };

    const onPrevRemainTokenIDListAdjustButtonClick = (e) => {

        if(continueMintingFlag === false) {
            return;
        }

        const list1 = mintingCompleteTokenIDList.splice(mintingCompleteTokenIDList.length-mintingNumUnit,mintingNumUnit);
        if(list1 !== null && list1.length > 0) {
            setMintingCompleteTokenIDListStr(utils.makeCommaSeparatedString(mintingCompleteTokenIDList));

            mintingRemainTokenIDList = [...list1,...mintingRemainTokenIDList];
            setMintingRemainTokenIDListStr(utils.makeCommaSeparatedString(mintingRemainTokenIDList));

            setMintingStartIndex(index=>index-1);
        }
    };
    const onNextRemainTokenIDListAdjustButtonClick = (e) => {

        if(continueMintingFlag === false) {
            return;
        }

        const list1 = mintingRemainTokenIDList.splice(0,mintingNumUnit);
        if(list1 !== null && list1.length > 0) {
            setMintingRemainTokenIDListStr(utils.makeCommaSeparatedString(mintingRemainTokenIDList));

            mintingCompleteTokenIDList = [...mintingCompleteTokenIDList,...list1];
            setMintingCompleteTokenIDListStr(utils.makeCommaSeparatedString(mintingCompleteTokenIDList));
    
            setMintingStartIndex(index=>index+1);
        }
    };

    const onGenerateStatePopupCancelButtonClick = (event) => {
        setGenerateStatePopupShown(false);
        toast.info("NFT속성 생성 요청이 취소되었습니다!");
    };

    const mintingNFTCallback = (finished,resultInfo) => {

        if(finished === true) {
            setMintStatePopupShown(false);

            if (resultInfo.resultCode === 0) {
                toast.info('민팅이 완료되었습니다.');
            
                setProgressInfo(table=>[table[0],table[1],1]);
    
                setTimeout(() => {
                    props.onNotiEditModeChange(false);
                },500);
    
            } else {
                toast.error(resultInfo.message);

                const mintedTokenIDList = resultInfo.data.mintedTokenIDList;

                console.log('[민팅중단] tokenIDList on minting=',mintedTokenIDList);
                console.log('[민팅중단] mintingCompleteTokenIDList=',mintingCompleteTokenIDList);
                console.log('[민팅중단] mintingRemainTokenIDList=',mintingRemainTokenIDList);

                // 민팅중 네트워크 또는 서버 오류로 인해 중단된 경우
                if(resultInfo.data.mintingStopped === true) {
                    setContinueMintingFlag(true);
                }
            }
        } else {
            const mintedTokenIDList = resultInfo.data;

            setMintingStartIndex(index=>index+1);

            mintingCompleteTokenIDList = [...mintingCompleteTokenIDList,...mintedTokenIDList];
            setMintingCompleteTokenIDListStr(utils.makeCommaSeparatedString(mintingCompleteTokenIDList));

            mintingRemainTokenIDList = mintingRemainTokenIDList.filter(el => !mintedTokenIDList.includes(el));
            setMintingRemainTokenIDListStr(utils.makeCommaSeparatedString(mintingRemainTokenIDList));
        }
    };

    const onMintStatePopupCancelButtonClick = (event) => {
        setMintStatePopupShown(false);
        toast.info("NFT 민티 요청이 취소되었습니다!");
    };
    
    const onPopupButtonClick = async (buttonIdx) => {

        if (buttonIdx === 0) {
            if(progressInfo[0] === 1 && progressInfo[1] === 1) { // NFT 민팅 요청하기
                
                if(continueMintingFlag === false) {
                    mintingRemainTokenIDList = [...tokenIDList];
                    setMintingRemainTokenIDListStr(utils.makeCommaSeparatedString(tokenIDList));
                }

                onPopupCloseButtonClick(null);
                setMintStatePopupShown(true);

            } else if(progressInfo[0] === 0) { // NFT속성 생성 요청하기

                onPopupCloseButtonClick(null);
                setGenerateStatePopupShown(true);
            } else {
                toast.error("잘못된 요청입니다.");
            }

          } else {
            onPopupCloseButtonClick(null);
          }
    };

    const onPopupCloseButtonClick = (e) => {

        setPopupShown(false);
    };

    const onSaveMetadataToStorageButtonClick = async (e) => {

        if(progressInfo[0] === 0) {
            toast.error("민팅의 이전 단계를 먼저 수행하십시요.(속성 생성)");
            return;
        }

        if(progressInfo[1] === 1) {
            toast.error('이미 메타데이터를 생성하였습니다.');
            return;
        }

        setStartLoading(true);
        const resultInfo = await requestSaveMetadataToStorage({logID:logID,groupID:reqGroupID,desc:mintingComment,mintingCount:props.newMintingCount});
  
        console.log(resultInfo);
        if (resultInfo.resultCode !== 0) {
          toast.error(resultInfo.message);
        } else {
            toast.info('메타데이터가 업로드되었습니다.');

            setProgressInfo(table=>[table[0],1,table[2]]);
            setTokenIDList(resultInfo.data.tokenIDList);
        }

        setStartLoading(false);
    }

    const onStartMintingButtonClick = async (e) => {

        if(!(progressInfo[0] === 1 && progressInfo[1] === 1)) {
            toast.error("민팅의 이전 단계를 먼저 수행하십시요.(속성 생성 또는 메타데이터 저장)");
            return;
        }

        if(targetAddressTable[0] === undefined || targetAddressTable[0].trim() === '') {
            toast.error("지갑을 선택하지 않았거나 민팅할 대상주소가 잘못되었습니다.");
            return;
        }

        if(continueMintingFlag === true) {
            setPopupContent(`총 ${mintingRemainTokenIDList.length}개의 NFT를 이어서 민팅하시겠습니까?`);
        } else {
            setPopupContent(`총 ${tokenIDList.length}개의 NFT를 민팅하시겠습니까?`);
        }
        setPopupShown(true);

        console.log('tokenIDList=',tokenIDList);
    };

    const convertCSVTableToInternal = (table) => {

        const curItemTable = [];
        const table1 = [];
        let itemType;
        let dragonItemNum = 0;
        let gearItemNum = 0;
        for(let item of table) {
            itemType = item[1].replaceAll('"','').trim();
            curItemTable.push(['__checkbox',(item.length >= 5?item[3]:'-'),item[0].replaceAll('"',''),item[2].replaceAll('"',''),itemType,(item.length >= 5?item[4]:'-'),'-']);
            if(item.length >= 5) {
                table1.push([item[0].replaceAll('"',''),item[1].replaceAll('"',''),item[2].replaceAll('"',''),item[3].replaceAll('"',''),item[4].replaceAll('"','')]);
            } else {
                table1.push([item[0].replaceAll('"',''),item[1].replaceAll('"',''),item[2].replaceAll('"',''),"-","-"]);
            }
            const tableHeaderInfo = ['__checkbox','등급','어트리뷰트ID','수량','타입','속성','기타'];

            if(itemType.toUpperCase() === 'DRAGON') {
                dragonItemNum++;
            } else if(itemType.toUpperCase() === 'GEAR') {
                gearItemNum++;
            }
        }
    
        if(dragonItemNum === table.length) {
            setNFTType(0);
        } else if(gearItemNum === table.length) {
            setNFTType(1);
        }

        if(dragonItemNum > 0 && gearItemNum > 0 && dragonItemNum*4 === gearItemNum) {
            setPackageType(1);
        }
        
        setCSVData(table1);
        setMintingItemTable(curItemTable);
    };

    const onLoadCSVFileInfo = (e) => {

        const csvFileToArray = string => {
            const csvRows = string.split("\n");
            const table1=[];
            for(let row of csvRows) {
                const arr2 = row.split(',');
                table1.push(arr2);
            }
        
            convertCSVTableToInternal(table1);
        };

        fileReader.onload = function (event) {
            const text = event.target.result;

            console.log('csvText=',text);

            csvFileToArray(text);
        };

        if(e.target.files !== undefined && e.target.files.length > 0) {
            fileReader.readAsText(e.target.files[0]);
        }
    };

    const onGroupIDItemClick = (item) => {

        if(item.id > 1) {
            setReqGroupID(item.name);
        } else {
            setReqGroupID(0);
        }
    };

    const onDownloadAttributeList = (e) => {

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
        }
        setStartLoading(false);
    };

    const reloadSettingInfo = async () => {
        setStartLoading(true);
        const resultInfo = await requestSettingList();
    
        console.log(resultInfo);
        if (resultInfo.resultCode !== 0) {
          toast.error(resultInfo.message);
        } else {
          const itemList = resultInfo.data;
          let settingInfo = getSettingValueSet(itemList, 'NFT', 'minting_num_unit');

          setMintingNumUnit(parseInt(settingInfo[0]));
        }
        setStartLoading(false);
    };

    useEffect(()=> {
        const fetchData = async () => {
            console.log('metadataBaseURI=',nftInfo.metadataBaseURI);

            initMinting();
            reloadSettingInfo();
            reloadWalletInfoList();
    
            mintingCompleteTokenIDList = [];
            mintingRemainTokenIDList = [];

            // 이어서 민팅할 경우
            if(props.actLogInfo !== null) {

                console.log('props.actLogInfo=',props.actLogInfo);

                setStartLoading(true);
                const resultInfo = await requestNFTListForGroupMinting({groupID:props.actLogInfo.reqGroupID,allStates:true});
                if(resultInfo.resultCode !== 0) {
                    toast.error(resultInfo.message);
                    return;
                }

                setStartLoading(false);

                const tokenIDList = resultInfo.data.tokenIDList;
                const itemInfoList = resultInfo.data.itemInfoList;

                setMintingComment(props.actLogInfo.desc);
                setTotalNumToMint(props.actLogInfo.quantity);

                setPackageType(props.actLogInfo.packageType);

                const mintingAttrInfoList = JSON.parse(props.actLogInfo.data);
                const table1 = [];
                let totalNum = 0;
                const idQtyPairList = [];
                for(let attrInfo of mintingAttrInfoList) {
                    table1.push([attrInfo.attributeID.toString(),attrInfo.type,attrInfo.qty.toString()]);
                    idQtyPairList.push({attributeID:attrInfo.attributeID,type:attrInfo.type,qty:parseInt(attrInfo.qty)});
                    totalNum += parseInt(attrInfo.qty);
                }
                convertCSVTableToInternal(table1);
    
                setLogID(props.actLogInfo.logID);
                setMintingType(totalNum > 1?1:0);
                setTotalNumToMint(totalNum);
                setReqGroupID(props.actLogInfo.reqGroupID);
                setAttrIDQtyPairList(idQtyPairList);
    
                if(props.actLogInfo.packageType === 1) {
                    const packageIDTable = [];
                    const packageInfoTable = JSON.parse(props.actLogInfo.packageData);
                    for(let packageInfo of packageInfoTable) {
                        packageIDTable.push(packageInfo.packageID);
                    }
                    setPackageIDTable(packageIDTable);
                }
    
                const tokenIDItemIDPairTable = [];
                for(let itemInfo of itemInfoList) {
                    tokenIDItemIDPairTable.push([itemInfo.tokenID,itemInfo.attributeID]);
                }

                setTokenIDListPerItemIDTable(tokenIDItemIDPairTable);
    
                console.log("state=",props.actLogInfo.state);
                if(parseInt(props.actLogInfo.state) === 1) { // 속성생성 단계까지 수행한 경우
                    setProgressInfo(table=>[1,0,0]);
    
                } else if(parseInt(props.actLogInfo.state) === 2) { // 메타데이터 업로드 단계까지만 수행한 경우
                    setTokenIDList(tokenIDList);
                    setProgressInfo(table=>[1,1,0]);

                    mintingRemainTokenIDList = [...tokenIDList];
                    setMintingRemainTokenIDListStr(utils.makeCommaSeparatedString(tokenIDList));
                }
            }
        };
        fetchData();
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
                <span id='subtitle'>{titleText}({props.newMintingCount}회차)</span>
                
                <span style={{"position":"relative","right":"0"}}><label style={{"fontSize":"0.9vw"}}><b>1단계({progressInfo[0]===0?"X":"O"})-2단계({progressInfo[1]===0?"X":"O"})-3단계({progressInfo[2]===0?"X":"O"})</b></label></span>
                <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='6vw' height='2vw' onClick={(e)=>onStartMintingButtonClick(e)}>{continueMintingFlag===true?"민팅 이어하기":"민팅 완료하기"}</Button1></span>&nbsp;
                <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='6vw' height='2vw' onClick={(e)=>onCancelButtonClick(e)}>나가기</Button1></span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
            <div id='title'>
                <label style={{paddingTop:'0.4vw',color:'#ff0000'}}>[주의] 라이브 민팅의 경우 반드시 '스마트 컨트랙트 주소'와 '타겟 민팅계정'을 올바로 설정했는지 확인하세요!</label>
                <div></div>
            </div>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
            <div id='title'>
                <label style={{paddingTop:'0.4vw'}}>민팅그룹 ID</label>&nbsp;&nbsp;&nbsp;&nbsp;<DropBox responsive='1.3' enable={progressInfo[0]===1?false:true} width='10vw' height='2vw' fontSize='0.6vw' text={reqGroupID===0?props.groupIDTable[0].name:reqGroupID} itemList={props.groupIDTable} menuItemClick={(item)=>onGroupIDItemClick(item)} />
                <div></div>
            </div>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>1.NFT 토큰 생성하기</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea>
                    <br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>설명</p>
                    </div>
                    <div id="item-part2">
                    <InputField1 responsive='1.6' width='32vw' height='2vw' value={mintingComment} onChange={(e)=>onMintingCommentValueChanged(e)} />
                    </div>
                    <br /><br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>NFT 타입</p>
                    </div>
                    <div id="item-part2">
                        <RadioGroup responsive='1.6' initButtonIndex={nftType} interMargin="0.5vw" buttonWidth="6vw" nameTable={['드래곤','기어']} buttonClicked={(idx) => onNFTTypeRadioButtonClick(idx)} />
                    </div>
                    <br /><br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>패키지 구성</p>
                    </div>
                    <div id="item-part2">
                        <RadioGroup responsive='1.6' initButtonIndex={packageType} interMargin="0.5vw" buttonWidth="8vw" nameTable={['없음','드래곤+기어4종']} buttonClicked={(idx) => onPackageTypeRadioButtonClick(idx)} />
                    </div>
                    <br /><br />
                    <div id='item-part1'>
                        {'어트리뷰트ID'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='10vw' height='2vw' value={attributeID} onChange={(e)=>onAttributeIDValueChanged(e)} />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'생성 토큰수'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='8vw' height='2vw' value={tokenNumToCreate} onChange={(e)=>onTokenNumToCreateValueChanged(e)} />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='6vw' height='2vw' onClick={(e)=>onAddMintingItemButtonClick(e)}>추가하기</Button1>
                        &nbsp;&nbsp;&nbsp;&nbsp;<Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='6vw' height='2vw' onClick={(e)=>onDeleteMintingItemButtonClick(e)}>삭제하기</Button1>

                        <form>
                            <input
                            type={"file"}
                            id={"csvFileInput"}
                            accept={".csv"}
                            onChange={onLoadCSVFileInfo}
                            />
                        </form>
                    </div>
                    <br /><br />
                    <div id='item-part1' style={{"width":"90%"}}>
                    <Table responsive='1.6' colFormat={tableHSpaceTable}
                        headerInfo={tableHeaderInfo}
                        bodyInfo={mintingItemTable}
                        onPageNoClick={onPageNoClick}
                        onGotoFirstPageClick={onGotoFirstPageClick}
                        onGotoPrevPageClick={onGotoPrevPageClick}
                        onGotoNextPageClick={onGotoNextPageClick}
                        onGotoLastPageClick={onGotoLastPageClick}
                        noPageControl={false}
                        recordNumPerPage={10000}
                        totalRecordNum={accountInfo.totalCount}
                        onTableCheckBoxChanged={onMintingItemTableCheckBoxChanged}
                        />
                    </div>
                    <br />
                    <br /><br />
                    <div id='item-part1'>
                    {`생성할 총 토큰수: ${getTotalTokenNumToCreate()}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='6vw' height='2vw' onClick={(e)=>onCreateNFTAttributeListButtonClick(e)}>생성하기</Button1>
                    {progressInfo[0]===1&&<>&nbsp;&nbsp;&nbsp;&nbsp;<Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='11vw' height='2vw' onClick={(e)=>onDeleteAttributesButtonClick(e)}>생성된 토큰목록 삭제하기</Button1></>}
                    
                    &nbsp;&nbsp;&nbsp;&nbsp;<CSVLink filename={"nft_attr_list.csv"} data={csvData}><Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='10vw' height='2vw' onClick={(e)=>onDownloadAttributeList(e)}>속성 테이블 다운로드하기</Button1></CSVLink>
                    {tokenIDListPerItemIDTable.length>0?(
                        <>
                            &nbsp;&nbsp;&nbsp;&nbsp;<CSVLink filename={"attrtoken_pair_list.csv"} data={tokenIDListPerItemIDTable} enclosingCharacter={``}><Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='10vw' height='2vw' onClick={(e)=>onDownloadAttributeList(e)}>토큰 테이블 다운로드하기</Button1></CSVLink>
                        </>
                    ):(
                        <>
                        </>
                    )}
                    </div>
                    <br />
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>2.메타데이터 생성 및 저장하기</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea>
                    <br />
                    <div id='item-part1'>
                        &nbsp;&nbsp;{'사용될 토큰수'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='8vw' height='2vw' value={totalNumToMint} readOnly={true} />
                    </div>
                    <br /><br />
                    <div id='item-part1'>
                    {'메타데이터 URI'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='32vw' height='2vw' value={metadataBaseURI} readOnly={true} />
                    </div>
                    <br /><br />
                    <div id='item-part1'>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'지원 언어'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' readOnly={true} width='12vw' height='2vw' value={'영어'} onChange={(e)=>onAttributeIDValueChanged(e)} />
                    </div>
                    <br /><br /><br />
                    <div id='item-part1' style={{"width":"90%","textAlign":"center"}}>
                    <Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='14vw' height='2vw' onClick={(e)=>onSaveMetadataToStorageButtonClick(e)}>메타데이터 생성 및 저장하기</Button1>
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>3.NFT 민팅하기</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea>
                    <br />
                    <div id='item-part1'>
                        {'민팅할 총 토큰수'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='8vw' height='2vw' value={totalNumToMint} readOnly={true} />
                    </div>
                    <br /><br /><br />

                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>서비스 상태</p>
                    </div>
                    <div id="item-part2">
                        <RadioGroup responsive='1.6' initButtonIndex={mintingType} interMargin="0.5vw" nameTable={['단일','배치','그룹']} buttonClicked={(idx) => onMintTypeRadioButtonClick(idx)} />
                    </div>
                    <br /><br />


                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='1vw'>
                    <div id='item-part1'>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'대상주소'}
                    </div>
                    <div id='item-part2'>
                        <DropBox responsive='1.3' enable={true} width='30vw' height='2vw' fontSize='0.6vw' text={walletListDropTable[curWalletDropID].name} itemList={walletListDropTable} menuItemClick={(item)=>onWalletAddressItemClick(item)} />
                    </div>
                </contentStyled.SettingItemArea>
                {mintingType===2?(
                <contentStyled.SettingItemArea>
                    <div id='item-part1'>
                    <Button1 responsive='1.6' style={{'display':(mintingType!==2?'none':'inline')}} bgColor='var(--btn-primary-color)' width='8vw' height='2vw' onClick={(e)=>onAttributeIDValueChanged(e)}>계정주소 업로드</Button1>
                    &nbsp;&nbsp;&nbsp;&nbsp;<Button1 responsive='1.6' style={{'display':'none'}} bgColor='var(--btn-primary-color)' width='8vw' height='2vw' onClick={(e)=>onAttributeIDValueChanged(e)}>계정주소 목록보기</Button1>
                    </div>
                </contentStyled.SettingItemArea>
                ):(<></>)}
                <br /><br />
            </contentStyled.SettingGroupArea>

            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>민팅에 성공한 토큰ID 목록</label>
                    <div></div>
                </div>
                <br />
                <contentStyled.SettingItemArea bottomMargin="0.6vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>&nbsp;</p>
                    </div>
                    <div id="item-part2">
                        <span><TextArea1 responsive='1.6' value={mintingCompleteTokenIDListStr} width="48vw" height="14vw" readOnly={true} /></span>
                    </div>
                    
                </contentStyled.SettingItemArea>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{width:'53vw',fontSize:'0.9vw',textAlign:'end'}}><label>{mintingCompleteTokenIDList.length}개</label></span>
                
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>민팅 대기중인 토큰ID 목록</label>
                    <div></div>
                </div>
                <br />
                <contentStyled.SettingItemArea bottomMargin="0.6vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>&nbsp;</p>
                    </div>
                    <div id="item-part2">
                        <span><TextArea1 responsive='1.6' value={mintingRemainTokenIDListStr} width="48vw" height="24vw" readOnly={true} /></span>
                    </div>
                </contentStyled.SettingItemArea>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{width:'53vw',fontSize:'0.9vw',textAlign:'end'}}><label>{mintingRemainTokenIDList.length}개</label></span>
                <contentStyled.SettingItemArea leftMargin='14vw'>
                    <div id='item-part1'>
                    <Button1 responsive='1.6'  bgColor='var(--btn-primary-color)' width='8vw' height='2vw' onClick={(e)=>onPrevRemainTokenIDListAdjustButtonClick(e)}>이전 민팅 위치로 이동</Button1>
                    &nbsp;&nbsp;&nbsp;&nbsp;<Button1 responsive='1.6'  bgColor='var(--btn-primary-color)' width='8vw' height='2vw' onClick={(e)=>onNextRemainTokenIDListAdjustButtonClick(e)}>다음 민팅 위치로 이동</Button1>
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <br /><br />
            </contentStyled.ContentBody>
            <Popup
                shown={popupShown}
                popupTypeInfo={{ type: 'YesNo', button1Text: '예', button2Text: '아니오' }}
                title="알림"
                content={popupContent}
                buttonClick={(buttonNo) => onPopupButtonClick(buttonNo)}
                closeClick={onPopupCloseButtonClick}
            />
            <NFTGenerateStatePopup shown={generateStatePopupShown} paramInfo={{groupID:reqGroupID,packageType:parseInt(packageType), mintingComment, mintingCount:props.newMintingCount,mintingItemTable}} callback={generatingNFTAttrsCallback} cancelClick={onGenerateStatePopupCancelButtonClick} />
            <NFTMintStatePopup shown={mintStatePopupShown} paramInfo={{logID,startIndex:mintingStartIndex,mintTokenMaxPerReq:mintingNumUnit,mintingInterval:MINTING_INTERVAL,groupID:reqGroupID,packageType:parseInt(packageType),packageIDTable,mintingComment,newMintingCount:props.newMintingCount,mintingInfoList:[{targetAddress:targetAddressTable[0],tokenIDList}],attrIDQtyPairList}} callback={mintingNFTCallback} cancelClick={onMintStatePopupCancelButtonClick} />
        </contentStyled.ContentWrapper>
    )
};

export default NFTNewMintPanel;