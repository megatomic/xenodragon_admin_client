import React from 'react';

import * as contentStyled from '../../MainContentStyles';

import Table from '../../../../components/Table';

const tableHeaderInfo = ['생성 시각','최종 효과','사용 아이템'];
const tableContentInfo = [
    ['2022-12-03 11:55:32','2시간 감소','30분 x 4개'],
    ['2022-11-03 11:55:32','1시간 감소','1시간 x 1개'],
    ['2022-10-03 11:55:32','30분 감소','30분 x 1개'],
    ['2022-09-03 11:55:32','4시간 감소','1시간 x 4개'],
];

const tableHSpaceTable = '1fr 0.7fr 1.5fr';

const ExpeditionTimeItemUseHistoryPanel = (props) => {
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

export default ExpeditionTimeItemUseHistoryPanel;