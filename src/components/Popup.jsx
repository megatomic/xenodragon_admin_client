import React from 'react';
import styled from 'styled-components';
import * as commonStyled from '../styles/commonStyles';

import Modal from './Modal';
import Button1 from './Button1';


const StTitlePanel = styled.div`
  flex: 0 0 3vw;
  width: 100%;
  background-color: var(--primary-color);
  border-top-left-radius: 0.4vw;
  border-top-right-radius: 0.4vw;

  > p {
    color: #ffffff;
    font-size: 0.8vw;
    padding: 0.8vw 0;
  }
`;

const StBodyPanel = styled.div`
  flex: 1;
  padding: 0.4vw 0.4vw;

  display: flex;
  flex-direction: column;
  justify-content: center;
  > #content {
    color: var(--secondary-color);
    vertical-align: center;
  }
`;

const StButtonGroupPanel = styled.div`
  flex: 0 0 4vw;
  > #button-group button {
    margin: 0.3vw 1vw;
  }
`;

const Popup = ({popupTypeInfo,width,shown,title,content,buttonClick,closeClick}) => {

    const setBackground = '';
  
    if(shown === undefined || shown === false) {
        return null;
    }

    return (
      <Modal onClose={popupTypeInfo.type === 'YesNo'?closeClick:null}>
        <commonStyled.StWrapper width={width}>
          <StTitlePanel>
            <p>{title}</p>
          </StTitlePanel>
          <StBodyPanel>
            <div id='content'>
            {(Array.isArray(content)===true?
              content.map(item=>{return <p>{item.trim()!==''?item:<br />}</p>})
            :content)}
            </div>
          </StBodyPanel>
          <StButtonGroupPanel>
          {popupTypeInfo.type === 'YesNo' && (
                <div id='button-group'>
                    <Button1 bgColor='var(--btn-confirm-color)' width='8vw' height='2.5vw' onClick={(e)=>buttonClick(0)}>{popupTypeInfo.button1Text}</Button1>
                    <Button1 bgColor='var(--btn-secondary-color)' width='8vw' height='2.5vw' onClick={(e)=>buttonClick(1)}>{popupTypeInfo.button2Text}</Button1>
                </div>
            )}
            {popupTypeInfo.type === 'Confirm' && (
                <div id='button-group'>
                    <Button1 bgColor='var(--btn-confirm-color)' width='8vw' height='2.5vw' onClick={(e)=>buttonClick(0)}>{popupTypeInfo.button1Text}</Button1>
                </div>
            )}
          </StButtonGroupPanel>
        </commonStyled.StWrapper>
      </Modal>
    );
  
    return <p></p>;
  };
  
  export default Popup;