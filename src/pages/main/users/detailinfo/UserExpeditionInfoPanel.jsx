import React, {useState,useCallback,useEffect,useRef} from 'react';
import styled from 'styled-components';

import * as mainStyled from '../../MainPageStyles';
import * as contentStyled from '../../MainContentStyles';
import * as pageStyled from '../UserDetailInfoPageStyles';

import Button1 from '../../../../components/Button1';
import RadioGroup from '../../../../components/RadioGroup';
import Table from '../../../../components/Table';


import ExpeditionBasicInfoPanel from './ExpeditionBasicInfoPanel';
import ExpeditionTimeItemUseHistoryPanel from './ExpeditionTimeItemUseHistoryPanel';
import ExpeditionSlotReleaseHistoryPanel from './ExpeditionSlotReleaseHistoryPanel';

const StExpeditionInfoFooterPanel = styled.div`
    margin-top: 1vw;

    display: flex;
    justify-content: flex-end;

    #button {
        margin: 0 0.6vw;
    }
`;

const UserExpeditionInfoPanel = (props) => {

    const [subMenuIndex, setSubMenuIndex] = useState(0);

    const [expeditionInfoList, setExpeditionInfoList] = useState([
        {
            name:'오팔숲', dragonNumOnExpedition:1,unlockedSlotNum:2,expditionStartTime:'2022-12-13 12:17:54',expeditionEndTime:'2022-12-13 16:17:54',
            dragonOnSlot1:'칼리고(SSR,Lv.13,9870)',dragonOnSlot2:'칼리고(SSR,Lv.13,9870)',dragonOnSlot3:null,dragonOnSlot4:null
        },
        {
            name:'오팔숲', dragonNumOnExpedition:2,unlockedSlotNum:3,expditionStartTime:'2022-12-13 12:17:54',expeditionEndTime:'2022-12-13 16:17:54',
            dragonOnSlot1:'칼리고(SSR,Lv.13,9870)',dragonOnSlot2:null,dragonOnSlot3:null,dragonOnSlot4:'칼리고(SSR,Lv.13,9870)'
        }
    ]);

    const onSubMenuButtonClick = (idx) => {
        setSubMenuIndex(idx);
    };

    return (
        <>
            <StExpeditionInfoFooterPanel>
                <RadioGroup initButtonIndex={0} responsive='1.4' interMargin='0.4vw' nameTable={['탐험 정보','시간감소 아이템 사용이력','슬롯 해금이력']} buttonClicked={(idx)=>onSubMenuButtonClick(idx)} />
            </StExpeditionInfoFooterPanel>
            <br />
            { subMenuIndex===0 && <ExpeditionBasicInfoPanel expeditionInfoList={expeditionInfoList} />}
            { subMenuIndex===1 && <ExpeditionTimeItemUseHistoryPanel />}
            { subMenuIndex===2 && <ExpeditionSlotReleaseHistoryPanel />}
        </>
    )
};

export default UserExpeditionInfoPanel;