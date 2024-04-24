import styled from 'styled-components';

export const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0.4vw;
`;

export const HeaderMenuPanel = styled.div`
    display: flex;
    justify-content: flex-end;
`;

export const Table = styled.div`
    width:94%;
    display: table;
    border-collapse: collapse;
    margin-left:${props=>props.marginLeft!==undefined?props.marginLeft:'0vw'};
    margin-right:${props=>props.marginRight!==undefined?props.marginRight:'0vw'};

@media screen and (max-width:768px) {
    font-size: 1.2vw;
}
@media screen and (min-width:769px) {
    font-size: 0.7vw;
}
`;

export const TableRow = styled.div`
    height: ${props=>props.height};
    display: table-row;
`;

export const TableCell = styled.div`
    width: ${props=>props.width};
    display: table-cell;
    border: 0.07vw solid var(--table-line-color);
    text-align: center;
    vertical-align: middle;

    color:${props=>props.color};
    font-weight:${props=>props.bold!==undefined?'bold':''};
`;

export const TableCellContent = styled.div`
    display: flex;
    align-items: center;
    label {
        flex: 1;
    }
    #button {
        flex: 0 0 4vw;
    }
`;