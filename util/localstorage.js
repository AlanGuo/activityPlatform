var localStorageUtil = {

  jscount:0,
  csscount:0,

  updateLocalStorage:function(obj,needtoload){
    if(obj.ext === 'js'){
      if(needtoload){
        localStorageUtil.jscount++;
      }
      //js
      localStorageUtil.loadScript(obj,function(){
          if(window[obj.file]){
            //window[obj.file]();
            var content = /^function\s*?\(\)\s*?\{([\s\S]*)\}$/i.exec(window[obj.file].toString())[1];

            var pInfo = {
              'v':obj.v,
              'content':content,
              'ext':obj.ext
            };
            try{
              localStorage.setItem(obj.file, JSON.stringify(pInfo));
          }
          catch(e){}
            //window.alert('缓存更新成功！'+obj.file);

            //回调
            if(localStorageUtil.jscount>0){
              --localStorageUtil.jscount;
              if(needtoload){
                localStorageUtil.start();
              }
            }
          }
      },function(){
          if(localStorageUtil.jscount>0){
            --localStorageUtil.jscount;
            if(needtoload){
              localStorageUtil.start();
            }
          }
      });
    }
    else if(obj.ext === 'css'){
      if(needtoload){
        localStorageUtil.csscount++;
        //插入从cdn拉取样式
        var link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        var urlArray = obj.file.split('/').slice(-1)[0].split('.');
        if(obj.v){
          urlArray.splice(urlArray.length-1,0,obj.v);
        }
        link.setAttribute('href', obj.cdn+urlArray.join('.'));
        link.id = obj.file;
        document.head.appendChild(link);

        //window.alert('link拉取cdn样式');
        //加载
        link.onload = link.onerror = function(evt){
          //window.alert('样式拉取成功');
          if(localStorageUtil.csscount>0){
            --localStorageUtil.csscount;
            if(needtoload){
              //window.alert('start');
              localStorageUtil.start();
            }
          }
        }
      }
      //从本域拉取css用于本地缓存
      localStorageUtil.loadCSS(obj, function(content){
        //头部创建style标签
        var style = document.getElementById(obj.file);

        if(style){
          if(/style/i.test(style.tagName)){
            style.innerHTML = content;
          }
        }
        else{
          style = document.createElement('style');
          style.id = obj.file;
          style.innerHTML = content;
          document.head.appendChild(style);
        }      

        var pInfo = {
          'v':obj.v,
          'content':content,
          'ext':obj.ext
        };
        try{
          localStorage.setItem(obj.file,JSON.stringify(pInfo));
      }
      catch(e){}

        if(localStorageUtil.csscount>0){
          --localStorageUtil.csscount;
          if(needtoload){
            localStorageUtil.start();
          }
        }
      },function(){

        if(localStorageUtil.csscount>0){
          --localStorageUtil.csscount;
          if(needtoload){
            localStorageUtil.start();
          }
        }
      });
    }
  },

  loadCSS:function(obj, onload, onerror){
    //使用xhr拉取同域css
    var xhr = new XMLHttpRequest();
    var urlArray = obj.file.split('.');
    if(obj.v){
      urlArray.splice(urlArray.length-1,0,obj.v);
    }
    xhr.open('GET',urlArray.join('.'), true);
    xhr.onload = function(){
      onload && onload(xhr.responseText);
    };
    xhr.onerror = function(){
      onerror && onerror(xhr);
    };

    xhr.send();
  },

  loadScript:function(obj,onload,onerror){
    var script = document.createElement('script');
    script.type = "text\/javascript";
    //拼url
    var urlArray = obj.file.split('.');

    if(obj.v){
      urlArray.splice(urlArray.length-1,0,obj.v);
    }
    
    script.src = urlArray.join('.')+'?forls';
  
    script.onload = function(evt){
      onload && onload(evt);
      document.body.removeChild(evt.target);
    }
    script.onerror = function(evt){
      onerror && onerror(evt);
      document.body.removeChild(evt.target);
    }

    document.body.appendChild(script);
  },

  start:function(){
    if(localStorageUtil.jscount===0) {
        //统一解析javascript
        for(var p in window.versions){
          if(window.versions[p].ext === 'js'){
          if(window[p]){
            //网络拉取
            window[p]();
          }
          else{
            //localstorage
            var pInfo = null;
            try{
              localStorage.getItem(p);
            }
            catch(e){}
            if(pInfo){
              pInfo = JSON.parse(pInfo);
              if(!window.versions[p].loaded){
                new Function(pInfo.content)();
              }
          }
          }
        }
      }
      if(localStorageUtil.csscount===0){
        window.onlsload && window.onlsload();
      }
    }
  }
}

var delayToParse = false;

for(var p in window.versions){
  //清空本地存储
  // if(/css/i.test(p)){
  //   localStorage.removeItem(p);
  // }

  var pInfo = null;
  try{
    pInfo = localStorage.getItem(p);
  }
  catch(e){}

  var forceUpdate = false;

  if(!pInfo){

      //如果没有本地存储的内容, 从网络请求资源
      delayToParse = true;
      //一旦有js从网络拉取，就停止对剩余js的解析
      localStorageUtil.updateLocalStorage({file:p,v:window.versions[p].v,ext:window.versions[p].ext,cdn:window.versions[p].cdn},true);
  }
  else{
    pInfo = JSON.parse(pInfo);

    if(pInfo.ext === 'js' && !delayToParse){
      //解析javascript，检测是否有解析出错的脚本
      try{
        if(pInfo.content){
          new Function(pInfo.content)();
          //已经解析过
          window.versions[p].loaded = true;
        }else{
          forceUpdate = true;
        }
      }
      catch(e){
        forceUpdate = true;
        console.log(e);
      }
    }
    else if(pInfo.ext === 'css'){
      //window.alert('解析css');
      //解析css
      try{
        if(pInfo.content){
          var style = document.createElement('style');
          style.id = p;
          style.innerHTML = pInfo.content;
          document.head.appendChild(style);
        }else{
          forceUpdate = true;
        }
      }
      catch(e){
        forceUpdate = true;
        console.log(e);
      }
    }

    if(forceUpdate || (pInfo.v !== window.versions[p].v)){
      //需要更新localstorage
      //强制更新脚本时候，重新启动app
      //window.alert('准备更新缓存！'+p);
      if(forceUpdate){
        delayToParse = true;
      }
      localStorageUtil.updateLocalStorage({file:p,v:window.versions[p].v,ext:window.versions[p].ext,cdn:window.versions[p].cdn},forceUpdate);
    }
  }
}

//window.alert('命中缓存!');
//开始程序
localStorageUtil.start();