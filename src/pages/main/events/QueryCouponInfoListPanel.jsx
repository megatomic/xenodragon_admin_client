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
import useRewardEvent from '../../../store/useRewardEventDataManager';
import { toast } from 'react-toastify';

import {getLangTypeFromCode,getTitle,getContent} from '../notifications/NotificationManageContainer';
import RegisterNewCouponInfoPanel from './RegisterNewCouponInfoPanel';
import CouponDetailInfoPanel from './CouponDetailInfoPanel';

const RECNUM_PERPAGE = 10;

const titleText = '쿠폰 발급목록 조회';
const tableHeaderInfo = ['__checkbox','쿠폰ID','쿠폰타입','수량','설명','유효기간','상세정보'];
const tableHSpaceTable = '0.4fr 0.6fr 0.8fr 0.8fr 1.5fr 2.0fr 1.0fr';

// const tableContentInfo = [
//     ['__checkbox','1','개별코드','840','이벤트 쿠폰1','2022-12-11 12:34 ~ 2023-12-11 11:11','활성화'],
//     ['__checkbox','2','제한코드','1860','이벤트 쿠폰2','2022-12-11 12:34 ~ 2023-12-11 11:11','활성화'],
//     ['__checkbox','3','공용코드','1860','이벤트 쿠폰3','2022-12-11 12:34 ~ 2023-12-11 11:11','활성화']
// ];


const makeTableFromCouponList = (couponList) => {

    const result = couponList.map((couponInfo, idx) => {  
      //const activityDesc = couponInfo.desc.substr(0,70)+"...";

      let couponTypeStr = "개별코드";
      if(couponInfo.couponType === 1) {
        couponTypeStr = "공용코드";
      } else if(couponInfo.couponType === 2) {
        couponTypeStr = "제한코드";
      }

      let title = getTitle(couponInfo.titleTable,getLangTypeFromCode(23));
      if(title.trim() === '') {
        title = getTitle(couponInfo.titleTable,getLangTypeFromCode(10));
      }
  
      let content = getContent(couponInfo.contentTable,getLangTypeFromCode(23));
      if(content.trim() === '') {
        content = getContent(couponInfo.contentTable,getLangTypeFromCode(10));
      }

      const detailInfo = `__button={"name":"상세보기","bgColor":"var(--btn-primary-color)","width":"5vw","height":"1.6vw","tag":"${idx}"}`;
      return ['__checkbox', couponInfo.couponID.toString(), couponTypeStr, couponInfo.couponQty.toString(), `[${title}]${content}`, dayjs(couponInfo.startTime).format('YYYY-MM-DD HH:mm')+"~"+dayjs(couponInfo.endTime).format('YYYY-MM-DD HH:mm'), detailInfo];
    });
  
    return result;
};

const QueryCouponInfoListPanel = (props) => {

    const {startLoading, setStartLoading} = useCommon();
    const {accountInfo, requestChangeMasterPW} = useAccount();
    const {eventInfo,requestCouponList,totalPageNum } = useRewardEvent();

    const [detailInfo, setDetailInfo] = useState(false);
    const [curCouponInfo, setCurCouponInfo] = useState(null);
    const [couponInfoList, setCouponInfoList] = useState([]);
    const [couponInfoViewList, setCouponInfoViewList] = useState([]);
    const [checkedCouponInfoList,setCheckedCouponInfoList] = useState([]);
    const [newCoupon, setNewCoupon] = useState(false);
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

    const onNewCouponButtonClick = (e) => {

        // if (checkedLogInfoList.length > 1) {
        //     toast.info('민팅정보를 가져올 항목을 1개만 선택해주세요.');
        //     return;
        // }

        //console.log('checkedLogInfoList[0]=',checkedLogInfoList[0]);

        setNewCoupon(true);
    };

    const onUpdateStateButtonClick = (e) => {

    };

    const onDetailInfoButtonClick = (e,tag) => {

        console.log('tag=',tag);

        setDetailInfo(true);
        setCurCouponInfo(couponInfoList[tag]);
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

    const onEventEditModeChange = (start, data) => {
        if (start === true) {
        //   setEditInfo(data);
        //   setNotiEditMode(start);
        } else {
            setNewCoupon(false);

            reloadCouponInfoList();
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
            //dataList.push({reqGroupID:mintingLogList[i].reqGroupID,tokenGenInfo:JSON.parse(mintingLogList[i].data)});
          }
        }
    
        setCheckedCouponInfoList(dataList);
    });

    const onPopupCloseButtonClick = (e) => {
        setPopupShown(false);
    };

    const reloadCouponInfoList = async () => {
        setStartLoading(true);
        setTimeout(async () => {
    
          console.log('#### curPageNo=',curPageNo);
    
          const resultInfo = await requestCouponList({ pageNo: curPageNo });
    
          console.log('resultList=',resultInfo);
          if (resultInfo.resultCode === 0) {
            setCouponInfoList(resultInfo.data.list);
            setCouponInfoViewList(makeTableFromCouponList(resultInfo.data.list));

          } else {
            toast.error(resultInfo.message);
          }
          setStartLoading(false);

        }, 200);
    };

    const onNotiEditModeChange = (start, data) => {
      if (start === true) {
      //   setEditInfo(data);
      //   setNotiEditMode(start);
      } else {
          setNewCoupon(false);
          setDetailInfo(false);

          reloadCouponInfoList();
      }
    };

    useEffect(()=> {
        props.onSubMenuOpenClicked(subMenuOpen);
    },[subMenuOpen]);

    useEffect(() => {
      reloadCouponInfoList();
    }, [curPageNo]);

    return (
        <>
        {
            newCoupon===true?(
                <RegisterNewCouponInfoPanel onSubMenuOpenClicked={(flag)=>onSubMenuOpenClick(flag)} onEventEditModeChange={(flag, data) => onEventEditModeChange(flag, data)}/>
            ):(
              <>
              {
                detailInfo===true?(
                  <CouponDetailInfoPanel couponInfo={curCouponInfo} onNotiEditModeChange={(flag, data) => onNotiEditModeChange(flag, data)} />
                ):(
                  <div>
                <contentStyled.ContentWrapper>
                <contentStyled.ContentHeader>
                <MediaQuery maxWidth={768}>
                &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
            </MediaQuery>
                    <span id='subtitle'>{titleText}</span>
                    <span>&nbsp;</span>
                    <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='10vw' height='2vw' onClick={(e)=>onNewCouponButtonClick(e)}>새 쿠폰 발급하기</Button1></span>
                </contentStyled.ContentHeader>
                <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
                <br />

                <contentStyled.ContentBody>
                    <Table responsive='1.6' marginLeft='3vw' marginRight='3vw'
                        colFormat={tableHSpaceTable}
                        headerInfo={tableHeaderInfo}
                        bodyInfo={couponInfoViewList}
                        onPageNoClick={onPageNoClick}
                        onGotoFirstPageClick={onGotoFirstPageClick}
                        onGotoPrevPageClick={onGotoPrevPageClick}
                        onGotoNextPageClick={onGotoNextPageClick}
                        onGotoLastPageClick={onGotoLastPageClick}
                        noPageControl={false}
                        recordNumPerPage={RECNUM_PERPAGE}
                        onTableCheckBoxChanged={onTableCheckBoxChanged}
                        totalRecordNum={eventInfo.totalCount}
                        onButtonClick={(e,tag)=>onDetailInfoButtonClick(e,tag)}
                    />
                </contentStyled.ContentBody>
                <Popup shown={popupShown} popupTypeInfo={{type:'YesNo',button1Text:'예',button2Text:'아니오'}} title='알림' content={popupContent} buttonClick={(buttonNo)=>onPopupButtonClick(buttonNo)} closeClick={onPopupCloseButtonClick} />
            </contentStyled.ContentWrapper>
            </div>
                )}
                </>
            )
        }
        </>
    )
};

export default QueryCouponInfoListPanel;