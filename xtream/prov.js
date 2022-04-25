version += ' xc-0611';
var login, pass, ts_hls, apiUrl = '';
parental = /XXX/;
function alertXT(){alert(_('To access you must enter url, username and password!'));}

function getChannelPicon(ch_id){ return chanels[ch_id].img; }
function getChannelUrl(ch_id){ return apiUrl + '/live/'+login+'/'+pass+'/'+ch_id+['.ts', '.m3u8'][ts_hls]; }
function getArchiveUrl(ch_id, time, time_to){
    function d2xtream(dat){
        function t2(a){return (a.toString().length == 1) ? '0'+a : a;}
        var nw = new Date(dat*1000);
        return nw.getUTCFullYear() + '-' + t2(nw.getUTCMonth()+1) + '-' + t2(nw.getUTCDate()) + ':' + t2(nw.getUTCHours()) + '-' + t2(nw.getUTCMinutes());
    }
    if(time_to < time) time_to = Date.now()/1000;
    if(browserName() == 'dune') time_to = Math.floor(time_to) + 7200;
    return apiUrl + '/timeshift/'+login+'/'+pass+'/'+Math.floor((time_to-time)/60)+'/'+d2xtream(time)+'/'+ch_id+['.ts', '.m3u8'][ts_hls];
    // return apiUrl + '/streaming/timeshift.php?username='+login+'&password='+pass+'&stream='+ch_id+'&start='+d2xtream(time)+'&duration='+Math.floor((time_to-time)/60);//+'&type=m3u8';
}
if(typeof catsArray == 'undefined') var catsArray = [];
function addChan2cat(cat, ci){
    if(!cat) return;
    if(!cats[cat]){ catsArray.push(cat); cats[cat] = []; }
    cats[cat].push(ci);
}
function getChanelsArray(callback){
    if(!login || !pass){ alertXT(); callback(); return; }
    var live_categories = {};
    $.ajax({
        url: apiUrl + '/player_api.php',
        data: {username: login, password: pass, action: 'get_live_categories'},
        timeout: 30000,
        success: function(data){
            // console.log(data);
            if(data !== null) try{
                if(data.user_info) alert('auth');
                else data.forEach(function(val, i, arr){
                    live_categories[val.category_id] = val.category_name;
                    catsArray.push(val.category_name);
                    cats[val.category_name] = [];
                    if(val.parent_id) parental = new RegExp(preg_quote(val.title));
                });
            } catch (e) {}
            $.ajax({
                url: apiUrl + '/player_api.php',
                data: {username: login, password: pass, action: 'get_live_streams'},
                timeout: 30000,
                success: function(data){
                    // console.log(data);
                    if(data !== null) try{
                        if(data.user_info) alert('auth');
                        else {
                            data.forEach(function(val){
                                // console.log(val);
                                // if(val.tv_archive != 0) console.log(val.tv_archive,val.tv_archive_duration);
                                chanels[val.stream_id] = {ch_id: val.stream_id, channel_name: val.name, category: {'class': val.category_id, name: live_categories[val.category_id]}, rec: val.tv_archive_duration*24,
                                    time: 0, time_to: 0, duration: 0, name: '', descr: '', img: val.stream_icon
                                };
                                if(browserName() == 'dune') cList.push(val.stream_id);
                                addChan2cat(live_categories[val.category_id], val.stream_id);
                            });
                        }
                    } catch (e) {}
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.log( 'get_live_streams : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
                    alert( _('Failed to load channel list!')  +' channel_list : : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown);
                },
                complete: function(jqXHR, textStatus){
                    if(browserName() != 'dune')
                        catsArray.forEach(function(cn){ cats[cn].forEach(function(val){ cList.push(val); }); });
                    callback();
                }
            });
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log( 'get_live_categories : : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
            alert( 'get_live_categories failed! : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown);
            callback();
        },
    });
}

// function getChanelsArray(callback){
//     if(!apiUrl || !login || !pass){ alertXT(); callback(); return; }
//     var live_categories = {};
//     $.ajax({
//         url: apiUrl + '/player_api.php',
//         data: {username: login, password: pass, action: 'get_live_categories'},
//         timeout: 30000,
//         success: function(data){
//             // console.log(data);
//             if(data !== null)
//                 if(data.user_info) alert('auth');
//                 else data.forEach(function(val, i, arr){
//                     live_categories[val.category_id] = val.category_name;
//                     catsArray.push(val.category_name);
//                     cats[val.category_name] = [];
//                     if(val.parent_id) parental = new RegExp(preg_quote(val.title));
//                 });
//         },
//         error: function(jqXHR, textStatus, errorThrown){
//             console.log( 'get_live_categories : : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
//             alert( "get_live_categories failed!" +'login : : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown);
//         },
//         // complete: function(jqXHR, textStatus){
//         // }
//         async: false
//     });
//     $.ajax({
//         url: apiUrl + '/player_api.php',
//         data: {username: login, password: pass, action: 'get_live_streams'},
//         timeout: 30000,
//         // dataType: "json",
//         success: function(data){
//             try{
//                 // console.log(data);
//                 if(data !== null)
//                     if(data.user_info) alert('auth');
//                     else {
//                         data.forEach(function(val, i, arr){
//                             // console.log(val);
//                             // if(val.tv_archive != 0) console.log(val.tv_archive,val.tv_archive_duration);
//                             chanels[val.stream_id] = {ch_id: val.stream_id, channel_name: val.name, category: {'class': val.category_id, name: live_categories[val.category_id]}, rec: val.tv_archive_duration*24,
//                                 time: 0, time_to: 0, duration: 0, name: '', descr: '',
//                                 img: val.stream_icon
//                             };
//                             cList.push(val.stream_id);
//                             addChan2cat(live_categories[val.category_id], val.stream_id);
//                         });
//                     }
//             } catch (e) {}
//         },
//         error: function(jqXHR, textStatus, errorThrown){
//             console.log( 'get_live_streams : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
//             alert( _('Failed to load channel list!')  +'channel_list2 : : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown);
//         },
//         complete: function(jqXHR, textStatus){
//             callback();
//         }
//     });
// }
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {
    Array.prototype.map = function(callback/*, thisArg*/) {
        var T, A, k;
        if (this == null) { throw new TypeError('this is null or not defined');}
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== 'function') { throw new TypeError(callback + ' is not a function');}
        if (arguments.length > 1) { T = arguments[1];}
        A = new Array(len);
        k = 0;
        while (k < len) {
            var kValue, mappedValue;
            if (k in O) {
                kValue = O[k];
                mappedValue = callback.call(T, kValue, k, O);
                A[k] = mappedValue;
            }
            k++;
        }
        return A;
    };
}
if (typeof TextEncoder === "undefined") {
    TextEncoder=function TextEncoder(){};
    TextEncoder.prototype.encode = function encode(str) {
        "use strict";
        var Len = str.length, resPos = -1;
        // The Uint8Array's length must be at least 3x the length of the string because an invalid UTF-16
        //  takes up the equivelent space of 3 UTF-8 characters to encode it properly. However, Array's
        //  have an auto expanding length and 1.5x should be just the right balance for most uses.
        var resArr = typeof Uint8Array === "undefined" ? new Array(Len * 1.5) : new Uint8Array(Len * 3);
        for (var point=0, nextcode=0, i = 0; i !== Len; ) {
            point = str.charCodeAt(i), i += 1;
            if (point >= 0xD800 && point <= 0xDBFF) {
                if (i === Len) {
                    resArr[resPos += 1] = 0xef/*0b11101111*/; resArr[resPos += 1] = 0xbf/*0b10111111*/;
                    resArr[resPos += 1] = 0xbd/*0b10111101*/; break;
                }
                // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                nextcode = str.charCodeAt(i);
                if (nextcode >= 0xDC00 && nextcode <= 0xDFFF) {
                    point = (point - 0xD800) * 0x400 + nextcode - 0xDC00 + 0x10000;
                    i += 1;
                    if (point > 0xffff) {
                        resArr[resPos += 1] = (0x1e/*0b11110*/<<3) | (point>>>18);
                        resArr[resPos += 1] = (0x2/*0b10*/<<6) | ((point>>>12)&0x3f/*0b00111111*/);
                        resArr[resPos += 1] = (0x2/*0b10*/<<6) | ((point>>>6)&0x3f/*0b00111111*/);
                        resArr[resPos += 1] = (0x2/*0b10*/<<6) | (point&0x3f/*0b00111111*/);
                        continue;
                    }
                } else {
                    resArr[resPos += 1] = 0xef/*0b11101111*/; resArr[resPos += 1] = 0xbf/*0b10111111*/;
                    resArr[resPos += 1] = 0xbd/*0b10111101*/; continue;
                }
            }
            if (point <= 0x007f) {
                resArr[resPos += 1] = (0x0/*0b0*/<<7) | point;
            } else if (point <= 0x07ff) {
                resArr[resPos += 1] = (0x6/*0b110*/<<5) | (point>>>6);
                resArr[resPos += 1] = (0x2/*0b10*/<<6)  | (point&0x3f/*0b00111111*/);
            } else {
                resArr[resPos += 1] = (0xe/*0b1110*/<<4) | (point>>>12);
                resArr[resPos += 1] = (0x2/*0b10*/<<6)    | ((point>>>6)&0x3f/*0b00111111*/);
                resArr[resPos += 1] = (0x2/*0b10*/<<6)    | (point&0x3f/*0b00111111*/);
            }
        }
        if (typeof Uint8Array !== "undefined") return resArr.subarray(0, resPos + 1);
        // else // IE 6-9
        resArr.length = resPos + 1; // trim off extra weight
        return resArr;
    };
    TextEncoder.prototype.toString = function(){return "[object TextEncoder]"};
    try { // Object.defineProperty only works on DOM prototypes in IE8
        Object.defineProperty(TextEncoder.prototype,"encoding",{
            get:function(){if(TextEncoder.prototype.isPrototypeOf(this)) return"utf-8";
                           else throw TypeError("Illegal invocation");}
        });
    } catch(e) { /*IE6-8 fallback*/ TextEncoder.prototype.encoding = "utf-8"; }
    if(typeof Symbol!=="undefined")TextEncoder.prototype[Symbol.toStringTag]="TextEncoder";
}
function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
function getEPGchanel(ch_id, callback){
    var d = null;
    $.ajax({
        url: apiUrl + '/player_api.php',
        data: {username: login, password: pass, action: 'get_simple_data_table', stream_id: ch_id},
        // dataType: "json",
        success: function(data){
            try{
                // console.log(data);
                if(data !== null)
                    if(data.user_info) alert('auth');
                    else {
                        d = [];
                        data.epg_listings.forEach(function(val, i, arr){
                            if((val.stop_timestamp>Date.now()/1000) || (val.has_archive))
                            d.push( {time: val.start_timestamp, time_to: val.stop_timestamp, duration: val.stop_timestamp-val.start_timestamp, name: b64DecodeUnicode(val.title), descr: b64DecodeUnicode(val.description)} );
                        });
                    }
            } catch (e) {}
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log( 'get_simple_data_table : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
        },
        complete: function(jqXHR, textStatus){
            callback(ch_id, d);
        }
    });
}
function getEPGchanelCur(ch_id, callback){
    var d = null;
    $.ajax({
        url: apiUrl + '/player_api.php',
        data: {username: login, password: pass, action: 'get_short_epg', stream_id: ch_id},
        // dataType: "json",
        success: function(data){
            try{
                // console.log(data);
                if(data !== null)
                    if(data.user_info) alert('auth');
                    else {
                        d = [];
                        data.epg_listings.forEach(function(val, i, arr){
                            // console.log(val);
                            d.push( {time: val.start_timestamp, time_to: val.stop_timestamp, duration: val.stop_timestamp-val.start_timestamp, name: b64DecodeUnicode(val.title), descr: b64DecodeUnicode(val.description)} );
                        });
                    }
            } catch (e) {}
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log( 'get_short_epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
        },
        complete: function(jqXHR, textStatus){
            callback(ch_id, d);
        }
    });
}

function getVodInfo(vod_id){
    function it(val, title){ return val ? '<b>'+_(title)+': </b>'+val+'<br>' : ''; }
    function item2descr(item){
        return '<table><img height="285" src="'+item.cover_big+'" style="float: left; margin-right: 5px; margin-bottom: 5px; border-width: 0px; border-style: solid;" width="210">'
            + it(item.releasedate, 'Release date') + it(item.duration+' '+_('min'), 'Duration') + it(item.genre, 'Genre') + it(item.country, 'Country') + it(item.director, 'Director') + it(item.actors, 'Actors')
            + '<p><hr><b>'+_('Description')+': </b>'+item.plot+'</p></table>';
    }
    var inf = '';
    $.ajax({
        url: apiUrl + '/player_api.php',
        data: {username: login, password: pass, action: 'get_vod_info', vod_id: vod_id},
        // dataType: "json",
        success: function(data){
            try{
                // console.log(data);
                if(data !== null)
                    if(data.user_info) alert('auth');
                    else inf = item2descr(data.info);
            } catch (e) {}
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log( 'get_vod_info : ' + vod_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
        },
        async: false
    });
    return inf;
}

var curSerie = null;
function getMediaArray(murl, callback){
    function it(val, title){ return val ? '<b>'+_(title)+': </b>'+val+'<br>' : ''; }
    function im(val){ return val ? '<img height="285" src="'+val+'" style="float: left; margin-right: 5px; margin-bottom: 5px; border-width: 0px; border-style: solid;" width="210">' : ''; }
    function id(val){ return val ? '<p><hr><b>'+_('Description')+': </b>'+val+'</p>' : ''; }
    function serie2descr(item){
        return '<table>'+im(item.cover)
            + it(item.releaseDate, 'Release date') + it(Math.round(item.episode_run_time)+' '+_('min'), 'Duration') + it(item.genre, 'Genre') + it(item.director, 'Director') + it(item.cast, 'Actors')
            + id(item.plot)+'</table>';
    }
    function season2descr(item){
        return '<table>'+im(item.cover)
             + it(item.season_number, 'Season') + it(item.air_date, 'Release date') + it(item.episode_count, 'Episodes')
             + id(item.overview)+'</table>';
    }
    function episode2descr(item){
        return '<table>'+im(item.movie_image)
            + it(item.releaseDate, 'Release date') + it(Math.round(item.duration_secs/60)+' '+_('min'), 'Duration') + it(item.rating, 'Rating')
            + id(item.plot)+'</table>';
    }

    if(murl === ''){
        mediaName = 'Media from '+provName;
        mediaRecords = [
            {title: _('VOD'), description: _('VOD'), logo_30x30: '', playlist_url: {action: 'get_vod_categories', mediaName: _('VOD')}},
            {title: _('TV series'), description: _('TV series'), logo_30x30: '', playlist_url: {action: 'get_series_categories', mediaName: _('TV series')}},
        ];
        callback();
        return;
    }else
    if (murl.action=='get_season'){
        curSerie.episodes[murl.season_number].forEach(function(ep){
            // console.log(ep.title);
            mediaRecords.push( {title: _('Episode')+' '+ep.episode_num + (ep.info.name?' '+ep.info.name:''), logo_30x30: ep.info.movie_image, description: episode2descr(ep.info), stream_url: apiUrl + '/series/'+login+'/'+pass+'/'+ep.id+'.'+ep.container_extension} );
        });
        callback();
        return;
    }
    var data = {username: login, password: pass};
    for (key in murl) {
        if(key != 'mediaName')
            data[key] = murl[key];
    }

    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40"> '+_('Download! Wait ...')).show();
    $.ajax({
        url: apiUrl + '/player_api.php',
        data: data,
        success: function(data){
            try{
                // console.log(data);
                if(data !== null)
                    if(data.user_info) alert('auth');
                    else {
                        // mediaName = murl.page ? murl.page : '1';
                        mediaName = murl.mediaName;// ? murl.mediaName : '?';
                        mediaRecords = [];
                        if(Array.isArray(data))
                        data.forEach(function(val){
                            switch (murl.action) {
                                case 'get_vod_categories':
                                    mediaRecords.push( {title: val.category_name, logo_30x30: '', description: '', playlist_url: {action: 'get_vod_streams', category_id: val.category_id, mediaName: val.category_name}} );
                                    break;
                                case 'get_vod_streams':
                                    mediaRecords.push( {title: val.name, logo_30x30: val.stream_icon, description: function(){return getVodInfo(val.stream_id);}, stream_url: apiUrl + '/movie/'+login+'/'+pass+'/'+val.stream_id+'.'+val.container_extension} );
                                    break;
                                case 'get_series_categories':
                                    mediaRecords.push( {title: val.category_name, logo_30x30: '', description: '', playlist_url: {action: 'get_series', category_id: val.category_id, mediaName: val.category_name}} );
                                    break;
                                case 'get_series':
                                    // mediaRecords.push( {title: val.name, logo_30x30: '', description: '', playlist_url: {action: 'get_series', category_id: val.category_id, mediaName: val.category_name}} );
                                    mediaRecords.push( {title: val.name, logo_30x30: val.cover, description: serie2descr(val), playlist_url: {action: 'get_series_info', series_id: val.series_id, mediaName: val.name}} );
                                    // mediaRecords.push( {title: val.name, logo_30x30: val.cover, description: '', 'stream_url': function(){return getMovieUrl(val.stream_id);}} );
                                    break;
                                default:
                                    mediaRecords.push( {title: '??????', logo_30x30: '', description: '', stream_url: ''} );
                            }
                        });
                        else {
                            curSerie = data;
                            // mediaRecords.push( {title: data.info.name, logo_30x30: data.info.cover, description: '', playlist_url: {action: 'get_series_info', series_id: data.series_id, mediaName: mediaName}} );
                            if(data.seasons.length)
                                data.seasons.forEach(function(ses, i, arr){
                                    if(data.episodes[ses.season_number])
                                        mediaRecords.push( {title: ses.name, logo_30x30: ses.cover, description: season2descr(ses), playlist_url: {action: 'get_season', season_number: ses.season_number, mediaName: ses.name}} );
                                });
                            else for (var sn in data.episodes) {
                                // console.log(sn);
                                mediaRecords.push( {title: _('Season')+' '+sn, logo_30x30: '', description: '', playlist_url: {action: 'get_season', season_number: sn, mediaName: _('Season')+' '+sn}} );
                            };
                        }
                    }
            } catch (e) {}
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log( 'medias : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus:'+textStatus+ ' ,errorThrown: '+errorThrown );
        },
        complete: function(jqXHR, textStatus){
            $('#dialogbox').hide();
            callback();
        },
    });
}

function doUserInfo(){
    function d2xtream(dat){
        function t2(a){return (a.toString().length == 1) ? '0'+a : a;}
        var nw = new Date(dat*1000);
        return nw.getFullYear() + '-' + t2(nw.getMonth()+1) + '-' + t2(nw.getDate());
    }
    aboutKeyHandler = function (code){ $('#listAbout').hide(); return true; };
    $('#listAbout').html('Loading info. Please wait...').show();
    $.ajax({
        url: apiUrl + '/player_api.php', data: {username: login, password: pass}, timeout: 10000,
        success: function(data){
            // console.log(data);
            if(data !== null)
                if(data.user_info.auth != 1) $('#listAbout').html('Authentification failed!');
                else $('#listAbout').html(_('Account info')+
                        ':<br/><br/>username: ' + data.user_info.username +
                        '<br/>status: ' + data.user_info.status +
                        '<br/>exp_date: ' + d2xtream(data.user_info.exp_date) +
                        '<br/>max_connections: ' + data.user_info.max_connections +
                        '<br/>active_cons: ' + data.user_info.active_cons
                    );
        },
        error: function(jqXHR, textStatus, errorThrown){
            $('#listAbout').html( 'get_user_info failed!<br/><br/>jqXHR:'+JSON.stringify(jqXHR)+ '<br/>textStatus: '+textStatus+ '<br/>errorThrown: '+errorThrown );
            // alert( "get_user_info failed!" +' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown);
        }
    });
}


version += ' xtream-0610';
var apiUrl = '', provName = 'xс';
p_pref = 'xc';

function keyNames4(keyName){
    // console.log(keyName);
    if(pdsa.indexOf(keyName) != -1) keyName += xcParams.active || '';
    return keyName;
}
function providerGetItem(keyName){
    if(typeof(stbGetItem)==='function')
        return stbGetItem(p_pref + keyNames4(keyName));
    else
        return localStorage.getItem(p_pref + keyNames4(keyName));
}
function providerSetItem(keyName, keyValue){
    if(typeof(stbSetItem)==='function')
        stbSetItem(p_pref + keyNames4(keyName), keyValue);
    else
        localStorage.setItem(p_pref + keyNames4(keyName), keyValue);
}
function loadXcParams(){
    xcParams = providerGetItem("Params");
    if(!xcParams) xcParams = {active:0, servers: []};
    else xcParams = JSON.parse(xcParams);
    for(var i = xcParams.servers.length; i < 6; i++)
        xcParams.servers[i] = {url:'', login:'', password:'', ts_hls:0};

    apiUrl = xcParams.servers[xcParams.active].url;
    login = xcParams.servers[xcParams.active].login;
    pass = xcParams.servers[xcParams.active].password;
    ts_hls = xcParams.servers[xcParams.active].ts_hls;
}

function getProviderParams(){
    loadXcParams();
    for(var i = 0; i < 6; i++){
        $("#xcUrl"+i).val(xcParams.servers[i].url);
        $("#xcLogin"+i).val(xcParams.servers[i].login);
        $("#xcPassword"+i).val(xcParams.servers[i].password);
    }
    $('input:radio[name=odin]').filter('[value='+xcParams.active+']').attr('checked', true);
    ts_hls = 1;
    if((login.length < 4) || (pass.length < 4)) alertXT();
    return (login.length >= 4) && (pass.length >= 4);
}
function setProviderParams(){
    for(var i = 0; i < 6; i++){
        xcParams.servers[i].url = $("#xcUrl"+i).val().trim();
        xcParams.servers[i].login = $("#xcLogin"+i).val().trim();
        xcParams.servers[i].password = $("#xcPassword"+i).val().trim();
    }
    xcParams.active = $("input[name=odin]:checked").val();
    var changed = JSON.stringify(xcParams) != providerGetItem("Params");
    providerSetItem("Params", JSON.stringify(xcParams));
    loadXcParams();

    if((login.length < 4) || (pass.length < 4)) alertXT();
    return changed;
}

function _xc2popup(){
    var p = provName+': ';
    popupArray[popupActions.indexOf(doEditNumber)] = p+_('Server')+' '+(parseInt(xcParams.active)+1);
    popupArray[popupActions.indexOf(doEditUrl)] = p+_('URL')+': '+apiUrl;
    popupArray[popupActions.indexOf(edit_login)] = p+_('Username')+': '+login;
    popupArray[popupActions.indexOf(edit_pass)] = p+_('Password');//+': '+pass;
    popupArray[popupActions.indexOf(doEditType)] = p+_('Stream type')+': '+['MPEGTS', 'HLS'][ts_hls];
}
function duneAddSettings(ind){
    if(isNaN(parseInt(providerGetItem('sShowArchive')))) providerSetItem('sShowArchive', 1);
    loadXcParams();
    var r = _(' (after changing, restart player)'), c = _(' (after changing, switch the channel!)');
    popupArray.splice(ind, 0, '', '', '', '', '', provName+': '+_('Account info'));
    popupDetail.splice(ind, 0, 'Select server number from 1 to 6 to save data'+r,
        _('Enter URL of server')+r, _('Enter username')+r, _('Enter password')+r, _('Select stream type')+c, 'Xtream codes '+_('Account info'));
    popupActions.splice(ind, 0, doEditNumber, doEditUrl, edit_login, edit_pass, doEditType, doUserInfo);
    _xc2popup();
}
function doEditNumber(){
    xcParams.active++;
    if(xcParams.active==6) xcParams.active = 0;
    providerSetItem("Params", JSON.stringify(xcParams));
    loadXcParams();
    _xc2popup();
    // showPage();
    popupList(doEditNumber);
}
function doEditUrl(){
    editCaption = _('Enter URL of server');
    editvar = apiUrl;
    setEdit = function(){
        if(apiUrl == editvar.trim()) return;
        if(editvar.length < 4){ alertXT(); showEditKey([0,2]); return; }
        pdsa.forEach(function(val, i, arr){ providerSetItem(val, ''); });
        apiUrl = editvar.trim();
        xcParams.servers[xcParams.active].url = apiUrl;
        providerSetItem("Params", JSON.stringify(xcParams));
        _xc2popup();
        popupList(doEditUrl);
    };
    showEditKey([0,2]);
}
function edit_login(){
    editCaption = _('Enter username')+' '+provName;
    editvar = login;
    setEdit = function(){
        if(login == editvar.trim()) return;
        if(editvar.length < 4){ alertXT(); showEditKey([0,1,2]); return; }
        login = editvar.trim();
        xcParams.servers[xcParams.active].login = login;
        providerSetItem("Params", JSON.stringify(xcParams));
        _xc2popup();
        popupList(edit_login);
    };
    showEditKey([0,1,2]);
}
function edit_pass(){
    editCaption = _('Enter password')+' '+provName;
    editvar = pass;
    setEdit = function(){
        if(pass == editvar.trim()) return;
        if(editvar.length < 4){ alertXT(); showEditKey([0,1,2]); return; }
        pass = editvar.trim();
        xcParams.servers[xcParams.active].password = pass;
        providerSetItem("Params", JSON.stringify(xcParams));
        _xc2popup();
    };
    showEditKey([0,1,2]);
}
function doEditType(){
    if(++ts_hls>1) ts_hls = 0;
    xcParams.servers[xcParams.active].ts_hls = ts_hls;
    providerSetItem("Params", JSON.stringify(xcParams));
    _xc2popup();
    // showPage();
    popupList(doEditType);
}
