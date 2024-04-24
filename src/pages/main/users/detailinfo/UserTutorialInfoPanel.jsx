import React, {useState,useCallback,useEffect,useRef} from 'react';
import styled from 'styled-components';

import * as mainStyled from '../../MainPageStyles';
import * as contentStyled from '../../MainContentStyles';
import * as pageStyled from '../UserDetailInfoPageStyles';

import Button1 from '../../../../components/Button1';
import InputField1 from '../../../../components/InputField1';
import Table from '../../../../components/Table';
import DropBox from '../../../../components/DropBox';


const tableHeaderInfo = ['튜토리얼 단계','단계명','클리어 여부','보상내역','수령여부'];
const tableContentInfo = [
    ['1-1','모험모드 진입하기','O', '30 골드,1 젬','수령'],
    ['1-2','모험모드 진입하기','O', '30 골드,1 젬','수령'],
    ['2-1','모험모드 진입하기','O', '30 골드,1 젬','미수령'],
    ['2-2','모험모드 진입하기','X', '30 골드,1 젬','미수령']
];

const tableHSpaceTable = '1fr 1.4fr 0.7fr 2fr 1fr';

const UserTutorialInfoPanel = (props) => {
    return (
        <contentStyled.ContentBody>
            <br />
            <Table responsive='1.6' marginLeft='3vw' marginRight='3vw' colFormat={tableHSpaceTable}
                        headerInfo={tableHeaderInfo}
                        bodyInfo={tableContentInfo}
                        noPageControl={true}
                        />
        </contentStyled.ContentBody>
    )
};

export default UserTutorialInfoPanel;