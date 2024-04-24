import React, {useState,useEffect,useRef,useCallback} from 'react';
import { CSVLink, CSVDownload } from "react-csv";

import {gameRscTypeTable,gameItemTable} from '../../../common/ItemTable';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './InboxMessageManagePageStyles';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import CheckBox from '../../../components/CheckBox';
import TextArea1 from '../../../components/TextArea1';
import DropBox from '../../../components/DropBox';

import useCommon from '../../../store/useCommonStorageManager';
import useSetting from '../../../store/useSettingDataManager';
import { toast } from 'react-toastify';

const titleText = '보상 설정';

const itemBoxTypeTable = [
    {id:1,name:'노멀'},
    {id:2,name:'스페셜'}
];

const getGameRscName = (rscType,itemID) => {

    for(let item of gameRscTypeTable) {
        if(item.value === parseInt(rscType)) {
            if(rscType === 4 && itemID === 0) {
                return item.key+'Free';
            } else {
                return item.key;
            }
        }
    }
    return null;
};

const getGameRscType = (rscName) => {

    for(let item of gameRscTypeTable) {
        if(item.key === rscName) {
            return item.value;
        }
    }
    return null;
};

const getGameItem = (itemID) => {

    for(let item of gameItemTable) {
        if(item.Id === parseInt(itemID)) {
            return item;
        }
    }
    return null;
};

const getGameItemType = (itemID) => {

    const item = getGameItem(itemID);
    if(item !== null) {
        return item.ItemType;
    } else {
        return -1;
    }
};

const getGameItemName = (itemID) => {

    const item = getGameItem(itemID);
    if(item !== null) {
        return item.ItemName;
    } else {
        return -1;
    }
};

const getGameItemElementType = (itemID) => {

    const item = getGameItem(itemID);
    if(item !== null) {
        return item.ElementType;
    } else {
        return -1;
    }
};

const getGameItemGrade = (itemID) => {

    const item = getGameItem(itemID);
    if(item !== null) {
        return item.Grade;
    } else {
        return -1;
    }
};

export const makeRewardDescInfo = (rewardInfo) => {

    const rewardDescInfo = [];

    for(let info of rewardInfo) {
        rewardDescInfo.push({...info});
    }

    for(let info of rewardDescInfo) {
        info.ItemType = getGameRscName(info.ItemType,info.ItemId);
    }

    return rewardDescInfo;
};

const getBoxItemID = (type,index) => {

    if(type === 'Dragon') {
        return (index===0?1001:1002);
    } else {
        return (index===0?1003:1004);
    }
};

const RewardSettingPanel = (props) => {

    let [finalRewardInfo, setFinalRewardInfo] = useState(props.rewardInfo);
    let [finalRewardDescInfo, setFinalRewardDescInfo] = useState(makeRewardDescInfo(props.rewardInfo));
    const [dragonBoxType, setDragonBoxType] = useState(0);
    const [gearBoxType, setGearBoxType] = useState(0);
    const [consumableItemInfo, setConsumableItemInfo] = useState('');
    const [fileName, setFileName] = useState('');
    const [csvDataTable, setCSVDataTable] = useState([]);

    const onApplyButtonClick = (e) => {

        //console.log('finalRewardInfo=',finalRewardInfo);

        props.onApplyButtonClick(e,finalRewardInfo,finalRewardDescInfo);
    };

    const onCancelButtonClick = (e) => {
        props.onCancelButtonClick(e);
    };

    const onFinalRewardChanged = (e) => {
        //setFinalRewardInfo(e.target.value);
    };

    const setRewardItem = (rscName,itemID,qty) => {

        const rscType = getGameRscType(rscName);
        const num = parseInt(qty);
        if(num <= 0) {
            return;
        }

        
        let found = false;
        let newFinalRewardInfo = [...finalRewardInfo];
        for(let i=0;i<newFinalRewardInfo.length;i++) {
            if(newFinalRewardInfo[i].ItemType === rscType && newFinalRewardInfo[i].ItemId === parseInt(itemID)) {
                newFinalRewardInfo[i].Quantity = parseInt(qty);
                found = true;
                break;
            }
        }

        if(found === false) {
            newFinalRewardInfo = [...newFinalRewardInfo,{ItemType:rscType,ItemId:parseInt(itemID),Quantity:parseInt(qty)}];
        }
        setFinalRewardInfo(info=>newFinalRewardInfo);
        finalRewardInfo = newFinalRewardInfo;

        setFinalRewardDescInfo(makeRewardDescInfo(newFinalRewardInfo));
    };
    
    const addRewardItem = (rscName,itemID,qty) => {
        const num = parseInt(qty);
        if(num <= 0) {
            return;
        }

        const rscType = getGameRscType(rscName);
        let found = false;
        let newFinalRewardInfo = [...finalRewardInfo];
        for(let i=0;i<newFinalRewardInfo.length;i++) {
            if(newFinalRewardInfo[i].ItemType === rscType && newFinalRewardInfo[i].ItemId === parseInt(itemID)) {
                newFinalRewardInfo[i].Quantity += parseInt(qty);
                found = true;
                break;
            }
        }

        if(found === false) {
            newFinalRewardInfo = [...newFinalRewardInfo,{ItemType:rscType,ItemId:parseInt(itemID),Quantity:parseInt(qty)}];
        }
        setFinalRewardInfo(info=>newFinalRewardInfo);

        setFinalRewardDescInfo(makeRewardDescInfo(newFinalRewardInfo));
    };
    
    const resetRewardItem = (rscName,itemID) => {

        const rscType = getGameRscType(rscName);
        const newFinalRewardInfo = finalRewardInfo.filter(reward=>!(reward.ItemType===rscType&&reward.ItemId===parseInt(itemID)));

        setFinalRewardInfo(info=>newFinalRewardInfo);
        finalRewardInfo = newFinalRewardInfo;

        setFinalRewardDescInfo(makeRewardDescInfo(newFinalRewardInfo));
    };


    // XDS
    const [xdsItemQty, setXDSItemQty] = useState(props.rewardInfo['xds'] !== undefined?props.rewardInfo['xds'].qty:0);
    const onXDSQtyChanged = (e) => {
        setXDSItemQty(e.target.value);
    };

    // Gold
    const [goldItemQty, setGoldItemQty] = useState(props.rewardInfo['gold'] !== undefined?props.rewardInfo['gold'].qty:0);
    const onGoldQtyChanged = (e) => {
        setGoldItemQty(e.target.value);
    };

    const onXDSGoldSetButtonClick = (e) => {

        setRewardItem('XDS',0,xdsItemQty);
        setRewardItem('Gold',0,goldItemQty);
    };

    const onXDSGoldResetButtonClick = (e) => {

        resetRewardItem('XDS',0);
        resetRewardItem('Gold',0);
    };

    // Gem(무료)
    const [freeGemItemQty, setFreeGemItemQty] = useState(props.rewardInfo['free-gem'] !== undefined?props.rewardInfo['free-gem'].qty:0);
    const onFreeGemQtyChanged = (e) => {
        setFreeGemItemQty(e.target.value);
    };

    // Gem(유료)
    const [paidGemItemQty, setPaidGemItemQty] = useState(props.rewardInfo['paid-gem'] !== undefined?props.rewardInfo['paid-gem'].qty:0);
    const onPaidGemQtyChanged = (e) => {
        setPaidGemItemQty(e.target.value);
    };

    const onGemSetButtonClick = (e) => {
        setRewardItem('Gem',0,freeGemItemQty);
        setRewardItem('Gem',1,paidGemItemQty);
    };

    const onGemResetButtonClick = (e) => {
        resetRewardItem('Gem',0);
        resetRewardItem('Gem',1);
    };

    // 플레이 에너지
    const [playEnergyQty, setPlayEnergyQty] = useState(props.rewardInfo['playenergy'] !== undefined?props.rewardInfo['playenergy'].qty:0);
    const onPlayEnergyQtyChanged = (e) => {
        setPlayEnergyQty(e.target.value);
    };

    const onPlayEnergySetButtonClick = (e) => {
        setRewardItem('PlayEnergy',0,playEnergyQty);
    };

    const onPlayEnergyResetButtonClick = (e) => {
        resetRewardItem('PlayEnergy',0);
    };

    // 드래곤
    const [dragonItemID, setDragonItemID] = useState('');
    const [dragonItemQty, setDragonItemQty] = useState(0);
    const [dragonBoxQty, setDragonBoxQty] = useState(0);
    const dragonGradeList = [
        {id:1, name:'SSR'}
    ];

    // const onDragonItemGradeDropboxClick = (item) => {
    //     setDragonItemGrade(item.id-1);
    // };

    const onDragonItemIDChanged = (e) => {
        setDragonItemID(e.target.value);
    };

    const onDragonBoxQtyChanged = (e) => {
        setDragonBoxQty(e.target.value);
    };

    const onDragonItemQtyChanged = (e) => {
        setDragonItemQty(e.target.value);
    };

    const onDragonItemSetButtonClick = (e) => {
        setRewardItem('Dragon',dragonItemID,dragonItemQty);
    };

    const onDragonItemResetButtonClick = (e) => {
        resetRewardItem('Dragon',dragonItemID);
    };

    const onDragonBoxSetButtonClick = (e) => {
        setRewardItem('Box',getBoxItemID('Dragon',dragonBoxType),dragonBoxQty);
    }

    const onDragonBoxResetButtonClick = (e) => {
        resetRewardItem('Box',getBoxItemID('Dragon',dragonBoxType));
    };

    // 기어
    const [gearItemID, setGearItemID] = useState('');
    const [gearItemQty, setGearItemQty] = useState(0);
    const [gearBoxQty, setGearBoxQty] = useState(0);
    const gearGradeList = [
        {id:1, name:'SSR'}
    ];

    // const onGearItemGradeDropboxClick = (item) => {
    //     setGearItemID(item.id-1);
    // };

    const onGearItemIDChanged = (e) => {
        setGearItemID(e.target.value);
    };

    const onGearBoxQtyChanged = (e) => {
        setGearBoxQty(e.target.value);
    };

    const onGearItemQtyChanged = (e) => {
        setGearItemQty(e.target.value);
    };

    const onGearItemSetButtonClick = (e) => {
        setRewardItem('Gear',gearItemID,gearItemQty);
    };

    const onGearItemResetButtonClick = (e) => {
        resetRewardItem('Gear',gearItemID);
    };

    const onGearBoxSetButtonClick = (e) => {
        setRewardItem('Box',getBoxItemID('Gear',gearBoxType),gearBoxQty);
    }

    const onGearBoxResetButtonClick = (e) => {
        resetRewardItem('Box',getBoxItemID('Gear',gearBoxType));
    };


    const grade3List = [
        {id:1, name:'레벨1'},
        {id:2, name:'레벨2'},
        {id:3, name:'레벨3'}
    ];

    const grade5List = [
        {id:1, name:'레벨1'},
        {id:2, name:'레벨2'},
        {id:3, name:'레벨3'},
        {id:4, name:'레벨4'},
        {id:5, name:'레벨5'}
    ];

    // 소모성 아이템
    const [consumableItemID, setConsumableItemID] = useState('');
    const [consumableItemQty, setConsumableItemQty] = useState(0);
    const elementalStoneItemList = [
        {id:1, name:'불 엘리멘털 스톤'}
    ];

    const onConsumableItemIDChanged = (e) => {
        setConsumableItemID(e.target.value);

        const itemName = getGameItemName(e.target.value);
        const itemType = getGameItemType(e.target.value);
        const itemElementType = getGameItemElementType(e.target.value);
        const itemGrade = getGameItemGrade(e.target.value);

        if(itemName !== null) {
            setConsumableItemInfo(`아이템 이름:${itemName} (type:${itemType}), 아이템 등급:${itemGrade}, 엘리먼트 타입:${itemElementType}`);
        } else {
            setConsumableItemInfo('');
        }
    };

    const onConsumableItemQtyChanged = (e) => {
        setConsumableItemQty(e.target.value);
    };

    const onConsumableItemSetButtonClick = (e) => {

        const type = getGameItemType(consumableItemID);
        const rscName = getGameRscName(type,consumableItemID);

        setRewardItem(rscName,consumableItemID,consumableItemQty);
    };

    const onConsumableItemResetButtonClick = (e) => {

        const type = getGameItemType(consumableItemID);
        const rscName = getGameRscName(type,consumableItemID);

        resetRewardItem(rscName,consumableItemID);
    };

    const onDragonBoxTypeClick = (item) => {

        setDragonBoxType(item.id - 1);
    };

    const onGearBoxTypeClick = (item) => {

        setGearBoxType(item.id - 1);
    };

    const onLoadCSVFileInfo = (e) => {

        const fileReader = new FileReader();

        const csvFileToArray = string => {
            const csvRows = string.split("\n");
             
            const sheetTable = [];
            let count = 0;
            for(let row of csvRows) {
                if(count > 0) {
                    const arr2 = row.split(',');
                    let rowTable = [];
                    for(let cell of arr2) {
                        rowTable.push(cell.trim());
                    }
                    sheetTable.push([...rowTable]);
                }
                count++;
            }
        
            console.log('csvTable=',sheetTable);

            setCSVDataTable(table=>sheetTable);

            const rewardInfo = [];
            for(let row of sheetTable) {
                rewardInfo.push({ItemType:parseInt(row[0]),ItemId:parseInt(row[1]),Quantity:parseInt(row[2])});
            }

            setFinalRewardInfo(info=>rewardInfo);
            setFinalRewardDescInfo(makeRewardDescInfo(rewardInfo));
        };

        fileReader.onload = function (event) {
            const text = event.target.result;

            console.log('csvText=',text);
            csvFileToArray(text);
        };

        if(e.target.files !== undefined && e.target.files.length > 0) {
            fileReader.readAsText(e.target.files[0]);
            setFileName(e.target.files[0].name);
        }
    };
    const onDownloadButtonClick = (e) => {

    };

    const onCSVFileNameChanged = (e) => {

        setFileName(e.target.value);
    };

    useEffect(() => {
        console.log("finalRewardInfo=",finalRewardInfo);
    },[finalRewardInfo]);

    return (
        <contentStyled.ContentWrapper>
          <contentStyled.ContentHeader>
            <span id="subtitle">{`${props.parentTitle} > ${titleText}`}</span>
            <span>&nbsp;</span>
            <span id="button">
              <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onApplyButtonClick(e)}>
                적용하기
              </Button1>
            </span>
            <span id="button">
              <Button1 responsive='1.6' bgColor="var(--btn-secondary-color)" width="6vw" height="2vw" onClick={(e) => onCancelButtonClick(e)}>
                취소
              </Button1>
            </span>
          </contentStyled.ContentHeader>
          <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />
    
          <contentStyled.ContentBody>
            <br />
          <styled.InputArea leftMargin='1vw' width='100%'>
                <span className="row1">
                    <label>최종 보상</label>
                </span>
                <span className="row2">
                    <TextArea1 responsive='1.6' value={JSON.stringify(finalRewardDescInfo)} readOnly='true' width='43vw' height='8vw' onChange={(e) => onFinalRewardChanged(e)} />
                </span>
                <span className="row3">
                    <form>
                        <input
                            type={"file"}
                            id={"csvFileInput"}
                            accept={".csv"}
                            onChange={onLoadCSVFileInfo}
                        />
                    </form>
                </span>
            </styled.InputArea>
            <styled.InputArea leftMargin='1vw' with='100%'>
                <span className="row1" style={{paddingLeft:'10vw',flexBasis:'20vw',textAlign:'right'}}>
                    <InputField1 responsive='1.6' width='10vw' height='2vw' type='text' readOnly={false} value={fileName} onChange={(e) => onCSVFileNameChanged(e)} />
                </span>
                <span className="row2">
                    <CSVLink filename={fileName} data={csvDataTable} enclosingCharacter={``}><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='6vw' height='2vw' onClick={(e)=>onDownloadButtonClick(e)}>다운로드하기</Button1></CSVLink>
                </span>
            </styled.InputArea>
            <br /><br />

        <contentStyled.SettingGroupArea leftMargin="2vw" width="90%">
          <div id="title">
            <label><i className="fas fa-stop" style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;재화류</label>
            <div></div>
          </div>
          <br />
          <contentStyled.FilterGroup>
            <contentStyled.FilterItem>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span id='name'>XDS</span>
                <span id='input'><InputField1 responsive='1.6' width='8vw' height='2vw' type='number' readOnly={false} value={xdsItemQty} onChange={(e) => onXDSQtyChanged(e)} /></span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span id='name'>Gold</span>
                <span id='input'><InputField1 responsive='1.6' width='8vw' height='2vw' type='number' readOnly={false} value={goldItemQty} onChange={(e) => onGoldQtyChanged(e)} /></span>
                <span id='setting'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onXDSGoldSetButtonClick(e)}>설정</Button1></span>
                <span id='reset'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onXDSGoldResetButtonClick(e)}>리셋</Button1></span>
            </contentStyled.FilterItem>
            <contentStyled.FilterItem>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span id='name'>GEM(무료)</span>
                <span id='input'><InputField1 responsive='1.6' width='8vw' height='2vw' type='number' readOnly={false} value={freeGemItemQty} onChange={(e) => onFreeGemQtyChanged(e)} /></span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span id='name'>GEM(유료)</span>
                <span id='input'><InputField1 responsive='1.6' width='8vw' height='2vw' type='number' readOnly={false} value={paidGemItemQty} onChange={(e) => onPaidGemQtyChanged(e)} /></span>
                <span id='setting'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onGemSetButtonClick(e)}>설정</Button1></span>
                <span id='reset'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onGemResetButtonClick(e)}>리셋</Button1></span>
            </contentStyled.FilterItem>
            <contentStyled.FilterItem>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span id='name'>플레이 에너지</span>
                <span id='input'><InputField1 responsive='1.6' width='8vw' height='2vw' type='number' readOnly={false} value={playEnergyQty} onChange={(e) => onPlayEnergyQtyChanged(e)} /></span>
                <span id='setting'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onPlayEnergySetButtonClick(e)}>설정</Button1></span>
                <span id='reset'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onPlayEnergyResetButtonClick(e)}>리셋</Button1></span>
            </contentStyled.FilterItem>
          </contentStyled.FilterGroup>
        </contentStyled.SettingGroupArea>
        <br />
        <contentStyled.SettingGroupArea leftMargin="2vw" width="90%">
          <div id="title">
            <label><i className="fas fa-stop" style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;장착 아이템</label>
            <div></div>
          </div>
          <br />
          <contentStyled.FilterGroup>
            <contentStyled.FilterItem>
                <div id='subtitle'>드래곤:</div>
                <span id='name'>ID</span>
                <span id='input'><InputField1 responsive='1.6' width='6vw' height='2vw' type='number' readOnly={false} value={dragonItemID} onChange={(e) => onDragonItemIDChanged(e)} /></span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span id='name'>수량</span>
                <span id='input'><InputField1 responsive='1.6' width='4vw' height='2vw' type='number' readOnly={false} value={dragonItemQty} onChange={(e) => onDragonItemQtyChanged(e)} /></span>
                <span id='setting'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onDragonItemSetButtonClick(e)}>추가</Button1></span>
                <span id='reset'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onDragonItemResetButtonClick(e)}>리셋</Button1></span>
            </contentStyled.FilterItem>
            <contentStyled.FilterItem>
                <div id='subtitle'>기어:</div>
                <span id='name'>ID</span>
                <span id='input'><InputField1 responsive='1.6' width='6vw' height='2vw' type='number' readOnly={false} value={gearItemID} onChange={(e) => onGearItemIDChanged(e)} /></span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span id='name'>수량</span>
                <span id='input'><InputField1 responsive='1.6' width='4vw' height='2vw' type='number' readOnly={false} value={gearItemQty} onChange={(e) => onGearItemQtyChanged(e)} /></span>
                <span id='setting'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onGearItemSetButtonClick(e)}>추가</Button1></span>
                <span id='reset'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onGearItemResetButtonClick(e)}>리셋</Button1></span>
            </contentStyled.FilterItem>
          </contentStyled.FilterGroup>
        </contentStyled.SettingGroupArea>
        <br />
        <contentStyled.SettingGroupArea leftMargin="2vw" width="90%">
          <div id="title">
            <label><i className="fas fa-stop" style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;박스</label>
            <div></div>
          </div>
          <br />
          <contentStyled.FilterGroup>
            <contentStyled.FilterItem>
                <div id='subtitle'>드래곤:</div>
                <span id='name'>ID</span>
                <span id='input'><DropBox responsive='1.3' width='6vw' height='2vw' fontSize='0.6vw' text={itemBoxTypeTable[dragonBoxType].name} itemList={itemBoxTypeTable} menuItemClick={(item)=>onDragonBoxTypeClick(item)} /></span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span id='name'>수량</span>
                <span id='input'><InputField1 responsive='1.6' width='4vw' height='2vw' type='number' readOnly={false} value={dragonBoxQty} onChange={(e) => onDragonBoxQtyChanged(e)} /></span>
                <span id='setting'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onDragonBoxSetButtonClick(e)}>추가</Button1></span>
                <span id='reset'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onDragonBoxResetButtonClick(e)}>리셋</Button1></span>
            </contentStyled.FilterItem>
            <contentStyled.FilterItem>
                <div id='subtitle'>기어:</div>
                <span id='name'>ID</span>
                <span id='input'><DropBox responsive='1.3' width='6vw' height='2vw' fontSize='0.6vw' text={itemBoxTypeTable[gearBoxType].name} itemList={itemBoxTypeTable} menuItemClick={(item)=>onGearBoxTypeClick(item)} /></span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span id='name'>수량</span>
                <span id='input'><InputField1 responsive='1.6' width='4vw' height='2vw' type='number' readOnly={false} value={gearBoxQty} onChange={(e) => onGearBoxQtyChanged(e)} /></span>
                <span id='setting'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onGearBoxSetButtonClick(e)}>추가</Button1></span>
                <span id='reset'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onGearBoxResetButtonClick(e)}>리셋</Button1></span>
            </contentStyled.FilterItem>
          </contentStyled.FilterGroup>
        </contentStyled.SettingGroupArea>
        <br />
        <contentStyled.SettingGroupArea leftMargin="2vw" width="90%">
          <div id="title">
            <label><i className="fas fa-stop" style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;소모성 아이템(재료)</label>
            <div></div>
          </div>
          <br />
          <contentStyled.FilterGroup>
            <contentStyled.FilterItem>
                <div id='subtitle'>재료:</div>
                <span id='name'>ID</span>
                <span id='input'><InputField1 responsive='1.6' width='6vw' height='2vw' type='number' readOnly={false} value={consumableItemID} onChange={(e) => onConsumableItemIDChanged(e)} /></span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span id='name'>수량</span>
                <span id='input'><InputField1 responsive='1.6' width='4vw' height='2vw' type='number' readOnly={false} value={consumableItemQty} onChange={(e) => onConsumableItemQtyChanged(e)} /></span>
                <span id='setting'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onConsumableItemSetButtonClick(e)}>추가</Button1></span>
                <span id='reset'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onConsumableItemResetButtonClick(e)}>리셋</Button1></span>
            </contentStyled.FilterItem>
          </contentStyled.FilterGroup>
        </contentStyled.SettingGroupArea>
          <styled.InputArea leftMargin='2vw' width='100%'>
                <span className="row1">
                    <label>아이템 속성</label>
                </span>
                <span className="row2">
                    <TextArea1 responsive='1.6' value={consumableItemInfo} readOnly='true' width='41vw' height='4vw' />
                </span>
                <span className="row3">&nbsp;</span>
            </styled.InputArea>
          </contentStyled.ContentBody>
        </contentStyled.ContentWrapper>
      );
};

export default RewardSettingPanel;