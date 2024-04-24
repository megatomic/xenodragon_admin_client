import styled,{css} from 'styled-components';

export const MainPageWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background-color: var(--background-color);

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const MainHeaderPanel = styled.div`
  display: flex;
@media screen and (max-width:768px) {
  flex: 0 0 7vw;
}
@media screen and (min-width:769px) {
  flex: 0 0 4.5vw;
}

  position: relative;
  z-index:1;

  > .deco {
    flex: 0 0 0.6vw;
    background-color: var(--secondary-color);
  }

  > .header {
    flex: 1;
    background-color: var(--primary-color);
  }
`;

export const MainFormPanel = styled.div`
@media screen and (max-width:768px) {
  width: 100%;
  height: 100%;
}
@media screen and (min-width:769px) {
  width: 80vw;
  height: 45vw;

  margin-top: 30px;
  margin-bottom: 30px;
}

  background-color: var(--base-color);
  display: flex;
  flex-direction: column;

  > ${MainHeaderPanel} {
    display: flex;
    flex-direction: column;
  }
  > .content {
    display: flex;
    flex-direction: row;

    height: 100%;
  }
`;

export const MainMenuPanel = styled.div`
  height: 100%;

  display: flex;
  flex-direction: row;

  @media screen and (max-width:768px) {
    justify-content: space-between;
  }
  @media screen and (min-width:769px) {
    justify-content: space-between;
  }

  align-items: center;

  > .menu1, .menu2, .menu3, .menu4, .menu5, .menu6, .menu7, .menu8, .menu9, .menu10 {
    flex-basis: auto;
    text-align: center;
    padding: 0.4vw;

    color: var(--primary-text-color);
    height: 2vw;
  }

  > .login-info {
    @media screen and (max-width:768px) {
      flex: 0 0  26vw;
      padding: 2vw 2vw 2vw 1vw;
    }
    @media screen and (min-width:769px) {
      flex: 0 0 17vw;
      padding: 1vw 1vw 1vw 0.5vw;
    }

    
    text-align: right;
    color: var(--primary-text-color);

    > span {
      margin-right: 1vw;
      @media screen and (max-width:768px) {
        font-size: 1.6vw;
      }
      @media screen and (min-width:769px) {
        font-size: 0.7vw;
      }
      
    }
  }
`;

export const MainTitlePanel = styled.div`
@media screen and (max-width:768px) {
  flex: 0 0 24vw;
  padding: 2vw;
}
@media screen and (min-width:769px) {
  flex: 0 0 12vw;
  padding: 1vw;
}

  color: var(--primary-text-color);

  & > #title {
    font-family: 'SubtitleFont';
    @media screen and (max-width:768px) {
      font-size: 2vw;
    }
    @media screen and (min-width:769px) {
      font-size: 1vw;
    }
    
  }
  & > #ver {
    font-family: 'SubtitleFont';
    @media screen and (max-width:768px) {
      font-size: 1.4vw;
    }
    @media screen and (min-width:769px) {
      font-size: 0.7vw;
    }
  }
`;

export const SubMenuPanel = styled.div`
  flex: 0 0 14vw;
  background-color: #ffffff;
  display: flex;

@media screen and (max-width:768px) {
  position: absolute;
  width: 50vw;
  height: 100vh;
  z-index:1;
}
@media screen and (min-width:769px) {
  position: relative;
}
  
  flex-direction: column;

  > #deco {
    flex: 0 0 0.5vw;
    background-color: var(--primary-color);
    filter: brightness(85%);
  }

  > #deco2 {
    flex: 0 0 1vw;
    background-color: #ffffff;
  }

  > #sub-menu {
    flex: 1;
  }

  > #footer {
    flex: 0 0 16vw;
    font-size: 4vw;
    padding-left: 1vw;
  }
`;

export const SubMenuItem = styled.div`
  background-color: #ffffff;
  text-align: center;

  @media screen and (max-width:768px) {
    font-size: 1.9vw;
    margin: 1.5vw 0;
    padding: 1.5vw 0;
  }
  @media screen and (min-width:769px) {
    font-size: 0.7vw;
    margin: 0.5vw 0;
    padding: 0.35vw 0;
  }

  ${(props) =>
    props.active === true
      ? css`
          background-color: var(--third-color);
          color: #ffffff;
          cursor: default;
        `
      : css`
          
        `}
  &:hover {
    ${(props)=>props.active === true ? css `
    filter: brightness(100%);
    pointer-events: none;
    `:css`
    filter: brightness(90%);
    cursor: pointer;
    `}
  }
`;

export const MainContentPanel = styled.div`
  flex: 1;
  background-color: var(--base-color);

  > div {

    @media screen and (max-width:768px) {
      width: 100%;
      height: 100%;
      margin: 0vw 0vw;
    }
    @media screen and (min-width:769px) {
      width: 97%;
      height: 96%;
      margin: 0.8vw 0.8vw;
    }

    
    padding: 1vw 1vw;
    background-color: #ffffff;
    border-radius: 0.5vw;
  }
`;

export const MainMenuItem = styled.div`
  self-align: center;
  margin: 0 0.2vw;
  font-size: 0.8vw;
  padding: 0.3vw 1.5vw;
  height: 1.5vw;
  cursor: pointer;
  border-radius: 0.3vw;
  ${(props) =>
    props.active === true
      ? css`
          background-color: var(--secondary-color);
        `
      : css`
          background-color: var(--primary-color);
        `}
  &:hover {
    filter: brightness(110%);
  }
`;

export const SubmenuItemHorizontalLine = styled.hr`
  width: 90%;
  margin: 1vw 0.7vw;
  border: 0.02vw solid var(--base-color);
  filter: brightness(90%);
`;