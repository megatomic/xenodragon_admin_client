const settings = {
    MASTER_ID: 'MASTER',
    AdminServerHostURL: 'http://localhost:3001/api',
    PushServerHostURL: {local:'http://pushserver-dev.xenodragon.io:14723',dev:'http://pushserver-dev.xenodragon.io:14723',qa:'http://pushserver-dev.xenodragon.io:14723', live:'http://pushserver.xenodragon.io:14723'},
    GameServerAdminHostURL: {local:'http://172.30.1.126:6060/api', dev:'http://admin-dev.gameserver.xenodragon.io/api', qa:'http://admin-qa.gameserver.xenodragon.io/api', live:'http://admin-live.gameserver.xenodragon.io/api'}
    //HostURL: '/api'
};

export default settings;