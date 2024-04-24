import { AccountStoreKey, AccountInitData } from './useAccountDataManager';
import { NotificationStoreKey, NotificationInitData } from './useNotificationDataManager';
import { AuthStoreKey, AuthInitData } from './useAuthDataManager';
import { SystemEventKey, SystemEventInitData } from './useCommonStorageManager';
import { RewardEventStoreKey, RewardEventInitData } from './useRewardEventDataManager';
import { UserStoreKey, UserInitData } from './useUserDataManager';
import { SettingStoreKey, SettingInitData } from './useSettingDataManager';
import { MessageStoreKey, MessageInitData } from './useMessageDataManager';
import { AdminLogStoreKey, AdminLogInitData } from './useLogDataManager';
import { NFTStoreKey, NFTInitData } from './useNFTDataManager';
import { ToolStoreKey, ToolInitData } from './useToolDataManager';
import { BlockchainStoreKey, BlockchainInitData } from './useBlockchainDataManager';
import { StatisticsStoreKey, StatisticsInitData } from './useStatisticsDataManager';

const InitialStoreData = {
  'local:/root': {
    user: { id: 0, name: '박윤석', statusMsg: '', friendList: [{ id: 1, name: '최준', statusMsg: '' }] },
    profile: { id: 0, name: '박윤석', statusMsg: '', friendList: [{ id: 1, name: '최준', statusMsg: '' }] },
    isProfileShown: false,
    count: 0,
  },
  'local:/common': { loginFailureMsg: '' },
  [AuthStoreKey]: AuthInitData,
  [SystemEventKey]: SystemEventInitData,
  [AccountStoreKey]: AccountInitData,
  [NotificationStoreKey]: NotificationInitData,
  [RewardEventStoreKey]: RewardEventInitData,
  [UserStoreKey]: UserInitData,
  [SettingStoreKey]: SettingInitData,
  [MessageStoreKey]: MessageInitData,
  [AdminLogStoreKey]: AdminLogInitData,
  [NFTStoreKey]: NFTInitData,
  [ToolStoreKey]: ToolInitData,
  [BlockchainStoreKey]: BlockchainInitData,
  [StatisticsStoreKey]: StatisticsInitData
};

export default InitialStoreData;
