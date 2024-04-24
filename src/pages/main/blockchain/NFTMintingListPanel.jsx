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

import NFTNewMintPanel from './NFTNewMintPanel';
import NFTMintingDetailInfoPanel from './NFTMintingDetailInfoPanel';
import NFTMintingInfoCopyPopup from './NFTMintingInfoCopyPopup';

const RECNUM_PERPAGE = 10;

const titleText = 'NFT 민팅 내역';
const tableHeaderInfo = ['__checkbox','회차','설명','수량','패키지 여부','민팅일시','그룹ID','진행상태'];
const tableHSpaceTable = '0.4fr 0.6fr 2.0fr 1.0fr 0.8fr 1.2fr 1.2fr 1.0fr';

// const tableContentInfo = [
//     ['1','프리세일 1차 민팅','840','민팅완료','2022-12-11 12:34:28','__button='+JSON.stringify({name:'상세보기',bgColor:'var(--btn-primary-color)',width:'5vw',height:'1.6vw',tag:'button.row1'})],
//     ['2','프리세일 2차 민팅','1860','민팅완료','2022-12-11 12:34:28','__button='+JSON.stringify({name:'상세보기',bgColor:'var(--btn-primary-color)',width:'5vw',height:'1.6vw',tag:'button.row2'})],
//     ['3','프리세일 3차 민팅','1860','민팅중','2022-12-11 12:34:28','__button='+JSON.stringify({name:'상세보기',bgColor:'var(--btn-primary-color)',width:'5vw',height:'1.6vw',tag:'button.row3'})]
// ];


const makeTableFromLogList = (logList) => {

    let count = 0;
    const result = logList.map((logInfo, idx) => {  
      const activityDesc = logInfo.desc.substr(0,70)+"...";
  
      let detailInfo = `__button={"name":"완료","bgColor":"var(--btn-primary-color)","width":"5vw","height":"1.6vw","tag":"${count}"}`;
      if(logInfo.state === 1) {
        detailInfo = "단계1";

      } else if(logInfo.state === 2) {
        detailInfo = "단계2";
      }
      
      count++;
      return ['__checkbox', logInfo.activityCount.toString(), logInfo.desc, logInfo.quantity.toString(), (logInfo.packageType===0?"일반":"패키지"), dayjs(logInfo.creationTime).format('YYYY-MM-DD HH:mm:ss'), logInfo.reqGroupID.toString(), detailInfo];
    });
  
    return result;
};

const NFTMintingListPanel = (props) => {

    const {startLoading, setStartLoading, serverType} = useCommon();
    const [serverTypeIndex, setServerTypeIndex] = useState(0);
    const {accountInfo, requestChangeMasterPW} = useAccount();
    const {nftInfo, totalPageNum, requestQueryMintingLogList, requestCheckMintingInfo, requestCopyMintingInfoToServer, requestDeleteMintingLogAndData} = useNFT();

    const [checkedLogInfoList, setCheckedLogInfoList] = useState([]);

    const [groupIDTable, setGroupIDTable] = useState([]);
    const [selectedActLogInfo,setSelectedActLogInfo] = useState(null);
    const [newMinting, setNewMinting] = useState(false);
    const [detailInfo, setDetailInfo] = useState(false);
    const [mintingLogList, setMintingLogList] = useState([]);
    const [curMintingLogInfo,setCurMintingLogInfo] = useState(null);
    const [logListTotalCount, setLogListTotalCount] = useState(0);
    const [mintingLogTableList, setMintingLogTableList] = useState([]);
    const [curPageNo, setCurPageNo] = useState(1);

    const [targetServerType, setTargetServerType] = useState('');
    const [mintInfoCopyPopupShown,setMintInfoCopyPopupShown] = useState(false);
    const [popupType, setPopupType] = useState('');
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

    const onNewMintingButtonClick = (e) => {

        if (checkedLogInfoList.length > 1) {
            toast.info('민팅정보를 가져올 항목을 1개만 선택해주세요.');
            return;
        }

        //console.log('checkedLogInfoList[0]=',checkedLogInfoList[0]);

        setSelectedActLogInfo(null);
        setNewMinting(true);
    };

    const onMintingContinueButtonClick = (e) => {

      if (checkedLogInfoList.length !== 1) {
        toast.info('이어서 처리할 항목을 1개만 선택해주세요.');
        return;
      }

      //console.log('checkedLogInfoList[0]=',checkedLogInfoList[0]);

      if(checkedLogInfoList[0].state === 0) {
        toast.info('민팅완료된 항목은 이어서 처리할 수 없습니다.');
        return;
      }

      setSelectedActLogInfo(checkedLogInfoList[0]);
      setNewMinting(true);
    };

    const onDeleteButtonClick = (e) => {
      if (checkedLogInfoList.length !== 1) {
        toast.info('삭제할 항목을 1개만 선택해주세요.');
        return;
      }

      //console.log('checkedLogInfoList[0]=',checkedLogInfoList[0]);

      if(checkedLogInfoList[0].state === 0) {
        toast.info('민팅완료된 항목은 삭제할 수 없습니다.');
        return;
      }

      setPopupType("popup.delete-item");
      setPopupContent("해당 항목을 정말 삭제하시겠습니까?");
      setPopupShown(true);
    };

    const onCopyMintingInfoButtonClick = (e) => {

      if (checkedLogInfoList.length !== 1) {
        toast.info('복사할 항목을 1개만 선택해주세요.');
        return;
      }

      if(checkedLogInfoList[0].state !== 0) {
        toast.info('민팅이 완료된 경우만 타 서버로 복사할 수 있습니다.');
        return;
      }

      setMintInfoCopyPopupShown(true);
    };

    const onCheckMintingButtonClick = async (e) => {

      if (checkedLogInfoList.length > 1) {
        toast.info('체크할 민팅정보 항목을 1개만 선택해주세요.');
        return;
      }

      setStartLoading(true);  
        
      const resultInfo = await requestCheckMintingInfo({ groupID:checkedLogInfoList[0].reqGroupID, mintingCount:checkedLogInfoList[0].mintingCount, quantity:checkedLogInfoList[0].quantity });
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
          toast.info("컨트랙트 토큰ID와 S3서버에 올바로 민팅되었습니다.");
        }
      }

      setStartLoading(false);
    };

    const onUpdateStateButtonClick = (e) => {

    };

    const onDetailInfoButtonClick = (e,tag) => {

        console.log('tag=',tag);

        setDetailInfo(true);
        setCurMintingLogInfo(mintingLogList[tag]);
    };

    const onPopupButtonClick = async (buttonIdx) => {

        if(buttonIdx === 0) {
          if(popupType === 'popup.delete-item') {
            setStartLoading(true);

            const resultInfo = await requestDeleteMintingLogAndData(checkedLogInfoList[0].logID);
            if(resultInfo.resultCode !== 0) {
                toast.error(resultInfo.message);
            } else {
                toast.info('민팅중인 항목에 대한 삭제가 완료되었습니다.');
            }
    
            await reloadNFTActLogList();
    
            setStartLoading(false);

          } else if(popupType === 'popup.copy-item') {
            setStartLoading(true);

            const resultInfo = await requestCopyMintingInfoToServer(checkedLogInfoList[0].logID,checkedLogInfoList[0].reqGroupID,targetServerType);
            if(resultInfo.resultCode !== 0) {
                toast.error(resultInfo.message);
            } else {
                toast.info(`선택된 민팅정보가 ${targetServerType} 서버로 복사되었습니다.`);
            }
    
            await reloadNFTActLogList();
    
            setStartLoading(false);
          }
        }

        onPopupCloseButtonClick(null);
    };

    const onNotiEditModeChange = (start, data) => {
        if (start === true) {
        //   setEditInfo(data);
        //   setNotiEditMode(start);
        } else {
            setNewMinting(false);
            setDetailInfo(false);

            reloadNFTActLogList();
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
            dataList.push({logID:mintingLogList[i].logID, state:mintingLogList[i].state, desc:mintingLogList[i].desc, data:mintingLogList[i].data, reqGroupID:mintingLogList[i].reqGroupID, mintingCount:mintingLogList[i].activityCount, quantity:mintingLogList[i].quantity, packageType:mintingLogList[i].packageType, packageData:mintingLogList[i].packageData, tokenGenInfo:JSON.parse(mintingLogList[i].data)});
          }
        }
    
        setCheckedLogInfoList(dataList);
    });

    const onCopyMintingInfoPopupButtonClick = (e,resultInfo) => {

      console.log('resultInfo=',resultInfo);
      setMintInfoCopyPopupShown(false);
      
      if(resultInfo === null) {
        return;
      }

      setTargetServerType(resultInfo.serverType);

      setPopupType("popup.copy-item");
      setPopupContent(`${resultInfo.serverType} 서버로 민팅정보를 복사하시겠습니까?`);
      setPopupShown(true);
    };

    const onPopupCloseButtonClick = (e) => {
        setPopupShown(false);
    };

    const reloadNFTActLogList = async () => {
        setStartLoading(true);
        setTimeout(async () => {
    
          console.log('#### curPageNo=',curPageNo);
    
          const resultInfo = await requestQueryMintingLogList({ activityType:constants.NFT_ACTIVITYTYPE_MINTING, pageNo: curPageNo });
    
          console.log('logList=',resultInfo);
          if (resultInfo.resultCode === 0) {
            setMintingLogList(resultInfo.data.list);
            setMintingLogTableList(makeTableFromLogList(resultInfo.data.list));
            setLogListTotalCount(resultInfo.data.totalCount);

            const reqGroupList = [{id:1,name:"새그룹 ID"}];
            let count = 2;
            for(let i=1;i<=resultInfo.data.list.length;i++) {
              let found = false;
              for(let reqGroup of reqGroupList) {
                  if(reqGroup.name === parseInt(resultInfo.data.list[i-1].reqGroupID)) {
                      found = true;
                      break;
                  }
              }

              if(found === false) {
                  reqGroupList.push({id:count,name:parseInt(resultInfo.data.list[i-1].reqGroupID)});
                  count++;
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
        reloadNFTActLogList();
    }, [curPageNo]);

    useEffect(() => {
      if(serverType.toUpperCase() === 'QA') {
        setServerTypeIndex(1);
      } else if(serverType.toUpperCase() === 'REVIEW') {
        setServerTypeIndex(2);
      } else if(serverType.toUpperCase() === 'LIVE') {
        setServerTypeIndex(3);
      } else {
        setServerTypeIndex(0);
      }
    },[]);

    return (
        <>
        {
            newMinting===true?(
                <NFTNewMintPanel actLogInfo={selectedActLogInfo} groupIDTable={groupIDTable} mintingLogInfo={checkedLogInfoList.length===0?null:checkedLogInfoList[0]} newMintingCount={selectedActLogInfo!==null?selectedActLogInfo.mintingCount:logListTotalCount+1} onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)} onNotiEditModeChange={(flag, data) => onNotiEditModeChange(flag, data)}/>
            ):(
              <>
              {
                detailInfo===true?(
                  <NFTMintingDetailInfoPanel mintingLogInfo={curMintingLogInfo} onNotiEditModeChange={(flag, data) => onNotiEditModeChange(flag, data)} />
                ):(
                  <div>
                    <contentStyled.ContentWrapper>
                    <contentStyled.ContentHeader subtitleWidth='20vw'>
                    <MediaQuery maxWidth={768}>
                    &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
                    </MediaQuery>
                        <span id='subtitle'>{titleText}</span>
                        <span>&nbsp;</span>
                        <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='6vw' height='2vw' onClick={(e)=>onNewMintingButtonClick(e)}>새 민팅하기</Button1></span>
                        <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='6vw' height='2vw' onClick={(e)=>onMintingContinueButtonClick(e)}>민팅 이어하기</Button1></span>
                        <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='5vw' height='2vw' onClick={(e)=>onDeleteButtonClick(e)}>삭제하기</Button1></span>
                        <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='5vw' height='2vw' onClick={(e)=>onCopyMintingInfoButtonClick(e)}>복사하기</Button1></span>
                        <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-primary-color)' width='6vw' height='2vw' onClick={(e)=>onCheckMintingButtonClick(e)}>민팅 검증하기</Button1></span>
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
                    <NFTMintingInfoCopyPopup shown={mintInfoCopyPopupShown} paramInfo={{serverTypeIndex:serverTypeIndex, logID:(checkedLogInfoList.length > 0?checkedLogInfoList[0].logID:-1),groupID:(checkedLogInfoList.length > 0?checkedLogInfoList[0].reqGroupID:-1)}} onButtonClick={onCopyMintingInfoPopupButtonClick} />
                    <Popup shown={popupShown} popupTypeInfo={{type:'YesNo',button1Text:'예',button2Text:'아니오'}} title='알림' content={popupContent} buttonClick={(buttonNo)=>onPopupButtonClick(buttonNo)} closeClick={onPopupCloseButtonClick} />
                </contentStyled.ContentWrapper>
                  </div>
                )
              }
              </>
            )
        }
        </>
    )
};

export default NFTMintingListPanel;