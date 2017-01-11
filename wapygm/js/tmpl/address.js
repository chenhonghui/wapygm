MYAPP.ready(function() {
    var address_id = GetQueryString('address_id');
    var key = getLocalStorage('key');

    //如果已经有收货地址 编辑功能
    if (address_id) {
        $.ajax({
            type: 'post',
            url: ApiUrl + '/index.php?act=member_address&op=address_info',
            data: {
                key: key,
                address_id: address_id
            },
            dataType: 'json',
            success: function(result) {
                checklogin(result.login);
                var address_info = result.datas.address_info;
                //填充input
                $('input[name=true_name]').val(address_info.true_name);
                $('input[name=mob_phone]').val(address_info.mob_phone);
                $('input[name=postcode]').val(address_info.postcode);
                $('#detail_d_addr').val(address_info.address);

                //赋值
                var tags = ["province_id", "city_id", "area_id"];
                var temp = null;
                var tg = function() {
                    temp = $("#region select").eq(tg.count).val(address_info[tags[tg.count]]);
                    temp.trigger("change");
                    tg.count++;
                    if (tg.count !== 3) {
                        setTimeout(function() {
                            tg();
                        },
                        100)
                    }
                }
                tg.count = 0;
                tg();
                $('#city_id').val(address_info.city_id);
                $('#area_id').val(address_info.area_id);

                if (address_info.is_default == '1') {
                    $('input[name=default_address]').attr("checked", true);
                }
            }
        });
    }

    $.ajax({
        type: 'post',
        url: ApiUrl + '/index.php?act=member_address&op=get_is_postcode',
        data: {
            key: key
        },
        dataType: 'json',
        success: function(result) {
            //地址编辑邮政编码区分站点
            if (result.datas == '1') {
                $('#postcode').parents('li').removeClass('hide');
                $('#is_ygm').val('1');
            }
        }
    });

    //获取列表
    get_area_list(0);
    //一级地区显示
    $('.area1').click(function() {
        $('.area1').hide();
        $('.area2').hide();
        $("#addr-ul").html('');;
        get_area_list(0);
    });
    //一级地区显示
    $('.area2').click(function() {
        $('.area2').hide();
        $('.area1').show();
        $("#addr-ul").html('');;
        get_area_list($(this).attr("data_area_id"));
    });
    //省市区 三级遮罩菜单
    $('#detailaddr').click(function() {
        $('.fixed-mask').show();
    });
    //保存地址
    $('.add_address').click(save_address);

    //获取地区列表
    function get_area_list(area_id, self) {
        $.ajax({
            type: 'post',
            url: ApiUrl + '/index.php?act=member_address&op=area_list',
            data: {
                key: key,
                area_id: area_id
            },
            dataType: 'json',
            beforeSend: ajaxLoading,
            success: function(result) {
                checklogin(result.login);
                var data = result.datas;
                var prov_html = '';
                for (var i = 0; i < data.area_list.length; i++) {
                    prov_html += '<li class="choose" data_area_id="' + data.area_list[i].area_id + '" data-area-name="' + data.area_list[i].area_name + '">' + data.area_list[i].area_name + '</li>';
                }

                $("#addr-ul").html(prov_html);

                $('.choose').click(function() {
                    var area_id = $(this).attr("data_area_id");
                    var area_name = $(this).attr("data-area-name");
                    if (data.area_list[0].area_deep == 1) {
                        $('input[name=province]').val(area_id);
                        $('input[name=province]').attr('data-area-name', area_name);
                    }
                    if (data.area_list[0].area_deep == 2) {
                        $('input[name=city_id]').val(area_id);
                        $('input[name=city_id]').attr('data-area-name', area_name);
                    }
                    if (data.area_list[0].area_deep == 3) {
                        $('input[name=area_id]').val(area_id);
                        $('input[name=area_id]').attr('data-area-name', area_name);
                    } else {
                        get_area_list(area_id, this);
                    }
                });

                if (data.area_list[0].area_deep == 2) {
                    $('.area1').show();
                    if (self) {
                        $('.area1').html($(self).html());
                        $('.area2').attr("data_area_id", $(self).attr("data_area_id"));
                    }

                }

                if (data.area_list[0].area_deep == 3) {
                    $('.area2').show();
                    if (self) {
                        $('.area2').html($(self).html());
                    }
                    $('.choose').click(function() {
                        $('#detailaddr').html($('input[name=province]').attr('data-area-name') + ' ' + $('input[name=city_id]').attr('data-area-name') + ' ' + $('input[name=area_id]').attr('data-area-name'));
                        $('.fixed-mask').hide();
                        $('.area1').hide();
                        $('.area2').hide();
                        get_area_list(0);
                    })
                }

            },
            complete: ajaxLoadingComplete
        });

        //点击获取当前地理位置信息
        $('input[name=geo_btn]').click(function() {
            $.ajax({
                type: 'post',
                url: ApiUrl + '/index.php?act=member_address&op=geo_coding',
                data: {
                    key: key,
                    area_id: area_id
                },
                dataType: 'json',
                beforeSend: ajaxLoading,
                success: function(result) {
                    var data = result.datas.final_address;
                    //填充input
                    var detail_address = data.province + ' ' + data.city + ' ' + data.area;
                    $('#detailaddr').text(detail_address);
                    $('#detail_d_addr').val(data.street);
                    //隐藏的表单
                    $('input[name=city_id]').val(data.city_id);
                    $('input[name=area_id]').val(data.area_id);
                },
                complete: ajaxLoadingComplete
            });
        });

        //智能识别用户提供的地理位置信息
        $('#smart_parse_btn').click(function() {
            var address_str = $('#address_str').val();
            if (address_str != '') {
                $.ajax({
                    type: 'post',
                    url: ApiUrl + '/index.php?act=member_address&op=smart_parse',
                    data: {
                        key: key,
                        address_str: address_str
                    },
                    dataType: 'json',
                    beforeSend: ajaxLoading,
                    success: function(result) {
                        var data = result.datas;
                        //填充input
                        var detail_address = data.area_names;

                        //赋值  data.province_id;
                        var tags = ["province_id", "city_id", "area_id"];
                        var temp = null;
                        var tg = function() {
                            temp = $("#region select").eq(tg.count).val(data[tags[tg.count]]);
                            temp.trigger("change");
                            // console.log("temp",temp);
                            tg.count++;
                            if (tg.count !== 3) {
                                setTimeout(function() {
                                    tg();
                                },
                                100)
                            }
                        }
                        tg.count = 0;
                        tg();
                        $('#city_id').val(data.city_id);
                        $('#area_id').val(data.area_id);
                        $('#area_info').val(detail_address);
                        $('#detail_d_addr').val(data.street);
                    },
                    complete: ajaxLoadingComplete
                });
            }

        })
    }

    //保存提交
    function save_address() {
        var true_name = $('input[name=true_name]').val();
        var mob_phone = $('input[name=mob_phone]').val();
        var postcode = $('input[name=postcode]').val();
        var city_id = $('input[name=city_id]').val();
        var area_id = $('input[name=area_id]').val();
        var area_info = $('input[name=area_info]').val();
        var detail_d_addr = $('textarea[name=detail_d_addr]').val();
        var default_address = $('input[name=default_address]').is(':checked');
        if (default_address) {
            var is_default = 1;
        } else {
            var is_default = 0;
        }

        if (true_name == "") {
            $.sDialog({
                skin: "red",
                content: "请输入收货人",
                okBtn: false,
                cancelBtn: false
            });
            return false;
        }
        if (mob_phone == "" || !/^1[3|4|5|7|8][0-9]\d{8,8}$/.test(mob_phone)) {
            $.sDialog({
                skin: "red",
                content: "请输入正确的手机号",
                okBtn: false,
                cancelBtn: false
            });
            return false;
        }
        if ($('#is_ygm').val() == '1' && (postcode == "" || !/^\d{6,6}$/.test(postcode))) {
            $.sDialog({
                skin: "red",
                content: "请输入正确邮编",
                okBtn: false,
                cancelBtn: false
            });
            return false;
        }
        if (city_id == "" || area_id == "") {
            $.sDialog({
                skin: "red",
                content: "请输入所在地",
                okBtn: false,
                cancelBtn: false
            });
            return false;
        }
        if (detail_d_addr == "") {
            $.sDialog({
                skin: "red",
                content: "请输入详细地址",
                okBtn: false,
                cancelBtn: false
            });
            return false;
        }

        $('.add_address').unbind("click");
        if (address_id) { //编辑地址
            var jsondata = {
                key: key,
                true_name: true_name,
                postcode: postcode,
                mob_phone: mob_phone,
                city_id: city_id,
                area_id: area_id,
                address: detail_d_addr,
                area_info: area_info,
                address_id: address_id,
                is_default: is_default
            };
            $.ajax({
                type: 'post',
                url: ApiUrl + "/index.php?act=member_address&op=address_edit",
                data: jsondata,
                dataType: 'json',
                beforeSend: ajaxSaving,
                success: function(result) {
                    $('.add_address').click(save_address);
                    addLocalStorage('address_id', address_id);
                    if (result) {
                        if (isMoyunApp()) {
                            //app
                            MYAPP.goBack({
                                'jsCallback': "backRefresh"
                            });
                        } else {
                            if (getLocalStorage('buy_step1_url')) {
                                window.location.href = decodeURIComponent(getLocalStorage('buy_step1_url'));
                            } else {
                                window.location.href = document.referrer;
                            }
                        }
                    } else {
                        MYAPP.goBack({
                            'jsCallback': "backRefresh"
                        });
                    }
                }
            });
        } else { //新增地址
            $.ajax({
                type: 'post',
                url: ApiUrl + "/index.php?act=member_address&op=address_add",
                data: {
                    key: key,
                    true_name: true_name,
                    mob_phone: mob_phone,
                    postcode: postcode,
                    city_id: city_id,
                    area_id: area_id,
                    address: detail_d_addr,
                    area_info: area_info,
                    is_default: is_default
                },
                dataType: 'json',
                success: function(result) {
                    if (result) {
                        $('.add_address').click(save_address);
                        addLocalStorage('address_id', result.datas.address_id);
                        if (isMoyunApp()) {
                            //app
                            MYAPP.goBack({
                                'jsCallback': "backRefresh"
                            });
                        } else {
                            if (getLocalStorage('buy_step1_url')) {
                                window.location.href = decodeURIComponent(getLocalStorage('buy_step1_url'));
                            } else {
                                window.location.href = document.referrer;
                            }
                        }
                    } else {
                        MYAPP.goBack({
                            'jsCallback': "backRefresh"
                        });
                    }
                }
            });
        }
    }

    regionInit("region");

});