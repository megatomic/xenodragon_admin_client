import React, { useState } from 'react';
import MediaQuery from 'react-responsive';
import { toast } from 'react-toastify';

import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './AccountManagePageStyles';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import CheckBox from '../../../components/CheckBox';

import useCommon from '../../../store/useCommonStorageManager';
import useAuth from '../../../store/useAuthDataManager';
import useAccount from '../../../store/useAccountDataManager';

import * as aclManager from '../../../common/js/aclManager';
import { useEffect } from 'react';

const titleText1 = '새 계정 추가';
const titleText2 = '계정 정보 보기/수정';
const aclInfoTable = aclManager.makeACLInfoTable();

const makeInitCheckListTable = (accountInfo) => {
  //console.log('aclInfoTable=', aclInfoTable);

  let initCheckListTable = [];
  let initCheckList;
  if (accountInfo === null) {
    for (let i = 0; i < aclInfoTable.length; i++) {
      initCheckList = [i === 0 || i === 8? false : true];
      for (let j = 0; j < aclInfoTable[i].aclUnitList.length; j++) {
        initCheckList.push(i === 0 || i === 8? false : true);
      }
      initCheckListTable.push(initCheckList);
    }
  } else {
    let aclObj = null;
    if (accountInfo.aclInfo !== null && accountInfo.aclInfo !== '{}') {
      aclObj = JSON.parse(accountInfo.aclInfo);
    }

    let initCheckList = [];
    let aclUnitValue;
    let aclCount;
    for (let i = 0; i < aclInfoTable.length; i++) {
      initCheckList = [false];
      aclCount = 0;
      for (let j = 0; j < aclInfoTable[i].aclUnitList.length; j++) {
        if (aclManager.getACLKey(i, j) !== null) {
          aclUnitValue = aclObj !== null ? aclManager.getACLUnitValue(aclObj, aclManager.getACLKey(i, j)) : 0;
          initCheckList.push(aclUnitValue === 1 ? true : false);
          aclCount = aclUnitValue ? aclCount + 1 : aclCount;
        } else {
          initCheckList.push(false);
        }
      }
      if (aclCount >= aclInfoTable[i].aclUnitList.length) {
        initCheckList[0] = true;
      }
      initCheckListTable.push(initCheckList);
    }
  }

  //console.log('initCheckListTable=',initCheckListTable);

  return initCheckListTable;
};

const adjustACL = (aclInfo) => {

  return aclManager.createAdjustedACLObj(aclInfo);
};

const RegisterNewAccountPanel = (props) => {
  const { authInfo, setAuthInfo } = useAuth();
  const { setStartLoading } = useCommon();
  const { requestNewAdmin, requestModifyAdminInfo } = useAccount();

  console.log('props.editInfo.accountInfo=',props.editInfo.accountInfo);
  
  const [accountID, setAccountID] = useState(props.editMode ? props.editInfo.accountInfo.accountID : 'joystar');
  const [accountNick, setAccountNick] = useState(props.editMode ? props.editInfo.accountInfo.accountNick : '안정환');
  const [accountPW, setAccountPW] = useState('');
  const [newAccountPW, setNewAccountPW] = useState('');
  const [accountPWConfirm, setAccountPWConfirm] = useState('');
  const [acl, setACL] = useState(props.editMode && props.editInfo.accountInfo.aclInfo !== '{}' ? adjustACL(JSON.parse(props.editInfo.accountInfo.aclInfo)) : aclManager.createBaseACLObj());
  const [subMenuOpen,setSubMenuOpen] = useState(false);

  const [serverCheckTable, setServerCheckTable] = useState(props.editMode ? JSON.parse(props.editInfo.accountInfo.serverACL):[1,1,1,1]);
  const [checkListTable, setCheckListTable] = useState(makeInitCheckListTable(null));
  const resetCheckList = (groupID, flag) => {
    const newCheckList = [...checkListTable[groupID]];
    newCheckList = newCheckList.map((el) => false);
    setCheckListTable((table) => (table[groupID] = newCheckList));
  };

  const onServerACLChanged = (serverIndex,e) => {
    const newTable = [...serverCheckTable];
    newTable[serverIndex] = (e.target.checked?1:0);
    setServerCheckTable(table=>newTable);
  };

  const onACLGroupCheckBoxChanged = (e, groupID, idx) => {
    let newCheckList = [...checkListTable[groupID]];
    if (idx === 0) {
      // master
      newCheckList = newCheckList.map((el) => e.target.checked);
    } else {
      newCheckList[idx] = e.target.checked;
      let checkedNum = 0;
      for (let i = 1; i <= checkListTable[groupID].length; i++) {
        if (newCheckList[i] === true) {
          checkedNum++;
        }
      }

      if (checkedNum + 1 === checkListTable[groupID].length) {
        newCheckList[0] = true;
      } else {
        newCheckList[0] = false;
      }
    }

    const newTable = checkListTable.map((list, idx) => (idx === groupID ? newCheckList : list));
    setCheckListTable(newTable);

    e.stopPropagation();
  };

  const onAccountIDChanged = (e) => {
    setAccountID(e.target.value);
  };

  const onAccountNickChanged = (e) => {
    setAccountNick(e.target.value);
  };

  const onAccountPWChanged = (e) => {
    setAccountPW(e.target.value);
  };

  const onNewAccountPWChanged = (e) => {
    setNewAccountPW(e.target.value);
  };

  const onAccountPWConfirmChanged = (e) => {
    setAccountPWConfirm(e.target.value);
  };

  const onApplyButtonClick = async (e) => {
    if (props.editMode === true) {
      if(accountPW.trim() !== "" && (newAccountPW.trim() === "" || accountPWConfirm.trim() === "")) {
        toast.error('변경할 새 암호 정보를 올바로 입력해주세요.');
        return;
      }

      if(newAccountPW.trim() !== accountPWConfirm.trim()) {
        toast.error('변경할 새 암호와 암호 확인이 일치하지 않습니다.');
        return;
      }

      if(accountPW.trim() !== "" && accountPW.trim() === newAccountPW.trim()) {
        toast.error('변경할 새 암호는 기존 암호와 달라야 합니다.');
        return;
      }


      props.onAccountEditModeChange(false);

      setStartLoading(true);

      const adminACLStr = JSON.stringify(acl);
      const serverACLStr = JSON.stringify(serverCheckTable);

      console.log('adminACLStr=', adminACLStr);
      const resultInfo = await requestModifyAdminInfo({ targetAccountID: accountID, targetAccountNick: accountNick, targetAccountPW: accountPW, targetNewAccountPW:newAccountPW, confirmAccountPW:accountPWConfirm, targetAccountACLStr: adminACLStr, targerAccountServerACLStr:serverACLStr });
      console.log(resultInfo);

      if (resultInfo.resultCode !== 0) {
        toast.error(resultInfo.message);
      } else {
        toast.info('계정정보가 수정되었습니다.');
      }
      setStartLoading(false);

      if (accountID === authInfo.accountInfo.accountID) {
        setAuthInfo({ ...authInfo, accountInfo: { ...authInfo.accountInfo, aclInfo: JSON.stringify(acl), accountNick } });
      }
    } else {
      if (accountID.trim() === '') {
        toast.error('계정ID가 올바르지 않습니다.');
        return;
      }

      if (accountPW.trim() !== accountPWConfirm.trim()) {
        toast.error('비밀번호와 비밀번호 확인이 서로 일치하지 않습니다.');
        return;
      }

      setStartLoading(true);

      const newAdminACLStr = JSON.stringify(acl);
      const newAdminServerACLStr = JSON.stringify(serverCheckTable);
      const resultInfo = await requestNewAdmin({ newAdminID: accountID, newAdminNick: accountNick, newAdminInitPW: accountPW, newAdminConfirmPW: accountPWConfirm, newAdminACLStr: newAdminACLStr, newAdminServerACLStr:newAdminServerACLStr });
      console.log(resultInfo);

      if (resultInfo.resultCode !== 0) {
        toast.error(resultInfo.message);
      } else {
        toast.info('새 계정이 등록되었습니다.');
      }
      setStartLoading(false);
    }
  };

  const onCancelButtonClick = async (e) => {
    props.onAccountEditModeChange(false);
  };

  const onSubMenuClick = (e) => {
    setSubMenuOpen(state=>!subMenuOpen);
  };

  useEffect(()=> {
    props.onSubMenuOpenClicked(subMenuOpen);
  },[subMenuOpen]);

  useEffect(() => {

    console.log('checkListTable=',checkListTable);

    if (props.editMode === true) {
      setCheckListTable(makeInitCheckListTable(props.editInfo.accountInfo));
    } else {
      setCheckListTable(makeInitCheckListTable(null));
    }
  }, []);

  useEffect(() => {

    let newACL = null;
    let groupID=0;
    for(let checkList of checkListTable) {
      const aclUnitList = [];
      for (let i = 1; i < checkList.length; i++) {
        aclUnitList.push({ k: aclManager.getACLKey(groupID, i - 1), v: checkList[i] === true ? 1 : 0 });
      }
      newACL = aclManager.updateACL(acl, aclUnitList);
      groupID++;
    }

    if (newACL !== null) {
      setACL(oldACl => newACL);

      console.log('newACL=',newACL);
    }
  },[checkListTable]);

  return (
    <contentStyled.ContentWrapper>
      <contentStyled.ContentHeader>
        <MediaQuery maxWidth={768}>
            &nbsp;&nbsp;<i className='fas fa-bars' style={{fontSize:'3vw'}} onClick={(e)=>onSubMenuClick(e)} />
        </MediaQuery>
        <span id="subtitle">{props.editMode ? `${props.editInfo.parentTitle} > ${titleText2}` : titleText1}</span>
        <span>&nbsp;</span>
        <span id="button">
          <Button1 responsive='1.6' bgColor="var(--btn-confirm-color)" width="6vw" height="2vw" onClick={(e) => onApplyButtonClick(e)}>
            {props.editMode ? '수정하기' : '등록하기'}
          </Button1>
        </span>
        <span id="button">
          <Button1 responsive='1.6' bgColor="var(--btn-secondary-color)" width="6vw" height="2vw" onClick={(e) => onCancelButtonClick(e)}>
            취소하기
          </Button1>
        </span>
      </contentStyled.ContentHeader>
      <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />

      <contentStyled.ContentBody>
        <br />
        <br />
        <contentStyled.InputArea leftMargin="4vw" width="70%">
          <span className="row1">
            <label>계정ID</label>
            <label>닉네임</label>
          </span>
          <span className="row2">
            <InputField1 responsive='1.6' width="22vw" height="2vw" placeholder={'4자이상 20자 미만'} value={accountID} readOnly={props.editMode} onChange={(e) => onAccountIDChanged(e)} />
            <InputField1 responsive='1.6' width="22vw" height="2vw" placeholder={'4자이상'} value={accountNick} onChange={(e) => onAccountNickChanged(e)} />
          </span>
          <span className="row3">&nbsp;</span>
        </contentStyled.InputArea>
        <br />
        <contentStyled.InputArea leftMargin="4vw" width="70%">
          <span className="row1">
            {props.editMode === true?(
                <>
                  <label>기존 비밀번호</label>
                  <label>새 비밀번호</label>
                </>
              ):(
                <label>초기 비밀번호</label>
            )}            
            <label>비밀번호 확인</label>
          </span>
          <span className="row2">
            <InputField1 responsive='1.6' type="password" width="22vw" height="2vw" placeholder={'대소문자, 영숫자 및 특수기호 조합'} value={accountPW} onChange={(e) => onAccountPWChanged(e)} />
            {props.editMode === true?(<InputField1 responsive='1.6' type="password" width="22vw" height="2vw" placeholder={'대소문자, 영숫자 및 특수기호 조합'} value={newAccountPW} onChange={(e) => onNewAccountPWChanged(e)} />
            ):(<></>)}
            <InputField1 responsive='1.6' type="password" width="22vw" height="2vw" placeholder={'대소문자, 영숫자 및 특수기호 조합'} value={accountPWConfirm} onChange={(e) => onAccountPWConfirmChanged(e)} />
          </span>
          <span className="row3">&nbsp;</span>
        </contentStyled.InputArea>
        <br />
        <contentStyled.MainContentHeaderHorizontalLine marginTop="0.5vw" />
        <br />
        <contentStyled.ACLArea leftMargin="4vw" width="90%">
          <div id="title">
            <label>접근 허용 서버</label>
            <div></div>
          </div>
          <contentStyled.ACLGroupArea>
          <contentStyled.ACLItemTable>
            <div id="item-title">
              <CheckBox
                checked={serverCheckTable[0]===1?true:false}
                checkChanged={(e) => onServerACLChanged(0,e)}
                text={'로컬'}
                textHidden={false}
                fontSize={'0.7vw'}
                checkColor={'var(--primary-color)'}
              />
            </div>
            <div id="item-title">
              <CheckBox
                checked={serverCheckTable[1]===1?true:false}
                checkChanged={(e) => onServerACLChanged(1,e)}
                text={'개발'}
                textHidden={false}
                fontSize={'0.7vw'}
                checkColor={'var(--primary-color)'}
              />
            </div>
            <div id="item-title">
              <CheckBox
                checked={serverCheckTable[2]===1?true:false}
                checkChanged={(e) => onServerACLChanged(2,e)}
                text={'QA'}
                textHidden={false}
                fontSize={'0.7vw'}
                checkColor={'var(--primary-color)'}
              />
            </div>
            <div id="item-title">
              <CheckBox
                checked={serverCheckTable[3]===1?true:false}
                checkChanged={(e) => onServerACLChanged(3,e)}
                text={'라이브'}
                textHidden={false}
                fontSize={'0.7vw'}
                checkColor={'var(--primary-color)'}
              />
            </div>
          </contentStyled.ACLItemTable>
          </contentStyled.ACLGroupArea>
        </contentStyled.ACLArea>
        <contentStyled.ACLArea leftMargin="4vw" width="90%">
          <div id="title">
            <label>접근 권한</label>
            <div></div>
          </div>
          {aclInfoTable.map((itemGroup, idx) => {
            return (
              <contentStyled.ACLGroupArea>
                <div id="group-title">
                  <CheckBox
                    key={itemGroup.title + idx}
                    checked={checkListTable[idx][0]}
                    checkChanged={(e) => onACLGroupCheckBoxChanged(e, idx, 0)}
                    text={'*' + itemGroup.title}
                    textHidden={false}
                    fontSize={'0.7vw'}
                    checkColor={'var(--primary-color)'}
                  />
                  <div></div>
                </div>
                <contentStyled.ACLItemTable key={itemGroup.title}>
                  {itemGroup.aclUnitList.map((item, idx2) => {
                    return (
                      <div id="item-title" key={itemGroup.title + item.id}>
                        <CheckBox
                          key={itemGroup.title + item.id + idx2}
                          checked={checkListTable[idx][idx2 + 1]}
                          checkChanged={(e) => onACLGroupCheckBoxChanged(e, idx, idx2 + 1)}
                          text={item.name}
                          textHidden={false}
                          fontSize={'0.7vw'}
                          checkColor={'var(--primary-color)'}
                        />
                      </div>
                    );
                  })}
                </contentStyled.ACLItemTable>
              </contentStyled.ACLGroupArea>
            );
          })}
        </contentStyled.ACLArea>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </contentStyled.ContentBody>
    </contentStyled.ContentWrapper>
  );
};

export default RegisterNewAccountPanel;
