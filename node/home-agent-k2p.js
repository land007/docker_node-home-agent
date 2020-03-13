const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const EventProxy = require('eventproxy');
const Bagpipe = require('bagpipe');
const { promisify } = require('util');
const statAsync = promisify(fs.stat);
const schedule = require('node-schedule');
const moment = require('moment');
const readFile = (fileName) => promisify(fs.readFile)(fileName, 'utf8');
const unite = require('./unite');
const querystring = require('querystring');

const PipeMax = process.env['PIPEMAX'] || '20';// 同时任务数
const PageMax = process.env['PAGEMAX'] || '8';// 最大页数

const timer = parseInt(process.env['TIMER'] || '10');//秒钟
const Cron = '*/' + timer + ' * * * * *';//每30秒触发
const maxTime = parseInt(process.env['MAXTIME'] || '1') * 60;//分钟

//需修改字符
const ip_list = [
		{
			name: 'huawei',
			ip: '192.168.6.27',
			count: 0,
			maxCount: 10,
			time: 0,
			maxTime: maxTime,
			reduceTime: 4 * timer,
			exceed: false
		},
		{
			name: 'iphone 77',
			ip: '192.168.6.66',
			count: 0,
			maxCount: 5,
			time: 0,
			maxTime: maxTime,
			reduceTime: 4 * timer,
			exceed: false
		},
		{
			name: 'ipad',
			ip: '192.168.6.231',
			count: 0,
			maxCount: 5,
			time: 0,
			maxTime: maxTime,
			reduceTime: 4 * timer,
			exceed: false
		},
		{
			name: 'mi box',
			ip: '192.168.6.14',
			count: 0,
			maxCount: 10,
			time: 0,
			maxTime: maxTime,
			reduceTime: 4 * timer,
			exceed: false
		}
	];
var start_apply_ip_list = [];
//start_apply_ip_list = [
//		{
//			ip: '192.168.6.27',
//			exceed: true
//		},
//		{
//			ip: '192.168.6.28',
//			exceed: false
//		}
//	];
for(let i in ip_list) {
	start_apply_ip_list[i] = {
			ip: ip_list[i].ip,
			exceed: !ip_list[i].exceed//保证第一次重置
		};
}
var del_list_s = ['0', '1', '2'];
//del_list_s = ['0', '1', '2'];
for(let i in ip_list) {
	del_list_s[i] = i;
}


const post_method = 'formData';// multipart/form-data
//const post_method = 'form';// application/x-www-form-urlencoded
const bagpipe = new Bagpipe(parseInt(PipeMax));
const ep = new EventProxy();

const _proxy_request = function(options, callback) {
	request(options, callback);
};

const proxy_request = function(options) {
	return new Promise(
			function(resolve, reject) {
				_proxy_request(options, function(error, response, body) {
					if (error)
						console.log(error);
					//console.log(body);
					resolve(body);
				});
			});
};

var get_connections_status = function() {
	return new Promise(function(resolve, reject) {
		let options = {
			method: 'GET',
//			jar: true,
			uri: 'http://192.168.1.231:18080/Main_CTStatus_Content.asp',
			headers: {
				'accept': 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
//					'accept-encoding': 'gzip, deflate',
				'accept-encoding': 'deflate',
				'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
				'Authorization': 'Basic bGFuZDAwNzo0MTk3MTg=',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36',
			}
		};
		_proxy_request(options, function(error, response, body) {
			if(error) {
				console.log('error', error);
				reject(error);
				return;
			}
			try {
//				console.log('login.headers', response.headers);
				let json = [];
//				console.log('login.body', body);
				let key = 'to   Source Address & Port                           Destination Address & Port';
				let run = body.substring(body.indexOf(key) + key.length, body.length);
				run = run.substring(0, run.indexOf('</textarea>'));
//				console.log('run', run);
				let runs = run.split('\n');
				for(let ii in runs) {
					if(runs[ii].length > 1) {
//						console.log('runs[ii]', runs[ii]);
						let runss = runs[ii].split(/(^\s+)|(\s+$)|\s+/g);
//						console.log('runss', runss);
						json[json.length] = { bytes: '', src: runss[3].split(':')[0], sport: runss[3].split(':')[1], layer4: runss[0], dst: runss[6].split(':')[0], dport: runss[6].split(':')[1], layer3: 'ipv4', packets: '1' };
					}
				}
				resolve(json);
			} catch(e) {
				reject(e);
			}
		});
	});
};

var add_start_apply = function(ip) {
	return new Promise(function(resolve, reject) {
		let form = {
			current_page: 'Advanced_Firewall_Content.asp',
			next_page: '',
			next_host: '192.168.1.231:18080',
			sid_list: 'FirewallConfig;',
			group_id: 'LWFilterList',
			action_mode: '+Add+',//'+Del+'
			action_script: '',
			filter_lw_date_x: '1111111',
			filter_lw_time_x: '00002359',
			filter_lw_num_x_0: '0',//'2'
			fw_lw_enable_x: '1',
			filter_lw_default_x: 'ACCEPT',
			filter_lw_date_x_Mon: 'on',
			filter_lw_date_x_Tue: 'on',
			filter_lw_date_x_Wed: 'on',
			filter_lw_date_x_Thu: 'on',
			filter_lw_date_x_Fri: 'on',
			filter_lw_date_x_Sat: 'on',
			filter_lw_date_x_Sun: 'on',
			filter_lw_time_x_starthour: '00',
			filter_lw_time_x_startmin: '00',
			filter_lw_time_x_endhour: '23',
			filter_lw_time_x_endmin: '59',
			filter_lw_icmp_x: '',
			LWKnownApps: 'User+Defined',
			filter_lw_srcip_x_0: ip,//'192.168.6.28',//''
			filter_lw_srcport_x_0: '1:65534',//''
			filter_lw_dstip_x_0: '*.*.*.*',//''
			filter_lw_dstport_x_0: '1:65534',//''
			filter_lw_proto_x_0: 'TCP',
			//LWFilterList_s: '0',
			//LWFilterList_s: '1',
			//LWFilterList_s: '2',
			//LWFilterList: '',
			LWFilterList2: ''
		};
		let formData = querystring.stringify(form);
		formData = formData.replace(/%2B/g,'+');
		console.log('formData =', formData);
		let contentLength = formData.length;
		console.log('contentLength =', contentLength);
		let options = {
			method: 'POST',
			//jar: true,
			uri: 'http://192.168.1.231:18080/start_apply.htm',
			headers: {
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
//					'accept-encoding': 'gzip, deflate',
				'accept-encoding': 'deflate',
				'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
				'Authorization': 'Basic bGFuZDAwNzo0MTk3MTg=',
				'Content-Length': contentLength,
			    'Content-Type': 'application/x-www-form-urlencoded',
				'Origin': 'http://192.168.1.231:18080',
				'Referer': 'http://192.168.1.231:18080/Advanced_Firewall_Content.asp',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36',
			},
			body: formData
		};
		_proxy_request(options, function(error, response, body) {
//				console.log('login.headers', response.headers);
			if(error) {
				console.log('error', error);
				reject(error);
				return;
			}
			//console.log('login.body', body);
			resolve();
		});
	});
};

var del_start_apply = function() {
	return new Promise(function(resolve, reject) {
		let form = {
			current_page: 'Advanced_Firewall_Content.asp',
			next_page: '',
			next_host: '192.168.1.231:18080',
			sid_list: 'FirewallConfig;',
			group_id: 'LWFilterList',
			action_mode: '+Del+',
			action_script: '',
			filter_lw_date_x: '1111111',
			filter_lw_time_x: '00002359',
			filter_lw_num_x_0: del_list_s.length,
			fw_lw_enable_x: '1',
			filter_lw_default_x: 'ACCEPT',
			filter_lw_date_x_Mon: 'on',
			filter_lw_date_x_Tue: 'on',
			filter_lw_date_x_Wed: 'on',
			filter_lw_date_x_Thu: 'on',
			filter_lw_date_x_Fri: 'on',
			filter_lw_date_x_Sat: 'on',
			filter_lw_date_x_Sun: 'on',
			filter_lw_time_x_starthour: '00',
			filter_lw_time_x_startmin: '00',
			filter_lw_time_x_endhour: '23',
			filter_lw_time_x_endmin: '59',
			filter_lw_icmp_x: '',
			LWKnownApps: 'User+Defined',
			filter_lw_srcip_x_0: '192.168.6.28',//''
			filter_lw_srcport_x_0: '1:65534',//''
			filter_lw_dstip_x_0: '*.*.*.*',//''
			filter_lw_dstport_x_0: '1:65534',//''
			filter_lw_proto_x_0: 'TCP',
			LWFilterList_s: del_list_s,
			LWFilterList: '',
		};
		let formData = querystring.stringify(form);
		formData = formData.replace(/%2B/g,'+');
		console.log('formData =', formData);
		let contentLength = formData.length;
		console.log('contentLength =', contentLength);
		let options = {
			method: 'POST',
			//jar: true,
			uri: 'http://192.168.1.231:18080/start_apply.htm',
			headers: {
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
//					'accept-encoding': 'gzip, deflate',
				'accept-encoding': 'deflate',
				'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
				'Authorization': 'Basic bGFuZDAwNzo0MTk3MTg=',
				'Content-Length': contentLength,
			    'Content-Type': 'application/x-www-form-urlencoded',
				'Origin': 'http://192.168.1.231:18080',
				'Referer': 'http://192.168.1.231:18080/Advanced_Firewall_Content.asp',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36',
			},
			body: formData
		};
		_proxy_request(options, function(error, response, body) {
//				console.log('login.headers', response.headers);
			if(error) {
				console.log('error', error);
				reject(error);
				return;
			}
			//console.log('login.body', body);
			resolve();
			
		});
	});
};

var accept_start_apply = function(num) {
	return new Promise(function(resolve, reject) {
		let form = {
			current_page: '/Advanced_Firewall_Content.asp',
			next_page: '',
			next_host: '192.168.1.231:18080',
			sid_list: 'FirewallConfig;',
			group_id: 'LWFilterList',
			action_mode: '+Restart+',
			action_script: '',
			filter_lw_date_x: '1111111',
			filter_lw_time_x: '00002359',
			filter_lw_num_x_0: num,//'12',
			fw_lw_enable_x: '1',
			filter_lw_default_x: 'ACCEPT',
			filter_lw_date_x_Mon: 'on',
			filter_lw_date_x_Tue: 'on',
			filter_lw_date_x_Wed: 'on',
			filter_lw_date_x_Thu: 'on',
			filter_lw_date_x_Fri: 'on',
			filter_lw_date_x_Sat: 'on',
			filter_lw_date_x_Sun: 'on',
			filter_lw_time_x_starthour: '00',
			filter_lw_time_x_startmin: '00',
			filter_lw_time_x_endhour: '23',
			filter_lw_time_x_endmin: '59',
			filter_lw_icmp_x: '',
			LWKnownApps: 'User+Defined',
			filter_lw_srcip_x_0: '',
			filter_lw_srcport_x_0: '',
			filter_lw_dstip_x_0: '',
			filter_lw_dstport_x_0: '',
			filter_lw_proto_x_0: 'TCP'
		};
		let formData = querystring.stringify(form);
		formData = formData.replace(/%2B/g,'+');
		console.log('formData =', formData);
		let contentLength = formData.length;
		console.log('contentLength =', contentLength);
		let options = {
			method: 'POST',
			//jar: true,
			uri: 'http://192.168.1.231:18080/start_apply.htm',
			headers: {
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
//					'accept-encoding': 'gzip, deflate',
				'accept-encoding': 'deflate',
				'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
				'Authorization': 'Basic bGFuZDAwNzo0MTk3MTg=',
				'Content-Length': contentLength,
			    'Content-Type': 'application/x-www-form-urlencoded',
				'Origin': 'http://192.168.1.231:18080',
				'Referer': 'http://192.168.1.231:18080/Advanced_Firewall_Content.asp',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36',
			},
			body: formData
		};
		_proxy_request(options, function(error, response, body) {
//				console.log('login.headers', response.headers);
			if(error) {
				console.log('error', error);
				reject(error);
				return;
			}
			//console.log('login.body', body);
			resolve();
			
		});
	});
};

var start = async function() {
	console.log('start1');
	try {
//		var content = await add_start_apply('192.168.6.127');
//		var content = await add_start_apply('192.168.6.127');
//		var content = await add_start_apply('192.168.6.127');
//		var content = await add_start_apply('192.168.6.127');
//		var content = await add_start_apply('192.168.6.127');
//		var content = await add_start_apply('192.168.6.127');
		
		let connections = await get_connections_status();
		console.log('connections.length', connections.length);
		for(let i in ip_list) {
			ip_list[i].count = 0;//归零
			for(let c in connections) {
				if(connections[c].src == ip_list[i].ip || connections[c].dst == ip_list[i].ip) {
//					console.log(connections[c]);
					ip_list[i].count++;
				}
			}
		}
//		console.log(ip_list);
		for(let i in ip_list) {
			if(ip_list[i].count > ip_list[i].maxCount) {
				ip_list[i].time = ip_list[i].time + timer;
				if(ip_list[i].time > ip_list[i].maxTime) {
					//时间上限
					ip_list[i].time = ip_list[i].maxTime;
					//断网
					if(!ip_list[i].exceed) {
						ip_list[i].exceed = true;
					}
				}
			} else {
				ip_list[i].time = ip_list[i].time - ip_list[i].reduceTime;
				//时间下限
				if(ip_list[i].time <= 0) {
					ip_list[i].time = 0;
				}
				//解除断网
				if(ip_list[i].exceed && ip_list[i].time == 0) {
					ip_list[i].exceed = false;
				}
			}
		}
		console.log(ip_list);
		//跟上次比较
		let apply = false;
		for(let i in ip_list) {
			if(ip_list[i].exceed != start_apply_ip_list[i].exceed) {
				start_apply_ip_list[i].exceed = ip_list[i].exceed;
				apply = true;
			}
		}
		if(apply) {
			console.log('删除所有');
			//删除所有
			var content = await del_start_apply();
			//添加断网
			let num = 0;
			for(let i in ip_list) {
				if(ip_list[i].exceed) {
					console.log('添加断网', ip_list[i].ip);
					var content = await add_start_apply(ip_list[i].ip);
					num++;
				}
			}
			console.log('生效');
			//生效
			var content = await accept_start_apply(num);
		}
	} catch(e) {
		console.log('rrrrr', e);
	}
};

start();

var scheduleCronstyle = function() {
    schedule.scheduleJob(Cron, ()=>{
        console.log('scheduleCronstyle:', moment().format('LLL'));
        start();
    }); 
}

scheduleCronstyle();

module.exports = {start};


