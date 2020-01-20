import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  constructor(...args){
    super(...args);
    if(!window.localStorage.history){
      window.localStorage.setItem('history', '[]')
    }
    var localStorage=window.localStorage.getItem('history');
    if(!this.isJsonString(localStorage)){
      this.history=[];
    }
    else{
      this.history=JSON.parse(localStorage);
    }
  }

  addTrailingZero(num){
    var str=num.toString(10)
    return str.length==1?"0"+str:str
  }

  isJsonString(str) {
    try {
      JSON.parse(str);
    }catch(e){
      return false;
    }
    return true;
  }

  scrollTo(location){
    setTimeout(function(){
      document.getElementById(location).scrollIntoView({
        behavior: 'smooth'
      });
    }, 50);
  }

  @action
  serverError(errorMsg){
    this.responseBody=errorMsg;
    this.responseHeader=errorMsg;
    this.loading=false;
    this.scrollTo('scrollTarget');
  }

  @action
  updateHistory(){
    var d=new Date;

    var timeStamp=
      'on: '+
      this.addTrailingZero(d.getDate())+
      '/'+
      this.addTrailingZero(d.getMonth()+1)+
      '/'+
      d.getFullYear()+
      ' at: '+
      this.addTrailingZero(d.getHours())+
      ':'+
      this.addTrailingZero(d.getMinutes())+
      ':'+
      this.addTrailingZero(d.getSeconds());

    this.history.unshift({headerVal: this.headerVal, queryVal: this.queryVal, timeStamp: timeStamp});
    window.localStorage.setItem('history', JSON.stringify(this.history));
    //hack to update tracked array
    this.history=this.history;
  }

  @action
  clearHistory(){
    this.history=[]
    window.localStorage.setItem('history', '[]');
  }

  @action
  setFromEvent(event){
    this.headerVal=event.headerVal;
    this.queryVal=event.queryVal;
  }

  @action
  async getHeaders(){
    this.loading=true;
    try {
      var response= await fetch('/debug-auth-headers/get-headers');
    } catch (error) {
      this.serverError('"Server Error"');
      return false;
    }
    if(response.ok){
      var headers=await response.json();
      headers = JSON.stringify(headers, null, 2);
      this.headerVal=headers;
      this.loading=false;
    }
    else{
      this.serverError('"Server Error"');
    }
  }

  @action
  async sendRequest(){

    this.loading=true;
    this.updateHistory();

    if(!this.isJsonString(this.headerVal)){
      this.serverError('"Invalid JSON Error"')
      return false;
    }

    var body={
      query: this.queryVal,
      headers: JSON.parse(this.headerVal)
    }
    try {
      var response=await fetch('/debug-auth-headers/send-request',{
        method: 'POST',
        headers:{
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })
    } catch (error) {
      this.serverError('"Server Error"');
      return false;
    }
    if(response.ok){
      response=await response.json();
      this.responseBody=JSON.stringify(response.body, null, 2);
      this.responseHeader=JSON.stringify(response.headers, null, 2);
      this.loading=false;
      this.scrollTo('scrollTarget');
    }
    else{
      this.serverError('"Server Error"');
    }
  }

  @action
  updateHeaderVal(val){
    this.headerVal=val;
  }

  @action
  updateQueryVal(val){
    this.queryVal=val;
  }

  @action
  updateResponseHeader(val){
    this.responseHeader=val;
  }

  @action
  updateResponseBody(val){
    this.responseBody=val;
  }

  codeMirrorJSOptions={lineNumbers: true, mode: "javascript", lineWrapping: true};

  codeMirrorSPARQLOptions={lineNumbers: true, mode: "sparql", lineWrapping: true};

  @tracked
  headerVal=`\
{
  "mu-auth-allowed-groups": "[{\\"variables\\":[],\\"name\\":\\"public\\"}]"
}`;

  @tracked
  queryVal=`\
SELECT*
WHERE{
  ?a ?b ?c.
}LIMIT 100`;

  @tracked
  responseHeader='"Waiting for request"';

  @tracked
  responseBody='"Waiting for request"';

  @tracked
  history;

  @tracked
  loading=false;
}
