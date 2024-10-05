//台灣電話號碼格式正規化
tw_phone_format_std: function(p_number){
    if ( p_number != "" ) {
        //補上0
        // if ( p_number.substr(0,1)!="0")p_number= "0" + p_number;
        //判斷是手機還是市話
        if ( p_number.substr(1,1) == "9" && p_number.replace(/-/g, "").length >= 10 ) {
            //手機
            //去除符號
            p_number = p_number.replace(/-/g, "");
            //補上-
            if ( p_number.length >= 6 ) p_number= p_number.substr(0,4) + "-" + p_number.substr(4,6);
        } else {
             //市話
            if ( p_number.replace(/-/g, "") == p_number ){
                if ( p_number.substr(0,4) == "0836" ){
                    //4
                    p_number= p_number.substr(0,4) + "-" + p_number.substr(4,10);
                } else if (p_number.substr(0,3) == "037" ||
                    p_number.substr(0,3) == "049" ||
                    p_number.substr(0,3) == "089" ||
                    p_number.substr(0,3) == "082") {
                    //3
                    p_number = p_number.substr(0,3) + "-" + p_number.substr(3,10);
                } else {
                    //2
                    p_number = p_number.substr(0,2) + "-" + p_number.substr(2,10);
                }
            }
        }
        return p_number;
    } else {
        return "";
    }
}