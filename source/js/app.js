(function (angular) {
//    'use strict';

    //var app = angular.module('BlogApp', ['720kb.tooltips','ngAnimate', 'ui.bootstrap',blogAnimations
    var app = angular.module('BlogApp', ['ngRoute','720kb.tooltips','ngAnimate','ngMaterial','angular-carousel','angular-drag','angularResizable'])
    .config(function ($httpProvider,$routeProvider,$locationProvider,$sceDelegateProvider,$interpolateProvider ) {
            $httpProvider.defaults.withCredentials = true;
        //$compileProvider.imgSrcSanitizationWhitelist(/^\s*(blob):/);
        //$sceDelegateProvider.resourceUrlWhitelist(/^\s*debug\.life/);
        $interpolateProvider.startSymbol("[[");
        $interpolateProvider.endSymbol("]]");

        $sceDelegateProvider.resourceUrlWhitelist(['self','https://notebook.debug.life/**']);

        $routeProvider
            .when('/', {
                templateUrl: '/$index/',
                controller: 'indexCtrl'
            })
            .when('/categories', {
                templateUrl: '/$categories',
                controller: 'catCtrl'
            })
            .when('/playground', {
                templateUrl: '/$playground',
                controller: 'playgroundCtrl'
            })
            .when('/notebook/:nbpath', {
                templateUrl: '/$notebook',
                controller: 'notebookCtrl'
            })
            .when('/notebook', {
                templateUrl: '/$notebook',
                controller: 'notebookCtrl'
            })
            .when('/archives', {
                templateUrl: '/$archives',
                controller: 'archiveCtrl'
            })
            .when('/about', {
                templateUrl: '/$about',
                controller: 'aboutCtrl'
            })
            .when('/subscribe', {
                templateUrl: '/$subscribe',
                controller: 'subscribeCtrl'
            })
            //.when('/categories/:catName', {
            //    templateUrl: '/$categories/:catName/',
            //    controller: 'catCtrl'
            //})
            .when('/404', {
                templateUrl: '/$404',
                controller: 'nopageCtrl'
            })
            .when('/crawler', {
                templateUrl: '/$crawler',
                controller: 'crawlerCtrl'
            })
            .when('/mindmap', {
                templateUrl: '/$mindmap',
                controller: 'mindmapCtrl'
            })
            .when('/:articleName', {
                templateUrl:buildPath
            })
            .when('/categories/:catId', {
                templateUrl:buildCatePath
            })
            .when('/tags/:tagId', {
                templateUrl:buildTagPath
            });
            //.when('/:page_title',{
            //    templateUrl:buildPath
            //});

        $locationProvider.html5Mode(true);

        //$mdIconProvider
        //    .iconSet("call", 'img/icons/sets/communication-icons.svg', 24)
        //    .iconSet("social", 'img/icons/sets/social-icons.svg', 24);
    }).run(function($rootScope,$document,$compile,$window,$http,$mdPanel,$sce){
            $rootScope.trustUrl = function(url){
                return $sce.trustAsResourceUrl(url);
            }
            $('.content_container').bind("mouseup", function(event) {
                if($rootScope.selectHTML(true)){
                    //$('#selectedText').append($compile("<a tooltips tooltip-template='tooltip' href='#'>"+$('#selectedText').text()+"</a>")($scope.$new(true)));
                    if($('#selectedText').text().length == 0){
                        delete $('#selectedText');//.parent().remove('#selectedText');
                        return;
                    }

                    $('#selectedText').attr('content',$('#selectedText').text());
                    $('#selectedText').html($compile('<span><span tooltips tooltip-smart="true" tooltip-template="'+$('#selectedText').text()+'" >'+$('#selectedText').text()+'</span></span>')($rootScope.$new(true)));
                    $('tooltip').addClass('active');
                }
            });
            $('.content_container').bind("mousedown", function(event) {
                if($('#selectedText').length>0){
                    //console.log($('#selectedText')[0].nextSibling.nodeName);

                    var thisNode = $('#selectedText')[0];

                    var after = $('#selectedText').attr('content')+$('#selectedText')[0].nextSibling.nodeValue;

                    var p = $('#selectedText')[0].parentNode;
                    for(var i in p.childNodes){
                        //console.log(i);
                        if(p.childNodes[i].isSameNode(thisNode)){
                            if(i != 0) {
                                if( p.childNodes[i-1].nodeName == '#text'){
                                    //console.log(p.childNodes[i+1]);
                                    if(thisNode.nextSibling){
                                        p.removeChild(thisNode.nextSibling);
                                    }
                                    p.childNodes[i-1].nodeValue = p.childNodes[i-1].nodeValue + after;
                                }else{
                                    p.childNodes[i+1].nodeValue = after;
                                }
                            }else{
                                p.childNodes[i+1].nodeValue = after;
                            }
                            p.removeChild(thisNode);
                            break;
                        }
                    }
                }

            });
            $rootScope.selectHTML = function(highlight) {
                try {

                    if (window.ActiveXObject) {
                        var c = document.selection.createRange();
                        return c.htmlText;
                    }

                    var w = getSelection().getRangeAt(0);
                    if((w.endOffset- w.startOffset) > 0){
                        var nNd = document.createElement("span");
                        if(highlight){
                          nNd.setAttribute('id', 'selectedText');
                        }
                        w.surroundContents(nNd);
                        return nNd.innerText;
                    }else{
                        return false;
                    }

                } catch (e) {
                    if (window.ActiveXObject) {
                        return document.selection.createRange();
                    } else {
                        return getSelection();
                    }
                }
            }
            $rootScope.reconnect = function() {
                //GateOne.Terminal.killTerminal(GateOne.Terminal.terminals[0]);
                //GateOne.Terminal.closeTerminal(1,true,'reconnecting');
                $rootScope.terminal_inited=false;
                $rootScope.is_show_terminal=false;
                jQuery(function($) {
                    $(document).ready( function() {
                        $('#gateone').remove();
                        $('#go_container').append("<div id='gateone2'></div>");
                    });
                });

                $rootScope.connect(true);
            }
            $rootScope.termianlID = 1;
            $rootScope.connect = function(is_reconnect) {
                if($rootScope.is_show_terminal){
                    $rootScope.termStyle={"top":$window.pageYOffset+50};
                    return;
                }
                if($rootScope.terminal_inited){
                    $rootScope.is_show_terminal=true;
                    return;
                }
                var parameter = JSON.stringify({username:$rootScope.user});
                $http.post('https://api.debug.life/api/auth_gateone/',parameter).success(function(authData){
                    var container = GateOne.Utils.createElement('div', {
                        'id': 'container'+$rootScope.termianlID, 'class': 'terminal', 'style': {'height': '100%', 'width': '100%'}
                    });
                    var newTerminal = function() {
                        GateOne.Base.superSandbox("NewExternalTerm", ["GateOne.Terminal", "GateOne.Terminal.Input"], function(window, undefined) {
                            "use strict";
                            //var gateone = GateOne.Utils.getNode('#gateone');
                            //gateone.appendChild(container);
                            //GateOne.Terminal.newTerminal(null, null, container);
                            GateOne.Terminal.newTerminal(null, null, '#gateone');
                        });
                    };

                    if(!is_reconnect){
                        GateOne.init({
                            url: 'https://linux.debug.life/',
                            embedded: true,
                            style: { 'background-color': 'black', 'box-shadow': '0 0 0px blueViolet'},
                            auth: authData
                        },newTerminal);
                    }else{
                        //newTerminal();
                        GateOne.Terminal.newTerminal(null, null, '#gateone2');
                    }
                    $rootScope.is_show_terminal=true;
                    $rootScope.terminal_inited=true;
                    //jQuery(function($) {
                    //    $(document).ready( function() {
                    //        $('#go_container').append("<div style='width:100%;height:100%;'></div>");
                    //    });
                    //});

                });
            };
            $rootScope.close_terminal = function(){
                $rootScope.is_show_terminal=false;
            };
            $rootScope.exec = function(){
                var comm = $rootScope.selectHTML();
                if(comm){
                    GateOne.Terminal.sendString(comm+" \n");
                }
            }
            $rootScope.is_login = false;
            $rootScope.is_show_terminal = false;

            $rootScope.showTermHelp = function() {
                var position = $mdPanel.newPanelPosition()
                    .absolute()
                    .center();
                var config = {
                    attachTo: angular.element(document.body),
                    controller: 'headerCtrl',
                    //controllerAs: 'ctrl',
                    disableParentScroll: this.disableParentScroll,
                    templateUrl: '$playground-help/',
                    hasBackdrop: true,
                    panelClass: 'demo-dialog-example',
                    position: position,
                    trapFocus: true,
                    zIndex: 150,
                    clickOutsideToClose: true,
                    escapeToClose: true,
                    focusOnOpen: true
                };
                $mdPanel.open(config);
            };

    });
    function buildPath(path){
        return '/$' + path.articleName;
    }
    function buildCatePath(path){
        return '/$categories/' + path.catId;
    }
    function buildTagPath(path){
        return '/$tags/' + path.tagId;
    }

    app.controller('postCtrl', function ($scope, $http) {
    });

    app.controller('indexCtrl', function ($scope, $http) {
        //$scope.page_class='page-home';
        $scope.slides=[
            "http://www.neeu.com/uploads/images/2015/6/26/1435285940024.jpg",
            "http://i3.sinaimg.cn/ty/2014/0624/U10877P6DT20140624114447.jpg",
            "http://y0.ifengimg.com/cc1307c8a4f6a428/2013/0416/rdn_516cf56be4d7d.jpg"
        ];
        $scope.carouselIndex=0;
    });
    app.controller('catCtrl', function ($scope, $http) {
    });

    app.controller('notebookCtrl', function ($scope, $http,$window,$routeParams,$document){
        $scope.imagePath='https://material.angularjs.org/latest/img/washedout.png';
        $scope.post_title = "Notebook";
        var subfix = '';
        var nbpath='';
        if($routeParams.nbpath){
            var title = $routeParams.nbpath.split('@');
            $scope.post_title = title[title.length-1];
            if(title[0]!='tree'){
                subfix = '.ipynb';
            }
            nbpath = $routeParams.nbpath.replace(/@/g,"/")+subfix;
        }

        var ifr_top = angular.element(document.querySelector('#notebook')).offset().top;

        setInterval(function(){
            if(window.frames[0]){
                var top = $window.pageYOffset;
                if(top>ifr_top){
                    top-=ifr_top-30;
                }else if(top<=ifr_top){
                    top=0;
                }
                window.frames[0].postMessage(top,'*');
            }
        },500);

        $scope.srcpath="https://notebook.debug.life/"+nbpath;
        //console.log($scope.srcpath);
        //document.getElementById('nb_ifr').src="about:blank";
        //document.getElementById('nb_ifr').src=$scope.srcpath;
        //window.open($scope.srcpath, "nb_ifr");
        //TODO: ???无法重载iframe , or use ng-src in iframe tag
        //window.location.reload();


        //console.log($scope.srcpath);

        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

        eventer(messageEvent,function(e) {
            var oheight = document.querySelector('#notebook').style.height.replace('px','');
            if(e.data < oheight){
                return;
            }
            //console.log('get:   '+ e.data);
            angular.element( document.querySelector('#notebook')).css({'height': e.data+35});
        },false);
    });

    app.controller('archiveCtrl', function ($scope, $http) {
        //$scope.page_class='page-archive';
    });
    app.controller('aboutCtrl', function ($scope, $http) {
    });
    app.controller('subscribeCtrl', function ($scope, $http) {
    });
    app.controller('nopageCtrl', function ($scope, $http) {
    });

    app.controller('playgroundCtrl', function ($scope, $http) {
        $scope.is_show_help = false;
        $scope.is_has_container = false;
        $scope.is_show_pwd=false;

        $scope.show_help = function () {
            $scope.is_show_help = !$scope.is_show_help ;
        };
        $scope.create_container = function () {
            $http.post('https://api.debug.life/docker/create/').success(function(data){
                $scope.host = data.hostname;
                $scope.user = data.user;
                $scope.pwd  = data.pwd;
                $scope.is_has_container = true;
            });
        };
        $http.post('https://api.debug.life/docker/has_container/').success(function(data){
            $scope.host = data.hostname;
            $scope.user = data.user;
            $scope.pwd  = data.pwd;
            $scope.is_has_container = true;
        });
        $scope.show_pwd = function(){
            $scope.is_show_pwd=!$scope.is_show_pwd;
        }



    });

    app.controller('bodyCtrl', function ($scope, $document,$compile,$http,$rootScope) {



    });
    app.controller('headerCtrl', function ($scope, $http,$rootScope) {

        $http.get('https://api.debug.life/api/is_login/').success(function(data) {
            if(!data.code){
                $scope.username='欢迎,'+data.username;
                $rootScope.user=data.username;
                //$scope.is_login = true;
                $rootScope.is_login = true;
                //app.value('is_login',true);
            }
        });

        $scope.logout =function(){
            $http.get('https://api.debug.life/github/logout/').success(function(data) {
                if(!data.code){
                  $scope.username='';
                  //$scope.is_login = false;
                  $rootScope.is_login = false;
                  //app.value('is_login',false);
                }
            });

        };
        jQuery(function($) {
            $(document).ready( function() {
                //enabling stickUp on the '.navbar-wrapper' class
                $('#nav-menu').stickUp();
            });
        });



    });

    app.controller('crawlerCtrl', function ($scope, $http) {
        $scope.logout =function(){
            $http.post('https://api.debug.life/api/crawl/').success(function(data) {
                if(!data.code){
                    $scope.content=data.content;
                }
            });

        };

    });
    app.controller('mindmapCtrl', function ($scope, $http,$mdPanel,$window) {
        $scope.mm_list = [{'key':'bigdata','name':'数据科学与工程'}];
        $scope.showTree = function() {
            var h=$window.innerHeight*0.9,w=$window.innerWidth*0.9;
            var position = $mdPanel.newPanelPosition()
                .absolute()
                .center();
            var config = {
                attachTo: angular.element(document.body),
                controller: 'mindmapCtrl',
                disableParentScroll: this.disableParentScroll,
                hasBackdrop: true,
                panelClass: 'mm-panel',
                position: position,
                trapFocus: true,
                zIndex: 150,
                clickOutsideToClose: true,
                escapeToClose: true,
                focusOnOpen: true,
                template:'<div style="height: '+h+'px;width:'+w+'px;" id="jsmind_container"></div>',
                onOpenComplete:function(){
                    $http.get('/mindmap/bigdata.mm').success(function(data) {
                        var mind = data;
                        var options = {
                            container:'jsmind_container',
                            editable:true,
                            mode :'full',
                            support_html : true,
                            theme:'belizehole'
                        };
                        var jm = new jsMind(options);
                        jm.show(mind);
                    });
                }
            };
            $mdPanel.open(config);
        };
    });

}(angular));

