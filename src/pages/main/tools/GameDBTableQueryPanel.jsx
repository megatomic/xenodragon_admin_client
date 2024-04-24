import React,{useState,useEffect,useRef} from 'react';
import MediaQuery from 'react-responsive';
import Spreadsheet from "react-spreadsheet";
import { toast } from 'react-toastify';

import styled from 'styled-components';
import * as contentStyled from '../MainContentStyles';
import * as commonStyled from '../../../styles/commonStyles';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import DropBox from '../../../components/DropBox';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useTool from '../../../store/useToolDataManager';

const titleText = '게임DB 테이블 조회';

const GameDBTableQueryPanel = (props) => {

    const fileReader = new FileReader();

    const {startLoading, setStartLoading} = useCommon();
    const {requestGameDBTableQuery,requestArenaTableUpdate} = useTool();

    const [queryHistoryTable, setQueryHistoryTable] = useState([{id:1,name:'없음'}]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const [columnLabelList, setColumnLabelList] = useState([]);
    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [subMenuOpen,setSubMenuOpen] = useState(false);

    const [dbName, setDBName] = useState('');
    const [tableName, setTableName] = useState('');
    const [csvData, setCSVData] = useState([]);
    const [data, setData] = useState([
        [{ value: "" }, { value: "" }]
      ]);

    
    const onSubMenuClick = (e) => {
        setSubMenuOpen(state=>!subMenuOpen);
    };

    const updateCSVData = (table) => {

        let table2 = [];
        for(let row of table) {
            let table1 = [];
            for(let cell of row) {
                table1.push(cell.value);
            }
            table2.push([...table1]);
        }

        setCSVData(data=>table2);
    };

    const onCSVDataChange = (newData) => {
        setData(data=>newData);
        updateCSVData(newData);
    };

    const onPopupButtonClick = async (buttonIdx) => {

        if (buttonIdx === 0) {
            setStartLoading(true);
        
            setTimeout(async () => {
              const resultInfo = await requestArenaTableUpdate({tableName, tableData:csvData});
        
              console.log(resultInfo);
              if (resultInfo.resultCode === 0) {
                toast.info(`아레나 테이블 '${tableName}'이 업데이트되었습니다.`);
              } else {
                toast.error(resultInfo.message);
              }
              setStartLoading(false);

              onPopupCloseButtonClick(null);

            }, 200);

        } else {
            onPopupCloseButtonClick(null);
        }
    };

    const onPopupCloseButtonClick = (e) => {

        setPopupShown(false);
    };

    const onDBNameValueChanged = (e) => {

        setDBName(e.target.value);
    };

    const onTableNameValueChanged = (e) => {

        setTableName(e.target.value);
    };

    const onKeyPress = (e) => {
        if (e.key === 'Enter') {
            reloadArenaSeasonTable(dbName,tableName);
        }
      };

    const reloadArenaSeasonTable = async (dbName,tableName) => {

        setStartLoading(true);

        const resultInfo = await requestGameDBTableQuery({dbName,tableName});
        console.log('resultInfo=',resultInfo.data);

        if(resultInfo.resultCode !== 0) {
            toast.error(resultInfo.message);
            setStartLoading(false);
            return;
        }

        const columnInfo = resultInfo.data.columnInfo;
        const labelList = [];
        for(let row of columnInfo) {
            labelList.push(row.Field);
        }

        console.log('labelList=',labelList);

        setColumnLabelList(labelList);

        const tableData = resultInfo.data.tableData;

        const dataTable = [];
        for(let rowInfo of tableData) {
            const rowValue = [];
            for(let label of labelList) {
                rowValue.push({value:rowInfo[label]});
            }

            dataTable.push(rowValue);
        }

        setData(data=>dataTable);
        
        setStartLoading(false);
    };

    const onQueryDBTableButtonClick = () => {

        reloadArenaSeasonTable(dbName,tableName);
    };

    const onQueryHistoryIndexTableItemClick = (item) => {

        setHistoryIndex(item.id-1);

        const table = item.name.split(".");
        reloadArenaSeasonTable(table[0],table[1]);
    };

    useEffect(()=> {

        if(dbName.trim() === "" || tableName.trim() === "") {
            return;
        }

        const itemName = dbName+"."+tableName;
        for(let item of queryHistoryTable) {
            if(itemName === item.name) {
                return;
            }
        }

        if(queryHistoryTable.length === 0) {
            setQueryHistoryTable(table=>table.push({id:1,name:(dbName+"."+tableName)}));
            setHistoryIndex(index=>0);
        } else {
            const table1 = [...queryHistoryTable];
            table1.push({id:table1.length+1,name:(dbName+"."+tableName)});
            setQueryHistoryTable(table=>table1);
            setHistoryIndex(index=>index+1);
        }
    },[columnLabelList]);

    return <>
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader subtitleWidth="30vw">
            <MediaQuery maxWidth={768}>
                &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
            </MediaQuery>
            <span id='subtitle'>{titleText}</span>
            <span id='button' style={{flexBasis:"11vw"}}><span>DB명</span>&nbsp;&nbsp;<InputField1 responsive='1.6' width='8vw' height='2vw' value={dbName} onChange={(e)=>onDBNameValueChanged(e)} /></span>
            <span id='button' style={{flexBasis:"13vw"}}><span>테이블명</span>&nbsp;&nbsp;<InputField1 responsive='1.6' width='8vw' height='2vw' value={tableName} onChange={(e)=>onTableNameValueChanged(e)} onKeyPress={(e)=>onKeyPress(e)} /></span>
            <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='5vw' height='2vw' onClick={(e)=>onQueryDBTableButtonClick(e)}>조회</Button1></span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
            <contentStyled.FilterGroup>
            <contentStyled.FilterItem>
            <span id="name">조회 이력</span>
            <span id="dropdown">
              <DropBox responsive='1.3' width="18vw" height="2vw" text={queryHistoryTable[historyIndex].name} fontSize="0.6vw" itemList={queryHistoryTable} menuItemClick={(item) => onQueryHistoryIndexTableItemClick(item)} />
            </span>
          </contentStyled.FilterItem>
            </contentStyled.FilterGroup>
            <br />
            <div style={{width:'62vw',height:'40vw',overflow:'auto'}}>
                <Spreadsheet data={data} onChange={onCSVDataChange} columnLabels={columnLabelList} />
            </div>
            </contentStyled.ContentBody>
            <Popup
                shown={popupShown}
                popupTypeInfo={{ type: 'YesNo', button1Text: '예', button2Text: '아니오' }}
                title="알림"
                content={popupContent}
                buttonClick={(buttonNo) => onPopupButtonClick(buttonNo)}
                closeClick={onPopupCloseButtonClick}
            />
        </contentStyled.ContentWrapper>
    </>
};

export default GameDBTableQueryPanel;