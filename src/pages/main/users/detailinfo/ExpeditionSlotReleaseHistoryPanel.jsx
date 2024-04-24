import React from 'react';

import * as contentStyled from '../../MainContentStyles';

import Table from '../../../../components/Table';

const tableHeaderInfo = ['생성 시각','해금 내역','사용 재화'];
const tableContentInfo = [
    ['2022-12-03 11:55:32','지역1:슬롯2 오픈','200 젬'],
    ['2022-11-03 11:55:32','지역2:슬롯1 오픈','100 젬'],
    ['2022-10-03 11:55:32','지역4:슬롯1 오픈','100 젬'],
    ['2022-09-03 11:55:32','지역1:슬롯1 오픈','100 젬'],
];

const tableHSpaceTable = '1fr 0.7fr 1.5fr';

const ExpeditionSlotReleaseHistoryPanel = (props) => {
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

export default ExpeditionSlotReleaseHistoryPanel;