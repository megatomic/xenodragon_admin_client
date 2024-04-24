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

import NFTTransferStatePopup from './NFTTransferStatePopup';

const TRANSFERTOKENMAX_PERREQ = 200;

const getSettingValueSet = (itemList, groupID, itemName) => {
    for (let item of itemList) {
      if (item.groupID === groupID && item.itemName === itemName) {
        return [item.itemValue1, item.itemValue2, item.itemValue3];
      }
    }
    return [];
};

const titleText = 'NFT 전송하기';

const tableHeaderInfo = ['__checkbox','등급','어트리뷰트ID','수량','구분1','구분2','구분3'];

const tableHSpaceTable = '0.5fr 0.8fr 1.2fr 1.2fr 1.2fr 1.2fr 1.2fr';

const makeMintingItemTable = (tokenGenInfo) => {

    const table1=[];
    for(let info of tokenGenInfo) {
        table1.push(['__checkbox','SR',info.attributeID,info.qty.toString(),'Thunder','Thunder','Thunder']);
    }
    
    return table1;
};

const NFTNewTransferPanel = (props) => {

    const fileReader = new FileReader();

    // console.log('props.groupIDTable=',props.groupIDTable);

    const {startLoading, setStartLoading} = useCommon();
    const { settingInfo, requestSettingList } = useSetting();

    const [packageFlag, setPackageFlag] = useState(0);
    const [srcAddressTokenNum,setSrcAddressTokenNum] = useState(0);
    const [tgtAddressTokenNum,setTgtAddressTokenNum] = useState(0);
    const [sourceType, setSourceType] = useState(props.transferInfo!==undefined?1:0);
    const [targetType, setTargetType] = useState(0);

    const {nftInfo, requestNFTList, requestQueryMintingLogList, requestNFTListForGroupMinting, requestQueryWalletInfoList} = useNFT();
    const [transferTokenIDList, setTransferTokenIDList] = useState([{targetAddress:"",tokenIDList:[]}]);
    
    const [curWalletDropID, setCurWalletDropID] = useState(0);
    const [walletInfoList, setWalletInfoList] = useState([]);
    const [walletListDropTable, setWalletListDropTable] = useState([{id:1,name:'지갑을 선택해주세요.'}]);
    const [transferingNumUnit, setTransferingNumUnit] = useState(TRANSFERTOKENMAX_PERREQ);

    const [curGroupID,setCurGroupID] = useState('');
    const [groupIDTable, setGroupIDTable] = useState([]);

    const [sourceAddress, setSourceAddress] = useState(props.transferInfo!==undefined?props.transferInfo.sourceAddress:'');
    const [itemInfoList, setItemInfoList] = useState([]);
    const [targetContractAddress, setTargetContractAddress] = useState('');
    const [targetAddress, setTargetAddress] = useState(props.transferInfo!==undefined?props.transferInfo.targetAddress:'');
    const [srcAddressTokenIDListStr, setSrcAddressTokenIDListStr] = useState('');
    const [tgtAddressTokenIDListStr, setTgtAddressTokenIDListStr] = useState('');

    const [packageIDTable, setPackageIDTable] = useState([]);
    const [packageIDListStr, setPackageIDListStr] = useState('');
    const [tgtAddressPackageIDListStr, setTgtAddressPackageIDListStr] = useState('');

    const [targetAddressTableStr, setTargetAddressTableStr] = useState('');
    const [comment, setComment] = useState(props.transferInfo!==undefined?props.transferInfo.comment:'');

    const [triggerMarketURL, setTriggerMarketURL] = useState(0);
    const [transferStatePopupShown,setTransferStatePopupShown] = useState(false);
    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [subMenuOpen,setSubMenuOpen] = useState(false);


    const onWalletAddressItemClick = (item) => {

        setCurWalletDropID(item.id-1);

        setSourceAddress(walletInfoList[item.id-2].walletAddress);
    };

    const onSourceTypeRadioButtonClick = useCallback((idx) => {

        setSourceType(idx);
    });

    const onTargetTypeRadioButtonClick = useCallback((idx) => {

        setTargetType(idx);
    });

    const onMarketURLTriggerRadioButtonClick = useCallback((idx) => {

        setTriggerMarketURL(idx);
    });

    const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
    };

    const onCancelButtonClick = async (e) => {
        props.onNotiEditModeChange(false);
    };

    const onSourceAddressValueChange = (e) => {

        setSourceAddress(e.target.value.trim());
    };

    const onTargetContractAddressValueChange = (e) => {

        setTargetContractAddress(e.target.value.trim());
    };

    const onTargetAddressValueChange = (e) => {

        setTargetAddress(e.target.value.trim());

        setTransferTokenIDList([{targetAddress:e.target.value.trim(),tokenIDList:transferTokenIDList[0].tokenIDList}]);
    };

    const onCommentValueChange = (e) => {

        setComment(e.target.value);
    };

    const transferingNFTAttrsCallback = (resultInfo) => {

        setTransferStatePopupShown(false);

        if (resultInfo.resultCode === 0) {
            toast.info(`토큰인 전송되었습니다.`);

            setTimeout(() => {
                props.onNotiEditModeChange(false);
            },500);

        } else {
            toast.error(resultInfo.message);
        }
    };

    const onTransferStatePopupCancelButtonClick = (event) => {
        setTransferStatePopupShown(false);
        toast.info("NFT 전송 요청이 취소되었습니다!");
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

    const onQueryTokenIDListButtonClick = async (e) => {

        setStartLoading(true);

        let resultInfo;
        if(sourceType === 0) {
            resultInfo = await requestNFTListForGroupMinting({groupID:curGroupID,allStates:false});
          
        } else {
            resultInfo = await requestNFTList({address:sourceAddress,offset:0,queryNum:10000});
            setSourceAddress(sourceAddress);
        }

        console.log("tokenInfoList=",resultInfo);
    
        if (resultInfo.resultCode !== 0) {
          toast.error(resultInfo.message);
        } else {
            let tokenListStr = "";
            let tokenNum = 0;
            const tokenList = [];
            let tokenInfoList = [];
            if(sourceType === 0) {
                tokenInfoList = resultInfo.data.tokenIDList;
                setItemInfoList(resultInfo.data.itemInfoList);
                setSourceAddress(resultInfo.data.targetAddress);

                if(resultInfo.data.itemInfoList.length > 0) {
                    if(resultInfo.data.itemInfoList[0].packageID > 0) {
                        setPackageFlag(1);
                        setTriggerMarketURL(1);

                        const table1=[];
                        for(let itemInfo of resultInfo.data.itemInfoList) {
                            let found = false;
                            for(let pkgID of table1) {
                                if(pkgID === itemInfo.packageID) {
                                    found = true;
                                    break;
                                }
                            }
                            if(found === false) {
                                table1.push(itemInfo.packageID);
                            }
                        }

                        console.log('packageIDTable=',table1);
                        setPackageIDTable(table1);
                        setPackageIDListStr(makePackageIDListStr(table1));

                    } else {
                        setPackageFlag(0);
                        setTriggerMarketURL(0);
                        //console.log('## no package');
                    }
                }
            } else {
                for(let tokenInfo of resultInfo.data.list) {
                    tokenInfoList.push(tokenInfo.tokenID);
                }
            }

            for(let i=0;i<tokenInfoList.length;i++) {
                tokenList.push(tokenInfoList[i]);
                tokenListStr += tokenInfoList[i];
                if(i < tokenInfoList.length - 1) {
                    tokenListStr += ",";
                }
                tokenNum++;
            }

            //console.log('tokenListStr=',tokenListStr);

            setTransferTokenIDList([{targetAddress,tokenIDList:tokenInfoList}]);
            setSrcAddressTokenIDListStr(tokenListStr);
            setSrcAddressTokenNum(tokenNum);

            if(sourceType === 0) {
                setTgtAddressTokenNum(tokenNum);
                setTgtAddressTokenIDListStr(tokenListStr);
            }
        }

        setStartLoading(false);
    }

    const onTransferButtonClick = async (e) => {

        console.log('packageFlag=',packageFlag,', packageIDListStr=',packageIDListStr,', tgtAddressTokenIDListStr=',tgtAddressTokenIDListStr, ',transferTokenIDList[0]=',JSON.stringify(transferTokenIDList[0]));

        if((packageIDListStr.trim() === "" && packageFlag === 1) || (tgtAddressTokenIDListStr.trim() === "" && packageFlag === 0) || transferTokenIDList.length === 0 || transferTokenIDList[0].tokenIDList.length === 0) {
            toast.error(`전송할 토큰ID정보가 올바로 설정되지 않아 전송작업을 수행할 수 없습니다.`);
            return;
        }

        setPopupContent(`총 ${tgtAddressTokenNum}개의 NFT를 전송하시겠습니까?`);
        setPopupShown(true);
    };

    const onSettingAllTokensButtonClick = (e) => {

        if(transferTokenIDList.length === 0) {
            toast.error('먼저 조회 버튼을 눌러 전송할 토큰을 조회하세요.(전송할 토큰수:0)');
            return;
        }

        onTokenIDTableToTransferValueChange({target:{value:srcAddressTokenIDListStr}});
    };

    const onGroupIDItemClick = (item) => {

        setCurGroupID(item.name);
    };

    const makePackageIDListStr = (table) => {

        let tokenListStr = "";
        for(let i=0;i<table.length;i++) {
            tokenListStr += table[i];
            if(i < table.length - 1) {
                tokenListStr += ",";
            }
        }
        return tokenListStr;
    };

    const onPackageIDTableToTransferValueChange = (e) => {

        const pkgIDTable = e.target.value.split(",");
        setPackageIDTable(pkgIDTable);

        setPackageIDListStr(makePackageIDListStr(pkgIDTable));

        const tokenIDTable = [];
        for(let packageID of pkgIDTable) {
            for(let itemInfo of itemInfoList) {
                if(itemInfo.packageID === parseInt(packageID)) {
                    tokenIDTable.push(itemInfo.tokenID);
                }
            }
        }

        setTgtAddressTokenNum(tokenIDTable.length);
        setTransferTokenIDList([{targetAddress,tokenIDList:tokenIDTable}]);
    }
    
    const onTokenIDTableToTransferValueChange = (e) => {

        setTgtAddressTokenIDListStr(e.target.value);

        const srcAddressTokenIDTable = srcAddressTokenIDListStr.split(",");
        const tgtAddressTokenIDTable = e.target.value.trim().split(",");

        console.log('src=',srcAddressTokenIDTable);
        console.log('tgt=',tgtAddressTokenIDTable);

        let found;
        const notFoundTokenIDTable = [];
        for(let i=0;i<tgtAddressTokenIDTable.length;i++) {
            found = false;
            for(let j=0;j<srcAddressTokenIDTable.length;j++) {
                if(srcAddressTokenIDTable[j] === tgtAddressTokenIDTable[i]) {
                    found = true;
                    break;
                }
            }
            if(found === false) {
                setTgtAddressTokenIDListStr("");
                setTransferTokenIDList([{targetAddress,tokenIDList:[]}]);

                toast.error(`토큰ID ${tgtAddressTokenIDTable[i]}를 조회한 토큰목록에서 찾을 수 없어 전송을 수행할 수 없습니다.`,{autoClose:5000});
                return;
            }
        }

        let tokenList = e.target.value.split(',');
        console.log('tokenList=',tokenList);

        tokenList = tokenList.filter((item)=>item.trim() !== "");

        setTgtAddressTokenNum(tokenList.length);
        setTransferTokenIDList([{targetAddress,tokenIDList:tokenList}]);
    };

    const onTargetAddressTableValueChange = (e) => {
        setTargetAddressTableStr(e.target.value);
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
          //setTransferingNumUnit(parseInt(settingInfo[0])); // 임시로 막음

          setTransferingNumUnit(TRANSFERTOKENMAX_PERREQ);
        }
        setStartLoading(false);
    };

    const makeTokenIDListStr = (tokenIDList) => {

        let tokenListStr = "";
        for(let i=0;i<tokenIDList.length;i++) {
            tokenListStr += tokenIDList[i];
            if(i < tokenIDList.length - 1) {
                tokenListStr += ",";
            }
        }

        return tokenListStr;
    };

    const onLoadCSVFileInfo = (e) => {

        const csvFileToArray = string => {
            const csvRows = string.split("\n");
             
            const totalTokenIDList = [];
            const targetInfoTable = [];
            const table1=[];
            for(let row of csvRows) {
                const arr2 = row.split(",");
                let tokenIDList = null;
                for(let i=0;i<targetInfoTable.length;i++) {

                    console.log('arr2[1]=',arr2[1],', targetAddress=',targetInfoTable[i].targetAddress,'..');
    
                    if(arr2[1].trim() === targetInfoTable[i].targetAddress) {
                        console.log('same address!');
                        tokenIDList = targetInfoTable[i].tokenIDList;
                        targetInfoTable.splice(i,1);
                        break;
                    }
                }

                if(tokenIDList === null) {
                    tokenIDList = [];
                }

                tokenIDList.push(arr2[0]);
                targetInfoTable.push({targetAddress:arr2[1].trim(),tokenIDList});
                totalTokenIDList.push(arr2[0]);
            }
        
            console.log('targetInfoTable=',targetInfoTable);

            for(let tokenID1 of totalTokenIDList) {
                let found = false;
                for(let tokenID2 of transferTokenIDList[0].tokenIDList) {
                    if(tokenID1 === tokenID2) {
                        found = true;
                        break;
                    }
                }

                if(found === false) {
                    toast.error(`전송할려는 토큰ID중에 소스주소가 소유하지 않은 토큰이 존재합니다:${tokenID1}`,{autoClose:7000});
                    return;
                }
            }

            setTgtAddressTokenNum(totalTokenIDList.length);

            const tokenListStr = makeTokenIDListStr(totalTokenIDList);

            setTgtAddressTokenIDListStr(tokenListStr);

            setTgtAddressTokenNum(totalTokenIDList.length);
            setTargetAddressTableStr(JSON.stringify(targetInfoTable,null,2));
            setTransferTokenIDList(targetInfoTable);
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
        }
        setStartLoading(false);
    };

    useEffect(()=> {
        
        const fetchData = async() => {
            setStartLoading(true);
            const resultInfo = await requestQueryMintingLogList({ activityType:constants.NFT_ACTIVITYTYPE_MINTING, pageNo: 1, queryNum:0 });
        
            console.log('mintingLogList=',resultInfo.data.list);
            if (resultInfo.resultCode === 0) {
              const reqGroupList = [];
              for(let i=1;i<=resultInfo.data.list.length;i++) {
                let found = false;
                for(let reqGroup of reqGroupList) {
                    if(reqGroup.name === resultInfo.data.list[i-1].reqGroupID) {
                        found = true;
                        break;
                    }
                }

                if(found === false) {
                    reqGroupList.push({id:i,name:resultInfo.data.list[i-1].reqGroupID});
                }
              }
  
              setGroupIDTable(reqGroupList);

              if(reqGroupList.length > 0) {
                setCurGroupID(reqGroupList[0].name);
              }
  
            } else {
              toast.error(resultInfo.message);
            }

            await reloadSettingInfo();

            await reloadWalletInfoList();

            setStartLoading(false);
        };

        if(props.transferInfo === undefined) {
            fetchData();
        }
    },[]);

    useEffect(()=> {
        console.log('packageFlag=',packageFlag);
    },[packageFlag]);

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
            <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='6vw' height='2vw' onClick={(e)=>onCancelButtonClick(e)}>취소하기</Button1></span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
            <div id='title'>
                <label style={{paddingTop:'0.4vw',color:'#ff0000'}}>[주의] 라이브 전송의 경우 반드시 '타겟 주소'를 올바로 설정했는지 확인하세요!<br />[주의] 패키지 NFT인 경우 반드시 4.전송옵션의 마켓 트리거를 '호출함'으로 설정해주세요!</label>
                <br />
            </div>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>NFT 스마트컨트랙트 정보</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea>
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'top' }}>
                    <div style={{paddingTop:'0.7vw'}}>&nbsp;&nbsp;<label>주소</label></div>
                    </div>
                    <div id="item-part2">
                    <InputField1 responsive='1.6' width='32vw' height='2vw' value={props.contractAddress} readOnly={true} />
                    </div>
                    <br />
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>

            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>

            </contentStyled.SettingGroupArea>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>1.소스 계정주소 설정하기</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea>
                    <br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>소스 타입</p>
                    </div>
                    <div id="item-part2">
                        <RadioGroup responsive='1.6' initButtonIndex={sourceType} interMargin="0.5vw" buttonWidth="6vw" nameTable={['민팅그룹 ID','지갑 지정']} buttonClicked={(idx) => onSourceTypeRadioButtonClick(idx)} />
                    </div>
                    <br />
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin="1vw">
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>{sourceType === 0?"그룹 ID":"소스 지갑"}</p>
                    </div>
                    <div id="item-part2" style={{width:'46vw'}}>
                        {sourceType === 0?(
                            <DropBox responsive='1.3' enable={true} width='10vw' height='2vw' fontSize='0.6vw' text={curGroupID} itemList={groupIDTable} menuItemClick={(item)=>onGroupIDItemClick(item)} />
                        ):(
                            <DropBox responsive='1.3' enable={true} width='30vw' height='2vw' fontSize='0.6vw' text={walletListDropTable[curWalletDropID].name} itemList={walletListDropTable} menuItemClick={(item)=>onWalletAddressItemClick(item)} />
                        )}
                    &nbsp;&nbsp;&nbsp;<Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='6vw' height='2vw' onClick={(e)=>onQueryTokenIDListButtonClick(e)}>조회</Button1>
                    </div>
                </contentStyled.SettingItemArea>
                {sourceType === 0?(
                    <contentStyled.SettingItemArea>
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>소유 주소</p>
                    </div>
                    <div id="item-part2">
                    <InputField1 responsive='1.6' width='32vw' height='2vw' value={sourceAddress} readOnly={true} />
                    </div>
                    </contentStyled.SettingItemArea>
                ):(<div></div>)}
                <contentStyled.SettingItemArea>
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>&nbsp;</p>
                    </div>
                    <div id="item-part2">
                    <TextArea1 responsive='1.6' value={srcAddressTokenIDListStr} width="48vw" height="6vw" readOnly={true} />
                    </div>
                    <br />
                    <div style={{width:'53vw',fontSize:'0.9vw',textAlign:'end'}}><label>{srcAddressTokenNum}개</label></div>
                    {sourceType !== 0?(
                    <div style={{display:'flex',width:'100%',justifyContent:'center'}}><Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='14vw' height='2vw' onClick={(e)=>onSettingAllTokensButtonClick(e)}>모두 전송할 토큰으로 설정하기</Button1></div>
                    ):(<div></div>)}

                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>2.전송할 수량/토큰ID/패키지ID 설정하기</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea>
                    <br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'top' }}>
                        {sourceType === 0?(
                            packageFlag === 0?(
                                <div style={{paddingTop:'0.7vw'}}>&nbsp;&nbsp;<label>수량</label></div>
                            ):(
                                <div style={{paddingTop:'0.7vw'}}>&nbsp;&nbsp;<label>패키지ID</label></div>
                            )
                        ):(
                            <div style={{paddingTop:'1vw'}}>&nbsp;&nbsp;<label>토큰 ID</label></div>
                        )}
                    </div>
                    <div id="item-part2">
                        {sourceType === 0?(
                            packageFlag === 0?(
                                <InputField1 responsive='1.6' width='8vw' height='2vw' value={tgtAddressTokenNum} readOnly={true} />
                            ):(
                                <TextArea1 responsive='1.6' value={packageIDListStr} width="48vw" height="6vw" onChange={(e)=>onPackageIDTableToTransferValueChange(e)} />
                            )
                        ):(
                            <TextArea1 responsive='1.6' value={tgtAddressTokenIDListStr} width="48vw" height="6vw" onChange={(e)=>onTokenIDTableToTransferValueChange(e)} />
                        )}
                    </div>
                    <br />
                    {sourceType !== 0 ? (
                        <div style={{width:'53vw',fontSize:'0.9vw',textAlign:'end'}}><label>{tgtAddressTokenNum}개</label></div>
                    ):(<div></div>)}
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>3.대상 계정주소 설정하기</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea bottomMargin='1vw'>
                    <br />
                    <div id='item-part1'>
                    {'대상 컨트랙트 주소'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='32vw' height='2vw' value={targetContractAddress} onChange={(e)=>onTargetContractAddressValueChange(e)} />

                    </div>
                </contentStyled.SettingItemArea>
                <br />
                <contentStyled.SettingItemArea bottomMargin='1vw'>
                    <div id='item-part1'>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'대상주소 타입'}
                    </div>
                    <div id='item-part2'>
                    <RadioGroup responsive='1.6' initButtonIndex={targetType} interMargin="0.5vw" buttonWidth="6vw" nameTable={['단일 주소','주소 테이블']} buttonClicked={(idx) => onTargetTypeRadioButtonClick(idx)} />
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='1vw'>
                    {targetType === 1?(
                    <div id="item-part1" style={{ marginLeft:'7.3vw', width:'5vw', verticalAlign: 'top' }}>
                    <form>
                            <input
                            type={"file"}
                            id={"csvFileInput"}
                            accept={".csv"}
                            onChange={onLoadCSVFileInfo}
                            />
                        </form>
                    </div>
                    ):(<></>)}
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='1vw'>
                    <div id="item-part1" style={{ width:'5vw', verticalAlign: 'top' }}>
                            {targetType === 0?(
                                <div style={{paddingTop:'0.7vw'}}>&nbsp;&nbsp;<label>대상 계정주소</label></div>
                            ):(
                                <div style={{paddingTop:'1vw'}}>&nbsp;&nbsp;<label>주소 테이블</label></div>
                            )}
                    </div>
                    <div id="item-part2">
                        {targetType === 0?(
                            <InputField1 responsive='1.6' width='32vw' height='2vw' value={targetAddress} onChange={(e)=>onTargetAddressValueChange(e)} />
                        ):(
                            <TextArea1 responsive='1.6' value={targetAddressTableStr} width="48vw" height="15vw" readOnly={true} onChange={(e)=>onTargetAddressTableValueChange(e)} />
                        )}
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea>
                    <div id='item-part1'>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'태그'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='22vw' height='2vw' value={comment} onChange={(e)=>onCommentValueChange(e)} />

                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <div id='title'>
                    <label>4.전송 옵션</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea bottomMargin='1vw'>
                    <br />
                    <div id='item-part1'>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'마켓 트리거'}

                    </div>
                    <div id="item-part2">
                        <RadioGroup responsive='1.6' initButtonIndex={triggerMarketURL} interMargin="0.5vw" buttonWidth="6vw" nameTable={['호출않함','호출함']} buttonClicked={(idx) => onMarketURLTriggerRadioButtonClick(idx)} />
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
            <NFTTransferStatePopup shown={transferStatePopupShown} paramInfo={{transNumUnit:transferingNumUnit, sourceType, groupID:curGroupID, sourceAddress,targetContractAddress,comment,tokenInfoList:transferTokenIDList,itemInfoList,packageIDTable,marketTrigger:triggerMarketURL}} callback={transferingNFTAttrsCallback} cancelClick={onTransferStatePopupCancelButtonClick} />
        </contentStyled.ContentWrapper>
    )
};

export default NFTNewTransferPanel;