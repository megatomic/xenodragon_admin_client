import useSWR, { useSWRConfig } from 'swr';
import useAuth from './useAuthDataManager';
import axios from 'axios';
import * as constants from '../common/constants';
import settings from '../common/settings';
import useCommon from './useCommonStorageManager';
import * as Utils from '../common/Utils';

export const MessageStoreKey = 'local:/message';
export const MessageInitData = { __count: 0, totalCount:0, msgList: [], langPresetList: [], rewardPresetList: [], pageNo: 1, resultInfo: null };

const useMessage = () => {
  const { authInfo,setAuthInfo } = useAuth();
  const { data: msgInfo, mutate: localMutate } = useSWR(MessageStoreKey);
  const { mutate: remoteMutate } = useSWRConfig();

  const {serverType} = useCommon();

  const setMsgInfo = (value) => {
    const newMsgInfo = { ...value };
    newMsgInfo.__count++;
    localMutate(newMsgInfo, { revalidate: false });
  };

  const totalPageNum = (recNumPerPage) => {
    return (msgInfo.totalCount <= 0 ? 1: Math.floor(1+(msgInfo.totalCount/recNumPerPage)));
  };

  return {
    msgInfo,
    setMsgInfo,
    totalPageNum,
    requestLanguagePresetList: async ({ queryFilterInfo, presetType, pageNo }) => {
      const queryFilterInfo2 = { ...queryFilterInfo, titleKeyword: encodeURIComponent(queryFilterInfo.titleKeyword) };

      const adminServerURL = `${settings.AdminServerHostURL}/message/preset/lang/list`;
      //console.log(`[GET] requestLanguagePresetList() adminServerURL:${adminServerURL}`);

      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.get(adminServerURL, {
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType, queryFilterInfo: JSON.stringify(queryFilterInfo2), presetType, pageNo },
            });
  
            const resultInfo = res.data;
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              if(resultInfo !== null && resultInfo !== undefined) {
                console.log("[MESSAGE] resultInfo.resultCode=",resultInfo.resultCode);
              }
              return { ...curData, totalCount:0, pageNo: pageNo, langPresetList: [], resultInfo:resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
              return { ...curData, totalCount:resultInfo.data.totalCount, langPresetList: resultInfo.data.list, pageNo: pageNo, resultInfo: resultInfo };
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: {totalCount:result.totalCount,list:result.langPresetList} };
    },
    requestLanguagePreset: async ({presetType,presetID}) => {
      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/message/preset/lang/item`,{presetType,presetID}, { headers: {serverType, adminID: authInfo.loginID, authToken: authInfo.authToken,'Content-Security-Policy': 'upgrade-insecure-requests' } });
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

    requestAddLanguagePreset: async ({presetID, bodyInfo }) => {
      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/message/preset/lang/add`,{presetID, bodyInfo}, { headers: {serverType, adminID: authInfo.loginID, authToken: authInfo.authToken,'Content-Security-Policy': 'upgrade-insecure-requests' } });
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
    requestUpdateLanguagePreset: async ({presetID, bodyInfo}) => {
      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/message/preset/lang/update`,{presetID, bodyInfo}, { headers: {adminID: authInfo.loginID, authToken: authInfo.authToken,serverType } });
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data: result.msgList };
    },
    requestDeleteLanguagePresets: async ({ presetIDList }) => {
      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/message/preset/lang/delete`, {presetIDList}, {
              headers: {adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
            });          
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
    requestRewardPresetList: async ({ queryFilterInfo, pageNo }) => {
      const queryFilterInfo2 = { ...queryFilterInfo, titleKeyword: encodeURIComponent(queryFilterInfo.titleKeyword) };

      const adminServerURL = `${settings.AdminServerHostURL}/message/preset/reward/list`;
      //console.log(`[GET] requestLanguagePresetList() adminServerURL:${adminServerURL}`);

      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.get(adminServerURL, {
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType, queryFilterInfo: JSON.stringify(queryFilterInfo2), pageNo },
            });
  
            const resultInfo = res.data;
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              if(resultInfo !== null && resultInfo !== undefined) {
                console.log("[MESSAGE] resultInfo.resultCode=",resultInfo.resultCode);
              }
              return { ...curData, totalCount:0, pageNo: pageNo, langPresetList: [], resultInfo:resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
              return { ...curData, totalCount:resultInfo.data.totalCount, rewardPresetList: resultInfo.data.list, pageNo: pageNo, resultInfo: resultInfo };
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: {totalCount:result.totalCount,list:result.rewardPresetList} };
    },
    requestRewardPreset: async (presetID) => {
      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/message/preset/reward/item`,{presetID}, { headers: {serverType, adminID: authInfo.loginID, authToken: authInfo.authToken,'Content-Security-Policy': 'upgrade-insecure-requests' } });
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
    requestAddRewardPreset: async ({presetID, rewardData}) => {

      //console.log('rewardData=',rewardData);

      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/message/preset/reward/add`,{presetID, rewardData}, { headers: {serverType, adminID: authInfo.loginID, authToken: authInfo.authToken,'Content-Security-Policy': 'upgrade-insecure-requests' } });
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
    requestUpdateRewardPreset: async ({presetID, rewardData}) => {
      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/message/preset/reward/update`,{presetID, rewardData}, { headers: {adminID: authInfo.loginID, authToken: authInfo.authToken,serverType } });
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data: result.msgList };
    },
    requestDeleteRewardPresets: async ({presetIDList}) => {
      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/message/preset/reward/delete`, {presetIDList}, {
              headers: {adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
            });          
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
    requestMessageList: async ({ queryFilterInfo, msgType, pageNo }) => {
      const queryFilterInfo2 = { ...queryFilterInfo, titleKeyword: encodeURIComponent(queryFilterInfo.titleKeyword) };

      const adminServerURL = `${settings.AdminServerHostURL}/message/list`;
      console.log(`[GET] requestMessageList() adminServerURL:${adminServerURL}`);

      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.get(adminServerURL, {
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType, queryFilterInfo: JSON.stringify(queryFilterInfo2), msgType, pageNo },
            });
  
            const resultInfo = res.data;
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              if(resultInfo !== null && resultInfo !== undefined) {
                console.log("[MESSAGE] resultInfo.resultCode=",resultInfo.resultCode);
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: {totalCount:result.totalCount,list:result.msgList} };
    },

    requestNewMessage: async (msgInfo) => {
      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/message/send`,msgInfo, { headers: {serverType, adminID: authInfo.loginID, authToken: authInfo.authToken,'Content-Security-Policy': 'upgrade-insecure-requests' } });
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

    requestModifyMessage: async (msgInfo) => {
      //const encodedNotiInfo = { ...msgInfo, titleTable: Utils.encodeBase64(msgInfo.titleTable), contentTable: Utils.encodeBase64(msgInfo.contentTable), rewardData: Utils.encodeBase64(JSON.stringify(msgInfo.rewardData)) };

      //console.log('notiInfo=', encodedNotiInfo);

      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/message/update`,msgInfo, { headers: {adminID: authInfo.loginID, authToken: authInfo.authToken,serverType } });
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data: result.msgList };
    },

    requestDeleteMessages: async (msgType, msgIDList) => {
      //console.log({ targetAdminIDList:JSON.stringify(accountIDList), adminID:authInfo.loginID, authToken:authInfo.authToken });

      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/message/delete`, {msgType,msgIDList}, {
              headers: {adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
            });          
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

    requestPushMessageState: async (requestID) => {

      const result = await remoteMutate(
        MessageStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.PushServerHostURL[serverType]}/state`, {reqID:requestID}, {
              headers: {adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
            });          
            const resultInfo = res.data;
                
            if(resultInfo !== null && resultInfo !== undefined && resultInfo.resultCode === 0) {
              // authInfo.authToken = res.data.newAuthToken;
              // setAuthInfo(authInfo);
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data:result.resultInfo.data };
    }
  };
};

export default useMessage;
