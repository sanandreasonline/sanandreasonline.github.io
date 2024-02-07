
    var ang = angular.module('app',[]);

    function AnimationController() {
        this.offsets = []
        this.subpages = [
            ".top_info.wrapper",
            ".installation.wrapper",
            ".install_process.wrapper",
            ".launch.wrapper",
            ".game_server.wrapper",
            ".in_social_network.wrapper"
        ];
        this.subp = this.subpages.slice(0);
        this.style = [
            "fadeIn", "flipInX", "zoomIn",
            "flipInX", "fadeIn", "fadeInUp"
        ];

        this.init = function() {
            // Calculate offsets
            for(var i = 0; i < this.subp.length; i++) {
                var page = this.subp[i]
                  , offset = $(page).offset().top;
                this.offsets.push([ offset, page ]);
            }

            // Hide subpages
            var hidden = this.subp.slice(1).join(",");
            $(hidden).css('visibility', 'hidden');

            // Show first page
            this.showpage(0);
        };

        this.showpage = function(pageid) {
            var page = this.subp[pageid]
              , previous = this.subp[pageid-1]
              , style = this.style[pageid] || "bounceInDown";

            if(!page)
                return;

            $(page).css('visibility', '')
                   .addClass("animated " + style);
            this.subp[pageid] = false;

            if(previous && previous.length)
                this.showpage(pageid-1);
        };

        this.focusOnPage = function(pageid) {
            var page = this.subpages[pageid]

            if(!page)
                return;

            var winh = $(window).height()
              , height = $(page).height()
              , offset = $(page).offset().top
              , scrollpos = offset + 0.5 * (height - winh);

            $('html, body').animate({
                scrollTop: scrollpos
            }, 700)
        };

        this.unbindScroll = function() {
            var allIsTrue = $.inArray(true, this.subp.map(Boolean)) < 0;
            if(!allIsTrue)
                return;
            angular.element($window).unbind("scroll");
        };

        this.init();
    };

    var anim = new AnimationController();

    ang.directive("scroll", function ($window) {

        return function(scope, element, attrs) {
            angular.element($window).bind("scroll", function() {

                var shift = 150
                  , subpage = 0
                  , bottomline = this.pageYOffset + this.innerHeight;

                for(; subpage < anim.offsets.length; subpage++) {
                    if(bottomline < anim.offsets[subpage][0] + shift)
                        break;
                }
                --subpage;

                if(scope.subpage != subpage) {
                    anim.showpage(subpage);
                    scope.subpage = subpage;

                    if(subpage == 5)
                        $(".scroll-down").hide();
                }

                anim.unbindScroll();

            });
        };

    });


    ang.controller('ServerInfo', ['$scope', function($scope) {

        $scope.servers = {
            'fun': 0,
            'count': 8,
            'players': 683
        };

        function countup(counter, from, to, delta, time) {
            var items = (to - from) / delta
              , period = time / items;

            $scope.servers[counter] = from;
            var interv = setInterval(function() {
                $scope.servers[counter] += delta;
                if($scope.servers[counter] > to) {
                    $scope.servers[counter] = to;
                    clearInterval(interv);
                }
                $scope.$apply();
            }, period);
        }

        countup("fun", 0, quick_stat.fun, 7, 4000 + 136);
        countup("count", 0, quick_stat.servers, 1, 4000 + 1416);
        countup("players", 0, quick_stat.players, 19, 4000 - 1561);

    }]);



    $(document).ready(function() {
        // Fix popups
        var position = 0;
        $('.launch_button').click(function() {

            position = $(window).scrollTop();
            $('.main').hide();
            $('.popups').show();

            $('.lightboxOverlay, .lb-close, .lightbox').click(function(event) {
                $('.popups').hide();
                $('.main').show();

                $(window).scrollTop(position);

                console.log($(window).scrollTop(), position)
            });
        });

        $(".installation_content_download_btn2").click(function(){
            setTimeout(function() {
                app.scrollTo(".bg2.index");
            }, 1500)
        })
    });