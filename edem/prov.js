version += ' edem-0218';
var edkey, edlist, vpurl, provName = 'Edem.tv / iLook.tv';
p_pref = 'ed';
parental = /взрослые|XXX/i;

function _getParams(){
    edkey = providerGetItem("key") || '';
    edlist = parseInt(providerGetItem("list")) || 0;
    vpurl = providerGetItem("vpurl") || '';
}
function getProviderParams(){
    _getParams();
    $("#edkey").val(edkey);
    $("#edlist").val(edlist);
    if(!edkey) alert('Для доступа необходимо ввести ключ!');
    return edkey;
}
function setProviderParams(){
    providerSetItem("key", decodeURIComponent($("#edkey").val().trim()));
    providerSetItem("list", $("#edlist").val().trim());
    var changed = edlist != providerGetItem("list");
    _getParams();
    if(edkey.length < 8) alert('Для доступа необходимо ввести ключ!');
    return changed;
}

// function getChannelPicon(ch_id){ return edlist==1 ? chanels[ch_id].logo : 'http://epg.it999.ru/img/'+chanels[ch_id].epg_id+'.png'; }
function getChannelPicon(ch_id){ return chanels[ch_id].logo; }
function getChannelUrl(ch_id){ return 'http://hyqzethr.megatv.fun/iptv/'+(edkey?edkey:'1')+'/'+ch_id+'/index.m3u8'; }
// function getChannelUrl(ch_id){ return 'http://185.183.34.118/iptv/'+(edkey?edkey:'1')+'/'+ch_id+'/index.m3u8'; }
// function getChannelUrl(ch_id){ return 'http://12345.iptvzone.net/iptv/'+(edkey?edkey:'1')+'/'+ch_id+'/index.m3u8'; }
function getArchiveUrl(ch_id, time, time_to){ return getChannelUrl(ch_id)+'?utc='+Math.floor(time)+'&lutc='+Math.floor(Date.now()/1000); }

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
function getAttribute(text, attribute){
    var a = text.split(attribute + '=');
    if(a.length==1 || a[1].length==0) return '';
    if(a[1][0]=='"') return a[1].split('"')[1] || '';
    else return a[1].split(/[ ,]+/)[0] || '';
}

function loadPlaylist(url, success, callback){
    if(typeof(launch_id)=='undefined') launch_id = '#launch';
    if(!url){ callback(); return; }
    if(typeof(stbInterceptRequest) === 'function'){
        stbInterceptRequest(url);
        url += (url.indexOf('?')==-1 ? '?' : '&') + 'url=' + encodeURIComponent(url);
    }
    $.ajax({
        url: url, dataType: 'text', timeout: 30000, success: success,
        error: function(){
            $(launch_id).append('p...');
            $.ajax({
                url: host+'/m3u/cp.php', data: {url: '@'+url}, method: 'post', dataType: 'text', timeout: 30000, success: success,
                error: function(jqXHR, textStatus, errorThrown){
                    console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
                    alert( _('Failed to load channel list!') );
                    callback();
                },
            });
        },
    });
}

    function aSuccess(data){
        // console.log(data);
        try{
            var arrEXTINF = data.split('#EXTINF:');
            arrEXTINF.shift();
            arrEXTINF.forEach(function(val){
                // console.log(val);
                try{
                    var e = val.split('\n'),
                        cat = getAttribute(e[0], 'group-title'), epg = getAttribute(e[0], 'tvg-id'), logo = getAttribute(e[0], 'tvg-logo'),
                        rec = getAttribute(e[0], 'tvg-rec'), rec = rec==''?4*24:rec*24,
                        i = e[0].indexOf(','), cn = i>0?e[0].substr(i+1).trim():'?',
                        ci = e[1].split('/')[5];
                        // e1 = e[1].split("http://localhost/iptv/00000000000000/"),
                        // ci = e1[1].split("/index")[0];
                    addChan2cat(cat, ci);
                    cList.push(ci);
                    chanels[ci] = {channel_name: cn, category: {'class': catsArray.indexOf(cat)+2, 'name': cat}, rec: rec, time: 0, time_to: 0, epg_id: epg, logo: logo};
                } catch(e){console.log(val,e);}
            });
            if(!edkey){
                doEditData();
                infoBox('<br>Необходимо ввести ключ доступа!<br><br>'+btnDiv(keys.ENTER, strENTER, 'Close'));
            }
        }catch(e){}
        callback();
    }
    var u = 'http://ott-epg.prog4food.eu.org/edem/edem_epg_ico'+(edlist?edlist:'')+'.m3u8';
    loadPlaylist(u, aSuccess, callback);
}
function getEPGurl(ch_id){ return (edlist==1?'iptv-e2-soveni':'it999') + '/epg/' + chanels[ch_id].epg_id }
// _epgDomen = '';
_epgDomen = 'http://epg.augin.ru/epg/';
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


function item2descr(item, parent){
    function it(val, title){ return val ? '<b>'+_(title)+': </b>'+val+'<br>' : ''; }
    function im(val){ return val ? '<img height="285" width="210" src="'+val+'" style="float: left; margin-right: 5px; margin-bottom: 5px; border-width: 0px; border-style: solid;" onerror="this.width=0;this.height=0;">' : ''; }
    function id(val){ return val ? '<p><hr><b>'+_('Description')+': </b>'+val+'</p>' : ''; }
console.log(parent);
    if(parent){
        if(parent.title) item.title = parent.title+' - '+item.title;
        if(!item.img&&!item.imglr) item.img = parent.img||parent.imglr;
        if(!item.year) item.year = parent.year;
        if(!item.duration) item.duration = parent.duration;
        if(!item.agelimit) item.agelimit = parent.agelimit;
        if(!item.description) item.description = parent.description;
    }
    return '<table><center><b><span style="font-size: 140%;">'+item.title+'</span></b></center><p>'
        + im(item.img||item.imglr)
        + it(item.year, 'Release date')
        + (item.duration?it(Math.round(item.duration)+' '+_('min'), 'Duration'):'')
        + it(item.agelimit, 'Age')
        + id(item.description)+'</table>';
}
var __curKey = 0;
function _selV(sh){
    event.stopPropagation();
    if(__curKey==sh) dialogBoxKeyHandler(keys.ENTER);
    $('#k'+__curKey).css({"background-color": '', "color": ''});
    __curKey = sh;
    $('#k'+__curKey).css({"background-color": curColorB, "color": curColor});
}
function selectVariant(z, variants, callback){
    var sk = '';
    function setKey(sh){
        $('#k'+__curKey).css({"background-color": '', "color": ''});
        __curKey = sh;
        if(__curKey<0) __curKey = variants.length-1; else if(__curKey>variants.length-1) __curKey = 0;
        $('#k'+__curKey).css({"background-color": curColorB, "color": curColor});
    }
    variants.forEach(function(item, i){
        sk += '<div id="k'+i+'" style="display:inline-block;padding:6px 16px;" onclick="_selV('+i+');">'+item+'</div>&nbsp;&nbsp;';
    });
    $('#dialogbox').html(_('Quality')+':<br/><br/>'+sk).show();
    setKey(z);
    dialogBoxKeyHandler = function (code){
        switch (code) {
            case keys.EXIT:
            case keys.RETURN: $('#dialogbox').hide(); callback(-1); return;
            case keys.LEFT: setKey(__curKey-1); return;
            case keys.RIGHT: setKey(__curKey+1); return;
            case keys.UP: setKey(1); return;
            case keys.DOWN: setKey(0); return;
            case keys.ENTER: $('#dialogbox').hide(); callback(__curKey); return;
    	}
    }
}

playMedia = edem_playMedia;
function edem_playMedia(med){
    // console.log(med);
    // if(playType==-100000000000 && medHistory[0].stream_url == med.stream_url) return;
    var imed = medHistory.findIndex(function(val){ return (val.title == med.title); });
    if(imed==0 && playType==-100000000000) return;

    showPage();
    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40"> '+_('Download! Wait ...')).show();
    var z = 0, av=[], i=0, variants;
    var params = {key:_vpkey,app:"ott-play"};
    for (key in med.request) { params[key] = med.request[key]; }
    $.ajax({
        url: _vpurl, type: 'post', //contentType: 'application/json',
        data: JSON.stringify(params),
        success: function(data){
            // console.log(data);
            if(data !== null)
                if(data.type == 'error') alert(data.description);
                else{
                    med.stream_url = data.url;
                    variants = data.variants;
                }
        },
        error: function(jqXHR){ alert('Error: '+JSON.stringify(jqXHR)); },
        async: false
    });
    $('#dialogbox').hide();
    if(variants) for (key in variants) {
        // console.log(key, variants[key]);
        av.push(key);
        if(variants[key]==med.stream_url) z=i;
        i++;
    };
    function _play(){ closeList(); if(imed!=-1) medHistory[imed].stream_url = med.stream_url; _playMedia(med); };
    if(av.length<2) _play()
    else selectVariant(z, av, function(val){
        if(val==-1) return;
        med.stream_url = variants[av[val]];
        _play();
    });
}
function createMedia(val, parent){
    switch (val.type) {
        case 'stream':
            return {title: val.title, logo_30x30: val.imglr||val.img, description: item2descr(val, parent), stream_url: val.url, request: val.request};
        case 'category':
        case 'multistream':
            return {title: val.title, logo_30x30: val.imglr||val.img, description: item2descr(val, parent), playlist_url: {mediaName: val.title, request: val.request}};
    }
}
function addMedias2(params){
    params.offset = Math.floor(selIndex/params.limit)*params.limit;
    // console.log(params);
    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40"> '+_('Download! Wait ...')).show();
    $.ajax({
        url: _vpurl, type: 'post', //contentType: 'application/json',
        data: JSON.stringify(params),
        success: function(data){
            // console.log(data);
            try{
                if(data !== null)
                    if(data.type == 'error') alert(data.description);
                    else
                        data.items.forEach(function(val, i){ if(val.type!='next') mediaRecords[params.offset+i] = createMedia(val, data); });
            } catch (e) {}
        },
        // error: function(jqXHR){ console.log( 'medias : jqXHR:'+JSON.stringify(jqXHR));},
        complete: function(){
            while(typeof(mediaRecords[selIndex].description) === "function"){
                mediaRecords.length = selIndex;
                selIndex--;
            }
            showPage();
            $('#dialogbox').hide();
        },
    });

    return _('Download! Wait ...');
}

var parentMedia = null, _vpurl, _vpkey;
if(typeof sPageSize == 'undefined') sPageSize = 30;
if(browserName() == 'dune'){
var _getMediaArray = function(murl, callback){
// function getMediaArray(murl, callback){
    // console.log(murl);
    if(murl === ''){
        murl = { mediaName: 'Media from '+provName, request: {}};
        _vpurl =  vpurl.split(']')[1];
        _vpkey =  vpurl.split('portal::[key:')[1].split(']')[0];
    } else
    if(typeof(murl)==='string' && murl.indexOf('search')==0){
        var ss = murl.split('=')[1];
        murl = { mediaName: '['+ss+']', request: {cmd: "search", query: ss}};
    } else
    if (murl.a=='filters'){
        mediaRecords = [];
        murl.filters.forEach(function(val){
            mediaRecords.push( {title: val.title, logo_30x30: '', description: val.title, playlist_url: {a:'filter', mediaName: val.title, items: val.items}} );
        });
        callback();
        return;
    } else
    if (murl.a=='filter'){
        mediaRecords = [];
        murl.items.forEach(function(val){
            mediaRecords.push( {title: val.title, logo_30x30: '', description: val.title, playlist_url: {mediaName: val.title, request: val.request}} );
        });
        callback();
        return;
    }
    var params = {key:_vpkey,app:"ott-play"};
    // console.log(murl);
    for (key in murl.request) { params[key] = murl.request[key]; }
    params['limit']=sPageSize*10;

    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40"> '+_('Download! Wait ...')).show();
    $.ajax({
        url: _vpurl, type: 'post', //contentType: 'application/json',
        data: JSON.stringify(params),
        success: function(data){
            try{
                // console.log(data);
                // log('info',JSON.stringify(data));
                mediaRecords = [];
                if(data !== null)
                    switch (data.type) {
                        case 'error':
                            alert(data.description);
                            break;
                        case 'videoportal':
                        case 'category':
                        case 'multistream':
                            mediaName = murl.mediaName;
                            if(data.items)
                            data.items.forEach(function(val){
                                if(val.type!='next') mediaRecords.push(createMedia(val, data));
                                else for (var i = mediaRecords.length; i < data.count; i++) {
                                    mediaRecords.push( {title: (i+1)+' '+_('Download! Wait ...'), logo_30x30: '', description: function(){ return addMedias2(params);}, stream_url: ''} );
                                }
                            });
                            if(data.controls){
                                if(data.controls.search)
                                    mediaRecords.push( {title: _('Search'), description: _('Search'), playlist_url: 'search', search_on:1} );
                                if(data.controls.filters)
                                    mediaRecords.push( {title: _('Filters'), description: _('Filters'), playlist_url: {a:'filters', filters: data.controls.filters}} );
                            }
                            break;
                    }
                    return;
            } catch (e) { alert(e); }
        },
        error: function(jqXHR){ alert('medias : jqXHR:'+JSON.stringify(jqXHR)); },
        complete: function(){
            $('#dialogbox').hide();
            callback();
        },
    });
}
}
var edTlist = ['it999.ru (Стандартный)', 'soveni', 'it999.ru (Тематический)', 'it999.ru (Упорядоченный)'];
function duneAddSettings(ind){
    delPopup(restart);
    _getParams();
    popupArray.splice(ind, 1, _('Access settings')+' '+provName);
    popupDetail.splice(ind, 1, '');
    popupActions.splice(ind, 1, doEditData);
    getMediaArray = vpurl?_getMediaArray:null;
}
var vpAlert = 'Введите ссылку VPortal так как она выглядит кабинете:<br><b>portal::[key:...';
function doEditData(){
    selIndex = 0;
    var r = _(' (after changing, load playlist)'),
        aDetail = [
            'Ввод ключа доступа '+provName,
            'Выберите источник шаблона плейлиста, епг и логотипов:<br>'+edTlist.join(', ')+'<br><br>'+r,
            vpAlert,
            '', _('Load playlist')
        ];
    listArray = [
        'Ключ доступа',
        'Тип листа: '+edTlist[edlist],
        'Ссылка VPortal'+strNew,
        '', (sNoNumbersKeys?'':'<div class="btn">8</div> ')+_('Load playlist')
    ];
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+item; };
    detailListAction = function(){
        listDetail.innerHTML = aDetail[selIndex];
        listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')
            +([0,2].indexOf(selIndex)==-1?'':btnDiv(keys.ENTER, strENTER, 'Change value'))
            +((selIndex!=1)?'':btnDiv(keys.ENTER, strENTER, 'Change value', strLEFT, strRIGHT));
    };
    listKeyHandler = function(code){
        a = 1;
        switch (code) {
            case keys.LEFT: a = -1;
            case keys.RIGHT: if(selIndex!=1) return false;
            case keys.ENTER:
                switch (selIndex) {
                    case 0: edemKey(); return true;
                    case 1: doEditList(a); return true;
                    case 2: vportal(); return true;
                    case 4: loadChannels(); return true;
                }
                return true;
            case keys.RETURN: popupList(popupActions.indexOf(noProvParam)+1); return true;
            case keys.N8: loadChannels(); return true;
            default: return false;
        }
    };
    listDetail.innerHTML = '';
    listCaption.innerHTML = _('Access settings')+' '+provName;
    $('#listPopUp').hide();

    showPage();
}

function edemKey(){
    editCaption = 'Редактирование ключа доступа';
    editvar = edkey;
    setEdit = function(){
        if(edkey == editvar) return;
        edkey = editvar;
        providerSetItem('key', edkey);
        playChannel(catIndex, primaryIndex);
        showPage();
    };
    showEditKey();
}
function doEditList(a){
    edlist+=a;
    if(edlist==edTlist.length) edlist = 0;
    if(edlist<0) edlist = edTlist.length-1;
    providerSetItem('list', edlist);
    listArray[1] = 'Тип листа: '+edTlist[edlist];
    showPage();
}
function vportal(){
    editCaption = 'Редактирование ссылки VPortal';
    editvar = vpurl;
    setEdit = function(){
        if(vpurl == editvar) return;
        editvar = editvar.replace('%5B','[').replace('%5D',']'); // mob safari?
        if(editvar&&editvar.indexOf('portal::[key:')!=0){
            alert(vpAlert);
            showEditKey();
            return;
        }
        vpurl = editvar;
        providerSetItem('vpurl', vpurl);
        getMediaArray = vpurl?_getMediaArray:null;
        mediaUrls = null;
        mediaNames = [];
        mediaSelects = [0];
    };
    showEditKey();
}
