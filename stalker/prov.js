version += ' sapi-0424';
parental = /not/;
var stalkerPortal, stalkerLogin, stalkerPassword, stalkerMAC, stalkerToken = '';

var cpstype=0; // 0 - php proxy, 1 - android intercept
function doCPS(params, ajaxData){
    if(stalkerPortal.indexOf('http')!=0) stalkerPortal = 'http://'+stalkerPortal;
    var mac = stalkerLogin ? stalkerMAC : ('00:1A:79'+stalkerMAC.substring(8));
    // mac = '00:1A:79'+stalkerMAC.substring(8);
    ajaxData.data = 'authorization='+encodeURIComponent('Bearer '+stalkerToken)+'&cookie='+encodeURIComponent('mac='+mac+'; path=/;')+'&url='+encodeURIComponent(stalkerPortal+'/stalker_portal/server/load.php?JsHttpRequest=1-xml&'+params);
    ajaxData.url = 'http://ott.augin.ru/stalker/cps.php';
    // ajaxData.url = 'http://51.38.147.71/cps.php';
    if(cpstype==0) { ajaxData.type = 'POST'; ajaxData.processData = false; }
    ajaxData.dataType = 'json';
    if(!ajaxData.timeout) ajaxData.timeout = 10000;
    $.ajax(ajaxData);
}
// function doCPS1(params, ajaxData){ // нгикс прокси - андроид перехват
//     // ajaxData.url = 'http://51.91.39.121/stalker';
//     // ajaxData.url = 'http://51.38.147.71/stalker/';
//     ajaxData.url = 'http://51.38.147.71/cps.php';
//     // ajaxData.url = 'http://cps.ott-play.com/cps.php';
//     // ajaxData.url = 'http://cps.ott-play.com/stalker';
//     ajaxData.data = 'authorization='+encodeURIComponent('Bearer '+stalkerToken)+'&cookie='+encodeURIComponent('mac='+stalkerMAC+'; path=/;')+'&url='+encodeURIComponent(stalkerPortal+'/stalker_portal/server/load.php?JsHttpRequest=1-xml&'+params);
//     ajaxData.dataType = 'json';
//     if(!ajaxData.timeout) ajaxData.timeout = 10000;
//     $.ajax(ajaxData);
// }
// function doCPS2(params, ajaxData){ // андроид query
//     if(typeof(stbAjaxProxy) != "function"){ doCPS(params, ajaxData); return; }
//     ajaxData.headers = {
//         Authorization: 'Bearer '+stalkerToken,
//         Cookie: 'mac='+stalkerMAC+'; path=/;'
//     };
//     ajaxData.url = stalkerPortal+'/stalker_portal/server/load.php?JsHttpRequest=1-xml&'+params;
//     ajaxData.dataType = 'json';
//     if(!ajaxData.timeout) ajaxData.timeout = 10000;
//
//     function doA(){
//         var ans = stbAjaxProxy(ajaxData);
//         console.log(ans);
//         // if(typeof ans == "string") ans = JSON.parse(ans);
//         if(ajaxData.success) ajaxData.success(ans);
//         // if(ajaxData.error)ajaxData.error(ans);
//         if(ajaxData.complete) ajaxData.complete();
//     }
//     if((typeof(ajaxData.async) != "undefined") && !ajaxData.async) doA();
//     else setTimeout(doA);
// }

function getChannelPicon(ch_id){
    url = chanels[ch_id].logo;
    if(url && (url.indexOf('http') === -1)){
        url = stalkerPortal+'/stalker_portal/misc/logos/320/'+url;
        if(url.indexOf('http') === -1) url = 'http://'+url;
    }
    return url;
}
function getChannelUrl(ch_id){
    var url = chanels[ch_id].url || '';
    if(url === '')
        doCPS('type=itv&action=create_link&cmd='+encodeURIComponent(chanels[ch_id].cmd)+'&series=&forced_storage=0&disable_ad=0&download=0&force_ch_link_check=0',
            {
                success: function(data){
                    try{ if(data && data.js) url = (data.js.cmd || '').split(' ').pop(); } catch(e){}
                },
                // error: function(jqXHR, textStatus, errorThrown){ console.log( 'url : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
                async: false,
            }
        );
    // console.log(url);
    return url;
}
fileArchive = true;
function getArchiveUrl(ch_id, time, time_to, arch){
    var url = '';
    if(!arch) alert('Что то пошло не так((( Нет такого архива в ЕПГ!!! Попробуйте сбросить кеш и перезагрузить страницу');
    else
        doCPS('type=tv_archive&action=create_link&cmd=auto%20/media/'+arch.rec_id+'.mpg&series=&forced_storage=&disable_ad=0&download=0&force_ch_link_check=0',
            {
                success: function(data){
                    try{ if(data && data.js) url = encodeURI((data.js.cmd || '').split(' ').pop()); } catch(e){}
                },
                // error: function(jqXHR, textStatus, errorThrown){ console.log( 'url : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
                async: false,
            }
        );
    return url;
}

function handshake(){
    var access_token = '', random = '', not_valid_token = 1;
    if(!stalkerPortal) return 1;
    doCPS('type=stb&action=handshake&token='+stalkerToken+'&prehash=false', {
        success: function(result){
            try{
                // console.log(result);
                if(result && result.js && result.js.token){
                    access_token = result.js.token || '';
                    random       = result.js.random || '';
                    not_valid_token = result.js.not_valid || 0;
                    stalkerToken = access_token;
                    providerSetItem("Token", access_token);
                    if(not_valid_token) get_profile(random, not_valid_token);
                }
            } catch(e){}
        },
        // error: function(jqXHR){ console.log( 'handshake : jqXHR:'+JSON.stringify(jqXHR) );},
        async: false,
    });
    return not_valid_token;
}

function get_profile(random, not_valid_token){
    // if(typeof(stb) == 'undefined') stb = {};
    // var device_id = '';//stb.GetUID ? stb.GetUID() : '';
    // // var device_id2 = 'B487A6950CBE3450707D6CF2CE5719DB56DC5195DA7F1BE32ED079192CAFA563';
    // var device_id2 =  '';//stb.GetUID ? (stb.GetUID(access_token) == stb.GetUID(access_token, access_token) ? '' : stb.GetUID('device_id', access_token)) : '';
    // var signature = '';//stb.GetUID ? stb.GetUID(random) : '';
    // var metrics = {mac:stalkerMAC, sn:'072013J027842', model:'MAG250', type:"STB", uid:device_id2, random: random};
    // var hw_version_2 = stb.GetHashVersion1 ? stb.GetHashVersion1(JSON.stringify(metrics), random) : '';
    // alert(device_id2+' : '+hw_version_2);
    doCPS(
        'type=stb&action=get_profile&hd=1&ver=ImageDescription:%200.2.18-r14-pub-250;%20ImageDate:%20Fri%20Jan%2015%2015:20:44%20EET%202016;%20PORTAL%20version:%205.6.1;%20API%20Version:%20JS%20API%20version:%20328;%20STB%20API%20version:%20134;%20Player%20Engine%20version:%200x566'+
        '&num_banks=2&sn=022017J014405&stb_type=MAG250&client_type=STB&image_version=218&video_out=hdmi&device_id=&device_id2=&signature=&auth_second_step=1&hw_version=1.7-BD-00&not_valid_token=0&metrics=%7B%22mac%22%3A%2200%3A1A%3A79%3A16%3A1E%3A5C%22%2C%22sn%22%3A%22022017J014405%22%2C%22model%22%3A%22MAG250%22%2C%22type%22%3A%22STB%22%2C%22uid%22%3A%22%22%2C%22random%22%3A%22b259a8528d21585b7ec7b10ee5c147a38173722d%22%7D&hw_version_2=f8e5119920ba8418cb383520cfc8852a725df9eb'+
        '&timestamp='+Math.round(new Date().getTime()/1000)+
        '&api_signature=263&prehash=false',
        // 'type=stb&action=get_profile'+
        // '&hd=1'+
        // // '&ver=ImageDescription:%200.2.18-r22-250;%20ImageDate:%20Tue%20Dec%2019%2011:13:16%20EET%202017;%20PORTAL%20version:%205.4.1;%20API%20Version:%20JS%20API%20version:%20343;%20STB%20API%20version:%20146;%20Player%20Engine%20version:%200x588'+
        // '&ver=ImageDescription:%200.2.18-r14-pub-250;%20ImageDate:%20Fri%20Jan%2015%2015:20:44%20EET%202016;%20PORTAL%20version:%205.6.1;%20API%20Version:%20JS%20API%20version:%20328;%20STB%20API%20version:%20134;%20Player%20Engine%20version:%200x566'+
        // '&num_banks=2'+
        // '&sn=072013J027842'+
        // '&stb_type=MAG250&client_type=STB&image_version=218&video_out=hdmi'+
        // '&device_id='+device_id+
        // '&device_id2='+device_id2+
        // '&auth_second_step=1&hw_version=1.11-BD-00'+
        // '&not_valid_token='+(not_valid_token ? 1 : 0)+
        // '&metrics='+encodeURIComponent(JSON.stringify(metrics))+
        // '&hw_version_2='+hw_version_2+
        // '&timestamp='+Math.round(new Date().getTime()/1000)+
        // '&api_signature=263'+
        // '&prehash=false',
        // // '&signature='+signature,
    {
        success: function(data){
            console.log(data);
            // if(data !== null) { alert(JSON.stringify(data));}
        },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'get_profile : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        async: false,
    });
}

function do_auth(device_id, device_id2){
    var res = false;
    if(!stalkerPortal) return false;
    if(!stalkerLogin) return true;
    doCPS('type=stb&action=do_auth&login='+stalkerLogin+'&password='+stalkerPassword+'&device_id='+device_id+'&device_id2='+device_id2,
    {
        success: function(result){
            // console.log(result);
            if(result) res = result.js;
        },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'do_auth : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        async: false,
    });
    return res;
}
if(typeof launch_id=='undefined') launch_id = '#launch';
function getChanelsArray(callback){
    var par = null;
    function getChPage(p){
        var last = true;
        $(launch_id).append(_(p+'...'));
        doCPS('type=itv&action=get_ordered_list&genre='+par+'&force_ch_link_check=&p='+p,
        {
            success: function(data){
                // console.log(data);
                data.js.data.forEach(function(val, i, arr){
                    // console.log(val);
                    if(!val.id) alert( "Не удалось загрузить список каналов! Проверьте правильность данных!!" );
                    var url = (parseInt(val.use_http_tmp_link) == 1 || parseInt(val.use_load_balancing) == 1) || (val.cmd.indexOf('localhost') !== -1) ? '' : val.cmd;
                    if(url.indexOf(' ') != -1) url = url.split(' ')[1];
                    var rec = parseInt(val.tv_archive_duration) || 0;
                    cList.push(val.id);
                    chanels[val.id] = {channel_name: val.name, category: {'class': val.tv_genre_id, 'name': (cats[val.tv_genre_id] ? cats[val.tv_genre_id] : '')}, rec: rec, time: 0, time_to: 0, url: url, logo: val.logo, cmd: val.cmd};
                });
                if(data.js.total_items > data.js.max_page_items*p){
                    last = false;
                    getChPage(p+1);
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus:'+textStatus+ ' ,errorThrown: '+errorThrown );
                alert( "Не удалось загрузить список каналов! Проверьте правильность данных!!" );
                last = true;
            },
            complete: function(){
                if(last){
                    callback();
                    setInterval(handshake, 120000); // ping
                }
            },
        });
    }
    function preg_quote( str ){ return str.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1"); }
    $(launch_id).append(_('<br/>Авторизация...'));
    if(handshake() && !do_auth('', '')) {
        alert( "Ошибка авторизации!!!" );
        callback();
        return;
    }
    var cats = {};
    $(launch_id).append(_('Категории...'));
    doCPS('type=itv&action=get_genres',
    {
        success: function(data){
            // console.log(data);
            data.js.forEach(function(val, i, arr){
                // console.log(val);
                if(!val.id) alert( "Не удалось загрузить категории каналов! Проверьте правильность данных!!" );
                else try {
                    cats[val.id] = val.title;
                    if(val.censored){
                        parental = new RegExp(preg_quote(val.title));
                        par = val.id;
                    }
                } catch(e) {
                    console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
                    alert( "Ошибка обработки списка каналов! Проверьте правильность плейлиста!!" );
                }
            });
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log( 'genres : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus:'+textStatus+ ' ,errorThrown: '+errorThrown );
            alert( "Не удалось загрузить категории каналов! Проверьте правильность данных!!" );
        },
        complete: function(){
            $(launch_id).append(_('Каналы...'));
            doCPS('type=itv&action=get_all_channels&force_ch_link_check=',
            {
                success: function(data){
                    // console.log(data);
                    data.js.data.forEach(function(val, i, arr){
                        // console.log(val);
                        if(!val.id) alert( "Не удалось загрузить список каналов! Проверьте правильность данных!!" );
                        var url = (parseInt(val.use_http_tmp_link) == 1 || parseInt(val.use_load_balancing) == 1) || (val.cmd.indexOf('localhost') !== -1) ? '' : val.cmd;
                        if(url.indexOf(' ') != -1) url = url.split(' ')[1];
                        var rec = parseInt(val.tv_archive_duration) || 0;
                        cList.push(val.id);
                        chanels[val.id] = {channel_name: val.name, category: {'class': val.tv_genre_id, 'name': (cats[val.tv_genre_id] ? cats[val.tv_genre_id] : '')}, rec: rec, time: 0, time_to: 0, url: url, logo: val.logo, cmd: val.cmd};
                    });
                    if(data.js.total_items==data.js.data.length) par=null;
                    if(par) getChPage(1);
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus:'+textStatus+ ' ,errorThrown: '+errorThrown );
                    alert( "Не удалось загрузить список каналов! Проверьте правильность данных!!" );
                    par=null;
                },
                complete: function(){
                    if(!par) {
                        callback();
                        setInterval(handshake, 120000); // ping
                    }
                },
                timeout: 180000,
            });
        },
    });
}
var epgDateEnd = Date.now()+5*24*60*60*1000;
function d2stalker(dat){
    function t2(a){return (a.toString().length == 1) ? '0'+a : a;}
    var nw = new Date(dat);
    return nw.getUTCFullYear() + '-' + t2(nw.getUTCMonth()+1) + '-' + t2(nw.getUTCDate());
}
function getEPGchanel4date(ch_id, callback, day, p, d){
    var last = true;
    doCPS('type=epg&action=get_simple_data_table&ch_id='+ch_id+'&date='+d2stalker(day)+'&p='+p,
    {
        success: function(data){
            // console.log(data);
            if(data && data.js){
                if(!d) d = [];
                data.js.data.forEach(function(val, i, arr){
                    d.push( {time: val.start_timestamp, time_to: val.stop_timestamp, duration: val.duration, name: val.name, descr: val.descr, rec_id: val.id} );
                });
                if(data.js.total_items > data.js.max_page_items*p){
                    last = false;
                    getEPGchanel4date(ch_id, callback, day, p+1, d);
                } else
                if(day < epgDateEnd){
                    last = false;
                    getEPGchanel4date(ch_id, callback, day+24*60*60*1000, 1, d);
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){
            if(last) {
                $('#dialogbox').hide();
                if(browserName() === 'dune') stalkerEPG[ch_id] = d;
                callback(ch_id, d);
            }
        },
    });
}
var stalkerEPG = {};
function getEPGchanel1(ch_id, callback){
    if(stalkerEPG[ch_id]){ callback(ch_id, stalkerEPG[ch_id]); return; }
    var d = null;
    dialogBoxKeyHandler = null;
    $('#dialogbox').show();
    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40">   Загрузка ЕПГ! Подождите ...');
    getEPGchanel4date(ch_id, callback, Date.now()-chanels[ch_id].rec*60*60*1000, 1, d);
    return;
}

function getEPGchanel(ch_id, callback){
    if(stalkerEPG[ch_id]){ callback(ch_id, stalkerEPG[ch_id]); return; }
    dialogBoxKeyHandler = null;
    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40">   Загрузка ЕПГ! Подождите ...').show();
    var d = null;
    doCPS('type=epg&action=get_data_table&ch_id='+ch_id+'&p=0&from=' + d2stalker(Date.now()-chanels[ch_id].rec*60*60*1000) + '&to=' + d2stalker(Date.now()+10*24*60*60*1000),
    {
        success: function(data){
            // console.log(data);
            if(data && data.js){
                data.js.data.forEach(function(val, i, arr){
                    d = [];
                    val.epg.forEach(function(val, i, arr){
                        d.push( {time: val.start_timestamp, time_to: val.stop_timestamp, duration: val.duration, name: val.name, descr: val.descr, rec_id: val.id} );
                    });
                    stalkerEPG[val.ch_id] = d;
                });
                d = stalkerEPG[ch_id];
            }
        },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){ $('#dialogbox').hide(); callback(ch_id, d); },
    });
}
var stalkerToday = {t:null, d:0};
function getWeek(){
    if(stalkerToday.d > Date.now()) return stalkerToday.t;
    doCPS('type=epg&action=get_week',
    {
        async: false,
        success: function(data){
            // console.log(data);
            if(data && data.js)
                data.js.forEach(function(val){
                    if(val.today) stalkerToday = {t:val.f_mysql, d:Math.floor((Date.now()+3600000)/3600000)*3600000};
                });
        },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'get_week : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
    });
    // console.log(stalkerToday.t, stalkerToday.d);
    return stalkerToday.t;
}

function getEPGchanelCur(ch_id, callback){
    if(stalkerEPG[ch_id]){ callback(ch_id, stalkerEPG[ch_id]); return; }
    var t = getWeek() || d2stalker(Date.now());
    var d = null;
    doCPS('type=epg&action=get_simple_data_table&ch_id='+ch_id+'&date='+t+'&p=0',
    {
        success: function(data){
            // console.log(data);
            if(data && data.js){
                d = [];
                data.js.data.forEach(function(val, i, arr){
                    if(i+2>data.js.selected_item)
                        d.push( {time: val.start_timestamp, time_to: val.stop_timestamp, duration: val.duration, name: val.name, descr: val.descr, rec_id: val.id} );
                });
            }
        },
        error: function(jqXHR, textStatus, errorThrown){ console.log( 'epgcur : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){ callback(ch_id, d); },
    });
}
function getMovieUrl(mid, ser_n){
    // console.log("getMovieUrl "+id+'-'+ series_number);
    var url = '';
    var cmd = '/media/file_'+mid+'.mpg', ser = ser_n?ser_n:'';
    // /stalker_portal/server/load.php?type=vod&action=create_link&cmd=/media/file_4486.mpg&series=&forced_storage=&disable_ad=0&download=0&force_ch_link_check=0&JsHttpRequest=1-xml
    doCPS('type=vod&action=create_link&cmd='+cmd+'&series='+ser+'&forced_storage=&disable_ad=0&download=0&force_ch_link_check=0',
        {
            success: function(data){
                try{ if(data && data.js) url = encodeURI((data.js.cmd || '').split(' ').pop()); } catch(e){}
            },
            // error: function(jqXHR, textStatus, errorThrown){ console.log( 'getMovieUrl : ' + cmd + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
            async: false,
        }
    );
    return url;
}
function getMovieUrlCmd(cmd, ser_n){
    // console.log("getMovieUrl "+id+'-'+ series_number);
    var url = '', ser = ser_n?'&series='+ser_n:'';
    // /stalker_portal/server/load.php?type=vod&action=create_link&cmd=/media/file_4486.mpg&series=&forced_storage=&disable_ad=0&download=0&force_ch_link_check=0&JsHttpRequest=1-xml
    doCPS('type=vod&action=create_link&cmd='+cmd+ser+'&forced_storage=&disable_ad=0&download=0&force_ch_link_check=0',
        {
            success: function(data){
                try{ if(data && data.js) url = encodeURI((data.js.cmd || '').split(' ').pop()); } catch(e){}
            },
            // error: function(jqXHR, textStatus, errorThrown){ console.log( 'getMovieUrl : ' + cmd + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
            async: false,
        }
    );
    return url;
}

function getMediaArray(murl, callback){
    function it(val, title){ return val ? '<b>'+title+': </b>'+val+'<br>' : ''; }
    function item2descr(item){
        return '<table><img height="285" src="'+stalkerPortal+item.screenshot_uri+'" style="float: left; margin-right: 5px; margin-bottom: 5px; border-width: 0px; border-style: solid;" width="210">'
            + it(item.year, 'Год') + it(item.time?item.time+' мин.':'', 'Продолжительность') + it(item.genres_str, 'Жанр') + it(item.country, 'Страна') + it(item.director, 'Режиссер') + it(item.actors, 'В ролях')
            + '<p><hr><b>Описание: </b>'+item.description+'</p></table>';
    }
    function isLast(data){
        if(data.js.total_items > data.js.max_page_items*murl.p && murl.p%10){
            $('#stinfo').html(data.js.max_page_items*(murl.p%10)+'/'+Math.min(data.js.total_items,data.js.max_page_items*10));
            last = false;
            murl.p = murl.p+1;
            murl.params = murl.params.split('&p=')[0]+'&p='+murl.p;
            getMediaArray(murl, callback);
        } else {
            murl.p = Math.floor((murl.p-1)/10)*10+1;
            murl.params = murl.params.split('&p=')[0]+'&p='+murl.p;
        }
    }
    dialogBoxKeyHandler = null;
    if(!$('#dialogbox').is(":visible"))
        $('#dialogbox').html('<img style="float:left;margin-right:1em;" src="'+host+'/stbPlayer/buffering.gif" height="40">   Загрузка списка! Подождите ...<br/><span id="stinfo"></span>').show();
    var last = true;
    mediaName = murl.mediaName;
    if(murl === ''){
        murl = {action:0, params: 'type=vod&action=get_categories', mediaName: 'Media Stalker'};
    }
    if(murl.action==5){
        mediaRecords = [];
        murl.series.forEach(function(val, i){
            mediaRecords.push( {title: murl.mediaName+' - серия '+val, logo_30x30: murl.logo_30x30, description: murl.description, adult: 0,
                        stream_url: function(){ return getMovieUrlCmd(murl.cmd, val)} });
        });
        $('#dialogbox').hide();
        callback();
        return;
    }
    // ad.params = 'type=vod&action=get_categories';
    // ad.params = 'type=vod&action=get_genres_by_category_alias&cat_alias=movies';
    // ad.params = 'type=vod&action=get_ordered_list&movie_id=0&season_id=0&episode_id=0&category=1&genre=59&sortby=added&hd=0&not_ended=0&p=1';
    // ad.params = 'type=vod&action=get_ordered_list&category=1&genre=59&p=1';
    // ad.params = 'type=vod&action=get_ordered_list&category=3';

    doCPS(murl.params,
    {
        success: function(data){
            console.log(data, murl.action);
            if(data) try{
                switch (murl.action) {
                    case 0:
                        last = true;
                        mediaRecords = [];
                        data.js.forEach(function(val, i, arr){
                            // if(val.alias != '*')
                                mediaRecords.push( {title: val.title, logo_30x30: '', description: val.title, adult: val.censored||0,
                                    playlist_url: {action:1, params: 'type=vod&action=get_genres_by_category_alias&cat_alias='+val.alias, cid:val.id, mediaName: val.title}} );
                        });
                        break;
                    case 1:
                        last = true;
                        mediaRecords = [];
                        data.js.forEach(function(val, i, arr){
                            // if(val.title != '*')
                                mediaRecords.push( {title: val.title, logo_30x30: '', description: murl.mediaName+' - '+val.title, adult: val.censored||0,
                                    playlist_url: {action:4, params: 'type=vod&action=get_ordered_list&category='+murl.cid+'&genre='+val.id+'&p=1', p:1, mediaName: val.title, cid:murl.cid, genre: val.id}} );
                        });
                        break;
                    case 4:
                        if(murl.p==1&&(data.js.total_items > data.js.max_page_items*10)){
                            mediaRecords = [];
                            for (var i = 0; i < (data.js.total_items/data.js.max_page_items/10); i++) {
                                var t = (i*data.js.max_page_items*10+1)+'-'+Math.min((i+1)*data.js.max_page_items*10, data.js.total_items)
                                var m =  {title: t, logo_30x30: '', description: '',
                                    playlist_url: {action:2, params: 'type=vod&action=get_ordered_list&category='+murl.cid+'&genre='+murl.genre+'&p='+(i*10+1), p:i*10+1, mediaName: t}}
                                mediaRecords.push(m);
                            }
                            break;
                        }
                    case 2:
                        if(murl.p==1) mediaRecords = [];
                        data.js.data.forEach(function(val, i){
                            if(val.has_files){
                                mediaRecords.push( {title: val.name, logo_30x30: stalkerPortal+val.screenshot_uri, description: item2descr(val), adult: val.censored||0,
                                    playlist_url: {action:3, params: 'type=vod&action=get_ordered_list&movie_id='+val.id+'&p=1', p:1, cid:val.id, mediaName: val.name, logo_30x30: stalkerPortal+val.screenshot_uri, description: item2descr(val)} });
                            } else {
                                if(val.series.length==0)
                                    mediaRecords.push( {title: val.name, logo_30x30: stalkerPortal+val.screenshot_uri, description: item2descr(val), adult: val.censored||0,
                                        stream_url: function(){return getMovieUrlCmd(val.cmd)} });
                                else
                                    mediaRecords.push( {title: val.name, logo_30x30: stalkerPortal+val.screenshot_uri, description: item2descr(val), adult: val.censored||0,
                                        playlist_url: {action:5, series: val.series, cmd:val.cmd, mediaName: val.name, logo_30x30: stalkerPortal+val.screenshot_uri, description: item2descr(val)} });
                            }
                        });
                        isLast(data);
                        break;
                    case 3:
                        if(murl.p==1) mediaRecords = [];
                        data.js.data.forEach(function(val, i, arr){
                            if(val.is_season){
                                mediaRecords.push( {title: murl.mediaName+' - '+val.name, logo_30x30: murl.logo_30x30, description: murl.description, adult: val.censored||0,
                                    playlist_url: {action:3, params: 'type=vod&action=get_ordered_list&movie_id='+murl.cid+'&season_id='+val.id+'&p=1', p:1, cid:val.id, mediaName: murl.mediaName+' - '+val.name, logo_30x30: murl.logo_30x30, description: murl.description, mid:murl.cid} });
                            }else if(val.is_episode){
                                mediaRecords.push( {title: murl.mediaName+' - '+val.name, logo_30x30: murl.logo_30x30, description: murl.description, adult: val.censored||0,
                                    playlist_url: {action:3, params: 'type=vod&action=get_ordered_list&movie_id='+murl.mid+'&season_id='+murl.cid+'&episode_id='+val.id+'&p=1', p:1, cid:val.id, mediaName: murl.mediaName+' - '+val.name, logo_30x30: murl.logo_30x30, description: murl.description, series_number:val.series_number} });
                            }else{
                                mediaRecords.push( {title: murl.mediaName+' - '+val.name, logo_30x30: murl.logo_30x30, description: murl.description, adult: val.censored||0,
                                    stream_url: function(){return getMovieUrl(val.id, murl.series_number)} });
                            }
                        });
                        isLast(data);
                        break;
                }
            } catch(e) {}//{ last = true; }
        },
        error: function(jqXHR, textStatus, errorThrown){ console.log( 'vod : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){ if(last){ $('#dialogbox').hide(); callback(); } },
    });
}
function _duneAddSettings(){
    stalkerMAC = stb.getMacAddress();
    stalkerToken = providerGetItem("Token") || 'C202C900E598558D0790F96B40E2D378';
    if(isNaN(parseInt(providerGetItem('sShowArchive')))) providerSetItem('sShowArchive', 1);
    if(typeof(stbInterceptRequest) === 'function'){ stbInterceptRequest('cps.php'); cpstype=1; }
}


version += ' stalker-0220';
p_pref = 'stalker';
var stalkerParams, _number = 0;

function keyNames4portal(keyName){
    if(pdsa.indexOf(keyName) != -1) keyName += stalkerParams.active || '';
    return keyName;
}
function providerGetItem(keyName){
    if(typeof(stbGetItem)==='function') return stbGetItem(p_pref + keyNames4portal(keyName));
    else return localStorage.getItem(p_pref + keyNames4portal(keyName));
}
function providerSetItem(keyName, keyValue){
    if(typeof(stbSetItem)==='function') stbSetItem(p_pref + keyNames4portal(keyName), keyValue);
    else localStorage.setItem(p_pref + keyNames4portal(keyName), keyValue);
}

function loadStalkerParams(){
    stalkerParams = providerGetItem("Params");
    if(!stalkerParams){
        stalkerParams = {active:0, portals: []};
    } else
        stalkerParams = JSON.parse(stalkerParams);
    for(var i = stalkerParams.portals.length; i < 6; i++)
        stalkerParams.portals[i] = {url:'', login:'', password:''};

    if(browserName() == 'dune') try{
        var params = window.location.href.split('?')[1].split('&');
        params.forEach(function(item){
            var p = item.split('=');
            if(p[0]=='n'){ _number = parseInt(p[1]); throw {}; }
        });
    }catch(e){}
    if(_number>0 && _number<7) stalkerParams.active = _number-1;

    stalkerPortal = stalkerParams.portals[stalkerParams.active].url;
    stalkerLogin = stalkerParams.portals[stalkerParams.active].login;
    stalkerPassword = stalkerParams.portals[stalkerParams.active].password;
}
function getProviderParams(){
    stalkerToken = providerGetItem("Token") || 'C202C900E598558D0790F96B40E2D378';
    stalkerMAC = providerGetItem("MAC") || '';
    $("#stalkerMAC").val(stalkerMAC);

    loadStalkerParams();
    for(var i = 0; i < 6; i++){
        $("#stalkerPortal"+i).val(stalkerParams.portals[i].url);
        $("#stalkerLogin"+i).val(stalkerParams.portals[i].login);
        $("#stalkerPassword"+i).val(stalkerParams.portals[i].password);
    }
    $('input:radio[name=odin]').filter('[value='+stalkerParams.active+']').attr('checked', true);
    if(stalkerPortal.length < 4) alert('Для доступа необходимо ввести данные портала!');
    return (stalkerPortal.length);
}
function setProviderParams(){
    for(var i = 0; i < 6; i++){
        stalkerParams.portals[i].url = $("#stalkerPortal"+i).val().split('/stalker_portal')[0].trim();
        stalkerParams.portals[i].login = $("#stalkerLogin"+i).val().trim();
        stalkerParams.portals[i].password = $("#stalkerPassword"+i).val().trim();
    }
    stalkerParams.active = $("input[name=odin]:checked").val();
    var changed = JSON.stringify(stalkerParams) != providerGetItem("Params");
    providerSetItem("Params", JSON.stringify(stalkerParams));
    loadStalkerParams();

    providerSetItem("MAC", decodeURIComponent($("#stalkerMAC").val().trim()));
    changed = changed || (stalkerMAC != providerGetItem("MAC"));
    stalkerMAC = providerGetItem("MAC");

    if(stalkerPortal.length < 4) alert('Для доступа необходимо ввести данные портала!');
    return changed;
}

function _portal2popup(){
    var i = parseInt(stalkerParams.active), a = stalkerParams.portals[i];
    popupArray[popupActions.indexOf(doEditStA)] = 'Stalker: '+((i+1)+' - '+(a.name || a.url || ''));
}
function duneAddSettings(ind){
    _duneAddSettings();
    loadStalkerParams();
    if(_number>0 && _number<7){ doEditStA = doEditPortalData }
    popupArray.splice(ind, 1, '');
    popupDetail.splice(ind, 1, _('Select portal'));
    popupActions.splice(ind, 1, doEditStA);
    _portal2popup();
}
function selectAndRestart(ind){
    var i = stalkerParams.active;
    stalkerParams.active = ind;
    providerSetItem("Params", JSON.stringify(stalkerParams));
    stalkerParams.active = i;
    restart();
}

var doEditStA = function(ind){
    if(typeof ind === 'undefined') ind = parseInt(stalkerParams.active);
    selIndex = ind;
    listArray = stalkerParams.portals;
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+(sNoNumbersKeys?(i+1)+' - ':'<div class="btn">'+(i+1)+'</div>&nbsp;')+(item.name || item.url || ''); };
    detailListAction = function(){
        var a = stalkerParams.portals[selIndex];
        listDetail.innerHTML = _('Portal Name')+': <span " style="color:'+curColor+';">'+(a.name || '')+'</span><br/>'+
            _('URL')+':<br/><span " style="color:'+curColor+';">'+(a.url || '')+'</span><br/>'+
            _('Username')+': <span " style="color:'+curColor+';">'+(a.login || '')+'</span>';
        listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')+btnDiv(keys.ENTER, strENTER, ((stalkerParams.active == selIndex) || !stalkerParams.portals[selIndex].url)?'Edit':'Load');

    };
    listKeyHandler = function(code){
        switch (code) {
            case keys.RETURN: _portal2popup(); popupList(popupActions.indexOf(noProvParam)+1); return true;
            case keys.N1:
            case keys.N2:
            case keys.N3:
            case keys.N4:
            case keys.N5:
            case keys.N6: selIndex = code-49;
            case keys.ENTER:
                if((stalkerParams.active == selIndex) || !stalkerParams.portals[selIndex].url) doEditPortalData(selIndex);
                else selectAndRestart(selIndex)
                return true;
            default: return false;
        }
    };
    listDetail.innerHTML = '';
    listCaption.innerHTML = _('Select portal');
    listPodval.innerHTML = '';
    $('#listPopUp').hide();

    showPage();
}
function doEditPortalData(ind){
    function __portal2list(){
        listArray[0] = _('Portal Name')+': '+(a.name || '');
        listArray[1] = _('URL')+': '+(a.url || '');
        listArray[2] = _('Username')+': '+(a.login || '');
        listArray[3] = _('Password')+': '+(a.password?'******':'');
    }
    function _edit(caption, vname, types, clpdsa){
        editCaption = _(caption);
        editvar = (a[vname] || '').toString();
        setEdit = function(){
            if(a[vname] == editvar.trim()) return;
            if(clpdsa){
                pdsa.forEach(function(val){ providerSetItem(val, ''); });
                providerSetItem("Token", '');
            }
            a[vname] = editvar;
            providerSetItem("Params", JSON.stringify(stalkerParams));
            __portal2list();
            showPage();
        };
        showEditKey(types);
    }

    if(typeof ind === 'undefined') ind = parseInt(stalkerParams.active);
    var a = stalkerParams.portals[ind];
    selIndex = 0;
    var r = _(' (after changing, restart player)'),
        aDetail = [_('Enter Portal Name'),_('Enter URL of server')+' '+_('without')+' "/stalker_portal/c/"'+r,_('Enter username')+r,_('Enter password')+r, '', _('Restart player')];
    listArray = ['', '', '', '', '', _('Restart player')];
    __portal2list();
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+item; };
    detailListAction = function(){ listDetail.innerHTML = aDetail[selIndex]; };
    listKeyHandler = function(code){
        switch (code) {
            case keys.ENTER:
                switch (selIndex) {
                    case 0: _edit('Enter Portal Name', 'name'); return true;
                    case 1: _edit('Enter URL of server', 'url', null, stalkerParams.active==ind); return true;
                    case 2: _edit('Enter username', 'login', null, stalkerParams.active==ind); return true;
                    case 3: _edit('Enter password', 'password', null, stalkerParams.active==ind); return true;
                    case 5:
                        if(_number>0 && _number<7) restart();
                        else selectAndRestart(ind);
                        return true;
                }
                return true;
            case keys.RETURN:
                if(_number>0 && _number<7){ _portal2popup(); popupList(popupActions.indexOf(noProvParam)+1); }
                else doEditStA(ind);
                return true;
            default: return false;
        }
    };
    listDetail.innerHTML = '';
    listCaption.innerHTML = _('Edit portal data');
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
    $('#listPopUp').hide();

    showPage();
}
