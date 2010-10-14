function deleteItem(item){
  if(!localStorage.removeItem(keyOf(item))){
    item.remove();
  }
  getOrder(item.parents('ul'));
}

function editItem(item){
  var value = item.children().html();
  item.html('<textarea maxlength="140"; resize: none; placeholder="Type here..."; id="currentEdit" />');
  $('#currentEdit').val(value).focus();
  $('#currentEdit').blur(function(){
    resetAfterEdit(item);
    return false;
  })
  .keydown(function(event){
    var self = $(this);
    var keycode = event.keyCode;
    if (keycode=='13'){
      if (self.val()!==''){
        localStorage.setItem(keyOf(item),self.val());
      } resetAfterEdit(item);
      return false;
    }
    if (keycode=='27'){
      storedValue = localStorage.getItem(keyOf(item));
      if (storedValue!=self.val()){
        self.val(storedValue);
        
      }
      resetAfterEdit(item);
      return false;
    }
  });
//$('#currentEdit').keydown(
}

function resetAfterEdit(item){
  newValue = item.children('#currentEdit').val();
  var itemContent = document.createElement('span');
  $(itemContent).html(newValue).addClass('text');
  $(item).html(itemContent);

  var itemDelete = document.createElement('span');
  $(itemDelete).addClass("ui-icon ui-icon-closethick li-delete").html("delete");

  $(itemDelete).click(function(){
    deleteItem($(this).parents('li'));
  });
  $(item).append(itemDelete);
  item.one('dblclick',function(){
    editItem($(this));
  });
}

function keyOf(item){
  return '5ive.'+item.parent('ul.list').attr('id')+'.'+item.attr('id');
}

function appendValue(key) {
  listID = key.split('.')[1];
  list = $('ul#'+listID);
  ID = key.split('.')[2];
  
  var listItem = document.createElement('li');
  $(listItem).attr({
    style: 'cursor: move',
    id: ID
  });
  (listID=='todo')?
  $(listItem).addClass('entry ui-state-default ui-priority-primary'):
  $(listItem).addClass('entry ui-state-default ui-priority-secondary');
  $(listItem).hover(
    function(){
      $(this).addClass("ui-state-hover");
    },
    function(){
      $(this).removeClass("ui-state-hover");
    }
    );

  var itemContent = document.createElement('span');
  $(itemContent).html(localStorage.getItem(key)).addClass('text');
  $(listItem).html(itemContent);

  var itemDelete = document.createElement('span');  
  $(itemDelete).addClass("ui-icon ui-icon-closethick li-delete").html("delete");

  $(itemDelete).click(function(){
    deleteItem($(this).parents('li'));
  });
  $(listItem).append(itemDelete).addClass('ui-corner-all');
  
  $(listItem).one('dblclick',function(){
    editItem($(this));
  });
  list.append(listItem);
}
 
function buildLists() {
  $('.list').each(function(){
    newList = [];
    listID = $(this).attr('id');
    var notSorted = arrayOf(listID);
    $(this).empty();
    sortedList = localStorage.getItem('5ive.order.'+listID);
    if(sortedList){
      sortedItems = sortedList.split(',');
      $.each(sortedItems,function(index,id){
        var key = '5ive.'+listID+'.'+id;
        if(localStorage.getItem(key)){
          appendValue(key);
          newList.push(id);
        }
        notSorted = $.grep(notSorted, function(value){
          return value != id;
        });

      });
    }
    $.each(notSorted,function(index,id){
      var key = '5ive.'+listID+'.'+id;
      if(localStorage.getItem(key) && id)
        appendValue(key);
      newList.push(id);
    });
    if (newList.length > 0)
      localStorage.setItem('5ive.order.'+listID,newList);
  });
}

function arrayOf(storageList){
  var array = [];
  for(i=0; i<localStorage.length; i++){
    key = localStorage.key(i).split('.');
    if(key[1] == storageList){
      array.push(key[2]);
    }
  }
  return array;
}

//  for (var i = 0, cnt = localStorage.length; i < cnt; i++) {
//    key = localStorage.key(i);
//    if (key.split('.')[0]=="5ive"){
//      appendValue(key);
//    }
//  }

function save(itemID) {
  var value = $('textarea#new_text').val();
  switch(value){
    case ":clear": {
      localStorage.clear();
      buildLists();
      break;
    }
    case ":restore": {

      restore();
      break;
    }
    case ":backup": {

      backup();
      break;
    }
    case ":status": {

      alert(status());
      break;
    }
    default: {
      key = '5ive.todo.'+itemID;
      localStorage.setItem(key,value);
      appendValue(key);
      getOrder($('ul#todo'));
    }
  }
}

function getOrder(list){
  a = list.sortable('toArray');
  key = "5ive.order."+list.attr('id');
  localStorage.setItem(key,a);
}

function backup(){
  if (localStorage.length) sessionStorage.clear();
  for(i=0; i<localStorage.length; i++){
    sessionStorage.setItem(key=localStorage.key(i),localStorage.getItem(key));
  }
  return true;
}

function restore(){
  localStorage.clear();
  for(i=0; i<sessionStorage.length; i++){
    localStorage.setItem(key=sessionStorage.key(i),sessionStorage.getItem(key));
  }
  buildLists();
}

function status(){
  var statusText="";
  statusText+=localStorage.length+" keys in localStorage";
  $.each(['todo','done'], function (index, value){
    statusText+="\n"+arrayOf(value).length+" keys in "+value+" list";
  });
  return statusText;
}
///
/// DOUCUMENT.READY(FUNCTION)
///
$(document).ready(function() {
  if(!sessionStorage.length) backup();

  $('header').click(function(){
    return(localStorage);
    var message = '';
    message += "\n Storage: "+localStorage.length
    for(i=0; i<localStorage.length; i++){
      key = localStorage.key(i);
      message += "\n"+key+": "+localStorage.getItem(key);
    }
    alert(message);	
  });
  
    
  buildLists();

  $(".list").sortable({
    cursor: 'move',
    connectWith: '.list',
    placeholder: 'ui-state-highlight',
    receive: function(event,ui){
      itemID = ui.item.attr('id');
      senderID = ui.sender.attr('id');
      receiverID = ui.item.parent().attr('id');
      itemKey = '5ive.'+senderID+'.'+itemID;
      (receiverID=='todo')?
      $(ui.item).switchClass('ui-priority-secondary','ui-priority-primary',0):
      $(ui.item).switchClass('ui-priority-primary','ui-priority-secondary',0);
      value = localStorage.getItem(itemKey)
      if(!value) return;
      localStorage.removeItem(itemKey);
      localStorage.setItem('5ive.'+receiverID+'.'+itemID,value);
    },
    update: function(){
      getOrder($(this));
    }
  }).disableSelection();

  $('textarea#new_text').focus();
  // prevents typing of more than given chars
  $('textarea#new_text').keypress(function(event){
    var self = $(this);
    if (event.keyCode == '13') {
      //event.preventDefault();
      if (self.val()!=='') save((new Date()).getTime());
      self.val('');
      return false;
    }
  });
  $('textarea[maxlength]').live('keyup',function(){
    var self = $(this);
    var max = parseInt(self.attr('maxlength'));
    if(self.val().length > max){
      self.val(self.val().substr(0, self.attr('maxlength')));
    }
    var remaining = max-self.val().length;
    self.next('.charsRemaining').html(self.val().length+' chars. You have ' + remaining + ' characters remaining');
  });
});