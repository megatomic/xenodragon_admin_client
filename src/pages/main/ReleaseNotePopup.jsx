import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as contentStyled from './MainContentStyles';
import * as commonStyled from '../../styles/commonStyles';
import dayjs from 'dayjs';
import * as constants from '../../common/constants';
import Modal from '../../components/Modal';
import Button1 from '../../components/Button1';

const StTitlePanel = styled.div`
  flex: 0 0 3vw;
  width: 100%;
  background-color: var(--primary-color);
  border-top-left-radius: 0.4vw;
  border-top-right-radius: 0.4vw;

  > p {
    color: #ffffff;
    font-size: 0.8vw;
    padding: 0.8vw 0;
  }
`;

const StBodyPanel = styled.div`
  flex: 1;
  padding: 0.4vw 0.4vw;

  display: flex;
  flex-direction: column;
  justify-content: center;
  > #content {
    color: var(--secondary-color);
    vertical-align: center;
  }
`;

const StButtonGroupPanel = styled.div`
  flex: 0 0 4vw;
  > #button-group button {
    margin: 0.3vw 1vw;
  }
`;

const ReleaseNotePopup = (props) => {
  useEffect(() => {
    console.log(`STAGE:${process.env.REACT_APP_STAGE}`);
  }, []);

  if (props.shown === undefined || props.shown === false) {
    return null;
  } else {
  }

  return (
    <Modal onClose={null}>
      <commonStyled.StWrapper width="26vw" minHeight="15vw">
        <StTitlePanel>
          <p>릴리즈 노트 (&nbsp;v{constants.TOOL_VERSION}&nbsp;)</p>
        </StTitlePanel>
        <StBodyPanel>
          <contentStyled.SettingGroupArea leftMargin="0vw" width="90%">
            <contentStyled.SettingItemArea
              leftMargin="0vw"
              bottomMargin="0vw"
              itemMarginRight="1vw"
            >
              <div
                id="item-part1"
                style={{
                  width: '90%',
                  verticalAlign: 'middle',
                  color: 'var(--primary-color)',
                  fontWeight: 'bold',
                }}
              >
                <p>* 마켓 화이트리스트 관리 기능 추가.</p>
                <p>* NFT마켓 유저 조회 기능 추가.</p>
              </div>
            </contentStyled.SettingItemArea>
          </contentStyled.SettingGroupArea>
        </StBodyPanel>
        <StButtonGroupPanel>
          <div id="button-group">
            <Button1
              bgColor="var(--btn-confirm-color)"
              disable
              width="8vw"
              height="2.5vw"
              onClick={(e) => props.confirmClick(e)}
            >
              확인
            </Button1>
          </div>
        </StButtonGroupPanel>
      </commonStyled.StWrapper>
    </Modal>
  );
};

export default ReleaseNotePopup;
