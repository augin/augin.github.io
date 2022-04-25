version += ' ottg-0114';
var login, pass, ts_hls, provName = 'GlanzTV', _apiurl = 'http://api.ottg.io';
p_pref = 'ottg';
parental = /Для взрослых/;

function _getParams(){
    login = providerGetItem('login') || '';
    pass = providerGetItem('pass') || '';
    ts_hls = parseInt(providerGetItem('ts_hls')) || 0;
}
function getProviderParams(){
    _getParams();
    ts_hls = 1;
    $("#login").val(login);
    $("#pass").val(pass);
    if((login.length < 2) || (pass.length < 2)) alert('Для доступа необходимо ввести Логин и пароль!');
    return (login.length) && (pass.length);
}
function setProviderParams(){
    providerSetItem("login", decodeURIComponent($("#login").val().trim()));
    var changed = login != providerGetItem("login");
    providerSetItem("pass", decodeURIComponent($("#pass").val().trim()));
    changed = changed || (pass != providerGetItem("pass"));
    _getParams();
    if((login.length < 2) || (pass.length < 2)) alert('Для доступа необходимо ввести Логин и пароль!');
    return changed;
}

function getChannelPicon(ch_id){ return chanels[ch_id].logo; }
function getChannelUrl(ch_id){
    var u = chanels[ch_id].url.split('video.m3u8');
    return u[0] + ['mpegts', 'video.m3u8', 'index.m3u8'][ts_hls] + u[1];
}
function getArchiveUrl(ch_id, time, time_to){
    var u = chanels[ch_id].url.split('video.m3u8');
    if(time_to < time) time_to = Date.now()/1000+600;
    // if(!ts_hls || time_to > Date.now()/1000) // мпег или текущая передача
    if(!ts_hls ||(time > Date.now()/1000-600)) // мпег или последние 10 минут
        return u[0] + ['timeshift_abs/', 'timeshift_abs_video-', 'timeshift_abs-'][ts_hls] + Math.floor(time) + ['', '.m3u8', '.m3u8'][ts_hls] + u[1];
    else {
        if(browserName() == 'dune') time_to = Math.floor(time_to) + 7200;
        return u[0] + ['', 'video-', 'index-'][ts_hls] + Math.floor(time) + '-' + Math.floor(time_to-time) + '.m3u8' + u[1];
    }
}

if(typeof catsArray == 'undefined') var catsArray = [];
function addChan2cat(cat, ci){
    if(!cat || !ci) return;
    if(!cats[cat]){
        catsArray.push(cat);
        cats[cat] = [];
    }
    cats[cat].push(ci);
}

function getChanelsArray(callback){
    $.ajax({
        url: _apiurl+'/playlist/tv', data: {login:login, password:pass},
        dataType: 'json', timeout: 10000,
        success: function(data){
            // console.log(data);
            data.forEach(function(val){
                addChan2cat(val.group, val.id);
                cList.push(val.id);
                chanels[val.id] = {channel_name: val.name, category: {'class': catsArray.indexOf(val.group)+2, 'name': val.group}, rec: val.archive, time: 0, time_to: 0, url: val.url, logo: val.logo, epg: val.xmltv};
            });
        },
        error: function(jqXHR){ console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)); },
        complete: function(){
            if(!cList.length && stbGetItem('noProvParam')!=1) setTimeout(doEditData);
            callback();
        },
    });
}

function getEPGurl(ch_id){ return 'iptvx.one/epg/' + chanels[ch_id].epg }
// _epgDomen = '';
_epgDomen = 'http://epg.augin.ru/';
function getEPGchanel(ch_id, callback){
    // if(!_epgDomen){
    //     _epgDomen = 'http://epgf.ott-play.com/';
    //     $.ajax({ url: _epgDomen+'test.json', dataType: 'json', timeout: 5000,
    //         error: function(){ _epgDomen = 'http://epg.ott-play.com/'; },
    //         complete: function(){ getEPGchanel(ch_id, callback); },
    //     });
    //     return;
    // }
    var d = null, epg_url = getEPGurl(ch_id);
    if(!epg_url){ callback(ch_id, d); return; }
    $.ajax({ url: _epgDomen+epg_url+'.json', dataType: 'json', timeout: 10000,
        success: function(data){ if(data !== null) d = data.epg_data; },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){ callback(ch_id, d); },
    });
}


playMedia = function(med){
    // console.log(med);
    ___med = med;
    var _url = med.stream_url;
    if(ts_hls){
        var us = med.stream_url.split('index.m3u8');
        med.stream_url = us[0]+['mpegts', 'video.m3u8', 'index.m3u8'][ts_hls]+us[1];
    }
    _playMedia(med);
    med.stream_url = _url;
}
var ___med = null, _medias = [];
function _getMediaArray(callback){
    function it(val, title){ return val ? '<b>'+_(title)+': </b>'+val+'<br>' : ''; }
    function item2descr(val){
        var gen = [];
        val.genres.forEach(function(it){gen.push(it.title);});
        return '<table>'
            + '<h2><center>'+val.name+'</center></h2>'
            + '<img height="'+285*getHeightK()+'" width="'+210*getHeightK()+'" src="'+val.cover+'" style="float: left; margin-right: 5px; margin-bottom: 5px; border-width: 0px; border-style: solid;" onerror="this.width=0;this.height=0;">'
            + it(val.year, 'Year')
            + it(gen.join(', '), 'Genre')
            + it(val.country, 'Country')
            + it(val.director, 'Director')
            + it(val.actors, 'Actors')
            + it(val.rating, 'Rating')
            + '<p><hr>'+it(val.description, 'Description')+'</p>'
            + '</table>';
    }
    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40"> Загрузка списка! Подождите ...').show();
    $.ajax({
        url: _apiurl+'/playlist/vod', data: {login:login, password:pass},
        dataType: 'json', timeout: 30000,
        success: function(data){
            try{
                // console.log(data);
                var cats = [_('All')], mvods = {};
                mvods[_('All')] = [];
                data.forEach(function(val){
                    var cat = val.category || 'Без категории';
                    if(cats.indexOf(cat) == -1){
                        cats.push(cat);
                        mvods[cat] = [];
                    }
                    mvods[_('All')].push({title: val.name, logo_30x30: val.cover, description: item2descr(val), stream_url: val.url, adult: val.censored});
                    mvods[cat].push({title: val.name, logo_30x30: val.cover, description: item2descr(val), stream_url: val.url, adult: val.censored});
                });
                _medias.push( {title: _('Search'), description: _('Search'), playlist_url: 'search', search_on:1} );
                cats.forEach(function(val){
                    _medias.push( {title: val, logo_30x30: '', description: '', playlist_url: {title: val, records: mvods[val]}} );
                });

            } catch(e) {
                console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
                alert( "Ошибка обработки списка!!!" );
            }
        },
        error: function(jqXHR){
            console.log( 'vod : jqXHR:'+JSON.stringify(jqXHR));
            alert( "Не удалось загрузить список! Проверьте правильность данных!!" );
        },
        complete: function(){
            $('#dialogbox').hide();
            mediaRecords = [].concat(_medias);
            callback();
        },
    });
}

function getMediaArray(murl, callback){
    if(!login || !pass){
        alert('Логин или пароль отсутсвуют!');
        callback();
        return;
    }
    if(murl === ''){
        mediaName = 'Медиатека';
        if(_medias.length) {
            mediaRecords = [].concat(_medias);
            callback();
        } else
            _getMediaArray(callback);
    }else{
        if(typeof(murl)==='string' && murl.indexOf('search')==0){
            var ss = murl.split('=')[1].toLowerCase();
            mediaRecords = _medias[1].playlist_url.records.filter(function(val){ return val.title.toLowerCase().indexOf(ss)!=-1; });
            mediaName = _('Search')+':"'+ss+'"('+mediaRecords.length+')';
        } else {
            mediaName = murl.title;
            mediaRecords = murl.records;
        }
        callback();
    }
}

var shTarr = ['MPEGTS', 'HLS(v)', 'HLS(a)'];
function duneAddSettings(ind){
    if(isNaN(parseInt(providerGetItem('sShowArchive')))) providerSetItem('sShowArchive', 1);
    // if(isNaN(parseInt(providerGetItem('sShowPikon')))) providerSetItem('sShowPikon', 0);
    if(isNaN(parseInt(providerGetItem('ts_hls')))) providerSetItem('ts_hls', 1);
    // if(isNaN(parseInt(providerGetItem('mpeg')))&&(navigator.userAgent.indexOf("Tizen")!=-1)) providerSetItem('mpeg', 2);
    delPopup(restart);
    _getParams();
    popupArray.splice(ind, 1, _('Access settings')+' '+provName);
    popupDetail.splice(ind, 1, '');
    popupActions.splice(ind, 1, doEditData);
}
function doEditData(){
    selIndex = 0;
    var r = _(' (after changing, load playlist)'),//_(' (after changing, restart player)'),
        aDetail = [
            _('Enter username')+r,
            _('Enter password')+r,
            _('Select stream type')+':<br>'+shTarr.join(', '),
            '', _('Load playlist')//_('Restart player')
        ];
    listArray = [
        _('Username')+': '+login,
        _('Password'),
        _('Stream type')+': '+shTarr[ts_hls],
        '', (sNoNumbersKeys?'':'<div class="btn">8</div> ')+_('Load playlist')//_('Restart player')
    ];
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+item; };
    detailListAction = function(){
        listDetail.innerHTML = aDetail[selIndex];
        listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')
            +(([0,1].indexOf(selIndex)==-1)?'':btnDiv(keys.ENTER, strENTER, 'Change value'))
            +((selIndex!=2)?'':btnDiv(keys.ENTER, strENTER, 'Change value', '&#9664;', '&#9654;'));
    };
    listKeyHandler = function(code){
        a = 1;
        switch (code) {
            case keys.LEFT: a = -1;
            case keys.RIGHT: if(selIndex!=2) return false;
            case keys.ENTER:
                switch (selIndex) {
                    case 0: edit_login(); return true;
                    case 1: edit_pass(); return true;
                    case 2: doEditType(a); return true;
                    case 4: loadChannels(); return true; // restart();
                }
                return true;
            case keys.RETURN: popupList(popupActions.indexOf(noProvParam)+1); return true;
            case keys.N8: restart(); return true;
            default: return false;
        }
    };
    listDetail.innerHTML = '';
    listCaption.innerHTML = _('Access settings')+' '+provName;
    $('#listPopUp').hide();

    showPage();
}
function edit_login(){
    editCaption = _('Enter username')+' '+provName;
    editvar = login;
    setEdit = function(){
        login = editvar;
        providerSetItem('login', login);
        listArray[0] = _('Username')+': '+login;
        showPage();
        detailListAction();
    };
    showEditKey([0,1,2]);
}
function edit_pass(){
    editCaption = _('Enter password')+' '+provName;
    editvar = pass;
    setEdit = function(){ pass = editvar; providerSetItem('pass', pass); };
    showEditKey([0,1,2]);
}
function doEditType(a){
    ts_hls+=a;
    if(ts_hls==shTarr.length) ts_hls = 0;
    if(ts_hls<0) ts_hls = shTarr.length-1;
    providerSetItem("ts_hls", ts_hls);
    listArray[2] = _('Stream type')+': '+shTarr[ts_hls];
    showPage();
    detailListAction();
    if(!playType) playChannel(catIndex, primaryIndex);
    else if(playType>0) playArchive(playType + playTime);
    else{ setCurrent(catIndex, -1); playType=-100000000001; playMedia(___med); }
}
