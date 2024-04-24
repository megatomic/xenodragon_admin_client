import React,{useEffect} from 'react';
import MediaQuery from 'react-responsive';
import * as mainStyled from '../MainPageStyles';
import * as contentStyled from '../MainContentStyles';
import * as styled from './UserManagePageStyles';
import Button1 from '../../../components/Button1';
import InputField1 from '../../../components/InputField1';
import CheckBox from '../../../components/CheckBox';


const titleText = '상세정보';

const ViewUserDetailInfoPanel = (props) => {
    return (
        <contentStyled.ContentWrapper>
            <contentStyled.ContentHeader>
                <span id='subtitle'>{`${props.title} > ${titleText}`}</span>
                <span>&nbsp;</span>
                <span id='button'><Button1 bgColor='var(--btn-confirm-color)' width='6vw' height='2vw'>적용</Button1></span>
                <span id='button'><Button1 bgColor='var(--btn-secondary-color)' width='6vw' height='2vw' onClick={(e)=>props.onExitEditUserMode(e)}>취소</Button1></span>
            </contentStyled.ContentHeader>
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />

            <contentStyled.ContentBody>
                <br /><br />
            <styled.ItemGroup>
                <div id='group-title'>
                    <div><span>*기본 정보</span></div>
                    <div></div>
                </div>
                <styled.ItemTable>
                    <div id='item'>
                        <div id='item-name'>
                            <p>유저ID</p>
                        </div>
                        <div id='item-value'>
                            <p>Bale</p>
                        </div>
                    </div>
                    <div id='item'>
                        <div id='item-name'>
                            <p>닉네임</p>
                        </div>
                        <div id='item-value'>
                            <p>박윤석</p>
                        </div>
                    </div>
                </styled.ItemTable>
            </styled.ItemGroup>
            <br />
            <styled.ItemGroup>
                <div id='group-title'>
                    <div><span>*주요 재화</span></div>
                    <div></div>
                </div>
                <styled.ItemTable>
                    <div id='item'>
                        <div id='item-name'>
                            <p>골드</p>
                        </div>
                        <div id='item-value'>
                            <p>200</p>
                        </div>
                        <div id='item-action'>
                            <Button1 bgColor='var(--btn-confirm-color)' width='3.5vw' height='1.6vw'>변경</Button1>
                        </div>
                    </div>
                    <div id='item'>
                        <div id='item-name'>
                            <p>젬</p>
                        </div>
                        <div id='item-value'>
                            <p>50</p>
                        </div>
                        <div id='item-action'>
                            <Button1 bgColor='var(--btn-confirm-color)' width='3.5vw' height='1.6vw'>변경</Button1>
                        </div>
                    </div>
                    <div id='item'>
                        <div id='item-name'>
                            <p>에너지</p>
                        </div>
                        <div id='item-value'>
                            <p>5</p>
                        </div>
                        <div id='item-action'>
                            <Button1 bgColor='var(--btn-confirm-color)' width='3.5vw' height='1.6vw'>변경</Button1>
                        </div>
                    </div>
                </styled.ItemTable>
            </styled.ItemGroup>
            <br />
            <contentStyled.MainContentHeaderHorizontalLine marginTop='0.5vw' />
            <br />

            </contentStyled.ContentBody>
        </contentStyled.ContentWrapper>
    )
};

export default ViewUserDetailInfoPanel;