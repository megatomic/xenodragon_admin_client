import React, {useState,useEffect,useCallback} from 'react';
import styled from 'styled-components';
import BigNumber from '../../../common/js/bignumber';

import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as pageStyled from '../blockchain/NFTContentPageStyles';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import Table from '../../../components/Table';
import RadioGroup from '../../../components/RadioGroup';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useAccount from '../../../store/useAccountDataManager';
import useNFT from '../../../store/useNFTDataManager';
import { toast } from 'react-toastify';


import EditWalletInfoPopup from '../blockchain/EditWalletInfoPopup';

const titleText = '마켓매출 지갑 전송';

const liveMarketOperatorAddress = '0x941448856C9e6e24f3c066D9f7844652c6722cBd';
const qaMarketOperatorAddress = '0x12D680E69F918CC2E44E008811a4fF827CD77D1d';

const StWalletInfoWrapper = styled.div`
    border: 0.07vw solid var(--primary-color);
    border-radius: 0.4vw;
    margin: 0vw 1vw 2vw 4vw;
    padding: 0.7vw 1.2vw 1.2vw 1.7vw;
    width: 80%;
    height: 16.5vw;
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
            display: flex;
            height: 2vw;
            
            #name {
                color: var(--primary-color);
                font-weight: bold;
                margin-right: 1vw;
            }
            #value {
                display: inline-block;
                margin-right: 1.5vw;
                height: 3vw;
            }
            #unit {
                color: var(--third-color);
                font-weight: bold;
            }
        }
    }
`;

const tokenTypeTable = ['KSTA','NST','XDC'];

const MarketBalanceTransferPanel = (props) => {

    const {serverType, startLoading, setStartLoading} = useCommon();
    const {nftInfo, requestQueryMarketSaleContractInfo, requestWalletBalanceInfo, requestTransferMarketBalanceToAddress} = useNFT();

    const [kstaMarketOperator, setKSTAMarketOperator] = useState(0.0);
    const [nstMarketOperator, setNSTMarketOperator] = useState(0.0);
    const [xdcMarketOperator, setXDCMarketOperator] = useState(0.0);

    const [marketOperatorAddress, setMarketOperatorAddress] = useState(serverType==='live'?liveMarketOperatorAddress:qaMarketOperatorAddress);
    const [b2cMarketSaleContractInfo, setB2CMarketSaleContractInfo] = useState([]);
    const [c2cMarketSaleContractInfo, setC2CMarketSaleContractInfo] = useState([]);
    const [contractType, setContractType] = useState(0);
    const [refreshFlag, setRefreshFlag] = useState(false);

    const [b2cTokenType, setB2CTokenType] = useState([1,1,1]);
    const [c2cTokenType, setC2CTokenType] = useState([2,2,2]);

    const [targetAddressTable, setTargetAddressTable] = useState([serverType==='live'?liveMarketOperatorAddress:qaMarketOperatorAddress,serverType==='live'?liveMarketOperatorAddress:qaMarketOperatorAddress,serverType==='live'?liveMarketOperatorAddress:qaMarketOperatorAddress]);

    const [curContractIndex, setCurContractIndex] = useState(0);
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
            setStartLoading(true);

            let tokenType = [...b2cTokenType];
            if(contractType===1) {
                tokenType = [...c2cTokenType];
            }

            const tkType = tokenTypeTable[tokenType[curContractIndex]];
            let contractInfo = null;
            
            if(contractType===0) {
                contractInfo = b2cMarketSaleContractInfo[curContractIndex];
            } else {
                contractInfo = c2cMarketSaleContractInfo[curContractIndex];
            }

            let amount = 0.0;
            if(tokenType[curContractIndex] === 0) {
                amount = contractInfo.ksta;
            } else if(tokenType[curContractIndex] === 1) {
                amount = contractInfo.nst;
            } else {
                amount = contractInfo.xdc;
            }

            const resultInfo = await requestTransferMarketBalanceToAddress({ownerAddress:marketOperatorAddress,contractType:(contractType===0?'B2C':'C2C'),itemType:curContractIndex,tokenType:tkType,amount,targetAddress:targetAddressTable[curContractIndex]});
            if(resultInfo.resultCode != 0) {
                toast.error(resultInfo.message);
            } else {
                toast.info(`${targetAddressTable[curContractIndex]}로 ${tokenTypeTable[tokenType[curContractIndex]]}전송이 완료되었습니다.`,{autoClose:5000});
            }

            if(contractType===0) {
                setB2CMarketSaleContractInfo(info=>[]);
            } else {
                setC2CMarketSaleContractInfo(info=>[]);
            }
            
            setStartLoading(false);
    
            onPopupCloseButtonClick(null);

            setRefreshFlag(!refreshFlag);

          } else {
            onPopupCloseButtonClick(null);
          }
    };

    const onPopupCloseButtonClick = async (e) => {

        setPopupID('');
        setPopupShown(false);
    };
    
    const onTokenTypeRadioButtonClick = async (itemType,idx) => {

        if(contractType===0) {
            const tkType = [...b2cTokenType];
            tkType[itemType] = idx;
            setB2CTokenType(tkType);
        } else {
            const tkType = [...c2cTokenType];
            tkType[itemType] = idx;
            setC2CTokenType(tkType);
        }
    };

    const onContractTypeRadioButtonClick = async (idx) => {
        setContractType(idx);
    }

    const onTargetAddressValueChange = async (itemType,e) => {

        const addressTable = [...targetAddressTable];
        addressTable[itemType] = e.target.value.trim();
        setTargetAddressTable(table=>addressTable);
    };

    const onTransferBalanceButtonClick = async (itemType,e) => {

        if(targetAddressTable[itemType] === null || targetAddressTable[itemType] === undefined || targetAddressTable[itemType].trim() === "") {
            toast.error("대상 주소를 정확히 입력해주세요.");
            return;
        }

        let coinAmount;
        if(contractType===0) {
            console.log(`itemType=${itemType}, tokenType=${b2cTokenType}`);
            if(b2cTokenType[itemType] === 0) {
                toast.error('다른 토큰을 선택하세요.(토큰 인출시 자동으로 KSTA도 인출됩니다)');
                return;
                //coinAmount = b2cMarketSaleContractInfo[itemType].ksta;
            } else if(b2cTokenType[itemType] === 1) {
                coinAmount = b2cMarketSaleContractInfo[itemType].nst;
            } else {
                coinAmount = b2cMarketSaleContractInfo[itemType].xdc;
            }
            if(itemType === 0) {
                setPopupContent(`드래곤 판매 컨트랙트의 ${coinAmount} ${tokenTypeTable[b2cTokenType[itemType]]} 모두를 ${targetAddressTable[itemType]}로 인출하시겠습니까?`);
            } else if(itemType === 1) {
                setPopupContent(`기어 판매 컨트랙트의 ${coinAmount} ${tokenTypeTable[b2cTokenType[itemType]]} 모두를 ${targetAddressTable[itemType]}로 인출하시겠습니까?`);
            } else {
                setPopupContent(`패키지 판매 컨트랙트의 ${coinAmount} ${tokenTypeTable[b2cTokenType[itemType]]} 모두를 ${targetAddressTable[itemType]}로 인출하시겠습니까?`);
            }

        } else {
            console.log(`itemType=${itemType}, tokenType=${c2cTokenType}`);
            if(c2cTokenType[itemType] === 0) {
                toast.error('다른 토큰을 선택하세요.(토큰 인출시 자동으로 KSTA도 인출됩니다)');
                return;
                //coinAmount = c2cMarketSaleContractInfo[itemType].ksta;
            } else if(c2cTokenType[itemType] === 1) {
                coinAmount = c2cMarketSaleContractInfo[itemType].nst;
            } else {
                coinAmount = c2cMarketSaleContractInfo[itemType].xdc;
            }
            if(itemType === 0) {
                setPopupContent(`C2C 판매 컨트랙트1의 ${coinAmount} ${tokenTypeTable[c2cTokenType[itemType]]} 모두를 ${targetAddressTable[itemType]}로 인출하시겠습니까?`);
            } else {
                setPopupContent(`C2C 판매 컨트랙트2의 ${coinAmount} ${tokenTypeTable[c2cTokenType[itemType]]} 모두를 ${targetAddressTable[itemType]}로 인출하시겠습니까?`);
            }
        }

        setCurContractIndex(itemType);
        setPopupShown(true);
    };

    const reloadMarketOperatorInfo = async () => {

        setStartLoading(true);
        const resultInfo = await requestWalletBalanceInfo(marketOperatorAddress);
        if(resultInfo.resultCode === 0) {
            setKSTAMarketOperator(resultInfo.data.ksta);
            setNSTMarketOperator(resultInfo.data.nst);
            setXDCMarketOperator(resultInfo.data.xdc);
        }
        setStartLoading(false);
    };

    const reloadMarketSaleContractInfo = async () => {

        if((contractType===0 && b2cMarketSaleContractInfo.length > 0) || (contractType===1 && c2cMarketSaleContractInfo.length > 0)) {
            return;
        }

        setStartLoading(true);
        const resultInfo = await requestQueryMarketSaleContractInfo({contractType:(contractType===0?'B2C':'C2C'),balanceInfo:true,pageNo:1});
        if(resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
        } else {
            const info = resultInfo.data;
            let marketContractInfo = {};

            if(contractType===0) {
                marketContractInfo = [
                    {
                        tag:"드래곤 판매 컨트랙트",
                        contractAddress:info.dragon.contractAddress,
                        ksta:info.dragon.ksta,
                        nst:info.dragon.nst,
                        xdc:info.dragon.xdc
                    },
                    {
                        tag:"기어 판매 컨트랙트",
                        contractAddress:info.gear.contractAddress,
                        ksta:info.gear.ksta,
                        nst:info.gear.nst,
                        xdc:info.gear.xdc
                    },
                    {
                        tag:"패키지 판매 컨트랙트",
                        contractAddress:info.package.contractAddress,
                        ksta:info.package.ksta,
                        nst:info.package.nst,
                        xdc:info.package.xdc
                    }
                ];
    
                setB2CMarketSaleContractInfo(marketContractInfo);
            } else {
                marketContractInfo = [
                    {
                        tag:"C2C 판매 컨트랙트1",
                        contractAddress:info.c2c1.contractAddress,
                        ksta:info.c2c1.ksta,
                        nst:info.c2c1.nst,
                        xdc:info.c2c1.xdc
                    },
                    {
                        tag:"C2C 판매 컨트랙트2",
                        contractAddress:info.c2c2.contractAddress,
                        ksta:info.c2c2.ksta,
                        nst:info.c2c2.nst,
                        xdc:info.c2c2.xdc
                    }
                ];
    
    
                setC2CMarketSaleContractInfo(marketContractInfo);
            }
        }
        setStartLoading(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            await reloadMarketOperatorInfo();
            await reloadMarketSaleContractInfo();
        };
        fetchData();
    }, [contractType,refreshFlag]);
      
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
                <label style={{paddingTop:'0.4vw',color:'#ff0000'}}>[주의] 라이브 전송의 경우 반드시 '대상주소'를 올바로 설정했는지 확인하세요!(전송후 되돌릴 수 없습니다!)</label>
                <div></div>
            </div>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;마켓 운영자 정보</label>
                    <div></div>
                </div>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <br />
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>지갑주소</p>
                    </div>
                    <div id="item-part2">
                        {marketOperatorAddress}
                    </div>
                    <br />
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <p>잔액정보</p>
                    </div>
                    <div id="item-part2">
                    <span id='balance-info'>
                        <span>{kstaMarketOperator}</span>&nbsp;<span id='unit'>KSTA</span>&nbsp;&nbsp;&nbsp;<label>/</label>&nbsp;&nbsp;&nbsp;
                        <span>{nstMarketOperator}</span>&nbsp;<span id='unit'>NST</span>&nbsp;&nbsp;&nbsp;<label>/</label>&nbsp;&nbsp;&nbsp;
                        <span>{xdcMarketOperator}</span>&nbsp;<span id='unit'>XDC</span>
                    </span>
                    </div>
                    <br />
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;컨트랙트 정보</label>
                    <div></div>
                </div>
            </contentStyled.SettingGroupArea>
            <br />
            <contentStyled.SettingGroupArea leftMargin="3vw" width="90%">
                <div id="title">
                    <RadioGroup responsive='1.6' initButtonIndex={contractType} interMargin="0.5vw" buttonWidth="4vw" nameTable={['B2C용','C2C용']} buttonClicked={(idx) => onContractTypeRadioButtonClick(idx)} />
                    <div></div>
                </div>
            </contentStyled.SettingGroupArea>
            <br />
            {contractType===0?(
                b2cMarketSaleContractInfo.map((contractInfo,index) => {
                    return <>
                        <StWalletInfoWrapper>
                            <StWalletDetailInfoPanel>
                                <div id='header'>
                                    <div id='title'>
                                        [{contractInfo.tag}]
                                    </div>
                                </div>
                                <div id='body' style={{width:'100%'}}>
                                    <div id='item'>
                                        <span id='name'>컨트랙트 주소</span>
                                        <span id='value'>{contractInfo.contractAddress}</span>
                                    </div>
                                    <div id='item'>
                                        <span id='name'>잔액정보</span>
                                        <span id='value'>
                                            <span id='balance-info'>
                                                <span>{contractInfo.ksta}</span>&nbsp;<span id='unit'>{tokenTypeTable[0]}</span>&nbsp;&nbsp;&nbsp;<label>/</label>&nbsp;&nbsp;&nbsp;
                                                <span>{contractInfo.nst}</span>&nbsp;<span id='unit'>{tokenTypeTable[1]}</span>&nbsp;&nbsp;&nbsp;<label>/</label>&nbsp;&nbsp;&nbsp;
                                                <span>{contractInfo.xdc}</span>&nbsp;<span id='unit'>{tokenTypeTable[2]}</span>
                                            </span>
                                        </span>
                                    </div>
                                    <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
                                    <br />
                                    <div id='item'>
                                        <span id='name' style={{paddingTop:'0.4vw'}}>전송할 토큰</span>
                                        <span id='value'><RadioGroup responsive='1.6' initButtonIndex={b2cTokenType[index]} interMargin="0.5vw" buttonWidth="4vw" nameTable={[tokenTypeTable[0],tokenTypeTable[1],tokenTypeTable[2]]} buttonClicked={(idx) => onTokenTypeRadioButtonClick(index,idx)} /></span>
                                    </div>
                                    <br />
                                    <div id='item'>
                                        <span id='name' style={{paddingTop:'0.5vw'}}>대상 주소</span>
                                        <span id='value'><InputField1 responsive='1.6' width='32vw' height='2vw' value={targetAddressTable[index]} readOnly={false} onChange={(e)=>onTargetAddressValueChange(index,e)} /></span>
                                        <span id='unit'><Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='6vw' height='2vw' onClick={(e)=>onTransferBalanceButtonClick(index,e)}>인출하기</Button1></span>
                                    </div>
                                </div>
                            </StWalletDetailInfoPanel>
                        </StWalletInfoWrapper>
                    </>
                })):(
                    c2cMarketSaleContractInfo.map((contractInfo,index) => {
                        return <>
                            <StWalletInfoWrapper>
                                <StWalletDetailInfoPanel>
                                    <div id='header'>
                                        <div id='title'>
                                            [{contractInfo.tag}]
                                        </div>
                                    </div>
                                    <div id='body' style={{width:'100%'}}>
                                        <div id='item'>
                                            <span id='name'>컨트랙트 주소</span>
                                            <span id='value'>{contractInfo.contractAddress}</span>
                                        </div>
                                        <div id='item'>
                                            <span id='name'>잔액정보</span>
                                            <span id='value'>
                                                <span id='balance-info'>
                                                    <span>{contractInfo.ksta}</span>&nbsp;<span id='unit'>{tokenTypeTable[0]}</span>&nbsp;&nbsp;&nbsp;<label>/</label>&nbsp;&nbsp;&nbsp;
                                                    <span>{contractInfo.nst}</span>&nbsp;<span id='unit'>{tokenTypeTable[1]}</span>&nbsp;&nbsp;&nbsp;<label>/</label>&nbsp;&nbsp;&nbsp;
                                                    <span>{contractInfo.xdc}</span>&nbsp;<span id='unit'>{tokenTypeTable[2]}</span>
                                                </span>
                                            </span>
                                        </div>
                                        <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
                                        <br />
                                        <div id='item'>
                                            <span id='name' style={{paddingTop:'0.4vw'}}>전송할 토큰</span>
                                            <span id='value'><RadioGroup responsive='1.6' initButtonIndex={c2cTokenType[index]} interMargin="0.5vw" buttonWidth="4vw" nameTable={[tokenTypeTable[0],tokenTypeTable[1],tokenTypeTable[2]]} buttonClicked={(idx) => onTokenTypeRadioButtonClick(index,idx)} /></span>
                                        </div>
                                        <br />
                                        <div id='item'>
                                            <span id='name' style={{paddingTop:'0.5vw'}}>대상 주소</span>
                                            <span id='value'><InputField1 responsive='1.6' width='32vw' height='2vw' value={targetAddressTable[index]} readOnly={false} onChange={(e)=>onTargetAddressValueChange(index,e)} /></span>
                                            <span id='unit'><Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='6vw' height='2vw' onClick={(e)=>onTransferBalanceButtonClick(index,e)}>인출하기</Button1></span>
                                        </div>
                                    </div>
                                </StWalletDetailInfoPanel>
                            </StWalletInfoWrapper>
                        </>
                    })
                )
            }
            <Popup
                shown={popupShown}
                popupTypeInfo={{ type: 'YesNo', button1Text: '예', button2Text: '아니오' }}
                title="알림"
                width="30vw"
                content={popupContent}
                buttonClick={(buttonNo) => onPopupButtonClick(buttonNo)}
                closeClick={onPopupCloseButtonClick}
            />
            </contentStyled.ContentBody>
        </contentStyled.ContentWrapper>
    )
};

export default MarketBalanceTransferPanel;