import React, {useState,useCallback,useEffect,useRef} from 'react';
import styled from 'styled-components';

import * as mainStyled from '../../MainPageStyles';
import * as contentStyled from '../../MainContentStyles';
import * as pageStyled from '../UserDetailInfoPageStyles';

import Button1 from '../../../../components/Button1';
import InputField1 from '../../../../components/InputField1';
import CheckBox from '../../../../components/CheckBox';
import DropBox from '../../../../components/DropBox';
import RadioGroup from '../../../../components/RadioGroup';

import useCommon from '../../../../store/useCommonStorageManager';
import useUser from '../../../../store/useUserDataManager';

import DragonListInfoPanel from './DragonListInfoPanel';
import DragonGearLevelUpHistoryPanel from './DragonGearLevelUpHistoryPanel';
import DragonGearOverLimitHistoryPanel from './DragonGearOverLimitHistoryPanel';
import DragonGearAssemDisassemHistoryPanel from './DragonGearAssemDisassemHistoryPanel';

const StDragonInfoFooterPanel = styled.div`
    margin-top: 1vw;

    display: flex;
    justify-content: flex-end;

    #button {
        margin: 0 0.6vw;
    }
`;

const filterDragonGradeList = [
    {id:1, name:'전체'},
    {id:2, name:'SSR'},
    {id:3, name:'SR'},
    {id:4, name:'R'},
    {id:5, name:'A'},
    {id:6, name:'B'},
    {id:7, name:'C'}
];

const UserDragonInfoPanel = (props) => {

    const { startLoading, setStartLoading } = useCommon();
    const {requestUserDragonInfo} = useUser();  
    const [userDragonList, setUserDragonList] = useState([]);

    const [titleKeyword, setTitleKeyword] = useState('');
    const [filterGradeType, setFilterGradeType] = useState(0);
    const [subMenuIndex, setSubMenuIndex] = useState(0);

    const [dragonInfoList, setDragonInfoList] = useState([
        {
            name:'Skullbreaker', DUID:'2343489234958235',grade:'SSR',level:13,attrHP:9300,attrAtk:460,attrDef:197,
            teamSlotTableInUse:['T1','T3'],
            spirit:90,exp:[20,300],gearOnHead:'2342348923492342',gearOnFrontLeftLeg:null,gearOnFrontRightLeg:null,gearOnRearLeftLeg:'234234523534435',gearOnRearRightLeg:'23423453453453'
        },
        {
            name:'Skullbreaker2', DUID:'2343489234958235',grade:'SR',level:18,attrHP:12300,attrAtk:720,attrDef:327,
            teamSlotTableInUse:['T2'],
            spirit:100,exp:[189,500],gearOnHead:'2342348923492342',gearOnFrontLeftLeg:'2342348923492342',gearOnFrontRightLeg:'234234523534435',gearOnRearLeftLeg:'234234523534435',gearOnRearRightLeg:null
        },
        {
            name:'Skullbreaker2', DUID:'2343489234958235',grade:'SR',level:18,attrHP:12300,attrAtk:720,attrDef:327,
            teamSlotTableInUse:['T2'],
            spirit:100,exp:[189,500],gearOnHead:'2342348923492342',gearOnFrontLeftLeg:'2342348923492342',gearOnFrontRightLeg:'234234523534435',gearOnRearLeftLeg:'234234523534435',gearOnRearRightLeg:null
        }
    ]);
    const [filterDragonList, setFilterDragonList] = useState(dragonInfoList);

    const onTitleKeywordChanged = (e) => {
        setTitleKeyword(e.target.value.trim());
    };

    const onTitleKeywordKeyPress = (e) => {
        if(e.key === 'Enter') {
            onSearchDragonClick(e);
        }
    };

    const onSearchDragonClick = (e) => {

        makeFilteredDragonList();
    };

    const onDragonGradeItemClick = (item) => {
        setFilterGradeType((type)=>(item.id-1));
    };

    const makeFilteredDragonList = () => {
        
        let dragonList = dragonInfoList;
        
        if(titleKeyword.trim() !== '') {
            dragonList = dragonList.filter(info=> {
                return (info.name.indexOf(titleKeyword) >= 0 || info.DUID.indexOf(titleKeyword) >= 0);
            });
        }

        //console.log('filterGradeType=',filterGradeType);

        dragonList = dragonList.filter(info=>{
            return (info.grade === filterDragonGradeList[filterGradeType].name || filterGradeType === 0);
        });

        setFilterDragonList(dragonList);
    };

    const onSubMenuButtonClick = (idx) => {
        setSubMenuIndex(idx);
    };

    useEffect(()=> {
        makeFilteredDragonList();
    },[filterGradeType]);

    const reloadUserDragonInfo = (userID) => {

        setStartLoading(true);
        setTimeout(async () => {
          const resultInfo = await requestUserDragonInfo(userID);
    
          console.log('dragonInfo=',resultInfo);
    
          setUserDragonList(resultInfo.data);
          // if (resultInfo.resultCode === 0) {
          //   setUserList(makeTableFromUserList(resultInfo.data));
          // } else {
          //   toast.error(resultInfo.message);
          // }
          setStartLoading(false);
        }, 200);
      };
    
    useEffect(()=> {
        reloadUserDragonInfo(props.targetUserID);
    },[]);

    return (
        <>
            <contentStyled.FilterGroup>
                <contentStyled.FilterItem>
                    <span id='name'>검색</span>
                    <span id='input'><InputField1 responsive='1.6' width='12vw' height='2vw' placeholder={'DUID 또는 이름을 입력하세요.'} value={titleKeyword} onChange={(e)=>onTitleKeywordChanged(e)} onKeyPress={(e)=>onTitleKeywordKeyPress(e)}/></span>
                    <span id='search'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onSearchDragonClick(e)}>검색</Button1></span>
                </contentStyled.FilterItem>
                <contentStyled.FilterItem>
                    <span id='name'>등급</span>
                    <span id='dropdown'><DropBox width='10vw' height='2vw' text={filterDragonGradeList[0].name} fontSize='0.6vw' itemList={filterDragonGradeList} menuItemClick={(item)=>onDragonGradeItemClick(item)} /></span>
                </contentStyled.FilterItem>
                <contentStyled.FilterItem>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<RadioGroup responsive='1.6' initButtonIndex={0} interMargin='0.4vw' nameTable={['드래곤 목록','레벨업 이력','한계돌파 이력', '강화/분해 이력']} buttonClicked={(idx)=>onSubMenuButtonClick(idx)} />
                </contentStyled.FilterItem>
            </contentStyled.FilterGroup>
            <contentStyled.MainContentHeaderHorizontalLine marginBottom='1.5vw' />            

            {subMenuIndex === 0 && <DragonListInfoPanel dragonList={userDragonList} />}
            {subMenuIndex === 1 && <DragonGearLevelUpHistoryPanel type={'dragon'} />}
            {subMenuIndex === 2 && <DragonGearOverLimitHistoryPanel type={'dragon'} />}
            {subMenuIndex === 3 && <DragonGearAssemDisassemHistoryPanel type={'dragon'} />}
        </>
    )
};

export default UserDragonInfoPanel;