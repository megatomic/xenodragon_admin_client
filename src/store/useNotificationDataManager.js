import useSWR, { useSWRConfig } from 'swr';
import useAuth from './useAuthDataManager';
import axios from 'axios';
import * as constants from '../common/constants';
import settings from '../common/settings';
import useCommon from './useCommonStorageManager';
import * as Utils from '../common/Utils';

export const NotificationStoreKey = 'local:/notification';
export const NotificationInitData = { __count: 0, totalCount:0, notificationList: null, pageNo: 1, resultInfo: null };

const useNotification = () => {
  const { authInfo,setAuthInfo } = useAuth();
  const { data: notificationInfo, mutate: localMutate } = useSWR(NotificationStoreKey);
  const { mutate: remoteMutate } = useSWRConfig();

  const {serverType} = useCommon();

  const setNotificationInfo = (value) => {
    const newNotiInfo = { ...value };
    newNotiInfo.__count++;
    localMutate(newNotiInfo, { revalidate: false });
  };

  return {
    notificationInfo,
    setNotificationInfo,

    requestNotificationList: async ({ queryFilterInfo, notiType, pageNo }) => {
      const queryFilterInfo2 = { ...queryFilterInfo, titleKeyword: encodeURIComponent(queryFilterInfo.titleKeyword) };

      const result = await remoteMutate(
        NotificationStoreKey,
        async (curData) => {
          try {
            const res = await axios.get(`${settings.AdminServerHostURL}/noti/list`, {
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken, serverType, queryFilterInfo: JSON.stringify(queryFilterInfo2), notiType, pageNo },
            });
  
            const resultInfo = res.data;
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              if(resultInfo !== null && resultInfo !== undefined) {
                console.log("[NOTIFICATION] resultInfo.resultCode=",resultInfo.resultCode);
              }
              return { ...curData, totalCount:0, pageNo: pageNo, notificationList: [], resultInfo:resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
  
              return { ...curData, totalCount:resultInfo.data.totalCount, notificationList: resultInfo.data.list, pageNo: pageNo, resultInfo: resultInfo };
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: {totalCount:result.totalCount,list:result.notificationList} };
    },

    requestNewNotification: async (notificationInfo) => {
      //const encodedNotiInfo = { ...notificationInfo, titleTable: Utils.encodeBase64(JSON.stringify(notificationInfo.titleTable)), contentTable: Utils.encodeBase64(JSON.stringify(notificationInfo.contentTable)) };

      //console.log({ headers: { ...encodedNotiInfo, adminID: authInfo.loginID, authToken: authInfo.authToken } });
      console.log('[NEW] notificationInfo=', notificationInfo);

      const result = await remoteMutate(
        NotificationStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/noti/new`,notificationInfo, { headers: {adminID: authInfo.loginID, authToken: authInfo.authToken,serverType } });
            const resultInfo = res.data;
  
            let newData;
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              return { ...curData, pageNo: notificationInfo.pageNo, notificationList: [], resultInfo: resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
  
              return { ...curData, pageNo: notificationInfo.pageNo, notificationList: resultInfo.data, resultInfo: resultInfo };
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data: result.notificationList };
    },
    requestModifyNotification: async (notificationInfo) => {
      //const encodedNotiInfo = { ...notificationInfo, titleTable: Utils.encodeBase64(JSON.stringify(notificationInfo.titleTable)), contentTable: Utils.encodeBase64(JSON.stringify(notificationInfo.contentTable)) };

      console.log('[UPDATE] notificationInfo=', notificationInfo);

      const result = await remoteMutate(
        NotificationStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/noti/update`, notificationInfo, { headers: {adminID: authInfo.loginID, authToken: authInfo.authToken,serverType } });
            const resultInfo = res.data;
  
            let newData;
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              return { ...curData, pageNo: notificationInfo.pageNo, notificationList: [], resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
  
              return { ...curData, pageNo: notificationInfo.pageNo, notificationList: resultInfo.data, resultInfo: resultInfo };
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data: result.notificationList };
    },
    requestDeleteNotifications: async (notiIDList) => {
      //console.log({ targetAdminIDList:JSON.stringify(accountIDList), adminID:authInfo.loginID, authToken:authInfo.authToken });

      const result = await remoteMutate(
        NotificationStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/noti/delete`, notiIDList, { headers: {adminID: authInfo.loginID, authToken: authInfo.authToken,serverType } });
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
  };
};

export default useNotification;
