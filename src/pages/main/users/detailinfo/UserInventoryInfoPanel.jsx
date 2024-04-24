import React, {useState,useCallback,useEffect,useRef} from 'react';

import * as contentStyled from '../../MainContentStyles';
import * as pageStyled from '../UserDetailInfoPageStyles';

import DropBox from '../../../../components/DropBox';

import useCommon from '../../../../store/useCommonStorageManager';
import useUser from '../../../../store/useUserDataManager';

const filterItemType1Table = [
    {id:1, name:'전체'},
    {id:2, name:'미스터리 박스'},
    {id:3, name:'아이템'}
];

const filterItemType21Table = [
    {id:1, name:'전체'},
    {id:2, name:'미스터리 박스1'},
    {id:3, name:'미스터리 박스2'}
];

const filterItemType22Table = [
    {id:1, name:'전체'},
    {id:2, name:'엘리멘털 스톤', type1:3},
    {id:3, name:'강화석', type1:3},
    {id:4, name:'경험치 포션', type1:3}
];

const UserInventoryInfoPanel = (props) => {

    const { startLoading, setStartLoading } = useCommon();
    const {requestUserInventoryInfo} = useUser();  
    const [inventoryItemList, setInventoryItemList] = useState([]);
    const [filterItemList, setFilterItemList] = useState([]);

    const [filterItemType2Table, setFilterItemType2Table] = useState([filterItemType21Table[0]]);
    const [itemType1Index, setItemType1Index] = useState(0);
    const [itemType2Index, setItemType2Index] = useState(0);

    const onItemType1DropMenuClick = (item) => {
        setItemType1Index(index=>item.id-1);
        setItemType2Index(0);
        if(item.id === 2) {
            setFilterItemType2Table(table=>filterItemType21Table);
        } else if(item.id === 3) {
            setFilterItemType2Table(table=>filterItemType22Table);
        } else {
            setFilterItemType2Table(table=>[filterItemType21Table[0]]);
        }
    };

    const onItemType2DropMenuClick = (item) => {
        setItemType2Index(item.id-1);
    };

    const makeFilteredItemList = () => {
        
        let itemList = inventoryItemList;
        if(itemType1Index > 0) {
            itemList = itemList.filter(info=>{
                return (info.type1 === filterItemType1Table[itemType1Index].id);
            });
    
            itemList = itemList.filter(info=>{
                return (info.type2 === filterItemType2Table[itemType2Index].id || itemType2Index === 0);
            });
        }

        const itemList2 = [];
        for(let i=0;i<itemList.length;i+=2) {
            itemList2.push({col1:itemList[i],col2:(i+1<itemList.length?itemList[i+1]:null)});
        }

        setFilterItemList(itemList2);
    };

    const reloadUserInventoryInfo = (userID) => {

        setStartLoading(true);
        setTimeout(async () => {
          const resultInfo = await requestUserInventoryInfo(userID,0);
    
          console.log('inventoryInfo=',resultInfo);
    
          setInventoryItemList(resultInfo.data);
          // if (resultInfo.resultCode === 0) {
          //   setUserList(makeTableFromUserList(resultInfo.data));
          // } else {
          //   toast.error(resultInfo.message);
          // }
          setStartLoading(false);
        }, 200);
      };
    
    useEffect(()=> {
        reloadUserInventoryInfo(props.targetUserID);
    },[]);

    useEffect(()=> {
        makeFilteredItemList();
    },[inventoryItemList,itemType1Index]);

    useEffect(()=> {
        makeFilteredItemList();
    },[inventoryItemList,itemType2Index]);

    useEffect(() => {
        console.log('filterItemList=',filterItemList);
    },[filterItemList]);

    return (
        <contentStyled.ContentBody>
            <contentStyled.FilterGroup>
            <contentStyled.FilterItem>
                    <span id='name'>분류1</span>
                    <span id='dropdown'><DropBox width='10vw' height='2vw' text={filterItemType1Table[itemType1Index].name} fontSize='0.6vw' itemList={filterItemType1Table} menuItemClick={(item)=>onItemType1DropMenuClick(item)} /></span>
                </contentStyled.FilterItem>
                <contentStyled.FilterItem>
                    <span id='name'>분류2</span>
                    <span id='dropdown'><DropBox width='10vw' height='2vw' text={filterItemType2Table[itemType2Index].name} fontSize='0.6vw' itemList={filterItemType2Table} menuItemClick={(item)=>onItemType2DropMenuClick(item)} /></span>
                </contentStyled.FilterItem>
            </contentStyled.FilterGroup>
            <contentStyled.MainContentHeaderHorizontalLine marginBottom='1.5vw' />

            <pageStyled.Table marginLeft='2vw' marginRight='2vw'>
                <pageStyled.TableRow height='2vw'>
                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>이름</pageStyled.TableCell>
                    <pageStyled.TableCell width='10vw' color='var(--primary-color)' bold>상세 내용</pageStyled.TableCell>
                    <pageStyled.TableCell width='6vw' color='var(--primary-color)' bold>수량</pageStyled.TableCell>
                    <pageStyled.TableCell width='8vw' color='var(--primary-color)' bold>이름</pageStyled.TableCell>
                    <pageStyled.TableCell width='10vw' color='var(--primary-color)' bold>상세 내용</pageStyled.TableCell>
                    <pageStyled.TableCell width='6vw' color='var(--primary-color)' bold>수량</pageStyled.TableCell>
                </pageStyled.TableRow>
                {
                    filterItemList.map((info,index)=> {
                        return (
                            <pageStyled.TableRow height='2vw'>
                                <pageStyled.TableCell width='8vw'>{info.col1.itemData.itemName}</pageStyled.TableCell>
                                <pageStyled.TableCell width='10vw'>ItemType:{info.col1.itemType},&nbsp;ItemID:{info.col1.itemId}</pageStyled.TableCell>
                                <pageStyled.TableCell width='6vw'>{info.col1.quantity}</pageStyled.TableCell>
                                <pageStyled.TableCell width='8vw'>{info.col2!==null?info.col2.itemData.itemName:'.'}</pageStyled.TableCell>
                                <pageStyled.TableCell width='10vw'>{info.col2!==null?'ItemType:'+info.col2.itemType+', ItemID:'+info.col2.itemId:'.'}</pageStyled.TableCell>
                                <pageStyled.TableCell width='6vw'>{info.col2!==null?info.col2.quantity:'.'}</pageStyled.TableCell>
                            </pageStyled.TableRow>
                        )
                    })
                }
            </pageStyled.Table>

        </contentStyled.ContentBody>
    )
};

export default UserInventoryInfoPanel;