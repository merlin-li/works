jQuery.sap.declare("my.uilib.Example");jQuery.sap.require("sap.ui.core.Control");
my.uilib.Example=function(i,p,s){sap.ui.core.Control.apply(this,arguments);};
my.uilib.Example.prototype=jQuery.sap.newObject(sap.ui.core.Control.prototype);sap.ui.core.Element.defineClass("my.uilib.Example",{baseType:"sap.ui.core.Control",publicMethods:["getText","setText","attachClick","detachClick"],library:"my.uilib",properties:{text:{name:"text",type:"string",group:"Misc",defaultValue:null}},aggregations:{},associations:{},events:{click:"click"}});
my.uilib.Example.prototype.getText=function(){return this.getProperty("text");};
my.uilib.Example.prototype.setText=function(t){this.setProperty("text",t);};
my.uilib.Example.prototype.attachClick=function(f){this.attachEvent("click",f);};
my.uilib.Example.prototype.detachClick=function(f){this.detachEvent("click",f);};
my.uilib.Example.prototype.fireClick=function(a){this.fireEvent("click",a);};
my.uilib.Example.prototype.onclick=function(b){this.fireClick({id:this.getId()});};
