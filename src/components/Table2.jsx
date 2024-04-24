import React,{useState,useCallback, useEffect} from 'react';
import styled,{css} from 'styled-components';
import CheckBox from '../components/CheckBox';
import Button1 from '../components/Button1';
import * as contentStyled from '../pages/main/MainContentStyles';

const PAGE_INDICATOR_MAX = 10;

export const StTable = styled.div`
    margin-left: ${props=>props.marginLeft};
    margin-right: ${props=>props.marginRight};
`;

export const StTableHeader = styled.div`
    margin-top: 1vw;

    display: grid;
    grid-template-columns: ${props=>props.colFormat};
    justify-items: center;

${props=>props.responsive?
    css`
    @media screen and (max-width:768px) {
        font-size: 1.2vw;
    }
    @media screen and (min-width:769px) {
        font-size: 0.8vw;
    }
    `:
    css`
        font-size: 0.8vw;
    `}
    
    > div {
        color: var(--primary-color);
        font-weight: bold;
        vertical-align: middle;
        height: 2.3vw;
        padding: 0.4vw 0vw;
        cursor: default;
    }
`;

export const StTableBody = styled.div`
    display: grid;
    grid-template-columns: ${props=>props.colFormat};
    justify-items: center;
    height:${props=>props.height!==undefined?props.height:'auto'};
    
    ${props=>props.responsive?
        css`
        @media screen and (max-width:768px) {
            font-size: 1.2vw;
        }
        @media screen and (min-width:769px) {
            font-size:0.7vw;
        }
        `:
        css`
        font-size:0.7vw;
        `}

    > div {
        color: var(--secondary-color);
        vertical-align: middle;
        height: 1.7vw;
        padding: 0.4vw 0vw;
        cursor: default;
    }

    > #table-item {
        display: block;
        width: calc(100%);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
`;

export const StPageNo = styled.span`
    margin: 0 0.2vw;
    ${(props)=>(
        props.current === true ? css`
            pointer-events:none;
            cursor: default;
            color: var(--third-color);
        `:css`
            cursor: pointer;
        `
    )}
    &:hover {
        cursor: pointer;
        background-color: var(--base-color);
        color: var(--third-color);
    }
`;

export const StTableFooter = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 0.8vw;

    > #page-indicator {
        display: flex;
        flex-direction: row;
        justify-content: center;

        > #front {
            flex: 1;
            text-align: left;
        }
        > #back {
            flex: 1;
            text-align: right;
        }
        > #first, #prev {
            margin: 0 0.3vw;
        }
        > #next, #last {
            margin: 0 0.3vw;
        }

        > #pages {
            text-align: center;
            font-size: 0.8vw;
            padding-top: 0.6vw;
            padding-bottom: 0.4vw;
            margin: 0 2vw;
            flex: 0;
        }
    }

    > #page-num {
        text-align: center;
        font-weight: bold;
    }
`;

const Table2 = (props) => {

    const [curPageNo, setCurPageNo] = useState(1);
    const [checkList, setCheckList] = useState([false]);
    let prevPageNo = curPageNo;

    let noPageControl = props.noPageControl;
    if(props.totalRecordNum <= props.recordNumPerPage) {
        noPageControl = true;
    }

    const onPageNoClick = useCallback((event,pageNo) => {

        if(props.onPageNoClick(event,pageNo) === true) {
            prevPageNo = curPageNo;
            setCurPageNo(pageNo);
            resetCheckList(false);
        }
    });

    const onGotoFirstPageClick = useCallback((event) => {

        if(props.onGotoFirstPageClick(event) === true) {
            prevPageNo = curPageNo;
            setCurPageNo(1);
            resetCheckList(false);
        }
    });

    const onGotoPrevPageClick = useCallback((event) => {
        if(curPageNo > 1) {
            if(props.onGotoPrevPageClick(event) === true) {
                prevPageNo = curPageNo;
                setCurPageNo(curPageNo-1);
                resetCheckList(false);
            }
        }
    });

    const onGotoNextPageClick = useCallback((event) => {
        if(curPageNo < totalPageNum) {
            if(props.onGotoNextPageClick(event) === true) {
                prevPageNo = curPageNo;
                setCurPageNo(curPageNo+1);
                resetCheckList(false);
            }
        }
    });

    const onGotoLastPageClick = useCallback((event) => {
        if(props.onGotoLastPageClick(event) === true) {
            prevPageNo = curPageNo;
            setCurPageNo(totalPageNum);
            resetCheckList(false);
        }
    });

    const totalPageNum = props.totalRecordNum <= 0 ? 1:(1+Math.floor((props.totalRecordNum-1)/props.recordNumPerPage));

    //console.log('[TABLE] totalRecordNum=',props.totalRecordNum,',totalPageNum=',totalPageNum);

    const pageNoTable = [];
    const minPageNo = 1+10*(Math.floor((curPageNo-1) / PAGE_INDICATOR_MAX));
    //const minPageNo = (curPageNo > PAGE_INDICATOR_MAX ? (curPageNo-PAGE_INDICATOR_MAX+1):1);
    for(let i=1;i<=totalPageNum;i++) {
        if(i >= minPageNo && i <= (PAGE_INDICATOR_MAX+minPageNo-1)) {
            pageNoTable.push(<StPageNo key={i} id='pageno' current={curPageNo === i?true:false} onClick={(e)=>onPageNoClick(e,i)}>{i}</StPageNo>);
        }
    }
    
    const resetCheckList = (flag) => {
        setCheckList(list=>list.map(el=>flag));
    };

    const onTableCheckBoxChanged = (e,idx)=> {

        let newList = [...checkList];
        if(idx === 0) { // master
            newList = newList.map(el=>e.target.checked);
            
        } else {
            newList[idx] = e.target.checked;
            let checkedNum = 0;
            for(let i=1;i<=checkList.length;i++) {
                if(newList[i] === true) {
                    checkedNum++;
                }
            }

            if(checkedNum === props.bodyInfo.length) {
                newList[0] = true;
            } else {
                newList[0] = false;
            }
        }
        setCheckList(newList);

        if(props.onTableCheckBoxChanged !== undefined) {
            props.onTableCheckBoxChanged(newList.slice(1,newList.length));
        }
    };

    useEffect(() => {
        const initCheckList = [false];
        for(let i=0;i<props.bodyInfo.length;i++) {
            initCheckList.push(false);
        }

        setCheckList(initCheckList);
    },[props.bodyInfo]);

    return (
        <StTable {...props}>
        <StTableHeader {...props}>
            {
                props.headerInfo.map((col,idx)=>{
                    if(col === '__checkbox') {
                        return <CheckBox key={col+idx} className='table-item' checked={checkList[idx]} checkChanged={(e)=>onTableCheckBoxChanged(e,0)} text={'checkbox-master-group1'} textHidden={true} fontSize={'0.7vw'} checkColor={'var(--primary-color)'} />
                    } else {
                        return <div key={col+idx} className='table-item'>{col}</div>
                    }
                })
            }
        </StTableHeader>
        <contentStyled.MainContentHeaderHorizontalLine />
        {
            props.bodyInfo.map((rowTable,idx1)=> {
                return <>
                    <StTableBody {...props}>
                    {
                        rowTable.record.map((col,idx2)=>{
                            if(col.indexOf('__button') >= 0) {
                                const arr = col.split('=');
                                const btnProps = JSON.parse(arr[1]);
                                return <Button1 bgColor={btnProps.bgColor} width={btnProps.width} height={btnProps.height} onClick={(e)=>props.onButtonClick(e,btnProps.tag)}>{btnProps.name}</Button1>
                            } else if(col === '__checkbox') {
                                return <CheckBox key={idx1} className='table-item' checked={checkList[idx1+1]} checkChanged={(e)=>onTableCheckBoxChanged(e,idx1+1)} text={'checkbox-slave-group1-'+idx1} textHidden={true} fontSize={'0.7vw'} checkColor={'var(--primary-color)'} />
                            } else {
                                if(rowTable.color !== undefined) {
                                    if(rowTable.bold !== undefined) {
                                        return <div key={idx1*100+idx2} className='table-item' style={{color:rowTable.color,fontWeight:(rowTable.bold?'bold':'')}}>{col}</div>
                                    } else {
                                        return <div key={idx1*100+idx2} className='table-item' style={{color:rowTable.color}}>{col}</div>
                                    }
                                } else {
                                    if(rowTable.bold !== undefined) {
                                        return <div key={idx1*100+idx2} className='table-item' style={{fontWeight:(rowTable.bold?'bold':'')}}>{col}</div>
                                    } else {
                                        return <div key={idx1*100+idx2} className='table-item'>{col}</div>
                                    }
                                }
                            }
                        })
                    }
                    </StTableBody>
                    <contentStyled.MainContentHeaderHorizontalLine />
                </>
            })
        }
        {!noPageControl&&
            <StTableFooter>
            <div id='page-indicator'>
                <span id='back'>
                    <span id='first'><Button1 responsive='1.8' disable type='primary' width='4vw' height='1.8vw' bgColor='var(--primary-color)' onClick={(e)=>onGotoFirstPageClick(e)}>처음</Button1></span>
                    <span id='prev'><Button1 responsive='1.8' width='4vw' height='1.8vw' bgColor='var(--primary-color)' onClick={(e)=>onGotoPrevPageClick(e)}>이전</Button1></span>
                </span>
                <span id='pages'>{pageNoTable}</span>
                <span id='front'>
                    <span id='next'><Button1 responsive='1.8' width='4vw' height='1.8vw' bgColor='var(--primary-color)' onClick={(e)=>onGotoNextPageClick(e)}>다음</Button1></span>
                    <span id='last'><Button1 responsive='1.8' width='4vw' height='1.8vw' bgColor='var(--primary-color)' onClick={(e)=>onGotoLastPageClick(e)}>끝</Button1></span>
                </span>
            </div>
            <div id='page-num'>
                <p>{curPageNo} / {totalPageNum} 페이지</p>
            </div>
        </StTableFooter>
        }
    </StTable>
    )
};

export default Table2;