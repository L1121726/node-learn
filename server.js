// 内置的HTTP模块提供了HTTP服务
var http = require('http');
var fs = require('fs');
// 内置的path模块，提供与文件系统路径相关的功能
var path = require('path');
// 附加的mime模块有根据文件扩展名得出MIME类型的能力
var mime = require('mime');
// 用来缓存文件内容的对象
var cache = {};

// 错误响应
function send404( response ){
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found');
    response.end();
}

// 发送文件数据
function sendFile(response, filePath, fileContents){
    response.writeHead(
        200,
        {'Content-Type': mime.lookup(path.basename(filePath))}
    );
    response.write(fileContents);
    response.end();
}

// 提供静态文件服务
function serveStatic(response, cache, absPath){
    if(cache[absPath]){
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function(exists){    // 检测文件是否存在
            if(exists){
                fs.readFile(absPath, function(err, data){
                    if(err){
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                send404(response);
            }
        })
    }
}

// 创建HTTP服务器
var server = http.createServer(function(request, response){
    var filePath = false;

    if(request.url == '/'){
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;
    }

    var absPath = './' + filePath;

    serveStatic(response, cache, absPath);
});

server.listen(3000, function(){
    console.log("Server listening on port 3000.");
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);

