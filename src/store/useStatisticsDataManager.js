import useSWR, { useSWRConfig } from 'swr';
import useAuth from './useAuthDataManager';
import axios from 'axios';
import * as constants from '../common/constants';
import settings from '../common/settings';
import useCommon from './useCommonStorageManager';

export const StatisticsStoreKey = 'local:/statistics';
export const StatisticsInitData = { __count: 0, totalCount:0, pageNo:1, logList:null, resultInfo: null };

const useStatistics = () => {
  const { authInfo,setAuthInfo } = useAuth();
  const { data: statisticsInfo, mutate: localMutate } = useSWR(StatisticsStoreKey);
  const { mutate: remoteMutate } = useSWRConfig();

  const {serverType} = useCommon();

  const setStatisticsInfo = (value) => {
    const newBCInfo = { ...value };
    newBCInfo.__count++;
    localMutate(newBCInfo, { revalidate: false });
  };

  const totalPageNum = (recNumPerPage) => {
    return (statisticsInfo.totalCount <= 0 ? 1: Math.floor(1+(statisticsInfo.totalCount/recNumPerPage)));
  };

  return {
    statisticsInfo,
    totalPageNum,
    setStatisticsInfo,
    requestUserStatisticsData: async ({ baseTime, baseDirection, displayNum, timeIntervalType, offsetValue }) => {
      
      const result = await remoteMutate(
        StatisticsStoreKey,
        async (curData) => {
            try {
                const res = await axios.post(`${settings.AdminServerHostURL}/statistics/user/graphdata`, {baseTime, baseDirection, displayNum, timeIntervalType, offsetValue}, {
                    headers: { adminID: authInfo.loginID, authToken: authInfo.authToken, serverType },
                  });
                  const resultInfo = res.data;
        
                  //console.log("resultInfo=",resultInfo);
                  
                  if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                    if(resultInfo !== null && resultInfo !== undefined) {
                      console.log("[TOOL] resultInfo.resultCode=",resultInfo.resultCode);
                    }
                    return { ...curData, resultInfo };
                  } else {
                    authInfo.authToken = res.data.newAuthToken;
                    setAuthInfo(authInfo);
                    
                    return { ...curData, resultInfo: resultInfo };
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data:result.resultInfo.data };
    },
    requestCashStatisticsData: async ({ baseTime, baseDirection, displayNum, timeIntervalType, offsetValue }) => {
      
      const result = await remoteMutate(
        StatisticsStoreKey,
        async (curData) => {
            try {
                const res = await axios.post(`${settings.AdminServerHostURL}/statistics/cash/graphdata`, {baseTime, baseDirection, displayNum, timeIntervalType, offsetValue}, {
                    headers: { adminID: authInfo.loginID, authToken: authInfo.authToken, serverType },
                  });
                  const resultInfo = res.data;
        
                  //console.log("resultInfo=",resultInfo);
                  
                  if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                    if(resultInfo !== null && resultInfo !== undefined) {
                      console.log("[TOOL] resultInfo.resultCode=",resultInfo.resultCode);
                    }
                    return { ...curData, resultInfo };
                  } else {
                    authInfo.authToken = res.data.newAuthToken;
                    setAuthInfo(authInfo);
                    
                    return { ...curData, resultInfo: resultInfo };
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data:result.resultInfo.data };
    },
  };
};

export default useStatistics;