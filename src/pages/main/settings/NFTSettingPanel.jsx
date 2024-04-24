import React, { useState,useEffect } from 'react';
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as constants from '../../../common/constants';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import CheckBox from '../../../components/CheckBox';

import useCommon from '../../../store/useCommonStorageManager';
import useSetting from '../../../store/useSettingDataManager';
import { toast } from 'react-toastify';

import {updateSettingItemTable} from './SettingsContainer';

const titleText = 'NFT 설정';

const getSettingValueSet = (itemList, groupID, itemName) => {
  for (let item of itemList) {
    if (item.groupID === groupID && item.itemName === itemName) {
      return [item.itemValue1, item.itemValue2, item.itemValue3];
    }
  }
  return [];
};

const updateSettingValueSet = (itemList, groupID, itemName, itemValue1, itemValue2, itemValue3) => {
  for (let item of itemList) {
    if (item.groupID === groupID && item.itemName === itemName) {
      item.itemValue1 = itemValue1;
      item.itemValue2 = itemValue2;
      item.itemValue3 = itemValue3;
    }
  }
  return itemList;
};

const NFTSettingPanel = (props) => {
  const { startLoading, setStartLoading } = useCommon();
  const { settingInfo, requestSettingList, requestUpdateSettings } = useSetting();

  const [modifiedSettingItemTable, setModifiedSettingItemTable] = useState([]);

  const [mintingNumUnit, setMintingNumUnit] = useState(0);
  const [curNFTContractAddress, setCurNFTContractAddress] = useState('');
  const [newNFTContractAddress, setNewNFTContractAddress] = useState('');

  const [curMetadataBaseURI, setCurMetadataBaseURI] = useState('');
  const [newMetadataBaseURI, setNewMetadataBaseURI] = useState('');

  const [settingItemList, setSettingItemList] = useState([]);
  const [subMenuOpen,setSubMenuOpen] = useState(false);

  const onNFTMintingNumUnitValueChanged = (e) => {

    const value = e.target.value;
    setMintingNumUnit(value);

    let table = updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_NFT,
      constants.SETTINGS_ITEM_MINTINGNUMUNIT,0,value);
    table = updateSettingItemTable(
      table,
      constants.SETTINGS_GROUP_NFT,
      constants.SETTINGS_ITEM_MINTINGNUMUNIT,1,'update');

    setModifiedSettingItemTable(table);
  };

  const onNFTContractAddressValueChanged = (e) => {

    const value = e.target.value;
    setNewNFTContractAddress(value);

    let table = updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_NFT,
      constants.SETTINGS_ITEM_CONTRACTADDRESS,0,value);
    table = updateSettingItemTable(
      table,
      constants.SETTINGS_GROUP_NFT,
      constants.SETTINGS_ITEM_CONTRACTADDRESS,1,'update');

    setModifiedSettingItemTable(table);
  };

  const onMetadataBaseURIValueChanged = (e) => {

    const value = e.target.value;
    setNewMetadataBaseURI(value);

    let table = updateSettingItemTable(
      modifiedSettingItemTable,
      constants.SETTINGS_GROUP_NFT,
      constants.SETTINGS_ITEM_METADATABASEURI,0,value);
    table = updateSettingItemTable(
      table,
      constants.SETTINGS_GROUP_NFT,
      constants.SETTINGS_ITEM_METADATABASEURI,1,'update');

    setModifiedSettingItemTable(table);
  };

  const onApplyButtonClick = (e) => {

    setStartLoading(true);

    // let itemList = [...settingItemList];
    // itemList = updateSettingValueSet(itemList, 'NFT', 'contract_address', newNFTContractAddress,'update', '');
    // itemList = updateSettingValueSet(itemList, 'NFT', 'metadata_base_uri', newMetadataBaseURI,'update', '');
    // itemList = updateSettingValueSet(itemList, 'NFT', 'minting_num_unit', mintingNumUnit,'update', '');
  
    // setSettingItemList(itemList);

    console.log('modifiedSettingItemTable=',JSON.stringify(modifiedSettingItemTable,null,2));

    setTimeout(async () => {
      const resultInfo = await requestUpdateSettings(modifiedSettingItemTable,"");

      console.log(resultInfo);
      if (resultInfo.resultCode === 0) {
        toast.info('설정사항이 적용되었습니다.');

        setNewMetadataBaseURI('');

        reloadSettingInfo();

      } else {
        toast.error(resultInfo.message);
      }
      setStartLoading(false);
    }, 200);
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen(state=>!subMenuOpen);
};

const reloadSettingInfo = async () => {
    setStartLoading(true);
    const resultInfo = await requestSettingList();

    console.log(resultInfo);
    if (resultInfo.resultCode !== 0) {
      toast.error(resultInfo.message);
    } else {
      const itemList = resultInfo.data;

      let settingInfo = getSettingValueSet(itemList, 'NFT', 'contract_address');
      setCurNFTContractAddress(settingInfo[0]);

      settingInfo = getSettingValueSet(itemList, 'NFT', 'metadata_base_uri');
      let settingInfo2 = getSettingValueSet(itemList, 'NFT', 'metadata_base_uri_contract');

      setCurMetadataBaseURI(settingInfo[0]);
      if(settingInfo2.length > 0) {
        setCurMetadataBaseURI(settingInfo2[0]);
        setNewMetadataBaseURI(settingInfo[0]);
      }
      
      settingInfo = getSettingValueSet(itemList, 'NFT', 'minting_num_unit');
      setMintingNumUnit(settingInfo[0]);

      setSettingItemList(itemList);
    }
    setStartLoading(false);
};

useEffect(()=> {
    props.onSubMenuOpenClicked(subMenuOpen);
},[subMenuOpen]);

  useEffect(() => {
    reloadSettingInfo();
  }, []);

  return (
    <contentStyled.ContentWrapper>
      <contentStyled.ContentHeader>
      <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
        </MediaQuery>
        <span id="subtitle">{titleText}</span>
        <span>&nbsp;</span>
        <span id="button">
          <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onApplyButtonClick(e)}>
            적용하기
          </Button1>
        </span>
      </contentStyled.ContentHeader>
      <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />

      <contentStyled.ContentBody>
      <br />
      <br />
        <contentStyled.SettingGroupArea leftMargin="4vw" width="90%">
          <div id="title">
            <label>일반</label>
            <div></div>
          </div>
          <br />
          <contentStyled.SettingItemArea>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>NFT 민팅처리 단위</label>
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="6vw" height="2vw" value={mintingNumUnit} onChange={(e) => onNFTMintingNumUnitValueChanged(e)} /><label>개 / 트랜젝션</label>
            </div>
            <br />
          </contentStyled.SettingItemArea>
        </contentStyled.SettingGroupArea>
        <br />
        <contentStyled.SettingGroupArea leftMargin="4vw" width="90%">
          <div id="title">
            <label>스마트 컨트랙트</label>
            <div></div>
          </div>
          <br />
          <contentStyled.SettingItemArea>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>기존 배포주소</label>
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="30vw" height="2vw" readOnly={true} value={curNFTContractAddress} />
            </div>
            <br /><br />
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>신규 배포주소</label>
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="30vw" height="2vw" value={newNFTContractAddress} onChange={(e) => onNFTContractAddressValueChanged(e)} />
            </div>
          </contentStyled.SettingItemArea>
        </contentStyled.SettingGroupArea>
        <br />
        <contentStyled.SettingGroupArea leftMargin="4vw" width="90%">
          <div id="title">
            <label>메타데이터</label>
            <div></div>
          </div>
          <br />
          <contentStyled.SettingItemArea>
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>기존 URI</label>
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="30vw" height="2vw" readOnly={true} value={curMetadataBaseURI} />
            </div>
            <br /><br />
            <div id="item-part1" style={{ verticalAlign: 'middle' }}>
              <label>신규 URI</label>
            </div>
            <div id="item-part2">
              <InputField1 responsive='1.6' width="30vw" height="2vw" value={newMetadataBaseURI} onChange={(e) => onMetadataBaseURIValueChanged(e)} />
            </div>
          </contentStyled.SettingItemArea>
        </contentStyled.SettingGroupArea>
      </contentStyled.ContentBody>
    </contentStyled.ContentWrapper>
  );
};

export default NFTSettingPanel;
