import styled,{css} from 'styled-components';

export const StWrapper = styled.main`
    display: flex;
    flex-direction: column;
    ${(props)=>props.width!==undefined?css`width: ${props.width};`:css`width: 25vw;`}
    ${(props)=>props.minHeight!==undefined?css`min-height: ${props.minHeight};`:css`min-height: 15vw;`}
    margin: auto;
    color: #ffffff;
    text-align: center;
    border-radius: 0.5vw;
    background-color: #ffffff;
    border: 0.05vw solid var(--primary-color);
`;

export const StImage = styled.img`
  positon: absolute;
  width: 2vw;
  height: 2vw;
  animation: rotate_image 1s linear infinite;
  transform-origin: 50% 50%;

  @keyframes rotate_image{
  100% {
      transform: rotate(360deg);
    }
  }
`;