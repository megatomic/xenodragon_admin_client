import React, {useState,useEffect,useCallback} from 'react';
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as pageStyled from './NFTContentPageStyles';
import * as Utils from '../../../common/Utils';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import Table from '../../../components/Table';
import RadioGroup from '../../../components/RadioGroup';
import TextArea1 from '../../../components/TextArea1';

import useCommon from '../../../store/useCommonStorageManager';
import useAccount from '../../../store/useAccountDataManager';
import useNFT from '../../../store/useNFTDataManager';
import { toast } from 'react-toastify';

const titleText = 'NFT 보유자 조회';

const NFTOwnerQueryPanel = (props) => {

    const {startLoading, setStartLoading} = useCommon();
    const {nftInfo, requestNFTList, requestOwnerOfNFT, requestNFTCurPropInfo, downloadMetadata} = useNFT();
    const [accountAddress, setAccountAddress] = useState('');
    const [ownerTokenID, setOwnerTokenID] = useState('');
    const [nftInfoList, setNFTInfoList] = useState([]);
    const [filteredNFTInfoList, setFilteredNFTInfoList] = useState([]);
    const [loadingStateInfo, setLoadingStateInfo] = useState('');

    const [totalNFTNum, setTotalNFTNum] = useState(0);
    const [lowerRange, setLowerRange] = useState(1);
    const [upperRange, setUpperRange] = useState(500);
    const [queryNFTNum, setQueryNFTNum] = useState(0);
    const [dragonNFTNum, setDragonNFTNum] = useState(0);
    const [gearNFTNum, setGearNFTNum] = useState(0);

    const [queryType, setQueryType] = useState(0);
    const [nftType, setNFTType] = useState(0);
    const [gradeType, setGradeType] = useState(0);
    const [gearType, setGearType] = useState(0);
    const [attrType, setAttrType] = useState(0);

    const [ownedTokenIDList, setOwnedTokenIDList] = useState([]);
    const [ownedTokenIDListStr, setOwnedTokenIDListStr] = useState('');

    const [filteredTokenIDStr, setFilteredTokenIDStr] = useState('');
    const [filteredTokenIDTable, setFilteredTokenIDTable] = useState([]);
    
    const [tokenIDListStrInResult,setTokenIDListStrInResult] = useState('');

    const onQueryTypeButtonClick = useCallback((idx) => {

        setQueryType(idx);
    });

    const onNFTTypeRadioButtonClick = useCallback((idx) => {

        setNFTType(idx);
    });

    const onGradeTypeRadioButtonClick = useCallback((idx) => {

        setGradeType(idx);
    });

    const onGearTypeRadioButtonClick = useCallback((idx) => {

        setGearType(idx);
    });

    const onAttrTypeRadioButtonClick = useCallback((idx) => {
        
        setAttrType(idx);
    });

    const onFilteredTokenIDStrValueChanged = useCallback((e) => {

        setFilteredTokenIDStr(e.target.value);

        let tokenIDTable = e.target.value.trim().split(',');

        console.log('tokenIDTable=',tokenIDTable);

        if(tokenIDTable.length > 0 && tokenIDTable[0].trim() === '') {
            tokenIDTable = [];
        }

        setFilteredTokenIDTable(tokenIDTable);
    });

    const onQueryPrevNFTListButtonClick = (e) => {
        const queryNum = upperRange - lowerRange + 1;
        let newUpperRange = lowerRange - 1;
        let newLowerRange = newUpperRange - queryNum + 1;

        if(newUpperRange > 0) {
            if(newLowerRange < 1) {
                newLowerRange = 1;
            }

            setUpperRange(newUpperRange);
            setLowerRange(newLowerRange);
            onQueryNFTListButtonClick(null);
        }
    };

    const onQueryNextNFTListButtonClick = (e) => {
        const queryNum = upperRange - lowerRange + 1;
        let newLowerRange = upperRange+1;
        let newUpperRange = newLowerRange + queryNum - 1;
        
        if(newLowerRange <= totalNFTNum) {
            if(newUpperRange > totalNFTNum) {
                newUpperRange = totalNFTNum;
            }

            setUpperRange(newUpperRange);
            setLowerRange(newLowerRange);
            onQueryNFTListButtonClick(null);
        }
    };

    const onLowerRangeValueChanged = (e) => {

        const value = parseInt(e.target.value);
        if(value > upperRange) {
            toast.error('낮은 범위는 높은 범위보다 같거나 작은 값이어야 합니다.');
        }

        if(value === NaN) {
            value = 1;
        }
        setLowerRange(value);
    };

    const onUpperRangeValueChanged = (e) => {

        console.log(e.target.value);
        let value = parseInt(e.target.value);
        if(value < lowerRange) {
            toast.error('높은 범위는 낮은 범위보다 같거나 큰 값이어야 합니다.');
        }

        if(value === NaN) {
            value = 1;
        }
        setUpperRange(value);
    };

    const onSubMenuClick = (e) => {
        //setSubMenuOpen(state=>!subMenuOpen);
    };

    const onOwnerAddressValueChanged = (e) => {
        setAccountAddress(e.target.value);
    };

    const onTokenIDListInResultValueChanged = (e) => {
        setTokenIDListStrInResult(e.target.value);
    };

    const onQueryInResultButtonClick = (e) => {

        const tokenIDList = tokenIDListStrInResult.split(',');
        if(tokenIDList.length === 0) {
            toast.error('조회할 토큰ID목록을 입력하세요.');
            return;
        }

        let found;
        const foundTokenIDList = [];
        for(let queryTokenID of tokenIDList) {
            found = false;
            for(let ownedTokenID of ownedTokenIDList) {
                if(ownedTokenID.trim() === queryTokenID.trim()) {
                    found = true;
                    break;
                }
            }
            if(found === true) {
                foundTokenIDList.push(queryTokenID);
            }
        }

        if(foundTokenIDList.length === tokenIDList.length) {
            toast.info('입력된 모든 토큰ID가 결과값에 포함되어 있습니다.');
        } else if(foundTokenIDList.length === 0) {
            toast.info('입력된 토큰ID들이 결과값에 하나도 포함되어 있지 않습니다.');
        } else {
            toast.info(`포함된 토큰ID:${JSON.stringify(foundTokenIDList)}(갯수:${foundTokenIDList.length})`,{autoClose:7000});
        }
    };

    const onOwnerTokenIDValueChanged = (e) => {
        setOwnerTokenID(e.target.value);
    }

    const generateFilteredNFTInfoList = (nftInfoTable) => {

        const nftList = [];
        const arr1=[0,1,2,3];
        let count1=0;
        let queryNFTNum=0;
        let dragonNFTNum=0;
        let gearNFTNum=0;
        let filteredTokenIDList = [];
        let found = false;
        for (let item of nftInfoTable) {
            const subList = [];
            for (let count of arr1) {
                if(count+count1 < nftInfoTable.length) {
                    if(nftInfoTable[count+count1].initProp === null) {
                        continue;
                    }

                    found = false;
                    if(filteredTokenIDTable.length === 0) {
                        found = true;
                    } else {
                        for(let tokenID of filteredTokenIDTable) {
                            if(tokenID.trim() === nftInfoTable[count+count1].tokenID) {
                                found = true;
                                break;
                            }
                        }
                    }

                    if(found === true) {
                        if(nftInfoTable[count+count1].initProp.type === 0 && (nftType=== 0 || nftType === 1)) {
                            if(gradeType === 0 || (gradeType === nftInfoTable[count+count1].grade)) {
                                subList.push({...nftInfoTable[count+count1],metadata:(attrType===0?nftInfoTable[count+count1].initProp:nftInfoTable[count+count1].curProp)});
                                dragonNFTNum++;
                                queryNFTNum++;
    
                                filteredTokenIDList.push(parseInt(nftInfoTable[count+count1].tokenID));
                            }
                            
                        } else if(nftInfoTable[count+count1].initProp.type === 1 && (nftType === 0 || nftType === 2)) {
                            if(gradeType === 0 || (gradeType === nftInfoTable[count+count1].grade)) {
                                if(gearType === 0 || (gearType === nftInfoTable[count+count1].gearType)) {
                                    subList.push({...nftInfoTable[count+count1],metadata:(attrType===0?nftInfoTable[count+count1].initProp:nftInfoTable[count+count1].curProp)});
                                    gearNFTNum++;
                                    queryNFTNum++;
    
                                    filteredTokenIDList.push(parseInt(nftInfoTable[count+count1].tokenID));
                                }
                            }
                        }
                    }
                } else {
                    break;
                }
            }
            if(subList.length > 0) {
                nftList.push([...subList]);
            }
            count1+=4;
        }

        console.log('filteredTokenIDList=',JSON.stringify(filteredTokenIDList,null,2));

        setQueryNFTNum(num=>queryNFTNum);
        setDragonNFTNum(num=>dragonNFTNum);
        setGearNFTNum(num=>gearNFTNum);

        return nftList;
    };

    const getGradeNo = (metadata) => {

        let gradeType = "";
        for(let attr of metadata.attributes) {
            if(attr.trait_type === "Grade") {
                gradeType = attr.value;
                break;
            }
        }

        if(gradeType === "SSR") {
            return 1;
        } else if(gradeType === "SR") {
            return 2;
        } else if(gradeType === "R") {
            return 3;
        } else {
            return 4;
        }
    };

    const getGearTypeNo = (metadata) => {

        let partType = "";
        for(let attr of metadata.attributes) {
            if(attr.trait_type === "Part") {
                partType = attr.value;
                break;
            }
        }
        if(partType === "Head") {
            return 1;
        } else if(partType === "Body") {
            return 2;
        } else if(partType === "Wing") {
            return 3;
        } else {
            return 4;
        }
    };

    const onQueryNFTListButtonClick = (e) => {

        if(queryType === 0) {
            const fetchLoad3 = async () => {
                setStartLoading(true);
    
                const resultInfo = await requestNFTList({address:accountAddress,onlyTokenInfo:true,offset:0,queryNum:0});
          
                console.log(resultInfo);
                if (resultInfo.resultCode !== 0) {
                  toast.error(resultInfo.message);
                } else {
                    const list1 = resultInfo.data.list;
                    setTotalNFTNum(list1.length);

                    setOwnedTokenIDList(list1);
                    setOwnedTokenIDListStr(Utils.makeCommaSeparatedString(list1));
                }
    
                setStartLoading(false);
            };

            fetchLoad3();

        } else if(queryType === 1) {
            const fetchLoad1 = async () => {
                setStartLoading(true);
    
                const resultInfo = await requestNFTList({address:accountAddress,onlyTokenInfo:false,offset:(lowerRange-1),queryNum:(upperRange-lowerRange+1)});
          
                console.log(resultInfo);
                if (resultInfo.resultCode !== 0) {
                  toast.error(resultInfo.message);
                } else {
                    const list1 = resultInfo.data.list;
    
                    setTotalNFTNum(list1.length);
                    //console.log('list1=',JSON.stringify(list1,null,2));
    
                    const nftInfoTable = [];
                    let loadingCount = 0;
                    for await (let item of list1) {
                        const resultInfo1 = await downloadMetadata(item.metadataURL);
                        const resultInfo2 = await requestNFTCurPropInfo(item.tokenID);
    
                        if(resultInfo1.data === null) {
                            toast.error(`메타데이터를 다운로드할 수 없습니다:${item.metadataURL}`);
                            setStartLoading(false);
                            return;
                        }
                        if(resultInfo2.data === null) {
                            toast.error(`토큰에 대한 현재 속성정보를 가져올 수 없습니다:${item.tokenID}`);
                            setStartLoading(false);
                            return;
                        }

                        nftInfoTable.push({tokenID:item.tokenID,grade:(resultInfo1.data===null?"-":getGradeNo(resultInfo1.data)),gearType:(resultInfo1.data===null?-1:getGearTypeNo(resultInfo1.data)),imageURL:(resultInfo1.data!==null?resultInfo1.data.image:""),name:(resultInfo1.data!==null?resultInfo1.data.name:""),initProp:resultInfo1.data,curProp:resultInfo2.data});
    
                        loadingCount++;
                        setLoadingStateInfo(`${loadingCount} / ${list1.length}`);
                    }
    
    
                    setTotalNFTNum(resultInfo.data.totalNum);
                    setNFTInfoList(nftInfoTable);
    
                    //console.log('nftList=',nftList);
    
                    const filteredList = generateFilteredNFTInfoList(nftInfoTable);
                    setFilteredNFTInfoList(filteredList);
                }
                setStartLoading(false);
            };
    
            setQueryNFTNum(0);
            setDragonNFTNum(0);
            setGearNFTNum(0);
    
            fetchLoad1();

        } else if(queryType === 2) {
            const fetchLoad2 = async () => {
                setStartLoading(true);
    
                const resultInfo = await requestOwnerOfNFT({address:accountAddress,tokenID:parseInt(ownerTokenID)});
          
                console.log(resultInfo);
                if (resultInfo.resultCode !== 0) {
                  toast.error(resultInfo.message);
                } else {
                    if(resultInfo.data.isOwner === true) {
                        toast.info(`[YES] 해당 토큰(${ownerTokenID})은 소유자의 토큰입니다.`,{autoClose:5000});
                    } else {
                        toast.error(`[NO] 해당 토큰(${ownerTokenID})은 소유자의 토큰이 아닙니다.`,{autoClose:5000});
                    }
                }
                setStartLoading(false);
            };

            fetchLoad2();
        }
    };

    useEffect(() => {

        console.log('nftInfoList=',JSON.stringify(nftInfoList,null,2));
        const filteredList = generateFilteredNFTInfoList(nftInfoList);
        setFilteredNFTInfoList(filteredList);

    }, [nftType,gradeType,gearType,attrType,filteredTokenIDTable]);
      
    return (
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader>
            <MediaQuery maxWidth={768}>
                &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
            </MediaQuery>
            <span id="subtitle">{titleText}</span>
            <span>&nbsp;</span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
            <div id='title'>
                <label style={{paddingTop:'0.4vw',color:'#ff0000'}}>[주의] '계정주소'외에, 추가로 '토큰ID'필드값에 특정 토큰ID를 넣고 조회하면 해당 토큰의 소유여부를 알 수 있습니다.</label>
                <div></div>
            </div>
            </contentStyled.SettingGroupArea>
            <br />

            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%' bottomMargin='0vw'>
                <contentStyled.SettingItemArea itemMarginRight='1vw' bottomMargin='0vw'>
                    <div id='item-part1'>
                        {'조회 메뉴'}
                    </div>
                    <div id='item-part2'>
                    <RadioGroup responsive='1.6' initButtonIndex={queryType} interMargin="0.5vw" buttonWidth="8vw" nameTable={['전체 토큰목록','토큰 상세정보','토큰 소유여부']} buttonClicked={(idx) => onQueryTypeButtonClick(idx)} />
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
            <br />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%'>
                <contentStyled.SettingItemArea bottomMargin='0.2vw'>
                    <div id='item-part1'>
                        {'계정주소'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='20vw' height='2vw' value={accountAddress} onChange={(e)=>onOwnerAddressValueChanged(e)} />
                    </div>
                    {queryType === 2 ? (
                        <div id='item-part2'>
                            {'토큰ID'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='10vw' height='2vw' value={ownerTokenID} onChange={(e)=>onOwnerTokenIDValueChanged(e)} />
                            &nbsp;&nbsp;&nbsp;&nbsp;<Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='6vw' height='2vw' onClick={(e)=>onQueryNFTListButtonClick(e)}>조회하기</Button1>
                            
                        </div>
                    ):(
                        <div id='item-part2'>
                            <Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='6vw' height='2vw' onClick={(e)=>onQueryNFTListButtonClick(e)}>조회하기</Button1>
                            {queryType === 1 ? (
                                <>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label style={{fontSize:'1vw'}}>{loadingStateInfo}</label>
                                </>
                            ):(<></>)}
                            
                        </div>
                    )}
                </contentStyled.SettingItemArea>
                
                <contentStyled.SettingItemArea>
                {queryType !== 2 && (
                    <div id='item-part1'>
                    &nbsp;&nbsp;{'총 갯수'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='6vw' height='2vw' value={totalNFTNum} readOnly={true} />
                    </div>                    
                )}

                {queryType === 1 && (
                    <div id='item-part1'>
                    &nbsp;&nbsp;&nbsp;&nbsp;<Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='4vw' height='2vw' onClick={(e)=>onQueryPrevNFTListButtonClick(e)}>이전</Button1>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='6vw' height='2vw' value={lowerRange} onChange={(e)=>onLowerRangeValueChanged(e)} />
                    &nbsp;&nbsp;{'~'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='6vw' height='2vw' value={upperRange} onChange={(e)=>onUpperRangeValueChanged(e)} />
                        &nbsp;&nbsp;&nbsp;&nbsp;<Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='4vw' height='2vw' onClick={(e)=>onQueryNextNFTListButtonClick(e)}>다음</Button1>
                    </div>
                )}
            </contentStyled.SettingItemArea>

            </contentStyled.SettingGroupArea>
            {queryType === 1?(
                <>
                            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%' bottomMargin='0vw'>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id='item-part1'>
                        {'전체 보유량'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='8vw' height='2vw' value={queryNFTNum} onChange={(e)=>onOwnerAddressValueChanged(e)} />
                    </div>
                    <div id='item-part1'>
                        {'드래곤 보유량'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='8vw' height='2vw' value={dragonNFTNum} onChange={(e)=>onOwnerAddressValueChanged(e)} />
                    </div>
                    <div id='item-part1'>
                        {'기어 보유량'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='8vw' height='2vw' value={gearNFTNum} onChange={(e)=>onOwnerAddressValueChanged(e)} />
                    </div>

                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
            <contentStyled.SettingGroupArea leftMargin='2vw' width='90%' bottomMargin='0vw'>
                <contentStyled.SettingItemArea itemMarginRight='1vw' bottomMargin='0vw'>
                    <div id='item-part1'>
                        {'NFT 타입'}
                    </div>
                    <div id='item-part2'>
                    <RadioGroup responsive='1.6' initButtonIndex={nftType} interMargin="0.5vw" buttonWidth="5vw" nameTable={['전체','드래곤','기어']} buttonClicked={(idx) => onNFTTypeRadioButtonClick(idx)} />
                    </div>
                    <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <div id='item-part1'>
                        {'등급'}
                    </div>
                    <div id='item-part2'>
                    <RadioGroup responsive='1.6' initButtonIndex={gradeType} interMargin="0.5vw" buttonWidth="3vw" nameTable={['전체','SSR','SR','R','A']} buttonClicked={(idx) => onGradeTypeRadioButtonClick(idx)} />
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea itemMarginRight='1vw' bottomMargin='0vw'>
                    <div id='item-part1'>
                        {'기어타입'}
                    </div>
                    <div id='item-part2'>
                    <RadioGroup responsive='1.6' initButtonIndex={gearType} interMargin="0.5vw" buttonWidth="4vw" nameTable={['전체','헤드','바디','날개','꼬리']} buttonClicked={(idx) => onGearTypeRadioButtonClick(idx)} />
                    </div>
                    <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <div id='item-part1'>
                        {'속성 표시'}
                    </div>
                    <div id='item-part2'>
                    <RadioGroup responsive='1.6' initButtonIndex={attrType} interMargin="0.5vw" buttonWidth="7vw" nameTable={['초기 속성','강화된 속성']} buttonClicked={(idx) => onAttrTypeRadioButtonClick(idx)} />
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea itemMarginRight='1vw' bottomMargin='0vw'>
                    <div id='item-part1'>
                        {'토큰 필터링'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='44vw' height='2vw' value={filteredTokenIDStr} onChange={(e)=>onFilteredTokenIDStrValueChanged(e)} />
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
            <br />
            <contentStyled.SettingGroupArea leftMargin='1vw' width='90%'>
            <pageStyled.Table marginLeft='1vw' marginRight='1vw'>
            {
                filteredNFTInfoList.map((subInfoList,index)=> {
                    return <pageStyled.TableRow height='8vw'>
                        {
                            subInfoList.map((info,index2) => {
                                return (
                                    <pageStyled.TableCell style={{'padding':'0.2vw'}}>
                                        <pageStyled.TableCellContent style={{'width':'12vw'}}>
                                            <div>
                                                {info.metadata!==undefined&&info.metadata!==null?(
                                                    <div>
                                                    <a href={info.imageURL} ><img style={{maxWidth:"90%",maxHeight:"100%"}} src={info.imageURL} /></a>
                                                    <div>
                                                        {info.metadata !== undefined&&info.metadata !== null?(<div>
                                                            <div><label>Name:{info.name}</label></div>
                                                            <div><label>TokenID:{info.tokenID}</label></div>
                                                            {info.metadata.attributes.map((trait)=>{
                                                                return <div style={{width:'14vw'}}><label>{trait.trait_type}:{trait.value.length > 30 ? trait.value.substring(0,28)+"...":trait.value}</label></div>
                                                            })}
                                                        </div>):(<div></div>)}
                                                    </div>
                                                    </div>
                                                ):(<div></div>)}
                                            </div>
                                        </pageStyled.TableCellContent>
                                    </pageStyled.TableCell>
                                )
                            })
                        }
                    </pageStyled.TableRow>
                })
            }
            </pageStyled.Table>
            </contentStyled.SettingGroupArea>
            <br /><br />
                </>
            ):(
                queryType===0 && (
                    <>
                    <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
                    <br />
                    {ownedTokenIDListStr.trim() !== '' && (
                        <>
                        <contentStyled.SettingItemArea>
                        <div id='item-part1'>
                            {'토큰ID 목록'}&nbsp;&nbsp;&nbsp;&nbsp;<InputField1 responsive='1.6' width='20vw' height='2vw' value={tokenIDListStrInResult} onChange={(e)=>onTokenIDListInResultValueChanged(e)} />
                        </div>
                        <div id='item-part2'>
                            <Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='8vw' height='2vw' onClick={(e)=>onQueryInResultButtonClick(e)}>결과내 조회하기</Button1>
                        </div>
                        </contentStyled.SettingItemArea>
                        <contentStyled.SettingItemArea>
                            <div id="item-part1">
                            <TextArea1 responsive='1.8' value={ownedTokenIDListStr} width="53vw" height="18vw" readOnly={true} />
                            </div>
                        </contentStyled.SettingItemArea>
                        </>
                    )}
                </>
                )
            )}
            </contentStyled.ContentBody>
        </contentStyled.ContentWrapper>
    )
};

export default NFTOwnerQueryPanel;