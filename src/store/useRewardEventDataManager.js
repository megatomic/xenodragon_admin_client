import useSWR, { useSWRConfig } from 'swr';
import useAuth from './useAuthDataManager';
import axios from 'axios';
import * as constants from '../common/constants';
import settings from '../common/settings';
import useCommon from './useCommonStorageManager';
import * as Utils from '../common/Utils';

export const RewardEventStoreKey = 'local:/rewardevent';
export const RewardEventInitData = { __count: 0, totalCount:0, eventList: null, pageNo: 1, resultInfo: null };

const useRewardEvent = () => {
  const { authInfo,setAuthInfo } = useAuth();
  const { data: eventInfo, mutate: localMutate } = useSWR(RewardEventStoreKey);
  const { mutate: remoteMutate } = useSWRConfig();

  const {serverType} = useCommon();

  const setEventInfo = (value) => {
    const newEventInfo = { ...value };
    newEventInfo.__count++;
    localMutate(newEventInfo, { revalidate: false });
  };

  const totalPageNum = (recNumPerPage) => {
    return (eventInfo.totalCount <= 0 ? 1: Math.floor(1+(eventInfo.totalCount/recNumPerPage)));
  };

  return {
    eventInfo,
    setEventInfo,
    totalPageNum,
    requestRewardEventList: async ({ queryFilterInfo, eventType, pageNo }) => {
      const queryFilterInfo2 = { ...queryFilterInfo, titleKeyword: encodeURIComponent(queryFilterInfo.titleKeyword) };

      const adminServerURL = `${settings.AdminServerHostURL}/event/list`;
      console.log(`[GET] requestRewardEventList() adminServerURL:${adminServerURL}`);

      const result = await remoteMutate(
        RewardEventStoreKey,
        async (curData) => {
          try {
            const res = await axios.get(adminServerURL, {
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType, queryFilterInfo: JSON.stringify(queryFilterInfo2), eventType, pageNo },
            });
  
            const resultInfo = res.data;
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              if(resultInfo !== null && resultInfo !== undefined) {
                console.log("[EVENT] resultInfo.resultCode=",resultInfo.resultCode);
              }
              return { ...curData, totalCount:0, pageNo: pageNo, eventList: [],resultInfo:resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
  
              return { ...curData, totalCount:resultInfo.data.totalCount, eventList: resultInfo.data.list, pageNo: pageNo, resultInfo: resultInfo };
            }
          } catch(err) {
              if(err.response.status !== 200) {
                  console.log('err=',err);
              }

              return { ...curData, resultInfo:{resultCode:constants.ResultCode.SERVER_INTERNAL_ERROR,message:`서버 내부 오류가 발생하였습니다.(오류코드:${err.response.status})`,data:null} };
          }
        },
        { revalidate: false }
      );

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: {totalCount:result.totalCount,list:result.eventList} };
    },

    requestNewRewardEvent: async (eventInfo) => {
      //const encodedNotiInfo = { ...eventInfo, titleTable: Utils.encodeBase64(JSON.stringify(eventInfo.titleTable)), contentTable: Utils.encodeBase64(JSON.stringify(eventInfo.contentTable)), data: Utils.encodeBase64(JSON.stringify(eventInfo.data)) };

      //console.log({ headers: { ...encodedNotiInfo, adminID: authInfo.loginID, authToken: authInfo.authToken } });

      const result = await remoteMutate(
        RewardEventStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/event/new`,eventInfo, { headers: {adminID: authInfo.loginID, authToken: authInfo.authToken,serverType } });
            const resultInfo = res.data;
  
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              return { ...curData, pageNo: eventInfo.pageNo, eventList: [], resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
  
              return { ...curData, pageNo: eventInfo.pageNo, eventList: resultInfo.data, resultInfo: resultInfo };
            }
          } catch(err) {
              if(err.response.status !== 200) {
                  console.log('err=',err);
              }

              return { ...curData, resultInfo:{resultCode:constants.ResultCode.SERVER_INTERNAL_ERROR,message:`서버 내부 오류가 발생하였습니다.(오류코드:${err.response.status})`,data:null} };
          }
        },
        { revalidate: false }
      );

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data: result.eventList };
    },

    requestModifyRewardEvent: async (eventInfo) => {
      //const encodedNotiInfo = { ...eventInfo, titleTable: Utils.encodeBase64(JSON.stringify(eventInfo.titleTable)), contentTable: Utils.encodeBase64(JSON.stringify(eventInfo.contentTable)), data: Utils.encodeBase64(JSON.stringify(eventInfo.data)) };

      //console.log('notiInfo=', encodedNotiInfo);

      const result = await remoteMutate(
        RewardEventStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/event/update`,eventInfo, { headers: {adminID: authInfo.loginID, authToken: authInfo.authToken,serverType } });
            const resultInfo = res.data;
  
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              return { ...curData, pageNo: eventInfo.pageNo, eventList: [], resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
  
              return { ...curData, pageNo: eventInfo.pageNo, eventList: resultInfo.data, resultInfo: resultInfo };
            }
          } catch(err) {
              if(err.response.status !== 200) {
                  console.log('err=',err);
              }

              return { ...curData, resultInfo:{resultCode:constants.ResultCode.SERVER_INTERNAL_ERROR,message:`서버 내부 오류가 발생하였습니다.(오류코드:${err.response.status})`,data:null} };
          }
        },
        { revalidate: false }
      );

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data: result.eventList };
    },

    requestDeleteRewardEvents: async (eventIDList) => {
      //console.log({ targetAdminIDList:JSON.stringify(accountIDList), adminID:authInfo.loginID, authToken:authInfo.authToken });

      const result = await remoteMutate(
        RewardEventStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/event/delete`,eventIDList, { headers: {adminID: authInfo.loginID, authToken: authInfo.authToken,serverType } });
            const resultInfo = res.data;
                
            if(resultInfo !== null && resultInfo !== undefined && resultInfo.resultCode === 0) {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
            }
            return { ...curData, resultInfo:resultInfo };
          } catch(err) {
              if(err.response.status !== 200) {
                  console.log('err=',err);
              }

              return { ...curData, resultInfo:{resultCode:constants.ResultCode.SERVER_INTERNAL_ERROR,message:`서버 내부 오류가 발생하였습니다.(오류코드:${err.response.status})`,data:null} };
          }
        },
        { revalidate: false }
      );

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message };
    },

    requestCouponList: async ({ pageNo }) => {

      const result = await remoteMutate(
        RewardEventStoreKey,
        async (curData) => {
          try {
            const res = await axios.get(`${settings.AdminServerHostURL}/event/coupon/list`, {
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType, pageNo },
            });
  
            const resultInfo = res.data;
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              if(resultInfo !== null && resultInfo !== undefined) {
                console.log("[COUPON] resultInfo.resultCode=",resultInfo.resultCode);
              }
              return { ...curData, totalCount:0, pageNo: pageNo, msgList: [], resultInfo:resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
              return { ...curData, totalCount:resultInfo.data.totalCount, msgList: resultInfo.data.list, pageNo: pageNo, resultInfo: resultInfo };
            }
          } catch(err) {
              if(err.response.status !== 200) {
                  console.log('err=',err);
              }

              return { ...curData, resultInfo:{resultCode:constants.ResultCode.SERVER_INTERNAL_ERROR,message:`서버 내부 오류가 발생하였습니다.(오류코드:${err.response.status})`,data:null} };
          }
        },
        { revalidate: false }
      );

      // const newMsgList = [];
      // for(let msgInfo of result.msgList) {
      //   newMsgList.push({...msgInfo,titleTable:JSON.parse(Utils.decodeBase64(msgInfo.titleTable)),contentTable:JSON.parse(Utils.decodeBase64(msgInfo.contentTable)),rewardData:JSON.parse(Utils.decodeBase64(msgInfo.rewardData))});
      // }

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: {totalCount:result.totalCount,list:result.msgList} };
    },

    requestMessagePresetInfoList: async () => {

      const result = await remoteMutate(
        RewardEventStoreKey,
        async (curData) => {
          try {
            const res = await axios.get(`${settings.AdminServerHostURL}/event/preset/lang/list`, {
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
            });
            const resultInfo = res.data;
  
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              return { ...curData, msgList: [], resultInfo: resultInfo };
              
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
              return { ...curData, msgList: resultInfo.data, resultInfo: resultInfo };
            }
          } catch(err) {
              if(err.response.status !== 200) {
                  console.log('err=',err);
              }

              return { ...curData, resultInfo:{resultCode:constants.ResultCode.SERVER_INTERNAL_ERROR,message:`서버 내부 오류가 발생하였습니다.(오류코드:${err.response.status})`,data:null} };
          }
        },
        { revalidate: false }
      );

      return result.resultInfo;
    },

    requestRewardPresetInfoList: async () => {

      const result = await remoteMutate(
        RewardEventStoreKey,
        async (curData) => {
          try {
            const res = await axios.get(`${settings.AdminServerHostURL}/event/preset/reward/list`, {
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
            });
            const resultInfo = res.data;
  
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              return { ...curData, msgList: [], resultInfo: resultInfo };
              
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
              return { ...curData, msgList: resultInfo.data, resultInfo: resultInfo };
            }
          } catch(err) {
              if(err.response.status !== 200) {
                  console.log('err=',err);
              }

              return { ...curData, resultInfo:{resultCode:constants.ResultCode.SERVER_INTERNAL_ERROR,message:`서버 내부 오류가 발생하였습니다.(오류코드:${err.response.status})`,data:null} };
          }
        },
        { revalidate: false }
      );

      return result.resultInfo;
    },

    requestNewCoupon: async (couponInfo) => {

      //const encodedNotiInfo = { ...msgInfo, titleTable: Utils.encodeBase64(JSON.stringify(msgInfo.titleTable)), contentTable: Utils.encodeBase64(JSON.stringify(msgInfo.contentTable)), rewardData: Utils.encodeBase64(JSON.stringify(msgInfo.rewardData)) };

      const result = await remoteMutate(
        RewardEventStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/event/coupon/new`,couponInfo, { headers: {serverType, adminID: authInfo.loginID, authToken: authInfo.authToken,'Content-Security-Policy': 'upgrade-insecure-requests' } });
            const resultInfo = res.data;
  
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              return { ...curData, msgList: [], resultInfo: resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
              return { ...curData, msgList: resultInfo.data, resultInfo: resultInfo };
            }
          } catch(err) {
              if(err.response.status !== 200) {
                  console.log('err=',err);
              }

              return { ...curData, resultInfo:{resultCode:constants.ResultCode.SERVER_INTERNAL_ERROR,message:`서버 내부 오류가 발생하였습니다.(오류코드:${err.response.status})`,data:null} };
          }
        },
        { revalidate: false }
      );

      return result.resultInfo;
    }
  };
};

export default useRewardEvent;
