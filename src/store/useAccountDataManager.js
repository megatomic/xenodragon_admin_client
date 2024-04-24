import useSWR, { useSWRConfig } from 'swr';

import useAuth from './useAuthDataManager';
import axios from 'axios';
import * as constants from '../common/constants';
import settings from '../common/settings';
import useCommon from './useCommonStorageManager';

export const AccountStoreKey = 'local:/account';
export const AccountInitData = { __count: 0, totalCount:0, accountList:[], pageNo:1, resultInfo:null };

const useAccountStorageManager = () => {

    const {authInfo,setAuthInfo} = useAuth();
  const { data: accountInfo, mutate: localMutate } = useSWR(AccountStoreKey);
  const { mutate: remoteMutate } = useSWRConfig();

  const {serverType} = useCommon();

  const setAccountInfo = (value) => {
    const newAccountInfo = { ...value };
    newAccountInfo.__count++;
    localMutate(newAccountInfo, { revalidate: false });
  };

  const totalPageNum = (recNumPerPage) => {
    return (accountInfo.totalCount <= 0 ? 1: Math.floor(1+(accountInfo.totalCount/recNumPerPage)));
  };

  return {
    accountInfo,
    setAccountInfo,
    totalPageNum,
    requestAccountList: async (pageNo) => {
      const result = await remoteMutate(
        AccountStoreKey,
        async (curData) => {
          try {
            const res = await axios.get(`${settings.AdminServerHostURL}/account/list`, {headers: { adminID:authInfo.loginID, authToken:authInfo.authToken, serverType, pageNo }});
            const resultInfo = res.data;
  
            if(resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[ACCOUNT] resultInfo.resultCode=",resultInfo.resultCode);
                }
                return { ...curData, totalCount:0, pageNo:pageNo, accountList:[], resultInfo:resultInfo};
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
  
              return { ...curData, totalCount:resultInfo.data.totalCount, accountList:resultInfo.data.list, pageNo:pageNo, resultInfo:resultInfo };
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

      return {resultCode:result.resultInfo.resultCode,message:result.resultInfo.message,pageNo:result.pageNo,data:{totalCount:result.totalCount,list:result.accountList}};
    },

    requestNewAdmin: async (newAccountInfo) => {

        //console.log({ ...newAccountInfo, adminID:authInfo.loginID, authToken:authInfo.authToken });

        const encodedAccountInfo = {...newAccountInfo, newAdminNick:encodeURIComponent(newAccountInfo.newAdminNick)};

        const result = await remoteMutate(
            AccountStoreKey,
            async (curData) => {
              try {
                const res = await axios.get(`${settings.AdminServerHostURL}/account/new`, {headers: { ...encodedAccountInfo, adminID:authInfo.loginID, authToken:authInfo.authToken,serverType }});
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
    
          return {resultCode:result.resultInfo.resultCode,message:result.resultInfo.message};
    },
    
    requestModifyAdminInfo: async (accountInfo) => {
        const encodedAccountInfo = {...accountInfo, targetAccountNick:encodeURIComponent(accountInfo.targetAccountNick)};

        const result = await remoteMutate(
            AccountStoreKey,
            async (curData) => {
              try {
                const res = await axios.get(`${settings.AdminServerHostURL}/account/modify`, {headers: { ...encodedAccountInfo, adminID:authInfo.loginID, authToken:authInfo.authToken,serverType }});
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
    
          return {resultCode:result.resultInfo.resultCode,message:result.resultInfo.message};
    },

    requestDeleteAccount: async (accountIDList) => {

        //console.log({ targetAdminIDList:JSON.stringify(accountIDList), adminID:authInfo.loginID, authToken:authInfo.authToken });

        const result = await remoteMutate(
            AccountStoreKey,
            async (curData) => {
              try {
                const res = await axios.get(`${settings.AdminServerHostURL}/account/delete`, {headers: { targetAdminIDList:JSON.stringify(accountIDList), adminID:authInfo.loginID, authToken:authInfo.authToken,serverType }});
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
    
        return {resultCode:result.resultInfo.resultCode,message:result.resultInfo.message};
    },

    requestAccountActivation: async (accountIDList,activationFlagList) => {

        //console.log({ targetAdminIDList:JSON.stringify(accountIDList), adminID:authInfo.loginID, authToken:authInfo.authToken });

        const result = await remoteMutate(
            AccountStoreKey,
            async (curData) => {
              try {
                const res = await axios.get(`${settings.AdminServerHostURL}/account/changeactivation`, {headers: { targetAdminIDList:JSON.stringify(accountIDList), activationFlagList:JSON.stringify(activationFlagList), adminID:authInfo.loginID, authToken:authInfo.authToken,serverType }});
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
    
        return {resultCode:result.resultInfo.resultCode,message:result.resultInfo.message};
    },

    requestChangeMasterPW: async (oldPassword, newPassword, confirmPassword) => {

      const result = await remoteMutate(
        AccountStoreKey,
        async (curData) => {
          try {
            const res = await axios.get(`${settings.AdminServerHostURL}/account/master/changepw`, {headers: { oldPassword, newPassword, confirmPassword, adminID:authInfo.loginID, authToken:authInfo.authToken,serverType }});
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

    return {resultCode:result.resultInfo.resultCode,message:result.resultInfo.message};
    }
  };
};

export default useAccountStorageManager;