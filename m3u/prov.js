version += ' m3u-0218';
var m3uArr, _number = 0;
p_pref = 'm3u';
parental = /XXX|Взрослые|Для взрослых|Эротика|18+/;

function keyNames4(keyName){
    if(pdsa.indexOf(keyName) != -1) keyName += m3uArr.active || '';
    return keyName;
}
if(typeof(stbGetItem)==='function'){
    providerGetItem = function (keyName){ return stbGetItem(p_pref + keyNames4(keyName)); }
    providerSetItem = function (keyName, keyValue){ stbSetItem(p_pref + keyNames4(keyName), keyValue); }
} else {
    providerGetItem = function (keyName){ return localStorage.getItem(p_pref + keyNames4(keyName)); }
    providerSetItem = function (keyName, keyValue){ localStorage.setItem(p_pref + keyNames4(keyName), keyValue); }
}
function loadM3Uparams(){
    m3uArr = providerGetItem("m3uArr");
    if(!m3uArr) m3uArr = {active:0, M3Us: []};
    else try{ m3uArr = JSON.parse(m3uArr); }catch(e){ m3uArr = {active:0, M3Us: []}; }
    for(var i = m3uArr.M3Us.length; i < 6; i++)
        m3uArr.M3Us[i] = {www:'', rechours:0};

    if(browserName() == 'dune') try{
        var params = window.location.href.split('?')[1].split('&');
        params.forEach(function(item){
            var p = item.split('=');
            if(p[0]=='n'){ _number = parseInt(p[1]); throw {}; }
        });
    }catch(e){}
    if(_number>0 && _number<7) m3uArr.active = _number-1;
}

function getProviderParams(){
    loadM3Uparams();
    for(var i = 0; i < 6; i++){
        $("#www"+i).val(m3uArr.M3Us[i].www);
        $("#rechours"+i).val(m3uArr.M3Us[i].rechours);
    }
    $('input:radio[name=odin]').filter('[value='+m3uArr.active+']').attr('checked', true);
    return m3uArr.M3Us[m3uArr.active].www;
}
function setProviderParams(){
    for(var i = 0; i < 6; i++){
        m3uArr.M3Us[i].www = decodeURIComponent($("#www"+i).val().trim());
        m3uArr.M3Us[i].rechours = $("#rechours"+i).val().trim();
    }
    m3uArr.active = $("input[name=odin]:checked").val();
    var changed = JSON.stringify(m3uArr) != providerGetItem("m3uArr");
    providerSetItem("m3uArr", JSON.stringify(m3uArr));
    loadM3Uparams();

    if(m3uArr.M3Us[m3uArr.active].www.length < 8) alert('Для доступа необходимо ввести адрес плейлиста!');
    return changed;
}

function getChannelPicon(ch_id){ return chanels[ch_id].logo; }
function getChannelUrl(ch_id){ return chanels[ch_id].url; }
function getArchiveUrl(ch_id, time, time_to){
    function insPar(u){
        return u.replace(/\$\{start\}/g, Math.floor(time))
            .replace(/\$\{end\}/g, Math.floor(time_to))
            .replace(/\$\{timestamp\}/g, Math.floor(Date.now()/1000))
            .replace(/\$\{offset\}/g, Math.floor(Date.now()/1000)-Math.floor(time))
            .replace(/\$\{duration\}/g, Math.floor(time_to-time));
    }
    if(time_to < time) time_to = Date.now()/1000;
    if(browserName() == 'dune') time_to += 7200;
    if(chanels[ch_id].ca.indexOf('flussonic')!=-1){
        var spl = '', ts_hls = 0, url = chanels[ch_id].url;
        if(url.indexOf('mpegts')!=-1){ spl = 'mpegts'; ts_hls = 0; }
        else if(url.indexOf('video.m3u8')!=-1){ spl = 'video.m3u8'; ts_hls = 1; }
        else if(url.indexOf('index.m3u8')!=-1){ spl = 'index.m3u8'; ts_hls = 2; }
        else if(url.indexOf('index.mpd')!=-1){ spl = 'index.mpd'; ts_hls = 3; }
        if(spl){
            var u = url.split(spl);
            if(!ts_hls||(time > Date.now()/1000-600)) // мпег или последние 10 минут
                return u[0] + ['timeshift_abs/', 'timeshift_abs_video-', 'timeshift_abs-', 'timeshift_abs-'][ts_hls] + Math.floor(time) + ['', '.m3u8', '.m3u8', '.mdp'][ts_hls] + u[1];
            else
                return u[0] + ['', 'video-', 'index-', 'archive-'][ts_hls] + Math.floor(time) + '-' + Math.floor(time_to-time) + ['', '.m3u8', '.m3u8', '.mdp'][ts_hls] + u[1];
        }
    }
    if(chanels[ch_id].caso)
        switch (chanels[ch_id].ca){
            case 'append': return insPar(chanels[ch_id].url+chanels[ch_id].caso);
            // case 'default':
            default:
                return insPar(chanels[ch_id].caso);
        }
    var c = (chanels[ch_id].url.indexOf('?') == -1) ? '?' : '&';
    return chanels[ch_id].url + c + 'utc=' + Math.floor(time) + '&lutc=' + Math.floor(Date.now()/1000);
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
/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */

function murmurhash3_32_gc(key, seed) {
	var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

	remainder = key.length & 3; // key.length % 4
	bytes = key.length - remainder;
	h1 = seed;
	c1 = 0xcc9e2d51;
	c2 = 0x1b873593;
	i = 0;

	while (i < bytes) {
	  	k1 =
	  	  ((key.charCodeAt(i) & 0xff)) |
	  	  ((key.charCodeAt(++i) & 0xff) << 8) |
	  	  ((key.charCodeAt(++i) & 0xff) << 16) |
	  	  ((key.charCodeAt(++i) & 0xff) << 24);
		++i;

		k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
		k1 = (k1 << 15) | (k1 >>> 17);
		k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

		h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
		h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
		h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
	}

	k1 = 0;

	switch (remainder) {
		case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
		case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
		case 1: k1 ^= (key.charCodeAt(i) & 0xff);

		k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
		k1 = (k1 << 15) | (k1 >>> 17);
		k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
		h1 ^= k1;
	}

	h1 ^= key.length;

	h1 ^= h1 >>> 16;
	h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
	h1 ^= h1 >>> 13;
	h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
	h1 ^= h1 >>> 16;

	return h1 >>> 0;
}

function getAttribute(text, attribute){
    var a = text.split(attribute + '=');
    if(a.length==1 || a[1].length==0) return '';
    if(a[1][0]=='"') return a[1].split('"')[1] || '';
    else return a[1].split(/[ ,]+/)[0] || '';
}

function getAint(text, attribute){ return parseInt(getAttribute(text, attribute)) || 0; }

function loadPlaylist(url, success, callback){
    if(typeof(launch_id)=='undefined') launch_id = '#launch';
    if(!url){ callback(); return; }
    if(typeof(stbInterceptRequest) === 'function'){
        stbInterceptRequest(url);
        url += (url.indexOf('?')==-1 ? '?' : '&') + 'url=' + encodeURIComponent(url);
    }

    $.ajax({
        url: url, timeout: 30000, success: success,
        error: function(jqXHR, textStatus, errorThrown){
            $(launch_id).append('Плейлист не грузится напрямую...10 секунд...');
            setTimeout( function(){
                success();
            }, 10000)
            $(launch_id).append('p...');
            $.ajax({
//                url: host+'/m3u/cp.php', data: {url: '@'+url}, method: 'post', dataType: 'text', timeout: 30000, success: success,
                url: 'http://ott.augin.ru'+'/m3u/cp.php', data: {url: url}, method: 'post', dataType: 'text', timeout: 30000, success: success,

                error: function(jqXHR, textStatus, errorThrown){
                    console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
                    alert( _('Failed to load channel list!') );
                    callback();
                },
            });
        },
    });
}


function getEpgList(cepg, callback){
    if(!cList.length){ callback(); return; }
    $(launch_id).append(_('epgs...'));
    $.ajax({
        url: 'http://ott.augin.ru/m3u/gelist.php', data: {list: JSON.stringify(cepg)},
        method: 'post', timeout: 120000,
        success: function(data){
            // console.log(data);
            if(data) //for (var val in data) { chanels[val].epg_url = data[val]; };
            cList.forEach(function(val){
                if(data[val]) chanels[val].epg_url = data[val];
            });
            // console.log(chanels);
        },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){ callback(); },
    });
}

function getLogoList(cepg, callback){
    if(!cList.length){ callback(); return; }
    $(launch_id).append(_('logos...'));
    $.ajax({
        url: 'http://ott.augin.ru/m3u/geicons.php', data: {list: JSON.stringify(cepg)},
        method: 'post', timeout: 120000,
        success: function(data){
            // console.log(data);
            if(data) //for (var val in data) { chanels[val].epg_url = data[val]; };
            cList.forEach(function(val){
                if(data[val]) chanels[val].logo = data[val];
            });
            // console.log(chanels);
        },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){ callback(); },
    });
}

    function aSuccess(data){
        try{
            // console.log(data);
            var ccat = '', cepg = {}, clogo = false;
            var arrEXTINF = data.split('#EXTINF:'), l1 = arrEXTINF[0],
                g_utvg = getAttribute(l1, 'url-tvg'),
                gRec = l1.indexOf('catchup-days')>-1 ? getAint(l1, 'catchup-days')*24 : l1.indexOf('timeshift')>-1 ? getAint(l1, 'timeshift')*24 : l1.indexOf('tvg-rec')>-1 ? getAint(l1, 'tvg-rec')*24 : m3uArr.M3Us[m3uArr.active].rechours,
                gC = getAttribute(l1, 'catchup') || getAttribute(l1, 'catchup-type'), gCS = getAttribute(l1, 'catchup-source');
            arrEXTINF.shift();
            arrEXTINF.forEach(function(val, i, arr){
                // console.log(val);
                var e = val.split('\n'),
                    cat = getAttribute(e[0], 'group-title'),
                    epg = getAttribute(e[0], 'tvg-id'),
                    tn = getAttribute(e[0], 'tvg-name'),
                    logo = getAttribute(e[0], 'tvg-logo'),
                    logo = logo.indexOf('//') === 0 || logo.toLowerCase().indexOf('http') === 0 ? logo : '',
                    // rec = getAint(e[0], 'catchup-days')*24 || getAint(e[0], 'timeshift')*24 || getAint(e[0], 'tvg-rec')*24 || gRec,
                    rec = e[0].indexOf('catchup-days')>-1 ? getAint(e[0], 'catchup-days')*24 : e[0].indexOf('timeshift')>-1 ? getAint(e[0], 'timeshift')*24 : e[0].indexOf('tvg-rec')>-1 ? getAint(e[0], 'tvg-rec')*24 : gRec,
                    ca = getAttribute(e[0], 'catchup') || getAttribute(e[0], 'catchup-type') || gC,
                    caso = getAttribute(e[0], 'catchup-source') || gCS,
                    utvg = getAttribute(e[0], 'url-tvg') || g_utvg,
                    cn = _('??? No channel name'),
                    url = '',
                    n = 1;
                try {
                    var i = e[0].indexOf(',');
                    cn = i>0?e[0].substr(i+1).trim():cn;
                    // cn = e[0].split(',')[1].trim();
                } catch(e) {}
                try { url = e[1].trim(); } catch(e) {}
                while (url.indexOf('#') === 0) {
                    if(url.indexOf('#EXTGRP:') != -1)
                        if(!cat) cat = url.split('#EXTGRP:')[1].trim();
                    try { url = e[++n].trim(); } catch(e) { url = ''; }
                }
                if(cat == '') cat = ccat;
                else ccat = cat;
                var ci = murmurhash3_32_gc(url, 10);
                addChan2cat(cat, ci);
                if(url && (cList.indexOf(ci) == -1)){
                    cList.push(ci);
                    chanels[ci] = {channel_name: cn, category: {'class': catsArray.indexOf(cat)+2, 'name': cat}, rec: rec, time: 0, time_to: 0, url: url, logo: logo, epg: epg, tn: tn, ca: ca, caso: caso, utvg: utvg};
                    cepg[ci] = (epg && utvg) ? {n: tn || cn, e: epg, u: utvg} : {n: tn || cn};
                    // if(!logo) clogo[ci] = {n: tn || cn};
                    if(!logo){
                        if(!clogo) clogo = {};
                        clogo[ci] = tn || cn;
                    }
                }
            });
        } catch(e) {
            console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
            alert( _('Failed to load channel list!') );
        }
        callback();
//        getEpgList(cepg, function(){ chanels[curList[primaryIndex]].time_request = 0; updateChanelInfo(curList[primaryIndex]); });
//        if(clogo) getLogoList(clogo, function(){ updateChanelInfo(curList[primaryIndex]); });
        // getEpgList(cepg, callback);
        // getEpgList(cepg, function(){ if(clogo) getLogoList(clogo, callback); else callback(); });
    }
    if(typeof(readFile)==='function' && m3uArr.M3Us[m3uArr.active].www && m3uArr.M3Us[m3uArr.active].www[0]=='/')
        aSuccess(readFile(m3uArr.M3Us[m3uArr.active].www));
    else
        loadPlaylist(m3uArr.M3Us[m3uArr.active].www, aSuccess, callback);
}


//function getEPGurl(ch_id){ return chanels[ch_id].epg_url }
function getEPGurl(ch_id){ return 'epg/iptvx.one/epg/' + chanels[ch_id].epg }
// _epgDomen = '';
//_epgDomen = 'http://epg.ott-play.com/';
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

// < !--#include virtual="/js/getepgchanelcur._js"-->

function _m3u2popup(){
    var i = parseInt(m3uArr.active), a = m3uArr.M3Us[i];
    popupArray[popupActions.indexOf(doEditM3Ua)] = _('Select playlist')+': '+((i+1)+' - '+(a.name || a.www || '')); // .replace('https://', '').replace('http://', '')
}
function duneAddSettings(ind){
    loadM3Uparams();
    if(_number>0 && _number<7){ doEditM3Ua = doEditListData }
    popupArray.splice(ind, 1, '');
    popupDetail.splice(ind, 1, _('Select playlist'));
    popupActions.splice(ind, 1, doEditM3Ua);
    _m3u2popup();
    // if(!m3uArr.M3Us[m3uArr.active].medUrl) getMediaArray = null;
    getMediaArray = m3uArr.M3Us[m3uArr.active].medUrl?_getMediaArray:null;
}
function selectAndRestart(ind){
    var i = m3uArr.active;
    m3uArr.active = ind;
    providerSetItem("m3uArr", JSON.stringify(m3uArr));
    m3uArr.active = i;
    // restart();
    loadPlaylist();
}
function loadPlaylist(){
    loadM3Uparams();
    _m3u2popup();
    getMediaArray = m3uArr.M3Us[m3uArr.active].medUrl?_getMediaArray:null;
    loadChannels();
}

var doEditM3Ua = function(ind){
    if(typeof ind === 'undefined') ind = m3uArr.active;
    selIndex = ind;
    listArray = m3uArr.M3Us;
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+(sNoNumbersKeys?(i+1)+' - ':'<div class="btn">'+(i+1)+'</div>&nbsp;')+(item.name || item.www || ''); };
    detailListAction = function(){
        var a = m3uArr.M3Us[selIndex];
        listDetail.innerHTML = _('Playlist Name')+': <span " style="color:'+curColor+';">'+(a.name || '')+'</span><br/>'+
            _('Playlist URL')+':<br/><span " style="color:'+curColor+';">'+(a.www || '')+'</span><br/>'+
            _('Archive hours')+': <span " style="color:'+curColor+';">'+(a.rechours || 0)+'</span><br/>'+
            _('Media Library URL')+':<br/><span " style="color:'+curColor+';">'+(a.medUrl || '')+'</span>';
        listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')+btnDiv(keys.ENTER, strENTER, ((m3uArr.active == selIndex) || !m3uArr.M3Us[selIndex].www)?'Edit':'Load');

    };
    listKeyHandler = function(code){
        switch (code) {
            case keys.RETURN: _m3u2popup(); popupList(popupActions.indexOf(noProvParam)+1); return true;
            case keys.N1:
            case keys.N2:
            case keys.N3:
            case keys.N4:
            case keys.N5:
            case keys.N6: selIndex = code-49;
            case keys.ENTER:
                if((m3uArr.active == selIndex) || !m3uArr.M3Us[selIndex].www) doEditListData(selIndex);
                else selectAndRestart(selIndex)
                return true;
            default: return false;
        }
    };
    listDetail.innerHTML = '';
    listCaption.innerHTML = _('Select playlist');
    listPodval.innerHTML = '';
    $('#listPopUp').hide();

    showPage();
}
function doEditListData(ind){
    function __m3u2list(){
        var i=0;
        listArray[i++] = _('Playlist Name')+': '+(a.name || '');
        listArray[i++] = _('Playlist URL')+': '+(a.www || '');
        if(typeof(readFile)==='function'){
            var f = '';
            if(a.www && a.www[0]=='/'){
                var af = a.www.split('/');
                f = af[af.length-1];
            }
            listArray[i++] = _('Playlist file')+': '+f+strNew;
        }
        listArray[i++] = _('Archive hours')+': '+(a.rechours || 0);
        listArray[i] = _('Media Library URL')+': '+(a.medUrl || '');
    }
    function _edit(caption, vname, types, intg, clpdsa){
        editCaption = _(caption);
        editvar = (a[vname] || '').toString();
        setEdit = function(){
            if(a[vname] == editvar.trim()) return;
            if(clpdsa) pdsa.forEach(function(val){ providerSetItem(val, ''); });
            a[vname] = intg? parseInt(editvar) || 0 : editvar;
            providerSetItem("m3uArr", JSON.stringify(m3uArr));
            __m3u2list();
            getMediaArray = m3uArr.M3Us[m3uArr.active].medUrl?_getMediaArray:null;
            showPage();
        };
        showEditKey(types);
    }

    if(typeof ind === 'undefined') ind = m3uArr.active;
    var a = m3uArr.M3Us[ind];
    selIndex = 0;
    var r = _(' (after changing, load playlist)'),
        aDetail = [_('Enter playlist Name'),_('Enter playlist URL')+r, _('Enter playlist archive hours')+r,_('Enter Media Library URL'), '', _('Load playlist')]
        a2=2,a3=3,a5=5,aR=1000;
    listArray = ['', '', '', '', '', _('Load playlist')];
    if(typeof(readFile)=='function'){
        listArray.splice(2,0,'');
        aDetail.splice(2,0,_('Select playlist file')+r);
        a2=3;a3=4;a5=6;aR=2;
    }
    __m3u2list();
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+item; };
    detailListAction = function(){ listDetail.innerHTML = aDetail[selIndex]; };
    listKeyHandler = function(code){
        switch (code) {
            case keys.ENTER:
                switch (selIndex) {
                    case 0: _edit('Enter playlist Name', 'name'); return true;
                    case 1: _edit('Enter playlist URL', 'www', null, false, m3uArr.active==ind); return true;
                    case aR:
                        editvar = (a['www'] || '').toString();
                        setEdit = function(){
                            a.www = editvar;
                            providerSetItem("m3uArr", JSON.stringify(m3uArr));
                            __m3u2list();
                            showPage();
                        }
                        showFileDialog(editvar, 'm3u,m3u8');
                        return true;
                    case a2: _edit('Enter playlist archive hours', 'rechours', [0], true); return true;
                    case a3: _edit('Enter Media Library URL', 'medUrl'); return true;
                    case a5:
                        if(_number>0 && _number<7) loadPlaylist();//restart();
                        else selectAndRestart(ind);
                        return true;
                }
                return true;
            case keys.RETURN:
                if(_number>0 && _number<7){ _m3u2popup(); popupList(popupActions.indexOf(noProvParam)+1); }
                else doEditM3Ua(ind);
                return true;
            default: return false;
        }
    };
    listDetail.innerHTML = '';
    listCaption.innerHTML = _('Edit playlist data');
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
    $('#listPopUp').hide();

    showPage();
}

/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/
*/
function xml2json1(xml, tab) {
   var X = {
      toObj: function(xml) {
         var o = {};
         if (xml.nodeType==1) {   // element node ..
            if (xml.attributes.length)   // element with attributes  ..
               for (var i=0; i<xml.attributes.length; i++)
                  o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
            if (xml.firstChild) { // element has child nodes ..
               var textChild=0, cdataChild=0, hasElementChild=false;
               for (var n=xml.firstChild; n; n=n.nextSibling) {
                  if (n.nodeType==1) hasElementChild = true;
                  else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                  else if (n.nodeType==4) cdataChild++; // cdata section node
               }
               if (hasElementChild) {
                  if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                     X.removeWhite(xml);
                     for (var n=xml.firstChild; n; n=n.nextSibling) {
                        if (n.nodeType == 3)  // text node
                           o["#text"] = X.escape(n.nodeValue);
                        else if (n.nodeType == 4)  // cdata node
                           o["#cdata"] = X.escape(n.nodeValue);
                        else if (o[n.nodeName]) {  // multiple occurence of element ..
                           if (o[n.nodeName] instanceof Array)
                              o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                           else
                              o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                        }
                        else  // first occurence of element..
                           o[n.nodeName] = X.toObj(n);
                     }
                  }
                  else { // mixed content
                     if (!xml.attributes.length)
                        o = X.escape(X.innerXml(xml));
                     else
                        o["#text"] = X.escape(X.innerXml(xml));
                  }
               }
               else if (textChild) { // pure text
                  if (!xml.attributes.length)
                     o = X.escape(X.innerXml(xml));
                  else
                     o["#text"] = X.escape(X.innerXml(xml));
               }
               else if (cdataChild) { // cdata
                  if (cdataChild > 1)
                     o = X.escape(X.innerXml(xml));
                  else
                     for (var n=xml.firstChild; n; n=n.nextSibling)
                        // o["#cdata"] = X.escape(n.nodeValue);
                        o = X.escape(n.nodeValue);
               }
            }
            if (!xml.attributes.length && !xml.firstChild) o = null;
         }
         else if (xml.nodeType==9) { // document.node
            o = X.toObj(xml.documentElement);
         }
         // else
            // alert("unhandled node type: " + xml.nodeType);
         return o;
      },
      toJson: function(o, name, ind) {
         var json = name ? ("\""+name+"\"") : "";
         if (o instanceof Array) {
            for (var i=0,n=o.length; i<n; i++)
               o[i] = X.toJson(o[i], "", ind+"\t");
            json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
         }
         else if (o == null)
            json += (name&&":") + "null";
         else if (typeof(o) == "object") {
            var arr = [];
            for (var m in o)
               arr[arr.length] = X.toJson(o[m], m, ind+"\t");
            json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
         }
         else if (typeof(o) == "string")
            json += (name&&":") + "\"" + o.toString() + "\"";
         else
            json += (name&&":") + o.toString();
         return json;
      },
      innerXml: function(node) {
         var s = ""
         if ("innerHTML" in node)
            s = node.innerHTML;
         else {
            var asXml = function(n) {
               var s = "";
               if (n.nodeType == 1) {
                  s += "<" + n.nodeName;
                  for (var i=0; i<n.attributes.length;i++)
                     s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                  if (n.firstChild) {
                     s += ">";
                     for (var c=n.firstChild; c; c=c.nextSibling)
                        s += asXml(c);
                     s += "</"+n.nodeName+">";
                  }
                  else
                     s += "/>";
               }
               else if (n.nodeType == 3)
                  s += n.nodeValue;
               else if (n.nodeType == 4)
                  s += "<![CDATA[" + n.nodeValue + "]]>";
               return s;
            };
            for (var c=node.firstChild; c; c=c.nextSibling)
               s += asXml(c);
         }
         return s;
      },
      escape: function(txt) {
         return txt.replace(/[\\]/g, "\\\\")
                   .replace(/[\"]/g, '\\"')
                   .replace(/[\n]/g, '\\n')
                   .replace(/[\r]/g, '\\r');
      },
      removeWhite: function(e) {
         e.normalize();
         for (var n = e.firstChild; n; ) {
            if (n.nodeType == 3) {  // text node
               if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                  var nxt = n.nextSibling;
                  e.removeChild(n);
                  n = nxt;
               }
               else
                  n = n.nextSibling;
            }
            else if (n.nodeType == 1) {  // element node
               X.removeWhite(n);
               n = n.nextSibling;
            }
            else                      // any other node
               n = n.nextSibling;
         }
         return e;
      }
   };
   if (xml.nodeType == 9) // document node
      xml = xml.documentElement;
   var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
   return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}

function getMediaArrayXML(murl, callback){
    mediaUrls[mediaUrls.length-1] = murl;
    if(murl === '') { callback(); return; }
    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40"> '+_('Download! Wait ...')).show();
    if((typeof box_mac !== 'undefined') && box_mac) murl += ((murl.indexOf('?') == -1) ? '?' : '&')+'box_client=ott-play&box_mac='+box_mac;
    $.ajax({
        url: murl, dataType: 'text',
        timeout: 60000,
        success: function(data, textStatus, jqXHR){
            // console.log(data);
            // console.log(textStatus, jqXHR);
            try {
                var i=data.indexOf('<?xml');
                if(i!==-1){ // XML
                    if(i>0) data = data.substr(i);
                    var jj;
                    try { data = xml2json1(jQuery.parseXML(data), ' '); }
                    catch (e) { alert("Error XML !!!"); return; }
                } else {
                    i=data.indexOf('#EXTM3U');
                    if(i!==-1){ // m3u
                        getMediaArrayEXTM3U(data);
                        // console.log(mediaRecords);
                        return;
                    }
                }
                try { jj = JSON.parse(data); }
                catch (e) { alert("Error JSON !!!"); return; }
                console.log(jj);
                if(jj.items) jj = jj.items;
                mediaName = jj.playlist_name || jj.title || mediaName || '?';
                var cc = jj.channel || jj.channels;
                mediaRecords = !cc ? [] : Array.isArray(cc) ? cc : [cc];
                if(jj.next_page_url) mediaRecords.push( {title: '...', logo_30x30: '', description: '...', playlist_url: jj.next_page_url} );
            } catch (e) {
                console.log(e);
            }
        },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'medias : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus:'+textStatus+ ' ,errorThrown: '+errorThrown ); },
        complete: function(){ $('#dialogbox').hide(); callback(); },
    });
}

function getMediaArrayEXTM3U(data){
    function getAttribute(text, attribute){
    var a = text.split(attribute + '=');
    if(a.length==1 || a[1].length==0) return '';
    if(a[1][0]=='"') return a[1].split('"')[1] || '';
    else return a[1].split(/[ ,]+/)[0] || '';
}

    function item2descr(n, i){
        return '<table>'
            + '<h2><center>'+n+'</center></h2>'
            + (i?'<img id="detal" height="285" src="'+i+'" style="float: left; margin-right: 5px; margin-bottom: 5px; border-width: 0px; border-style: solid;" width="210">':'')
            + '</table>';
    }
    try{
        mediaName = mediaName || '?';
        mediaRecords = [];
        var arrEXTINF = data.split('#EXTINF:');
        arrEXTINF.shift();
        arrEXTINF.forEach(function(val, i, arr){
            var e = val.split('\n');
            var logo = getAttribute(e[0], 'tvg-logo');
            var cn = '??? Нет названия';
            try { cn = e[0].split(',')[1].trim(); } catch(e) {}
            var url = '', n = 1;
            try { url = e[1].trim(); } catch(e) {}
            while (url.indexOf('#') === 0) {
                try { url = e[++n].trim(); } catch(e) { url = ''; }
            }
            if(url)
                mediaRecords.push({title: cn, logo_30x30: logo, description: item2descr(cn, logo), stream_url: url});
        });
    } catch(e) {
        alert("Error M3U !!!");
    }
}

if(browserName() == 'dune'){
var _getMediaArray = function(murl, callback){
    if(murl === '') murl = m3uArr.M3Us[m3uArr.active].medUrl || '';
    getMediaArrayXML(murl, callback);
}
box_mac = stb.getMacAddress().replace(/:/g, '');
}
