import useSWR, { useSWRConfig } from 'swr';
import useAuth from './useAuthDataManager';
import axios from 'axios';
import * as constants from '../common/constants';
import settings from '../common/settings';
import useCommon from './useCommonStorageManager';

export const SettingStoreKey = 'local:/setting';
export const SettingInitData = { __count: 0, settingList: null, clientConfig: null, resultInfo: null };

const useSetting = () => {
  const { authInfo,setAuthInfo } = useAuth();
  const { data: settingInfo, mutate: localMutate } = useSWR(SettingStoreKey);
  const { mutate: remoteMutate } = useSWRConfig();

  const {serverType} = useCommon();

  const setSettingInfo = (value) => {
    const newSettingInfo = { ...value };
    newSettingInfo.__count++;
    localMutate(newSettingInfo, { revalidate: false });
  };

  return {
    settingInfo,
    setSettingInfo,

    requestSettingList: async () => {
      const result = await remoteMutate(
        SettingStoreKey,
        async (curData) => {
          try {
            const res = await axios.get(`${settings.AdminServerHostURL}/setting/list`, {
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType},
            });
  
            const resultInfo = res.data;
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              if(resultInfo !== null && resultInfo !== undefined) {
                console.log("[SETTING] resultInfo.resultCode=",resultInfo.resultCode);
              }
              return { ...curData, settingList: [], resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
  
              return { ...curData, settingList: resultInfo.data, resultInfo: resultInfo };
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data: result.settingList };
    },

    requestUpdateSettings: async (settingItemTable,otpCode) => {
  
        const result = await remoteMutate(
            SettingStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/setting/update`, {settingItemTable,otpCode}, { headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType } });
              const resultInfo = res.data;
    
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                return { ...curData, settingList: [], resultInfo };
              } else {
                authInfo.authToken = res.data.newAuthToken;
                setAuthInfo(authInfo);
  
                return { ...curData, settingList: resultInfo.data, resultInfo: resultInfo };
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
  
        return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data: result.settingList };
      },

      requestClientConfig: async () => {
        const result = await remoteMutate(
          SettingStoreKey,
          async (curData) => {
            try {
              const res = await axios.get(`${settings.AdminServerHostURL}/setting/clientconfig/list`, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType},
              });
              const resultInfo = res.data;
  
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                return { ...curData, clientConfig: {}, resultInfo };
              } else {
                authInfo.authToken = res.data.newAuthToken;
                setAuthInfo(authInfo);
  
                return { ...curData, clientConfig: resultInfo.data, resultInfo: resultInfo };
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
  
        return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data: result.clientConfig };
      },

      requestUpdateClientConfig: async (clientConfig) => {

        const clientConfigStr = JSON.stringify(clientConfig);
        const clientConfigEnc = encodeURIComponent(clientConfigStr);

        const result = await remoteMutate(
          SettingStoreKey,
        async (curData) => {
          try {
            const res = await axios.get(`${settings.AdminServerHostURL}/setting/clientconfig/update`, { headers: { clientConfigEnc:clientConfigEnc, adminID: authInfo.loginID, authToken: authInfo.authToken,serverType } });          
            const resultInfo = res.data;
  
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              return { ...curData, settingList: [], resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
              
              return { ...curData, settingList: resultInfo.data, resultInfo: resultInfo };
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data: result.clientConfig };
      }
  };
};

export default useSetting;
