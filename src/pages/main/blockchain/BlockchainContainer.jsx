import React,{useState} from 'react';
import {useMediaQuery} from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import SubMenuPanel from '../SubMenuPanel';
import NFTDashboardPanel from './NFTDashboardPanel';
import NFTOwnerRankingPanel from './NFTOwnerRankingPanel';
import NFTOwnerQueryPanel from './NFTOwnerQueryPanel';
import NFTMintingListPanel from './NFTMintingListPanel';
import NFTTransferListPanel from './NFTTransferListPanel';
import NFTBurningListPanel from './NFTBurningListPanel';
import NFTUpdateMetadataPanel from './NFTUpdateMetadataPanel';
import TokenLiquidPoolStatePanel from './TokenLiquidPoolStatePanel';
import TokenSwapStatePanel from './TokenSwapStatePanel';
import ERC20TokenTransferPanel from './ERC20TokenTransferPanel';
import WalletManagePanel from './WalletManagePanel';
import settings from '../../../common/settings';

import useCommon from '../../../store/useCommonStorageManager';
import useAuth from '../../../store/useAuthDataManager';

const menuTable = [
    {id:1, name:'NFT 대시보드'},
    {id:2, name:'NFT 보유 랭킹'},
    {id:3, name:'NFT 보유자', line:true},
    {id:4, name:'NFT 민팅'},
    {id:5, name:'NFT 전송'},
    {id:6, name:'NFT 소각'},
    {id:7, name:'메타데이터 업데이트', line:true},
    {id:8, name:'게임 유동성풀 현황'},
    {id:9, name:'게임 토큰스왑 현황', line:true},
    {id:10, name:'토큰 대량전송'},
    {id:11, name:'지갑 관리'}
];

const BlockchainContainer = () => {

    const {eventInfo} = useCommon();
    const {authInfo} = useAuth();
    const [activeMenuID, setActiveMenuID] = useState(1);
    const isMobile = useMediaQuery({query: "(max-width:768px)"});
    const [subMenuOpen, setSubMenuOpen] = useState(isMobile?false:true);

    const subMenuTable = [];
    for(let menuItem of menuTable) {
        subMenuTable.push(menuItem);
    }

    const onSubMenuChange = (menuID => {

        setActiveMenuID(menuID);
    });

    const onSubMenuOpenClick = (flag) => {
        if(isMobile) {
            setSubMenuOpen(flag);
        }
    };

    const onSubMenuCloseClick = (e) => {
        if(isMobile) {
            setSubMenuOpen(false);
        }
    };

    return (
        <React.Fragment>
            {subMenuOpen && <SubMenuPanel activeMenuID={activeMenuID} subMenuTable={subMenuTable} onMenuClick={(menuID)=>onSubMenuChange(menuID)} onSubMenuCloseClick={(e)=>onSubMenuCloseClick(e)}/>}
            {eventInfo.testMode?<p>SettingsContainer</p>:
                (
            <mainStyled.MainContentPanel>
                <div>
                    {activeMenuID === 1 && <NFTDashboardPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 2 && <NFTOwnerRankingPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 3 && <NFTOwnerQueryPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 4 && <NFTMintingListPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 5 && <NFTTransferListPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 6 && <NFTBurningListPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 7 && <NFTUpdateMetadataPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 8 && <TokenLiquidPoolStatePanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 9 && <TokenSwapStatePanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 10 && <ERC20TokenTransferPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                    {activeMenuID === 11 && <WalletManagePanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)}/>}
                </div>
            </mainStyled.MainContentPanel>)}
        </React.Fragment>
    )
};
    
export default BlockchainContainer;