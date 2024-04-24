import React, {useState,useEffect,useCallback} from 'react';
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import dayjs from 'dayjs';
import * as utils from '../../../common/js/utils';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import CheckBox from '../../../components/CheckBox';
import Table from '../../../components/Table';
import Popup from '../../../components/Popup';

import * as constants from '../../../common/constants';
import useCommon from '../../../store/useCommonStorageManager';
import useAccount from '../../../store/useAccountDataManager';
import useNFT from '../../../store/useNFTDataManager';
import { toast } from 'react-toastify';

import NFTNewTransferPanel from './NFTNewTransferPanel';

const RECNUM_PERPAGE = 10;

const titleText = 'NFT 전송 내역';
const tableHeaderInfo = ['__checkbox','전송일시','태그','소스주소','타겟주소','수량','상세보기'];
const tableHSpaceTable = '0.4fr 1.2fr 1.5fr 1.8fr 1.8fr 0.8fr 1.0fr';

// const tableContentInfo = [
//     ['1','프리세일 1차 민팅','840','민팅완료','2022-12-11 12:34:28','__button='+JSON.stringify({name:'상세보기',bgColor:'var(--btn-primary-color)',width:'5vw',height:'1.6vw',tag:'button.row1'})],
//     ['2','프리세일 2차 민팅','1860','민팅완료','2022-12-11 12:34:28','__button='+JSON.stringify({name:'상세보기',bgColor:'var(--btn-primary-color)',width:'5vw',height:'1.6vw',tag:'button.row2'})],
//     ['3','프리세일 3차 민팅','1860','민팅중','2022-12-11 12:34:28','__button='+JSON.stringify({name:'상세보기',bgColor:'var(--btn-primary-color)',width:'5vw',height:'1.6vw',tag:'button.row3'})]
// ];


const makeTableFromLogList = (logList) => {

    const result = logList.map((logInfo, idx) => {  
      const comment = (logInfo.comment.length > 10?logInfo.comment.substr(0,12)+"...":logInfo.comment);
      const srcAddress = logInfo.sourceAddress.substr(0,25)+"...";
      const tgtAddress = logInfo.targetAddress.substr(0,25)+"...";
  
      const detailInfo = `__button={"name":"상세보기","bgColor":"var(--btn-primary-color)","width":"5vw","height":"1.6vw","tag":"${logInfo.comment}"}`;
      return ['__checkbox', dayjs(logInfo.creationTime).format('YYYY-MM-DD HH:mm:ss'), comment, srcAddress, tgtAddress, logInfo.quantity.toString(), detailInfo];
    });
  
    return result;
};

const NFTTransferListPanel = (props) => {

    const {startLoading, setStartLoading} = useCommon();
    const {accountInfo, requestChangeMasterPW} = useAccount();
    const {nftInfo, totalPageNum, requestQueryTransferLogList,requestCheckTransferInfo} = useNFT();
    const [contractAddress, setContractAddress] = useState('');
    const [checkedLogInfoList, setCheckedLogInfoList] = useState([]);

    const [groupIDTable, setGroupIDTable] = useState([]);
    const [newTransfer, setNewTransfer] = useState(false);
    const [transferLogList, setTransferLogList] = useState([]);
    const [logListTotalCount, setLogListTotalCount] = useState(0);
    const [mintingLogTableList, setMintingLogTableList] = useState([]);
    const [curPageNo, setCurPageNo] = useState(1);
    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [subMenuOpen,setSubMenuOpen] = useState(false);

    const onPageNoClick = useCallback((event,pageNo) => {
        setCurPageNo(pageNo);
        return true;
      });
    
      const onGotoFirstPageClick = useCallback((event) => {
        setCurPageNo(1);
        return true;
      });
    
      const onGotoPrevPageClick = useCallback((event) => {
        if(curPageNo > 1) {
          setCurPageNo(curPageNo-1);
        }
        return true;
      });
    
      const onGotoNextPageClick = useCallback((event) => {
        if(curPageNo < totalPageNum(RECNUM_PERPAGE)) {
          setCurPageNo(curPageNo+1);
        }
        return true;
      });
    
      const onGotoLastPageClick = useCallback((event) => {
        setCurPageNo(totalPageNum(RECNUM_PERPAGE));
        return true;
      });

    const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
    };

    const onNewTransferButtonClick = (e) => {

        if (checkedLogInfoList.length > 1) {
            toast.info('전송정보를 가져올 항목을 1개만 선택해주세요.');
            return;
        }

        //console.log('checkedLogInfoList[0]=',checkedLogInfoList[0]);

        setNewTransfer(true);
    };

    const onCheckTransferButtonClick = async (e) => {

      if (checkedLogInfoList.length !== 1) {
        toast.info('검증할 전송정보 항목을 1개만 선택해주세요.');
        return;
      }

      setStartLoading(true);  
        
      console.log('checkedLogInfoList[0]=',JSON.stringify(checkedLogInfoList[0],null,2));

      const resultInfo = await requestCheckTransferInfo({ groupID:checkedLogInfoList[0].groupID, quantity:checkedLogInfoList[0].quantity });
      if(resultInfo.resultCode !== 0) {
        toast.error(resultInfo.message);
      } else {
        if(resultInfo.data.code !== 0) {
            // NFTCHECK_QUANITTY_NOTMISMATCHED: 1140,
            // NFTCHECK_NFT_INTEGRITY_ALREADYTRANSFERED: 1141,
            // NFTCHECK_NFT_INTEGRITY_TOKENIDNOTFOUND: 1142,
            // NFTCHECK_METADATA_INTEGRITY_ACCESSFAILED: 1143
            if(resultInfo.data.code === constants.ResultCode.NFTCHECK_METADATA_INTEGRITY_ACCESSFAILED) {
              toast.error(resultInfo.data.message+"(failedTokenIDs:"+JSON.stringify(resultInfo.data.data)+")",{autoClose:7000});
            } else {
              toast.error(resultInfo.data.message+"("+JSON.stringify(resultInfo.data.data)+")",{autoClose:7000});
            }
        } else {
          toast.info("컨트랙트 토큰ID가 올바로 전송되었음을 검증하였습니다.");
        }
      }

      setStartLoading(false);
    };

    const onDetailInfoButtonClick = (e,tag) => {

        console.log('tag=',tag);
    };

    const onPopupButtonClick = async (buttonIdx) => {

        // if(buttonIdx === 0) {
        //     setStartLoading(true);
        //     const resultInfo = await requestDeleteAccount(checkedAccountIDList);
        //     if(resultInfo.resultCode !== 0) {
        //         toast.error(resultInfo.message);
        //     } else {
        //         toast.info('계정 삭제가 완료되었습니다.');
        //     }
    
        //     await reloadAccountList();
    
        //     setStartLoading(false);

        //     setCheckedAccountIDList([]);
        //     setCheckedFlagList([]);
        // }

        onPopupCloseButtonClick(null);
    };

    const onNotiEditModeChange = (start, data) => {
        if (start === true) {
        //   setEditInfo(data);
        //   setNotiEditMode(start);
        } else {
            setNewTransfer(false);

            reloadNFTTransferLogList();
        }
      };

    const onSubMenuOpenClick = (flag) => {

    };

    const onTableItemButtonClick = (e,tag) => {

        console.log('tag='+tag);
    };

    const onTableCheckBoxChanged = useCallback((checkList) => {
        const dataList = [];
        const flagList = [];
        for (let i = 0; i < checkList.length; i++) {
          if (checkList[i] === true) {
            dataList.push({groupID:transferLogList[i].groupID,quantity:transferLogList[i].quantity,sourceAddress:transferLogList[i].sourceAddress,targetAddress:transferLogList[i].targetAddress,comment:transferLogList[i].comment});
          }
        }
    
        setCheckedLogInfoList(dataList);
    });

    const onPopupCloseButtonClick = (e) => {
        setPopupShown(false);
    };

    const reloadNFTTransferLogList = async () => {
        setStartLoading(true);
        setTimeout(async () => {
    
          console.log('#### curPageNo=',curPageNo);
    
          const resultInfo = await requestQueryTransferLogList({ pageNo: curPageNo });
    
          console.log('logList=',resultInfo);
          if (resultInfo.resultCode === 0) {
            setContractAddress(resultInfo.data.contractAddress);
            setTransferLogList(resultInfo.data.list);
            setMintingLogTableList(makeTableFromLogList(resultInfo.data.list));
            setLogListTotalCount(resultInfo.data.totalCount);

            const reqGroupList = [{id:1,name:"새그룹 ID"}];
            for(let i=1;i<=resultInfo.data.list.length;i++) {
              let found = false;
              for(let reqGroup of reqGroupList) {
                  if(reqGroup.name === parseInt(resultInfo.data.list[i-1].reqGroupID)) {
                      found = true;
                      break;
                  }
              }

              if(found === false) {
                  reqGroupList.push({id:i,name:parseInt(resultInfo.data.list[i-1].reqGroupID)});
              }
            }

            setGroupIDTable(reqGroupList);

          } else {
            toast.error(resultInfo.message);
          }
          setStartLoading(false);

          setCheckedLogInfoList([]);

        }, 200);
    };

    useEffect(()=> {
        props.onSubMenuOpenClicked(subMenuOpen);
    },[subMenuOpen]);

    useEffect(() => {
        reloadNFTTransferLogList();
    }, [curPageNo]);

    return (
        <>
        {
            newTransfer===true?(
                <NFTNewTransferPanel transferInfo={checkedLogInfoList.length>0?checkedLogInfoList[0]:undefined} contractAddress={contractAddress} groupIDTable={groupIDTable} mintingLogInfo={checkedLogInfoList.length===0?null:checkedLogInfoList[0]} newTransferCount={logListTotalCount+1} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)} onNotiEditModeChange={(flag, data) => onNotiEditModeChange(flag, data)}/>
            ):(
                <contentStyled.ContentWrapper>
                <contentStyled.ContentHeader>
                <MediaQuery maxWidth={768}>
                &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
            </MediaQuery>
                    <span id='subtitle'>{titleText}</span>
                    <span>&nbsp;</span>
                    <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='6vw' height='2vw' onClick={(e)=>onNewTransferButtonClick(e)}>새 전송하기</Button1></span>
                    <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='8vw' height='2vw' onClick={(e)=>onCheckTransferButtonClick(e)}>전송 검증하기</Button1></span>
                </contentStyled.ContentHeader>
                <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
                <br />

                <contentStyled.ContentBody>
                    <Table responsive='1.6' marginLeft='3vw' marginRight='3vw'
                        colFormat={tableHSpaceTable}
                        headerInfo={tableHeaderInfo}
                        bodyInfo={mintingLogTableList}
                        onPageNoClick={onPageNoClick}
                        onGotoFirstPageClick={onGotoFirstPageClick}
                        onGotoPrevPageClick={onGotoPrevPageClick}
                        onGotoNextPageClick={onGotoNextPageClick}
                        onGotoLastPageClick={onGotoLastPageClick}
                        noPageControl={false}
                        recordNumPerPage={RECNUM_PERPAGE}
                        onTableCheckBoxChanged={onTableCheckBoxChanged}
                        totalRecordNum={nftInfo.totalCount}
                        onButtonClick={(e,tag)=>onDetailInfoButtonClick(e,tag)}
                    />
                </contentStyled.ContentBody>
                <Popup shown={popupShown} popupTypeInfo={{type:'YesNo',button1Text:'예',button2Text:'아니오'}} title='알림' content={popupContent} buttonClick={(buttonNo)=>onPopupButtonClick(buttonNo)} closeClick={onPopupCloseButtonClick} />
            </contentStyled.ContentWrapper>
            )
        }
        </>
    )
};

export default NFTTransferListPanel;