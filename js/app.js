cl = function(){var c=0,b;try{if(1<arguments.length){for(var a=0;a<arguments.length;a++)if("object"==typeof arguments[a]){c=1;break}if(c){for(a=0;a<arguments.length;a++)console.log(arguments[a]);}else{b=arguments[0];for(a=1;a<arguments.length;a++)b+=" | "+arguments[a];console.log(b)}}else console.log(arguments[0])}catch(d){}};
shuffle = function(o){for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x){};return o;};
jQuery(function($){

var a,href;

$window = $(window);
(function(){
	var s, name,
		selectors = "body #container".split(" ");
	for (s in selectors) {
		name = selectors[s];
    	if (name[0]=='.' || name[0]=='#') {
      		name = name.substr(1);
    	}
		window['$'+name] = $(selectors[s]);
	}
})();

//-----------------------------------------------------------  EVENTS
/*
$(document).ready(function(){
  $(window).load(function(){
    $('.newscards_box').masonry({
      itemSelector: '.newsline_content_item',
      stamp: ".stamp",
      singleMode: false,
      isResizable: true,
      isAnimated: true,
          animationOptions: {
          queue: false,
          duration: 500
      }
    });
  });
});
*/

//   v_aligh_height=$(".v_align").height();

//   window_height=$window.height();
//   v_aligh_height+=150;
//   if(v_aligh_height<window_height){
//     v_aligh_height-=150;
//     margin_top=(window_height/2)-(v_aligh_height/2);
//     }else{
//     margin_top=70;
//   }
// $(".v_align").css("margin-top",margin_top);
// $window.resize(function(){
//   v_aligh_height=$(".v_align").height();
//   v_aligh_height+=150;
//   window_height=$window.height();
//   if(v_aligh_height<window_height){
//     v_aligh_height-=150;
//   margin_top=(window_height/2)-(v_aligh_height/2);
//   }else{
//   margin_top=70;
// }
// $(".v_align").css("margin-top",margin_top);
// });

  // auth_content_height=$(".auth_content").height();
  // auth_cont_height=$(".authorization_content").height();
  // mt=(auth_cont_height/2)-(auth_content_height/2);
  // $(".auth_content").css("margin-top",mt);


open=1;open_sl=0;open_pp=0;

$(".close_info").click(function(){
  if(open){
  $(".page_text").slideUp(function(){
    $(".close_info").removeClass("open");
    $(".close_info").addClass("close");
    $(".close_info").text("Развернуть информацию");
  });
  open=0;
}else{
  $(".page_text").slideDown();
  $(".close_info").removeClass("close");
  $(".close_info").addClass("open");
  $(".close_info").text("Cвернуть информацию");
  open=1;
}
});



$('.select_server_button').click(function(){
  if(open_sl){
  $(".select_server_list").slideUp();
 open_sl=0;
}else{
  $(".select_server_list").slideDown();
  open_sl=1;
}
});

$(".select_server_list li").click(function(){
  select_server=$(this).text();
  server_value = $(this).attr('value');
  $(".select_server_button span").text(select_server);
  $(".select_server_list").slideUp();
  open_sl=0;
  $(".select_server_list_value").val(server_value).trigger('change');
}

  );

$(".user_menu").hover(function(){
  $(".user_info").stop().css("display","none");
  $(".user_info").stop().fadeIn();
  $(".user_menu").css("background","#1c262f");
},function(){
  $(".user_info").delay(500).fadeOut();
  setTimeout(function(){
  $(".user_menu").css("background","transparent");
},700);
});


if ($('.statistic_table_block').length) {
  $('.statistic_table_block').jScrollPane();
}



$('.statistic_table_row').click(function(){
  $statistic_server_info=$(this).find(".statistic_server_info")
  open_t=$statistic_server_info.attr("data-open");
  if(open_t==0){
  $statistic_server_info.slideUp();
  $(this).addClass("act");
  open_t=1;
  $statistic_server_info.attr("data-open",open_t);
}else{
  $statistic_server_info.slideDown();
  $(this).removeClass("act");
  open_t=0;
  $statistic_server_info.attr("data-open",open_t);

}
  statistic_table_content_height=$('.statistic_table_content').height();
  if(statistic_table_content_height==statistic_table_content_height){
    $(function()
{
  $('.statistic_table_block').jScrollPane();
});
  }
});

$('.select_date_button').click(function(){
  if(open_sl)
    $(".select_date_calendar").slideUp();
  else
    $(".select_date_calendar").slideDown();
  open_sl = !open_sl;
});


var calendars = datepicker();
calendars.curr_page = calendars.default_page;

function update_datepicker() {
    $('.next_month,.prev_month').removeClass('disabled');
    if(calendars.curr_page <= 0)
        $('.prev_month').addClass('disabled');
    else
        $('.next_month').addClass('disabled');
    var page = calendars.curr_page,
        code = calendars[page],
        month_year = calendars.month_year[page];

    $('.month p').html(month_year);
    $('table.calendar tbody').html(code);

}

$('.prev_month').click(function(){
    if(calendars.curr_page <= 0)
        return;

    calendars.curr_page = 0;
    update_datepicker();
});

$('.next_month').click(function(){
    if(calendars.curr_page >= 1)
        return;

    calendars.curr_page = 1;
    update_datepicker();
});

update_datepicker();


$('.select_store_button').click(function(){
  if(open_sl){
  $(".select_store_list").slideUp();
 open_sl=0;
}else{
  $(".select_store_list").slideDown();
  open_sl=1;
}
});

$(".select_store_list li").click(function(){
  select_server=$(this).text();
  server_value = $(this).attr('value');
  $(".select_store_button span").text(select_server);
  $(".select_store_list").slideUp();
  open_sl=0;
  $(".select_store_list_value").val(server_value);
}

  );

$('.what_pay_button').click(function(){
  if(open_sl){
  $(".what_pay_list").slideUp();
 open_sl=0;
}else{
  $(".what_pay_list").slideDown();
  open_sl=1;
}
});

$(".what_pay_list li").click(function(){
  select_server=$(this).text();
  server_value = $(this).attr('value');
  $(".what_pay_button span").text(select_server);
  $(".what_pay_list").slideUp();
  open_sl=0;
  $(".what_pay_list_value").val(server_value);
}

  );

$('.sel_server_button').click(function(){
  if(open_sl){
  $(".sel_server_list").slideUp();
 open_sl=0;
}else{
  $(".sel_server_list").slideDown();
  open_sl=1;
}
});

$(".sel_server_list li").click(function(){
  select_server=$(this).text();
  server_value = $(this).attr('value');
  $(".sel_server_button span").text(select_server);
  $(".sel_server_list").slideUp();
  open_sl=0;
  $(".sel_server_list_value").val(server_value);
}

  );

$('.pay_system_button').click(function(){
  if(open_sl){
  $(".pay_system_list").slideUp();
 open_sl=0;
}else{
  $(".pay_system_list").slideDown();
  open_sl=1;
}
});

$(".pay_system_list li").click(function(){
  select_server=$(this).text();
  server_value = $(this).attr('value');
  $(".pay_system_button span").text(select_server);
  $(".pay_system_list").slideUp();
  open_sl=0;
  $(".pay_system_value").val(server_value);
}

  );

var position = 0;
$(".minimenu").click(
  function(){
    position = $(window).scrollTop();
    $href=$(".popup_menu");
    $href.css("display","table-cell");
    $(".main").fadeOut();
    $('footer').fadeOut();
    $('.popups').fadeIn(500).css('display','table');
  });
$(".enter").click(
  function(){
    $href=$(".popup_autorization");
    $href.css("display","table-cell");
    $(".main").fadeOut();
    $('footer').fadeOut();
    $('.popups').fadeIn(500).css('display','table');

    // auth_content_height=$(".auth_content").height();
    // auth_cont_height=$(".authorization_content").height();
    // mt=(auth_cont_height/2)-(auth_content_height/2);
    // $(".auth_content").css("margin-top",mt);
  });


$(".folio").click(
  function(){
    position = $(window).scrollTop();
    $href=$(".popup_statistic");
    $href.css("display","table-cell");
    $(".main").fadeOut();
    $('footer').fadeOut();
    $('.popups').fadeIn(500).css('display','table');
  });
$(".menu_close").click(
  function(){
    $(".main").fadeIn();
    $('footer').fadeIn();
    $('.popups').fadeOut(500);
    $('.popups > [class^=popup_]').fadeOut(500);
    $(window).scrollTop(position);
  });
$(".grad_bg").click(
  function(){
    $(".main").fadeIn();
    $('footer').fadeIn();
    $('.popups').fadeOut(500);
    $('.popups > [class^=popup_]').fadeOut(500);
    $(window).scrollTop(position);
  });





$(".sn_carousel_button:first-child").click(function(){
  $(".sn_carousel").animate({marginLeft:"0px"},1000);
  $(".sn_carousel_button:last-child").removeClass("curr");
  $(".sn_carousel_button:first-child").addClass("curr");

});
$(".sn_carousel_button:last-child").click(function(){
  $(".sn_carousel").animate({marginLeft:"-280px"},1000);
  $(".sn_carousel_button:first-child").removeClass("curr");
  $(".sn_carousel_button:last-child").addClass("curr");
});

$(".sn_carousel_button_news:first-child").click(function(){
  $(".sn_carousel").animate({marginLeft:"0px"},1000);
  $(".sn_carousel_button:last-child").removeClass("curr");
  $(".sn_carousel_button:first-child").addClass("curr");

});
$(".sn_carousel_button_news:last-child").click(function(){
  $(".sn_carousel").animate({marginLeft:"-235px"},1000);
  $(".sn_carousel_button:first-child").removeClass("curr");
  $(".sn_carousel_button:last-child").addClass("curr");
});




$(document).keyup(function(e) {

  if (e.keyCode == 27) {

    var popup_is_visible = $('.popups').is(':visible');

    if(popup_is_visible) {
      $(".main").fadeIn();
      $('footer').fadeIn();
      $('.popups').fadeOut(500);
      $('.popups > [class^=popup_]').fadeOut(500);

      $(window).scrollTop(position);

    } else {
      $href=$(".popup_menu");
      $href.css("display","table-cell");
      $(".main").fadeOut();
      $('footer').fadeOut();
      $('.popups').fadeIn(500).css('display','table');

      position = $(window).scrollTop();
    }

  }

});

//-----------------------------------------------------------  FUNCTIONS
/*
    $('.popups').fadeOut();
    $('.grad_bg').fadeOut();
    $href.fadeOut();
    open=0;
  }*/
});













function datepicker() {

    function get_range() {
        var now = new Date();
        var end = new Date(
                now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                now.getUTCHours() + 4, 0, 0, 0
            );
        var start = new Date(end.getTime());
        start.setHours(-29*24);

        return [start, end];
    }

    function generate_picker_data(first, last) {

        var len, day, date, month;
        var res = [],
            copy = new Date(first.getTime());
        copy.setDate(1);

        for(var i=0; i < 32; i++) {
            day = (copy.getDay() + 6) % 7;
            date = copy.getDate();

            if(i != 0 && date == 1)
                return res;

            if(day == 0 || res.length == 0)
                res.push({ });

            var disabled = (copy < first || copy > last) ? 0.5:0;

            res[res.length - 1][day] = {
                value: date + disabled,
                ddmmyyyy: copy.toISOString().split('T')[0]
            };
            copy.setDate(date + 1);
        }

        return res;
    }

    function get_real_data() {
        var temp = get_range();
        var start = temp[0]
          , end = temp[1];

        var xfirst = generate_picker_data(start, end);
        var copy = new Date(end.getTime());
        copy.setDate(1);

        if(start.getMonth() == end.getMonth())
            return [xfirst];

        var xsecond = generate_picker_data(copy, end)
        return [xfirst, xsecond];
    }

    function generate_html_templates() {
        var data = get_real_data();

        function render_row(data) {
            var html = "<tr>";

            for(var i = 0; i < 7; i++) {
                var value = data[i] && data[i].value
                  , ddmmyyyy = data[i] && data[i].ddmmyyyy
                  , rounded = Math.floor(value) || "";

                if(value % 1 == 0)
                    html += "<td><a href='javascript:setDate(\""+ddmmyyyy+"\")'>"+rounded+"</a></td>";
                else
                    html += "<td class='disabled'>"+rounded+"</td>";
            }
            html += "</tr>";
            return html;
        }

        function render(data) {
            return data.map(render_row);
        }

        return data.map(render);
    }

    var range = get_range(),
        data = generate_html_templates(),
        months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль',
                  'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    data.month_year = [
        months[range[0].getMonth()] + ' ' + range[0].getFullYear(),
        months[range[1].getMonth()] + ' ' + range[1].getFullYear()
    ]

    data.default_page = data.length > 0 ? data.length - 1:0;

    return data;
}

function setDate(date) {
    $(".select_date_button span").text(date);
    $(".select_date_button input").val(date);
    $('.select_date_calendar').slideUp();
}