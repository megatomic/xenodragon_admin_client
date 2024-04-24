import React,{useState,useEffect,useRef} from 'react';
import styled from 'styled-components';
import * as contentStyled from '../MainContentStyles'
import * as commonStyled from '../../../styles/commonStyles';
import dayjs from 'dayjs';
import useCommon from '../../../store/useCommonStorageManager';
import useNFT from '../../../store/useNFTDataManager';

import Modal from '../../../components/Modal';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';

const StTitlePanel = styled.div`
  flex: 0 0 3vw;
  width: 100%;
  background-color: var(--primary-color);
  border-top-left-radius: 0.4vw;
  border-top-right-radius: 0.4vw;

  > p {
    color: #ffffff;
    font-size: 0.8vw;
    padding: 0.8vw 0;
  }
`;

const StBodyPanel = styled.div`
  flex: 1;
  padding: 0.4vw 0.4vw;

  display: flex;
  flex-direction: column;
  justify-content: center;
  > #content {
    color: var(--secondary-color);
    vertical-align: center;
  }
`;

const StButtonGroupPanel = styled.div`
  flex: 0 0 4vw;
  > #button-group button {
    margin: 0.3vw 1vw;
  }
`;

const serverTypeTableTemplate = [
    {id:1, name:'내부 서버', type:'INTERNAL'},
    {id:2, name:'내부QA 서버', type:'QA'},
    {id:3, name:'리뷰 서버', type:'REVIEW'},
    {id:4, name:'라이브 서버', type:'LIVE'}
];

const makeAvailServerTypeTable = (index) => {

    //console.log('serverTypeTableTemplate=',serverTypeTableTemplate);

    const resultTable = [];
    for(let serverType of serverTypeTableTemplate) {
        if(serverType.id-1 !== index) {
            resultTable.push({...serverType});
        }
    }

    //console.log('index=',index,', resultTable=',resultTable);

    for(let i=0;i<resultTable.length;i++) {
        resultTable[i].id = i+1;
    }
    return resultTable;
};

const NFTMintingInfoCopyPopup = ({shown,paramInfo,callback,onButtonClick}) => {

    const [serverType, setServerType] = useState(0);
    const [serverTypeTable, setServerTypeTable] = useState([]);

    const onOKButtonClick = (e) => {

      onButtonClick(e,{serverType:serverTypeTable[serverType].type});
    };

    const onCancelButtonClick = (e) => {

      onButtonClick(e,null);
    };

    const onServerTypeItemClick = (item) => {

        setServerType(item.id-1);
    };

    useEffect(() => {
        if(shown === false) {
            return;
        }

      setServerTypeTable(makeAvailServerTypeTable(paramInfo.serverTypeIndex));
    //   setWalletName(paramInfo.walletInfo!==undefined?paramInfo.walletInfo.walletName:'');
    //   setWalletAddress(paramInfo.walletInfo!==undefined?paramInfo.walletInfo.walletAddress:'');
    //   setWalletKey(paramInfo.walletInfo!==undefined?paramInfo.walletInfo.walletKey:'');

      console.log('serverTypeIndex=',paramInfo.serverTypeIndex);
      setServerType(paramInfo.serverTypeIndex);

    },[shown]);

    if(shown === undefined || shown === false) {
        return null;
    } else {
    }

    return (
      <Modal onClose={null}>
        <commonStyled.StWrapper width='25vw' minHeight='18vw'>
          <StTitlePanel>
            <p>타겟 서버 선택</p>
          </StTitlePanel>
          <StBodyPanel>
            <contentStyled.SettingGroupArea leftMargin="0vw" width="90%">
                <contentStyled.SettingItemArea leftMargin='0vw' bottomMargin='0vw' itemMarginRight='1vw'>
                      <div id="item-part1" style={{ width:'24vw', verticalAlign: 'middle', color:'var(--primary-color)', fontWeight:'bold' }}>
                      <p>민팅정보를 복사할 타겟 서버를 선택하세요.</p>
                      </div>
                </contentStyled.SettingItemArea>
                <br />
                <contentStyled.SettingItemArea leftMargin='0vw' bottomMargin='0vw' itemMarginRight='1vw'>
                        <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle', color:'var(--primary-color)', fontWeight:'bold' }}>
                        <p>타겟 서버</p>
                        </div>
                        <div id="item-part2">
                        <DropBox responsive='3.4' width='12vw' height='2vw' style={{marginBottom:'0.15vw'}} fontColor='#000000' fontSize='0.6vw' text={serverTypeTable[serverType]===undefined?"":serverTypeTable[serverType].name} itemList={serverTypeTable} menuItemClick={(item)=>onServerTypeItemClick(item)} />
                        </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
          </StBodyPanel>
          <StButtonGroupPanel>
            <div id='button-group'>
                    <Button1 bgColor='var(--btn-confirm-color)' disable width='8vw' height='2.5vw' onClick={(e)=>onOKButtonClick(e)}>완료</Button1>
                    <Button1 bgColor='var(--btn-secondary-color)' disable width='8vw' height='2.5vw' onClick={(e)=>onCancelButtonClick(e)}>취소</Button1>
                </div>
          </StButtonGroupPanel>
        </commonStyled.StWrapper>
      </Modal>
    );
  };
  
  export default NFTMintingInfoCopyPopup;