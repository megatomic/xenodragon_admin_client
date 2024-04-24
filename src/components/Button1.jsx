import React from 'react';
import styled, { css } from 'styled-components';

export const StButton = styled.button`
  ${(props) =>
    props.disable1 === undefined ?
    (css`
      color: #ffffff;
      cursor: pointer;
      background-color: ${props=>props.bgColor};
      &:hover {
        filter: brightness(120%);
      }
      &:active {
        filter: brightness(90%);
      }
  `)
    :css`
      background-color: var(--btn-disabled-color);
      color: #000000;
      pointer-events: none;
      cursor: default;
    `}

  ${props=>props.responsive?
    css`
    @media screen and (max-width:768px) {
      ${(props)=>css`
        width: calc(${props=>props.width}*${props=>props.responsive});
      `}
      ${(props)=>css`
      height: calc(${props=>props.height}*${props=>props.responsive});
      `}
      margin: 0.7vw 0;
      padding-bottom: 0.35vw;
      font-size: calc(0.8vw*${props=>props.responsive});
      border-radius: calc(0.4vw*${props=>props.responsive});
    }
    @media screen and (min-width:769px) {
      width: ${(props)=>props.width};
      height: ${(props)=>props.height};
      margin: 0.2vw 0;
      padding-bottom: 0.1vw;
      font-size: 0.7vw;
      border-radius: 0.3vw;
    }
    `
    :
    css`
    width: ${(props)=>props.width};
    height: ${(props)=>props.height};
    margin: 0.2vw 0;
    padding-bottom: 0.1vw;
    font-size: 0.7vw;
    border-radius: 0.3vw;
    `}
`;

const Button1 = (props) => {
  return (
    <StButton {...props} onClick={(e)=>props.onClick(e)} />
  );
}

export default Button1;