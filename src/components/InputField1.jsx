import React,{forwardRef} from 'react';
import styled, {css} from 'styled-components';

export const StInputField = styled.input`

${props=>props.responsive?
    css`
    @media screen and (max-width:768px) {
        ${props=>css`
            width: calc(${props=>props.width}*${props=>props.responsive});
        `}
        ${props=>css`
            height: calc(${props=>props.height}*${props=>props.responsive});
        `}
        margin: 0.7vw;
        font-size: 1.0vw;    
        border: 0.28vw solid var(--base-line-color);
        ${props=>css`
            border-radius: calc(0.3vw*${props=>props.responsive});
        `}
        padding: 0 1.4vw;
    }
    @media screen and (min-width:769px) {
        width: ${(props)=>props.width};
        height: ${(props)=>props.height};
        margin: 0.2vw;
        font-size: 0.6vw;    
        border: 0.08vw solid var(--base-line-color);
        border-radius: 0.3vw;
        padding: 0 0.4vw;
    }
    `:
    css`
        width: ${(props)=>props.width};
        height: ${(props)=>props.height};
        margin: 0.2vw;
        font-size: 0.6vw;    
        border: 0.08vw solid var(--base-line-color);
        border-radius: 0.3vw;
        padding: 0 0.4vw;
    `};

    border: none;
    ::placeholder {
    }
`;

export const StPWInputField = styled(StInputField).attrs((props) => ({ type: 'password' }))``;
export const StNumberInputField = styled(StInputField).attrs((props) => ({ type: 'number' }))``;

const InputField1 = forwardRef((props,ref) => {

    if(props.type === 'password') {
        return (
            <StPWInputField {...props} ref={ref} />
          );
    } else if(props.type === 'number') {
        return (
            <StNumberInputField {...props} ref={ref} />
        );
    } else {
        return (
            <StInputField {...props} ref={ref} />
          );
    }
  });
  
  export default InputField1;