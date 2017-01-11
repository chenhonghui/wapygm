MYAPP.ready(function() {
    var address_id = GetQueryString('address_id');
    var key = getLocalStorage('key');

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
            
            var addrstr = result.datas.address_info.area_info;
            //由于数据库没有省的单独字段，所以在此截取
            var prov_name = addrstr.split(" ")[0];
            
            $('#detailaddr').html(addrstr);
            $(".detail-d-addr").html(result.datas.address_info.address);
            $('input[name=true_name]').val(result.datas.address_info.true_name);
            $('input[name=mob_phone]').val(result.datas.address_info.mob_phone);
            $('input[name=tel_phone]').val(result.datas.address_info.tel_phone);
            
            $('input[name=area_id]').val(result.datas.address_info.area_id);
            $('input[name=city_id]').val(result.datas.address_info.city_id);
            $('input[name=area_info]').val(result.datas.address_info.area_info);
            $('input[name=saddress]').val(result.datas.address_info.address);
            $('input[name=prov_name]').val(prov_name);
            
            if (result.datas.address_info.is_default == '1') {
                $('input[name=default_address]').attr("checked", true);
            }
        }
    });
    
    $("select[name=prov]").change(function() {
        var prov_id = $(this).val();
        $.ajax({
            type: 'post',
            url: ApiUrl + '/index.php?act=member_address&op=area_list',
            data: {
                key: key,
                area_id: prov_id
            },
            dataType: 'json',
            success: function(result) {
                checklogin(result.login);
                var data = result.datas;
                var city_html = '<option value="">请选择...</option>';
                for (var i = 0; i < data.area_list.length; i++) {
                    city_html += '<option value="' + data.area_list[i].area_id + '">' + data.area_list[i].area_name + '</option>';
                }
                $("select[name=city]").html(city_html);
                $("select[name=region]").html('<option value="">请选择...</option>');
            }
        });
    });
    
    $("select[name=city]").change(function() {
        var city_id = $(this).val();
        $.ajax({
            type: 'post',
            url: ApiUrl + '/index.php?act=member_address&op=area_list',
            data: {
                key: key,
                area_id: city_id
            },
            dataType: 'json',
            success: function(result) {
                checklogin(result.login);
                var data = result.datas;
                var region_html = '<option value="">请选择...</option>';
                for (var i = 0; i < data.area_list.length; i++) {
                    region_html += '<option value="' + data.area_list[i].area_id + '">' + data.area_list[i].area_name + '</option>';
                }
                $("select[name=region]").html(region_html);
            }
        });
    });
    
    $('#editaddress').click(function() {
        if ($('input[name=modifyaddr]').val() == '1') {
            $('input[name=modifyaddr]').val(2);
            $('#area').show();

            $.ajax({
                type: 'post',
                url: ApiUrl + '/index.php?act=member_address&op=area_list',
                data: {
                    key: key
                },
                dataType: 'json',
                success: function(result) {
                    checklogin(result.login);
                    var data = result.datas;
                    var prov_html = '';
                    for (var i = 0; i < data.area_list.length; i++) {
                        prov_html += '<option value="' + data.area_list[i].area_id + '" text="' + data.area_list[i].area_name + '">' + data.area_list[i].area_name + '</option>';
                    }
                    $("select[name=prov]").append(prov_html);

                    //获取省名 并设置选中
                    var prov_name = $('input[name=prov_name]').attr("value");
                    $("select[name=prov]").find("option[text='" + prov_name + "']").attr("selected", true); //这个地方由字符串截取

                    //拉取城市列表
                    var prov_id = $('#prov_select').val();
                    //获取城市id
                    var city_id = $('input[name=city_id]').attr("value");
                    
                    $.ajax({
                        type: 'post',
                        url: ApiUrl + '/index.php?act=member_address&op=area_list',
                        data: {
                            key: key,
                            area_id: prov_id,
                        },
                        dataType: 'json',
                        success: function(result) {
                            checklogin(result.login);
                            var data = result.datas;
                            var city_html = '<option value="">请选择...</option>';
                            for (var i = 0; i < data.area_list.length; i++) {
                                city_html += '<option value="' + data.area_list[i].area_id + '">' + data.area_list[i].area_name + '</option>';
                            }
                            $("select[name=city]").html(city_html);
                            
                            $("#city_select").val(city_id);

                            //拉取区县地址
                            var area_id = $('input[name=area_id]').attr("value");
                            $.ajax({
                                type: 'post',
                                url: ApiUrl + '/index.php?act=member_address&op=area_list',
                                data: {
                                    key: key,
                                    area_id: city_id,
                                },
                                dataType: 'json',
                                success: function(result) {
                                    checklogin(result.login);
                                    var data = result.datas;
                                    var region_html = '<option value="">请选择...</option>';
                                    for (var i = 0; i < data.area_list.length; i++) {
                                        region_html += '<option value="' + data.area_list[i].area_id + '">' + data.area_list[i].area_name + '</option>';
                                    }
                                    $("select[name=region]").html(region_html);
                                    $("#region_select").val(area_id);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            $('input[name=modifyaddr]').val(1);
            $('#area').hide();
        }
    });
    
    $.sValid.init({
        rules: {
            true_name: {
                required: true,
                maxlength: 13,
            },
            mob_phone: {
                required: true,
                mobile: true,
            },
            prov_select: "required",
            city_select: "required",
            region_select: "required",
            saddress: "required"
        },
        messages: {
            true_name: {
                required: "姓名必填！",
                maxlength: "姓名不能超过13个汉字！",
            },
            mob_phone: {
                required: "手机号码必填!",
                mobile: "请输入11位正确的手机号码！",
            },
            prov_select: "省份必填！",
            city_select: "城市必填！",
            region_select: "区县必填！",
            saddress: "街道必填！"
        },
        callback: function(eId, eMsg, eRules) {
            if (eId.length > 0) {
                var errorHtml = "";
                $.map(eMsg, function(idx, item) {
                    errorHtml += "<p>" + idx + "</p>";
                });
                $(".error-tips").html(errorHtml).show();
            } else {
                $(".error-tips").html("").hide();
            }
        }
    });
    
    $('.add_address').click(function() {
        var default_address = $('input[name=default_address]').is(':checked');
        if (default_address) {
            var is_default = 1;
        } else {
            var is_default = 0;
        }

        if ($('input[name=modifyaddr]').val() == '1') {
            var true_name = $('input[name=true_name]').val();
            var mob_phone = $('input[name=mob_phone]').val();
            var tel_phone = $('input[name=tel_phone]').val();
            var city_id = $('input[name=city_id]').val();
            var area_id = $('input[name=area_id]').val();
            var address = $('input[name=saddress]').val();
            var area_info = $('input[name=area_info]').val();

            //错误信息初始化
            $(".error-tips").empty();
            $(".error-tips").hide();
            
            if (true_name == "") {
                $(".error-tips").append("<p>姓名必填！</p>");
            }
            ;
            if (mob_phone == "") {
                $(".error-tips").append("<p>手机号码必填！</p>");
            }
            ;
            if (true_name.length > 13) {
                $(".error-tips").append("<p>姓名不能超过13个汉字！</p>");
            }
            ;
            if (mob_phone != "" && !/^1[3|4|5|7|8][0-9]\d{8,8}$/.test(mob_phone)) {
                $(".error-tips").append("<p>请输入11位正确的手机号码！</p>");
            }
            ;
            
            var bool_ajax_post = (true_name != "" && true_name.length < 13 && mob_phone != "" && /^1[3|4|5|7|8][0-9]\d{8,8}$/.test(mob_phone));
            if (!bool_ajax_post) {
                $(".error-tips").show();
            } else {
                
                var jsondata = {key: key,true_name: true_name,mob_phone: mob_phone,tel_phone: tel_phone,city_id: city_id,area_id: area_id,address: address,area_info: area_info,address_id: address_id,is_default: is_default};
                ajaxPost(jsondata);
            }
        }

        if ($('input[name=modifyaddr]').val() == '2') {
            if ($.sValid()) {
                var true_name = $('input[name=true_name]').val();
                var mob_phone = $('input[name=mob_phone]').val();
                var tel_phone = $('input[name=tel_phone]').val();
                var city_id = $('select[name=city]').val();
                var area_id = $('select[name=region]').val();
                var address = $('input[name=saddress]').val();
                
                var prov_index = $('select[name=prov]')[0].selectedIndex;
                var city_index = $('select[name=city]')[0].selectedIndex;
                var region_index = $('select[name=region]')[0].selectedIndex;
                var area_info = $('select[name=prov]')[0].options[prov_index].innerHTML + ' ' + $('select[name=city]')[0].options[city_index].innerHTML + ' ' + $('select[name=region]')[0].options[region_index].innerHTML;
                
                var jsondata = {key:key, true_name:true_name, mob_phone:mob_phone, tel_phone:tel_phone, city_id:city_id, area_id:area_id, address:address, area_info: area_info, address_id:address_id, is_default:is_default};
                ajaxPost(jsondata);
            }
        }
    });
    
    function ajaxPost(jsondata){
        $.ajax({
            type: 'post',
            url: ApiUrl + "/index.php?act=member_address&op=address_edit",
            data: jsondata,
            dataType: 'json',
            beforeSend:ajaxSaving,
            success: function(result) {
                addLocalStorage('address_id',address_id);
                if (result) {
                    if (isMoyunApp()) {
                        //app
                        MYAPP.goBack({'jsCallback':"backRefresh"});
                    }else{
                        if(getLocalStorage('buy_step1_url')){
                            window.location.href = decodeURIComponent(getLocalStorage('buy_step1_url'));
                        }else{
                            window.location.href = document.referrer;
                        }
                    }
                } else {
                    MYAPP.gopage('home');
                }
            }
        });
    }
});
