import React, {useState,useCallback} from 'react';
import MediaQuery from 'react-responsive';
import {useNavigate} from 'react-router-dom';
import * as dayjs from 'dayjs';
import * as aclManager from '../../../common/js/aclManager';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './AccountManagePageStyles';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';
import Table from '../../../components/Table2';
import Popup from '../../../components/Popup';

import ReleaseNotePopup from '../ReleaseNotePopup';

import useCommon from '../../../store/useCommonStorageManager';
import useAuth from '../../../store/useAuthDataManager';
import useAccount from '../../../store/useAccountDataManager';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

const RECNUM_PERPAGE = 10;

const titleText = '계정 목록 조회';
const tableHeaderInfo = ['__checkbox','계정ID','닉네임','사용권한','계정 생성 시각','활성화'];
const tableContentInfo = [
    ['__checkbox','UID0239834','yspark','20,000','2022-12-11 12:34:28','활성'],
    ['__checkbox','UID0927381','megatomic','5,000','2022-10-9 12:34:28','비활성'],
    ['__checkbox','UID0923837','bale','170,000','2022-11-3 12:34:28','활성']
];

const tableHSpaceTable = '0.5fr 0.8fr 0.8fr 2fr 1.2fr 0.8fr';

const makeTableFromAccountList = (accountList) => {

    const result = accountList.map((accountInfo,idx) => {
        let aclInfo = accountInfo.aclInfo;
        if(accountInfo.aclInfo.length > 40) {
            aclInfo = aclInfo.substr(0,40)+"...";
        }
        if(accountInfo.activationFlag) {
            return {color:'var(--secondary-color)',bold:false,record:['__checkbox',accountInfo.accountID,accountInfo.accountNick,aclInfo,(dayjs(accountInfo.creationTime).format('YYYY-MM-DD HH:mm:ss')),(accountInfo.activationFlag?'활성':'비활성')]};
        } else {
            return {color:'var(--third-color)',bold:false,record:['__checkbox',accountInfo.accountID,accountInfo.accountNick,aclInfo,(dayjs(accountInfo.creationTime).format('YYYY-MM-DD HH:mm:ss')),(accountInfo.activationFlag?'활성':'비활성')]};
        }
    });

    return result;
};

const QueryAccountListPanel = (props) => {

    const navigate = useNavigate();

    const {startLoading, setStartLoading, globalPopupShown, setGlobalPopupShown} = useCommon();
    const {authInfo} = useAuth();
    const {accountInfo,totalPageNum, requestAccountList,requestDeleteAccount,requestAccountActivation} = useAccount();
    const [accountList, setAccountList] = useState([]);
    const [checkedAccountIDList, setCheckedAccountIDList] = useState([]);
    const [checkedFlagList, setCheckedFlagList] = useState([]);
    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [subMenuOpen,setSubMenuOpen] = useState(false);

    const [releaseNotePopup, setReleaseNotePopup] = useState(false);

    const filterDeviceList = [
        {id:1,name:'iOS'},
        {id:2,name:'Android'}
    ];

    const onPageNoClick = useCallback((event) => {
        return true;
    });

    const onGotoFirstPageClick = useCallback((event) => {
        return true;
    });

    const onGotoPrevPageClick = useCallback((event) => {
        return true;
    });

    const onGotoNextPageClick = useCallback((event) => {
        return true;
    });

    const onGotoLastPageClick = useCallback((event) => {
        return true;
    });

    // 활성화/비활성화 처리
    const onAccountActivationClick = async(event) => {

        if(checkedFlagList.length === 0) {
            toast.info('활성화/비활성화할 계정 항목을 선택해주세요.');
            return;
        }

        if(aclManager.checkAccessibleWithACL(authInfo.accountInfo.aclInfo,aclManager.ACL_POLICY_ACCOUNT_REGISTER) === false) {
            toast.error('계정을 활성화/비활성화할 권한이 없습니다.');
            return;
        }

        setStartLoading(true);
        const resultInfo = await requestAccountActivation(checkedAccountIDList,checkedFlagList);

        console.log(resultInfo);

        if(resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
        } else {
            toast.info('계정 활성화/비활성화가 완료되었습니다.');
        }

        await reloadAccountList();

        setStartLoading(false);

        setCheckedAccountIDList([]);
        setCheckedFlagList([]);
    };

    const onAccountEditClick = useCallback((event) => {

        if(checkedFlagList.length !== 1) {
            toast.info('수정할 계정 항목을 1개 선택해주세요.');
            return;
        }

        for(let accInfo of accountInfo.accountList) {
            if(accInfo.accountID === checkedAccountIDList[0]) {

                if(authInfo.loginID.trim() !== accInfo.accountID) {
                    if(aclManager.checkAccessibleWithACL(authInfo.accountInfo.aclInfo,aclManager.ACL_POLICY_ACCOUNT_REGISTER) === false) {
                        toast.error('계정정보를 수정할 권한이 없습니다.');
                        return;
                    }
                }
                props.onAccountEditModeChange(true,{parentTitle:titleText,accountInfo:accInfo});
                break;
            }
        }
    });

    const reloadAccountList = async () => {
        setStartLoading(true);
        setTimeout(async () => {
            const resultInfo = await requestAccountList(1);

            console.log('accountInfo=',resultInfo);
            if(resultInfo.resultCode === 0) {
                setAccountList(makeTableFromAccountList(resultInfo.data.list));
            } else {
                toast.error(resultInfo.message);
            }
            setStartLoading(false);
        },200);
    };

    const onAccountDeleteClick = useCallback(async (event) => {

        if(checkedFlagList.length === 0) {
            toast.info('삭제할 계정 항목을 선택해주세요.');
            return;
        }

        if(aclManager.checkAccessibleWithACL(authInfo.accountInfo.aclInfo,aclManager.ACL_POLICY_ACCOUNT_REGISTER) === false) {
            toast.error('계정정보를 삭제할 권한이 없습니다.');
            return;
        }

        setPopupContent('계정 삭제를 정말로 진행하시겠습니까?');
        setPopupShown(true);
    });
    
    const onTableCheckBoxChanged = useCallback((checkList) => {

        const idList=[];
        const flagList=[];
        for(let i=0;i<checkList.length;i++) {
            if(checkList[i] === true) {
                idList.push(accountInfo.accountList[i].accountID);
                flagList.push(!accountInfo.accountList[i].activationFlag);
            }
        }

        setCheckedAccountIDList(idList);
        setCheckedFlagList(flagList);
    });

    const onPopupButtonClick = async (buttonIdx) => {

        if(buttonIdx === 0) {
            setStartLoading(true);
            const resultInfo = await requestDeleteAccount(checkedAccountIDList);
            if(resultInfo.resultCode !== 0) {
                toast.error(resultInfo.message);
            } else {
                toast.info('계정 삭제가 완료되었습니다.');
            }
    
            await reloadAccountList();
    
            setStartLoading(false);

            setCheckedAccountIDList([]);
            setCheckedFlagList([]);
        }

        onPopupCloseButtonClick(null);
    };

    const onPopupCloseButtonClick = (e) => {
        setPopupShown(false);
    };

    const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
    };

    const onReleaseNotePopupCloseButtonClick = (e) => {
        setReleaseNotePopup(false);
        setGlobalPopupShown(true);
    };

    useEffect(() => {
        reloadAccountList();

        setTimeout(() => {
            if(globalPopupShown === false) {
                setReleaseNotePopup(true);
            }
        },500);
    },[]);

    useEffect(()=> {
        props.onSubMenuOpenClicked(subMenuOpen);
    },[subMenuOpen]);

    return (
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader>
                <MediaQuery maxWidth={768}>
                    &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
                </MediaQuery>
                <span id='subtitle'>{titleText}</span>
                <span>&nbsp;</span>
                <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' onClick={(e)=>onAccountActivationClick(e)}>활성화/비활성화</Button1></span>
                <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='6vw' height='2vw' onClick={(e)=>onAccountEditClick(e)}>보기/수정하기</Button1></span>
                <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='6vw' height='2vw' onClick={(e)=>onAccountDeleteClick(e)}>삭제하기</Button1></span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
                <Table responsive='1.6' colFormat={tableHSpaceTable}
                        headerInfo={tableHeaderInfo}
                        bodyInfo={accountList}
                        onPageNoClick={onPageNoClick}
                        onGotoFirstPageClick={onGotoFirstPageClick}
                        onGotoPrevPageClick={onGotoPrevPageClick}
                        onGotoNextPageClick={onGotoNextPageClick}
                        onGotoLastPageClick={onGotoLastPageClick}
                        noPageControl={false}
                        recordNumPerPage={RECNUM_PERPAGE}
                        totalRecordNum={accountInfo.totalCount}
                        onTableCheckBoxChanged={onTableCheckBoxChanged}
                        />
            </contentStyled.ContentBody>
            <Popup shown={popupShown} popupTypeInfo={{type:'YesNo',button1Text:'예',button2Text:'아니오'}} title='알림' content={popupContent} buttonClick={(buttonNo)=>onPopupButtonClick(buttonNo)} closeClick={onPopupCloseButtonClick} />
            <ReleaseNotePopup shown={releaseNotePopup} confirmClick={onReleaseNotePopupCloseButtonClick} />
        </contentStyled.ContentWrapper>
    )
};

export default QueryAccountListPanel;