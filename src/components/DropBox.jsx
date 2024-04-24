import React, { useState } from 'react';
import { useEffect } from 'react';
import styled, { css } from 'styled-components';

const StDropBox = styled.div`
${props=>props.responsive?
  css`
  @media screen and (max-width:768px) {
    width: calc(${props=>props.width}*${props=>props.responsive});
    height: calc(${props=>props.height}*${props=>props.responsive});
  }
  @media screen and (min-width:769px) {
    width: ${(props) => props.width};
    height: ${(props) => props.height};
  }
  `:
  css`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  `}
  position: relative;
`;

const StComboBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

${props=>props.responsive?
  css`
  @media screen and (max-width:768px) {
    width: calc(${props=>props.width}*${props=>props.responsive});
    height: calc(${props=>props.height}*${props=>props.responsive});
  }
  @media screen and (min-width:769px) {
    width: ${(props) => props.width};
    height: ${(props) => props.height};
  }
  `:
  css`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  `}

  border: none;
  border: 0.08vw solid var(--base-line-color);
  border-radius: 0.3vw;
  position: relative;
  padding: 0.5vw;
  cursor: pointer;

  > #text {
    flex: 1;
    text-align: center;

    ${props=>props.responsive?
      css`
      @media screen and (max-width:768px) {
        font-size: calc(0.8vw*${props=>props.responsive});
        margin-right: 1vw;
      }
      @media screen and (min-width:769px) {
        font-size: ${(props) => props.fontSize};
        margin-right: 1vw;
      }
      `:
      css`
      font-size: ${(props) => props.fontSize};
      margin-right: 1vw;
      `}
    color: ${props=>props.fontColor};
  }
  > #icon {
    flex: 0 0 0.5vw;
    font-size: 0.7vw;
    color: var(--base-line-color);
    ${(props) =>
      props.open
        ? css`
            padding-top: 0.1vw;
          `
        : css`
            padding-bottom: 0.1vw;
          `}
  }
`;

const StDropMenuList = styled.div`
${props=>props.responsive?
  css`
  @media screen and (max-width:768px) {
    width: calc(${props=>props.width}*${props=>props.responsive}*1.5);
    height: calc(${props=>props.itemList.length * 0.5}*${props=>props.responsive});
    top: calc(${props=>props.height}*${props=>props.responsive});
  }
  @media screen and (min-width:769px) {
    width: ${(props) => props.width};
    height: ${(props) => props.itemList.length * 0.5};
    top: ${(props) => props.height};
  }
  `:
  css`
  width: ${(props) => props.width};
  height: ${(props) => props.itemList.length * 0.5};
  top: ${(props) => props.height};
  `}

  left: 0;

  background-color: #ffffff;
  position: absolute;
  z-index: 1;
  border: none;
  border: 0.08vw solid var(--base-line-color);
  border-radius: 0.3vw;
  padding: 0.5vw;

  display: flex;
  flex-direction: column;

  > #item {
    width: 100%;
    color: ${(props) => props.fontColor};
    ${props=>props.responsive?
      css`
      @media screen and (max-width:768px) {
        width: calc(${props=>props.width}*${props=>props.responsive}*1.38);
        height: calc(${props=>props.height}*${props=>props.responsive});
        font-size: calc(1.2vw*${props=>props.responsive});

        flex: 0 0 4.6vw;
        padding: 0.8vw 0;
      }
      @media screen and (min-width:769px) {
        flex: 0 0 1.5vw;
        padding: 0.4vw 0;
        font-size: ${(props) => props.fontSize};
      }
      `:
      css`
      flex: 0 0 1.5vw;
      padding: 0.4vw 0;
      font-size: ${(props) => props.fontSize};
      `}
      text-align: center;
  }

  > div:hover {
    background-color: var(--base-list-hover-color);
    filter: brightness(110%);
    cursor: pointer;
  }
`;

const useOutsideClick = (callback) => {
  const ref1 = React.useRef();
  const ref2 = React.useRef();

  React.useEffect(() => {
    const handleClick = (event) => {
      if (!((ref1.current && ref1.current.contains(event.target)) ||
        (ref2.current && ref2.current.contains(event.target)))) {
        callback();
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true); 
    };
  }, [ref1,ref2]);

  return [ref1,ref2];
};

const DropBox = (props) => {
  const [isShown, setIsShown] = useState(false);
  const [comboText, setComboText] = useState(props.text);

  const handleClickOutside = () => {
    setIsShown(false);
  };

  const [ref1,ref2] = useOutsideClick(handleClickOutside);

  const onComboBoxClick = (e,props) => {
    if(props.enable === undefined || props.enable === true) {
      setIsShown(!isShown);
    }
  };

  useEffect(()=> {
    setComboText(props.text);
  },[props.text]);

  const onItemClick = (item) => {

    console.log('onItemClick');
    props.menuItemClick(item);
    setIsShown(!isShown);
    setComboText(item.name);
  };

  return (
    <StDropBox {...props}>
      <StComboBox {...props} open={isShown} ref={ref1} onClick={(e) => onComboBoxClick(e,props)}>
        <span id="text">{comboText}</span>
        <span id="icon">
          {isShown && <i className="fa-solid fa-caret-up" />}
          {!isShown && <i className="fa-solid fa-caret-down" />}
        </span>
      </StComboBox>
      {isShown && (
        <StDropMenuList {...props} ref={ref2}>
          {props.itemList.map((item) => {
            return (
              <div id="item" key={item.id} onClick={() => onItemClick(item)}>
                {item.name}
              </div>
            );
          })}
        </StDropMenuList>
      )}
    </StDropBox>
  );
};

export default DropBox;
