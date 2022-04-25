function getEPGchanelCur(ch_id, callback){
    var d = null, epg_url = getEPGurl(ch_id);
    if(!epg_url){ callback(ch_id, d); return; }
    if(typeof sNextCount == 'undefined') sNextCount = -1;
    $.ajax({
        url: 'http://epg.ott-play.com/m3u/gecur.php',
        data: {epg: epg_url, count: sNextCount+2},
        dataType: 'json', timeout: 10000, method: 'post',
        success: function(data){ if(data !== null) d = data.epg_data; },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(jqXHR, textStatus){ callback(ch_id, d); },
    });
}
