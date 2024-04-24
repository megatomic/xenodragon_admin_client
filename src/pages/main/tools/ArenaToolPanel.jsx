import React,{useState,useEffect,useRef} from 'react';
import MediaQuery from 'react-responsive';
import Spreadsheet from "react-spreadsheet";
import { CSVLink, CSVDownload } from "react-csv";
import { toast } from 'react-toastify';

import styled from 'styled-components';
import * as contentStyled from '../MainContentStyles';
import * as commonStyled from '../../../styles/commonStyles';

import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import Popup from '../../../components/Popup';

import useCommon from '../../../store/useCommonStorageManager';
import useTool from '../../../store/useToolDataManager';

const titleText = '아레나DB 테이블 편집기';

const ArenaToolPanel = (props) => {

    const fileReader = new FileReader();

    const {startLoading, setStartLoading} = useCommon();
    const {requestArenaTableUpdate} = useTool();

    const [popupShown, setPopupShown] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [subMenuOpen,setSubMenuOpen] = useState(false);

    const [fileName, setFileName] = useState('');
    const [tableName, setTableName] = useState('');
    const [csvData, setCSVData] = useState([]);
    const [data, setData] = useState([
        [{ value: "Vanilla" }, { value: "Chocolate" }],
        [{ value: "Strawberry" }, { value: "Cookies" }],
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

    const onLoadCSVFileInfo = (e) => {

        const csvFileToArray = string => {
            const csvRows = string.split("\n");
             
            const sheetTable = [];
            for(let row of csvRows) {
                const arr2 = row.split(',');
                let rowTable = [];
                for(let cell of arr2) {
                    rowTable.push({value:cell});
                }
                sheetTable.push([...rowTable]);
            }
        
            setData(table=>sheetTable);
            updateCSVData(sheetTable);
        };

        fileReader.onload = function (event) {
            const text = event.target.result;
            csvFileToArray(text);
        };

        if(e.target.files !== undefined && e.target.files.length > 0) {
            fileReader.readAsText(e.target.files[0]);
            setFileName(e.target.files[0].name);
            setTableName(e.target.files[0].name.split(".")[0]);
        }
    };

    const onSaveToDBButtonClick = (e) => {

        const dbTableName = fileName.split(".")[0];

        setPopupContent(`현재 내용을 '${dbTableName}' 테이블에 저장하시겠습니까?`);
        setPopupShown(true);
    };

    const onDownloadButtonClick = (e) => {

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

    const onTableNameValueChanged = (e) => {

        setTableName(e.target.value);
    };

    return <>
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader subtitleWidth="20vw">
            <MediaQuery maxWidth={768}>
                &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
            </MediaQuery>
            <span id='subtitle'>{titleText}</span>
            <span id='button'>&nbsp;</span>
            <span id='button' style={{flexBasis:"14vw"}}><span>테이블명</span>&nbsp;&nbsp;<InputField1 responsive='1.6' width='10vw' height='2vw' value={tableName} onChange={(e)=>onTableNameValueChanged(e)} /></span>
            <span id='button'><Button1 responsive='1.6' bgColor='var(--btn-confirm-color)' width='8vw' height='2vw' onClick={(e)=>onSaveToDBButtonClick(e)}>DB에 저장하기</Button1></span>
            <span id='button'><CSVLink filename={`${tableName}.csv`} data={csvData} enclosingCharacter={``}><Button1 responsive='1.6' bgColor='var(--btn-secondary-color)' width='10vw' height='2vw' onClick={(e)=>onDownloadButtonClick(e)}>테이블 다운로드하기</Button1></CSVLink></span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
            <br />
            <form>
                <input
                type={"file"}
                id={"csvFileInput"}
                accept={".csv"}
                onChange={onLoadCSVFileInfo}
                />
            </form>
            <br />
            <div style={{width:'62vw',height:'40vw',overflow:'auto'}}>
                <Spreadsheet data={data} onChange={onCSVDataChange} />
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

export default ArenaToolPanel;