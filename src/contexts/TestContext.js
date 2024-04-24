import React, {createContext, useState} from 'react';

export const TestContextStore = createContext();

const TestContext = (props) => {
    const [updateToken, setUpdateToken] = useState("");
    const [queryFilterInfo, setQueryFilterInfo] = useState({});

    const EnvironmentInfo = {
        updateToken,
        setUpdateToken,
        queryFilterInfo,
        setQueryFilterInfo
    };

    return (<TestContextStore.Provider value={EnvironmentInfo}>{props.children}</TestContextStore.Provider>);
};

export default TestContext;