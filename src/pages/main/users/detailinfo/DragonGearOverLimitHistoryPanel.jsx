import React from 'react';

import * as contentStyled from '../../MainContentStyles';

import Table from '../../../../components/Table';

const tableHeaderInfo = ['생성 시각','한계돌파 내용','사용재료'];
const tableContentInfo = [
    ['2022-12-03 11:55:32','레벨 60 해금','500 골드, 엘리멘털스톤x4개'],
    ['2022-11-03 11:55:32','레벨 50 해금','400 골드, 엘리멘털스톤x3개'],
    ['2022-10-03 11:55:32','레벨 40 해금','300 골드, 엘리멘털스톤x2개'],
    ['2022-09-03 11:55:32','레벨 30 해금','200 골드, 엘리멘털스톤x1개'],
];

const tableHSpaceTable = '1fr 0.7fr 1.5fr';

const DragonOverLimitHistoryPanel = (props) => {
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

export default DragonOverLimitHistoryPanel;