var express = require('express');
var router = express.Router();

var request = require('request');
var cheerio = require('cheerio');

var __clearURL = /([^:])\/\//g;
function clearURL(url){
  return url.replace(__clearURL,'$1/');
}
router.get('/detail',function(req, res, next){
  var output = { title: '看新聞' };
  
  var source = req.query.url || "";
  output['source'] = clearURL(source);
  
  var userAgent = req.get('User-Agent');
  output['userAgent'] = userAgent;
  
  if(source != ""){
    
    var options = {
      'url': source,
      'headers': {
        'User-Agent': userAgent
      }
    };
    
    request(options,function(error, response, body){
      if (!error && response.statusCode == 200) {      
        try {
          var $ = cheerio.load(body);
          var article_title = $('header h2').text();
          var article_body = $('.nm-article-body .text').text();
          
          var arts = [];
          var texts = article_body.split('\n');
          for(var i=0;i<texts.length;i++){
            if(texts[i].trim().length > 0){
              arts.push(texts[i].trim());
            } 
          }
          
          output['article_title'] = article_title;
          output['article_body'] = arts.join("<br>\n");
          
        } catch(ex){
          console.error(ex);
        }
      }
      res.render('news_detail', output);
    });
    
  } else {
    res.render('news_detail', output);
  }
});

router.get('/', function(req, res, next) {
  var output = { title: '看新聞' };
  
  var userAgent = req.get('User-Agent');
  output['userAgent'] = userAgent;
  
  var source = req.query.url || "http://m.appledaily.com.tw/realtimenews/section/new";
  output['source'] = clearURL(source);
  
  var options = {
    'url': source,
    'headers': {
      'User-Agent': userAgent
    }
  };
  
  var nowStamp = new Date();
  options['url'] = options['url'] + "?_=" + nowStamp.getTime();
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {      
      try {
        var $ = cheerio.load(body);
        var artTitles = $('.art.type-1 a');
        var count = artTitles.length;
        
        output['count'] = count;
        output['artTitles'] = [];
        
        for(var i=0;i <count;i++){
          var href = artTitles.eq(i).attr("href");
          href = href.replace('http://m.appledaily.com.tw/','');
          href = "http://m.appledaily.com.tw/" + href;
          
          var title = artTitles.eq(i).find('.art-title .art-title-text').text();
          var time = artTitles.eq(i).find('.art-stats .time').text();
          
          output['artTitles'].push({
            'title':title,
            'time':time,
            'href':"/news/detail?url=" + clearURL(href)
          });
        }
        
        var categories = $('.ico.ico-time .sub-list a.sub');
        output['categories'] = [];
        for(var j = 0;j < categories.length;j++){
          var category = categories.eq(j);//<a class="sub" href="/realtimenews/section/new"><span>最新</span></a>
          var href = category.attr("href").replace("http://m.appledaily.com.tw/","");
          href = "http://m.appledaily.com.tw/" + href;
          
          var title = category.text().trim();
          output['categories'].push({
            'title':title,
            'href':"/news?url=" + clearURL(href)
          });
        }
      } catch(ex){
        console.error(ex);
      }
    }
    res.render('news', output);
  });
});

module.exports = router;
