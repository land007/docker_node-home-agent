FROM land007/ubuntu-node-min:latest

MAINTAINER Yiqiu Jia <yiqiujia@hotmail.com>

RUN rm /node_/node_modules
ADD node/package.json /node_/package.json
RUN cd /node_ && npm install
#ADD node/server.js /node_/server.js
#ADD node/home-agent.js /node_/home-agent.js
ADD node/home-agent-k2p.js /node_/server.js
ADD node/unite.js /node_/unite.js
#ADD node/start.sh /start.sh
#RUN chmod +x /start.sh

ENV PIPEMAX=20\
	PAGEMAX=8\
	SUBTRACTDAYS=1\
#	CRON="30 1 1 * * *"\
	TIMER=30\
	MAXTIME=40\
	DbHost=0.0.0.0\
	DbPort=3306\
	DbUsername=root\
	DbPassword=\
	Database=test


#RUN echo "/check.sh /node" >> /start.sh
#date 需处理
#加一个自增序号
#日志需处理
#任务需处理

#> docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/node-home-agent --push .
#docker build -t land007/node-home-agent:latest .
#docker run -it --rm -e "TIMER=10" -e "MAXTIME=1" land007/node-home-agent:latest
#docker run -it --restart always --privileged -v ~/docker/node-home-agent:/node -e "TIMER=30" -e "MAXTIME=40" land007/node-home-agent:latest
#docker rm -f node-home-agent ; docker run -it --privileged -v ~/docker/ubuntu-node:/node -p 80:80 --name node-home-agent land007/node-home-agent:latest
#docker rm -f node-home-agent && docker run -it --privileged -v c:/Users/jiayq/docker/node-home-agent:/node -p 80:80 -e "DbHost=rm-2zew3g96vzbn5648cqo.mysql.rds.aliyuncs.com" -e "DbPort=3306" -e "DbUsername=psc" -e "DbPassword=psc2019%" -e "Database=pscdb" --name node-home-agent --log-opt max-size=1m --log-opt max-file=1 land007/node-home-agent:latest
#docker rm -f node-home-agent && docker run -it --privileged -v c:/Users/jiayq/docker/node-home-agent:/node -p 80:80 -e "DbHost=172.17.0.1" -e "DbPort=3306" -e "DbUsername=root" -e "DbPassword=1234567" -e "Database=pscdb" --name node-home-agent --log-opt max-size=1m --log-opt max-file=1 land007/node-home-agent:latest
#docker rm -f node-home-agent ; rm -rf ~/docker/node-home-agent ; docker run -it --privileged -v ~/docker/node-home-agent:/node -p 1080:80 -e "DbHost=rm-2zew3g96vzbn5648c.mysql.rds.aliyuncs.com" -e "DbPort=3306" -e "DbUsername=psc" -e "DbPassword=psc2019%" -e "Database=pscdb" --name node-home-agent --log-opt max-size=1m --log-opt max-file=1 land007/node-home-agent:latest
#docker kill watchtower ; docker rm watchtower ; docker run -d --name watchtower -v /var/run/docker.sock:/var/run/docker.sock -v ~/.docker/config.json:/config.json v2tec/watchtower --interval 30 --label-enable
#docker pull land007/node-home-agent:latest; rm -rf ~/docker/node-home-agent; docker rm -f node-home-agent ; docker run -it --privileged --label=com.centurylinklabs.watchtower.enable=true -v ~/docker/node-home-agent:/node -p 1080:80 -e "DbHost=rm-2zew3g96vzbn5648c.mysql.rds.aliyuncs.com" -e "DbPort=3306" -e "DbUsername=psc" -e "DbPassword=psc2019%" -e "Database=pscdb" -e "PIPEMAX=5" -e "PAGEMAX=20" --name node-home-agent --log-opt max-size=1m --log-opt max-file=1 land007/node-home-agent:latest
