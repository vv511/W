```javascript
/*************************************

项目名称：Gameloft Asphalt 8 规则重写脚本（修复优化版）
author：xdz1 & Gemini

**************************************
[rewrite_local]
^https:([\S\s]*?)gameloft.com/scripts/general/sync_all.php url script-response-body https://raw.githubusercontent.com/vv511/W/refs/heads/main/Gameloft.js
^https:([\S\s]*?)gameloft.com/scripts/energy/pre_tle_race.php url script-response-body https://raw.githubusercontent.com/vv511/W/refs/heads/main/Gameloft.js
^https:([\S\s]*?)gameloft.com/configs/users/me url script-response-body https://raw.githubusercontent.com/vv511/W/refs/heads/main/Gameloft.js
^https:([\S\s]*?)unityads.unity3d.com/([\S\s]*?)/config.json url script-response-body https://raw.githubusercontent.com/vv511/W/refs/heads/main/Gameloft.js
^https:([\S\s]*?)gameloft.com/scripts url script-response-body https://raw.githubusercontent.com/vv511/W/refs/heads/main/Gameloft.js
^https:([\S\s]*?)gameloft.com/profiles/me/myprofile url script-response-body https://raw.githubusercontent.com/vv511/W/refs/heads/main/Gameloft.js

[mitm]
hostname = *.gameloft.com,ads.vungle.com,*.unity3d.com,*.applovin.com, web.facebook.com,applovin.com

*************************************/

let obj = {};
const url = $request.url;

// 安全解析 JSON
function safeParse(str) {
    try {
        return str ? JSON.parse(str) : null;
    } catch (e) {
        console.log("JSON 解析失败: " + e.message);
        return null;
    }
}

let res = (typeof $response !== "undefined" && $response.body) ? safeParse($response.body) : null;

// ==========================================
// 1. Unity Ads 广告破解
// ==========================================
const u3d_ad = /config.json/;
if (u3d_ad.test(url)) {
    if (res && res["SRR"] && Array.isArray(res["SRR"]["placements"])) {
        for (let ad_item of res["SRR"]["placements"]) {
            ad_item["allowSkip"] = true;
            ad_item["closeTimerDuration"] = 1;
            ad_item["skipInSeconds"] = 1;
            ad_item["adFormat"] = "interstitial";
            ad_item["disableBackButton"] = false;
            ad_item["optOutEnabled"] = true;
            
            if (ad_item["experimentation"]) {
                ad_item["experimentation"]["admobMednLoadTimeoutInSec"] = "1";
            }
            ad_item["isSkipToAppSheetEnabled"] = false;
            ad_item["assetCaching"] = "voluntary";
            if (ad_item["banner"]) {
                ad_item["banner"]["refreshRate"] = 5;
            }
            ad_item["enabled"] = false;

            // 修复：将原本在循环外的、会导致 ad_item undefined 崩溃的代码移入循环内安全赋值
            ad_item["msr"] = 1;
            ad_item["sto"] = 1000;
            if (ad_item["expo"] && ad_item["expo"]["sto"]) {
                ad_item["expo"]["sto"]["value"] = 1000;
            }
        }
    }
    obj.body = JSON.stringify(res || {});
    $done(obj);
}

// ==========================================
// 2. Facebook 广告包优化
// ==========================================
else if (/facebook.com\/adnw_sync2/.test(url)) {
    if (res) {
        if (res["refresh"]) {
            res["refresh"]["target_refresh_s"] = 10;
        }
        if (res["bundles"] && res["bundles"]["feature_config"] && res["bundles"]["feature_config"]["data"] && res["bundles"]["feature_config"]["data"]["feature_config"]) {
            res["bundles"]["feature_config"]["data"]["feature_config"]["adnw_android_network_default_connection_timeout_ms"] = 100;
        }
    }
    obj.body = JSON.stringify(res || {});
    $done(obj);
}

// ==========================================
// 3. 游戏全局配置文件初始化 (me)
// ==========================================
else if (/gameloft.com\/configs\/users\/me/.test(url)) {
    if (res) {
        // 安全初始化多层级结构，防止属性缺失导致崩溃
        res["game"] = res["game"] || {};
        res["game"]["parameters"] = res["game"]["parameters"] || {};
        let params = res["game"]["parameters"];

        params["init"] = params["init"] || {};
        params["init"]["onboardingGift"] = {};
        
        params["InventoryAds"] = params["InventoryAds"] || {};
        params["InventoryAds"]["slotsLeftForNotify"] = {};

        params["ingameAds"] = params["ingameAds"] || {};
        params["ingameAds"]["slotsLeftForNotify"] = {};

        params["FusionPointPacks"] = params["FusionPointPacks"] || {};
        params["FusionPointPacks"]["enabled"] = true;

        params["MultiCreditsAdsRewards"] = {
            "MinimumReward": 30000,
            "creditsForAdsCap": 37500
        };

        // 车辆列表生成
        let cars = [];
        let qu = [40, 43, 141, 208, 380, 381, 331];
        for (let i = 1; i <= 888; i++) {
            if (!qu.includes(i)) {
                cars.push(i);
            }
        }
        params["VehicleUpgradeAds"] = params["VehicleUpgradeAds"] || {};
        params["VehicleUpgradeAds"]["vehicles"] = cars;

        // 离线商店
        if (res["offline_store"] && Array.isArray(res["offline_store"]["prices"])) {
            for (let item of res["offline_store"]["prices"]) {
                item["hidden"] = false;
            }
        }

        // 在线商店内购价格修改为 0.01
        if (res["iap"] && Array.isArray(res["iap"]["prices"])) {
            for (let item of res["iap"]["prices"]) {
                item["hidden"] = false;
                if (Array.isArray(item["billing_methods"])) {
                    for (let item_inner of item["billing_methods"]) {
                        item_inner["price"] = 0.01;
                    }
                }
            }
        }
    }
    obj.body = JSON.stringify(res || {});
    $done(obj);
}

// ==========================================
// 4. 个人存档修改 (myprofile)
// ==========================================
else if (/gameloft.com\/profiles\/me\/myprofile/.test(url)) {
    if (res) {
        delete res["_infractions"];
        if (res["_adjoe_reward"]) {
            res["_adjoe_reward"]["data"] = "";
            res["_ad_rewards"] = res["_ad_rewards"] || {};
            res["_ad_rewards"]["data"] = "";
            res["_ads_progressive"] = {};
            
            res["_Vip"] = res["_Vip"] || {};
            res["_Vip"]["level"] = 15;
            res["_Vip"]["initial_points"] = 155;
        }
    }
    obj.body = JSON.stringify(res || {});
    $done(obj);
}

// ==========================================
// 5. 内购恢复/凭据伪造 (inapp_crm)
// ==========================================
else if (/inapp_crm\/index.php/.test(url)) {
    if (!/action/.test(url)) {
        let spoofedResponse = [
            {
                "status": "delivered",
                "id": "Car_Bundle_350_iinm",
                "info": [
                    {
                        "quantity": 1,
                        "item": "Nissan_Leaf_Nismo_RC___CAR_PRICE"
                    }
                ],
                "transaction_id": "310156474458",
                "subscription": true,
                "item_id": "com.gameloft.asphalt8.iOS_car_bundle_350"
            },
            {
                "status": "delivered",
                "id": "Car_Bundle_356_s6pe",
                "info": [
                    {
                        "quantity": 1,
                        "item": "Ariel_Atom_V8___CAR_PRICE"
                    }
                ],
                "transaction_id": "310156424684",
                "subscription": true,
                "item_id": "com.gameloft.asphalt8.iOS_car_bundle_356"
            }
        ];
        $done({ body: JSON.stringify(spoofedResponse) });
    } else {
        // 修复：原来为 $done({res})，修正为正确的代理返回格式
        $done({ body: JSON.stringify(res || {}) });
    }
}

// ==========================================
// 6. 自动授权 (authorize)
// ==========================================
else if (/^https:([\S\s]*?)gameloft.com\/authorize/.test(url)) {
    let body = $request.body || "";
    if (body) {
        let regexUser = /username([\S\s]+?)[\&]/;
        body = body.replace(regexUser, "username=anonymous%2FOtMyt5EPkvgRcxM%3AdjNjQ3MjEwM1fMT%dr2BkYZ71D&");
        let regexPass = /password([\S\s]+?)[\&]/;
        body = body.replace(regexPass, "password=GIHI7x9ofH5q55vJ&");
    }
    $done({ body });
}

// ==========================================
// 7. 赛事前置处理 (pre_tle_race)
// ==========================================
else if (/^https:([\S\s]*?)energy\/pre_tle_race.php/.test(url)) {
    if (res && res["body"]) {
        let timestamp = Math.floor((new Date().getTime() + (1000 * 60 * 60 * 24 * 999)) / 1000);

        if (res["body"]["infractions_sync"] && res["body"]["infractions_sync"]["body"]) {
            res["body"]["infractions_sync"]["body"]["infractions"] = "";
        }

        if (res["body"]["boosters_sync"] && res["body"]["boosters_sync"]["body"]) {
            res["body"]["boosters_sync"]["body"]["active"] = {
                "extra_tank": { "min": timestamp },
                "performance": { "min": timestamp },
                "nitro": { "min": timestamp },
                "credits": { "min": timestamp }
            };
        }
    }
    obj.body = JSON.stringify(res || {});
    $done(obj);
}

// ==========================================
// 8. 数据同步/全部升级修改 (sync_all & scripts)
// ==========================================
else if (/^https:([\S\s]*?)sync_all.php/.test(url) || /^https:([\S\s]*?)gameloft.com\/scripts([\S\s]*?).php/.test(url)) {
    if (res && res["body"]) {
        const sync = /^https:([\S\s]*?)sync_all.php/;
        let isSync = sync.test(url);
        let timestamp = Math.floor((new Date().getTime() + (1000 * 60 * 60 * 24 * 999)) / 1000);

        let cars = [];
        let cars_parts = {};
        let qu = [40, 43, 141, 208, 380, 381, 331];

        for (let i = 1; i <= 888; i++) {
            if (qu.includes(i)) continue;

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
            cars.push(i);
        }

        if (isSync || res["body"]["upgrades_full_sync"] !== undefined) {
            res["body"]["upgrades_full_sync"] = res["body"]["upgrades_full_sync"] || { "body": {} };
            res["body"]["upgrades_full_sync"]["body"]["upgrades"] = cars_parts;
        }
        
        if (isSync || res["body"]["progressive_ads_sync"] !== undefined) {
            res["body"]["progressive_ads_sync"] = res["body"]["progressive_ads_sync"] || { "body": {} };
            res["body"]["progressive_ads_sync"]["body"]["duration"] = 372800;
        }

        if (isSync || res["body"]["server_items_full_sync"] !== undefined) {
            res["body"]["server_items_full_sync"] = res["body"]["server_items_full_sync"] || { "body": {} };
            res["body"]["server_items_full_sync"]["body"]["cars"] = cars;
        }
        
        res["body"]["prokits_car_parts_full_sync"] = {
            "body": {
                "cars_parts": cars_parts,
                "up_to_date": false,
                "sync_key": "1712288961"
            }
        };
        
        if (isSync || res["body"]["infractions_sync"] !== undefined) {
            res["body"]["infractions_sync"] = res["body"]["infractions_sync"] || { "body": {} };
            res["body"]["infractions_sync"]["body"]["infractions"] = "";
        }

        if (isSync || res["body"]["boosters_sync"] !== undefined) {
            res["body"]["boosters_sync"] = res["body"]["boosters_sync"] || { "body": {} };
            res["body"]["boosters_sync"]["body"]["active"] = {
                "extra_tank": { "min": timestamp },
                "performance": { "min": timestamp },
                "nitro": { "min": timestamp },
                "credits": { "min": timestamp }
            };
        }
        
        res["body"]["adjoe_sync"] = { "body": {} };
        
        if (res["body"]["vip_full_sync"] && res["body"]["vip_full_sync"]["body"]) {
            res["body"]["vip_full_sync"]["body"]["level"] = 15;
        }

        console.log("狂野飙车8同步数据修改成功!");
        obj.body = JSON.stringify(res);
    }
    $done(obj);
}

// ==========================================
// 9. 兜底处理：防止任何未匹配路径造成卡网
// ==========================================
else {
    $done({});
}

```
