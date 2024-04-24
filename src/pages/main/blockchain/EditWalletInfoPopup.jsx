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
import TextArea1 from '../../../components/TextArea1';


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

const EditWalletInfoPopup = ({shown,paramInfo,callback,onButtonClick}) => {

    const [walletName, setWalletName] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [walletKey, setWalletKey] = useState('');
    const [editMode, setEditMode] = useState(false);


    const onWalletNameChanged = (e) => {
      setWalletName(e.target.value);
    };

    const onWalletAddressChanged = (e) => {
      setWalletAddress(e.target.value);
    };

    const onWalletKeyChanged = (e) => {
      setWalletKey(e.target.value);
    };

    const onOKButtonClick = (e) => {

      onButtonClick(e,{walletName,walletAddress,walletKey});
    };

    const onCancelButtonClick = (e) => {

      onButtonClick(e,null);
    };

    useEffect(() => {
      setWalletName(paramInfo.walletInfo!==null?paramInfo.walletInfo.walletName:'');
      setWalletAddress(paramInfo.walletInfo!==null?paramInfo.walletInfo.walletAddress:'');
      setWalletKey(paramInfo.walletInfo!==null?paramInfo.walletInfo.walletKey:'');

      if(paramInfo.walletInfo!==null) {
        setEditMode(true);
      } else {
        setEditMode(false);
      }
    },[shown]);

    if(shown === undefined || shown === false) {
        return null;
    } else {
    }

    return (
      <Modal onClose={null}>
        <commonStyled.StWrapper width='35vw' minHeight='20vw'>
          <StTitlePanel>
            <p>지갑 정보</p>
          </StTitlePanel>
          <StBodyPanel>
            <contentStyled.SettingGroupArea leftMargin="0vw" width="90%">
              <contentStyled.SettingItemArea leftMargin='0vw' bottomMargin='0vw' itemMarginRight='1vw'>
                      <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle', color:'var(--primary-color)', fontWeight:'bold' }}>
                      <p>지갑이름</p>
                      </div>
                      <div id="item-part2">
                      <InputField1 responsive='1.6' value={walletName} width="27vw" height="2vw" onChange={(e)=>onWalletNameChanged(e)} />
                      </div>
              </contentStyled.SettingItemArea>
              <contentStyled.SettingItemArea leftMargin='0vw' bottomMargin='0vw' itemMarginRight='1vw'>
                      <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle', color:'var(--primary-color)', fontWeight:'bold' }}>
                      <p>지갑주소</p>
                      </div>
                      <div id="item-part2">
                      <InputField1 responsive='1.6' value={walletAddress} width="27vw" height="2vw" readOnly={editMode} onChange={(e)=>onWalletAddressChanged(e)} />
                      </div>
              </contentStyled.SettingItemArea>
              <contentStyled.SettingItemArea leftMargin='0vw' bottomMargin='0vw' itemMarginRight='1vw'>
                      <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle', color:'var(--primary-color)', fontWeight:'bold' }}>
                      <p>개인키</p>
                      </div>
                      <div id="item-part2">
                      <InputField1 responsive='1.6' value={walletKey} width="27vw" height="2vw" onChange={(e)=>onWalletKeyChanged(e)} />
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
  
  export default EditWalletInfoPopup;