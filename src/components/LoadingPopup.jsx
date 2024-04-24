import React,{useRef} from 'react';
import styled from 'styled-components';
import * as commonStyled from '../styles/commonStyles';
import Modal from './Modal';


const LoadingPopup = ({shown}) => {

    const loadingRef = useRef(null);

    const setBackground = '';
  
    if(shown === undefined || shown === false) {
        if(loadingRef !== null && loadingRef.current !== null) {
            loadingRef.current.style.animationPlayState = 'paused';
        }
        return null;
    }

    return (
      <Modal>
        <commonStyled.StImage src="/loading.png" ref={loadingRef} />
      </Modal>
    );
  
    return <p></p>;
  };
  
  export default LoadingPopup;