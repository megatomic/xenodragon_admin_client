import useSWR, { useSWRConfig } from 'swr';
import axios from 'axios';
import * as constants from '../common/constants';
import settings from '../common/settings';
import useCommon from './useCommonStorageManager';

export const AuthStoreKey = 'local:/auth';
export const AuthInitData = { __count: 0, loginFailMsg: '', loginID: '', logined: false, authToken: null, tokenExpireTime: 0, accountInfo:null, resultInfo:null };

const useAuth = () => {
  const { data: authInfo, mutate: localMutate } = useSWR(AuthStoreKey);
  const { mutate: remoteMutate } = useSWRConfig();

  const {serverType,setResetClockTimer} = useCommon();

  const setAuthInfo = (value) => {

    setResetClockTimer(true);
    
    const newAuthInfo = { ...value };
    newAuthInfo.__count++;
    localMutate(newAuthInfo, { revalidate: false });
  };

  return {
    authInfo,
    setAuthInfo,
    requestLogin: async (adminID, adminPW) => {
      const result = await remoteMutate(
        AuthStoreKey,
        async (curData) => {
          try {
            const res = await axios.get(`${settings.AdminServerHostURL}/auth/login`, {headers: { adminID, adminPW,serverType }});
            const resultInfo = res.data;
  
            console.log(resultInfo.resultCode);
  
            let newData;
            if(resultInfo === null || resultInfo === undefined) {
                return { ...curData, logined: false};
            } else {
              if(resultInfo.resultCode !== 0) {
                return { ...curData, loginID:adminID, logined: false, authToken:null, accountInfo:null, resultInfo:{...resultInfo} };
              } else {
                return { ...curData, loginID:adminID, logined: true, authToken: resultInfo.data.authToken, tokenExpireTime:resultInfo.data.tokenExpireTime, accountInfo:resultInfo.data.accountInfo, resultInfo:{...resultInfo} };
              }
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

      return {resultCode:result.resultInfo.resultCode,logined:result.logined,message:result.resultInfo.message,authToken:result.authToken,tokenExpireTime:result.tokenExpireTime,accountInfo:result.accountInfo};
    },
    requestLogout: async (loginID) => {
      await remoteMutate(
        AuthStoreKey,
        async (curData) => {
          axios.get(`${settings.AdminServerHostURL}/auth/loout`, { loginID,serverType }).then((res) => res.data);
          const newData = { ...curData, logined: false, authToken: null };

          return newData;
        },
        { revalidate: false }
      );
    },
  };
};

export default useAuth;
