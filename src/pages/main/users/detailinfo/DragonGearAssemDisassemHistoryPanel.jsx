import React from 'react';

import * as contentStyled from '../../MainContentStyles';

import Table from '../../../../components/Table';

const tableHeaderInfo = ['생성 시각','강화/분해','결과', '재료'];
const tableContentInfo = [
    ['2022-12-03 11:55:32','강화','칼리고(A,Lv.10,GUID:234785384577)','400 골드, 엘리멘털스톤x4개'],
    ['2022-11-03 11:55:32','분해','20 젬, 강화석x2개','칼리고(A,Lv.10,GUID:234785384577)'],
    ['2022-10-03 11:55:32','강화','칼리고(A,Lv.10,GUID:234785384577)','300 골드, 엘리멘털스톤x2개'],
    ['2022-09-03 11:55:32','분해','20 젬, 강화석x2개','칼리고(A,Lv.10,GUID:234785384577)'],
];

const tableHSpaceTable = '1fr 0.7fr 1.5fr 1.5fr';

const DragonAssemDisassemHistoryPanel = (props) => {

    const IsDragon = (props.type==='dragon'?true:false);
    
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

export default DragonAssemDisassemHistoryPanel;