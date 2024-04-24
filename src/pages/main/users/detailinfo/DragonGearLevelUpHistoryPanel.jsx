import React from 'react';

import * as contentStyled from '../../MainContentStyles';

import Table from '../../../../components/Table';

const tableHeaderInfo = ['생성 시각','레벨업 내용','사용재료'];
const tableContentInfo = [
    ['2022-12-03 11:55:32','레벨업:15','50 골드'],
    ['2022-11-03 11:55:32','레벨업:14','40 골드'],
    ['2022-10-03 11:55:32','레벨업:13','30 골드'],
    ['2022-09-03 11:55:32','레벨업:12','20 골드'],
];

const tableHSpaceTable = '1fr 0.7fr 1.5fr';

const DragonLevelUpHistoryPanel = (props) => {
    return (
        <contentStyled.ContentBody>
            <br />
            <Table marginLeft='3vw' marginRight='3vw' colFormat={tableHSpaceTable}
                        headerInfo={tableHeaderInfo}
                        bodyInfo={tableContentInfo}
                        noPageControl={true}
                        />
        </contentStyled.ContentBody>
    )
};

export default DragonLevelUpHistoryPanel;