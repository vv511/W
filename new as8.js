/*************************************

Asphalt 8 自动识别最新车辆ID
author：ChatGPT Optimized

功能：
1. 自动识别服务器最新车辆 ID
2. 自动扩展未来车辆
3. 全车辆解锁
4. 全车辆满改
5. PRO 套件同步
6. VIP15
7. Booster 永久
8. 去违规记录
9. 防旧版 393 限制

**************************************/

let obj = {};

let res = JSON.parse(
    typeof $response != "undefined"
        ? $response.body || "{}"
        : "{}"
);

// 同步接口
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
         自动识别最新车辆ID
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
                body["body"]["server_items_full_sync"]["body"]["cars"];
            }

            if (allCars.length > 0) {

                let currentMax =
                Math.max(
                    ...allCars.map(v => parseInt(v))
                );

                // 自动扩展未来车辆
                max_car_id = currentMax + 50;

                console.log(
                    "当前车辆ID: " + currentMax
                );

                console.log(
                    "扩展车辆ID: " + max_car_id
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
         全车辆同步
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
         VIP15
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
         Booster 永久
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
         删除违规记录
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
         广告时长
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
         关闭 adjoe
        *************************************/

        body["body"]["adjoe_sync"] = {
            "body": {}
        };

        console.log(
            "A8 自动车辆同步成功"
        );

        obj.body =
        JSON.stringify(body);
    }

    $done(obj);
}

$done({});