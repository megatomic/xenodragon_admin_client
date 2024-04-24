import React from 'react';
import styled, { css } from 'styled-components';
import MediaQuery from 'react-responsive'

const Checkbox = ({ text, fontSize, checkColor, checked, textHidden, checkChanged }) => {
  return (
    <>
        <MediaQuery maxWidth={768}>
          <Wrapper style={{fontSize:'2.45vw'}} fontSize='2.45vw'>
    {checked !== undefined ? <StyledInput type="checkbox" id={text} name={text} checked={checked} onChange={(e)=>checkChanged(e)} />:
    <StyledInput type="checkbox" id={text} name={text} onChange={(e)=>checkChanged(e)} />}
      <StyledLabel htmlFor={text} fontSize={fontSize?fontSize:'2.45vw'} checkColor={checkColor}>
        <StyledP fontSize={fontSize}>{!textHidden&&text}</StyledP>
      </StyledLabel>
    </Wrapper>
    </MediaQuery>
    <MediaQuery minWidth={769}>
          <Wrapper style={{fontSize:'0.7vw'}} fontSize='0.7vw'>
    {checked !== undefined ? <StyledInput type="checkbox" id={text} name={text} checked={checked} onChange={(e)=>checkChanged(e)} />:
    <StyledInput type="checkbox" id={text} name={text} onChange={(e)=>checkChanged(e)} />}
      <StyledLabel htmlFor={text} fontSize={fontSize?fontSize:'0.7vw'} checkColor={checkColor}>
        <StyledP fontSize={fontSize}>{!textHidden&&text}</StyledP>
      </StyledLabel>
    </Wrapper>
    </MediaQuery>
    </>
  );
}

export default Checkbox;

const Wrapper = styled.span`
display: flex;
align-items: center;

@media screen and (max-width:768px) {
  font-size: 2.45vw;
}
@media screen and (min-width:769px) {
  font-size: 0.7vw;
}
`;

const StyledLabel = styled.label`
  position: relative;
  display: flex;
  align-items: center;
  user-select: none;
  cursor: pointer;

  &:before {
    display: block;
    content: '';

    @media screen and (max-width:768px) {
      ${props=>css`
        width: calc(${props=>props.fontSize}*3.5);
      `}
      ${props=>css`
      height: calc(${props=>props.fontSize}*3.5);
      `}
      border: 0.3vw solid gainsboro;
      border-radius: 0.875vw;
  }
  @media screen and (min-width:769px) {
    width: ${(props) => props.fontSize};
    height: ${(props) => props.fontSize};
    border: 0.12vw solid gainsboro;
    border-radius: 0.25vw;
  }


    background-color: white;
  }

  &:after {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    display: block;
    opacity: 0;
    content: '';
    
    @media screen and (max-width:768px) {
      ${props=>css`
        width: calc(${props=>props.fontSize}*3.5);
      `}
      ${props=>css`
      height: calc(${props=>props.fontSize}*3.5);
      `}
      border: 0.3vw solid gainsboro;
      border-radius: 0.875vw;
  }
  @media screen and (min-width:769px) {
    width: ${(props) => props.fontSize};
    height: ${(props) => props.fontSize};
    border: 0.12vw solid transparent;
    border-radius: 0.25vw;
  }



    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z'/%3e%3c/svg%3e");
    background-size: 100% 100%;
    background-position: 50%;
    background-repeat: no-repeat;
    background-color: lightgreen;
    ${props=>props.textHidden===true?css`
    visibility:hidden;
  `:css`
    visibility:visible;
  `}
    ${(props) =>
      props.checkColor &&
      css`
        background-color: ${props.checkColor};
      `};
  }
`;

// visually-hidden
// https://www.a11yproject.com/posts/how-to-hide-content/
const StyledInput = styled.input`
  position: absolute;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);

  @media screen and (max-width:768px) {
    ${props=>css`
      width: ${props=>props.fontSize}
      height: ${props=>props.fontSize}
    `}
}
@media screen and (min-width:769px) {
  width: 1vw;
  height: 1vw;
}

  overflow: hidden;
  white-space: nowrap;
  &:checked + ${StyledLabel} {
    :after {
      opacity: 1;
    }
  }
`;

const StyledP = styled.p`
  display: inline-block;
@media screen and (max-width:768px) {
  margin-left: 1vw;
  ${(props) =>
    props.fontSize &&
    css`
      font-size: calc(${props.fontSize}*3.5);
    `}
}
@media screen and (min-width:769px) {
  margin-left: 0.5vw;
  ${(props) =>
    props.fontSize &&
    css`
      font-size: ${props.fontSize};
    `}
}
`;
