import styled from 'styled-components';

import InputField1 from '../../../components/InputField1';
import TextArea1 from '../../../components/TextArea1';

export const OptionItem = styled.span`
  height: 2.7vw;
  padding: 0.1vw 0;
  font-size: 0.7vw;

  display: flex;
  flex-direction: row;
  align-items: center;

  > #option_title {
    text-align: right;
    flex: 0 0 7vw;
  }
  > #col1 {
    margin-left: 3vw;
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
  margin-bottom: 0.5vw;
  font-size: 0.7vw;

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