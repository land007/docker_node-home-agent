
const get_ip_list = function(maxTime, timer) {
	var ip_list = [
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
	return ip_list;
};
module.exports = {get_ip_list};