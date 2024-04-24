import useSWR, { useSWRConfig } from 'swr';

export const SystemEventKey = 'local:/common';
export const SystemEventInitData = { __count: 0, startLoading:false, globalPopupShown:false, serverType:'local', backgroundClicked:false, resetClockTimer:false, testMode: false };

const useCommonStorageManager = () => {
  const { data: eventInfo, mutate: localMutate } = useSWR(SystemEventKey);
  const { mutate: remoteMutate } = useSWRConfig();

  const setEventInfo = (value) => {
    const newEventInfo = { ...value };
    newEventInfo.__count++;
    localMutate(newEventInfo, { revalidate: false });
  };

  const startLoading = eventInfo.startLoading;
  const globalPopupShown = eventInfo.globalPopupShown;

  const setStartLoading = (value) => {
    eventInfo.startLoading = value;
    setEventInfo(eventInfo);
  };

  const setGlobalPopupShown = (value) => {
    eventInfo.globalPopupShown = value;
    setEventInfo(eventInfo);
  };

  const backgroundClicked = eventInfo.backgroundClicked;

  const setBackgroundClicked = (value) => {
    eventInfo.backgroundClicked = value;
    setEventInfo(eventInfo);
  };

  const resetClockTimer = eventInfo.resetClockTimer;
  const setResetClockTimer = (value) => {
    eventInfo.resetClockTimer = value;
    setEventInfo(eventInfo);
  };

  const serverType = eventInfo.serverType;

  const setServerType = (value) => {
    eventInfo.serverType = value;
    setEventInfo(eventInfo);
  };

  return {
    eventInfo,
    setEventInfo,
    startLoading,
    setStartLoading,
    globalPopupShown,
    setGlobalPopupShown,
    backgroundClicked,
    setBackgroundClicked,
    serverType,
    setServerType,
    resetClockTimer,
    setResetClockTimer
  };
};

export default useCommonStorageManager;
