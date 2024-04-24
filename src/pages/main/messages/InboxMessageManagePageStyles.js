import styled from 'styled-components';

import InputField1 from '../../../components/InputField1';
import TextArea1 from '../../../components/TextArea1';

export const OptionItem = styled.span`
@media screen and (max-width:768px) {
  height: 3.7vw;
  padding: 0.4vw 0;
  font-size: 1.4vw;
}
@media screen and (min-width:769px) {
  height: 2.7vw;
  padding: 0.1vw 0;
  font-size: 0.7vw;
}

  display: flex;
  flex-direction: row;
  align-items: center;

  > #option_title {
    text-align: right;
    @media screen and (max-width:768px) {
      flex: 0 0 14vw;
    }
    @media screen and (min-width:769px) {
      flex: 0 0 7vw;
    }
  }
  > #col1 {
    margin-left: 3vw;
    max-width: 30vw;
  }
  > #sub_col1 {
    margin-left: 1vw;
  }
  > #col2 {
    margin-left: 0.5vw;
  }
`;

export const InputArea = styled.div`
  width: ${props=>props.width};
  display: flex;
  justify-content: center;
  margin-left: ${props=>props.leftMargin};

  @media screen and (max-width:768px) {
    margin-bottom: 1vw;
    font-size: 1.7vw;
  }
  @media screen and (min-width:769px) {
    margin-bottom: 0.5vw;
    font-size: 0.7vw;
  }

  & .row1 {
    flex: 0 0 5vw;

    display: flex;
    flex-direction: column;

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
      border: 0.1vw solid #b8ceda;
    }
  }
  & .row3 {
    flex: 0 0 5vw;
  }
`;