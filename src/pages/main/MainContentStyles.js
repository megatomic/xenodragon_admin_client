import styled, { css } from 'styled-components';
import Button1 from '../../components/Button1';
import InputField1 from '../../components/InputField1';
import TextArea1 from '../../components/TextArea1';

export const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content; center;

    @media screen and (max-width:768px) {
      height: 94%;
    }
    @media screen and (min-width:769px) {
      height: 35vw;
    }
`;

export const ContentHeader = styled.div`
  @media screen and (max-width: 768px) {
    flex: 0 0 4vw;
    margin-bottom: 0.5vw;
    font-size: 1.6vw;
  }
  @media screen and (min-width: 769px) {
    flex: 0 0 3vw;
    margin-bottom: 0.5vw;
    font-size: 0.8vw;
  }

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  > #subtitle {
    @media screen and (max-width: 768px) {
      flex: 0 0 25vw;
    }
    @media screen and (min-width: 769px) {
      ${(props) =>
        props.subtitleWidth !== undefined
          ? css`
              flex: 0 0 ${props.subtitleWidth};
            `
          : css`
              flex: 0 0 36vw;
            `}
    }
    margin-left: 1vw;
    font-weight: bold;
  }

  > #label {
    @media screen and (max-width: 768px) {
      font-size: 1.5vw;
      padding-right: 1.7vw;
    }
    @media screen and (min-width: 769px) {
      font-size: 0.7vw;
      padding-right: 1vw;
    }
    font-weight: bold;
    text-align: right;
  }

  > span {
    flex: 1;
  }

  > #dropdown {
    padding-right: 2vw;
  }

  > #button {
    flex: 0 0 5vw;
    margin-left: 0.4vw;
  }
`;

export const ContentBody = styled.div`
  flex: 1;

  overflow-anchor: none;
  overflow: auto;
  overscroll-behavior: none; /* 스크롤하다 끝에 도달했을 때 스크롤 이벤트를 부모에게 전달하지 않음. */
`;

export const MainContentHeaderHorizontalLine = styled.hr`
  width: 100%;
  border: 0.02vw solid var(--base-color);
  filter: brightness(90%);
  ${(props) =>
    props.marginTop !== undefined
      ? css`
          margin-top: ${(props) => props.marginTop};
        `
      : null}
  ${(props) =>
    props.marginBottom !== undefined
      ? css`
          margin-bottom: ${(props) => props.marginBottom};
        `
      : null}
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  margin-left: ${(props) => props.marginLeft};
`;

export const FilterItem = styled.span`
  margin: 0 0.3vw;
  height: 2.7vw;
  padding: 0.1vw 0;
  margin-left: ${(props) => props.marginLeft};

  @media screen and (max-width: 768px) {
    font-size: 1.2vw;
  }
  @media screen and (min-width: 769px) {
    font-size: 0.7vw;
  }

  display: flex;
  flex-direction: row;
  align-items: center;
  > span {
    margin: 0 0.3vw;
  }

  > #subtitle {
    width: 6vw;
    text-align: right;
    padding-right: 1vw;
  }
`;

export const InputArea = styled.div`
  width: ${(props) => props.width};
  display: flex;
  justify-content: center;
  margin-left: ${(props) => props.leftMargin};

  @media screen and (max-width: 768px) {
    margin-bottom: 1vw;
    font-size: 1.7vw;
  }
  @media screen and (min-width: 769px) {
    margin-bottom: 0.5vw;
    font-size: 0.7vw;
  }

  & .row1 {
    @media screen and (max-width: 768px) {
      flex: 0 0 14vw;
    }
    @media screen and (min-width: 769px) {
      flex: 0 0 5vw;
    }

    display: flex;
    flex-direction: column;
    justify-content: center;

    & label {
      display: block;
      text-align: right;
      margin: 0.6vw 0.2vw;
    }
  }
  & .row2 {
    flex-grow: 1;

    display: flex;
    flex-direction: column;
    margin-left: 2vw;
    align-items: flex-start;
    & ${InputField1}, ${TextArea1} {
      @media screen and (max-width: 768px) {
        border: 0.2vw solid #b8ceda;
      }
      @media screen and (min-width: 769px) {
        border: 0.1vw solid #b8ceda;
      }
    }
  }
  & .row3 {
    @media screen and (max-width: 768px) {
      flex: 0 0 14vw;
    }
    @media screen and (min-width: 769px) {
      flex: 0 0 5vw;
    }
  }
`;

export const ACLArea = styled.div`
  width: 70%;
  width: ${(props) => props.width};
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: ${(props) => props.leftMargin};
  margin-bottom: 1vw;

  @media screen and (max-width: 768px) {
    font-size: 1.7vw;
  }
  @media screen and (min-width: 769px) {
    font-size: 0.7vw;
  }

  > #title {
    display: flex;
    margin-bottom: 0.5vw;
    > label {
      @media screen and (max-width: 768px) {
        flex: 0 0 8.5vw;
        margin: 1vw 0.7vw;
      }
      @media screen and (min-width: 769px) {
        flex: 0 0 4.5vw;
        margin: 0.6vw 0.2vw;
      }

      text-align: right;
    }
    > span {
      flex: 1;
    }
  }
`;

export const ACLGroupArea = styled.div`
  diplay: flex;
  flex-direction: column;
  margin-left: 3.5vw;
  margin-bottom: 0.8vw;
  margin-top: 0.4vw;
  > #group-title {
    display: flex;
    flex-direction: row;
    > label {
      font-weight: bold;
    }
  }

  > div {
    display: flex;
  }
`;

export const ACLItemTable = styled.div`
  diplay: flex;
  flex-wrap: wrap;
  margin: 0.8vw 0 1vw 2vw;
  > #item-title {
    display: flex;
    margin: 0.4vw 0.8vw;
  }
`;

export const SettingGroupArea = styled.div`
  diplay: flex;
  flex-direction: column;
  margin-left: ${(props) => props.leftMargin};
  margin-bottom: 0.8vw;
  margin-top: 0.4vw;
  > #title {
    display: flex;
    flex-direction: row;

    @media screen and (max-width: 768px) {
      font-size: 1.8vw;
    }
    @media screen and (min-width: 769px) {
      font-size: 0.7vw;
    }

    > label {
      font-weight: bold;
      color: var(--primary-color);
    }
  }
`;

export const SettingItemArea = styled.div`
  diplay: flex;
  align-items: center;
  margin: 0.5vw 0 0
    ${(props) => (props.leftMargin !== undefined ? props.leftMargin : '2vw')};
  margin-bottom: ${(props) =>
    props.bottomMargin !== undefined ? props.bottomMargin : '2vw'};

  @media screen and (max-width: 768px) {
    font-size: 1.8vw;
  }
  @media screen and (min-width: 769px) {
    font-size: 0.7vw;
  }

  > #item-part1 {
    display: inline-block;
    margin-right: ${(props) =>
      props.itemMarginRight !== undefined ? props.itemMarginRight : '2vw'};
  }
  > #item-part2 {
    display: inline-block;
    > div {
      display: inline-block;
    }
  }
  > #item-part3 {
    flex: 0 0 10vw;
    display: inline-block;
    > div {
      display: inline-block;
    }
  }
`;
