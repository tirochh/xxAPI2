/*
 * Copyright 2015, KNX-User-Forum e.V.
 * 
 *     This file is part of xxAPI2.
 * 
 *     xxAPI2 is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Lesser General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 * 
 *     xxAPI2 is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Lesser General Public License for more details.
 * 
 *     You should have received a copy of the GNU Lesser General Public License
 *     along with xxAPI2.  If not, see <http://www.gnu.org/licenses/>.
 * 
 *     Diese Datei ist Teil von xxAPI2.
 * 
 *     xxAPI2 ist Freie Software: Sie können es unter den Bedingungen
 *     der GNU Lesser General Public License, wie von der Free Software Foundation,
 *     Version 3 der Lizenz oder (nach Ihrer Wahl) jeder späteren
 *     veröffentlichten Version, weiterverbreiten und/oder modifizieren.
 * 
 *     xxAPI2 wird in der Hoffnung, dass es nützlich sein wird, aber
 *     OHNE JEDE GEWÄHRLEISTUNG, bereitgestellt; sogar ohne die implizite
 *     Gewährleistung der MARKTFÄHIGKEIT oder EIGNUNG FÜR EINEN BESTIMMTEN ZWECK.
 *     Siehe die GNU Lesser General Public License für weitere Details.
 * 
 *     Sie sollten eine Kopie der GNU Lesser General Public License zusammen mit diesem
 *     Programm erhalten haben. Wenn nicht, siehe <http://www.gnu.org/licenses/>.

 * https://github.com/knxuf/xxAPI2/blob/master/LICENSE
 *
*/
"use strict";

// xml2json library
$.x2js = new X2JS();
$.xml2json = $.x2js.xml2json;

var xxAPI = {};
xxAPI.version = "2.019";
xxAPI.functions = {};
xxAPI.events = {
    "lastclick" : {
        "top"   : 0,
        "left"  : 0,
    },
}
xxAPI.XXLINKURL = "";
xxAPI.registered_icons = { 
    "XXPAGE"    : "XXPAGE*",
    "XXPOPUP"   : "XXPAGE*POPUP",
};
xxAPI.marked_pages = {};
xxAPI.geolocation = {};

// Homeserver Object
var hs = {};
hs.functions = {};
hs.functions.async = {};
hs.session = {};  // keyname ist target

// Globale
hs.user = null;
hs.gui = {};
hs.gui.update_timer = null;
hs.gui.fonts = {};
hs.gui.systemfonts = {};
hs.gui.attr = {
    "initial_visu_width"    : $(window).width(), 
    "initial_visu_height"   : $(window).height(),
    "visu_width"            : $(window).width(),
    "visu_height"           : $(window).height(),
};
hs.gui.hashes = {};
hs.gui.pages = {};
hs.gui.items = {};
hs.gui.designs_html = null;
hs.auth = {};
hs.auth.username = null;
hs.auth.password = null;
hs.auth.gui_design = null;
hs.auth.gui_refresh="R1";
hs.debuglevel = 0;

xxAPI.functions.XXAPICONFIG = function ( oarg ) {
    var _html = "<h3 style='text-align: center;'>xxAPI² Config</h3>";
    _html += "<table style='width:100%;'>";
    _html += "<tr><td class='xxapi_config_name'>Version:</td><td class='xxapi_config_value'>" + xxAPI.version + "<td><tr>";
    _html += "<tr><td class='xxapi_config_name'>jQuery:</td><td class='xxapi_config_value'>" + $.md5(hs.functions.stringify($)) + "<td><tr>";
    _html += "<tr><td class='xxapi_config_name'>HSClient:</td><td class='xxapi_config_value'>" + $.md5(hs.functions.stringify(hs.functions)) + "<td><tr>";
    _html += "<tr><td class='xxapi_config_name'>xxAPI:</td><td class='xxapi_config_value'>" + $.md5(hs.functions.stringify(xxAPI.functions)) + "<td><tr>";
    _html += "<tr><td class='xxapi_config_name'>Debuglevel</td><td class='xxapi_config_value'><input type='number' min='0' max='5' value='" + hs.debuglevel + "' onchange='hs.functions.set_debuglevel(this.value);'><td><tr>";
    _html += "<tr><td colspan='2'><button class='simplemodal-close' onclick='window.applicationCache.update(); window.location.reload();'>Reload Cache</button></td></tr>";
    _html += "<tr><td colspan='2'><button class='simplemodal-close' onclick='hs.functions.logout();'>Logout</button><td><tr>";
    //_html += "<tr><td colspan='2'><button class='simplemodal-close'>Close</button><td><tr>";
    _html += "</table>";
    _html += "<footer style='position: absolute; bottom: 1em;'>Copyright © 2015 <a href='http://www.knx-user-forum.de'>knx-user-forum e.V.</a>&#160;<a rel='license' href='https://github.com/knxuf/xxAPI2/blob/master/LICENSE'>licensed LGPL</a><footer>";
    var _div = $('<div />').html(_html);
    _div.css( {
        "font-size"         :"small",
        "color"             :"grey",
        "background-color"  :"white",
        "width"             :"300px",
        "height"            :"300px",
        "padding"           :"3px",
    });
    _div.modal({
        "autoPosition"  : true,
        "modal"         : true,
        "overlayClose"  : true,
    });
    if ( oarg != null) {
        oarg.item.text = '';
    }
}

hs.functions.set_debuglevel = function ( level ) {
    hs.debuglevel      = level;
    localStorage.setItem('debuglevel',level);
}

xxAPI.functions.XXSCRIPT = function( oarg ) {
    if (oarg.item.open_page > 0) {
        debug(2,"XXSCRIPT");
        oarg.item.page.hidden = true;
        //window.setTimeout(function() {
            oarg.page_id = oarg.item.open_page;
            hs.functions.load_page( oarg );
        //},1);
    }
}

xxAPI.functions.XXHTML = function ( oarg ) {
    debug(2,"XXHTML:",oarg);
    var _html = oarg.args[1] || "";
    _html = _html.replace(/\[/g, "<");
    _html = _html.replace(/\?\?/g, "\"");
    _html = _html.replace(/=\?/g, "=\"");
    _html = _html.replace(/\? /g, "\" ");
    _html = _html.replace(/\?\]/g, "\">");
    _html = _html.replace(/\]/g, ">");
    oarg.item.html = _html;
}

xxAPI.functions.XXEHTML = function ( oarg ) {
    debug(2,"XXEHTML:",oarg);
    var _html = $.base64.decode(oarg.args[1]);
    oarg.item.html = _html;
}

xxAPI.functions.XXLINK = function ( oarg ) {
    debug(2,"XXLINK:",oarg);
    oarg.item.eventcode["click"] = function() {
        xxAPI.XXLINKURL = xxAPI.functions.geturl(oarg.args[2]);
    }
    oarg.item.text = oarg.args[1];
}

xxAPI.functions.XXHTTP = function ( oarg ) {
    debug(2,"XXHTTP:",oarg);
    oarg.item.eventcode["click"] = function() {
        window.open(xxAPI.functions.geturl(oarg.args[2]),'XXHTTP');
    }
    oarg.item.text = oarg.args[1];
}

xxAPI.functions.XXIFRAME = function ( oarg ) {
    debug(2,"XXIFRAME:",oarg);
    var _url = xxAPI.XXLINKURL;
    if (oarg.args[1] != "") {
        _url = oarg.args[1];
    }
    oarg.item.html = "<iframe src='" + _url + "' " +
    "width='" + oarg.item.width + "px' " +
    "height='" + oarg.item.height + "px' " +
    "allowtransparency='true'>";
    oarg.item.click = 1;

}
xxAPI.functions.XXEXECUTE = function ( oarg ) {
    debug(2,"XXEXECUTE:",oarg);
    var _jscode = oarg.args[1] || "";
    _jscode = _jscode.replace(/\[/g, "<");
    _jscode = _jscode.replace(/\(\?/g, "\(\"");
    _jscode = _jscode.replace(/=\?/g, "=\"");
    _jscode = _jscode.replace(/\? /g, "\" ");
    _jscode = _jscode.replace(/\?[,]/g, "\",");
    _jscode = _jscode.replace(/\?[;]/g, "\";");
    _jscode = _jscode.replace(/\?[\+]/g, "\"\+");
    _jscode = _jscode.replace(/[\+]\?/g, "\+\"");
    _jscode = _jscode.replace(/[,]\?/g, ",\"");
    _jscode = _jscode.replace(/\?\)/g, "\"\)");
    _jscode = _jscode.replace(/\]/g, ">");
    // item für Abwärtskompatiblität
    var _func = new Function('item','"use strict"; ' + _jscode);
    oarg.item.text = '';
    try {
        _func( oarg.item );
    } catch (e) {
        debug(1,"XXEXECUTE_ERROR:",e);
    }
}

xxAPI.functions.XXEEXECUTE = function ( oarg ) {
    debug(2,"XXEEXECUTE:",oarg);
    var _jscode = $.base64.decode(oarg.args[1]);
    var _func = new Function('item','"use strict"; ' + _jscode);
    oarg.item.text = '';
    try {
        _func( oarg.item );
    } catch (e) {
        debug(1,"XXEEXECUTE_ERROR:",e);
    }
}

xxAPI.functions.XXMARK = function ( oarg ) {
    debug(2,"XXMARK",oarg);
    oarg.item.hidden = true;
}

xxAPI.functions.XXMODUL = function ( oarg ) {
    debug(2,"XXMODUL",oarg);
    oarg.item.text = '';
}

xxAPI.functions.XXMODULCLICK = function ( oarg ) {
    debug(2,"XXMODULCLICK",oarg);
    oarg.item.text = '';
}

xxAPI.functions.XXCLICK = function ( oarg ) {
    debug(2,"XXCLICK",oarg);
    oarg.item.text = '';
}

xxAPI.functions.XXTRIGGER = function ( oarg ) {
    debug(2,"XXTRIGGER",oarg);
    oarg.item.hidden = true;
}

xxAPI.functions.XXIMG = function ( oarg ) {
    debug(2,"XXIMG",oarg);
    oarg.item.type = "CAM";
    oarg.item.url = oarg.args[1];
}

xxAPI.functions.XXLONGPRESS = function ( oarg ) {
    /*
        1 = click
        2 = longpress
        4 = longpress stopped
    */
    debug(2,"XXLONGPRESS",oarg);
    var _longpress_duration = parseInt(oarg.args[1]) || 50;
    if (_longpress_duration < 50) {
        _longpress_duration = 50;
    }
    oarg.item.xxapi.longpress_time = null;
    oarg.item.xxapi.longpress_timer = null;
    oarg.item.xxapi.longpress_bit = 0;
    if (oarg.args.length > 2) {
        oarg.item.xxapi.longpress_bit = parseInt(oarg.args[2]) || 0;
    }
    if (oarg.args.length > 3) {
        oarg.item.xxapi.longpress_code = oarg.args.slice(3).join("*");
    }

    oarg.item.eventcode["touchstart"] = oarg.item.eventcode["mousedown"] = function( oarg ) {
        oarg.item.xxapi.longpress_time = $.now() + _longpress_duration;
        if (oarg.item.xxapi.longpress_timer) {
            window.clearTimeout(oarg.item.xxapi.longpress_timer);
        }
        var _oarg = oarg;
        oarg.item.xxapi.longpress_timer = window.setTimeout(function() {
            xxAPI.functions.longpress_event("longpress", _oarg);
        },_longpress_duration);

    };
    oarg.item.eventcode["touchend"] = oarg.item.eventcode["mouseup"] = function( oarg ) {
        if(oarg.item.xxapi.longpress_timer) {
            window.clearTimeout(oarg.item.xxapi.longpress_timer);
        }
        oarg.item.xxapi.longpress_timer = null;
        if ($.now() >= oarg.item.xxapi.longpress_time) {
            xxAPI.functions.longpress_event("longpressup", oarg);
        } else {
            xxAPI.functions.longpress_event("click", oarg);
        }
    };
    oarg.item.click = false;
    oarg.item.text = '';
}

xxAPI.functions.longpress_event = function( presstype, oarg ) {
    debug(3,"XXLONGPRESS_event:" + presstype,oarg);
    var _typeval = {
        "click"         : 1,
        "longpress"     : 2,
        "longpressup"   : 4,
    };
    oarg.item.value = _typeval[presstype]<<oarg.item.xxapi.longpress_bit;
    hs.functions.do_valset( oarg );
}

xxAPI.functions.XXREGICON = function ( oarg ) {
    debug(2,"XXREGICON",oarg);
    if (oarg.args.length > 2) {
        xxAPI.registered_icons[oarg.args[1]] = oarg.args.slice(2).join("*");
    }
    oarg.item.hidden = true;
}

xxAPI.functions.XXPAGE = function ( oarg ) {
    debug(2,"XXPAGE",oarg);
    oarg.item.page.width = oarg.item.left;
    oarg.item.page.height = oarg.item.top;
    oarg.item.page.popup = oarg.args[1] == "POPUP";
    
    if(!oarg.item.page.is_modul && !oarg.item.page.popup) {
        hs.gui.attr.visu_width = oarg.page.width;
        hs.gui.attr.visu_height = oarg.page.height;
    }
    
    if (oarg.args.length > 2) {
        var _match = null;
        var _regex =new RegExp(/([-\w]+)[:](.*?);/g);
        while(_match = _regex.exec(oarg.args[2])) {
            if(_match[1] == "top" || _match[1] == "left") {
                oarg.item.page.centered = false;
                _match[2] = _match[2].replace(/MOUSE([+-]\d+)px/,function(match,capture) {
                    var _mouse = _match[1] == "top" ? xxAPI.events.lastclick.top : xxAPI.events.lastclick.left;
                    // eval should be save here 
                    return eval(_mouse + capture) + "px";
                })
            }
            debug(5,"XXPAGE: change_css '"+_match[1]+"':'"+_match[2]+"'");
            oarg.item.page.object.css(_match[1],_match[2]);
        }
    }
}

xxAPI.functions.XXWRAPTEXT = function ( oarg ) {
    debug(2,"XXWRAPTEXT",oarg);
    oarg.item.customcss["white-space"] = "normal";
    oarg.item.customcss["line-height"] = "130%";
    oarg.item.text = oarg.item.text.substring(11);
}

xxAPI.functions.geolocation_callback = function ( position ) {
    debug(2,"GEOLOCATION Received",position);
    xxAPI.functions.geolocation_send("timestamp",position.timestamp);
    $.each(position.coords, function( attribute, value ) {
        xxAPI.functions.geolocation_send(attribute, value);
    });
}

xxAPI.functions.geolocation_send = function ( attribute, value) {
    debug(5,"Attribute: " + attribute + "=" + value);
    if (xxAPI.geolocation.hasOwnProperty(attribute)) {
        debug(2,"XXGEOLOCATE send: " + attribute + " auf ID " + xxAPI.geolocation[attribute].id + " Wert " + value);
        xxAPI.geolocation[attribute].value = value;
        /*
        hs.functions.do_valset({
            "item"  : xxAPI.geolocation[attribute] ,
        });
        */
    }
}

xxAPI.functions.geolocation_error = function ( err ) {
    debug(1,"Geolocation Failed", err);
}

xxAPI.functions.XXGEOLOCATE = function ( oarg ) {
    debug(2,"XXGEOLOCATE",oarg)
    var _options = {
        enableHighAccuracy: true,
    };
    navigator.geolocation.getCurrentPosition(
        xxAPI.functions.geolocation_callback,
        xxAPI.functions.geolocation_error,
        _options
    );
    oarg.item.text = "";
}

xxAPI.functions.XXGEOLOCATION = function ( oarg ) {
    debug(2,"XXGEOLOCATION",oarg)
    if (oarg.item.action_id != 9) {
        debug(1,"ERROR: " + oarg.item.text + " Keine Werteingabe");
    }
    xxAPI.geolocation[oarg.args[1]] = oarg.item;
    oarg.item.text = "";
}

xxAPI.functions.geturl = function ( url ) {
    if (url.match(/^HSLIST:.*/) == null) {
        return url;
    }
    var _list = url.slice(7);
    return "/hslist?lst=" + _list + "&user=" + hs.auth.username + "&pw=" + hs.auth.password;
}
function debug(level,msg,obj) {
    if (level > hs.debuglevel) {
        return;
    }
    if (window.console) {
        var _logger = window.console.debug;
        switch (level) {
            case 0: _logger = window.console.error; break;
            case 1: _logger = window.console.warn; break;
            case 2: _logger = window.console.info; break;
            case 3: _logger = window.console.info; break;
            case 4: _logger = window.console.info; break;
        }
        if (typeof obj != "object") {
            _logger.call(window.console,msg);
        } else {
            _logger.call(window.console,msg+": %o",obj);
        }
    }
}

hs.functions.xxapi_check = function( oarg ) {
    if (oarg.item.type == "ICO") {
        oarg.item.text = xxAPI.registered_icons[oarg.item.image] || '';
    }
    if (oarg.item.text.match(/^XX.*\*/) == null) {
        return;
    }
    debug(3,"xxAPI Check: (" + oarg.item.uid + ") " + oarg.item.text ,oarg);
    oarg.args = oarg.item.text.split("*");
    var _func = xxAPI.functions[oarg.args[0].toUpperCase()];
    if(typeof _func === 'function') {
        _func( oarg );
    }
}

hs.functions.hs_session = function(target,start_id) {
    if (typeof target == 'undefined') {
        target = "VISU";
    }
    if (hs.session.hasOwnProperty(target)) {
        //delete hs.session[target_item];
        var _session = hs.session[target];
        hs.functions.load_page({ 
            "session"   : _session,
            "page_id"   : start_id || _session.start_id,
        });
        return;
    }
    hs.session[target] = this;
    // Session 
    this.target = target;
    this.start_id = start_id || null;
    this.auth = {
        "handle"        : 0,
        "pos"           : 0,
        "tan"           : 0,
        "tan_counter"   : 0,
        "glob_key1"     : "",
        "glob_key2"     : "",
    };
    
    this.ajax_queue = $({});
    this.update_timer = null;
    
    this.connected = false;
    this.visible = false;
    
    this.active_pages = [];
    this.history = [];
    
    hs.functions.login_init({ 
        "session"   : this,
        "page_id"   : start_id
    });
}

hs.functions.hs_item = function( oarg ) {
    this.id     = oarg.json._pos || oarg.json._id;
    this.type   = oarg.json._type;
    this.session = oarg.session;

    this.page_id = oarg.page_id;
    this.page = oarg.page;
    this.uid = this.session.target + "_PAGE_" + this.page_id + "_" + this.type + "_" + this.id;
    oarg.item = this;
    
    if (this.page.items.hasOwnProperty(this.uid)) {

        oarg.item = this.page.items[this.uid];

    } else {
        oarg.item.width  = parseInt(oarg.json._w);
        oarg.item.height = parseInt(oarg.json._h);
        oarg.item.top    = parseInt(oarg.json._y);
        oarg.item.left   = parseInt(oarg.json._x);
        
        oarg.item.click       = (oarg.json._click*1) == 1;
        oarg.item.has_command = (oarg.json._hcmd*1) == 1;
        oarg.item.open_page   = parseInt(oarg.json._pid   || -1);
        oarg.item.action_id   = parseInt(oarg.json._typ   || -1);
        oarg.item.font        = parseInt(oarg.json._fid   ||  0);
        oarg.item.align       = hs.functions.number2align( parseInt(oarg.json._align ||  0));
        oarg.item.indent      = parseInt(oarg.json._bord  ||  0);
    }

    oarg.item.json = oarg.json;
    
    oarg.item.color       = hs.functions.get_hexcolor( oarg.json._fcol ) || oarg.item.color || "transparent";
    oarg.item.bg_color    = hs.functions.get_hexcolor( oarg.json._bgcol || oarg.json._col) || oarg.item.bg_color || "transparent";
    oarg.item.text        = oarg.json._txt ||   "";
    oarg.item.html        = null;
    oarg.item.image       = oarg.json._ico || null;
    oarg.item.url         = oarg.json._url || null;
    oarg.item.auth        = oarg.json._auth || null;

    if (oarg.page.items.hasOwnProperty(oarg.item.uid)) {
        oarg.item.cmd = "update";
        hs.functions.update_item( oarg );
    } else {
        // xxAPI
        oarg.item.xxapi = {};
        oarg.item.customcss = {};
        oarg.item.eventcode = {};
        oarg.item.hidden = false;
        oarg.item.object = null;
        oarg.item.title = "";
        oarg.item.event = null;
        
        if(oarg.item.click && oarg.item.action_id == 1 && oarg.item.open_page == oarg.item.page.page_id) {
            debug(4,"hs_item: remove click from page",oarg.item);
            oarg.item.action_id = 0;
            oarg.item.click = oarg.item.has_command;
        }
        oarg.item.cmd = "create";
        hs.functions.xxapi_check( oarg );
        
        if (oarg.item.object == null) {
            debug(5,"Create HTML Element " + oarg.item.uid,oarg);
            oarg.item.object = $("<div />", {
                "id"        : oarg.item.uid,
                "title"     : oarg.item.title,
                "css"         : {
                    "position"      : "absolute",
                    "display"       : "block",
                    "top"           : oarg.item.top,
                    "left"          : oarg.item.left,
                    "height"        : oarg.item.height + "px",
                    "width"         : oarg.item.width  + "px",
                    "line-height"   : oarg.item.height + "px",
                },
                "class"         : "visuelement"
                
            });

            $.each( Object.keys(oarg.item.eventcode) ,function(index, value) {
                oarg.item.object.bind(value,function (event) {
                    oarg.item.event = event;
                    hs.functions.mouse_event( oarg )
                });
            });

            if (oarg.item.click) {
                oarg.item.object.bind("click",function (event) {
                    oarg.item.event = event;
                    hs.functions.check_click( oarg );
                });
                oarg.item.object.addClass("visuclickelement");
            } else {
                if(Object.keys(oarg.item.eventcode).length == 0) {
                    oarg.item.object.css("pointer-events","none");
                }
            }
            if (oarg.item.type == "BOX") {
                if (oarg.item.width > 5 && oarg.item.height > 5) {
                    oarg.item.object.css( {
                        "width"             : (oarg.item.width  -2) + "px",
                        "height"            : (oarg.item.height -2) + "px",
                        "border-width"      : "1px",
                        "border-style"      : "solid",
                        "border-color"      : oarg.item.bg_color,
                    });
                }
                oarg.item.object.css("background-color", oarg.item.bg_color);

            }
            
            if (oarg.item.type == "TXT") {
                oarg.item.object.css( hs.gui.fonts[oarg.item.font] );
                oarg.item.object.css( {
                    "background-color"  : oarg.item.bg_color,
                    "color"             : oarg.item.color,
                    "white-space"       : "nowrap",
                    "text-align"        : oarg.item.align,
                });
                if (oarg.item.html == null) {
                    oarg.item.object.append(hs.functions.get_textobject( oarg ));
                } else {
                    oarg.item.object.html(oarg.item.html);
                }
            }
            if (oarg.item.type == "CAM") {
                if (oarg.item.url) {
                    if (oarg.item.auth) {
                        oarg.item.url = $.base64.decode(oarg.item.auth) + "@" + oarg.item.url;
                    }
                    oarg.item.url = oarg.item.url.match(/http?:\/\/.*/) ? oarg.item.url : "http://" + oarg.item.url;
                } else {
                    oarg.item.url = hs.functions.get_url ({ 
                        "session"   : oarg.item.session, 
                        "url"       : "/guicamv?id=" + oarg.item.id, 
                        "cmd"       : "", 
                    });
                }
            }
            
            if (oarg.item.type == "GRAF") {
                oarg.item.url = hs.functions.get_url ({ 
                    "session"   : oarg.item.session, 
                    "url"       : "/guigrafv?id=" + oarg.item.id, 
                    "cmd"       : "",
                });
            }
            
            if (oarg.item.type == "ICO") {
                
            }
            
            if ( $.inArray(oarg.item.type, ["CAM","GRAF","ICO"]) > -1) {
                hs.functions.load_image( oarg );
            }
            oarg.item.s_text = oarg.item.text;
            oarg.item.s_color = oarg.item.color;
            oarg.item.s_bg_color = oarg.item.bg_color;
            oarg.item.s_image = oarg.item.image;
            oarg.item.s_url = oarg.item.url;
            oarg.item.object.css(oarg.item.customcss);

        }
        oarg.item.page.items[oarg.item.uid] = oarg.item;
        if(!oarg.item.hidden) {
            oarg.item.page.object.append(oarg.item.object);
        }
    }
    /*
    */
}

hs.functions.get_textobject = function ( oarg ) {
        var _txtobject = $("<span />").text(oarg.item.text);
        if (oarg.item.indent > 0) {
            if ($.inArray(oarg.item.align,["left","center"]) > -1) {
                _txtobject.css( "margin-left",oarg.item.indent + "px");
            } 
            if ($.inArray(oarg.item.align,["center","right"]) > -1) {
                _txtobject.css( "margin-right",oarg.item.indent + "px");
            } 
        }
        return _txtobject;
}

hs.functions.update_item = function ( oarg ) {
    // xxAPI update check
    hs.functions.xxapi_check( oarg );

    if ( $.inArray(oarg.item.type, ["TXT"]) > -1) {
        if (oarg.item.s_color != oarg.item.color) {
            debug(4,"COLOR CHANGED '" + oarg.item.s_color + "' != '" + oarg.item.color + "'")
            oarg.item.object.css("color",oarg.item.color);
        }
        if (oarg.item.s_text != oarg.item.text) {
            debug(4,"TEXT CHANGED '" + oarg.item.s_text + "' != '" + oarg.item.text + "'")
            if (oarg.item.html == null) {
                oarg.item.object.children().replaceWith(hs.functions.get_textobject( oarg ));
            } else {
                oarg.item.object.html(oarg.item.html);
            }
        }

    }
    if ( $.inArray(oarg.item.type, ["TXT","BOX"]) > -1) {
        if (oarg.item.s_bg_color != oarg.item.bg_color) {
            debug(4,"BOX/TEXT BGCOLORT changed '" + oarg.item.s_bg_color + "' != '" + oarg.item.bg_color + "'");
            oarg.item.object.css({
                "background-color"  : oarg.item.bg_color,
                "border-color"      : oarg.item.bg_color,
            });
        }
    }
    if ( $.inArray(oarg.item.type, ["ICO"]) > -1) {
        if (oarg.item.s_image != oarg.item.image) {
            debug(4,"ICO changed");
        }
    }
    if ( $.inArray(oarg.item.type, ["CAM","ICO"]) > -1) {
        if (oarg.item.s_url != oarg.item.url) {
            debug(4,"URL changed");
            hs.functions.load_image( oarg );
        }
    }
    oarg.item.s_text = oarg.item.text;
    oarg.item.s_color = oarg.item.color;
    oarg.item.s_bg_color = oarg.item.bg_color;
    oarg.item.s_image = oarg.item.image;
    oarg.item.s_url = oarg.item.url;

}

hs.functions.load_image = function ( oarg ) {
    debug(5,"load_image",oarg);
    var _child = oarg.item.image_object || null;

    var _img = $("<img />", {
        "src"       : oarg.item.url,
        "alt"       : " ",
        "width"     : oarg.item.width,
        "height"    : oarg.item.height,
        "css"       : {
            "position"  : "absolute",
        },
        "on"        : {
            "dragstart" : function () { return false; },
            "load"      : function () { 
                if (this.width == 0 && this.height == 0) {
                    debug(1,"Error: Image '" + this.src + "' failed",{ "img" : this, "item" : oarg.item });
                    return;
                }
                if (_child != null) {
                    oarg.item.image_object = $(this);
                    oarg.item.object.prepend( this );
                    _child.fadeOut(20,function() {
                        _child.remove();
                    });
                }
            },
        }    
    })
    if (_child == null) {
        oarg.item.image_object = _img;
        oarg.item.object.prepend( _img );
    }
}

hs.functions.hs_page = function( oarg ) {
    this.page_id    = oarg.page_id;
    this.session    = oarg.session;
    this.is_modul   = oarg.session.target == "VISU" ? false:true;
    this.id         = this.session.target + "_PAGE_" + this.page_id;
    oarg.page       = this;
    if (!this.is_modul) {
        hs.gui.attr.visu_height = hs.gui.attr.initial_visu_height;
        hs.gui.attr.visu_width = hs.gui.attr.initial_visu_width;
    }
    if (hs.gui.pages.hasOwnProperty(this.id)) {
        debug(5,"update existing Page: ",oarg);
        oarg.page = hs.gui.pages[this.id];
        
        hs.functions.loop_items( oarg );
        if (oarg.cmd == "gv") {
            hs.functions.fade_page( oarg );
        }
        return oarg.page;
    }
    debug(4,"create new Page: ",oarg);
    hs.gui.pages[oarg.page.id] = oarg.page;
    oarg.page.hidden     = false;
    oarg.page.popup      = false;
    oarg.page.centered   = true;
    oarg.page.popup_object = null;
    oarg.page.bg_image   = oarg.json.HS.VISU._bg;
    oarg.page.icon       = oarg.json.HS.VISU._ico;
    oarg.page.qanz       = parseInt(oarg.json.HS.VISU._bg);
    oarg.page.title      = oarg.json.HS.VISU._txt1;
    oarg.page.text       = oarg.json.HS.VISU._txt2;
    oarg.page.width      = hs.gui.attr.visu_width;
    oarg.page.height     = hs.gui.attr.visu_height;
    oarg.page.items      = {};
    oarg.page.object = $("<div />", {
        "id"            : oarg.page.id,
        "class"         : "visupage",
    });
    


    hs.functions.loop_items( oarg );
    
    if (oarg.page.bg_image != "XXTRSPBG") {
        oarg.page.object.css({
            "background-image"      : "url(/guibg?id=" + oarg.page.bg_image + "&cl=" + hs.auth.gui_design + "&hash=" + hs.gui.hashes._bg + ")",
            "background-repeat"     : "no-repeat",
        });
    }
    oarg.page.object.css({
        "position"  : "absolute",
        "overflow"  : "hidden",
        "width"     : oarg.page.width,
        "height"    : oarg.page.height,
    })
    
    if (!oarg.page.hidden) {
        hs.functions.fade_page( oarg );
        if (oarg.page.centered) {
            oarg.page.object.center();
        }
    }
}

hs.functions.fade_page = function( oarg ) {
        hs.functions.set_viewport();
        $("#" + oarg.session.target).prepend(oarg.page.object);
        oarg.page.object.show();
        oarg.session.active_pages.forEach(function(elem,index) {
            $("#" + oarg.session.target + "_PAGE_" + elem).fadeOut(10,function() { 
                $(this).detach();
                oarg.session.active_pages.splice(index,1);
            });
        });
        oarg.session.active_pages.push(oarg.page_id);
        oarg.session.history.push(oarg.page_id);
        document.title = "xxAPI² - " + oarg.page.title;
}

hs.functions.loop_items = function ( oarg ) {
    $.each(oarg.json.HS.ITEMS, 
        function(item_type, child) {
            if ($.isArray(child)) {
                $.each(child, 
                    function(counter,item) {
                        var _json = item;
                        // create new oarg object
                        new hs.functions.hs_item({
                            "json"      : _json,
                            "session"   : oarg.session,
                            "page"      : oarg.page,
                            "page_id"   : oarg.page_id,
                        });
                    }
                );
            } else {
                var _json = child;
                // create new oarg object
                new hs.functions.hs_item({
                    "json"      : _json,
                    "session"   : oarg.session,
                    "page"      : oarg.page,
                    "page_id"   : oarg.page_id,
                });
            }
        }
    );
}

hs.functions.make_globkey = function(xor) {
    var _key = "";
    var _temp = string_padding(hs.auth.password,64,String.fromCharCode(0));
    for (var i=0; i < 64; i++) {
        _key += String.fromCharCode(_temp.charCodeAt(i)^xor);
    }
    return _key;
};

hs.functions.get_url = function( oarg ) {
    if (typeof oarg.session == 'undefined') {
        debug(0,"undefined Session");
        return oarg.url || "";
    }
    // /guigrafv? // /guicamv? ///hsgui? ///guicama 
    //debug(5,"get_url ("+ oarg.session.target + "): " + oarg.cmd + " / " + oarg.url,oarg.session);
    if (oarg.cmd =="init") {
        return oarg.url;
    }

    if ((typeof oarg.url == 'undefined') || (oarg.url == '')) { 
        oarg.url = "/hsgui?"; 
        //debug (5,"tan_counter ++");
        oarg.session.auth.tan_counter ++;
    }
    var _url = "";
    if (oarg.cmd != "") {
        _url = "cmd=" + oarg.cmd;
    }
    _url += "&hnd=" + oarg.session.auth.handle;
    if (oarg.cmd == "login") {
        var _code_tmp = $.md5(oarg.session.auth.glob_key2 + oarg.session.auth.tan + oarg.session.auth.tan_counter + _url).toUpperCase();
        var _code = $.md5(oarg.session.auth.glob_key1 + _code_tmp).toUpperCase();
        _code = _code.substr(oarg.session.auth.pos -1,10);
    } else {
        var _code = "XX" + oarg.session.auth.tan + oarg.session.auth.tan_counter;
    }
    oarg.url = oarg.url + _url + "&code=" + _code;
    //debug(5,"get_url: " + oarg.url);
    return oarg.url;
};

hs.functions.make_request = function ( oarg ) {
    // based on jquery-ajaxQueue
    debug(5,"make_request (" + oarg.session.target + "): " + oarg.cmd + " / url=" + oarg.url);
    var jqXHR,
        dfd = $.Deferred(),
        promise = dfd.promise();
    var ajaxOpts = {
        "datatype"      : "xml",
        "contentType"   : "application/x-www-form-urlencoded;charset=ISO-8859-1",
        "complete"      : function(xhttpobj) {
            oarg.xhttpobj = xhttpobj;
            hs.functions.async.handler( oarg );
        }
    };

    // run the actual query
    function doRequest( next ) {
        ajaxOpts.url = hs.functions.get_url( oarg );
        debug(5,"do_request (" + oarg.session.target + "): " + oarg.cmd + " / url=" + oarg.url, ajaxOpts);
        jqXHR = $.ajax( ajaxOpts );
        jqXHR.done( dfd.resolve )
            .fail( dfd.reject )
            .then( next, next );
    }

    // queue our ajax request
    
    
    // TODO prio für login 
    oarg.session.ajax_queue.queue( doRequest );
    // add the abort method
    promise.abort = function( statusText ) {

        // proxy abort to the jqXHR if it is active
        if ( jqXHR ) {
            return jqXHR.abort( statusText );
        }

        // if there wasn't already a jqXHR we need to remove from queue
        var queue = ajax_queue.queue(),
            index = $.inArray( doRequest, queue );

        if ( index > -1 ) {
            queue.splice( index, 1 );
        }

        // and then reject the deferred
        dfd.rejectWith( ajaxOpts.context || ajaxOpts, [ promise, statusText, "" ] );
        return promise;
    };

    return promise;
}

hs.functions.async.handler = function( oarg ) {
    debug(5,"async_handler (" + oarg.session.target + ") : " + oarg.cmd,oarg);
    oarg.url = "";
    oarg.json =  hs.functions.error_handler( oarg ) 
    if (!oarg.json) {
        return false;
    }

    oarg.cmd = string_cut_after_match(oarg.cmd,"&");
    switch (oarg.cmd) {
        case "init"     : hs.functions.async.login( oarg ); break;
        case "login"    : hs.functions.async.logged_in(  oarg ); break;
        case "getfont"  : hs.functions.async.getfont( oarg ); break;
        case "getattr"  : hs.functions.async.getattr( oarg ); break;
        
        // VISU Seite laden
        case "gv"       : hs.functions.async.gv( oarg ); break;
        // VISU Seite update
        case "gvu"      : hs.functions.async.gv( oarg ); break;
        // VISU Seite update und Befehl
        case "vcu"      : hs.functions.async.gv( oarg ); break;
        
        case "logout"   : break;
        default:
            break;
    }
};

hs.functions.error_handler = function( oarg ) {
    //handle Error
    // <HS><ERR code="99"></ERR></HS>
    // <HS><ERROR>Timeout !!</ERROR></HS>
    debug(5,"error_handler: (" + oarg.cmd + ")", oarg.xhttpobj);
    oarg.error = ""
    if (typeof oarg.xhttpobj != 'undefined') {
        if (!navigator.onLine) {
            oarg.error = "offline";
        }
        if (oarg.xhttpobj.status != 200) {
            switch (oarg.xhttpobj.status) {
                case 0: oarg.error = "connreset"; break;
                case 404: oarg.error = "notfound"; break;
            }
        } else {
            if (oarg.xhttpobj.responseText.length == 0) {
                switch(oarg.cmd) {
                    case "init"     : oarg.error = "auth_error"; break;
                    case "login"    : oarg.error = "pass_error"; break;
                    
                }
            }
            var _error_regex = new RegExp(/(?:<ERROR>|<ERR code=\")(.*?)(?:<\/ERROR>|\"\/>)/g);
            var _errorcode = _error_regex.exec(oarg.xhttpobj.responseText);
            if (_errorcode != null) {
                oarg.error = _errorcode[1].toLowerCase();
                oarg.error = oarg.error.substring(0,17);
            }
            if (oarg.error == "") {
                var _xml = oarg.xhttpobj.responseText;
                if (_xml.match(/<HS>.*?<ITEMS>[^]*?<\/ITEMS>/gm)) {
                    debug(4,"fix item order", { "_xml" : _xml });
                    if (typeof oarg.xhttpobj.responseXML == 'undefined') {
                        _xml = hs.functions.fix_xml(oarg.xhttpobj.responseText);
                    }
                    // fix item order
                    _xml = _xml.replace(/<(TXT|BOX|ICO|GRAF|CAM)\s\w+=[^]*?\/>/g, function(match, capture) {
                        return match.replace(capture,'ITEM type="' + capture + '"');
                    });
                    oarg.xhttpobj.responseXML = $.parseXML(_xml)
                }

                try {
                    var _json =  $.xml2json(oarg.xhttpobj.responseXML);
                    return _json;
                } catch (e) {
                    oarg.error = e.toString();
                }
            }
        }
    }
    
    debug(0,"Error: " + oarg.error, oarg);
    switch (oarg.error) {
        case "auth_error"       : hs.functions.login_dialog("Benutzer falsch"); break;
        case "pass_error"       : hs.functions.login_dialog("Password falsch"); break;
        case "timeout !!"       : hs.functions.login_init( oarg ); break;
        case "handle error !!"  : hs.functions.login_init( oarg ); break;
        case "user kidnapped !!": hs.functions.login_init( oarg ); break;
        case "99"               : alert("Visuseite nicht gefunden"); break;
        default                 : alert("Error " + oarg.error); break
    }
    return (oarg.error == "");
}

hs.functions.swap_object = function( obj ) {
    var _ret = {};
    for (var key in obj) {
        _ret[obj[key]] = key;
    }
    return _ret;
}

hs.functions.entity = new (function() {
    var map = {
        "&" : "&amp;",
        "<" : "&lt;",
        ">" : "&gt;",
        '"' : "&quot;",
        "'" : "&apos;",
    };
    var rmap = hs.functions.swap_object( map ); 

    this.encode_regex = new RegExp("[" + Object.keys(map).join("") + "]","g");
    this.decode_regex = new RegExp("[" + Object.keys(rmap).join("") + "]","g");
    var entityobj = this;
    this.encode = function ( text ) {
        return text.replace(this.encode_regex, function (entity) {
            return map[entity];
        });
    }
    this.decode = function ( text ) {
        return text.replace(this.decode_regex, function (entity) {
            return rmap[entity];
        });
    }
    return this;
})();

hs.functions.fix_xml = function ( xml ) {
    debug(4,"fix_xml: broken xml ",{ "xml": xml });
    var _result = null;
    var _regex = new RegExp(/=\"(.*?)\"/gm);
    while( _result = _regex.exec(xml)) {
        var _match = _result[1];
        if (_match.match(hs.functions.entity.encode_regex) == null) {
            continue;
        }
        var _match_len = _match.length;
        _match = hs.functions.entity.encode(_match);
        var _xml_len = xml.length;
        var _index = _result.index +2; 
        xml = xml.substr(0,_index ) + _match + xml.substr(_index + _match_len ,_xml_len - _index + _match_len);
    }
    return xml;
}

hs.functions.login_init = function( oarg ) {
    debug(5,"login_init:",oarg);
    var _cmd = "init";
    var _url =  "/hsgui?cmd=" + _cmd;
    _url += "&user=" + hs.auth.username;
    _url += "&cid="  + hs.auth.gui_design;
    _url += "&ref="  + hs.auth.gui_refresh;
    hs.functions.make_request( {
        "session"     : oarg.session,
        "cmd"         : _cmd,
        "url"         : _url
    });
};

hs.functions.async.login = function( oarg ) {
    debug(5,"async.login:",oarg);
    oarg.session.auth.handle = oarg.json.HS.HND;
    oarg.session.auth.tan = oarg.json.HS.TAN;
    oarg.session.auth.tan_counter = 0;
    oarg.session.auth.pos = parseInt(oarg.json.HS.POS)+1;
    oarg.session.auth.glob_key1 = hs.functions.make_globkey(0x5c);
    oarg.session.auth.glob_key2 = hs.functions.make_globkey(0x36);
    hs.functions.make_request( {
        "session"     : oarg.session,
        "cmd"         : "login",
    });
};

hs.functions.async.logged_in = function(  oarg ) {
    debug(5,"async.logged_in (" + oarg.session.target + "):",oarg.json);
    // check main
    oarg.session.connected = true; 
    if (hs.user == null) {
        hs.user = {};
        hs.user.load_background = parseInt(oarg.json.HS.VIS._bgi);  // unwichtig ? 
        hs.user.fullscreen_visu = oarg.json.HS.VIS._fv == 1;
        hs.user.start_page      = parseInt(oarg.json.HS.USR._vis);
        hs.user.start_query     = parseInt(oarg.json.HS.USR._qry);
        hs.user.start_list      = parseInt(oarg.json.HS.USR._lst);
        hs.user.start_go        = parseInt(oarg.json.HS.USR._go); // ????
        
        hs.user.streaming       = oarg.json.HS.USR._stream == 1; 

        hs.user.refresh_visu         = oarg.json.HS.USR._refvis*1;
        hs.user.refresh_visucam      = oarg.json.HS.USR._refvcam*1;
        hs.user.refresh_visugraf     = oarg.json.HS.USR._refvgraf*1;
        hs.user.refresh_visugrafcam  = oarg.json.HS.USR._refvgrafcam*1;
        hs.user.refresh_list  = oarg.json.HS.USR._reflst*1;
        hs.user.refresh_query = oarg.json.HS.USR._refqry*1;
        hs.user.refresh_mask  = oarg.json.HS.USR._refmask*1;
        hs.user.refresh_graf  = oarg.json.HS.USR._refgraf*1;
        hs.user.refresh_cam   = oarg.json.HS.USR._refcam*1;
    }
    
    // überprüfen ob die Schriften sich geändert haben
    if (hs.gui.hashes._font != oarg.json.HS.HASH._font) {
        hs.functions.make_request( {
            "session"     : oarg.session,
            "cmd"         : "getfont",
        });
    }
    // überprüfen ob die Parameter geändert wurden
    if (hs.gui.hashes._para != oarg.json.HS.HASH._para) {
        hs.functions.make_request( {
            "session"     : oarg.session,
            "cmd"         : "getattr",
        });
    }
    hs.gui.hashes = oarg.json.HS.HASH;
    // Visuseite laden
        
    oarg.page_id = oarg.session.start_id || hs.user.start_page;
    hs.functions.load_page( oarg );
};

hs.functions.update_timer = function( oarg ) {
    if ( oarg.session.update_timer != null && oarg.cmd == "start") {
        clearTimeout(oarg.session.update_timer)
        //debug(5,"Update_timer: cleared",oarg);
    } else {
        hs.functions.make_request( {
            "session"     : oarg.session,
            "cmd"         : "gvu&id=" + oarg.session.active_pages[0],
            "page_id"     : oarg.session.active_pages[0],
        });
    }
    debug(5,"Update_timer:",oarg);
    oarg.session.update_timer = setTimeout(function () {
        hs.functions.update_timer ({
            "session"   : oarg.session,
            "cmd"       : "restart",
        });
    }, (hs.user.refresh_visu *1000));
}

hs.functions.do_command = function( oarg ) {
    debug(4,"do_command:",oarg);
    if (oarg.item.has_command) {
        hs.functions.make_request( {
            "session"     : oarg.item.session,
            "cmd"         : "vcu&id=" + oarg.item.id,
            "page_id"     : oarg.page_id,
        });
    }
}

hs.functions.do_valset = function ( oarg ) {
    debug(4,"do_valset: " +oarg.item.value,oarg);
    if(typeof oarg.item.value == 'undefined' || oarg.item.action_id != 9) {
        return;
    }
    hs.functions.make_request( {
        "session"       : oarg.item.session,
        "cmd"           : "valset&id=" + oarg.item.id + "&val=" + oarg.item.value,
        "page_id"       : oarg.page_id,
    });
}

hs.functions.load_page = function( oarg ) {
    debug(4,"load_page (" + oarg.session.target + "): " + oarg.page_id + " (" + oarg.command_id + ")", oarg);
    oarg.session.start_id = oarg.page_id;

    var _extra_request = "";
    if (typeof oarg.item != 'undefined' && oarg.item.has_command) {
        _extra_request = "&cmdid=" + oarg.item.id + "&cmdpos=0";
    }

    if (hs.gui.pages.hasOwnProperty(oarg.page_id)) {
        var _page = hs.gui.pages[oarg.page_id];
        if (!_page.hidepage) {
            //FIXME
            if ($.inArray(oarg.page_id, hs.gui.active_pages) > -1 ) {
                debug(5,"load_page:FadeIn Cached Page "+oarg.page_id);
                _page.object.css("z-index","50");
                _page.object.fadeIn(20);
                oarg.session.history.push(oarg.page_id);
                document.title = "xxAPI - " + _page.text1;
            }
            oarg.cmd = "gv&id=" + oarg.page_id + _extra_request;
            hs.functions.make_request( oarg );
            return
        }
    } 
    hs.functions.make_request( {
        "session"     : oarg.session,
        "cmd"         : "gv&id=" + oarg.page_id + _extra_request,
        "page_id"     : oarg.page_id,
    });
};

hs.functions.async.gv = function( oarg ) {
    debug(5,"async.gv (" + oarg.session.target + "): ",oarg);
    hs.functions.update_timer({
        "session"   : oarg.session,
        "cmd"       : "start",
    });
    if (oarg.json.HS == "") {
        return false;
    }

    $(oarg.json.HS.ITEMS.ITEM).reverse().each( function() {
        if (this._type != "ICO") {
            return;
        }
        this._url = "/guiico?id=" +  this._ico + "&cl=" + hs.auth.gui_design + "&hash=" + hs.gui.hashes._ico; // FIXME? with hash more traffic?
    });

    var _page = new hs.functions.hs_page( oarg );
};

hs.functions.mouse_event = function( oarg ) {
    debug(3,"mouse_event: " + oarg.item.event.type,oarg);
    if (typeof oarg.item.eventcode[oarg.item.event.type] == 'function') {
        oarg.item.eventcode[oarg.item.event.type]( oarg );
    }
}

hs.functions.check_click = function( oarg ) {
    debug(3,"check_click",oarg);
    var _session_position =  $("#" + oarg.item.session.target).position();
    xxAPI.events.lastclick.top = oarg.item.event.pageY - _session_position.top;
    xxAPI.events.lastclick.left = oarg.item.event.pageX - _session_position.left;
    if (typeof oarg.item.eventcode.click == 'function') {
        oarg.item.eventcode.click( oarg );
    }
    /*
        Element .action_id
             0 = Nur Befehl
             1 = Seitenaufruf (optional Befehl)
             2 = 
             3 =
             4 =
             5 =
             6 =
             7 = Kamera
             8 = Wochenschaltuhr /hsgui?cmd=getpag&id=31&hnd=4&code=C52747C9D8
             9 = Werteingabe  /hsgui?cmd=getpag&id=23&hnd=3&code=CB87CC79BA
            10 = Urlaubskalender
            11 = Feiertagskalender
            12 = Datum/Uhrzeit setzen /hsgui?cmd=getpag&id=17&hnd=3&code=CB87CC79BA
            13 = 
            14 = Meldungsarchiv /hsgui?cmd=getmsg&id=29&dir=0&cnt=5&hnd=4&code=2EB8E86D8F
            15 = Buddy   /hsgui?cmd=getbud&id=25&dir=0&cnt=5&hnd=3&code=CC16E8CD49
            16 = Diagramm /hsgui?cmd=getpag&id=32&hnd=4&code=C65F9B4058
            17 = Kamera-Archiv  /hsgui?cmd=getcama&id=30&dir=0&cnt=6&hnd=4&code=FF8BF7D074
            18 = Universal Zeitschaltuhr /hsgui?cmd=getuhr&id=18&dir=0&cnt=5&hnd=4&code=18831A2D12
            19 = 
            20 = Seite aktualisieren
            21 = Navigation: Startseite
            22 = Navigation: Zurück
            23 = Menü /hsgui?cmd=gl&id=153&frm=1&cnt=5&hnd=2&code=935C315C9D /hsgui?cmd=glu&hnd=1&code=33B5E3DF74 // /hsgui?cmd=gl&id=291&frm=1&cnt=5&hnd=1&code=A5840BEDB8 
            24 = Query /hsgui?cmd=gq&id=6&frm=1&cnt=5&chk=0&hnd=4&code=3BC1D69459
            25 = Navigation: Beenden  /hsgui?cmd=logout&hnd=3&code=AE7A1C1473
    */
    switch (oarg.item.action_id) {
        case 0:
            //  0 = Nur Befehl
            hs.functions.do_command( oarg );
            break;
        
        case 1: 
            // 1 = Seitenaufruf (optional Befehl)
            oarg.page_id = oarg.item.open_page;
            hs.functions.load_page( oarg );
            break;
            
        case 8:
            // Wochenschaltuhr
            /*
                /hsgui?cmd=timset&id=31&days=000000000&frm=1200&to=2100&act=0&hnd=4&code=A2669029CE
            */
            alert("Wochenschaltuhr noch nicht implementiert");
            break;
        case 9:
            // Werteingabe
            /*
                /hsgui?cmd=valset&id=2&val=8.123456
            */
            alert("Werteingabe noch nicht implementiert");
            break;
        case 12:
            // Datum/Zeit setzen
            /*
                /hsgui?cmd=getpag&id=17&hnd=3&code=CB87CC79BA
                <HS><DATE txt1="Datum/Uhrzeit setzen 1.Zeile" txt2="2.zeile" ico="MLOGO" date="201412090927"/></HS>
                /hsgui?cmd=dateset&id=17&date=20141209&time=092100&hnd=4&code=C49E6423F3
            */
            alert("Datum/Zeit setzen noch nicht implementiert");
            break;
        case 16:
            // Diagramm
            /*
                /hsgui?cmd=getpag&id=32&hnd=4&code=C65F9B4058
                <HS><GRAF txt1="Diagramm" txt2="" ico="MLOGO"/></HS>
            */
            alert("Diagrammaufruf noch nicht implementiert");
            break;
        case 21:
            // 21 = Navigation: Startseite
            if ( hs.user.start_page != oarg.item.page.id) {
                oarg.page_id = hs.user.start_page;
                hs.functions.load_page( oarg );
            }
            break;
        case 22:
            // 22 = Navigation: Zurück
            debug(5,"history_back",oarg);
            if (oarg.session.history.length > 1) {
                oarg.session.history.pop();
                var _lastpage = oarg.session.history.pop();
            
                if (_lastpage !== undefined) {
                    oarg.page_id = _lastpage;
                    hs.functions.load_page( oarg );
                }
            }
            break;
        case 23:
            // 23 = Menü
            //hs.functions.make_request({ session:session,cmd:"gl&id=" + hs.user.start_list + "&frm=1&cnt=5"} );
            alert("Menü noch nicht implementiert")
            break;
        case 25:
            // 25 = Logout
            hs.functions.logout();
            break;
            
        default:
            alert("Funktionstyp " + oarg.item.action_id + " noch nicht implementiert");
    }
}

hs.functions.logout = function() {
    hs.auth.password = "";
    hs.auth.glob_key1 = "";
    hs.auth.glob_key2 = "";
//    hs.functions.make_request({ 
//        "session"   : _item.session,
//        "cmd"       : "logout"
//    });
    window.location.href += "?logout=1";
}

hs.functions.async.getfont = function( oarg ) {
    hs.gui.fonts = { 
        0 : {} 
    };
    $.each(oarg.json.HS.FONTS.FONT,
        function(i,item) {
            hs.gui.fonts[item._id] = { 
                'font-family'  : item._name,
                'font-size'    : item._size + "pt",
                'font-weight'  : item._bold == 1 ? "bold":"normal",
            };
        }
    );
    hs.gui.systemfonts = {}
    $.each(oarg.json.HS.SYSFONTS.FONT,
        function(i,item) {
            hs.gui.systemfonts[item._key] = {
                'font-family'  : item._name,
                'font-size'    : item._size + "pt",
                'font-weight'  : item._bold == 1 ? "bold":"normal",
                'color'        : hs.functions.get_hexcolor(item._color)
            };
        }
    );
};

hs.functions.async.getattr = function( oarg ) {
    $.each(oarg.json.HS.PARAS.P,
        function(i,item) {
            // parse Integer if possible
            hs.gui.attr[item._key.toLowerCase()] = isNaN(item._val*1) ? item._val:item._val*1;
        }
    );
    
    hs.gui.attr.initial_visu_height = (
        hs.gui.attr.ltitleh +
        (hs.gui.attr.llinec * hs.gui.attr.llineh) +
        hs.gui.attr.lnavh +
        (hs.gui.attr.hasborder == 0 ? 0:
            hs.gui.attr.lsep1h + hs.gui.attr.lsep2h + hs.gui.attr.lsep3h + hs.gui.attr.lsep4h
        )
    );
    hs.gui.attr.initial_visu_width = (
        (6 * hs.gui.attr.lnavw) +
        (hs.gui.attr.hasborder < 2 ? 0:
            hs.gui.attr.lbleftw + hs.gui.attr.lbrightw
        )
    );
};

hs.functions.login_dialog = function(errortype) {
    if (hs.gui.designs_html != null) {
        return hs.functions.login_form(errortype)
        
    }
    $.ajax({ 
        "url"           : "/hs",
        "contentType"   : "application/x-www-form-urlencoded;charset=ISO-8859-1",
        "dataType"      : "html",
        "complete"      : function(xhttpobj) {
            hs.functions.async.parse_designs(xhttpobj,errortype);
        }
    });
}

hs.functions.async.parse_designs = function(xhttpobj,errortype) {
    try {
        var _result = new RegExp(/.*<td>(.*?name="cl".*?)<\/td>/).exec(xhttpobj.responseText);
        hs.gui.designs_html = _result[1];

    } catch (e) {
        debug(0,"Error parsing Designs from /hs",xhttpobj);
        hs.gui.designs_html = "<input name='cl' type='text'>";
    }
    hs.functions.login_form(errortype)

}

hs.functions.login_form = function(errortype) {
    var _form_html = "";
    _form_html += "<form id='login_form' action='#' accept-charset='utf-8'  autocomplete='off'>";
    _form_html += "<h2>xxAPI Login</h2>";
    _form_html += "<label for='username'>Benutzer</label>";
    _form_html += "<input name='username' class='textinput' tabindex='1' type='text' value='" + (hs.auth.username == null ? "" : hs.auth.username) + "'>";
    _form_html += "<label for='password'>Passwort</label>";
    _form_html += "<input name='password' class='textinput' tabindex='2'type='password' >";
    _form_html += "<label for='cl'>Design</label>";
    _form_html += hs.gui.designs_html;
    _form_html += "<label for'remember'>&#160;</label>";
    _form_html += "<button type='submit' tabindex='4'>Login</button>";
    _form_html += "<div class='wide'>";
    _form_html += "<input name='remember' tabindex='5' type='checkbox'" + ((hs.auth.username != null) == (localStorage.getItem('username') == hs.auth.username) ? " checked": "" ) + ">";
    _form_html += "Kennwort speichern</div>";
    _form_html += "</form>";
    var _form_div = $('<div />').html(_form_html);
    _form_div.modal({
        "modal"         : true,
        "escClose"      : false,
        "autoPosition"  : true,
        "onShow"        : function (dialog) {
            hs.gui.modal_popup = this;
            $('#login_form > select[name="cl"]').attr('tabindex', 3);
            $('#login_form > select[name="cl"]').css("width", "100%");
            if (hs.auth.gui_design != null) {
                $('#login_form > select[name="cl"]').val(hs.auth.gui_design);
            } else {
                $('#login_form > select[name="cl"]').val(
                    $('#login_form > select[name="cl"] > option:first').val()
                );
            }
            //if (hs.auth.username.length > 0) {
               //$('#login_form > input[name="password"]').attr("type","text");
            //}
            $('#login_form > button',dialog.data[0]).click(function (e) {
                e.preventDefault();
                hs.auth.username = $('#login_form > input[name="username"]').val();
                hs.auth.password = $('#login_form > input[name="password"]').val();
                hs.auth.gui_design = $('#login_form > [name="cl"]').val();
                debug(5,"CHECKED: ",$('#login_form  input[name="remember"]').prop("checked"));
                if ($('#login_form  input[name="remember"]').prop("checked")) {
                    localStorage.setItem('username',hs.auth.username);
                    localStorage.setItem('password',hs.auth.password);
                    localStorage.setItem('gui_design',hs.auth.gui_design);
                } else {
                    localStorage.clear();
                    debug(4,"Clear Storage",localStorage);
                }
                new hs.functions.hs_session("VISU");
                //$('#login_form',elements));
                hs.gui.modal_popup.close();
            });
        }
    });

}

hs.functions.number2align = function(align) {
    switch (parseInt(align)) {
        case 1:
            return "left"
        case 2:
            return "center"
        case 3:
            return "right"
    };
    return ""
}
hs.functions.get_hexcolor = function(numcolor) {
    var _hex = "";
    if (typeof numcolor == 'undefined') {
        return;
    }
    if (numcolor*1 >= 0) {
        _hex = "#" + ("000000" + parseInt(numcolor).toString(16).toUpperCase()).substr(-6);
        //debug(5,"get_hexcolor: " + numcolor + " = " + _hex);
    } else {
        _hex = "transparent";
    }
    return _hex;
}

function string_padding(str, len, pad) {
    if (typeof len == "undefined") { var len = 0; }
    if (typeof pad == "undefined") { var pad = ' '; }
    len += 1;
    if (len >= str.length) {
        return str + Array(len - str.length).join(pad);
    }
    return str;
};
function string_cut_after_match(str,pattern) {
    var _idx = str.indexOf(pattern);
    var _str = str
    if (_idx != -1) {
        _str = str.substring(0,_idx);
    }
    return _str;
}

hs.functions.get_query_parameter = function(item) {
    var svalue = location.search.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)","i"));
    return svalue ? svalue[1] : svalue;
}

jQuery.fn.reverse = [].reverse;

jQuery.fn.center = function (parent) {
    if(typeof parent == 'undefined') {
        parent = this.parent()
    } else {
        parent = $(parent);
    }
    this.css({
        "position"  : "absolute",
        "top"       : parent.height() < this.height() ? 0 : parent.height()/2 - this.height()/2,
        "left"      : parent.width() < this.width()   ? 0 : parent.width()/2 - this.width()/2,
    });
}

hs.functions.set_viewport = function() {
    debug(5,"Set Viewport",hs.gui.attr);
    $("#VISU").css({
        "display"   : "block",
        "position"  : "absolute",
        "width"     : hs.gui.attr.visu_width,
        "height"    : hs.gui.attr.visu_height,
    }).center(window);
    
    //return true;
    var _orientation = hs.functions.get_orientation();
    var _visual_height = _orientation == "landscape" ? window.screen.availWidth  : window.screen.availHeight;
    var _visual_width  = _orientation == "landscape" ? window.screen.availHeight : window.screen.availWidth;
    
    var _scaleto_width = Math.floor ( _visual_width / hs.gui.attr.visu_width * 100) / 100;
    var _scaleto_height = Math.floor ( _visual_height / hs.gui.attr.visu_height * 100) / 100;
    var _scale_min = Math.min( _scaleto_width, _scaleto_height);
    var _scale_max = Math.max( _scaleto_width, _scaleto_height, 1.0);
    var _viewport_meta = 
        "width="          +  hs.gui.attr.visu_width +
        (_scale_min > 1 ? "" : ",initial-scale=" + _scale_min) +
        ",minimum-scale=" + _scale_min +
        ",maximum-scale=" + _scale_max +
        ",user-scalable=" + (_scale_min != _scale_max ? "yes":"no");
    $("#meta_viewport").attr("content", _viewport_meta );
    debug(5,"Viewport: " +  _viewport_meta + " orientation: " + _orientation + " vheight: " + _visual_height + " vwidth: " + _visual_width);
}

hs.functions.get_orientation = function () {
    if (typeof orientation != "undefined") {
        return ( orientation % 180 ? "landscape":"portrait");
    } else {
        return "unsupported";
    }
}

hs.functions.stringify = function (obj) {
    return JSON.stringify(obj, function (key, value) {
      if (value instanceof Function || typeof value == 'function') {
        // use strict wird im chrome nicht übernommen daher sind die Funktionen unterschiedlich
        return value.toString().replace("\n\"use strict\";\n","");
      }
      return value;
    });
}

hs.functions.post_loading = function () {
    var _base = $("base");
    if (typeof _base.attr("href") != "undefined" && _base.attr("href") != "") {
        $("head").append('<link rel="stylesheet" href="libs/xxapi.css">');
        // Clear Base
        $("base").attr("href","");
    } else {
        // HS Fix for Content Type not text/css
        hs.functions.element_loader("libs/xxapi.css");
    }
    hs.functions.element_loader("custom.css");
    hs.functions.element_loader("custom.js");
}

hs.functions.element_loader = function ( filename ) {
    var _id = filename.replace(".","_").replace("/","_");
    var _type = filename.toLowerCase().split(".")[1];
    var _element = "script";
    if (_type == "css") {
        _element = "style";
    }
    $("head").append(
        $("<"+_element+" />", { 
            "id" : _id
        })
    )
    debug(4,"element_loader", { "filename" : filename, "type" : _type, "id" : _id });
    $.ajax({ 
        url     : filename, 
        cache   : true, 
        complete: function(xhttpobj) { 
            var _html = xhttpobj.responseText;
            if (_html == "") { 
                return;
            }
            debug(5,"element_loader_ajax",{ "html" : _html });
            if (_element == "script") {
                _html = '"use strict"; ' + _html;
            }
            $("#"+_id).html(_html)
         } 
     });
}

$(document).ready(function() {
    $("#POPUP").remove();
    if(hs.functions.get_query_parameter("logout")) {
        localStorage.removeItem('password');
        window.location.replace(location.protocol + '//' + location.host + location.pathname);
    }
    if (typeof Storage != 'undefined') {
        hs.auth.username = localStorage.getItem('username');
        hs.auth.password = localStorage.getItem('password');
        hs.auth.gui_design = localStorage.getItem('gui_design');
        hs.debuglevel      = localStorage.getItem('debuglevel') || 0;
    }

    if (hs.auth.username == null || hs.auth.password == null || hs.auth.gui_design == null) {
        hs.functions.login_dialog()
    } else {
        new hs.functions.hs_session("VISU");
    }
});

$(window).bind('orientationchange', function(event) {
    hs.functions.set_viewport();
    //hs.functions.get_orientation();
});

$(window).resize(function() {
    hs.functions.set_viewport();
});

$(document).keydown( function(e) {
    if (e.ctrlKey && String.fromCharCode(e.which) === 'X') {
        xxAPI.functions.XXAPICONFIG( null );
        return false;
    }
});

window.addEventListener('load', function(e) {
    window.applicationCache.addEventListener('updateready', function (e) {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
            window.applicationCache.swapCache();
            window.location.reload();
        }
    });
});
