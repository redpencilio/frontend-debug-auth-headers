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
  updateHistory(){
    this.history.unshift({headerVal: this.headerVal, queryVal: this.queryVal, timeStamp: JSON.stringify(new Date)});
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
    var response= await fetch('/debug-auth-headers/get-headers');
    if(response.ok){
      var headers=await response.json();
      headers = JSON.stringify(headers, null, 2);
      this.headerVal=headers;
    }
    else{
      this.headerVal='Server Error';
    }
    this.loading=false;
  }
  
  @action
  async sendRequest(){
    this.loading=true;
    this.updateHistory();

    if(!this.isJsonString(this.headerVal)){
      this.responseBody='Invalid JSON Error';
      this.responseHeader='Invalid JSON Error';
      this.scrollTo('scrollTarget');
      this.loading=false;
      return false;
    }

    var body={
      query: this.queryVal,
      headers: JSON.parse(this.headerVal) 
    }

    var response=await fetch('/debug-auth-headers/send-request',{
      method: 'POST',
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    if(response.ok){
      response=await response.json();
      this.responseBody=JSON.stringify(response.body, null, 2);
      this.responseHeader=JSON.stringify(response.headers, null, 2);
    }
    else{
      this.responseBody='Server Error';
      this.responseHeader='Server Error';
    }
    this.loading=false;
    this.scrollTo('scrollTarget');
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

  codeMirrorResponseOptions={lineNumbers: true, mode: "javascript", lineWrapping: true,  theme: "duotone-light", readOnly: 'nocursor'};

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
  responseHeader='Waiting for request';

  @tracked
  responseBody='Waiting for request';

  @tracked
  history;

  @tracked
  loading=false;

}
  