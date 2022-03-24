version += ' mag-0304';
var stb = null;
var stbHDMIsupport = false;//true;
var keys = {
    RIGHT: 39,
    LEFT: 37,
    DOWN: 40,
    UP: 38,
    RETURN: 8,
    EXIT: 27,
    TOOLS: 122,
    FF: 70,
    RW: 66,
    NEXT: 34,
    PREV: 33,
    ENTER: 13,
    RED: 112,
    GREEN: 113,
    YELLOW: 114,
    BLUE: 115,
    CH_LIST: 0, //
    CH_UP: 9,
    CH_DOWN: 1009,
    N0: 48,
    N1: 49,
    N2: 50,
    N3: 51,
    N4: 52,
    N5: 53,
    N6: 54,
    N7: 55,
    N8: 56,
    N9: 57,
    PRECH: 116,
    POWER: 85,
    //SMART: 36,
    PLAY: 82,
    STOP: 83,
    PAUSE: 0,
    //SUBT: 76,
    INFO: 89,
    REC: 0, // no rec
    MUTE: 192,
    VOL_UP: 107,
    VOL_DOWN: 109,
    EPG: 119,
    ZOOM: 117,
    ASPECT: 123,
    AUDIO: 71,
    SETUP: 0,
    PIP: 0, // no pip
};
var strInfo = 'INFO',
    strEPG = '',
    strEXIT = 'EXIT',
    strENTER = 'OK',
    strTools = 'MENU',
    strPip = '',
    strAspect = 'APP',
    strZoom = 'ZOOM',
    strAudio = 'AUDIO',
    strSubt = '',
    strPRECH = 'DEL',
    strRETURN = 'BACK',
    strSETUP = '';

function stbEventToKeyCode(event){
    var code = event.keyCode || event.which;
    if((code == keys.CH_UP) && (event.shiftKey))
        code = keys.CH_DOWN
    return code;
}
sFavorites = 0;
function stbGetItem(keyName){ return stb.LoadUserData(keyName); }
function stbSetItem(keyName, keyValue){ stb.SaveUserData(keyName, keyValue); }
function stbDelItem(keyName){ stbSetItem(keyName, ''); }
// function stbClearAllItems(){ stb.ResetUserFs(); }
delete stbClearAllItems;
delete stbGetAllItems;
function stbExit(){ stb.LoadURL('file:///home/web/index.html'); }
function stbPlay(url, pos){
    if(pos) url += ' position:'+pos;
    var u = url;
    if(u.indexOf('m3u8') == -1) u = 'ffrt2 ' + u;
    stb.Play(u);
    $('#buffering').show();
    $('#video_res').text('');
}
function stbStop(){ stb.Stop(); }
function stbPause(){ stb.Pause(); }
function stbContinue(){ stb.Continue(); }
function stbIsPlaying(){ return stb.IsPlaying(); }
function stbToFullScreen(){ stb.SetPIG(1, 1, 0, 0); }
function stbToggleMute(){ stb.SetMute(!stb.GetMute()); }
function stbGetVolume(){ return stb.GetVolume(); }
function stbSetVolume(value){ stb.SetVolume(value); stb.SetMute(false); }
function stbGetPosTime(){ return stb.GetPosTime(); }
function stbSetPosTime(value){ stb.SetPosTime(value); }
function stbGetLen(){ return stb.GetMediaLen(); }
function stbSetWindow(){
    var vm = stb.RDir('vmode');
    // log("info", "stb.RDir('vmode') " + vm);
    if(vm.indexOf('2160') != -1)
        stb.SetViewport(1536, 864, sListPos ? 2274 : 30, 150);
    else if(vm.indexOf('1080') != -1)
        stb.SetViewport(768, 432, sListPos ? 1137 : 15, 75);
    else if(vm.indexOf('720') != -1)
        stb.SetViewport(512, 288, sListPos ? 758 : 10, 50);
    else
        stb.SetViewport(288, 162, sListPos ? 425 : 6, 28);
}

function stbInfo(){
    $('#listAbout').append(
        '<br/>Version: ' + stb.Version()+
        '<br/>DeviceModel: ' + stb.GetDeviceModel()+
        '<br/>DeviceVendor: ' + stb.GetDeviceVendor()+
        '<br/>SerialNumber: ' + stb.GetDeviceSerialNumber()+
        '<br/>DeviceVersionHardware: ' + stb.GetDeviceVersionHardware()+
        '<br/>DeviceMacAddress: ' + stb.GetDeviceMacAddress()+
        '<br/>DeviceImageVersion: ' + stb.GetDeviceImageVersion()+
        '<br/>DeviceImageDesc: ' + stb.GetDeviceImageDesc()+
        '<br/>DeviceImageVersionCurrent: ' + stb.GetDeviceImageVersionCurrent()+
        '<br/>Browser: ' + ((navigator.userAgent.search(/opera/i) != -1) ? 'Opera' : 'WebKit' )+
        '<br/>IpAddress: ' + (stb.RDir('IPAddress')||stb.RDir('WiFi_ip'))+
        '<br/>vmode: ' + stb.RDir('vmode')
    );
}
function stbToggleZoom(){
    var aa = stb.GetAspect(), nibble1 = aa & 0xF, nibble2 = aa & 0xF0, z = nibble2 >> 4;
    showSelectBox(z, ['as is', 'Letter box', 'Pan&amp;Scan' , 'combined', 'enlarged', 'optimal'], function(val){
        stb.SetAspect(nibble1 + (val << 4));
        saveCHarr('aAspects', nibble1 + (val << 4));
    });
}
function stbToggleAspectRatio(){
    var aa = stb.GetAspect(), nibble1 = aa & 0xF, nibble2 = aa & 0xF0, z = nibble1;
    showSelectBox(z, ['Auto', '20x9', '16x9', '4x3'], function(val){
        stb.SetAspect(nibble2 + val);
        saveCHarr('aAspects', nibble2 + val);
    });
}
function stbToggleAudioTrack(){
    try{ var aa = eval(stb.GetAudioPIDs()); }catch(e){ var aa=[] }
    var pid = stb.GetAudioPID(), z = 0, al = [];
    // log("info", 'get '+pid+'-'+JSON.stringify(aa));
    aa.forEach(function(val, i){
        if(pid == val.pid) z = i;
        al.push(_('Audio')+' ' + (i+1) + '/' + aa.length + ' ('  + val.lang.join(',') + ')');
    });
    showSelectBox(z, al, function(val){ stb.SetAudioPID(aa[val].pid); saveCHarr('aAudios', aa[val].pid); }, -1);
}
var _SetSubtitles = false;
function _setSubtitleTrack(ind){
    _SetSubtitles = ind>0;
    stb.SetSubtitles(_SetSubtitles);
    if(_SetSubtitles) stb.SetSubtitlePID(ind);
    // log("info", 'setSubtitlePID '+ind);
}
function stbToggleSubtitle(){
    try{ var aa = eval(stb.GetSubtitlePIDs()); }catch(e){ var aa=[] }
    var pid = stb.GetSubtitlePID(), z = 0, al = [aa.length?_('Off'):_('Not found')];
    // log("info", 'get '+pid+'-'+JSON.stringify(aa));
    aa.forEach(function(val, i){
        if(_SetSubtitles && pid==val.pid) z = i+1;
        al.push(_('Subtitle')+' ' + (i+1) + '/' + aa.length + ' ('  + val.lang.join(',') + ')');
    });
    showSelectBox(z, al, function(val){
        val = val?aa[val-1].pid:0;
        _setSubtitleTrack(val);
        saveCHarr('aSubs', val);
    }, -1);
}
function stbAudioTracksExists(){ try{ var aa = eval(stb.GetAudioPIDs()); return aa.length>1; }catch(e){ return false; } }
function stbSubtitleExists(){ try{ var aa = eval(stb.GetSubtitlePIDs()); return aa.length; }catch(e){ return false; } }

var _standByStatus = false;
function stbToggleStandby(toStatus){
    function start(){
        // log("info", 'stb.GetLanLinkStatus() '+stb.GetLanLinkStatus()+' stb.GetWifiLinkStatus() '+stb.GetWifiLinkStatus() + ' IPAddress '+stb.RDir('IPAddress'));
        if((stb.RDir('IPAddress')&&stb.GetLanLinkStatus())||(stb.RDir('WiFi_ip')&&stb.GetWifiLinkStatus())) playChannel(catIndex, primaryIndex);
        else { showShift('Connecting...'); setTimeout(start, 2000); }
    }
    if(toStatus === undefined) toStatus = !_standByStatus;
    if(toStatus == _standByStatus) return;
    if(_standByStatus){
        _standByStatus = false;
        stb.StandBy(false);
        parentAccess = false;
        setSleepTimeout();
        stb.SetLedIndicatorMode(1);
        // playChannel(catIndex, primaryIndex);
        start();
    } else {
        _standByStatus = true;
        clearTimeout(sleepTimeout);
        $('#listEdit').hide();
        $('#listAbout').hide();
        closeList();
        stbStop();
        stb.StandBy(true);
        stb.SetLedIndicatorMode(2);
    }
}

function editKeyM(code){
    function hideL(){
        $('#listEdit').hide();
        stb.EnableVKButton(false);
        stb.HideVirtualKeyboard();
    }
    switch(code){
		case keys.EXIT: hideL(); return;
		case keys.ENTER: editvar = $('#editvar').val(); setEdit(); hideL(); return;
    }
    return;
}
function showEditKeyM(){
    $('#listEdit').show().html(
        editCaption + ':<br/><br/>'+
        '<br/><input type="text" id="editvar" value="'+editvar+'" style="background-color: black; color:white; font-size:150%; width: 95%;" autofocus><br/><br/>'+
        '<br/><div class="btn w50">KB</div> - '+_('show on-screen keyboard')+
        '<br/><div class="btn w50">EXIT</div> '+_('- return without save')+
        '<br/><div class="btn w50">OK</div> '+_('- save')
    );
    stb.EnableVKButton(true);
    // stb.ShowVirtualKeyboard();
}
function setEditor(){
    if(sEditor){
        editKey = editKeyM;
        showEditKey = showEditKeyM;
    } else {
        editKey = editKey1;
        showEditKey = showEditKey1;
    }
}

function stbOptions(){
    function _save(){
        i=0;
        saveIfChanged(i++, 'sEditor', true);
        saveIfChanged(i++, 'sHDMIsupport', true);
        setEditor();
        showShift(_('Settings saved'));
        closeList();
        optionsList(stbOptions);
    }
    var noyes = [_('no'),_('yes')];
    listArray = [
        {name: _('Editor'), val: sEditor, values: [_('built-in'), _('native')]},
        {name: _('HDMI-CEC support (on/off from TV)'), val: sHDMIsupport, values: noyes},
        {name: '', val: 0, values: nofun, cur: ''},
        {name: '<div class="btn">'+_('Save Settings')+'</div>', val: 0, values: _save, cur: ''},
    ];
    listCaption.innerHTML = _('Settings STB');
    _setSetup(_save, function(){optionsList(stbOptions);});
}
function addOptions(){
    optionsArr.splice(optIndexOf(parentControlSetup), 0, {action:stbOptions, name: 'Settings STB'});
}

function unload(){
    stbSetItem('mValue', stbGetVolume());
    stbStop();
    stb.DeinitPlayer();
}

var stbEvent = { onEvent: function(data){}, event: 0 };
function stbEventHandler(event){
    log("info", "Event " +  event);// + ' IPAddress '+stb.RDir('IPAddress'));

    // if((event != 32) && (event != 33))
        // $('#buffering').toggle((event != 4) && (event != 7) && (event != 42));
    if(event==4) $('#buffering').hide();

    if(event==7) try{
        var aa = eval('('+stb.GetVideoInfo()+')'), //vv = JSON.parse(stb.GetHLSInfo()),
            xx = aa.pictureWidth ? '<br/>' + aa.pictureWidth + 'x' + aa.pictureHeight : '';
        xx += aa.frameRate&&aa.frameRate!=90000000?'<br/>'+aa.frameRate/1000+'<small><small>FPS</small></small>':'';
        // xx += vv.variants.length?'<br/>'+Math.round(vv.variants[vv.currentVariant]/1024/1024*100)/100+'<small><small> Mbps</small></small>':'';
        // log("info", "GetVideoInfo " +  JSON.stringify(aa) + "  GetHLSInfo " +  stb.GetHLSInfo());
        $('#video_res').html(xx);
    }catch(e){
        $('#video_res').text('');
    }

    if(playType<0) updateMediaInfo();

    // 32 (0x20)	HDMI device has been connected.
    // 33 (0x21)	HDMI device has been disconnected.
    if(sHDMIsupport||_standByStatus)
        if((event == 32) || (event == 33)) stbToggleStandby(event==33);

    if(event==2){
        execCHarr('aAspects', stb.SetAspect);
        execCHarr('aSubs', _setSubtitleTrack);
        execCHarr('aAudios', stb.SetAudioPID);
    }
    // if(event==5){ playChannel(catIndex, primaryIndex);}
}

function stbInit(){
    try{
        $('#launch').append('<br/>Load STB "mag"...');
        stb = gSTB;
        stb.getMacAddress = function(){ return stb.GetDeviceMacAddress(); };
    } catch (e) {
        window.location.href = "error.html";
    }
    if (!stb){
        $('#launch').append('<br/>Error: STB plugin not found');
    } else {
        $('#launch').append('<br/>Setup STB...');
        $('#listTime').css('width', 'auto');
        stb.InitPlayer();
        stbEvent.onEvent = stbEventHandler;
        // initEvents();
        window.onunload = unload;
        // window.moveTo(0, 0);
        // window.resizeTo(1280, 720);

        // stb.SetAlphaLevel(255);
        // stb.SetVideoState(1);
        // stb.ExecAction('graphicres 1280');
        // stb.SetViewport(0, 0, 0, 0);
        stb.SetPIG(1, 1, 0, 0);
        stb.EnableServiceButton(true);
        stb.EnableVKButton(false);
        stb.SetTopWin(0);
        stb.SetSubtitles(false);
        var v = parseInt(stbGetItem('mValue'));
        if(!isNaN(v)) stbSetVolume(v);
        if(stb.GetMute()) $('#mute').show();
        if(isNaN(parseInt(stbGetItem('sEditor')))) stbSetItem('sEditor', 1);
        addOptions();

        window.onkeydown = keyHandler;
    }
}
