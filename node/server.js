const http = require("http"), url = require("url"), path = require("path"), normalize = path.normalize, join = path.join, sep = path.sep, querystring = require('querystring');
const home_agent_k2p = require('./home_agent_k2p.js');

const hostname = '0.0.0.0';
const port = 80;

const get_client_ip = function(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if(ip.split(',').length>0){
        ip = ip.split(',')[0]
    }
    ip = ip.substr(ip.lastIndexOf(':')+1,ip.length);
    console.log("ip:"+ip);
    return ip;  
};

const server = http.createServer(async (req, res) => {
	res.writeHead(200, {
		"Content-Type" : "text/javascript",
		"Cache-Control" : "no-store, no-cache, must-revalidate",
		"Pragma" : "no-cache",
		"Access-Control-Allow-Origin" : "*",
		"Access-Control-Allow-Headers" : "Content-Type,Content-Length, Authorization, Accept,X-Requested-With",
		"Access-Control-Allow-Methods" : "PUT,POST,GET,DELETE,OPTIONS",
	});
	try {
		var pathname = url.parse(req.url).pathname;
		console.log('pathname', pathname);
		if(pathname == '/time.json') {// http://127.0.0.1/time.json?ip=192.168.6.66
			var arg = url.parse(req.url).query;
			var ip = querystring.parse(arg).ip || get_client_ip(req) || '';
			var ip_obj = home_agent_k2p.get_ip_obj(ip);
			res.end(JSON.stringify(ip_obj, null, 4));
		} else if(pathname == '/reset.json') {// http://127.0.0.1/reset.json?ip=192.168.6.66
			var arg = url.parse(req.url).query;
			var ip = querystring.parse(arg).ip || get_client_ip(req) || '';
			var ip_obj = home_agent_k2p.application_delay(ip);
			res.end(JSON.stringify(ip_obj, null, 4));
		} else {
			res.statusCode = 404;
//			res.setHeader('Content-Type', 'text/plain');
			res.end('Not find');
		}
	} catch(e) {
		res.statusCode = 500;
//		res.setHeader('Content-Type', 'text/plain');
		res.end('Server err');
	}
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});