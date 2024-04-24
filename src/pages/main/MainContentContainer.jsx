import React, {useState} from 'react';
import * as mainStyled from './MainPageStyles';
import SubMenuPanel from './SubMenuPanel';

const MainContentContainer = ({subMenuTable}) => {
    const [activeSubMenuID, setActiveSubMenuID] = useState(1);

    return (
        <React.Fragment>
            <SubMenuPanel activeSubMenuID={activeSubMenuID} subMenuTable={subMenuTable} onMenuClick={(menuID)=>setActiveSubMenuID(menuID)} />
            <mainStyled.MainContentPanel>
                <div>

                </div>
            </mainStyled.MainContentPanel>
        </React.Fragment>
    )
};

export default MainContentContainer;