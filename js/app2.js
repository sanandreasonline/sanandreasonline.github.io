var app = {


    settings: {

        actions: {
            mail_submit: function() {
                var self = app.settings;
                var data = serialize('form.recovery_email');

                if(!self.tasks.check_form('recovery_email'))
                    return false;

                if(self.locked)
                    return false;

                self.locked = true;

                $.post(self.handler_mail_token, data)
                    .done(function(response) {
                        console.log(response);

                        if(!self.tasks.check_for_errors(response))
                            return;

                        if('warning' in response && response.warning == "email is not confirmed") {
                            self.locked = false;
                            return self.tasks.tokenless();
                        }

                        self.tasks.show_confirmation(response);
                    })
                    .fail(function(response) {
                        app.show_notification('Ошибка!', 'Нет ответа от сервера.');
                    })
                    .always(function(response) {
                        self.locked = false;
                    });

                return false;
            },
            confirm_mail_submit: function() {
                var self = app.settings;
                var data = serialize('form.confirm_email');

                if(self.locked)
                    return false;

                self.locked = true;

                $.post(self.handler_confirm_mail, data)
                    .done(function(response) {
                        console.log(response);

                        if(!self.tasks.check_for_errors(response))
                            return;

                        self.tasks.show_mail_changed();
                    })
                    .fail(function(response) {
                        app.show_notification('Ошибка!', 'Нет ответа от сервера.');
                    })
                    .always(function(response) {
                        self.locked = false;
                    });

                return false;
            },
            pin_submit: function() {
                var self = app.settings;
                var data = serialize('form.recovery_pin');

                if(!self.tasks.check_form('recovery_pin'))
                    return false;

                if(self.locked)
                    return false;

                self.locked = true;

                $.post(self.handler_pin, data)
                    .done(function(response) {
                        console.log(response);

                        if(!self.tasks.check_for_errors(response))
                            return;

                        self.tasks.show_pin_changed();
                    })
                    .fail(function(response) {
                        app.show_notification('Ошибка!', 'Нет ответа от сервера.');
                    })
                    .always(function(response) {
                        self.locked = false;
                    });

                return false;
            },
            bind_phone_submit: function() {
                var self = app.settings;
                var data = serialize('form.bind-phone');

                if(!self.tasks.check_form('bind-phone'))
                    return false;

                if(self.locked)
                    return false;

                self.locked = true;

                $.post(self.handler_bind_phone, data)
                    .done(function(response) {
                        console.log(response);

                        if(!self.tasks.check_for_errors(response))
                            return;

                        self.tasks.show_phone_confirm();
                    })
                    .fail(function(response) {
                        app.show_notification('Ошибка!', 'Нет ответа от сервера.');
                    })
                    .always(function(response) {
                        self.locked = false;
                    });

                return false;
            },

            authenticator: function(ev) {
                var self = app.settings;
                var csrftoken = getCookie('csrftoken');

                if(ev.type == "click") {

                    $.post(self.handler_totp, {csrfmiddlewaretoken: csrftoken})
                        .done(function(response) {
                            console.log(response);

                            if(!self.tasks.check_for_errors(response))
                                return;

                            self.tasks.show_totp_qr();
                        })
                        .fail(function(response) {
                            app.show_notification('Ошибка!', 'Нет ответа от сервера.');
                        })
                        .always(function(response) {
                            self.locked = false;
                        });
                }


                if(ev.type == "submit") {
                    var data = serialize('form.ga-confirm');

                    $.post(self.handler_totp_save, data)
                        .done(function(response) {
                            console.log(response);

                            if(!self.tasks.check_for_errors(response))
                                return;

                            self.tasks.show_totp_success(response.key);
                        })
                        .fail(function(response) {
                            app.show_notification('Ошибка!', 'Нет ответа от сервера.');
                        })
                        .always(function(response) {
                            self.locked = false;
                        });

                }

                return false;
            }
        },

        tasks: {
            show_page: function(event) {
                var self = app.settings;
                var dst = $(event.target).attr("data-dst");

                if(dst == self.curr_page || self.locked)
                    return;

                var link = $('.subpages li[data-dst='+dst+']');
                var page = $('.full_info *[data-page='+dst+']');
                if(!page.length || !page.length)
                    return;

                // Reset
                $('.subpages li').removeClass("active");
                $('.full_info *[data-page]').hide();
                app.remove_notifications('.full_info');

                page.show();
                link.addClass('active');
                self.curr_page = dst;
            },

            check_form: function(form) {

                var assoc = {
                    "bind-phone": ["phone"],
                    "recovery_email": ["newemail"],
                    "recovery_pin": ["email", "bankacc"]
                };

                var check = {
                    bankacc: function(val) {
                        if(val.length == 0)
                            return app.show_notification('Ошибка!', 'Укажите номер аккаунта.');

                        return true;
                    },
                    email: function(val) {
                        if(val.length == 0)
                            return app.show_notification('Ошибка!', 'Укажите ваш email.');

                        return true;
                    },
                    phone: function(val) {
                        val = val.replace(/[^0-9]/g, '');

                        if(val.length == 0)
                            return app.show_notification('Хмм!', 'Вы забыли указать телефон.');

                        if(val.length < 4 || val.length > 15)
                            return app.show_notification('Ошибка!', 'Вы указали неверный телефонный номер.');

                        return true;
                    }
                }
                check.newemail = check.email;

                if(!(form in assoc))
                    return true;

                var fields = assoc[form];

                for(var i=0; i < fields.length; i++) {
                    var name = fields[i];
                    var inp = $("form."+form+" input[name="+name+"]")
                      , value = inp.val()
                      , valid = check[name](value);

                    if(valid) continue;

                    inp.val("");
                    inp.focus();
                    return;
                };

                return true;
            },

            check_for_errors: function(response) {
                $('.errors').html('');
                app.remove_notifications('.full_info');

                if(response.error == "You've reached request limit.")
                    return app.show_notification('Ошибка!', ' Превышен лимит запросов.');

                if(response.error == "invalid account or pin")
                    return app.show_notification('Ошибка!', ' Неправильный номер счета или пин-код.');

                if(response.error == "invalid bank account")
                    return app.show_notification('Ошибка!', ' Неправильный номер счета.');

                if(response.error == "invalid email")
                    return app.show_notification('Ошибка!', ' Неправильный email.');

                if(response.error == 'this is your old email')
                    return app.show_notification('Ошибка!', ' Это ваш старый email.');

                if(response.error == 'this email already in use')
                    return app.show_notification('Ошибка!', ' Этот email уже используется.');

                if(response.error == "email not specified")
                    return app.show_notification('Ошибка!', ' Токен просрочен либо email не задан.');

                if(response.error == 'wrong email')
                    return app.show_notification('Ошибка!', ' Неверный email.');

                if(response.error == 'bad data')
                    return app.show_notification('Ошибка!', ' Некоторые поля заполнены неправильно.');

                if(response.warning == 'token already sent') {
                    app.show_notification('Внимание!', ' Код подтверждения уже отправлен.', 'alert');
                    return 1;
                }

                if(response.error == 'email is not confirmed') {
                    $("div[data-page=pin] .receipt.success").hide();
                    $("div[data-page=pin] .receipt.error").show();
                    return 0;
                }

                if(response.error == 'bad token') {
                    $("div[data-page=mail] .receipt.success").hide();
                    $("div[data-page=mail] .receipt.error").show();
                    return 0;
                }

                if(response.error == 'number-in-use')
                    return app.show_notification('Ошибка!', ' Номер уже используется.');

                if(response.error == 'invalid-token')
                    return app.show_notification('Ошибка!', ' Неверный одноразовый пароль.', null, '.receipt.ga-conf');

                if(response.error)
                    return app.show_notification('Бля!', ' Неизвестная ошибка.');

                return 1;
            },

            show_confirmation: function() {
                var confirm = $("div[data-page=mail] .receipt.confirm")
                  , input = $('form.recovery_email input')
                  , show = $('form.recovery_email .show');

                confirm.show();
                app.scrollTo(confirm);

                input.prop('disabled', true);
                input.css('cursor', 'default');
                show.css('background', '#DBDBDB');
            },

            show_phone_confirm: function() {
                var confirm = $("div[data-page=mfa] .receipt.confirm")
                  , input = $('form.bind-phone input')
                  , show = $('form.bind-phone .show');

                confirm.show();
                app.scrollTo(confirm);

                input.prop('disabled', true);
                input.css('cursor', 'default');
                show.css('background', '#DBDBDB');

                // TODO: Open websocket
            },

            show_phone_success: function() {
                var success = $("div[data-page=mfa] .receipt.success");
                var cancel = $('div[data-page=mfa] .confirm .cancel');
                var wait = $("div[data-page=mfa] .wait-for-sms");
                success.show();
                cancel.hide();
                wait.hide();
            },

            cancel_phone_bind: function() {
                var self = app.settings;
                var confirm = $("div[data-page=mfa] .receipt.confirm")
                  , input = $('form.bind-phone input')
                  , show = $('form.bind-phone .show');

                var csrftoken = getCookie('csrftoken');

                $.post(self.handler_bind_cancel, {csrfmiddlewaretoken: csrftoken})
                    .done(function(response) {
                        confirm.hide();
                        input.prop('disabled', false);
                        input.css('cursor', '');
                        show.css('background', '');
                    })
                    .fail(function(response) {
                        app.show_notification('Ошибка!', 'Нет ответа от сервера.');
                    })
            },

            check_phone_country: function(ev) {
                var hint = $(".input-hint");
                var phone = $(ev.target).val().replace(/[^0-9]/ig, '');

                if(phone.length < 4)
                    return hint.text("");

                var country = country_by_number(phone);

                if(country && "name" in country) {
                    hint.removeClass("err");
                    hint.text(country.name);
                } else {
                    hint.addClass("err");
                    hint.text("Неизвестный код страны!");
                }
            },

            show_mail_changed: function() {
                var success = $("div[data-page=mail] .receipt.success")
                  , error = $("div[data-page=mail] .receipt.error")
                  , input = $('form.confirm_email input')
                  , show = $('form.confirm_email .show');

                error.hide();
                success.show();
                app.scrollTo(success);

                input.prop('disabled', true);
                input.css('cursor', 'default');
                show.css('background', '#DBDBDB');
            },

            show_pin_changed: function() {
                $("div[data-page=pin] .receipt.success").show();
                $("div[data-page=pin] .receipt.error").hide();
            },

            show_totp_qr: function() {
                var conf = $('.ga-conf')
                  , button = $('.ga-start input')
                  , code = '<img src="/account/totp/qr.png"/>';

                $('.ga-conf .qr-code').html(code);

                button.prop('disabled', true);
                button.css('cursor', 'default');
                button.css('background', '#DBDBDB');

                conf.show();
                app.scrollTo(conf);
            },

            show_totp_success: function(key) {
                var success = $('.ga-success')
                  , button = $('.ga-conf input')
                  , keyspan = $('.ga-key');

                key = key.match(/.{1,4}/g).join(" ");
                keyspan.text(key);

                button.prop('disabled', true);
                button.css('cursor', 'default');
                button.css('background', '#DBDBDB');

                success.show();
                app.scrollTo(success);
            },

            check_token: function(token) {
                $('form.recovery_email').hide;
                $('form.confirm_email input[name=token]').val(token);
                $('form.confirm_email').trigger('submit');
            },

            tokenless: function() {
                $('form.confirm_email').trigger('submit');
            }
        },

        init: function() {
            var self = app.settings
              , hash = window.location.hash
              , token = /token:em:([A-z0-9]+)/.exec(hash);

            $('.subpages li').click(app.settings.tasks.show_page);

            $('form.recovery_email').submit(self.actions.mail_submit);
            $('form.confirm_email').submit(self.actions.confirm_mail_submit);
            $('form.recovery_pin').submit(self.actions.pin_submit);
            $('form.bind-phone').submit(self.actions.bind_phone_submit);

            $('form.ga-confirm').submit(self.actions.authenticator);
            $('.ga-start input[type=button]').click(self.actions.authenticator);

            $('input[type=tel]').keyup(self.tasks.check_phone_country);
            $('input[type=tel]').keydown(phone_filter);

            if(token)
                self.tasks.check_token(token[1]);
        },

        handler_bind_phone: "/account/bind_phone/",
        handler_bind_cancel: "/account/bind_phone/cancel/",
        handler_confirm_mail: "/account/change_email/check_token/",
        handler_mail_token: "/account/change_email/send_token/",
        handler_pin: "/account/restore_pin/",

        handler_totp: "/account/totp/",
        handler_totp_save: "/account/totp/save/",
        curr_page: "mfa",
        locked: false
    },


    bank_statement: {
        actions: {
            form_submit: function() {
                var self = app.bank_statement;
                var data = serialize('form.bank_statement');

                if(!self.tasks.check_form())
                    return false;

                self.locked = true;

                $.post(app.bank_statement.handler_url, data)
                    .done(function(response) {
                        console.log(response);

                        if(!self.tasks.check_for_errors(response))
                            return;

                        self.tasks.show_response(response);
                    })
                    .fail(function(response) {
                        app.show_notification('Ошибка!', 'Нет ответа от сервера.');
                    })
                    .always(function(response) {
                        app.warehouse.locked = false;
                    })

                return false;
            }
        },

        tasks: {
            check_form: function() {
                var data = serialize('form.bank_statement');

                if(!data['bankacc'].isInteger()) {
                    app.show_notification('Внимание!', ' Введите номер банковского счета.', 'alert');
                    $("input[name=bankacc]").focus().val('');
                    return false;
                }

                if(!data['pin']) {
                    app.show_notification('Внимание!', ' Введите пин-код.', 'alert');
                    $("input[name=pin]").focus();
                    return false;
                }

                return true;
            },

            check_for_errors: function(response) {
                $('.errors').html('');
                app.remove_notifications('.full_info');

                if(response.error == "invalid account or pin")
                    return app.show_notification('Ошибка!', ' Неправильный номер счета или пин-код.');

                if(response.error == "You've reached request limit.")
                    return app.show_notification('Ошибка!', ' Превышен лимит запросов.');

                return 1;
            },

            show_response: function(response) {
                var code = ""
                  , self = app.bank_statement;

                $('.statement, .errors').html('');

                if(!response.lines.length)
                    return $('.errors').html(self.html_data.empty);

                response.lines.forEach(function(item) {
                    var sign = item.text.slice(0, 1)
                      , descr = item.text.slice(2)
                      , rsumm = /(\d+(\.\d+)?)\$/
                      , found = item.text.match(rsumm);

                    found = found ? "$ "+found[1]:"—";
                    descr = descr.replace(rsumm, "");

                    code += self.html_data.item.format({
                        date: item.date,
                        sign: sign == "-" ? "minus":"plus",
                        desc: descr,
                        change: found
                    });
                });

                code += "<div style='height: 74px;'></div>";
                $('.statement').html(code);
            }
        },

        init: function() {
            $('form.bank_statement').submit(app.bank_statement.actions.form_submit);
        },

        html_data: {
            item: '\
                <div class="statement_item">\
                  <div class="statement_date">{date}</div>\
                  <div class="change_balance {sign}">{change}</div>\
                  <div class="statement_desc">{desc}</div>\
                  <div class="clearfix"></div>\
                </div>',

            empty: '\
                <p>Не обнаружено активности на данном банковском счету.\
                   Вы можете управлять своим счётом в любом отделении банка.\
                   <br>&nbsp;</p>'
        },

        handler_url: '/account/bank_statement/get/'
    },

    warehouse: {
        actions: {
            form_submit: function() {
                var self = app.warehouse;
                var data = serialize('form.warehouse');

                if(!self.tasks.check_form())
                    return false;

                self.locked = true;

                $.post(app.warehouse.handler_url, data)
                    .done(function(response) {
                        console.log(response);

                        if(!self.tasks.check_for_errors(response))
                            return;

                        self.tasks.show_response(response);
                        self.tasks.show_paginator(response);
                    })
                    .fail(function(response) {
                        app.show_notification('Ошибка!', 'Нет ответа от сервера.');
                    })
                    .always(function(response) {
                        app.warehouse.locked = false;
                    })

                return false;
            }
        },

        tasks: {
            show_response: function(response) {
                if(!response.items.length)
                    return $('.history .items').html(app.warehouse.html_data.empty_result);

                var code = "";
                response.items.forEach(function(item) {
                    var time = item.time.split("T")[1],
                        nick = item.text.split(" ", 1)[0],
                        action = item.text.split(" ").slice(1).join(" ");

                    action = action.replace(/(\d+ \S+)/g, '<span/">$1</span>');
                    code += app.warehouse.html_data.history_item.format({
                        time: time,
                        player: nick,
                        description: action
                    })
                })

                $('.history .items').html(code);
                app.show_notification("Hint!", "Используйте Ctrl+F для поиска по странице.", "alert", 0, 0);
            },

            show_paginator: function(response) {
                if(!response.items.length)
                    return $('.paginator').html("");

                var code = '<ul class="pagination">'
                  , pagi = response.paginator;

                function format_item(page, aux) {
                    var js = "null"
                      , classes = " "
                      , templ = ' <li{class}> <a href="javascript:{js}">{page}</a></li>';

                    if(aux == "prev") page = pagi.has_previous ? page-1 : false;
                    if(aux == "next") page = pagi.has_next ? page+1 : false;

                    if(page === false) {
                        page = '...';
                        classes = ' class="disabled"';
                    } else {
                        js = 'app.warehouse.setPage('+page+')';
                    }

                    if(page == pagi.current) {
                        classes = ' class="active"';
                        js = 'null';
                    }

                    if(aux == "prev") page = "«";
                    if(aux == "next") page = "»";

                    return templ.format({class: classes, page: page, js: js});
                }

                code += format_item(pagi.current, 'prev');

                pagi.page_range.forEach(function(page) {
                    code += format_item(page);
                })

                code += format_item(pagi.current, 'next');
                code += '</ul>';

                $('.paginator').html( code );
            },

            check_form: function() {
                var data = serialize('form.warehouse');

                if(!data['date']) {
                    app.show_notification('Внимание!', ' Выберите дату.', 'alert');
                    $(".select_date_calendar").slideDown();
                    return false;
                }

                if('unit' in data && data.unit.length == 0) {
                    app.show_notification('Внимание!', ' Выберите склад.', 'alert');
                    $(".select_store_list").slideDown();
                    return false;
                }

                return true;
            },

            check_for_errors: function(response) {
                app.remove_notifications('.full_info');

                if(response.error == "You've reached request limit.")
                    return app.show_notification('Ошибка!', ' Превышен лимит запросов.');

                if(response.error) {
                    if(response.error == "invalid unit")
                        console.log('%c Ошибка. Ибо нехуй подделывать запросы! ', 'background: #222; color: #bada55');
                }

                return 1;
            }
        },

        setPage: function(page) {
            $('input[name="page"]').val(page);
            app.warehouse.actions.form_submit();
        },

        init: function() {
            $('form.warehouse').submit(app.warehouse.actions.form_submit);
        },

        html_data: {
            history_item: '\
              <div class="history_item">\
                <div class="history_time">{time}</div>\
                <div class="history_info">\
                  <p class="history_info_name">{player}</p>\
                  <p class="history_info_desc">{description}</p>\
                </div>\
              </div>',

            empty_result: '\
              <div class="depositing error" style="padding-top: 20px;">\
                <h3>Нет данных</h3>\
                <p>Не найдено записей истории склада за выбранный период времени.</p>\
                <p>&nbsp;</p>\
              </div>'
        },

        locked: false,
        handler_url: '/account/warehouse/data/'
    },

    offlinepay: {
        actions: {
            form_submit: function() {
                if(app.offlinepay.locked)
                    return false;

                if(!app.offlinepay.tasks.check_form())
                    return false;

                var data = serialize('form.offline_payment');
                app.offlinepay.locked = true;

                $.post(app.offlinepay.handler_url, data)
                    .done(function(response) {

                        if(response.success) {
                            app.offlinepay.tasks.show_ok_ticket(
                                'Оплата произведена успешно',
                                '<p>Данные будут отправлены на игровой сервер в <span class="color_rose">00:00</span> по московскому времени.</p>'
                            );

                            return;
                        }

                        if(response.error == "You've reached request limit.")
                            return app.show_notification('Ошибка!', ' Превышен лимит запросов.');

                        if(response.error == "service is now closed")
                            return app.offlinepay.tasks.show_err_ticket(
                                'Оффлайн оплата недоступна',
                                '<p>Оффлайн оплата работает с <span class="color_rose">7:00</span> до \
                                  <span class="color_rose">23:00</span> часов по московскому времени.<br><br>\
                                  В настоящий момент оффлайн оплата отключена.</p>'
                            );

                        if(response.error == "eternal ban")
                            return app.show_notification('Ошибка!', ' Вас забанили навеки.');

                        if(response.error == "you don't own this item")
                            return app.show_notification('Ошибка!', ' Это не ваше имущество.');

                        if(response.error == "invalid account or pin")
                            return app.show_notification('Ошибка!', ' Неправильный номер счета или пин-код.');

                        if(response.error == "unknown error")
                            return app.show_notification('Бля!', ' Внутренняя ошибка, обратитесь к администрации.');

                        if(response.error == "already paid")
                            return app.offlinepay.tasks.show_ok_ticket(
                                'Сегодня вы уже использовали оффлайн оплату',
                                '<p>Данные будут отправлены на игровой сервер в <span class="color_rose">00:00</span> по московскому времени.</p>'
                            );

                        if(response.error == "item is sealed")
                            return app.offlinepay.tasks.show_err_ticket(
                                'Собственность изъята',
                                '<p>Оффлайн оплата невозможна.<br><br>Работники мэрии опечатали вашу собственность. </p>'
                            );

                        if(response.error == "limit of days has been reached")
                            return app.show_notification('Ошибка!', ' Вы можете продлить аренду максимум на ' + response.available_days + ' дней.');

                        if(response.error == "not enough money")
                            return app.show_notification('Ошибка!', ' На счету недостаточно средств.');

                        if(response.error.search('invalid') < 0)
                            return app.show_notification('Ошибка!', ' Ошибка в заполнении одного из полей.');
                    })
                    .fail(function(response) {
                        app.show_notification('Ошибка!', 'Нет ответа от сервера.');
                    })
                    .always(function(response) {
                        app.offlinepay.locked = false;
                    })

                return false;
            },
        },

        tasks: {

            check_form: function() {
                var data = serialize('form.offline_payment');
                app.remove_notifications('.full_info');

                if(!data['option']) {
                    app.show_notification('Внимание!', ' Выберите что нужно оплатить.', 'alert');
                    $(".what_pay_list").slideDown();
                    return false;
                }

                if(!data['period'].isInteger()) {
                    app.show_notification('Внимание!', ' Введите период оплаты.', 'alert');
                    $('input[name="period"]').focus().val('');
                    return false;
                } else if (data['period'] < 1) {
                    app.show_notification('Внимание!', ' Вы можете оплатить минимум один день.', 'alert');
                    $('input[name="period"]').focus().val('');
                    return false;
                } else if (data['period'] > 30) {
                    app.show_notification('Внимание!', ' Вы можете не более тридцати дней.', 'alert');
                    $('input[name="period"]').focus().val('');
                    return false;
                }

                if(!data['bankacc'].isInteger()) {
                    app.show_notification('Внимание!', ' Введите номер счета.', 'alert');
                    $('input[name="bankacc"]').focus().val('');
                    return false;
                }

                if(!data['pin']) {
                    app.show_notification('Внимание!', ' Введите пин-код.', 'alert');
                    $('input[name="pin"]').focus();
                    return false;
                }

                return true;
            },

            show_ok_ticket: function(head, body) {
                var code = app.html_data.ticket.format({
                    type: 'success',
                    head: head, body: body
                });
                $('.depositing_content').remove();
                $('form.offline_payment').after(code);
                app.scrollTo('.depositing_content');
            },

            show_err_ticket: function(head, body) {
                var code = app.html_data.ticket.format({
                    type: 'error',
                    head: head, body: body
                });
                $('.depositing_content').remove();
                $('form.offline_payment').after(code);
                app.scrollTo('.depositing_content');
            }
        },

        init: function() {
            $('form.offline_payment').submit(app.offlinepay.actions.form_submit);
        },

        handler_url: '/account/offlinepay/do/',
        locked: false
    },


    login: {

        actions: {
            form_submit: function() {
                if(app.login.locked)
                    return false;

                if(!app.login.tasks.check_form())
                    return false;

                var data = serialize('form.authorization_content');
                app.login.tasks.lock_form();

                $.post(app.login.handler_url, data)
                    .done(function(response) {

                        if(response.success) {
                            location.href = app.login.next_url;
                            return;
                        }

                        // grecaptcha.reset();
                        recaptcha_reset('login');

                        if(response.error) {
                            $('.alert').remove();

                            if(response.error == "incorrect credentials")
                                if(app.login.need)
                                    app.show_notification('Ошибка!', 'Логин, пароль или другие данные неверны.', null, '.popup_autorization');
                                else
                                    app.show_notification('Ошибка!', 'Неправильный логин или пароль.', null, '.popup_autorization');
                            if(response.error == "You've reached request limit.")
                                app.show_notification('Ошибка!', 'Превышен лимит запросов.', null, '.popup_autorization');
                            return;
                        }

                        app.login.tasks.show_extra_fields(response);
                    })
                    .fail(function() {
                        app.show_notification('Ошибка!', 'Нет ответа от сервера.', null, '.popup_autorization');
                    })
                    .always(function() {
                        app.login.tasks.unlock_form();
                    });

                return false;
            }
        },

        tasks: {
            check_form: function(response) {
                var data = serialize('form.authorization_content');
                var local = location.origin.search("localhost") > 0;
                var recaptcha = data['g-recaptcha-response'] || local;
                app.remove_notifications('.popup_autorization');
                // Check server
                if(!data['nick']) {
                    app.show_notification('Ой.', 'Вы забыли ввести ваш ник!', null, '.popup_autorization');
                    $('input[name=nick]').focus();
                }
                // Summ
                else if(!data['password']) {
                    app.show_notification('Хмм.', 'Вы забыли указать пароль!', null, '.popup_autorization');
                    $('input[name=password]').focus();
                }
                // Captcha
                else if(!recaptcha) {
                    app.show_notification('Хмм.', 'Докажите что вы не робот :)', null, '.popup_autorization');
                }

                if(app.login.need) {
                    var code = app.login.need[0],
                        email = app.login.need[1],
                        phone = app.login.need[2];

                    if(code && !data['code']) {
                        app.show_notification('Система безопасности:', 'Укажите секретный код!', null, '.popup_autorization');
                        $('input[name=code]').focus();
                    }
                    if(email && !data['email']) {
                        app.show_notification('Система безопасности:', 'Укажите ваш email!', null, '.popup_autorization');
                        $('input[name=email]').focus();
                    }
                    if(phone && !data['phone']) {
                        app.show_notification('Система безопасности:', 'Укажите ваш телефон!', null, '.popup_autorization');
                        $('input[name=phone]').focus();
                    }

                }
                return data['server'] && data['nick'] && data['password'] && recaptcha;
            },

            show_extra_fields: function(response) {
                if(!response.warning || !response.need) {
                    app.login.need = false;
                    return;
                } else {
                    app.login.need = response.need;
                }

                var code = response.need[0],
                    email = response.need[1],
                    phone = response.need[2];

                if(!code && !email && !phone)
                    return $('.authorization_recovery_password').show();

                $('.authorization_recovery_password input').hide();

                if(email) $('.authorization_recovery_password input[name=email]').show();
                if(phone) $('.authorization_recovery_password input[name=phone]').show();
                if(code) $('.authorization_recovery_password input[name=code]').show();

                $('.authorization_recovery_password').show();
                $('.main-credentials').hide();
            },

            lock_form: function() {
                app.login.locked = true;
                $('form.authorization_content .auth_go').css('background', '#686868');
                $('form.authorization_content .auth_go').css('cursor', 'default');
            },

            unlock_form: function() {
                app.login.locked = false;
                $('form.authorization_content .auth_go').css('background', '');
                $('form.authorization_content .auth_go').css('cursor', '');
            }
        },

        init: function() {
            $('.popup_autorization .auth_error').hide();
            $('.authorization_recovery_password').hide();

            $('form.authorization_content').submit(app.login.actions.form_submit);
        },

        handler_url: '/login/do/',
        next_url: window.get_next_url ? get_next_url() : '/account/info/',
        locked: false,
        need: false
    },


    donate: {

        actions: {
            form_submit: function() {
                var form_data = JSON.stringify(serialize('form.depositing')),
                    data_not_changed = form_data == app.donate.form_data;

                if(app.donate.form_locked)
                    return false;

                if(app.donate.confirm_active && data_not_changed) {
                    $('html, body').animate({
                        scrollTop: $(".deposite .confirm").offset().top
                    }, 700);
                    return false;
                }

                var tasks = app.donate.tasks,
                    form_valid = tasks.check_form();

                if(!form_valid)
                    return false;

                tasks.do_request();

                return false;
            }

        },

        tasks: {
            check_form: function() {
                var data = serialize('form.depositing');
                // Check server
                if(!data['account']) {
                    app.show_notification('Ой.', 'Вы забыли ввести ваш id!');
                    $('input[name=account]').focus();
                }
                // Summ
                else if(!data['sum']) {
                    app.show_notification('Хмм.', 'Вы забыли указать сумму!');
                    $('input[name=sum]').focus();
                }
                return data['server'] && data['account'] && data['sum'];
            },

            lock_form: function() {
                app.donate.form_locked = true;
                app.donate.form_data = JSON.stringify(serialize('form.depositing'));

                $('form.depositing input.show').css('background', '#DBDBDB');
                $('form.depositing input.show').val('Выполняю...');
                app.show_notification('Рекомендуем', 'исользовать платежную систему Unitpay', 'alert');
            },

            unlock_form: function() {
                app.donate.form_locked = false;
                app.donate.form_data = JSON.stringify(serialize('form.depositing'));

                $('form.depositing input.show').css('background', '');
                $('form.depositing input.show').val('Продолжить');
            },

            do_request: function() {
                var tasks = app.donate.tasks,
                    data = serialize('form.depositing');

                tasks.lock_form();

                $.post(app.donate.handler_url, data)
                    .done(function(response) {
                        if('error' in response) {
                            if(response.error == "reached-request limit")
                                app.show_notification('Ошибка!', 'Превышен лимит запросов.');
                            if(response.error == "non-existent account")
                                app.show_notification('Ошибка!', 'Этот аккаунт не существует.');

                            if(typeof response.error == "object" && 'sum' in response.error)
                                app.show_notification('Ошибка!', 'Сумма должна быть целым числом.');
                            if(typeof response.error == "object" && 'account' in response.error)
                                app.show_notification('Ошибка!', 'Номер аккаунта должен быть целым числом.');

                            return;
                        }

                        app.donate.confirm({
                            server: response['server'],
                            service: data['service'],
                            nick: response['nick'],
                            summ: data['sum'],
                            id: data['account']
                        });

                        $('.depositing_buttons a.pay').attr('href', response['redirect']);
                    })
                    .fail(function() { app.donate.error(); })
                    .always(function() { tasks.unlock_form(); });
            }
        },

        handler_url: '/donate/request/do/',
        form_locked: false,
        confirm_active: false,
        form_data: '',

        init: function() {
            var actions = app.donate.actions;

            // app.donate.reset();
            $('form.depositing').submit(actions.form_submit);
            $('form.depositing .number').keydown(numeric_filter);

            $('.depositing_buttons a.correct').click(app.donate.amend);

            app.donate.handlestatus()
        },

        reset: function() {
            $('.deposite .confirm,' +
              '.deposite .success,' +
              '.deposite .error,'+
              '.deposite .robo-alert').hide();
        },

        confirm: function(data) {
            // Need {id, nick, server, summ, service}
            var out = data;
            var servers = get_server_list();
            app.donate.confirm_active = true;

            // Prepare data
            out['server'] = servers[data['server']];
            out['nick'] = data['nick'].replace('_', ' ');
            // Insert "-" between thousands
            out['id'] = String(data['id']).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

            app.donate.reset();

            $('.confirm td.nick b').text(out['nick'] || 'None');
            $('.confirm td.accnum b').text(out['id'] || 'None');
            $('.confirm td.server b').text(out['server'] || 'None');
            $('.confirm td.summ b').text(out['summ'] || 'None');

            $('.confirm .pay-system b').text(data['service'].capitalize())

            if(data['service'] == 'robokassa')
                $('.deposite .robo-alert').show();

            $('.deposite .confirm').show();

            $('html, body').animate({
                scrollTop: $(".deposite .confirm").offset().top
            }, 700);
        },

        amend: function() {
            app.donate.confirm_active = false;

            $('html, body').animate({
                scrollTop: $(".box3.deposite").offset().top - 20
            }, 700);

            setTimeout(function() {
                app.donate.reset();
            }, 700)

            return false;
        },

        success: function() {
            $(".deposite .error").hide();
        },

        error: function(msg) {
            msg = msg || 'Не удалось пополнить счёт аккаунта.\nПопробуйте снова через несколько минут.';
            $(".deposite .success").hide();
            $(".deposite .error p").text(msg);

            $(".deposite .error").show();
            $('html, body').animate({
                scrollTop: $(".deposite .error").offset().top
            }, 700);
        },

        handlestatus: function() {
            var status = document.URL.match(/(error|success)/);
            if(!status)
                return;

            $('html, body').animate({
                scrollTop: $(".deposite ."+status).offset().top - 50
            }, 1000);
        }

    },


    restore_passw: {
        actions: {
            form_submit: function(event) {
                event.preventDefault();
                var self = app.restore_passw;
                var data = serialize('form.restore');

                if(self.locked)
                    return false;

                if(!self.tasks.check_form()) {
                    return false;
                }

                self.locked = true;

                $.post(app.restore_passw.handler_url, data)
                    .done(function(response) {
                        recaptcha_reset('restore');
                        console.log(response);

                        if(!self.tasks.check_for_errors(response))
                            return;

                        self.tasks.show_confirm(response);
                        // self.tasks.show_response(response);
                    })
                    .fail(function(response) {
                        app.show_notification('Ошибка!', 'Нет ответа от сервера.');
                    })
                    .always(function(response) {
                        app.restore_passw.locked = false;
                    })

                return false;
            },

            do_restore: function(ev) {
                var self = app.restore_passw;

                if(self.locked)
                    return false;

                if(!self.tasks.check_form2())
                    return false;

                var csrftoken = getCookie('csrftoken');
                var option = $("[name=option]:checked").val();
                var email = $(".answer .email").val();
                var phone = $(".answer .phone").val();

                if(!option) return;

                var params = {
                    userid: self.userid,
                    server: self.server,
                    email: email,
                    csrfmiddlewaretoken: csrftoken
                };

                if(option == "phone" || option == "oldphone")
                    params[option] = phone;
                params["g-recaptcha-response"] = $("[name=g-recaptcha-response]").val();

                $.post(self.handler_url2, params)
                .done(function(response) {
                    var err = !self.tasks.check_for_errors(response);
                    if(err) {
                        recaptcha_reset('restore');
                        return ;
                    }

                    self.tasks.lock_form();

                    self.email = email;
                    self.phone = phone;
                    self.option = option;
                    self.tasks.show_success(response);
                })

                return false;
            }
        },

        tasks: {
            check_form: function() {
                var data = serialize('form.restore');

                if(!data['user']) {
                    app.show_notification('Внимание!', 'Укажите ник или номер аккаунта!');
                    $('input[name=user]').focus();
                    return false;
                }

                return true;
            },

            check_form2: function() {

                var recaptcha = $('[name=g-recaptcha-response]').val();
                var option = $("[name=option]:checked").val();
                var phone = $(".answer .phone").val();
                var email = $(".answer .email").val();

                if(!recaptcha) {
                    app.show_notification('Хмм.', 'Докажите что вы не робот :)', null, ".receipt.confirm");
                    return false;
                }

                if(!email) {
                    app.show_notification('Упс.', 'Вы забыли указать email.', null, ".receipt.confirm");
                    return false;
                }

                if(!phone && (option == "phone" || option == "oldphone")) {
                    app.show_notification('Ой.', 'Вы забыли указать номер телефона', null, ".receipt.confirm");
                    return false;
                }

                return true;
            },

            lock_form: function() {
                var self = app.restore_passw;
                var inputs = $(".full_info input");
                var buttons = $(".full_info button, .full_info [type=submit]");

                if(!self.locked)
                    self.locked = true;

                inputs.prop('disabled', true);
                inputs.css('cursor', 'default');
                buttons.css('background', '#DBDBDB');
            },

            check_for_errors: function(response) {
                $('.errors').html('');
                app.remove_notifications();
                app.remove_notifications(".receipt.confirm");

                if(response.error == "wrong-server")
                    return app.show_notification('Ошибка!', ' Неправильный сервер.');

                if(response.error == "wrong-user")
                    return app.show_notification('Ошибка!', ' Неправильный ник или номер аккаунта.');

                if(response.error == "captcha-check-failed")
                    return app.show_notification('Ошибка!', ' Не пройдена проверка капчей. Ты не робот?', null, ".receipt.confirm");

                if(response.error == "wrong data")
                    return app.show_notification('Ошибка!', ' Некоторые поля заполнены неверно.', null, ".receipt.confirm");

                if(response.error == "no-binding")
                    return app.show_notification('Ошибка!', ' Этот телефон не привязан к данному аккаунту.', null, ".receipt.confirm");

                if(response.error == "wrong-number")
                    return app.show_notification('Ошибка!', ' Неправильный номер телефона.', null, ".receipt.confirm");

                if(response.error == "email-is-taken")
                    return app.show_notification('Ошибка!', ' Данный email уже занят.', null, ".receipt.confirm");

                if(response.error == "acc-not-found")
                    return app.show_notification('Ошибка!', ' Аккаунт с такими данными не найден.');

                if(response.error == "email does not exists")
                    return app.show_notification('Ошибка!', ' Вы ввели неверный email адрес.', null, ".receipt.confirm");

                if(response.error == "email is not confirmed")
                    return app.show_notification('Ошибка!', ' Email не подтвержден. Восстановление невозможно.', null, ".receipt.confirm");

                if(response.error == "You've reached request limit.")
                    return app.show_notification('Ошибка!', ' Превышен лимит запросов.');

                if(response.error)
                    return app.show_notification('Ошибка!', ' Неизвестная ошибка.');

                return 1;
            },

            show_confirm: function(response) {
                if(!response.success)
                    return;

                var self = app.restore_passw;
                var confirm = $(".confirm");
                var servers = get_server_list();
                var server = servers[response.server] || "None";
                self.nick = response.nick;
                self.userid = response.id;
                self.server = response.server;
                self.by_hands = response.by_hands;

                $(".nick b", confirm).text(response.nick);
                $(".accnum b", confirm).text(response.id);
                $(".server b", confirm).text(server);
                $(".level b", confirm).text(response.level);

                app.show_notification('Забыл ник?', ' Заходи на форум, или обращайся к администрации.', 'alert');
                self.tasks.show_comfirm_fields(response);

                confirm.show();
                app.scrollTo(confirm);
            },

            show_comfirm_fields: function(response) {
                $(".sorry").hide();
                $(".answer").hide();
                $(".sosorry").hide();
                $(".by_hands").hide();
                $(".confirm .selectors").hide();
                $(".confirm input:radio").attr("checked", false);

                var sosorry = !response.by_phone && !response.by_oldphone &&
                              !response.by_hands && !response.confirmed;

                if(sosorry)
                    return $(".sosorry").show();

                $(".confirm .selectors").show();
                $(".confirm .selectors li").hide();
                $(".confirm .selectors #use_no_access").parent().show();

                if(response.by_phone) {
                    $(".confirm .selectors #use_phone").parent().show();
                    $(".confirm .selectors [for=use_phone] span").text(response.by_phone);
                }

                if(response.by_oldphone) {
                    $(".confirm .selectors #use_oldphone").parent().show();
                    $(".confirm .selectors [for=use_oldphone] span").text(response.by_oldphone);
                }

                if(response.by_email) {
                    $(".confirm .selectors #use_email").parent().show();
                    $(".confirm .selectors [for=use_email] span").text(response.by_email);
                }
            },

            handle_selector_click: function(ev) {
                var target = ev.target.id;
                var self = app.restore_passw;

                $(".confirm .sorry").hide();
                $(".confirm .answer").hide();
                $(".confirm .by_hands").hide();
                $(".do-restore").hide();

                if(target == "use_no_access") {
                    if(self.by_hands)
                        $(".confirm .by_hands").show();
                    else
                        $(".confirm .sorry").show();
                }

                if(target == "use_email") {
                    $(".confirm .answer").show();
                    $(".confirm .do-restore").show();

                    $(".confirm .answer .phone").hide();
                    $(".confirm .answer .email").show();
                    $(".confirm .answer .email").attr("placeholder", "E-mail");
                }

                if(target == "use_phone" || target == "use_oldphone") {
                    $(".confirm .answer").show();
                    $(".confirm .do-restore").show();

                    $(".confirm .answer .phone").show();
                    $(".confirm .answer .email").show();
                    $(".confirm .answer .email").attr("placeholder", "Новый E-mail");
                }
            },

            show_success: function(response) {
                var self = app.restore_passw;
                var success = $(".receipt.success");
                var qr_code = $(".receipt.qr-code");
                var phone = self.phone.replace(/[^0-9]/ig, "");

                var qr_generator = "http://www.qr-code-generator.com/phpqrcode/getCode.php?cht=qr&chl={msg}&chs=180x180&choe=UTF-8&chld=L|0";

                if(self.option == "phone")
                    var command = "restore "+self.server+" "+self.nick+" "+self.email;

                if(self.option == "oldphone")
                    var command = "accback "+self.server+" "+self.userid+" "+self.nick+" "+self.email;

                if(self.option == "phone" || self.option == "oldphone") {
                    var smsto = "";
                    if(phone.slice(0,2) == "79")
                        smsto = "+79023501053";
                    if(phone.slice(0,3) == "380")
                        smsto = "380504180695";
                    if(phone.slice(0,3) == "375")
                        smsto = "375255097333";

                    var qrstring = "SMSTO:"+smsto+":" + command;
                    qrstring = encodeURIComponent(qrstring);
                    var image = qr_generator.format({msg: qrstring});

                    $(".qr-code img").attr("src", image)
                    $(".qr-code .sms").text(command);

                    qr_code.show();
                    app.scrollTo(qr_code);
                }

                if(self.option == "email") {
                    success.show();
                    app.scrollTo(success);
                }
            }
        },

        init: function() {
            $('form.restore').submit(app.restore_passw.actions.form_submit);
            $('.do-restore').click(app.restore_passw.actions.do_restore);

            $('.confirm .selectors li').click(app.restore_passw.tasks.handle_selector_click);
        },

        html_data: {
            item: '\
                <div class="statement_item">\
                  <div class="statement_date">{date}</div>\
                  <div class="change_balance {sign}">{change}</div>\
                  <div class="statement_desc">{desc}</div>\
                  <div class="clearfix"></div>\
                </div>',

            empty: '\
                <p>Не обнаружено активности на данном банковском счету.\
                   Вы можете управлять своим счётом в любом отделении банка.\
                   <br>&nbsp;</p>'
        },

        handler_url: '/passw_restore/find/',
        handler_url2: '/passw_restore/request/'
    },



    show_notification: function(title, descr, type, dest, slide) {
        var html = app.html_data.base_err.format({
            type: type || "",
            head: title,
            description: descr
        });

        dest = dest || ".full_info";

        app.remove_notifications(dest);
        $(dest).prepend(html);

        if(slide != false)
            app.scrollTo(dest+' .auth_error');
    },

    remove_notifications: function(dest) {
        $(dest+' .auth_error').remove();
    },

    scrollTo: function(selector) {
        $('html, body').animate({
            scrollTop: $(selector).offset().top
        }, 700)
    },

    html_data: {
        base_err: '<div class="auth_error {type}"><p><b>{head} </b>{description} </p></div>',

        ticket: '\
            <div class="depositing_content {type}">\
              <div class="depositing {type}">\
                <div class="{type}_icon"></div>\
                <h3>{head}</h3>\
                {body}\
              </div>\
            </div>\
        '
    }
}



$(document).ready(function(argument) {

    var init_list = [
        app.bank_statement,
        app.restore_passw,
        app.offlinepay,
        app.warehouse,
        app.settings,
        app.donate,
        app.login
    ];

    init_list.forEach(function(app){ app.init(); })

    if (!$.support.transition)
        $.fn.transition = $.fn.animate;

})


String.prototype.isInteger = function() {
    if(!this.length || isNaN(this) ||  !isFinite(this))
        return false;
    if(this.match(/[^0-9]+/))
        return false;
    if(this  % 1 != 0)
        return false;
    return true;
}

String.prototype.format = function(args) {
    var re = /\{([^}]+)\}/g;
    return this.replace(re, function(_, match){ return args[match] || "None"; });
}


String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


function serialize(form) {
    var result = {};
    var list = $(form).serializeArray();

    for (var i = list.length - 1; i >= 0; i--) {
        result[list[i].name] = list[i].value;
    };

    return result;
}


function numeric_filter(e) {
    // Allow: backspace, delete, tab, escape and enter
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
         // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
         // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
             // let it happen, don't do anything
             return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
}

function phone_filter(e) {
    var input = $(e.currentTarget).val();

    // Allow: plus sign as first char
    if(input.length == 0) {
        if(e.keyCode == 107)
            return;

        if(e.keyCode == 187 && e.shiftKey)
            return;
    }

    // Allow: whitespace
    if(e.keyCode == 32 && input.length && input[input.length-1] != " ") {
        return;
    }

    return numeric_filter(e);
}


function recaptcha_reset(captcha) {

    var id = window.captchas[captcha];
    return grecaptcha.reset(id);

}


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
