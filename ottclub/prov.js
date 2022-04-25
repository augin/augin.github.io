version += ' ottclub-1008';
var ottwww, ottkey;
p_pref = '';
parental = /Для взрослых/;

function _getParams(){
    ottwww = providerGetItem("ottwww") || 'spacetv.in';
    ottkey = providerGetItem("ottkey") || '';

}
function getProviderParams(){
    _getParams();
    $("#ottwww").val(ottwww);
    $("#ottkey").val(ottkey);
    if(!ottkey) alert('Для доступа необходимо ввести ключ и адрес плейлиста!');
    return ottkey;
}
function setProviderParams(){
    providerSetItem("ottwww", decodeURIComponent($("#ottwww").val().trim()));
    providerSetItem("ottkey", decodeURIComponent($("#ottkey").val().trim()));
    var wwwchanged = ottwww != providerGetItem("ottwww");
    _getParams();
    if((ottwww.length < 4) || (ottkey.length < 8)) alert('Для доступа необходимо ввести ключ и адрес плейлиста!');
    return wwwchanged;
}

function getChannelPicon(ch_id){ return 'http://'+ottwww+'/images/'+chanels[ch_id].img; }
function getChannelUrl(ch_id){ return 'http://'+ottwww+'/stream/'+ottkey+'/'+ch_id+'.m3u8'; }
function getArchiveUrl(ch_id, time, time_to){
    return getChannelUrl(ch_id) + (((time_to < Date.now()/1000) && (browserName() != 'dune'))? '?archive='+time+'&archive_end='+time_to : '?timeshift='+time+'&timenow='+Date.now()/1000);
}
$.support.cors = true;
function getChanelsArray(callback){
    $.ajax({
        url: 'http://'+ottwww+'/api/channel_now',
        dataType: "text",
        success: function(data){
            try{
                cList = data.split('"ch_id":"');
                cList.shift();
                cList.forEach(function(val, i, arr){ cList[i] = val.split('","')[0]; });
                chanels = JSON.parse(data);

                cList.forEach(function(ch_id, i, arr){
                    chanels[ch_id].rec = chanels[ch_id].rec ? 7*24 : 0;
                    epg[ch_id] = [chanels[ch_id]];
                });
            } catch (e) {
                cList = []; chanels = {};
                console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
                alert( "Не удалось обработать список каналов! Проверьте правильность адреса плейлиста!!" );
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
            alert( "Не удалось загрузить список каналов! Проверьте правильность адреса плейлиста!!" );
        },
        complete: function(jqXHR, textStatus){
            if((ottwww.length < 4) || (ottkey.length < 8)){
                popupList(popupActions.indexOf(noProvParam)+1);
                infoBox('Для доступа необходимо ввести ключ и адрес плейлиста!');
            }
            callback();
        },
    });
}
function getEPGchanel(ch_id, callback){
    var d = null;
    $.ajax({
        url: 'http://'+ottwww+'/api/channel/'+ch_id,
        dataType: 'json', timeout: 30000,
        success: function(data){ if(data) d = data.epg_data; },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){ callback(ch_id, d); },
    });
}

function duneAddSettings(ind){
    delPopup(restart);
    _getParams();
    popupArray.splice(ind, 0, 'OTTCLUB: Адрес плейлиста', 'OTTCLUB: Ключ доступа');//, 'OTTCLUB: Получить данные по коду для ViJect');
    popupDetail.splice(ind, 0, 'Ввод адреса плейлиста OTTCLUB (После изменения плеер перезапустится!)', '');//, '');
    popupActions.splice(ind, 0, edit_ottwww, edit_ottkey);//, getViject);
}
function edit_ottwww(){
    editCaption = 'Редактирование адреса плейлиста OTTCLUB';
    editvar = ottwww;
    setEdit = function(){
        if(ottwww == editvar) return;
        providerSetItem('ottwww', editvar);
        restart();
    };
    showEditKey([0,2]);
}
function edit_ottkey(){
    editCaption = 'Редактирование ключа доступа OTTCLUB';
    editvar = ottkey;
    setEdit = function(){
        if(ottkey == editvar) return;
        ottkey = editvar;
        providerSetItem('ottkey', ottkey);
        playChannel(catIndex, primaryIndex);
    };
    showEditKey([0,1]);
}
function getViject(){
    var _break = false;
    function get_code(){
        if(_break) return;
        $.ajax({
            url: 'http://api.viject.pro/get_code',
            success: function(json){ $('#vij-code').text(json.code); get_playlist_code() }
        })
    }
    function get_playlist_code(){
        if(_break) return;
        $.ajax({
            url: 'http://api.viject.pro/get_playlist_code?code=' + $('#vij-code').text(),
            success: function(json){
                if(_break) return;
                // console.log(json)
                if(json.status === 'forbidden') setTimeout(get_playlist_code, 5000)
                else if(json.status === 'error') get_code()
                else if (json.status === 'success') {
                    $('#listAbout').html('<div style="text-align:center;font-size:200%;"><br/><br/>Успешно!</div>');
                    var up = json.url.split('/');
                    ottkey = up[4];
                    providerSetItem('ottkey', ottkey);
                    if(ottwww != up[2]){
                        providerSetItem('ottwww', up[2]);
                        restart();
                    }
                    playChannel(catIndex, primaryIndex);
                }
            }
        })
    }
    aboutKeyHandler = function(){ _break = true; $('#listAbout').hide(); return true; }
    $('#listAbout').html(
        '<div style="text-align:center;font-size:larger;"><br/><br/>Автоматический код загрузки плейлиста для <b>ViJect</b>:'+
        '<p style="font-size:200%;"id="vij-code">ОШИБКА!!! Нет кода</p>'+
        'Введите данный код в кабинете OTTCLUB, и ваши данные будут загружены автоматически</div>'
    ).show();
    get_code();
}
