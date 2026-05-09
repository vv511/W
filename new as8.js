/*************************************



项目名称：Asphalt 8 自动识别全车版

整合优化：ChatGPT



功能：

1. 自动识别最新车辆ID

2. 自动扩展未来车辆

3. 全车辆解锁

4. 全车辆满改

5. PRO 套件同步

6. VIP15

7. Booster 永久

8. 去违规记录

9. 去广告

10. 自动恢复购买

11. 兼容旧版脚本



**************************************

[rewrite_local]



#! ^https:([\S\s]*?)gameloft.com/scripts/general/sync_all.php url script-response-body https://raw.githubusercontent.com/vv511/W/refs/heads/main/Gameloft.js



#! ^https:([\S\s]*?)gameloft.com/scripts/energy/pre_tle_race.php url script-response-body https://raw.githubusercontent.com/vv511/W/refs/heads/main/Gameloft.js



^https:([\S\s]*?)gameloft.com/configs/users/me url script-response-body https://raw.githubusercontent.com/vv511/W/refs/heads/main/Gameloft.js



^https:([\S\s]*?)unityads.unity3d.com/([\S\s]*?)/config.json url script-response-body https://raw.githubusercontent.com/vv511/W/refs/heads/main/Gameloft.js



^https:([\S\s]*?)gameloft.com/scripts url script-response-body https://raw.githubusercontent.com/vv511/W/refs/heads/main/Gameloft.js



^https:([\S\s]*?)gameloft.com/profiles/me/myprofile url script-response-body https://raw.githubusercontent.com/vv511/W/refs/heads/main/Gameloft.js



#! ^https://iap-eur.gameloft.com/inapp_crm/index.php url script-response-body https://raw.githubusercontent.com/vv511/W/refs/heads/main/Gameloft.js



#! ^https:([\S\s]*?)gameloft.com/authorize url script-request-body https://raw.githubusercontent.com/vv511/W/refs/heads/main/Gameloft.js



#! 去广告

#! ^https://web.facebook.com/adnw_sync2 url reject

#! ^https:([\S\s]*?)unityads.unity3d.com url reject

#! ^https://a4.applovin.com/4.0/ad url reject

#! ^https:([\S\s]*?)iads.unity3d.com url reject

#! ^https:([\S\s]*?)ads.vungle.com url reject



[mitm]

hostname = *.gameloft.com,ads.vungle.com,*.unity3d.com,*.applovin.com,web.facebook.com,applovin.com



*************************************/



let obj = {};



let res = JSON.parse(

    typeof $response != "undefined"

        ? $response.body || "{}"

        : "{}"

);



/*************************************

 Unity Ads

*************************************/



const u3d_ad = /config.json/;



if (u3d_ad.test($request.url)) {



    let body = res;



    if (body["SRR"]) {



        for (let ad_item of body["SRR"]["placements"]) {



            ad_item["allowSkip"] = true;

            ad_item["closeTimerDuration"] = 1;

            ad_item["skipInSeconds"] = 1;

            ad_item["enabled"] = false;

        }

    }



    obj.body = JSON.stringify(body);



    $done(obj);

}



/*************************************

 configs/users/me

*************************************/



const me =

/gameloft.com\/configs\/users\/me/;



if (me.test($request.url)) {



    let body = res;



    body["game"]["parameters"]["ingameAds"] = {};



    body["game"]["parameters"]["FusionPointPacks"]["enabled"] = true;



    body["game"]["parameters"]["MultiCreditsAdsRewards"] = {



        "MinimumReward": 30000,

        "creditsForAdsCap": 37500

    };



    /*************************************

     自动车辆广告升级

    *************************************/



    let cars = [];



    let max_car_id = 450;



    try {



        if (

            body["game"] &&

            body["game"]["parameters"]

        ) {



            max_car_id = 500;

        }



    } catch(e) {}



    let qu = [

        40,

        43,

        141,

        208,

        380,

        381,

        331

    ];



    for (

        let i = 1;

        i <= max_car_id;

        i++

    ) {



        if (qu.includes(i)) {

            continue;

        }



        cars.push(i);

    }



    body["game"]["parameters"]

    ["VehicleUpgradeAds"]

    ["vehicles"] = cars;



    /*************************************

     商店价格

    *************************************/



    for (let item of body["iap"]["prices"]) {



        item["hidden"] = false;



        for (

            let item_inner of item["billing_methods"]

        ) {



            item_inner["price"] = 0.01;

        }

    }



    obj.body = JSON.stringify(body);



    $done(obj);

}



/*************************************

 myprofile

*************************************/



const myprofile =

/gameloft.com\/profiles\/me\/myprofile/;



if (myprofile.test($request.url)) {



    let body = res;



    delete body["_infractions"];



    if (body["_Vip"]) {



        body["_Vip"]["level"] = 15;

        body["_Vip"]["initial_points"] = 155;

    }



    obj.body = JSON.stringify(body);



    $done(obj);

}



/*************************************

 authorize

*************************************/



const authorize =

/^https:([\S\s]*?)gameloft.com\/authorize/;



if (authorize.test($request.url)) {



    let regex =

    /username([\S\s]+?)[\&]/;



    let body =

    $request.body.replace(

        regex,

        "username=anonymous&"

    );



    regex =

    /password([\S\s]+?)[\&]/;



    body = body.replace(

        regex,

        "password=123456&"

    );



    $done({body});

}



/*************************************

 sync

*************************************/



const sync =

/^https:([\S\s]*?)sync_all.php/;



const script_g =

/^https:([\S\s]*?)gameloft.com\/scripts([\S\s]*?).php/;



if (

    sync.test($request.url) ||

    script_g.test($request.url)

) {



    if ($response !== undefined && res && res["body"]) {



        let body = res;



        /*************************************

         自动识别车辆ID

        *************************************/



        let max_car_id = 450;



        try {



            let allCars = [];



            if (

                body["body"]["server_items_full_sync"] &&

                body["body"]["server_items_full_sync"]["body"] &&

                body["body"]["server_items_full_sync"]["body"]["cars"]

            ) {



                allCars =

                body["body"]

                ["server_items_full_sync"]

                ["body"]["cars"];

            }



            if (allCars.length > 0) {



                let currentMax =

                Math.max(

                    ...allCars.map(

                        v => parseInt(v)

                    )

                );



                max_car_id =

                currentMax + 50;



                console.log(

                    "当前车辆ID: " +

                    currentMax

                );



                console.log(

                    "扩展车辆ID: " +

                    max_car_id

                );

            }



        } catch(e) {



            console.log(

                "自动识别车辆失败"

            );

        }



        /*************************************

         排除异常车辆

        *************************************/



        let qu = [

            40,

            43,

            141,

            208,

            380,

            381,

            331

        ];



        let qu2 = [];



        /*************************************

         构建车辆

        *************************************/



        let cars = [];



        let cars_parts = {};



        for (

            let i = 1;

            i <= max_car_id;

            i++

        ) {



            if (

                qu.includes(i) ||

                qu2.includes(i)

            ) {

                continue;

            }



            cars.push(i);



            cars_parts[i + ""] = {



                "tyres": 10,

                "suspension": 10,

                "drive train": 10,

                "exhaust": 10,



                "acceleration": 10,

                "top_speed": 10,

                "handling": 10,

                "nitro": 10,



                "updated_ts": 1712265302

            };

        }



        /*************************************

         满改同步

        *************************************/



        if (

            body["body"]["upgrades_full_sync"]

        ) {



            body["body"]

            ["upgrades_full_sync"]

            ["body"]

            ["upgrades"] = cars_parts;

        }



        /*************************************

         PRO 套件同步

        *************************************/



        body["body"]

        ["prokits_car_parts_full_sync"] = {



            "body": {



                "cars_parts": cars_parts,



                "up_to_date": false,



                "sync_key": "1712288961"

            }

        };



        /*************************************

         全车辆

        *************************************/



        if (

            body["body"]["server_items_full_sync"]

        ) {



            body["body"]

            ["server_items_full_sync"]

            ["body"]

            ["cars"] = cars;

        }



        /*************************************

         VIP

        *************************************/



        if (

            body["body"]["vip_full_sync"]

        ) {



            body["body"]

            ["vip_full_sync"]

            ["body"]

            ["level"] = 15;

        }



        /*************************************

         Booster

        *************************************/



        let timestamp =

        Math.floor(

            (

                new Date().getTime() +

                (1000 * 60 * 60 * 24 * 999)

            ) / 1000

        );



        if (

            body["body"]["boosters_sync"]

        ) {



            body["body"]

            ["boosters_sync"]

            ["body"]

            ["active"] = {



                "extra_tank": {

                    "min": timestamp

                },



                "performance": {

                    "min": timestamp

                },



                "nitro": {

                    "min": timestamp

                },



                "credits": {

                    "min": timestamp

                }

            };

        }



        /*************************************

         删除违规

        *************************************/



        if (

            body["body"]["infractions_sync"]

        ) {



            body["body"]

            ["infractions_sync"]

            ["body"]

            ["infractions"] = "";

        }



        /*************************************

         广告同步

        *************************************/



        if (

            body["body"]["progressive_ads_sync"]

        ) {



            body["body"]

            ["progressive_ads_sync"]

            ["body"]

            ["duration"] = 372800;

        }



        /*************************************

         adjoe

        *************************************/



        body["body"]["adjoe_sync"] = {

            "body": {}

        };



        console.log(

            "A8 自动全车同步成功"

        );



        obj.body =

        JSON.stringify(body);

    }



    $done(obj);

}



$done({});
