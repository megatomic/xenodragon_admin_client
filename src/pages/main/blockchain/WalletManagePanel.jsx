import React, {useState,useEffect,useCallback} from 'react';
import styled from 'styled-components';

import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as pageStyled from './NFTContentPageStyles';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import Table from '../../../components/Table';
import RadioGroup from '../../../components/RadioGroup';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useAccount from '../../../store/useAccountDataManager';
import useNFT from '../../../store/useNFTDataManager';
import { toast } from 'react-toastify';

import EditWalletInfoPopup from './EditWalletInfoPopup';

const titleText = '지갑 관리';


const StWalletInfoWrapper = styled.div`
    border: 0.07vw solid var(--primary-color);
    border-radius: 0.4vw;
    margin: 0vw 1vw 2vw 4vw;
    padding: 0.7vw 1.2vw 1.2vw 1.7vw;
    width: 80%;
    height: 9.5vw;
    font-size: 0.7vw;
`;


const StWalletDetailInfoPanel = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    flex-wrap: wrap;

    #header {
        width: 100%;
        margin-bottom:0.6vw;
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        #title {
            color: var(--secondary-color);
            font-size: 0.8vw;
            font-weight: bold;
            padding-top: 0.4vw;
        }
        #button-group {

        }
    }
    #body {
        padding-left: 0.3vw;
        font-size: 0.8vw;
        #item {
            margin-bottom: 0.4vw;
            #name {
                color: var(--primary-color);
                font-weight: bold;
                margin-right: 1vw;
            }
            #value {
                margin-right: 1.5vw;
            }
            #unit {
                color: var(--third-color);
                font-weight: bold;
            }
        }
    }
`;

const makeHiddenString = (text,showCharNum) => {

    let result = "";
    for(let i=0;i<text.length;i++) {
        if(i+1 <= showCharNum) {
            result += text.charAt(i);
        } else {
            result += "*";
        }
    }

    return result;
}

const WalletManagePanel = (props) => {

    const {startLoading, setStartLoading} = useCommon();
    const {nftInfo, requestQueryWalletInfoList, requestAddWallet, requestUpdateWalletInfo, requestDeleteWallet} = useNFT();

    const [walletInfoList, setWalletInfoList] = useState([]);

    const [curWalletIndex, setCurWalletIndex] = useState(-1);
    const [editWalletPopupShown,setEditWalletPopupShown] = useState(false);
    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [popupID, setPopupID] = useState('');
    const [subMenuOpen,setSubMenuOpen] = useState(false);

    const onSubMenuClick = (e) => {
        //setSubMenuOpen(state=>!subMenuOpen);
    };

    const onPopupButtonClick = async (buttonIdx) => {

        console.log('buttonIndex=',buttonIdx);

        if (buttonIdx === 0) {
            if(popupID === 'popup.delete') {
                setStartLoading(true);

                const walletInfo = walletInfoList[curWalletIndex];
                const resultInfo = await requestDeleteWallet({walletAddress:walletInfo.walletAddress});
                if(resultInfo.resultCode !== 0) {
                    toast.error(resultInfo.message);
                } else {
                    toast.info(`지갑정보(${walletInfo.walletAddress})가 삭제되었습니다.`);
                }
                setStartLoading(false);

                walletInfoList.splice(curWalletIndex,1);
                setWalletInfoList(list=>walletInfoList);
            }
    
            onPopupCloseButtonClick(null);

          } else {
            onPopupCloseButtonClick(null);
          }
    };

    const onPopupCloseButtonClick = async (e) => {

        setCurWalletIndex(-1);
        setPopupID('');
        setPopupShown(false);
    };
    
    const onAddWalletButtonClick = (e) => {

        setCurWalletIndex(-1);
        setPopupID('popup.add');

        setEditWalletPopupShown(true);
    };

    const onEditWalletInfoButtonClick = (e,index) => {

        setCurWalletIndex(index);
        setPopupID('popup.edit');

        setEditWalletPopupShown(true);
    };

    const onDeleteWalletButtonClick = (e,index) => {

        setCurWalletIndex(index);

        setPopupID('popup.delete');
        setPopupContent('해당 지갑을 삭제하시겠습니까? (DB정보만 삭제되며 지갑이 사라지진 않습니다.)');
        setPopupShown(true);
    };

    const onEditWalletCloseButtonClick = async (e,data) => {

        if(data !== null) {
            setStartLoading(true);
            if(popupID === 'popup.add') {
                //walletInfoList.push({walletName:data.walletName, walletAddress:data.walletAddress, walletKey:data.walletKey});
                const resultInfo = await requestAddWallet(data);
                if(resultInfo.resultCode !== 0) {
                    toast.error(resultInfo.message);
                } else {
                    toast.info(`지갑정보(${data.walletAddress})가 추가되었습니다.`);
                }

                await reloadWalletInfoList(1);

            } else if(popupID === 'popup.edit') {
                walletInfoList[curWalletIndex] = {...walletInfoList[curWalletIndex],walletName:data.walletName,walletAddress:data.walletAddress,walletKey:data.walletKey};
                const resultInfo = await requestUpdateWalletInfo(data);
                if(resultInfo.resultCode !== 0) {
                    toast.error(resultInfo.message);
                } else {
                    toast.info(`지갑정보(${data.walletAddress})가 업데이트되었습니다.`);
                }
            }
            setStartLoading(false);
        }

        setPopupID('');
        setEditWalletPopupShown(false);
    };

    const reloadWalletInfoList = async () => {

        setStartLoading(true);
        const resultInfo = await requestQueryWalletInfoList(1);
        if(resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
        } else {
            const walletList = resultInfo.data.list;
            setWalletInfoList(walletList);
        }
        setStartLoading(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            await reloadWalletInfoList();
        };
        fetchData();
    }, []);
      
    return (
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader>
            <MediaQuery maxWidth={768}>
                &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
            </MediaQuery>
            <span id="subtitle">{titleText}</span>
            <span>&nbsp;</span>
            <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='6vw' height='2vw' onClick={(e)=>onAddWalletButtonClick(e)}>추가하기</Button1></span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
            <br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;지갑 정보</label>
                    <div></div>
                </div>
            </contentStyled.SettingGroupArea>
            <br />
            {
                walletInfoList.map((walletInfo,index) => {
                    return <>
                        <StWalletInfoWrapper>
                            <StWalletDetailInfoPanel>
                                <div id='header'>
                                    <div id='title'>
                                        [{walletInfo.walletName}]
                                    </div>
                                    <div id='button-group'>
                                        <Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='4vw' height='2vw' onClick={(e)=>onEditWalletInfoButtonClick(e,index)}>수정</Button1>&nbsp;
                                        <Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='4vw' height='2vw' onClick={(e)=>onDeleteWalletButtonClick(e,index)}>삭제</Button1>
                                    </div>
                                </div>
                                <div id='body'>
                                    <div id='item'>
                                        <span id='name'>지갑주소</span>
                                        <span id='value'>{walletInfo.walletAddress}</span>
                                    </div>
                                    <div id='item'>
                                        <span id='name'>잔액정보</span>
                                        <span id='value'>
                                            <span id='balance-info'>
                                                <span>{walletInfo.balanceInfo.ksta}</span>&nbsp;<span id='unit'>KSTA</span>&nbsp;&nbsp;&nbsp;<label>/</label>&nbsp;&nbsp;&nbsp;
                                                <span>{walletInfo.balanceInfo.nst}</span>&nbsp;<span id='unit'>NST</span>&nbsp;&nbsp;&nbsp;<label>/</label>&nbsp;&nbsp;&nbsp;
                                                <span>{walletInfo.balanceInfo.xdc}</span>&nbsp;<span id='unit'>XDC</span>
                                            </span>
                                        </span>
                                    </div>
                                    <div id='item'>
                                        &nbsp;&nbsp;&nbsp;<span id='name'>개인키</span>
                                        <span id='value'>{makeHiddenString(walletInfo.walletKey,20)}</span>
                                    </div>
                                </div>
                            </StWalletDetailInfoPanel>
                        </StWalletInfoWrapper>
                    </>
                })
            }
            <Popup
                shown={popupShown}
                popupTypeInfo={{ type: 'YesNo', button1Text: '예', button2Text: '아니오' }}
                title="알림"
                content={popupContent}
                buttonClick={(buttonNo) => onPopupButtonClick(buttonNo)}
                closeClick={onPopupCloseButtonClick}
            />
            <EditWalletInfoPopup shown={editWalletPopupShown} paramInfo={{walletInfo:(curWalletIndex===-1?null:walletInfoList[curWalletIndex])}} onButtonClick={(e,data)=>onEditWalletCloseButtonClick(e,data)} />
            </contentStyled.ContentBody>
        </contentStyled.ContentWrapper>
    )
};

export default WalletManagePanel;