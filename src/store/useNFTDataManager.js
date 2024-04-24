import useSWR, { useSWRConfig } from 'swr';
import ResultCode from '../common/constants';
import useAuth from './useAuthDataManager';
import axios from 'axios';
import * as constants from '../common/constants';
import settings from '../common/settings';
import useCommon from './useCommonStorageManager';

export const NFTStoreKey = 'local:/nft';
export const NFTInitData = { __count: 0, totalCount:0, reqGroupID:-1, contractAddress:'', metadataBaseURI:'', packageIDTable:[], mintingInfoList: [], walletList: [], pageNo:1, actLogList: [], resultInfo: null };

const useNFT = () => {
  const { authInfo,setAuthInfo } = useAuth();
  const { data: nftInfo, mutate: localMutate } = useSWR(NFTStoreKey);
  const { mutate: remoteMutate } = useSWRConfig();

  const {serverType} = useCommon();

  const setNFTInfo = (value) => {

    const newNFTInfo = { ...value };
    newNFTInfo.__count++;
    localMutate(newNFTInfo, { revalidate: false });
  };

  const totalPageNum = (recNumPerPage) => {
    return (nftInfo.totalCount <= 0 ? 1: Math.floor(1+(nftInfo.totalCount/recNumPerPage)));
  };

  const initMinting = () => {

    // nftInfo.packageIDTable = [];
    // setNFTInfo(nftInfo);
  };

  return {
    nftInfo,
    totalPageNum,
    setNFTInfo,
    initMinting,
    requestGenerateNFTAttributes: async ({ finalReq,type,groupID,packageType,packageIDTable,mintingCount,attrIDQtyPairList,totalAttrIDQtyPairList,restartMintingCount,desc,totalTokenNum }) => {

      const result = await remoteMutate(
        NFTStoreKey,
        async (curData) => {
          try {
            const bodyInfo = {finalReq,type,groupID,packageType,packageIDTable,mintingCount,attrIDQtyPairList,totalAttrIDQtyPairList,restartMintingCount,desc,totalTokenNum};

            console.log('bodyInfo=',bodyInfo);
            const res = await axios.post(`${settings.AdminServerHostURL}/nft/nftattrs/generate`, bodyInfo, {
              timeout: 1800000,
              headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
            });
            const resultInfo = res.data;
  
            console.log("resultInfo=",resultInfo);
            
            if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
              if(resultInfo !== null && resultInfo !== undefined) {
                console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
              }
              return { ...curData, reqGroupID:resultInfo.data.reqGroupID, resultInfo };
            } else {
              authInfo.authToken = res.data.newAuthToken;
              setAuthInfo(authInfo);
              
              if(resultInfo.data.packageIDTable.length > 0) {
                return { ...curData, packageIDTable:resultInfo.data.packageIDTable, resultInfo };
              } else {
                return { ...curData, resultInfo };
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

      //console.log('packageIDTable=',result.packageIDTable,',resultInfo.data.packageIDTable=',result.resultInfo.data.packageIDTable);

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data:result.resultInfo.data };
    },
    requestCopyMintingInfoToServer: async (logID,groupID,targetServerType) => {

      const result = await remoteMutate(
        NFTStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/nft/mintinfo/copy`, { logID,groupID,targetServerType }, {
              timeout: 1800000,
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
              
              return { ...curData, resultInfo };
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
    requestDeleteMintingLogAndData: async (logID) => {

      const result = await remoteMutate(
        NFTStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/nft/actlog/delete`, { logID }, {
              timeout: 1800000,
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
              
              return { ...curData, resultInfo };
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
    requestDeleteNFTAttributes: async ({ groupID,mintingCount }) => {

      const result = await remoteMutate(
        NFTStoreKey,
        async (curData) => {
          try {
            const res = await axios.post(`${settings.AdminServerHostURL}/nft/nftattrs/delete`, { groupID,mintingCount }, {
              timeout: 1800000,
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
              
              return { ...curData, resultInfo };
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

      //console.log('packageIDTable=',result.packageIDTable,',resultInfo.data.packageIDTable=',result.resultInfo.data.packageIDTable);

      return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data:result.resultInfo.data };
    },
    requestSaveMetadataToStorage: async (bodyData) => {

        const { logID, groupID, desc, mintingCount } = bodyData;

        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/nft/metadata/upload`, {logID, groupID, desc, mintingCount}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
                }
                return { ...curData, totalCount:resultInfo.data.totalCount, resultInfo };
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
      requestMintedNFTMetadataList: async ({itemType,partType,startTime,endTime}) => {
        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/nft/metadata/attrlist`, {itemType,partType,startTime,endTime}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
                }
                return { ...curData, totalCount:resultInfo.data.totalCount, resultInfo };
              } else {
                authInfo.authToken = res.data.newAuthToken;
                setAuthInfo(authInfo);
                
                return { ...curData, metadataBaseURI:resultInfo.data.metadataBaseURI, totalCount:resultInfo.data.totalCount, resultInfo: resultInfo };
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

      requestUpdateMetadata: async (metadataInfoList) => {

        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/nft/metadata/update`, {metadataInfoList}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
                }
                return { ...curData, totalCount:resultInfo.data.totalCount, resultInfo };
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

      requestMintNFT: async ({ logID, finalReq, reqGroupID, packageType, packageIDTable, desc, mintingCount, mintingInfoList, tokenGenData, totalMintingNum }) => {

        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/nft/mintnft`, {logID, finalReq, reqGroupID, packageType, packageIDTable, desc, mintingCount, mintingInfoList, tokenGenData, totalMintingNum}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
                }
                return { ...curData, totalCount:resultInfo.data.totalCount, resultInfo };
              } else {
                authInfo.authToken = res.data.newAuthToken;
                setAuthInfo(authInfo);
                
                return { ...curData, resultInfo: resultInfo };
              }
            } catch(err) {
                if(err.response === undefined || err.response.status !== 200) {
                    console.log('err=',err);
                }
  
                return { ...curData, resultInfo:{resultCode:constants.ResultCode.SERVER_INTERNAL_ERROR,message:`서버 내부 오류가 발생하였습니다.(오류코드:${err.response===undefined?999:err.response.status})`,data:null} };
            }
          },
          { revalidate: false }
        );
  
        return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, data:result.resultInfo.data };
      },

      requestCheckMintingInfo: async ({groupID, mintingCount, quantity}) => {

        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/nft/checknft/mint`, {groupID, mintingCount, quantity}, {
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

      requestCheckTransferInfo: async ({groupID, quantity}) => {

        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/nft/checknft/transfer`, {groupID:groupID, mintingCount:-1, quantity:quantity}, {
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

      requestQueryMintingLogList: async ({ activityType,pageNo,queryNum }) => {
  
        const adminServerURL = `${settings.AdminServerHostURL}/nft/log/actlist`;
        console.log(`[POST] requestQueryMintingLogList() adminServerURL:${adminServerURL}`);

        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(adminServerURL, {activityType,pageNo,queryNum}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[LOG] resultInfo.resultCode=",resultInfo.resultCode);
                }
                return { ...curData, pageNo: pageNo, actLogList: [], resultInfo };
              } else {
                authInfo.authToken = res.data.newAuthToken;
                setAuthInfo(authInfo);
                
                return { ...curData, metadataBaseURI:resultInfo.data.metadataBaseURI, totalCount:resultInfo.data.actlog.totalCount, actLogList: resultInfo.data.actlog.list, pageNo: pageNo, resultInfo: resultInfo };
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
  
        return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: {totalCount:result.totalCount,list:result.actLogList} };
      },
      requestOwnerOfNFT: async ({address, tokenID}) => {
        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/nft/isowner`, {address,tokenID}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("requestOwnerOfNFT.resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
                }
                return { ...curData, resultInfo };
              } else {
                authInfo.authToken = res.data.newAuthToken;
                setAuthInfo(authInfo);
                
                return { ...curData, resultInfo };
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
      requestNFTList: async ({ address,onlyTokenInfo,offset,queryNum }) => {

        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/nft/nftlist`, {address,onlyTokenInfo,offset,queryNum}, {
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
                
                return { ...curData, resultInfo };
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

      requestNFTCurPropInfo:async (tokenID) => {

        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/nft/curprop`, {tokenID}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("requestNFTCurPropInfo.resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[NFT] resultInfo.resultCode=",resultInfo.resultCode);
                }
                return { ...curData, resultInfo };
              } else {
                authInfo.authToken = res.data.newAuthToken;
                setAuthInfo(authInfo);
                
                return { ...curData, resultInfo };
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
      requestNFTListForGroupMinting: async ({ groupID,allStates }) => {

        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/nft/group/nftlist`, {groupID,allStates}, {
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
                
                return { ...curData, resultInfo };
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
      downloadMetadata: async (metadataURL) => {

        let resultInfo = {resultCode:ResultCode.SUCCESS,message:'',data:null};
        try {
          const result = await remoteMutate(
            NFTStoreKey,
            async (curData) => {
              const res = await axios.get(metadataURL);
              return res.data;
            },
            { revalidate: false }
          );

          resultInfo.data = result;
    
        } catch(err) {
          console.log(err);
          resultInfo.resultCode = ResultCode.AWS_S3_DOWNLOADOBJ_FAIL;
        }

        return resultInfo;
      },
      requestTransferNFT: async ({finalReq,packageIDTable,sourceType,groupID,sourceAddress,targetAddress,comment,tokenIDList,itemInfoList,marketTrigger,totalTransferNum}) => {

        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/nft/transfer`, {finalReq,packageIDTable,sourceType,groupID,sourceAddress,targetAddress,comment,tokenIDList,itemInfoList,marketTrigger,totalTransferNum}, {
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
      requestQueryTransferLogList: async ({ pageNo }) => {
  
        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/nft/log/transfer/list`, {pageNo}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[LOG] resultInfo.resultCode=",resultInfo.resultCode);
                }
                return { ...curData, pageNo: pageNo, actLogList: [], resultInfo };
              } else {
                authInfo.authToken = res.data.newAuthToken;
                setAuthInfo(authInfo);
                
                return { ...curData, contractAddress:resultInfo.data.contractAddress, totalCount:resultInfo.data.translog.totalCount, actLogList: resultInfo.data.translog.list, pageNo: pageNo, resultInfo: resultInfo };
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
  
        return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: {totalCount:result.totalCount,contractAddress:result.contractAddress,list:result.actLogList} };
      },
      requestQueryWalletInfoList: async (pageNo) => {

        const adminServerURL = `${settings.AdminServerHostURL}/wallet/list`;
        console.log(`[POST] requestQueryWalletInfoList() adminServerURL:${adminServerURL}`);

        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(adminServerURL, {pageNo}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              //console.log("resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[LOG] resultInfo.resultCode=",resultInfo.resultCode);
                }
                return { ...curData, pageNo: pageNo, actLogList: [], resultInfo };
              } else {
                authInfo.authToken = res.data.newAuthToken;
                setAuthInfo(authInfo);
                
                return { ...curData, totalCount:resultInfo.data.totalCount, walletList: resultInfo.data.list, pageNo: pageNo, resultInfo: resultInfo };
              }
            } catch(err) {
              console.log('err=',err);
                if(err.response.status !== 200) {
                    console.log('err=',err);
                }
  
                return { ...curData, resultInfo:{resultCode:constants.ResultCode.SERVER_INTERNAL_ERROR,message:`서버 내부 오류가 발생하였습니다.(오류코드:${err.response.status})`,data:null} };
            }
          },
          { revalidate: false }
        );
  
        return { resultCode: result.resultInfo.resultCode, message: result.resultInfo.message, pageNo: result.pageNo, data: {totalCount:result.totalCount,list:result.walletList} };
      },

      requestAddWallet: async ({walletName,walletAddress,walletKey}) => {
        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/wallet/new`, {walletAddress,walletName,walletKey}, {
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

      requestUpdateWalletInfo: async ({walletAddress,walletName,walletKey}) => {
        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/wallet/update`, {walletAddress,walletName,walletKey}, {
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

      requestDeleteWallet: async ({walletAddress}) => {
        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/wallet/delete`, {walletAddress}, {
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

      requestTokenTransfer: async ({initReq,senderWalletAddress,tokenInfo,targetAddressList}) => {
        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/wallet/token/transfer`, {initReq,senderWalletAddress,tokenInfo,targetAddressList}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[TOKEN] resultInfo.resultCode=",resultInfo.resultCode);
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

      requestQueryMarketSaleContractInfo: async ({contractType,balanceInfo,pageNo}) => {
        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/wallet/marketcontract/info`, {contractType,balanceInfo,pageNo}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[TOKEN] resultInfo.resultCode=",resultInfo.resultCode);
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

      requestTransferMarketBalanceToAddress: async ({ownerAddress,contractType,itemType,tokenType,amount,targetAddress}) => {
        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/wallet/marketcontract/transfer`, {ownerAddress,contractType,itemType,tokenType,amount,targetAddress}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[TOKEN] resultInfo.resultCode=",resultInfo.resultCode);
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

      requestQueryMarketContractSettingInfo: async ({contractType}) => {
        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/wallet/marketcontract/settinginfo`, {contractType}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[TOKEN] resultInfo.resultCode=",resultInfo.resultCode);
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

      requestUpdateMarketContractSettingInfo: async ({contractType,contractSettingInfo}) => {
        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/wallet/marketcontract/settinginfo/update`, {contractType,contractSettingInfo}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[TOKEN] resultInfo.resultCode=",resultInfo.resultCode);
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
      requestWalletBalanceInfo: async (address) => {
        const result = await remoteMutate(
          NFTStoreKey,
          async (curData) => {
            try {
              const res = await axios.post(`${settings.AdminServerHostURL}/wallet/balanceinfo`, {address}, {
                headers: { adminID: authInfo.loginID, authToken: authInfo.authToken,serverType },
              });
              const resultInfo = res.data;
    
              console.log("resultInfo=",resultInfo);
              
              if (resultInfo === null || resultInfo === undefined || resultInfo.resultCode !== 0) {
                if(resultInfo !== null && resultInfo !== undefined) {
                  console.log("[TOKEN] resultInfo.resultCode=",resultInfo.resultCode);
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
      }
  };
};

export default useNFT;
