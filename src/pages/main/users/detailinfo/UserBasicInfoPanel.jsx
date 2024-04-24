import React, {useState,useCallback,useEffect,useRef} from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import * as constants from '../../../../common/constants';
import * as mainStyled from '../../MainPageStyles';
import * as contentStyled from '../../MainContentStyles';
import * as styled from '../UserDetailInfoPageStyles';

import Button1 from '../../../../components/Button1';
import InputField1 from '../../../../components/InputField1';
import CheckBox from '../../../../components/CheckBox';

import useCommon from '../../../../store/useCommonStorageManager';
import useNFT from '../../../../store/useNFTDataManager';

const getPlatformType = (platformType) => {

    if(platformType === constants.PLATFORM_TYPE_IOS) {
        return 'iOS';
    } else if(platformType === constants.PLATFORM_TYPE_WINDOWS) {
        return 'Windows';
    } else if(platformType === constants.PLATFORM_TYPE_MACOS) {
        return 'MacOS';
    } else if(platformType === constants.PLATFORM_TYPE_WEB) {
        return 'Web';
    } else if(platformType === constants.PLATFORM_TYPE_ANDROID_XSOLLA) {
        return 'Android_Xsolla';
    }

    return 'ANDROID';
};

const UserBasicInfoPanel = (props) => {

    const {requestWalletBalanceInfo} = useNFT();

    const [userBasicInfo,setUserBasicInfo] = useState(null);
    const [userCoinInfo, setUserCoinInfo] = useState('');

    const onAddToBlacklistButtonClick = (e) => {

    };

    useEffect(() => {
        setUserBasicInfo(props.basicInfo);
    },[props]);

    const fetchData = async () => {
        if(userBasicInfo !== null && userBasicInfo !== undefined && userBasicInfo.walletAddress !== "") {
            const resultInfo = await requestWalletBalanceInfo(userBasicInfo.walletAddress);
            console.log('resultInfo=',JSON.stringify(resultInfo,null,2));

            if(resultInfo.resultCode !== 0) {
                toast.error(resultInfo.message);
            } else {
                const info = `${parseFloat(resultInfo.data.ksta).toFixed(2)} / ${parseFloat(resultInfo.data.nst).toFixed(2)} / ${parseFloat(resultInfo.data.xdc).toFixed(2)}`;
                setUserCoinInfo(info);
            }
        }
    };
    useEffect(() => {
        fetchData();
    },[userBasicInfo]);

    if(userBasicInfo === null || userBasicInfo === undefined) {
        return null;
    }

    return (
        <contentStyled.ContentBody>
            <styled.HeaderMenuPanel>
                <span id='button'><Button1 responsive='1.6' bgColor="var(--btn-secondary-color)" width="10vw" height="2vw" onClick={(e) => onAddToBlacklistButtonClick(e)}>
                    블랙리스트로 등록하기
                </Button1></span>
            </styled.HeaderMenuPanel>
            <br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;프로필</label>
                    <div></div>
                </div>
            </contentStyled.SettingGroupArea>
            <styled.Table marginLeft='2vw' marginRight='5vw'>
                <styled.TableRow height='2vw'>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>유저ID</styled.TableCell>
                    <styled.TableCell width='20vw'>{userBasicInfo.pId}</styled.TableCell>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>디바이스ID</styled.TableCell>
                    <styled.TableCell>{userBasicInfo.deviceId}</styled.TableCell>
                </styled.TableRow>
                <styled.TableRow height='2vw'>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>생성시각</styled.TableCell>
                    <styled.TableCell>{dayjs(userBasicInfo.createdAt).format('YYYY-MM-DD HH:mm:ss')}</styled.TableCell>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>최근 로그인 시각</styled.TableCell>
                    <styled.TableCell>{dayjs(userBasicInfo.connectAt).format('YYYY-MM-DD HH:mm:ss')}</styled.TableCell>
                </styled.TableRow>
                <styled.TableRow height='2vw'>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>리더 드래곤ID</styled.TableCell>
                    <styled.TableCell>{userBasicInfo.leaderUserDragonId}</styled.TableCell>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>MMR</styled.TableCell>
                    <styled.TableCell>{userBasicInfo.mmr}</styled.TableCell>
                </styled.TableRow>
                <styled.TableRow height='2vw'>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>지갑주소</styled.TableCell>
                    <styled.TableCell>{userBasicInfo.walletAddress!==""?userBasicInfo.walletAddress:"없음"}</styled.TableCell>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>지갑연결</styled.TableCell>
                    <styled.TableCell>{userBasicInfo.walletAddress!==""?(userBasicInfo.walletUse===true?"연결중":"미연결"):"없음"}</styled.TableCell>
                </styled.TableRow>
            </styled.Table>
            <br /><br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;재화</label>
                    <div></div>
                </div>
            </contentStyled.SettingGroupArea>
            <styled.Table marginLeft='2vw' marginRight='5vw'>
                <styled.TableRow height='2vw'>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>XDS</styled.TableCell>
                    <styled.TableCell width='20vw'>
                        <styled.TableCellContent>
                            <label>{userBasicInfo.xds}</label>
                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                변경
                            </Button1></span>
                        </styled.TableCellContent>
                    </styled.TableCell>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>Gold</styled.TableCell>
                    <styled.TableCell>
                    <styled.TableCellContent>
                            <label>{userBasicInfo.gold}</label>
                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                변경
                            </Button1></span>
                        </styled.TableCellContent>                        
                    </styled.TableCell>
                </styled.TableRow>
                <styled.TableRow height='2vw'>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>Gem(무료)</styled.TableCell>
                    <styled.TableCell>
                        <styled.TableCellContent>
                            <label>{userBasicInfo.gemFree}</label>
                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                변경
                            </Button1></span>
                        </styled.TableCellContent>
                    </styled.TableCell>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>Gem(유료)</styled.TableCell>
                    <styled.TableCell>
                        <styled.TableCellContent>
                            <label>{userBasicInfo.gem}</label>
                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                변경
                            </Button1></span>
                        </styled.TableCellContent>
                    </styled.TableCell>
                </styled.TableRow>
                <styled.TableRow height='2vw'>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>에너지</styled.TableCell>
                    <styled.TableCell>
                        <styled.TableCellContent>
                            <label>{userBasicInfo.energy}</label>
                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                변경
                            </Button1></span>
                        </styled.TableCellContent>
                    </styled.TableCell>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>KSTA / NST / XDC</styled.TableCell>
                    <styled.TableCell>{userCoinInfo}</styled.TableCell>
                </styled.TableRow>
            </styled.Table>
            <br /><br />
            <contentStyled.SettingGroupArea leftMargin="1vw" width="90%">
                <div id="title">
                    <label><i className='fas fa-genderless' style={{fontSize:'0.5vw'}}/>&nbsp;&nbsp;기타</label>
                    <div></div>
                </div>
            </contentStyled.SettingGroupArea>
            <styled.Table marginLeft='2vw' marginRight='5vw'>
                <styled.TableRow height='2vw'>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>남은 탐험 횟수</styled.TableCell>
                    <styled.TableCell width='20vw'>
                        <styled.TableCellContent>
                            <label>{userBasicInfo.expeditionCount}</label>
                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                변경
                            </Button1></span>
                        </styled.TableCellContent>
                    </styled.TableCell>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>탐험 슬롯수</styled.TableCell>
                    <styled.TableCell>
                    <styled.TableCellContent>
                            <label>{userBasicInfo.expeditionSlot}</label>
                            <span id='button'><Button1 bgColor="var(--btn-primary-color)" width="3vw" height="1.7vw" onClick={(e) => {return false}}>
                                변경
                            </Button1></span>
                        </styled.TableCellContent>                        
                    </styled.TableCell>
                </styled.TableRow>
                <styled.TableRow height='2vw'>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>에그 도움 카운트</styled.TableCell>
                    <styled.TableCell>
                        <styled.TableCellContent>
                        <label>{userBasicInfo.eggHelpCount}</label>
                        </styled.TableCellContent>
                    </styled.TableCell>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>유저 상태</styled.TableCell>
                    <styled.TableCell>
                        <styled.TableCellContent>
                        <label>{userBasicInfo.userState}</label>
                        </styled.TableCellContent>
                    </styled.TableCell>
                </styled.TableRow>
                <styled.TableRow height='2vw'>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>아이템 슬롯수</styled.TableCell>
                    <styled.TableCell>
                        <styled.TableCellContent>
                        <label>{userBasicInfo.itemSlot}</label>
                        </styled.TableCellContent>
                    </styled.TableCell>
                    <styled.TableCell width='8vw' color='var(--primary-color)' bold>플랫폼 타입</styled.TableCell>
                    <styled.TableCell>
                        <styled.TableCellContent>
                        <label>{getPlatformType(userBasicInfo.platformType)}</label>
                        </styled.TableCellContent>
                    </styled.TableCell>
                </styled.TableRow>
            </styled.Table>
        </contentStyled.ContentBody>
    )
};

export default UserBasicInfoPanel;