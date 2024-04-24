import React, {useState,useCallback,useEffect,useRef} from 'react';
import styled from 'styled-components';

import * as mainStyled from '../../MainPageStyles';
import * as contentStyled from '../../MainContentStyles';
import * as pageStyled from '../UserDetailInfoPageStyles';

import Button1 from '../../../../components/Button1';
import InputField1 from '../../../../components/InputField1';
import RadioGroup from '../../../../components/RadioGroup';
import DropBox from '../../../../components/DropBox';

import useCommon from '../../../../store/useCommonStorageManager';
import useUser from '../../../../store/useUserDataManager';

import GearListInfoPanel from './GearListInfoPanel';
import DragonGearLevelUpHistoryPanel from './DragonGearLevelUpHistoryPanel';
import DragonGearOverLimitHistoryPanel from './DragonGearOverLimitHistoryPanel';
import DragonGearAssemDisassemHistoryPanel from './DragonGearAssemDisassemHistoryPanel';

const StGearInfoWrapper = styled.div`
    border: 0.07vw solid var(--primary-color);
    border-radius: 0.4vw;
    margin: 0 1vw 1vw 1vw;
    padding: 1.2vw;
    font-size: 0.7vw;
`;


const StGearBasicInfoPanel = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    #name {
        color: var(--primary-color);
        font-weight: bold;
        margin-right: 1vw;
    }
    #value {
        margin-right: 1.5vw;
    }
`;

const StGearPropertyPanel = styled.div`
    margin-top: 1vw;
`;

const StGearInfoFooterPanel = styled.div`
    margin-top: 1vw;

    display: flex;
    justify-content: flex-end;

    #button {
        margin: 0 0.6vw;
    }
`;

const filterGearGradeList = [
    {id:1, name:'전체'},
    {id:2, name:'SSR'},
    {id:3, name:'SR'},
    {id:4, name:'R'},
    {id:5, name:'A'},
    {id:6, name:'B'},
    {id:7, name:'C'}
];

const UserGearInfoPanel = (props) => {

    const { startLoading, setStartLoading } = useCommon();
    const {requestUserGearInfo} = useUser();  
    const [userGearList, setUserGearList] = useState([]);

    const [titleKeyword, setTitleKeyword] = useState('');
    const [filterGradeType, setFilterGradeType] = useState(0);
    const [subMenuIndex, setSubMenuIndex] = useState(0);

    const [gearInfoList, setGearInfoList] = useState([
        {
            name:'Skullbreaker', GUID:'2343489234958235',grade:'SSR',level:13,HP:7,
            durability:[10,12], equippingDragon:'23423453453453'
        },
        {
            name:'Skullbreaker2', GUID:'2343489234958235',grade:'SR',level:18,HP:26,
            durability:[10,12], equippingDragon:'234234523534435'
        }
    ]);
    const [filterGearList, setFilterGearList] = useState(gearInfoList);

    const onTitleKeywordChanged = (e) => {
        setTitleKeyword(e.target.value.trim());
    };

    const onTitleKeywordKeyPress = (e) => {
        if(e.key === 'Enter') {
            onSearchGearClick(e);
        }
    };

    const onSearchGearClick = (e) => {

        makeFilteredGearList();
    };

    const onGearGradeItemClick = (item) => {
        setFilterGradeType((type)=>(item.id-1));
    };

    const makeFilteredGearList = () => {
        
        let gearList = gearInfoList;
        
        if(titleKeyword.trim() !== '') {
            gearList = gearList.filter(info=> {
                return (info.name.indexOf(titleKeyword) >= 0 || info.GUID.indexOf(titleKeyword) >= 0);
            });
        }

        //console.log('filterGradeType=',filterGradeType);

        gearList = gearList.filter(info=>{
            return (info.grade === filterGearGradeList[filterGradeType].name || filterGradeType === 0);
        });

        setFilterGearList(gearList);
    };

    const onSubMenuButtonClick = (idx) => {
        setSubMenuIndex(idx);
    };

    useEffect(()=> {
        makeFilteredGearList();
    },[filterGradeType]);

    const reloadUserGearInfo = (userID) => {

        setStartLoading(true);
        setTimeout(async () => {
          const resultInfo = await requestUserGearInfo(userID);
    
          console.log('gearInfo=',resultInfo);
    
          setUserGearList(resultInfo.data);
          // if (resultInfo.resultCode === 0) {
          //   setUserList(makeTableFromUserList(resultInfo.data));
          // } else {
          //   toast.error(resultInfo.message);
          // }
          setStartLoading(false);
        }, 200);
      };
    
    useEffect(()=> {
        reloadUserGearInfo(props.targetUserID);
    },[]);

    return (
        <contentStyled.ContentBody>
            <contentStyled.FilterGroup>
                <contentStyled.FilterItem>
                    <span id='name'>검색</span>
                    <span id='input'><InputField1 width='12vw' height='2vw' placeholder={'GUID 또는 이름을 입력하세요.'} value={titleKeyword} onChange={(e)=>onTitleKeywordChanged(e)} onKeyPress={(e)=>onTitleKeywordKeyPress(e)}/></span>
                    <span id='search'><Button1 bgColor='var(--btn-primary-color)' width='4vw' height='1.8vw' onClick={(e)=>onSearchGearClick(e)}>검색</Button1></span>
                </contentStyled.FilterItem>
                <contentStyled.FilterItem>
                    <span id='name'>등급</span>
                    <span id='dropdown'><DropBox width='10vw' height='2vw' text={filterGearGradeList[0].name} fontSize='0.6vw' itemList={filterGearGradeList} menuItemClick={(item)=>onGearGradeItemClick(item)} /></span>
                </contentStyled.FilterItem>
                <contentStyled.FilterItem>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<RadioGroup responsive='1.6' initButtonIndex={0} interMargin='0.4vw' nameTable={['기어 목록','레벨업 이력','한계돌파 이력', '강화/분해 이력']} buttonClicked={(idx)=>onSubMenuButtonClick(idx)} />
                </contentStyled.FilterItem>
            </contentStyled.FilterGroup>
            <contentStyled.MainContentHeaderHorizontalLine marginBottom='1.5vw' />
            
            <br />
            {subMenuIndex === 0 && <GearListInfoPanel gearList={userGearList} />}
            {subMenuIndex === 1 && <DragonGearLevelUpHistoryPanel type={'gear'} />}
            {subMenuIndex === 2 && <DragonGearOverLimitHistoryPanel type={'gear'} />}
            {subMenuIndex === 3 && <DragonGearAssemDisassemHistoryPanel type={'gear'} />}

        </contentStyled.ContentBody>
    )
};

export default UserGearInfoPanel;