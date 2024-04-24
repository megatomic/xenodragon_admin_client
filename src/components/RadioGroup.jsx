import React, { useState } from 'react';
import { useEffect } from 'react';
import styled, { css } from 'styled-components';

const StGroupWrapper = styled.div`
  display: table;
  padding: 0vw 0.2vw;

  > #outerDiv {
    display: inline-block;
    padding: 0.1vw;
    margin-right: ${props=>props.interMargin !== undefined ? props.interMargin : '0vw'};
    vertical-align: middle;
  }
`;

const StRadioButton = styled.div`
  display: table-cell;

${props=>props.responsive?
  css`
@media screen and (max-width:768px) {
  width: calc(${props=>props.buttonWidth!==undefined?props.buttonWidth:''});
  padding: 0 1.4vw;
  height: 4vw;
  border: 0.2vw solid transparent;
  border-radius: 0.6vw;
  font-size: 1.7vw;
}
@media screen and (min-width:769px) {
  width: ${props=>props.buttonWidth!==undefined?props.buttonWidth:''};
  padding: 0 0.5vw;
  height: 2vw;
  border: 0.2vw solid transparent;
  border-radius: 0.3vw;
  font-size: 0.7vw;
}
  `:
  css`
  width: ${props=>props.buttonWidth!==undefined?props.buttonWidth:''};
  padding: 0 0.5vw;
  height: 2vw;
  border: 0.2vw solid transparent;
  border-radius: 0.3vw;
  font-size: 0.7vw;
  `}

  vertical-align: middle;
  text-align: center;
  cursor: pointer;
  &:hover {
    ${(props) =>
      props.activeIndex !== props.id
        ? css`
            background-color: var(--primary-color);
            filter: brightness(105%);
          `
        : `
    `}
  }
  ${(props) =>
    props.selected !== undefined && props.selected === true
      ? css`
          background-color: var(--third-color);
          color: #ffffff;
        `
      : css`
          background-color: var(--primary-color);
          color: #ffffff;
        `}
`;

const RadioGroup = (props) => {
  const { initButtonIndex, nameTable, interMargin, buttonClicked } = props;
  const [activeIndex, setActiveIndex] = useState(initButtonIndex);

  const onRadioButtonClick = (e, idx) => {
    setActiveIndex(idx);
    buttonClicked(idx);
  };

  useEffect(() => {
    setActiveIndex(initButtonIndex);
  },[initButtonIndex]);

  return (
    <StGroupWrapper {...props}>
      {nameTable.map((name, idx) => {
        return (
          <div id="outerDiv" key={idx}>
            <StRadioButton {...props} id={idx} width={props.buttonWidth} activeIndex={activeIndex} selected={activeIndex === idx ? true : false} onClick={(e) => onRadioButtonClick(e, idx)}>
              {name}
            </StRadioButton>
          </div>
        );
      })}
    </StGroupWrapper>
  );
};

export default RadioGroup;
