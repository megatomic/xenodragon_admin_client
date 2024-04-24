import styled, { css } from 'styled-components';

export const LoginPageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background-color: #d5e3ebff;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const LoginFormPanel = styled.div`

@media screen and (max-width:768px) {
  width: 80vw;
  height: 104vw;  
  border-radius: 1.5vw;
}

@media screen and (min-width:769px) {
  width: 23vw;
  height: 30vw;  
  border-radius: 0.5vw;
}

  background-color: #ffffff;
  

  display: flex;
  flex-direction: column;
`;


// [시작]:헤더
export const LoginHeader = styled.div`
  flex-grow: 0;
  flex-shrink: 0;

@media screen and (max-width:768px) {
  flex-basis: 22vw;
  border-top-left-radius: 1.5vw;
  border-top-right-radius: 1.5vw;
}

@media screen and (min-width:769px) {
  flex-basis: 6.5vw;
  border-top-left-radius: 0.5vw;
  border-top-right-radius: 0.5vw;
}

  background-color: var(--primary-color);
  color: #ffffff;
  text-align: center;

  display: flex;
  flex-direction: column;

  & .title {
    flex-grow: 1;

    text-align: center;
    font-family: 'SubtitleFont';

    @media screen and (max-width:768px) {
      font-size: 5vw;
  }
  @media screen and (min-width:769px) {
    font-size: 1.4vw;
  }
    

    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  & .subtitle {
    flex-grow: 1;
    flex-shrink: 0;

    @media screen and (max-width:768px) {
      flex-basis: 4.2vw;
      font-size: 3.5vw;
  }
  @media screen and (min-width:769px) {
    flex-basis: 1.2vw;
    font-size: 1vw;
  }

    font-family: 'SubtitleFont';
  }

  & .tail {
@media screen and (max-width:768px) {
    flex: 0 0 1.2vw;
}
@media screen and (min-width:769px) {
    flex: 0 0 1.2vw;
}
    background-color: var(--secondary-color);
  }
`;

// [끝]:헤더

export const LoginContent = styled.div`
  flex-grow: 1;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  & .loginText {
    font-family: 'SubtitleFont';

  @media screen and (max-width:768px) {
      font-size: 4.2vw;
      margin-bottom: 4.2vw;
  }
  @media screen and (min-width:769px) {
    font-size: 1.2vw;
    margin-bottom: 1.2vw;
  }

  }
`;

export const LoginFooter = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  
  @media screen and (max-width:768px) {
    flex-basis: 7.7vw;
    font-size: 2.8vw;
    border-bottom-left-radius: 1.5vw;
    border-bottom-right-radius: 1.5vw;
}
@media screen and (min-width:769px) {
  flex-basis: 2.2vw;
  font-size: 0.8vw;
  border-bottom-left-radius: 0.5vw;
  border-bottom-right-radius: 0.5vw;
}

  background-color: var(--primary-color);
  color: #ffffff;
  text-align: center;

  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const InputArea = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;

  & .row1 {
    @media screen and (max-width:768px) {
      margin-bottom: 1.75vw;
      font-size: 2.45vw;
      flex: 0 0 17.5vw;
  }
  @media screen and (min-width:769px) {
    margin-bottom: 0.5vw;
    font-size: 0.7vw;
    flex: 0 0 5vw;
  }

    display: flex;
    flex-direction: column;
    justify-content: center;

    & label {
      display: block;
      text-align: right;

      @media screen and (max-width:768px) {
        margin: 2.1vw 0.7vw;
    }
    @media screen and (min-width:769px) {
      margin: 0.6vw 0.2vw;
    }
      
    }
  }
  & .row2 {
    flex-grow: 1;

    display: flex;
    flex-direction: column;
    align-items: center;
    & InputField {
      @media screen and (max-width:768px) {
        border: 0.35vw solid #b8ceda;
    }
    @media screen and (min-width:769px) {
      border: 0.1vw solid #b8ceda;
    }
    }
  }
  & .row3 {
    @media screen and (max-width:768px) {
      flex: 0 0 17.5vw;
  }
  @media screen and (min-width:769px) {
    flex: 0 0 5vw;
  }
  }
`;

export const InputField = styled.input`

@media screen and (max-width:768px) {
  width: 42vw;
  height: 7vw;
  margin: 0.7vw;
  font-size: 2.1vw;
  border: 0.28vw solid #b8ceda;
  border-radius: 0.7vw;
  padding: 0 1.4vw;
}
@media screen and (min-width:769px) {
  width: 12vw;
  height: 2vw;
  margin: 0.2vw;
  font-size: 0.6vw;
  border: 0.08vw solid #b8ceda;
  border-radius: 0.2vw;
  padding: 0 0.4vw;
}

  border: none;
  ::placeholder {
  }
`;

export const PWInputField = styled(InputField).attrs((props) => ({ type: 'password' }))``;

export const LinkText = styled.a`
  color: #0097a7ff;

  @media screen and (max-width:768px) {
    margin: 3.5vw;
    font-size: 2.45vw;
}
@media screen and (min-width:769px) {
  margin: 1vw;
  font-size: 0.7vw;
}
`;