import React,{useState,useEffect,useRef} from 'react';
import MediaQuery from 'react-responsive';
import BigNumber from '../../../common/js/bignumber';
import { toast } from 'react-toastify';

import styled,{css} from 'styled-components';
import * as contentStyled from '../MainContentStyles';
import * as commonStyled from '../../../styles/commonStyles';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import RadioGroup from '../../../components/RadioGroup';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useTool from '../../../store/useToolDataManager';
import useNFT from '../../../store/useNFTDataManager';

const StMarketContractInfoWrapper = styled.div`
    border: 0.07vw solid var(--primary-color);
    border-radius: 0.4vw;
    margin: 0vw 1vw 2vw 2vw;
    padding: 0.7vw 1.2vw 1.2vw 1.7vw;
    width: 80%;
    height: ${(props)=>props.height};
    font-size: 0.7vw;
`;

const titleText = '마켓 컨트랙트 설정';

const MarketContractSettingPanel = (props) => {

    const fileReader = new FileReader();

    const {startLoading, setStartLoading} = useCommon();
    const {nftInfo, requestQueryMarketSaleContractInfo, requestQueryMarketContractSettingInfo, requestUpdateMarketContractSettingInfo} = useNFT();
    const {requestSeasonRegistrationToMarket, requestNFTRegistrationToMarket} = useTool();

    const [b2CMarketSaleContractInfo,setB2CMarketSaleContractInfo] = useState({dragonContractAddress:'',gearContractAddress:'',packageContractAddress:''});
    const [c2CMarketSaleContractInfo,setC2CMarketSaleContractInfo] = useState({contractAddress1:'',contractAddress2:''});

    const [b2CMarketContractSettingInfo,setB2CMarketContractSettingInfo] = useState({holderAddress:'',nstContractAddress:'',nftContractAddress:'',dragonItemPrice:'0',gearItemPrice:'0',packageItemPrice:'0'});
    const [c2CMarketContractSettingInfo,setC2CMarketContractSettingInfo] = useState({xdcContractAddress:'',nftContractAddress:'',tradeFee:'0'});
    const [b2CMarketContractSettingInfoOrg,setB2CMarketContractSettingInfoOrg] = useState({holderAddress:'',nstContractAddress:'',nftContractAddress:'',dragonItemPrice:'0',gearItemPrice:'0',packageItemPrice:'0'});
    const [c2CMarketContractSettingInfoOrg,setC2CMarketContractSettingInfoOrg] = useState({xdcContractAddress:'',nftContractAddress:'',tradeFee:'0'});

    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [popupID, setPopupID] = useState('');
    const [subMenuOpen,setSubMenuOpen] = useState(false);


    const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
    };

   const onUpdateB2CSettingInfoButtonClick = (e) => {

    setPopupContent('B2C 설정정보를 컨트랙트에 저장하시겠습니까?');
    setPopupID('popup.b2c');
    setPopupShown(true);
   };

   const onUpdateC2CSettingInfoButtonClick = (e) => {

    setPopupContent('C2C 설정정보를 컨트랙트에 저장하시겠습니까?');
    setPopupID('popup.c2c');
    setPopupShown(true);
   };

    const onPopupButtonClick = async (buttonIdx) => {

        if (buttonIdx === 0) {
            setStartLoading(true);
        
            setTimeout(async () => {

                setStartLoading(true);

                let contractSettingInfo = {};
                if(popupID === 'popup.b2c') {

                    if(b2CMarketContractSettingInfo.holderAddress.trim() !== b2CMarketContractSettingInfoOrg.holderAddress.trim()) {
                        contractSettingInfo = {holderAddress:b2CMarketContractSettingInfo.holderAddress};
                    }
                    if(b2CMarketContractSettingInfo.nstContractAddress.trim() !== b2CMarketContractSettingInfoOrg.nstContractAddress.trim()) {
                        contractSettingInfo = {...contractSettingInfo,nstContractAddress:b2CMarketContractSettingInfo.nstContractAddress};
                    }
                    if(b2CMarketContractSettingInfo.nftContractAddress.trim() !== b2CMarketContractSettingInfoOrg.nftContractAddress.trim()) {
                        contractSettingInfo = {...contractSettingInfo,nftContractAddress:b2CMarketContractSettingInfo.nftContractAddress};
                    }
                    if(b2CMarketContractSettingInfo.dragonItemPrice.trim() !== b2CMarketContractSettingInfoOrg.dragonItemPrice.trim()) {
                        contractSettingInfo = {...contractSettingInfo,dragonItemPrice:b2CMarketContractSettingInfo.dragonItemPrice};
                    }
                    if(b2CMarketContractSettingInfo.gearItemPrice.trim() !== b2CMarketContractSettingInfoOrg.gearItemPrice.trim()) {
                        contractSettingInfo = {...contractSettingInfo,gearItemPrice:b2CMarketContractSettingInfo.gearItemPrice};
                    }
                    if(b2CMarketContractSettingInfo.packageItemPrice.trim() !== b2CMarketContractSettingInfoOrg.packageItemPrice.trim()) {
                        contractSettingInfo = {...contractSettingInfo,packageItemPrice:b2CMarketContractSettingInfo.packageItemPrice};
                    }

                    const resultInfo = await requestUpdateMarketContractSettingInfo({contractType:'B2C', contractSettingInfo});
            
                    console.log(resultInfo);
                    if (resultInfo.resultCode === 0) {
                        toast.info(`B2C 설정정보를 컨트랙트에 저장하였습니다.`);
                    } else {
                        toast.error(resultInfo.message);
                    }
                                  
                } else if(popupID === 'popup.c2c') {
                    if(c2CMarketContractSettingInfo.xdcContractAddress.trim() !== c2CMarketContractSettingInfoOrg.xdcContractAddress.trim()) {
                        contractSettingInfo = {xdcContractAddress:c2CMarketContractSettingInfo.xdcContractAddress};
                    }
                    if(c2CMarketContractSettingInfo.nftContractAddress.trim() !== c2CMarketContractSettingInfoOrg.nftContractAddress.trim()) {
                        contractSettingInfo = {...contractSettingInfo,nftContractAddress:c2CMarketContractSettingInfo.nftContractAddress};
                    }
                    if(c2CMarketContractSettingInfo.tradeFee.trim() !== c2CMarketContractSettingInfoOrg.tradeFee.trim()) {
                        contractSettingInfo = {...contractSettingInfo,tradeFee:c2CMarketContractSettingInfo.tradeFee};
                    }

                    const resultInfo = await requestUpdateMarketContractSettingInfo({contractType:'C2C', contractSettingInfo});
            
                    console.log(resultInfo);
                    if (resultInfo.resultCode === 0) {
                        toast.info(`C2C 설정정보를 컨트랙트에 저장하였습니다.`);
                    } else {
                        toast.error(resultInfo.message);
                    }
                }

                await reloadMarketContractSettingInfo();
                
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

    const reloadMarketSaleContractInfo = async () => {

        setStartLoading(true);
        const resultInfo = await requestQueryMarketSaleContractInfo({contractType:'ALL',balanceInfo:false,pageNo:1});
        if(resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
        } else {
            const info = resultInfo.data;

            let marketContractInfo = {
                dragonContractAddress:info.dragon.contractAddress,
                gearContractAddress:info.gear.contractAddress,
                packageContractAddress:info.package.contractAddress
            };

            setB2CMarketSaleContractInfo({...marketContractInfo});

            marketContractInfo = {
                contractAddress1:info.c2c1.contractAddress,
                contractAddress2:info.c2c2.contractAddress
            };

            setC2CMarketSaleContractInfo({...marketContractInfo});
        }
        setStartLoading(false);
    };

    const reloadMarketContractSettingInfo = async () => {

        setStartLoading(true);
        const resultInfo = await requestQueryMarketContractSettingInfo({contractType:'ALL'});
        if(resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
        } else {
            const info = resultInfo.data;

            let marketContractInfo = {
                holderAddress:info.dragon.holderAddress,
                nstContractAddress:info.dragon.nstContractAddress,
                nftContractAddress:info.dragon.nftContractAddress,
                dragonItemPrice:(new BigNumber(new BigNumber(info.dragon.price,10)/ new BigNumber('1000000000000000000',10))).toString(),
                gearItemPrice:(new BigNumber(new BigNumber(info.gear.price,10)/ new BigNumber('1000000000000000000',10))).toString(),
                packageItemPrice:(new BigNumber(new BigNumber(info.package.price,10)/ new BigNumber('1000000000000000000',10))).toString()
            };
            setB2CMarketContractSettingInfo({...marketContractInfo});
            setB2CMarketContractSettingInfoOrg({...marketContractInfo});

            marketContractInfo = {
                xdcContractAddress:info.c2c1.xdcContractAddress,
                nftContractAddress:info.c2c1.nftContractAddress,
                tradeFee:(parseInt(info.c2c1.fee)/100).toString()
            }
            setC2CMarketContractSettingInfo({...marketContractInfo});
            setC2CMarketContractSettingInfoOrg({...marketContractInfo});
        }
        setStartLoading(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            await reloadMarketSaleContractInfo();
            await reloadMarketContractSettingInfo();
        };
        fetchData();
    }, []);

    const onHolderAddressValueChange = (e) => {

        const bb = {...b2CMarketContractSettingInfo};
        bb.holderAddress = e.target.value.trim();
        setB2CMarketContractSettingInfo(bb);
    };

    const onB2CNSTContractAddressValueChange = (e) => {

        const bb = {...b2CMarketContractSettingInfo};
        bb.nstContractAddress = e.target.value.trim();
        setB2CMarketContractSettingInfo(bb);
    };

    const onB2CNFTContractAddressValueChange = (e) => {

        const bb = {...b2CMarketContractSettingInfo};
        bb.nftContractAddress = e.target.value.trim();
        setB2CMarketContractSettingInfo(bb);
    };

    const onDragonItemPriceChange = (e) => {

        const bb = {...b2CMarketContractSettingInfo};
        bb.dragonItemPrice = e.target.value.trim();
        setB2CMarketContractSettingInfo(bb);
    };

    const onGearItemPriceChange = (e) => {

        const bb = {...b2CMarketContractSettingInfo};
        bb.gearItemPrice = e.target.value.trim();
        setB2CMarketContractSettingInfo(bb);
    };

    const onPackageItemPriceChange = (e) => {

        const bb = {...b2CMarketContractSettingInfo};
        bb.packageItemPrice = e.target.value.trim();
        setB2CMarketContractSettingInfo(bb);
    };

    const onC2CXDCContractAddressValueChange = (e) => {

        const bb = {...c2CMarketContractSettingInfo};
        bb.xdcContractAddress = e.target.value.trim();
        setC2CMarketContractSettingInfo(bb);
    };

    const onC2CNFTContractAddressValueChange = (e) => {

        const bb = {...c2CMarketContractSettingInfo};
        bb.nftContractAddress = e.target.value.trim();
        setC2CMarketContractSettingInfo(bb);
    };

    const onTradeFeeValueChange = (e) => {

        const bb = {...c2CMarketContractSettingInfo};
        bb.tradeFee = e.target.value.trim();
        setC2CMarketContractSettingInfo(bb);
    };

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
                    <label style={{fontSize:'0.8vw'}}><i className='fas fa-stop' style={{fontSize:'0.6vw',verticalAlign:'center'}}/>&nbsp;&nbsp;B2C 컨트랙트</label>
                    <div></div>
                </div>
                <br />
                <StMarketContractInfoWrapper height={'7vw'}>
                    <contentStyled.SettingItemArea leftMargin='0vw' bottomMargin='0vw'>
                        <div id="item-part1" style={{ width:'6vw', verticalAlign: 'middle' }}>
                            <label>드래곤 판매용 주소</label>
                        </div>
                        <div id="item-part2" style={{ width:'8vw', verticalAlign: 'middle' }}>
                            <div>
                                <label>{b2CMarketSaleContractInfo.dragonContractAddress}</label>
                            </div>
                        </div>
                    </contentStyled.SettingItemArea>
                    <contentStyled.SettingItemArea leftMargin='0vw' bottomMargin='0vw'>
                        <div id="item-part1" style={{ width:'6vw', verticalAlign: 'middle' }}>
                            <label>기어 판매용 주소</label>
                        </div>
                        <div id="item-part2" style={{ width:'8vw', verticalAlign: 'middle' }}>
                            <div>
                                <label>{b2CMarketSaleContractInfo.gearContractAddress}</label>
                            </div>
                        </div>
                    </contentStyled.SettingItemArea>
                    <contentStyled.SettingItemArea leftMargin='0vw' bottomMargin='0vw'>
                        <div id="item-part1" style={{ width:'6vw', verticalAlign: 'middle' }}>
                            <label>패키지 판매용 주소</label>
                        </div>
                        <div id="item-part2" style={{ width:'8vw', verticalAlign: 'middle' }}>
                            <div>
                                <label>{b2CMarketSaleContractInfo.packageContractAddress}</label>
                            </div>
                        </div>
                    </contentStyled.SettingItemArea>
                </StMarketContractInfoWrapper>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <label>운영자 주소</label>
                    </div>
                    <div id="item-part2" style={{ width:'23vw', verticalAlign: 'middle' }}>
                        <div>
                            <InputField1 responsive='1.6' width='22vw' height='2vw' value={b2CMarketContractSettingInfo.holderAddress} readOnly={false} onChange={(e)=>onHolderAddressValueChange(e)} />
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <label>구매토큰(NST) 주소</label>
                    </div>
                    <div id="item-part2" style={{ width:'23vw', verticalAlign: 'middle' }}>
                        <div>
                            <InputField1 responsive='1.6' width='22vw' height='2vw' value={b2CMarketContractSettingInfo.nstContractAddress} readOnly={false} onChange={(e)=>onB2CNSTContractAddressValueChange(e)} />
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <label>NFT 컨트랙트 주소</label>
                    </div>
                    <div id="item-part2" style={{ width:'23vw', verticalAlign: 'middle' }}>
                        <div>
                            <InputField1 responsive='1.6' width='22vw' height='2vw' value={b2CMarketContractSettingInfo.nftContractAddress} readOnly={false} onChange={(e)=>onB2CNFTContractAddressValueChange(e)} />
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <label>판매 가격</label>
                    </div>
                    <div id="item-part2" style={{ width:'12vw', verticalAlign: 'middle' }}>
                        <div>
                            <label>드래곤:&nbsp;</label>
                        </div>
                        <div>
                            <InputField1 responsive='1.6' width='6vw' height='2vw' value={b2CMarketContractSettingInfo.dragonItemPrice} readOnly={false} onChange={(e)=>onDragonItemPriceChange(e)} />
                        </div>
                        <div>
                            <label>&nbsp;NST</label>
                        </div>
                    </div>
                    <div id="item-part2" style={{ width:'12vw', verticalAlign: 'middle' }}>
                        <div>
                            <label>기어:&nbsp;</label>
                        </div>
                        <div>
                            <InputField1 responsive='1.6' width='6vw' height='2vw' value={b2CMarketContractSettingInfo.gearItemPrice} readOnly={false} onChange={(e)=>onGearItemPriceChange(e)} />
                        </div>
                        <div>
                            <label>&nbsp;NST</label>
                        </div>
                    </div>
                    <div id="item-part2" style={{ width:'12vw', verticalAlign: 'middle' }}>
                        <div>
                            <label>패키지:&nbsp;</label>
                        </div>
                        <div>
                            <InputField1 responsive='1.6' width='6vw' height='2vw' value={b2CMarketContractSettingInfo.packageItemPrice} readOnly={false} onChange={(e)=>onPackageItemPriceChange(e)} />
                        </div>
                        <div>
                            <label>&nbsp;NST</label>
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' onClick={(e)=>onUpdateB2CSettingInfoButtonClick(e)}>설정하기</Button1>
                    </div>
                </contentStyled.SettingItemArea>
            </contentStyled.SettingGroupArea>
            <br />
            <br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label style={{fontSize:'0.8vw'}}><i className='fas fa-stop' style={{fontSize:'0.6vw',verticalAlign:'center'}}/>&nbsp;&nbsp;C2C 컨트랙트</label>
                    <div></div>
                </div>
                <br />
                <StMarketContractInfoWrapper height={'5.5vw'}>
                    <contentStyled.SettingItemArea leftMargin='0vw' bottomMargin='0vw'>
                        <div id="item-part1" style={{ width:'6vw', verticalAlign: 'middle' }}>
                            <label>C2C 거래용 주소1</label>
                        </div>
                        <div id="item-part2" style={{ width:'8vw', verticalAlign: 'middle' }}>
                            <div>
                                <label>{c2CMarketSaleContractInfo.contractAddress1}</label>
                            </div>
                        </div>
                    </contentStyled.SettingItemArea>
                    <contentStyled.SettingItemArea leftMargin='0vw' bottomMargin='0vw'>
                        <div id="item-part1" style={{ width:'6vw', verticalAlign: 'middle' }}>
                            <label>C2C 거래용 주소2</label>
                        </div>
                        <div id="item-part2" style={{ width:'8vw', verticalAlign: 'middle' }}>
                            <div>
                                <label>{c2CMarketSaleContractInfo.contractAddress2}</label>
                            </div>
                        </div>
                    </contentStyled.SettingItemArea>
                </StMarketContractInfoWrapper>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <label>거래토큰(XDC) 주소</label>
                    </div>
                    <div id="item-part2" style={{ width:'23vw', verticalAlign: 'middle' }}>
                        <div>
                            <InputField1 responsive='1.6' width='22vw' height='2vw' value={c2CMarketContractSettingInfo.xdcContractAddress} readOnly={false} onChange={(e)=>onC2CXDCContractAddressValueChange(e)} />
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <label>NFT 컨트랙트 주소</label>
                    </div>
                    <div id="item-part2" style={{ width:'23vw', verticalAlign: 'middle' }}>
                        <div>
                            <InputField1 responsive='1.6' width='22vw' height='2vw' value={c2CMarketContractSettingInfo.nftContractAddress} readOnly={false} onChange={(e)=>onC2CNFTContractAddressValueChange(e)} />
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'8vw', verticalAlign: 'middle' }}>
                        <label>거래 수수료</label>
                    </div>
                    <div id="item-part2" style={{ width:'23vw', verticalAlign: 'middle' }}>
                        <div>
                            <InputField1 responsive='1.6' width='4vw' height='2vw' value={c2CMarketContractSettingInfo.tradeFee} readOnly={false} onChange={(e)=>onTradeFeeValueChange(e)} />
                            &nbsp;&nbsp;{'%'}
                        </div>
                    </div>
                </contentStyled.SettingItemArea>
                <contentStyled.SettingItemArea bottomMargin='0vw'>
                    <div id="item-part1" style={{ width:'4vw', verticalAlign: 'middle' }}>
                    <Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' onClick={(e)=>onUpdateC2CSettingInfoButtonClick(e)}>설정하기</Button1>
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

export default MarketContractSettingPanel;