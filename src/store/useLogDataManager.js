import useSWR, { useSWRConfig } from 'swr';
import useAuth from './useAuthDataManager';
import axios from 'axios';
import * as constants from '../common/constants';
import settings from '../common/settings';
import useCommon from './useCommonStorageManager';

export const AdminLogStoreKey = 'local:/log';
export const AdminLogInitData = { __count: 0, totalCount:0, logList: null, pageNo: 1, resultInfo: null };

const useAdminActLog = () => {
  const { authInfo,setAuthInfo } = useAuth();
  const { data: logInfo, mutate: localMutate } = useSWR(AdminLogStoreKey);
  const { mutate: remoteMutate } = useSWRConfig();

  const {serverType} = useCommon();

  const setLogInfo = (value) => {
    const newLogInfo = { ...value };
    newLogInfo.__count++;
    localMutate(newLogInfo, { revalidate: false });
  };

  const totalPageNum = (recNumPerPage) => {
    return (logInfo.totalCount <= 0 ? 1: Math.floor(1+(logInfo.totalCount/recNumPerPage)));
  };

  return {
    logInfo,
    setLogInfo,
    totalPageNum,
    requestAdminActLogList: async ({ queryFilterInfo, pageNo }) => {
      const queryFilterInfo2 = { ...queryFilterInfo, titleKeyword: encodeURIComponent(queryFilterInfo.titleKeyword) };

      const result = await remoteMutate(
        AdminLogStoreKey,
        async (curData) => {
          try {
            const res = await axios.get(`${settings.AdminServerHostURL}/log/list`, {
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType, queryFilterInfo: JSON.stringify(queryFilterInfo2), pageNo },
            });
            const resultInfo = res.data;
  
            console.log("resultInfo=",resultInfo);
            
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              if(resultInfo !== null && resultInfo !== undefined) {
                console.log("[LOG] resultInfo.resultCode=",resultInfo.resultCode);
              }
              return { ...curData, pageNo: pageNo, totalCount:0, logList: [], resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
              
              return { ...curData, totalCount:resultInfo.data.totalCount, logList: resultInfo.data.list, pageNo: pageNo, resultInfo: resultInfo };
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: {totalCount:result.totalCount,list:result.logList} };
    },
  };
};

export default useAdminActLog;
