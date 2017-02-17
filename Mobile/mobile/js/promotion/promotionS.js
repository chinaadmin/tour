angular.module('app.services', [])
.factory('httpRequest', function($http) {
	var param = function(obj) {
		var query = '',
			name, value, fullSubName, subName, subValue, innerObj, i;

		for (name in obj) {
			value = obj[name];

			if (value instanceof Array) {
				for (i = 0; i < value.length; ++i) {
					subValue = value[i];
					fullSubName = name + '[' + i + ']';
					innerObj = {};
					innerObj[fullSubName] = subValue;
					query += param(innerObj) + '&';
				}
			} else if (value instanceof Object) {
				for (subName in value) {
					subValue = value[subName];
					fullSubName = name + '[' + subName + ']';
					innerObj = {};
					innerObj[fullSubName] = subValue;
					query += param(innerObj) + '&';
				}
			} else if (value !== undefined && value !== null)
				query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
		}

		return query.length ? query.substr(0, query.length - 1) : query;
	};
	return {
		post: function(url, data) {
			var config = {
				"headers": {
					"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
				}
			}
			var data =  angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
			var http = $http.post.apply($http, [url, data, config])
			return http ;
		}
	}
})


.factory('promotionS', function(httpRequest){
	return {
		user:function (data,callback) {
			httpRequest.post(interfaceURL.user.infomation,data).success(function (data) {
				callback&&callback(data)				
			})
		},
		changeUsername:function(data,callback) {
			httpRequest.post(interfaceURL.user.updName,data).success(function (data) {
				callback&&callback(data)				
			})
		},
		updatePassword:function (data,callback) {
			var  url = interfaceURL.user.updPassword;
			if (!data["oldPass"]) {
				url = interfaceURL.user.recPassword;
			};
			httpRequest.post(url,data).success(function (data) {
				callback&&callback(data)				
			})
		},
		i:function (data,callback) {
			httpRequest.post(interfaceURL.user.i,data).success(function (data) {
				callback&&callback(data)				
			})
		},
		getPromotions:function (data,callback) {
			httpRequest.post(interfaceURL.promotion.getPromotions,data).success(function (data) {
				callback&&callback(data)				
			})
		},
		submitData:function (data,callback) {
			httpRequest.post(interfaceURL.promotion.submitData,data).success(function (data) {
				callback&&callback(data)				
			})
		},
		UpgradeMember:function (data,callback) {
			httpRequest.post(interfaceURL.promotion.UpgradeMember,data).success(function (data) {
				callback&&callback(data)				
			})
		},
		getSuccess:function (data,callback) {
			httpRequest.post(interfaceURL.promotion.getSuccess,data).success(function (data) {
				callback&&callback(data)				
			})
		},
		mauth:function (data,callback,fail) {
			httpRequest.post(interfaceURL.wechat.mauth,data).success(function (data) {
				if (data.resCode) {
					callback&&callback(data)	
				}else{
					fail&&fail()
				}							
			}).error(function() {
				fail&&fail()
			});
		},
		wxsdk:function (data,callback) {
			httpRequest.post(interfaceURL.wechat.sdk,data).success(function (data) {
				callback&&callback(data)				
			})
		},
		oauth:function (data,callback) {
			httpRequest.post(interfaceURL.wechat.oauth,data).success(function (data) {
				callback&&callback(data)				
			})
		},
		updAvatar:function (data,callback) {
			httpRequest.post(interfaceURL.user.updAvatar,data).success(function (data) {
				callback&&callback(data)				
			})
		},
		getCard:function (data,callback) {
			httpRequest.post(interfaceURL.promotion.getCard,data).success(function (data) {
				callback&&callback(data)				
			})
		}
	}
})

