var version = '<br/>Version: 2.4.32 (10/2/2022)',
    primaryIndex = 0, catIndex = -1,
    cList = [],
    chanels = {},
    epg = {},
    curList = [],
    p_pref = '',
    strInfo = 'INFO', strEPG = 'EPG', strSubt = '',
    strNew = ' <span style="color:red;font-size:60%;">NEW</span>',
    strUP = '<span class="fontello">&#xe80b;</span>', strDOWN = '<span class="fontello">&#xe80a;</span>',
    strLEFT = '<span class="fontello">&#xe80c;</span>', strRIGHT = '<span class="fontello">&#xe80d;</span>',
    strSTOP = '<span class="fontello">&#xe812;</span>', strPLAY = '<span class="fontello">&#xe811;</span>', strPAUSE = '<span class="fontello">&#xe813;</span>',
    strPlayPause = '<span class="fontello">&#xe811;&#xe813;</span>',
    strRW = '<span class="fontello">&#xe803;</span>', strFF = '<span class="fontello">&#xe802;</span>',
    strPREV = '<span class="fontello">&#xe806;</span>', strNEXT = '<span class="fontello">&#xe805;</span>',
    pdsa=['catsArray', 'cats', 'favoritesArray', 'parentalArray', 'catIndex', 'primaryIndex', 'prevArr', 'epgTimers',//, 'chID'
        'aAspects', 'aZooms', 'aAudios', 'aSubs', 'sSortAbc', 'sPlayers', 'medHistory', 'medFavorites'];

$.support.cors = true;
$.ajaxSetup({cache: true});
var __cv = 175;

var te;
// Hook: EPG load
(function() {
    orig_ajax = $.ajax;
    $.ajax = function(a,b) {
        if (/^http:\/\/epg\.augin\.ru\//.test(a.url)) {
//            a.url = a.url.replace("//epg.ott-play.com/", "//ott-epg.prog4food.eu.org/");
            a.url = a.url.replace(/\/epg\/([^\/]+)\.json$/, function (match, p1) { return "/epg/" + xxHash32(te.encode(p1)) + ".json";
            });
        }
        else if (/^http:\/\/cps\.ott-play\.com\//.test(a.url))
            a.url = a.url.replace("//cps.ott-play.com/", "//cps.augin.ru/");
        return orig_ajax(a,b);
    }
})();

host_ott = "https://augin.github.io"

if(typeof(host) == "undefined") host = '';

if(!/^https?:\/\/(?:ott-play\.com|ott\.prog4food\.eu\.org)$/.test(host)) host = ''; // for SONY !!!!!


function getWidthK(){ return window.innerWidth/1280; }
function getHeightK(){ return window.innerHeight/720; }
function checkIfIncluded(file) {
    var links = document.getElementsByTagName("link");
    for(var i = 0; i < links.length; i++)
        if (links[i].href.indexOf(file) != -1) return true;
    return false;
}
if(!checkIfIncluded('1280.css'))
    $(document.head).append('<link rel="stylesheet" type="text/css" href="'+host+'/stbPlayer/1280.css?'+__cv+'"/>');

function alert(mes){ showShift(mes); }

function log(id, str){
    try {
        var e = document.getElementById(id);
        e.innerHTML = str+'<br>'+e.innerHTML;
    } catch (e){}
}

// add events show-hide
(function($) {
	$.each(['show', 'hide'], function(i, ev) {
		var el = $.fn[ev];
		$.fn[ev] = function() {
			this.trigger(ev);
			return el.apply(this, arguments);
		};
	});
})(jQuery);

//
$('#listAbout').on('show', function() { $('#listIn').hide(); });
$('#listAbout').on('hide', function() { $('#listIn').show(); });
//Channel list
$('#listEdit').on('show', function() { $('#listIn').hide(); });
$('#listEdit').on('hide', function() { $('#listIn').show(); $('#listEdit').text(''); });

$('#dialogbox').on('show', function(){
    // console.log($(this).css(["left", "top","width", "height"]), $(this).width(), $(this).height());
    $(this).css({top:0, left:0, width:'auto', height:'auto'}).css({top:(720*getHeightK()-$(this).height())/2, left:(1260*getWidthK()-$(this).width())/2});
});
var $i1 = $('#info1');
$i1.hide();
var infoTimeout = null;
function infoBarHideT(){
    if($('#buffering').is(":visible") || !stbIsPlaying() || $('#step').is(":visible"))
        infoTimeout = setTimeout(infoBarHideT, sInfoTimeout*1000);
    else
        infoBarHide();
}
function infoBarHide(){
    try{ tooltip.style.display = ''; } catch(e){}
    clearTimeout(infoTimeout);
    if(sInfoSlide) $i1.slideUp();
    else $i1.hide();
}
function scrollUpDescr(){
    if(tooltip.style.display) tooltip.style.top = ($progress_div.offset().top - $progress_div.height()) + 'px';
    $('#programm_descr').stop(true).css("margin-top", 0);
    var a = $('#programm_descr').height() - $('#descr').height() + $('#programm_name2').height()+$('#programm_duration').height();
    // log('info', a +' '+ $('#programm_descr').height() +' '+ $('#descr').height() +' '+  $('#programm_name2').height()+' '+ $('#programm_duration').height());
    // function countWords(s){ return s.split(/\s+/).length;}
    // var h = $('#programm_descr').height(), cw = countWords($('#programm_descr').text()), v = (h - a)/h*cw, i = a/h*cw;
    // console.log($('#programm_descr').height(), a, cw, h, v , i, v/200*60*1000);
    // scrollUp('programm_descr', a, v/200*60*1000);
    scrollUp('programm_descr', a, 10000);
}
function showChanelInfo(num){
    clearTimeout(detailTimer);
    clearTimeout(infoTimeout);
    if(num === undefined) num = 0;
    if(num==1&&$i1.is(":visible")&&!$('#descr').is(":visible")){
        infoTimeout = setTimeout(infoBarHideT, sInfoTimeout*1000);
        return;
    }
    if(num) $i1.hide();
    $('#programm_descr').stop(true).css("margin-top", 0);

    if(!$i1.is(":visible")){
        if(num != 2) $('#descr').hide();
        else $('#descr').show();
        if(sInfoSlide) $i1.slideDown(400, scrollUpDescr);
        else $i1.show(0, scrollUpDescr);
        if(num != 2)
            infoTimeout = setTimeout(infoBarHideT, sInfoTimeout*1000);
    }
    else if(!$('#descr').is(":visible")) {
        if(sInfoSlide) $('#descr').slideDown(400, scrollUpDescr);
        else $('#descr').show(0, scrollUpDescr);
    }
    else infoBarHide();
}
// tooltip.style.top = ($progress_div.offset().top - $progress_div.height()) + 'px';
var current_t = document.getElementById('current_t');
var current_s = document.getElementById('current_s');
var list_t = document.getElementById('list_t');
var list_s = document.getElementById('list_s');
var perm_t = document.getElementById('permanentTime');
function _t2(a){ return (a.toString().length == 1) ? '0'+a : a; };
setInterval(function(){
    var c = new Date(Date.now()), hm = _t2(c.getHours()) + ':' + _t2(c.getMinutes()), s = ':' + _t2(c.getSeconds());
    current_t.innerHTML = hm;
    current_s.innerHTML = s;
    list_t.innerHTML = hm;
    list_s.innerHTML = s;
    perm_t.innerHTML = hm;

    if(playType && stbIsPlaying()) playTime++;
}, 1000);

setInterval(function(){
    try{
        if(playType < 0){ // media play
            updateMediaInfo();
            return;
        }
        if(!playType){
            var ch_id = curList[primaryIndex], c = chanels[ch_id];
            if(getCurProgData(ch_id, updateChanelInfo)) {
                _prog100 = c;
                $('#progress').css('width', ((Date.now()/1000 - c.time) / (c.time_to - c.time) * 100) + '%');
                $('#end_time').text( '+' + Math.round((c.time_to - Date.now()/1000)/60) );
                var t = Math.round((Date.now()/1000 - c.time)/60);
                if(t>0) $('#cur_time').text( t+'/' );
            }
        } else {
            var curr_time = playType + playTime;
            if(curProg==-1 || curr_time > epgArray[curProg].time_to) updateArchiveInfo(curr_time);
            else {
                var c = epgArray[curProg]||{name:'', time:Math.floor(curr_time/3600)*3600, time_to:(Math.floor(curr_time/3600)+1)*3600, descr: ''};
                _prog100 = c;
                $('#progress').css('width', ((curr_time - c.time) / (c.time_to - c.time) * 100) + '%');
                $('#progress_r').css('width', c.time_to>Date.now()/1000 ? ((c.time_to - Date.now()/1000) / (c.time_to-c.time) * 100) + '%' : '0%');
                $('#end_time').text( '+' + Math.round((c.time_to - curr_time)/60) );
                $('#arc_time').text(time2time(curr_time));
                var t = Math.round((curr_time - c.time)/60);
                if(t>0) $('#cur_time').text( t+'/' );
            }
        }
    } catch(e){}
}, 30000);

function send_event(eventAction, eventCategory, eventLabel){
}
var _gap = null;
function ga_event(eventAction, eventCategory, eventLabel){
    send_event(eventAction, eventCategory, eventLabel);
    clearTimeout(_gap);
    _gap = setTimeout( function(){ ga_event('ping', 'ping', 'ping'); }, 120*60000);
}
var _sn=0;
// function stat(){ $.get('http://stat.ott-play.com?v='+version.substring(14).replace(/ /g,'|')+'&n='+_sn++); }
// function stat(){ $.get('http://stat.ott-play.com/'+version.split('2021) ')[1].replace(/\//g,'.').replace(/ /g,'.')+'.'+(_sn++)); }
// function stat(){ _sn++; ga_event('ping', 'ping', _sn+'0'); }
// setInterval(stat, 600000);
// function stat(){};
function getThumbnail(icon){
    return sThumbnail&&icon?'<img src="'+icon+'" style="max-width:15%;max-height:15%;float: left; margin-right: 5px;border-width: 0px;" onerror="this.width=0;this.height=0;">':'';
}
function updateChanelInfo(ch_id){
    if(ch_id != curList[primaryIndex]) return;

    $('#channel_number').html((primaryIndex+1));
    var c = chanels[ch_id];
    if(c){
        $('#picon').css('background-image', 'url("' + getChannelPicon(ch_id) + '")');
        $('#channel_name').html(c.channel_name);
    } else {
        $('#picon').css('background-image', 'url("")');
        $('#channel_name').html(_('Channel is not available!!!')+' id=' + ch_id);
    }

    $progress_div.css('background-color', '#446');
    $('#progress_r').css('width', '0%');
    $('#nprogramm_name').html('&nbsp; ');
    $('#nbegin_time').text('');
    $('#nend_time').text('');

    if (!getCurProgData(ch_id, updateChanelInfo)){
        $('#programm_name').html('&nbsp; ');
        _prog100 = 0;
        $('#progress').css('width', '0%');
        $('#begin_time').text('');
        $('#end_time').text('');

        $('#programm_name2').text('');
        $('#programm_duration').text('');
        $('#programm_descr').text('');
    } else {
        $('#programm_name').html(c.name);
        _prog100 = c;
        $('#progress').css('width', ((Date.now()/1000 - c.time) / (c.time_to - c.time) * 100) + '%');
        $('#begin_time').text(time2time(c.time));
        $('#end_time').text( '+' + Math.round((c.time_to - Date.now()/1000)/60) );
        if(c.nextpr && c.nextpr.length){
            $('#nprogramm_name').html(c.nextpr[0].name);
            $('#nbegin_time').text(time2time(c.nextpr[0].time));
            $('#nend_time').text(Math.round((c.nextpr[0].time_to - c.nextpr[0].time)/60));
        }

        $('#programm_name2').html(c.name);
        var t = Math.round((Date.now()/1000 - c.time)/60);
        $('#programm_duration').html(time2str(c.time)+' - '+time2time(c.time_to)+' (<span id="cur_time">'+(t>0?t+'/':'')+'</span>'+Math.round((c.time_to - c.time)/60)+' '+_('min')+')');
        // var ico = c.icon?'<img src="'+c.icon+'" style="max-width:15%;max-height:15%;float: left; margin-right: 5px;border-width: 0px;" onerror="this.width=0;this.height=0;">':'';
        $('#programm_descr').html(c.descr? getThumbnail(c.icon)+c.descr.replace(/\|/g,"<br/>"):'');
    }
    if(sInfoChange && !$i1.is(":visible")) showChanelInfo(1);
}
function setCurProg(ch_id, data, cb){
    var epg = [];
    if((data !== null) && (data.length)){
        epg = data.sort(function (a, b) { return a.time - b.time; });
    }
    var curp = epg.findIndex(function(element, index, array){ return (element.time_to >= Date.now()/1000) && (element.time <= Date.now()/1000); });
    var c = chanels[ch_id];
    if(curp === -1) {
        c.name = ''; c.time = 0; c.time_to = 0; c.descr = ''; c.nextpr = null; c.time_request = Date.now()/1000+3600; // следующая попытка через час
    } else {
        var e = epg[curp];
        c.name = e.name; c.time = e.time; c.time_to = e.time_to; c.descr = e.descr; c.time_request = 0; c.icon = e.icon;
        c.nextpr = epg.slice(curp+1, curp+1+sNextCount+1);
        if(c.nextpr.length==0) c.nextpr = null;
        // console.log(curp, c.nextpr, epg);
        if(cb) cb(ch_id);
    }
}
var arrayGetCurProg = [];
function doGetCurProg(){
    // log("info", "arrayGetCurProg.length11 " + arrayGetCurProg.length);
    if(arrayGetCurProg.length === 0) return;
    var cp = arrayGetCurProg.shift();
    getEPGchanelCurCached(cp.ch_id, function(ch_id, data){
        setCurProg(ch_id, data, cp.callback);
        doGetCurProg();
    });
}
function getCurProgData(ch_id, callback){
    if(!chanels[ch_id]) return false;
    if(chanels[ch_id].time_to && (chanels[ch_id].time_to >= Date.now()/1000)) return true;
    if(chanels[ch_id].time_request && (chanels[ch_id].time_request > Date.now()/1000)) return false;
    var R = false;
    if(chanels[ch_id].nextpr){ setCurProg(ch_id, chanels[ch_id].nextpr, nofun); chanels[ch_id].time_request = 0; }
    if(chanels[ch_id].time_to && (chanels[ch_id].time_to >= Date.now()/1000)) R = true;

    arrayGetCurProg.push({ch_id: ch_id, callback: callback});
    if(arrayGetCurProg.length < 2)
        // setTimeout(doGetCurProg);
        doGetCurProg();
        // setTimeout(doGetCurProg, 10);
    return R;
}

function body_onUnload(){
    setCurrent(catIndex, primaryIndex);
    playType = 0;
}
if(navigator.userAgent.toLowerCase().search(/maple/)==-1){ // no old samsung models!
    if (document.addEventListener) document.addEventListener("visibilitychange", function(){ if(document.hidden) body_onUnload(); });
    else if (document.attachEvent) document.attachEvent("onvisibilitychange", function(){ if(document.hidden) body_onUnload(); });
    if (window.addEventListener) window.addEventListener("beforeunload", body_onUnload);
    else if (window.attachEvent) window.attachEvent("onbeforeunload", body_onUnload);
    if (window.addEventListener) window.addEventListener("unload", body_onUnload);
    else if (window.attachEvent) window.attachEvent("onunload", body_onUnload);

    // prevPage -> RETURN key
    // var backFunction = function(){
    //     history.pushState('', '', '');
    //     keyHandler({ keyCode: keys.RETURN, preventDefault: function(){}, stopPropagation: function(){} });
    // }
    // if (window.addEventListener) window.addEventListener("popstate", backFunction);
    // else if (window.attachEvent) window.attachEvent("onpopstate", backFunction);
    // try{ history.pushState('', '', ''); } catch(e) {}
}

var playType = 0, prevArr = [];
function setCurrent(cat, index, arch){
    if(typeof(arch)=='undefined') arch = false;
    if((cat != catIndex) || (index != primaryIndex) || (arch != (playType>0) || (index==-1) || (playType==-100000000000))){
        if(playType==-100000000000){ // media played
            if(medHistory.length){
                medHistory[0].current = Math.floor(stbGetPosTime());
                if(sFavorites!=-1) providerSetItem('medHistory', JSON.stringify(medHistory));
            }
        } else try{
            var ci = cats[catsArray[catIndex]][primaryIndex], ci1 = cats[catsArray[cat]][index], ct = playType>0;
            // prevArr = prevArr.filter(function(val){ return (val.ci != ci) && (val.ci != ci1); });
            prevArr = prevArr.filter(function(val){
                var vt = val.t!=undefined;
                return ((val.ci != ci) || vt != ct) && ((val.ci != ci1) || (vt != arch));
            });
            prevArr.unshift({ci:ci, c:catIndex, i:primaryIndex});
            if(playType>0) prevArr[0].t = playType+playTime;
            prevArr.splice([1,5,10,15,20][sPrevCount]);
            providerSetItem('prevArr', JSON.stringify(prevArr));
            // console.log(prevArr);
        } catch(e){}
        if(index==-1) return;
    }

    catIndex = cat;
    curList = cats[catsArray[catIndex]];
    primaryIndex = index;

    providerSetItem('primaryIndex', primaryIndex);
    providerSetItem('catIndex', catIndex);
    // providerSetItem('chID', curList?curList[primaryIndex]:'');
}

var _tmedia = null, _gplay = null;
function checkMedia(){
    clearTimeout(_tmedia);
    if($('#buffering').is(":visible")){
        _tmedia = setTimeout(checkMedia, 2000);
        return;
    }
    var l = stbGetLen();
    if(l && (l>180) && (l!=Infinity) && (l<1000000)){ // media?
        playTime = 0;
        playType = -200000000000;
        forcePlay = true;
        $progress_div.css('background-color', '#600');
        $('#progress_r').css('width', '0%');
        updateMediaInfo();
    }
}
var playChannel = _playChannel;
function _playChannel(cat, index){
    if(ifParentalAccessChId(cats[catsArray[cat]][index], function(){ playChannel(cat, index); })) return;

    if(sStopPlay) stbStop(); // for black screen

    setCurrent(cat, index);
    var ch_id = curList[primaryIndex];
    updateChanelInfo(ch_id);

    if(sInfoSwitch) showChanelInfo(1);

    playType = 0;
    // setTimeout(function() {
        stbPlay(getChannelUrl(ch_id));
    // }, 20);
    clearTimeout(_tmedia);
    _tmedia = setTimeout(checkMedia, 2000);

    clearTimeout(_gplay);
    // if(chanels[ch_id]) _gplay = setTimeout( function(){ ga_event('play', 'tv', chanels[ch_id].channel_name);}, 300000);
}

function plusProg(){
    var i = primaryIndex + 1;
    if (i >= curList.length) i = 0;
    playChannel(catIndex, i);
}

function minusProg(){
    var i = primaryIndex - 1;
    if (i < 0) i = curList.length - 1;
    playChannel(catIndex, i);
}

function prevProg(){
    function isToday(time){
        var today = new Date(Date.now()), someDate = new Date(time*1000);
        return someDate.getDate() == today.getDate() && someDate.getMonth() == today.getMonth() && someDate.getFullYear() == today.getFullYear();
    }
    function t2pr(t){return isToday(t)? time2time(t):time2str(t); }
    var cat, ind;
    function findInd(prevRec){
        cat = prevRec.c;
        ind = cats[catsArray[cat]].indexOf(prevRec.ci);
        if(ind!=-1) return;
        ind = cats[_('All')].indexOf(prevRec.ci);
        cat = catsArray.indexOf(_('All'));
    }
    switch (prevArr.length) {
        case 0: return;
        case 1: findInd(prevArr[0]); playChannel(cat, ind); return;
        default:
            var al=[];
            // var lh = 630*getHeightK()/pageSize, iw = [0, lh-2, lh*1.5][sShowPikon];
            prevArr.forEach(function(val, i, o){ try{
                al.push(chanels[val.ci].channel_name+(val.t?'<span style="color:red;"> - '+t2pr(val.t)+'</span>':''))
                // al.push((iw ? '<div class="img" style="float:none;display:inline-block;background-image:url(\'' + getChannelPicon(val.ci) + '\');vertical-align:middle;height:'+lh+'px;width:'+iw+'px;"></div> ' : '') +chanels[val.ci].channel_name+(val.t?'<span style="color:red;"> - '+t2pr(val.t)+'</span>':''))
            } catch(e){ o.splice(i, 1) } });
            showSelectBox(0, al, function(val){
                if(prevArr[val].t){
                    var ch_id = prevArr[val].ci, t = prevArr[val].t;
                    findInd(prevArr[val]);
                    setCurrent(cat, ind, true);
                    getEPGchanelCached(ch_id, function(ch_id, data){
                        if((data !== null) && (data.length)){
                            var epg = data.filter(function(val){
                                return val.time > (Date.now()/1000 - chanels[ch_id].rec*60*60);
                            }).sort(function(a, b){ return a.time - b.time; });
                        }
                        epgArray = epg;
                        setCurProg(ch_id, data, null);
                        playArchive(t);
                    });
                } else {
                    findInd(prevArr[val]);
                    playChannel(cat, ind);
                }
            }, 0);
    }
}

var numProg = document.getElementById('numprog');
numProg.style.display = 'none';
var nProg = '', numTimeout = null;
function numberProg(num){
    if((nProg == '') && (!num)) return;
    if(nProg.length == 4){
        if(nProg == '9999'){
            if(num == 7) $('#info').toggle();
            if(num == 9) popupList();
        }
        return;
    }
    nProg += num.toString();
    var p = parseInt(nProg)-1;
    numProg.innerHTML = nProg + (((p<0)||(p>=curList.length))?'':'<br/>'+chanels[curList[p]].channel_name);
    numProg.style.display = '';
    clearTimeout(numTimeout);
    numTimeout = setTimeout(function() {
        numProg.style.display = 'none';
        var p = parseInt(nProg)-1;
        nProg = '';
        if ((p < 0) || (p >= curList.length) || (p == primaryIndex)) return;
        playChannel(catIndex, p);
    }, 2000);
    // if(nProg == '9977') $('#info').toggle();
}

var list = document.getElementById('list');
list.style.display = 'none';
var listIn = document.getElementById('listIn');
var listCaption = document.getElementById('listCaption');
var listPodval = document.getElementById('listPodval');
var listDetail = document.getElementById('listDetail');
var pageSize = 25;
var selIndex;
var listArray;
var getListItem;
var detailListAction;
var listKeyHandler;

var itemWith = 735;

function showPage(){
    if(list.style.display !== ''){
        $i1.hide();
        $('#permanentTime').hide();
        listIn.innerHTML = '';
        if(sNoSmall) $('#list_osd').show();
        else try{
            $('#list_window').show();
            stbSetWindow();
            if(pipIndex != null) stbStopPip();
        }catch(e){}
        list.style.display = '';
    }
    arrayGetCurProg = [];
    var html = '',
        bi = Math.floor(selIndex/pageSize) * pageSize,
        be = Math.min(bi+pageSize, listArray.length),
        lh = (window.innerHeight-90*getHeightK())/pageSize;
    if(sShowScroll && (listArray.length > pageSize)){
        itemWith = getWidthK()*720;
        var sw = 10*getWidthK();
        var pages = Math.floor(listArray.length/pageSize) + (listArray.length % pageSize ? 1:0),
            pageno = Math.floor(selIndex/pageSize);
        html += '<div onclick="event.stopPropagation();changeSelect('+pageSize+');" style="float:right;height:100%;width:'+sw+'px; border: 1px solid '+bodyColor+';"><div onclick="event.stopPropagation();changeSelect(-'+pageSize+');" style="width:100%;height:'+pageno/pages*100+'%;"></div><div style="background-color: '+bodyColor+';width:100%;height:'+100/pages+'%;"></div></div>';
    }
    else itemWith = getWidthK()*735;
    for (var i = bi; i < be; i++) {
        html += '<div id="it' + i + '" onclick="event.stopPropagation();setSelect(' + i + ')" class="item" style="height:'+lh+'px; line-height:'+lh+'px; width:'+itemWith+'px;' + (i===selIndex ? 'color: '+ curColor + '; background-color:'+curColorB+';">' : '">');
        try {
            html += getListItem(listArray[i], i) + '</div>';
        } catch (e) {
            html += 'ERROR:' + e.message + '</div>';
        }
    }
    listIn.innerHTML = html;
    detailListActionWithTimeOut();
}
function _doKey(code){
    event.stopPropagation();
    keyHandler({keyCode: code, preventDefault: function(){}, stopPropagation: function(){}});
}
function setSelect(val){
    if(selIndex == val) _doKey(keys.ENTER);
    else {
        $('#it'+selIndex).css({"background-color": '', "color": ''});
        selIndex = val;
        $('#it'+selIndex).css({"background-color": curColorB, "color": curColor});
        detailListActionWithTimeOut();
    }
}
function onWheel(e){
    e = e || window.event;
    var delta = e.deltaY || e.detail || -e.wheelDelta;
    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    if ((delta < 0) && (selIndex > 0)) changeSelect(-1);
    if ((delta > 0) && (selIndex < listArray.length-1)) changeSelect(1);
}
if('onwheel' in document){
    listIn.onwheel = onWheel;
} else if('onmousewheel' in document){
    // устаревший вариант события
    listIn.onmousewheel = onWheel;
}

var xDown = null, yDown = null, xUp, yUp;
function handleTouchStart(evt){
    // evt.preventDefault();
    xDown = evt.originalEvent.touches[0].clientX;
    yDown = evt.originalEvent.touches[0].clientY;
    xUp = xDown;
    yUp = yDown;
};
function handleTouchMove(evt){
    evt.preventDefault();
    if ( ! xDown || ! yDown ) return;
    xUp = evt.originalEvent.touches[0].clientX;
    yUp = evt.originalEvent.touches[0].clientY;
}
function handleTouchEnd(evt){
    // evt.preventDefault();
    if ( ! xDown || ! yDown ) return;
    var xDiff = xDown - xUp, yDiff = yDown - yUp;
    if(Math.abs(yDiff)>10||Math.abs(xDiff)>10){
        if(Math.abs(yDiff) > Math.abs(xDiff))
            changeSelect(yDiff>0 ? pageSize : -pageSize);
        else
            _doKey(xDiff>0 ? keys.RIGHT : keys.LEFT);
    }
    /* reset values */
    xDown = null;
    yDown = null;
};
$("#listIn").bind('touchstart', handleTouchStart);
$("#listIn").bind('touchmove', handleTouchMove);
$("#listIn").bind('touchend', handleTouchEnd);
function body_handleTouchEnd(evt){
    // evt.preventDefault();
    if ( ! xDown || ! yDown ) return;
    if($('#dialogbox').is(":visible") || $('#numprog').is(":visible") || list.style.display != 'none') return;
    var xDiff = xDown - xUp, yDiff = yDown - yUp;
    if((Math.abs(yDiff)>10)||(Math.abs(xDiff)>10)){
        evt.preventDefault();
        // alert(xDiff+':'+yDiff);
        var bh = document.body.getBoundingClientRect().height, bw = document.body.getBoundingClientRect().width;
        if(xDown > bw*.5)
            if((Math.abs(yDiff) > Math.abs(xDiff)))
                _doKey(yDiff>0 ? keys.UP : keys.DOWN);
            else
                _doKey(xDiff>0 ? keys.RIGHT : keys.LEFT);
    }
    /* reset values */
    xDown = null;
    yDown = null;

};
$(document.body).bind('touchstart', handleTouchStart);
$(document.body).bind('touchmove', handleTouchMove);
$(document.body).bind('touchend', body_handleTouchEnd);

function changeSelect(val){
    if(!listArray.length) return;
    var oldIndex = selIndex;
    selIndex += val;
    if (selIndex < 0)
        selIndex = (val === -1) ? listArray.length-1 : 0;
    else if (selIndex >= listArray.length)
        selIndex = (val === 1) ? 0 : listArray.length-1;
    var $c = $('#it'+selIndex);
    if($c.length){
        $('#it'+oldIndex).css({"background-color": "", "color": ''});
        $c.css({"background-color": curColorB, "color": curColor});
        detailListActionWithTimeOut();
    }
    else showPage();
}

function closeList(){
    try{
        list.style.display = 'none';
        $('#list_osd').hide();
        $('#list_window').hide();
        $('#listPopUp').hide();
        $('#permanentTime').toggle(sPermanentTime!=0);
        stbToFullScreen();
        if (!sNoSmall && pipIndex!=null) stbPlayPip(getChannelUrl(cats[catsArray[pipCatIndex]][pipIndex]));
        if(sPreview && previewChan){
            // if(previewChan.c != catIndex || previewChan.i != primaryIndex){
            if(previewChan.ch_id != curList[primaryIndex]){
                if(sStopPlay) stbStop(); // for black screen
                if(playType>0) playArchive(playType + playTime - (s10resum?10:0));
                else playChannel(catIndex, primaryIndex);
            }
            previewChan = null;
        }
    }catch(e){}
}

var listCatIndex = null;
var previewChan = null, previewTimer = null;
// function previewChannel(cat, index){
//     if(previewChan && previewChan.c==cat && previewChan.i==index) return;
//     clearTimeout(previewTimer);
//     if(ifParentalAccess(cat, index, function(){ previewChannel(cat, index); })) return;
//     previewTimer = setTimeout(function() {
//         if(sStopPlay) stbStop(); // for black screen
//         var ch_id = cats[catsArray[cat]][index];
//         previewChan = {c:cat, i:index, ch_id:ch_id};
//         stbPlay(getChannelUrl(ch_id));
//     }, 500);
// }
function previewChId(ch_id){
    if(previewChan && previewChan.ch_id==ch_id) return;
    clearTimeout(previewTimer);
    if(ifParentalAccessChId(ch_id, function(){ previewChId(ch_id); })) return;
    previewTimer = setTimeout(function() {
        if(sStopPlay) stbStop(); // for black screen
        previewChan = {c:0, i:0, ch_id:ch_id};
        // var ch_id = cats[catsArray[cat]][index];
        stbPlay(getChannelUrl(ch_id));
    }, 500);
}
var detailTimer = null;
function detailListActionWithTimeOut(){
    clearTimeout(detailTimer);
    listDetail.innerHTML = '';
    detailTimer = setTimeout(function(){
        clearTimeout(detailTimer);
        detailListAction();
    },200);
}
function scrollUp(el, up, ms){
    clearTimeout(detailTimer);
    if(up>0) detailTimer = setTimeout(function(){
        $('#'+el).animate({ "margin-top": "-="+up }, up*80);
    }, ms);
}
function detailProg(){
    var ch = chanels[listArray[selIndex]];
    if ((ch.time_to) && (ch.time_to >= Date.now()/1000)){
        var t = Math.round((Date.now()/1000 - ch.time)/60);
        var ld = '<div id="_name"><div style="color:'+curColor+';">'+ch.name+'</div><div style="font-size:smaller;">'+time2time(ch.time) + ' - ' + time2time(ch.time_to) + ' (' + (t>0?t+'/':'') + Math.round((ch.time_to - ch.time)/60) + ' '+_('min')+')</div></div>'
            + '<div id="_descr" style="font-size:smaller;overflow:hidden;"><div id="_prd">'+getThumbnail(ch.icon)+ch.descr+'</div></div>';
        if(ch.nextpr&&sNextCountL){
            ld += '<div id="_nextpr" style="'+(sShowDescr?'position:absolute;left:0;bottom:0;padding:4px;':'')+'width:98%;white-space:nowrap;font-size:smaller;">';
            ch.nextpr.forEach(function(item, i){
                if(i<sNextCountL)
                ld += time2time(item.time) + ' <span style="color:'+curColor+';">' +item.name+'</span></br>';
            });
            ld += '</div>';
        }
        listDetail.innerHTML = ld;
        var a = sShowDescr ? $('#listDetail').height() - $('#_name').height() - $('#_nextpr').height()||0 : 0;
        $('#_descr').height(a);
        a = $('#_prd').height() + 10 - a;
        scrollUp('_prd', a, 5000);
    }
    if(sPreview==1) previewChId(listArray[selIndex]);//previewChannel(listCatIndex, selIndex);    // },200);
}
function updateChanelList(ch_id){
    $('#pn'+ch_id).html(chanels[ch_id].name);
    $('#pr'+ch_id).css('width', ((Date.now()/1000 - chanels[ch_id].time) / (chanels[ch_id].time_to - chanels[ch_id].time) * 100)+'%');
    if(listArray[selIndex] == ch_id) detailProg();
};
function addChannel2bucket(){
    var cc = selIndex, ch_id = listArray[selIndex];//cats[catsArray[listCatIndex]][selIndex];
    if(sFavorites){
        if(!listCatIndex) return;
        cats[_('Favorites')].push(ch_id);
        saveChannelsCats();
        showShift(_('Channel ') + chanels[ch_id].channel_name + _(' added to favorites'));
    } else {
        saveCPD();
        var _si = selIndex, _li = listArray, _gi = getListItem, _di = detailListAction, _lh = listKeyHandler, _lp = $('#listPopUp').is(":visible");
        selIndex = 0;
        listArray = catsArray.slice(1);
        getListItem = function(item, i){ return '&nbsp;&nbsp;' + item; };
        // listDetail.innerHTML = '';
        detailListAction = function(){};
        listKeyHandler = function(code){
            switch(code){
        		case keys.ENTER:
                    cats[listArray[selIndex]].push(ch_id);
                    saveChannelsCats();
                    showShift(_('Channel ') + chanels[ch_id].channel_name + _(' added to category ') + listArray[selIndex]);
                case keys.RETURN:
                    // channelsList(listCatIndex, cc); if(!sNoNumbersKeys) $('#listPopUp').show(); return true;
                    restoreCPD();
                    selIndex = _si; listArray = _li; getListItem = _gi; detailListAction = _di; listKeyHandler = _lh;
                    showPage();
                    if(_lp) $('#listPopUp').show();
                    return true;
            }
            return false;
        };
        listCaption.innerHTML = _('Select category to add channel');
        listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
        $('#listPopUp').hide();
        showPage();
    }
}
function parentChannel(){
    if(!sPSchannels || parentPIN=='*') return;
    if(!parentAccess){
        enterPinAndSetAccess(parentChannel);
        return;
    }
    var i = parentalArray.indexOf(listArray[selIndex]);
    if(i == -1)
        parentalArray.push(listArray[selIndex]);
    else
        parentalArray.splice(i, 1);

    providerSetItem('parentalArray', JSON.stringify(parentalArray));

    showPage();
}
var TMDb = {
    api_url: 'http://api.themoviedb.org/3/',
    api_key: '9759770d3dd0c01a9498909c517a7bdd',
    la: {'_eng':'en', '_arm':'hy', '_bel':'be', '_fra':'fr', '_ger':'de', '_gre':'el', '_heb':'he', '_hun':'hu', '_lat':'lv', '_lit':'lt', '_pol':'pl', '_por':'pt', '_rou':'ro', '_rus':'ru', '_spa':'es', '_tur':'tr', '_ukr':'uk'},
    media_type_id: '',
    data: null,
    get: function(media_type, id){
        var  api_lang = TMDb.la[stbGetItem("ottplaylang")]||'en';
        function item2descr(item){
            // console.log(item);
            function it(val, title){ return val ? (title?'<b>'+_(title)+': </b>':'')+val+'<br>' : ''; };
            var genre=[], country=[], actors=[], director=[], script=[];
                // d = new Date(item.release_date),
                // y = d.getFullYear()?d.getFullYear():'',
                // y = item.release_date.split('-')[0]||'';
            if(item.genres) item.genres.forEach(function(val){genre.push(val.name)});
            if(item.production_countries) item.production_countries.forEach(function(val){country.push(val.name)});
            if(item.credits.cast) item.credits.cast.slice(0, 10).forEach(function(val){actors.push(val.name)});//+(val.character?' ('+val.character+')':''))});
            if(item.credits.crew) item.credits.crew.forEach(function(val){
                if(val.job=='Director') director.push(val.name);
                else if(val.job=='Screenplay') script.push(val.name);
            });
            return '<div id="_prdD" style="margin: -'+10*getHeightK()+'px; background-position: right -200px top; background-size: cover; background-repeat: no-repeat; background-image: url(http://image.tmdb.org/t/p/w500/'+item.backdrop_path+');">'
                // +'<div style="padding:'+20*getHeightK()+'px; background: rgba(13, 37, 63, 0.8); background: linear-gradient(to right, rgba(13, 37, 63, 1) 0%, rgba(13, 37, 63, 0.8) 100%); background: -moz-linear-gradient(left, rgba(13,37,63,1) 0%, rgba(13,37,63,0.8) 100%); background: -webkit-linear-gradient(left, rgba(13,37,63,1) 0%,rgba(13,37,63,0.8) 100%);">'
                +'<div style="padding:'+20*getHeightK()+'px; background: rgba(13, 37, 63, 0.8); background: linear-gradient(to right, rgba(13, 37, 63, 1) 0%, rgba(13, 37, 63, 0.8) 100%);">'
                +'<table>'
                + '<img height="'+20*getHeightK()+'" src="'+host+'/stbPlayer/blue_short.png" alt="TMDb" style="float: right; border-width: 0px; border-style: solid;" onerror="this.width=0;this.height=0;">'
                + (item.poster_path?'<img height="'+300*getHeightK()+'" width="'+200*getHeightK()+'" src="http://image.tmdb.org/t/p/w500/'+item.poster_path+'" style="float: left; margin-right: '+10*getHeightK()+'px; margin-bottom: '+10*getHeightK()+'px; border-width: 0px; border-style: solid;" onerror="this.width=0;this.height=0;">':'')
                + '<div style="text-align:center;font-size:larger;">'+(item.title||item.name)+'</div><br>'
                // + it(item.original_name, '') + it(item.release_date, 'Release date')
                + it((item.release_date||'').split('-')[0], 'Year') + it(Math.round(item.runtime||item.episode_run_time)+' '+_('min'), 'Duration')
                + it(genre.join(', '), 'Genre') + it(country.join(', '), 'Country')
                + it(actors.join(', '), 'Actors') + it(director.join(', '), 'Director') + it(script.join(', '), 'Script')
                + it(item.vote_average, 'Rating')
                   // + it(item.producer, 'Producer') + it(item.operator, 'Operator')
                // + it(item.composer, 'Composer') + it(item.artist, 'Artist') + it(item.installation, 'Installation')
                // + it(item.budget, 'Budget') + it(item.revenue, 'revenue')
                // + it(item.premiere_world, 'Premiere world') + it(item.age, 'Age')// + it(item.imdb, 'imdb')
                // + '<p><hr><b>'+_('Description')+': </b>'+item.overview+'</p></table></div>';
                + (item.overview?'<hr>'+item.overview:'')
                +'</table></div></div>';
        }
        function show(){
            clearTimeout(detailTimer);
            $('#dialogbox').html(item2descr(TMDb.data)).show();
            dialogBoxKeyHandler = function(code){
                switch (code) {
                    case keys.DOWN:
                        clearTimeout(detailTimer);
                        if($('#_prdD').height()-$('#dialogbox').height()-20*getHeightK()+parseInt($('#_prdD').css("margin-top"))>0)
                            $('#_prdD').animate({"margin-top": "-=1.1em"}, 20);
                        break;
                    case keys.UP:
                        clearTimeout(detailTimer);
                        if(parseInt($('#_prdD').css("margin-top"))<-10*getHeightK())
                            $('#_prdD').animate({"margin-top": "+=1.1em"}, 20);
                        break;
                    case keys.RETURN: if(TMDb.results.length>1) setTimeout(function(){TMDb.select();});
                    case keys.ENTER:
                    case keys.EXIT: $('#dialogbox').hide(); clearTimeout(detailTimer);
                }
                return true;
            };
            var a = $('#_prdD').height()-$('#dialogbox').height()-20*getHeightK();
            scrollUp('_prdD', a, 10000);
        }
        if(TMDb.media_type_id == media_type+'/'+id){ show(); return;}
        TMDb.media_type_id = media_type+'/'+id;
        $.ajax({
            url: TMDb.api_url+TMDb.media_type_id, data: {api_key:TMDb.api_key, language:api_lang, append_to_response:'credits'}, dataType: 'json', timeout: 30000, cache: false,
            success: function(data){ TMDb.data = data; },
            error: function(jqXHR){ $('#dialogbox').html('<br>Get TMDb error!<br><br>'); console.log( 'getTMDB jqXHR:'+JSON.stringify(jqXHR)); },
            complete: function(){ show(); },
        });
    },
    results:[],
    sel:-1,
    fun: 'animate',
    hk:1,
    setSel: function(i){
        if(TMDb.sel==i) return;
        $('#tmdb'+TMDb.sel)[TMDb.fun]({width: 150*TMDb.hk+'px'}, 200);
        TMDb.sel = i;
        $('#_sel').text(TMDb.sel+1);
        var i = TMDb.results[TMDb.sel],
            t = i.title||i.name,
            y = i.release_date?' ('+(i.release_date||'').split('-')[0]+')':'',
            o = i.overview?'<div style="font-size:smaller;max-height:3.3em;">'+i.overview+'</div>':'';
        $('#_desc').html('<span style="color:'+curColor+';">'+t+y+'</span>'+o);
        $('#tmdb'+TMDb.sel)[TMDb.fun]({width: 200*TMDb.hk+'px'}, 200);
        $('#tmdb')[TMDb.fun]({'left': -Math.min(Math.max(0,(TMDb.results.length*150+50)*TMDb.hk-$('#tmdb').width()), Math.max(0, ((TMDb.sel-Math.floor($('#tmdb').width()/150/TMDb.hk)+2)*150)*TMDb.hk))+'px'}, 200);
    },
    setSelect: function(i){
        event.stopPropagation();
        if(TMDb.sel == i) _doKey(keys.ENTER);
        else TMDb.setSel(i);
    },
    select: function(){
        TMDb.hk = getHeightK();
        TMDb.fun = sInfoSlide?'animate':'css';
        var s = '<img height="'+20*TMDb.hk+'" src="'+host+'/stbPlayer/blue_short.png" style="float: right; margin: '+10*TMDb.hk+'px;">';
        s+= '<span id="_sel">1</span>/'+TMDb.results.length+'<div id="_tmdb" style="clear:both;overflow:hidden;"><div id="tmdb" style="white-space:nowrap;position:relative;">';
        TMDb.results.forEach(function(val, ind){
            s += '<div id="tmdb'+ind+'" style="display: inline-block; height:'+300*TMDb.hk+'px; width:'+150*TMDb.hk+'px; background-position: center; background-size: contain; background-repeat: no-repeat; background-image: url('+(val.poster_path?'http://image.tmdb.org/t/p/w500/'+val.poster_path:host+'/stbPlayer/no_image.png')+');" onclick="TMDb.setSelect('+ind+');"></div>';
        });
        $('#dialogbox').html(s+'</div><div id="_desc"></div></div>').show();
        $('#_desc').width($('#_tmdb').width());
        if(TMDb.sel==-1) TMDb.setSel(0);
        else {var i = TMDb.sel; TMDb.sel = -1; TMDb.setSel(i);}
        dialogBoxKeyHandler = function(code){
            switch (code) {
                case keys.UP: TMDb.setSel(0); break;
                case keys.DOWN: TMDb.setSel(TMDb.results.length-1); break;
                case keys.LEFT: if(TMDb.sel) TMDb.setSel(TMDb.sel-1); break;
                case keys.RIGHT: if(TMDb.sel<TMDb.results.length-1) TMDb.setSel(TMDb.sel+1); break;
                case keys.N2:
                case keys.INFO:
                case keys.ENTER: TMDb.get(TMDb.results[TMDb.sel].media_type, TMDb.results[TMDb.sel].id); break;
                case keys.EXIT:
                case keys.RETURN: $('#dialogbox').hide(); break;
            }
            return true;
        }
    },
    query: '',
    search: function(nam, itr){
        var api_lang = TMDb.la[stbGetItem("ottplaylang")]||'en';
        var p = '<img height="'+20*getHeightK()+'" src="'+host+'/stbPlayer/blue_short.png" alt="TMDb" style="float: right; border-width: 0px; border-style: solid;" onerror="this.width=0;this.height=0;">'
        itr = itr||0;
        // console.log(nam, nam.replace(/&quot;|&amp;|&lt;|&gt;|\s[\(\[]\d{1,2}\+[\)\]]\s?|\s?.\/.\s/g, ''));
        // nam = nam.replace(/&quot;|&amp;|&lt;|&gt;|\s[\(\[]\d{1,2}\+[\)\]]\s?|\s?.\/.\s/g, '');  // remove &quot; х/ф м/ф (13+) [13+]
        nam = nam.replace(/"|\u00AB|\u00BB|&quot;|&amp;|&lt;|&gt;|&laquo;|&raquo;|\s[\(\[].*[\)\]]\s?|\s?\S\/\S\s/g, '');  // remove " &quot; х/ф м/ф (....)[...]
        // nam = nam.replace(/&.*;|\s[\(\[].*[\)\]]\s?|\s?\S\/\S\s/g, '');  // remove &..; х/ф м/ф (....)[...]
        var name = nam, an = name.split(' ');
        // console.log('111', itr, nam, name);
        dialogBoxKeyHandler = function(){$('#dialogbox').hide();};
        if(!itr){
            if(nam != TMDb.query) TMDb.query = nam;
            else switch (TMDb.results.length) {
                case 0: $('#dialogbox').html(p+'<br>'+_('Not found')+'!<br>'); return;
                case 1: TMDb.get(TMDb.results[0].media_type, TMDb.results[0].id); return;
                default: TMDb.select(); return;
            }
        }
        switch (itr) {
            case 0: break;
            case 1: an.pop(); name = an.join(' '); break;
            case 2: an.shift(); name = an.join(' '); break;
            case 3: an.shift(); an.pop(); name = an.join(' '); break;
            default: an.pop(); name = an.join(' '); break;
        }
        // console.log('111', itr, nam, name);
        if(!name){ $('#dialogbox').html(p+'<br>'+_('Not found')+'!<br>'); return; }
        $('#dialogbox').html(p+'<br>'+_('Search')+':<br>'+name+'<br><br>').show();
        $.ajax({
            url: TMDb.api_url+'search/multi',
            data: {api_key:TMDb.api_key, language:api_lang, query: name, page:1, include_adult:true},
            dataType: 'json', timeout: 30000, cache: false,
            success: function(data){
                // console.log(data);
                data.results = data.results.filter(function(val){ return val.media_type=='movie'||val.media_type=='tv'; });
                TMDb.results = data.results;
                if(data.results.length>1){
                    TMDb.results = data.results.filter(function(val){ return (val.title||val.name)==TMDb.query; });
                    if(!TMDb.results.length) TMDb.results = data.results;
                }
                TMDb.sel = -1;
                switch (TMDb.results.length) {
                    case 0: TMDb.search(name,1); return;
                    case 1: TMDb.get(TMDb.results[0].media_type, TMDb.results[0].id); return;
                    default: TMDb.select(); return;
                }
            },
            error: function(jqXHR){ $('#dialogbox').html(p+'<br>Search TMDb error!<br><br>'); console.log( 'searchTMDB jqXHR:'+JSON.stringify(jqXHR)); },
            // complete: function(){ callback(ch_id, d); },
        });
    }
}

function infoProgramm(n){
    n = n||'';
    $('#listPopUp').hide();
    saveCPD();
    listCaption.innerHTML = n;
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')+(n?btnDiv(keys.N2, strInfo, 'TMDb', '2', sArrowFun==2 ? strRIGHT : sRewFun==1 ? strFF : sPNFun==1 ? strNEXT : ''):'');
    aboutKeyHandler = function(code){
        if(n) switch(code){
            case keys.RIGHT: if(sArrowFun!=2) break;
            case keys.N2:
            case keys.INFO: TMDb.search(n); return true;
            case keys.FF: if(sRewFun!=1) break; TMDb.search(n); return true;
            case keys.NEXT: if(sPNFun!=1) break; TMDb.search(n); return true;
        }
        restoreCPD(); $('#listAbout').hide().text(''); $('#_prd').css("margin-top", 0); clearTimeout(detailTimer); return true;
    };
    $('#listAbout').html('<div style="font-size:larger;">' + ld.replace(/\|/g,"<br/>") + '</div>').show();
    $('#_prd').css("margin-top", 0);
    $('#_nextpr').text('');
    var a = $('#listAbout').height() - $('#_name').height();// - $('#_nextpr').height()||0;
    $('#_descr').height(a);
    a = $('#_prd').height() + 10 - a;
    scrollUp('_prd', a, 10000);
}
var sSortAbc = 0;
function sortChannels(){
    catsArray.forEach(function(val, i){
        if((!sFavorites && i) || (sFavorites && !i)) return;
        // console.log(val, cats[val]);
        cats[val].sort(function(a, b){
            // console.log(a,b);
            if(sSortAbc){
                try{
                    var an = chanels[a].channel_name, bn = chanels[b].channel_name;
                    return an < bn ? -1 : an > bn ? 1 : 0;
                }catch(e){return 0;}
            } else {
                return cList.indexOf(a)-cList.indexOf(b);
            }
        });
    });
}
function searchChannel(){
    $('#listPopUp').hide();
    editCaption = _('String for search');
    var chSearch = stbGetItem('chSearch') || '';
    editvar = chSearch;
    setEdit = function(){
        if(!editvar.length) return;
        chSearch = editvar;
        stbSetItem('chSearch', chSearch);
        setTimeout(function(){
            selIndex = 0;
            var se = chSearch.toLowerCase();
            listArray = cats[catsArray[listCatIndex]].filter(function(val){
                return chanels[val].channel_name.toLowerCase().indexOf(se)!==-1;
            });
            listKeyHandler = function(code){
                function selectProg(){
                    var si = cats[catsArray[listCatIndex]].findIndex(function(el){ return el == listArray[selIndex]; });
                    if(sPreview==2){
                        if(previewChan && previewChan.ch_id == listArray[selIndex]){
                            setCurrent(listCatIndex, si);
                        } else {
                            previewChId(listArray[selIndex]);
                            return;
                        }
                    }
                    previewChan = null;
                    closeList();

                    if(((catIndex == listCatIndex) && (primaryIndex == si) && (!playType)) || (sPreview==1)){
                        setCurrent(listCatIndex, si);
                        var ch_id = curList[primaryIndex];
                        updateChanelInfo(ch_id);
                        if(sInfoSwitch) showChanelInfo(1);
                        playType = 0;
                        return;
                    }

                    setTimeout(function() {
                        playChannel(listCatIndex, si);
                    }, 10);
                }
            switch(code){
                    case keys.EXIT: closeList(); return true;
                    case keys.LEFT: if(sArrowFun!=2) return false;
                    case keys.RETURN: channelsList(listCatIndex, listChannel); return true;
                    case keys.RIGHT: if(sArrowFun!=2) return false;
                    case keys.N2:
            		case keys.INFO: infoProgramm(chanels[listArray[selIndex]].name); return true;
                    case keys.RW: if(sRewFun!=1) return false; channelsList(listCatIndex, listChannel); return true;
                    case keys.PREV: if(sPNFun!=1) return false; channelsList(listCatIndex, listChannel); return true;
                    case keys.FF: if(sRewFun!=1) return false; infoProgramm(chanels[listArray[selIndex]].name); return true;
                    case keys.NEXT: if(sPNFun!=1) return false; infoProgramm(chanels[listArray[selIndex]].name); return true;
                    case keys.N0:
            		case keys.YELLOW:
            		case keys.TOOLS: searchChannel(); return true;
            		case keys.ENTER: selectProg(); return true;
                    case keys.GREEN:
                    case keys.PLAY:
                    case keys.PAUSE:
                    case keys.N3: addChannel2bucket(); return true;
                }
                return false;
            };
            listCaption.innerHTML = _('Channel list. Category: ') + catsArray[listCatIndex] + '. '+_('Search')+':"'+chSearch+'" ('+listArray.length+')';
            listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close', sArrowFun==2 ? strLEFT : sRewFun==1 ? strRW : sPNFun==1 ? strPREV : '') +
                btnDiv(keys.N2, strInfo, 'Description', '2', sArrowFun==2 ? strRIGHT : sRewFun==1 ? strFF : sPNFun==1 ? strNEXT : '')+
                btnDiv(keys.YELLOW, '', 'Search', strTools, '0')+
                btnDiv(keys.GREEN, '', 'Add channel to '+(sFavorites?'favorites':'category'), strPlayPause, '3');
            $('#listPopUp').hide();
            showPage();
        });
    }
    showEditKey();
}

function channelsKeyHandler(code){
    function selectProg(){
        if(sPreview==2){
            if(previewChan && previewChan.ch_id == listArray[selIndex]){
                setCurrent(listCatIndex, selIndex);
            } else {
                previewChId(listArray[selIndex]);
                // previewChannel(listCatIndex, selIndex);
                return;
            }
        }
        previewChan = null;
        closeList();

        if(((catIndex == listCatIndex) && (primaryIndex == selIndex) && (!playType)) || (sPreview==1)){
            setCurrent(listCatIndex, selIndex);
            var ch_id = curList[primaryIndex];
            updateChanelInfo(ch_id);
            if(sInfoSwitch) showChanelInfo(1);
            playType = 0;
            return;
        }

        setTimeout(function() {
            playChannel(listCatIndex, selIndex);
        }, 10);
    }
    function selectPip(){
        closeList();

        if((listCatIndex == pipCatIndex) && (pipIndex == selIndex))
            return;

        pipIndex = selIndex;
        pipCatIndex = listCatIndex;
        stbPlayPip(getChannelUrl(listArray[selIndex]));
    }
    function setSort(){
        if((!sFavorites && listCatIndex) || (sFavorites && !listCatIndex)) return;
        $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40"> '+_('Sort channels')+': '+_(sSortAbc?'"As Is"':'By alphabet')).show();
        sSortAbc = sSortAbc==1?0:1;
        providerSetItem('sSortAbc',sSortAbc);
        var cid = listArray[selIndex], ch_id = curList[primaryIndex];
        sortChannels();
        selIndex = listArray.indexOf(cid);
        primaryIndex = curList.indexOf(ch_id);
        $('#channel_number').html((primaryIndex+1));
        setPopupChannels();
        $('#dialogbox').hide();
        showPage();
    }
    function moveChannel(mov){
        if((!sFavorites && !listCatIndex) || (sFavorites && listCatIndex)) return;
        if(selIndex+mov < 0){
            listArray.push(listArray[selIndex]);
            listArray.shift();
        } else if(selIndex+mov > listArray.length-1){
            listArray.unshift(listArray[selIndex]);
            listArray.pop();
        } else {
            var b = listArray[selIndex];
            listArray[selIndex] = listArray[selIndex + mov];
            listArray[selIndex + mov] = b;
        }
        showPage();
        changeSelect(mov);
        saveChannelsCats();
    }
    function delChannel(){
        if((!sFavorites && !listCatIndex) || (sFavorites && listCatIndex)) return;
        listArray.splice(selIndex, 1);
        if(selIndex == listArray.length) changeSelect(-1);
        showPage();
        saveChannelsCats();
    }
    function joyMenu(){
        var td = '<td align="center" valign="top" width="30%">';
        var ed = (!sFavorites && listCatIndex) || (sFavorites && !listCatIndex);
        $('#dialogbox').html('<table style="font-size:inherit" width="100%">'+
            '<tr><td></td>' + td + btnDiv(keys.UP, strUP, (ed?'<br>Up<br>':'<br><br>')) + '</td><td></td></tr>' +
            '<tr>' + td +
                btnDiv(keys.LEFT, strLEFT, (ed?'<br>Delete':('<br>'+_('Sort channels')+':<br>'+_(sSortAbc?'"As Is"':'By alphabet')))) + '</td>' + td +
                btnDiv(keys.ENTER, strENTER, ((!sFavorites || listCatIndex)?'<br>Add<br>to '+(sFavorites?'favorites':'category'):'<br><br>')) + '</td>' + td +
                btnDiv(keys.RIGHT, strRIGHT, (sPSchannels && parentPIN!='*' ? '<br>Parental<br>Control' : '<br>')) +
            '</td></tr>' +
            '<tr><td></td>' + td + btnDiv(keys.DOWN, strDOWN, (ed?'<br>Down':'<br>')) + '</td><td></td></tr>' +
            '</table>'
            + btnDiv(keys.RETURN, strRETURN, 'Close')
            + btnDiv(keys.YELLOW, '', 'Search', strTools)
        ).show();
        dialogBoxKeyHandler = function(code){
            switch (code) {
                case keys.ENTER: $('#dialogbox').hide(); addChannel2bucket(); return;
                case keys.UP: moveChannel(-1); return;
                case keys.DOWN: moveChannel(1); return;
                case keys.LEFT: if(ed) delChannel();
                                else { $('#dialogbox').hide(); setSort(); }
                                return;
                case keys.RIGHT: parentChannel(); return;
                case keys.RETURN: $('#dialogbox').hide(); return;
                case keys.YELLOW:
                case keys.TOOLS: $('#dialogbox').hide(); listChannel = selIndex; searchChannel(); return;
            }
        }
    }
    switch(code){
		case keys.RETURN: closeList(); return true;
		case keys.ENTER: selectProg(); return true;
        case keys.N5:
        case keys.STOP:
		case keys.PIP: if(typeof(stbPlayPip) === "function") selectPip(); return true;
		case keys.RIGHT:
            if(!sArrowFun) return false;
            if(sArrowFun==3){ listCatIndex = listCatIndex<catsArray.length-1? listCatIndex+1:0; channelsList(listCatIndex, (catIndex != listCatIndex) ? 0 : primaryIndex); return true;}
        case keys.EPG:
		case keys.RED: epgList(listCatIndex, selIndex, true); return true;
		case keys.LEFT:
            if(!sArrowFun) return false;
            if(sArrowFun==3){ listCatIndex = listCatIndex>0? listCatIndex-1:catsArray.length-1; channelsList(listCatIndex, (catIndex != listCatIndex) ? 0 : primaryIndex); return true;}
        case keys.PLAY:
        case keys.PAUSE:
        case keys.BLUE: bucketsList(listCatIndex); return true;
        case keys.RW:
        case keys.PREV:
            switch(code==keys.RW?sRewFun:sPNFun){
                case 1: bucketsList(listCatIndex); return true;
                case 2: listCatIndex = listCatIndex>0? listCatIndex-1:catsArray.length-1; channelsList(listCatIndex, (catIndex != listCatIndex) ? 0 : primaryIndex); return true;
            }
            return false;
        case keys.FF:
        case keys.NEXT:
            switch(code==keys.FF?sRewFun:sPNFun){
                case 1: epgList(listCatIndex, selIndex, true); return true;
                case 2: listCatIndex = listCatIndex<catsArray.length-1? listCatIndex+1:0; channelsList(listCatIndex, (catIndex != listCatIndex) ? 0 : primaryIndex); return true;
            }
            return false;
        case keys.N0:
		case keys.YELLOW:
		case keys.TOOLS:
            if(sNoNumbersKeys) joyMenu();
            else $('#listPopUp').toggle();
            return true;
		case keys.N2:
		case keys.INFO: infoProgramm(chanels[listArray[selIndex]].name||''); return true;
    }
    if($('#listPopUp').is(":visible"))
    switch(code){
		case keys.N1: moveChannel(-1); return true;
		case keys.N7: moveChannel(1); return true;
		case keys.N8: delChannel(); return true;
		case keys.N3: addChannel2bucket(); return true;
		case keys.N4: parentChannel(); return true;
        case keys.N9: setSort(); return true;
        case keys.N6: listChannel = selIndex; searchChannel(); return true;
    }
    return false;
}
var keyStrings = {}
function _(key){
    if(sGrapI) switch (key) {
        case 'off':
        case 'no': return '<span class="fontello">&#xf204;</span>';
        case 'yes': return '<span class="fontello">&#xf205;</span>'; // style="color:green;"
    }
    var r = keyStrings[key] || key;
    for (i = 1; i < arguments.length; i++)
        r = r.replace(new RegExp('%'+i, 'g'), arguments[i]);
    return r;
}
function btnDiv(bCode, bName, bPrompt, bN2, bN3){
    if(!bPrompt || !bCode) return '';
    bPrompt = _(bPrompt);
    var bc = 'btn';
    switch (bCode) {
      case keys.RED: bc += ' red'; if(!bName) bName = '&nbsp;'; break;
      case keys.GREEN: bc += ' green'; if(!bName) bName = '&nbsp;'; break;
      case keys.YELLOW: bc += ' yellow'; if(!bName) bName = '&nbsp;'; break;
      case keys.BLUE: bc += ' blue'; if(!bName) bName = '&nbsp;'; break;
    }
    if(sNoNumbersKeys){
        // if('0123456789'.indexOf(bName) !== -1) bName = '';
        if('0123456789'.indexOf(bN2) !== -1) bN2 = '';
        if('0123456789'.indexOf(bN3) !== -1) bN3 = '';
    }
    var b = bName ? '<div class="'+bc+'">'+bName+'</div>&nbsp;' : '';
    if(sNoColorKeys && [keys.RED, keys.GREEN, keys.YELLOW, keys.BLUE].indexOf(bCode) !== -1) b = '';
    // if((typeof bN2 !== "undefined") && bN2)
    //     bN2.split('|').forEach(function(item){ b += '<div class="btn">'+item+'</div>&nbsp;' }
    if((typeof bN2 !== "undefined") && bN2) b += '<div class="btn">'+bN2+'</div>&nbsp;';
    if((typeof bN3 !== "undefined") && bN3) b += '<div class="btn">'+bN3+'</div>&nbsp;';
    if(!b) bPrompt = '<div class="btn">'+bPrompt+'</div>';
    return '<span onclick="_doKey('+bCode+');">'+b+bPrompt+'</span>&nbsp;&nbsp;';
}
function setPopupChannels(){
    if((!sFavorites && listCatIndex) || (sFavorites && !listCatIndex))
        $('#listPopUp').html(btnDiv(keys.N1, '1', 'Move channel up')+'<br/>'+
                        btnDiv(keys.N7, '7', 'Move channel down')+'<br/>'+
                        btnDiv(keys.N8, '8', 'Delete channel')+
                        (sFavorites?'':'<br/>'+btnDiv(keys.N3, '3', 'Add channel to category')));
    else
        $('#listPopUp').html(btnDiv(keys.N3, '3', 'Add channel to '+(sFavorites?'favorites':'category'))+
                        '<br/>'+btnDiv(keys.N9, '9', _('Sort channels')+': '+_(sSortAbc?'"As Is"':'By alphabet')));
    if(sPSchannels && parentPIN!='*')
        $('#listPopUp').append('<br/>'+btnDiv(keys.N4, '4', 'Channel parental control'));
    $('#listPopUp').append('<br/>'+btnDiv(keys.N6, '6', 'Search'));
}
var channelsList = _channelsList;
function _channelsList(cat, index){
    selIndex = index;
    listCatIndex = cat;
    listArray = cats[catsArray[listCatIndex]];
    var l = getWidthK(),
        lh = (window.innerHeight-90*getHeightK())/pageSize;
    var nn = 0;
    if(sShowNum) try{
        var $t = $('#testFont');
        $t.text('9');
        // console.log($('#testFont').width(), listArray.length.toString().length);
        nn = $t.width()*listArray.length.toString().length+6*l;
        $t.text('');
    } catch(e){}
    var aw = sShowArchive ? 3*l : 0;
    var iw = [0, lh-2, lh*1.5][sShowPikon],
        im = iw||!aw ? 6*l : 0;
    var pw = sShowProgress ? 40*l : 0;
    var ph = Math.floor(lh/3.5);
    var pm = sShowProgress ? Math.floor((lh-ph)/2) : 0;

    getListItem = function(ch_id, i){
        if(!chanels[ch_id]) return '&nbsp;&nbsp;'+_('Channel is not available!!!')+' id=' + ch_id;
        var nw = itemWith - nn - iw - im - pw - 2*pm - aw*3;
        var pname = getCurProgData(ch_id, updateChanelList) ? chanels[ch_id].name : '';
        var proc = (pname) ? ((Date.now()/1000 - chanels[ch_id].time) / (chanels[ch_id].time_to-chanels[ch_id].time) * 100) : 0;
        var c = (!sPSchannels || (parentPIN=='*') || (parentalArray.indexOf(ch_id) == -1)) ? '' : 'color:#a00;';
        return	(nn ? '<div style="float:left;width:'+nn+'px;text-align:right;'+c+'">' + (i+1) + '</div>' : '') +
        // return	(nn ? '<div style="float:left; width:'+nn+'px; text-align:right;'+c+'">' + (cList.indexOf(ch_id)+1) + '</div>' : '') +
                (aw ? '<div style="float:left;width:'+aw+'px;'+(chanels[ch_id].rec ? 'background-color:lime;': '')+'margin:'+aw+'px;height:'+(lh-aw*2)+'px"></div>' : '') +
                '<div class="img" style="background-image:url(\'' + (iw ? getChannelPicon(ch_id) : '') + '\'); width:'+iw+'px;margin-left:'+im+'px;"></div>' +
                // (iw ? '<div class="img" style="background-image:url(\'' + getChannelPicon(ch_id) + '\'); width:'+iw+'px;margin-left:'+im+'px;"></div>' : '') +
                '<div style="float:left; width:'+nw+'px; color:'+bodyColor+'; overflow:hidden;">&nbsp;' + (sShowName ? chanels[ch_id].channel_name + '&nbsp;' : '') +
    			(sShowProgram?'<span id="pn'+ch_id+'" style="color:'+curColor+';">'+pname+'</span></div>':'</div>') +
    			// '<div style="float:left; width:'+nw+'px; color:'+bodyColor+'; overflow:hidden;font-size:60%;line-height:'+lh/2+'px;">&nbsp;' + (sShowName ? chanels[ch_id].channel_name + '&nbsp;' : '') +
    			// '<br>&nbsp;<span id="pn'+ch_id+'" style="color:'+curColor+';font-size:80%;">'+pname+'</span></div>' +
    			(pw ? '<div class="progress_div" style="width:'+pw+'px;margin:'+pm+'px;"><div id="pr'+ch_id+'" style="width:'+proc+'%;height:'+ph+'px;background-color:'+curColor+';font-size:1px;"></div></div>' : '');
    };
    listDetail.innerHTML = '';
    detailListAction = detailProg;
    listKeyHandler = channelsKeyHandler;
    listCaption.innerHTML = _('Channel list. Category: ') + (catsArray[listCatIndex] || '');
    listPodval.innerHTML = btnDiv(keys.RED, '', 'EPG', strEPG, sArrowFun==2 ? strRIGHT : sRewFun==1 ? strFF : sPNFun==1 ? strNEXT : '')+
                            btnDiv(keys.BLUE, '', 'Category', strPlayPause, sArrowFun==2 ? strLEFT : sRewFun==1 ? strRW : sPNFun==1 ? strPREV : '')+
                            btnDiv(keys.YELLOW, '', 'Actions', strTools, '0')+
                            btnDiv(keys.N2, strInfo, 'Description', '2')+
                            (typeof(stbPlayPip) === "function" ? btnDiv(keys.PIP, strPip, 'Open in PiP', strSTOP, '5') : '');
    setPopupChannels();
    $('#listPopUp').hide();

    previewChan = (sPreview && cat==catIndex && index==primaryIndex) ? {c:cat, i:index, ch_id:listArray[selIndex]} : null;
    showPage();
}

function bucketsKeyHandler(code){
    function moveBucket(mov){
        if(!selIndex) return;
        if((selIndex+mov < 1) || (selIndex+mov > listArray.length-1)) return;
        var b = listArray[selIndex];
        listArray[selIndex] = listArray[selIndex + mov];
        listArray[selIndex + mov] = b;
        showPage();
        changeSelect(mov);
        saveChannelsCats();
    }
    function delBucket(){
        if(!selIndex) return;
        delete cats[listArray[selIndex]];
        listArray.splice(selIndex, 1);
        if(selIndex == listArray.length) changeSelect(-1);
        showPage();
        saveChannelsCats();
    }
    function renameBucket(){
        if(!selIndex) return;
        $('#listPopUp').hide();
        editCaption = _('Edit category name');
        editvar = listArray[selIndex];
        setEdit = function(){
            if(!sNoNumbersKeys) $('#listPopUp').show();
            if(!editvar) return;
            if(listArray.indexOf(editvar) != -1){
                showShift(_('Category %1 already exists!',editvar));
                return;
            }
            var old = listArray[selIndex];
            listArray[selIndex] = editvar;
            cats[editvar] = cats[old].slice(0);
            delete cats[old];
            showPage();
            saveChannelsCats();
        };
        showEditKey();
    }
    function addBucket(){
        $('#listPopUp').hide();
        editCaption = _('Enter name for new category');
        editvar = '';
        setEdit = function(){
            if(!sNoNumbersKeys) $('#listPopUp').show();
            if(!editvar) return;
            if(listArray.indexOf(editvar) != -1){
                showShift(_('Category %1 already exists!',editvar));
                return;
            }
            // listArray.splice(selIndex+1, 0, editvar);
            listArray.push(editvar);
            cats[editvar] = [];
            showPage();
            saveChannelsCats();
        };
        showEditKey();
    }
    function copyBucket(){
        $('#listPopUp').hide();
        editCaption = _('Enter name for new category');
        editvar = listArray[selIndex];
        setEdit = function(){
            if(!sNoNumbersKeys) $('#listPopUp').show();
            if(!editvar) return;
            if(listArray.indexOf(editvar) != -1){
                showShift(_('Category %1 already exists!',editvar));
                return;
            }
            // listArray.splice(selIndex+1, 0, editvar);
            listArray.push(editvar);
            cats[editvar] = cats[listArray[selIndex]].slice(0);
            showPage();
            saveChannelsCats();
        };
        showEditKey();
    }
    function joyMenu(){
        var td = '<td align="center" valign="top" width="30%">';
        $('#dialogbox').html('<table style="font-size:inherit" width="100%">'+
            '<tr><td></td>' + td + btnDiv(keys.UP, strUP, '<br>Up<br>') + '</td><td></td></tr>' +
            '<tr>' + td +
                btnDiv(keys.LEFT, strLEFT, '<br>Delete') + '</td>' + td +
                btnDiv(keys.ENTER, strENTER, '<br>More...<br>') + '</td>' + td +
                btnDiv(keys.RIGHT, strRIGHT, '<br>Rename') +
            '</td></tr>' +
            '<tr><td></td>' + td + btnDiv(keys.DOWN, strDOWN, '<br>Down') + '</td><td></td></tr>' +
            '</table>'
            + btnDiv(keys.RETURN, strRETURN, 'Close')
        ).show();
        dialogBoxKeyHandler = function(code){
            // $('#dialogbox').hide();
            switch (code) {
                case keys.ENTER: joyMenu2(); return;
                case keys.UP: moveBucket(-1); return;
                case keys.DOWN: moveBucket(1); return;
                case keys.LEFT: delBucket(); return;
                case keys.RIGHT: $('#dialogbox').hide(); renameBucket(); return;
                case keys.RETURN: $('#dialogbox').hide(); return;
            }
        }
    }
    function joyMenu2(){
        var td = '<td align="center" valign="top" width="30%">';
        $('#dialogbox').html('<table style="font-size:inherit" width="100%">'+
            '<tr><td></td>' + td + btnDiv(keys.UP, strUP, '<br><br>') + '</td><td></td></tr>' +
            '<tr>' + td + btnDiv(keys.LEFT, strLEFT, '<br>Copy<br>category') + '</td>' +
                td + btnDiv(keys.ENTER, strENTER, '<br>Back<br>') + '</td>' +
                td + btnDiv(keys.RIGHT, strRIGHT, '<br>Create<br>category') + '</td></tr>' +
            '<tr><td></td>' + td + btnDiv(keys.DOWN, strDOWN, '<br>') + '</td><td></td></tr>' +
            '</table>'
            + btnDiv(keys.RETURN, strRETURN, 'Close')
        ).show();
        dialogBoxKeyHandler = function(code){
            $('#dialogbox').hide();
            switch (code) {
                case keys.ENTER: joyMenu(); return;
                case keys.UP:
                case keys.DOWN: return;
                case keys.LEFT: copyBucket(); return;
                case keys.RIGHT: addBucket(); return;
                case keys.RETURN: return;
            }
        }
    }

    if($('#listPopUp').is(":visible"))
    switch(code){
		case keys.N1: moveBucket(-1); return true;
		case keys.N7: moveBucket(1); return true;
		case keys.N8: delBucket(); return true;
		case keys.N6: renameBucket(); return true;
		case keys.N3: addBucket(); return true;
		case keys.N9: copyBucket(); return true;
    }
    switch(code){
        case keys.N1:
        case keys.N2:
        case keys.N3:
        case keys.N4:
        case keys.N5:
        case keys.N6:
        case keys.N7:
        case keys.N8:
        case keys.N9: channelsList(code-49, (catIndex != code-49) ? 0 : primaryIndex); return true;
		case keys.RETURN: closeList(); return true;
        case keys.RIGHT: if(sArrowFun!=2) return false;
	    case keys.CH_LIST:
		case keys.ENTER: channelsList(selIndex, (catIndex != selIndex) ? 0 : primaryIndex); return true;
        case keys.LEFT: if(sArrowFun!=2) return false; popupList(popBuckets); return true;
		case keys.RW: if(sRewFun!=1) return false; popupList(popBuckets); return true;
        case keys.PREV: if(sPNFun!=1) return false; popupList(popBuckets); return true;
        case keys.FF: if(sRewFun!=1) return false; channelsList(selIndex, (catIndex != selIndex) ? 0 : primaryIndex); return true;
        case keys.NEXT: if(sPNFun!=1) return false; channelsList(selIndex, (catIndex != selIndex) ? 0 : primaryIndex); return true;
        case keys.N0:
		case keys.YELLOW:
		case keys.TOOLS:
            if(!sFavorites)
                if(sNoNumbersKeys) joyMenu();
                else $('#listPopUp').toggle();
            return true;
        case keys.PLAY:
        case keys.PAUSE:
        case keys.PRECH:
        case keys.RED: catRecordsList(selIndex); return true;
    }
    return false;
}
var bucketsList = _bucketsList;
function _bucketsList(select){
    selIndex = select;
    listArray = catsArray;
    getListItem = function(item, i){ return '&nbsp;&nbsp;' + (sNoNumbersKeys||i>8?'':'<div class="btn">'+(i+1)+'</div>&nbsp;') + item; };
    // getListItem = function(item, i){ return '&nbsp;&nbsp;' + (sNoNumbersKeys||i>8?'':'<div style="float:right;"><div class="btn">'+(i+1)+'</div>&nbsp;&nbsp;</div>') + item; };
    listDetail.innerHTML = '';
    detailListAction = function(){};
    listKeyHandler = bucketsKeyHandler;
    listCaption.innerHTML = _('Category selection');
    listPodval.innerHTML = btnDiv(keys.RED, '', 'Records', strPlayPause, strPRECH)+
        (sFavorites ? '' : btnDiv(keys.YELLOW, '', 'Actions', strTools, '0'))+
        (sArrowFun==2 ? (btnDiv(keys.LEFT, strLEFT, 'Menu')+btnDiv(keys.RIGHT, strRIGHT, 'Channel list')) : '')+
        (sArrowFun!=2&&sRewFun==1 ? (btnDiv(keys.RW, strRW, 'Menu')+btnDiv(keys.FF, strFF, 'Channel list')) : '')+
        (sArrowFun!=2&&sRewFun!=1&&sPNFun==1 ? (btnDiv(keys.PREV, strPREV, 'Menu')+btnDiv(keys.NEXT, strNEXT, 'Channel list')) : '');
    if(!sFavorites)
    $('#listPopUp').html( btnDiv(keys.N1, '1', 'Move category up')+'<br/>'+
                          btnDiv(keys.N7, '7', 'Move category down')+'<br/>'+
                          btnDiv(keys.N3, '3', 'Create category')+'<br/>'+
                          btnDiv(keys.N6, '6', 'Rename category')+'<br/>'+
                          btnDiv(keys.N9, '9', 'Copy category')+'<br/>'+
                          btnDiv(keys.N8, '8', 'Delete category'));
    $('#listPopUp').hide();
    showPage();
}
function detailREC(){
    var pr = listArray[selIndex];
    listDetail.innerHTML = '<div id="_name">'+chanels[pr.ch_id].channel_name+':<br/><div style="color:'+curColor+';">'+pr.name+'</div><div style="font-size:smaller;">'+time2str(pr.time) + ' - ' + time2time(pr.time_to) + ' (' + Math.round((pr.time_to-pr.time)/60) + ' '+_('min')+')</div></div>'
        + '<div id="_descr" style="font-size:smaller;overflow:hidden;"><div id="_prd">'+pr.descr+'</div></div>';
    var a = $('#listDetail').height() - $('#_name').height();
    $('#_descr').height(a);
    a = $('#_prd').height() + 10 - a;
    scrollUp('_prd', a, 5000);
}
function selectREC(){
    var ch_id = listArray[selIndex].ch_id, t = listArray[selIndex].time;
    closeList();
    setCurrent(listCatIndex, cats[catsArray[listCatIndex]].indexOf(ch_id), true);
    getEPGchanelCached(ch_id, function(ch_id, data){
        if((data !== null) && (data.length)){
            var epg = data.filter(function(val){
                return val.time > (Date.now()/1000 - chanels[ch_id].rec*60*60);
            }).sort(function(a, b){ return a.time - b.time; });
        }
        epgArray = epg;
        setCurProg(ch_id, data, null);
        playArchive(t);
    });
}
var _crData = {catIndex:-1, data:[], selIndex:0};
function searchRec(){
    editCaption = _('String for search');
    var medSearch = stbGetItem('medSearch') || '';
    editvar = medSearch;
    setEdit = function(){
        if(!editvar.length) return;
        medSearch = editvar;
        stbSetItem('medSearch', medSearch);
        setTimeout(function(){
            selIndex = 0;
            var se = medSearch.toLowerCase()
            listArray = _crData.data.filter(function(val){
                return val.name.toLowerCase().indexOf(se)!==-1 || val.descr.toLowerCase().indexOf(se)!==-1;
            });
            getListItem = function(item, i){ return '&nbsp;&nbsp;' + item.name; };
            detailListAction = detailREC;
            listKeyHandler = function(code){
                switch(code){
                    case keys.EXIT: closeList(); return true;
                    case keys.LEFT: if(sArrowFun!=2) return false;
                    case keys.RETURN: catRecordsList(listCatIndex); return true;
                    case keys.RIGHT: if(sArrowFun!=2) return false;
                    case keys.N2:
            		case keys.INFO: infoProgramm(listArray[selIndex].name); return true;
                    case keys.RW: if(sRewFun!=1) return false; catRecordsList(listCatIndex); return true;
                    case keys.PREV: if(sPNFun!=1) return false; catRecordsList(listCatIndex); return true;
                    case keys.FF: if(sRewFun!=1) return false; infoProgramm(listArray[selIndex].name); return true;
                    case keys.NEXT: if(sPNFun!=1) return false; infoProgramm(listArray[selIndex].name); return true;
                    case keys.N0:
            		case keys.YELLOW:
            		case keys.TOOLS: searchRec(); return true;
            		case keys.ENTER:
                        var c = listArray[selIndex].ch_id, t = listArray[selIndex].time;
                        _crData.selIndex = _crData.data.findIndex(function(el){ return (el.ch_id == c && el.time == t); });
                        selectREC();
                        return true;
                }
                return false;
            };
            listCaption.innerHTML = _('Archive. Category: ') + catsArray[listCatIndex] + '. '+_('Search')+':"'+medSearch+'" ('+listArray.length+')';
            listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Records', sArrowFun==2 ? strLEFT : sRewFun==1 ? strRW : sPNFun==1 ? strPREV : '') +
                btnDiv(keys.N2, strInfo, 'Description', '2', sArrowFun==2 ? strRIGHT : sRewFun==1 ? strFF : sPNFun==1 ? strNEXT : '')+
                btnDiv(keys.YELLOW, '', 'Search', strTools, '0');
            $('#listPopUp').hide();
            showPage();
        });
    }
    showEditKey();
}

function catRecordsList(cat){
    function createEpgList(){
        selIndex = _crData.selIndex||0;
        listArray = _crData.data;
        getListItem = function(item, i){ return '&nbsp;&nbsp;' + item.name; };
        detailListAction = detailREC;
        listKeyHandler = function(code){
            switch(code){
                case keys.EXIT: closeList(); return true;
                case keys.LEFT: if(sArrowFun!=2) return false;
                case keys.RETURN: bucketsList(listCatIndex); return true;
                case keys.RIGHT: if(sArrowFun!=2) return false;
                case keys.N2:
        		case keys.INFO: infoProgramm(listArray[selIndex].name); return true;
                case keys.RW: if(sRewFun!=1) return false; bucketsList(listCatIndex); return true;
                case keys.PREV: if(sPNFun!=1) return false; bucketsList(listCatIndex); return true;
                case keys.FF: if(sRewFun!=1) return false; infoProgramm(listArray[selIndex].name); return true;
                case keys.NEXT: if(sPNFun!=1) return false; infoProgramm(listArray[selIndex].name); return true;
                case keys.N0:
        		case keys.YELLOW:
        		case keys.TOOLS: _crData.selIndex = selIndex; searchRec(); return true;
        		case keys.ENTER: _crData.selIndex = selIndex; selectREC(); return true;
            }
            return false;
        };
        listCaption.innerHTML = _('Archive. Category: ') + catsArray[listCatIndex] + ' ('+listArray.length+')';
        listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Category', sArrowFun==2 ? strLEFT : sRewFun==1 ? strRW : sPNFun==1 ? strPREV : '') +
            btnDiv(keys.N2, strInfo, 'Description', '2', sArrowFun==2 ? strRIGHT : sRewFun==1 ? strFF : sPNFun==1 ? strNEXT : '')+
            btnDiv(keys.YELLOW, '', 'Search', strTools, '0');
        $('#listPopUp').hide();
        showPage();
        $('#dialogbox').hide();
    }
    function getCategoryEpg(){
        if(i<curC.length){
            if(_abort){ $('#dialogbox').hide(); _crData = {catIndex:-1, data:[], selIndex:0}; return;}
            $('#chan_no').text(i+1);
            $('#chan_name').text(chanels[curC[i]].channel_name);
            getEPGchanelCached(curC[i], function(ch_id, d){
                // console.log(i, ch_id, d);
                if((d !== null) && (d.length)){
                    d.sort(function(a, b){ return b.time - a.time; });
                    var arcs_name = [];
                    var r = d.filter(function(val){
                        if(val.time < (Date.now()/1000 - chanels[ch_id].rec*60*60)) return false;
                        if(val.time_to*1000 > Date.now()) return false;
                        if(arcs_name.indexOf(val.name) != -1) return false;
                        else {
                            arcs_name.push(val.name);
                            return true;
                        }
                    });
                    r.forEach(function(val){ val.ch_id = ch_id; });
                    _crData.data = _crData.data.concat(r);
                }
                i++;
                getCategoryEpg();
            })
        }else{
            _crData.data.sort(function(a, b){ return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
            createEpgList();
        }
    }

    listCatIndex = cat;
    if(_crData.catIndex==listCatIndex&&_crData.data.length){
        createEpgList();
        return;
    }
    var curC = cats[catsArray[listCatIndex]].filter(function(ch_id){ return chanels[ch_id].rec }),
        i=0, _abort = false;
    _crData = {catIndex:listCatIndex, data:[], selIndex:0};
    // console.log(curC);
    $('#dialogbox').html(
        '<center><img src="'+host+'/stbPlayer/buffering.gif" height="40"><br/>'+_('Download! Wait ...')+
        '<br/><br/><span id="chan_no">1</span>/'+curC.length+'<br/><span id="chan_name"></span>'
    ).show();
    dialogBoxKeyHandler = function(code){
        if(code == keys.RETURN || code == keys.EXIT) _abort = true;
    }
    setTimeout(getCategoryEpg);
}

function updateMediaInfo(){
    $('#progress').css('width', (stbGetPosTime() / stbGetLen() * 100) + '%');
    $('#begin_time').text( Math.round(stbGetPosTime()/60) );
    $('#end_time').text( '+' + Math.round((stbGetLen() - stbGetPosTime())/60) );
}
var playMedia = _playMedia;
function _playMedia(med){
    if(mediaUrls[mediaUrls.length-1]==-1) mediaSelects[0]=0; // from history
    setCurrent(catIndex, -1);
    var t=0,
        i = medHistory.findIndex(function(val){ return (val.stream_url == med.stream_url); });
    if(i!=-1){
        if(i==0 && playType==-100000000000) return;
        t = Math.floor(medHistory[i].current/60)*60;
        medHistory.splice(i, 1);
    };
    medHistory.unshift(med);
    medHistory.splice([0,10,20,30,40,50][sMedCount]);
    $('#picon').css('background-image', 'url("'+(med.logo_30x30||'')+'")');
    $('#channel_number').text(' ');
    $('#channel_name').html(med.title);
    $('#nprogramm_name').html('&nbsp; ');
    $('#nbegin_time').text('');
    $('#nend_time').text('');
    $('#programm_name').html('&nbsp; ');
    _prog100 = 0;
    $progress_div.css('background-color', '#446');
    $('#progress_r').css('width', '0%');
    $('#progress').css('width', '0%');
    $('#begin_time').text('');
    $('#end_time').text('');
    $('#programm_name2').text('');
    $('#programm_duration').text('');
    $('#programm_descr').html(getMediaDescr(med));

    if(sInfoSwitch) showChanelInfo(1);

    playTime = 0;
    playType = -100000000000;
    forcePlay = true;
    if(sStopPlay) stbStop(); // for black screen
    if(typeof(med.stream_url) === 'function')
        med.stream_url = med.stream_url();
    stbPlay(med.stream_url);
    if(t)
        confirmBox(_('Continue watching?')+'<br><br>'+step2text(t), function(){ stbSetPosTime(t); } );
}
function searchMedia(med){
    editCaption = _('String for search');
    var medSearch = stbGetItem('medSearch') || '';
    editvar = medSearch;
    setEdit = function(){
        if(!editvar.length) return;
        // setTimeout(function(){
            medSearch = editvar;
            stbSetItem('medSearch', medSearch);
            mediaName = med.title;
            mediaSelects.unshift(0);
            mediaList(med.playlist_url+((med.playlist_url.indexOf('?') == -1) ? '?' : '&')+'search='+medSearch);
        // });
    };
    showEditKey();
}
function infoMedia(){
    if(!(listArray[selIndex].description)) return;
    $('#listPopUp').hide();
    saveCPD();
    var n = listArray[selIndex].title||'';
    listCaption.innerHTML = n;
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')+(n?btnDiv(keys.N2, strInfo, 'TMDb', '2', sArrowFun==2 ? strRIGHT : sRewFun==1 ? strFF : sPNFun==1 ? strNEXT : ''):'');
    aboutKeyHandler = function(code){
        if(n) switch(code){
            case keys.RIGHT: if(sArrowFun!=2) break;
            case keys.N2:
            case keys.INFO: TMDb.search(n); return true;
            case keys.FF: if(sRewFun!=1) break; TMDb.search(n); return true;
            case keys.NEXT: if(sPNFun!=1) break; TMDb.search(n); return true;
        }
        restoreCPD(); $('#listAbout').hide().text(''); $('#_prd').css("margin-top", 0); clearTimeout(detailTimer); return true;
    };
    // aboutKeyHandler = function (code){ restoreCPD(); $('#listAbout').hide().text(''); $('#_prd').css("margin-top", 0); clearTimeout(detailTimer); return true; };
    $('#listAbout').html('<div id="_prd">'+getMediaDescr(listArray[selIndex])+'</div>').show();
    a = $('#_prd').height() + 10 - $('#listAbout').height();
    scrollUp('_prd', a, 10000);
}
function selectMedia(){
    var pr = listArray[selIndex];
    if(pr.adult && pr.adult==1 && sPSchannels && (parentPIN!='*') && !parentAccess) {
        enterPinAndSetAccess(selectMedia);
        return;
    }
    mediaSelects[0] = selIndex;
    if(pr.playlist_url)
        if(pr.search_on) searchMedia(pr);
        else { mediaName = pr.title; mediaSelects.unshift(0); mediaList(pr.playlist_url);}
    else {
        if(pr.stream_url){
            closeList();
            playMedia(pr);
        } else infoMedia();
    }
}
function mediaKeyHandler(code){
    function upMedia(){
        if(mediaUrls.length==1) popupList(popMedia);
        else {
            mediaSelects.shift();
            mediaUrls.pop();
            mediaNames.pop();
            mediaName = mediaNames.pop();
            mediaList(mediaUrls.pop());
        }
    }
    if(sArrowFun==2) switch(code){
        case keys.LEFT: upMedia(); return true;
        case keys.RIGHT: if(listArray[selIndex].playlist_url) selectMedia(); else infoMedia(); return true;
		case keys.RETURN: closeList(); return true;
    }
    switch(code){
        case keys.RETURN: upMedia(); return true;
        case keys.N0:
        case keys.RED:
        case keys.PRECH:
        case keys.EXIT: closeList(); return true;
		case keys.ENTER: selectMedia(); return true;
		case keys.N2:
		case keys.INFO: infoMedia(); return true;
        case keys.RW: if(sRewFun!=1) return false; upMedia(); return true;
        case keys.PREV: if(sPNFun!=1) return false; upMedia(); return true;
        case keys.FF: if(sRewFun!=1) return false; if(listArray[selIndex].playlist_url) selectMedia(); else infoMedia(); return true;
        case keys.NEXT: if(sPNFun!=1) return false; if(listArray[selIndex].playlist_url) selectMedia(); else infoMedia(); return true;
        case keys.N8:
        case keys.TOOLS:
        case keys.GREEN:
            if(sFavorites==-1 || mediaUrls.length==1 || !listArray.length) return true;
            if(mediaUrls[mediaUrls.length-1]!=-2){
                medFavorites.push(listArray[selIndex]);
                showShift(listArray[selIndex].title + _(' added to favorites'));
            }else{
                listArray.splice(selIndex, 1);
                if(listArray.length && selIndex == listArray.length) selIndex--;
                showPage();
            }
            if(sFavorites!=-1) providerSetItem('medFavorites', JSON.stringify(medFavorites));
            return true;
    }
    return false;
}

var mediaName = '', mediaRecords = [], mediaUrls = null, mediaNames = [], mediaSelects = [], medHistory = [], medFavorites = [];
function getMediaDescr(med){
    // console.log(med);
    var f = med.description || '';
    if(typeof(f) === "function") f = f();
    return f.replace(/script/g, "sсr!!!");;
}
function showMediaList1(){
    selIndex = mediaSelects[0] || 0;
    listArray = mediaRecords;

    var iw = (window.innerHeight-90*getHeightK())/pageSize-2, im = 6*getWidthK();

    getListItem = function(item, i){ return (sShowPikon ? '<div class="img" style="background-image: url(\'' + (item.logo_30x30||'') + '\'); width:'+iw+'px;margin-left:'+im+'px;"></div>&nbsp;' : '&nbsp;&nbsp;') + item.title; };
    listDetail.innerHTML = '';
    detailListAction = function (){
        listDetail.innerHTML = '<div id="_prd" style="font-size:smaller;">' + getMediaDescr(listArray[selIndex]) + '</div>';
        if(!sNoSmall) $('img', $(listDetail)).not('#detal').remove();
        var a = $('#_prd').height() + 10 - $(listDetail).height();
        scrollUp('_prd', a, 5000);
    };
    listKeyHandler = mediaKeyHandler;
    var $t = $('#testFont'), ml = ($(list).width()||$('#listCaption').width())-$('#listTime').width()*2;
    $t.html(mediaNames.join(' / ')).text($t.text());
    // log('info', ml+' '+$(list).width()+' '+$('#listTime').width()+' '+$t.width());
    while ($t.width() > ml) { $t.text('...'+$t.text().substr(10)); };
    listCaption.innerHTML = $t.text();
    // log('info', ml+' '+$(list).width()+' '+$('#listTime').width()+' '+$t.width());
    $t.text('');
    listPodval.innerHTML = btnDiv(keys.RED, '', 'Close', sArrowFun==2?strRETURN:strPRECH, '0') +
        (sArrowFun==2?btnDiv(keys.LEFT, strLEFT, 'Back'):btnDiv(keys.RETURN, strRETURN, 'Back', sRewFun==1 ? strRW : sPNFun==1 ? strPREV : '')) +
        btnDiv(keys.N2, strInfo, 'Description', '2') +
        (listArray.length&&sFavorites!=-1&&mediaUrls.length!=1? btnDiv(keys.GREEN, '', (mediaUrls[mediaUrls.length-1]!=-2?'Add to favorites':'Delete'), strTools, '8') : '');
    $('#listPopUp').html('').hide();
    showPage();
}
function showMediaList(){
    // console.log(mediaSelects);
    if(mediaSelects.length==1 && sFavorites!=-1){
        mediaRecords.push( {title: '', logo_30x30: '', description: '', playlist_url: ''} );
        if(sMedCount) mediaRecords.push( {title: _('History of watched movies'), logo_30x30: '', description: '', playlist_url: -1} );
        mediaRecords.push( {title: _('Favorites'), logo_30x30: '', description: '', playlist_url: -2} );
    }
    mediaNames.push(mediaName);
    showMediaList1();
}
function mediaList(murl){
    if(mediaUrls && mediaUrls.length && (murl == mediaUrls[0])){
        mediaName = 'Медиатека';
        mediaUrls = [];
        mediaNames = [];
        mediaSelects = [mediaSelects.pop()];
    }
    if(murl === null) {
        if(mediaUrls === null){
            mediaName = 'Медиатека';
            murl = '';
            mediaUrls = [];
            mediaNames = [];
            mediaSelects = [0];
        }else{
            showMediaList1()
            return;
        }
    }
    mediaUrls.push(murl);
    mediaRecords = [];
    if(murl==-1){ // history
        mediaRecords = medHistory;
        showMediaList();
        return;
    }
    if(murl==-2){ // favorites
        mediaRecords = medFavorites;
        showMediaList();
        return;
    }
    getMediaArray(murl, showMediaList);
}

var epgArray;
var curProg;
var playTime;
var _prog100 = 0;
function updateArchiveInfo(start_time){
    var ch_id = curList[primaryIndex], old_prog = curProg;
    $('#picon').css('background-image', 'url("' + getChannelPicon(ch_id) + '")');
    $('#channel_number').html((primaryIndex+1));
    $('#channel_name').html(chanels[ch_id].channel_name);

    curProg = epgArray.findIndex(function(element, index, array){
        return (element.time_to > start_time) && (element.time <= start_time);
    });
    var c = epgArray[curProg]||{name:'', time:Math.floor(start_time/3600)*3600, time_to:(Math.floor(start_time/3600)+1)*3600, descr: ''};

    $('#programm_name').html(c.name);
    _prog100 = c;
    $('#progress').css('width', ((start_time - c.time) / (c.time_to-c.time) * 100) + '%');
    $('#progress_r').css('width', c.time_to>Date.now()/1000 ? ((c.time_to - Date.now()/1000) / (c.time_to-c.time) * 100) + '%' : '0%');
    $progress_div.css('background-color', '#600');
    $('#begin_time').text(time2time(c.time));
    $('#end_time').text( '+' + Math.round((c.time_to - start_time)/60) );

    $('#programm_name2').html(c.name);
    var t = Math.round((start_time - c.time)/60);
    $('#programm_duration').html('<span id="arc_time" style="color:#a00;">'+time2time(start_time)+'</span> '+ time2str(c.time)+' - '+time2time(c.time_to)+' (<span id="cur_time">'+(t>0?t+'/':'')+'</span>'+Math.round((c.time_to-c.time)/60)+' '+_('min')+')');
    $('#programm_descr').html(c.descr? getThumbnail(c.icon)+c.descr.replace(/\|/g,"<br/>") : '');

    var np = curProg+1;
    if(!np) np = epgArray.findIndex(function(element, index, array){ return (element.time > start_time); });
    if(np>-1 && np < epgArray.length-1){
        var c1 = epgArray[np];
        $('#nprogramm_name').html(c1.name);
        $('#nbegin_time').text(time2time(c1.time));
        $('#nend_time').text(Math.round((c1.time_to - c1.time)/60));
    } else {
        $('#nprogramm_name').html('&nbsp; ');
        $('#nbegin_time').text('');
        $('#nend_time').text('');
    }
    if(sInfoChange && old_prog != curProg && !$i1.is(":visible")) showChanelInfo(1);
}

var fileArchive = false;
var forcePlay = false;
function playArchive(start_time){
    var old = curProg;
    updateArchiveInfo(start_time);
    if(sInfoRew) showChanelInfo(1);

    var ch_id = curList[primaryIndex];
    var c = epgArray[curProg]||{name:'', time:Math.floor(start_time/3600)*3600, time_to:(Math.floor(start_time/3600)+1)*3600, descr: ''};

    playTime = 0;
    playType = Math.floor(start_time);
    forcePlay = true;
    // alert(fileArchive +':'+ old +':' + curProg+'?:'+ start_time+':'+ c.time+':'+(start_time-c.time));
    if(!fileArchive || (old != curProg)){
        if(sStopPlay) stbStop(); // for black screen
        // stbPlay(getArchiveUrl(ch_id, start_time, c.time_to, c));// + (fileArchive ? ' position:'+(start_time-c.time) : ''));
        stbPlay(getArchiveUrl(ch_id, start_time, c.time_to, c), (fileArchive ? (start_time-c.time) : 0));
    } else {
        // $('#buffering').show();
        stbSetPosTime(start_time-c.time);
    }
}

function selectEpg(){
    if((!chanels[epg_ch_id].rec) || (listArray[selIndex].time > Date.now()/1000)){
        infoProgramm(listArray[selIndex].name);
        return;
    }

    // if(ifParentalAccess(listCatIndex, listChannel, function(){ selectEpg(); }))
        // return;
    if(ifParentalAccessChId(epg_ch_id, function(){ selectEpg(); }))
        return;

    closeList();
    setCurrent(listCatIndex, listChannel, true);
    epgArray = listEpgArray;
    playArchive(listArray[selIndex].time);
}
var epgTimers = [];
function startEpgTimer(o){
    var p = _('Timer: switch to channel?')+'<br><br>'+chanels[o.ci].channel_name+'<div style="color:'+curColor+';">'+o.n+'</div>'+time2time(o.t) + ' - ' + time2time(o.te) + ' (' + Math.round((o.te-o.t)/60) + ' '+_('min')+')',
        t = o.t*1000 - Date.now();
    o.ti = setTimeout(function(){
        confirmBox(p, function(){ closeList(); playChannel(o.c, o.i); });
    }, t>0?t:0);
}
function setEpgTimer(){
    var pr = listArray[selIndex];
    if(!epglisted || (pr.time < Date.now()/1000)) return;
    var i = epgTimers.findIndex(function(element){ return (element.ci == epg_ch_id) && (element.t == pr.time); });
    confirmBox(i==-1?'Set timer?':'Remove timer?', function(){
        if(i==-1){
            var oTimer = {ci:epg_ch_id, c:listCatIndex, i:listChannel, t:pr.time, te:pr.time_to, n:pr.name};
            startEpgTimer(oTimer)
            epgTimers.push(oTimer);
        }else{
            clearTimeout(epgTimers[i].ti);
            epgTimers.splice(i,1);
        }
        // console.log(epgTimers);
        showPage();
        providerSetItem('epgTimers', JSON.stringify(epgTimers));
    });
}
function loadEpgTimers(){
    try{ epgTimers = JSON.parse(providerGetItem('epgTimers')) } catch(e) {}
    if(!Array.isArray(epgTimers)) epgTimers = [];
    epgTimers.forEach(function(val, i){
        if(val.te>Date.now()/1000) startEpgTimer(val);
        if(val.t<Date.now()/1000) epgTimers.splice(i,1);
    });
    // console.log(epgTimers);
    providerSetItem('epgTimers', JSON.stringify(epgTimers));
}

function time2time(time){
    var d = new Date(time*1000);
    return _t2(d.getHours()) + ':' + _t2(d.getMinutes());
}

function time2str(time){
    var dn = _('Su Mo Tu We Th Fr Sa').split(' '), d = new Date(time*1000);
    return dn[d.getDay()] + '&nbsp;' + _t2(d.getDate()) + '.' + _t2(d.getMonth()+1) + '&nbsp;' + _t2(d.getHours()) + ':' + _t2(d.getMinutes());
}
var epgreturn = false;
function epgKeyHandler(code){
    switch(code){
        case keys.LEFT: if(sArrowFun!=2) return false;
        case keys.N3:
        case keys.CH_LIST:
        case keys.YELLOW: channelsList(listCatIndex, listChannel); return true;
		case keys.RETURN:
            if(!epgreturn) closeList();
            else channelsList(listCatIndex, listChannel);
            return true;
		case keys.ENTER: selectEpg(); return true;
        case keys.N1:
        case keys.PLAY:
        case keys.PAUSE:
		case keys.BLUE: bucketsList(listCatIndex); return true;
		case keys.RIGHT: if(sArrowFun!=2) return false;
        case keys.N2:
		case keys.INFO: infoProgramm(listArray[selIndex].name); return true;
        case keys.RW: if(sRewFun!=1) return false; channelsList(listCatIndex, listChannel); return true;
        case keys.PREV: if(sPNFun!=1) return false; channelsList(listCatIndex, listChannel); return true;
        case keys.FF: if(sRewFun!=1) return false; infoProgramm(listArray[selIndex].name); return true;
        case keys.NEXT: if(sPNFun!=1) return false; infoProgramm(listArray[selIndex].name); return true;
        case keys.N0:
        case keys.EPG:
        case keys.STOP:
        case keys.RED:
            switch(epglisted){
                case 0: epgList(listCatIndex, listChannel, epgreturn); return true;
                case 1: epgListAlpha(listCatIndex, listChannel, epgreturn); return true;
                case 2: if(chanels[epg_ch_id].rec) recordsList(listCatIndex, listChannel, epgreturn);
                        else epgList(listCatIndex, listChannel, epgreturn);
                        return true;
            }
            return true;
        case keys.N8:
        case keys.TOOLS:
        case keys.GREEN: setEpgTimer(); return true;
    }
    return false;
}
var epglisted = 1;
var listChannel;
var listEpgArray;
var epg_ch_id = null;
var curEpgData = null;
function detailEPG(){
    var pr = listArray[selIndex];
    listDetail.innerHTML = '<div id="_name"><div style="color:'+curColor+';">'+pr.name+'</div><div style="font-size:smaller;">'+time2str(pr.time) + ' - ' + time2time(pr.time_to) + ' (' + Math.round((pr.time_to-pr.time)/60) + ' '+_('min')+')</div></div>'
        + '<div id="_descr" style="font-size:smaller;overflow:hidden;"><div id="_prd">'+getThumbnail(pr.icon)+pr.descr+'</div></div>';
    var a = $('#listDetail').height() - $('#_name').height();
    $('#_descr').height(a);
    a = $('#_prd').height() + 10 - a;
    scrollUp('_prd', a, 5000);

    if(pr.time>Date.now()/1000) $('#bTimer').show(); else $('#bTimer').hide();
}
function itemEPG(item, i){
    var red = (item.time < Date.now()/1000) && chanels[epg_ch_id].rec? 'red': '';
    if(!red) red = epgTimers.findIndex(function(element){ return (element.ci == epg_ch_id) && (element.t == item.time); }) > -1 ? 'lime':'';
    if(red) red = ' style="color:'+red+'"';
    return '&nbsp;<span' + red + '>' + time2str(item.time) + '</span>&nbsp;&nbsp;' + item.name;
}
function epgPodval(){
    listPodval.innerHTML = btnDiv(keys.RED, '', epglisted==2?(chanels[epg_ch_id].rec?'Records':'By time'):(epglisted?'By alphabet':'By time'), strSTOP, '0') +
        btnDiv(keys.BLUE, '', 'Category', strPlayPause, '1') +
        btnDiv(keys.YELLOW, '', 'Channel list', '3', sArrowFun==2 ? strLEFT : sRewFun==1 ? strRW : sPNFun==1 ? strPREV : '') +
        btnDiv(keys.N2, strInfo, 'Description', '2', sArrowFun==2 ? strRIGHT : sRewFun==1 ? strFF : sPNFun==1 ? strNEXT : '')+
        '<span id="bTimer" style="display:none;">'+btnDiv(keys.GREEN, '', 'Timer', strTools, '8')+'</span>';
}
function epgList(cat, indexChannel, epgret){
    function createEpgList(){
        if((curEpgData !== null) && (curEpgData.length)){
            var epg = curEpgData.filter(function(val){
                return chanels[ch_id].rec ? val.time > (Date.now()/1000 - chanels[ch_id].rec*60*60) : val.time_to > (Date.now()/1000 - 2*60*60);
            }).sort(function(a, b){ return a.time - b.time; });
        }
        var ct = ((playType > 0) && (ch_id == curList[primaryIndex])) ? playType + playTime : Math.floor(Date.now()/1000);
        // console.log(playType+' - '+ch_id+' - '+curList[primaryIndex]+' - '+ct);
        selIndex = epg.findIndex(function(element){ return (element.time_to >= ct) && (element.time <= ct); });
        if(selIndex === -1) selIndex = 0;
        listArray = epg;
        listEpgArray = epg;
        getListItem = itemEPG;
        detailListAction = detailEPG;
        listKeyHandler = epgKeyHandler;
        listCaption.innerHTML = _('EPG and archive. Channel: ') + chanels[ch_id].channel_name;
        epgPodval();
        $('#listPopUp').hide();

        showPage();
    }

    epglisted = 1;
    epgreturn = epgret;
    listCatIndex = cat;
    listChannel = indexChannel;
    var curC = cats[catsArray[listCatIndex]];
    var ch_id = curC[listChannel];
    if(epg_ch_id && (epg_ch_id == ch_id)){ createEpgList(); return; }
    epg_ch_id = ch_id;

    getEPGchanelCached(ch_id, function(ch_id, data){
        curEpgData = data;
        createEpgList();
        setCurProg(ch_id, data, null);
    });
}

function epgListAlpha(cat, indexChannel, epgret){
    function createEpgList(){
        if((curEpgData !== null) && (curEpgData.length)){
            var epg = curEpgData.filter(function(val){
                return chanels[ch_id].rec ? val.time > (Date.now()/1000 - chanels[ch_id].rec*60*60) : val.time_to > (Date.now()/1000 - 2*60*60);
            }).sort(function(a, b){ return a.time - b.time; });
            var epgAlpha = curEpgData.filter(function(val){
                return chanels[ch_id].rec ? val.time > (Date.now()/1000 - chanels[ch_id].rec*60*60) : val.time_to > Date.now()/1000;
            }).sort(function(a, b){
                return a.name < b.name ? -1 : a.name > b.name ? 1 : a.time - b.time;
            });
        }
        var ct = ((playType > 0) && (ch_id == curList[primaryIndex])) ? playType + playTime : Math.floor(Date.now()/1000);
        // console.log(playType+' - '+ch_id+' - '+curList[primaryIndex]+' - '+ct);
        selIndex = epgAlpha.findIndex(function(element){ return (element.time_to >= ct) && (element.time <= ct); });
        if(selIndex === -1) selIndex = 0;
        listArray = epgAlpha;
        listEpgArray = epg;
        getListItem = itemEPG;
        detailListAction = detailEPG;
        listKeyHandler = epgKeyHandler;
        listCaption.innerHTML = _('EPG and archive. Channel: ') + chanels[ch_id].channel_name;
        epgPodval();
        $('#listPopUp').hide();

        showPage();
    }

    epglisted = 2;
    epgreturn = epgret;
    listCatIndex = cat;
    listChannel = indexChannel;
    var curC = cats[catsArray[listCatIndex]];
    var ch_id = curC[listChannel];
    if(epg_ch_id && (epg_ch_id == ch_id)){
        createEpgList();
        return;
    }
    epg_ch_id = ch_id;

    getEPGchanelCached(ch_id, function(ch_id, data){
        curEpgData = data;
        createEpgList();
        setCurProg(ch_id, data, null);
    });
}

function recordsList(cat, indexChannel, epgret){
    function createEpgList(){
        if((curEpgData !== null) && (curEpgData.length)){
            var epg = curEpgData.filter(function(val){
                return val.time > (Date.now()/1000 - chanels[ch_id].rec*60*60);
            }).sort(function(a, b){ return a.time - b.time; });
            var arcs_name = [];
            curEpgData.sort(function(a, b){ return b.time - a.time; });
            var records = curEpgData.filter(function(val){
                if(val.time < (Date.now()/1000 - chanels[ch_id].rec*60*60)) return false;
                if(val.time_to*1000 > Date.now()) return false;
                if(arcs_name.indexOf(val.name) != -1) return false;
                else {
                    arcs_name.push(val.name);
                    return true;
                }
            }).sort(function(a, b){ return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
        }
        selIndex = 0;
        listArray = records;
        listEpgArray = epg;
        getListItem = function(item, i){ return '&nbsp;&nbsp;' + item.name; };
        detailListAction = detailEPG;
        listKeyHandler = epgKeyHandler;
        listCaption.innerHTML = _('Archive. Channel: ') + chanels[ch_id].channel_name;
        epgPodval();
        $('#listPopUp').hide();

        showPage();
    }

    epglisted = 0;
    epgreturn = epgret;
    listCatIndex = cat;
    listChannel = indexChannel;
    var curC = cats[catsArray[listCatIndex]];
    var ch_id = curC[listChannel];
    if(!chanels[ch_id].rec) return;
    if(epg_ch_id && (epg_ch_id == ch_id)){ createEpgList(); return; }
    epg_ch_id = ch_id;

    getEPGchanelCached(ch_id, function(ch_id, data){
        curEpgData = data;
        createEpgList();
        setCurProg(ch_id, data, null);
    });
}

if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}
var aboutKeyHandler = null;
function pluginInfo(){
    $('#listAbout').show()
        .html(_('Player info:')+'<br/>'
        + version
        + '<br/>Author: alex &copy; 2018-2022'
        + '<br/><br/>'+_('Device info:')+'<br/>');
    stbInfo();
    aboutKeyHandler = function (code){ return false; };
}
function loadValue(){
    var _break = false, _code;
    function _close(){ clearTimeout(_timeout); _break = true; editKey = editKey1; showEdit(); }
    var _timeout = setTimeout( _close, 600000);
    function get_settings(){
        if(_break) return;
        $.ajax({
            url: host_ott+'/swop/a.php',
            data: {c:'get_val', d: _code}, type: 'POST', timeout: 10000, cache: false,
            success: function(json){
                if(_break) return;
                // console.log(json)
                if(json.status === 'forbidden') setTimeout(get_settings, 5000)
                // else if(json.status === 'error') get_code()
                else if (json.status === 'success') {
                    editvar = json.data;
                    editPos = editvar.length;
                    editKey = editKey1;
                    _keyCur = _keys.length-1;
                    showEdit();
                }
            },
            error: function(jqXHR){
                // console.log('Error :'+JSON.stringify(jqXHR));
                $('#listEdit').html('<div style="text-align:center;font-size:larger;color:red"><br/><br/>ERROR:<br/>'+jqXHR.responseText+'</div>');
            },
        })
    }
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
    $('#listEdit').html('<div style="text-align:center;font-size:larger;"><br/><br/>'+_('Send request')+'...</div>').show();
    editKey = function(code){ if(code==keys.RETURN||code==keys.EXIT){ _close(); } return true; }
    $.ajax({
        url: host_ott+'/swop/a.php', data: {c:'get_var', n:editCaption, v:editvar}, type: 'POST', timeout: 10000, cache: false,
        success: function(json){
            _code = json.code;
            $('#listEdit').html(
                '<div style="text-align:center;font-size:larger;"><br/>'+_('Request sended!')+'<br/><br/>'+
                _('For enter value open')+'<br/><span style="font-size:larger;color:'+curColor+'">'+__test+'ott-play.com/swop</span> '+_('and enter code')+' <span style="font-size:larger;color:'+curColor+'">'+_code+'</span><br/><br/>'+
                _('or scan')+':<br/><br/>'+
                '<div><img src="https://chart.googleapis.com/chart?cht=qr&chs=300x300&chld=|1&chl=https://'+__test+'ott-play.com/swop/?'+_code+'" style="height:30%;"/></div>'+
                '</div>'
            );
            // get_settings();
            setTimeout(get_settings, 10000);
        },
        error: function(jqXHR){
            // console.log('Error :'+JSON.stringify(jqXHR));
            $('#listEdit').html('<div style="text-align:center;font-size:larger;color:red"><br/><br/>ERROR:<br/>'+jqXHR.responseText+'</div>');
        },
    });
}

var editCaption = '', editvar = '', editPos = 0, setEdit;
var cursorInterval = null;
function _changeEdit(){
    // $('#ee').html(editvar.substr(0, editPos) + '<span id="cursor" style="background-color:'+curColor+'">&nbsp;</span>' + editvar.substr(editPos));
    $('#ee').html(editvar.substr(0, editPos) + '<div id="cursor" style="display:inline-block;vertical-align:top;background-color:'+curColor+';width:3px;height:1.2em;"></div>' + editvar.substr(editPos));
    clearInterval(cursorInterval);
    var cursorShow = true, $c = $('#cursor');
    cursorInterval = setInterval(function(){ cursorShow = !cursorShow; $c.css('background-color', cursorShow?curColor:'inherit'); }, 500);
}
var _keyCur = 14, _keyUp = false, _keyE = true, _keyP = false,
    _keys1 = '1234567890', _keysA = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09',
    _keysL = 'abcdefghijklmnopqrstuvwxyz',
    _keysP = '.:/@,!?<>#$%^&*()-=_+;\'"[]{}`~',
    _keys='',
    _keysSymbol = [
        {s:'', a:function(){ _setCase(!_keyUp); showEdit();}},
        {s:'', a:function(){ if(!_keysSymbol[1].s) return; _keyP = false; _setLang(!_keyE); showEdit();}},
        {s:'', a:function(){ _setPunct(!_keyP); showEdit();}},
        {s:'&hearts;&trade;', a: loadValue },
        {s:'&larr;', a:function(){ if(editPos){ editPos--; _changeEdit(); } } },
        {s:'&rarr;', a:function(){ if(editPos < editvar.length){ editPos++; _changeEdit(); } } },
        {s:'_', a:function(){editvar = editvar.substr(0, editPos) + ' ' + editvar.substr(editPos); editPos++; _changeEdit();}},
        {s:'', a:function(){ if(editPos){ editvar = editvar.substr(0, editPos - 1) + editvar.substr(editPos); editPos--; _changeEdit(); }}},
        // {s:'Clr', a:function(){editvar = ''; editPos=0; _changeEdit();}},
        {s:'', a:function(){}},
        {s:'Ok', a:function(){ clearInterval(cursorInterval); restoreCPD(); $('#listEdit').hide(); setEdit();}}
    ];
function _setCase(up){
    if(_keyP) return;
    _keyUp = up;
    _keys = _keyUp? _keys.toUpperCase(): _keys.toLowerCase();
    _keysSymbol[0].s = _keyUp? '&darr;a':'&uarr;A';
    if(!sNoColorKeys) _keysSymbol[0].s = '<span style="border-bottom:3px solid red;">'+_keysSymbol[0].s+'</span>';
}
function _setLang(val){
    var _keysC = _('alhabet');
    _keyE = val;
    var k = (val? _keysL : _keysC), i = Math.floor(k.length/10);
    if(k.length%10) k = (k+_keysP).substr(0,(i+1)*10);
    _keys = _keys1 + k + _keysA;
    _keysSymbol[2].s = '!?,';
    _setCase(_keyUp);
    _keyCur=_keys.length-9;
}
function _setPunct(val){
    _keyP = val;
    if(val){ _keys = _keys1+_keysP+_keysA; _keysSymbol[0].s = ''; _keysSymbol[2].s = 'abc'; }
    else _setLang(_keyE);
    _keyCur=_keys.length-8;
}
function showEditKey1(types){
    function addCol2(n,c){
        if(_keysSymbol[n].s) _keysSymbol[n].s = '<span style="border-bottom:3px solid '+c+';">'+_keysSymbol[n].s+'</span>';
    }
    saveCPD();
    if(stbGetItem("ottplaylang")=='_eng') _keyE = true;
    _keysSymbol[1].s = stbGetItem("ottplaylang")=='_eng'?'':'<span style="font-family:fontello;padding:0.2em;">&#xe80E;</span>';
    _keysSymbol[7].s = '<span style="font-family:fontello;padding:0.2em;">&#xe804;</span>';
    _keysSymbol[9].s = 'Ok';
    if(!sNoColorKeys){
        addCol2(1,'green');
        addCol2(7,'#bb0');
        addCol2(9,'blue');
    }
    editPos = editvar.length;
    if(_keyCur>_keys.length-10) _keyCur = 14;
    var _k = _keyCur;
    _setPunct(_keyP);
    _keyCur = _k;
    showEdit();
}
function showEdit(){
    var $l = $('#listEdit'), w = $l.width()/12;
    // var fs = $l.css('font-size');
    var s = editCaption + ':<br/><br/>';
    s += '<div id="ee" style="width:100%;white-space:pre-wrap;word-wrap:break-word;"></div>';
    for (var i = 0; i < _keys.length; i++) {
        if(i % 10 == 0) s += '<br/>';
        var k = _keysSymbol[_keys.charCodeAt(i)]!=undefined ? _keysSymbol[_keys.charCodeAt(i)].s : _keys[i];
        // s += '<div id="ik'+i+'" onclick="event.stopPropagation();editKey1('+_keys.charCodeAt(i)+');" style="display:inline-block;width:'+w+'px;height:'+w+'px;text-align:center;vertical-align:middle;line-height:'+w+'px;">'+k+'</div>';
        s += '<div id="ik'+i+'" onclick="clickKey('+i+');" style="display:inline-block;width:'+w+'px;height:'+w+'px;text-align:center;vertical-align:middle;line-height:'+w+'px;">'+k+'</div>';
    }
    $l.html(s).show();
    _changeEdit();
    $('#ik'+_keyCur).css({"background-color": curColorB, "color": curColor});
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')+
        btnDiv(keys.RED, '', _keysSymbol[0].s?(_keyUp?'&darr;a':'&uarr;A'):'', strTools)+
        btnDiv(keys.GREEN, '', _keysSymbol[1].s?(_keyE?_('lang'):'English'):'', strFF)+
        btnDiv(keys.YELLOW, '', 'Delete', strRW)+
        btnDiv(keys.BLUE, '', 'Ok', strPlayPause);
}
function clickKey(ind){
    event.stopPropagation();
    $('#ik'+_keyCur).css({"background-color": '', "color": ''});
    _keyCur=ind;
    $('#ik'+_keyCur).css({"background-color": curColorB, "color": curColor});
    editKey1(keys.ENTER);
}
function editKey1(code){
    function changeSel(val){
        $('#ik'+_keyCur).css({"background-color": '', "color": ''});
        _keyCur+=val;
        $('#ik'+_keyCur).css({"background-color": curColorB, "color": curColor});
    }
    switch (code) {
        case keys.UP: changeSel(_keyCur>9? -10: _keys.length-10); return;
        case keys.DOWN: changeSel(_keyCur<_keys.length-10?10:-_keys.length+10); return;
		case keys.LEFT: changeSel(_keyCur%10>0? -1:9); return;
        case keys.RIGHT: changeSel(_keyCur%10<9?1:-9); return;
        case keys.TOOLS:
        case keys.RED: _keysSymbol[0].a(); return;
        case keys.FF:
        case keys.GREEN: _keysSymbol[1].a(); return;
        case keys.RW:
        case keys.YELLOW: _keysSymbol[7].a(); return;
        case keys.PLAY:
        case keys.PAUSE:
        case keys.BLUE: _keysSymbol[9].a(); return;
        case keys.ENTER:
            if(_keys.charCodeAt(_keyCur)>9) { editvar = editvar.substr(0, editPos) + _keys[_keyCur] + editvar.substr(editPos); editPos++; _changeEdit();}
            else { _keysSymbol[_keys.charCodeAt(_keyCur)].a(); }
            return;
        case keys.EXIT:
		case keys.RETURN: clearInterval(cursorInterval); restoreCPD(); $('#listEdit').hide(); return;
        default:
            // console.log(code, String.fromCharCode(code));
            var i = _keys.indexOf(String.fromCharCode(code));
            if(i>-1){ changeSel(i-_keyCur); editKey1(keys.ENTER); }
            return;
	}
}

var editKey = editKey1;
var showEditKey = showEditKey1;

function buttonsInfo(){
    var s1 = '<br/><div class="btn">', s2 = '</div> - ', s3 = '</div>/<div class="btn">', s4 = '</div>&nbsp;<div class="btn">', s5 = _(' (if archive exists)'),
        page =
            (strPRECH ? s1+strPRECH+s2+_('Return to previous channel') : '') +
            (strPip ? s1+strPip+s2+_('Call PiP / PiP exchange') : '') +
            (strInfo ? s1+strInfo+s2+_('Info about TV program') : '')+
            (!sNoColorKeys||strTools?'<br/>'+(!sNoColorKeys?'<div class="btn yellow">&nbsp;</div>&nbsp;':'')+(strTools? '<div class="btn">'+strTools+'</div>&nbsp;':'')+'- '+_('Show player menu'):'')+
            (strSETUP ? s1+strSETUP+s2+_('Settings') : '') +
            s1+strENTER+s2+_('Show channel selection list')+
            s1+strRETURN+s2+_('Hide / Return')+
            s1+strEXIT+s2+_('Exit player')+
            (!sNoColorKeys||strEPG?'<br/>'+(!sNoColorKeys?'<div class="btn red">&nbsp;</div>&nbsp;':'')+(strEPG? '<div class="btn">'+strEPG+'</div>&nbsp;':'')+'- '+_('Show EPG and archive for channel'):'')+
            (!sNoColorKeys?'<br/><div class="btn blue">&nbsp;'+s2+_('Channel category selection'):'')+
            (strAspect ? s1+strAspect+s2+_('Toggle Aspect Ratio') : '')+
            (strZoom ? s1+strZoom+s2+_('Toggle Zoom Mode') : '')+
            (strAudio ? s1+strAudio+s2+_('Switch sound track') : '')+
            (strSubt ? s1+strSubt+s2+_('Switch subtitle') : '')+
            ((typeof(strStbButtons) === 'undefined')?'':strStbButtons())+
            '<br/><br/>'+_('In live mode: <br/>')+
            (!sNoNumbersKeys ? s1+'1</div>...<div class="btn">0'+s2+_('Channel selection by number') : '')+
            s1+strSTOP+s2+_('Restart stream')+
            s1+strPLAY+s4+strPAUSE+s4+'0'+s2+_('Pause/Play')+s5+
            s1+strPREV+s2+_('Timeshift: to start of TV program')+s5+
            s1+strRW+s2+_('Timeshift: one minute back')+s5+
            s1+strFF+s4+strNEXT+s2+_('Show rewind window')+s5+
            _('<br/><br/>In archive mode:<br/>')+
            s1+strPLAY+s4+strPAUSE+s4+'0'+s2+_('Pause/Play')+
            s1+strSTOP+s4+'8'+s2+_('Stop playback and return to In live mode')+
            s1+strPREV+s4+'2'+s2+_('To start of TV program / Previous TV program')+
            s1+strNEXT+s4+'5'+s2+_('Next TV program')+
            s1+strRW+s3+strFF+s2+_('Back / Forward for 1 minute')+
            (!sNoNumbersKeys ? s1+'1'+s3+'3'+s2+_('Back / Forward for 15 seconds') : '')+
            (!sNoNumbersKeys ? s1+'4'+s3+'6'+s2+_('Back / Forward for 3 minutes') : '')+
            (!sNoNumbersKeys ? s1+'7'+s3+'9'+s2+_('Back / Forward for 10 minutes') : '')+
            s1+strDOWN+s4+strUP+s2+_('Show rewind window');
    saveCPD();
    listCaption.innerHTML = _('Description of remote control buttons');
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
    listDetail.innerHTML = '';
    $('#listAbout').html('<div id="_prd">'+page+'</div>').show();
    var a = $('#_prd').height() + 10 - $('#listAbout').height();
    scrollUp('_prd', a, 10000);

    aboutKeyHandler = function(code){
        if(code==keys.RETURN){ restoreCPD(); $('#listAbout').hide().text(''); clearTimeout(detailTimer); };
        return true;
    }
}

var parentPIN = '', parentAccess = false;
function setParentAccess(val, callback){
    parentAccess = val;
    if(parentAccess){
        setTimeout(function(){ parentAccess = false; }, 3600000);
        callback();
    } else showShift(_('Wrong parental code !!!'));
}
function enterPinAndSetAccess(callback){
    enterPinCode(_('Enter parental code'), function(pin){
        if(!pin) return;
        setParentAccess(pin == parentPIN, callback);
    });
}
function ifParentalAccess(cat, index, callback){
    try{
        if(sPSchannels && (parentPIN!='*') && !parentAccess) {
            var cl = cats[catsArray[cat]], ci = cl[index];
            if(parentalArray.indexOf(ci) != -1){
                enterPinAndSetAccess(callback);
                return true;
            }
        }
    } catch(e){}
    return false;
}
function ifParentalAccessChId(ch_id, callback){
    try{
        if(sPSchannels && (parentPIN!='*') && !parentAccess) {
            if(parentalArray.indexOf(ch_id) != -1){
                enterPinAndSetAccess(callback);
                return true;
            }
        }
    } catch(e){}
    return false;
}
var newPin;
function parentControlSetup(){
    if((parentPIN!='*')&&(!parentAccess)){
        enterPinAndSetAccess(parentControlSetup);
        return;
    }
    function _save(){
        function _s(){
            stbSetItem('parentPIN', parentPIN);
            var i = 1;
            saveIfChanged(i++, 'sPSchannels', true);
            saveIfChanged(i++, 'sPSoptions', true);
            if(optIndexOf(selectProvaider)!=-1) saveIfChanged(i++, 'sPSprovs', true);
            showShift(_('Settings saved'));
            closeList();
            optionsList(parentControlSetup);
        }
        if((parentPIN != '*') != (listArray[0].val==1)){
            if(parentPIN != '*'){ parentPIN = '*'; _s(); }
            else {
                enterPinCode(_('Set parental code'), function(pin){
                    if(!pin) return;
                    newPin = pin;
                    enterPinCode(_('Repeat parental code'), function(pin){
                        if(!pin) return;
                        if(pin != newPin) showShift(_('Wrong parental code !!!'));
                        else {
                            parentPIN = pin;
                            setParentAccess(true, _s);
                        }
                    });
                });
            }
        } else _s();
    }
    var noyes = [_('no'),_('yes')];
    listArray = [
        {name: _('Parental control'), val: parentPIN != '*'?1:0, values: noyes},
        {name: _('Protect Adult Channels'), val: sPSchannels, values: noyes},
        {name: _('Protect Settings'), val: sPSoptions, values: noyes},
        {name: _('Protect Change Provider'), val: sPSprovs, values: noyes},
        {name: '', val: 0, values: nofun, cur: ''},
        {name: '<div class="btn">'+_('Save Settings')+'</div>', val: 0, values: _save, cur: ''}
    ];
    if(optIndexOf(selectProvaider)==-1) listArray.splice(3,1);
    listCaption.innerHTML = _('Parental control');
    _setSetup(_save, function(){ optionsList(parentControlSetup); });
}
var optionsArr = [
        {action: settingsInterface, name: 'Interface settings'},
        {action: settingsLists, name: 'Lists settings'},
        {action: settingsChannels, name: 'Channel list settings'},
        {action: settingsInfobar, name: 'Infobar settings'},
        {action: settingsButtons, name: 'Buttons settings'},
        {action: settingsMenu, name: 'Menu items settings'},
        {action: parentControlSetup, name: 'Parental control'},//, desc:'Parental control Enable/Disable'},
        {action: noSelProv},
        {action: selectProvaider, name: 'Change provider', desc: 'Change provider - you can change the provider, and it will be remembered at the next start of player!'},
        {action: edit_dealer, name: 'Enter Provider Code'},
        {action: settingsManage, name: 'Manage settings'},
        {action: selectLang, name: 'Change interface language'},
    ];
function indexOfAction(arrActions, action){
    for (var i = 0; i < arrActions.length; i++)
        if(arrActions[i].action == action) return i;
    return -1;
}
function optIndexOf(action){
    return indexOfAction(optionsArr, action);
}
function delOption(action){
    var i = optIndexOf(action);
    if(i>-1) optionsArr.splice(i, 1);
}
function addBtn2menu(arrActions, action, bName){
    if(!bName) return;
    var i = indexOfAction(arrActions, action);
    if(i>-1) listArray[i] = '<div class="btn">' + bName + '</div> ' + listArray[i];
}
function optionsList(sel){
    if(sPSoptions&&(parentPIN!='*')&&(!parentAccess)){
        enterPinAndSetAccess(optionsList);
        return;
    }
    listArray = [];
    optionsArr.forEach(function(item){ listArray.push(_(item.name || '')); });
    if(!sNoNumbersKeys) addBtn2menu(optionsArr, selectProvaider, '9');
    addBtn2menu(optionsArr, selectProvaider, strTools);
    selIndex = 0;
    if(typeof sel !== 'undefined')
        for (var i = 0; i < optionsArr.length; i++)
            if(optionsArr[i].action == sel) selIndex = i;
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+item; };
    detailListAction = function(){
        listDetail.innerHTML = _(optionsArr[selIndex].desc || optionsArr[selIndex].name || '');
        if(optionsArr[selIndex].action == noSelProv) nselprov = 0;
    };
    listKeyHandler = function(code){
        switch(code){
    		case keys.RETURN: popupList(optionsList); return true;
            case keys.ENTER: if(optionsArr[selIndex].action) optionsArr[selIndex].action(); return true;
            case keys.TOOLS:
            case keys.N9: if(optIndexOf(selectProvaider)>-1) selectProvaider(); return true;
        }
        return false;
    };
    listCaption.innerHTML = _('Settings');
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
    $('#listPopUp').hide();
    showPage();
};
var infoArr = [
        {action: buttonsInfo, name: 'Description of remote control buttons'},
        {action: donate, name: 'Donate <div class="btn" style="background-color:orange;">donate</div>', desc:'Voluntary donation for the development of project'},
        {action: nofun},
        // {action: clearAllsettings},
        {action: pluginInfo, name: 'About', desc:'Player and device info'},
    ];
function infoList(sel){
    listArray = [];
    infoArr.forEach(function(item){ listArray.push(_(item.name || '')); });
    if(!sNoNumbersKeys) addBtn2menu(infoArr, pluginInfo, '2');
    addBtn2menu(infoArr, pluginInfo, strInfo);
    selIndex = 0;
    if(typeof sel !== 'undefined')
        for (var i = 0; i < infoArr.length; i++)
            if(infoArr[i].action == sel) selIndex = i;
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+item; };
    detailListAction = function(){
        listDetail.innerHTML = _(infoArr[selIndex].desc || infoArr[selIndex].name || '');
        // if(infoArr[selIndex].action == clearAllsettings) _clearAll = 0;
    };
    listKeyHandler = function(code){
        switch(code){
    		case keys.RETURN: popupList(infoList); return true;
            case keys.ENTER: if(infoArr[selIndex].action) infoArr[selIndex].action(); return true;
            case keys.N2:
    		case keys.INFO: pluginInfo(); return true;
        }
        return false;
    };
    listCaption.innerHTML = _('Information');
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
    $('#listPopUp').hide();
    showPage();
};

function popBuckets(){ bucketsList(catIndex); };
function popEpg(){ epgList(catIndex, primaryIndex, false); };
function popRecords(){ recordsList(catIndex, primaryIndex, false); }
function popMedia(){ if(typeof(getMediaArray) == "function") mediaList(null);  }
function popPrevProg(){ closeList(); prevProg(); };
function popShift(){ closeList(); shiftArchiveSelect(0); };
function popPause(){closeList(); _doKey(keys.N0)}
function popStop(){closeList(); _doKey(keys.STOP)}
function popTogglePip(){ closeList(); togglePip(); };
function popStopPip(){ pipIndex = null; stbStopPip(); closeList(); }
function restart(){ stbStop(); window.location.href = window.location.href; window.location.reload(true);}
function donate(){
    var l = stbGetItem("ottplaylang") || '';
    if(l=='_eng') l = '';
    $('#listAbout').text('').show().load(host+'/stbPlayer/donate'+l+'.html?1', function(response, status, xhr){
        if(status=="error") $('#listAbout').load(host+'/stbPlayer/donate.html?1');
    })
    aboutKeyHandler = function(code){ return false; }
};
function nofun(){}
function noSelProv(){
    if(++nselprov < 7) return;
    if(sPSprovs&&(parentPIN!='*')&&(!parentAccess)){
        enterPinAndSetAccess(noSelProv);
        return;
    }
    var p = parseInt(stbGetItem('noSelProv')) || 0;
    confirmBox(p?'Show providers?':'Hide providers?', function(){ stbSetItem('noSelProv', p?0:1); restart(); } );
    nselprov = 0;
}
function noProvParam(){
    if(++nprovparams < 7) return;
    if(sPSoptions&&(parentPIN!='*')&&(!parentAccess)){
        enterPinAndSetAccess(noProvParam);
        return;
    }
    var p = parseInt(stbGetItem('noProvParam')) || 0;
    confirmBox(p?'Show provider settings?':'Hide provider settings?', function(){ stbSetItem('noProvParam', p?0:1); restart(); } );
    nprovparams = 0;
}
function clearAllsettings(){
    if(++_clearAll < 7) return;
    confirmBox('Clear all settings?', function(){ try{ stbClearAllItems() }catch(e){}; restart(); } );
    _clearAll = 0;
}
function delPopup(fn){
    var i = popupActions.indexOf(fn);
    if(i===-1) return;
    popupArray.splice(i, 1);
    popupDetail.splice(i, 1);
    popupActions.splice(i, 1);
}
function stbAudioTracksExists(){ return true; }
function stbSubtitleExists(){ return true; }
var popupArray = ['Toggle Aspect Ratio', 'Toggle Zoom Mode', 'Switch sound track', 'Switch subtitle',
    'Return to previous channel', 'Pause/Play', 'Restart stream / Live', 'Rewind', 'Call PiP / PiP exchange', 'Close PiP',
    'Category selection', 'Show EPG and archive for channel', 'Show list of channel archive records', 'Show Media Library',
    '',
    '', 'Settings',
    'Restart player', 'Exit player',
    'Information'];
var popupDetail = ['', '', '', '',
    '', '', '', 'Show rewind window', '', '',
    '', '', 'Show list of channel archive records without duplication', '',
    '',
    '', '',
    '', '',
    ''];
var popupActions = [toggleAspectRatio, toggleZoom, toggleAudioTrack, toggleSubtitle,
    popPrevProg, popPause, popStop, popShift, popTogglePip, popStopPip,
    popBuckets, popEpg, popRecords, popMedia,
    noProvParam,
    nofun, optionsList,
    restart, exitPortal,
    infoList];
function popupList(ind){
    var iBo = 0, iEo = 0;
    function getPart12(s, to){
        try{ s = s.split('/')[to?1:0].trim(); } catch(e){}
        return s;
    }
    if(typeof ind === 'undefined') ind = 0;
    selIndex = 0;
    listArray = [];
    var ch_id = false, ii=-1;
    try{ ch_id = curList[primaryIndex]; }catch(e){}
    popupActions.forEach(function(val, i){
        if(sHideMenus.indexOf(popupActions[i].name)!=-1) return;
        var n = _(popupArray[i]);
        try{
            switch (val) {
                case toggleAudioTrack: if(!ch_id || !stbAudioTracksExists()) return; else break;
                case toggleSubtitle: if(!ch_id || !stbSubtitleExists()) return; else break;
                case popPause: n = getPart12(n, !stbIsPlaying());
                case popShift:
                case popRecords: if(playType<0 || !ch_id || chanels[ch_id].rec) break; else return;
                case popTogglePip: n = getPart12(n, pipIndex!=null); break;
                case popStopPip: if(pipIndex==null) return; else break;
                case popStop: n = getPart12(n, playType); break;
                case popMedia: if(typeof(getMediaArray) != "function") return; else break;
            }
        }catch(e){}
        var d = _(popupDetail[i]) || n;
        ii++;
        if(ind==i || ind==val) selIndex = ii;
        if(!sNoNumbersKeys){
            var b = '';
            switch (val) {
                case toggleAudioTrack: b = '1'; break;
                case infoList: b = '2'; break;
                case popPrevProg: b = '3'; break;
                case popShift: b = '4'; break;
                case popTogglePip: b = '5'; break;
                case popStopPip: b = '6'; break;
                // case selectProvaider: b = '7'; break;
                case restart: b = '8'; break;
                case optionsList: b = '9'; break;
                case exitPortal: b = '0'; break;
            }
            if(b) n = '<div class="btn">'+b+'</div> '+n;
        }
        if(!sNoColorKeys){
            var b = '';
            switch (val) {
                case popBuckets: b = 'blue'; break;
                case popEpg: b = 'red'; break;
                case popRecords: b = 'green'; break;
                case popMedia: b = 'yellow'; break;
            }
            if(b) n = '<div class="btn '+b+'">&nbsp;</div> '+n;
        }
        var b = '';
        switch (val) {
            case infoList: b = strInfo; break;
            case popPrevProg: b = strPRECH; break;
            case popTogglePip: b = strPip; break;
            case toggleAudioTrack: b = strAudio; break;
            case toggleSubtitle: b = strSubt; break;
            case toggleZoom: b = strZoom; break;
            case toggleAspectRatio: b = strAspect; break;
            case optionsList: b = strTools; break;
            case popPause: b = strPlayPause; break;
            case popStop: b = strSTOP; break;
        }
        if(b) n = '<div class="btn">'+b+'</div> '+n;
        listArray.push({name:n, desc:d, action:val});
        if(val == noProvParam) iBo = listArray.length-1;
        if(val == optionsList) iEo = listArray.length;
    });
    getListItem = function(item, i){ return '&nbsp;&nbsp;' + item.name; };
    detailListAction = function(){
        listDetail.innerHTML = listArray[selIndex].desc;
        if(listArray[selIndex].action == noProvParam) nprovparams = 0;
    };
    listKeyHandler = function(code){
        switch(code){
    		case keys.RETURN: closeList(); return true;
            // case keys.ENTER: listArray[selIndex].action(); return true;
            case keys.ENTER:
                if(sPSoptions&&iBo&&iEo&&selIndex>iBo&&selIndex<iEo&&(parentPIN!='*')&&(!parentAccess)){
                    enterPinAndSetAccess(listArray[selIndex].action);
                    return true;
                }
                listArray[selIndex].action();
                return true;
    		case keys.ZOOM: toggleZoom(); return true;
        	case keys.ASPECT: toggleAspectRatio(); return true;
            case keys.N1:
        	case keys.AUDIO: toggleAudioTrack(); return true;
            case keys.SUBT: toggleSubtitle(); return true;
        	case keys.N9:
            case keys.TOOLS: optionsList(); return true;
    		case keys.EPG:
    		case keys.RED: epgList(catIndex, primaryIndex, false); return true;
            case keys.GREEN: recordsList(catIndex, primaryIndex, false); return true;
            case keys.BLUE: bucketsList(catIndex); return true;
            case keys.YELLOW: if(typeof(getMediaArray) == "function") mediaList(null); return true;
            case keys.N3:
    		case keys.PRECH: popPrevProg(); return true;
            case keys.N4: popShift(); return true;
            case keys.PAUSE:
            case keys.PLAY: popPause(); return true;
            case keys.STOP: popStop(); return true;
            case keys.N5:
            case keys.PIP: popTogglePip(); return true;
            case keys.N6: popStopPip(); return true;
    		case keys.N2:
    		case keys.INFO: infoList(); return true;
    		case keys.N8: restart(); return true;
    		case keys.N0: exitPortal(); return true;
        }
        return false;
    };
    listCaption.innerHTML = _('Menu');
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
    $('#listPopUp').hide();

    showPage();
}

var sNoSmall = 0,
    sStopPlay = 0,
    sPipSize = 0,
    sPipPos = 0,
    sPageSize = 25, sFontShift = 4,
    sFont = 1,
    sArrowFun = 0, sRewFun = 0, sPNFun = 0,
    sRfun = 10, sGfun = 0, sYfun = 1, sBfun = 9,
    sALfun = 0, sARfun = 0, sAUfun = 0, sADfun = 0,
    sRWfun = 0, sFFfun = 0, sPREVfun = 0, sNEXTfun = 0,
    sEfun = 0, sOkfun = 0,
    s13dur = 0, s46dur = 0, s79dur = 0,
    sNoColorKeys = 0,
    sNoNumbersKeys = 0,
    sTimezone = 0,
    sSleepTimeout = 0,
    sVolumeStep = 5,
    sInfoTimeout = 5, sInfoSlide = 1, sInfoSwitch = 1, sInfoChange = 1, sInfoRew = 1, sThumbnail = 1,
    sOsdOpacity = 7,
    sListPos = 0,
    sSHLcolSel = '240,25', eSHLcolSel = '',
    sSHLcolor = '50,85', eSHLcolor = '',
    sSHLcolorB = '255,0', eSHLcolorB = '',
    sEditor = 0,
    sGrapI = 0,
    sShowNum = 1, sShowPikon = 1, sShowName = 1, sShowProgress = 1, sShowArchive = 1, sShowScroll = 1, sShowDescr = 1, sShowProgram = 1,
    sPreview = 0,
    sNextCount = 0, sNextCountL = 1,
    sFavorites = 0,
    sPermanentTime = 0,
    s10resum = 1,
    sPrevCount = 2, sMedCount = 2,
    sPSchannels = 1, sPSoptions = 0, sPSprovs = 0,
    sHDMIsupport = 0,
    sAutorun = 0,
    sPlayers = 0,
    sBufSize = 0;
function setPipPosBuf(){
    if(typeof(setPipPos) !== "function") return;
    var ll = Math.min(getWidthK(), getHeightK()),
        ps = [{x: 256, y: 144},{x: 384, y: 216},{x: 512, y: 288}],
        css = {width: ps[sPipSize].x*ll, height: ps[sPipSize].y*ll,
                right:sPipPos<2?20*ll:'auto', left:sPipPos>1?20*ll:'auto', top:sPipPos==0||sPipPos==3?20*ll:'auto', bottom:sPipPos==1||sPipPos==2?20*ll:'auto'};
    $('#pip_buffering').css(css);
    setPipPos(css);
}

function saveIfChanged(i, par, glob){
    if(glob === undefined) glob = false;
    // console.log(i, window[par], par, listArray[i].val);
    if(window[par] == listArray[i].val) return;
    window[par] = listArray[i].val;
    if(glob) stbSetItem(par, window[par])
    else providerSetItem(par, window[par]);
}
function settingsInterface(){
    function _save(){
        var i = 0;
        saveIfChanged(i++, 'sStopPlay', true);
        if(typeof(stbPlayPip) === "function"){
            saveIfChanged(i++, 'sPipSize', true);
            saveIfChanged(i++, 'sPipPos', true);
        }
        saveIfChanged(i++, 'sFont', true);
        saveIfChanged(i++, 'sTimezone', true);
        saveIfChanged(i++, 'sSleepTimeout', true);
        if(typeof(stbSetOsdOpacity) === "function")
            saveIfChanged(i++, 'sOsdOpacity', true);
        if(typeof(stbGetVolume) === "function")
            if(sVolumeStep != listArray[i++].val+3) {sVolumeStep = listArray[i-1].val+3; stbSetItem('sVolumeStep', sVolumeStep);}
        i++;
        if(sSHLcolor != eSHLcolor){ sSHLcolor = eSHLcolor; stbSetItem('sSHLcolor', sSHLcolor); }
        i++;
        if(sSHLcolSel != eSHLcolSel){ sSHLcolSel = eSHLcolSel; stbSetItem('sSHLcolSel', sSHLcolSel); }
        i++;
        if(sSHLcolorB != eSHLcolorB){ sSHLcolorB = eSHLcolorB; stbSetItem('sSHLcolorB', sSHLcolorB); }
        saveIfChanged(i++, 'sPermanentTime', true);
        saveIfChanged(i++, 'sGrapI', true);
        saveIfChanged(i++, 's10resum', true);
        saveIfChanged(i++, 'sPrevCount', true);
        if(typeof(getMediaArray) == "function")
            saveIfChanged(i++, 'sMedCount', true);
        if(typeof(showEditKey2) === "function")
            saveIfChanged(i++, 'sEditor', true);
        if((typeof stbPlayers !== 'undefined') && Array.isArray(stbPlayers))
            saveIfChanged(i++, 'sPlayers');
        if(typeof(stbSetBuffer) === "function")
            saveIfChanged(i++, 'sBufSize', true);
        setTimezone();
        setFontSize();
        setListPos();
        setColor();
        setEditor();
        setPipPosBuf();
        if(typeof(setPlayer) === "function") setPlayer();
        if(typeof(setAutorun) === "function") setAutorun();
        if(typeof(stbSetBuffer) === "function") stbSetBuffer();
        showShift(_('Settings saved'));
        closeList();
        optionsList(settingsInterface);
    }
    var noyes = [_('no'),_('yes')], atz = arrTimezone.slice();
    atz[0] = _(atz[0]);

    listArray = [
        {name: _('Black screen while switching the channel'), val: sStopPlay, values: noyes},
        {name: _('PiP window size'), val: sPipSize, values: [_('small'), _('medium'), _('large')]},
        {name: _('PiP window position'), val: sPipPos, values: [_('top-right'), _('bottom-right'), _('left-bottom'), _('top-left')]},
        {name: _('Font type'), val: sFont, values: [
            '<span style="font-family:Helvetica, Arial, sans-serif;">'+_('system')+'</span>',
            '<span style="font-family:Roboto;">Roboto</span>',
            '<span style="font-family:RobotoCondensed;">Roboto Condensed</span>',
            '<span style="font-family:Caveat;">Caveat</span>',
            '<span style="font-family:Liberation;">Liberation</span>',
            '<span style="font-family:Gabriela;">Gabriela</span>',
            '<span style="font-family:PTSansNarrow;">PTSansNarrow</span>',
        ]},
        {name: _('Timezone'), val: sTimezone, values: atz},
        {name: _('Sleep timer'), val: sSleepTimeout, values: [_('off'), _('30 minutes'), _('1 hour'), _('2 hours'), _('3 hours')]},
        {name: _('Interface transparency'), val: sOsdOpacity, values: ['100%', '90%', '80%', '70%', '60%', '50%', '40%', '30%', '20%', '10%', '0%']},
        {name: _('Volume step, %'), val: sVolumeStep-3, values: [3, 4, 5, 6, 7, 8, 9, 10]},
        {name: _('Color spectrum'), val: sSHLcolor, values: colorDialog, cur: _('select')},
        {name: _('Background color of selected item'), val: sSHLcolSel, values: selColorDialog, cur: _('select')},
        {name: _('Background color'), val: sSHLcolorB, values: backColorDialog, cur: _('select')},
        {name: _('Permanent clock on screen'), val: sPermanentTime, values: [_('no'),_('yes'), _('transparent')]},
        {name: _('Graphical indication'), val: sGrapI, values: noyes},
        {name: _('Position shift -10 seconds after pause'), val: s10resum, values: noyes},
        {name: _('Remember previous channels'), val: sPrevCount, values: [1,5,10,15,20]},
        {name: _('History in Media Library'), val: sMedCount, values: [_('no'),10,20,30,40,50]},
        {name: _('Editor'), val: sEditor, values: [_('built-in'), _('native')]},
        {name: _('Type of player for streaming'), val: sPlayers},
        {name: _('Buffer Size, s'), val: sBufSize},
        {name: '', val: 0, values: nofun, cur: ''},
        {name: '<div class="btn">'+_('Save Settings')+'</div>', val: 0, values: _save, cur: ''}
    ];
    if(typeof(stbSetBuffer) !== "function") listArray.splice(18, 1);
    else listArray[18].values = stbBufferSizes;
    if((typeof stbPlayers !== 'undefined') && Array.isArray(stbPlayers))
         listArray[17].values = stbPlayers;
    else
        listArray.splice(17, 1);
    if(typeof(showEditKey2) !== "function") listArray.splice(16, 1);
    if(typeof(getMediaArray) !== "function") listArray.splice(15, 1);
    if(typeof(stbGetVolume) !== "function") listArray.splice(7, 1);
    if(typeof(stbSetOsdOpacity) !== "function") listArray.splice(6, 1);
    if(typeof(stbPlayPip) !== "function") listArray.splice(1, 2);
    eSHLcolor = sSHLcolor;
    eSHLcolorB = sSHLcolorB;
    eSHLcolSel = sSHLcolSel;
    listCaption.innerHTML = _('Interface settings');
    _setSetup(_save, function(){ optionsList(settingsInterface); });
}
function settingsInfobar(){
    function _save(){
        var i = 0;
        if(sInfoTimeout != listArray[i++].val+3) {sInfoTimeout = listArray[i-1].val+3; stbSetItem('sInfoTimeout', sInfoTimeout);}
        saveIfChanged(i++, 'sInfoSlide', true);
        saveIfChanged(i++, 'sInfoSwitch', true);
        saveIfChanged(i++, 'sInfoChange', true);
        saveIfChanged(i++, 'sInfoRew', true);
        saveIfChanged(i++, 'sThumbnail', true);
        showShift(_('Settings saved'));
        closeList();
        optionsList(settingsInfobar);
    }
    var noyes = [_('no'),_('yes')];
    listArray = [
        {name: _('Infobar display timeout, s'), val: sInfoTimeout-3, values: [3, 4, 5, 6, 7, 8, 9, 10]},
        {name: _('"Sliding" infobar'), val: sInfoSlide, values: noyes},
        {name: _('Show when switching'), val: sInfoSwitch, values: noyes},
        {name: _('Show when changing program'), val: sInfoChange, values: noyes},
        {name: _('Show when rewind'), val: sInfoRew, values: noyes},
        {name: _('Show thumbnails'), val: sThumbnail, values: noyes},
        {name: '', val: 0, values: nofun, cur: ''},
        {name: '<div class="btn">'+_('Save Settings')+'</div>', val: 0, values: _save, cur: ''}
    ];
    listCaption.innerHTML = _('Infobar settings');
    _setSetup(_save, function(){ optionsList(settingsInfobar); });
}

function settingsLists(){
    function _save(){
        var i = 0;
        saveIfChanged(i++, 'sNoSmall', true);
        if(sPageSize != listArray[i++].val+10) {sPageSize = listArray[i-1].val+10; stbSetItem('sPageSize', sPageSize);}
        saveIfChanged(i++, 'sFontShift', true);
        saveIfChanged(i++, 'sListPos', true);
        saveIfChanged(i++, 'sShowScroll', true);
        setFontSize();
        setListPos();
        setColor();
        showShift(_('Settings saved'));
        closeList();
        optionsList(settingsLists);
    }
    var noyes = [_('no'),_('yes')];
    listArray = [
        {name: _('Not reduce video when showing the list (bugfix)'), val: sNoSmall, values: noyes},
        {name: _('Number of rows in lists'), val: sPageSize-10, values: [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]},
        {name: _('Distance between lines in lists'), val: sFontShift, values: ['0',1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]},
        {name: _('List location'), val: sListPos, values: [_('right'), _('left')]},
        {name: _('Show scrollbar in list'), val: sShowScroll, values: noyes},
        {name: '', val: 0, values: nofun, cur: ''},
        {name: '<div class="btn">'+_('Save Settings')+'</div>', val: 0, values: _save, cur: ''}
    ];
    listCaption.innerHTML = _('Lists settings');
    _setSetup(_save, function(){ optionsList(settingsLists); });
}
function settingsChannels(){
    function _save(){
        var i = 0;
        saveIfChanged(i++, 'sShowNum');
        saveIfChanged(i++, 'sShowPikon');
        saveIfChanged(i++, 'sShowName');
        saveIfChanged(i++, 'sShowProgram');
        saveIfChanged(i++, 'sShowProgress');
        saveIfChanged(i++, 'sShowArchive');
        saveIfChanged(i++, 'sShowDescr');
        saveIfChanged(i++, 'sPreview');
        // saveIfChanged(i++, 'sNextCount');
        if(sNextCountL != listArray[i++].val) {sNextCountL = listArray[i-1].val; sNextCount = sNextCountL?sNextCountL-1:0; providerSetItem('sNextCount', sNextCountL-1); }
        saveIfChanged(i++, 'sFavorites', true);
        showShift(_('Settings saved'));
        closeList();
        optionsList(settingsChannels);
    }
    var noyes = [_('no'),_('yes')];
    listArray = [
        {name: _('Show channel number in list'), val: sShowNum, values: noyes},
        {name: _('Show picons in channel list'), val: sShowPikon, values: [_('no'), '1x1', '3x4']},
        {name: _('Show channel name in list'), val: sShowName, values: noyes},
        {name: _('Show program name'), val: sShowProgram, values: noyes},
        {name: _('Show progress in channel list'), val: sShowProgress, values: noyes},
        {name: _('Show archive availability in list'), val: sShowArchive, values: noyes},
        {name: _('Show description'), val: sShowDescr, values: noyes},
        {name: _('Preview in channel list'), val: sPreview, values: [_('no'),_('always'),_('on ')+strENTER]},
        {name: _('Number of next TV programs in channel list'), val: sNextCountL, values: [_('no'),1,2,3,4,5,6,7,8,9,10]},
        {name: _('Channel list editing style'),
            val: sFavorites!=-1? sFavorites: nofun,
            values: sFavorites!=-1? [_('All categories'), _('"Favorites"')]: '<span style="color:gray;">'+_('"Favorites"')+'</span>'
        },
        {name: '', val: 0, values: nofun, cur: ''},
        {name: '<div class="btn">'+_('Save Settings')+'</div>', val: 0, values: _save, cur: ''}
    ];
    listCaption.innerHTML = _('Channel list settings');
    _setSetup(_save, function(){ optionsList(settingsChannels); });
}
function settingsButtons(){
    function _save(){
        var i = 0;
        saveIfChanged(i++, 'sArrowFun', true);
        if(keys.RW) saveIfChanged(i++, 'sRewFun', true);
        if(keys.PREV) saveIfChanged(i++, 'sPNFun', true);
        saveIfChanged(i++, 'sALfun', true);
        saveIfChanged(i++, 'sARfun', true);
        saveIfChanged(i++, 'sAUfun', true);
        saveIfChanged(i++, 'sADfun', true);
        if(keys.RW) saveIfChanged(i++, 'sRWfun', true);
        if(keys.RW) saveIfChanged(i++, 'sFFfun', true);
        if(keys.PREV) saveIfChanged(i++, 'sPREVfun', true);
        if(keys.PREV) saveIfChanged(i++, 'sNEXTfun', true);
        if(!sNoColorKeys){
            saveIfChanged(i++, 'sRfun', true);
            saveIfChanged(i++, 'sGfun', true);
            saveIfChanged(i++, 'sYfun', true);
            saveIfChanged(i++, 'sBfun', true);
        }
        saveIfChanged(i++, 'sEfun', true);
        saveIfChanged(i++, 'sOkfun', true);
        if(!sNoNumbersKeys){
            listArray[i].val = arr13[listArray[i].val]; saveIfChanged(i++, 's13dur', true);
            listArray[i].val = arr13[listArray[i].val]; saveIfChanged(i++, 's46dur', true);
            listArray[i].val = arr13[listArray[i].val]; saveIfChanged(i++, 's79dur', true);
        }
        saveIfChanged(i++, 'sNoColorKeys', true);
        saveIfChanged(i++, 'sNoNumbersKeys', true);
        showShift(_('Settings saved'));
        closeList();
        optionsList(settingsButtons);
    }
    var noyes = [_('no'),_('yes')], bb = 'Behavior of %1/%2 buttons in lists', sb = 'Button %1 function when viewing', rb = 'Rewind step by buttons %1/%2',
        d1 = '<div class="btn', db = d1+'">', dd = '</div>', dc = '">&nbsp;'+dd,
        arrBeh = [_('paging'), _('volume'), 'dune-php', 'neutrino'],
        gyFuns = [_('Records'),_('Menu'),_('Previous'),_('Rewind'),_('Info'),_('Aspect'),_('Audio'), 'PiP', _('Close PiP'), _('Category'), _('EPG'), _('Media'),_('Joystick'),'V+','V-','P+','P-',_('Subtitle'),'-1 '+_(' m ').trim(),'+1 '+_(' m ').trim(),_('Prev'),_('Next')],
        arr13 = [5,10,15,20,30,60,120,180,240,300,600,900,1200,1800,3600], arr13r = [], i13 = arr13.indexOf(s13dur), i46 = arr13.indexOf(s46dur), i79 = arr13.indexOf(s79dur);
    if(typeof(stbToggleAspectRatio)!=='function') gyFuns[5] = '@@@';
    if(typeof(stbToggleAudioTrack)!=='function') gyFuns[6] = '@@@';
    if(typeof(stbPlayPip) !== "function"){ gyFuns[7] = '@@@'; gyFuns[8] = '@@@'; }
    if(typeof(stbGetVolume)!=='function'){ gyFuns[13] = '@@@'; gyFuns[14] = '@@@'; arrBeh[1] = '@@@'; }
    if(typeof(stbToggleSubtitle)!=='function') gyFuns[17] = '@@@';
    arr13.forEach(function(item){ arr13r.push(step2text(item).substr(2).trim()); });
    listArray = [
        {name: _(bb, db+strLEFT+dd, db+strRIGHT+dd), val: sArrowFun, values: arrBeh},
        {name: _(bb, db+strRW+dd, db+strFF+dd), val: sRewFun, values: [_('paging'), 'dune-php', 'neutrino']},
        {name: _(bb, db+strPREV+dd, db+strNEXT+dd), val: sPNFun, values: [_('paging'), 'dune-php', 'neutrino', _('begin/end')]},
        {name: _(sb, db+strLEFT+dd), val: sALfun, values: gyFuns},
        {name: _(sb, db+strRIGHT+dd), val: sARfun, values: gyFuns},
        {name: _(sb, db+strUP+dd), val: sAUfun, values: gyFuns},
        {name: _(sb, db+strDOWN+dd), val: sADfun, values: gyFuns},
        {name: _(sb, db+strRW+dd), val: sRWfun, values: gyFuns},
        {name: _(sb, db+strFF+dd), val: sFFfun, values: gyFuns},
        {name: _(sb, db+strPREV+dd), val: sPREVfun, values: gyFuns},
        {name: _(sb, db+strNEXT+dd), val: sNEXTfun, values: gyFuns},
        {name: _(sb, d1+' red'+dc), val: sRfun, values: gyFuns},
        {name: _(sb, d1+' green'+dc), val: sGfun, values: gyFuns},
        {name: _(sb, d1+' yellow'+dc), val: sYfun, values: gyFuns},
        {name: _(sb, d1+' blue'+dc), val: sBfun, values: gyFuns},
        {name: _(sb, db+strRETURN+dd), val: sEfun, values: [_('Nothing'),_('Exit'),_('Joystick'),_('Menu'),_('Previous')]},
        {name: _('Button function %1 when viewing archive', db+strENTER+dd), val: sOkfun, values: [_('EPG'),_('Channels')]},
        {name: _(rb, db+1+dd, db+3+dd), val: i13, values: arr13r},
        {name: _(rb, db+4+dd, db+6+dd), val: i46, values: arr13r},
        {name: _(rb, db+7+dd, db+9+dd), val: i79, values: arr13r},
        {name: _('Remote (color buttons N/A)'), val: sNoColorKeys, values: noyes},
        {name: _('Remote (number buttons N/A)'), val: sNoNumbersKeys, values: noyes},
        {name: '', val: 0, values: nofun, cur: ''},
        {name: db+_('Save Settings')+dd, val: 0, values: _save, cur: ''}
    ];
    if(sNoNumbersKeys) listArray.splice(17, 3);
    if(sNoColorKeys) listArray.splice(11, 4);
    if(!keys.PREV) listArray.splice(9, 2);
    if(!keys.RW) listArray.splice(7, 2);
    if(!keys.PREV) listArray.splice(2, 1);
    if(!keys.RW) listArray.splice(1, 1);
    listCaption.innerHTML = _('Buttons settings');
    _setSetup(_save, function(){ optionsList(settingsButtons); });
}
var sHideMenus = [];
function settingsMenu(){
    function _save(){
        sHideMenus = [];
        for (var i = 0; i < popupActions.indexOf(noProvParam); i++){
            if(listArray[i].val) sHideMenus.push(popupActions[i].name);
        }
        // console.log(sHideMenus);
        stbSetItem('sHideMenus', sHideMenus.join(','));
        showShift(_('Settings saved'));
        optionsList(settingsMenu);
    }
    var yesno = [_('yes'),_('no')];
    listArray = [];
    for (var i = 0; i < popupActions.indexOf(noProvParam); i++){
        listArray.push({name: _(popupArray[i]), val: sHideMenus.indexOf(popupActions[i].name)==-1?0:1, values: yesno});
    }
    listArray.push({name: '', val: 0, values: nofun, cur: ''});
    listArray.push({name: '<div class="btn">'+_('Save Settings')+'</div>', val: 0, values: _save, cur: ''});
    listCaption.innerHTML = _('Select menu items');
    _setSetup(_save, function(){ optionsList(settingsMenu); });
}
function settingsManage(){
    function clearsettings(){ confirmBox('Clear all settings?', function(){ try{ stbClearAllItems() }catch(e){}; restart(); } ); }
    listArray = [
        {action:sendSettings, name:_('Save settings')},
        {action:loadSettings, name:_('Load settings')},
        {action:nofun, name:''},
        {action:clearsettings, name:_('Clear settings')},
        {action:nofun, name:''},
        {action:edit_dealer, name:_('Enter Provider Code')},
        {action:edit_dealer_remote, name:_('Enter Provider Code on PC or Phone')},
    ];
    if(typeof(stbClearAllItems) !== "function") listArray.splice(2, 2);
    if(typeof(stbGetAllItems) !== "function") listArray.splice(0, 1);
    if(typeof(loadOpt) === "function") listArray.splice(0, 0, {action:loadOpt, name:_('Load settings from storage')});
    if(typeof(saveOpt) === "function") listArray.splice(0, 0, {action:saveOpt, name:_('Save settings to storage')});
    selIndex = 0;
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+item.name; };
    detailListAction = function(){ listDetail.innerHTML = _(listArray[selIndex].desc || listArray[selIndex].name || ''); };
    listKeyHandler = function(code){
        switch(code){
    		case keys.RETURN: optionsList(settingsManage); return true;
            case keys.ENTER: if(listArray[selIndex].action) listArray[selIndex].action(); return true;
        }
        return false;
    };
    listCaption.innerHTML = _('Manage settings');
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
    $('#listPopUp').hide();
    showPage();
}
var __test = '';

function sendSettings(){
    function _close(){ clearTimeout(_timeout); $('#listAbout').hide(); }
    var _timeout = setTimeout( _close, 600000);
    $('#listAbout').html('<div style="text-align:center;font-size:larger;"><br/><br/>'+_('Send settings')+'...</div>').show();
    aboutKeyHandler = function(code){ if(code==keys.RETURN||code==keys.EXIT) _close(); return true; }
    var s = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">\n<properties>\n<comment>OTT-Play Preferences</comment>';
    var ii = stbGetAllItems();
    for (prop in ii) {
        if (hasOwnProperty.call(ii, prop)) s += '\n<entry key="'+prop+'">'+ii[prop]+'</entry>';
    }
    s += '\n</properties>';
    $.ajax({
        url: host_ott+'/swop/a.php', data: {c:'send', d: s}, type: 'POST', timeout: 10000, cache: false,
        success: function(json){
            $('#listAbout').html(
                '<div style="text-align:center;font-size:larger;"><br/>'+_('Settings sended!')+'<br/><br/>'+
                _('For download settings file open')+'<br/><span style="font-size:larger;color:'+curColor+'">'+__test+'ott-play.com/swop</span> '+_('and enter code')+' <span style="font-size:larger;color:'+curColor+'">'+json.code+'</span><br/><br/>'+
                _('or scan')+':<br/><br/>'+
                '<div><img src="https://chart.googleapis.com/chart?cht=qr&chs=300x300&chld=|1&chl=https://'+__test+'ott-play.com/swop/?'+json.code+'" style="height:30%;"/></div>'+
                '</div>'
            )
        },
        error: function(jqXHR){
            // console.log('Error :'+JSON.stringify(jqXHR));
            $('#listAbout').html('<div style="text-align:center;font-size:larger;color:red"><br/><br/>ERROR:<br/>'+jqXHR.responseText+'</div>');
        },
    });
}

function loadSettings(){
    var _break = false, _code;
    function _close(){ clearTimeout(_timeout); _break = true; $('#listAbout').hide(); }
    var _timeout = setTimeout( _close, 600000);
    function get_settings(){
        if(_break) return;
        $.ajax({
            url: host_ott+'/swop/a.php',
            data: {c:'get', d: _code}, type: 'POST', timeout: 10000, cache: false,
            success: function(json){
                if(_break) return;
                // console.log(json)
                if(json.status === 'forbidden') setTimeout(get_settings, 5000)
                // else if(json.status === 'error') get_code()
                else if (json.status === 'success') {
                    var s = json.data;
                    if(s.indexOf('<comment>OTT-Play Preferences</comment>')!=-1){
                        $('#listAbout').html('<div style="text-align:center;font-size:200%;"><br/><br/>OTT-Play Preferences received!<br/>Restart player...</div>');
                        var kk = s.split('<entry key="');
                        kk.shift();
                        try{ stbClearAllItems(); }catch(e){}
                        kk.forEach(function(val){
                            val = val.split('</entry>')[0].split('">');
                            stbSetItem(val[0], val[1]);
                        });
                        restart();
                    } else $('#listAbout').html('<div style="text-align:center;font-size:larger;color:red"><br/><br/>ERROR:<br/>File not OTT-Play Preferences!!!</div>');
                }
            }
        })
    }
    $('#listAbout').html('<div style="text-align:center;font-size:larger;"><br/><br/>'+_('Send request')+'...</div>').show();
    aboutKeyHandler = function(code){ if(code==keys.RETURN||code==keys.EXIT){ _close(); } return true; }
    $.ajax({
        url: host_ott+'/swop/a.php', data: {c:'get_code'}, type: 'POST', timeout: 10000, cache: false,
        success: function(json){
            _code = json.code;
            $('#listAbout').html(
                '<div style="text-align:center;font-size:larger;"><br/>'+_('Request sended!')+'<br/><br/>'+
                _('For upload settings file open')+'<br/><span style="font-size:larger;color:'+curColor+'">'+__test+'ott-play.com/swop</span> '+_('and enter code')+' <span style="font-size:larger;color:'+curColor+'">'+_code+'</span><br/><br/>'+
                _('or scan')+':<br/><br/>'+
                '<div><img src="https://chart.googleapis.com/chart?cht=qr&chs=300x300&chld=|1&chl=https://'+__test+'ott-play.com/swop/?'+_code+'" style="height:30%;"/></div>'+
                '</div>'
            );
            // get_settings();
            setTimeout(get_settings, 10000);
        },
        error: function(jqXHR){
            // console.log('Error :'+JSON.stringify(jqXHR));
            $('#listAbout').html('<div style="text-align:center;font-size:larger;color:red"><br/><br/>ERROR:<br/>'+jqXHR.responseText+'</div>');
        },
    });
}
var _curVal;
function clickVal(ind){
    event.stopPropagation();
    if(_curVal==ind) aboutKeyHandler(keys.ENTER);
    $('#ik'+_curVal).css({"background-color": '', "color": ''});
    _curVal=ind;
    $('#ik'+_curVal).css({"background-color": curColorB, "color": curColor});
}
function selectValue(item){
    var _curValues;
    function changeSel(val){
        $('#ik'+_curVal).css({"background-color": '', "color": ''});
        _curVal+=val;
        $('#ik'+_curVal).css({"background-color": curColorB, "color": curColor});
        listDetail.innerHTML = _curValues[_curVal];
    }
    saveCPD();
    _curValues = item.values.filter(function(v){return v!='@@@'});
    _curVal = _curValues.indexOf(item.values[item.val]);
    listCaption.innerHTML = item.name;
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')+btnDiv(keys.ENTER, strENTER, 'Set');
    listDetail.innerHTML = '';
    var itL = 6, mw = 0, $t = $('#testFont'), s = item.name+':<br/>'; // _('Choose from')
    for (var i = 0; i < _curValues.length; i++){
        $t.html('&nbsp;'+_curValues[i]+'&nbsp;');
        mw = mw>$t.width()? mw : $t.width();
        $t.text('');
    }
    itL =  Math.max(Math.min(Math.round( $('#listAbout').width()/mw)-1, _curValues.length), Math.round(_curValues.length/6)+1);
    for (var i = 0; i < _curValues.length; i++){
        if(i % itL == 0) s += '<br/>';
        s += '<div id="ik'+i+'" onclick="clickVal('+i+');" style="display:inline-block;width:'+98/itL+'%;overflow:hidden;text-align:center;vertical-align:middle;line-height:'+(800*getHeightK()/pageSize)+'px;">'+_curValues[i]+'</div>';
    }
    $('#listAbout').html('<div style="font-size:larger;">'+s+'</div>').show();
    $('#ik'+_curVal).css({"background-color": curColorB, "color": curColor});
    listDetail.innerHTML = _curValues[_curVal];
    aboutKeyHandler = function(code){
        switch (code) {
            case keys.UP: changeSel(_curVal>itL-1? -itL: _curValues.length-_curValues.length%itL+(_curVal+1>_curValues.length%itL?-itL:0)); return;
            case keys.DOWN: changeSel(_curVal<_curValues.length-itL?itL:-_curVal+_curVal%itL); return;
    		case keys.LEFT: changeSel(_curVal%itL>0?-1:(_curVal+itL-1>_curValues.length-1?_curValues.length-_curVal-1:itL-1)); return;
            case keys.RIGHT: changeSel(_curVal%itL<itL-1?(_curVal+1==_curValues.length?-_curVal%itL:1):-itL+1); return;
            case keys.ENTER: item.val = item.values.indexOf(_curValues[_curVal]);
            case keys.RETURN: $('#listAbout').text('').hide(); restoreCPD(); showPage(); return;
            default: return;
        }
    }
}
function _setSetup(onsave, oncancel){
    selIndex = 0;
    getListItem = function(item, i){
    	return '<div style="float:right; width:23%; overflow:hidden; text-align:right;">' + (item.values[item.val] || item.cur)  + '&nbsp;&nbsp;</div>' +
    	       '<div style="float:left; width:75%; overflow:hidden;">&nbsp;&nbsp;'+ item.name + '</div>';
    };
    listDetail.innerHTML = '';
    detailListAction = function(){
        var s = listArray[selIndex];
        listDetail.innerHTML = (Array.isArray(s.values) ? s.name+'<br/><br/>'+_('Choose from')+':<br/>'+s.values.filter(function(v){return v!='@@@'}).join(', ') : s.cur)
            +(s.desc?'<br/><br/>'+s.desc:'');
        // listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')+
        //     (Array.isArray(s.values) ? btnDiv(keys.ENTER, strENTER, 'Change value', strLEFT, strRIGHT) : s.cur ? btnDiv(keys.ENTER, strENTER, 'Change value') : '')
        //     +btnDiv(keys.GREEN, '', 'Save Settings', strPlayPause, '0');
    };
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')+btnDiv(keys.ENTER, strENTER, 'Change value', strLEFT, strRIGHT)+btnDiv(keys.GREEN, '', 'Save Settings', strPlayPause, '0');
    listKeyHandler = function(code){
        var s = listArray[selIndex];
        switch(code){
            case keys.ENTER: if(typeof(s.values) === "function") s.values();
                             if(Array.isArray(s.values)&&s.values.length>2){ selectValue(s); return true;}
            case keys.RIGHT: if(Array.isArray(s.values)){ s.val = (s.val > s.values.length-2) ? 0 : s.val+1; if(s.values[s.val]=='@@@') listKeyHandler(code); else showPage(); }
                             return true;
            case keys.LEFT: if(Array.isArray(s.values)){ s.val = (s.val == 0) ? s.values.length-1 : s.val-1; if(s.values[s.val]=='@@@') listKeyHandler(code); else showPage(); }
                            return true;
            case keys.N0:
            case keys.PLAY:
            case keys.PAUSE:
    		case keys.GREEN: onsave(); return true;
            case keys.RETURN: oncancel(); return true;
        }
        return false;
    };
    showPage();
}

function toggleMute(){
    if(typeof(stbToggleMute) !== "function") return;
	stbToggleMute();
	$('#mute').toggle();
}

var volumeTimeout = null;
function changeVolume(val){
	if(typeof(stbGetVolume) !== "function") return;
	var value = stbGetVolume() + val;
	value = Math.max(value, 0);
	value = Math.min(value, 100);
	stbSetVolume(value);
    _showVolume(value);
}
function _showVolume(value){
	$('#volume').css('height', (100 - value) + '%');
	$('#volume_div').show();
	$('#mute').hide();
	clearTimeout(volumeTimeout);
	volumeTimeout = setTimeout(function(){ $('#volume_div').hide();	}, 2000);
}

var pipIndex = null, pipCatIndex = null;
function togglePip(){
    if (pipIndex == null) {
        pipIndex = primaryIndex;
        pipCatIndex = catIndex;
        stbPlayPip(getChannelUrl(curList[pipIndex]));
    } else {
        if((pipCatIndex == catIndex) && (pipIndex == primaryIndex))
            return;
        var p = pipIndex;
        var c = pipCatIndex;
        pipIndex = primaryIndex;
        pipCatIndex = catIndex;

        playChannel(c, p);
        stbPlayPip(getChannelUrl(cats[catsArray[pipCatIndex]][pipIndex]));
    }
}
function showShift(mess){
    numProg.innerHTML = mess;
    numProg.style.display = '';
    clearTimeout(numTimeout);
    numTimeout = setTimeout(function(){ numProg.style.display = 'none'; }, 3000);
}

function showSelectBox(val, arr, fun, t){
    clearTimeout(numTimeout);
    if(arr.length==0) return;
    if(arr.length==1){ showShift(arr[0]); return; }
    if(typeof t === 'undefined') t = 3000;
    function _set(s){
        if(s === arr.length) val = 0;
        else if(s < 0) val = arr.length-1;
        else val = s;
        if(t) fun(val);
        var h = '';
        arr.forEach(function(v, i){
            h += '<div style="'+(i==val?'color:'+curColor+';background-color:'+curColorB:'')+'" onclick="_doKey(' + (-100+i) + ');">&nbsp;&nbsp;'+v+'&nbsp;&nbsp;</div>';
        });
        numProg.innerHTML = h;
        if(t) numTimeout = setTimeout(function() { numProg.style.display = 'none'; selectBoxKeyHandler = null; }, t);
    }
    closeList();
    if(t==-1){ t=0; _set(val); }
    else if(t) _set(val+1);
    else{ _set(val); numTimeout = setTimeout(function() { fun(val); numProg.style.display = 'none'; selectBoxKeyHandler = null; }, 2000); }
    numProg.style.display = '';
    selectBoxKeyHandler = function(code){
        clearTimeout(numTimeout);
        switch (code) {
            case keys.ENTER: if(!t) fun(val);
            case keys.RETURN: numProg.style.display = 'none'; selectBoxKeyHandler = null; return true;
            case keys.UP: _set(val-1); return true;
            case keys.DOWN: _set(val+1); return true;
            case keys.LEFT: _set(0); return true;
            case keys.RIGHT: _set(arr.length-1); return true;
            default:
                var cc = 100+code;
                if(cc<0 || cc>arr.length-1) return false;
                if(cc==val) selectBoxKeyHandler(keys.ENTER);
                else _set(cc);
                return true;
        }
    }
}
function _ch_id(aName){
    if(playType==-100000000000) // media
        if(aName=='aAspects'||aName=='aZooms') return '-1media'; // aspect or zoom
        else return null;
    return curList[primaryIndex];
}
function getCHarr(aName){
    if(typeof(aName)!='string') return 0;
    var ch_id = _ch_id(aName);
    if(ch_id==null) return 0;
    var a = window[aName][ch_id];
    if(typeof(a)=='undefined') return 0;
    return a;
};
function execCHarr(aName, execut){
    if(typeof(aName)!='string') return;
    if(typeof(execut)!='function') return;
    var ch_id = _ch_id(aName);
    if(ch_id==null) return;
    var a = window[aName][ch_id];
    if(typeof(a)=='undefined')
        if(aName=='aAspects'||aName=='aZooms') a = 0; // aspect or zoom
        else return;
    // if((list.style.display!='none') && !sNoSmall && (aName=='aAspects'||aName=='aZooms')) return; // aspect or zoom in lists
    try{ execut(a); }catch(e){}
}
function saveCHarr(aName, val){
    if(typeof(aName)!='string') return;
    if(typeof(window[aName])!='object' || window[aName]==null) window[aName] = {};
    var ch_id = _ch_id(aName);
    if(ch_id==null) return;
    if(!val){
        if(typeof(window[aName][ch_id])=='undefined') return;
        else delete window[aName][ch_id];
    }else{
        if(val==window[aName][ch_id]) return;
        else window[aName][ch_id] = val;
    }
    setTimeout( function(){ providerSetItem(aName, JSON.stringify(window[aName])); });
    // log("info", 'save '+val+' ch_id '+ch_id+' '+aName+' '+JSON.stringify(window[aName]));
}
var _shiftTimer = null, _shiftSec = 0;
function shiftArchive(sec){
    if(sec == -6000000){ _shiftSec = sec; _shiftArchive(); }
    _shiftSec += sec;
    clearTimeout(_shiftTimer);
    if(sInfoRew) showChanelInfo(1);
    showShift(step2text(_shiftSec));
    _shiftTimer = setTimeout(_shiftArchive, 500);
}
function _shiftArchive(){
    var sec = _shiftSec;
    _shiftSec = 0;
    clearTimeout(_shiftTimer);
    if(!sec) return;
    if(!playType){ // из прямого эфира
        if(sec<0) timeShift(-sec);
        else {
            showShift(_('Restart stream'));
            playChannel(catIndex, primaryIndex);
        }
        return;
    }
    function showS(){
        if(sec == -6000000) showShift(_('To begining'));
        else
            showShift(step2text(sec));
    }
    if(playType < 0){ // media play
        var nt = Math.max(stbGetPosTime()+sec, 0);
        if(nt > stbGetLen()) return;
        stbSetPosTime(nt);
        showS();
        if(sInfoRew) showChanelInfo(1);
        return;
    }
    playType += sec + playTime;
    // alert(playType +':'+ sec +':' + playTime+':'+Date.now()/1000);
    if(playType < (Date.now()/1000)) {
        showS();
        playArchive(playType);
    } else {
        showShift(_('Live'));
        playChannel(catIndex, primaryIndex);
    }
}
function step2text(step){
    var m = Math.floor(Math.abs(step)/60), s = Math.abs(step) % 60;
    return !step ? '&nbsp;' : ((step>0) ? '>> ' : '<< ') + (m ? m + _(' m ') : '') + (s ? s + _(' s') : '');
}
function shiftArchiveSelect(sec){
    if(!playType && !chanels[curList[primaryIndex]].rec) return;
    var step = 0;
    var shiftTimeout = null;
    function showStep(add){
        clearTimeout(shiftTimeout);
        step += add;
        $('#step').html(step2text(step));
        shiftTimeout = setTimeout(function(){ $('#dialogbox').hide(); tooltip.style.display = ''; shiftArchive(step); }, 3000);

        if(!sInfoRew) return;
        setTimeout(function(){
            if(playType < 0){ // media play
                var nos = Math.max(Math.round(stbGetPosTime()+step),0), l = stbGetLen();
                var h = Math.floor(nos/3600), m = Math.floor(nos%3600/60), s = nos%60;
                $tooltipSpan.text((h?h+':':'')+_t2(m)+':'+_t2(s));
            } else if(!playType){
                var nos = Math.round(Date.now()/1000-_prog100.time+step), l = _prog100.time_to-_prog100.time;
                $tooltipSpan.text(pos2text(Date.now()/1000+step));
            } else {
                var nos = Math.round(playType+playTime-_prog100.time+step), l = _prog100.time_to-_prog100.time;
                $tooltipSpan.text(pos2text(playType+playTime+step));
            }
            tooltip.style.display = 'block';
            tooltip.style.top = ($progress_div.offset().top - $progress_div.height()) + 'px';
            tooltip.style.left = Math.min(Math.max(($progress_div.position().left+nos/l*$progress_div.width() - tooltip.offsetWidth/2),20),$progress_div.position().left+$progress_div.width()+10) + 'px';
        });
    }
    $('#dialogbox').html(_('Rewind')+':<br/><span id="step" style="font-size: 150%;"></span><br/>'+
        '<br><div class="btn" onclick="_doKey(keys.UP);">'+strUP+'</div>&nbsp;<div class="btn" onclick="_doKey(keys.DOWN);">'+strDOWN+'</div>&nbsp;+/- '+_('1 minute')+'&nbsp;&nbsp;'+
        '<div class="btn" onclick="_doKey(keys.LEFT);">'+strLEFT+'</div>&nbsp;<div class="btn" onclick="_doKey(keys.RIGHT);">'+strRIGHT+'</div>&nbsp;+/- '+_('10 Seconds')+
        '<br/>'+btnDiv(keys.ENTER, strENTER, 'Go to')+btnDiv(keys.RETURN, strRETURN, 'Close')
    ).show();
    if(sInfoRew) showChanelInfo(1);
    showStep(sec);
    dialogBoxKeyHandler = function(code){
        switch (code) {
            case keys.N1: showStep(-s13dur); return;
            case keys.N3: showStep(s13dur); return;
            case keys.N4: showStep(-s46dur); return;
            case keys.N6: showStep(s46dur); return;
            case keys.N7: showStep(-s79dur); return;
            case keys.N9: showStep(s79dur); return;
            case keys.FF:
            case keys.UP: showStep(60); return;
            case keys.RW:
            case keys.DOWN: showStep(-60); return;
            case keys.RIGHT: showStep(10); return;
            case keys.LEFT: showStep(-10); return;
            case keys.EXIT:
            case keys.RETURN: $('#dialogbox').hide(); infoBarHide(); tooltip.style.display = ''; clearTimeout(shiftTimeout); return;
            case keys.ENTER: $('#dialogbox').hide(); clearTimeout(shiftTimeout); shiftArchive(step); tooltip.style.display = ''; return;
            default: return;
        }
    }
}

function timeShift(shift){
    var ch_id = curList[primaryIndex];
    if(!chanels[ch_id].rec) return;
    getEPGchanelCached(ch_id, function(ch_id, data){
        if((data !== null) && (data.length)){
            var epg = data.filter(function(val){
                return val.time > (Date.now()/1000 - chanels[ch_id].rec*60*60);
            }).sort(function (a, b) {
                return a.time - b.time;
            });
        }
        epgArray = epg;
        setCurProg(ch_id, data, null);
        setCurrent(catIndex, primaryIndex, true);

        if(shift){
            showShift(step2text(-shift));
            playArchive(Math.round(Date.now()/1000) - shift);
        } else {
            showShift(_('Archive - begin'));
            var cur = epgArray.findIndex(function(element, index, array){
                return (element.time_to >= Date.now()/1000) && (element.time <= Date.now()/1000);
            });
            playArchive(epgArray[cur].time);
        }
    });
}

function liveStop(){
    if(!stbIsPlaying()) return;
    var ch_id = curList[primaryIndex];
    if(!chanels[ch_id].rec) return;
    getEPGchanelCached(ch_id, function(ch_id, data){
        if((data !== null) && (data.length)){
            var epg = data.filter(function(val){
                return val.time > (Date.now()/1000 - chanels[ch_id].rec*60*60);
            }).sort(function (a, b) {
                return a.time - b.time;
            });
        }
        epgArray = epg;
        setCurProg(ch_id, data, null);

        playType = Math.round(Date.now()/1000);
        playTime = 0;
        showChanelInfo(2);
        showShift(_('Pause'));
        stbPause();
    });
}

var epgCash = 0, epgCashObj = {}, epgCashArr = [];
setInterval(function(){ epgCashObj = {}; epgCashArr = []; }, 43200000); // 12 часов
function getEpgFromCash(ch_id){
    // console.log('getEpgFromCash ', ch_id, epgCashObj, epgCashArr);
    epgCashArr.splice(epgCashArr.indexOf(ch_id), 1);
    epgCashArr.unshift(ch_id);
    return epgCashObj[ch_id];
}
function getEPGchanelCached(ch_id, callback){
    if(!epgCash){ getEPGchanel(ch_id, callback); return; }
    function epgBack(ch_id, data){
        // console.log('epgBack ', ch_id, epgCashObj, epgCashArr);
        epgCashObj[ch_id] = data;
        if(epgCashArr.unshift(ch_id)>epgCash)
            epgCashArr.splice(epgCash).forEach(function(val){ delete epgCashObj[val]; });
        callback(ch_id, getEpgFromCash(ch_id));
    }
    if(epgCashObj[ch_id])
        callback(ch_id, getEpgFromCash(ch_id));
    else
        getEPGchanel(ch_id, epgBack);
}
function getEPGchanelCurCached(ch_id, callback){
    if(!epgCash){ getEPGchanelCur(ch_id, callback); return; }
    if(epgCashObj[ch_id])
        callback(ch_id, getEpgFromCash(ch_id));
    else
        getEPGchanelCur(ch_id, callback);
}

function stbSetOsdOpacity(procent){
    var H = parseInt(sSHLcolorB.split(',')[0]), V = parseInt(sSHLcolorB.split(',')[1]);
    $('.osd').css( 'background-color', 'rgba('+hsvToRgb(H,100,V).join(',')+','+(procent/100)+')' );
}

function toggleZoom(){ if(typeof(stbToggleZoom) === "function") stbToggleZoom(); }
function toggleAspectRatio(){ if(typeof(stbToggleAspectRatio) === "function") stbToggleAspectRatio(); }
function toggleAudioTrack(){ if(typeof(stbToggleAudioTrack) === "function") stbToggleAudioTrack(); }
function toggleSubtitle(){ if(typeof(stbToggleSubtitle) === "function") stbToggleSubtitle(); }
function toggleStandby(){
    clearTimeout(sleepTimeout);
    $('#dialogbox').hide();
    stbStop();
    if(typeof(stbToggleStandby) === "function") stbToggleStandby();
    else stbExit();
}

var sleepTimeout = null, sleepingCount;
function sleeping(){
    if(!sleepingCount) { toggleStandby(); return; };
    $('#dialogbox').html(_('Shutdown after %1 seconds<br/><br/>Cancel - any action',sleepingCount)).show();
    sleepingCount--;
    sleepTimeout = setTimeout(sleeping, 1000);
}
function setSleepTimeout(){
    var TT = [0, 1800000, 3600000, 7200000, 10800000];
    clearTimeout(sleepTimeout);
    if(!sSleepTimeout) return;
    sleepTimeout = setTimeout(function() {
        dialogBoxKeyHandler = function(code){ $('#dialogbox').hide(); };
        sleepingCount = 60;
        sleeping();
    }, TT[sSleepTimeout]);
}

function _enterPinCode(prompt, callback){
    var enteredPin = '', sk = '', curKey = 0;
    function setKey(sh){
        $('#k'+curKey).css({"background-color": '', "color": ''});
        curKey = sh;
        if(curKey<0) curKey = 9; else if(curKey>9) curKey = 0;
        $('#k'+curKey).css({"background-color": curColorB, "color": curColor});
    }
    for (var i = 0; i < 10; i++) {
        var ii = i<9?i+1:0;
        sk += '<div id="k'+ii+'" style="display:inline-block;padding:6px;"><div class="btn" onclick="_doKey(keys.N'+ii+');">'+ii+'</div></div>';
    }
    $('#dialogbox').html(prompt+'<br/><br/><span id="pin" style="font-size: 200%;">&nbsp;</span><br><br>'+sk).show();
    setKey(1);
    dialogBoxKeyHandler = function (code){
        switch (code) {
            case keys.N0:
            case keys.N1:
            case keys.N2:
            case keys.N3:
            case keys.N4:
            case keys.N5:
            case keys.N6:
            case keys.N7:
            case keys.N8:
            case keys.N9:
                enteredPin += (code-48).toString();
                $('#pin').html('# # # # '.substr(0, enteredPin.length*2));
                if(enteredPin.length === 4){
                    $('#dialogbox').hide();
                    callback(enteredPin);
                }
                // setKey(code-48);
                return;
            case keys.RETURN: $('#dialogbox').hide(); callback(''); return;
            case keys.LEFT: setKey(curKey-1); return;
            case keys.RIGHT: setKey(curKey+1); return;
            case keys.UP: setKey(1); return;
            case keys.DOWN: setKey(0); return;
            case keys.ENTER: _doKey(keys.N0+curKey); return;
    	}
    }
}
function enterPinCode(prompt, callback){ _enterPinCode(prompt, callback); }

function exitPortal(){ confirmBox('Do you want to exit player?',
    function(){
        setCurrent(catIndex, primaryIndex);
        playType = 0;
        stbExit();
    });
}

/**
* HSV to RGB color conversion
*
* H runs from 0 to 360 degrees
* S and V run from 0 to 100
*
* Ported from the excellent java algorithm by Eugene Vishnevsky at:
* http://www.cs.rit.edu/~ncs/color/t_convert.html
*/
function hsvToRgb(h, s, v) {
    var r, g, b;
    var i;
    var f, p, q, t;

    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // That conversion here.
    s /= 100;
    v /= 100;

    if(s == 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }

    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch(i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;

        case 1:
            r = q;
            g = v;
            b = p;
            break;

        case 2:
            r = p;
            g = v;
            b = t;
            break;

        case 3:
            r = p;
            g = q;
            b = v;
            break;

        case 4:
            r = t;
            g = p;
            b = v;
            break;

        default: // case 5:
            r = v;
            g = p;
            b = q;
    }

    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];
}

function colorDialog(){
    var H = 50, S = 85;
    H = parseInt(eSHLcolor.split(',')[0]);
    S = parseInt(eSHLcolor.split(',')[1]);
    function showStep(dH, dS){
        H += dH;
        if(H>360) H = 0; else if(H<0) H = 360;
        S = Math.min(Math.max(S+dS, 0), 100);
        var crgb = hsvToRgb(H,S,100);
        $('#step').css('color', 'rgb('+crgb[0]+','+crgb[1]+','+crgb[2]+')');
    }
    saveCPD();
    listCaption.innerHTML = _('Color spectrum');
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')+btnDiv(keys.ENTER, strENTER, 'Set');
    listDetail.innerHTML = '';
    $('#listAbout').html('<div style="font-size:larger;">'+_('Color')+':<br/><br/>&nbsp;<span id="step" style="font-size: 150%;">&nbsp;1234567890&nbsp;<span style="background-color:'+curColorB+'">&nbsp;1234567890&nbsp;</span></span>&nbsp;<br/>'+
        '<br><div class="btn" onclick="_doKey(keys.LEFT);">'+strLEFT+'</div>&nbsp;<div class="btn" onclick="_doKey(keys.RIGHT);">'+strRIGHT+'</div>&nbsp;'+_('Color')+
        '<br><div class="btn" onclick="_doKey(keys.UP);">'+strUP+'</div>&nbsp;<div class="btn" onclick="_doKey(keys.DOWN);">'+strDOWN+'</div>&nbsp;'+_('Saturation')+
        '<br>'+btnDiv(keys.YELLOW, '', 'Yellow') + '<br>'+btnDiv(keys.GREEN, '', 'Green') + '<br>'+btnDiv(keys.BLUE, '', 'Blue') +
        // '<br><br/>'+btnDiv(keys.ENTER, strENTER, 'Set') + btnDiv(keys.RETURN, strRETURN, 'Close')+
        '</div>'
    ).show();
    showStep(0,0);
    aboutKeyHandler = function(code){
        switch (code) {
            case keys.UP: showStep(0,5); return;
            case keys.DOWN: showStep(0,-5); return;
            case keys.RIGHT: showStep(10,0); return;
            case keys.LEFT: showStep(-10,0); return;
            case keys.YELLOW: H = 50; S = 85; showStep(0,0); return;
            case keys.GREEN: H = 90; S = 85; showStep(0,0); return;
            case keys.BLUE: H = 180; S = 85; showStep(0,0); return;
            case keys.ENTER: eSHLcolor = H+','+S;
            case keys.RETURN: $('#listAbout').text('').hide(); restoreCPD(); return;
            default: return;
        }
    }
}
function selColorDialog(){
    var H = parseInt(eSHLcolSel.split(',')[0]), S = parseInt(eSHLcolSel.split(',')[1]);
    function showStep(dH, dS){
        H += dH;
        if(H>360) H = 0; else if(H<0) H = 360;
        S = Math.min(Math.max(S+dS, 0), 100);
        var crgb = hsvToRgb(H,S,50);
        $('#step').css('background-color', 'rgb('+crgb[0]+','+crgb[1]+','+crgb[2]+')');
    }
    saveCPD();
    listCaption.innerHTML = _('Background color of selected item');
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')+btnDiv(keys.ENTER, strENTER, 'Set');
    listDetail.innerHTML = '';
    $('#listAbout').html('<div style="font-size:larger;">'+_('Background color of selected item')+':<br/><br/>&nbsp;<span id="step" style="font-size: 150%;">&nbsp;1234567890&nbsp;<span style="color:'+curColor+'">1234567890</span>&nbsp;</span>&nbsp;<br/>'+
        '<br><div class="btn" onclick="_doKey(keys.LEFT);">'+strLEFT+'</div>&nbsp;<div class="btn" onclick="_doKey(keys.RIGHT);">'+strRIGHT+'</div>&nbsp;'+_('Color')+
        '<br><div class="btn" onclick="_doKey(keys.UP);">'+strUP+'</div>&nbsp;<div class="btn" onclick="_doKey(keys.DOWN);">'+strDOWN+'</div>&nbsp;'+_('Saturation')+
        '<br>'+btnDiv(keys.RED, '', 'Default', '0') +
        // '<br><br/>'+btnDiv(keys.ENTER, strENTER, 'Set') + btnDiv(keys.RETURN, strRETURN, 'Close')+
        '</div>'
    ).show();
    showStep(0,0);
    aboutKeyHandler = function(code){
        switch (code) {
            case keys.UP: showStep(0,5); return;
            case keys.DOWN: showStep(0,-5); return;
            case keys.RIGHT: showStep(10,0); return;
            case keys.LEFT: showStep(-10,0); return;
            case keys.N0:
            case keys.RED: H = 240; S = 25; showStep(0,0); return;
            case keys.ENTER: eSHLcolSel = H+','+S;
            case keys.RETURN: $('#listAbout').text('').hide(); restoreCPD(); return;
            default: return;
        }
    }
}
function backColorDialog(){
    var H = parseInt(eSHLcolorB.split(',')[0]), V = parseInt(eSHLcolorB.split(',')[1]);
    function showStep(dH, dV){
        H += dH;
        if(H>360) H = 0; else if(H<0) H = 360;
        V = Math.min(Math.max(V+dV, 0), 50);
        var crgb = hsvToRgb(H,100,V);
        $('#step').css('background-color', 'rgb('+crgb[0]+','+crgb[1]+','+crgb[2]+')');
    }
    saveCPD();
    listCaption.innerHTML = _('Background color');
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')+btnDiv(keys.ENTER, strENTER, 'Set');
    listDetail.innerHTML = '';
    $('#listAbout').html('<div style="font-size:larger;">'+_('Background color')+':<br/><br/><div id="step" style="font-size: 150%;padding:1em;border:1px solid '+curColor+'">1234567890<span style="color:'+curColor+'">1234567890</span></div>'+
        '<br><div class="btn" onclick="_doKey(keys.LEFT);">'+strLEFT+'</div>&nbsp;<div class="btn" onclick="_doKey(keys.RIGHT);">'+strRIGHT+'</div>&nbsp;'+_('Color')+
        '<br><div class="btn" onclick="_doKey(keys.UP);">'+strUP+'</div>&nbsp;<div class="btn" onclick="_doKey(keys.DOWN);">'+strDOWN+'</div>&nbsp;'+_('Brightness')+
        // '<br><br/>'+btnDiv(keys.ENTER, strENTER, 'Set') + btnDiv(keys.RETURN, strRETURN, 'Close')+
        '</div>'
    ).show();
    showStep(0,0);
    aboutKeyHandler = function(code){
        switch (code) {
            case keys.UP: showStep(0,5); return;
            case keys.DOWN: showStep(0,-5); return;
            case keys.RIGHT: showStep(10,0); return;
            case keys.LEFT: showStep(-10,0); return;
            case keys.ENTER: eSHLcolorB = H+','+V;
            case keys.RETURN: $('#listAbout').text('').hide(); restoreCPD(); return;
            default: return;
        }
    }
}
function joyMenu(){
    var td = '<td align="center" valign="top" width="30%">';
    $('#dialogbox').html('<table style="font-size:inherit">'+
        '<tr><td></td>' + td + btnDiv(keys.UP, strUP, '<br>Rewind<br>') + '</td><td></td></tr>' +
        '<tr>' + td +
            btnDiv(keys.LEFT, strLEFT, '<br>Menu') + '</td>' + td +
            btnDiv(keys.ENTER, strENTER, '<br>Pause<br>') + '</td>' + td +
            btnDiv(keys.RIGHT, strRIGHT, '<br>Toggle<br>sound track') +
        '</td></tr>' +
        '<tr><td></td>' + td + btnDiv(keys.DOWN, strDOWN, (playType?'<br>Live':'<br>Previous<br>channel')) + '</td><td></td></tr>' +
        '</table>'
        + btnDiv(keys.RETURN, strRETURN, 'Close')
    ).show();
    dialogBoxKeyHandler = function(code){
        $('#dialogbox').hide();
        switch (code) {
            case keys.ENTER: _doKey(keys.PLAY); return;
            case keys.UP: shiftArchiveSelect(0); return;
            case keys.DOWN: playType?_doKey(keys.STOP):prevProg(); return;
            case keys.RIGHT: toggleAudioTrack(); return;
            case keys.LEFT: popupList(); return;
            case keys.RETURN: return;
        }
    }
}

var dialogBoxKeyHandler = null, selectBoxKeyHandler = null;
function keyHandler(event){
    try{
        setSleepTimeout();
        var code = stbEventToKeyCode(event);
        if(!code) return;
        if((typeof(selectBoxKeyHandler) == "function") && $('#numprog').is(":visible")){
            if(selectBoxKeyHandler(code)) return;
            selectBoxKeyHandler = null;
            numProg.style.display = 'none';
        }
        if($('#dialogbox').is(":visible")){ dialogBoxKeyHandler(code); return; }
        switch (code) {
            case keys.MUTE: toggleMute(); return;
            case keys.VOL_DOWN: changeVolume(-sVolumeStep); return;
            case keys.VOL_UP: changeVolume(sVolumeStep); return;
            case keys.POWER: toggleStandby(); return;
        }

        if($('#listEdit').is(":visible")){ editKey(code); return; }
        if($('#listAbout').is(":visible")){
            if(aboutKeyHandler(code)){ event.preventDefault(); return; }
            switch (code) {
                case keys.ENTER:
                case keys.EXIT:
                case keys.RETURN: $('#listAbout').hide(); return;
            }
            return;
        }
        if(list.style.display != 'none'){
            event.preventDefault();
            if(sArrowFun == 1) switch (code) {
                case keys.LEFT: changeVolume(-sVolumeStep); return;
                case keys.RIGHT: changeVolume(sVolumeStep); return;
            }
            if(listKeyHandler(code)) return;
            switch (code) {
                case keys.EXIT: closeList(); return;
        		case keys.UP: changeSelect(-1); return;
        		case keys.DOWN: changeSelect(1); return;
        		case keys.LEFT:
                case keys.RW:
        		case keys.CH_UP: changeSelect(-pageSize); return;
        		case keys.RIGHT:
                case keys.FF:
        		case keys.CH_DOWN: changeSelect(pageSize); return;
                case keys.PREV: if(sPNFun==3) changeSelect(-selIndex); else changeSelect(-pageSize); return;
                case keys.NEXT: if(sPNFun==3) changeSelect(listArray.length-selIndex-1); else changeSelect(pageSize); return;
    		}
		    return;
        }
        if(playType){
            switch (code) {
                case keys.N1: shiftArchive(-s13dur); return;
                case keys.N3: shiftArchive(s13dur); return;
                case keys.N4: shiftArchive(-s46dur); return;
                case keys.N6: shiftArchive(s46dur); return;
                case keys.N7: shiftArchive(-s79dur); return;
                case keys.N9: shiftArchive(s79dur); return;
                case keys.N2: keyFun(20); return;
                case keys.N5: keyFun(21); return;
                case keys.ENTER: if(forcePlay) break;
                case keys.N0:
                case keys.PAUSE:
                case keys.PLAY:
                    if(stbIsPlaying()){
                        forcePlay = false;
                        showShift(_('Pause'));
                        showChanelInfo(2);
                        stbPause();
                    } else {
                        forcePlay = true;
                        showShift(_('Play'));
                        $i1.hide();
                        if((playType<0) || fileArchive) stbContinue(); // media play or arhive as files
                        else playArchive(playType + playTime - (s10resum?10:0));
                    }
                    return;
                case keys.N8: code = keys.STOP; break;
            }
        } else {
            switch (code) {
                case keys.N0: if(nProg == ''){ liveStop(); return; };
                case keys.N1:
                case keys.N2:
                case keys.N3:
                case keys.N4:
                case keys.N5:
                case keys.N6:
                case keys.N7:
                case keys.N8:
                case keys.N9: numberProg(code-48); return;
                case keys.PAUSE:
                case keys.PLAY: liveStop(); return;
     		}
        }
		switch (code) {
            case keys.STOP: showShift(_(playType?'Live':'Restart stream')); playChannel(catIndex, primaryIndex); return;
            case keys.RW: keyFun(sRWfun); return;
            case keys.FF: keyFun(sFFfun); return;
            case keys.PREV: keyFun(sPREVfun); return;
            case keys.NEXT: keyFun(sNEXTfun); return;
            case keys.CH_UP: plusProg(); return;
            case keys.CH_DOWN: minusProg(); return;
            case keys.PRECH: prevProg(); return;//keyFun(2); return;//
            case keys.ENTER:
                if(playType==-100000000000) { mediaList(null); return;};
                if((playType>0)&&(!sOkfun)) { epgList(catIndex, primaryIndex, false); return;};
            case keys.CH_LIST: channelsList(catIndex, primaryIndex); return;
            case keys.PIP: togglePip(); return;
            case keys.RETURN:
                if($i1.is(":visible")){ infoBarHide(); return; }
                switch (sEfun) {
                    case 0: return;
                    case 1: exitPortal(); return;
                    case 2: joyMenu(); return;
                    case 3: popupList(); return;
                    case 4: prevProg(); return;
                }
                return;
            case keys.EPG: if(playType>-1) epgList(catIndex, primaryIndex, false); return;
            case keys.INFO: showChanelInfo(); return;//keyFun(4); return;//
            case keys.LEFT: keyFun(sALfun); return;
            case keys.RIGHT: keyFun(sARfun); return;
            case keys.UP: keyFun(sAUfun); return;
            case keys.DOWN: keyFun(sADfun); return;
            case keys.RED: keyFun(sRfun); return;
            case keys.GREEN: keyFun(sGfun); return;
            case keys.YELLOW: keyFun(sYfun); return;
            case keys.BLUE: keyFun(sBfun); return;
            case keys.TOOLS: popupList(); return;//keyFun(1); return;//
            case keys.SETUP: optionsList(); return;
            case keys.ZOOM: toggleZoom(); return;
            case keys.ASPECT: toggleAspectRatio(); return;
            case keys.AUDIO: toggleAudioTrack(); return;
            case keys.SUBT: toggleSubtitle(); return;
            case keys.EXIT: exitPortal(); return;
            default:
                log("info", "<b>Warning:</b> key " + code + " ignored");
                break;
		}
    }
    catch (e)
    {
        // log("info", "<b>Exception:</b> name " + e.name +
        //     ", message " + e.message +
        //     ", typeof " + typeof e);
    }
}
function keyFun(no){
    switch (no) {
        case 0: if(playType>-1) recordsList(catIndex, primaryIndex, false); return;
        case 1: popupList(); return;
        case 2: prevProg(); return;
        case 3: shiftArchiveSelect(0); return;
        case 4: showChanelInfo(); return;
        case 5: toggleAspectRatio(); return;
        case 6: toggleAudioTrack(); return;
        case 7: togglePip(); return;
        case 8: pipIndex = null; stbStopPip(); return;
        case 9: bucketsList(catIndex); return;
        case 10: if(playType>-1) epgList(catIndex, primaryIndex, false); return;
        case 11: popMedia(); return;
        case 12: joyMenu(); return;
        case 13: changeVolume(sVolumeStep); return;
        case 14: changeVolume(-sVolumeStep); return;
        case 15: if(playType) shiftArchiveSelect(60); else plusProg(); return;
        case 16: if(playType) shiftArchiveSelect(0); else minusProg(); return;
        case 17: toggleSubtitle(); return;
        case 18: shiftArchive(-60); return;
        case 19: if(playType) shiftArchive(60); else shiftArchiveSelect(-60); return;
        case 20:
            if(playType<0){ shiftArchive(-6000000); return; } // media play
            if(!playType){ timeShift(0); return; }
            if((playType + playTime - epgArray[curProg].time) > 30)
                playArchive(epgArray[curProg].time);
            else
                playArchive(epgArray[curProg-1].time);
            return;
        case 21:
            if(playType<0) return; // media play
            if(!playType){ shiftArchiveSelect(-60); return; }
            if(epgArray[curProg+1].time < Date.now()/1000)
                playArchive(epgArray[curProg+1].time);
            else {
                showShift(_('Live'));
                playChannel(catIndex, primaryIndex);
            }
            return;
    }
}
function body_onClick(event){
    if(!event.clientY) return;
    if($('#dialogbox').is(":visible") || $('#numprog').is(":visible")){ _doKey(keys.RETURN); return; }
    if(list.style.display != 'none') return;
    var bh = document.body.getBoundingClientRect().height||window.innerHeight;//, bw = document.body.getBoundingClientRect().width;
    if(event.clientY < bh*.2)
        popupList();
    else if(event.clientY > bh*.8)
        showChanelInfo();
    else
        _doKey(keys.ENTER);
}
document.body.onclick = body_onClick;
function list_OnClick() {
    _doKey(keys.RETURN);
}
list.onclick = list_OnClick;
$i1.click(function(event){
    event.stopPropagation();
    showChanelInfo();
});
var $progress_div = $('#progress_div');
function pos2text(pos){
    var c = new Date(pos*1000);
    return _t2(c.getHours()) + ':' + _t2(c.getMinutes()) + ':' + _t2(c.getSeconds());
}
$progress_div.click(function(){
    if(!playType && !chanels[curList[primaryIndex]].rec) return;
    event.stopPropagation();
    var np = (event.clientX-$progress_div.position().left)/$progress_div.width();
    if(playType < 0){ // media play
        var nos = Math.max(Math.round(np*stbGetLen()),0);
        var h = Math.floor(nos/3600), m = Math.floor(nos%3600/60), s = nos%60;
        showShift('>> ' + (h?h+':':'')+_t2(m)+':'+_t2(s) + ' <<');
        stbSetPosTime(nos);
        return;
    }
    var nos = Math.round(np*(_prog100.time_to-_prog100.time)+_prog100.time);
    if(nos < (Date.now()/1000)) {
        if(!playType){ // из прямого эфира
            timeShift(Math.round(Date.now()/1000-nos));
            return;
        }
        showShift('>> ' + pos2text(nos) + ' <<');
        playArchive(nos);
    } else {
        showShift(_(playType?'Live':'Restart stream'));
        playChannel(catIndex, primaryIndex);
    }
});
var tooltip = document.getElementById('progress_span'), $tooltipSpan = $('span', tooltip);
$progress_div.mousemove(function(e){
    if(!playType && !chanels[curList[primaryIndex]].rec) return;
    var x = e.clientX;
    tooltip.style.display = 'block';
    tooltip.style.top = ($progress_div.offset().top - $progress_div.height()) + 'px';
    tooltip.style.left = (x - tooltip.offsetWidth/2) + 'px';
    var np = (x-$progress_div.position().left)/$progress_div.width();
    if(playType < 0){ // media play
        var nos = Math.max(Math.round(np*stbGetLen()),0);
        var h = Math.floor(nos/3600), m = Math.floor(nos%3600/60), s = nos%60;
        $tooltipSpan.text((h?h+':':'')+_t2(m)+':'+_t2(s));
    } else {
        var nos = Math.round(np*(_prog100.time_to-_prog100.time)+_prog100.time);
        $tooltipSpan.text(pos2text(nos));
    }
    clearTimeout(infoTimeout);
    infoTimeout = setTimeout(infoBarHideT, sInfoTimeout*1000);
});
$progress_div.mouseleave(function(){ tooltip.style.display = ''; });

function browserName(){ return 'dune'; }

function saveChannelsCats(){
    if(!sFavorites){
        providerSetItem('catsArray', JSON.stringify(catsArray.slice(1)));
        var ca = {};
        jQuery.extend(ca, cats);
        delete ca[_('All')];
        providerSetItem('cats', JSON.stringify(ca));
    } else {
        favoritesArray = cats[_('Favorites')];
        providerSetItem('favoritesArray', JSON.stringify(favoritesArray));
    }
}
function infoBox(txt){
    $('#dialogbox').html('<center>'+txt+'</center>').show();
    dialogBoxKeyHandler = function(code){ $('#dialogbox').hide(); }
}
function confirmBox(txt, onYes, onCancel){
    $('#dialogbox').html('<center>'+_(txt)+'<br/><br/>'+btnDiv(keys.ENTER, strENTER, 'Yes')+'</center>').show();
    dialogBoxKeyHandler = function(code){
        $('#dialogbox').hide();
        if(code == keys.ENTER) onYes();
        else if(typeof(onCancel)=='function') onCancel();
    }
}

var catsArray = [];
var cats = {};
var parental = /null/;
var parentalArray = [], favoritesArray = [];
function onChanelsLoaded(){
    try
    {
        // log("info", "cList.length " + cList.length);
        if(cList.length) {
            $(launch_id).append(_('<br/>Processing the channel list...'));
            if(!sFavorites){
                var sCa = providerGetItem('catsArray') || false;
                if(sCa){
                    try {
                        catsArray = JSON.parse(sCa);
                        cats = JSON.parse(providerGetItem('cats'));
                    } catch (e){ catsArray = []; cats = {};}
                }
            } else {
                sCa = providerGetItem('favoritesArray') || false;
                if(sCa)
                    try { favoritesArray = JSON.parse(sCa); } catch (e){ favoritesArray = []; }
            }
            if(!catsArray.length){
                cList.forEach(function(ch_id, ind, arr){
                    var с = chanels[ch_id];
                    if(с.category['class']){
                        if(!cats[с.category.name]) {
                            catsArray.push(с.category.name);
                            cats[с.category.name] = [];
                        }
                        cats[с.category.name].push(ch_id);
                    }
                });
            }
            sCa = providerGetItem('parentalArray') || false;
            if(sCa)
                try { parentalArray = JSON.parse(sCa); } catch (e){ parentalArray = []; }
            if(!parentalArray.length){
                cList.forEach(function(ch_id, ind, arr){
                    var с = chanels[ch_id];
                    if(с.category['class']){
                        if(parental.test(с.category.name))
                            parentalArray.push(ch_id);
                    }
                });
            }
            catsArray.unshift(_('All'));
            cats[_('All')] = cList.slice();
            if(sFavorites){
                catsArray.unshift(_('Favorites'));
                cats[_('Favorites')] = favoritesArray;
            }
            sSortAbc = parseInt(providerGetItem('sSortAbc')) || 0;
            if(sSortAbc) sortChannels();
            $(launch_id).append(_('<br/>Start playback...'));
            // catIndex = parseInt(providerGetItem('catIndex')) || 0;
            var c = cats[catsArray[catIndex]] || [];
            // var ch_id = providerGetItem('chID');
            // // console.log(catIndex,c, ch_id);
            // if(ch_id){
            //     if(typeof(c[0])==="number") try{ ch_id = parseInt(ch_id) } catch(e){}
            //     primaryIndex = c.indexOf(ch_id);
            //     // console.log(primaryIndex);
            //     if(primaryIndex==-1){
            //         catIndex = sFavorites?1:0;
            //         c = cats[_('All')];
            //         primaryIndex = c.indexOf(ch_id);
            //     }
            // } else
                // primaryIndex = parseInt(providerGetItem('primaryIndex')) || 0;
            if((!c) || (!c[primaryIndex])) {
                primaryIndex = 0;
                catIndex = sFavorites?1:0;
            }
            try {
                playChannel(catIndex, primaryIndex);
            } catch (e) {
                primaryIndex = 0;
                catIndex = sFavorites?1:0;
                try{ playChannel(catIndex, primaryIndex); } catch (e) {}
            }
            try{ loadEpgTimers(); } catch (e) {}
        } else {
            playType = 0;
            // setCurrent(catIndex, primaryIndex);
            setCurrent(sFavorites?1:0, 0);
            $(launch_id).append(_('<br/>Channel list not received !!!'));
            popupList(popupActions.indexOf(noProvParam)+1);
            infoBox(_('Channel list not received !!!<br/><br/>Enter the provider data and restart the player !!!<br/><br/>'));
            launch_id = '#launch';
        }
    }
    catch (e)
    {
        $(launch_id).append("<br/><b>Exception:</b> name " + e.name +
            ", message " + e.message + ", typeof " + typeof e);
        popupList(popupActions.indexOf(noProvParam)+1);
        infoBox(_('Error getting channel list !!!')+'<br/><br/><b>Exception:</b> name ' + e.name +
            ", message " + e.message +  ", typeof " + typeof e);
        launch_id = '#launch';
    }
    $(launch_id).hide();
}
var arrTimezone = ['system','0','+1','+2','+3','+4','+5','+6','+7','+8','+9','+10','+11','+12','-1','-2','-3','-4','-5','-6','-7','-8','-9','-10','-11','-12'];
function setTimezone(){
    if(arrTimezone[sTimezone]==undefined) sTimezone = 0;
    if(sTimezone)
        Date.setTimezoneOffset(-60*arrTimezone[sTimezone]);
}
function setFontSize(){
    pageSize = sPageSize;
    var l = getHeightK(), lw = getWidthK();
    var fs = (window.innerHeight-90*l)/pageSize-sFontShift*l;
    fs = Math.max(fs, 16*l);
    fs = Math.min(fs, 40*l);
    // console.log(fs);
    $('#list').css('font-size', fs+'px');
    $('#testFont').css('font-size', fs+'px');
    $('#permanentTime').css('font-size', fs+'px');
    fs = Math.max(fs, 22*l);
    $i1.css('font-size', fs+'px');
    $('#numprog').css('font-size', fs+'px');
    $('#dialogbox').css('font-size', fs+'px');
    fs = Math.min(fs, 25*l);
    $('#listCaption').css('font-size', fs+'px');
    $('#listPodval').css('font-size', fs+'px');

    $('#permanentTime').toggle(sPermanentTime!=0).toggleClass('osd', sPermanentTime!=2).css('background-color', '');

    $('body').css('font-family', ['Helvetica, Arial, sans-serif', 'Roboto', 'RobotoCondensed', 'Caveat', 'Liberation', 'Gabriela', 'PTSansNarrow'][sFont]);

// 768766876
    // if((window.innerWidth!=1280) || (window.innerHeight!=720)){
        $('#info').css('padding', 20*l+'px');
        $('#numprog').css({left: 20*l+'px', top: 20*l+'px', padding: 10*l+'px'});
        $('#permanentTime').css({right: 20*l+'px', top: 20*lw+'px', padding: 10*l+'px '+10*lw+'px'});
        $('#launch').css({'font-size': 16*l+'px', padding: 100*l+'px'});
        $('logo').css({margin: 100*l+'px'});
        $('#list').css({margin: 10*l+'px '+10*lw+'px'});
        $('#listCaption').css({height: 30*l+'px'});
        $('#listTime').css({width: 80*lw+'px', 'font-size': 22*l+'px'});
        $('#list_s').css({'font-size': 16*l+'px'});
        $('#listPodval').css({height: 30*l+'px'});
        $('#listDetail').css({width: 514*lw+1+'px', top: 330*l+'px', bottom: 30*l+1+'px', padding: 4*l+'px '+4*lw+'px'});
        $('#listPopUp').css({bottom: 30*l+1+'px', padding: 10*l+'px', margin: 10*l+'px'});
        $('#listIn').css({left: 522*lw+'px', top: 30*l+1+'px', bottom: 30*l+1+'px', padding: 4*l+'px 0px'});
        $('#listAbout').css({left: 522*lw+'px', top: 30*l+1+'px', bottom: 30*l+1+'px', padding: 10*l+'px '+10*lw+'px'});
        $('#listEdit').css({left: 522*lw+'px', top: 30*l+1+'px', bottom: 30*l+1+'px', padding: 10*l+'px '+10*lw+'px'});
        $('#info1').css({padding: 20*l+'px '+20*lw+'px'});
        $('#picon').css({width: 80*lw+'px', height: 80*l+'px'});
        $('#channel').css({width: 1040*lw+'px', padding: '0px 0px 0px '+20*lw+'px'});
        $('#channel_number').css({width: 70*lw+'px'});
        $('#progress_div').css({margin: 2*l+'px 0px'});
        $('#progress').css({height: 6*l+'px'});
        $('#progress_r').css({height: 6*l+'px'});
        $('#begin_time').css({width: 70*lw+'px', 'font-size': 22*l+'px'});
        $('#end_time').css({width: 70*lw+'px', 'font-size': 22*l+'px'});
        $('#programm_name').css({width: 900*lw+'px'});
        $('#nbegin_time').css({width: 70*lw+'px', 'font-size': 22*l+'px'});
        $('#nend_time').css({width: 70*lw+'px', 'font-size': 22*l+'px'});
        $('#nprogramm_name').css({width: 900*lw+'px'});
        $('#data').css({width: 80*lw+'px', 'font-size': 22*l+'px'});
        $('#current_s').css({'font-size': 16*l+'px'});
        $('#video_res').css({'font-size': 16*l+'px'});
        $('#descr').css({padding: '0px '+100*lw+'px', margin: '0px 0px '+20*l+'px 0px'});
        // $('#buffering').css({left: 40*l+'px', top: 40*l+'px', width: 40*l+'px', height: 40*l+'px', 'background-size': 40*l+'px'});
        // $('#pip_buffering').css({right: 40*l+'px', top: 40*l+'px', width: 40*l+'px', height: 40*l+'px', 'background-size': 40*l+'px'});
        $('#buffering').css({left: 10*l+'px', top: 10*l+'px', width: 30*l+'px', height: 30*l+'px', 'background-size': 30*l+'px'});
        $('#pip_buffering').css({right: 10*l+'px', top: 10*l+'px', width: 30*l+'px', height: 30*l+'px', 'background-size': 30*l+'px'});
        $('#mute').css({width: 40*l+'px', height: 40*l+'px', 'background-size': 20*l+'px'});
        $('#volume_div').css({left: 10*lw+'px', width: 15*lw+'px', border: 5*l+'px solid black'});
        $('#dialogbox').css({padding: 10*l+'px', margin: 10*l+'px'});
        $('btn').css({'border-radius': 6*l+'px', padding: '0px '+6*lw+'px'});
        try{
            tooltip.style.width = 12*l + 'px';
            tooltip.style.height = 12*l + 'px';
            // tooltip.style.backgroundColor = curColor;
            tooltip.style.border = 3*l + 'px solid '+curColor;
        } catch(e){}
        try{
            var $t = $('#testFont'), ft = $t.css('font-size');
            $t.css('font-size', 22*l).text('9');
            var w9 = $t.width();
            $t.text('').css('font-size', ft);
            var wD = w9*7;
            $('#picon').css({width: wD+'px'});
            $('#data').css({width: wD+'px'});
            $('#listTime').css({width: wD+'px'});
            $('#channel').css({width: (1200*lw-wD*2)+'px'});
            $('#descr').css({padding: '0px '+(wD+20*lw)+'px'});
        } catch(e){}
        try{
            var $t = $('#testFont'), ft = $t.css('font-size'), fi = $i1.css('font-size');
            $t.css('font-size', fi).text('9');
            var w9 = $t.width();
            $t.text('').css('font-size', ft);
            $('#channel_number').css({width: w9*6+'px'});
            $('#begin_time').css({width: w9*6+'px', 'font-size': 'inherit'});
            $('#end_time').css({width: w9*6+'px', 'font-size': 'inherit'});
            $('#programm_name').css({width: ($('#channel').width()-w9*12)+'px'});
            $('#nbegin_time').css({width: w9*6+'px', 'font-size': 'inherit'});
            $('#nend_time').css({width: w9*6+'px', 'font-size': 'inherit'});
            $('#nprogramm_name').css({width: ($('#channel').width()-w9*12)+'px'});
        } catch(e){}
        if(typeof(stbCSS)==='function') stbCSS();
    // }
// 666666666

    // log('info', $('#channel').height());
    $('#descr').css('max-height', (660-$('#channel').height())*l+'px');
}
function setListPos(){
    var l = getWidthK(), lh = getHeightK(),
        l1 = sListPos ? 0 : 522*l,
        r1 = sListPos ? 522*l : 0,
        l2 = sListPos ? 738*l : 0;
    $('#listIn').css( {'left': l1+'px', 'right': r1+'px'} );
    $('#listAbout').css( {'left': l1+'px', 'right': r1+'px'} );
    $('#listEdit').css( {'left': l1+'px', 'right': r1+'px'} );
    $('#listDetail').css( {'left': l2+'px'} );
    $('#listPopUp').css( {'left': l2+'px'} );
    l2 = sNoSmall ? 30*lh+1 : 330*lh;
    $('#listDetail').css( {'top': l2+'px'} );
}
var bodyColor = '#f0f0f0', curColor = 'gold', curColorB = '#668';
function setColor(){
    $('body').css('color', bodyColor);
    // var H = 240, S = 25;
    var H = parseInt(sSHLcolSel.split(',')[0]), S = parseInt(sSHLcolSel.split(',')[1]);
    curColorB = 'rgb('+hsvToRgb(H,S,50).join(',')+')';

    var H = parseInt(sSHLcolor.split(',')[0]), S = parseInt(sSHLcolor.split(',')[1]);
    curColor = 'rgb('+hsvToRgb(H,S,100).join(',')+')';

    $('#listCaption').css('border-bottom', '1px solid '+curColor);
    $('#listPodval').css('border-top', '1px solid '+curColor);
    $('#listPopUp').css('border', '1px solid '+curColor);
    $('#progress').css('background-color', curColor);
    $tooltipSpan.css({'background-color': curColorB, 'color': curColor});
    $('#programm_name2').css('color', curColor);
    $('#dialogbox').css('border', '1px solid '+curColor);
    try{ tooltip.style.border = 3*getHeightK() + 'px solid '+curColor; } catch(e){}

    if(typeof(stbSetOsdOpacity) === "function"){
        stbSetOsdOpacity(sOsdOpacity*10);
    }
    $('#_t').css('height', 50*getHeightK());
    $('#_b').css('top', (50+288)*getHeightK());
    var lw = (sListPos ? 758 : 10);
    $('#_l').css('width', lw*getWidthK());
    $('#_r').css('left', (lw+512)*getWidthK());
    var H = parseInt(sSHLcolorB.split(',')[0]), V = parseInt(sSHLcolorB.split(',')[1]);
    $('.list_back').css('background-color', 'rgb('+hsvToRgb(H,100,V).join(',')+')');
    $('#listPopUp').css('background-color', 'rgb('+hsvToRgb(H,100,V).join(',')+')');
}
function setEditor(){
    if(sEditor && (typeof(showEditKey2) === "function")){
        editKey = editKey2;
        showEditKey = showEditKey2;
    } else {
        editKey = editKey1;
        showEditKey = showEditKey1;
    }
}

if(window.localStorage){ // localStorage
    stbGetItem = function(keyName){ return localStorage.getItem(keyName); }
    stbSetItem = function(keyName, keyValue){ try{ localStorage.setItem(keyName, keyValue); } catch(e) { alert('Error save data!!!'); } }
    stbDelItem = function(keyName){ localStorage.removeItem(keyName); }
    stbClearAllItems = function(){ localStorage.clear(); }
    stbGetAllItems = function(){
        var a = {};
        for (var i = 0; i < localStorage.length; i++) {
            a[localStorage.key(i)]=localStorage[localStorage.key(i)];
        }
        return a;
    };
} else { // cookie
    stbGetItem = function(keyName){
        if(!((new RegExp("(?:^|;\\s*)" + decodeURIComponent(keyName).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie))) return '';
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + decodeURIComponent(keyName).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
    }
    stbSetItem = function(keyName, keyValue){
        if(keyName) document.cookie = encodeURIComponent(keyName) + "=" + encodeURIComponent(keyValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
        // if(stbGetItem(keyName)!=keyValue) console.log('Error!!!');
    }
    stbDelItem = function(keyName){
        if(keyName) document.cookie = encodeURIComponent(keyName) + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    }
    stbClearAllItems = function(){
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        }
    }
    stbGetAllItems = function(){
        var a = {};
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            a[name]=stbGetItem(name);
        }
        return a;
    };
    sFavorites = -1;
}

function saveCPD(){ lc = listCaption.innerHTML; lp = listPodval.innerHTML; ld = listDetail.innerHTML; listCaption.innerHTML = ''; listPodval.innerHTML = ''; listDetail.innerHTML = ''; }
function restoreCPD(){ listCaption.innerHTML = lc; listPodval.innerHTML = lp; listDetail.innerHTML = ld; }

function edit_dealer(){
    function errorDil(mes){
        alert(_(mes));
        setTimeout( function(){ showEditKey([0,1,2]); } );
    }
    editCaption = _('Enter Provider Code');
    editvar = '';
    setEdit = function(){
        if(!editvar) errorDil('Error Code!');
        else $.getScript(host+'/d/'+editvar.split(':')[0]+'.js?'+__cv, function(){
            try{ doDealer(editvar); }catch(e){ errorDil('Error Code!'); }
        }).fail(function(){ errorDil('Error Code!'); });
    };
    showEditKey([0,1,2]);
}
function edit_dealer_remote(){
    function errorDil(mes){
        alert(_(mes));
        setTimeout( function(){ _close(); } );
    }

    var _break = false, _code;
    function _close(){ clearTimeout(_timeout); _break = true; $('#listEdit').hide(); }
    var _timeout = setTimeout( _close, 600000);
    function get_settings(){
        if(_break) return;
        $.ajax({
            url: host_ott+'/swop/a.php',
            data: {c:'get_val', d: _code}, type: 'POST', timeout: 10000, cache: false,
            success: function(json){
                if(_break) return;
                // console.log(json)
                if(json.status === 'forbidden') setTimeout(get_settings, 5000)
                // else if(json.status === 'error') get_code()
                else if (json.status === 'success') {
                    if(!json.data) errorDil('Error Code!');
                    else $.getScript(host+'/d/'+json.data.split(':')[0]+'.js?'+__cv, function(){
                        try{ doDealer(json.data); $('#listEdit').hide(); }catch(e){ errorDil('Error Code!'); }
                    }).fail(function(){ errorDil('Error Code!'); });
                }
            },
            error: function(jqXHR){
                // console.log('Error :'+JSON.stringify(jqXHR));
                $('#listEdit').html('<div style="text-align:center;font-size:larger;color:red"><br/><br/>ERROR:<br/>'+jqXHR.responseText+'</div>');
            },
        })
    }
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
    $('#listEdit').html('<div style="text-align:center;font-size:larger;"><br/><br/>'+_('Send request')+'...</div>').show();
    editKey = function(code){ if(code==keys.RETURN||code==keys.EXIT){ _close(); } return true; }
    $.ajax({
        url: host_ott+'/swop/a.php', data: {c:'get_var', n:_('Enter Provider Code'), v:''}, type: 'POST', timeout: 10000, cache: false,
        success: function(json){
            _code = json.code;
            $('#listEdit').html(
                '<div style="text-align:center;font-size:larger;"><br/>'+_('Request sended!')+'<br/><br/>'+
                _('For enter value open')+'<br/><span style="font-size:larger;color:'+curColor+'">'+__test+'ott-play.com/swop</span> '+_('and enter code')+' <span style="font-size:larger;color:'+curColor+'">'+_code+'</span><br/><br/>'+
                _('or scan')+':<br/><br/>'+
                '<div><img src="https://chart.googleapis.com/chart?cht=qr&chs=300x300&chld=|1&chl=https://'+__test+'ott-play.com/swop/?'+_code+'" style="height:30%;"/></div>'+
                '</div>'
            );
            setTimeout(get_settings, 10000);
        },
        error: function(jqXHR){
            // console.log('Error :'+JSON.stringify(jqXHR));
            $('#listEdit').html('<div style="text-align:center;font-size:larger;color:red"><br/><br/>ERROR:<br/>'+jqXHR.responseText+'</div>');
        },
    });

}
var arrayProvaiders = [
        'm3u', 'stalker', 'xtream', '', 'ottclub', 'edem', 'cbilling', 'shura', 'itv', 'tvteam', 'ottg', 'great', 'top', 'shara.club', 'shara-tv',
        'bestlist', 'bestlist/stalker', 'all4you', 'ipstream', 'korona', 'antifriz', 'kb-team', 'fox', 'iptv-ott.ru', 'dosug', 'topiptv', '1ott',
        'newlook', 'polmedia', 'dragon', 'only4', 'ottprime', 'shocktv', 'diamondtv', 'fabryka', 'russkoetv', 'ultifl1x', 'tvclub', 'vidok',
        '', 'drvao','d/maxtv','moidom','sharavoz','raduga', 'prost', 'fxml', 'rd', 'tabox'//, 'iptv-e2'
    ];
var provArray = null;
function selectProvaider(){
    if(sPSprovs&&(parentPIN!='*')&&(!parentAccess)){
        enterPinAndSetAccess(selectProvaider);
        return;
    }
    if(!provArray) provArray = [
        (sNoColorKeys? '': '<div class="btn red">&nbsp;</div>&nbsp;')+_('m3u-m3u8 playlists'),
        (sNoColorKeys? '': '<div class="btn green">&nbsp;</div>&nbsp;')+_('Stalker portals'),
        (sNoColorKeys? '': '<div class="btn yellow">&nbsp;</div>&nbsp;')+'Xtream-codes',
        '',
        'OTTCLUB', 'Эдем / iLookTV', 'Гомельсат (cbilling)', 'Шура ТВ', 'ITV.LIVE', 'TV.Team', 'GlanzTV',
        'GREAT IPTV', 'Top-Tv', 'Shara.club', 'Shara-TV', 'BEST LiST IPTV [HLS Playlist]', 'BEST LiST IPTV [Stalker/Ministra Portal]',
        'All4you.tv', 'IpStream.one', 'KORONA TV', 'АнтиФриз.ТВ', 'KBC (Kinoboom)', 'Fox-TV', 'IPTV-OTT.RU', 'TV DOSUG', 'TOP-IPTV',
        '1OTT.NET', 'New Look', 'POLMEDIA', 'Dragon Media PRO', 'Only4.tv', 'OTT Prime ONLINE', 'ShockTv', 'Diamond TV', 'Fabryka.TV', 'RUSSKOETV',
        'ULTIFL1X', 'TVClub', 'Vidok.TV'//, 'tabox.in', 'IPTV-E2'
    ];
    function infoProv(){
        $('#listAbout').html('<div style="font-size:larger;">' + listDetail.innerHTML.replace("display:none","") + '</div>');
        saveCPD();
        aboutKeyHandler = function (code){ restoreCPD(); $('#listAbout').hide(); return true; };
        $('#listAbout').show();
    }
    function goProv(prov){
        if(!prov) return;
        // if(prov=='d'){ edit_dealer(); return; }
        if(c==prov){ optionsList(selectProvaider); return; }
        stbSetItem("ottplayprov", prov);
        if(arrayProvaiders.indexOf(prov)>_nfp-1){
            // var ap = stbGetItem("ottplayprovs") || '[]';
            // try { ap = JSON.parse(ap); } catch (e){ ap = [];}
            var i = ap.indexOf(prov);
            if(i!=-1) ap.splice(i, 1);
            ap.push(prov);
            stbSetItem("ottplayprovs", JSON.stringify(ap));
        }
        // restart();
        loadProv();
    }
    var _nfp = 3;
    var c = stbGetItem("ottplayprov")||'no';
    var ap = stbGetItem("ottplayprovs") || '[]';
    try { ap = JSON.parse(ap); } catch (e){ ap = [];}
    // console.log(ap, arrayProvaiders, c);
    ap.forEach(function(val){
        var i = arrayProvaiders.indexOf(val);
        if(i==-1) return;
        arrayProvaiders.splice(i, 1);
        arrayProvaiders.splice(_nfp+1, 0, val);
        var v = provArray[i];
        provArray.splice(i, 1);
        provArray.splice(_nfp+1, 0, v);
    });
    selIndex = arrayProvaiders.indexOf(c);
    if((selIndex==-1)||(selIndex>=provArray.length)) selIndex = 0;
    listArray = provArray;
    getListItem = function(item, i){ return '&nbsp;&nbsp;' + (sNoNumbersKeys||(i<_nfp+1||i>9+_nfp)?'':'<div class="btn">'+(i-_nfp)+'</div>&nbsp;') + item; };
    detailListAction = function(){
        if(arrayProvaiders[selIndex]){
            var l = stbGetItem("ottplaylang") || '';
            if(l=='_eng') l = '';
            $('#listDetail').load(host+'/'+arrayProvaiders[selIndex]+'/about'+l+'.html?'+__cv, function(response, status, xhr){
                if(status=="error") $('#listDetail').load(host+'/'+arrayProvaiders[selIndex]+'/about.html?'+__cv);
            })
        }
    };
    listKeyHandler = function(code){
        switch (code) {
            case keys.N1:
            case keys.N2:
            case keys.N3:
            case keys.N4:
            case keys.N5:
            case keys.N6:
            case keys.N7:
            case keys.N8:
            case keys.N9: goProv(arrayProvaiders[code-49+_nfp+1]); return true;
            case keys.RED: goProv('m3u'); return true;
            case keys.GREEN: goProv('stalker'); return true;
            case keys.YELLOW: goProv('xtream'); return true;
            case keys.ENTER: goProv(arrayProvaiders[selIndex]); return true;
            case keys.RETURN:
                if(typeof(duneAddSettings) !== "function"){ firstRun(); }//closeList(); stbExit(); }
                else optionsList(selectProvaider);
                return true;
            case keys.RIGHT: if(sArrowFun!=2) return false;
            case keys.N0:
            case keys.INFO: infoProv(); return true;
            case keys.FF: if(sRewFun!=1) return false; infoProv(); return true;
            case keys.NEXT: if(sPNFun!=1) return false; infoProv(); return true;
            // case keys.BLUE: goProv('fxml'); return;
            default: return false;
        }
    };
    listCaption.innerHTML = _('Choose provider');
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close') + btnDiv(keys.N0, strInfo, 'Description', '0');
    $('#listPopUp').hide();

    showPage();
}
function firstRun(){
    listArray = [
            {action: edit_dealer, name: _('Enter Provider Code')},
            {action: edit_dealer_remote, name: _('Enter Provider Code on PC or Phone')},
            {action: loadSettings, name: _('Load settings')},
            {action: nofun},
            {action: selectProvaider, name: _('Manual setup')},
        ];
    if(typeof(loadOpt)==='function') listArray.splice(3, 0, {action: loadOpt, name:_('Load settings from storage')});
    selIndex = 0;
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+(item.name||''); };
    detailListAction = function(){ listDetail.innerHTML = listArray[selIndex].name || ''; };
    listKeyHandler = function(code){
        switch(code){
            case keys.EXIT:
    		case keys.RETURN: selectLang(); return true;
            case keys.ENTER: if(listArray[selIndex].action) listArray[selIndex].action(); return true;
        }
        return false;
    };
    listCaption.innerHTML = _('First Run Setup');
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
    $('#listPopUp').hide();
    showPage();
};

function selectLang(){
    var arrayLangs = ['_eng', '_arm', '_bel', '_fra', '_ger', '_gre', '_heb', '_hun', '_lat', '_lit', '_pol', '_por', '_rou', '_rus', '_spa', '_tur', '_ukr'];
    var langArray = ['English', 'Armenian - Հայերեն', 'Belarusian - Беларуская', 'French - Français', 'German - Deutsch', 'Greek - Ελληνικά', 'Hebrew - עברית', 'Hungarian - Magyar',
        'Latvian - Latviski', 'Lithuanian - Lietuvių', 'Polish - Polski', 'Portuguese - Português', 'Romanian - Română'+strNew, 'Russian - Русский', 'Spanish - Español',
        'Turkish - Türkçe', 'Ukrainian - Українська'];
    selIndex = arrayLangs.indexOf(stbGetItem("ottplaylang")||'');
    var c = selIndex;
    if(selIndex==-1) selIndex = 0;
    listArray = langArray;
    getListItem = function(item, i){ return '&nbsp;&nbsp;' + item; };
    detailListAction = function(){};
    listKeyHandler = function(code){
        switch (code) {
            case keys.ENTER:
                if(c == selIndex){
                    if(typeof(duneAddSettings) !== "function") loadProv(); //restart();
                    else optionsList(selectLang);
                }else{
                    ga_event('lang', 'lang', arrayLangs[selIndex]);
                    stbSetItem("ottplaylang", arrayLangs[selIndex]);
                    keyStrings = {};
                    $.getScript(host+'/stbPlayer/'+arrayLangs[selIndex]+'.js?'+__cv, function(){
                        if(typeof(duneAddSettings) !== "function") loadProv(); //restart();
                        else optionsList(selectLang);
                    });
                }
                return true;
            case keys.EXIT: if(typeof(duneAddSettings) === "function") return false;
            case keys.RETURN:
                if(typeof(duneAddSettings) !== "function"){ closeList(); stbExit(); }
                else optionsList(selectLang);
                return true;
            default: return false;
        }
    };
    listDetail.innerHTML = '';
    listCaption.innerHTML = _('Choose language');
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
    $('#listPopUp').hide();

    showPage();
}

// TimezoneOffset !!!
(function() {
  var offsetDate;
  offsetDate = new Date();
  Date.prototype.timezoneOffset = offsetDate.getTimezoneOffset();
  Date.setTimezoneOffset = function(timezoneOffset) {
    return this.prototype.timezoneOffset = timezoneOffset;
  };
  Date.getTimezoneOffset = function(timezoneOffset) {
    return this.prototype.timezoneOffset;
  };
  Date.prototype.getTimezoneOffset = function() {
    return this.timezoneOffset;
  };
  Date.prototype.setTimezoneOffset = function(timezoneOffset) {
    return this.timezoneOffset = timezoneOffset;
  };
  Date.prototype.toString = function() {
    var offsetTime;
    offsetTime = this.timezoneOffset * 60 * 1000;
    offsetDate.setTime(this.getTime() - offsetTime);
    return offsetDate.toUTCString();
  };
  return ['Milliseconds', 'Seconds', 'Minutes', 'Hours', 'Date', 'Month', 'FullYear', 'Year', 'Day'].forEach((function(_this) {
    return function(key) {
      Date.prototype["get" + key] = function() {
        var offsetTime;
        offsetTime = this.timezoneOffset * 60 * 1000;
        offsetDate.setTime(this.getTime() - offsetTime);
        return offsetDate["getUTC" + key]();
      };
      return Date.prototype["set" + key] = function(value) {
        var offsetTime, time;
        offsetTime = this.timezoneOffset * 60 * 1000;
        offsetDate.setTime(this.getTime() - offsetTime);
        offsetDate["setUTC" + key](value);
        time = offsetDate.getTime() + offsetTime;
        this.setTime(time);
        return time;
      };
    };
  })(this));
})();

var launch_id = '#launch', savedPopup = {};
function startPlayer(){
    function failLang(){
        lang = 'no';
        $(launch_id).append('<br/><b>No language selected !!!</b>').hide();
        selectLang();
    }
    try{
        te = new window.TextEncoder;
        // $(launch_id).append('<br/>Interface resolution: '+window.innerWidth+'x'+window.innerHeight);
        // $(launch_id).append('<br/>userAgent: '+navigator.userAgent);
        $(launch_id).append('<img src="'+host+'/stbPlayer/icon.png" style="position: absolute; left: 100px; bottom:100px;" height="30%" alt=""/>');
        stbInit();

        // var lastStart = parseInt(stbGetItem('lastStart')) || 0;
        // stbSetItem('lastStart', 1);
        sNoSmall = parseInt(stbGetItem('sNoSmall')) || 0;
        sStopPlay = parseInt(stbGetItem('sStopPlay')) || 0;
        sPipSize = parseInt(stbGetItem('sPipSize')) || 0;
        sPipPos = parseInt(stbGetItem('sPipPos')) || 0;
        sPageSize = parseInt(stbGetItem('sPageSize')) || 25;
        sFontShift = parseInt(stbGetItem('sFontShift'));
        if(isNaN(sFontShift)) sFontShift = 4;
        sFont = parseInt(stbGetItem('sFont'));
        if(isNaN(sFont)) sFont = 4;
        sArrowFun = parseInt(stbGetItem('sArrowFun')) || 0;
        sRewFun = parseInt(stbGetItem('sRewFun')) || 0;
        sPNFun = parseInt(stbGetItem('sPNFun')) || 0;
        sALfun = parseInt(stbGetItem('sALfun'));
        if(isNaN(sALfun)) sALfun = typeof(stbGetVolume) === "function" ? 14 : 1;
        sARfun = parseInt(stbGetItem('sARfun'));
        if(isNaN(sARfun)) sARfun = typeof(stbGetVolume) === "function" ? 13 : 4;
        sAUfun = parseInt(stbGetItem('sAUfun'));
        if(isNaN(sAUfun)) sAUfun = 15;
        sADfun = parseInt(stbGetItem('sADfun'));
        if(isNaN(sADfun)) sADfun = 16;
        sRWfun = parseInt(stbGetItem('sRWfun'));
        if(isNaN(sRWfun)) sRWfun = 18;
        sFFfun = parseInt(stbGetItem('sFFfun'));
        if(isNaN(sFFfun)) sFFfun = 19;
        sPREVfun = parseInt(stbGetItem('sPREVfun'));
        if(isNaN(sPREVfun)) sPREVfun = 20;
        sNEXTfun = parseInt(stbGetItem('sNEXTfun'));
        if(isNaN(sNEXTfun)) sNEXTfun = 21;
        sRfun = parseInt(stbGetItem('sRfun'));
        if(isNaN(sRfun)) sRfun = 10;
        sGfun = parseInt(stbGetItem('sGfun')) || 0;
        sYfun = parseInt(stbGetItem('sYfun'));
        if(isNaN(sYfun)) sYfun = 1;
        sBfun = parseInt(stbGetItem('sBfun'));
        if(isNaN(sBfun)) sBfun = 9;
        sEfun = parseInt(stbGetItem('sEfun')) || 0;
        sOkfun = parseInt(stbGetItem('sOkfun')) || 0;
        s13dur = parseInt(stbGetItem('s13dur'));
        if(isNaN(s13dur)) s13dur = 15;
        s46dur = parseInt(stbGetItem('s46dur'));
        if(isNaN(s46dur)) s46dur = 180;
        s79dur = parseInt(stbGetItem('s79dur'));
        if(isNaN(s79dur)) s79dur = 600;

        sNoColorKeys = parseInt(stbGetItem('sNoColorKeys')) || 0;
        sNoNumbersKeys = parseInt(stbGetItem('sNoNumbersKeys')) || 0;
        sTimezone = parseInt(stbGetItem('sTimezone')) || 0;
        sSleepTimeout = parseInt(stbGetItem('sSleepTimeout')) || 0;
        sInfoTimeout = parseInt(stbGetItem('sInfoTimeout')) || 5;
        sInfoSlide = parseInt(stbGetItem('sInfoSlide'));
        if(isNaN(sInfoSlide)) sInfoSlide = 1;
        sInfoSwitch = parseInt(stbGetItem('sInfoSwitch'));
        if(isNaN(sInfoSwitch)) sInfoSwitch = 1;
        sInfoChange = parseInt(stbGetItem('sInfoChange'));
        if(isNaN(sInfoChange)) sInfoChange = 1;
        sInfoRew = parseInt(stbGetItem('sInfoRew'));
        if(isNaN(sInfoRew)) sInfoRew = 1;
        sThumbnail = parseInt(stbGetItem('sThumbnail'));
        if(isNaN(sThumbnail)) sThumbnail = 1;
        sVolumeStep = parseInt(stbGetItem('sVolumeStep')) || 5;
        sListPos = parseInt(stbGetItem('sListPos')) || 0;
        sSHLcolSel = stbGetItem('sSHLcolSel') || '240,25';
        sSHLcolor = stbGetItem('sSHLcolor') || '50,85';
        sSHLcolorB = stbGetItem('sSHLcolorB') || '255,0';
        sOsdOpacity = parseInt(stbGetItem('sOsdOpacity'));
        if(isNaN(sOsdOpacity)) sOsdOpacity = 7;
        sPermanentTime = parseInt(stbGetItem('sPermanentTime')) || 0;
        sGrapI = parseInt(stbGetItem('sGrapI')) || 0;
        s10resum = parseInt(stbGetItem('s10resum'));
        if(isNaN(s10resum)) s10resum = 1;
        sPrevCount = parseInt(stbGetItem('sPrevCount'));
        if(isNaN(sPrevCount)) sPrevCount = 2;
        sMedCount = parseInt(stbGetItem('sMedCount'));
        if(isNaN(sMedCount)) sMedCount = 2;
        sShowScroll = parseInt(stbGetItem('sShowScroll'));
        if(isNaN(sShowScroll)) sShowScroll = 1;
        sEditor = parseInt(stbGetItem('sEditor')) || 0;
        if(sFavorites!=-1) sFavorites = parseInt(stbGetItem('sFavorites')) || 0;
        sPSchannels = parseInt(stbGetItem('sPSchannels'));
        if(isNaN(sPSchannels)) sPSchannels = 1;
        sPSoptions = parseInt(stbGetItem('sPSoptions')) || 0;
        sPSprovs = parseInt(stbGetItem('sPSprovs')) || 0;
        sHDMIsupport = parseInt(stbGetItem('sHDMIsupport')) || 0;
        sAutorun = parseInt(stbGetItem('sAutorun')) || 0;
        sBufSize = parseInt(stbGetItem('sBufSize')) || 0;
        parentPIN = stbGetItem('parentPIN') || '1234';
        sHideMenus = (stbGetItem('sHideMenus') || '').split(',');
        if(sHideMenus[0]=='') sHideMenus = [];
        if(typeof(stbSetBuffer) === "function") stbSetBuffer();
        setTimezone();
        setFontSize();
        setListPos();
        setColor();
        setEditor();
        setPipPosBuf();
        setSleepTimeout();

        if(typeof(stbPlayPip) !== "function"){ delPopup(popTogglePip); delPopup(popStopPip); }
        if(typeof(stbToggleAudioTrack) != "function") delPopup(toggleAudioTrack);
        if(typeof(stbToggleSubtitle) != "function") delPopup(toggleSubtitle);
        if(typeof(stbToggleZoom) != "function") delPopup(toggleZoom);
        if(typeof(stbToggleAspectRatio) != "function") delPopup(toggleAspectRatio);

        savedPopup.popupActions = popupActions.slice();
        savedPopup.popupArray = popupArray.slice();
        savedPopup.popupDetail = popupDetail.slice();
        savedPopup.ver = version;

        var lang = stbGetItem("ottplaylang");
        if(!lang){ failLang(); return; }
        ga_event('lang', 'lang', lang);
        $.getScript(host+'/stbPlayer/'+lang+'.js?'+__cv, loadProv).fail(failLang);
    }catch(e){
        $(launch_id).append("<br/><br/><b>Exception:</b> name " + e.name +
            ", message " + e.message + ", typeof " + typeof e);
    }
}
function loadProv(){
    function failProv(v){
        // alert(JSON.stringify(v));
        $(launch_id).append(_('<br/><b>Failed to load provider script !!!</b>')).hide();
        // selectProvaider();
        firstRun();
    }
    if(!$('#launch').is(":visible")){
        if(stbIsPlaying()) stbStop();
        $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40">').show();
        launch_id = '#dialogbox';
        closeList();
    }
    version = savedPopup.ver;
    popupActions = savedPopup.popupActions.slice();
    popupArray = savedPopup.popupArray.slice();
    popupDetail = savedPopup.popupDetail.slice();
    getEPGchanelCur = null;
    getMediaArray = null;
    playChannel = _playChannel;
    channelsList = _channelsList;
    bucketsList = _bucketsList;
    playMedia = _playMedia;
    providerGetItem = function(keyName){ return stbGetItem(p_pref + keyName); }
    providerSetItem = function(keyName, keyValue){ stbSetItem(p_pref + keyName, keyValue); }

    try{
        var provaider = window.location.href.split('?')[1].split('&')[0];
        provaider = provaider.replace(/!/g, ''); // remove all '!' - for old
        if(provaider=='clear'){
            stbSetItem("ottplayprov", '');
            stbSetItem("noSelProv", 0);
            provaider = '';
        }
        if((provaider.indexOf('*')>-1)&&!stbGetItem("ottplayprov")) {
            provaider = provaider.replace(/\*/g, ''); // remove all '*'
            if(arrayProvaiders.indexOf(provaider) > -1){
                stbSetItem("ottplayprov", provaider);
                stbSetItem("noSelProv", 1);
                provaider = '';
            }
        }
        if(arrayProvaiders.indexOf(provaider) == -1) provaider = '';
    }catch(e){
        var provaider = '';
    }
    if(provaider) delOption(selectProvaider);
    else provaider = stbGetItem("ottplayprov") || provaider;
    // provaider = 'rd';
    if(arrayProvaiders.indexOf(provaider) == -1) provaider = '';
    if(!provaider){
        provaider = 'no';
        failProv();
        return;
    }
    if(parseInt(stbGetItem('noSelProv'))) delOption(selectProvaider);
    else {
        $(launch_id).append(_('<br/>Loading provider %1 script ...', provaider));
        delOption(edit_dealer);
    }

    $.getScript(host+'/'+provaider+'/prov.js?'+__cv, function(){
        try{
            // _sn=0; stat();
            ga_event('provaider', 'provaider', provaider);
            if(typeof(duneAddSettings) === "function"){
                $(launch_id).append(_('<br/>Loading settings...'));
                var i1 = popupActions.indexOf(noProvParam)+1;
                duneAddSettings(i1);
                if(parseInt(stbGetItem('noProvParam'))){
                    var i2 = popupActions.indexOf(optionsList)-i1;
                    popupArray.splice(i1, i2);
                    popupDetail.splice(i1, i2);
                    popupActions.splice(i1, i2);
                }
                if(parseInt(stbGetItem('noSelProv'))+parseInt(stbGetItem('noProvParam'))!=2)
                    $(launch_id).append('<img src="'+host+'/'+provaider+'/logo.png" alt=" " onerror="this.width=0" style="position:absolute; '+(launch_id != '#dialogbox'?'top:100px; right:100px;" width="25%" max-height="25%"/>':'top:6px; right:6px;" height="40" />'));

                if(typeof(getEPGchanelCur) != "function")
                    getEPGchanelCur = epgCash ? getEPGchanelCached : getEPGchanel;

                loadChannels();
            } else failProv();
        }catch(e){
            $(launch_id).append("<br/><br/><b>Exception:</b> name " + e.name +
                ", message " + e.message + ", typeof " + typeof e);
        }
    }).fail(failProv);
}
function loadChannels(){
    if(!$('#launch').is(":visible")){
        if(stbIsPlaying()) stbStop();
        if(launch_id != '#dialogbox') $('#dialogbox').html('<center><img src="'+host+'/stbPlayer/buffering.gif" height="40">').show();
        launch_id = '#dialogbox';
        closeList();
    }
    primaryIndex = 0; catIndex = -1;
    cList = [];
    chanels = {};
    epg = {};
    epgCashObj = {}; epgCashArr = [];
    curList = [];
    catsArray = [];
    cats = {};
    parentalArray = [];
    favoritesArray = [];
    prevArr = [];
    mediaUrls = null;
    medHistory = [];
    medFavorites = [];
    _crData = {catIndex:-1, data:[], selIndex:0};
    catIndex = parseInt(providerGetItem('catIndex')) || 0;
    primaryIndex = parseInt(providerGetItem('primaryIndex')) || 0;
    var sa = providerGetItem('prevArr') || false;
    if(sa) try { prevArr = JSON.parse(sa); } catch (e){ prevArr = []; }
    var sa = providerGetItem('medHistory') || false;
    if(sa) try { medHistory = JSON.parse(sa); } catch (e){ medHistory = []; }
    var sa = providerGetItem('medFavorites') || false;
    if(sa) try { medFavorites = JSON.parse(sa); } catch (e){ medFavorites = []; }
    sa = providerGetItem('aAspects') || '{}';
    try { aAspects = JSON.parse(sa); } catch (e){ aAspects = {}; }
    sa = providerGetItem('aZooms') || '{}';
    try { aZooms = JSON.parse(sa); } catch (e){ aZooms = {}; }
    sa = providerGetItem('aAudios') || '{}';
    try { aAudios = JSON.parse(sa); } catch (e){ aAudios = {}; }
    sa = providerGetItem('aSubs') || '{}';
    try { aSubs = JSON.parse(sa); } catch (e){ aSubs = {}; }
    sShowNum = parseInt(providerGetItem('sShowNum'));
    if(isNaN(sShowNum)) sShowNum = 1;
    sShowName = parseInt(providerGetItem('sShowName'));
    if(isNaN(sShowName)) sShowName = 1;
    sShowPikon = parseInt(providerGetItem('sShowPikon'));
    if(isNaN(sShowPikon)) sShowPikon = 1;
    sShowProgress = parseInt(providerGetItem('sShowProgress'));
    if(isNaN(sShowProgress)) sShowProgress = 1;
    sShowArchive = parseInt(providerGetItem('sShowArchive')) || 0;
    sShowProgram = parseInt(providerGetItem('sShowProgram'));
    if(isNaN(sShowProgram)) sShowProgram = 1;
    sShowDescr = parseInt(providerGetItem('sShowDescr'));
    if(isNaN(sShowDescr)) sShowDescr = 1;
    sPreview = parseInt(providerGetItem('sPreview')) || 0;
    sNextCount = parseInt(providerGetItem('sNextCount')) || 0;
    sNextCountL = sNextCount+1; if(sNextCount==-1) sNextCount = 0;
    // if(isNaN(sNextCount)) sNextCount = 3;
    sPlayers = parseInt(providerGetItem('sPlayers')) || 0;

    if(typeof(setPlayer) === "function") setPlayer();

    $(launch_id).append(_('<br/>Loading channel list...'));
    getChanelsArray(onChanelsLoaded);
}

$(document).ready(function(){
    if (typeof xxHash32 === "undefined") {
        $.getScript(host+'/js/helpers.js?'+__cv, function(){ startPlayer(); }).fail(function(){ $(launch_id).append('<br/>Cannot load helpers.js...'); });
    } else { startPlayer(); }
});
