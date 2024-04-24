import React,{useState,useEffect,useRef} from 'react';
import MediaQuery from 'react-responsive';
import Spreadsheet from "react-spreadsheet";
import { CSVLink, CSVDownload } from "react-csv";
import { toast } from 'react-toastify';

import styled from 'styled-components';
import * as contentStyled from '../MainContentStyles';
import * as commonStyled from '../../../styles/commonStyles';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import RadioGroup from '../../../components/RadioGroup';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useTool from '../../../store/useToolDataManager';

const titleText = '마켓에 NFT 등록';

const MarketNFTRegistrationPanel = (props) => {

    const fileReader = new FileReader();

    const {startLoading, setStartLoading} = useCommon();
    const {requestSeasonRegistrationToMarket, requestNFTRegistrationToMarket} = useTool();

    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [popupID, setPopupID] = useState('');
    const [subMenuOpen,setSubMenuOpen] = useState(false);

    const [seasonInfoRegisterFlag, setSeasonInfoRegisterFlag] = useState(false);

    const [seasonNo, setSeasonNo] = useState(3);
    const [seasonCategoryNo, setSeasonCategoryNo] = useState(10);
    const [seasonActiveFlag, setSeasonActiveFlag] = useState(1);
    const [cardDragonName, setCardDragonName] = useState(`Mystery Box#${seasonNo} - Dragon`);
    const [cardDragonActiveFlag, setCardDragonActiveFlag] = useState(0);
    const [cardGearName, setCardGearName] = useState(`Mystery Box#${seasonNo} - Gear`);
    const [cardGearActiveFlag, setCardGearActiveFlag] = useState(0);
    const [cardPackageName, setCardPackageName] = useState(`Mystery Box#${seasonNo} - Package`);
    const [cardPackageActiveFlag, setCardPackageActiveFlag] = useState(0);

    const [curItemType, setCurItemType] = useState('');
    const [dragonItemTable, setDragonItemTable] = useState([]);
    const [gearHeadItemTable, setGearHeadItemTable] = useState([]);
    const [gearBodyItemTable, setGearBodyItemTable] = useState([]);
    const [gearWingItemTable, setGearWingItemTable] = useState([]);
    const [gearTailItemTable, setGearTailItemTable] = useState([]);
    const [packageItemTable, setPackageItemTable] = useState([]);
    const [regStateTable, setRegStateTable] = useState([false,false,false,false,false,false]);
    const [itemPriceTable, setItemPriceTable] = useState(['0','0','0','0','0','0']);

    const [dragonData, setDragonData] = useState([
        [{ value: "Vanilla" }, { value: "Chocolate" }],
        [{ value: "Strawberry" }, { value: "Cookies" }],
    ]);
    const [gearHeadData, setGearHeadData] = useState([
        [{ value: "Vanilla" }, { value: "Chocolate" }],
        [{ value: "Strawberry" }, { value: "Cookies" }],
    ]);
    const [gearBodyData, setGearBodyData] = useState([
        [{ value: "Vanilla" }, { value: "Chocolate" }],
        [{ value: "Strawberry" }, { value: "Cookies" }],
    ]);
    const [gearWingData, setGearWingData] = useState([
        [{ value: "Vanilla" }, { value: "Chocolate" }],
        [{ value: "Strawberry" }, { value: "Cookies" }],
    ]);
    const [gearTailData, setGearTailData] = useState([
        [{ value: "Vanilla" }, { value: "Chocolate" }],
        [{ value: "Strawberry" }, { value: "Cookies" }],
    ]);
    const [packageData, setPackageData] = useState([
        [{ value: "Vanilla" }, { value: "Chocolate" }],
        [{ value: "Strawberry" }, { value: "Cookies" }],
    ]);

    const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
    };

    const updateCSVData = (table,itemType) => {

        let table2 = [];
        for(let row of table) {
            let record1 = {tokenId:"",attributeId:"",itemType:0,reqGroupId:0,packageId:"",partType:0,marketBoxId:0,itemData:null};
            record1.tokenId = row[0].value;
            record1.attributeId = row[1].value;
            record1.itemType = parseInt(row[2].value);
            record1.reqGroupId = parseInt(row[3].value);
            record1.packageId = row[4].value;
            record1.partType = parseInt(row[5].value);
            record1.marketBoxId = parseInt(row[6].value);
            record1.itemData = JSON.parse(row[7].value);

            table2.push(record1);
        }

        console.log('table=',JSON.stringify(table,null,2));
        console.log('table2=',JSON.stringify(table2,null,2));

        if(itemType === 'dragon') {
            setDragonData(data=>table);
            setDragonItemTable(data=>table2);
        } else if(itemType === 'gear.head') {
            setGearHeadData(data=>table);
            setGearHeadItemTable(data=>table2);
        } else if(itemType === 'gear.body') {
            setGearBodyData(data=>table);
            setGearBodyItemTable(data=>table2);
        } else if(itemType === 'gear.wing') {
            setGearWingData(data=>table);
            setGearWingItemTable(data=>table2);
        } else if(itemType === 'gear.tail') {
            setGearTailData(data=>table);
            setGearTailItemTable(data=>table2);
        } else if(itemType === 'package') {
            setPackageData(data=>table);
            setPackageItemTable(data=>table2);
        } else {
            toast.error('아이템 항목명이 잘못되었습니다.');
        }
    };

    const onCSVDataChange = (newData) => {
        // setData(data=>newData);
        // updateCSVData(newData);
    };

    const onLoadCSVFileInfo = (e,itemType) => {

        const csvFileToArray = string => {
            const csvRows = string.split("\n");
             
            const sheetTable = [];
            for(let row of csvRows) {
                if(row.indexOf('token_id') >= 0) {
                    continue;
                }
                const arr2 = row.split(';');
                let rowTable = [];
                if(arr2[0].trim() !== '') {
                    for(let i=0;i<arr2.length;i++) {
                        if(i+1 >= arr2.length) {
                            rowTable.push({value:arr2[i].substr(1,arr2[i].length-2)});
                        } else {
                            rowTable.push({value:arr2[i]});
                        }
                    }
                }
                if(rowTable.length > 0) {
                    sheetTable.push([...rowTable]);
                }
            }
        
            updateCSVData(sheetTable,itemType);
        };

        fileReader.onload = function (event) {
            const text = event.target.result;

            console.log('text=',text);

            csvFileToArray(text);
        };

        if(e.target.files !== undefined && e.target.files.length > 0) {
            fileReader.readAsText(e.target.files[0]);
        }
    };

    const updateItemStateTable = () => {

        if(curItemType === 'dragon') {
            setRegStateTable(table=>[true,table[1],table[2],table[3],table[4],table[5]]);
        } else if(curItemType === 'gear.head') {
            setRegStateTable(table=>[table[0],true,table[2],table[3],table[4],table[5]]);
        } else if(curItemType === 'gear.body') {
            setRegStateTable(table=>[table[0],table[1],true,table[3],table[4],table[5]]);
        } else if(curItemType === 'gear.wing') {
            setRegStateTable(table=>[table[0],table[1],table[2],true,table[4],table[5]]);
        } else if(curItemType === 'gear.tail') {
            setRegStateTable(table=>[table[0],table[1],table[2],table[3],true,table[5]]);
        } else if(curItemType === 'package') {
            setRegStateTable(table=>[table[0],table[1],table[2],table[3],table[4],true]);
        }
    };

    const onPopupButtonClick = async (buttonIdx) => {

        if (buttonIdx === 0) {
            setStartLoading(true);
        
            setTimeout(async () => {

                const seasonInfo = {
                    seasonNo:seasonNo,
                    seasonCategoryNo:seasonCategoryNo,
                    cardDragonName:cardDragonName,
                    cardDragonActiveFlag:(cardDragonActiveFlag===1?false:true),
                    cardGearName:cardGearName,
                    cardGearActiveFlag:(cardGearActiveFlag===1?false:true),
                    cardPackageName:cardPackageName,
                    cardPackageActiveFlag:(cardPackageActiveFlag===1?false:true)
                };

                if(popupID === 'popup.nft.register') {
                    let mintingInfoTable = null;
                    let price = 0.0;
                    if(curItemType === 'dragon') {
                        mintingInfoTable = dragonItemTable;
                        price = parseFloat(itemPriceTable[0]);
                    } else if(curItemType === 'gear.head') {
                        mintingInfoTable = gearHeadItemTable;
                        price = parseFloat(itemPriceTable[1]);
                    } else if(curItemType === 'gear.body') {
                        mintingInfoTable = gearBodyItemTable;
                        price = parseFloat(itemPriceTable[2]);
                    } else if(curItemType === 'gear.wing') {
                        mintingInfoTable = gearWingItemTable;
                        price = parseFloat(itemPriceTable[3]);
                    } else if(curItemType === 'gear.tail') {
                        mintingInfoTable = gearTailItemTable;
                        price = parseFloat(itemPriceTable[4]);
                    } else if(curItemType === 'package') {
                        mintingInfoTable = packageItemTable;
                        price = parseFloat(itemPriceTable[5]);
                    }
    
                    const resultInfo = await requestNFTRegistrationToMarket({seasonInfo, itemType:curItemType, price, mintingInfoTable});
            
                    console.log(resultInfo);
                    if (resultInfo.resultCode === 0) {
                        toast.info(`${curItemType} 테이블이 마켓에 등록되었습니다.`);
                    } else {
                    toast.error(resultInfo.message);
                    }
                                  
                    updateItemStateTable();
    
                    setCurItemType('');
                } else {
                    const resultInfo = await requestSeasonRegistrationToMarket({seasonInfo,seasonActivationFlag:(seasonActiveFlag===1?false:true)});
                    console.log(resultInfo);
                    if (resultInfo.resultCode === 0) {
                        toast.info(`시즌정보가 마켓에 등록되었습니다.`);

                        setSeasonInfoRegisterFlag(true);

                    } else {
                        toast.error(resultInfo.message);
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

    const onItemPriceValueChanged = (e,itemType) => {

        if(itemType === 'dragon') {
            setItemPriceTable(table=>[e.target.value.trim(),table[1],table[2],table[3],table[4],table[5]]);
        } else if(itemType === 'gear.head') {
            setItemPriceTable(table=>[table[0],e.target.value.trim(),table[2],table[3],table[4],table[5]]);
        } else if(itemType === 'gear.body') {
            setItemPriceTable(table=>[table[0],table[1],e.target.value.trim(),table[3],table[4],table[5]]);
        } else if(itemType === 'gear.wing') {
            setItemPriceTable(table=>[table[0],table[1],table[2],e.target.value.trim(),table[4],table[5]]);
        } else if(itemType === 'gear.tail') {
            setItemPriceTable(table=>[table[0],table[1],table[2],table[3],e.target.value.trim(),table[5]]);
        } else if(itemType === 'package') {
            setItemPriceTable(table=>[table[0],table[1],table[2],table[3],table[4],e.target.value.trim()]);
        }
    };

    const onRegisterButtonClick = (e,itemType) => {

        if(seasonInfoRegisterFlag === false) {
            toast.error('먼저 시즌정보를 마켓에 등록해야 합니다.');
            return;
        }

        setCurItemType(itemType);

        setPopupContent(`${itemType} 민팅정보를 마켓에 등록하시겠습니까?`);
        setPopupID('popup.nft.register');
        setPopupShown(true);
    };

    const onSeasonNoValueChange = (e) => {

        setSeasonNo(e.target.value);
    };

    const onSeasonCategoryNoValueChange = (e) => {

        setSeasonCategoryNo(e.target.value);
    }

    const onSeasonActivationRadioButtonClick = (idx) => {

        setSeasonActiveFlag(idx);
    };

    const onCardDragonNameValueChange = (e) => {

        setCardDragonName(e.target.value);
    };

    const onCardDragonActivationRadioButtonClick = (idx) => {

        setCardDragonActiveFlag(idx);
    };

    const onCardGearNameValueChange = (e) => {

        setCardGearName(e.target.value);
    };

    const onCardGearActivationRadioButtonClick = (idx) => {

        setCardGearActiveFlag(idx);
    };

    const onCardPackageNameValueChange = (e) => {

        setCardDragonName(e.target.value);
    };

    const onCardPackageActivationRadioButtonClick = (idx) => {

        setCardPackageActiveFlag(idx);
    };

    const onRegisterSeasonInfoButtonClick = (e) => {

        setPopupContent(`시즌정보를 마켓에 등록하시겠습니까?`);
        setPopupID('popup.season.register');
        setPopupShown(true);
    };

    const reloadSeasonInfo = async () => {

    };

    useEffect(() => {
        reloadSeasonInfo();
    },[]);

    return <>
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader subtitleWidth="20vw">
            <MediaQuery maxWidth={768}>
                &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
            </MediaQuery>
            <span id='subtitle'>{titleText}</span>
            <span id='button'>&nbsp;</span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
            <br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label style={{fontSize:'0.8vw'}}><i className='fas fa-stop' style={{fontSize:'0.6vw',verticalAlign:'center'}}/>&nbsp;&nbsp;시즌 정보&nbsp;({seasonInfoRegisterFlag===true?"등록됨":"미등록"})</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                        <label>시즌 번호</label>
                    </div>
                    <div id="item-part2" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <div>
                            <InputField1 responsive='1.6' width='4vw' height='2vw' value={seasonNo} readOnly={false} onChange={(e)=>onSeasonNoValueChange(e)} />
                        </div>
                    </div>
                    <div id="item-part1" style={{ width:'5vw', verticalAlign: 'middle' }}>
                        <label>카테고리 번호</label>
                    </div>
                    <div id="item-part2" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <div>
                            <InputField1 responsive='1.6' width='4vw' height='2vw' value={seasonCategoryNo} readOnly={false} onChange={(e)=>onSeasonCategoryNoValueChange(e)} />
                        </div>
                    </div>
                    <div id="item-part2" style={{ width:'14vw', verticalAlign: 'middle' }}>
                        <div>
                        <RadioGroup responsive='1.6' initButtonIndex={seasonActiveFlag} interMargin="0.5vw" buttonWidth="5vw" nameTable={['활성화','비활성화']} buttonClicked={(idx) => onSeasonActivationRadioButtonClick(idx)} />
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                        <label>드래곤 정보</label>
                    </div>
                    <div id="item-part2" style={{ width:'16vw', verticalAlign: 'middle' }}>
                        <div>
                            <label>카드명&nbsp;&nbsp;</label>
                        </div>
                        <div>
                            <InputField1 responsive='1.6' width='10vw' height='2vw' value={cardDragonName} readOnly={false} onChange={(e)=>onCardDragonNameValueChange(e)} />
                        </div>
                    </div>
                    <div id="item-part2" style={{ width:'14vw', verticalAlign: 'middle' }}>
                        <div>
                        <RadioGroup responsive='1.6' initButtonIndex={cardDragonActiveFlag} interMargin="0.5vw" buttonWidth="5vw" nameTable={['활성화','비활성화']} buttonClicked={(idx) => onCardDragonActivationRadioButtonClick(idx)} />
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                        <label>기어 정보</label>
                    </div>
                    <div id="item-part2" style={{ width:'16vw', verticalAlign: 'middle' }}>
                        <div>
                            <label>카드명&nbsp;&nbsp;</label>
                        </div>
                        <div>
                            <InputField1 responsive='1.6' width='10vw' height='2vw' value={"Mystery Box#3 - Gear"} readOnly={false} onChange={(e)=>onCardGearNameValueChange(e)} />
                        </div>
                    </div>
                    <div id="item-part2" style={{ width:'14vw', verticalAlign: 'middle' }}>
                        <div>
                        <RadioGroup responsive='1.6' initButtonIndex={cardGearActiveFlag} interMargin="0.5vw" buttonWidth="5vw" nameTable={['활성화','비활성화']} buttonClicked={(idx) => onCardGearActivationRadioButtonClick(idx)} />
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                        <label>패키지 정보</label>
                    </div>
                    <div id="item-part2" style={{ width:'16vw', verticalAlign: 'middle' }}>
                        <div>
                            <label>카드명&nbsp;&nbsp;</label>
                        </div>
                        <div>
                            <InputField1 responsive='1.6' width='10vw' height='2vw' value={"Mystery Box#3 - Package"} readOnly={false} onChange={(e)=>onCardPackageNameValueChange(e)} />
                        </div>
                    </div>
                    <div id="item-part2" style={{ width:'14vw', verticalAlign: 'middle' }}>
                        <div>
                        <RadioGroup responsive='1.6' initButtonIndex={cardPackageActiveFlag} interMargin="0.5vw" buttonWidth="5vw" nameTable={['활성화','비활성화']} buttonClicked={(idx) => onCardPackageActivationRadioButtonClick(idx)} />
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' onClick={(e)=>onRegisterSeasonInfoButtonClick(e)}>등록하기</Button1>
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
            <br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label style={{fontSize:'0.8vw'}}><i className='fas fa-stop' style={{fontSize:'0.6vw',verticalAlign:'center'}}/>&nbsp;&nbsp;드래곤&nbsp;({dragonItemTable.length}개)</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                        <div>
                        <form>
                            <input
                            type={"file"}
                            id={"csvFileInput1"}
                            accept={".csv"}
                            onChange={(e)=>onLoadCSVFileInfo(e,'dragon')}
                            />
                        </form>
                        </div>
                        <br />
                        <div style={{width:'62vw',height:'10vw',overflow:'auto'}}>
                            <Spreadsheet data={dragonData} onChange={onCSVDataChange} />
                        </div>
                    </div>
                    <br />
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <label>가격:</label>
                        <InputField1 responsive='1.6' width='6vw' height='2vw' value={itemPriceTable[0]} onChange={(e)=>onItemPriceValueChanged(e,'dragon')} />
                    </div>
                    <div id="item-part2" style={{ width:'10vw', verticalAlign: 'middle' }}>
                        <div>
                            {regStateTable[0]===false?(
                                <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' onClick={(e)=>onRegisterButtonClick(e,'dragon')}>등록하기</Button1>
                            ):(
                                <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' disable1>등록 완료</Button1>
                            )}
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label style={{fontSize:'0.8vw'}}><i className='fas fa-stop' style={{fontSize:'0.6vw',verticalAlign:'center'}}/>&nbsp;&nbsp;헤드 기어&nbsp;({gearHeadItemTable.length}개)</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                        <form>
                            <input
                            type={"file"}
                            id={"csvFileInput2"}
                            accept={".csv"}
                            onChange={(e)=>onLoadCSVFileInfo(e,'gear.head')}
                            />
                        </form>
                        <br />
                        <div style={{width:'62vw',height:'10vw',overflow:'auto'}}>
                            <Spreadsheet data={gearHeadData} onChange={onCSVDataChange} />
                        </div>
                    </div>
                    <br />
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <label>가격:</label>
                        <InputField1 responsive='1.6' width='6vw' height='2vw' value={itemPriceTable[1]} onChange={(e)=>onItemPriceValueChanged(e,'gear.head')} />
                    </div>
                    <div id="item-part2" style={{ width:'10vw', verticalAlign: 'middle' }}>
                        <div>
                            {regStateTable[1]===false?(
                                <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' onClick={(e)=>onRegisterButtonClick(e,'gear.head')}>등록하기</Button1>
                            ):(
                                <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' disable1>등록 완료</Button1>
                            )}
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label style={{fontSize:'0.8vw'}}><i className='fas fa-stop' style={{fontSize:'0.6vw',verticalAlign:'center'}}/>&nbsp;&nbsp;바디 기어&nbsp;({gearBodyItemTable.length}개)</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                        <form>
                            <input
                            type={"file"}
                            id={"csvFileInput3"}
                            accept={".csv"}
                            onChange={(e)=>onLoadCSVFileInfo(e,'gear.body')}
                            />
                        </form>
                        <br />
                        <div style={{width:'62vw',height:'10vw',overflow:'auto'}}>
                            <Spreadsheet data={gearBodyData} onChange={onCSVDataChange} />
                        </div>
                    </div>
                    <br />
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <label>가격:</label>
                        <InputField1 responsive='1.6' width='6vw' height='2vw' value={itemPriceTable[2]} onChange={(e)=>onItemPriceValueChanged(e,'gear.body')} />
                    </div>
                    <div id="item-part2" style={{ width:'10vw', verticalAlign: 'middle' }}>
                        <div>
                            {regStateTable[2]===false?(
                                <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' onClick={(e)=>onRegisterButtonClick(e,'gear.body')}>등록하기</Button1>
                            ):(
                                <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' disable1>등록 완료</Button1>
                            )}
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label style={{fontSize:'0.8vw'}}><i className='fas fa-stop' style={{fontSize:'0.6vw',verticalAlign:'center'}}/>&nbsp;&nbsp;날개 기어&nbsp;({gearWingItemTable.length}개)</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                        <form>
                            <input
                            type={"file"}
                            id={"csvFileInput4"}
                            accept={".csv"}
                            onChange={(e)=>onLoadCSVFileInfo(e,'gear.wing')}
                            />
                        </form>
                        <br />
                        <div style={{width:'62vw',height:'10vw',overflow:'auto'}}>
                            <Spreadsheet data={gearWingData} onChange={onCSVDataChange} />
                        </div>
                    </div>
                    <br />
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <label>가격:</label>
                        <InputField1 responsive='1.6' width='6vw' height='2vw' value={itemPriceTable[3]} onChange={(e)=>onItemPriceValueChanged(e,'gear.wing')} />
                    </div>
                    <div id="item-part2" style={{ width:'10vw', verticalAlign: 'middle' }}>
                        <div>
                            {regStateTable[3]===false?(
                                <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' onClick={(e)=>onRegisterButtonClick(e,'gear.wing')}>등록하기</Button1>
                            ):(
                                <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' disable1>등록 완료</Button1>
                            )}
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label style={{fontSize:'0.8vw'}}><i className='fas fa-stop' style={{fontSize:'0.6vw',verticalAlign:'center'}}/>&nbsp;&nbsp;꼬리 기어&nbsp;({gearTailItemTable.length}개)</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                        <form>
                            <input
                            type={"file"}
                            id={"csvFileInput5"}
                            accept={".csv"}
                            onChange={(e)=>onLoadCSVFileInfo(e,'gear.tail')}
                            />
                        </form>
                        <br />
                        <div style={{width:'62vw',height:'10vw',overflow:'auto'}}>
                            <Spreadsheet data={gearTailData} onChange={onCSVDataChange} />
                        </div>
                    </div>
                    <br />
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <label>가격:</label>
                        <InputField1 responsive='1.6' width='6vw' height='2vw' value={itemPriceTable[4]} onChange={(e)=>onItemPriceValueChanged(e,'gear.tail')} />
                    </div>
                    <div id="item-part2" style={{ width:'10vw', verticalAlign: 'middle' }}>
                        <div>
                            {regStateTable[4]===false?(
                                <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' onClick={(e)=>onRegisterButtonClick(e,'gear.tail')}>등록하기</Button1>
                            ):(
                                <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' disable1>등록 완료</Button1>
                            )}
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label style={{fontSize:'0.8vw'}}><i className='fas fa-stop' style={{fontSize:'0.6vw',verticalAlign:'center'}}/>&nbsp;&nbsp;패키지&nbsp;({packageItemTable.length}개)</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                        <form>
                            <input
                            type={"file"}
                            id={"csvFileInput6"}
                            accept={".csv"}
                            onChange={(e)=>onLoadCSVFileInfo(e,'package')}
                            />
                        </form>
                        <br />
                        <div style={{width:'62vw',height:'10vw',overflow:'auto'}}>
                            <Spreadsheet data={packageData} onChange={onCSVDataChange} />
                        </div>
                    </div>
                    <br />
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <label>가격:</label>
                        <InputField1 responsive='1.6' width='6vw' height='2vw' value={itemPriceTable[5]} onChange={(e)=>onItemPriceValueChanged(e,'package')} />
                    </div>
                    <div id="item-part2" style={{ width:'10vw', verticalAlign: 'middle' }}>
                        <div>
                            {regStateTable[5]===false?(
                                <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' onClick={(e)=>onRegisterButtonClick(e,'package')}>등록하기</Button1>
                            ):(
                                <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' disable1>등록 완료</Button1>
                            )}
                        </div>
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
    </>
};

export default MarketNFTRegistrationPanel;