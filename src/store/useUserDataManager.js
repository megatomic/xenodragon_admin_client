import useSWR, { useSWRConfig } from 'swr';
import useAuth from './useAuthDataManager';
import axios from 'axios';
import settings from '../common/settings';
import useCommon from './useCommonStorageManager';
import ResultCode from '../common/constants';
import * as constants from '../common/constants';

export const UserStoreKey = 'local:/user';
export const UserInitData = { __count: 0, totalCount:0, userList:null, userActLogList: null, userPayLogList: null, blackList: null, resultInfo: null };

const useUser = () => {
  const { authInfo,setAuthInfo } = useAuth();
  const { data: userInfo, mutate: localMutate } = useSWR(UserStoreKey);
  const { mutate: remoteMutate } = useSWRConfig();

  const {serverType} = useCommon();

  const totalPageNum = (recNumPerPage) => {
    return (userInfo.totalCount <= 0 ? 1: Math.floor(1+(userInfo.totalCount/recNumPerPage)));
  };

  const setUserInfo = (value) => {
    const newUserInfo = { ...value };
    newUserInfo.__count++;
    localMutate(newUserInfo, { revalidate: false });
  };

  const userList = userInfo.userList;
  const setUserList = (value) => {
    userInfo.userList = value;
    setUserInfo(userInfo);
  };

  const userActLogList = userInfo.userActLogList;
  const setUserActLogList = (value) => {
    userInfo.userActLogList = value;
    setUserInfo(userInfo);
  };

  const userPayLogList = userInfo.userPayLogList;
  const setUserPayLogList = (value) => {
    userInfo.userPayLogList = value;
    setUserInfo(userInfo);
  };

  const blackList = userInfo.blackList;
  const setBlackList = (value) => {
    userInfo.blackList = value;
    setUserInfo(userInfo);
  };

  return {
    totalPageNum,
    userInfo,
    setUserInfo,
    userList,
    setUserList,
    userActLogList,
    setUserActLogList,
    userInfo,
    setUserPayLogList,
    blackList,
    setBlackList,
    requestUserList: async ({ queryFilterInfo, pageNo }) => {

      //const queryFilterInfo2 = { ...queryFilterInfo, userKeyword: encodeURIComponent(queryFilterInfo.userKeyword) };
      
      const result = await remoteMutate(
          UserStoreKey,
        async (curData) => {
          let resultInfo = null;
          try {
            const targetURL = `${settings.GameServerAdminHostURL[serverType]}/User/Infos/Nickname/${queryFilterInfo.targetUserID}`;

            console.log('targetURL=',targetURL);

            const res = await axios.get(targetURL,{headers:{'Content-Security-Policy': 'upgrade-insecure-requests'}});
            
            console.log("[USER] res=",JSON.stringify(res));

            resultInfo = {resultCode:(res.status===200?0:res.resultCode),message:'',data:res.data};
          } catch(err) {
            console.log('err=',err);
            if(err.response !== undefined) {
              if(err.response.status !== 200) {
                resultInfo = {resultCode:err.response.status,message:`게임서버로 부터 데이터를 받아올 수 없습니다.(오류코드=${err.response.status})`,data:null};
              }
            } else {
              resultInfo = {resultCode:500,message:`게임서버가 응답하지 않습니다.(오류코드=500)`,data:null};
            }
          }

          if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
            return { ...curData, pageNo: pageNo, userList: [], userActLogList: [], userPayLogList: [], blackList: [], resultInfo: resultInfo };
          } else {
            return { ...curData, userList: resultInfo.data, pageNo: pageNo, resultInfo: resultInfo };
          }
        },
        { revalidate: false }
      );

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: result.userList };
    },
    requestUserNicknameByWalletAddress: async (walletAddress) => {

        const adminServerURL = `${settings.AdminServerHostURL}/blockchain/usernick/getbyaddress`;
        console.log(`[POST] requestQueryMintingLogList() adminServerURL:${adminServerURL}`);

        const result = await remoteMutate(
          UserStoreKey,
          async (curData) => {
            let resultInfo = null;
            try {
              const res = await axios.post(adminServerURL, {walletAddress}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                return { ...curData, pageNo: 1, userList: [], userActLogList: [], userPayLogList: [], blackList: [], resultInfo: resultInfo };
              } else {
                return { ...curData, pageNo: 1, resultInfo: resultInfo };
              }
            } catch(err) {
              if(err.response !== undefined) {
                if(err.response.status !== 200) {
                  resultInfo = {resultCode:err.response.status,message:`게임서버로 부터 데이터를 받아올 수 없습니다.(오류코드=${err.response.status})`,data:null};
                }
              } else {
                resultInfo = {resultCode:500,message:`게임서버가 응답하지 않습니다.(오류코드=500)`,data:null};
              }
            }

            return resultInfo;
          },
          { revalidate: false }
        );
  
        return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: 1, data: result.resultInfo.data };
    },
    requestUserDetailInfo: async (targetUserID) => {
      let resultInfo = null;
      const result = await remoteMutate(
          UserStoreKey,
        async (curData) => {
          try {
            const targetURL = `${settings.GameServerAdminHostURL[serverType]}/User/Infos/Detail/${targetUserID}`;

            console.log('[SWR] targetURL=',targetURL);

            const res = await axios.get(targetURL,{headers:{'Content-Security-Policy': 'upgrade-insecure-requests'}});

            console.log('[SWR] res=',res.data);
            resultInfo = {resultCode:(res.status===200?0:res.resultCode),message:'',data:res.data};
          } catch(err) {
            console.log('err.response=',err.response);
            if(err.response !== undefined) {
              if(err.response.status !== 200) {
                resultInfo = {resultCode:err.response.status,message:`서버로 부터 데이터를 받아올 수 없습니다.(오류코드=${err.response.status})`,data:null};
              }
            }
          }

          // 유저 지갑정보 조회
          let isUse = false;
          let walletAddress = "";
          try {
            const targetURL = `${settings.GameServerAdminHostURL[serverType]}/Blockchain/Infos/WalletByUser/k-stadium/${targetUserID}`;
            const res = await axios.get(targetURL,{headers:{'Content-Security-Policy': 'upgrade-insecure-requests'}});

            console.log('[SWR] res=',res.data);
            resultInfo.data.userInfo = {...resultInfo.data.userInfo,walletUse:res.data.isUse,walletAddress:res.data.walletInfo.walletAddress};

          } catch(err) {
            resultInfo.data.userInfo = {...resultInfo.data.userInfo,walletUse:isUse,walletAddress};
          }

          if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
            return { ...curData, userList: [], userActLogList: [], userPayLogList: [], blackList: [] };
          } else {
            return { ...curData, resultInfo: resultInfo };
          }
        },
        { revalidate: false }
      );

      return { resultCode: resultInfo.resultCode, message: resultInfo.message, data: resultInfo.data };
    },

    requestUserDragonInfo: async (targetUserID) => {
      let resultInfo = null;
      const result = await remoteMutate(
          UserStoreKey,
        async (curData) => {
          try {
            const targetURL = `${settings.GameServerAdminHostURL[serverType]}/User/Dragons/ByUser/${targetUserID}`;

            console.log('[SWR] targetURL=',targetURL);

            const res = await axios.get(targetURL,{headers:{'Content-Security-Policy': 'upgrade-insecure-requests'}});

            console.log('[SWR] res=',res.data);
            resultInfo = {resultCode:(res.status===200?0:res.resultCode),message:'',data:res.data};
          } catch(err) {
            console.log('err.response=',err.response);
            if(err.response !== undefined) {
              if(err.response.status !== 200) {
                resultInfo = {resultCode:err.response.status,message:`서버로 부터 데이터를 받아올 수 없습니다.(오류코드=${err.response.status})`,data:null};
              }
            }
          }

          if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
            return { ...curData, userList: [], userActLogList: [], userPayLogList: [], blackList: [] };
          } else {
            return { ...curData, resultInfo: resultInfo };
          }
        },
        { revalidate: false }
      );

      return { resultCode: resultInfo.resultCode, message: resultInfo.message, data: resultInfo.data };
    },

    requestUserGearInfo: async (targetUserID) => {
      let resultInfo = null;
      const result = await remoteMutate(
          UserStoreKey,
        async (curData) => {
          try {
            const targetURL = `${settings.GameServerAdminHostURL[serverType]}/User/Gears/ByUser/${targetUserID}`;

            console.log('[SWR] targetURL=',targetURL);

            const res = await axios.get(targetURL,{headers:{'Content-Security-Policy': 'upgrade-insecure-requests'}});

            console.log('[SWR] res=',res.data);
            resultInfo = {resultCode:(res.status===200?0:res.resultCode),message:'',data:res.data};
          } catch(err) {
            console.log('err.response=',err.response);
            if(err.response !== undefined) {
              if(err.response.status !== 200) {
                resultInfo = {resultCode:err.response.status,message:`서버로 부터 데이터를 받아올 수 없습니다.(오류코드=${err.response.status})`,data:null};
              }
            }
          }

          if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
            return { ...curData, userList: [], userActLogList: [], userPayLogList: [], blackList: [] };
          } else {
            return { ...curData, resultInfo: resultInfo };
          }
        },
        { revalidate: false }
      );

      return { resultCode: resultInfo.resultCode, message: resultInfo.message, data: resultInfo.data };
    },

    requestUserInventoryInfo: async (targetUserID,pageNo) => {
      let resultInfo = null;
      const result = await remoteMutate(
          UserStoreKey,
        async (curData) => {
          try {
            const targetURL = `${settings.GameServerAdminHostURL[serverType]}/user/Items/ByUser/${targetUserID}?pageNo=${pageNo}`;

            console.log('[SWR] targetURL=',targetURL);

            const res = await axios.get(targetURL,{headers:{'Content-Security-Policy': 'upgrade-insecure-requests'}});

            console.log('[SWR] res=',res.data);
            resultInfo = {resultCode:(res.status===200?0:res.resultCode),message:'',data:res.data};
          } catch(err) {
            console.log('err.response=',err.response);
            if(err.response !== undefined) {
              if(err.response.status !== 200) {
                resultInfo = {resultCode:err.response.status,message:`서버로 부터 데이터를 받아올 수 없습니다.(오류코드=${err.response.status})`,data:null};
              }
            }
          }

          if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
            return { ...curData, userList: [], userActLogList: [], userPayLogList: [], blackList: [] };
          } else {
            return { ...curData, resultInfo: resultInfo };
          }
        },
        { revalidate: false }
      );

      return { resultCode: resultInfo.resultCode, message: resultInfo.message, data: resultInfo.data };
    },

    requestUserQuestInfo: async (targetUserID) => {
      let resultInfo = null;
      const result = await remoteMutate(
          UserStoreKey,
        async (curData) => {
          try {
            const targetURL = `${settings.GameServerAdminHostURL[serverType]}/user/Quests/ByUser/${targetUserID}`;

            console.log('[SWR] targetURL=',targetURL);

            const res = await axios.get(targetURL,{headers:{'Content-Security-Policy': 'upgrade-insecure-requests'}});

            console.log('[SWR] res=',res.data);
            resultInfo = {resultCode:(res.status===200?0:res.resultCode),message:'',data:res.data};
          } catch(err) {
            console.log('err.response=',err.response);
            if(err.response !== undefined) {
              if(err.response.status !== 200) {
                resultInfo = {resultCode:err.response.status,message:`서버로 부터 데이터를 받아올 수 없습니다.(오류코드=${err.response.status})`,data:null};
              }
            }
          }

          if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
            return { ...curData, userList: [], userActLogList: [], userPayLogList: [], blackList: [] };
          } else {
            return { ...curData, resultInfo: resultInfo };
          }
        },
        { revalidate: false }
      );

      return { resultCode: resultInfo.resultCode, message: resultInfo.message, data: resultInfo.data };
    },

    requestUserInboxInfo: async (targetUserID) => {
      let resultInfo = null;
      const result = await remoteMutate(
          UserStoreKey,
        async (curData) => {
          try {
            const targetURL = `${settings.GameServerAdminHostURL[serverType]}/User/Messages/ByUser/${targetUserID}?pageNo=0`;

            console.log('[SWR] targetURL=',targetURL);

            const res = await axios.get(targetURL,{headers:{'Content-Security-Policy': 'upgrade-insecure-requests'}});

            console.log('[SWR] res=',res.data);
            resultInfo = {resultCode:(res.status===200?0:res.resultCode),message:'',data:res.data};
          } catch(err) {
            console.log('err.response=',err.response);
            if(err.response !== undefined) {
              if(err.response.status !== 200) {
                resultInfo = {resultCode:err.response.status,message:`서버로 부터 데이터를 받아올 수 없습니다.(오류코드=${err.response.status})`,data:null};
              }
            }
          }

          if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
            return { ...curData, userList: [], userActLogList: [], userPayLogList: [], blackList: [] };
          } else {
            return { ...curData, resultInfo: resultInfo };
          }
        },
        { revalidate: false }
      );

      return { resultCode: resultInfo.resultCode, message: resultInfo.message, data: resultInfo.data };
    },

    requestUserFriendInfo: async (targetUserID,infoType) => {
      let resultInfo = null;
      const result = await remoteMutate(
          UserStoreKey,
        async (curData) => {
          try {
            let targetURL = `${settings.GameServerAdminHostURL[serverType]}/User/Friends/ByUser/${targetUserID}`;
            if(infoType === 1) {
              targetURL = `${settings.GameServerAdminHostURL[serverType]}/User/Friends/Invite/${targetUserID}`;
            } else if(infoType === 2) {
              targetURL = `${settings.GameServerAdminHostURL[serverType]}/User/Friends/Invited/${targetUserID}`;
            }

            console.log('[SWR] targetURL=',targetURL);

            const res = await axios.get(targetURL,{headers:{'Content-Security-Policy': 'upgrade-insecure-requests'}});

            console.log('[SWR] res=',res.data);
            resultInfo = {resultCode:(res.status===200?0:res.resultCode),message:'',data:res.data};
          } catch(err) {
            console.log('err.response=',err.response);
            if(err.response !== undefined) {
              if(err.response.status !== 200 && err.response.data !== 2001) {
                resultInfo = {resultCode:err.response.status,message:`서버로 부터 데이터를 받아올 수 없습니다.(오류코드=${err.response.status})`,data:[]};
              } else {
                resultInfo = {resultCode:ResultCode.SUCCESS,message:`데이터가 없습니다.`,data:[]};
              }
            }
          }

          if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
            return { ...curData, userList: [], userActLogList: [], userPayLogList: [], blackList: [] };
          } else {
            return { ...curData, resultInfo: resultInfo };
          }
        },
        { revalidate: false }
      );

      return { resultCode: resultInfo.resultCode, message: resultInfo.message, data: resultInfo.data };
    },

    requestUserActLogList: async ({ queryFilterInfo, pageNo, queryNum }) => {
  
        const result = await remoteMutate(
            UserStoreKey,
          async (curData) => {
            const res = await axios.post(`${settings.AdminServerHostURL}/user/query/useractlog`, {queryFilterInfo,pageNo,queryNum}, {
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken, serverType },
            });
            const resultInfo = res.data;
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              return { ...curData, totalCount:0, pageNo: pageNo, userList: [], userActLogList: [], userPayLogList: [], blackList: [], resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);

              return { ...curData, totalCount:resultInfo.data.totalCount, userActLogList: resultInfo.data.list, pageNo: pageNo, resultInfo: resultInfo };
            }
          },
          { revalidate: false }
        );
  
        return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: {totalCount:result.totalCount,list:result.userActLogList} };
      },

      requestUserPayLogList: async ({ queryFilterInfo, pageNo }) => {
  
        const result = await remoteMutate(
            UserStoreKey,
          async (curData) => {
            const res = await axios.post(`${settings.AdminServerHostURL}/user/query/userpaylog`, {queryFilterInfo, pageNo}, {
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken, serverType },
            });
            const resultInfo = res.data;
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              return { ...curData, pageNo: pageNo, userList: [], userActLogList: [], userPayLogList: [], blackList: [], resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);

              return { ...curData, userPayLogList: resultInfo.data, pageNo: pageNo, resultInfo: resultInfo };
            }
          },
          { revalidate: false }
        );
  
        return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: result.userPayLogList };
      },

      requestBlacklist: async ({ queryFilterInfo, pageNo }) => {
  
        const result = await remoteMutate(
            UserStoreKey,
          async (curData) => {
            const res = await axios.get(`${settings.AdminServerHostURL}/user/blacklist/list`, {
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken, serverType,queryFilterInfo: JSON.stringify(queryFilterInfo), pageNo },
            });
            const resultInfo = res.data;
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              return { ...curData, pageNo: pageNo, blackList: [], resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);

              return { ...curData, blackList: resultInfo.data, pageNo: pageNo, resultInfo: resultInfo };
            }
          },
          { revalidate: false }
        );
  
        return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: result.blackList };
      },
      requestAddToBlacklist: async ({userIDList,reason,duration,autoReleaseFlag}) => {

        const reason2 = encodeURIComponent(reason);
        const result = await remoteMutate(
            UserStoreKey,
            async (curData) => {
              const res = await axios.get(`${settings.AdminServerHostURL}/user/blacklist/register`, {headers: { userIDList:JSON.stringify(userIDList), reason:reason2, duration, autoReleaseFlag:(autoReleaseFlag===true?'true':'false'), adminID:authInfo.loginID, authToken:authInfo.authToken,serverType }});
              const resultInfo = res.data;
    
              if(resultInfo !== null && resultInfo !== undefined && resultInfo.resultCode === 0) {
                authInfo.authToken = res.data.newAuthToken;
                setAuthInfo(authInfo);
              }

              return { ...curData, resultInfo:resultInfo };
            },
            { revalidate: false }
          );
    
          return {resultCode:result.resultInfo.resultCode,message:result.resultInfo.message};
      },
      requestReleaseFromBlacklist: async ({userIDList}) => {
  
        const result = await remoteMutate(
          UserStoreKey,
          async (curData) => {
            const res = await axios.get(`${settings.AdminServerHostURL}/user/blacklist/release`, {
              headers: { userIDList: JSON.stringify(userIDList), adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
            });
            const resultInfo = res.data;
  
            if(resultInfo !== null && resultInfo !== undefined && resultInfo.resultCode === 0) {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
            }

            return { ...curData, resultInfo: resultInfo };
          },
          { revalidate: false }
        );
  
        return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message };
      },
  };
};

export default useUser;
