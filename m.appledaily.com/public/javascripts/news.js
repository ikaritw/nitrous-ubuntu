var $news_detail = $('#news_detail');
$(function(){
  /*news*/
  $('.article li>a').on('click',function(){
    //用iframe開啟
    $news_detail.attr('src',$(this).attr('href'));
    event.preventDefault();
    return false;
  });
});