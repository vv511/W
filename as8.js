/*************************************

项目名称：**********
author：xdz1

**************************************
[rewrite_local]
#! ^https:([\S\s]*?)gameloft.com/scripts/general/sync_all.php url script-response-body https://raw.githubusercontent.com/xudazhu1/QuantumultX-/main/as8.js
#! ^https:([\S\s]*?)gameloft.com/scripts/energy/pre_tle_race.php url script-response-body https://raw.githubusercontent.com/xudazhu1/QuantumultX-/main/as8.js
^https:([\S\s]*?)gameloft.com/configs/users/me url script-response-body https://raw.githubusercontent.com/xudazhu1/QuantumultX-/main/as8.js
^https:([\S\s]*?)unityads.unity3d.com/([\S\s]*?)/config.json url script-response-body https://raw.githubusercontent.com/xudazhu1/QuantumultX-/main/as8.js

^https:([\S\s]*?)gameloft.com/scripts url script-response-body https://raw.githubusercontent.com/xudazhu1/QuantumultX-/main/as8.js
^https:([\S\s]*?)gameloft.com/profiles/me/myprofile url script-response-body https://raw.githubusercontent.com/xudazhu1/QuantumultX-/main/as8.js

# ! ^https://iap-eur.gameloft.com/inapp_crm/index.php url script-response-body http://192.168.8.229:8088/as8.js
#! ^https:([\S\s]*?)gameloft.com/authorize url script-request-body http://192.168.8.229:8088/as8.js
#! 下面是去广告
#! ^https://web.facebook.com/adnw_sync2 url reject
#! ^https:([\S\s]*?)unityads.unity3d.com url reject
#! ^https://a4.applovin.com/4.0/ad url reject
#! ^https:([\S\s]*?)iads.unity3d.com url reject
#! ^https:([\S\s]*?)ads.vungle.com url reject
[mitm]
hostname = *.gameloft.com,ads.vungle.com,*.unity3d.com,*.applovin.com, web.facebook.com,applovin.com

*************************************/
let obj = {};
let res = JSON["parse"]
(typeof $response != "undefined" &&
    $response.body ||
    null
);

const u3d_ad = /config.json/;
if (u3d_ad.test($request.url) ) {
	let body = res
	if ( body["SRR"] ) {
		for (let ad_item of body["SRR"]["placements"]  ) {
			ad_item["allowSkip"] = true
			ad_item["closeTimerDuration"] = 1
			ad_item["skipInSeconds"] = 1
			ad_item["adFormat"] = "interstitial"
			
			ad_item["disableBackButton"] = false
			ad_item["optOutEnabled"] = true
			ad_item["experimentation"]["admobMednLoadTimeoutInSec"] = "1"
			ad_item["isSkipToAppSheetEnabled"] = false
			ad_item["assetCaching"] = "voluntary"
			ad_item["banner"]["refreshRate"] = 5
			ad_item["enabled"] = false
			
		
		}
		ad_item["msr"] = 1
		ad_item["sto"] = 1000
		ad_item["expo"]["sto"]["value"] = 1000
	}
	
	obj.body = JSON.stringify(body)
	$done(obj);
}

const adnw = /facebook.com\/adnw_sync2/;
if (adnw.test($request.url) ) {
	let body = res
	body["refresh"]["target_refresh_s"] = 10
	body["bundles"]["feature_config"]["data"]["feature_config"]["adnw_android_network_default_connection_timeout_ms"] = 100
	obj.body = JSON.stringify(body)
	$done(obj);
}


// gameloft.com/configs/users/me
const me = /gameloft.com\/configs\/users\/me/;

if (me.test($request.url) ) {
	let body = res
	// console.log("恢复购买?")
	// 删除广告?
	body["game"]["parameters"]["init"]["onboardingGift"] = {}
	// body["game"]["parameters"]["init"]["onboardingGift"]["videoAdsDuration"] = 1
	body["game"]["parameters"]["InventoryAds"]["slotsLeftForNotify"] = {}
	body["game"]["parameters"]["ingameAds"]["slotsLeftForNotify"] = {}
	// 融合点包 ?
	body["game"]["parameters"]["FusionPointPacks"]["enabled"] = true
	// 结算多倍积分范围
	body["game"]["parameters"]["MultiCreditsAdsRewards"] = 
	{
		"MinimumReward":30000,
		"creditsForAdsCap":37500
	}
	// ingameAds
	body["game"]["parameters"]["ingameAds"] = {}
	 
	// 是否车辆升级广告 VehicleUpgradeAds vehicles[1,2,386.....]
	
	let cars = []
	let qu = [40, 43, 141, 208, 380, 381, 331];
	// 320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339
	let qu2 = [];

	for (let i = 1; i <= 393; i++) {
		if (qu.includes(i) || qu2.includes(i)) {
			continue;
		}
		cars.push(i)
	}
	body["game"]["parameters"]["VehicleUpgradeAds"]["vehicles"] = cars
	
	
	// 离线商店 取消隐藏
	for (let item of body["offline_store"]["prices"]) {
	  item["hidden"] = false
	}
	// 在线商店 修改价格
	for (let item of body["iap"]["prices"]) {
	  item["hidden"] = false
	  for ( let item_inner of item["billing_methods"] ) {
		item_inner["price"] = 0.01
	  }
	  
	}
	
	
	
	obj.body = JSON.stringify(body)
	$done(obj);
	

}



const myprofile = /gameloft.com\/profiles\/me\/myprofile/;

if (myprofile.test($request.url) ) {
	let body = res
	// console.log("恢复购买?")
	// 删除违规同步
	delete body["_infractions"];
	if ( body["_adjoe_reward"] ) {
		body["_adjoe_reward"]["data"] = ""
		body["_ad_rewards"]["data"] = ""
		body["_ads_progressive"] = {}
		
		body["_Vip"]["level"] = 15
		body["_Vip"]["initial_points"] = 155
	}
	
	
	
	obj.body = JSON.stringify(body)
	$done(obj);
	
}

const restore = /inapp_crm\/index.php/;

if (restore.test($request.url) ) {
	console.log("恢复购买?")
	console.log($request.body)
	if ( ! /action/.test($request.url)  ) {
		console.log("恢复购买!")
		let obj = [
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
		]
		
		let body = JSON.stringify(obj);
		$done({body})
	}

    $done({res})
}


const authorize = /^https:([\S\s]*?)gameloft.com\/authorize/;

if (authorize.test($request.url)) {
	
    let regex = /username([\S\s]+?)[\&]/;
    let body = $request.body.replace(regex, "username=anonymous%2FOtMyt5EPkvgRcxM%3AdjNjQ3MjEwM1fMT%dr2BkYZ71D&");
    // console.log("改完222 = " + body)
    regex = /password([\S\s]+?)[\&]/;
    body = body.replace(regex, "password=GIHI7x9ofH5q55vJ&");
    // console.log("改完 = " + body)
    $done({body});

}



// sync start
let pre_tle_race = /^https:([\S\s]*?)energy\/pre_tle_race.php/;
if (pre_tle_race.test($request.url)) {


    if ($response === undefined) {
        // console.log("删除request的ETag")
        // delete $request["headers"]["X-RevenueCat-ETag"];
        // delete $request["headers"]["x-revenuecat-etag"];
        // obj["headers"] = $request["headers"]
    } else if (res && res["body"]) {
        let body = res
        // console.log("body 之前 ===" +  JSON.stringify(body))

        // 修改积分 credits_sync
        // body["body"]["credits_sync"]["body"]["credits_spent"] = -1


        // 30天后时间戳
        let timestamp = new Date().getTime();
        timestamp = Math.floor((timestamp + (1000 * 60 * 60 * 24 * 364)) / 1000)

		
		// 删除违规同步 infractions_sync
		body["body"]["infractions_sync"]["body"]["infractions"] = ""


        // 修改增益
        body["body"]["boosters_sync"]["body"]["active"] = {
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
        }

        obj.body = JSON.stringify(body)
    }
    $done(obj);

}


console.log("改: ")
    console.log($request.url)
// sync start  gameloft.com/scripts
const script_g = /^https:([\S\s]*?)gameloft.com\/scripts([\S\s]*?).php/;
const sync = /^https:([\S\s]*?)sync_all.php/;
if (sync.test($request.url) || script_g.test($request.url) ) {

    
    if ($response === undefined) {
        // console.log("删除request的ETag")
        // delete $request["headers"]["X-RevenueCat-ETag"];
        // delete $request["headers"]["x-revenuecat-etag"];
        // obj["headers"] = $request["headers"]
    } else if (res && res["body"]) {
        let body = res
        // console.log("body 之前 ===" +  JSON.stringify(body))

        // 修改积分 credits_sync
        // body["body"]["credits_sync"]["body"]["credits_spent"] = -1


        // 30天后时间戳
        let timestamp = new Date().getTime();
        timestamp = Math.floor((timestamp + (1000 * 60 * 60 * 24 * 364)) / 1000)

        // 添加所有改装为最大 prokits_car_parts_full_sync body cars_parts

        let cars = []

        let cars_parts = {}
        cars_parts["171"] = {
            "tyres": 10,
            "suspension": 10,
            "drive train": 10,
            "exhaust": 10,
            "top_speed": 10,
            "nitro": 10,
            "acceleration": 10,
            "handling": 10,
            "updated_ts": 1712265302
        }


        let moto_ids = [
            // todo 
        ]

        let qu = [40, 43, 141, 208, 380, 381, 331];
        // 320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339
        let qu2 = [];

        for (let i = 1; i <= 393; i++) {
            if (qu.includes(i) || qu2.includes(i)) {
                continue;
            }


            // let ge = i%10 || 10;
            // let shi = Math.floor( (i / 10) % 10 ) || 10;
            // let bai = Math.floor( (i / 100) % 10 ) || 10;
            let ge = 10
            let shi = 10
            let bai = 10


            cars_parts[i + ""] = {
                "tyres": bai,
                "suspension": shi,
                "drive train": ge,
                "exhaust": 10,
                "acceleration": bai,
                "top_speed": shi,
                "handling": ge,
                "nitro": 10,
                "updated_ts": 1712265302
            }
            cars.push(i)
        }
        // cars_parts["308"] = cars_parts["171"]

		if ( sync.test($request.url) || undefined != body["body"]["upgrades_full_sync"] ) {
			body["body"]["upgrades_full_sync"]["body"]["upgrades"] = cars_parts
		}
        
		// 疑似广告
		if ( sync.test($request.url) || undefined != body["body"]["progressive_ads_sync"] ) {
			body["body"]["progressive_ads_sync"]["body"]["duration"] = 372800
		}
        

        // 赋值车辆
		if ( sync.test($request.url) || undefined != body["body"]["server_items_full_sync"] ) {
			body["body"]["server_items_full_sync"]["body"]["cars"] = cars
		}
        
		
		body["body"]["prokits_car_parts_full_sync"] = 
			{
				"body": {
					"cars_parts": cars_parts,
					"up_to_date": false,
					"sync_key": "1712288961"
				}
			}
		
		// 删除违规同步 infractions_sync
		if ( sync.test($request.url) || undefined != body["body"]["infractions_sync"] ) {
			body["body"]["infractions_sync"]["body"]["infractions"] = ""
		}
		


        // 修改增益
		if ( sync.test($request.url) || undefined != body["body"]["boosters_sync"] ) {
			body["body"]["boosters_sync"]["body"]["active"] = {
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
			}
		}
		
		
        // 修改广告
		body["body"]["adjoe_sync"] = {
			"body":{
			// "is_reset":false,
			// "enabled":false,
			// "expire_ts":2712880000,
			// "currency_coefficient":1,
			// "start_ts":2712534400
			}
		}
		body["body"]["vip_full_sync"]["body"]["level"] = 15

        // body["body"]["ad_rewards_status"]["ads_ads_extra_fusion_points_reward"] = 200000
        // let amount = body["body"]["fusion_points_partial_sync"]["body"]["balance"] + 190000
        // body["body"]["fusion_points_partial_sync"]["body"]["balance"] = amount
        // body["body"]["rewards_received"]["ads"][0]["quantity"] = 200000

        // body["subscriber"]["entitlements"] = added["entitlements"]
        // obj = JSON.stringify(body)
        // console.log("body ===" +  body)
    	console.log("修改A8成功!!!")
        obj.body = JSON.stringify(body)
    }
    $done(obj);

}
// ############### sync end 
