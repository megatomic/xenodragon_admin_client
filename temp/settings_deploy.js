const settings = {
    MASTER_ID: 'MASTER',
    AdminServerHostURL: '/api',
    PushServerHostURL: {local:'http://pushserver-dev.xenodragon.io:14723',dev:'http://pushserver-dev.xenodragon.io:14723',qa:'http://pushserver-dev.xenodragon.io:14723', live:'http://pushserver.xenodragon.io:14723'},
    GameServerAdminHostURL: {local:'http://221.150.201.226:6060/api', dev:'http://admin-dev.gameserver.xenodragon.io/api', qa:'http://admin-qa.gameserver.xenodragon.io/api', live:'http://admin-live.gameserver.xenodragon.io/api'}
};

export default settings;