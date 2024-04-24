import useSWR, { useSWRConfig } from 'swr';
import useAuth from './useAuthDataManager';
import axios from 'axios';
import * as constants from '../common/constants';
import settings from '../common/settings';
import useCommon from './useCommonStorageManager';

export const ToolStoreKey = 'local:/tool';
export const ToolInitData = { __count: 0, totalCount: 0, userList:[], tableName:"", tableData:null, resultInfo: null };

const useTool = () => {
  const { authInfo,setAuthInfo } = useAuth();
  const { data: toolInfo, mutate: localMutate } = useSWR(ToolStoreKey);
  const { mutate: remoteMutate } = useSWRConfig();

  const {serverType} = useCommon();

  const setToolInfo = (value) => {
    const newToolInfo = { ...value };
    newToolInfo.__count++;
    localMutate(newToolInfo, { revalidate: false });
  };

  const totalPageNum = (recNumPerPage) => {
    return (toolInfo.totalCount <= 0 ? 1: Math.floor(1+(toolInfo.totalCount/recNumPerPage)));
  };

  return {
    toolInfo,
    setToolInfo,
    totalPageNum,
    requestGameDBTableQuery: async ({ dbName, tableName }) => {
      
      const result = await remoteMutate(
        ToolStoreKey,
        async (curData) => {
            try {
                const res = await axios.post(`${settings.AdminServerHostURL}/tool/gamedbtable/query`, {dbName,tableName}, {
                    headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
                  });
                  const resultInfo = res.data;
        
                  console.log("resultInfo=",resultInfo);
                  
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
    requestArenaTableUpdate: async ({ tableName, tableData }) => {

        const result = await remoteMutate(
            ToolStoreKey,
            async (curData) => {
                try {
                    const res = await axios.post(`${settings.AdminServerHostURL}/tool/arena/update`, {tableName, tableData}, {
                        headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
                      });
                      const resultInfo = res.data;
            
                      console.log("resultInfo=",resultInfo);
                      
                      if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                        if(resultInfo !== null && resultInfo !== undefined) {
                          console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
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
    requestSeasonRegistrationToMarket: async ({ seasonInfo, seasonActivationFlag }) => {

      const result = await remoteMutate(
        ToolStoreKey,
        async (curData) => {
            try {
                const res = await axios.post(`${settings.AdminServerHostURL}/tool/market/season/register`, { seasonInfo, seasonActivationFlag }, {
                    headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
                  });
                  const resultInfo = res.data;
        
                  console.log("resultInfo=",resultInfo);
                  
                  if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                    if(resultInfo !== null && resultInfo !== undefined) {
                      console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
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
    requestMarketUserList: async ({ queryFilterInfo, pageNo }) => {

      const result = await remoteMutate(
        ToolStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/tool/market/user/list`, { queryFilterInfo, pageNo }, {
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
            });
            const resultInfo = res.data;
  
            console.log("resultInfo=",resultInfo);
            
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              if(resultInfo !== null && resultInfo !== undefined) {
                console.log("[TOOL] resultInfo.resultCode=",resultInfo.resultCode);
              }
              return { ...curData, pageNo: pageNo, totalCount:0, userList: [], resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
              
              return { ...curData, totalCount:resultInfo.data.totalCount, userList: resultInfo.data.list, pageNo: pageNo, resultInfo: resultInfo };
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

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: {totalCount:result.totalCount,list:result.userList} };
    },
    requestNFTRegistrationToMarket: async ({ seasonInfo, itemType, price, mintingInfoTable }) => {

      const result = await remoteMutate(
          ToolStoreKey,
          async (curData) => {
              try {
                  const res = await axios.post(`${settings.AdminServerHostURL}/tool/market/nft/register`, { seasonInfo, itemType, price, mintingInfoTable }, {
                      headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
                    });
                    const resultInfo = res.data;
          
                    console.log("resultInfo=",resultInfo);
                    
                    if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                      if(resultInfo !== null && resultInfo !== undefined) {
                        console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
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
    requestMarketDownloadInfoQuery: async () => {

      const result = await remoteMutate(
          ToolStoreKey,
          async (curData) => {
              try {
                  const res = await axios.post(`${settings.AdminServerHostURL}/tool/market/setting/downloadurl`, { }, {
                      headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
                    });
                    const resultInfo = res.data;
          
                    console.log("resultInfo=",resultInfo);
                    
                    if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                      if(resultInfo !== null && resultInfo !== undefined) {
                        console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
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
    requestMarketDownloadInfoUpdate: async ({apkDownloadURL,iosMarketURL,androidMarketURL}) => {

      const result = await remoteMutate(
        ToolStoreKey,
        async (curData) => {
            try {
                const res = await axios.post(`${settings.AdminServerHostURL}/tool/market/setting/downloadurl/update`, {apkDownloadURL,iosMarketURL,androidMarketURL}, {
                    headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
                  });
                  const resultInfo = res.data;
        
                  console.log("resultInfo=",resultInfo);
                  
                  if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                    if(resultInfo !== null && resultInfo !== undefined) {
                      console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
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
    requestMarketMaintenanceInfoQuery: async () => {

      const result = await remoteMutate(
          ToolStoreKey,
          async (curData) => {
              try {
                  const res = await axios.post(`${settings.AdminServerHostURL}/tool/market/setting/maintenance`, { }, {
                      headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
                    });
                    const resultInfo = res.data;
          
                    console.log("resultInfo=",resultInfo);
                    
                    if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                      if(resultInfo !== null && resultInfo !== undefined) {
                        console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
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
    requestMarketMaintenanceInfoUpdate: async ({activeFlag,startTime,endTime,title,content}) => {

      const result = await remoteMutate(
        ToolStoreKey,
        async (curData) => {
            try {
                const res = await axios.post(`${settings.AdminServerHostURL}/tool/market/setting/maintenance/update`, {activeFlag,startTime,endTime,title,content}, {
                    headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
                  });
                  const resultInfo = res.data;
        
                  console.log("resultInfo=",resultInfo);
                  
                  if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                    if(resultInfo !== null && resultInfo !== undefined) {
                      console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
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
    requestMarketWhitelistInfoQuery: async () => {
      
      const result = await remoteMutate(
        ToolStoreKey,
        async (curData) => {
            try {
                const res = await axios.post(`${settings.AdminServerHostURL}/tool/market/setting/whitelist/list`, {}, {
                    headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
                  });
                  const resultInfo = res.data;
        
                  console.log("resultInfo=",resultInfo);
                  
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
    requestMarketNewWhiteUser: async ({keyword}) => {

      const result = await remoteMutate(
        ToolStoreKey,
        async (curData) => {
            try {
                const res = await axios.post(`${settings.AdminServerHostURL}/tool/market/setting/whitelist/new`, {keyword}, {
                    headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
                  });
                  const resultInfo = res.data;
        
                  console.log("resultInfo=",resultInfo);
                  
                  if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                    if(resultInfo !== null && resultInfo !== undefined) {
                      console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
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
    requestMarketWhiteUserStateChange: async ({userID,activationFlag}) => {

      const result = await remoteMutate(
        ToolStoreKey,
        async (curData) => {
            try {
                const res = await axios.post(`${settings.AdminServerHostURL}/tool/market/setting/whitelist/changestate`, {userID,activationFlag}, {
                    headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
                  });
                  const resultInfo = res.data;
        
                  console.log("resultInfo=",resultInfo);
                  
                  if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                    if(resultInfo !== null && resultInfo !== undefined) {
                      console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
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

export default useTool;
